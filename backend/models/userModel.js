import pool from '../db/db.js';

export const createUser = async (
  id,
  name,
  email,
  role = 'viewer'
) => {

  const result = await pool.query(
    `
    INSERT INTO users (id, name, email, role)
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
    [id, name, email, role]
  );

  return result.rows[0];
};

export const getUserByEmail = async (email) => {

  const result = await pool.query(
    `
    SELECT *
    FROM users
    WHERE email = $1
    `,
    [email]
  );

  return result.rows[0];
};

export const getUserById = async (id) => {

  const result = await pool.query(
    `
    SELECT id, name, email, role
    FROM users
    WHERE id = $1
    `,
    [id]
  );

  return result.rows[0];
};

export const getAllUsers = async () => {

  const result = await pool.query(
    `
    SELECT id, name, email, role
    FROM users
    ORDER BY created_at DESC
    `
  );

  return result.rows;
};

export const updateUserRole = async (
  userId,
  role
) => {

  const result = await pool.query(
    `
    UPDATE users
    SET role = $1
    WHERE id = $2
    RETURNING *
    `,
    [role, userId]
  );

  return result.rows[0];
};