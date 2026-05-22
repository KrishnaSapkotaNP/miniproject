import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

console.log(process.env.DATABASE_URL);

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export default pool;