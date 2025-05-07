// text-animations.js - Minimalist starter file for text animations
import { createFireOnceScrollTrigger } from "../utils/scrollTriggers.js";
import { splitTextForAnimation, SPLIT_TYPES } from "../utils/textSplitter.js";

// Animation selectors
const animationAttributeName = "data-ani";
const delayAttributeName = "data-ani-delay";

/**
 * Define all animations with their selectors and animation functions
 * This is the SINGLE source of truth for animations
 */
export const animations = {
  // Title animations
  title: {
    selector: `[${animationAttributeName}="title"]`,
    animate: (element, delay = 0) => {
      const split = splitTextForAnimation(element, [SPLIT_TYPES.WORDS]);

      createBaseAnimation(element, (target, tl) => {
        tl.from(split.words, {
          y: 30,
          opacity: 0,
          duration: 0.75,
          delay,
          stagger: 0.1,
          ease: "back.out(1.7)",
        });
      });
    },
  },

  // Heading animations
  heading: {
    selector: `[${animationAttributeName}="heading"]`,
    animate: (element, delay = 0) => {
      const split = splitTextForAnimation(element, [SPLIT_TYPES.CHARS]);

      createBaseAnimation(element, (target, tl) => {
        tl.from(split.chars, {
          filter: "blur(2px)",
          yPercent: 25,
          opacity: 0,
          duration: 1,
          delay,
          stagger: { each: 0.02, from: "random" },
          ease: "sine.out",
        });
      });
    },
  },

  // Paragraph animations
  paragraph: {
    selector: `[${animationAttributeName}="paragraph"]`,
    animate: (element, delay = 0) => {
      const split = splitTextForAnimation(element, [SPLIT_TYPES.LINES], {
        mask: "lines",
      });

      createBaseAnimation(element, (target, tl) => {
        tl.from(split.lines, {
          yPercent: 50,
          opacity: 0,
          duration: 0.75,
          stagger: 0.1,
          delay: 0.5,
          ease: "power1.out",
        });
      });
    },
  },

  // handwriting animations
  handwriting: {
    selector: `[${animationAttributeName}="handwriting"]`,
    animate: (element, delay = 0) => {
      const split = splitTextForAnimation(element, [
        SPLIT_TYPES.CHARS,
        SPLIT_TYPES.WORDS,
      ]);

      createBaseAnimation(element, (target, tl) => {
        tl.from(split.chars, {
          yPercent: 10,
          opacity: 0,
          duration: 0.3,
          delay,
          stagger: { each: 0.02 },
          ease: "power1.out",
        });
      });
    },
  },

  // Eyebrow animations
  eyebrow: {
    selector: `[${animationAttributeName}="eyebrow"]`,
    animate: (element, delay = 0) => {
      createBaseAnimation(element, (target, tl) => {
        tl.from(target, {
          x: -20,
          opacity: 0,
          duration: 0.75,
          delay,
          ease: "sine.out",
        });
      });
    },
  },

  // Add new animation types here (example commented out)
  // button: {
  //   selector: `[${animationAttributeName}="button"]`,
  //   animate: (element, delay = 0) => {
  //     createBaseAnimation(element, (target, tl) => {
  //       tl.from(target, {
  //         scale: 0.9,
  //         opacity: 0,
  //         duration: 0.75,
  //         delay,
  //         ease: "back.out(1.7)",
  //       });
  //     });
  //   }
  // },
};

/**
 * Get animation delay from element's data-ani-delay attribute
 * @param {HTMLElement} element - The element to check for delay
 * @returns {number} Delay in seconds (0 if no delay set)
 */
function getDelay(element) {
  if (!element.hasAttribute(delayAttributeName)) return 0;

  const delay = element.getAttribute(delayAttributeName);
  const delayNumber = parseInt(delay);
  if (isNaN(delayNumber)) return 0;

  return delayNumber / 1000;
}

/**
 * Base animation function that sets up common properties
 * @param {HTMLElement} element - Target element
 * @param {function} animationCallback - Function to create the timeline
 */
