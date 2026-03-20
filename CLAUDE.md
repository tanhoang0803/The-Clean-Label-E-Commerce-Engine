# CLAUDE.md — Architecture Guide for Claude Code

This file tells Claude Code exactly how this codebase is structured, what conventions to follow, and what to avoid. Read this before touching any file.

---

## What This Project Is

A full-stack e-commerce application where every product is audited by OpenAI before being saved. The AI call lives in `backend/services/aiService.js` and is invoked by `productService.js` at write time — never at read time.

---

## Project Structure and File Purposes

```
backend/
  server.js                  Entry point. Registers middleware, mounts routes, starts server.
  config/db.js               Exports a pg Pool. Import this anywhere you need a DB connection.
  routes/products.js         Express router. Only route definitions — no logic here.
  routes/auth.js             Express router for /auth endpoints.
  routes/orders.js           Express router for /orders endpoints.
  controllers/
    productController.js     Handles req/res for product endpoints. Calls productService.
    authController.js        Handles req/res for auth endpoints. Calls authService.
    orderController.js       Handles req/res for order endpoints. Calls paymentService.
  services/
    productService.js        Business logic: orchestrates aiService call + productRepository write.
    aiService.js             OpenAI call. Input: ingredient string. Output: { is_safe, reason, flagged_ingredients }.
    paymentService.js        Stripe logic: createCheckoutSession, constructWebhookEvent.
    authService.js           Register/login: bcrypt hashing, JWT signing.
  repositories/
    productRepository.js     Raw SQL only. No business logic. Returns plain JS objects.
    userRepository.js        Raw SQL only for users table.
    orderRepository.js       Raw SQL only for orders and order_items tables.
  middleware/
    auth.js                  Verifies JWT. Attaches req.user = { id, email, role }.
    errorHandler.js          Catches thrown errors. Always returns { success: false, error: string }.
  db/migrations/
    001_init.sql             Initial schema. Run once against a fresh database.

frontend/src/
  index.js                   ReactDOM.render root.
  App.js                     All React Router v6 <Route> definitions.
  api/apiClient.js           Axios instance. Attaches Bearer token. Handles 401 redirect.
  redux/store.js             configureStore with userSlice + productSlice.
  redux/slices/userSlice.js  Auth state: user, token, loading, error. Async thunks for login/register.
  redux/slices/productSlice.js  Product state: products[], selectedProduct. Async thunks.
  hooks/useProducts.js       Wraps productSlice dispatch. Components import this, not the slice directly.
  hooks/useAuth.js           Wraps userSlice dispatch. Components import this, not the slice directly.
  services/productService.js Frontend-only logic (e.g. filter safe-only, format currency).
  pages/ProductListPage.jsx  Calls useProducts hook. Renders ProductCard grid.
  pages/ProductDetailPage.jsx Fetches single product by ID. Shows IngredientBadge.
  pages/AddProductPage.jsx   Admin form. On submit, dispatches addProduct thunk.
  pages/CheckoutPage.jsx     Cart display. On confirm, calls POST /orders/checkout.
  components/ProductCard.jsx  Pure presentational component.
  components/IngredientBadge.jsx  Reads is_safe + ai_reason props. No side effects.
  components/Navbar.jsx      Reads auth state from Redux. Conditionally shows login/logout.
```

---

## Coding Conventions

### Naming
- Files: `camelCase.js` for JS/TS utility files, `PascalCase.jsx` for React components.
- Database columns: `snake_case` (e.g. `is_safe`, `created_at`).
- JS variables/functions: `camelCase`.
- React component functions: `PascalCase`.
- Constants: `UPPER_SNAKE_CASE`.

### Folder Layout Rules
- Never put SQL in a controller or service — SQL belongs in `repositories/` only.
- Never put business logic in a route file — route files contain only `router.get(...)` calls.
- Never put Axios calls directly in a React component — use the hooks or services layer.
- Never import `apiClient.js` directly in a page component — go through `hooks/` or `services/`.

### File Length
- Keep controllers thin: each handler should be under 20 lines.
- Services can be longer but must have a single responsibility.
- If a repository file exceeds 150 lines, consider splitting by query category.

---

## API Design Rules

### URL Structure
```
/api/auth/register
/api/auth/login
/api/products
/api/products/:id
/api/orders/checkout
/api/orders/webhook
```

All routes are prefixed with `/api` in `server.js`.

### Response Format
Every response from the API must follow one of these two shapes:

Success:
```json
{
  "success": true,
  "data": { ... }
}
```

Error:
```json
{
  "success": false,
  "error": "Human readable message"
}
```

The `errorHandler.js` middleware enforces this for thrown errors. Controllers must use `res.json({ success: true, data: ... })`.

### HTTP Status Codes
- `200` — successful GET, successful DELETE
- `201` — successful POST that created a resource
- `400` — validation error (missing fields, malformed input)
- `401` — missing or invalid JWT
- `403` — authenticated but not authorized (e.g. non-admin trying to create product)
- `404` — resource not found
- `500` — unexpected server error (caught by errorHandler)

