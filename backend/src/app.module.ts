import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { LobbyModule } from './lobby/lobby.module';
import { GameModule } from './game/game.module';
import { WordlistModule } from './wordlist/wordlist.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [DatabaseModule, LobbyModule, GameModule, WordlistModule, HealthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
