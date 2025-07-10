const OpenAI = require("openai");
const { BASIC_CHAT_PROMPT } = require("../../../shared/constants");
const {
  validateChatInput,
  formatErrorResponse,
} = require("../../../shared/js-utils");

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateOpenAIHandler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json(formatErrorResponse("Method not allowed"));
    }

    const { message } = req.body;
    const validation = validateChatInput(message);
    if (!validation.isValid) {
      return res
        .status(400)
        .json(formatErrorResponse("Invalid input", validation.errors));
    }

    console.log("Sending message to OpenAI:", message);

    // OpenAI API call (different structure than Claude)
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
      messages: [
        { role: "system", content: BASIC_CHAT_PROMPT },
        { role: "user", content: message },
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const generatedText = response.choices[0].message.content;

    res.json({
      success: true,
      data: {
        message: generatedText,
        model: process.env.OPENAI_MODEL,
        provider: "openai",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("OpenAI endpoint error:", error);
    res.status(500).json(formatErrorResponse("Failed to generate response"));
  }
}

module.exports = generateOpenAIHandler;
