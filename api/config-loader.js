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
    let configPath;
    let config;

    // Try the new structure first (config/projects/projectId)
    try {
      if (process.env.VERCEL) {
        // In Vercel serverless environment
        configPath = path.join(process.cwd(), "config", "projects", projectId);
      } else {
        // In local development - try new structure
        configPath = path.join(
          __dirname,
          "..",
          "config",
          "projects",
          projectId
        );
      }

      console.log(`Trying config path: ${configPath}`);
      config = require(configPath);
      console.log(`✅ Found config at: ${configPath}`);
    } catch (newStructureError) {
      console.log(`Config not found at new location, trying old structure...`);

      // Fallback to old structure (projects/projectId/config)
      if (process.env.VERCEL) {
        configPath = path.join(process.cwd(), "projects", projectId, "config");
      } else {
        configPath = path.join(
          __dirname,
          "..",
          "projects",
          projectId,
          "config"
        );
      }

      console.log(`Trying fallback config path: ${configPath}`);
      config = require(configPath);
      console.log(`✅ Found config at fallback location: ${configPath}`);
    }

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
  return ["pricing-tool"];
}

module.exports = {
  loadProjectConfig,
  getAvailableProjects,
};
