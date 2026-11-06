import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showSubtitle?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showSubtitle = true, className = '' }) => {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    hero: 'w-24 h-24 md:w-32 md:h-32',
  };

  const textSizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
    hero: 'text-4xl md:text-6xl',
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Dynamic Emblem */}
      <div className={`relative ${iconSizes[size]} shrink-0 transition-transform duration-300 hover:scale-105`}>
        <svg viewBox="0 0 500 500" className="w-full h-full drop-shadow-[0_0_20px_rgba(251,191,36,0.35)]">
          <defs>
            <radialGradient id="logoGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#041f16" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="40%" stopColor="#f59e0b" />
              <stop offset="70%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
            <linearGradient id="cyan" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#67e8f9" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id="ruby" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
            <linearGradient id="emerald" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6ee7b7" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>

          {/* Ambient Glow */}
          <circle cx="250" cy="250" r="230" fill="url(#logoGlow)" />

          {/* Orbital Orbit Loop */}
          <circle cx="250" cy="250" r="200" fill="none" stroke="url(#gold)" strokeWidth="8" strokeDasharray="18 10" opacity="0.9" />
          <circle cx="250" cy="250" r="176" fill="none" stroke="#10b981" strokeWidth="3" opacity="0.4" />

          {/* Dynamic RoundTrip Arrows */}
          <path d="M 120 180 A 180 180 0 0 1 380 180" fill="none" stroke="url(#gold)" strokeWidth="6" strokeLinecap="round" />
          <polygon points="385,172 398,190 376,192" fill="#fbbf24" />
          <path d="M 380 320 A 180 180 0 0 1 120 320" fill="none" stroke="url(#gold)" strokeWidth="6" strokeLinecap="round" />
          <polygon points="115,328 102,310 124,308" fill="#fbbf24" />

          {/* Top: Spade ♠ */}
          <g transform="translate(250, 60)">
            <circle cx="0" cy="0" r="32" fill="#0b1320" stroke="#22d3ee" strokeWidth="4" />
            <path d="M 0 -16 C -7 -2 -16 7 -9 13 C -4 16 0 14 0 14 C 0 14 4 16 9 13 C 16 7 7 -2 0 -16 Z M -3 14 L -6 21 L 6 21 L 3 14 Z" fill="url(#cyan)" />
          </g>

          {/* Right: Heart ♥ */}
          <g transform="translate(435, 250)">
            <circle cx="0" cy="0" r="32" fill="#0b1320" stroke="#ef4444" strokeWidth="4" />
            <path d="M 0 16 C -14 7 -16 -5 -8 -11 C -2 -16 0 -9 0 -9 C 0 -9 2 -16 8 -11 C 16 -5 14 7 0 16 Z" fill="url(#ruby)" />
          </g>

          {/* Bottom: Club ♣ */}
          <g transform="translate(250, 440)">
            <circle cx="0" cy="0" r="32" fill="#0b1320" stroke="#10b981" strokeWidth="4" />
            <circle cx="0" cy="-7" r="7" fill="url(#emerald)" />
            <circle cx="-7" cy="5" r="7" fill="url(#emerald)" />
            <circle cx="7" cy="5" r="7" fill="url(#emerald)" />
            <polygon points="-3,5 -6,16 6,16 3,5" fill="url(#emerald)" />
          </g>

          {/* Left: Diamond ♦ */}
          <g transform="translate(65, 250)">
            <circle cx="0" cy="0" r="32" fill="#0b1320" stroke="#f59e0b" strokeWidth="4" />
            <polygon points="0,-16 14,0 0,16 -14,0" fill="url(#gold)" />
          </g>

          {/* Center Ace Crest */}
          <g transform="translate(250, 250)">
            <path d="M -80 -95 L 80 -95 L 95 20 C 90 95 0 135 0 135 C 0 135 -90 95 -95 20 Z" fill="#091410" stroke="url(#gold)" strokeWidth="6" />
            <path d="M -65 -80 L 65 -80 L 78 15 C 74 78 0 110 0 110 C 0 110 -74 78 -78 15 Z" fill="#0d281e" stroke="#10b981" strokeWidth="2" opacity="0.9" />

            {/* Giant Gold Spade */}
            <g transform="translate(0, -15) scale(1.7)">
              <path d="M 0 -26 C -11 -5 -26 8 -15 19 C -8 24 0 21 0 21 C 0 21 8 24 15 19 C 26 8 11 -5 0 -26 Z" fill="url(#gold)" />
              <path d="M -3 19 L -10 32 L 10 32 L 3 19 Z" fill="url(#gold)" />
              <path d="M 0 -17 C -7 -3 -15 5 -10 12 C -5 15 0 14 0 14 C 0 14 5 15 10 12 C 15 5 7 -3 0 -17 Z" fill="#071611" />
            </g>

            {/* Monogram */}
            <text x="0" y="-3" fontFamily="'Outfit', sans-serif" fontSize="26" fontWeight="900" fill="#fbbf24" textAnchor="middle" dominantBaseline="middle" letterSpacing="1">
              RT
            </text>

            {/* 5-round gold star arc */}
            {[-45, -22, 0, 22, 45].map((x, i) => (
              <polygon
                key={i}
                points="0,-7 2,-2 7,-2 3,2 4,7 0,4 -4,7 -3,2 -7,-2 -2,-2"
                fill={i === 2 ? '#34d399' : '#fbbf24'}
                transform={`translate(${x}, 85) scale(0.7)`}
              />
            ))}
          </g>
        </svg>
      </div>

      {/* Typography */}
      <div>
        <div className={`font-display font-black tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 drop-shadow-[0_2px_10px_rgba(251,191,36,0.3)] ${textSizes[size]}`}>
          ROUNDTRIP
        </div>
        {showSubtitle && (
          <div className="text-[10px] sm:text-xs font-semibold tracking-widest text-emerald-400/80 uppercase -mt-0.5">
            4-Player Trick-Taking Arena
          </div>
        )}
      </div>
    </div>
  );
};
