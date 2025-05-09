export function initPageTransition() {
  const transitionElement = document.querySelector(".global-transition");
  if (!transitionElement) return;

  // Set initial state
  gsap.set(transitionElement, {
    display: "none",
    opacity: 0,
  });

  // Create the transition timeline
  const transitionTimeline = gsap.timeline({
    paused: true,
    onComplete: () => {
      // Hide the transition element after animation completes
      gsap.set(transitionElement, { display: "none" });
    },
  });

  // Add animations to the timeline
  transitionTimeline
    .set(transitionElement, { display: "flex" })
    .to(transitionElement, {
      opacity: 1,
      duration: 0.5,
      ease: "power2.inOut",
    })
    .to(transitionElement, {
      opacity: 0,
      duration: 0.5,
      ease: "power2.inOut",
      delay: 0.5, // Minimum delay to ensure animation plays for at least 1 second
    });

  // Listen for navigation events
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (!link) return;

    // Only handle internal links
    if (link.hostname === window.location.hostname) {
      e.preventDefault();
      const targetUrl = link.href;

      // Start the transition
      transitionTimeline.restart();

      // Load the new page
      fetch(targetUrl)
        .then((response) => response.text())
        .then((html) => {
          // Create a temporary element to parse the HTML
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");

          // Update the page content
          document.title = doc.title;
          document.querySelector("main").innerHTML =
            doc.querySelector("main").innerHTML;

          // Update the URL without reloading
          window.history.pushState({}, "", targetUrl);

          // Ensure minimum animation duration
          const animationDuration = 1000; // 1 second minimum
          const elapsedTime = transitionTimeline.time() * 1000;

          if (elapsedTime < animationDuration) {
            const remainingTime = animationDuration - elapsedTime;
            setTimeout(() => {
              transitionTimeline.play();
            }, remainingTime);
          } else {
            transitionTimeline.play();
          }
        })
        .catch((error) => {
          console.error("Error loading page:", error);
          // If there's an error, still complete the transition
          transitionTimeline.play();
        });
    }
  });

  // Handle browser back/forward buttons
  window.addEventListener("popstate", () => {
    transitionTimeline.restart();
  });
}
