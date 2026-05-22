import pool from '../db/db.js';

export const createProject = async (title, github_link, demo_link, description, tech_stack, price, creator_id) => {
  const result = await pool.query(
    'INSERT INTO projects (title, github_link, demo_link, description, tech_stack, price, creator_id, upvotes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
    [title, github_link, demo_link || null, description, tech_stack, price, creator_id, 0]
  );
  return result.rows[0];
};

export const getAllProjects = async () => (await pool.query('SELECT * FROM projects ORDER BY id DESC')).rows;
export const getProjectById = async (id) => (await pool.query('SELECT * FROM projects WHERE id = $1', [id])).rows[0];
export const getProjectsByCreator = async (creator_id) => (await pool.query('SELECT * FROM projects WHERE creator_id = $1 ORDER BY id DESC', [creator_id])).rows;
export const upvoteProject = async (project_id) => (await pool.query('UPDATE projects SET upvotes = upvotes + 1 WHERE id = $1 RETURNING *', [project_id])).rows[0];
export const deleteProject = async (id) => { await pool.query('DELETE FROM projects WHERE id = $1', [id]); };

export const updateProject = async (id, title, description, price, tech_stack, demo_link) => {
  const result = await pool.query(
    'UPDATE projects SET title = $1, description = $2, price = $3, tech_stack = $4, demo_link = COALESCE($5, demo_link) WHERE id = $6 RETURNING *',
    [title, description, price, tech_stack, demo_link ?? null, id]
  );
  return result.rows[0];
};
