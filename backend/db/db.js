import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: new URL('../.env', import.meta.url) });

const buildConnectionString = () => {
  const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } = process.env;
  if (!DB_HOST || !DB_NAME || !DB_USER) {
    return null;
  }

  const port = DB_PORT || '5432';
  const user = encodeURIComponent(DB_USER);
  const password = DB_PASSWORD ? `:${encodeURIComponent(DB_PASSWORD)}` : '';
  return `postgresql://${user}${password}@${DB_HOST}:${port}/${DB_NAME}`;
};

const connectionString = process.env.DATABASE_URL || buildConnectionString();

if (!connectionString) {
  throw new Error('Missing database config: set DATABASE_URL or DB_HOST/DB_NAME/DB_USER.');
}

const shouldUseSsl = () => {
  if (process.env.DB_SSL === 'true') return true;
  if (process.env.DB_SSL === 'false') return false;
  return /supabase|render|railway|neon|sslmode=require/i.test(connectionString);
};

const pool = new pg.Pool({
  connectionString,
  ssl: shouldUseSsl() ? { rejectUnauthorized: false } : false
});

export default pool;