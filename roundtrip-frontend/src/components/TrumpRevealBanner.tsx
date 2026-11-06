import React, { useEffect } from 'react';
import { TrumpDrawCard, Suit } from '../types/game';
import { PlayingCard } from './PlayingCard';
import { Crown, Sparkles } from 'lucide-react';
import { sounds } from '../audio/sounds';

interface TrumpRevealBannerProps {
  roundNumber: number;
  trumpCards: TrumpDrawCard[];
  trumpSuit?: Suit;
}

const suitNames: Record<Suit, { name: string; color: string; symbol: string }> = {
  SPADES: { name: 'Spades', color: 'text-cyan-400', symbol: '♠' },
  HEARTS: { name: 'Hearts', color: 'text-rose-400', symbol: '♥' },
  CLUBS: { name: 'Clubs', color: 'text-emerald-400', symbol: '♣' },
  DIAMONDS: { name: 'Diamonds', color: 'text-amber-400', symbol: '♦' },
};

export const TrumpRevealBanner: React.FC<TrumpRevealBannerProps> = ({
  roundNumber,
  trumpCards,
  trumpSuit,
}) => {
  useEffect(() => {
    sounds.playTrumpFanfare();
  }, [roundNumber]);

  const suitInfo = trumpSuit ? suitNames[trumpSuit] : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-300">
      <div className="relative max-w-2xl w-full bg-gradient-to-b from-slate-900 to-[#071912] border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_80px_rgba(16,185,129,0.3)] text-center">
        {/* Glow Effects */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Round Header */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs sm:text-sm font-bold uppercase tracking-wider mb-4">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          Round {roundNumber} of 5 &bull; Trump Deciding Draw
        </div>

        <h2 className="text-2xl sm:text-4xl font-display font-black text-white tracking-wide mb-2">
          Initial 4-Card Trump Reveal
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm mb-6 max-w-md mx-auto">
          One card drawn randomly for each player. The highest card determines the Trump (Hukum) suit!
        </p>

        {/* 4 Player Drawn Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {trumpCards.map((t, idx) => {
            const isWinner = t.isDecidingTrump;
            return (
              <div
                key={idx}
                className={`relative flex flex-col items-center p-3 rounded-2xl transition-all duration-300 ${
                  isWinner
                    ? 'bg-amber-500/15 border-2 border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.3)] scale-105'
                    : 'bg-slate-800/50 border border-slate-700/60'
                }`}
              >
                {isWinner && (
                  <div className="absolute -top-3.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 px-2 py-0.5 rounded-full flex items-center gap-1 text-[10px] font-black uppercase tracking-wider shadow-lg">
                    <Crown className="w-3 h-3" /> Highest!
                  </div>
                )}

                <PlayingCard
                  card={t.card}
                  size="sm"
                  className={isWinner ? 'ring-4 ring-amber-400' : ''}
                />

                <span className="mt-2 text-xs font-semibold text-slate-200 truncate max-w-[100px]">
                  {t.playerName}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {t.seat}
                </span>
              </div>
            );
          })}
        </div>

        {/* Declared Trump Suit */}
        {suitInfo && (
          <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 inline-flex items-center gap-3">
            <span className={`text-4xl sm:text-5xl ${suitInfo.color}`}>
              {suitInfo.symbol}
            </span>
            <div className="text-left">
              <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">
                Trump Suit (Hukum)
              </span>
              <div className={`text-2xl font-black font-display ${suitInfo.color}`}>
                {suitInfo.name.toUpperCase()}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 text-xs text-slate-400 animate-pulse">
          Starting Secret Bidding Phase in 3 seconds...
        </div>
      </div>
    </div>
  );
};
