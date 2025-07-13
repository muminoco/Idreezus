// Import dependencies
const { createProvider } = require("./providers");
const { loadProjectConfig } = require("./config-loader");
const {
  validateChatInput,
  validateFormData,
  formatErrorResponse,
} = require("../shared/js-utils");
const { handleCors } = require("../shared/cors-utils"); // Import shared CORS utility

/**
 * Serverless function for AI generation
 * This replaces the Express route handler
 */
export default async function handler(req, res) {
  // Handle CORS setup and preflight - returns true if this was just a preflight check
  // Unlike Express apps, serverless functions need manual CORS handling per request
  if (handleCors(req, res)) return;

  try {
    // Only accept POST requests
    if (req.method !== "POST") {
      return res.status(405).json(formatErrorResponse("Method not allowed"));
    }

    // Extract request data
    const { message, project: projectId, formData } = req.body;

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

    // Handle different input formats
    let validation;
    let finalMessage;

    if (formData) {
      // New multi-input form format
      validation = validateFormData(formData, ["businessName", "services"]);
      if (!validation.isValid) {
        return res
          .status(400)
          .json(formatErrorResponse("Invalid form data", validation.errors));
      }

      // Construct the message from form data
      finalMessage = `Business Name: ${formData.businessName}
Services: ${formData.services}

Create a price increase announcement following the 4-part structure and style of the examples. Focus on what clients in this industry misunderstand and undervalue.

Output only the complete announcement - no analysis or explanation.`;
    } else if (message) {
      // Legacy single message format
      validation = validateChatInput(message);
      if (!validation.isValid) {
        return res
          .status(400)
          .json(formatErrorResponse("Invalid input", validation.errors));
      }
      finalMessage = message;
    } else {
      return res
        .status(400)
        .json(
          formatErrorResponse("No input provided", [
            "Please provide either a message or form data",
          ])
        );
    }

    console.log(
      `Processing request for project: ${projectId}, has form data: ${!!formData}`
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
