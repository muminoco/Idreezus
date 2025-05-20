// batch.js - Simple batch animations using ScrollTrigger.batch

// Debug flag - set to true to see ScrollTrigger markers
const isMarkersOn = false;

/**
 * Setup batch animations for elements matching the selector
 *
 * @param {string} selector - CSS selector for elements to animate (e.g., '.card')
 * @param {Object} options - Optional configuration
 *
 * Options include:
 * - animation: Function that receives batch elements and returns GSAP animation
 * - start: ScrollTrigger start position (default: "top bottom")
 * - end: ScrollTrigger end position (default: "bottom top")
 * - once: Whether animation plays only once (default: true)
 * - batchMax: Maximum elements per batch (default: undefined - no limit)
 * - interval: Time window for batching in seconds (default: 0.1)
 * - initialOpacity: Starting opacity value (default: 0)
 * - delay: Delay in milliseconds before animation starts (default: 0)
 *
 * @example
 * // Simple batch fade in
 * setupBatchAnimation('.card');
 *
 * // With 500ms delay before animation starts
 * setupBatchAnimation('.feature', {
 *   animation: batchAnimations.scaleIn,
 *   delay: 500
 * });
 */
export function setupBatchAnimation(selector, options = {}) {
  try {
    // Default configuration
    const config = {
      // Animation settings
      animation: (batch) =>
        gsap.to(batch, { opacity: 1, y: 0, stagger: 0.1, duration: 0.7 }),

      // Batch settings
      interval: 0.1,
      // batchMax is undefined by default (no limit)

      // ScrollTrigger settings
      start: "top bottom", // When top of element reaches bottom of viewport
      end: "bottom top",
      once: true,

      // Initial element state
      initialOpacity: 0,

      // Delay before animation starts (in milliseconds)
      delay: 0,

      // Merge provided options
      ...options,
    };

    // Convert delay from milliseconds to seconds for GSAP
    const delayInSeconds = config.delay / 1000;

    // Create a Map to store animations for each element
    // This helps properly manage animation states when once:false
    const elementAnimations = new Map();

    // Set initial state of elements
    gsap.set(selector, {
      opacity: config.initialOpacity,
    });

    // Create ScrollTrigger batch
    try {
      const batchSettings = {
        interval: config.interval,
        once: config.once,

        // ScrollTrigger settings
        start: config.start,
        end: config.end,
        markers: isMarkersOn, // Show markers for debugging when flag is on

        // When elements enter viewport
        onEnter: (batch, triggers) => {
          if (batch.length === 0) return;

          try {
            // Create a function to run the animation
            const runAnimation = () => {
              // Kill any existing animations on these elements first
              batch.forEach((element) => {
                if (elementAnimations.has(element)) {
                  const oldAnim = elementAnimations.get(element);
                  if (oldAnim && oldAnim.kill) {
                    oldAnim.kill();
                  }
                }
              });

              // Reset to initial state to ensure clean animation
              gsap.set(batch, {
                opacity: config.initialOpacity,
              });

              // Create and store the new animation
              const anim = config.animation(batch);
              batch.forEach((element) => {
                elementAnimations.set(element, anim);
              });
            };

            // Apply delay if specified, otherwise run immediately
            if (delayInSeconds > 0) {
              gsap.delayedCall(delayInSeconds, runAnimation);
            } else {
              runAnimation();
            }
          } catch (animError) {
            // Error handling without console logging
          }
        },

        // When elements leave viewport (only used if once:false)
        onLeave: (batch, triggers) => {
          if (config.once || batch.length === 0) return;

          batch.forEach((element) => {
            // Kill any existing animations
            if (elementAnimations.has(element)) {
              const anim = elementAnimations.get(element);
              if (anim && anim.kill) {
                anim.kill();
              }
              elementAnimations.delete(element);
            }

            // Reset to leaving state
            gsap.set(element, {
              opacity: config.initialOpacity,
            });
          });
        },

        // When elements re-enter viewport (only used if once:false)
        onEnterBack: (batch, triggers) => {
          if (config.once || batch.length === 0) return;

          try {
            // Create a function to run the animation
            const runAnimation = () => {
              // Kill any existing animations on these elements first
              batch.forEach((element) => {
                if (elementAnimations.has(element)) {
                  const oldAnim = elementAnimations.get(element);
                  if (oldAnim && oldAnim.kill) {
                    oldAnim.kill();
                  }
                }
              });

              // Reset to initial state to ensure clean animation
              gsap.set(batch, {
                opacity: config.initialOpacity,
              });

              // Create and store the new animation
              const anim = config.animation(batch);
              batch.forEach((element) => {
                elementAnimations.set(element, anim);
              });
            };

            // Apply delay if specified, otherwise run immediately
            if (delayInSeconds > 0) {
              gsap.delayedCall(delayInSeconds, runAnimation);
            } else {
              runAnimation();
            }
          } catch (animError) {
            // Error handling without console logging
          }
        },

        // When elements leave viewport upward (only used if once:false)
        onLeaveBack: (batch, triggers) => {
          if (config.once || batch.length === 0) return;

          batch.forEach((element) => {
            // Kill any existing animations
            if (elementAnimations.has(element)) {
              const anim = elementAnimations.get(element);
              if (anim && anim.kill) {
                anim.kill();
              }
              elementAnimations.delete(element);
            }

            // Reset to leaving state
            gsap.set(element, {
              opacity: config.initialOpacity,
            });
          });
        },
      };

      // Only add batchMax if it's specified
      if (config.batchMax !== undefined) {
        batchSettings.batchMax = config.batchMax;
      }

      ScrollTrigger.batch(selector, batchSettings);
    } catch (batchError) {
      // Error handling without console logging
    }
  } catch (error) {
    // Error handling without console logging
  }
}

