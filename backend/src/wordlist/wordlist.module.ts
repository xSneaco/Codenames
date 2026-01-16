import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { WordlistController } from './wordlist.controller';
import { WordlistService } from './wordlist.service';

@Module({
  imports: [DatabaseModule],
  controllers: [WordlistController],
  providers: [WordlistService],
  exports: [WordlistService],
})
export class WordlistModule {}
