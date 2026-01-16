import { Module, forwardRef } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { LobbyController } from './lobby.controller';
import { LobbyService } from './lobby.service';
import { LobbyGateway } from './lobby.gateway';
import { GameModule } from '../game/game.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => GameModule)],
  controllers: [LobbyController],
  providers: [LobbyService, LobbyGateway],
  exports: [LobbyService],
})
export class LobbyModule {}
