import {
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Injectable } from '@nestjs/common';
import { GameService } from './game.service';
import { LobbyService } from '../lobby/lobby.service';
import { RevealWordDto } from './dto/reveal-word.dto';
import { GetGameStateDto, EndTurnDto, NewGameDto } from './dto/game-state.dto';

@Injectable()
export class GameGateway {
  public server!: Server;

  private readonly logger = new Logger(GameGateway.name);

  constructor(
    private readonly gameService: GameService,
    private readonly lobbyService: LobbyService,
  ) {}

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

      // Get player to determine role
      const player = await this.lobbyService.getPlayerBySocketId(client.id);
      const isSpymaster = player?.role === 'spymaster';

      const gameState = await this.gameService.getGameState(normalizedLobbyId, isSpymaster);

      return {
        success: true,
        gameState,
      };
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
    @MessageBody() data: RevealWordDto,
  ): Promise<{ success: boolean; result?: any; error?: string }> {
    try {
      const { lobbyId, word } = data;
      const normalizedLobbyId = lobbyId.toUpperCase();

      // Get player info
      const player = await this.lobbyService.getPlayerBySocketId(client.id);
      if (!player) {
        return { success: false, error: 'Player not found' };
      }

      // Only operatives can reveal words
      if (player.role === 'spymaster') {
        return { success: false, error: 'Spymasters cannot reveal words' };
      }

      // Get current game to check if it's player's team's turn
      const game = await this.gameService.getGame(normalizedLobbyId);
      if (!game) {
        return { success: false, error: 'Game not found' };
      }

      if (player.team !== game.currentTurn) {
        return { success: false, error: 'It is not your team\'s turn' };
      }

      // Reveal the word
      const result = await this.gameService.revealWord(
        normalizedLobbyId,
        word,
        player.team,
      );

      // Emit word revealed event to room
      this.server.to(normalizedLobbyId).emit('wordRevealed', {
        word: result.word,
        color: result.color,
        isCorrect: result.isCorrect,
        revealedBy: player.name,
        team: player.team,
      });

      // Check if turn changed
      if (!result.isCorrect && !result.gameOver) {
        const newTurn = game.currentTurn === 'red' ? 'blue' : 'red';
        this.server.to(normalizedLobbyId).emit('turnChanged', {
          currentTurn: newTurn,
          reason: result.color === 'neutral' ? 'neutral_word' : 'opponent_word',
        });
      }

      // Check if game is over
      if (result.gameOver) {
        this.server.to(normalizedLobbyId).emit('gameOver', {
          winner: result.winner,
          reason: result.reason,
        });
      }

      this.logger.log(
        `Word "${word}" revealed in lobby ${normalizedLobbyId} - Color: ${result.color}, Correct: ${result.isCorrect}`,
      );

      return {
        success: true,
        result,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error revealing word: ${errorMessage}`);
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

      // Get player info
      const player = await this.lobbyService.getPlayerBySocketId(client.id);
      if (!player) {
        return { success: false, error: 'Player not found' };
      }

      // Get current game to check if it's player's team's turn
      const game = await this.gameService.getGame(normalizedLobbyId);
      if (!game) {
        return { success: false, error: 'Game not found' };
      }

      if (player.team !== game.currentTurn) {
        return { success: false, error: 'It is not your team\'s turn' };
      }

      // End the turn
      await this.gameService.endTurn(normalizedLobbyId);

      const newTurn = game.currentTurn === 'red' ? 'blue' : 'red';

      // Emit turn changed event to room
      this.server.to(normalizedLobbyId).emit('turnChanged', {
        currentTurn: newTurn,
        reason: 'manual_end',
      });

      this.logger.log(`Turn ended in lobby ${normalizedLobbyId} - New turn: ${newTurn}`);

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error ending turn: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Handle new game request (reset game)
   */
  @SubscribeMessage('newGame')
  async handleNewGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: NewGameDto,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { lobbyId } = data;
      const normalizedLobbyId = lobbyId.toUpperCase();

      // Get player info to check if they're the host
      const player = await this.lobbyService.getPlayerBySocketId(client.id);
      if (!player) {
        return { success: false, error: 'Player not found' };
      }

      if (!player.isHost) {
        return { success: false, error: 'Only the host can start a new game' };
      }

      // Reset the game
      const newGame = await this.gameService.resetGame(normalizedLobbyId);

      // Emit game reset event to room
      this.server.to(normalizedLobbyId).emit('gameReset', {
        startingTeam: newGame.startingTeam,
        currentTurn: newGame.currentTurn,
      });

      // Also emit gameStarted for clients that listen to that
      this.server.to(normalizedLobbyId).emit('gameStarted', {
        startingTeam: newGame.startingTeam,
        currentTurn: newGame.currentTurn,
      });

      this.logger.log(`New game started in lobby ${normalizedLobbyId}`);

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error starting new game: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Start a game (called from lobby when host starts)
   */
  async startGame(lobbyId: string): Promise<void> {
    try {
      const game = await this.gameService.createGame(lobbyId);

      // Emit game started event to room
      this.server.to(lobbyId).emit('gameStarted', {
        startingTeam: game.startingTeam,
        currentTurn: game.currentTurn,
      });

      this.logger.log(`Game started in lobby ${lobbyId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error starting game: ${errorMessage}`);
      throw error;
    }
  }
}
