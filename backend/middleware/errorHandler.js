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

  // Known HTTP errors (set err.status explicitly in services/controllers)
  const statusCode = err.status || err.statusCode || 500;

  const message = statusCode < 500
    ? err.message
    : 'An unexpected server error occurred';

  res.status(statusCode).json({
    success: false,
    error: message,
  });
}

module.exports = errorHandler;
