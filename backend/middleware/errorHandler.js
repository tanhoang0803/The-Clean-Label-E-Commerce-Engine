/**
 * Centralized Express error handler.
 * Must be registered as the LAST middleware in server.js.
 *
 * All async controllers should catch errors and call next(error).
 * This handler normalizes every error into:
 *   { success: false, error: "message" }
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error(`[ErrorHandler] ${req.method} ${req.path}:`, err.message || err);

  // Only use err.status — set explicitly by our own code.
  // Never forward err.statusCode from third-party SDKs (e.g. Stripe returns
  // statusCode:401 for a bad API key, which would incorrectly log the user out).
  const statusCode = err.status || 500;

  // Detect unconfigured third-party keys and give a clear dev message
  const isStripeAuthError = err.type === 'StripeAuthenticationError' || err.code === 'api_key_invalid';
  const isOpenAIAuthError = err.status === 401 && err.message?.includes('OpenAI');

  let message;
  if (isStripeAuthError) {
    message = 'Stripe is not configured. Add a valid STRIPE_SECRET_KEY to backend/.env';
  } else if (isOpenAIAuthError) {
    message = 'OpenAI is not configured. Add a valid OPENAI_API_KEY to backend/.env';
  } else if (statusCode < 500) {
    message = err.message;
  } else {
    message = 'An unexpected server error occurred';
  }

  res.status(statusCode).json({
    success: false,
    error: message,
  });
}

module.exports = errorHandler;
