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
      // Build the messages array
      const messages = [
        {
          role: "user",
          content: message,
        },
      ];

      // Add prefill if specified in config
      if (this.config.prefill) {
        messages.push({
          role: "assistant",
          content: this.config.prefill,
        });
      }

      // Call Claude API with proper system prompt format
      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: this.config.parameters?.maxTokens || 300,
        temperature: this.config.parameters?.temperature || 0.7,
        system: this.config.systemPrompt, // Proper Claude system prompt
        messages: messages,
      });

      // If we used prefill, combine it with the generated response
      const generatedText = response.content[0].text;
      const fullResponse = this.config.prefill
        ? this.config.prefill + generatedText
        : generatedText;

      return fullResponse;
    } catch (error) {
      console.error("Claude API error:", error);
      throw error;
    }
  }
}

module.exports = ClaudeProvider;
