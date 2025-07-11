// Wrap everything in an immediately invoked function expression (IIFE)
// This prevents our variables from conflicting with other scripts on the page
(function () {
  "use strict";
  console.log("Test");

  // Configuration object - all our settings in one place
  const CONFIG = {
    API_BASE_URL: (() => {
      // Get the base URL from where this script was loaded
      const currentScript = document.currentScript;
      if (currentScript && currentScript.src) {
        const scriptUrl = new URL(currentScript.src);
        const baseUrl = `${scriptUrl.protocol}//${scriptUrl.host}`;
        console.log("🔗 Using API from same domain as script:", baseUrl);
        return baseUrl;
      }

      // Fallback to production if we can't detect
      console.log("🚀 Fallback to production API");
      return "https://idreezus.vercel.app";
    })(),
    PROJECT_ID: "pricing-tool", // ← This is the ONLY line you change per project!
    ENDPOINTS: {
      GENERATE: "/api/generate", // Note: removed 'ai/' from path
      MODELS: "/api/models",
      HEALTH: "/api/health",
    },
    ELEMENTS: {
      INPUT: "chat-input", // ID of the input field
      SUBMIT_BTN: "chat-submit-button", // ID of the submit button
      OUTPUT: "chat-output", // ID of the output paragraph
    },
  };

  // Track if we're currently processing a request
  // This prevents users from sending multiple requests at once
  let isGenerating = false;

  // Utility functions for updating the UI
  function showLoading(element) {
    element.textContent = "Thinking...";
    element.style.opacity = "0.5";
  }

  function showError(element, message) {
    element.textContent = `Error: ${message}`;
    element.style.opacity = "1"; // Reset opacity for errors
  }

  function showSuccess(element, content) {
    element.textContent = content;
    element.style.opacity = "1"; // Reset opacity for success
  }

  /**
   * Main function that sends the user's message to our API
   * @param {string} message - The user's input
   * @returns {Promise} - Promise that resolves with the API response
   */
  async function sendMessageToAPI(message) {
    // Make HTTP request to our API
    const response = await fetch(
      `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.GENERATE}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Tell server we're sending JSON
          "X-Requested-With": "XMLHttpRequest", // Helps with CORS
        },
        body: JSON.stringify({
          message: message,
          project: CONFIG.PROJECT_ID,
        }),
      }
    );

    // Check if the request was successful
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  }

  /**
   * Main event handler - called when user clicks submit button
   */
  async function handleSubmit() {
    // Don't do anything if we're already processing a request
    if (isGenerating) return;

    // Get references to our HTML elements
    const inputElement = document.getElementById(CONFIG.ELEMENTS.INPUT);
    const outputElement = document.getElementById(CONFIG.ELEMENTS.OUTPUT);

    // Make sure we found the elements
    if (!inputElement || !outputElement) {
      console.error("Required elements not found");
      return;
    }

    // Get the user's message and validate it
    const userMessage = inputElement.value.trim();
    if (!userMessage) {
      showError(outputElement, "Please enter a message");
      return;
    }

    try {
      // Set loading state
      isGenerating = true;
      showLoading(outputElement);

      console.log("Sending message:", userMessage); // Debug log

      // Send message to our API
      const result = await sendMessageToAPI(userMessage);

      // Handle the response
      if (result.success) {
        console.log("Received response from API:", result.data.message); // Debug log
        showSuccess(outputElement, result.data.message);
        inputElement.value = ""; // Clear the input field
      } else {
        showError(outputElement, result.error || "Unknown error occurred");
      }
    } catch (error) {
      console.error("Error:", error);
      showError(outputElement, error.message || "Failed to get response");
    } finally {
      // Always reset the loading state
      isGenerating = false;
    }
  }

  /**
   * Initialize the script when the page loads
   */
  function init() {
    // Find the submit button and add click event listener
    const submitButton = document.getElementById(CONFIG.ELEMENTS.SUBMIT_BTN);

    if (submitButton) {
      submitButton.addEventListener("click", handleSubmit);
      console.log("Chat interface initialized"); // Debug log
    } else {
      console.error("Submit button not found");
    }

    // Optional: Allow Enter key to submit (like in ChatGPT)
    const inputElement = document.getElementById(CONFIG.ELEMENTS.INPUT);
    if (inputElement) {
      inputElement.addEventListener("keypress", function (e) {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          handleSubmit();
        }
      });
    }
  }

  // Start initialization when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
