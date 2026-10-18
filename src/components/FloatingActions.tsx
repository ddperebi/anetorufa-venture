import React, { useState } from 'react';
import { MessageCircle, Phone, X } from 'lucide-react';
import { BUSINESS_INFO } from '../data/categories';

export const FloatingActions: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(false);

  const whatsappUrl = `https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=${encodeURIComponent(
    BUSINESS_INFO.whatsappMessage
  )}`;

  return (
    <aside aria-label="Quick contact buttons" className="fixed bottom-4 right-3 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-2.5 pointer-events-none">
      {/* Tooltip greeting popup */}
      {showTooltip && (
        <div className="pointer-events-auto bg-white p-3 rounded-2xl shadow-xl border border-emerald-100 max-w-[260px] sm:max-w-xs text-xs text-gray-700 animate-in fade-in slide-in-from-bottom-2 duration-200 flex items-start gap-2.5 mb-1">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#07852D] text-white flex items-center justify-center shrink-0">
            <MessageCircle className="w-3.5 h-3.5 fill-current" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-900 text-xs">Need shopping or POS help?</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Chat with Anetorufa Ventures on WhatsApp.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowTooltip(false)}
            className="text-gray-400 hover:text-gray-600 p-0.5"
            aria-label="Close tooltip"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Button Group */}
      <div className="flex items-center gap-2 sm:gap-2.5 pointer-events-auto">
        {/* Telephone Call Button */}
        <a
          href={BUSINESS_INFO.phoneTel}
          className="flex items-center justify-center w-11 h-11 sm:w-auto sm:h-auto sm:px-3.5 sm:py-3 rounded-full bg-[#650A80] hover:bg-[#49065D] active:bg-[#49065D] text-white shadow-lg transition-all active:scale-95 border-2 border-white/60 focus:outline-none focus:ring-2 focus:ring-[#650A80]"
          title="Call Anetorufa Ventures (08137590538)"
          aria-label="Call Anetorufa Ventures"
        >
          <Phone className="w-5 h-5 fill-current text-[#72E52E]" />
          <span className="hidden sm:inline font-bold text-xs tracking-wide ml-2">Call 08137590538</span>
        </a>

        {/* WhatsApp Floating Button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => setShowTooltip(true)}
          className="group relative flex items-center gap-2 px-3.5 py-2.5 sm:px-5 sm:py-3.5 rounded-full bg-[#07852D] hover:bg-[#055C1F] active:bg-[#055C1F] text-white shadow-xl transition-all active:scale-95 border-2 border-white focus:outline-none focus:ring-2 focus:ring-[#07852D]"
          title="Chat on WhatsApp"
          aria-label="Chat with Anetorufa Ventures on WhatsApp"
        >
          {/* Subtle pulse ring */}
          <span className="absolute -inset-1 rounded-full bg-[#72E52E] opacity-30 group-hover:opacity-60 animate-ping pointer-events-none" />

          <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 fill-white text-[#07852D] relative z-10 shrink-0" />
          <div className="relative z-10 flex flex-col text-left">
            <span className="text-xs sm:text-sm font-extrabold leading-tight">WhatsApp</span>
            <span className="text-[10px] text-emerald-200 hidden sm:inline">Online • 08137590538</span>
          </div>
        </a>
      </div>
    </aside>
  );
};
