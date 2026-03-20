# The Clean Label E-Commerce Engine

An AI-powered marketplace that audits product ingredients for clean-label compliance before listing them for sale. Built with React, Express, PostgreSQL, OpenAI, and Stripe.

---

## Project Overview

The Clean Label E-Commerce Engine is a full-stack web application that lets vendors submit products with ingredient lists. Before a product is saved to the database, an OpenAI-powered auditor scans the ingredients for harmful substances (synthetic dyes, parabens, SLS, alcohol derivatives, acidic pH agents). Only products passing the audit are listed publicly. Shoppers can browse safe products, view the AI audit report, and check out via Stripe.

This project demonstrates end-to-end integration of:
- AI as a data validation layer (not just a chatbot)
- Layered backend architecture (Controller → Service → Repository)
- Secure JWT authentication
- Stripe Checkout with webhook confirmation

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Redux Toolkit, React Router v6, Axios |
| Backend | Node.js, Express 4 |
| Database | PostgreSQL (via `pg` connection pool) |
| AI | OpenAI Chat Completions API (GPT-4) |
| Payments | Stripe Checkout + Webhooks |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Dev tooling | nodemon, react-scripts |

---

## Key Features

### AI Ingredient Audit
Every product submission triggers an OpenAI call that checks for:
- Alcohol derivatives (ethanol, isopropanol)
- High-concentration acidic agents (citric acid >5%, phosphoric acid)
- Synthetic dyes
- Parabens
- Sodium Lauryl Sulfate (SLS)

The AI returns `{ is_safe: boolean, reason: string, flagged_ingredients: string[] }`. This result is stored alongside the product record so it is auditable and never re-computed on each page load.

### REST API
Full CRUD for products, authentication (register/login), and order management with Stripe session creation and webhook handling.

### Stripe Payment Flow
Cart items are sent to the backend which creates a Stripe Checkout Session. The frontend redirects to Stripe-hosted checkout. On success, Stripe fires a webhook that the backend uses to confirm and update the order status.

---

## Project Structure

```
the_clean_label_e_commerce/
├── README.md
├── CLAUDE.md
├── .gitignore
├── backend/
│   ├── package.json
│   ├── .env.example
│   ├── server.js                        # Express app entry point
│   ├── config/
│   │   └── db.js                        # PostgreSQL pool
│   ├── routes/
│   │   ├── products.js
│   │   ├── auth.js
│   │   └── orders.js
│   ├── controllers/
│   │   ├── productController.js
│   │   ├── authController.js
│   │   └── orderController.js
│   ├── services/
│   │   ├── productService.js            # Orchestrates AI audit + DB write
│   │   ├── aiService.js                 # OpenAI ingredient scanner
│   │   ├── paymentService.js            # Stripe session + webhook
│   │   └── authService.js              # Register/login logic
│   ├── repositories/
│   │   ├── productRepository.js         # Raw SQL for products
│   │   ├── userRepository.js            # Raw SQL for users
│   │   └── orderRepository.js           # Raw SQL for orders
│   ├── middleware/
│   │   ├── auth.js                      # JWT verification
│   │   └── errorHandler.js             # Centralized error responses
│   └── db/
│       └── migrations/
│           └── 001_init.sql             # Schema: users, products, orders
└── frontend/
    ├── package.json
    ├── .env.example
    ├── public/
    │   └── index.html
    └── src/
        ├── index.js
        ├── App.js                       # React Router routes
        ├── pages/
        │   ├── ProductListPage.jsx      # Browse + filter safe products
        │   ├── ProductDetailPage.jsx    # AI audit result display
        │   ├── AddProductPage.jsx       # Admin product submission form
        │   └── CheckoutPage.jsx        # Cart + Stripe redirect
        ├── components/
        │   ├── ProductCard.jsx
        │   ├── IngredientBadge.jsx      # SAFE / NOT SAFE badge
        │   └── Navbar.jsx
        ├── hooks/
        │   ├── useProducts.js
        │   └── useAuth.js
        ├── services/
        │   └── productService.js        # Frontend business logic
        ├── api/
        │   └── apiClient.js             # Axios instance + interceptors
        └── redux/
            ├── store.js
            ├── index.js
            └── slices/
                ├── userSlice.js
                └── productSlice.js
```

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- An OpenAI API key (GPT-4 access)
- A Stripe account (test mode keys)

