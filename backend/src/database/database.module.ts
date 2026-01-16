import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './database.service';

export const DATABASE_CONNECTION = 'DATABASE_CONNECTION';

@Global()
@Module({
  providers: [
    DatabaseService,
    {
      provide: DATABASE_CONNECTION,
      useFactory: (databaseService: DatabaseService) => databaseService.db,
      inject: [DatabaseService],
    },
  ],
  exports: [DatabaseService, DATABASE_CONNECTION],
})
export class DatabaseModule {}
