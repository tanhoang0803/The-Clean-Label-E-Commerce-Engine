const pool = require('../config/db');

/**
 * Creates a new user record.
 *
 * @param {object} data
 * @param {string} data.email
 * @param {string} data.password_hash
 * @returns {Promise<object>} The inserted user row (includes password_hash — sanitize before sending to client)
 */
async function create(data) {
  const { email, password_hash } = data;

  const { rows } = await pool.query(
    `INSERT INTO users (email, password_hash)
     VALUES ($1, $2)
     RETURNING id, email, password_hash, role, created_at`,
    [email, password_hash]
  );

  return rows[0];
}

/**
 * Finds a user by email address.
 *
 * @param {string} email
 * @returns {Promise<object|null>} User row including password_hash, or null if not found
 */
async function findByEmail(email) {
  const { rows } = await pool.query(
    `SELECT id, email, password_hash, role, created_at
     FROM users
     WHERE email = $1`,
    [email]
  );

  return rows[0] || null;
}

/**
 * Finds a user by primary key.
 *
 * @param {number} id
 * @returns {Promise<object|null>}
 */
async function findById(id) {
  const { rows } = await pool.query(
    `SELECT id, email, role, created_at
     FROM users
     WHERE id = $1`,
    [id]
  );

  return rows[0] || null;
}

/**
 * Updates a user's role.
 *
 * @param {number} id
 * @param {string} role
 * @returns {Promise<object|null>}
 */
async function updateRole(id, role) {
  const { rows } = await pool.query(
    `UPDATE users SET role = $1 WHERE id = $2
     RETURNING id, email, role, created_at`,
    [role, id]
  );

  return rows[0] || null;
}

module.exports = { create, findByEmail, findById, updateRole };
