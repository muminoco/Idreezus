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
      OUTPUT_WRAPPER: "output-wrapper", // ID of the output wrapper div (moved from chat-output)
      FORM_CARD: "form-card", // ID of the form container
      LOADING: "loading", // ID of the loading div
      LOADING_TEXT: "loading-text", // ID of the loading text element
      RESULTS: "results", // ID of the results div
      BUSINESS_NAME_CTA: "business-name-cta", // ID of the CTA business name text block
    },
    LOADING_TEXTS: [
      "Calculating pettiness...",
      "Recognizing your worth...",
      "Processing bullshit you've endured...",
      "Measuring your tolerance...",
      "Defending your craftsmanship...",
      "Demanding proper respect...",
    ],
    ANIMATION_DURATION: 0.5, // Duration for main animations
    TEXT_ROTATION_DURATION: 2000, // Duration between text rotations (in ms)
  };

  // Track if we're currently processing a request
  // This prevents users from sending multiple requests at once
  let isGenerating = false;
  let loadingTextInterval = null;
  let currentLoadingTextIndex = 0;

  // Animation helper functions
  function smoothScrollToTop() {
    return new Promise((resolve) => {
      gsap.to(window, {
        duration: 0.8,
        scrollTo: { y: 0, autoKill: false },
        ease: "power2.inOut",
        onComplete: resolve,
      });
    });
  }

  function animateFormOut() {
    const formCard = document.getElementById(CONFIG.ELEMENTS.FORM_CARD);
    if (!formCard) return Promise.resolve();

    return new Promise((resolve) => {
      gsap.to(formCard, {
        duration: CONFIG.ANIMATION_DURATION,
        opacity: 0,
        y: -30,
        ease: "power2.inOut",
        onComplete: () => {
          gsap.set(formCard, { display: "none" });
          resolve();
        },
      });
    });
  }

  function animateLoadingIn() {
    const loadingDiv = document.getElementById(CONFIG.ELEMENTS.LOADING);
    if (!loadingDiv) return Promise.resolve();

    return new Promise((resolve) => {
      gsap.set(loadingDiv, { display: "flex", opacity: 0, y: 30 });
      gsap.to(loadingDiv, {
        duration: CONFIG.ANIMATION_DURATION,
        opacity: 1,
        y: 0,
        ease: "power2.inOut",
        onComplete: resolve,
      });
    });
  }

  function animateLoadingOut() {
    const loadingDiv = document.getElementById(CONFIG.ELEMENTS.LOADING);
    if (!loadingDiv) return Promise.resolve();

    return new Promise((resolve) => {
      gsap.to(loadingDiv, {
        duration: CONFIG.ANIMATION_DURATION,
        opacity: 0,
        y: -30,
        ease: "power2.inOut",
        onComplete: () => {
          gsap.set(loadingDiv, { display: "none" });
          resolve();
        },
      });
    });
  }

  function animateResultsIn() {
    const resultsDiv = document.getElementById(CONFIG.ELEMENTS.RESULTS);
    if (!resultsDiv) return Promise.resolve();

    return new Promise((resolve) => {
      gsap.set(resultsDiv, { display: "flex", opacity: 0, y: 30 });
      gsap.to(resultsDiv, {
        duration: CONFIG.ANIMATION_DURATION,
        opacity: 1,
        y: 0,
        ease: "power2.inOut",
        onComplete: resolve,
      });
    });
  }

  function startLoadingTextRotation() {
    const loadingTextElement = document.getElementById(
      CONFIG.ELEMENTS.LOADING_TEXT
    );
    if (!loadingTextElement) return;

    // Set initial text
    currentLoadingTextIndex = 0;
    loadingTextElement.textContent =
      CONFIG.LOADING_TEXTS[currentLoadingTextIndex];

    // Start the rotation
    loadingTextInterval = setInterval(() => {
      currentLoadingTextIndex =
        (currentLoadingTextIndex + 1) % CONFIG.LOADING_TEXTS.length;
      const nextText = CONFIG.LOADING_TEXTS[currentLoadingTextIndex];

      // Animate text change with a smooth fade
      gsap.to(loadingTextElement, {
        duration: 0.3,
        opacity: 0,
        y: -10,
        ease: "power2.inOut",
        onComplete: () => {
          loadingTextElement.textContent = nextText;
          gsap.to(loadingTextElement, {
            duration: 0.3,
            opacity: 1,
            y: 0,
            ease: "power2.inOut",
          });
        },
      });
    }, CONFIG.TEXT_ROTATION_DURATION);
  }

  function stopLoadingTextRotation() {
    if (loadingTextInterval) {
      clearInterval(loadingTextInterval);
      loadingTextInterval = null;
    }
  }

  /**
   * Splits API response into paragraphs and creates DOM elements
   * @param {string} content - The API response content
   * @returns {Array} - Array of paragraph elements
   */
  function createParagraphElements(content) {
    // Split on double line breaks to separate paragraphs
    const paragraphs = content
      .split(/\n\n+/) // Split on two or more consecutive line breaks
      .map((p) => p.trim()) // Remove leading/trailing whitespace
      .filter((p) => p.length > 0); // Remove empty paragraphs

    // Create paragraph elements
    return paragraphs.map((paragraphText) => {
      const p = document.createElement("p");
      p.className = "pr_1_output-text";
      p.textContent = paragraphText;
      return p;
    });
  }

  /**
   * Updates the output wrapper with new content
   * @param {string} content - The content to display
   * @param {boolean} isError - Whether this is an error message
   */
  function updateOutputContent(content, isError = false) {
    const outputWrapper = document.getElementById(
      CONFIG.ELEMENTS.OUTPUT_WRAPPER
    );
    if (!outputWrapper) return;

    // Clear existing content
    outputWrapper.innerHTML = "";

    if (isError) {
      // For errors, create a single paragraph with error styling
      const errorP = document.createElement("p");
      errorP.className = "pr_1_output-text";
      errorP.textContent = `Error: ${content}`;
      errorP.style.opacity = "1";
      outputWrapper.appendChild(errorP);
    } else {
      // For success, create multiple paragraphs
      const paragraphElements = createParagraphElements(content);

      // If no paragraphs were created (shouldn't happen), create one with the full content
      if (paragraphElements.length === 0) {
        const fallbackP = document.createElement("p");
        fallbackP.className = "pr_1_output-text";
        fallbackP.textContent = content;
        paragraphElements.push(fallbackP);
      }

      // Append all paragraphs to the wrapper
      paragraphElements.forEach((p) => {
        p.style.opacity = "1";
        outputWrapper.appendChild(p);
      });
    }
  }

  // Utility functions for updating the UI (updated for new structure)
  function showLoading(wrapper) {
    updateOutputContent("Crafting your announcement...");
    wrapper.style.opacity = "0.5";
  }

  function showError(wrapper, message) {
    updateOutputContent(message, true);
    wrapper.style.opacity = "1";
  }

  function showSuccess(wrapper, content) {
    updateOutputContent(content);
    wrapper.style.opacity = "1";
  }

  function showErrorInResults(message) {
    const resultsDiv = document.getElementById(CONFIG.ELEMENTS.RESULTS);
    const outputWrapper = document.getElementById(
      CONFIG.ELEMENTS.OUTPUT_WRAPPER
    );

    if (outputWrapper) {
      showError(outputWrapper, message);
    }

    if (resultsDiv) {
      gsap.set(resultsDiv, { display: "flex", opacity: 0, y: 30 });
      gsap.to(resultsDiv, {
        duration: CONFIG.ANIMATION_DURATION,
        opacity: 1,
        y: 0,
        ease: "power2.inOut",
      });
    }
  }

  function showSuccessInResults(content, businessName) {
    const resultsDiv = document.getElementById(CONFIG.ELEMENTS.RESULTS);
    const outputWrapper = document.getElementById(
      CONFIG.ELEMENTS.OUTPUT_WRAPPER
    );
    const businessNameCTA = document.getElementById(
      CONFIG.ELEMENTS.BUSINESS_NAME_CTA
    );

    if (outputWrapper) {
      showSuccess(outputWrapper, content);
    }

    // Update the CTA with the business name
    if (businessNameCTA && businessName) {
      businessNameCTA.textContent = businessName + "?";
    }

    if (resultsDiv) {
      gsap.set(resultsDiv, { display: "flex", opacity: 0, y: 30 });
      gsap.to(resultsDiv, {
        duration: CONFIG.ANIMATION_DURATION,
        opacity: 1,
        y: 0,
        ease: "power2.inOut",
      });
    }
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
    return `Business Name: ${formData.businessName}
Services: ${formData.services}

Create a price increase announcement following the 4-part structure and style of the examples. Focus on what clients in this industry misunderstand and undervalue.

Output only the complete announcement - no analysis or explanation.`;
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

    // Collect and validate form data first
    const formResult = collectFormData();
    if (!formResult.isValid) {
      const outputWrapper = document.getElementById(
        CONFIG.ELEMENTS.OUTPUT_WRAPPER
      );
      if (outputWrapper) {
        showError(outputWrapper, formResult.error);
      }
      return;
    }

    try {
      // Set loading state
      isGenerating = true;

      console.log("Sending form data:", formResult.data); // Debug log

      // Start the animation sequence
      // 1. Scroll to top first, then animate form out
      await smoothScrollToTop();
      await animateFormOut();

      // 2. Animate loading in and start text rotation
      await animateLoadingIn();
      startLoadingTextRotation();

      // 3. Send form data to our API (this happens while loading animation is running)
      const result = await sendFormDataToAPI(formResult.data);

      // 4. Stop loading text rotation
      stopLoadingTextRotation();

      // 5. Animate loading out
      await animateLoadingOut();

      // 6. Scroll to top again before showing results
      await smoothScrollToTop();

      // 7. Handle the response and show results
      if (result.success) {
        console.log("Received response from API:", result.data.message); // Debug log
        showSuccessInResults(result.data.message, formResult.data.businessName);

        // Clear the form inputs for next use
        const businessNameElement = document.getElementById(
          CONFIG.ELEMENTS.BUSINESS_NAME
        );
        const servicesElement = document.getElementById(
          CONFIG.ELEMENTS.SERVICES_INPUT
        );
        if (businessNameElement) businessNameElement.value = "";
        if (servicesElement) servicesElement.value = "";
      } else {
        showErrorInResults(result.error || "Unknown error occurred");
      }
    } catch (error) {
      console.error("Error:", error);

      // Stop loading animation and show error
      stopLoadingTextRotation();
      await animateLoadingOut();

      // Scroll to top before showing error
      await smoothScrollToTop();
      showErrorInResults(error.message || "Failed to generate announcement");
    } finally {
      // Always reset the loading state
      isGenerating = false;
    }
  }

  /**
   * Reset the entire form to initial state
   */
  function resetToInitialState() {
    // Stop any ongoing animations
    stopLoadingTextRotation();

    // Hide loading and results, show form
    const formCard = document.getElementById(CONFIG.ELEMENTS.FORM_CARD);
    const loadingDiv = document.getElementById(CONFIG.ELEMENTS.LOADING);
    const resultsDiv = document.getElementById(CONFIG.ELEMENTS.RESULTS);
    const businessNameCTA = document.getElementById(
      CONFIG.ELEMENTS.BUSINESS_NAME_CTA
    );
    const outputWrapper = document.getElementById(
      CONFIG.ELEMENTS.OUTPUT_WRAPPER
    );

    if (formCard) {
      gsap.set(formCard, { display: "block", opacity: 1, y: 0 });
    }
    if (loadingDiv) {
      gsap.set(loadingDiv, { display: "none", opacity: 0, y: 30 });
    }
    if (resultsDiv) {
      gsap.set(resultsDiv, { display: "none", opacity: 0, y: 30 });
    }

    // Clear output content
    if (outputWrapper) {
      outputWrapper.innerHTML = "";
    }

    // Reset CTA text to default
    if (businessNameCTA) {
      businessNameCTA.textContent = "Your Business?";
    }

    // Reset loading state
    isGenerating = false;
  }

  /**
   * Initialize the script when the page loads
   */
  function init() {
    // Ensure initial state is correct
    resetToInitialState();

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

    // Optional: Add a way to reset back to the form (useful for testing)
    // You can add a button with id "reset-form" to trigger this
    const resetButton = document.getElementById("reset-form");
    if (resetButton) {
      resetButton.addEventListener("click", resetToInitialState);
    }
  }

  // Start initialization when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
