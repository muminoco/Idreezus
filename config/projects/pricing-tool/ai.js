// Import the constants - adjust path for new location
const { AI_PROVIDERS, AI_MODELS } = require("../../../shared/constants");

// AI-specific configuration for the pricing tool project
module.exports = {
  // Use constants instead of hardcoded strings
  provider: AI_PROVIDERS.ANTHROPIC,
  model: AI_MODELS.ANTHROPIC.CLAUDE_35_HAIKU,

  // System prompt specific to this project
  systemPrompt: `You are a helpful AI assistant. Please respond to the user's message in a friendly and informative way. Keep your response concise (1-2 paragraphs maximum).`,

  // AI parameters
  parameters: {
    maxTokens: 300,
    temperature: 0.7,
  },

  // Fallback configuration using constants
  fallback: {
    provider: AI_PROVIDERS.OPENAI,
    model: AI_MODELS.OPENAI.GPT_3_5_TURBO,
  },

  // Project-specific features
  features: {
    conversationHistory: false,
    contentFiltering: false,
  },
};
