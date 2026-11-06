import { GameState, Scorecard } from '../types/game';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export async function createRoom(hostName: string, hostId?: string, avatarUrl?: string): Promise<GameState> {
  const res = await fetch(`${API_BASE}/api/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hostName, hostId, avatarUrl }),
  });
  if (!res.ok) throw new Error('Failed to create room');
  return res.json();
}

export async function joinRoom(roomCode: string, playerName: string, playerId?: string, avatarUrl?: string): Promise<GameState> {
  const res = await fetch(`${API_BASE}/api/rooms/${roomCode}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomCode, playerName, playerId, avatarUrl }),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || 'Failed to join room');
  }
  return res.json();
}

export async function getRoom(roomCode: string, playerId?: string): Promise<GameState> {
  const url = playerId
    ? `${API_BASE}/api/rooms/${roomCode}?playerId=${encodeURIComponent(playerId)}`
    : `${API_BASE}/api/rooms/${roomCode}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Room not found');
  return res.json();
}

export async function autoFillBots(roomCode: string, playerId?: string): Promise<GameState> {
  const url = playerId
    ? `${API_BASE}/api/rooms/${roomCode}/bots?playerId=${encodeURIComponent(playerId)}`
    : `${API_BASE}/api/rooms/${roomCode}/bots`;
  const res = await fetch(url, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to fill bots');
  return res.json();
}

export async function startGame(roomCode: string, hostId: string): Promise<GameState> {
  const res = await fetch(`${API_BASE}/api/rooms/${roomCode}/start?hostId=${encodeURIComponent(hostId)}`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to start game');
  return res.json();
}

export async function submitBid(roomCode: string, playerId: string, bid: number): Promise<GameState> {
  const res = await fetch(`${API_BASE}/api/rooms/${roomCode}/bid`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerId, bid }),
  });
  if (!res.ok) throw new Error('Failed to submit bid');
  return res.json();
}

export async function playCard(roomCode: string, playerId: string, cardId: string): Promise<GameState> {
  const res = await fetch(`${API_BASE}/api/rooms/${roomCode}/play`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerId, cardId }),
  });
  if (!res.ok) throw new Error('Failed to play card');
  return res.json();
}

export async function getScorecard(roomCode: string): Promise<Scorecard> {
  const res = await fetch(`${API_BASE}/api/scorecards/${roomCode}`);
  if (!res.ok) throw new Error('Scorecard not found');
  return res.json();
}

export async function saveOfflineScorecard(scorecard: any): Promise<Scorecard> {
  const res = await fetch(`${API_BASE}/api/scorecards/offline`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(scorecard),
  });
  if (!res.ok) throw new Error('Failed to save offline scorecard');
  return res.json();
}

export async function syncUser(
  id: string,
  displayName: string,
  clerkId?: string,
  email?: string,
  avatarUrl?: string
) {
  try {
    const res = await fetch(`${API_BASE}/api/users/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, displayName, clerkId, email, avatarUrl }),
    });
    if (!res.ok) return null;
    return res.json();
  } catch (e) {
    console.debug('User sync info:', e);
    return null;
  }
}

