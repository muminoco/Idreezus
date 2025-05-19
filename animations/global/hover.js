// hover.js - Minimalist starter file for hover-based animations using GSAP

/**
 * Fades out siblings of hovered elements to 50% opacity, and restores on mouse leave.
 * Can be used for any selector(s).
 * @param {string|string[]} selectors - One or more CSS selectors to apply the effect to.
 */
export function fadeOutSiblings(selectors) {
  // Normalize selectors to an array
  const selectorArr = Array.isArray(selectors) ? selectors : [selectors];
  // For each selector, attach event listeners
  selectorArr.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => {
      // Use event delegation for dynamic content
      el.addEventListener("mouseenter", function () {
        const siblings = Array.from(el.parentNode.children).filter(
          (sib) => sib !== el
        );
        gsap.to(siblings, {
          opacity: 0.5,
          filter: "blur(1px)",
          y: 8,
          duration: 0.3,
          overwrite: "auto",
        });
      });
      el.addEventListener("mouseleave", function () {
        const siblings = Array.from(el.parentNode.children).filter(
          (sib) => sib !== el
        );
        gsap.to(siblings, {
          opacity: 1,
          filter: "blur(0px)",
          y: 0,
          duration: 0.3,
          overwrite: "auto",
        });
      });
    });
  });
}

/**
 * Initialize all hover-based animations here.
 * Call this from your main JS file (e.g., mumino.js)
 */
export function initializeHoverEffects() {
  // Example usage: fade out siblings for swiper slides
  fadeOutSiblings(".swiper-slide.is-content-card");
  fadeOutSiblings(".swiper-slide.is-journal-card");

  // Add more fadeOutSiblings calls here for other selectors as needed
}
