# API Design Standards — Clean Label E-Commerce

## REST Conventions

- **Resource naming**: plural nouns only → `/products`, `/orders`, `/users`
- **HTTP verbs**:
  - `GET` — read (never mutates)
  - `POST` — create
  - `PUT` — full update
  - `PATCH` — partial update
  - `DELETE` — remove
- **Versioning**: prefix all routes with `/api` (e.g. `/api/products`)

## Response Envelope

All responses use a consistent JSON envelope:

```json
// Success
{ "success": true, "data": { ... } }

// List
{ "success": true, "data": [...], "total": 42 }

// Error
{ "success": false, "error": "Human-readable message" }
```

Never return raw data without the envelope. Never expose stack traces to the client.

## Status Codes

| Scenario              | Code |
|-----------------------|------|
| Success (read/update) | 200  |
| Created               | 201  |
| Bad request / invalid | 400  |
| Unauthorized (no JWT) | 401  |
| Forbidden (wrong role)| 403  |
| Not found             | 404  |
| Server error          | 500  |

## AI Audit Endpoint Rule

`POST /api/products` must always run `aiService.analyzeIngredients()` before writing to DB.
Never skip the AI check, even in dev. If OpenAI fails, the product is marked `is_safe: false` as a safe default.

## Filtering & Query Params

```
GET /api/products?safe_only=true
GET /api/products?page=1&limit=20
```

Use snake_case for all query params.

## Auth

- All write endpoints (`POST`, `PUT`, `DELETE`) require `Authorization: Bearer <token>` header
- Admin-only routes use `requireRole('admin')` middleware after `authenticateToken`
