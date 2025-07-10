const path = require("path");
const {
  formatErrorResponse,
  validateProviderModel,
} = require("../shared/js-utils");

/**
 * Loads configuration for a specific project
 * @param {string} projectId - The project identifier
 * @returns {Object} - Project configuration
 */
function loadProjectConfig(projectId) {
  try {
    // Handle different environments
    let configPath;

    if (process.env.VERCEL) {
      // In Vercel serverless environment
      configPath = path.join(process.cwd(), "config", "projects", projectId);
    } else {
      // In local development
      configPath = path.join(__dirname, "..", "projects", projectId, "config");
    }

    console.log(`Loading config from: ${configPath}`); // Debug log

    // Load the config (this will load the index.js which exports all configs)
    const config = require(configPath);

    // Validate that AI config exists
    if (!config.ai) {
      throw new Error(`AI configuration not found for project: ${projectId}`);
    }

    // Validate provider/model compatibility
    const validation = validateProviderModel(
      config.ai.provider,
      config.ai.model
    );
    if (!validation.isValid) {
      throw new Error(
        `Invalid AI configuration for project ${projectId}: ${validation.error}`
      );
    }

    // Validate fallback if it exists
    if (config.ai.fallback) {
      const fallbackValidation = validateProviderModel(
        config.ai.fallback.provider,
        config.ai.fallback.model
      );
      if (!fallbackValidation.isValid) {
        throw new Error(
          `Invalid fallback AI configuration for project ${projectId}: ${fallbackValidation.error}`
        );
      }
    }

    console.log(
      `✅ Loaded valid config for project: ${projectId} (${config.ai.provider}/${config.ai.model})`
    );

    return config;
  } catch (error) {
    console.error(`Failed to load config for project ${projectId}:`, error);
    throw new Error(
      `Invalid project configuration: ${projectId} - ${error.message}`
    );
  }
}

/**
 * Gets list of available projects (future utility)
 * @returns {Array} - List of available project IDs
 */
function getAvailableProjects() {
  // This could scan the projects directory in the future
  // For now, return known projects
  return ["pricing-tool"];
}

module.exports = {
  loadProjectConfig,
  getAvailableProjects,
};
