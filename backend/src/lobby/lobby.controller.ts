import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  NotFoundException,
} from '@nestjs/common';
import { LobbyService } from './lobby.service';
import { CreateLobbyDto } from './dto/create-lobby.dto';

@Controller('lobbies')
export class LobbyController {
  constructor(private readonly lobbyService: LobbyService) {}

  /**
   * POST /lobbies - Create a new lobby
   */
  @Post()
  async createLobby(@Body() createLobbyDto: CreateLobbyDto) {
    const hostId = createLobbyDto.hostName || 'anonymous';
    const lobby = await this.lobbyService.createLobby(hostId);
    return {
      id: lobby.id,
      status: lobby.status,
      createdAt: lobby.createdAt,
    };
  }

  /**
   * GET /lobbies/:id - Get lobby details
   */
  @Get(':id')
  async getLobby(@Param('id') id: string) {
    const lobby = await this.lobbyService.getLobby(id.toUpperCase());
    if (!lobby) {
      throw new NotFoundException(`Lobby with ID ${id} not found`);
    }
    return lobby;
  }

  /**
   * GET /lobbies/:id/players - Get players in lobby
   */
  @Get(':id/players')
  async getPlayers(@Param('id') id: string) {
    const lobby = await this.lobbyService.getLobby(id.toUpperCase());
    if (!lobby) {
      throw new NotFoundException(`Lobby with ID ${id} not found`);
    }
    const players = await this.lobbyService.getPlayers(id.toUpperCase());
    return players;
  }
}
