import React from 'react';
import { Trick, Suit, Seat } from '../types/game';
import { PlayingCard } from './PlayingCard';
import { Crown, Sparkles } from 'lucide-react';

interface TrickCenterProps {
  trick?: Trick;
  trumpSuit?: Suit;
  activeSeat: Seat;
}

const suitSymbols: Record<Suit, string> = {
  SPADES: '♠',
  HEARTS: '♥',
  CLUBS: '♣',
  DIAMONDS: '♦',
};

export const TrickCenter: React.FC<TrickCenterProps> = ({
  trick,
  trumpSuit,
  activeSeat,
}) => {
  if (!trick) return null;

  const playedCards = trick.playedCards || [];

  const getCardBySeat = (seat: Seat) => {
    return playedCards.find((p) => p.seat === seat);
  };

  const southPlay = getCardBySeat('SOUTH');
  const eastPlay = getCardBySeat('EAST');
  const northPlay = getCardBySeat('NORTH');
  const westPlay = getCardBySeat('WEST');

  return (
    <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full border-2 border-emerald-500/25 bg-[#092218]/80 shadow-[inset_0_0_50px_rgba(0,0,0,0.8)] flex items-center justify-center">
      {/* Center Table Indicator */}
      <div className="absolute inset-4 rounded-full border border-emerald-500/10 pointer-events-none" />

      {/* Center Trump / Trick Info */}
      <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none opacity-40">
        <span className="text-[10px] font-mono tracking-widest uppercase text-emerald-400">
          Trick {trick.trickNumber} / 13
        </span>
        {trumpSuit && (
          <span className="text-3xl font-black text-emerald-400">
            {suitSymbols[trumpSuit]}
          </span>
        )}
      </div>

      {/* North Card (Top) */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center">
        {northPlay ? (
          <div className="animate-in fade-in slide-in-from-top-4 duration-200">
            <PlayingCard
              card={northPlay.card}
              size="sm"
              className={trick.winningCard?.id === northPlay.card.id ? 'ring-4 ring-amber-400' : ''}
            />
          </div>
        ) : activeSeat === 'NORTH' ? (
          <div className="text-[10px] font-mono text-cyan-400 animate-pulse bg-slate-900/80 px-2 py-0.5 rounded-full border border-cyan-500/40">
            North Playing...
          </div>
        ) : null}
      </div>

      {/* South Card (Bottom) */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center">
        {southPlay ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-200">
            <PlayingCard
              card={southPlay.card}
              size="sm"
              className={trick.winningCard?.id === southPlay.card.id ? 'ring-4 ring-amber-400' : ''}
            />
          </div>
        ) : activeSeat === 'SOUTH' ? (
          <div className="text-[10px] font-mono text-emerald-400 animate-pulse bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/50 font-bold">
            Your Turn!
          </div>
        ) : null}
      </div>

      {/* West Card (Left) */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col items-center">
        {westPlay ? (
          <div className="animate-in fade-in slide-in-from-left-4 duration-200">
            <PlayingCard
              card={westPlay.card}
              size="sm"
              className={trick.winningCard?.id === westPlay.card.id ? 'ring-4 ring-amber-400' : ''}
            />
          </div>
        ) : activeSeat === 'WEST' ? (
          <div className="text-[10px] font-mono text-cyan-400 animate-pulse bg-slate-900/80 px-2 py-0.5 rounded-full border border-cyan-500/40">
            West Playing...
          </div>
        ) : null}
      </div>

      {/* East Card (Right) */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col items-center">
        {eastPlay ? (
          <div className="animate-in fade-in slide-in-from-right-4 duration-200">
            <PlayingCard
              card={eastPlay.card}
              size="sm"
              className={trick.winningCard?.id === eastPlay.card.id ? 'ring-4 ring-amber-400' : ''}
            />
          </div>
        ) : activeSeat === 'EAST' ? (
          <div className="text-[10px] font-mono text-cyan-400 animate-pulse bg-slate-900/80 px-2 py-0.5 rounded-full border border-cyan-500/40">
            East Playing...
          </div>
        ) : null}
      </div>

      {/* Trick Winner Banner if completed */}
      {trick.isCompleted && trick.winningCard && (
        <div className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center p-2 backdrop-blur-sm animate-in zoom-in-90 duration-200">
          <Crown className="w-7 h-7 text-amber-400 animate-bounce mb-1" />
          <div className="text-xs font-black text-amber-300 font-display uppercase tracking-wider">
            {trick.winnerSeat} Wins Trick!
          </div>
          <div className="text-[10px] text-slate-300 font-mono mt-0.5">
            Collecting hand...
          </div>
        </div>
      )}
    </div>
  );
};
