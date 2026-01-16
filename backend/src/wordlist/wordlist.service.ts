import { Injectable, BadRequestException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DatabaseService } from '../database/database.service';
import { wordlists, lobbies, Wordlist, NewWordlist } from '../db/schema';
import { DEFAULT_WORDLIST } from '../common/default-wordlist';

@Injectable()
export class WordlistService {
  private readonly MIN_WORDS = 25;

  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Upload a custom wordlist for a lobby
   */
  async uploadWordlist(
    lobbyId: string,
    file: Express.Multer.File,
    uploadedBy: string,
  ): Promise<Wordlist> {
    const db = this.databaseService.getDb();

    // Check if lobby exists
    const lobby = await db.query.lobbies.findFirst({
      where: eq(lobbies.id, lobbyId),
    });

    if (!lobby) {
      throw new BadRequestException('Lobby not found');
    }

    // Parse the file
    const words = this.parseWordlistFile(file);

    // Validate the wordlist
    if (!this.validateWordlist(words)) {
      throw new BadRequestException(
        `Wordlist must contain at least ${this.MIN_WORDS} words`,
      );
    }

    // Sanitize words
    const sanitizedWords = this.sanitizeWords(words);

    // Delete existing wordlist if any
    await this.deleteWordlist(lobbyId);

    // Insert new wordlist
    const newWordlist: NewWordlist = {
      lobbyId,
      words: sanitizedWords,
      uploadedBy: this.sanitizeInput(uploadedBy),
    };

    const [wordlist] = await db
      .insert(wordlists)
      .values(newWordlist)
      .returning();

    // Update lobby with wordlist ID
    await db
      .update(lobbies)
      .set({ wordlistId: wordlist.id })
      .where(eq(lobbies.id, lobbyId));

    return wordlist;
  }

  /**
   * Get wordlist for a lobby (custom or default)
   */
  async getWordlist(lobbyId: string): Promise<string[]> {
    const db = this.databaseService.getDb();

    // Try to get custom wordlist
    const customWordlist = await db.query.wordlists.findFirst({
      where: eq(wordlists.lobbyId, lobbyId),
    });

    if (customWordlist && customWordlist.words) {
      return customWordlist.words;
    }

    // Return default wordlist
    return DEFAULT_WORDLIST;
  }

  /**
   * Get wordlist entity for a lobby
   */
  async getWordlistEntity(lobbyId: string): Promise<Wordlist | null> {
    const db = this.databaseService.getDb();
    const wordlist = await db.query.wordlists.findFirst({
      where: eq(wordlists.lobbyId, lobbyId),
    });
    return wordlist ?? null;
  }

  /**
   * Parse wordlist file (.txt or .csv)
   */
  parseWordlistFile(file: Express.Multer.File): string[] {
    const content = file.buffer.toString('utf-8');
    const filename = file.originalname.toLowerCase();

    let words: string[];

    if (filename.endsWith('.csv')) {
      // Handle CSV: split by commas and newlines
      words = content
        .split(/[,\n\r]+/)
        .map((word: string) => word.trim())
        .filter((word: string) => word.length > 0);
    } else {
      // Handle TXT: split by newlines
      words = content
        .split(/[\n\r]+/)
        .map((word: string) => word.trim())
        .filter((word: string) => word.length > 0);
    }

    return words;
  }

  /**
   * Validate wordlist has minimum required words
   */
  validateWordlist(words: string[]): boolean {
    return words.length >= this.MIN_WORDS;
  }

  /**
   * Delete custom wordlist for a lobby
   */
  async deleteWordlist(lobbyId: string): Promise<void> {
    const db = this.databaseService.getDb();

    // Remove wordlist reference from lobby
    await db
      .update(lobbies)
      .set({ wordlistId: null })
      .where(eq(lobbies.id, lobbyId));

    // Delete wordlist entries
    await db.delete(wordlists).where(eq(wordlists.lobbyId, lobbyId));
  }

  /**
   * Sanitize words array to prevent XSS and clean data
   */
  private sanitizeWords(words: string[]): string[] {
    return words
      .map((word) => this.sanitizeInput(word))
      .filter((word) => word.length > 0)
      .map((word) => word.toUpperCase())
      .filter((word, index, self) => self.indexOf(word) === index); // Remove duplicates
  }

  /**
   * Sanitize user input to prevent XSS
   */
  private sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .slice(0, 50); // Limit word length
  }
}
