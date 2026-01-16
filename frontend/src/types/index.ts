export type Team = 'red' | 'blue' | null;

export type Role = 'spymaster' | 'operative' | null;

export type CardType = 'red' | 'blue' | 'neutral' | 'assassin';

export interface Player {
  id: string;
  name: string;
  team: Team;
  role: Role;
  isHost: boolean;
}

export interface WordCard {
  word: string;
  type: CardType;
  revealed: boolean;
  position: number;
}

export interface GameState {
  id: string;
  lobbyId: string;
  words: WordCard[];
  currentTurn: Team;
  redScore: number;
  blueScore: number;
  redTotal: number;
  blueTotal: number;
  status: 'waiting' | 'playing' | 'finished';
  winner: Team;
  createdAt: string;
  updatedAt: string;
}

export interface Lobby {
  id: string;
  code: string;
  hostId: string;
  players: Player[];
  gameState: GameState | null;
  status: 'waiting' | 'playing' | 'finished';
  createdAt: string;
  updatedAt: string;
}
