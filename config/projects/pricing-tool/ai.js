const { AI_PROVIDERS, AI_MODELS } = require("../../../shared/constants");

module.exports = {
  provider: AI_PROVIDERS.ANTHROPIC,
  model: AI_MODELS.ANTHROPIC.CLAUDE_35_HAIKU, // or CLAUDE_35_SONNET for better creativity

  // System prompt for Claude - sets the personality and behavior
  systemPrompt: `You are a brilliant business consultant who specializes in helping professionals communicate price increases with confidence and authenticity. You have deep industry knowledge across all sectors and understand the psychology of pricing.

Your writing style is:
- Brutally honest but professionally appropriate for LinkedIn
- Industry-savvy (you understand the specific pain points of different fields)
- Confident and slightly fed-up with industry BS
- Shocking enough to make people stop scrolling and think "FINALLY someone said it"
- Packed with insider knowledge that makes readers feel seen and understood

When writing price increase announcements, you:
1. Analyze the specific industry deeply to reference real insider challenges
2. Call out common client behaviors that professionals deal with
3. Use industry-specific language and pain points
4. Make other professionals in that field nod in agreement
5. Balance feisty energy with LinkedIn professionalism
6. Show genuine understanding of what it's like to work in that industry

You never write generic "costs went up" posts. Instead, you dig into the real, specific frustrations and market dynamics of each industry.`,

  // Prefill to start Claude's response in the right direction
  prefill:
    "🔥 PRICING UPDATE 🔥\n\nLet me be real with you for a minute.\n\nI've been",

  // Function to build the complete user prompt from raw inputs
  buildPrompt: function (inputs) {
    const { businessName, services } = inputs;

    return `Create a brutally honest LinkedIn post announcing a price increase for my business:

Business/Professional Name: ${businessName}
Services/What I Do: ${services}

Requirements:
- Format as a LinkedIn post (casual but professional tone)
- Start somewhat diplomatic, then become shockingly direct and feisty
- Analyze my specific industry deeply and show you "get it" - reference industry pain points, client behavior patterns, and market realities that only an insider would know
- Make it feel like you read my mind about the frustrations in this field
- Be bold, slightly shocking, but still professional enough for LinkedIn
- Include industry-specific justifications that hit different than generic "costs went up"
- Show confidence and slight fed-up energy without being unprofessional
- Make other professionals in my field think "FINALLY someone said it"
- Reference specific challenges that ${services} professionals face
- Use language and examples that show deep understanding of the ${services} industry
- Make other ${services} professionals reading this think "This person gets exactly what we deal with"

The post should feel like it was written by someone who truly understands the specific challenges and dynamics of the ${services} industry and has been working as ${businessName} long enough to be fed up with industry nonsense.`;
  },

  parameters: {
    maxTokens: 600,
    temperature: 0.8, // Higher temperature for more creative, bold responses
  },

  fallback: {
    provider: AI_PROVIDERS.OPENAI,
    model: AI_MODELS.OPENAI.GPT_4,
  },
};
