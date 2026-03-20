-- Clean Label E-Commerce — Initial Schema
-- Run: psql clean_label_db < backend/db/migrations/001_init.sql

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(20) DEFAULT 'user',
  created_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id             SERIAL PRIMARY KEY,
  name           VARCHAR(255) NOT NULL,
  description    TEXT,
  price          DECIMAL(10, 2) NOT NULL,
  image_url      TEXT,
  ingredients    TEXT NOT NULL,
  is_safe        BOOLEAN,
  ai_reason      TEXT,
  ai_checked_at  TIMESTAMP,
  created_by     INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at     TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id                SERIAL PRIMARY KEY,
  user_id           INTEGER REFERENCES users(id) ON DELETE SET NULL,
  stripe_session_id VARCHAR(255),
  status            VARCHAR(50) DEFAULT 'pending',
  total_amount      DECIMAL(10, 2),
  created_at        TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id          SERIAL PRIMARY KEY,
  order_id    INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id  INTEGER REFERENCES products(id) ON DELETE SET NULL,
  quantity    INTEGER NOT NULL,
  unit_price  DECIMAL(10, 2) NOT NULL
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_products_is_safe ON products(is_safe);
CREATE INDEX IF NOT EXISTS idx_products_created_by ON products(created_by);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id ON orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
