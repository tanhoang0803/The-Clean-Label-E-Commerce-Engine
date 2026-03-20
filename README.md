# The Clean Label E-Commerce Engine

An AI-powered marketplace that audits product ingredients for clean-label compliance before listing them for sale. Built with React, Express, PostgreSQL, OpenAI, and Stripe.

---

## Project Overview

The Clean Label E-Commerce Engine is a full-stack web application where vendors submit products with ingredient lists. Before a product is saved to the database, an OpenAI-powered auditor scans the ingredients for harmful substances (synthetic dyes, parabens, SLS, alcohol derivatives, acidic pH agents). Only products passing the audit are listed publicly. Shoppers can browse safe products, view the AI audit report, and check out via Stripe.

This project demonstrates end-to-end integration of:
- **AI as a data validation layer** — not just a chatbot, but a gatekeeper
- **Layered backend architecture** — Controller → Service → Repository
- **Secure JWT authentication** with role-based access
- **Stripe Checkout** with webhook confirmation
- **Docker + GitHub Actions CI/CD** with automated test and deploy pipeline

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Redux Toolkit, React Router v6, Axios |
| Backend | Node.js, Express 4 |
| Database | PostgreSQL (raw SQL via `pg` pool — no ORM) |
| AI | OpenAI Chat Completions API (GPT-4) |
| Payments | Stripe Checkout + Webhooks |
| Auth | JWT (`jsonwebtoken` + `bcryptjs`) |
| Testing | Jest, Supertest |
| Containers | Docker (multi-stage), Docker Compose, nginx |
| CI / CD | GitHub Actions → Render (backend) + Vercel (frontend) |

---

## Key Features

### AI Ingredient Audit
Every product submission triggers an OpenAI GPT-4 call that checks for:
- Alcohol derivatives (ethanol, isopropanol, denatured alcohol)
- High-concentration acidic agents (citric acid >5%, phosphoric acid)
- Synthetic dyes (Red 40, Yellow 5, Blue 1, etc.)
- Parabens (methylparaben, propylparaben, etc.)
- Sodium Lauryl Sulfate (SLS / SLES)

Returns `{ is_safe: boolean, reason: string, flagged_ingredients: string[] }`, stored in the database — never re-computed on reads.

### Stripe Payment Flow
Cart → `POST /api/orders/checkout` → Stripe Checkout Session → customer pays on Stripe-hosted page → Stripe webhook confirms → order marked `paid` in PostgreSQL.

### JWT Auth + Role Guard
Register/login returns a signed JWT. Protected routes use `authenticateToken` middleware. Admin-only routes add `requireRole('admin')` on top.

### Docker Compose
One command spins up all three services: PostgreSQL (with auto-migration), Express backend, and React frontend (via nginx).

---

## Project Structure

```
the_clean_label_e_commerce/
├── README.md
├── CLAUDE.md                            # Architecture rules for Claude Code
├── .gitignore
├── .env.example                         # Root env template for docker-compose
├── docker-compose.yml                   # Orchestrates db + backend + frontend
│
├── .github/
│   └── workflows/
│       └── ci.yml                       # 4-job CI/CD pipeline
│
├── backend/
│   ├── Dockerfile                       # Multi-stage Node build (non-root user)
│   ├── .dockerignore
│   ├── package.json                     # Jest + Supertest included
│   ├── .env.example
│   ├── server.js                        # Express entry point
│   ├── config/
│   │   └── db.js                        # pg Pool singleton
│   ├── routes/
│   │   ├── products.js
│   │   ├── auth.js
│   │   └── orders.js
│   ├── controllers/
│   │   ├── productController.js
│   │   ├── authController.js
│   │   └── orderController.js
│   ├── services/
│   │   ├── productService.js            # Orchestrates AI audit + DB write ⭐
│   │   ├── aiService.js                 # OpenAI ingredient scanner ⭐
│   │   ├── paymentService.js            # Stripe session + webhook
│   │   └── authService.js              # bcrypt + JWT signing
│   ├── repositories/
│   │   ├── productRepository.js         # Raw SQL — products table
│   │   ├── userRepository.js            # Raw SQL — users table
│   │   └── orderRepository.js           # Raw SQL — orders + order_items
│   ├── middleware/
│   │   ├── auth.js                      # JWT verification + role guard
│   │   └── errorHandler.js             # Centralized { success, error } responses
│   ├── db/
│   │   └── migrations/
│   │       └── 001_init.sql             # Schema: users, products (is_safe ⭐, ai_reason ⭐), orders
│   └── __tests__/
│       ├── health.test.js               # /health smoke test
│       ├── aiService.test.js            # 5 unit tests (OpenAI mocked)
│       └── auth.test.js                 # Validation + JWT guard tests
│
├── frontend/
│   ├── Dockerfile                       # Multi-stage: CRA build → nginx serve
│   ├── .dockerignore
│   ├── nginx.conf                       # SPA fallback + asset caching
│   ├── package.json
│   ├── .env.example
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── index.js
│       ├── App.js                       # React Router v6 routes + ProtectedRoute
│       ├── api/
│       │   └── apiClient.js             # Axios instance + Bearer token interceptor
│       ├── redux/
│       │   ├── store.js
│       │   ├── index.js
│       │   └── slices/
│       │       ├── userSlice.js         # login/register/logout thunks
│       │       └── productSlice.js      # fetch/add product thunks
│       ├── hooks/
│       │   ├── useProducts.js           # Wraps productSlice — components use this
│       │   └── useAuth.js               # Wraps userSlice — components use this
│       ├── services/
│       │   └── productService.js        # Frontend utilities (filterSafe, formatPrice)
│       ├── pages/
│       │   ├── ProductListPage.jsx      # Browse + safe-only toggle
│       │   ├── ProductDetailPage.jsx    # AI audit result + add to cart
│       │   ├── AddProductPage.jsx       # Admin product form → shows live AI result
│       │   └── CheckoutPage.jsx         # Cart summary → Stripe redirect
│       └── components/
│           ├── ProductCard.jsx          # Presentational card with SAFE/UNSAFE badge
│           ├── IngredientBadge.jsx      # Green/red badge + ai_reason tooltip
│           └── Navbar.jsx               # Auth-aware nav
│
└── .claude/
    ├── skills/
    │   ├── api-design.md                # REST standards for this project
    │   ├── debugging.md                 # Common issues + fix commands
    │   └── testing.md                   # Test strategy + Jest examples
    └── prompts/
        ├── fix-bug.md                   # Bug report template
        └── refactor.md                  # Refactor prompt template
```

