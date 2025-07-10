// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGINS || "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Requested-With",
  "Access-Control-Allow-Credentials": "true",
};

/**
 * Health check endpoint
 */
export default function handler(req, res) {
  // Handle CORS preflight
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

  // Set CORS headers
  Object.keys(corsHeaders).forEach((key) => {
    res.setHeader(key, corsHeaders[key]);
  });

  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
}
