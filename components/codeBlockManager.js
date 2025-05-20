// Code Block Copy Button
// Adds copy buttons to code blocks that show language type and copy code to clipboard with visual feedback.

(function () {
  const CONFIG = {
    selectors: {
      codeBlock: ".w-code-block",
      codeElement: "code",
      copyButton: "data-code-copy-button",
      copyButtonText: "data-code-copy-text",
      codeLanguage: "data-code-language",
      codeHeader: ".code_header",
    },
    attributes: {
      processed: "data-code-block-processed",
      blockId: "data-code-block-id",
      headerFor: "data-code-header-for",
    },
    text: {
      copied: "Copied!",
      defaultLanguage: "Plain Text",
    },
    timeouts: {
      resetButton: 700,
      observerDebounce: 100,
    },
    template: `
      <div class="code_header">
        <div class="code_left-wrapper">
          <div data-code-language="" class="code_language">JavaScript</div>
        </div>
        <div class="code_right-wrapper">
          <button id="" data-code-copy-button="" class="mini-button">
            <div data-code-copy-text="" class="mini-button-text is-code-copy">Copy Code</div>
            <div class="mini-button_icon">
              <div class="icon-full w-embed">
                <svg width="100%" height="100%" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                  </g>
                </svg>
              </div>
            </div>
          </button>
        </div>
      </div>
    `,
  };

  class CodeBlockManager {
    constructor() {
      this.config = CONFIG;
      this.processedBlocks = new WeakSet();
      this.debouncedInit = this.debounce(
        this.init.bind(this),
        this.config.timeouts.observerDebounce
      );
      this.isInitializing = false;
    }

    // Utility function to debounce function calls
    debounce(func, delay) {
      let timeout;
      return function () {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
      };
    }

    setupObserver() {
      // Create a MutationObserver to watch for DOM changes
      const observer = new MutationObserver((mutations) => {
        // Only reinitialize if there are changes that actually affect code blocks
        const shouldReinit = mutations.some((mutation) => {
          // Check if mutation has added nodes
          if (mutation.addedNodes.length > 0) {
            // Check if any added node is or contains a code block
            return Array.from(mutation.addedNodes).some((node) => {
              if (node.nodeType !== Node.ELEMENT_NODE) return false;

              if (
                node.matches &&
                node.matches(`pre${this.config.selectors.codeBlock}`)
              ) {
                return true;
              }

              return (
                node.querySelectorAll &&
                node.querySelectorAll(`pre${this.config.selectors.codeBlock}`)
                  .length > 0
              );
            });
          }
          return false;
        });

        if (shouldReinit) {
          this.debouncedInit();
        }
      });

      // Start observing the document with the configured parameters
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    init() {
      // Prevent concurrent initializations
      if (this.isInitializing) return;
      this.isInitializing = true;

      try {
        // First, remove any duplicate headers that might have been added
        this.removeDuplicateHeaders();

        const preElements = document.querySelectorAll(
          `pre${this.config.selectors.codeBlock}`
        );

        preElements.forEach((pre, index) => {
          // Skip already processed blocks (using both WeakSet and data attribute)
          if (
            this.processedBlocks.has(pre) ||
            pre.hasAttribute(this.config.attributes.processed)
          ) {
            return;
          }

          // Check if this code block already has a header
          const prevSibling = pre.previousElementSibling;
          if (
            prevSibling &&
            prevSibling.matches(this.config.selectors.codeHeader)
          ) {
            // Already has a header, just make sure it's properly connected
            const blockId =
              pre.getAttribute(this.config.attributes.blockId) ||
              `code-block-${Date.now()}-${index}`;

            if (!pre.hasAttribute(this.config.attributes.blockId)) {
              pre.setAttribute(this.config.attributes.blockId, blockId);
            }

            if (!prevSibling.hasAttribute(this.config.attributes.headerFor)) {
              prevSibling.setAttribute(
                this.config.attributes.headerFor,
                blockId
              );
            }

            // Setup the copy button in the existing header
            const button = prevSibling.querySelector(
              `[${this.config.selectors.copyButton}]`
            );
            const code = pre.querySelector(this.config.selectors.codeElement);

            if (button && code) {
              this.setupCopyButton(button, code);
            }

            pre.setAttribute(this.config.attributes.processed, "true");
            this.processedBlocks.add(pre);
            return;
          }

          const code = pre.querySelector(this.config.selectors.codeElement);
          if (!code) return;

          // Mark as processed
          pre.setAttribute(this.config.attributes.processed, "true");
          this.processedBlocks.add(pre);

          // Make code block keyboard accessible
          pre.setAttribute("tabindex", "0");

          // Insert header template
          pre.insertAdjacentHTML("beforebegin", this.config.template);

          // Get the inserted elements
          const header = pre.previousElementSibling;
          const button = header.querySelector(
            `[${this.config.selectors.copyButton}]`
          );
          const languageElement = header.querySelector(
            `[${this.config.selectors.codeLanguage}]`
          );

          // Set unique ID for the button
          button.id = `copy-button-${Date.now()}-${index}`;

          // Add data attribute to link header with code block
          const blockId = `code-block-${Date.now()}-${index}`;
          pre.setAttribute(this.config.attributes.blockId, blockId);
          header.setAttribute(this.config.attributes.headerFor, blockId);

          // Set language and add click handler
          this.setLanguage(code, languageElement);
          this.setupCopyButton(button, code);
        });
      } finally {
        // Always reset the initializing flag
        this.isInitializing = false;
      }
    }

    removeDuplicateHeaders() {
      // Get all code blocks
      const codeBlocks = document.querySelectorAll(
        `pre${this.config.selectors.codeBlock}`
      );

      codeBlocks.forEach((pre) => {
        // Count how many headers might belong to this code block
        let currentEl = pre.previousElementSibling;
        let headers = [];

        // Collect headers that precede this code block
        while (
          currentEl &&
          currentEl.matches(this.config.selectors.codeHeader)
        ) {
          headers.push(currentEl);
          currentEl = currentEl.previousElementSibling;
        }

        // If there are multiple headers, keep only the first one (closest to the code block)
        if (headers.length > 1) {
          // Keep the first one (closest to the code block)
          for (let i = 1; i < headers.length; i++) {
            if (headers[i].parentNode) {
              headers[i].parentNode.removeChild(headers[i]);
            }
          }
        }
      });
    }

    setLanguage(codeElement, languageElement) {
      const languageClass = Array.from(codeElement.classList).find(
        (className) => className.startsWith("language-")
      );

      const language = languageClass
        ? languageClass.replace("language-", "")
        : this.config.text.defaultLanguage;

      // Special formatting for specific languages
      switch (language.toLowerCase()) {
        case "css":
          languageElement.textContent = "CSS";
          break;
        case "html":
          languageElement.textContent = "HTML";
          break;
        case "javascript":
        case "js":
          languageElement.textContent = "JavaScript";
          break;
        default:
          // Capitalize first letter, rest lowercase
          languageElement.textContent =
            language.charAt(0).toUpperCase() + language.slice(1).toLowerCase();
      }
    }

    setupCopyButton(button, codeElement) {
      // Remove any existing click handlers
      button.removeEventListener("click", button._copyHandler);

      // Create the copy handler function
      button._copyHandler = async () => {
        try {
          const buttonText = button.querySelector(
            `[${this.config.selectors.copyButtonText}]`
          );
          const originalText = buttonText.textContent;

          await navigator.clipboard.writeText(codeElement.textContent);
          buttonText.textContent = this.config.text.copied;

          clearTimeout(button._resetTimeout);
          button._resetTimeout = setTimeout(() => {
            buttonText.textContent = originalText;
          }, this.config.timeouts.resetButton);
        } catch (err) {
          console.error("Failed to copy code:", err);
        }
      };

      // Add the click handler
      button.addEventListener("click", button._copyHandler);
    }

    // Global click handler using event delegation
    setupGlobalClickHandler() {
      document.addEventListener("click", (e) => {
        // Check if the click was on or within a button with our attribute
        const button = e.target.closest(
          `[${this.config.selectors.copyButton}]`
        );
        if (!button) return;

        // Find the associated code block
        const headerId = button
          .closest(`[${this.config.attributes.headerFor}]`)
          ?.getAttribute(this.config.attributes.headerFor);
        if (!headerId) return;

        const codeBlock = document.querySelector(
          `[${this.config.attributes.blockId}="${headerId}"]`
        );
        if (!codeBlock) return;

        const code = codeBlock.querySelector(this.config.selectors.codeElement);
        if (!code) return;

        // Copy the code
        navigator.clipboard
          .writeText(code.textContent)
          .then(() => {
            const buttonText = button.querySelector(
              `[${this.config.selectors.copyButtonText}]`
            );
            const originalText = buttonText.textContent;

            buttonText.textContent = this.config.text.copied;

            clearTimeout(button._resetTimeout);
            button._resetTimeout = setTimeout(() => {
              buttonText.textContent = originalText;
            }, this.config.timeouts.resetButton);
          })
          .catch((err) => {
            console.error("Failed to copy code:", err);
          });
      });
    }
  }

  // Initialize and set up observers when DOM is ready
  const initCodeBlockManager = () => {
    const manager = new CodeBlockManager();

    // First, remove any existing duplicate headers
    try {
      const headers = document.querySelectorAll(".code_header");
      const codeBlocks = document.querySelectorAll(
        `pre${CONFIG.selectors.codeBlock}`
      );

      // If there are more headers than code blocks, we have duplicates
      if (headers.length > codeBlocks.length) {
        headers.forEach((header) => {
          // Remove headers that don't have a code block immediately following them
          const nextEl = header.nextElementSibling;
          if (!nextEl || !nextEl.matches(`pre${CONFIG.selectors.codeBlock}`)) {
            header.parentNode.removeChild(header);
          }
        });
      }
    } catch (e) {
      console.error("Error cleaning up headers:", e);
    }

    manager.init();
    manager.setupGlobalClickHandler();
    manager.setupObserver();

    // Also reinitialize after a short delay to handle any late DOM changes
    setTimeout(() => manager.init(), 1000);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCodeBlockManager);
  } else {
    initCodeBlockManager();
  }
})();
