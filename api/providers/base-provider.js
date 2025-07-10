// Base class that all AI providers must implement
// This ensures consistency across different AI providers
class BaseProvider {
  constructor(config) {
    this.config = config;
  }

  /**
   * Generate a response from the AI provider
   * @param {string} message - User's message
   * @returns {Promise<string>} - AI response
   */
  async generateResponse(message) {
    throw new Error("generateResponse must be implemented by provider");
  }

  /**
   * Get information about the provider
   * @returns {Object} - Provider info
   */
  getInfo() {
    return {
      provider: this.config.provider,
      model: this.config.model,
    };
  }
}

module.exports = BaseProvider;
