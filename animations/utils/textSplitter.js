/**
 * Valid split types for text animations
 * @readonly
 * @enum {string}
 */
export const SPLIT_TYPES = {
  LINES: "lines",
  WORDS: "words",
  CHARS: "chars",
};

/**
 * Validates the requested split types against available options
 * @param {string[]} requestedTypes - Array of split types to validate
 * @returns {boolean} - True if all requested types are valid
 */
function validateSplitTypes(requestedTypes) {
  if (!Array.isArray(requestedTypes)) {
    return false;
  }

  const validTypes = Object.values(SPLIT_TYPES);
  return requestedTypes.every((type) =>
    validTypes.includes(type.toLowerCase())
  );
}

/**
 * Formats split types into the required string format for SplitText
 * @param {string[]} types - Array of split types
 * @returns {string} Comma-separated string of split types
 */
function formatSplitTypes(types) {
  return types.join(",").toLowerCase();
}

/**
 * Splits text elements for animation using SplitText
 * @param {HTMLElement|string} element - DOM element or selector to split
 * @param {string|string[]} types - Single split type or array of types ('lines', 'words', 'chars')
 * @param {Object} [options={}] - Additional SplitText options
 * @returns {SplitText|null} SplitText instance or null if invalid
 * @throws {Error} If element is not found or split types are invalid
 */
export function splitTextForAnimation(element, types, options = {}) {
  // Validate element
  const targetElement =
    typeof element === "string" ? document.querySelector(element) : element;

  if (!targetElement) {
    throw new Error("Invalid element: Element not found in DOM");
  }

  // Normalize types to array
  const splitTypes = Array.isArray(types) ? types : [types];

  // Validate split types
  if (!validateSplitTypes(splitTypes)) {
    throw new Error(
      `Invalid split type(s). Valid options are: ${Object.values(
        SPLIT_TYPES
      ).join(", ")}`
    );
  }

  try {
    // Combine user options with type configuration
    const splitOptions = {
      ...options,
      type: formatSplitTypes(splitTypes),
    };

    // Create and return the SplitText instance
    return new SplitText(targetElement, splitOptions);
  } catch (error) {
    console.error("Error splitting text:", error);
    throw new Error(
      "Failed to split text. Check if GSAP and SplitText are properly loaded."
    );
  }
}

/* Usage Examples:
    
    // Split by single type
    const mySplit = splitTextForAnimation('.heading', SPLIT_TYPES.WORDS);
    
    // Split by multiple types
    const mySplit = splitTextForAnimation(
      document.querySelector('.heading'), 
      [SPLIT_TYPES.WORDS, SPLIT_TYPES.CHARS]
    );
    
    // Split with additional options
    const mySplit = splitTextForAnimation('.paragraph', SPLIT_TYPES.LINES, {
      wordsClass: "para-word",
      charsClass: "para-char"
    });
    
    // Create responsive text that auto-resplits
    const mySplit = splitTextForAnimation('.responsive-text', [SPLIT_TYPES.LINES, SPLIT_TYPES.WORDS], {
      autoSplit: true,
      onSplit: function() {
        // Animation code here will run each time text is split
        gsap.from(this.lines, {
          y: 100,
          opacity: 0,
          stagger: 0.05
        });
      }
    });
*/
