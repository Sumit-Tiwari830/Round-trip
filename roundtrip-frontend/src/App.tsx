import React, { useEffect, useState } from 'react';
import { ClerkProvider, useUser } from '@clerk/clerk-react';
import { GameProvider, useGame } from './context/GameContext';
import { Navbar } from './components/Navbar';
import { Lobby } from './components/Lobby';
import { GameTable } from './components/GameTable';
import { MatchOverModal } from './components/MatchOverModal';
import { OfflineScoreCalculator } from './components/OfflineScoreCalculator';
import * as api from './services/api';

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';
const isRealClerkKey = CLERK_PUBLISHABLE_KEY.startsWith('pk_live_') || (CLERK_PUBLISHABLE_KEY.startsWith('pk_test_') && !CLERK_PUBLISHABLE_KEY.includes('example.com'));

const ClerkSyncHelper: React.FC = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      api.syncUser(
        user.id,
        user.fullName || user.username || 'Clerk Player',
        user.id,
        user.primaryEmailAddress?.emailAddress,
        user.imageUrl
      );
    }
  }, [isLoaded, isSignedIn, user]);
  return null;
};

const MainContent: React.FC = () => {
  const [showOfflineCalc, setShowOfflineCalc] = useState(false);
  const {
    gameState,
    myPlayer,
    isConnected,
    playerName,
    avatarUrl,
    createRoom,
    joinRoom,
    autoFillBots,
    startGame,
    submitBid,
    playCard,
    leaveRoom,
    error,
  } = useGame();

  const inGame = Boolean(gameState && gameState.phase !== 'LOBBY');

  return (
    <div className="min-h-screen flex flex-col bg-[#050e0a]">
      {isRealClerkKey && <ClerkSyncHelper />}
      <Navbar
        roomCode={gameState?.roomCode}
        isConnected={isConnected}
        playerName={playerName}
        avatarUrl={avatarUrl}
        onLeaveRoom={leaveRoom}
        onToggleOfflineCalc={() => setShowOfflineCalc((prev) => !prev)}
        isOfflineCalcOpen={showOfflineCalc}
      />

      {error && (
        <div className="bg-rose-950/80 border-b border-rose-500/50 text-rose-300 text-xs text-center py-2 px-4">
          {error}
        </div>
      )}

      <main className="flex-1">
        {showOfflineCalc ? (
          <OfflineScoreCalculator onClose={() => setShowOfflineCalc(false)} />
        ) : !inGame ? (
          <Lobby
            gameState={gameState}
            myPlayer={myPlayer}
            onCreateRoom={createRoom}
            onJoinRoom={joinRoom}
            onAutoFillBots={autoFillBots}
            onStartGame={startGame}
            onOpenOfflineCalc={() => setShowOfflineCalc(true)}
          />
        ) : myPlayer ? (
          <GameTable
            gameState={gameState}
            myPlayer={myPlayer}
            onPlayCard={playCard}
            onSubmitBid={submitBid}
          />
        ) : null}

        {gameState?.phase === 'MATCH_OVER' && (
          <MatchOverModal
            gameState={gameState}
            onRematch={leaveRoom}
          />
        )}
      </main>
    </div>
  );
};

export default function App() {
  if (isRealClerkKey) {
    return (
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
        <GameProvider>
          <MainContent />
        </GameProvider>
      </ClerkProvider>
    );
  }

  // Seamless Instant Play / Guest & Dev Mode
  return (
    <GameProvider>
      <MainContent />
    </GameProvider>
  );
}