---

## Setup Instructions

### Prerequisites
- Node.js 20+
- PostgreSQL 14+ (or use Docker)
- OpenAI API key (GPT-4 access)
- Stripe account (test mode keys)

### Option A — Docker (recommended)

```bash
git clone https://github.com/tanhoang0803/The-Clean-Label-E-Commerce-Engine.git
cd The-Clean-Label-E-Commerce-Engine

cp .env.example .env
# Fill in OPENAI_API_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, REACT_APP_STRIPE_PUBLIC_KEY

docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:5000 |
| PostgreSQL | localhost:5432 |

### Option B — Manual

```bash
# 1. Clone
git clone https://github.com/tanhoang0803/The-Clean-Label-E-Commerce-Engine.git
cd The-Clean-Label-E-Commerce-Engine

# 2. Backend
cd backend
npm install
cp .env.example .env        # fill in your keys

# 3. Database
psql -U postgres -c "CREATE DATABASE clean_label_db;"
psql -U postgres -d clean_label_db -f db/migrations/001_init.sql

# 4. Frontend
cd ../frontend
npm install
cp .env.example .env        # fill in REACT_APP_* keys

# 5. Run (two terminals)
cd backend && npm run dev    # http://localhost:5000
cd frontend && npm start     # http://localhost:3000
```

### Stripe webhook (local)

```bash
stripe listen --forward-to localhost:5000/api/orders/webhook
# Copy the printed whsec_... into backend/.env STRIPE_WEBHOOK_SECRET
```

### Seed demo data

To populate the database with sample products and a demo admin account:

```bash
psql -U postgres -d clean_label_db -f backend/db/seeds/demo.sql
```

**Demo credentials:**

| Field | Value |
|-------|-------|
| Email | `admin@cleanlabel.com` |
| Password | `password123` |
| Role | `admin` |

The seed inserts 4 products (3 SAFE, 1 NOT SAFE) so you can immediately see the AI audit badges, safe-only filter, and product detail pages without needing an OpenAI key.

---

## Architecture Flow

```
User submits product (name, price, ingredients)
        │
        ▼
POST /api/products  [JWT required]
        │
        ▼
productController → productService.createProduct()
        │
        ├──► aiService.analyzeIngredients(ingredients)
        │         └──► OpenAI GPT-4
        │                 └──► { is_safe, reason, flagged_ingredients }
        │
        ▼  (if AI call fails → is_safe: false, never silently passes)
productRepository.create({ ...product, is_safe, ai_reason })
        │
        ▼
PostgreSQL products table
        │
        ▼
Response: full product record including AI audit result

─────────────────────────────────────────────────────

User checks out
        │
        ▼
POST /api/orders/checkout  [JWT required]
        │
        ▼
paymentService.createCheckoutSession(items)
        │
        ▼
Stripe Checkout Session → frontend redirects to Stripe
        │
        ▼
Customer pays → Stripe fires POST /api/orders/webhook
        │        (raw body + HMAC-SHA256 signature verified)
        ▼
Order status → 'paid' in PostgreSQL
```

---

## API Reference

### Auth
| Method | Endpoint | Body | Description |
|---|---|---|---|
| POST | `/api/auth/register` | `{ email, password }` | Create account |
| POST | `/api/auth/login` | `{ email, password }` | Returns JWT |

### Products
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/products` | Public | List safe products (`?safe_only=true`) |
| GET | `/api/products/:id` | Public | Product detail with AI audit result |
| POST | `/api/products` | JWT | Submit product — triggers AI audit |

