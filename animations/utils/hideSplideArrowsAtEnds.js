/**
 * Adds functionality to hide Splide slider arrows at the start/end of the slider
 * @param {Splide} splideInstance - The Splide slider instance to add the functionality to
 */

// hideSplideArrowsAtEnds.js

window.hideArrowsAtEnds = function (splideInstance) {
  splideInstance.on("arrows:updated", (prev, next, prevIndex, nextIndex) => {
    if (!prev || !next) return;

    // Check if we're at the start or end
    const isStart = splideInstance.index === 0;
    const isEnd = splideInstance.index === splideInstance.length - 1;

    // Update prev arrow
    if (isStart) {
      prev.classList.add("splide__arrow--disabled");
    } else {
      prev.classList.remove("splide__arrow--disabled");
    }

    // Update next arrow
    if (isEnd) {
      next.classList.add("splide__arrow--disabled");
    } else {
      next.classList.remove("splide__arrow--disabled");
    }
  });
};

/*

export function hideArrowsAtEnds(splideInstance) {
  splideInstance.on("arrows:updated", (prev, next, prevIndex, nextIndex) => {
    if (!prev || !next) return;

    // Check if we're at the start or end
    const isStart = splideInstance.index === 0;
    const isEnd = splideInstance.index === splideInstance.length - 1;

    // Update prev arrow
    if (isStart) {
      prev.classList.add("splide__arrow--disabled");
    } else {
      prev.classList.remove("splide__arrow--disabled");
    }

    // Update next arrow
    if (isEnd) {
      next.classList.add("splide__arrow--disabled");
    } else {
      next.classList.remove("splide__arrow--disabled");
    }
  });
}
  
*/
