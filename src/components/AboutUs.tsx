import React from 'react';
import { Award, BadgePercent, ShoppingCart, Users, CreditCard, Sparkles } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

export const AboutUs: React.FC = () => {
  const pillars = [
    {
      icon: Award,
      title: 'Commitment to Quality',
      description: 'We carefully source wholesome grains, pure cooking oils, authentic local staples, and trustworthy household products so your family enjoys nutritious and reliable daily goods.',
      accent: 'border-purple-200 bg-purple-50/40 text-[#650A80]',
      iconBg: 'bg-[#650A80] text-white',
    },
    {
      icon: BadgePercent,
      title: 'Affordable Prices',
      description: 'Our prices are structured fairly to give families and community residents dependable value on daily food staples, groceries, and essential home supplies.',
      accent: 'border-emerald-200 bg-emerald-50/40 text-[#07852D]',
      iconBg: 'bg-[#07852D] text-white',
    },
    {
      icon: ShoppingCart,
      title: 'Convenience for Everyday Shopping',
      description: 'Find everything you need in one friendly neighbourhood spot: from bags of rice and garri to tinned milk, cooking ingredients, soaps, and toiletries without travelling far.',
      accent: 'border-purple-200 bg-purple-50/40 text-[#650A80]',
      iconBg: 'bg-[#650A80] text-white',
    },
    {
      icon: Users,
      title: 'Reliable Customer Service',
      description: 'Every customer is welcomed with warmth, attentive care, and prompt service. We take pride in building genuine, lasting relationships with all our shoppers.',
      accent: 'border-emerald-200 bg-emerald-50/40 text-[#07852D]',
      iconBg: 'bg-[#07852D] text-white',
    },
    {
      icon: CreditCard,
      title: 'Convenient Financial Transactions',
      description: 'Skip the stress of long bank queues and crowded ATMs. Our fast POS terminal makes deposits, withdrawals, transfers, and utility payments effortlessly convenient right inside the store.',
      accent: 'border-lime-300 bg-lime-50/40 text-emerald-800',
      iconBg: 'bg-[#07852D] text-[#72E52E]',
    },
  ];

  return (
    <section id="about" className="py-12 sm:py-20 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-xs font-bold text-[#650A80] uppercase tracking-wider mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-[#72E52E]" />
            <span>About Anetorufa Ventures</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#650A80] font-heading tracking-tight leading-tight">
            Your Neighbourhood Partner for Food Staples & Convenient Banking
          </h2>
          <div className="w-16 sm:w-20 h-1.5 bg-[#07852D] mx-auto my-3 sm:my-4 rounded-full" />
          <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed">
            At <strong>Anetorufa Ventures</strong>, we are committed to meeting the everyday needs of our community by
            providing quality provisions, daily staple foods, fresh food items, and essential household products alongside
            convenient, accessible POS banking services.
          </p>
        </div>

        {/* Core Principles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className={`p-5 sm:p-7 rounded-2xl border transition-all duration-300 hover:shadow-md ${pillar.accent} ${
                  idx === 4 ? 'md:col-span-2 lg:col-span-1' : ''
                }`}
              >
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-4 sm:mb-5 shadow-xs ${pillar.iconBg}`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 font-heading">
                  {pillar.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Mission Statement Box */}
        <div className="mt-8 sm:mt-12 rounded-2xl bg-gradient-to-r from-[#650A80] via-[#520868] to-[#07852D] p-5 sm:p-8 md:p-10 text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-8 translate-y-8">
            <BrandLogo variant="symbol-only" size="lg" className="w-48 sm:w-64 h-48 sm:h-64" />
          </div>
          <div className="relative z-10 max-w-3xl">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#72E52E]">Our Core Mission</span>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold mt-1 mb-2.5 font-heading leading-snug">
              Quality Provisions, Healthy Living, Convenient Banking.
            </h3>
            <p className="text-xs sm:text-sm md:text-base text-purple-100 leading-relaxed">
              Whether you are shopping for your family’s weekly food supplies, picking up household cleaning items,
              or making an urgent cash withdrawal or bank transfer, Anetorufa Ventures is here to serve you with honesty,
              affordability, and dependability every single day.
            </p>
            <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row gap-3">
              <a
                href="#products"
                className="w-full sm:w-auto text-center px-5 py-2.5 bg-white text-[#650A80] font-bold text-xs sm:text-sm rounded-xl hover:bg-purple-50 active:bg-purple-100 transition-colors shadow-xs"
              >
                View Our Products
              </a>
              <a
                href="#contact"
                className="w-full sm:w-auto text-center px-5 py-2.5 bg-[#07852D] text-white font-bold text-xs sm:text-sm rounded-xl hover:bg-[#055C1F] active:bg-[#055C1F] border border-[#72E52E]/30 transition-colors shadow-xs"
              >
                Get in Touch
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
