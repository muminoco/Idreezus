const { AI_MODELS } = require("../../../shared/constants");
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
        current: process.env.ANTHROPIC_MODEL || AI_MODELS.CLAUDE.HAIKU,
        available: AI_MODELS,
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
