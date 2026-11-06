import React, { useState } from 'react';
import { GameState, PlayerView, Suit } from '../types/game';
import { PlayingCard } from './PlayingCard';
import { Lock, AlertTriangle, Sparkles, Check, Crown } from 'lucide-react';
import { sounds } from '../audio/sounds';

interface SecretBidModalProps {
  gameState: GameState;
  myPlayer: PlayerView;
  onSubmitBid: (bid: number) => void;
}

const suitSymbols: Record<Suit, string> = {
  SPADES: '♠',
  HEARTS: '♥',
  CLUBS: '♣',
  DIAMONDS: '♦',
};

const suitColorClasses: Record<Suit, string> = {
  SPADES: 'text-cyan-400 border-cyan-500/50 bg-cyan-950/60',
  HEARTS: 'text-rose-400 border-rose-500/50 bg-rose-950/60',
  CLUBS: 'text-emerald-400 border-emerald-500/50 bg-emerald-950/60',
  DIAMONDS: 'text-amber-400 border-amber-500/50 bg-amber-950/60',
};

export const SecretBidModal: React.FC<SecretBidModalProps> = ({
  gameState,
  myPlayer,
  onSubmitBid,
}) => {
  const [selectedBid, setSelectedBid] = useState<number>(() => {
    if (myPlayer.bid && myPlayer.bid > 0) return myPlayer.bid;
    // Heuristic default bid based on hand
    const trumps = myPlayer.hand.filter((c) => c.suit === gameState.trumpSuit).length;
    const aces = myPlayer.hand.filter((c) => c.rank === 'ACE').length;
    const kings = myPlayer.hand.filter((c) => c.rank === 'KING').length;
    const estimated = Math.max(1, Math.min(8, Math.round(aces + kings * 0.5 + Math.max(0, trumps - 2) * 0.7)));
    return estimated || 3;
  });

  const [submitted, setSubmitted] = useState<boolean>(myPlayer.hasSubmittedBid);
  const isRevealed = gameState.phase === 'BIDS_REVEALED';

  const trumpSuit = gameState.trumpSuit;

  // Hand statistics for analysis
  const trumpsCount = trumpSuit ? myPlayer.hand.filter((c) => c.suit === trumpSuit).length : 0;
  const highCardsCount = myPlayer.hand.filter((c) => c.rank === 'ACE' || c.rank === 'KING').length;

  // Sort hand: Trump first, then Spades, Hearts, Diamonds, Clubs, by value desc
  const sortedHand = [...myPlayer.hand].sort((a, b) => {
    if (trumpSuit) {
      if (a.suit === trumpSuit && b.suit !== trumpSuit) return -1;
      if (b.suit === trumpSuit && a.suit !== trumpSuit) return 1;
    }
    if (a.suit !== b.suit) return a.suit.localeCompare(b.suit);
    return b.value - a.value;
  });

  const handleConfirmBid = () => {
    sounds.playBid();
    setSubmitted(true);
    onSubmitBid(selectedBid);
  };

  return (
    <div className="fixed inset-0 z-40 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative max-w-2xl w-full my-auto bg-gradient-to-b from-slate-900 via-[#091a13] to-slate-950 border-2 border-emerald-500/50 rounded-3xl p-5 sm:p-8 shadow-[0_0_80px_rgba(16,185,129,0.35)] text-center">
        {/* Top Header Badge */}
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            Round {gameState.currentRound} &bull; Secret Blind Bidding
          </div>

          {trumpSuit && (
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-black uppercase tracking-wider shadow-md ${suitColorClasses[trumpSuit]}`}
            >
              <span>{suitSymbols[trumpSuit]}</span>
              <span>Hukum: {trumpSuit}</span>
            </div>
          )}
        </div>

        <h2 className="text-2xl sm:text-3xl font-display font-black text-white tracking-wide mb-1">
          {isRevealed ? 'All Bids Revealed!' : 'Inspect Your Hand & Predict Tricks'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mb-4">
          {isRevealed
            ? 'All 4 bids are locked in. The match begins!'
            : 'Check your 13 cards below. Nobody sees your bid until all 4 players submit!'}
        </p>

        {/* 13 CARDS INSPECTION TRAY (USER REQUEST: "after seeing card then take a decision how many bid") */}
        <div className="mb-5 p-3.5 rounded-2xl bg-slate-950/80 border border-emerald-500/30 text-left">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5 px-1">
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Your 13 Dealt Cards (Round {gameState.currentRound})
            </div>
            <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                {trumpsCount} Trumps
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                {highCardsCount} High Cards (A/K)
              </span>
            </div>
          </div>

          {/* Cards Row */}
          {sortedHand.length > 0 ? (
            <div className="overflow-x-auto pb-2 pt-1">
              <div className="flex items-center justify-start sm:justify-center -space-x-3.5 sm:-space-x-4 min-w-max px-2">
                {sortedHand.map((card) => {
                  const isTrump = card.suit === trumpSuit;
                  return (
                    <div
                      key={card.id}
                      className={`transition-transform duration-200 hover:-translate-y-2 hover:z-30 ${
                        isTrump ? 'ring-2 ring-amber-400 rounded-lg shadow-[0_0_12px_rgba(251,191,36,0.5)]' : ''
                      }`}
                    >
                      <PlayingCard
                        card={card}
                        size="xs"
                        badge={isTrump ? 'HUKUM' : undefined}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-xs text-slate-500">
              Dealing cards...
            </div>
          )}
        </div>

        {/* Penalty Rule Alert */}
        <div className="mb-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-left">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-[11px] sm:text-xs text-amber-200/90 leading-relaxed">
            <span className="font-bold text-amber-300">RoundTrip Penalty Rule:</span> If you predict{' '}
            <span className="font-bold text-white">{selectedBid}</span> and win fewer than {selectedBid} tricks, a{' '}
            <span className="font-bold text-rose-400">-{selectedBid}</span> penalty is added. Reaching {selectedBid}+ earns{' '}
            <span className="font-bold text-emerald-400">+{selectedBid}.X</span>.
          </div>
        </div>

        {/* Selection Area if not yet submitted and not revealed */}
        {!submitted && !isRevealed && (
          <div className="mb-6">
            <div className="flex items-center justify-between max-w-md mx-auto mb-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
              <span>Select Your Secret Bid:</span>
              <span className="text-amber-400 font-mono font-bold text-sm">
                {selectedBid} {selectedBid === 1 ? 'Trick' : 'Tricks'}
              </span>
            </div>

            {/* Quick Grid 1-13 */}
            <div className="grid grid-cols-7 sm:grid-cols-13 gap-1.5 max-w-xl mx-auto mb-5">
              {Array.from({ length: 13 }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  onClick={() => {
                    setSelectedBid(num);
                    sounds.playBid();
                  }}
                  className={`h-11 rounded-xl font-display font-bold text-base transition-all duration-150 ${
                    selectedBid === num
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 scale-105 shadow-[0_0_20px_rgba(16,185,129,0.7)] ring-2 ring-white font-black'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>

            {/* Confirm Button */}
            <button
              onClick={handleConfirmBid}
              className="w-full max-w-sm mx-auto py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-display font-black text-base shadow-[0_0_35px_rgba(251,191,36,0.5)] transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
            >
              <Lock className="w-5 h-5" />
              Lock In Secret Bid: {selectedBid} Hands
            </button>
          </div>
        )}

        {/* Submitted Waiting Badge */}
        {submitted && !isRevealed && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 flex flex-col items-center justify-center gap-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-base font-display">
              <Check className="w-5 h-5 text-emerald-300" />
              Your Secret Bid of {selectedBid} Hands is Locked In!
            </div>
            <p className="text-xs text-slate-400">
              Waiting for other players to submit their secret predictions...
            </p>
          </div>
        )}

        {/* Bidding Status Grid (Shows all 4 players) */}
        <div className="mt-4 pt-4 border-t border-slate-800/80">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Players Lock-In Status (4 Seats)
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {gameState.players.map((p) => {
              const isSelf = p.id === myPlayer.id;
              const hasBid = p.hasSubmittedBid || (isSelf && submitted);
              const showBid = isRevealed || (isSelf && (submitted || p.hasSubmittedBid));

              return (
                <div
                  key={p.id}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    hasBid
                      ? 'bg-emerald-950/40 border-emerald-500/40'
                      : 'bg-slate-900/60 border-slate-800 animate-pulse'
                  }`}
                >
                  <div className="text-[10px] font-mono text-slate-400 uppercase mb-1">
                    {p.seat} {isSelf && '(You)'}
                  </div>
                  <div className="text-xs font-bold text-white truncate max-w-[100px] mx-auto mb-1.5">
                    {p.displayName}
                  </div>

                  {showBid ? (
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black font-mono">
                      <span>Bid:</span>
                      <span className="text-amber-400 text-sm">
                        {isSelf ? selectedBid : p.bid}
                      </span>
                    </div>
                  ) : hasBid ? (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-800 text-amber-400 text-[10px] font-mono font-bold">
                      <Lock className="w-3 h-3" />
                      Locked In
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-500 font-mono">
                      Predicting...
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
