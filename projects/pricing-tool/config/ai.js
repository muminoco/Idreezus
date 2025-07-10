// AI-specific configuration for the pricing tool project
module.exports = {
  // Which AI provider to use as primary
  provider: "openai",

  // Model configuration
  model: "gpt-3.5-turbo",

  // System prompt specific to this project
  systemPrompt: `You are a helpful AI assistant. Please respond to the user's message in a friendly and informative way. Keep your response concise (1-2 paragraphs maximum).`,

  // AI parameters
  parameters: {
    maxTokens: 300,
    temperature: 0.7,
  },

  // Fallback configuration (optional)
  fallback: {
    provider: "openai",
    model: "gpt-3.5-turbo",
  },

  // Project-specific features (future expansion)
  features: {
    conversationHistory: false,
    contentFiltering: false,
  },
};
