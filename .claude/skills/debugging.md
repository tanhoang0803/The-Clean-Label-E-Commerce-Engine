# Debugging Guide — Clean Label E-Commerce

## Common Issues & Fixes

### 1. AI Service Returns Unexpected Result
- Check `OPENAI_API_KEY` in `backend/.env`
- Log the raw OpenAI response before JSON.parse in `aiService.js`
- If JSON parse fails, the service defaults `is_safe: false` — check the `ai_reason` field for the raw text

### 2. Stripe Webhook 400 Error
- Ensure `express.raw()` is registered BEFORE `express.json()` in `server.js`
- Verify `STRIPE_WEBHOOK_SECRET` matches the one in Stripe dashboard
- Test locally with Stripe CLI: `stripe listen --forward-to localhost:5000/api/orders/webhook`

### 3. JWT Auth Fails (401)
- Check token is being set in `localStorage` after login
- Check Axios interceptor in `frontend/src/api/apiClient.js` is attaching `Authorization: Bearer`
- Verify `JWT_SECRET` is the same in `.env` as when the token was signed

### 4. PostgreSQL Connection Error
- Verify `DATABASE_URL` format: `postgresql://user:password@localhost:5432/clean_label_db`
- Run: `psql -U postgres -c "\l"` to confirm `clean_label_db` exists
- Check `backend/config/db.js` pool config

### 5. CORS Error in Browser
- Ensure `FRONTEND_URL` in backend `.env` matches exact origin (including port)
- Check `cors()` config in `server.js`

## Debug Workflow

1. Check browser Network tab → look at request/response
2. Check backend terminal logs for the error
3. Add `console.log` at service layer entry point
4. Check DB directly: `psql -U postgres -d clean_label_db -c "SELECT * FROM products LIMIT 5;"`

## Useful Commands

```bash
# Check DB tables
psql -U postgres -d clean_label_db -c "\dt"

# Check product audit results
psql -U postgres -d clean_label_db -c "SELECT name, is_safe, ai_reason FROM products;"

# Test AI service in isolation
node -e "require('./services/aiService').analyzeIngredients('water, ethanol, mint').then(console.log)"
```
