import React from 'react';
import { Card, Suit, Rank } from '../types/game';
import { sounds } from '../audio/sounds';

interface PlayingCardProps {
  card?: Card;
  faceDown?: boolean;
  isPlayable?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  badge?: string;
}

const suitSymbols: Record<Suit, string> = {
  SPADES: '♠',
  HEARTS: '♥',
  CLUBS: '♣',
  DIAMONDS: '♦',
};

const suitColors: Record<Suit, string> = {
  SPADES: 'text-slate-900',
  HEARTS: 'text-red-600',
  CLUBS: 'text-emerald-800',
  DIAMONDS: 'text-amber-600',
};

const rankDisplays: Record<Rank, string> = {
  TWO: '2', THREE: '3', FOUR: '4', FIVE: '5', SIX: '6', SEVEN: '7', EIGHT: '8', NINE: '9', TEN: '10',
  JACK: 'J', QUEEN: 'Q', KING: 'K', ACE: 'A',
};

export const PlayingCard: React.FC<PlayingCardProps> = ({
  card,
  faceDown = false,
  isPlayable = false,
  isSelected = false,
  onClick,
  size = 'md',
  className = '',
  badge,
}) => {
  const sizeClasses = {
    xs: 'w-10 h-14 text-xs rounded-md',
    sm: 'w-14 h-20 text-sm rounded-lg',
    md: 'w-20 h-28 sm:w-24 sm:h-36 text-base rounded-xl',
    lg: 'w-28 h-40 sm:w-32 sm:h-48 text-lg rounded-2xl',
  };

  const handleClick = () => {
    if (isPlayable && onClick) {
      sounds.playCard();
      onClick();
    }
  };

  if (faceDown || !card) {
    return (
      <div
        className={`relative ${sizeClasses[size]} bg-gradient-to-br from-indigo-950 via-slate-900 to-emerald-950 border-2 border-amber-400/40 shadow-xl flex items-center justify-center overflow-hidden transition-all duration-200 ${className}`}
      >
        <div className="absolute inset-1 border border-amber-300/20 rounded-lg flex items-center justify-center bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:8px_8px] opacity-40" />
        <div className="w-8 h-8 rounded-full border border-amber-400/40 flex items-center justify-center text-amber-400/70 text-xs font-bold font-mono">
          RT
        </div>
      </div>
    );
  }

  const symbol = suitSymbols[card.suit];
  const colorClass = suitColors[card.suit];
  const rankDisplay = rankDisplays[card.rank];

  return (
    <div
      onClick={handleClick}
      className={`relative ${sizeClasses[size]} bg-white border border-slate-300 shadow-2xl flex flex-col justify-between p-1.5 sm:p-2 select-none transition-all duration-200 cursor-pointer ${
        isPlayable
          ? 'hover:-translate-y-3 hover:shadow-[0_10px_25px_rgba(16,185,129,0.45)] ring-2 ring-emerald-400 cursor-pointer animate-pulse-slow'
          : 'opacity-80 hover:opacity-100 cursor-default'
      } ${isSelected ? '-translate-y-4 ring-4 ring-amber-400 shadow-[0_15px_30px_rgba(251,191,36,0.6)]' : ''} ${className}`}
    >
      {/* Top Left Corner */}
      <div className={`flex flex-col items-center leading-none ${colorClass}`}>
        <span className="font-extrabold tracking-tighter text-xs sm:text-base font-mono">{rankDisplay}</span>
        <span className="text-xs sm:text-sm">{symbol}</span>
      </div>

      {/* Center Art */}
      <div className={`absolute inset-0 flex items-center justify-center text-2xl sm:text-4xl ${colorClass} opacity-85 pointer-events-none`}>
        {symbol}
      </div>

      {/* Bottom Right Corner (Inverted) */}
      <div className={`flex flex-col items-center leading-none rotate-180 ${colorClass}`}>
        <span className="font-extrabold tracking-tighter text-xs sm:text-base font-mono">{rankDisplay}</span>
        <span className="text-xs sm:text-sm">{symbol}</span>
      </div>

      {/* Optional Badge */}
      {badge && (
        <div className="absolute -top-2.5 -right-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-md uppercase tracking-wider">
          {badge}
        </div>
      )}
    </div>
  );
};
