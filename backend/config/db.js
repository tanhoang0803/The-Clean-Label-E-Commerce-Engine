const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // In production, enable SSL:
  // ssl: { rejectUnauthorized: false }
});

pool.on('connect', () => {
  console.log('PostgreSQL pool connection established');
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err);
  process.exit(-1);
});

module.exports = pool;
