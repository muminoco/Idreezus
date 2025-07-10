/**
 * Validates that user input isn't empty or just whitespace
 * @param {string} message - The user's message
 * @returns {Object} - Validation result with isValid boolean and errors array
 */
function validateChatInput(message) {
  const errors = [];

  // Check if message exists and isn't just empty space
  if (!message || !message.trim()) {
    errors.push("Message cannot be empty");
  }

  // Check if message is too long (Claude has token limits)
  if (message && message.length > 4000) {
    errors.push("Message is too long (maximum 4000 characters)");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param {string} str - String to sanitize
 * @returns {string} - Sanitized string
 */
function sanitizeHtml(str) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };

  return str.replace(/[&<>"'/]/g, (s) => map[s]);
}

/**
 * Formats error messages for consistent API responses
 * @param {string} message - Error message
 * @param {Array} details - Additional error details
 * @returns {Object} - Formatted error response
 */
function formatErrorResponse(message, details = []) {
  return {
    error: message,
    details: details,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Validates that a model is compatible with the specified provider
 * @param {string} provider - The AI provider (e.g., 'openai', 'anthropic')
 * @param {string} model - The model name to validate
 * @returns {Object} - Validation result with isValid boolean and error message
 */
function validateProviderModel(provider, model) {
  const { AI_PROVIDERS, AI_MODELS } = require("../constants");

  // Find the provider key (e.g., 'OPENAI' for provider 'openai')
  const providerKey = Object.keys(AI_PROVIDERS).find(
    (key) => AI_PROVIDERS[key] === provider
  );

  if (!providerKey) {
    return {
      isValid: false,
      error: `Unknown provider: ${provider}. Valid providers: ${Object.values(
        AI_PROVIDERS
      ).join(", ")}`,
    };
  }

  // Get valid models for this provider
  const validModels = Object.values(AI_MODELS[providerKey]);

  if (!validModels.includes(model)) {
    return {
      isValid: false,
      error: `Model '${model}' is not valid for provider '${provider}'. Valid models: ${validModels.join(
        ", "
      )}`,
    };
  }

  return {
    isValid: true,
    error: null,
  };
}

module.exports = {
  validateChatInput,
  sanitizeHtml,
  formatErrorResponse,
  validateProviderModel, // ← ADD THIS LINE
};
