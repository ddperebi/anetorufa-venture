import React from 'react';
import {
  CreditCard,
  Landmark,
  Phone,
  ShieldCheck,
  Zap,
  Smile,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Smartphone,
  Wifi,
  Receipt,
  FileCheck2,
  Info,
} from 'lucide-react';
import { BANKING_SERVICES, BUSINESS_INFO } from '../data/categories';
import posTerminalImg from '../assets/images/pos_banking_terminal_1792279994564.jpg';

export const PosBankingSection: React.FC = () => {
  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'deposit':
        return <ArrowDownLeft className="w-5 h-5 text-[#72E52E]" />;
      case 'withdraw':
        return <ArrowUpRight className="w-5 h-5 text-[#72E52E]" />;
      case 'transfer':
        return <RefreshCw className="w-5 h-5 text-[#72E52E]" />;
      case 'airtime':
        return <Smartphone className="w-5 h-5 text-[#72E52E]" />;
      case 'data':
        return <Wifi className="w-5 h-5 text-[#72E52E]" />;
      case 'bill':
        return <Receipt className="w-5 h-5 text-[#72E52E]" />;
      case 'balance':
        return <FileCheck2 className="w-5 h-5 text-[#72E52E]" />;
      default:
        return <CreditCard className="w-5 h-5 text-[#72E52E]" />;
    }
  };

  const benefits = [
    {
      title: 'Safe and Secure',
      description: 'Encrypted agency banking terminals with printed receipts for peace of mind.',
      icon: ShieldCheck,
      color: 'text-[#72E52E]',
    },
    {
      title: 'Fast Service',
      description: 'Quick turnaround time so you can complete your transactions in minutes without queueing.',
      icon: Zap,
      color: 'text-[#72E52E]',
    },
    {
      title: 'Customer Satisfaction',
      description: 'Friendly, patient, and courteous support for every resident and business customer.',
      icon: Smile,
      color: 'text-[#72E52E]',
    },
  ];

  return (
    <section id="banking" className="py-12 sm:py-20 bg-gradient-to-br from-[#49065D] via-[#650A80] to-[#2c0439] text-white relative overflow-hidden">
      {/* Decorative Brand Background Elements */}
      <div className="absolute top-0 right-0 w-80 sm:w-96 h-80 sm:h-96 bg-[#07852D]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 sm:w-96 h-80 sm:h-96 bg-[#72E52E]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wider text-[#72E52E] mb-2.5">
            <Landmark className="w-4 h-4 text-[#72E52E]" />
            <span>Agency Banking & Financial Convenience</span>
          </div>

          <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white font-heading tracking-tight leading-tight">
            Convenient Banking Services with POS
          </h2>

          <div className="w-16 sm:w-20 h-1.5 bg-[#72E52E] mx-auto my-3 sm:my-4 rounded-full" />

          <p className="text-sm sm:text-base md:text-lg text-purple-100 max-w-2xl mx-auto leading-relaxed">
            Enjoy convenient payment and banking transactions with Anetorufa Ventures. Visit us or contact us to
            enquire about available services.
          </p>

          <div className="mt-5 sm:mt-6 flex justify-center">
            <a
              href={BUSINESS_INFO.phoneTel}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 sm:px-6 sm:py-3.5 bg-[#07852D] hover:bg-[#055C1F] active:bg-[#055C1F] text-white font-bold text-xs sm:text-base rounded-xl shadow-lg border border-[#72E52E]/40 transition-all active:scale-95"
            >
              <Phone className="w-4 h-4 sm:w-5 sm:h-5 fill-current text-[#72E52E]" />
              <span>Call for Banking Enquiries ({BUSINESS_INFO.phone})</span>
            </a>
          </div>
        </div>

        {/* Benefits Row (Safe & Secure, Fast Service, Customer Satisfaction) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-6 mb-10 sm:mb-16">
          {benefits.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className="p-4 sm:p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-start gap-3.5 transition-all hover:bg-white/15"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#07852D] flex items-center justify-center shrink-0 shadow-sm border border-[#72E52E]/30">
                  <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${b.color}`} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white font-heading mb-0.5 sm:mb-1">{b.title}</h3>
                  <p className="text-xs sm:text-sm text-purple-100/90 leading-relaxed">{b.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Grid: POS Terminal Image & List of 7 Banking Services */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left: POS Terminal Image with Trust Accents */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border-2 border-white/20 bg-purple-950">
              <img
                src={posTerminalImg}
                alt="Anetorufa Ventures POS banking terminal for cash withdrawals, deposits and transfers"
                className="w-full h-64 sm:h-80 md:h-96 object-cover object-center transform hover:scale-102 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#49065D]/90 via-transparent to-transparent pointer-events-none" />

              <div className="absolute bottom-3 inset-x-3 sm:bottom-4 sm:inset-x-4 bg-white/95 text-gray-900 p-3 sm:p-4 rounded-xl shadow-md border border-purple-100">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase text-[#07852D] tracking-wider">Debit Cards Accepted</span>
                    <p className="text-[11px] sm:text-xs font-bold text-gray-800">Mastercard • Visa • Verve • Bank Apps</p>
                  </div>
                  <div className="px-2 py-0.5 rounded bg-[#07852D] text-white text-[10px] sm:text-[11px] font-bold shrink-0">
                    Fast Receipt
                  </div>
                </div>
              </div>
            </div>

            {/* Fair Disclaimer Note */}
            <div className="mt-3 sm:mt-4 p-3 rounded-xl bg-purple-950/60 border border-purple-800/60 text-[11px] sm:text-xs text-purple-200/90 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-[#72E52E] shrink-0 mt-0.5" />
              <span>
                Note: Financial transactions and interbank processing depend on telecom network and central bank banking
                switch uptime. Visit or call to verify current terminal readiness.
              </span>
            </div>
          </div>

          {/* Right: The 7 Services List */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {BANKING_SERVICES.map((srv, idx) => (
                <div
                  key={srv.id}
                  className={`p-3.5 sm:p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 hover:border-[#72E52E]/50 hover:bg-white/15 transition-all ${
                    idx === 6 ? 'sm:col-span-2' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#07852D] flex items-center justify-center shrink-0 border border-[#72E52E]/30">
                      {getServiceIcon(srv.iconName)}
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-white font-heading">{srv.title}</h4>
                      <p className="text-xs text-purple-100/80 mt-0.5 sm:mt-1 leading-relaxed">{srv.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Action Bar */}
            <div className="mt-5 sm:mt-6 p-4 rounded-2xl bg-[#07852D]/80 border border-[#72E52E]/40 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
              <div className="text-center sm:text-left">
                <p className="text-xs sm:text-sm font-bold text-white">Need an urgent cash withdrawal or transfer?</p>
                <p className="text-[11px] sm:text-xs text-green-100">Call before heading out or stop by our counter.</p>
              </div>
              <a
                href={BUSINESS_INFO.phoneTel}
                className="w-full sm:w-auto text-center px-5 py-2.5 bg-white hover:bg-purple-50 active:bg-purple-100 text-[#07852D] font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors shrink-0"
              >
                Call: {BUSINESS_INFO.phone}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
