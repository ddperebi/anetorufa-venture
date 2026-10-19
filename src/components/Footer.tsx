import React from 'react';
import { Phone, MessageCircle, Mail, MapPin, ArrowUp, ShieldCheck, Heart, Settings } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { BUSINESS_INFO, PRODUCT_CATEGORIES, BANKING_SERVICES } from '../data/categories';

interface FooterProps {
  onOpenOwnerSetup?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenOwnerSetup }) => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#49065D] text-white pt-12 sm:pt-16 pb-24 sm:pb-12 border-t-4 border-[#07852D] relative overflow-hidden">
      {/* Background Accent Gradients */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-[#07852D]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-[#72E52E]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8 pb-10 sm:pb-12 border-b border-purple-800/80">
          {/* Col 1: Brand Info & Tagline (4 cols) */}
          <div className="sm:col-span-2 lg:col-span-4 space-y-3.5 sm:space-y-4">
            <BrandLogo variant="dark" size="lg" showTagline={false} />
            <p className="text-xs sm:text-sm font-semibold text-[#72E52E]">
              {BUSINESS_INFO.tagline}
            </p>
            <p className="text-xs sm:text-sm text-purple-200/90 leading-relaxed">
              Your neighbourhood destination for wholesome food staples, quality groceries, clean household products,
              and convenient, accessible POS agency banking services.
            </p>

            <div className="pt-2 flex flex-col gap-2">
              <a
                href={BUSINESS_INFO.phoneTel}
                className="inline-flex items-center gap-2 text-sm font-bold text-white hover:text-[#72E52E] transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-[#07852D] flex items-center justify-center">
                  <Phone className="w-3.5 h-3.5 fill-current text-white" />
                </div>
                <span>{BUSINESS_INFO.phone}</span>
              </a>

              <a
                href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=${encodeURIComponent(
                  BUSINESS_INFO.whatsappMessage
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#72E52E] hover:underline"
              >
                <div className="w-7 h-7 rounded-lg bg-[#07852D] flex items-center justify-center">
                  <MessageCircle className="w-3.5 h-3.5 fill-current text-white" />
                </div>
                <span>WhatsApp: 08137590538</span>
              </a>
            </div>
          </div>

          {/* Col 2: Quick Navigation Links (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#72E52E] font-heading">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-purple-200/90">
              <li>
                <a href="#home" className="hover:text-white transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-white transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#products" className="hover:text-white transition-colors">
                  Store Products
                </a>
              </li>
              <li>
                <a href="#book-goods" className="text-[#72E52E] font-bold hover:underline transition-colors">
                  ★ Book Goods Online
                </a>
              </li>
              <li>
                <a href="#banking" className="hover:text-white transition-colors">
                  POS Banking Services
                </a>
              </li>
              <li>
                <a href="#why-us" className="hover:text-white transition-colors">
                  Why Choose Us
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Product Highlights (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#72E52E] font-heading">
              Our Products
            </h4>
            <ul className="space-y-1.5 text-xs text-purple-200/90">
              {PRODUCT_CATEGORIES.slice(0, 6).map((c) => (
                <li key={c.id}>
                  <a href="#products" className="hover:text-white transition-colors flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#07852D]"></span>
                    <span>{c.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Banking Services & CTA (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#72E52E] font-heading">
              POS Services
            </h4>
            <ul className="space-y-1 text-xs text-purple-200/90 mb-4">
              <li>• Cash Deposits & Withdrawals</li>
              <li>• Interbank Money Transfers</li>
              <li>• Airtime Top-Up & Data Subscriptions</li>
              <li>• Utility Bills & Cable TV Payments</li>
              <li>• Account Balance Enquiry</li>
            </ul>

            <div className="pt-2">
              <a
                href="#contact"
                className="block text-center w-full py-2.5 px-4 bg-[#07852D] hover:bg-[#055C1F] text-white font-bold text-xs rounded-xl shadow-xs transition-colors border border-[#72E52E]/30"
              >
                Make an Enquiry Now
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Back to Top, and Owner Guide Link */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-purple-300">
          <div className="text-center sm:text-left space-y-1">
            <p>
              © {currentYear} <strong>Anetorufa Ventures</strong>. All rights reserved.
            </p>
            <p className="text-[11px] text-purple-400">
              Quality Provisions • Healthy Living • Convenient Banking • Tel: 08137590538
            </p>
          </div>

          <div className="flex items-center gap-4">
            {onOpenOwnerSetup && (
              <button
                type="button"
                onClick={onOpenOwnerSetup}
                className="inline-flex items-center gap-1.5 text-[11px] text-purple-300/80 hover:text-[#72E52E] transition-colors"
                title="Business Owner Configuration & Messages Audit"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Owner Setup & Diagnostics</span>
              </button>
            )}

            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors text-xs font-semibold"
              aria-label="Scroll back to top"
            >
              <span>Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
