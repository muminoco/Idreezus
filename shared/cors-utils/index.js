/**
 * Get CORS headers for the current request
 * Unlike Express middleware, serverless functions need manual CORS handling
 * @param {Object} req - The request object
 * @returns {Object} - CORS headers with correct origin
 */
function getCorsHeaders(req) {
  // Parse allowed origins from environment variable
  // Multiple origins in env vars must be comma-separated, but CORS headers only accept one
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim());
  const requestOrigin = req.headers.origin;

  // CORS requires exact origin match - can't use wildcards with credentials
  // Return the requesting origin if it's in our allowed list, otherwise use first allowed origin
  const allowedOrigin = allowedOrigins.includes(requestOrigin)
    ? requestOrigin
    : allowedOrigins[0] || "*";

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Allow-Credentials": "true", // Needed for cookies/auth (requires specific origin, not *)
  };
}

/**
 * Handle CORS preflight and set headers for serverless functions
 * Serverless functions don't have Express middleware, so we handle CORS manually
 * This replaces ~15 lines of repetitive CORS code in each function
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {boolean} - True if preflight request (caller should return early)
 */
function handleCors(req, res) {
  const corsHeaders = getCorsHeaders(req);

  // Set CORS headers on every response (not just preflight)
  // This is required because browsers check CORS on the actual request too
  Object.keys(corsHeaders).forEach((key) => {
    res.setHeader(key, corsHeaders[key]);
  });

  // OPTIONS requests are "preflight" checks browsers send before actual requests
  // They ask "is this cross-origin request allowed?" We respond "yes" and end
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return true; // Signal to caller: "preflight handled, don't continue"
  }

  return false; // Signal to caller: "continue with normal request processing"
}

module.exports = {
  getCorsHeaders,
  handleCors,
};
