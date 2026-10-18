import React, { useState } from 'react';
import { ShoppingBag, Search, MessageSquare, Phone, MessageCircle, AlertCircle, Check, ArrowRight, Package } from 'lucide-react';
import { PRODUCT_CATEGORIES, ProductCategory, BUSINESS_INFO } from '../data/categories';

interface ProductsSectionProps {
  onSelectCategoryForEnquiry?: (category: ProductCategory) => void;
}

export const ProductsSection: React.FC<ProductsSectionProps> = ({ onSelectCategoryForEnquiry }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategoryModal, setActiveCategoryModal] = useState<ProductCategory | null>(null);

  const filteredCategories = PRODUCT_CATEGORIES.filter((cat) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      cat.title.toLowerCase().includes(term) ||
      cat.description.toLowerCase().includes(term) ||
      cat.highlights.some((h) => h.toLowerCase().includes(term))
    );
  });

  const handleMakeEnquiry = (category: ProductCategory) => {
    if (onSelectCategoryForEnquiry) {
      onSelectCategoryForEnquiry(category);
    } else {
      // Fallback: smooth scroll to contact section and pre-fill form
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
        // Set event or url param
        window.dispatchEvent(
          new CustomEvent('anetorufa:enquire_category', {
            detail: {
              categoryTitle: category.title,
              enquiryType: 'Product Availability and Prices',
            },
          })
        );
      }
    }
  };

  return (
    <section id="products" className="py-12 sm:py-20 bg-[#F7F7F7] border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#650A80]/20 text-xs font-bold text-[#650A80] uppercase tracking-wider mb-2.5 shadow-xs">
            <ShoppingBag className="w-3.5 h-3.5 text-[#07852D]" />
            <span>Store Products & Provisions</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-[#650A80] font-heading tracking-tight leading-tight">
            Quality Provisions & Daily Staples
          </h2>
          <div className="w-16 sm:w-20 h-1.5 bg-[#07852D] mx-auto my-3 sm:my-4 rounded-full" />
          <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed">
            Browse our core product categories below. Because market supplies and seasonal fresh arrivals change
            regularly, kindly contact us to confirm current stock availability and updated prices.
          </p>
        </div>

        {/* Pricing & Stock Advisory Notice */}
        <div className="mb-6 sm:mb-8 max-w-3xl mx-auto bg-amber-50 border border-amber-200 rounded-xl p-3.5 sm:p-4 flex items-start gap-2.5 sm:gap-3 text-amber-900 shadow-xs">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm leading-relaxed">
            <strong className="font-bold text-amber-950">Current Pricing & Availability Notice:</strong> In line with our
            transparent community values, we do not list fixed stock numbers or arbitrary prices online. Contact our
            friendly team via phone, WhatsApp, or the enquiry form for today’s exact stock and friendly rates.
          </div>
        </div>

        {/* Search Bar & Mobile Quick Filters */}
        <div className="max-w-lg mx-auto mb-6 sm:mb-8 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search rice, garri, beans, cooking oil, soaps..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-12 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-xl shadow-xs text-sm sm:text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#650A80] focus:border-transparent transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-gray-600 px-1.5 py-0.5 bg-gray-100 rounded"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Filter Chips (Mobile Horizontal Scroll) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-colors ${
                !searchTerm
                  ? 'bg-[#650A80] text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              All (8)
            </button>
            {['Rice', 'Beans', 'Garri', 'Oil', 'Canned', 'Provisions', 'Vegetables', 'Household'].map((keyword) => (
              <button
                key={keyword}
                type="button"
                onClick={() => setSearchTerm(keyword)}
                className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                  searchTerm.toLowerCase() === keyword.toLowerCase()
                    ? 'bg-[#07852D] text-white font-bold'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {keyword}
              </button>
            ))}
          </div>
        </div>

        {/* 8 Product Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-2xl overflow-hidden border border-gray-200/90 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group"
            >
              {/* Category Header: Image with Overlay or Branded Card Banner */}
              {cat.image ? (
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  <img
                    src={cat.image}
                    alt={`Anetorufa Ventures ${cat.title}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 bg-[#650A80] text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-xs">
                    Category #{cat.number}
                  </div>
                  {cat.badge && (
                    <div className="absolute top-3 right-3 bg-[#07852D] text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#72E52E]"></span>
                      {cat.badge}
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative h-48 bg-gradient-to-br from-[#650A80] via-[#520868] to-[#07852D] flex flex-col items-center justify-center p-6 text-center text-white overflow-hidden">
                  <div className="absolute -right-8 -bottom-8 w-28 h-28 rounded-full bg-[#72E52E]/15 blur-lg pointer-events-none" />
                  <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-xs border border-white/25 flex items-center justify-center mb-2 shadow-xs group-hover:scale-110 transition-transform">
                    <Package className="w-7 h-7 text-[#72E52E]" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-200">
                    Anetorufa Ventures
                  </span>
                  <span className="text-xs font-bold text-white/90 mt-0.5">
                    Pantry & Grocery Essentials
                  </span>
                  <div className="absolute top-3 left-3 bg-white/20 backdrop-blur-xs text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-xs">
                    Category #{cat.number}
                  </div>
                  {cat.badge && (
                    <div className="absolute top-3 right-3 bg-[#07852D] text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#72E52E]"></span>
                      {cat.badge}
                    </div>
                  )}
                </div>
              )}

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#650A80] transition-colors font-heading leading-snug mb-1">
                    {cat.title}
                  </h3>
                  <p className="text-xs font-semibold text-[#07852D] mb-2">{cat.subtitle}</p>
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-3 leading-relaxed mb-4">
                    {cat.description}
                  </p>

                  {/* Highlights Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {cat.highlights.slice(0, 3).map((item) => (
                      <span
                        key={item}
                        className="text-[11px] font-medium bg-purple-50 text-[#650A80] border border-purple-100 px-2 py-0.5 rounded-md"
                      >
                        {item}
                      </span>
                    ))}
                    {cat.highlights.length > 3 && (
                      <span className="text-[11px] font-medium text-gray-500 px-1 py-0.5">
                        +{cat.highlights.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Make an Enquiry Button */}
                <div className="pt-2 border-t border-gray-100 space-y-2">
                  <button
                    type="button"
                    onClick={() => handleMakeEnquiry(cat)}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-3 bg-[#650A80] hover:bg-[#49065D] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs transform active:scale-98"
                  >
                    <MessageSquare className="w-4 h-4 text-[#72E52E]" />
                    <span>Make an Enquiry</span>
                  </button>

                  <a
                    href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=${encodeURIComponent(
                      `Hello Anetorufa Ventures, I would like to make an enquiry regarding the availability and price of ${cat.title}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-[#07852D] text-xs font-bold rounded-xl border border-emerald-200 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-[#07852D] text-white" />
                    <span>WhatsApp Enquiry</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* If no search match */}
        {filteredCategories.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-8 max-w-md mx-auto">
            <p className="text-gray-600 font-medium mb-3">No matching category found for "{searchTerm}"</p>
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="text-xs font-bold text-[#650A80] hover:underline"
            >
              Reset search to view all 8 categories
            </button>
          </div>
        )}

        {/* Bottom Quick Call Prompt */}
        <div className="mt-10 sm:mt-14 p-5 sm:p-8 rounded-2xl bg-white border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="text-base sm:text-xl font-bold text-gray-900 font-heading">
              Looking for a specific item not listed here?
            </h4>
            <p className="text-xs sm:text-sm text-gray-600">
              We stock many additional daily provision items, spices, and supplies. Give us a call or send a quick message.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3 w-full md:w-auto">
            <a
              href={BUSINESS_INFO.phoneTel}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold text-white bg-[#07852D] hover:bg-[#055C1F] active:bg-[#055C1F] rounded-xl shadow-xs transition-colors"
            >
              <Phone className="w-4 h-4 fill-current" />
              <span>Call {BUSINESS_INFO.phone}</span>
            </a>
            <a
              href="#contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold text-gray-800 bg-gray-100 hover:bg-gray-200 active:bg-gray-200 rounded-xl transition-colors"
            >
              <span>Send Message</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