### Auth Middleware Usage
Import `authenticateToken` from `middleware/auth.js` and apply it per route:
```js
router.post('/', authenticateToken, productController.createProduct);
```
Do not apply auth globally in `server.js` — some routes are public.

---

## Key Architectural Decisions

### 1. AI call happens at write time, not read time
`aiService.analyzeIngredients` is called inside `productService.createProduct`. The result is stored in the `products` table (`is_safe`, `ai_reason`, `ai_checked_at`). GET endpoints return the stored result — they never call OpenAI.

**Why:** Cost control, latency reduction, auditability.

### 2. Stripe webhook uses raw body middleware
In `server.js`, the webhook route must receive the raw request body for signature verification. The `express.raw()` middleware is applied specifically to `/api/orders/webhook` before `express.json()` is applied globally.

```js
// In server.js — order matters
app.use('/api/orders/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
```

**Do not change this order.**

### 3. Repository pattern for all DB access
All `pool.query(...)` calls live in `repositories/`. Services call repositories. This makes it trivial to mock the DB layer in unit tests and swap the DB engine without touching business logic.

### 4. Redux for global auth + product state
User token is stored in Redux `userSlice` and also persisted to `localStorage` by the thunk. On app load, `App.js` reads from `localStorage` to rehydrate the token.

### 5. No ORM
Raw SQL via `pg` is used intentionally. It keeps the query logic explicit and easy to optimize. Do not introduce Sequelize, Prisma, or Knex without discussion.

---

## Important Files Map

| If you need to... | Look in... |
|---|---|
| Change the AI prompt | `backend/services/aiService.js` |
| Add a new DB table | `backend/db/migrations/` (create `002_...sql`) |
| Add a new API endpoint | route → controller → service → repository |
| Change JWT expiry | `backend/services/authService.js` |
| Change Stripe success/cancel URLs | `backend/controllers/orderController.js` |
| Add a new Redux slice | `frontend/src/redux/slices/` + register in `store.js` |
| Change the Axios base URL | `frontend/src/api/apiClient.js` |
| Add a new page | `frontend/src/pages/` + add `<Route>` in `App.js` |
| Modify DB schema | Add a new migration file, never edit `001_init.sql` |

---

## Environment Variables

### Backend (`backend/.env`)
| Variable | Purpose |
|---|---|
| `PORT` | Express listen port (default 5000) |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | HMAC secret for signing tokens |
| `OPENAI_API_KEY` | OpenAI API key |
| `STRIPE_SECRET_KEY` | Stripe secret key (sk_test_ or sk_live_) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (whsec_) |
| `FRONTEND_URL` | Used in Stripe success/cancel URL construction |

### Frontend (`frontend/.env`)
| Variable | Purpose |
|---|---|
| `REACT_APP_API_URL` | Backend base URL for Axios |
| `REACT_APP_STRIPE_PUBLIC_KEY` | Stripe publishable key |

---

## DO Rules

- DO keep the Controller → Service → Repository flow intact for every feature.
- DO validate request bodies in controllers before calling services.
- DO use `try/catch` in async controllers and call `next(error)` to delegate to errorHandler.
- DO store the JWT in `localStorage` only (not cookies) for simplicity in this project.
- DO use `pool.query` with parameterized queries (`$1, $2`) to prevent SQL injection.
- DO add `ai_checked_at` timestamp when writing AI results so staleness can be detected later.
- DO use `express.raw()` for the webhook route and nothing else.

## DON'T Rules

- DON'T call `aiService` from a controller or repository — only from `productService`.
- DON'T put `pool.query` calls in services — delegate to repositories.
- DON'T add `console.log` to production paths — use proper error handling.
- DON'T use `SELECT *` in repositories — always name the columns explicitly.
- DON'T import `store` directly into components — use hooks (`useSelector`, `useDispatch`).
- DON'T edit `001_init.sql` after the database is created — always add a new migration file.
- DON'T expose `JWT_SECRET`, `OPENAI_API_KEY`, or `STRIPE_SECRET_KEY` in any frontend file.
- DON'T apply `authenticateToken` middleware globally — apply it per route.
- DON'T parse `req.body` as JSON on the Stripe webhook route — it must stay as raw Buffer.

---

## Common Pitfalls

**Stripe webhook 400 "No signatures found"**
Cause: `express.json()` ran before `express.raw()` on the webhook route, destroying the raw body.
Fix: Ensure the `express.raw()` middleware for `/api/orders/webhook` is registered before `app.use(express.json())` in `server.js`.

**OpenAI returns non-JSON text**
Cause: The model didn't follow the JSON instruction.
Fix: In `aiService.js`, wrap the OpenAI call in a try/catch and attempt `JSON.parse`. If it fails, return a default safe-false result with `reason: "AI audit failed to parse"`.

**JWT "invalid signature" errors**
Cause: `JWT_SECRET` in `.env` changed after tokens were issued.
Fix: Users must log in again. This is expected behavior.

**React 401 loop**
Cause: The Axios response interceptor redirects to `/login` on 401, but the login page itself triggers an API call.
Fix: In `apiClient.js`, skip the redirect if the request URL includes `/auth/`.
