// Project configuration
const CONFIG = {
  PROJECT_ID: "pricing-tool",
};

// Determine API base URL based on script origin
const currentScript = document.currentScript;
const scriptSrc = currentScript ? currentScript.src : "";
const isLocalDev = scriptSrc.includes("localhost");
const API_BASE_URL = isLocalDev
  ? "https://localhost:3001"
  : "https://idreezus.vercel.app";

// DOM elements
const businessNameInput = document.getElementById("business-name");
const servicesInput = document.getElementById("services-input");
const submitButton = document.getElementById("chat-submit-button");
const outputElement = document.getElementById("chat-output");

// Validation function
function validateInputs() {
  const businessName = businessNameInput.value.trim();
  const services = servicesInput.value.trim();

  if (!businessName) {
    alert("Please enter your business name");
    businessNameInput.focus();
    return false;
  }

  if (!services) {
    alert("Please describe what services you provide");
    servicesInput.focus();
    return false;
  }

  return true;
}

// Create combined prompt from multiple inputs
function createPrompt() {
  const businessName = businessNameInput.value.trim();
  const services = servicesInput.value.trim();

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

The post should feel like it was written by someone who truly understands the specific challenges and dynamics of my industry.`;
}

// API call function
async function generateAnnouncement() {
  if (!validateInputs()) return;

  // Update UI state
  submitButton.disabled = true;
  submitButton.textContent = "Generating...";
  outputElement.textContent = "Crafting your brutally honest announcement...";

  try {
    const prompt = createPrompt();

    const response = await fetch(`${API_BASE_URL}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: prompt,
        project: CONFIG.PROJECT_ID,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    // Display the generated announcement - backend returns data.data.message
    const aiResponse =
      data.data?.message || data.response || "No response received";
    outputElement.innerHTML = aiResponse.replace(/\n/g, "<br>");
  } catch (error) {
    console.error("Error generating announcement:", error);
    outputElement.textContent = `Error: ${error.message}. Please try again.`;
  } finally {
    // Reset button state
    submitButton.disabled = false;
    submitButton.textContent = "Generate My Announcement";
  }
}

// Event listeners
document.addEventListener("DOMContentLoaded", function () {
  // Submit button click handler
  submitButton.addEventListener("click", generateAnnouncement);

  // Enter key handlers for inputs
  businessNameInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      servicesInput.focus();
    }
  });

  servicesInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      generateAnnouncement();
    }
  });

  // Optional: Clear output only on explicit button click, not when typing
  // Removed auto-clear functionality to keep previous results visible
});

// Initialize
console.log("Price Increase Announcement Generator loaded");
console.log("API Base URL:", API_BASE_URL);
console.log("Project ID:", CONFIG.PROJECT_ID);
