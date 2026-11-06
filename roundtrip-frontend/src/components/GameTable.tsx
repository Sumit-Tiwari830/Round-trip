import React, { useState } from 'react';
import { GameState, PlayerView, Card, Seat, Suit } from '../types/game';
import { PlayingCard } from './PlayingCard';
import { TrickCenter } from './TrickCenter';
import { TrumpRevealBanner } from './TrumpRevealBanner';
import { SecretBidModal } from './SecretBidModal';
import { ScorecardBoard } from './ScorecardBoard';
import { Bot, User, Zap, Trophy, ShieldAlert, Sparkles } from 'lucide-react';
import { sounds } from '../audio/sounds';

interface GameTableProps {
  gameState: GameState;
  myPlayer: PlayerView;
  onPlayCard: (cardId: string) => void;
  onSubmitBid: (bid: number) => void;
  onNextRound?: () => void;
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

export const GameTable: React.FC<GameTableProps> = ({
  gameState,
  myPlayer,
  onPlayCard,
  onSubmitBid,
}) => {
  const [showScorecard, setShowScorecard] = useState(false);

  const getPlayerBySeat = (seat: Seat): PlayerView | undefined => {
    return gameState.players.find((p) => p.seat === seat);
  };

  const southPlayer = getPlayerBySeat('SOUTH') || myPlayer;
  const eastPlayer = getPlayerBySeat('EAST');
  const northPlayer = getPlayerBySeat('NORTH');
  const westPlayer = getPlayerBySeat('WEST');

  const isMyTurn = gameState.activeSeat === myPlayer.seat && gameState.phase === 'PLAYING_TRICKS';

  // Legal Card Play Validator: Must follow lead suit if possible
  const currentTrick = gameState.currentTrick;
  const leadSuit = currentTrick?.leadSuit;

  const hasLeadSuit = leadSuit
    ? myPlayer.hand.some((c) => c.suit === leadSuit)
    : false;

  const isCardLegal = (card: Card): boolean => {
    if (!isMyTurn) return false;
    if (!leadSuit) return true; // Leading the trick, any card is legal
    if (hasLeadSuit) {
      return card.suit === leadSuit; // Must follow lead suit
    }
    return true; // Void in lead suit, can play trump or discard
  };

  const trumpSuit = gameState.trumpSuit;

  return (
    <div className="relative min-h-[calc(100vh-70px)] flex flex-col justify-between p-2 sm:p-4 overflow-y-auto overflow-x-hidden bg-[radial-gradient(ellipse_at_center,_#0b291e_0%,_#05150e_60%,_#020b07_100%)] select-none pb-6">
      {/* Background Casino Table Felt Ring */}
      <div className="absolute inset-4 sm:inset-12 rounded-[50px] border-4 border-[#144233]/70 pointer-events-none shadow-[inset_0_0_120px_rgba(0,0,0,0.85)]" />

      {/* Top HUD: Trump, Round, Scorecard Button */}
      <div className="relative z-10 flex items-center justify-between gap-3 px-2">
        {/* Trump Suit Pill */}
        <div className="flex items-center gap-2">
          {trumpSuit ? (
            <div
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border font-bold text-xs sm:text-sm backdrop-blur-md shadow-lg ${suitColorClasses[trumpSuit]}`}
            >
              <span className="text-xl leading-none">{suitSymbols[trumpSuit]}</span>
              <span className="uppercase tracking-wider">Hukum: {trumpSuit}</span>
            </div>
          ) : (
            <div className="px-3 py-1 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
              Drawing Trump...
            </div>
          )}
        </div>

        {/* Center Round Badge */}
        <div className="px-4 py-1.5 rounded-full bg-slate-900/80 border border-emerald-500/30 text-xs font-mono text-emerald-400 font-bold backdrop-blur-md flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Round {gameState.currentRound} / 5
        </div>

        {/* Scorecard Toggle Button */}
        <button
          onClick={() => setShowScorecard(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold text-xs transition-colors backdrop-blur-md"
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Scorecard</span>
        </button>
      </div>

      {/* Middle Arena: 4 Players & Trick Center */}
      <div className="relative flex-1 flex flex-col items-center justify-center my-4">
        {/* NORTH PLAYER (Top) */}
        {northPlayer && (
          <div className="mb-2 flex flex-col items-center">
            <PlayerSeatBadge
              player={northPlayer}
              isActive={gameState.activeSeat === 'NORTH'}
              isDealer={gameState.dealerSeat === 'NORTH'}
            />
            {/* North Hidden Cards */}
            <div className="flex -space-x-4 mt-1 opacity-70">
              {Array.from({ length: Math.min(northPlayer.cardCount, 8) }).map((_, i) => (
                <PlayingCard key={i} faceDown size="xs" />
              ))}
            </div>
          </div>
        )}

        {/* WEST, TRICK CENTER, EAST */}
        <div className="w-full max-w-4xl flex items-center justify-between px-2 sm:px-8">
          {/* WEST PLAYER (Left) */}
          {westPlayer && (
            <div className="flex flex-col items-center">
              <PlayerSeatBadge
                player={westPlayer}
                isActive={gameState.activeSeat === 'WEST'}
                isDealer={gameState.dealerSeat === 'WEST'}
              />
              <div className="flex flex-col -space-y-8 mt-2 opacity-70">
                {Array.from({ length: Math.min(westPlayer.cardCount, 6) }).map((_, i) => (
                  <PlayingCard key={i} faceDown size="xs" />
                ))}
              </div>
            </div>
          )}

          {/* TRICK CENTER TABLE */}
          <div className="mx-auto">
            <TrickCenter
              trick={gameState.currentTrick}
              trumpSuit={gameState.trumpSuit}
              activeSeat={gameState.activeSeat}
            />
          </div>

          {/* EAST PLAYER (Right) */}
          {eastPlayer && (
            <div className="flex flex-col items-center">
              <PlayerSeatBadge
                player={eastPlayer}
                isActive={gameState.activeSeat === 'EAST'}
                isDealer={gameState.dealerSeat === 'EAST'}
              />
              <div className="flex flex-col -space-y-8 mt-2 opacity-70">
                {Array.from({ length: Math.min(eastPlayer.cardCount, 6) }).map((_, i) => (
                  <PlayingCard key={i} faceDown size="xs" />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM SECTION: SOUTH PLAYER (YOU) & HAND CARDS */}
      <div className="relative z-20 flex flex-col items-center w-full max-w-5xl mx-auto">
        {/* South Badge & Turn Notification */}
        <div className="flex items-center gap-3 mb-2">
          <PlayerSeatBadge
            player={southPlayer}
            isActive={gameState.activeSeat === 'SOUTH'}
            isDealer={gameState.dealerSeat === 'SOUTH'}
            isSelf
          />
          {isMyTurn && (
            <div className="px-3 py-1 rounded-full bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider animate-bounce shadow-[0_0_20px_rgba(16,185,129,0.8)]">
              Your Turn to Play!
            </div>
          )}
        </div>

        {/* Hand Cards Fanned Out */}
        <div className="relative w-full overflow-x-auto pb-4 pt-2 flex items-center justify-center">
          {myPlayer.hand && myPlayer.hand.length > 0 ? (
            <div className="flex items-center justify-center -space-x-4 sm:-space-x-6 md:-space-x-7 px-4 min-w-max">
              {myPlayer.hand.map((card) => {
                const playable = isCardLegal(card);
                return (
                  <div
                    key={card.id}
                    className="transition-transform duration-200 hover:-translate-y-4 hover:z-30"
                  >
                    <PlayingCard
                      card={card}
                      size="md"
                      isPlayable={playable}
                      onClick={() => {
                        if (playable) {
                          sounds.playCard();
                          onPlayCard(card.id);
                        }
                      }}
                      className={
                        !playable && isMyTurn
                          ? 'opacity-40 grayscale-[40%]'
                          : ''
                      }
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="px-4 py-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
              Cards in play or round transitioning...
            </div>
          )}
        </div>
      </div>

      {/* OVERLAY: TRUMP REVEAL BANNER */}
      {gameState.phase === 'TRUMP_REVEAL' && gameState.trumpDrawCards && (
        <TrumpRevealBanner
          roundNumber={gameState.currentRound}
          trumpCards={gameState.trumpDrawCards}
          trumpSuit={gameState.trumpSuit}
        />
      )}

      {/* OVERLAY: SECRET BID MODAL */}
      {(gameState.phase === 'SECRET_BIDDING' || gameState.phase === 'BIDS_REVEALED') && (
        <SecretBidModal
          gameState={gameState}
          myPlayer={myPlayer}
          onSubmitBid={onSubmitBid}
        />
      )}

      {/* OVERLAY: SCORECARD MODAL */}
      {showScorecard && (
        <ScorecardBoard
          gameState={gameState}
          isModal
          onClose={() => setShowScorecard(false)}
        />
      )}
    </div>
  );
};

interface PlayerSeatBadgeProps {
  player: PlayerView;
  isActive: boolean;
  isDealer: boolean;
  isSelf?: boolean;
}

const PlayerSeatBadge: React.FC<PlayerSeatBadgeProps> = ({
  player,
  isActive,
  isDealer,
  isSelf = false,
}) => {
  return (
    <div
      className={`relative flex items-center gap-2 p-2 rounded-2xl border transition-all duration-300 ${
        isActive
          ? 'bg-emerald-950/90 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.5)] scale-105'
          : 'bg-slate-900/85 border-slate-700/60'
      }`}
    >
      {/* Dealer Coin */}
      {isDealer && (
        <div className="absolute -top-2.5 -left-2 w-5 h-5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center font-mono font-black text-[10px] shadow-md border border-white">
          D
        </div>
      )}

      {/* Avatar */}
      <div className="relative">
        <img
          src={player.avatarUrl}
          alt={player.displayName}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-emerald-500/40 bg-slate-800"
        />
        {player.isBot ? (
          <Bot className="w-3.5 h-3.5 text-cyan-400 absolute -bottom-1 -right-1 bg-slate-950 rounded-full p-0.5 border border-cyan-400" />
        ) : (
          <User className="w-3.5 h-3.5 text-emerald-400 absolute -bottom-1 -right-1 bg-slate-950 rounded-full p-0.5 border border-emerald-400" />
        )}
      </div>

      {/* Player details */}
      <div className="text-left">
        <div className="text-xs font-bold text-white truncate max-w-[100px] flex items-center gap-1">
          {player.displayName} {isSelf && '(You)'}
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="text-emerald-400 font-bold">
            Tricks: {player.tricksWon}/{player.bid !== null ? player.bid : '?'}
          </span>
          <span className="text-amber-400 font-bold">
            {player.totalScore >= 0 ? `+${player.totalScore}` : player.totalScore}
          </span>
        </div>
      </div>
    </div>
  );
};
