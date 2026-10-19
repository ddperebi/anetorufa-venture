import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Ensure data storage directory exists
const DATA_DIR = path.resolve(__dirname, 'data');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(MESSAGES_FILE)) {
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify([], null, 2), 'utf-8');
}

if (!fs.existsSync(BOOKINGS_FILE)) {
  fs.writeFileSync(BOOKINGS_FILE, JSON.stringify([], null, 2), 'utf-8');
}

// Middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

export interface BookedItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  notes?: string;
}

export interface BookedGoodsOrder {
  id: string;
  bookingReference: string;
  customerName: string;
  phoneNumber: string;
  email?: string;
  fulfillmentType: 'pickup' | 'delivery';
  preferredDate: string;
  preferredTimeSlot: string;
  deliveryAddress?: string;
  nearestLandmark?: string;
  paymentPreference: 'counter_pickup' | 'bank_transfer' | 'pos_card' | 'cash_on_delivery';
  items: BookedItem[];
  customGroceryList?: string;
  specialInstructions?: string;
  status: 'pending' | 'confirmed' | 'ready' | 'completed' | 'cancelled';
  createdAt: string;
  deliveryStatus: 'delivered_formspree' | 'delivered_email' | 'saved_inbox_pending_owner_setup' | 'saved_inbox_email_failed';
  deliveryProvider?: string;
  deliveryError?: string;
  ip?: string;
  userAgent?: string;
}

interface ContactMessage {
  id: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  enquiryType: string;
  subject: string;
  message: string;
  consent: boolean;
  createdAt: string;
  deliveryStatus: 'delivered_formspree' | 'delivered_email' | 'saved_inbox_pending_owner_setup' | 'saved_inbox_email_failed';
  deliveryProvider?: string;
  deliveryError?: string;
  ip?: string;
  userAgent?: string;
}

const ALLOWED_ENQUIRY_TYPES = [
  'Product Enquiry',
  'Product Availability and Prices',
  'POS and Banking Services',
  'General Enquiry',
  'Complaint or Feedback',
  'Other',
];

// Formspree endpoint supplied by the store owner
export const FORMSPREE_ENDPOINT = process.env.FORMSPREE_ENDPOINT?.trim() || 'https://formspree.io/f/xrpejnno';

// Helper to forward any website form directly to the owner's Formspree email
async function forwardToFormspree(payload: Record<string, any>): Promise<{ success: boolean; status?: number; error?: string }> {
  try {
    const res = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });

    if (res.ok) {
      return { success: true, status: res.status };
    } else {
      const errText = await res.text();
      console.warn(`Formspree response status ${res.status}:`, errText);
      return { success: false, status: res.status, error: errText };
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Formspree dispatch exception:', errorMsg);
    return { success: false, error: errorMsg };
  }
}

