// Import the constants - adjust path for new location
const { AI_PROVIDERS, AI_MODELS } = require("../../../shared/constants");

// AI-specific configuration for the pricing tool project
module.exports = {
  // Use constants instead of hardcoded strings
  provider: AI_PROVIDERS.ANTHROPIC,
  model: AI_MODELS.ANTHROPIC.CLAUDE_35_HAIKU,

  // System prompt specific to this project - "My Price Went Up" announcement generator
  systemPrompt: `Mimic the EXACT style of these examples but for the given business:

EXAMPLES OF PROPER EXECUTION:

EXAMPLE 1 - Web Designer/Developer:
Hello everyone,

I regret to inform you of adjustments to our pricing.

Actually, no. Let me be real. I've been charging 2015 prices while dealing with 2025 client expectations and my accountant thinks I hate money.

Adobe raised prices again. Hosting raised prices again. Eggs raised pricing again. Meanwhile, clients want seventeen revisions for free because "I don't think the color orange fits our brand anymore."

Look, I don't make pretty pictures for your wall. I solve your actual business problems. While your competitors have websites that convert like broken vending machines, you get work that brings in customers and revenue.

Thank you for your understanding as we implement these necessary adjustments.

EXAMPLE 2 - Wedding Planner:
Hello everyone,

We regret to announce some changes to our pricing structure.

Actually, no regrets. Vendor prices doubled. My liability insurance costs more than most wedding dress budgets. Meanwhile, everyone thinks wedding planning is making Pinterest boards.

People want $50,000 weddings on $15,000 budgets. Everyone's a wedding expert until their DJ vanishes or rain hits their outdoor ceremony.

Look, I turn your most stressful day into your most perfect day. While other couples have meltdowns, you get to enjoy your wedding.

Thank you for understanding as we implement these adjustments to reflect current market conditions.

EXAMPLE 3 - Accountant:
Hello everyone,

I regret to announce adjustments to our pricing structure.

Actually, forget regrets. Professional licensing costs more than mortgage payments. Tax software subscriptions cost more than vacations. Meanwhile, clients think tax prep is filling out restaurant surveys.

People say "just run it through TurboTax" like I'm some calculator-addicted paper pusher. Everyone's an expert until the IRS comes knocking and they're scrambling like ants.

Look, I keep you out of federal prison while maximizing refunds. While other accountants crank out cookie-cutter returns, you get strategies that save money.

I appreciate your continued trust and look forward to our ongoing partnership..

TONE REQUIREMENTS:
- Use simple, easily understood language
- Make industry professionals think "someone finally said it"
- Mix business costs with universal life costs for relatability
- Focus heavily on client misconceptions and what they undervalue - this is where the best relatable humor comes from
- Stream-of-consciousness feeling in the middle section

DO NOT USE:
- Marketing style language
- Adverbs

LENGTH: Keep under 100-120 words total. Be concise but punchy.`,

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
