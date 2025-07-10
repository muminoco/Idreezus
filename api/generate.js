// Import dependencies
const { createProvider } = require("./providers");
const { loadProjectConfig } = require("./config-loader");
const {
  validateChatInput,
  formatErrorResponse,
} = require("../shared/js-utils");

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
 * Serverless function for AI generation
 * This replaces the Express route handler
 */
export default async function handler(req, res) {
  // Get proper CORS headers for this request
  const corsHeaders = getCorsHeaders(req);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    Object.keys(corsHeaders).forEach((key) => {
      res.setHeader(key, corsHeaders[key]);
    });
    return res.status(200).end();
  }

  // Set CORS headers for all responses
  Object.keys(corsHeaders).forEach((key) => {
    res.setHeader(key, corsHeaders[key]);
  });

  try {
    // Only accept POST requests
    if (req.method !== "POST") {
      return res.status(405).json(formatErrorResponse("Method not allowed"));
    }

    // Extract request data
    const { message, project: projectId } = req.body;

    // Validate required fields
    if (!projectId) {
      return res
        .status(400)
        .json(
          formatErrorResponse("Project ID is required", [
            "Please specify which project this request is for",
          ])
        );
    }

    // Validate the message
    const validation = validateChatInput(message);
    if (!validation.isValid) {
      return res
        .status(400)
        .json(formatErrorResponse("Invalid input", validation.errors));
    }

    console.log(
      `Processing request for project: ${projectId}, message: ${message}`
    );

    // Load project configuration
    let projectConfig;
    try {
      projectConfig = loadProjectConfig(projectId);
    } catch (configError) {
      return res
        .status(400)
        .json(
          formatErrorResponse("Invalid project configuration", [
            configError.message,
          ])
        );
    }

    // Create AI provider based on project config
    let provider;
    try {
      provider = createProvider(projectConfig.ai);
    } catch (providerError) {
      return res
        .status(500)
        .json(
          formatErrorResponse("Failed to initialize AI provider", [
            providerError.message,
          ])
        );
    }

    console.log(
      `Using AI provider: ${projectConfig.ai.provider} with model: ${projectConfig.ai.model}`
    );

    // Generate response using the provider
    let aiResponse;
    try {
      aiResponse = await provider.generateResponse(message);
    } catch (aiError) {
      console.error("AI generation error:", aiError);

      // Try fallback if configured
      if (projectConfig.ai.fallback) {
        console.log("Trying fallback provider...");
        try {
          const fallbackProvider = createProvider({
            ...projectConfig.ai,
            provider: projectConfig.ai.fallback.provider,
            model: projectConfig.ai.fallback.model,
          });
          aiResponse = await fallbackProvider.generateResponse(message);
        } catch (fallbackError) {
          console.error("Fallback also failed:", fallbackError);
          throw aiError; // Throw original error
        }
      } else {
        throw aiError;
      }
    }

    console.log("Successfully generated AI response");

    // Send successful response
    res.json({
      success: true,
      data: {
        message: aiResponse,
        provider: projectConfig.ai.provider,
        model: projectConfig.ai.model,
        project: projectId,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Generate endpoint error:", error);

    // Handle specific errors
    if (error.status === 401) {
      return res.status(401).json(formatErrorResponse("Invalid API key"));
    }

    if (error.status === 429) {
      return res
        .status(429)
        .json(formatErrorResponse("Too many requests - please wait"));
    }

    // Generic error
    res
      .status(500)
      .json(
        formatErrorResponse(
          "Failed to generate response",
          process.env.NODE_ENV === "development"
            ? [error.message]
            : ["Internal server error"]
        )
      );
  }
}
