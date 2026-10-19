import React, { useState, useEffect } from 'react';
import { Phone, Menu, X, ShoppingBag, Landmark, ArrowRight, MessageCircle } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { BUSINESS_INFO } from '../data/categories';

interface NavbarProps {
  onOpenOwnerModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenOwnerModal }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scrolling when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About Us', href: '#about' },
    { name: 'Products', href: '#products' },
    { name: 'Book Goods', href: '#book-goods', highlight: true },
    { name: 'Banking Services', href: '#banking' },
    { name: 'Why Us', href: '#why-us' },
    { name: 'Contact Us', href: '#contact' },
  ];

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-md py-2 sm:py-2.5 border-b border-gray-100'
            : 'bg-white py-2.5 sm:py-3.5 border-b border-gray-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a
              href="#home"
              onClick={handleLinkClick}
              className="focus:outline-none focus:ring-2 focus:ring-[#650A80] rounded-lg p-0.5 transition-opacity hover:opacity-90 shrink-0"
              aria-label="Anetorufa Ventures Home"
            >
              <BrandLogo size="md" showTagline={true} taglineClassName="hidden sm:block" />
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2" aria-label="Main Navigation">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className={`px-2.5 xl:px-3 py-1.5 text-xs xl:text-sm font-bold rounded-lg transition-all ${
                    link.highlight
                      ? 'bg-[#07852D] hover:bg-[#055C1F] text-white shadow-xs inline-flex items-center gap-1.5 transform hover:scale-[1.02]'
                      : 'text-gray-700 hover:text-[#650A80] hover:bg-purple-50/70'
                  }`}
                >
                  {link.highlight && <ShoppingBag className="w-3.5 h-3.5 text-[#72E52E]" />}
                  <span>{link.name}</span>
                </a>
              ))}
            </nav>

            {/* Call & WhatsApp Quick Buttons */}
            <div className="hidden sm:flex items-center gap-2.5">
              <a
                href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=${encodeURIComponent(
                  BUSINESS_INFO.whatsappMessage
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#07852D] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-lg transition-all shadow-xs"
                title="Chat on WhatsApp"
              >
                <MessageCircle className="w-4 h-4 fill-[#07852D] text-white" />
                <span>WhatsApp</span>
              </a>

              <a
                href={BUSINESS_INFO.phoneTel}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs md:text-sm font-bold text-white bg-[#07852D] hover:bg-[#055C1F] rounded-lg shadow-sm transition-all transform active:scale-95"
                aria-label={`Call Anetorufa Ventures at ${BUSINESS_INFO.phone}`}
              >
                <Phone className="w-4 h-4 fill-current" />
                <span>{BUSINESS_INFO.phone}</span>
              </a>
            </div>

            {/* Mobile Actions: Call Button & Hamburger */}
            <div className="flex items-center gap-1.5 sm:hidden">
              <a
                href={BUSINESS_INFO.phoneTel}
                className="w-10 h-10 min-w-[40px] min-h-[40px] text-white bg-[#07852D] active:bg-[#055C1F] rounded-lg shadow-xs flex items-center justify-center transition-colors"
                aria-label={`Call Anetorufa Ventures: ${BUSINESS_INFO.phone}`}
              >
                <Phone className="w-4 h-4 fill-current" />
              </a>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-10 h-10 min-w-[40px] min-h-[40px] text-gray-700 hover:text-[#650A80] hover:bg-purple-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#650A80] flex items-center justify-center"
                aria-expanded={mobileMenuOpen}
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-x-0 top-[57px] sm:top-[65px] bg-white border-b border-gray-200 shadow-2xl max-h-[calc(100vh-57px)] sm:max-h-[calc(100vh-65px)] overflow-y-auto animate-in slide-in-from-top duration-200 z-50">
            <div className="px-4 py-4 space-y-2">
              <div className="p-3 bg-purple-50/70 rounded-xl mb-2 border border-purple-100">
                <p className="text-xs font-bold text-[#650A80]">
                  Quality Provisions, Healthy Living, Convenient Banking
                </p>
                <p className="text-[11px] text-gray-600 mt-0.5">Need assistance? Call or message us directly:</p>
              </div>

              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={handleLinkClick}
                  className={`flex items-center justify-between px-3.5 py-3 text-base font-semibold rounded-xl transition-colors ${
                    link.highlight
                      ? 'bg-[#07852D] text-white font-bold shadow-xs'
                      : 'text-gray-800 hover:text-[#650A80] hover:bg-purple-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {link.highlight && <ShoppingBag className="w-4 h-4 text-[#72E52E]" />}
                    <span>{link.name}</span>
                  </span>
                  <ArrowRight className={`w-4 h-4 ${link.highlight ? 'text-white' : 'text-gray-400'}`} />
                </a>
              ))}

              <div className="pt-3 pb-2 border-t border-gray-100 flex flex-col gap-2.5">
                <a
                  href={BUSINESS_INFO.phoneTel}
                  onClick={handleLinkClick}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 text-sm font-bold text-white bg-[#07852D] hover:bg-[#055C1F] rounded-xl shadow-md transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Us Now: {BUSINESS_INFO.phone}</span>
                </a>

                <a
                  href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=${encodeURIComponent(
                    BUSINESS_INFO.whatsappMessage
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleLinkClick}
                  className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-[#07852D] bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-colors"
                >
                  <MessageCircle className="w-4 h-4 fill-[#07852D] text-white" />
                  <span>Chat on WhatsApp (08137590538)</span>
                </a>

                {onOpenOwnerModal && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenOwnerModal();
                    }}
                    className="w-full text-center py-2 text-xs font-medium text-gray-500 hover:text-[#650A80] transition-colors"
                  >
                    ⚙️ Owner Settings & Messages
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Backdrop for mobile drawer */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
          aria-hidden="true"
        />
      )}
    </>
  );
};
