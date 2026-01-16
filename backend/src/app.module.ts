import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { LobbyModule } from './lobby/lobby.module';
import { GameModule } from './game/game.module';
import { WordlistModule } from './wordlist/wordlist.module';

@Module({
  imports: [DatabaseModule, LobbyModule, GameModule, WordlistModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
