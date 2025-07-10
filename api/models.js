const { AI_PROVIDERS, AI_MODELS } = require("../shared/constants");
const { formatErrorResponse } = require("../shared/js-utils");

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

  try {
    if (req.method !== "GET") {
      return res.status(405).json(formatErrorResponse("Method not allowed"));
    }

    res.json({
      success: true,
      data: {
        current: {
          provider: process.env.ANTHROPIC_MODEL ? "anthropic" : "openai",
          model:
            process.env.ANTHROPIC_MODEL ||
            process.env.OPENAI_MODEL ||
            AI_MODELS.ANTHROPIC.CLAUDE_35_HAIKU,
        },
        available: {
          providers: AI_PROVIDERS,
          models: AI_MODELS,
        },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Models endpoint error:", error);
    res
      .status(500)
      .json(
        formatErrorResponse(
          "Failed to fetch models",
          process.env.NODE_ENV === "development"
            ? [error.message]
            : ["Internal server error"]
        )
      );
  }
}
