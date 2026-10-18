import React from 'react';
import { CheckCircle2, ShieldCheck, ThumbsUp, ShoppingBag, HeartHandshake } from 'lucide-react';
import { BUSINESS_INFO } from '../data/categories';

export const WhyChooseUs: React.FC = () => {
  const benefits = [
    {
      title: 'Quality Provisions',
      description: 'Carefully sourced pantry staples, trusted brands, clean grains, and pure edible oils that keep your family healthy and satisfied.',
      highlight: 'Wholesome & genuine items',
    },
    {
      title: 'Fresh Daily Foods',
      description: 'Crisp market vegetables, peppers, onions, fresh tubers, and authentic Nigerian food staples delivered with freshness in mind.',
      highlight: 'Farm-fresh arrivals',
    },
    {
      title: 'Essential Household Items',
      description: 'Everything for your home hygiene and daily cleaning — from bar soaps and detergents to disinfectants and toiletries.',
      highlight: 'Complete home essentials',
    },
    {
      title: 'Affordable Prices',
      description: 'Fair, community-friendly pricing designed to help you stretch your household budget without compromising on quality.',
      highlight: 'Great value for money',
    },
    {
      title: 'Reliable Service',
      description: 'Honest, punctual, and attentive customer service with speedy POS transactions and a warm welcoming neighbourhood atmosphere.',
      highlight: 'Trusted by our community',
    },
  ];

  return (
    <section id="why-us" className="py-12 sm:py-20 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-[#07852D] uppercase tracking-wider mb-2.5">
            <ThumbsUp className="w-3.5 h-3.5 text-[#07852D]" />
            <span>Customer Advantages</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-[#650A80] font-heading tracking-tight leading-tight">
            Why Choose Anetorufa Ventures?
          </h2>
          <div className="w-16 sm:w-20 h-1.5 bg-[#07852D] mx-auto my-3 sm:my-4 rounded-full" />
          <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed">
            We are dedicated to making daily life easier and more affordable for every home and business in our neighbourhood.
          </p>
        </div>

        {/* 5 Benefits Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {benefits.map((item, idx) => (
            <div
              key={item.title}
              className={`p-5 sm:p-7 rounded-2xl border border-gray-200 bg-[#F7F7F7] hover:bg-white hover:border-[#07852D]/50 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group ${
                idx === 4 ? 'sm:col-span-2 lg:col-span-1' : ''
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3.5 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white group-hover:bg-[#E8F7ED] border border-gray-200 group-hover:border-[#07852D]/40 flex items-center justify-center shadow-xs transition-colors">
                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-[#07852D]" />
                  </div>
                  <span className="text-xs font-bold text-[#650A80] bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
                    0{idx + 1}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-gray-900 font-heading mb-1.5 group-hover:text-[#650A80] transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs font-bold text-[#07852D] mb-2">{item.highlight}</p>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{item.description}</p>
              </div>

              <div className="mt-5 pt-3.5 border-t border-gray-200/60 flex items-center gap-2 text-xs font-semibold text-gray-600">
                <CheckCircle2 className="w-4 h-4 text-[#72E52E] shrink-0" />
                <span>Verified Brand Standard</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="mt-10 sm:mt-14 rounded-2xl bg-purple-50 border border-purple-100 p-5 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#650A80] text-white flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-[#72E52E]" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-gray-900">Experience the Anetorufa Difference Today</p>
              <p className="text-[11px] sm:text-xs text-gray-600">Visit us for provisions or fast POS transactions whenever you need them.</p>
            </div>
          </div>
          <div className="w-full sm:w-auto flex items-center justify-center">
            <a
              href="#contact"
              className="w-full sm:w-auto text-center px-5 py-3 sm:py-2.5 bg-[#650A80] hover:bg-[#49065D] active:bg-[#49065D] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors"
            >
              Contact Us Today
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
