const { drizzle } = require('drizzle-orm/node-postgres');
const { migrate } = require('drizzle-orm/node-postgres/migrator');
const { Pool } = require('pg');

async function runMigrations() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  
  const db = drizzle(pool);
  
  await migrate(db, { migrationsFolder: './drizzle' });
  await pool.end();
  
  console.log('Migrations completed!');
}

runMigrations().catch(console.error);