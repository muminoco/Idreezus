function initPageTransition() {
  // SEQUENCE 1: Initial page load
  // When the page first loads, the global-transition div starts at opacity 1 (from CSS)
  // Immediately fade it out to opacity 0 and hide it
  gsap.fromTo(
    ".global-transition",
    {
      opacity: 1,
    },
    {
      opacity: 0,
      duration: 0.0001,
      ease: "sine.out",
      onComplete: () => {
        gsap.set(".global-transition", { display: "none" });
      },
    }
  );

  // SEQUENCE 2: Link click and page transition
  // When an internal link is clicked:
  // 1. Show the transition div
  // 2. Fade it in to opacity 1
  // 3. Navigate to the new page once fade-in is complete
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a");

    if (!link) return;

    // Check if it's an internal link
    if (
      link.hostname === window.location.hostname &&
      !link.hash &&
      link.target !== "_blank"
    ) {
      e.preventDefault();
      const destination = link.href;

      // Show the transition div
      gsap.set(".global-transition", { display: "flex" });

      // Fade in the transition
      gsap.to(".global-transition", {
        opacity: 1,
        duration: 0.25,
        ease: "sine.out",
        onComplete: () => {
          window.location = destination;
        },
      });
    }
  });

  // SEQUENCE 3: New page load
  // When the new page loads, the global-transition div is at opacity 1
  // Fade it out to opacity 0 and hide it
  window.addEventListener("pageshow", (event) => {
    // Fade out transition
    gsap.fromTo(
      ".global-transition",
      {
        opacity: 1,
      },
      {
        opacity: 0,
        duration: 0.25,
        ease: "sine.out",
        onComplete: () => {
          gsap.set(".global-transition", { display: "none" });
        },
      }
    );
  });
}

export { initPageTransition };
