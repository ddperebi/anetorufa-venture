import React from 'react';

interface BrandLogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'symbol-only';
  showTagline?: boolean;
  taglineClassName?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  variant = 'light',
  showTagline = false,
  taglineClassName = '',
  size = 'md',
}) => {
  const isDark = variant === 'dark';

  const iconSizes = {
    sm: 'w-7 h-7 sm:w-8 sm:h-8',
    md: 'w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10',
    lg: 'w-11 h-11 sm:w-14 sm:h-14',
  };

  const titleSizes = {
    sm: 'text-sm sm:text-lg',
    md: 'text-sm min-[380px]:text-base sm:text-xl',
    lg: 'text-lg sm:text-2xl md:text-3xl',
  };

  const taglineSizes = {
    sm: 'text-[9px]',
    md: 'text-[9px] sm:text-[10px]',
    lg: 'text-xs',
  };

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 ${className}`}>
      {/* Brand Emblem */}
      <div
        className={`${iconSizes[size]} relative flex items-center justify-center rounded-xl overflow-hidden shrink-0 shadow-sm transition-transform hover:scale-105`}
        style={{
          background: 'linear-gradient(135deg, #650A80 0%, #49065D 60%, #07852D 100%)',
        }}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1.5"
          aria-hidden="true"
        >
          {/* Subtle glow / circle */}
          <circle cx="50" cy="50" r="44" stroke="#72E52E" strokeWidth="2.5" strokeOpacity="0.4" />
          
          {/* Provisions Shopping Basket & Grain Stalk */}
          <path
            d="M26 44 L74 44 L67 76 C66 80 62 82 58 82 L42 82 C38 82 34 80 33 76 L26 44 Z"
            fill="#07852D"
            fillOpacity="0.95"
          />
          <path
            d="M32 44 C32 30 40 22 50 22 C60 22 68 30 68 44"
            stroke="#72E52E"
            strokeWidth="5"
            strokeLinecap="round"
          />
          
          {/* Central Stylized 'A' + Financial POS Spark */}
          <path
            d="M40 70 L50 36 L60 70"
            stroke="#FFFFFF"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M43 56 L57 56"
            stroke="#72E52E"
            strokeWidth="4"
            strokeLinecap="round"
          />
          
          {/* Gold / Lime Accent Diamond */}
          <circle cx="50" cy="22" r="4.5" fill="#72E52E" />
        </svg>
      </div>

      {variant !== 'symbol-only' && (
        <div className="flex flex-col leading-tight">
          <div className={`font-black tracking-tight font-heading ${titleSizes[size]}`}>
            <span className={isDark ? 'text-white' : 'text-[#650A80]'}>Anetorufa</span>{' '}
            <span className="text-[#07852D] relative">
              Ventures
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#72E52E] ml-0.5 align-middle"></span>
            </span>
          </div>
          {showTagline && (
            <p
              className={`${taglineSizes[size]} font-medium tracking-wide ${
                isDark ? 'text-purple-200/90' : 'text-gray-600'
              } ${taglineClassName}`}
            >
              Provisions • Fresh Foods • POS Banking
            </p>
          )}
        </div>
      )}
    </div>
  );
};
