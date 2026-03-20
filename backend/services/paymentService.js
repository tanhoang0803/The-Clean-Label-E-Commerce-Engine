const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Creates a Stripe Checkout Session for the given cart items.
 *
 * @param {Array<{ name: string, price: number, quantity: number, image_url?: string }>} items
 * @param {number} userId - Internal user ID, stored in session metadata
 * @param {string} successUrl - URL to redirect after successful payment
 * @param {string} cancelUrl - URL to redirect if the user cancels
 * @returns {Promise<Stripe.Checkout.Session>}
 */
async function createCheckoutSession(items, userId, successUrl, cancelUrl) {
  if (!items || items.length === 0) {
    const err = new Error('No items provided for checkout');
    err.status = 400;
    throw err;
  }

  const lineItems = items.map((item) => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.name,
        ...(item.image_url ? { images: [item.image_url] } : {}),
      },
      // Stripe expects amounts in the smallest currency unit (cents)
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      user_id: String(userId),
    },
  });

  return session;
}

/**
 * Verifies a Stripe webhook signature and returns the constructed event.
 *
 * @param {Buffer} rawBody - The raw request body (must NOT be parsed as JSON)
 * @param {string} signature - The value of the 'stripe-signature' header
 * @param {string} webhookSecret - STRIPE_WEBHOOK_SECRET from environment
 * @returns {Stripe.Event}
 */
function constructWebhookEvent(rawBody, signature, webhookSecret) {
  return stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
}

module.exports = { createCheckoutSession, constructWebhookEvent };
