// Provider factory that creates the appropriate AI client based on config
const ClaudeProvider = require("./claude-provider");
const OpenAIProvider = require("./openai-provider");

/**
 * Factory function that creates the appropriate AI provider
 * @param {Object} aiConfig - Project's AI configuration
 * @returns {Object} - AI provider instance
 */
function createProvider(aiConfig) {
  const { provider } = aiConfig;

  switch (provider.toLowerCase()) {
    case "claude":
    case "anthropic":
      return new ClaudeProvider(aiConfig);

    case "openai":
    case "gpt":
      return new OpenAIProvider(aiConfig);

    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}

module.exports = {
  createProvider,
};
