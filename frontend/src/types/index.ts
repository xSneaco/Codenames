// Player types
export interface Player {
  id: number;
  name: string;
  team: 'red' | 'blue' | null;
  role: 'spymaster' | 'operative' | null;
  isHost: boolean;
  lobbyId?: string;
}

// Lobby types
export interface Lobby {
  id: string;
  status: 'waiting' | 'playing' | 'finished';
  players: Player[];
  hostId?: number;
}

// Word card types
export interface WordCard {
  word: string;
  type: 'red' | 'blue' | 'neutral' | 'assassin';
  revealed: boolean;
  position: number;
}

// Game state types
export interface GameState {
  id: string;
  lobbyId: string;
  words: WordCard[];
  currentTurn: 'red' | 'blue' | null;
  currentPhase: 'hint' | 'guessing';
  redScore: number;
  blueScore: number;
  redTotal: number;
  blueTotal: number;
  status: 'waiting' | 'playing' | 'finished';
  winner: 'red' | 'blue' | null;
}

// Hint types
export interface Hint {
  team: 'red' | 'blue';
  hint: string;
  number: number;
  spymasterName: string;
}

// Socket event payloads
export interface JoinLobbyPayload {
  lobbyId: string;
  playerName: string;
}

export interface JoinedPayload {
  player: Player;
  lobby: {
    id: string;
    players: Player[];
    gameState: GameState | null;
  };
}

export interface PlayerJoinedPayload {
  id: number;
  name: string;
  team: 'red' | 'blue' | null;
  role: 'spymaster' | 'operative' | null;
  isHost: boolean;
}

export interface PlayerLeftPayload {
  playerId: number;
  playerName: string;
}

export interface TeamUpdatedPayload {
  playerId: number;
  team: 'red' | 'blue';
}

export interface RoleUpdatedPayload {
  playerId: number;
  role: 'spymaster' | 'operative';
}

export interface WordRevealedPayload {
  word: string;
  color: 'red' | 'blue' | 'neutral' | 'black';
  isCorrect: boolean;
  revealedBy: string;
  team: 'red' | 'blue';
}

export interface TurnChangedPayload {
  currentTurn: 'red' | 'blue';
  reason: 'neutral_word' | 'opponent_word' | 'manual_end';
}

export interface GameOverPayload {
  winner: 'red' | 'blue';
  reason: 'all_words' | 'black_word';
}

export interface HintGivenPayload {
  team: 'red' | 'blue';
  hint: string;
  number: number;
  spymasterName: string;
}

// Socket response types
export interface SocketResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface JoinLobbyResponse {
  success: boolean;
  player?: Player;
  error?: string;
}

export interface RevealWordResponse {
  success: boolean;
  result?: {
    word: string;
    color: 'red' | 'blue' | 'neutral' | 'black';
    isCorrect: boolean;
    gameOver: boolean;
    winner?: 'red' | 'blue';
    reason?: 'all_words' | 'black_word';
  };
  error?: string;
}
