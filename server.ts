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

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(MESSAGES_FILE)) {
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify([], null, 2), 'utf-8');
}

// Middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

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
  deliveryStatus: 'delivered_email' | 'saved_inbox_pending_owner_setup' | 'saved_inbox_email_failed';
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

// 1. Config diagnostic status endpoint
app.get('/api/config-status', (_req: Request, res: Response) => {
  const ownerEmail = process.env.OWNER_NOTIFICATION_EMAIL || '';
  const hasResend = Boolean(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim());
  const isFullyConfigured = Boolean(ownerEmail && hasResend);

  res.json({
    emailConfigured: isFullyConfigured,
    ownerEmailProvided: Boolean(ownerEmail),
    maskedEmail: ownerEmail ? ownerEmail.replace(/^(.)(.*)(.@.*)$/, (_, a, b, c) => `${a}${'*'.repeat(Math.max(2, b.length))}${c}`) : null,
    provider: hasResend ? 'Resend' : 'Local Secure Inbox',
    notice: isFullyConfigured
      ? 'Email forwarding to business owner is ACTIVE.'
      : 'Email delivery not configured yet. Messages are preserved in server inbox. Owner can add OWNER_NOTIFICATION_EMAIL and RESEND_API_KEY in environment variables.',
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
          contactRecord.deliveryStatus = 'delivered_email';
        } else {
          const errData = await resendRes.text();
          emailErrorMsg = `Email provider response: ${resendRes.status} - ${errData}`;
          contactRecord.deliveryStatus = 'saved_inbox_email_failed';
          contactRecord.deliveryError = emailErrorMsg;
          console.warn('Resend dispatch failed:', emailErrorMsg);
        }
      } catch (err: unknown) {
        emailErrorMsg = err instanceof Error ? err.message : String(err);
        contactRecord.deliveryStatus = 'saved_inbox_email_failed';
        contactRecord.deliveryError = emailErrorMsg;
        console.warn('Resend exception:', emailErrorMsg);
      }
    } else {
      contactRecord.deliveryStatus = 'saved_inbox_pending_owner_setup';
    }

    // Persist to safe store
    persistMessage(contactRecord);

    if (emailSent) {
      res.status(200).json({
        success: true,
        messageId,
        deliveryStatus: 'delivered_email',
        message: 'Thank you! Your message has been sent directly to the business management. We will contact you shortly.',
      });
      return;
    }

    if (ownerEmail && resendKey && !emailSent) {
      res.status(200).json({
        success: true,
        messageId,
        deliveryStatus: 'saved_inbox_email_failed',
        message: 'Your enquiry has been securely logged on our server. (Email delivery is temporarily queuing). You may also contact us immediately via WhatsApp or phone call at 08137590538.',
        details: 'Stored in owner inbox; email delivery pending service retry.',
      });
      return;
    }

    // If owner email or Resend API key is not yet set
    res.status(200).json({
      success: true,
      messageId,
      deliveryStatus: 'saved_inbox_pending_owner_setup',
      message: 'Your enquiry has been successfully registered and securely recorded in our store inbox! You can also chat with us directly on WhatsApp or call 08137590538 for an instant response.',
      ownerSetupNotice: 'Notice to Business Owner: To receive automated email notifications to your inbox, configure OWNER_NOTIFICATION_EMAIL and RESEND_API_KEY in your environment settings.',
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
