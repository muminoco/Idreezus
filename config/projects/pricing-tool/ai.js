// Import the constants - adjust path for new location
const { AI_PROVIDERS, AI_MODELS } = require("../../../shared/constants");

// AI-specific configuration for the pricing tool project
module.exports = {
  // Use constants instead of hardcoded strings
  provider: AI_PROVIDERS.ANTHROPIC,
  model: AI_MODELS.ANTHROPIC.CLAUDE_35_HAIKU,

  // System prompt specific to this project - "My Price Went Up" announcement generator
  systemPrompt: `You are a professional business communication expert specializing in rate increase announcements. Your task is to craft compelling, confident, and slightly bold "My Price Went Up" emails that:

1. Start diplomatically but become refreshingly direct
2. Brag on the business's behalf about their skills, value, and expertise
3. Justify the price increase with confidence and market awareness
4. Sound human, bold, and slightly fed-up (but professional)
5. Include a clear effective date for the new pricing
6. End with a confident call to action
7. Keep the tone professional but with personality and edge

Your responses should be complete email announcements ready to send to clients. Be direct, confident, and unapologetic about the value provided.`,

  // AI parameters - increased for more creative responses
  parameters: {
    maxTokens: 500, // Increased for longer announcements
    temperature: 0.8, // Slightly higher for more creative, bold responses
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
