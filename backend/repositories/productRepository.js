const pool = require('../config/db');

/**
 * Creates a new product record.
 *
 * @param {object} data
 * @returns {Promise<object>} The inserted product row
 */
async function create(data) {
  const {
    name, description, price, image_url,
    ingredients, is_safe, ai_reason, ai_checked_at, created_by,
  } = data;

  const { rows } = await pool.query(
    `INSERT INTO products
       (name, description, price, image_url, ingredients, is_safe, ai_reason, ai_checked_at, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id, name, description, price, image_url, ingredients, is_safe, ai_reason, ai_checked_at, created_by, created_at`,
    [name, description, price, image_url, ingredients, is_safe, ai_reason, ai_checked_at, created_by]
  );

  return rows[0];
}

/**
 * Returns all products, optionally filtered to safe-only.
 *
 * @param {object} [filters]
 * @param {boolean} [filters.safe_only]
 * @returns {Promise<object[]>}
 */
async function findAll(filters = {}) {
  let query = `
    SELECT id, name, description, price, image_url, ingredients,
           is_safe, ai_reason, ai_checked_at, created_by, created_at
    FROM products
  `;
  const params = [];

  if (filters.safe_only === true || filters.safe_only === 'true') {
    query += ' WHERE is_safe = $1';
    params.push(true);
  }

  query += ' ORDER BY created_at DESC';

  const { rows } = await pool.query(query, params);
  return rows;
}

/**
 * Finds a single product by primary key.
 *
 * @param {number} id
 * @returns {Promise<object|null>}
 */
async function findById(id) {
  const { rows } = await pool.query(
    `SELECT id, name, description, price, image_url, ingredients,
            is_safe, ai_reason, ai_checked_at, created_by, created_at
     FROM products
     WHERE id = $1`,
    [id]
  );

  return rows[0] || null;
}

/**
 * Updates a product record by ID.
 *
 * @param {number} id
 * @param {object} updates - Partial product fields to update
 * @returns {Promise<object|null>}
 */
async function update(id, updates) {
  const allowedFields = ['name', 'description', 'price', 'image_url', 'ingredients', 'is_safe', 'ai_reason'];
  const setClauses = [];
  const params = [];
  let paramIndex = 1;

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      setClauses.push(`${field} = $${paramIndex}`);
      params.push(updates[field]);
      paramIndex++;
    }
  }

  if (setClauses.length === 0) return findById(id);

  params.push(id);
  const { rows } = await pool.query(
    `UPDATE products SET ${setClauses.join(', ')} WHERE id = $${paramIndex}
     RETURNING id, name, description, price, image_url, ingredients, is_safe, ai_reason, ai_checked_at, created_by, created_at`,
    params
  );

  return rows[0] || null;
}

/**
 * Deletes a product by ID.
 *
 * @param {number} id
 * @returns {Promise<boolean>} true if a row was deleted
 */
async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM products WHERE id = $1', [id]);
  return rowCount > 0;
}

module.exports = { create, findAll, findById, update, remove };