### Orders
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/orders/checkout` | JWT | Create Stripe Checkout Session |
| POST | `/api/orders/webhook` | Stripe sig | Confirm payment, update order status |

### Health
| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Returns `{ success: true, data: { status: "ok" } }` |

---

## CI / CD Pipeline

Every push to `main` triggers a 5-job GitHub Actions pipeline:

```
push to main
    │
    ├── [1] backend        → npm ci → psql migrate → Jest (9 tests)
    ├── [2] frontend       → npm ci → npm run build
    │
    └── on [1]+[2] pass:
         ├── [3] docker         → docker compose build --no-cache
         ├── [4] deploy-backend → Render deploy hook
         └── [5] deploy-frontend→ Vercel CLI deploy
```

### Running tests locally

```bash
cd backend
npm test
# 9 tests: health.test.js · aiService.test.js · auth.test.js
```

---

## Live URLs

| Service | URL |
|---------|-----|
| Frontend | https://the-clean-label-e-commerce-engine.vercel.app |
| Backend API | https://the-clean-label-e-commerce-engine.onrender.com |
| Health check | https://the-clean-label-e-commerce-engine.onrender.com/health |

---

## Deployment

### Backend → Render

1. Go to [render.com](https://render.com) → **New → Web Service**
2. Connect this GitHub repo
3. Set these fields:
   - **Runtime**: Docker
   - **Dockerfile path**: `./Dockerfile` (repo root)
   - **Docker Context**: `.`
4. Create a **PostgreSQL** database: Render dashboard → **New → PostgreSQL** (free tier)
   - Note: username cannot be `postgres` — use `clean_label_user` or similar
5. Set environment variables:
   - `DATABASE_URL` — Internal Database URL from Render PostgreSQL → Connections
   - `JWT_SECRET` — any long random string
   - `OPENAI_API_KEY` — from platform.openai.com
   - `STRIPE_SECRET_KEY` — from Stripe dashboard → Developers → API keys
   - `STRIPE_WEBHOOK_SECRET` — from Stripe dashboard → Developers → Webhooks
   - `FRONTEND_URL` — your Vercel URL
   - `PORT` = `5000`
6. After first deploy, run the migration from your local machine using the External Database URL:
   ```bash
   psql "YOUR_EXTERNAL_DATABASE_URL" -f backend/db/migrations/001_init.sql
   psql "YOUR_EXTERNAL_DATABASE_URL" -f backend/db/seeds/demo.sql
   ```
   > Render Shell tab requires a paid plan. Use local psql with the External Database URL instead.
7. Set up Stripe webhook endpoint:
   - URL: `https://your-render-url.onrender.com/api/orders/webhook`
   - Event: `checkout.session.completed`
   - Copy the signing secret → update `STRIPE_WEBHOOK_SECRET` on Render
8. Copy **Settings → Deploy Hook URL** → add to GitHub secrets as `RENDER_BACKEND_DEPLOY_HOOK`

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project → Import from GitHub**
2. Set **Root Directory** to `frontend`
3. Add environment variables in Vercel dashboard:
   - `REACT_APP_API_URL` → your Render backend URL + `/api`
   - `REACT_APP_STRIPE_PUBLIC_KEY` → your Stripe publishable key (`pk_test_...`)
4. Deploy, then add these GitHub secrets for CI auto-deploy:
   - `VERCEL_TOKEN` — from vercel.com → Account Settings → Tokens
   - `VERCEL_ORG_ID` — from vercel.com → Account Settings → General → Team/Account ID
   - `VERCEL_PROJECT_ID` — from Vercel project → Settings → General → Project ID

### GitHub Secrets summary

| Secret | Purpose |
|--------|---------|
| `RENDER_BACKEND_DEPLOY_HOOK` | Render deploy hook URL for backend |
| `VERCEL_TOKEN` | Vercel CLI authentication |
| `VERCEL_ORG_ID` | Vercel organization/account ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |

After secrets are set, every push to `main` automatically tests and deploys both services.

---

## Interview Talking Points

**"Why use AI as a validation layer instead of a rules-based system?"**
A static blocklist can't reason about edge cases. GPT-4 knows that "cetyl alcohol" is a safe fatty alcohol while "isopropanol" is harmful — without maintaining an ever-growing lookup table.

**"How do you prevent extra OpenAI calls on every product page load?"**
The audit result (`is_safe`, `ai_reason`, `ai_checked_at`) is persisted to PostgreSQL at write time. Read endpoints are pure SQL — no AI calls after the initial audit.

**"How does the Stripe webhook stay secure?"**
The `/orders/webhook` route uses `express.raw()` (not `express.json()`) to preserve the raw body. Stripe signs payloads with HMAC-SHA256; the backend verifies with `stripe.webhooks.constructEvent` before trusting the event.

**"Walk me through the layered architecture."**
Routes define endpoints → Controllers handle req/res → Services hold business logic → Repositories contain raw SQL. Each layer is independently testable and replaceable.

**"How would you scale this?"**
- Redis cache in front of `GET /products` (high read, low write)
- Move the OpenAI call to a BullMQ background job — POST returns `{ status: "pending" }` immediately
- Horizontal scaling via Docker Swarm or Kubernetes with the existing Compose config as a base
