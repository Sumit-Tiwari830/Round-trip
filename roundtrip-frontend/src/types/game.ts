export type Suit = 'SPADES' | 'HEARTS' | 'CLUBS' | 'DIAMONDS';

export type Rank =
  | 'TWO' | 'THREE' | 'FOUR' | 'FIVE' | 'SIX' | 'SEVEN' | 'EIGHT' | 'NINE' | 'TEN'
  | 'JACK' | 'QUEEN' | 'KING' | 'ACE';

export type Seat = 'SOUTH' | 'EAST' | 'NORTH' | 'WEST';

export type GamePhase =
  | 'LOBBY'
  | 'TRUMP_REVEAL'
  | 'SECRET_BIDDING'
  | 'BIDS_REVEALED'
  | 'PLAYING_TRICKS'
  | 'ROUND_SUMMARY'
  | 'MATCH_OVER';

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  value: number;
}

export interface PlayedCard {
  playerId: string;
  seat: Seat;
  card: Card;
  playedAt: number;
}

export interface Trick {
  trickNumber: number;
  leadSeat: Seat;
  leadSuit?: Suit;
  playedCards: PlayedCard[];
  winnerSeat?: Seat;
  winnerPlayerId?: string;
  winningCard?: Card;
  isCompleted: boolean;
}

export interface TrumpDrawCard {
  seat: Seat;
  playerId: string;
  playerName: string;
  card: Card;
  isDecidingTrump: boolean;
}

export interface PlayerView {
  id: string;
  displayName: string;
  avatarUrl: string;
  seat: Seat;
  isBot?: boolean;
  bot?: boolean;
  isConnected?: boolean;
  connected?: boolean;
  isHost?: boolean;
  host?: boolean;
  cardCount: number;
  hand: Card[];
  bid: number | null;
  hasSubmittedBid: boolean;
  tricksWon: number;
  totalScore: number;
}

export interface RoundScoreSummary {
  roundNumber: number;
  trumpSuit: Suit;
  bids: Record<string, number>;
  tricksWon: Record<string, number>;
  scores: Record<string, number>;
}

export interface PlayerSummary {
  playerId: string;
  displayName: string;
  seat: Seat;
  isBot: boolean;
  totalScore: number;
  rank: number;
}

export interface Scorecard {
  id?: string;
  roomCode: string;
  createdAt: number;
  finishedAt?: number;
  players: PlayerSummary[];
  roundSummaries: RoundScoreSummary[];
  totalScores: Record<string, number>;
  winnerPlayerId?: string;
  winnerPlayerName?: string;
}

export interface GameState {
  roomCode: string;
  hostId: string;
  phase: GamePhase;
  currentRound: number; // 1 to 5
  totalRounds: number; // 5
  activeSeat: Seat;
  dealerSeat: Seat;
  trumpSuit?: Suit;
  trumpDrawCards?: TrumpDrawCard[];
  currentTrick?: Trick;
  completedTricks?: Trick[];
  players: PlayerView[];
  scorecard?: Scorecard;
  message?: string;
}
