/**
 * Get CORS headers for the current request
 * @param {Object} req - The request object
 * @returns {Object} - CORS headers with correct origin
 */
function getCorsHeaders(req) {
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim());
  const requestOrigin = req.headers.origin;

  // Check if the request origin is in our allowed list
  const allowedOrigin = allowedOrigins.includes(requestOrigin)
    ? requestOrigin
    : allowedOrigins[0] || "*";

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Allow-Credentials": "true",
  };
}

/**
 * Health check endpoint
 */
export default async function handler(req, res) {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return res
      .status(200)
      .setHeader(
        "Access-Control-Allow-Origin",
        corsHeaders["Access-Control-Allow-Origin"]
      )
      .setHeader(
        "Access-Control-Allow-Methods",
        corsHeaders["Access-Control-Allow-Methods"]
      )
      .setHeader(
        "Access-Control-Allow-Headers",
        corsHeaders["Access-Control-Allow-Headers"]
      )
      .setHeader(
        "Access-Control-Allow-Credentials",
        corsHeaders["Access-Control-Allow-Credentials"]
      )
      .end();
  }

  // Set CORS headers for all responses
  Object.keys(corsHeaders).forEach((key) => {
    res.setHeader(key, corsHeaders[key]);
  });

  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
}
