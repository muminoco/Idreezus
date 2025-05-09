/**
 * Notecard Component JavaScript
 *
 * This file contains all functionality for notecards:
 * 1. Creating lined paper effect
 * 2. Handling overflow indicators
 */

// IIFE - Keeps all variables and functions private to avoid global namespace pollution
(function () {
  /**
   * NOTECARD LINED PAPER FUNCTIONALITY
   */

  // Creates horizontal lines for a single notecard
  function createNotecardLines(notecard) {
    const contentDiv = notecard.querySelector(".notecard_content");
    const linesDiv = notecard.querySelector(".notecard_lines");

    // Clear any existing lines
    const existingLines = linesDiv.querySelectorAll(
      ".notecard_individual-line"
    );
    existingLines.forEach((line) => line.remove());

    // Get the total height of content that might scroll
    const scrollHeight = contentDiv.scrollHeight;
    const lineSpacing = 32; // 2rem in pixels (assuming 16px base font)

    // Calculate number of lines needed
    const linesNeeded = Math.ceil(scrollHeight / lineSpacing);

    // Create lines (skip the first position as it's the thicker line)
    for (let i = 1; i < linesNeeded; i++) {
      const line = document.createElement("div");
      line.className = "notecard_individual-line";
      line.style.top = `${i * lineSpacing}px`;
      linesDiv.appendChild(line);
    }
  }

  /**
   * NOTECARD OVERFLOW INDICATORS FUNCTIONALITY
   */

  // Sets up and handles overflow indicators for a single notecard
  function handleOverflowIndicators(notecard) {
    const contentDiv = notecard.querySelector(".notecard_content");
    const topIndicator = notecard.querySelector(
      ".notecard_overflow-indicator.is-top"
    );
    const bottomIndicator = notecard.querySelector(
      ".notecard_overflow-indicator.is-bottom"
    );

    // Exit if any required elements are missing
    if (!contentDiv || !topIndicator || !bottomIndicator) {
      return null;
    }

    // Initial check of indicators
    updateIndicators();

    // Listen for scroll events on the content div
    contentDiv.addEventListener("scroll", updateIndicators);

    // Update visibility of top and bottom indicators based on scroll position
    function updateIndicators() {
      const scrollTop = contentDiv.scrollTop;
      const scrollHeight = contentDiv.scrollHeight;
      const clientHeight = contentDiv.clientHeight;
      const isScrolledToBottom = scrollHeight - scrollTop - clientHeight < 2; // 2px buffer

      // Show top indicator if scrolled down
      topIndicator.classList.toggle("is-visible", scrollTop > 10);

      // Show bottom indicator if not at bottom yet
      bottomIndicator.classList.toggle("is-visible", !isScrolledToBottom);
    }

    // Method to refresh indicators (after content changes)
    function refreshIndicators() {
      setTimeout(updateIndicators, 10);
    }

    // Attach refresh method to notecard element for external access
    notecard.refreshOverflowIndicators = refreshIndicators;

    return updateIndicators;
  }

  // Initialize overflow indicators for all notecards on the page
  function initOverflowIndicators() {
    const notecards = document.querySelectorAll(".notecard_item");

    notecards.forEach((notecard) => {
      // Set up overflow indicators for this notecard
      const updateFunction = handleOverflowIndicators(notecard);

      // Refresh indicators after setup (if successful)
      if (notecard.refreshOverflowIndicators) {
        notecard.refreshOverflowIndicators();
      }
    });
  }

  /**
   * INITIALIZATION AND EVENT HANDLING
   */

  // Create a single debounced window resize handler
  function createResizeHandler(notecards) {
    let resizeTimeout;

    return function () {
      clearTimeout(resizeTimeout);

      resizeTimeout = setTimeout(function () {
        notecards.forEach((notecard) => {
          // Re-create lines on resize
          createNotecardLines(notecard);

          // Update indicators after re-creating lines
          if (notecard.refreshOverflowIndicators) {
            notecard.refreshOverflowIndicators();
          }
        });
      }, 250); // 250ms debounce delay
    };
  }

  // Initialize all notecard functionality when the page loads
  window.addEventListener("load", function () {
    // Find all notecards on the page
    const notecards = document.querySelectorAll(".notecard_item");

    // Exit if no notecards found
    if (notecards.length === 0) return;

    // Create lines for each notecard
    notecards.forEach(createNotecardLines);

    // Initialize overflow indicators
    initOverflowIndicators();

    // Set up window resize handler
    window.addEventListener("resize", createResizeHandler(notecards));
  });

  // Expose public methods for external use
  window.NotecardSystem = {
    refreshNotecardLines: function (notecard) {
      createNotecardLines(notecard);
    },
    refreshAllNotecards: function () {
      const notecards = document.querySelectorAll(".notecard_item");
      notecards.forEach(createNotecardLines);
      initOverflowIndicators();
    },
  };
})(); // End of IIFE
