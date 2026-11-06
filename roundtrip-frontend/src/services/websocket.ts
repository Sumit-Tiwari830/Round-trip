import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { GameState } from '../types/game';

const WS_BASE = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws-roundtrip';

export class GameWebSocketClient {
  private client: Client | null = null;
  private roomCode: string | null = null;
  private playerId: string | null = null;
  private onStateCallback: ((state: GameState) => void) | null = null;

  connect(roomCode: string, playerId: string, onState: (state: GameState) => void) {
    this.roomCode = roomCode;
    this.playerId = playerId;
    this.onStateCallback = onState;

    this.disconnect();

    this.client = new Client({
      webSocketFactory: () => new SockJS(WS_BASE),
      reconnectDelay: 3000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        if (playerId) {
          // Subscribe to player-specific channel (receives private hand & filtered state)
          this.client?.subscribe(`/topic/room/${roomCode}/player/${playerId}`, (message) => {
            try {
              const state: GameState = JSON.parse(message.body);
              if (this.onStateCallback) this.onStateCallback(state);
            } catch (e) {
              console.error('Failed to parse player WebSocket message:', e);
            }
          });
        } else {
          // Only subscribe to spectator channel if not a seated player
          this.client?.subscribe(`/topic/room/${roomCode}`, (message) => {
            try {
              const state: GameState = JSON.parse(message.body);
              if (this.onStateCallback) this.onStateCallback(state);
            } catch (e) {
              console.error('Failed to parse general WebSocket message:', e);
            }
          });
        }
      },
      onStompError: (frame) => {
        console.warn('STOMP protocol error:', frame.headers['message']);
      },
    });

    this.client.activate();
  }

  sendBid(bid: number) {
    if (this.client?.connected && this.roomCode && this.playerId) {
      this.client.publish({
        destination: `/app/game/${this.roomCode}/bid`,
        body: JSON.stringify({ playerId: this.playerId, bid }),
      });
    }
  }

  sendPlayCard(cardId: string) {
    if (this.client?.connected && this.roomCode && this.playerId) {
      this.client.publish({
        destination: `/app/game/${this.roomCode}/play`,
        body: JSON.stringify({ playerId: this.playerId, cardId }),
      });
    }
  }

  sendStartGame(hostId: string) {
    if (this.client?.connected && this.roomCode) {
      this.client.publish({
        destination: `/app/game/${this.roomCode}/start`,
        body: hostId,
      });
    }
  }

  sendAutoFillBots() {
    if (this.client?.connected && this.roomCode) {
      this.client.publish({
        destination: `/app/game/${this.roomCode}/bots`,
        body: '',
      });
    }
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
  }
}

export const wsClient = new GameWebSocketClient();
