import React, { useEffect } from 'react';
import { GameState } from '../types/game';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Medal } from 'lucide-react';
import { ScorecardBoard } from './ScorecardBoard';

interface MatchOverModalProps {
  gameState: GameState;
  onRematch: () => void;
}

export const MatchOverModal: React.FC<MatchOverModalProps> = ({ gameState, onRematch }) => {
  useEffect(() => {
    // Confetti burst for champion!
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#fbbf24', '#10b981', '#22d3ee', '#f43f5e'],
    });
  }, []);

  const scorecard = gameState.scorecard;
  const sortedPlayers = gameState.players.slice().sort((a, b) => b.totalScore - a.totalScore);
  const champion = sortedPlayers[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative max-w-3xl w-full bg-gradient-to-b from-slate-900 via-[#071912] to-slate-950 border-2 border-amber-400/60 rounded-3xl p-6 sm:p-10 shadow-[0_0_100px_rgba(251,191,36,0.35)] text-center my-auto">
        {/* Glowing Trophy */}
        <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 shadow-[0_0_50px_rgba(251,191,36,0.6)] mb-4 animate-bounce">
          <Trophy className="w-12 h-12 text-slate-950" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 text-xs font-black uppercase tracking-widest mb-2">
          5 Rounds Completed &bull; Match Final
        </div>

        <h2 className="text-3xl sm:text-5xl font-display font-black text-white tracking-wide mb-2">
          Champion of RoundTrip!
        </h2>
        <div className="text-xl sm:text-2xl font-bold text-amber-400 mb-6">
          🏆 {champion?.displayName} With {champion?.totalScore.toFixed(1)} Points!
        </div>

        {/* Podium Top 3 */}
        <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto mb-8">
          {sortedPlayers.slice(0, 3).map((p, idx) => {
            const ranks = ['1st Place 🥇', '2nd Place 🥈', '3rd Place 🥉'];
            const colors = [
              'bg-amber-500/15 border-amber-400 text-amber-300 scale-105',
              'bg-slate-800 border-slate-600 text-slate-300',
              'bg-amber-950/40 border-amber-800 text-amber-500',
            ];
            return (
              <div key={p.id} className={`p-3 rounded-2xl border text-center ${colors[idx]}`}>
                <div className="text-[10px] font-bold uppercase tracking-wider mb-1">
                  {ranks[idx]}
                </div>
                <img
                  src={p.avatarUrl}
                  alt={p.displayName}
                  className="w-10 h-10 rounded-full border border-white/20 mx-auto mb-1.5"
                />
                <div className="text-xs font-bold text-white truncate">{p.displayName}</div>
                <div className="text-xs font-mono font-black mt-0.5">
                  {p.totalScore >= 0 ? `+${p.totalScore.toFixed(1)}` : p.totalScore.toFixed(1)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Scorecard embed */}
        <ScorecardBoard gameState={gameState} />

        {/* Rematch Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={onRematch}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 text-slate-950 font-display font-black text-base shadow-[0_0_30px_rgba(251,191,36,0.5)] transition-all active:scale-95 flex items-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Play Again / New Match
          </button>
        </div>
      </div>
    </div>
  );
};