### 1. Clone and install

```bash
git clone <repo-url>
cd the_clean_label_e_commerce

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure environment variables

**Backend** — copy `backend/.env.example` to `backend/.env` and fill in:

```
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/clean_label_db
JWT_SECRET=a_long_random_secret
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=http://localhost:3000
```

**Frontend** — copy `frontend/.env.example` to `frontend/.env`:

```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_...
```

### 3. Create the database and run migrations

```bash
createdb clean_label_db
psql clean_label_db < backend/db/migrations/001_init.sql
```

### 4. Run the application

```bash
# Terminal 1 — backend
cd backend
npm run dev

# Terminal 2 — frontend
cd frontend
npm start
```

Backend runs on `http://localhost:5000`, frontend on `http://localhost:3000`.

### 5. Stripe webhook (local development)

```bash
stripe listen --forward-to localhost:5000/api/orders/webhook
```

Copy the webhook signing secret printed by the CLI into `STRIPE_WEBHOOK_SECRET`.

---

## Architecture Flow

```
User submits product (name, price, ingredients)
        │
        ▼
POST /api/products  [requires JWT]
        │
        ▼
productController.createProduct
        │
        ▼
productService.createProduct
        ├─► aiService.analyzeIngredients(ingredientString)
        │       └─► OpenAI Chat Completions API
        │               └─► returns { is_safe, reason, flagged_ingredients }
        │
        ▼
productRepository.create(data + aiResult)
        │
        ▼
Saved to PostgreSQL products table
        │
        ▼
Response: product record with is_safe, ai_reason

──────────────────────────────────────────────

User adds to cart → clicks Checkout
        │
        ▼
POST /api/orders/checkout
        │
        ▼
paymentService.createCheckoutSession(items)
        │
        ▼
Stripe Checkout Session created
        │
        ▼
Frontend redirects to Stripe-hosted page
        │
        ▼
Customer pays → Stripe fires webhook
        │
        ▼
POST /api/orders/webhook (raw body, verified sig)
        │
        ▼
Order status updated to 'paid' in PostgreSQL
```

---

## API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login, returns JWT |

### Products
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/products` | Public | List all safe products |
| GET | `/api/products/:id` | Public | Product detail with AI audit |
| POST | `/api/products` | JWT required | Submit product for AI audit |

### Orders
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/orders/checkout` | JWT required | Create Stripe session |
| POST | `/api/orders/webhook` | Stripe sig | Handle payment confirmation |

---

## Interview Talking Points

**"Why use AI as a validation layer instead of a rules-based system?"**
A static blocklist can't reason about edge cases or novel ingredient names. GPT-4 understands that "cetyl alcohol" is a fatty alcohol safe in cosmetics while "isopropanol" is not, without maintaining an ever-growing lookup table.

**"How do you prevent extra OpenAI calls on every product load?"**
The audit result (`is_safe`, `ai_reason`, `ai_checked_at`) is persisted to the database at write time. Reads are pure SQL — no AI calls.

**"How does the Stripe webhook stay secure?"**
The `/orders/webhook` route uses `express.raw()` (not `express.json()`) so the raw request body is preserved. Stripe signs the payload with HMAC-SHA256; the backend verifies the signature using `stripe.webhooks.constructEvent` before trusting the event.

**"Walk me through the layered architecture."**
Routes define HTTP endpoints → Controllers handle req/res and call Services → Services contain business logic and call Repositories → Repositories contain raw SQL. This keeps each layer independently testable.

**"How would you scale this?"**
- Add a Redis cache in front of `getAllProducts` (most reads, few writes)
- Move the OpenAI call to a background job queue (BullMQ) so the POST returns immediately with a "pending audit" status
- Containerize with Docker Compose for local parity and Kubernetes for production
