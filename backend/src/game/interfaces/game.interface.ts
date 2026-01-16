/**
 * Represents the current state of a game
 */
export interface GameState {
  /** The 25 words in the game */
  words: string[];
  /** Map of word to color (partial for operatives - only revealed words) */
  wordColors: Record<string, string>;
  /** Set of revealed words */
  revealedWords: string[];
  /** Current team's turn */
  currentTurn: 'red' | 'blue';
  /** Game status */
  status: 'in_progress' | 'finished';
  /** Current scores for each team */
  scores: {
    red: number;
    blue: number;
  };
  /** Which team started the game */
  startingTeam: 'red' | 'blue';
  /** Winner of the game (if finished) */
  winner?: 'red' | 'blue';
}

/**
 * Result of revealing a word
 */
export interface RevealResult {
  /** The word that was revealed */
  word: string;
  /** The color of the revealed word */
  color: 'red' | 'blue' | 'neutral' | 'black';
  /** Whether the reveal was correct (matched current team) */
  isCorrect: boolean;
  /** Whether the game is over after this reveal */
  gameOver: boolean;
  /** Winner of the game (if game is over) */
  winner?: 'red' | 'blue';
  /** Reason for game ending */
  reason?: 'all_words' | 'black_word';
}

/**
 * Result when checking win condition
 */
export interface WinResult {
  /** The winning team */
  winner: 'red' | 'blue';
  /** Reason for winning */
  reason: 'all_words' | 'black_word';
}

/**
 * Word color assignment
 */
export type WordColor = 'red' | 'blue' | 'neutral' | 'black';
