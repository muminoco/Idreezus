// Available AI models - organized by provider for future expansion
const AI_MODELS = {
  CLAUDE: {
    HAIKU: "claude-3-5-haiku-20241022", // Fastest, cheapest
    SONNET: "claude-3-5-sonnet-20241022", // Balanced
    OPUS: "claude-3-opus-20240229", // Most capable, expensive
  },
  // Ready for future expansion when you add other AI providers
  OPENAI: {
    GPT4: "gpt-4",
    GPT3_5: "gpt-3.5-turbo",
  },
  GEMINI: {
    PRO: "gemini-pro",
  },
};

// API endpoint paths - centralized so we can change them easily
const API_ENDPOINTS = {
  GENERATE: "/api/ai/generate",
  MODELS: "/api/ai/models",
  HEALTH: "/api/health",
};

// Basic chat prompt for Claude
const BASIC_CHAT_PROMPT = `You are a helpful AI assistant. Please respond to the user's message in a friendly and informative way. Keep your response concise (1-2 paragraphs maximum).`;

module.exports = {
  AI_MODELS,
  API_ENDPOINTS,
  BASIC_CHAT_PROMPT,
};
