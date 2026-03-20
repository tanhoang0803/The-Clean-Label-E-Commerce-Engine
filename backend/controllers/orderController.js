const paymentService = require('../services/paymentService');
const orderRepository = require('../repositories/orderRepository');

/**
 * POST /api/orders/checkout
 * Body: { items: [{ product_id, name, price, quantity, image_url? }] }
 * Requires: JWT auth
 * Returns: { success: true, data: { sessionId, url } }
 */
async function createCheckout(req, res, next) {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'items array is required and must not be empty',
      });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const successUrl = `${frontendUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${frontendUrl}/checkout`;

    const session = await paymentService.createCheckoutSession(
      items,
      req.user.id,
      successUrl,
      cancelUrl
    );

    // Calculate total for our records
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Create a pending order record — status will be updated to 'paid' via webhook
    const order = await orderRepository.createOrder({
      user_id: req.user.id,
      stripe_session_id: session.id,
      total_amount: totalAmount,
      status: 'pending',
    });

    // Save order items
    const orderItems = items.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.price,
    }));
    await orderRepository.createOrderItems(order.id, orderItems);

    res.status(201).json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url,
        orderId: order.id,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/orders/webhook
 * Raw body — verified by Stripe signature.
 * No JWT required (called directly by Stripe servers).
 */
async function handleWebhook(req, res, next) {
  try {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
      event = paymentService.constructWebhookEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error('[orderController] Webhook signature verification failed:', err.message);
      return res.status(400).json({ success: false, error: `Webhook Error: ${err.message}` });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        await orderRepository.updateStatusBySessionId(session.id, 'paid');
        console.log(`[orderController] Order paid for session ${session.id}`);
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object;
        await orderRepository.updateStatusBySessionId(session.id, 'expired');
        break;
      }

      default:
        // Acknowledge receipt of unhandled event types
        console.log(`[orderController] Unhandled event type: ${event.type}`);
    }

    // Stripe requires a 200 response to acknowledge receipt
    res.json({ received: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { createCheckout, handleWebhook };
