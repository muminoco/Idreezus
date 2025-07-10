const { handleCors } = require("../shared/cors-utils"); // Import shared CORS utility

/**
 * Health check endpoint for serverless functions
 */
export default function handler(req, res) {
  // Handle CORS setup and preflight - returns true if this was just a preflight check
  if (handleCors(req, res)) return;

  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
}
