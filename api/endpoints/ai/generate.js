// Import the official Anthropic SDK
const Anthropic = require("@anthropic-ai/sdk");
const { BASIC_CHAT_PROMPT } = require("../../../shared/constants");
const {
  validateChatInput,
  formatErrorResponse,
} = require("../../../shared/js-utils");

// Initialize the Anthropic client with our API key
// This is what actually talks to Claude's servers
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Main function that handles chat generation requests
 * This is structured as a standalone function so it can easily become
 * a Vercel serverless function later
 */
async function generateHandler(req, res) {
  try {
    // Only accept POST requests (GET wouldn't make sense for sending messages)
    if (req.method !== "POST") {
      return res.status(405).json(formatErrorResponse("Method not allowed"));
    }

    // Extract the user's message from the request body
    const { message } = req.body;

    // Validate the input before sending to Claude
    const validation = validateChatInput(message);
    if (!validation.isValid) {
      return res
        .status(400)
        .json(formatErrorResponse("Invalid input", validation.errors));
    }

    // Create the full prompt for Claude
    // We add our system prompt to give Claude context about how to respond
    const fullPrompt = `${BASIC_CHAT_PROMPT}\n\nUser: ${message}`;

    console.log("Sending message to Claude:", message); // Debug log

    // Make the actual API call to Claude
    const response = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-3-5-haiku-20241022",
      max_tokens: 300, // Limit response length (saves money)
      temperature: 0.7, // How creative/random the response should be (0-1)
      messages: [
        {
          role: "user",
          content: fullPrompt,
        },
      ],
    });

    // Extract the text from Claude's response
    // Claude's API returns an array of content blocks, we want the first one
    const generatedText = response.content[0].text;

    console.log("Received response from Claude"); // Debug log

    // Send successful response back to Webflow
    res.json({
      success: true,
      data: {
        message: generatedText,
        model: process.env.ANTHROPIC_MODEL,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Generate endpoint error:", error);

    // Handle specific API errors with user-friendly messages
    if (error.status === 401) {
      return res.status(401).json(formatErrorResponse("Invalid API key"));
    }

    if (error.status === 429) {
      return res
        .status(429)
        .json(formatErrorResponse("Too many requests - please wait a moment"));
    }

    if (error.status === 400) {
      return res
        .status(400)
        .json(formatErrorResponse("Invalid request to Claude API"));
    }

    // Generic error for anything else
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

module.exports = generateHandler;