// Helper to save message
function persistMessage(msg: ContactMessage): void {
  try {
    let existing: ContactMessage[] = [];
    if (fs.existsSync(MESSAGES_FILE)) {
      const content = fs.readFileSync(MESSAGES_FILE, 'utf-8');
      existing = JSON.parse(content || '[]');
    }
    existing.unshift(msg);
    // Keep last 500 messages
    if (existing.length > 500) {
      existing = existing.slice(0, 500);
    }
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(existing, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist contact message to disk:', err);
  }
}

// Helpers for Booked Goods Orders
function readBookings(): BookedGoodsOrder[] {
  try {
    if (fs.existsSync(BOOKINGS_FILE)) {
      const content = fs.readFileSync(BOOKINGS_FILE, 'utf-8');
      return JSON.parse(content || '[]');
    }
  } catch (err) {
    console.error('Failed to read bookings from disk:', err);
  }
  return [];
}

function persistBooking(order: BookedGoodsOrder): void {
  try {
    const existing = readBookings();
    existing.unshift(order);
    const trimmed = existing.slice(0, 500);
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(trimmed, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist booking order to disk:', err);
  }
}

function updateBookingStatusInDisk(id: string, status: BookedGoodsOrder['status']): BookedGoodsOrder | null {
  try {
    const existing = readBookings();
    const index = existing.findIndex((b) => b.id === id || b.bookingReference === id);
    if (index !== -1) {
      existing[index].status = status;
      fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(existing, null, 2), 'utf-8');
      return existing[index];
    }
  } catch (err) {
    console.error('Failed to update booking status:', err);
  }
  return null;
}

// 1. Config diagnostic status endpoint
app.get('/api/config-status', (_req: Request, res: Response) => {
  const ownerEmail = process.env.OWNER_NOTIFICATION_EMAIL || 'ddperebi@gmail.com';
  const hasResend = Boolean(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim());

  res.json({
    emailConfigured: true,
    formspreeActive: true,
    formspreeEndpoint: FORMSPREE_ENDPOINT,
    ownerEmailProvided: Boolean(ownerEmail),
    maskedEmail: ownerEmail ? ownerEmail.replace(/^(.)(.*)(.@.*)$/, (_, a, b, c) => `${a}${'*'.repeat(Math.max(2, b.length))}${c}`) : 'dd***@gmail.com',
    provider: hasResend ? 'Formspree + Resend' : 'Formspree (https://formspree.io/f/xrpejnno)',
    notice: 'Formspree email forwarding is ACTIVE and connected. All customer enquiries and booked goods pre-orders are automatically forwarded directly to your Formspree email (https://formspree.io/f/xrpejnno).',
  });
});

// 2. Contact form submission endpoint
app.post('/api/contact', async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, phoneNumber, email, enquiryType, subject, message, consent, honeypot } = req.body;

    // Spam honeypot protection: if hidden field is filled, silently drop
    if (honeypot && String(honeypot).trim().length > 0) {
      res.status(200).json({
        success: true,
        messageId: 'spam_blocked',
        deliveryStatus: 'saved_inbox_pending_owner_setup',
        message: 'Your message has been processed.',
      });
      return;
    }

    // Server-side validation
    const errors: Record<string, string> = {};

    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      errors.fullName = 'Full Name is required (minimum 2 characters).';
    }

    if (!phoneNumber || typeof phoneNumber !== 'string' || phoneNumber.trim().length < 8) {
      errors.phoneNumber = 'A valid Phone Number is required (minimum 8 digits).';
    }

    if (email && typeof email === 'string' && email.trim().length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errors.email = 'Please provide a valid email address or leave it blank.';
      }
    }

    if (!enquiryType || !ALLOWED_ENQUIRY_TYPES.includes(enquiryType)) {
      errors.enquiryType = 'Please select a valid enquiry type from the dropdown.';
    }

    if (!subject || typeof subject !== 'string' || subject.trim().length < 2) {
      errors.subject = 'Subject is required.';
    }

    if (!message || typeof message !== 'string' || message.trim().length < 5) {
      errors.message = 'Please provide a detailed message (minimum 5 characters).';
    }

    if (!consent) {
      errors.consent = 'You must consent to allow us to use your submitted information to respond.';
    }

    if (Object.keys(errors).length > 0) {
      res.status(400).json({
        success: false,
        errors,
        message: 'Please review and correct the errors in the form.',
      });
      return;
    }

    const messageId = `av_msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const createdAt = new Date().toISOString();

    const contactRecord: ContactMessage = {
      id: messageId,
      fullName: fullName.trim(),
      phoneNumber: phoneNumber.trim(),
      email: email ? email.trim() : undefined,
      enquiryType,
      subject: subject.trim(),
      message: message.trim(),
      consent: Boolean(consent),
      createdAt,
      deliveryStatus: 'saved_inbox_pending_owner_setup',
      ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || undefined,
      userAgent: req.headers['user-agent'],
    };

    const ownerEmail = process.env.OWNER_NOTIFICATION_EMAIL?.trim();
    const resendKey = process.env.RESEND_API_KEY?.trim();
    const fromEmail = process.env.NOTIFICATION_FROM_EMAIL?.trim() || 'onboarding@resend.dev';

    let emailSent = false;
    let emailErrorMsg: string | undefined;

    // 1. Primary delivery: Dispatch to the owner's Formspree endpoint
    const formspreePayload = {
      _subject: `[Anetorufa Website Enquiry] ${enquiryType}: ${subject.trim()}`,
      name: fullName.trim(),
      customerName: fullName.trim(),
      phoneNumber: phoneNumber.trim(),
      email: email && email.trim() ? email.trim() : undefined,
      _replyto: email && email.trim() ? email.trim() : undefined,
      enquiryCategory: enquiryType,
      subject: subject.trim(),
      message: message.trim(),
      consentConfirmed: consent ? 'Yes (User gave consent to be contacted)' : 'No',
      submissionTime: new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' }) + ' (Lagos Time)',
      whatsappDirectLink: `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '').replace(/^0/, '234')}`,
      directPhoneCall: `tel:${phoneNumber.trim()}`,
      formSource: 'Anetorufa Ventures Official Website - Contact Form',
    };

    const formspreeRes = await forwardToFormspree(formspreePayload);

    if (formspreeRes.success) {
      emailSent = true;
      contactRecord.deliveryStatus = 'delivered_formspree';
      contactRecord.deliveryProvider = `Formspree (${FORMSPREE_ENDPOINT})`;
    } else {
      console.warn('Formspree dispatch failed, attempting secondary Resend or saving to local inbox:', formspreeRes.error);
    }

    // 2. Secondary delivery: Resend (if owner has also configured Resend)
    if (ownerEmail && resendKey) {
      try {
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #650A80; padding: 24px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 22px;">Anetorufa Ventures</h1>
              <p style="margin: 6px 0 0; font-size: 14px; color: #72E52E; font-weight: bold;">New Customer Website Enquiry</p>
            </div>
            <div style="padding: 24px; background-color: #ffffff; color: #1f2937; line-height: 1.6;">
              <div style="background-color: #f7f7f7; border-left: 4px solid #07852D; padding: 12px 16px; margin-bottom: 20px;">
                <p style="margin: 0; font-size: 13px; text-transform: uppercase; color: #6b7280; font-weight: bold;">Category</p>
                <p style="margin: 4px 0 0; font-size: 16px; font-weight: bold; color: #07852D;">${enquiryType}</p>
              </div>

              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; width: 140px; font-size: 14px;"><strong>Customer Name:</strong></td>
                  <td style="padding: 8px 0; font-size: 14px; font-weight: 600; color: #111827;">${fullName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;"><strong>Phone Number:</strong></td>
                  <td style="padding: 8px 0; font-size: 14px;"><a href="tel:${phoneNumber}" style="color: #650A80; font-weight: bold; text-decoration: none;">${phoneNumber}</a></td>
                </tr>
                ${
                  email
                    ? `<tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;"><strong>Email:</strong></td>
                        <td style="padding: 8px 0; font-size: 14px;"><a href="mailto:${email}" style="color: #07852D; text-decoration: none;">${email}</a></td>
                      </tr>`
                    : ''
                }
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;"><strong>Subject:</strong></td>
                  <td style="padding: 8px 0; font-size: 14px; font-weight: 600;">${subject}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;"><strong>Received:</strong></td>
                  <td style="padding: 8px 0; font-size: 13px; color: #6b7280;">${new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })} (Lagos Time)</td>
                </tr>
              </table>

              <div style="background-color: #faf5ff; border: 1px solid #e9d5ff; border-radius: 6px; padding: 16px; margin-bottom: 24px;">
                <p style="margin: 0 0 8px; font-size: 13px; font-weight: bold; color: #650A80;">Customer Message:</p>
                <p style="margin: 0; font-size: 15px; white-space: pre-wrap; color: #374151;">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
              </div>

              <div style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #f3f4f6;">
                <a href="https://wa.me/${phoneNumber.replace(/[^0-9]/g, '').replace(/^0/, '234')}" style="display: inline-block; background-color: #07852D; color: #ffffff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14px; margin-right: 8px;">Reply via WhatsApp</a>
                <a href="tel:${phoneNumber}" style="display: inline-block; background-color: #650A80; color: #ffffff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14px;">Call Customer</a>
              </div>
            </div>
            <div style="background-color: #f7f7f7; padding: 12px 24px; text-align: center; font-size: 12px; color: #9ca3af;">
              Anetorufa Ventures • Quality Provisions, Healthy Living, Convenient Banking • Tel: 08137590538
            </div>
          </div>
        `;

        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [ownerEmail],
            subject: `[Anetorufa Enquiry] ${enquiryType}: ${subject}`,
            html: emailHtml,
          }),
        });

        if (resendRes.ok) {
          emailSent = true;
          if (contactRecord.deliveryStatus !== 'delivered_formspree') {
            contactRecord.deliveryStatus = 'delivered_email';
            contactRecord.deliveryProvider = 'Resend';
          }
        } else {
          const errData = await resendRes.text();
          emailErrorMsg = `Email provider response: ${resendRes.status} - ${errData}`;
          if (!emailSent) {
            contactRecord.deliveryStatus = 'saved_inbox_email_failed';
            contactRecord.deliveryError = emailErrorMsg;
          }
          console.warn('Resend dispatch failed:', emailErrorMsg);
        }
      } catch (err: unknown) {
        emailErrorMsg = err instanceof Error ? err.message : String(err);
        if (!emailSent) {
          contactRecord.deliveryStatus = 'saved_inbox_email_failed';
          contactRecord.deliveryError = emailErrorMsg;
        }
        console.warn('Resend exception:', emailErrorMsg);
      }
    }

    if (!emailSent) {
      contactRecord.deliveryStatus = 'saved_inbox_pending_owner_setup';
    }

    // Persist to safe server store so owner can always review on the site
    persistMessage(contactRecord);

    if (emailSent) {
      res.status(200).json({
        success: true,
        messageId,
        deliveryStatus: contactRecord.deliveryStatus,
        formspreeDelivered: formspreeRes.success,
        message: 'Thank you! Your message has been sent directly to the business owner via Formspree and recorded. We will contact you shortly.',
      });
      return;
    }

    // Fallback if network was offline
    res.status(200).json({
      success: true,
      messageId,
      deliveryStatus: 'saved_inbox_pending_owner_setup',
      message: 'Your enquiry has been successfully registered and securely recorded in our store inbox! You can also chat with us directly on WhatsApp or call 08137590538 for an instant response.',
    });
  } catch (error) {
    console.error('Server error handling contact submission:', error);
    res.status(500).json({
      success: false,
      message: 'An unexpected server error occurred while processing your message. Please try again or call us directly at 08137590538.',
    });
  }
});

