// Track if event delegation is already set up
let isInitialized = false;

// Centralized attribute configuration
const ATTR = {
  button: "data-copy-button", // preferred trigger (must be "true")
  tooltip: "data-copy-tooltip", // optional tooltip
  buttonText: "data-copy-button-text", // optional child for text swap
  originalText: "data-original-text", // stores original text
  custom: "data-copy-custom", // enable custom content
  customContent: "data-copy-custom-content", // content to copy
  customPrefix: "data-copy-custom-prefix", // optional prefix path
};

function attrSelector(attrName, value) {
  return value === undefined ? `[${attrName}]` : `[${attrName}="${value}"]`;
}

/**
 * Initialize copy button behavior across the document using event delegation.
 * This works with dynamically added elements (e.g., in lightboxes).
 * Safe to call multiple times - will only set up listeners once.
 *
 * Supported data attributes:
 * - [data-copy-button="true"]: Click to trigger copy (preferred)
 * - [data-copy-tooltip]: Adds a tooltip via tippy and shows "Copied!" after successful copy (optional; works without tippy)
 * - [data-copy-button-text]: Optional descendant whose text switches to "Copied" briefly after successful copy
 * - [data-copy-custom="true"] and [data-copy-custom-content]: When present on the clickable element,
 *   the value of data-copy-custom-content is copied to the clipboard
 * - [data-copy-custom-prefix]: Optional. When provided with data-copy-custom="true",
 *   the copied value becomes `${window.location.origin}/${prefix}/${content}`
 *
 * External dependency expected globally: tippy
 */
export function initCopyButtons() {
  // Prevent duplicate initialization
  if (isInitialized) return;
  isInitialized = true;

  // Initialize tooltips for existing elements with data-copy-tooltip
  initTooltipsForContainer();

  // Check for deprecated usage and warn users
  checkForDeprecatedUsage();

  // Use event delegation for click handling (works with dynamic elements)
  document.addEventListener("click", async (event) => {
    const selector = [ATTR.button, ATTR.tooltip]
      .map((name) => attrSelector(name))
      .join(", ");
    const eventTarget = event.target;
    const target =
      eventTarget instanceof Element ? eventTarget.closest(selector) : null;

    if (!target) return;

    // Handle copy functionality and get success status
    const copySuccessful = await handleCopy(target);

    // Only show feedback if copy was successful
    if (!copySuccessful) return;

    // Handle tooltip feedback
    if (target.hasAttribute(ATTR.tooltip) && target._tippy) {
      target._tippy.setContent("Copied!");
    }

    // Handle text button feedback
    if (target.hasAttribute(ATTR.button)) {
      const textElement = target.querySelector(attrSelector(ATTR.buttonText));
      if (textElement) {
        // Store original text if not already stored
        if (!textElement.hasAttribute(ATTR.originalText)) {
          textElement.setAttribute(ATTR.originalText, textElement.textContent);
        }

        textElement.textContent = "Copied";
        // Reset text after 2 seconds
        setTimeout(() => {
          textElement.textContent = textElement.getAttribute(ATTR.originalText);
        }, 2000);
      }
    }
  });
}

/**
 * Initialize tooltips for elements with data-copy-tooltip within a container.
 * For power users who need manual tooltip control when adding dynamic content.
 */
export function initTooltipsForContainer(container = document) {
  const tooltipButtons = container.querySelectorAll(attrSelector(ATTR.tooltip));
  tooltipButtons.forEach(initializeTooltipForButton);
}

/**
 * Check for deprecated usage and warn users to migrate
 */
function checkForDeprecatedUsage() {
  // Check for elements with data-copy-button that don't have the value "true"
  const deprecatedButtons = document.querySelectorAll(
    `${attrSelector(ATTR.button)}:not(${attrSelector(ATTR.button, "true")})`
  );
  const deprecatedTooltips = document.querySelectorAll(
    `${attrSelector(ATTR.tooltip)}:not(${attrSelector(ATTR.button, "true")})`
  );

  if (deprecatedButtons.length > 0 || deprecatedTooltips.length > 0) {
    console.warn(
      '⚠️  copyButtons.js: Found elements using deprecated attributes. Please migrate to data-copy-button="true":'
    );

    if (deprecatedButtons.length > 0) {
      console.warn(
        '- Elements with data-copy-button (should be data-copy-button="true"):',
        deprecatedButtons
      );
    }

    if (deprecatedTooltips.length > 0) {
      console.warn(
        '- Elements with data-copy-tooltip (should add data-copy-button="true"):',
        deprecatedTooltips
      );
    }

    console.warn(
      'Migration example: <button data-copy-button="true" data-copy-tooltip data-copy-custom="true" data-copy-custom-content="...">Copy</button>'
    );
  }
}

