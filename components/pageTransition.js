// Function to handle page transitions
export function initPageTransitions() {
  let isNavigating = false;
  let transitionTimeline = null;
  const MIN_TRANSITION_DURATION = 1; // Minimum duration in seconds

  // Function to show the transition
  function showTransition() {
    const transitionElement = document.querySelector(".global-transition");

    if (!transitionElement) {
      console.error("Global transition element not found");
      return;
    }

    // Kill any existing timeline
    if (transitionTimeline) {
      transitionTimeline.kill();
    }

    // Set up the transition element
    transitionElement.style.display = "flex";

    // Create the timeline
    transitionTimeline = gsap.timeline();

    // Fade in the transition element
    transitionTimeline.to(transitionElement, {
      opacity: 1,
      duration: 0.5,
      ease: "power2.inOut",
    });

    return transitionTimeline;
  }

  // Function to hide the transition
  function hideTransition() {
    const transitionElement = document.querySelector(".global-transition");

    if (!transitionElement) {
      console.error("Global transition element not found");
      return;
    }

    // Create a new timeline
    const hideTimeline = gsap.timeline({
      onComplete: () => {
        transitionElement.style.display = "none";
        isNavigating = false;
      },
    });

    // Fade out the transition element
    hideTimeline.to(transitionElement, {
      opacity: 0,
      duration: 0.5,
      ease: "power2.inOut",
    });

    return hideTimeline;
  }

  // Handle link clicks
  function handleLinkClick(e) {
    // Only handle internal links
    const href = e.currentTarget.getAttribute("href");

    // Skip if it's an external link, has a download attribute, or is a hash link
    if (
      !href ||
      href.startsWith("http") ||
      href.startsWith("//") ||
      href.startsWith("#") ||
      href.startsWith("tel:") ||
      href.startsWith("mailto:") ||
      e.currentTarget.hasAttribute("download") ||
      e.currentTarget.getAttribute("target") === "_blank"
    ) {
      return;
    }

    // Prevent default link behavior
    e.preventDefault();

    // If already navigating, don't do anything
    if (isNavigating) {
      return;
    }

    isNavigating = true;

    // Start the transition animation
    const startTime = performance.now();
    const timeline = showTransition();

    // Load the new page
    fetch(href)
      .then((response) => response.text())
      .then((html) => {
        const parser = new DOMParser();
        const newDocument = parser.parseFromString(html, "text/html");
        const newContent = newDocument.querySelector("body");

        // Ensure minimum transition time
        const elapsedTime = (performance.now() - startTime) / 1000; // Convert to seconds
        const remainingTime = Math.max(
          0,
          MIN_TRANSITION_DURATION - elapsedTime
        );

        setTimeout(() => {
          // Wait for content to be ready, then complete the transition
          document.body.innerHTML = newContent.innerHTML;

          // Update the URL
          window.history.pushState({}, "", href);

          // Hide the transition element
          hideTransition();

          // Reinitialize any necessary scripts for the new page
          reinitializeMumino();

          // Dispatch a custom event that the page has changed
          window.dispatchEvent(new CustomEvent("pageTransitionComplete"));
        }, remainingTime * 1000); // Convert to milliseconds
      })
      .catch((error) => {
        console.error("Navigation error:", error);
        hideTransition();
        isNavigating = false;
      });
  }

  // Initialize by adding event listeners to all internal links
  function initialize() {
    // Make sure the transition element exists
    const transitionElement = document.querySelector(".global-transition");
    if (!transitionElement) {
      console.error("Global transition element not found");
      return;
    }

    // Reset the transition element
    transitionElement.style.opacity = 0;
    transitionElement.style.display = "none";

    // Add click event listeners to all internal links
    document.querySelectorAll("a").forEach((link) => {
      link.removeEventListener("click", handleLinkClick); // Remove first to prevent duplicates
      link.addEventListener("click", handleLinkClick);
    });

    // Handle browser back/forward buttons
    window.addEventListener("popstate", () => {
      if (!isNavigating) {
        isNavigating = true;
        showTransition();

        // Give a small delay before reloading to show the transition
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    });
  }

  // Initialize the page transitions
  initialize();

  // Return methods that can be called externally if needed
  return {
    showTransition,
    hideTransition,
    reinitialize: initialize,
  };
}
