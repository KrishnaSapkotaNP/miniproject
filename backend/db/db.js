import dotenv from 'dotenv';
dotenv.config();
import postgres from 'postgres';
const connectionString = process.env.DATABASE_URL;

const sql = connectionString
  ? postgres(connectionString, { ssl: 'require' })
  : postgres({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

const pool = {
  query: async (text, params) => {
    const rows = await sql.unsafe(text, params);
    return { rows };
  },
};

export default pool;