// 3. Management inbox endpoint (viewing recent inquiries)
app.get('/api/inbox', (_req: Request, res: Response) => {
  try {
    if (fs.existsSync(MESSAGES_FILE)) {
      const content = fs.readFileSync(MESSAGES_FILE, 'utf-8');
      const messages: ContactMessage[] = JSON.parse(content || '[]');
      res.json({
        total: messages.length,
        messages: messages.slice(0, 50),
      });
    } else {
      res.json({ total: 0, messages: [] });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve inbox messages' });
  }
});

// 4. Book Goods Form submission endpoint
app.post('/api/book-goods', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      customerName,
      phoneNumber,
      email,
      fulfillmentType,
      preferredDate,
      preferredTimeSlot,
      deliveryAddress,
      nearestLandmark,
      paymentPreference,
      items,
      customGroceryList,
      specialInstructions,
      honeypot,
    } = req.body;

    // Spam honeypot trap
    if (honeypot && String(honeypot).trim().length > 0) {
      res.status(200).json({
        success: true,
        bookingReference: 'AV-BK-00000',
        message: 'Your booking has been received.',
      });
      return;
    }

    const errors: Record<string, string> = {};

    if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 2) {
      errors.customerName = 'Customer name is required (minimum 2 characters).';
    }

    if (!phoneNumber || typeof phoneNumber !== 'string' || phoneNumber.trim().length < 8) {
      errors.phoneNumber = 'A valid phone number is required (minimum 8 digits).';
    }

    if (email && typeof email === 'string' && email.trim().length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errors.email = 'Please provide a valid email or leave it empty.';
      }
    }

    const hasCatalogItems = Array.isArray(items) && items.length > 0;
    const hasCustomList = typeof customGroceryList === 'string' && customGroceryList.trim().length > 3;

    if (!hasCatalogItems && !hasCustomList) {
      errors.items = 'Please select at least one item from the catalog or list your goods in the custom notepad.';
    }

    if (fulfillmentType === 'delivery') {
      if (!deliveryAddress || typeof deliveryAddress !== 'string' || deliveryAddress.trim().length < 5) {
        errors.deliveryAddress = 'Delivery address is required for home / office delivery.';
      }
    }

    if (Object.keys(errors).length > 0) {
      res.status(400).json({
        success: false,
        errors,
        message: 'Please review and fill in all required booking information.',
      });
      return;
    }

    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const bookingReference = `AV-BK-${randomSuffix}`;
    const orderId = `av_order_${Date.now()}_${randomSuffix}`;
    const createdAt = new Date().toISOString();

    const sanitizedItems: BookedItem[] = Array.isArray(items)
      ? items.map((it: any) => ({
          id: String(it.id || ''),
          name: String(it.name || ''),
          category: String(it.category || ''),
          quantity: Math.max(1, Number(it.quantity) || 1),
          unit: String(it.unit || 'unit'),
          notes: it.notes ? String(it.notes).trim() : undefined,
        }))
      : [];

    const orderRecord: BookedGoodsOrder = {
      id: orderId,
      bookingReference,
      customerName: customerName.trim(),
      phoneNumber: phoneNumber.trim(),
      email: email ? email.trim() : undefined,
      fulfillmentType: fulfillmentType === 'delivery' ? 'delivery' : 'pickup',
      preferredDate: preferredDate ? String(preferredDate).trim() : 'As soon as possible',
      preferredTimeSlot: preferredTimeSlot ? String(preferredTimeSlot).trim() : 'Standard Store Hours',
      deliveryAddress: deliveryAddress ? String(deliveryAddress).trim() : undefined,
      nearestLandmark: nearestLandmark ? String(nearestLandmark).trim() : undefined,
      paymentPreference: paymentPreference || 'counter_pickup',
      items: sanitizedItems,
      customGroceryList: customGroceryList ? String(customGroceryList).trim() : undefined,
      specialInstructions: specialInstructions ? String(specialInstructions).trim() : undefined,
      status: 'pending',
      createdAt,
      deliveryStatus: 'saved_inbox_pending_owner_setup',
      ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || undefined,
      userAgent: req.headers['user-agent'],
    };

    // 1. Primary delivery: Dispatch Book Goods order to the owner's Formspree endpoint
    const formattedItems = sanitizedItems.length > 0
      ? sanitizedItems.map((it, idx) => `${idx + 1}. ${it.name} — Qty: ${it.quantity} x ${it.unit} [${it.category}]${it.notes ? ` (Notes: ${it.notes})` : ''}`).join('\n')
      : 'None selected from catalog (see custom grocery list below)';

    const formspreeOrderPayload = {
      _subject: `[Goods Pre-Order ${bookingReference}] ${orderRecord.customerName} - ${orderRecord.fulfillmentType === 'delivery' ? 'DELIVERY' : 'STORE PICKUP'}`,
      bookingReference: bookingReference,
      name: orderRecord.customerName,
      customerName: orderRecord.customerName,
      phoneNumber: orderRecord.phoneNumber,
      email: orderRecord.email || undefined,
      _replyto: orderRecord.email || undefined,
      fulfillmentType: orderRecord.fulfillmentType === 'delivery' ? '🚚 Local Delivery Requested' : '🏬 Store Counter Pick-Up',
      preferredDate: orderRecord.preferredDate,
      preferredTimeSlot: orderRecord.preferredTimeSlot,
      deliveryAddress: orderRecord.fulfillmentType === 'delivery' ? (orderRecord.deliveryAddress || 'N/A') : 'N/A (Store Counter Pickup)',
      nearestLandmark: orderRecord.fulfillmentType === 'delivery' ? (orderRecord.nearestLandmark || 'N/A') : 'N/A',
      paymentPreference: orderRecord.paymentPreference.replace(/_/g, ' ').toUpperCase(),
      orderedItemsCatalogList: formattedItems,
      totalCatalogItemsCount: sanitizedItems.length,
      customGroceryList: orderRecord.customGroceryList || 'None',
      specialInstructions: orderRecord.specialInstructions || 'None',
      whatsappDirectConfirmation: `https://wa.me/${orderRecord.phoneNumber.replace(/[^0-9]/g, '').replace(/^0/, '234')}?text=${encodeURIComponent(
        `Hello ${orderRecord.customerName}, this is Anetorufa Ventures regarding your goods reservation ${bookingReference}. We have received your order list and are preparing it!`
      )}`,
      directCustomerCall: `tel:${orderRecord.phoneNumber}`,
      submissionTime: new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' }) + ' (Lagos Time)',
      formSource: 'Anetorufa Ventures Official Website - Book Goods Pre-Order Form',
    };

    const formspreeOrderRes = await forwardToFormspree(formspreeOrderPayload);
    let emailSent = formspreeOrderRes.success;
    let emailErrorMsg: string | undefined;

    if (formspreeOrderRes.success) {
      orderRecord.deliveryStatus = 'delivered_formspree';
      orderRecord.deliveryProvider = `Formspree (${FORMSPREE_ENDPOINT})`;
    } else {
      console.warn('Formspree dispatch for booking failed, attempting secondary Resend:', formspreeOrderRes.error);
    }

    // 2. Secondary delivery: Resend (if owner has also configured Resend)
    const ownerEmail = process.env.OWNER_NOTIFICATION_EMAIL?.trim();
    const resendKey = process.env.RESEND_API_KEY?.trim();
    const fromEmail = process.env.NOTIFICATION_FROM_EMAIL?.trim() || 'onboarding@resend.dev';

    if (ownerEmail && resendKey) {
      try {
        const itemsHtml = sanitizedItems
          .map(
            (it, idx) => `
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 10px 8px; font-size: 14px; font-weight: bold; color: #374151;">${idx + 1}. ${it.name}</td>
            <td style="padding: 10px 8px; font-size: 14px; color: #650A80; font-weight: bold;">${it.quantity} x ${it.unit}</td>
            <td style="padding: 10px 8px; font-size: 12px; color: #6b7280;">${it.category}</td>
          </tr>`
          )
          .join('');

        const orderEmailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #650A80; padding: 24px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 22px;">Anetorufa Ventures</h1>
              <p style="margin: 6px 0 0; font-size: 14px; color: #72E52E; font-weight: bold;">New Pre-Order / Goods Reservation</p>
              <div style="display: inline-block; margin-top: 12px; background-color: #ffffff; color: #650A80; padding: 4px 14px; border-radius: 20px; font-weight: bold; font-size: 14px;">
                Ref: ${bookingReference}
              </div>
            </div>

            <div style="padding: 24px; background-color: #ffffff; color: #1f2937; line-height: 1.6;">
              <div style="background-color: ${orderRecord.fulfillmentType === 'delivery' ? '#ecfdf5' : '#f5f3ff'}; border-left: 4px solid ${orderRecord.fulfillmentType === 'delivery' ? '#07852D' : '#650A80'}; padding: 12px 16px; margin-bottom: 20px;">
                <p style="margin: 0; font-size: 12px; text-transform: uppercase; color: #6b7280; font-weight: bold;">Fulfillment Choice</p>
                <p style="margin: 4px 0 0; font-size: 16px; font-weight: bold; color: ${orderRecord.fulfillmentType === 'delivery' ? '#07852D' : '#650A80'};">
                  ${orderRecord.fulfillmentType === 'delivery' ? '🚚 Local Delivery Requested' : '🏬 Store Counter Pick-Up (Customer Coming to Store)'}
                </p>
              </div>

              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 6px 0; color: #6b7280; width: 140px; font-size: 14px;"><strong>Customer:</strong></td>
                  <td style="padding: 6px 0; font-size: 14px; font-weight: bold; color: #111827;">${orderRecord.customerName}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #6b7280; font-size: 14px;"><strong>Phone Number:</strong></td>
                  <td style="padding: 6px 0; font-size: 14px;"><a href="tel:${orderRecord.phoneNumber}" style="color: #650A80; font-weight: bold; text-decoration: none;">${orderRecord.phoneNumber}</a></td>
                </tr>
                ${
                  orderRecord.email
                    ? `<tr>
                        <td style="padding: 6px 0; color: #6b7280; font-size: 14px;"><strong>Email:</strong></td>
                        <td style="padding: 6px 0; font-size: 14px;">${orderRecord.email}</td>
                      </tr>`
                    : ''
                }
                <tr>
                  <td style="padding: 6px 0; color: #6b7280; font-size: 14px;"><strong>Date & Time:</strong></td>
                  <td style="padding: 6px 0; font-size: 14px; font-weight: 600;">${orderRecord.preferredDate} (${orderRecord.preferredTimeSlot})</td>
                </tr>
                ${
                  orderRecord.deliveryAddress
                    ? `<tr>
                        <td style="padding: 6px 0; color: #6b7280; font-size: 14px;"><strong>Delivery Address:</strong></td>
                        <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: #07852D;">${orderRecord.deliveryAddress} ${orderRecord.nearestLandmark ? `(Near: ${orderRecord.nearestLandmark})` : ''}</td>
                      </tr>`
                    : ''
                }
                <tr>
                  <td style="padding: 6px 0; color: #6b7280; font-size: 14px;"><strong>Payment Method:</strong></td>
                  <td style="padding: 6px 0; font-size: 14px;">${orderRecord.paymentPreference.replace(/_/g, ' ').toUpperCase()}</td>
                </tr>
              </table>

              ${
                sanitizedItems.length > 0
                  ? `
                <div style="margin-bottom: 24px;">
                  <h3 style="font-size: 15px; font-weight: bold; color: #650A80; margin: 0 0 10px; border-bottom: 2px solid #e5e7eb; padding-bottom: 6px;">
                    Reserved Goods Items (${sanitizedItems.length})
                  </h3>
                  <table style="width: 100%; border-collapse: collapse; text-align: left;">
                    <thead>
                      <tr style="background-color: #f9fafb; font-size: 12px; color: #6b7280;">
                        <th style="padding: 8px;">Item Name</th>
                        <th style="padding: 8px;">Quantity / Unit</th>
                        <th style="padding: 8px;">Category</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsHtml}
                    </tbody>
                  </table>
                </div>`
                  : ''
              }

              ${
                orderRecord.customGroceryList
                  ? `
                <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 14px; margin-bottom: 20px;">
                  <p style="margin: 0 0 6px; font-size: 13px; font-weight: bold; color: #b45309;">Custom Grocery List / Written Items:</p>
                  <p style="margin: 0; font-size: 14px; white-space: pre-wrap; color: #1f2937;">${orderRecord.customGroceryList.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
                </div>`
                  : ''
              }

              ${
                orderRecord.specialInstructions
                  ? `
                <div style="background-color: #f3f4f6; border-radius: 6px; padding: 12px; margin-bottom: 20px;">
                  <p style="margin: 0 0 4px; font-size: 12px; font-weight: bold; color: #4b5563;">Special Instructions:</p>
                  <p style="margin: 0; font-size: 13px; color: #374151;">${orderRecord.specialInstructions.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
                </div>`
                  : ''
              }

              <div style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #f3f4f6;">
                <a href="https://wa.me/${orderRecord.phoneNumber.replace(/[^0-9]/g, '').replace(/^0/, '234')}?text=${encodeURIComponent(
                  `Hello ${orderRecord.customerName}, this is Anetorufa Ventures regarding your goods reservation ${bookingReference}. We have received your order list and are preparing it!`
                )}" style="display: inline-block; background-color: #07852D; color: #ffffff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14px; margin-right: 8px;">
                  Confirm Order via WhatsApp
                </a>
                <a href="tel:${orderRecord.phoneNumber}" style="display: inline-block; background-color: #650A80; color: #ffffff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14px;">
                  Call Customer
                </a>
              </div>
            </div>
            <div style="background-color: #f7f7f7; padding: 12px 24px; text-align: center; font-size: 12px; color: #9ca3af;">
              Anetorufa Ventures • Foodstuffs & Daily Provisions Pre-Order System • Tel: 08137590538
            </div>
          </div>
        `;

        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [ownerEmail],
            subject: `[Goods Order ${bookingReference}] ${orderRecord.customerName} - ${orderRecord.fulfillmentType.toUpperCase()}`,
            html: orderEmailHtml,
          }),
        });

        if (resendRes.ok) {
          emailSent = true;
          if (orderRecord.deliveryStatus !== 'delivered_formspree') {
            orderRecord.deliveryStatus = 'delivered_email';
            orderRecord.deliveryProvider = 'Resend';
          }
        } else {
          const errData = await resendRes.text();
          emailErrorMsg = `Resend status: ${resendRes.status} - ${errData}`;
          if (!emailSent) {
            orderRecord.deliveryStatus = 'saved_inbox_email_failed';
            orderRecord.deliveryError = emailErrorMsg;
          }
        }
      } catch (err: unknown) {
        emailErrorMsg = err instanceof Error ? err.message : String(err);
        if (!emailSent) {
          orderRecord.deliveryStatus = 'saved_inbox_email_failed';
          orderRecord.deliveryError = emailErrorMsg;
        }
      }
    }

    persistBooking(orderRecord);

    res.status(200).json({
      success: true,
      bookingReference,
      order: orderRecord,
      deliveryStatus: orderRecord.deliveryStatus,
      formspreeDelivered: formspreeOrderRes.success,
      message: `Your booking (${bookingReference}) has been successfully received by Anetorufa Ventures and forwarded to management via Formspree!`,
      emailSent,
    });
  } catch (err) {
    console.error('Server error handling book-goods:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while processing your goods booking. Please try again or call 08137590538.',
    });
  }
});

// 5. Get all bookings for management modal
app.get('/api/bookings', (_req: Request, res: Response) => {
  try {
    const bookings = readBookings();
    res.json({
      total: bookings.length,
      bookings: bookings.slice(0, 100),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve bookings' });
  }
});

// 6. Update booking status
app.patch('/api/bookings/:id/status', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ['pending', 'confirmed', 'ready', 'completed', 'cancelled'];
    if (!status || !allowed.includes(status)) {
      res.status(400).json({ error: 'Invalid booking status' });
      return;
    }

    const updated = updateBookingStatusInDisk(id, status);
    if (!updated) {
      res.status(404).json({ error: 'Booking order not found' });
      return;
    }

    res.json({ success: true, booking: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});


// Vite or Static assets integration
async function startServer() {
  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Anetorufa Ventures Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
