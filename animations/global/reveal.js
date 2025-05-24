// reveal.js - Simple reveal animations using ScrollTrigger

import { createFireOnceScrollTrigger } from "../utils/scrollTriggers.js";

// Default animation settings
const DEFAULT = {
  duration: 0.75,
  ease: "sine.out",
  delay: 0,
};

/**
 * Base animation function that sets up common properties
 * @param {HTMLElement} element - Target element
 * @param {function} animationCallback - Function to create the timeline
 */
function createBaseRevealAnimation(element, animationCallback) {
  // Set initial opacity for the element
  gsap.set(element, { opacity: 0 });

  // Create timeline
  const tl = gsap.timeline({ paused: true });

  // Create scroll trigger for the element
  createFireOnceScrollTrigger(element, tl);

  // Run the animation callback
  animationCallback(element, tl);
}

/**
 * Collection of reveal animations
 */
export const revealAnimations = {
  // Simple fade in animation
  fadeIn: (element, delay = 0) => {
    createBaseRevealAnimation(element, (target, tl) => {
      tl.to(target, {
        opacity: 1,
        duration: DEFAULT.duration,
        delay,
        ease: DEFAULT.ease,
      });
    });
  },

  // Fade in with slide up animation
  fadeInSlideUp: (element, delay = 0) => {
    createBaseRevealAnimation(element, (target, tl) => {
      // Set initial position
      gsap.set(target, { y: 30 });

      tl.to(target, {
        opacity: 1,
        y: 0,
        duration: DEFAULT.duration,
        delay,
        ease: DEFAULT.ease,
      });
    });
  },
};

/**
 * Setup reveal animations for elements matching the selector
 *
 * @param {string} selector - CSS selector for elements to animate (e.g., '.card')
 * @param {Object} options - Optional configuration
 *
 * Options include:
 * - animation: Function that receives element and returns GSAP animation (default: fadeIn)
 * - delay: Delay in seconds before animation starts (default: 0)
 * - duration: Duration of the animation in seconds (default: 0.75)
 * - ease: GSAP easing function (default: "sine.out")
 *
 * @example
 * // Simple fade in
 * setupRevealAnimation('.card');
 *
 * // With custom animation and delay
 * setupRevealAnimation('.feature', {
 *   animation: revealAnimations.fadeInSlideUp,
 *   delay: 0.3
 * });
 */
export function setupRevealAnimation(selector, options = {}) {
  try {
    // Default configuration
    const config = {
      animation: revealAnimations.fadeIn,
      delay: DEFAULT.delay,
      duration: DEFAULT.duration,
      ease: DEFAULT.ease,
      ...options,
    };

    // Get all elements matching the selector
    const elements = document.querySelectorAll(selector);

    // Skip if no elements found
    if (elements.length === 0) {
      return;
    }

    // Apply animation to each element
    elements.forEach((element) => {
      try {
        config.animation(element, config.delay);
      } catch (elementError) {
        // Error handling without console logging
      }
    });
  } catch (error) {
    // Error handling without console logging
  }
}

/**
 * Initialize reveal animations for specific elements
 * Call this from your main JS file
 */
export function initRevealAnimations() {
  // Example: Animate feature cards with fadeInSlideUp
  setupRevealAnimation(".feature-card", {
    animation: revealAnimations.fadeInSlideUp,
  });
}

/* Usage Examples:

  1. Using setupRevealAnimation:
  
     ```js
     import { setupRevealAnimation, revealAnimations } from './animations/global/reveal.js';
     
     // Simple fade in for all cards
     setupRevealAnimation('.card');
     
     // Fade in slide up with custom delay
     setupRevealAnimation('.feature', {
       animation: revealAnimations.fadeInSlideUp,
       delay: 0.3
     });
     
     // Custom animation with all options
     setupRevealAnimation('.special-element', {
       animation: revealAnimations.fadeIn,
       delay: 0.5,
       duration: 1,
       ease: "power2.out"
     });
     ```

  2. Adding a new reveal animation:
  
     ```js
     // Add a new animation to the revealAnimations object
     revealAnimations.fadeInScale = (element, delay = 0) => {
       createBaseRevealAnimation(element, (target, tl) => {
         gsap.set(target, { scale: 0.8 });
         
         tl.to(target, {
           opacity: 1,
           scale: 1,
           duration: DEFAULT.duration,
           delay,
           ease: DEFAULT.ease,
         });
       });
     };
     
     // Use the new animation
     setupRevealAnimation('.scale-element', {
       animation: revealAnimations.fadeInScale
     });
     ```
*/
