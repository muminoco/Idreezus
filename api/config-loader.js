const path = require("path");
const { formatErrorResponse } = require("../shared/js-utils");

/**
 * Loads configuration for a specific project
 * @param {string} projectId - The project identifier
 * @returns {Object} - Project configuration
 */
function loadProjectConfig(projectId) {
  try {
    // Construct path to project config
    const configPath = path.join(
      __dirname,
      "..",
      "projects",
      projectId,
      "config"
    );

    // Load the config (this will load the index.js which exports all configs)
    const config = require(configPath);

    // Validate that AI config exists
    if (!config.ai) {
      throw new Error(`AI configuration not found for project: ${projectId}`);
    }

    return config;
  } catch (error) {
    console.error(`Failed to load config for project ${projectId}:`, error);
    throw new Error(`Invalid project configuration: ${projectId}`);
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
