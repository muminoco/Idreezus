/**
 * Navbar functionality and animations using GSAP ScrollTrigger
 * This file handles navbar state management and animations
 */

// Export the main initialization function that can be imported in main.js
export function initNavbarAnimations() {
  // Make sure GSAP and ScrollTrigger are loaded
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    console.error("GSAP or ScrollTrigger not loaded");
    return;
  }

  // Register the ScrollTrigger plugin
  gsap.registerPlugin(ScrollTrigger);

  // Initialize navbar state management
  initNavbarStateManagement();
}

// Constants for navbar variants
const NAVBAR_VARIANTS = {
  transparent: {
    class: "w-variant-84f3e6a8-4fcc-b5dd-eaa8-6cfe425e2444",
    attr: "is-transparent",
  },
  base: {
    attr: "base",
  },
};

// Get navbar elements
function getNavbarElements() {
  return {
    navbarWrapper: document.querySelector(".nav_wrap.is-mobile"),
    navComponent: document.querySelector(".nav_component"),
    navButton: document.querySelector(".nav_component .w-nav-button"),
    trigger: document.querySelector(".navbar-transparent-trigger"),
  };
}

// Check if hamburger menu is open
function isNavbarMenuOpen() {
  const { navButton } = getNavbarElements();
  return (
    navButton &&
    (navButton.classList.contains("w--open") ||
      navButton.getAttribute("aria-expanded") === "true")
  );
}

// Set navbar variant
function setNavbarVariant(navEl, variant) {
  if (!navEl) return;

  if (variant === NAVBAR_VARIANTS.transparent) {
    navEl.setAttribute("data-wf--navbar--variant", variant.attr);
    if (!navEl.classList.contains(variant.class)) {
      navEl.classList.add(variant.class);
    }
    navEl.querySelectorAll(":scope > *").forEach((child) => {
      if (!child.classList.contains(variant.class)) {
        child.classList.add(variant.class);
      }
    });
  } else {
    navEl.setAttribute("data-wf--navbar--variant", variant.attr);
    navEl.classList.remove(NAVBAR_VARIANTS.transparent.class);
    navEl
      .querySelectorAll(`.${NAVBAR_VARIANTS.transparent.class}`)
      .forEach((child) => {
        child.classList.remove(NAVBAR_VARIANTS.transparent.class);
      });
  }
}

// Toggle transparent navbar based on scroll position and menu state
function toggleTransparentNavbar() {
  const { navbarWrapper, navComponent, trigger } = getNavbarElements();

  // If there's no trigger element, always use base variant
  if (!trigger) {
    setNavbarVariant(navComponent, NAVBAR_VARIANTS.base);
    setNavbarVariant(navbarWrapper, NAVBAR_VARIANTS.base);
    return;
  }

  if (isNavbarMenuOpen()) {
    setNavbarVariant(navComponent, NAVBAR_VARIANTS.base);
    setNavbarVariant(navbarWrapper, NAVBAR_VARIANTS.base);
  } else if (window.isScrolledPast) {
    setNavbarVariant(navComponent, NAVBAR_VARIANTS.base);
    setNavbarVariant(navbarWrapper, NAVBAR_VARIANTS.base);
  } else {
    setNavbarVariant(navComponent, NAVBAR_VARIANTS.transparent);
    setNavbarVariant(navbarWrapper, NAVBAR_VARIANTS.transparent);
  }
}

// Play navbar open animation
function playNavbarOpenAnimation() {}

// Initialize navbar state management
function initNavbarStateManagement() {
  const { navButton, trigger } = getNavbarElements();

  // Track scroll state
  window.isScrolledPast = false;

  // Store the navbar's ScrollTrigger instance
  let navbarScrollTrigger = null;

  // Only create ScrollTrigger if trigger element exists
  if (trigger) {
    navbarScrollTrigger = ScrollTrigger.create({
      trigger: ".navbar-transparent-trigger",
      start: () => `top-=${getNavbarElements().navComponent.offsetHeight} top`,
      end: "top bottom",
      onEnter: () => {
        window.isScrolledPast = true;
        toggleTransparentNavbar();
      },
      onLeaveBack: () => {
        window.isScrolledPast = false;
        toggleTransparentNavbar();
      },
      markers: false,
    });
  }

  // Set initial state
  toggleTransparentNavbar();

  // Listen for hamburger menu open/close
  if (navButton) {
    const observer = new MutationObserver(() => {
      toggleTransparentNavbar();
      if (isNavbarMenuOpen()) {
        playNavbarOpenAnimation();
      }
    });

    observer.observe(navButton, {
      attributes: true,
      attributeFilter: ["class", "aria-expanded"],
    });
  }
}

// Cleanup function to be called when navigating away
export function cleanupNavbarAnimations() {
  // Only kill the navbar's ScrollTrigger instance
  if (navbarScrollTrigger) {
    navbarScrollTrigger.kill();
  }
  window.isScrolledPast = false;
}

// The following is just for reference and should be removed before deployment:

/**
 * Example usage in main.js:
 *
 * import { initNavbarAnimations, cleanupNavbarAnimations } from './animations/components/navbar.js';
 *
 * document.addEventListener('DOMContentLoaded', () => {
 *   initNavbarAnimations();
 * });
 *
 * // Call cleanup when navigating away
 * window.addEventListener('beforeunload', cleanupNavbarAnimations);
 *
 */
