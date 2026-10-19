import { Pool, type QueryResultRow } from 'pg';
import { env } from './env';

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL client error:', err);
});

const schema = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`;

/** Creates the users table if it does not exist yet. */
export const initDb = async (): Promise<void> => {
  await pool.query(schema);
};

export interface UserRow extends QueryResultRow {
  id: number;
  name: string;
  email: string;
  created_at: Date;
}
