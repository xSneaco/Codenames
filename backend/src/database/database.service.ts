import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../db/schema';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private pool: Pool;
  public db: NodePgDatabase<typeof schema>;

  constructor() {
    this.pool = new Pool({
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      user: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
      database: process.env.DATABASE_NAME || 'codenames',
    });

    this.db = drizzle(this.pool, { schema });
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  getDb(): NodePgDatabase<typeof schema> {
    return this.db;
  }
}
