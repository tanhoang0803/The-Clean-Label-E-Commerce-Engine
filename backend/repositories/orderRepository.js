const pool = require('../config/db');

/**
 * Creates a new order record.
 *
 * @param {object} data
 * @param {number} data.user_id
 * @param {string} data.stripe_session_id
 * @param {number} data.total_amount
 * @param {string} [data.status] - Defaults to 'pending'
 * @returns {Promise<object>}
 */
async function createOrder(data) {
  const { user_id, stripe_session_id, total_amount, status = 'pending' } = data;

  const { rows } = await pool.query(
    `INSERT INTO orders (user_id, stripe_session_id, status, total_amount)
     VALUES ($1, $2, $3, $4)
     RETURNING id, user_id, stripe_session_id, status, total_amount, created_at`,
    [user_id, stripe_session_id, status, total_amount]
  );

  return rows[0];
}

/**
 * Creates order_items rows for a given order.
 *
 * @param {number} order_id
 * @param {Array<{ product_id: number, quantity: number, unit_price: number }>} items
 * @returns {Promise<object[]>}
 */
async function createOrderItems(order_id, items) {
  const insertedItems = [];

  for (const item of items) {
    const { rows } = await pool.query(
      `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
       VALUES ($1, $2, $3, $4)
       RETURNING id, order_id, product_id, quantity, unit_price`,
      [order_id, item.product_id, item.quantity, item.unit_price]
    );
    insertedItems.push(rows[0]);
  }

  return insertedItems;
}

/**
 * Updates the status of an order by its Stripe session ID.
 * Called from the webhook handler after payment confirmation.
 *
 * @param {string} stripe_session_id
 * @param {string} status - e.g. 'paid', 'failed', 'cancelled'
 * @returns {Promise<object|null>}
 */
async function updateStatusBySessionId(stripe_session_id, status) {
  const { rows } = await pool.query(
    `UPDATE orders SET status = $1 WHERE stripe_session_id = $2
     RETURNING id, user_id, stripe_session_id, status, total_amount, created_at`,
    [status, stripe_session_id]
  );

  return rows[0] || null;
}

/**
 * Finds all orders for a specific user.
 *
 * @param {number} user_id
 * @returns {Promise<object[]>}
 */
async function findByUserId(user_id) {
  const { rows } = await pool.query(
    `SELECT id, user_id, stripe_session_id, status, total_amount, created_at
     FROM orders
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [user_id]
  );

  return rows;
}

/**
 * Finds a single order by ID, including its items.
 *
 * @param {number} id
 * @returns {Promise<object|null>}
 */
async function findByIdWithItems(id) {
  const { rows: orderRows } = await pool.query(
    `SELECT id, user_id, stripe_session_id, status, total_amount, created_at
     FROM orders WHERE id = $1`,
    [id]
  );

  if (!orderRows[0]) return null;

  const { rows: itemRows } = await pool.query(
    `SELECT oi.id, oi.product_id, oi.quantity, oi.unit_price, p.name AS product_name
     FROM order_items oi
     LEFT JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = $1`,
    [id]
  );

  return { ...orderRows[0], items: itemRows };
}

module.exports = {
  createOrder,
  createOrderItems,
  updateStatusBySessionId,
  findByUserId,
  findByIdWithItems,
};
