import { createFireOnceScrollTrigger } from "../utils/scrollTriggers.js";

// Default animation settings
const DEFAULT = {
  duration: 0.75,
  ease: "sine.out",
  delay: 0,
  stagger: {
    amount: 1,
  },
};

/**
 * Base animation function that sets up common properties
 * @param {HTMLElement} elements - Target elements
 * @param {function} animationCallback - Function to create the timeline
 */
function createBaseStaggerAnimation(elements, animationCallback) {
  // Set initial opacity for all elements
  gsap.set(elements, { opacity: 1 });

  // Create timeline
  const tl = gsap.timeline({ paused: true });

  // Create scroll trigger for the group
  createFireOnceScrollTrigger(elements[0], tl); // Use first element as trigger

  // Run the animation callback
  animationCallback(elements, tl);
}

const staggerEffects = {
  stagger01(elements, delay = 0) {
    createBaseStaggerAnimation(elements, (targets, tl) => {
      tl.from(targets, {
        opacity: 0,
        duration: 0.75,
        delay,
        stagger: 0.1,
        ease: "ease.in",
      });
    });
  },
};

export { staggerEffects };
