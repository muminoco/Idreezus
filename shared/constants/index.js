// AI Provider constants - prevents typos and provides autocomplete
const AI_PROVIDERS = {
  OPENAI: "openai",
  ANTHROPIC: "anthropic",
};

// Available AI models - organized by provider for future expansion
const AI_MODELS = {
  OPENAI: {
    GPT_3_5_TURBO: "gpt-3.5-turbo",
    GPT_4: "gpt-4",
    GPT_4_TURBO: "gpt-4-turbo",
    GPT_4O: "gpt-4o",
    GPT_4O_MINI: "gpt-4o-mini",
    GPT_4_1: "gpt-4.1",
    GPT_4_1_MINI: "gpt-4.1-mini",
    GPT_4_1_NANO: "gpt-4.1-nano",
  },
  ANTHROPIC: {
    CLAUDE_35_HAIKU: "claude-3-5-haiku-20241022",
    CLAUDE_35_SONNET: "claude-3-5-sonnet-20241022",
    CLAUDE_3_OPUS: "claude-3-opus-20240229",
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
  AI_PROVIDERS,
  AI_MODELS,
  API_ENDPOINTS,
  BASIC_CHAT_PROMPT,
};
