import React from 'react';
import { GameState } from '../types/game';
import { Trophy, Award, TrendingUp, TrendingDown, X, ShieldAlert } from 'lucide-react';

interface ScorecardBoardProps {
  gameState: GameState;
  onClose?: () => void;
  isModal?: boolean;
}

export const ScorecardBoard: React.FC<ScorecardBoardProps> = ({
  gameState,
  onClose,
  isModal = false,
}) => {
  const scorecard = gameState.scorecard;
  const roundSummaries = scorecard?.roundSummaries || [];

  const rankBadges = ['🥇 1st', '🥈 2nd', '🥉 3rd', '4th'];

  const containerClass = isModal
    ? 'fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6'
    : 'w-full my-6';

  return (
    <div className={containerClass}>
      <div className="relative w-full max-w-4xl bg-gradient-to-b from-slate-900 via-[#0a1b14] to-slate-950 border-2 border-emerald-500/40 rounded-3xl p-4 sm:p-8 shadow-[0_0_80px_rgba(16,185,129,0.25)]">
        {/* Close Button if Modal */}
        {isModal && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-emerald-900/40">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              Live Online Scorecard &bull; 5-Round Match
            </div>
            <h2 className="text-xl sm:text-3xl font-display font-black text-white tracking-wide">
              Match Standings & Scoreboard
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Current Phase:</span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold">
              Round {gameState.currentRound} / {gameState.totalRounds}
            </span>
          </div>
        </div>

        {/* Rules Reminder Pill */}
        <div className="mb-6 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong className="text-amber-300">Scoring Engine:</strong> Bid <span className="text-white">X</span> & won <span className="text-white">&ge; X</span> tricks &rarr; <span className="text-emerald-400">+X.extra</span>. Failed to achieve bid &rarr; <span className="text-rose-400">-X Penalty</span>!
          </span>
        </div>

        {/* Scorecard Table */}
        <div className="overflow-x-auto rounded-2xl border border-emerald-950 bg-slate-950/60">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-emerald-950/60 text-emerald-300 uppercase tracking-wider font-mono text-[11px]">
                <th className="py-3 px-3 sm:px-4">Player</th>
                <th className="py-3 px-2 text-center">Seat</th>
                {[1, 2, 3, 4, 5].map((r) => (
                  <th key={r} className="py-3 px-2 text-center">
                    R{r}
                  </th>
                ))}
                <th className="py-3 px-3 text-right">Total</th>
                <th className="py-3 px-3 text-center">Rank</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {gameState.players
                .slice()
                .sort((a, b) => b.totalScore - a.totalScore)
                .map((p, index) => {
                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-emerald-950/20 transition-colors ${
                        index === 0 ? 'bg-amber-500/5' : ''
                      }`}
                    >
                      {/* Player info */}
                      <td className="py-3 px-3 sm:px-4 flex items-center gap-2.5">
                        <img
                          src={p.avatarUrl}
                          alt={p.displayName}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-emerald-500/30 bg-slate-800 shrink-0"
                        />
                        <div className="truncate max-w-[120px] sm:max-w-[160px]">
                          <div className="font-bold text-white truncate flex items-center gap-1.5">
                            {p.displayName}
                            {p.isBot && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
                                BOT
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Seat */}
                      <td className="py-3 px-2 text-center font-mono text-[11px] text-slate-400">
                        {p.seat}
                      </td>

                      {/* Rounds 1 to 5 */}
                      {[1, 2, 3, 4, 5].map((roundNum) => {
                        const rSummary = roundSummaries.find((r) => r.roundNumber === roundNum);
                        if (!rSummary) {
                          // Round not yet completed
                          const isCurrent = gameState.currentRound === roundNum;
                          return (
                            <td key={roundNum} className="py-3 px-2 text-center text-slate-600 font-mono text-xs">
                              {isCurrent ? (
                                <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] animate-pulse">
                                  Live
                                </span>
                              ) : (
                                '-'
                              )}
                            </td>
                          );
                        }

                        const bid = rSummary.bids[p.id];
                        const won = rSummary.tricksWon[p.id];
                        const score = rSummary.scores[p.id];
                        const isPenalty = score < 0;

                        return (
                          <td key={roundNum} className="py-2 px-1 text-center font-mono">
                            <div className="text-[10px] text-slate-400">
                              {won}/{bid}
                            </div>
                            <div
                              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded font-black text-xs ${
                                isPenalty
                                  ? 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
                                  : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                              }`}
                            >
                              {isPenalty ? (
                                <TrendingDown className="w-2.5 h-2.5" />
                              ) : (
                                <TrendingUp className="w-2.5 h-2.5" />
                              )}
                              {score > 0 ? `+${score}` : score}
                            </div>
                          </td>
                        );
                      })}

                      {/* Total Score */}
                      <td className="py-3 px-3 text-right font-display font-black text-base sm:text-lg">
                        <span
                          className={
                            p.totalScore >= 0
                              ? 'text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                              : 'text-rose-400'
                          }
                        >
                          {p.totalScore > 0 ? `+${p.totalScore.toFixed(1)}` : p.totalScore.toFixed(1)}
                        </span>
                      </td>

                      {/* Rank */}
                      <td className="py-3 px-3 text-center">
                        <span className="font-bold text-xs sm:text-sm">
                          {rankBadges[index] || `#${index + 1}`}
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
          <div>Room Code: <span className="font-mono text-emerald-400 font-bold">{gameState.roomCode}</span></div>
          <div>5 Rounds Grand Arena</div>
        </div>
      </div>
    </div>
  );
};
