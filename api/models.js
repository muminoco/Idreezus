const { AI_PROVIDERS, AI_MODELS } = require("../shared/constants");
const { formatErrorResponse } = require("../shared/js-utils");
const { handleCors } = require("../shared/cors-utils"); // Import shared CORS utility

/**
 * Serverless function for returning available AI models
 */
export default async function handler(req, res) {
  // Handle CORS setup and preflight - returns true if this was just a preflight check
  if (handleCors(req, res)) return;

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