/**
 * Pre-defined animation presets
 * Use these with the animation option for common effects
 */
export const batchAnimations = {
  // Simple fade in
  fadeIn: (batch) =>
    gsap.to(batch, {
      opacity: 1,
      duration: 0.7,
      stagger: 0.1,
    }),

  filmstripFade: (batch) =>
    gsap.to(batch, {
      opacity: 1,
      duration: 1,
      stagger: 0.2,
      ease: "sine.out",
    }),

  contentCardReveal: (batch) =>
    gsap.to(batch, {
      opacity: 1,
      duration: 0.75,
      stagger: { from: "edges", each: 0.05 },
      y: -10,
    }),

  // Fade in with slide up
  fadeUp: (batch) =>
    gsap.to(batch, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      stagger: 0.1,
      ease: "power2.out",
    }),

  // Scale and fade in
  scaleIn: (batch) =>
    gsap.to(batch, {
      opacity: 1,
      scale: 1,
      duration: 0.7,
      stagger: 0.1,
      ease: "back.out(1.7)",
    }),

  // Slide from left
  slideRight: (batch) =>
    gsap.to(batch, {
      opacity: 1,
      x: 0,
      duration: 0.7,
      stagger: 0.1,
      ease: "power2.out",
    }),

  // Simple blur in
  blurIn: (batch) =>
    gsap.fromTo(
      batch,
      {
        opacity: 0,
        filter: "blur(4px)",
      },
      {
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.7,
        stagger: 0.2,
      }
    ),
};

/**
 * Initialize common batch animations for a page
 * Call this function from your main JS file to quickly set up multiple animations
 *
 * @example
 * // In your main.js:
 * import { initBatchAnimations } from './batch-animations.js';
 * document.addEventListener('DOMContentLoaded', initBatchAnimations);
 */
export function initBatchAnimations() {
  setupBatchAnimation(".swiper-slide.is-content-card", {
    animation: batchAnimations.contentCardReveal,
  });

  setupBatchAnimation(".journal_cms_item", {
    animation: batchAnimations.contentCardReveal,
  });

  setupBatchAnimation(".filmstrip_image", {
    animation: batchAnimations.filmstripFade,
  });
}

/*
USAGE EXAMPLES:

// Basic usage - just fade in cards as they enter viewport
setupBatchAnimation('.card');

// With 500ms delay before animation starts
setupBatchAnimation('.card', {
  delay: 500
});

// Custom animation function
setupBatchAnimation('.feature-box', {
  animation: batch => gsap.to(batch, {
    opacity: 1,
    scale: 1,
    rotation: 0,
    stagger: 0.1,
    duration: 0.8,
    ease: "elastic.out(1, 0.5)"
  }),
  initialOpacity: 0,
  delay: 200
});

// Use a preset animation
setupBatchAnimation('.list-item', {
  animation: batchAnimations.fadeUp
});

// Animation that replays when element re-enters viewport
setupBatchAnimation('.animated-item', {
  animation: batchAnimations.scaleIn,
  once: false
});

// Initialize all batch animations at once
// import { initBatchAnimations } from './batch-animations.js';
// initBatchAnimations();
*/
