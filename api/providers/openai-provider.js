const OpenAI = require("openai");
const BaseProvider = require("./base-provider");

class OpenAIProvider extends BaseProvider {
  constructor(config) {
    super(config);

    // Initialize OpenAI client
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateResponse(message) {
    try {
      // Call OpenAI API
      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages: [
          { role: "system", content: this.config.systemPrompt },
          { role: "user", content: message },
        ],
        max_tokens: this.config.parameters.maxTokens,
        temperature: this.config.parameters.temperature,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error("OpenAI API error:", error);
      throw error;
    }
  }
}

module.exports = OpenAIProvider;
