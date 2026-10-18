import React, { useState, useEffect } from 'react';
import {
  Phone,
  MessageCircle,
  Mail,
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
  Clock,
  ShieldCheck,
  Building2,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { BUSINESS_INFO } from '../data/categories';

interface FormState {
  fullName: string;
  phoneNumber: string;
  email: string;
  enquiryType: string;
  subject: string;
  message: string;
  consent: boolean;
  honeypot: string; // Anti-spam hidden trap
}

interface FormErrors {
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  enquiryType?: string;
  subject?: string;
  message?: string;
  consent?: string;
  general?: string;
}

interface SubmissionResult {
  success: boolean;
  messageId?: string;
  deliveryStatus?: 'delivered_email' | 'saved_inbox_pending_owner_setup' | 'saved_inbox_email_failed';
  message: string;
  ownerSetupNotice?: string;
}

export const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState<FormState>({
    fullName: '',
    phoneNumber: '',
    email: '',
    enquiryType: 'Product Enquiry',
    subject: '',
    message: '',
    consent: false,
    honeypot: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);

  // Listen to custom category enquiry events
  useEffect(() => {
    const handleCategoryEnquiry = (e: CustomEvent) => {
      if (e.detail) {
        setFormData((prev) => ({
          ...prev,
          enquiryType: e.detail.enquiryType || 'Product Availability and Prices',
          subject: `Enquiry: ${e.detail.categoryTitle || 'Product Inquiry'}`,
          message: `Hello Anetorufa Ventures, I would like to enquire about the current stock availability and pricing for ${e.detail.categoryTitle}.`,
        }));
        // Scroll to form smoothly
        const formEl = document.getElementById('contact-form-card');
        if (formEl) {
          formEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    window.addEventListener('anetorufa:enquire_category' as any, handleCategoryEnquiry as EventListener);
    return () => {
      window.removeEventListener('anetorufa:enquire_category' as any, handleCategoryEnquiry as EventListener);
    };
  }, []);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Please enter a valid full name.';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone Number is required.';
    } else {
      // Basic check for phone format
      const cleaned = formData.phoneNumber.replace(/[^0-9+]/g, '');
      if (cleaned.length < 8) {
        newErrors.phoneNumber = 'Please enter a valid phone number (minimum 8 digits).';
      }
    }

    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Please enter a valid email address or leave this field empty.';
      }
    }

    if (!formData.enquiryType) {
      newErrors.enquiryType = 'Please select an enquiry type.';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required.';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required.';
    } else if (formData.message.trim().length < 5) {
      newErrors.message = 'Please provide a little more detail (minimum 5 characters).';
    }

    if (!formData.consent) {
      newErrors.consent = 'You must give consent so we can respond to your enquiry.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionResult(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmissionResult({
          success: true,
          messageId: data.messageId,
          deliveryStatus: data.deliveryStatus,
          message: data.message,
          ownerSetupNotice: data.ownerSetupNotice,
        });

        // Clear only on success, preserving data on failure
        setFormData({
          fullName: '',
          phoneNumber: '',
          email: '',
          enquiryType: 'Product Enquiry',
          subject: '',
          message: '',
          consent: false,
          honeypot: '',
        });
        setErrors({});
      } else {
        if (data.errors) {
          setErrors(data.errors);
        }
        setSubmissionResult({
          success: false,
          message: data.message || 'Submission failed. Please check your entries and try again.',
        });
      }
    } catch (err) {
      console.error('Contact form submission error:', err);
      setSubmissionResult({
        success: false,
        message: 'Could not connect to the server. Your information has been kept in the form. Please try again or reach us via phone or WhatsApp.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppForward = () => {
    const text = `*New Customer Enquiry (Anetorufa Ventures Website)*\n` +
      `*Name:* ${formData.fullName || 'Customer'}\n` +
      `*Phone:* ${formData.phoneNumber || 'Not provided'}\n` +
      `*Category:* ${formData.enquiryType}\n` +
      `*Subject:* ${formData.subject || 'Enquiry'}\n` +
      `*Message:* ${formData.message || 'Hello, I would like to make an enquiry.'}`;

    window.open(`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <section id="contact" className="py-12 sm:py-20 bg-white border-t border-gray-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-xs font-bold text-[#650A80] uppercase tracking-wider mb-2.5">
            <Mail className="w-3.5 h-3.5 text-[#07852D]" />
            <span>Get in Touch</span>
          </div>

          <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-[#650A80] font-heading tracking-tight leading-tight">
            Contact Anetorufa Ventures
          </h2>

          <div className="w-16 sm:w-20 h-1.5 bg-[#07852D] mx-auto my-3 sm:my-4 rounded-full" />

          <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed">
            Have questions about product availability, current staple food prices, POS transactions, or general enquiries?
            We warmly invite you to reach out directly. We are always ready to assist you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-start">
          {/* Left Column: Business Info & Direct Channels */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-6">
            <div className="bg-[#FAF5FF] border border-purple-200/80 rounded-2xl p-5 sm:p-8 space-y-5 sm:space-y-6 shadow-sm">
              <div>
                <h3 className="text-2xl font-black text-[#650A80] font-heading">
                  {BUSINESS_INFO.name}
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-[#07852D] mt-1">
                  {BUSINESS_INFO.tagline}
                </p>
              </div>

              <div className="space-y-4 pt-2 border-t border-purple-100">
                {/* Telephone Contact */}
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#650A80] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Phone className="w-5 h-5 fill-current text-[#72E52E]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Direct Telephone</p>
                    <a
                      href={BUSINESS_INFO.phoneTel}
                      className="text-lg font-bold text-[#650A80] hover:text-[#07852D] hover:underline"
                    >
                      {BUSINESS_INFO.phone}
                    </a>
                    <p className="text-xs text-gray-600">Click to call directly on phone or mobile</p>
                  </div>
                </div>

                {/* WhatsApp Chat */}
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#07852D] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <MessageCircle className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Official WhatsApp</p>
                    <a
                      href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=${encodeURIComponent(
                        BUSINESS_INFO.whatsappMessage
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-bold text-[#07852D] hover:text-[#055C1F] hover:underline flex items-center gap-1.5"
                    >
                      <span>08137590538</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <p className="text-xs text-gray-600">Fast response for enquiries & quick questions</p>
                  </div>
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <a
                  href={BUSINESS_INFO.phoneTel}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 bg-[#650A80] hover:bg-[#49065D] text-white font-bold text-sm rounded-xl shadow-xs transition-colors"
                >
                  <Phone className="w-4 h-4 fill-current" />
                  <span>Call {BUSINESS_INFO.phone}</span>
                </a>

                <a
                  href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=${encodeURIComponent(
                    BUSINESS_INFO.whatsappMessage
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 bg-[#07852D] hover:bg-[#055C1F] text-white font-bold text-sm rounded-xl shadow-xs transition-colors"
                >
                  <MessageCircle className="w-4 h-4 fill-current text-[#72E52E]" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Business Friendly Notice Card */}
            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wider">
                <Building2 className="w-4 h-4 text-[#07852D]" />
                <span>Visit Us & In-Person Services</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                We are open to serve you for all retail provisions and POS agency banking transactions.
                Need specific location directions or store hours? Please give us a call or send a quick WhatsApp message!
              </p>
            </div>
          </div>

          {/* Right Column: Customer Enquiry Form (Essential Requirement) */}
          <div className="lg:col-span-7">
            <div id="contact-form-card" className="bg-white rounded-2xl border border-gray-200/90 shadow-md p-4 sm:p-6 md:p-8">
              <div className="mb-5 sm:mb-6">
                <h3 className="text-lg sm:text-2xl font-bold text-gray-900 font-heading">
                  Send Us a Direct Message
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
                  Fill in your details below and our team will attend to your request promptly.
                </p>
              </div>

              {/* Submission Feedback Banners */}
              {submissionResult && submissionResult.success && (
                <div className="mb-6 p-5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 animate-in fade-in duration-300">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-[#07852D] shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold text-base text-[#07852D]">Message Received Successfully!</p>
                      <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed">
                        {submissionResult.message}
                      </p>
                      {submissionResult.messageId && (
                        <p className="text-[11px] font-mono text-emerald-700 mt-1">
                          Reference ID: {submissionResult.messageId}
                        </p>
                      )}
                      {submissionResult.ownerSetupNotice && (
                        <div className="mt-2.5 p-2 bg-emerald-100/70 rounded-lg text-xs text-emerald-900">
                          {submissionResult.ownerSetupNotice}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {submissionResult && !submissionResult.success && (
                <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-sm text-rose-800">Submission Error</p>
                      <p className="text-xs sm:text-sm text-rose-700">{submissionResult.message}</p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {/* Anti-Spam Honeypot Field (Hidden from real human users) */}
                <div className="hidden" aria-hidden="true">
                  <label htmlFor="botCheck">Leave this empty</label>
                  <input
                    type="text"
                    id="botCheck"
                    name="botCheck"
                    value={formData.honeypot}
                    onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                {/* Row 1: Full Name & Phone Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="fullName" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => {
                        setFormData({ ...formData, fullName: e.target.value });
                        if (errors.fullName) setErrors({ ...errors, fullName: undefined });
                      }}
                      placeholder="e.g. Ebikake Pere"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                        errors.fullName
                          ? 'border-rose-400 focus:ring-rose-200'
                          : 'border-gray-300 focus:ring-[#650A80] focus:border-transparent'
                      }`}
                      required
                    />
                    {errors.fullName && <p className="mt-1 text-xs text-rose-600">{errors.fullName}</p>}
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label htmlFor="phoneNumber" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) => {
                        setFormData({ ...formData, phoneNumber: e.target.value });
                        if (errors.phoneNumber) setErrors({ ...errors, phoneNumber: undefined });
                      }}
                      placeholder="e.g. 0812 345 6789"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                        errors.phoneNumber
                          ? 'border-rose-400 focus:ring-rose-200'
                          : 'border-gray-300 focus:ring-[#650A80] focus:border-transparent'
                      }`}
                      required
                    />
                    {errors.phoneNumber && <p className="mt-1 text-xs text-rose-600">{errors.phoneNumber}</p>}
                  </div>
                </div>

                {/* Row 2: Email Address (Optional) & Enquiry Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email Address */}
                  <div>
                    <label htmlFor="email" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Email Address <span className="text-gray-400 text-[11px] font-normal">(Optional)</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (errors.email) setErrors({ ...errors, email: undefined });
                      }}
                      placeholder="e.g. yourname@example.com"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                        errors.email
                          ? 'border-rose-400 focus:ring-rose-200'
                          : 'border-gray-300 focus:ring-[#650A80] focus:border-transparent'
                      }`}
                    />
                    {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email}</p>}
                  </div>

                  {/* Enquiry Type Dropdown */}
                  <div>
                    <label htmlFor="enquiryType" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Enquiry Type <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id="enquiryType"
                      value={formData.enquiryType}
                      onChange={(e) => {
                        setFormData({ ...formData, enquiryType: e.target.value });
                        if (errors.enquiryType) setErrors({ ...errors, enquiryType: undefined });
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#650A80] focus:border-transparent transition-all"
                    >
                      <option value="Product Enquiry">Product Enquiry</option>
                      <option value="Product Availability and Prices">Product Availability and Prices</option>
                      <option value="POS and Banking Services">POS and Banking Services</option>
                      <option value="General Enquiry">General Enquiry</option>
                      <option value="Complaint or Feedback">Complaint or Feedback</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.enquiryType && <p className="mt-1 text-xs text-rose-600">{errors.enquiryType}</p>}
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="subject" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Subject <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => {
                      setFormData({ ...formData, subject: e.target.value });
                      if (errors.subject) setErrors({ ...errors, subject: undefined });
                    }}
                    placeholder="e.g. Enquiry about 50kg Rice or Cash Out service"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                      errors.subject
                        ? 'border-rose-400 focus:ring-rose-200'
                        : 'border-gray-300 focus:ring-[#650A80] focus:border-transparent'
                    }`}
                    required
                  />
                  {errors.subject && <p className="mt-1 text-xs text-rose-600">{errors.subject}</p>}
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Message <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    value={formData.message}
                    onChange={(e) => {
                      setFormData({ ...formData, message: e.target.value });
                      if (errors.message) setErrors({ ...errors, message: undefined });
                    }}
                    placeholder="Please describe what product, quantity, or banking service you need assistance with..."
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all resize-y ${
                      errors.message
                        ? 'border-rose-400 focus:ring-rose-200'
                        : 'border-gray-300 focus:ring-[#650A80] focus:border-transparent'
                    }`}
                    required
                  />
                  {errors.message && <p className="mt-1 text-xs text-rose-600">{errors.message}</p>}
                </div>

                {/* Consent Checkbox */}
                <div className="pt-1">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.consent}
                      onChange={(e) => {
                        setFormData({ ...formData, consent: e.target.checked });
                        if (errors.consent) setErrors({ ...errors, consent: undefined });
                      }}
                      className="mt-1 w-4 h-4 rounded text-[#07852D] focus:ring-[#07852D] border-gray-300"
                    />
                    <span className="text-xs text-gray-600 leading-snug">
                      I agree and consent to allow Anetorufa Ventures to use the submitted information to respond to my enquiry.
                    </span>
                  </label>
                  {errors.consent && <p className="mt-1 text-xs text-rose-600">{errors.consent}</p>}
                </div>

                {/* Action Buttons: Send Message + Fast WhatsApp Forward */}
                <div className="pt-3 flex flex-col sm:flex-row gap-3">
                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-6 bg-[#07852D] hover:bg-[#055C1F] text-white font-bold text-sm sm:text-base rounded-xl shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed transform active:scale-98"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Sending Message...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>

                  {/* Optional Quick WhatsApp button using typed text */}
                  {formData.message.trim().length > 0 && (
                    <button
                      type="button"
                      onClick={handleWhatsAppForward}
                      className="inline-flex items-center justify-center gap-2 py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-[#07852D] border border-emerald-300 font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-xs"
                      title="Also forward this exact message via WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4 fill-[#07852D] text-white" />
                      <span>Send via WhatsApp</span>
                    </button>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] text-gray-600">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#07852D]" />
                    <span>Your privacy is respected. No spam.</span>
                  </span>
                  <span>Instant Tel: 08137590538</span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
