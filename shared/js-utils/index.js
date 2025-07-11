/**
 * Validation utilities for user inputs
 */

/**
 * Validates provider and model compatibility
 * @param {string} provider - AI provider name
 * @param {string} model - Model name
 * @returns {Object} - Validation result
 */
function validateProviderModel(provider, model) {
  const { AI_PROVIDERS, AI_MODELS } = require("../constants");

  if (!provider || !model) {
    return {
      isValid: false,
      error: "Provider and model are required",
    };
  }

  // Check if provider is valid
  const validProviders = Object.values(AI_PROVIDERS);
  if (!validProviders.includes(provider.toLowerCase())) {
    return {
      isValid: false,
      error: `Invalid provider: ${provider}. Valid providers: ${validProviders.join(
        ", "
      )}`,
    };
  }

  // Check provider/model compatibility
  switch (provider.toLowerCase()) {
    case AI_PROVIDERS.ANTHROPIC:
    case "claude":
      const claudeModels = Object.values(AI_MODELS.ANTHROPIC || {});
      if (!claudeModels.includes(model)) {
        return {
          isValid: false,
          error: `Invalid Claude model: ${model}. Valid models: ${claudeModels.join(
            ", "
          )}`,
        };
      }
      break;

    case AI_PROVIDERS.OPENAI:
    case "openai":
    case "gpt":
      const openaiModels = Object.values(AI_MODELS.OPENAI || {});
      if (!openaiModels.includes(model)) {
        return {
          isValid: false,
          error: `Invalid OpenAI model: ${model}. Valid models: ${openaiModels.join(
            ", "
          )}`,
        };
      }
      break;

    default:
      return {
        isValid: false,
        error: `Unsupported provider: ${provider}`,
      };
  }

  return {
    isValid: true,
    error: null,
  };
}

/**
 * Validates business name input
 * @param {string} businessName - Business name from user
 * @returns {Object} - Validation result
 */
function validateBusinessName(businessName) {
  const errors = [];

  if (!businessName || typeof businessName !== "string") {
    errors.push("Business name is required");
    return { isValid: false, errors };
  }

  const trimmed = businessName.trim();

  if (trimmed.length === 0) {
    errors.push("Business name cannot be empty");
  }

  if (trimmed.length > 100) {
    errors.push("Business name must be less than 100 characters");
  }

  return {
    isValid: errors.length === 0,
    errors,
    value: trimmed,
  };
}

/**
 * Validates services input
 * @param {string} services - Services description from user
 * @returns {Object} - Validation result
 */
function validateServices(services) {
  const errors = [];

  if (!services || typeof services !== "string") {
    errors.push("Services description is required");
    return { isValid: false, errors };
  }

  const trimmed = services.trim();

  if (trimmed.length === 0) {
    errors.push("Services description cannot be empty");
  }

  if (trimmed.length < 10) {
    errors.push("Services description should be at least 10 characters");
  }

  if (trimmed.length > 500) {
    errors.push("Services description must be less than 500 characters");
  }

  return {
    isValid: errors.length === 0,
    errors,
    value: trimmed,
  };
}

/**
 * Validates raw user inputs for pricing tool
 * @param {Object} inputs - Raw user inputs
 * @returns {Object} - Validation result
 */
function validateRawInputs(inputs) {
  const { businessName, services } = inputs;
  const allErrors = [];

  const businessValidation = validateBusinessName(businessName);
  const servicesValidation = validateServices(services);

  if (!businessValidation.isValid) {
    allErrors.push(...businessValidation.errors);
  }

  if (!servicesValidation.isValid) {
    allErrors.push(...servicesValidation.errors);
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    sanitized: {
      businessName: businessValidation.value,
      services: servicesValidation.value,
    },
  };
}

/**
 * Legacy chat input validation (for backward compatibility)
 * @param {string} message - User's message
 * @returns {Object} - Validation result
 */
function validateChatInput(message) {
  const errors = [];

  if (!message || typeof message !== "string") {
    errors.push("Message is required and must be text");
    return { isValid: false, errors };
  }

  const trimmed = message.trim();

  if (trimmed.length === 0) {
    errors.push("Message cannot be empty");
  }

  if (trimmed.length > 2000) {
    errors.push("Message is too long (max 2000 characters)");
  }

  if (trimmed.length < 10) {
    errors.push("Message is too short (minimum 10 characters)");
  }

  return {
    isValid: errors.length === 0,
    errors,
    value: trimmed,
  };
}

/**
 * Format error response for API
 * @param {string} message - Main error message
 * @param {Array} details - Array of detailed error messages
 * @returns {Object} - Formatted error response
 */
function formatErrorResponse(message, details = []) {
  return {
    success: false,
    error: message,
    details: Array.isArray(details) ? details : [details],
    timestamp: new Date().toISOString(),
  };
}

module.exports = {
  validateProviderModel, // Add this to exports
  validateBusinessName,
  validateServices,
  validateRawInputs,
  validateChatInput, // Keep for backward compatibility
  formatErrorResponse,
};
