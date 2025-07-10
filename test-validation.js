const { validateProviderModel } = require("./shared/js-utils");

// Test valid combinations
console.log(
  "Valid - OpenAI + GPT-4:",
  validateProviderModel("openai", "gpt-4")
);
console.log(
  "Valid - Anthropic + Claude:",
  validateProviderModel("anthropic", "claude-3-5-haiku-20241022")
);

// Test invalid combinations (should fail)
console.log(
  "Invalid - OpenAI + Claude:",
  validateProviderModel("openai", "claude-3-5-haiku-20241022")
);
console.log(
  "Invalid - Anthropic + GPT:",
  validateProviderModel("anthropic", "gpt-4")
);
console.log(
  "Invalid - Bad provider:",
  validateProviderModel("google", "gpt-4")
);
