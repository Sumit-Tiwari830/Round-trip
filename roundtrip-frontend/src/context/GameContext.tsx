import React, { createContext, useContext, useState, useEffect } from 'react';
import { GameState, PlayerView } from '../types/game';
import * as api from '../services/api';
import { wsClient } from '../services/websocket';

interface GameContextType {
  gameState: GameState | null;
  myPlayer: PlayerView | null;
  isConnected: boolean;
  playerName: string;
  avatarUrl: string;
  createRoom: (hostName: string) => Promise<void>;
  joinRoom: (roomCode: string, name: string) => Promise<void>;
  autoFillBots: () => Promise<void>;
  startGame: () => Promise<void>;
  submitBid: (bid: number) => Promise<void>;
  playCard: (cardId: string) => Promise<void>;
  leaveRoom: () => void;
  error: string | null;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Local Player identity
  const [playerId] = useState<string>(() => {
    const saved = localStorage.getItem('rt_player_id');
    if (saved) return saved;
    const generated = 'user-' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem('rt_player_id', generated);
    return generated;
  });

  const [playerName, setPlayerName] = useState<string>(() => {
    return localStorage.getItem('rt_player_name') || 'Player 1';
  });

  const [avatarUrl] = useState<string>(() => {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${playerId}`;
  });

  // Find user's player view in the current room
  const myPlayer: PlayerView | null =
    gameState?.players.find((p) => p.id === playerId) ||
    gameState?.players[0] ||
    null;

  // Sync user with MongoDB on startup or name update
  useEffect(() => {
    api.syncUser(playerId, playerName, undefined, undefined, avatarUrl);
  }, [playerId, playerName, avatarUrl]);

  // Listen to WebSocket updates
  useEffect(() => {
    if (gameState?.roomCode) {
      wsClient.connect(gameState.roomCode, playerId, (freshState) => {
        setGameState((prevState) => {
          if (!prevState) return freshState;
          // Protect player's private hand from getting accidentally cleared
          const prevPlayer = prevState.players.find((p) => p.id === playerId);
          const freshPlayer = freshState.players.find((p) => p.id === playerId);
          if (
            prevPlayer &&
            freshPlayer &&
            freshPlayer.hand.length === 0 &&
            prevPlayer.hand.length > 0 &&
            freshState.currentRound === prevState.currentRound &&
            freshState.phase !== 'ROUND_SUMMARY' &&
            freshState.phase !== 'MATCH_OVER'
          ) {
            freshPlayer.hand = [...prevPlayer.hand];
          }
          return freshState;
        });
        setIsConnected(true);
      });
    }
    return () => {
      wsClient.disconnect();
    };
  }, [gameState?.roomCode, playerId]);

  const createRoom = async (name: string) => {
    try {
      setError(null);
      setPlayerName(name);
      localStorage.setItem('rt_player_name', name);
      const state = await api.createRoom(name, playerId, avatarUrl);
      setGameState(state);
    } catch (e: any) {
      setError(e.message || 'Failed to create room');
    }
  };

  const joinRoom = async (roomCode: string, name: string) => {
    try {
      setError(null);
      setPlayerName(name);
      localStorage.setItem('rt_player_name', name);
      const state = await api.joinRoom(roomCode, name, playerId, avatarUrl);
      setGameState(state);
    } catch (e: any) {
      setError(e.message || 'Failed to join room');
    }
  };

  const autoFillBots = async () => {
    if (!gameState) return;
    try {
      wsClient.sendAutoFillBots();
      const state = await api.autoFillBots(gameState.roomCode, playerId);
      setGameState(state);
    } catch (e: any) {
      console.warn('Bot autofill warning:', e.message);
    }
  };

  const startGame = async () => {
    if (!gameState) return;
    try {
      wsClient.sendStartGame(playerId);
      const state = await api.startGame(gameState.roomCode, playerId);
      setGameState(state);
    } catch (e: any) {
      setError(e.message || 'Failed to start game');
    }
  };

  const submitBid = async (bid: number) => {
    if (!gameState) return;
    try {
      wsClient.sendBid(bid);
      const state = await api.submitBid(gameState.roomCode, playerId, bid);
      setGameState(state);
    } catch (e: any) {
      console.warn('Bid submit info:', e.message);
    }
  };

  const playCard = async (cardId: string) => {
    if (!gameState) return;
    try {
      wsClient.sendPlayCard(cardId);
      const state = await api.playCard(gameState.roomCode, playerId, cardId);
      setGameState(state);
    } catch (e: any) {
      console.warn('Play card info:', e.message);
    }
  };

  const leaveRoom = () => {
    wsClient.disconnect();
    setGameState(null);
    setError(null);
  };

  return (
    <GameContext.Provider
      value={{
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
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
};
