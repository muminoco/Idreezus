// Wrap everything in an immediately invoked function expression (IIFE)
// This prevents our variables from conflicting with other scripts on the page
(function () {
  "use strict";

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
      BUSINESS_NAME: "business-name", // ID of the business name input field
      SERVICES_INPUT: "services-input", // ID of the services input field
      SUBMIT_BTN: "chat-submit-button", // ID of the submit button
      OUTPUT: "chat-output", // ID of the output paragraph
    },
  };

  // Track if we're currently processing a request
  // This prevents users from sending multiple requests at once
  let isGenerating = false;

  // Utility functions for updating the UI
  function showLoading(element) {
    element.textContent = "Crafting your announcement...";
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
   * Collects and validates all form inputs
   * @returns {Object} - Object with form data and validation result
   */
  function collectFormData() {
    const businessNameElement = document.getElementById(
      CONFIG.ELEMENTS.BUSINESS_NAME
    );
    const servicesElement = document.getElementById(
      CONFIG.ELEMENTS.SERVICES_INPUT
    );

    if (!businessNameElement || !servicesElement) {
      return {
        isValid: false,
        error: "Required form elements not found",
      };
    }

    const businessName = businessNameElement.value.trim();
    const services = servicesElement.value.trim();

    // Validate inputs
    if (!businessName) {
      return {
        isValid: false,
        error: "Please enter your business name",
      };
    }

    if (!services) {
      return {
        isValid: false,
        error: "Please describe your services",
      };
    }

    return {
      isValid: true,
      data: {
        businessName,
        services,
      },
    };
  }

  /**
   * Creates a structured prompt from the form data
   * @param {Object} formData - The collected form data
   * @returns {string} - The formatted prompt for the AI
   */
  function createPrompt(formData) {
    return `Generate a "My Price Went Up" announcement email for a business.

Business Name: ${formData.businessName}
Services: ${formData.services}

Requirements:
1. Start diplomatic but become refreshingly direct
2. Brag on their behalf about their skills and value
3. Justify the price increase with confidence
4. Sound human, bold, and slightly fed-up
5. Include a clear effective date
6. Keep it professional but with personality
7. End with a confident call to action

Example tone: "We're implementing new pricing effective [date]... Let's cut to the chase. Everything costs more now. Your coffee, your rent, our talent. We haven't raised rates in 2 years while our skills improved and your demands increased. Pay the new rate or find someone cheaper who will inevitably disappoint you."`;
  }

  /**
   * Main function that sends the form data to our API
   * @param {Object} formData - The collected form data
   * @returns {Promise} - Promise that resolves with the API response
   */
  async function sendFormDataToAPI(formData) {
    const prompt = createPrompt(formData);

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
          message: prompt,
          project: CONFIG.PROJECT_ID,
          formData: formData, // Include structured data for future use
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

    // Get reference to output element
    const outputElement = document.getElementById(CONFIG.ELEMENTS.OUTPUT);

    // Make sure we found the element
    if (!outputElement) {
      console.error("Output element not found");
      return;
    }

    // Collect and validate form data
    const formResult = collectFormData();
    if (!formResult.isValid) {
      showError(outputElement, formResult.error);
      return;
    }

    try {
      // Set loading state
      isGenerating = true;
      showLoading(outputElement);

      console.log("Sending form data:", formResult.data); // Debug log

      // Send form data to our API
      const result = await sendFormDataToAPI(formResult.data);

      // Handle the response
      if (result.success) {
        console.log("Received response from API:", result.data.message); // Debug log
        showSuccess(outputElement, result.data.message);

        // Clear the form inputs
        const businessNameElement = document.getElementById(
          CONFIG.ELEMENTS.BUSINESS_NAME
        );
        const servicesElement = document.getElementById(
          CONFIG.ELEMENTS.SERVICES_INPUT
        );
        if (businessNameElement) businessNameElement.value = "";
        if (servicesElement) servicesElement.value = "";
      } else {
        showError(outputElement, result.error || "Unknown error occurred");
      }
    } catch (error) {
      console.error("Error:", error);
      showError(
        outputElement,
        error.message || "Failed to generate announcement"
      );
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
      console.log("Price announcement generator initialized"); // Debug log
    } else {
      console.error("Submit button not found");
    }

    // Optional: Allow Enter key to submit from any input field
    const businessNameElement = document.getElementById(
      CONFIG.ELEMENTS.BUSINESS_NAME
    );
    const servicesElement = document.getElementById(
      CONFIG.ELEMENTS.SERVICES_INPUT
    );

    [businessNameElement, servicesElement].forEach((element) => {
      if (element) {
        element.addEventListener("keypress", function (e) {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
        });
      }
    });
  }

  // Start initialization when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
