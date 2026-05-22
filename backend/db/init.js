import pool from './db.js';

const initializeDB = async () => {
  try {
    await pool.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE,
        password VARCHAR(255),
        role TEXT DEFAULT 'viewer' CHECK (role IN ('viewer', 'creator', 'admin')),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id BIGSERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        github_link TEXT NOT NULL,
        demo_link TEXT,
        description TEXT,
        tech_stack TEXT,
        price NUMERIC,
        creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        upvotes INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS creator_requests (
        id BIGSERIAL PRIMARY KEY,
        user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        sample_work_link TEXT NOT NULL,
        message TEXT,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await pool.query('ALTER TABLE projects ADD COLUMN IF NOT EXISTS demo_link TEXT');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255)');

    console.log('Database initialized successfully for Supabase-compatible schema');
  } catch (err) {
    console.error('Database initialization error:', err);
  }
};

export default initializeDB;
