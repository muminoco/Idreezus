// Universal configuration for all trigger types
const isMarkersOn = false;
const startScrollerPosition = "93%";

// Collection of different ScrollTrigger types
const triggerTypes = {
  // Default type: Resets when leaving viewport, plays when entering
  // Good for repeatable animations that should reset when scrolling back up
  default: (triggerElement, timeline) => {
    return [
      // First trigger: Resets the animation when element leaves viewport from top
      ScrollTrigger.create({
        trigger: triggerElement,
        start: "top bottom",
        markers: isMarkersOn,
        onLeaveBack: () => {
          timeline.progress(0);
          timeline.pause();
        },
      }),
      // Second trigger: Plays animation when element enters viewport from bottom,
      // and from the top (which is the onEnterBack callback)
      ScrollTrigger.create({
        trigger: triggerElement,
        start: `top ${startScrollerPosition}`,
        end: "bottom top",
        markers: isMarkersOn,
        onEnter: () => timeline.play(),
        onEnterBack: () => timeline.restart(),
      }),
    ];
  },

  // ReplayOnEntry type: Plays each time element enters viewport
  // Good for animations that should play fresh each time element enters viewport
  replayOnEntry: (triggerElement, timeline) => {
    return [
      ScrollTrigger.create({
        trigger: triggerElement,
        start: `top ${startScrollerPosition}`,
        end: "bottom top",
        markers: isMarkersOn,
        onEnter: () => timeline.play(),
        onEnterBack: () => timeline.restart(),
      }),
    ];
  },

  // Fire-once type: Plays only one time when entering viewport, then stops listening
  // Perfect for animations that should only ever play once and never replay
  fireOnce: (triggerElement, timeline) => {
    return [
      ScrollTrigger.create({
        trigger: triggerElement,
        start: `top ${startScrollerPosition}`,
        end: "bottom top",
        markers: isMarkersOn,
        once: true,
        toggleActions: "play none none none",
        onEnter: () => timeline.play(),
      }),
    ];
  },

  // Scrub type: Animation progress tied to scroll position
  // Good for parallax effects or animations that should follow scroll
  scrub: (triggerElement, timeline) => {
    return [
      ScrollTrigger.create({
        trigger: triggerElement,
        start: `top ${startScrollerPosition}`,
        end: "bottom top",
        markers: isMarkersOn,
        scrub: 1,
        animation: timeline,
      }),
    ];
  },

  // Pin type: Element stays fixed while animation plays
  // Good for full-screen transitions or step-based animations
  pinned: (triggerElement, timeline) => {
    return [
      ScrollTrigger.create({
        trigger: triggerElement,
        start: `top ${startScrollerPosition}`,
        end: "+=100%",
        markers: isMarkersOn,
        pin: true,
        anticipatePin: 1,
        animation: timeline,
      }),
    ];
  },
};

// Main creation function that can use any trigger type
export function createScrollTrigger(
  triggerElement,
  timeline,
  type = "default"
) {
  const triggerFunction = triggerTypes[type];

  if (!triggerFunction) {
    console.error(`Invalid trigger type: ${type}`);
    return [];
  }

  return triggerFunction(triggerElement, timeline);
}

// Helper functions for common trigger types
export function createReplayOnEntryScrollTrigger(triggerElement, timeline) {
  return createScrollTrigger(triggerElement, timeline, "replayOnEntry");
}

export function createFireOnceScrollTrigger(triggerElement, timeline) {
  return createScrollTrigger(triggerElement, timeline, "fireOnce");
}

export function createScrubScrollTrigger(triggerElement, timeline) {
  return createScrollTrigger(triggerElement, timeline, "scrub");
}

export function createPinnedScrollTrigger(triggerElement, timeline) {
  return createScrollTrigger(triggerElement, timeline, "pinned");
}

/* Usage examples:
// Default behavior (resets on scroll up)
createScrollTrigger(element, timeline);

// ReplayOnEntry trigger (plays fresh each time element enters)
createScrollTrigger(element, timeline, 'replayOnEntry');
// or
createReplayOnEntryScrollTrigger(element, timeline);

// Fire-once trigger (plays once and never again)
createScrollTrigger(element, timeline, 'fireOnce');
// or
createFireOnceScrollTrigger(element, timeline);

// Scrubbing animation (follows scroll)
createScrollTrigger(element, timeline, 'scrub');
// or
createScrubScrollTrigger(element, timeline);

// Pinned animation (stays fixed during animation)
createScrollTrigger(element, timeline, 'pinned');
// or
createPinnedScrollTrigger(element, timeline);
*/
