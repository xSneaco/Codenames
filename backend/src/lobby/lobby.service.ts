import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DatabaseService } from '../database/database.service';
import { lobbies, players, Lobby, Player, NewLobby, NewPlayer } from '../db/schema';

@Injectable()
export class LobbyService {
  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Generate a random 6-character alphanumeric lobby ID
   */
  generateLobbyId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Create a new lobby with a unique ID
   */
  async createLobby(hostId: string): Promise<Lobby> {
    const db = this.databaseService.getDb();
    
    // Generate unique lobby ID
    let lobbyId: string;
    let existingLobby: Lobby | undefined;
    
    do {
      lobbyId = this.generateLobbyId();
      existingLobby = await db.query.lobbies.findFirst({
        where: eq(lobbies.id, lobbyId),
      });
    } while (existingLobby);

    const newLobby: NewLobby = {
      id: lobbyId,
      status: 'waiting',
    };

    const [lobby] = await db.insert(lobbies).values(newLobby).returning();
    return lobby;
  }

  /**
   * Get lobby by ID
   */
  async getLobby(id: string): Promise<Lobby | null> {
    const db = this.databaseService.getDb();
    const lobby = await db.query.lobbies.findFirst({
      where: eq(lobbies.id, id),
    });
    return lobby ?? null;
  }

  /**
   * Get all players in a lobby
   */
  async getPlayers(lobbyId: string): Promise<Player[]> {
    const db = this.databaseService.getDb();
    return db.query.players.findMany({
      where: eq(players.lobbyId, lobbyId),
    });
  }

  /**
   * Add a player to a lobby
   */
  async addPlayer(
    lobbyId: string,
    name: string,
    socketId: string,
  ): Promise<Player> {
    const db = this.databaseService.getDb();

    // Check if this is the first player (will be host)
    const existingPlayers = await this.getPlayers(lobbyId);
    const isHost = existingPlayers.length === 0;

    const newPlayer: NewPlayer = {
      lobbyId,
      name,
      socketId,
      isHost,
    };

    const [player] = await db.insert(players).values(newPlayer).returning();

    // Update lobby hostId if this is the first player
    if (isHost) {
      await db
        .update(lobbies)
        .set({ hostId: player.id })
        .where(eq(lobbies.id, lobbyId));
    }

    return player;
  }

  /**
   * Remove a player by socket ID
   */
  async removePlayer(socketId: string): Promise<void> {
    const db = this.databaseService.getDb();
    await db.delete(players).where(eq(players.socketId, socketId));
  }

  /**
   * Update a player's team
   */
  async updatePlayerTeam(playerId: number, team: string): Promise<void> {
    const db = this.databaseService.getDb();
    await db
      .update(players)
      .set({ team })
      .where(eq(players.id, playerId));
  }

  /**
   * Update a player's role (spymaster/operative)
   */
  async updatePlayerRole(playerId: number, role: string): Promise<void> {
    const db = this.databaseService.getDb();
    await db
      .update(players)
      .set({ role })
      .where(eq(players.id, playerId));
  }

  /**
   * Get player by socket ID
   */
  async getPlayerBySocketId(socketId: string): Promise<Player | null> {
    const db = this.databaseService.getDb();
    const player = await db.query.players.findFirst({
      where: eq(players.socketId, socketId),
    });
    return player ?? null;
  }

  /**
   * Get player by ID
   */
  async getPlayerById(playerId: number): Promise<Player | null> {
    const db = this.databaseService.getDb();
    const player = await db.query.players.findFirst({
      where: eq(players.id, playerId),
    });
    return player ?? null;
  }

  /**
   * Check if a player is the host of a lobby
   */
  async isHost(socketId: string, lobbyId: string): Promise<boolean> {
    const player = await this.getPlayerBySocketId(socketId);
    if (!player) return false;
    return player.isHost && player.lobbyId === lobbyId;
  }

  /**
   * Update lobby status
   */
  async updateLobbyStatus(lobbyId: string, status: string): Promise<void> {
    const db = this.databaseService.getDb();
    await db
      .update(lobbies)
      .set({ status })
      .where(eq(lobbies.id, lobbyId));
  }
}
