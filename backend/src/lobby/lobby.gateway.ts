import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { LobbyService } from './lobby.service';
import { GameService } from '../game/game.service';
import { JoinLobbyDto } from './dto/join-lobby.dto';
import { RevealWordDto } from '../game/dto/reveal-word.dto';
import { GetGameStateDto, EndTurnDto, NewGameDto } from '../game/dto/game-state.dto';

interface SelectTeamPayload {
  playerId: number;
  team: 'red' | 'blue';
}

interface SelectRolePayload {
  playerId: number;
  role: 'spymaster' | 'operative';
}

interface StartGamePayload {
  lobbyId: string;
}

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class LobbyGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(LobbyGateway.name);

  constructor(
    private readonly lobbyService: LobbyService,
    private readonly gameService: GameService,
  ) {}

  /**
   * Handle new socket connection
   */
  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
  }

  /**
   * Handle socket disconnection - remove player and notify room
   */
  async handleDisconnect(client: Socket): Promise<void> {
    this.logger.log(`Client disconnected: ${client.id}`);

    const player = await this.lobbyService.getPlayerBySocketId(client.id);
    if (player) {
      await this.lobbyService.removePlayer(client.id);
      this.server.to(player.lobbyId).emit('playerLeft', {
        playerId: player.id,
        playerName: player.name,
      });
    }
  }

  /**
   * Handle player joining a lobby
   */
  @SubscribeMessage('joinLobby')
  async handleJoinLobby(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinLobbyDto,
  ): Promise<{ success: boolean; player?: any; error?: string }> {
    const { lobbyId, playerName } = data;
    const normalizedLobbyId = lobbyId.toUpperCase();

    try {
      // Check if lobby exists
      const lobby = await this.lobbyService.getLobby(normalizedLobbyId);
      if (!lobby) {
        return { success: false, error: 'Lobby not found' };
      }

      // Check if lobby is in waiting status
      if (lobby.status !== 'waiting') {
        return { success: false, error: 'Game has already started' };
      }

      // Sanitize player name
      const sanitizedName = this.sanitizeInput(playerName);
      if (!sanitizedName || sanitizedName.length === 0) {
        return { success: false, error: 'Invalid player name' };
      }

      // Add player to database
      const player = await this.lobbyService.addPlayer(
        normalizedLobbyId,
        sanitizedName,
        client.id,
      );

      // Join the socket room
      client.join(normalizedLobbyId);

      // Get all players in the lobby
      const allPlayers = await this.lobbyService.getPlayers(normalizedLobbyId);

      // Notify other players in the room
      client.to(normalizedLobbyId).emit('playerJoined', {
        id: player.id,
        name: player.name,
        team: player.team,
        role: player.role,
        isHost: player.isHost,
      });

      this.logger.log(`Player ${sanitizedName} joined lobby ${normalizedLobbyId}`);

      // Emit joined event to the connecting client with player and lobby data
      client.emit('joined', {
        player: {
          id: player.id,
          name: player.name,
          team: player.team,
          role: player.role,
          isHost: player.isHost,
          lobbyId: player.lobbyId,
        },
        lobby: {
          id: normalizedLobbyId,
          players: allPlayers.map(p => ({
            id: p.id,
            name: p.name,
            team: p.team,
            role: p.role,
            isHost: p.isHost,
          })),
          gameState: null,
        },
      });

      return {
        success: true,
        player: {
          id: player.id,
          name: player.name,
          team: player.team,
          role: player.role,
          isHost: player.isHost,
          lobbyId: player.lobbyId,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error joining lobby: ${errorMessage}`);
      return { success: false, error: 'Failed to join lobby' };
    }
  }

  /**
   * Handle player leaving a lobby
   */
  @SubscribeMessage('leaveLobby')
  async handleLeaveLobby(
    @ConnectedSocket() client: Socket,
  ): Promise<{ success: boolean }> {
    const player = await this.lobbyService.getPlayerBySocketId(client.id);
    
    if (player) {
      const lobbyId = player.lobbyId;
      
      // Remove player from database
      await this.lobbyService.removePlayer(client.id);
      
      // Leave the socket room
      client.leave(lobbyId);
      
      // Notify other players
      this.server.to(lobbyId).emit('playerLeft', {
        playerId: player.id,
        playerName: player.name,
      });

      this.logger.log(`Player ${player.name} left lobby ${lobbyId}`);
    }

    return { success: true };
  }

  /**
   * Handle team selection
   */
  @SubscribeMessage('selectTeam')
  async handleSelectTeam(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SelectTeamPayload,
  ): Promise<{ success: boolean; error?: string }> {
    const { playerId, team } = data;

    // Validate team value
    if (!['red', 'blue'].includes(team)) {
      return { success: false, error: 'Invalid team' };
    }

    try {
      const player = await this.lobbyService.getPlayerById(playerId);
      if (!player) {
        return { success: false, error: 'Player not found' };
      }

      // Verify the requesting socket owns this player
      const requestingPlayer = await this.lobbyService.getPlayerBySocketId(client.id);
      if (!requestingPlayer || requestingPlayer.id !== playerId) {
        return { success: false, error: 'Unauthorized' };
      }

      await this.lobbyService.updatePlayerTeam(playerId, team);

      // Notify all players in the lobby
      this.server.to(player.lobbyId).emit('teamUpdated', {
        playerId,
        team,
      });

      this.logger.log(`Player ${playerId} selected team ${team}`);

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error selecting team: ${errorMessage}`);
      return { success: false, error: 'Failed to update team' };
    }
  }

  /**
   * Handle role selection (spymaster/operative)
   */
  @SubscribeMessage('selectRole')
  async handleSelectRole(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SelectRolePayload,
  ): Promise<{ success: boolean; error?: string }> {
    const { playerId, role } = data;

    // Validate role value
    if (!['spymaster', 'operative'].includes(role)) {
      return { success: false, error: 'Invalid role' };
    }

    try {
      const player = await this.lobbyService.getPlayerById(playerId);
      if (!player) {
        return { success: false, error: 'Player not found' };
      }

      // Verify the requesting socket owns this player
      const requestingPlayer = await this.lobbyService.getPlayerBySocketId(client.id);
      if (!requestingPlayer || requestingPlayer.id !== playerId) {
        return { success: false, error: 'Unauthorized' };
      }

      await this.lobbyService.updatePlayerRole(playerId, role);

      // Notify all players in the lobby
      this.server.to(player.lobbyId).emit('roleUpdated', {
        playerId,
        role,
      });

      this.logger.log(`Player ${playerId} selected role ${role}`);

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error selecting role: ${errorMessage}`);
      return { success: false, error: 'Failed to update role' };
    }
  }

  /**
   * Handle game start request (host only)
   */
  @SubscribeMessage('startGame')
  async handleStartGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: StartGamePayload,
  ): Promise<{ success: boolean; error?: string }> {
    const { lobbyId } = data;
    const normalizedLobbyId = lobbyId.toUpperCase();

    try {
      // Verify the requesting player is the host
      const isHost = await this.lobbyService.isHost(client.id, normalizedLobbyId);
      if (!isHost) {
        return { success: false, error: 'Only the host can start the game' };
      }

      // Get all players and validate
      const players = await this.lobbyService.getPlayers(normalizedLobbyId);
      if (players.length < 4) {
        return { success: false, error: 'At least 4 players are required' };
      }

      // Check team composition
      const redTeam = players.filter((p) => p.team === 'red');
      const blueTeam = players.filter((p) => p.team === 'blue');
      
      if (redTeam.length === 0 || blueTeam.length === 0) {
        return { success: false, error: 'Both teams must have at least one player' };
      }

      const redSpymaster = redTeam.find((p) => p.role === 'spymaster');
      const blueSpymaster = blueTeam.find((p) => p.role === 'spymaster');

      if (!redSpymaster || !blueSpymaster) {
        return { success: false, error: 'Each team must have a spymaster' };
      }

      // Update lobby status
      await this.lobbyService.updateLobbyStatus(normalizedLobbyId, 'playing');

      // Create the game
      await this.gameService.createGame(normalizedLobbyId);

      // Get game state for spymasters and operatives
      const spymasterState = await this.gameService.getGameStateForFrontend(normalizedLobbyId, true);
      const operativeState = await this.gameService.getGameStateForFrontend(normalizedLobbyId, false);

      // Emit to each player based on their role
      const sockets = await this.server.in(normalizedLobbyId).fetchSockets();
      for (const socket of sockets) {
        const player = await this.lobbyService.getPlayerBySocketId(socket.id);
        if (player) {
          const isSpymaster = player.role === 'spymaster';
          socket.emit('gameStarted', isSpymaster ? spymasterState : operativeState);
        }
      }

      this.logger.log(`Game started in lobby ${normalizedLobbyId}`);

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error starting game: ${errorMessage}`);
      return { success: false, error: 'Failed to start game' };
    }
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
      .slice(0, 50); // Limit length
  }

  // ===== GAME EVENT HANDLERS =====

  /**
   * Get game state based on player role
   */
  @SubscribeMessage('getGameState')
  async handleGetGameState(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: GetGameStateDto,
  ): Promise<{ success: boolean; gameState?: any; error?: string }> {
    try {
      const { lobbyId } = data;
      const normalizedLobbyId = lobbyId.toUpperCase();

      const player = await this.lobbyService.getPlayerBySocketId(client.id);
      const isSpymaster = player?.role === 'spymaster';

      const gameState = await this.gameService.getGameState(normalizedLobbyId, isSpymaster);

      return { success: true, gameState };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error getting game state: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Handle word reveal
   */
  @SubscribeMessage('revealWord')
  async handleRevealWord(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { lobbyId: string; position?: number; word?: string },
  ): Promise<{ success: boolean; result?: any; error?: string }> {
    try {
      const { lobbyId, position, word: inputWord } = data;
      const normalizedLobbyId = lobbyId.toUpperCase();

      const player = await this.lobbyService.getPlayerBySocketId(client.id);
      if (!player) {
        return { success: false, error: 'Player not found' };
      }

      if (player.role === 'spymaster') {
        return { success: false, error: 'Spymasters cannot reveal words' };
      }

      const game = await this.gameService.getGame(normalizedLobbyId);
      if (!game) {
        return { success: false, error: 'Game not found' };
      }

      if (player.team !== game.currentTurn) {
        return { success: false, error: 'It is not your team\'s turn' };
      }

      // Resolve word from position if provided
      let word: string;
      if (position !== undefined) {
        if (position < 0 || position >= game.words.length) {
          return { success: false, error: 'Invalid position' };
        }
        word = game.words[position];
      } else if (inputWord) {
        word = inputWord;
      } else {
        return { success: false, error: 'Either position or word is required' };
      }

      const result = await this.gameService.revealWord(normalizedLobbyId, word, player.team);

      // Emit updated game state to each player based on their role
      const spymasterState = await this.gameService.getGameStateForFrontend(normalizedLobbyId, true);
      const operativeState = await this.gameService.getGameStateForFrontend(normalizedLobbyId, false);

      const sockets = await this.server.in(normalizedLobbyId).fetchSockets();
      for (const socket of sockets) {
        const p = await this.lobbyService.getPlayerBySocketId(socket.id);
        if (p) {
          const isSpymaster = p.role === 'spymaster';
          socket.emit('gameUpdate', isSpymaster ? spymasterState : operativeState);
        }
      }

      this.server.to(normalizedLobbyId).emit('wordRevealed', {
        word: result.word,
        color: result.color,
        isCorrect: result.isCorrect,
        revealedBy: player.name,
        team: player.team,
      });

      if (!result.isCorrect && !result.gameOver) {
        // Clear hint when turn changes
        this.server.to(normalizedLobbyId).emit('turnChanged', {
          currentTurn: game.currentTurn === 'red' ? 'blue' : 'red',
          reason: result.color === 'neutral' ? 'neutral_word' : 'opponent_word',
        });
      }

      if (result.gameOver) {
        this.server.to(normalizedLobbyId).emit('gameOver', {
          winner: result.winner,
          reason: result.reason,
        });
      }

      return { success: true, result };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error revealing word: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Handle spymaster giving a hint
   */
  @SubscribeMessage('giveHint')
  async handleGiveHint(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { lobbyId: string; hint: string; number: number },
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { lobbyId, hint, number } = data;
      const normalizedLobbyId = lobbyId.toUpperCase();

      const player = await this.lobbyService.getPlayerBySocketId(client.id);
      if (!player) {
        return { success: false, error: 'Player not found' };
      }

      if (player.role !== 'spymaster') {
        return { success: false, error: 'Only spymasters can give hints' };
      }

      const game = await this.gameService.getGame(normalizedLobbyId);
      if (!game) {
        return { success: false, error: 'Game not found' };
      }

      if (player.team !== game.currentTurn) {
        return { success: false, error: 'It is not your team\'s turn' };
      }

      // Broadcast hint to all players in the lobby
      this.server.to(normalizedLobbyId).emit('hintGiven', {
        team: player.team,
        hint: hint.trim(),
        number,
        spymasterName: player.name,
      });

      this.logger.log(`Hint given in lobby ${normalizedLobbyId}: "${hint}" for ${number}`);

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error giving hint: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Handle end turn request
   */
  @SubscribeMessage('endTurn')
  async handleEndTurn(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: EndTurnDto,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { lobbyId } = data;
      const normalizedLobbyId = lobbyId.toUpperCase();

      const player = await this.lobbyService.getPlayerBySocketId(client.id);
      if (!player) {
        return { success: false, error: 'Player not found' };
      }

      const game = await this.gameService.getGame(normalizedLobbyId);
      if (!game) {
        return { success: false, error: 'Game not found' };
      }

      if (player.team !== game.currentTurn) {
        return { success: false, error: 'It is not your team\'s turn' };
      }

      await this.gameService.endTurn(normalizedLobbyId);

      // Emit updated game state to each player based on their role
      const spymasterState = await this.gameService.getGameStateForFrontend(normalizedLobbyId, true);
      const operativeState = await this.gameService.getGameStateForFrontend(normalizedLobbyId, false);

      const sockets = await this.server.in(normalizedLobbyId).fetchSockets();
      for (const socket of sockets) {
        const p = await this.lobbyService.getPlayerBySocketId(socket.id);
        if (p) {
          const isSpymaster = p.role === 'spymaster';
          socket.emit('gameUpdate', isSpymaster ? spymasterState : operativeState);
        }
      }

      this.logger.log(`Turn ended in lobby ${normalizedLobbyId}`);

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error ending turn: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Handle new game request
   */
  @SubscribeMessage('newGame')
  async handleNewGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: NewGameDto,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { lobbyId } = data;
      const normalizedLobbyId = lobbyId.toUpperCase();

      const player = await this.lobbyService.getPlayerBySocketId(client.id);
      if (!player || !player.isHost) {
        return { success: false, error: 'Only the host can start a new game' };
      }

      const newGame = await this.gameService.resetGame(normalizedLobbyId);

      this.server.to(normalizedLobbyId).emit('gameReset', {
        startingTeam: newGame.startingTeam,
        currentTurn: newGame.currentTurn,
      });

      this.server.to(normalizedLobbyId).emit('gameStarted', {
        startingTeam: newGame.startingTeam,
        currentTurn: newGame.currentTurn,
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error starting new game: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  }
}
