import React, { useState } from 'react';
import { Logo } from './Logo';
import { Volume2, VolumeX, Wifi, WifiOff, User, Sparkles, Calculator } from 'lucide-react';
import { sounds } from '../audio/sounds';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';

interface NavbarProps {
  roomCode?: string;
  isConnected: boolean;
  playerName?: string;
  avatarUrl?: string;
  onLeaveRoom?: () => void;
  onToggleOfflineCalc?: () => void;
  isOfflineCalcOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  roomCode,
  isConnected,
  playerName = 'Guest',
  avatarUrl,
  onLeaveRoom,
  onToggleOfflineCalc,
  isOfflineCalcOpen = false,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(true);

  const toggleSound = () => {
    sounds.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
  };

  const hasClerkKey = Boolean(
    import.meta.env.VITE_CLERK_PUBLISHABLE_KEY &&
    !import.meta.env.VITE_CLERK_PUBLISHABLE_KEY.includes('example.com')
  );

  return (
    <header className="sticky top-0 z-30 w-full bg-slate-950/80 backdrop-blur-md border-b border-emerald-950 px-4 py-3 flex items-center justify-between">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={onLeaveRoom}>
        <Logo size="sm" showSubtitle={false} />
      </div>

      {/* Middle Status: Offline Calculator Toggle + Room Pill */}
      <div className="flex items-center gap-2">
        {onToggleOfflineCalc && (
          <button
            onClick={onToggleOfflineCalc}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-md active:scale-95 ${
              isOfflineCalcOpen
                ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 border-amber-300 font-black shadow-[0_0_15px_rgba(251,191,36,0.6)]'
                : 'bg-slate-900/90 hover:bg-slate-800 text-amber-300 border-amber-500/40 hover:border-amber-400'
            }`}
            title="Offline 4-Player Real Cards Score Calculator"
          >
            <Calculator className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Offline Score Calculator</span>
            <span className="sm:hidden">Score Calc</span>
          </button>
        )}

        {roomCode && (
          <div className="hidden md:inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-xs font-mono text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>ROOM:</span>
            <span className="font-bold text-amber-400 tracking-wider">{roomCode}</span>
          </div>
        )}
      </div>

      {/* Right Controls: Sound, Connection, Clerk Auth */}
      <div className="flex items-center gap-3">
        {/* Connection status */}
        <div
          title={isConnected ? 'Connected to Game Server' : 'Disconnected / Reconnecting'}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400"
        >
          {isConnected ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline text-emerald-400">Live</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span className="hidden md:inline text-rose-400">Offline</span>
            </>
          )}
        </div>

        {/* Sound toggle */}
        <button
          onClick={toggleSound}
          title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>

        {/* Clerk Auth Integration */}
        {hasClerkKey ? (
          <div className="flex items-center">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-slate-950 font-display font-bold text-xs shadow-md transition-all active:scale-95">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        ) : (
          /* Guest / Dev Mode Pill */
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-xs">
            {avatarUrl ? (
              <img src={avatarUrl} alt={playerName} className="w-6 h-6 rounded-full border border-emerald-400/50" />
            ) : (
              <User className="w-4 h-4 text-emerald-400" />
            )}
            <span className="font-bold text-white text-xs truncate max-w-[90px]">{playerName}</span>
          </div>
        )}
      </div>
    </header>
  );
};