/**
 * Initialize a tooltip for a specific button element
 */
function initializeTooltipForButton(button) {
  const hasTippy =
    typeof window !== "undefined" && typeof window.tippy === "function";

  if (!hasTippy) return;

  // Destroy existing tooltip if present
  if (button._tippy) {
    button._tippy.destroy();
  }

  // Use the global tippy (if present) or the imported one
  const tippyInstanceFactory = window.tippy || tippy;
  button._tippy = tippyInstanceFactory(button, {
    content: "Copy Link",
    animation: "shift-toward-subtle",
    duration: [100, 400],
    arrow: true,
    delay: [0, 500],
    maxWidth: 220,
    trigger: "mouseenter",
    onHidden(instance) {
      // Reset content when tooltip is fully hidden
      instance.setContent("Copy Link");
    },
  });
}

/**
 * Resolve and copy the configured text for a given element.
 * Returns a promise that resolves to true if copy was successful, false otherwise.
 *
 * Rules:
 * - If the element has data-copy-custom="true", copy the value in data-copy-custom-content
 * - Otherwise, warn (no other copy sources are supported)
 */
async function handleCopy(element) {
  let textToCopy;

  // Check if this is a valid copy target
  const hasButtonAttribute = element.getAttribute(ATTR.button) === "true";
  const hasTooltipAttribute = element.hasAttribute(ATTR.tooltip);

  if (!hasButtonAttribute && !hasTooltipAttribute) {
    console.warn("No valid copy target found for element:", element);
    return false;
  }

  // Copy explicit custom content from the element
  if (element.getAttribute(ATTR.custom) === "true") {
    const customContent = element.getAttribute(ATTR.customContent);
    if (!customContent) {
      console.warn(
        "No custom content found to copy for element (missing data-copy-custom-content):",
        element
      );
      return false;
    }
    const prefix = element.getAttribute(ATTR.customPrefix) || "";

    if (prefix) {
      // Build absolute URL using origin + normalized prefix + content
      const origin = window.location.origin;
      const normalize = (part) => String(part).replace(/^\/+|\/+$/g, "");
      const joinedPath = [normalize(prefix), normalize(customContent)]
        .filter(Boolean)
        .join("/");
      textToCopy = `${origin}/${joinedPath}`;
    } else {
      // No prefix provided; copy the content as-is (backward compatible)
      textToCopy = customContent;
    }
  } else {
    console.warn("No copy configuration found for element:", element);
    return false;
  }

  // Copy to clipboard and return success status
  try {
    await navigator.clipboard.writeText(textToCopy);
    return true;
  } catch (err) {
    console.error("Failed to copy text: ", err);
    return false;
  }
}

/*
USAGE EXAMPLES
--------------

1) Tooltip-based copy button that copies custom content (preferred syntax)

  <button
    data-copy-button="true"
    data-copy-tooltip
    data-copy-custom="true"
    data-copy-custom-content="https://example.com/some/deep/link"
  >
    Copy Link
  </button>

2) Copy button with status text swap and URL prefix (preferred syntax)

  <button
    data-copy-button="true"
    data-copy-custom="true"
    data-copy-custom-prefix="page/other-page/"
    data-copy-custom-content="12345"
  >
    <span data-copy-button-text>Copy Invoice #</span>
  </button>

3) Legacy syntax (still works but shows console warnings)

  <button
    data-copy-button
    data-copy-custom="true"
    data-copy-custom-content="legacy-content"
  >
    <span data-copy-button-text>Copy Legacy</span>
  </button>

Call once after DOM is ready:

  import { initCopyButtons } from "./components/copyButtons";
  document.addEventListener("DOMContentLoaded", initCopyButtons);
  
  // For power users: if you dynamically add tooltip elements to a specific container:
  // import { initTooltipsForContainer } from "./components/copyButtons";
  // initTooltipsForContainer(myLightboxElement);
*/
