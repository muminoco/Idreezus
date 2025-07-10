const { AI_PROVIDERS, AI_MODELS } = require("../../../shared/constants");
const { formatErrorResponse } = require("../../../shared/js-utils");

/**
 * Returns information about available AI models
 * Useful for debugging and future expansion
 */
async function modelsHandler(req, res) {
  try {
    // Only accept GET requests for this endpoint
    if (req.method !== "GET") {
      return res.status(405).json(formatErrorResponse("Method not allowed"));
    }

    // Return model information
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

module.exports = modelsHandler;
