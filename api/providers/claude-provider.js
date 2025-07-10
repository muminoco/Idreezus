const Anthropic = require("@anthropic-ai/sdk");
const BaseProvider = require("./base-provider");

class ClaudeProvider extends BaseProvider {
  constructor(config) {
    super(config);

    // Initialize Anthropic client
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async generateResponse(message) {
    try {
      // Create the full prompt with system message
      const fullPrompt = `${this.config.systemPrompt}\n\nUser: ${message}`;

      // Call Claude API
      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: this.config.parameters.maxTokens,
        temperature: this.config.parameters.temperature,
        messages: [
          {
            role: "user",
            content: fullPrompt,
          },
        ],
      });

      return response.content[0].text;
    } catch (error) {
      console.error("Claude API error:", error);
      throw error;
    }
  }
}

module.exports = ClaudeProvider;
