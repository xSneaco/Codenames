import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DatabaseService } from '../database/database.service';
import { WordlistService } from '../wordlist/wordlist.service';
import { games, lobbies, Game, NewGame } from '../db/schema';
import { GameState, RevealResult, WinResult, WordColor } from './interfaces/game.interface';

@Injectable()
export class GameService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly wordlistService: WordlistService,
  ) {}

  /**
   * Fisher-Yates shuffle algorithm
   */
  shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Assign colors to words based on starting team
   * Starting team gets 9 words, other team gets 8, 7 neutral, 1 black
   */
  assignWordColors(words: string[], startingTeam: 'red' | 'blue'): Record<string, WordColor> {
    const otherTeam: 'red' | 'blue' = startingTeam === 'red' ? 'blue' : 'red';
    
    // Create color assignments array
    const colors: WordColor[] = [
      ...Array(9).fill(startingTeam),  // Starting team gets 9
      ...Array(8).fill(otherTeam),      // Other team gets 8
      ...Array(7).fill('neutral'),      // 7 neutral
      'black',                          // 1 black (assassin)
    ];

    // Shuffle the colors
    const shuffledColors = this.shuffleArray(colors);

    // Map words to colors
    const wordColors: Record<string, WordColor> = {};
    words.forEach((word, index) => {
      wordColors[word] = shuffledColors[index];
    });

    return wordColors;
  }

  /**
   * Create a new game for a lobby
   */
  async createGame(lobbyId: string): Promise<Game> {
    const db = this.databaseService.getDb();

    // Check if lobby exists
    const lobby = await db.query.lobbies.findFirst({
      where: eq(lobbies.id, lobbyId),
    });

    if (!lobby) {
      throw new NotFoundException('Lobby not found');
    }

    // Get wordlist (custom or default)
    const wordlist = await this.wordlistService.getWordlist(lobbyId);

    // Shuffle and pick 25 words
    const shuffledWords = this.shuffleArray(wordlist);
    const selectedWords = shuffledWords.slice(0, 25);

    // Randomly assign starting team
    const startingTeam: 'red' | 'blue' = Math.random() < 0.5 ? 'red' : 'blue';

    // Assign word colors
    const wordColors = this.assignWordColors(selectedWords, startingTeam);

    // Convert wordColors object to array matching word order
    const wordColorsArray = selectedWords.map(word => wordColors[word]);

    // Create revealed words array (all false initially)
    const revealedWords = Array(25).fill(false);

    // Delete existing game for this lobby if any
    await db.delete(games).where(eq(games.lobbyId, lobbyId));

    // Create game record
    const newGame: NewGame = {
      lobbyId,
      words: selectedWords,
      wordColors: wordColorsArray,
      revealedWords,
      currentTurn: startingTeam,
      startingTeam,
      status: 'in_progress',
    };

    const [game] = await db.insert(games).values(newGame).returning();

    // Update lobby status
    await db
      .update(lobbies)
      .set({ status: 'in_progress' })
      .where(eq(lobbies.id, lobbyId));

    return game;
  }

  /**
   * Get game by lobby ID
   */
  async getGame(lobbyId: string): Promise<Game | null> {
    const db = this.databaseService.getDb();
    const game = await db.query.games.findFirst({
      where: eq(games.lobbyId, lobbyId),
    });
    return game ?? null;
  }

  /**
   * Get game state - filtered based on role
   * Spymasters see all colors, operatives only see revealed colors
   */
  async getGameState(lobbyId: string, isSpymaster: boolean): Promise<GameState> {
    const game = await this.getGame(lobbyId);

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    const words = game.words;
    const wordColorsArray = game.wordColors;
    const revealedArray = game.revealedWords;

    // Build word colors map
    const allWordColors: Record<string, string> = {};
    words.forEach((word: string, index: number) => {
      allWordColors[word] = wordColorsArray[index];
    });

    // Get revealed words
    const revealedWords: string[] = [];
    words.forEach((word: string, index: number) => {
      if (revealedArray[index]) {
        revealedWords.push(word);
      }
    });

    // Calculate scores (revealed words for each team)
    const scores = { red: 0, blue: 0 };
    words.forEach((_word: string, index: number) => {
      if (revealedArray[index]) {
        const color = wordColorsArray[index];
        if (color === 'red') scores.red++;
        if (color === 'blue') scores.blue++;
      }
    });

    // Filter word colors based on role
    let wordColors: Record<string, string>;
    if (isSpymaster) {
      // Spymaster sees all colors
      wordColors = allWordColors;
    } else {
      // Operative only sees revealed word colors
      wordColors = {};
      revealedWords.forEach(word => {
        wordColors[word] = allWordColors[word];
      });
    }

    return {
      words,
      wordColors,
      revealedWords,
      currentTurn: game.currentTurn as 'red' | 'blue',
      status: game.status as 'in_progress' | 'finished',
      scores,
      startingTeam: game.startingTeam as 'red' | 'blue',
      winner: game.status === 'finished' ? this.determineWinner(game) : undefined,
    };
  }

  /**
   * Determine winner from a finished game
   */
  private determineWinner(game: Game): 'red' | 'blue' | undefined {
    const words = game.words;
    const wordColorsArray = game.wordColors;
    const revealedArray = game.revealedWords;

    // Check if black word was revealed
    const blackIndex = wordColorsArray.findIndex((c: string) => c === 'black');
    if (blackIndex !== -1 && revealedArray[blackIndex]) {
      // Team that revealed black word loses
      // We need to figure out who revealed it - stored as last turn that happened
      // For simplicity, the winner is the opposite of current turn when game ended
      return game.currentTurn === 'red' ? 'blue' : 'red';
    }

    // Check if all team words are revealed
    const redRevealed = words.filter((_: string, i: number) => wordColorsArray[i] === 'red' && revealedArray[i]).length;
    const blueRevealed = words.filter((_: string, i: number) => wordColorsArray[i] === 'blue' && revealedArray[i]).length;
    const startingTeam = game.startingTeam as 'red' | 'blue';
    const startingTeamTotal = startingTeam === 'red' ? 9 : 8;
    const otherTeamTotal = startingTeam === 'red' ? 8 : 9;

    if (startingTeam === 'red') {
      if (redRevealed === 9) return 'red';
      if (blueRevealed === 8) return 'blue';
    } else {
      if (blueRevealed === 9) return 'blue';
      if (redRevealed === 8) return 'red';
    }

    return undefined;
  }

  /**
   * Reveal a word and handle game logic
   */
  async revealWord(lobbyId: string, word: string, team: string): Promise<RevealResult> {
    const db = this.databaseService.getDb();
    const game = await this.getGame(lobbyId);

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    if (game.status !== 'in_progress') {
      throw new BadRequestException('Game is not in progress');
    }

    const words = game.words;
    const wordColorsArray = game.wordColors;
    const revealedArray = [...game.revealedWords];

    // Find the word index
    const wordIndex = words.findIndex((w: string) => w === word);
    if (wordIndex === -1) {
      throw new BadRequestException('Word not found in game');
    }

    // Check if already revealed
    if (revealedArray[wordIndex]) {
      throw new BadRequestException('Word already revealed');
    }

    // Mark word as revealed
    revealedArray[wordIndex] = true;

    // Get the word's color
    const color = wordColorsArray[wordIndex] as WordColor;
    const currentTurn = game.currentTurn as 'red' | 'blue';

    // Determine if correct guess
    const isCorrect = color === currentTurn;

    // Check win conditions
    let gameOver = false;
    let winner: 'red' | 'blue' | undefined;
    let reason: 'all_words' | 'black_word' | undefined;
    let newStatus = game.status;
    let newTurn = currentTurn;

    if (color === 'black') {
      // Revealing black word = instant loss for revealing team
      gameOver = true;
      winner = currentTurn === 'red' ? 'blue' : 'red';
      reason = 'black_word';
      newStatus = 'finished';
    } else {
      // Check if all words for a team are revealed
      const winResult = this.checkWinConditionFromState(
        words,
        wordColorsArray,
        revealedArray,
        game.startingTeam as 'red' | 'blue',
      );

      if (winResult) {
        gameOver = true;
        winner = winResult.winner;
        reason = winResult.reason;
        newStatus = 'finished';
      } else if (!isCorrect) {
        // Wrong guess or neutral - switch turns
        newTurn = currentTurn === 'red' ? 'blue' : 'red';
      }
      // Correct guess - turn continues (newTurn stays the same)
    }

    // Update game in database
    await db
      .update(games)
      .set({
        revealedWords: revealedArray,
        currentTurn: newTurn,
        status: newStatus,
      })
      .where(eq(games.lobbyId, lobbyId));

    return {
      word,
      color,
      isCorrect,
      gameOver,
      winner,
      reason,
    };
  }

  /**
   * Check win condition from game state arrays
   */
  private checkWinConditionFromState(
    words: string[],
    wordColorsArray: string[],
    revealedArray: boolean[],
    startingTeam: 'red' | 'blue',
  ): WinResult | null {
    const redTotal = startingTeam === 'red' ? 9 : 8;
    const blueTotal = startingTeam === 'blue' ? 9 : 8;

    let redRevealed = 0;
    let blueRevealed = 0;

    words.forEach((_, index) => {
      if (revealedArray[index]) {
        if (wordColorsArray[index] === 'red') redRevealed++;
        if (wordColorsArray[index] === 'blue') blueRevealed++;
      }
    });

    if (redRevealed === redTotal) {
      return { winner: 'red', reason: 'all_words' };
    }
    if (blueRevealed === blueTotal) {
      return { winner: 'blue', reason: 'all_words' };
    }

    return null;
  }

  /**
   * End the current turn
   */
  async endTurn(lobbyId: string): Promise<void> {
    const db = this.databaseService.getDb();
    const game = await this.getGame(lobbyId);

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    if (game.status !== 'in_progress') {
      throw new BadRequestException('Game is not in progress');
    }

    const currentTurn = game.currentTurn as 'red' | 'blue';
    const newTurn: 'red' | 'blue' = currentTurn === 'red' ? 'blue' : 'red';

    await db
      .update(games)
      .set({ currentTurn: newTurn })
      .where(eq(games.lobbyId, lobbyId));
  }

  /**
   * Check win condition for a game
   */
  async checkWinCondition(lobbyId: string): Promise<WinResult | null> {
    const game = await this.getGame(lobbyId);

    if (!game) {
      return null;
    }

    const words = game.words;
    const wordColorsArray = game.wordColors;
    const revealedArray = game.revealedWords;
    const startingTeam = game.startingTeam as 'red' | 'blue';

    // Check if black word was revealed
    const blackIndex = wordColorsArray.findIndex((c: string) => c === 'black');
    if (blackIndex !== -1 && revealedArray[blackIndex]) {
      // The team that was playing when black was revealed loses
      const losingTeam = game.currentTurn as 'red' | 'blue';
      const winner: 'red' | 'blue' = losingTeam === 'red' ? 'blue' : 'red';
      return { winner, reason: 'black_word' };
    }

    return this.checkWinConditionFromState(words, wordColorsArray, revealedArray, startingTeam);
  }

  /**
   * Reset and create a new game for a lobby
   */
  async resetGame(lobbyId: string): Promise<Game> {
    // Simply create a new game - this will delete the old one
    return this.createGame(lobbyId);
  }
}
