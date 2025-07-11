/* Serverless File */

const { createProvider } = require("./providers");
const { loadProjectConfig } = require("./config-loader");
const { formatErrorResponse } = require("../shared/js-utils");
const { handleCors } = require("../shared/cors-utils");

/**
 * Serverless function for AI generation
 * Now handles raw inputs and builds prompts server-side
 */
export default async function handler(req, res) {
  // Add this at the very top of your handler function, before anything else:
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://idreezusstaging.webflow.io"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  // Handle CORS setup and preflight
  if (handleCors(req, res)) return;

  try {
    // Only accept POST requests
    if (req.method !== "POST") {
      return res.status(405).json(formatErrorResponse("Method not allowed"));
    }

    // Extract request data - now expects raw inputs instead of pre-built message
    const { businessName, services, project: projectId, message } = req.body;

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

    // Support both old format (message) and new format (businessName, services)
    let userInputs;
    if (message) {
      // Old format - for backward compatibility
      userInputs = { message };
    } else {
      // New format - raw inputs
      if (!businessName || !services) {
        return res
          .status(400)
          .json(
            formatErrorResponse("Business name and services are required", [
              "Please provide both business name and services description",
            ])
          );
      }

      // Validate inputs
      if (businessName.trim().length === 0 || services.trim().length === 0) {
        return res
          .status(400)
          .json(
            formatErrorResponse("Invalid input", [
              "Business name and services cannot be empty",
            ])
          );
      }

      userInputs = {
        businessName: businessName.trim(),
        services: services.trim(),
      };
    }

    console.log(
      `Processing request for project: ${projectId}`,
      userInputs.message
        ? "with pre-built message"
        : `for business: ${userInputs.businessName}`
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

    // Build the prompt using the project's buildPrompt function
    let finalMessage;
    if (userInputs.message) {
      // Old format - use message as-is
      finalMessage = userInputs.message;
    } else {
      // New format - build prompt from raw inputs
      if (typeof projectConfig.ai.buildPrompt !== "function") {
        return res
          .status(500)
          .json(
            formatErrorResponse("Project configuration error", [
              "buildPrompt function not found in project config",
            ])
          );
      }

      try {
        finalMessage = projectConfig.ai.buildPrompt(userInputs);
      } catch (promptError) {
        return res
          .status(500)
          .json(
            formatErrorResponse("Failed to build prompt", [promptError.message])
          );
      }
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
      aiResponse = await provider.generateResponse(finalMessage);
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
          aiResponse = await fallbackProvider.generateResponse(finalMessage);
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
