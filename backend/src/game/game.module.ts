import { Module, forwardRef } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { WordlistModule } from '../wordlist/wordlist.module';
import { LobbyModule } from '../lobby/lobby.module';
import { GameService } from './game.service';

@Module({
  imports: [DatabaseModule, WordlistModule, forwardRef(() => LobbyModule)],
  providers: [GameService],
  exports: [GameService],
})
export class GameModule {}