function createBaseAnimation(element, animationCallback) {
  gsap.set(element, { opacity: 1 });
  const target = element;
  const tl = gsap.timeline({ paused: true });
  createFireOnceScrollTrigger(target, tl);
  animationCallback(target, tl);
}

/**
 * Run all text animations by looping through the animations object
 * Includes error handling for missing selectors
 */
export function runTextAnimations() {
  try {
    // Loop through each animation type in our animations object
    Object.entries(animations).forEach(([name, animationType]) => {
      try {
        // Get all elements matching this animation's selector
        const elements = document.querySelectorAll(animationType.selector);

        // Skip if no elements found
        if (elements.length === 0) {
          console.info(`No elements found for "${name}" animation`);
          return; // Skip this animation type and continue with others
        }

        // Apply the animation to each element
        elements.forEach((element) => {
          try {
            const delay = getDelay(element);
            animationType.animate(element, delay);
          } catch (elementError) {
            // Log error but continue with other elements
            console.warn(`Error animating ${name} element:`, elementError);
          }
        });
      } catch (typeError) {
        // Log error but continue with other animation types
        console.warn(`Error processing animation type "${name}":`, typeError);
      }
    });
  } catch (globalError) {
    // Log any overall errors
    console.error("Error in runTextAnimations:", globalError);
  }
}

/**
 * Initialize all text animations
 * Call this function from your main JS file
 */
export function initializeTextAnimations() {
  document.addEventListener("DOMContentLoaded", () => {
    runTextAnimations();
  });
}

/* Usage Examples:

  1. Using an existing animation on a custom element:
  
     ```js
     import { animations } from './utils/text.js';
     
     // Get an element that doesn't have the data-ani attribute
     const customElement = document.querySelector('.my-special-heading');
     
     // Animate it with the heading animation
     animations.heading.animate(customElement);
     
     // Or with the title animation and a 0.3 second delay
     animations.title.animate(customElement, 0.3);
     ```

  2. Adding a new animation type to the animations object:
  
     ```js
     import { splitTextForAnimation, SPLIT_TYPES } from './utils/textSplitter.js';
     
     // Add a new animation to the animations object
     animations.highlight = {
       selector: '[data-ani="highlight"]',
       animate: (element, delay = 0) => {
         // Split the text into chars
         const split = splitTextForAnimation(element, [SPLIT_TYPES.CHARS]);
         
         createBaseAnimation(element, (target, tl) => {
           // Create a staggered highlight effect
           tl.from(split.chars, {
             opacity: 0,
             duration: 0.05,
             stagger: 0.03,
             delay,
             ease: "none"
           });
         });
       }
     };
     ```

  3. Using autoSplit for responsive text:
  
     ```js
     // For headlines that need to maintain proper line breaks when resized
     const split = splitTextForAnimation('.responsive-headline', [SPLIT_TYPES.LINES], {
       autoSplit: true,  // Will automatically re-split when container width changes
     });
     
     // Animation will be cleaned up and reapplied correctly when text re-splits
     gsap.from(split.lines, {
       opacity: 0,
       y: 20,
       stagger: 0.1
     });
     ```

  4. Using other GSAP SplitText options:
  
     ```js
     // Using mask for reveal effects
     const split = splitTextForAnimation('.mask-reveal', [SPLIT_TYPES.LINES], {
       mask: true  // Creates a wrapper with overflow: hidden for clean reveals
     });
     
     gsap.from(split.lines, {
       yPercent: 100,  // Slides up from below
       duration: 1,
       stagger: 0.1
     });
     
     // Using absolute positioning (better for certain animations)
     const split = splitTextForAnimation('.fancy-effect', [SPLIT_TYPES.CHARS], {
       absolute: true  // Sets chars to absolute position for more complex animations
     });
     
     gsap.from(split.chars, {
       x: "random(-100, 100)",
       y: "random(-50, 50)",
       rotation: "random(-180, 180)",
       scale: 0,
       stagger: 0.02
     });
     ```
*/
