import React, { useState } from 'react';
import { GameState, PlayerView } from '../types/game';
import { Logo } from './Logo';
import { Users, Bot, Play, Copy, Check, ShieldCheck, Sparkles, AlertCircle, Calculator } from 'lucide-react';

interface LobbyProps {
  gameState: GameState | null;
  myPlayer: PlayerView | null;
  onCreateRoom: (hostName: string) => void;
  onJoinRoom: (roomCode: string, playerName: string) => void;
  onAutoFillBots: () => void;
  onStartGame: () => void;
  onOpenOfflineCalc?: () => void;
}

export const Lobby: React.FC<LobbyProps> = ({
  gameState,
  myPlayer,
  onCreateRoom,
  onJoinRoom,
  onAutoFillBots,
  onStartGame,
  onOpenOfflineCalc,
}) => {
  const [hostName, setHostName] = useState('Kiran');
  const [joinCode, setJoinCode] = useState('');
  const [joinName, setJoinName] = useState('Player 2');
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (gameState?.roomCode) {
      navigator.clipboard.writeText(gameState.roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // If in a room lobby
  if (gameState && gameState.phase === 'LOBBY') {
    const isPlayerBot = (p: any) => Boolean(p?.isBot || p?.bot);
    const isPlayerHost = (p: any) =>
      Boolean(p?.isHost || p?.host || p?.seat === 'SOUTH' || (gameState && p?.id === gameState.hostId));

    const isHost = isPlayerHost(myPlayer);
    const canStart = gameState.players.length === 4;

    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in duration-300">
        <div className="relative bg-gradient-to-b from-slate-900 via-[#0a1e16] to-slate-950 border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-10 shadow-[0_0_80px_rgba(16,185,129,0.25)] text-center">
          {/* Header */}
          <div className="flex justify-center mb-6">
            <Logo size="lg" />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Lobby Arena &bull; Waiting for 4 Players
          </div>

          <h2 className="text-2xl sm:text-4xl font-display font-black text-white tracking-wide mb-2">
            Prepare For The RoundTrip Match
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mb-6">
            Share the room code with friends, or tap Auto-Fill Bots to play immediately!
          </p>

          {/* Room Code Badge */}
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-slate-950/90 border border-emerald-500/50 shadow-inner mb-8">
            <span className="text-xs text-slate-400 uppercase tracking-widest font-mono">Room Code:</span>
            <span className="text-2xl sm:text-3xl font-mono font-black text-amber-400 tracking-widest">
              {gameState.roomCode}
            </span>
            <button
              onClick={handleCopyCode}
              className="p-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-400 transition-colors"
              title="Copy Room Code"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* 4 Seats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {['SOUTH', 'EAST', 'NORTH', 'WEST'].map((seatName, idx) => {
              const player = gameState.players.find((p) => p.seat === seatName);
              return (
                <div
                  key={seatName}
                  className={`p-4 rounded-2xl border text-center transition-all ${
                    player
                      ? 'bg-emerald-950/50 border-emerald-500/50 shadow-lg'
                      : 'bg-slate-900/40 border-dashed border-slate-700/60'
                  }`}
                >
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2">
                    Seat {idx + 1}: {seatName}
                  </div>

                  {player ? (
                    <div className="flex flex-col items-center">
                      <img
                        src={player.avatarUrl}
                        alt={player.displayName}
                        className="w-12 h-12 rounded-full border-2 border-emerald-500/40 bg-slate-800 mb-2"
                      />
                      <div className="text-xs sm:text-sm font-bold text-white truncate max-w-[120px]">
                        {player.displayName}
                      </div>
                      <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                        {isPlayerBot(player) ? '🤖 AI Bot' : '👤 Online Player'}
                      </div>
                    </div>
                  ) : (
                    <div className="h-20 flex flex-col items-center justify-center text-slate-500">
                      <Users className="w-6 h-6 mb-1 opacity-50" />
                      <span className="text-xs">Empty Seat</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Controls: Auto-Fill Bots & Start Game */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {gameState.players.length < 4 && (
              <button
                onClick={onAutoFillBots}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Bot className="w-4 h-4 text-cyan-400" />
                Auto-Fill Remaining Seats With Bots
              </button>
            )}

            <button
              onClick={onStartGame}
              disabled={!canStart}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-display font-black text-base shadow-xl flex items-center justify-center gap-2 transition-all ${
                canStart
                  ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 active:scale-95 shadow-[0_0_35px_rgba(251,191,36,0.5)] ring-2 ring-amber-300'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <Play className="w-5 h-5 fill-current" />
              {canStart ? 'Start Match (5 Rounds)' : 'Waiting for 4 Players / Bots'}
            </button>
          </div>

          {!canStart && (
            <div className="mt-4 text-xs text-amber-300/80 flex items-center justify-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              Click "Auto-Fill Remaining Seats With Bots" to play immediately!
            </div>
          )}
        </div>
      </div>
    );
  }

  // Initial Screen: Create or Join
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      {/* Hero Header */}
      <div className="text-center mb-10 flex flex-col items-center">
        <Logo size="hero" showSubtitle={false} className="mb-4" />
        <h1 className="text-3xl sm:text-5xl font-display font-black tracking-tight text-white mb-2">
          THE 4-PLAYER TRICK-TAKING ARENA
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
          Play online with friends or intelligent AI bots. 5 rounds of intense trick-taking, 4-card trump reveal, and secret blind bidding!
        </p>
      </div>

      {/* Cards: Create Room vs Join Room */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* CREATE ROOM CARD */}
        <div className="relative bg-gradient-to-b from-slate-900 to-[#071912] border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(16,185,129,0.2)] flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-display font-black text-white mb-1">
              Create New Match
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mb-6">
              Host a 4-player arena. Play with friends or fill instantly with Bots!
            </p>

            <div className="mb-5">
              <label className="block text-xs font-mono text-slate-300 mb-1.5">
                Your Player Name:
              </label>
              <input
                type="text"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                placeholder="e.g. Kiran"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm"
              />
            </div>
          </div>

          <button
            onClick={() => onCreateRoom(hostName)}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-display font-black text-base shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            Create Match Room
          </button>
        </div>

        {/* JOIN ROOM CARD */}
        <div className="relative bg-gradient-to-b from-slate-900 to-[#0c1624] border-2 border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(6,182,212,0.2)] flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-display font-black text-white mb-1">
              Join Existing Room
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mb-6">
              Enter a 6-character room code to join an active online match.
            </p>

            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Room Code:
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="e.g. TRIP99"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-400 font-mono font-black text-base uppercase tracking-widest focus:outline-none focus:border-cyan-500 text-center"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Your Player Name:
                </label>
                <input
                  type="text"
                  value={joinName}
                  onChange={(e) => setJoinName(e.target.value)}
                  placeholder="e.g. Tiwari"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium focus:outline-none focus:border-cyan-500 text-sm"
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => onJoinRoom(joinCode, joinName)}
            disabled={!joinCode.trim()}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-display font-black text-base shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Users className="w-4 h-4" />
            Join Match Room
          </button>
        </div>
      </div>

      {/* OFFLINE SCORE CALCULATOR CALLOUT */}
      {onOpenOfflineCalc && (
        <div className="mb-8 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-slate-900 to-emerald-500/15 border-2 border-amber-400/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-left">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-display font-black text-white flex items-center gap-2">
                <span>Playing Real Cards in Person?</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] uppercase font-black tracking-wider">
                  Offline Mode
                </span>
              </h4>
              <p className="text-xs text-slate-400">
                Enter bids & actual tricks for 4 physical players. Calculates exact -5 penalty rules, live 5-round scoreboard, and podium finish!
              </p>
            </div>
          </div>

          <button
            onClick={onOpenOfflineCalc}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-display font-black text-sm shadow-[0_0_20px_rgba(251,191,36,0.4)] transition-all active:scale-95 shrink-0 flex items-center justify-center gap-2"
          >
            <Calculator className="w-4 h-4" />
            Launch Offline Calculator
          </button>
        </div>
      )}

      {/* Rules Cheat Sheet */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl mx-auto">
        <h4 className="font-bold text-emerald-400 font-display text-base mb-2 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" /> Official RoundTrip Rules & Mechanics:
        </h4>
        <ul className="list-disc list-inside space-y-1.5 text-slate-400">
          <li><strong>4 Players:</strong> 4 seats (South, East, North, West). Missing seats auto-filled with Bots.</li>
          <li><strong>Pure Random Distribution:</strong> 52-card standard deck shuffled cryptographically, 13 cards dealt to each player.</li>
          <li><strong>4-Card Trump Reveal:</strong> 4 cards drawn from the 4 online players &mdash; highest card decides the Trump (Hukum) suit!</li>
          <li><strong>Secret Blind Bidding:</strong> No one sees your bid until all 4 players have submitted. Once all submit, all bids reveal simultaneously.</li>
          <li><strong>Scoring & Penalty:</strong> 5 rounds match. If you ask 5 and fail to reach 5, <span className="text-rose-400 font-bold">-5 penalty</span> is added to your score. If you make 5+, you gain <span className="text-emerald-400 font-bold">+5.X</span>!</li>
        </ul>
      </div>
    </div>
  );
};
