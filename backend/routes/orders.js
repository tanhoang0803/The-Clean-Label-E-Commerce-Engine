const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/auth');

// POST /api/orders/checkout — requires authentication
// Note: /api/orders/webhook uses express.raw() middleware registered in server.js
// and must NOT use express.json() — handled before this router is reached.
router.post('/checkout', authenticateToken, orderController.createCheckout);

// POST /api/orders/webhook — called by Stripe, no JWT
// Raw body middleware is applied in server.js before this route is reached
router.post('/webhook', orderController.handleWebhook);

module.exports = router;
