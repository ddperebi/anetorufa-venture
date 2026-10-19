import React from 'react';
import { ShoppingBag, Landmark, Mail, Phone, CheckCircle2, ShieldCheck, Zap, HeartHandshake, Package } from 'lucide-react';
import { BUSINESS_INFO } from '../data/categories';
import heroStoreImg from '../assets/images/hero_provisions_store_1792279980985.jpg';

export const Hero: React.FC = () => {
  return (
    <section id="home" className="relative pt-20 sm:pt-24 pb-12 sm:pb-16 lg:pt-32 lg:pb-24 overflow-hidden bg-gradient-to-b from-[#FAF5FF] via-white to-[#F7FDF9]">
      {/* Decorative Brand Background Blooms */}
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-[#650A80]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-[#72E52E]/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-8 items-center">
          {/* Left Column: Text & Calls to Action */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-7 text-center lg:text-left">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-white border border-purple-200 shadow-xs text-xs sm:text-sm font-semibold text-[#650A80] max-w-full">
              <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#72E52E] shrink-0 animate-pulse" />
              <span className="truncate">{BUSINESS_INFO.tagline}</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-1 sm:space-y-2">
              <h1 className="text-2xl sm:text-4xl md:text-5xl xl:text-6xl font-extrabold text-[#650A80] tracking-tight font-heading leading-tight">
                Welcome to <br className="hidden sm:inline" />
                <span className="text-[#07852D] underline decoration-[#72E52E] decoration-4 underline-offset-4">
                  Anetorufa Ventures
                </span>
              </h1>
            </div>

            {/* Supporting Text */}
            <p className="text-sm sm:text-lg md:text-xl text-gray-700 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Your trusted destination for quality provisions, fresh daily foods, essential household items, and
              convenient POS banking services. We are committed to quality, affordability, and reliable customer service.
            </p>

            {/* Trust Statement Banner */}
            <div className="p-3.5 sm:p-5 rounded-2xl bg-white border border-purple-100 shadow-xs max-w-xl mx-auto lg:mx-0">
              <div className="text-[10px] sm:text-xs uppercase tracking-wider font-bold text-gray-600 mb-1.5">Our Promise To You</div>
              <p className="text-sm sm:text-base md:text-lg font-bold text-[#650A80] flex items-center justify-center lg:justify-start gap-1.5 sm:gap-2">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#07852D] shrink-0" />
                <span>Quality Products. Affordable Prices. Convenient Banking.</span>
              </p>
            </div>

            {/* Action Buttons with Book Goods Highlight */}
            <div className="space-y-2.5 max-w-lg mx-auto lg:mx-0 pt-1">
              <a
                href="#book-goods"
                className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-3 sm:px-5 sm:py-3.5 text-xs sm:text-base font-extrabold text-white bg-[#07852D] hover:bg-[#055C1F] rounded-xl shadow-md transition-all active:scale-98 border border-[#72E52E]/40"
              >
                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-[#72E52E]" />
                <span>Pre-Order & Book Goods in Advance</span>
              </a>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                {/* Button 1: Explore Our Products */}
                <a
                  href="#products"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-bold text-white bg-[#650A80] hover:bg-[#49065D] active:bg-[#49065D] rounded-xl shadow-xs transition-all active:scale-98"
                >
                  <ShoppingBag className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                  <span>Explore Our Products</span>
                </a>

                {/* Button 2: Our Banking Services */}
                <a
                  href="#banking"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-bold text-[#07852D] bg-[#E8F7ED] hover:bg-[#D5F2DE] active:bg-[#D5F2DE] border border-[#07852D]/30 rounded-xl transition-all active:scale-98"
                >
                  <Landmark className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                  <span>Our Banking Services</span>
                </a>

                {/* Button 3: Contact Us */}
                <a
                  href="#contact"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-bold text-gray-800 bg-white hover:bg-gray-50 active:bg-gray-100 border border-gray-300 rounded-xl shadow-xs transition-all active:scale-98"
                >
                  <Mail className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#650A80]" />
                  <span>Contact Us</span>
                </a>

                {/* Button 4: Call Us Now (Calls 08137590538) */}
                <a
                  href={BUSINESS_INFO.phoneTel}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-bold text-gray-800 bg-white hover:bg-emerald-50 active:bg-emerald-100 border border-emerald-300 rounded-xl shadow-xs transition-all active:scale-98"
                >
                  <Phone className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-[#07852D] text-[#07852D]" />
                  <span>Call {BUSINESS_INFO.phone}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: High Quality Provision Store Image & Interactive Accents */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Decorative Frame */}
              <div className="absolute -inset-2 sm:-inset-3 bg-gradient-to-tr from-[#650A80]/20 via-[#07852D]/20 to-[#72E52E]/30 rounded-3xl blur-lg opacity-70 transform -rotate-1" />
              
              <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <img
                  src={heroStoreImg}
                  alt="Anetorufa Ventures retail provisions, groceries, grains, and cashier counter"
                  className="w-full h-64 sm:h-80 md:h-96 object-cover object-center transform hover:scale-102 transition-transform duration-500"
                  loading="eager"
                />

                {/* Overlaid Badges */}
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-white/95 backdrop-blur-xs px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full shadow-xs flex items-center gap-1.5 border border-purple-100">
                  <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#07852D]" />
                  <span className="text-[10px] sm:text-xs font-bold text-gray-800">Fresh Staples & Daily Essentials</span>
                </div>

                <div className="absolute bottom-3 inset-x-3 sm:bottom-4 sm:inset-x-4 bg-white/95 backdrop-blur-md p-2.5 sm:p-3.5 rounded-xl shadow-md border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[#650A80] flex items-center justify-center text-white shrink-0">
                      <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-[#72E52E]" />
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-600 font-semibold">Active POS Service</p>
                      <p className="text-xs sm:text-sm font-bold text-gray-900">Withdrawals, Transfers & Airtime</p>
                    </div>
                  </div>
                  <a
                    href="#banking"
                    className="text-xs font-bold text-[#07852D] hover:text-[#055C1F] underline decoration-dotted ml-2 shrink-0"
                  >
                    View
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Feature Pillars below hero graphic */}
            <div className="grid grid-cols-3 gap-2 mt-3 sm:mt-4 text-center">
              <div className="p-2 sm:p-2.5 rounded-xl bg-white/90 border border-purple-100/60 shadow-xs">
                <p className="text-[11px] sm:text-xs font-bold text-[#650A80]">Rice & Tubers</p>
                <p className="text-[9px] sm:text-[10px] text-gray-600">Daily staple foods</p>
              </div>
              <div className="p-2 sm:p-2.5 rounded-xl bg-white/90 border border-green-100/60 shadow-xs">
                <p className="text-[11px] sm:text-xs font-bold text-[#07852D]">Agency POS</p>
                <p className="text-[9px] sm:text-[10px] text-gray-600">Fast cash & transfer</p>
              </div>
              <div className="p-2 sm:p-2.5 rounded-xl bg-white/90 border border-lime-100/60 shadow-xs">
                <p className="text-[11px] sm:text-xs font-bold text-gray-800">Household</p>
                <p className="text-[9px] sm:text-[10px] text-gray-600">Soaps & toiletries</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
