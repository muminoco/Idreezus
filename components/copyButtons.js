export function initCopyButtons() {
  // Handle elements with data-copy-tooltip
  const tooltipButtons = document.querySelectorAll("[data-copy-tooltip]");
  tooltipButtons.forEach((button) => {
    // Destroy any existing tooltip instance first
    if (button._tippy) {
      button._tippy.destroy();
    }

    // Create a new tooltip instance
    const copyTip = tippy(button, {
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

    // Add click handler
    button.addEventListener("click", () => {
      handleCopy(button);
      copyTip.setContent("Copied!");
    });
  });

  // Handle elements with data-copy-button
  const copyButtons = document.querySelectorAll("[data-copy-button]");
  copyButtons.forEach((button) => {
    // Store the original text when we first find the element
    const textElement = button.querySelector("[data-copy-button-text]");
    if (textElement) {
      textElement.setAttribute("data-original-text", textElement.textContent);
    }

    button.addEventListener("click", () => {
      handleCopy(button);

      // Update text if data-copy-button-text element exists
      if (textElement) {
        textElement.textContent = "Copied";
        // Reset text after 2 seconds
        setTimeout(() => {
          textElement.textContent =
            textElement.getAttribute("data-original-text");
        }, 2000);
      }
    });
  });
}

function handleCopy(element) {
  let textToCopy;

  // New behavior: copy explicit custom content from the element
  if (element.getAttribute("data-copy-custom") === "true") {
    const customContent = element.getAttribute("data-copy-custom-content");
    if (!customContent) {
      console.warn(
        "No custom content found to copy for element (missing data-copy-custom-content):",
        element
      );
      return;
    }
    textToCopy = customContent;
  } else {
    console.warn("No copy configuration found for element:", element);
    return;
  }

  // Copy to clipboard
  navigator.clipboard.writeText(textToCopy).catch((err) => {
    console.error("Failed to copy text: ", err);
  });
}
