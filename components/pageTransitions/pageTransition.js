function initPageTransition() {
  // Check if global transitions should be active for initial page load
  const shouldShowGlobalTransition =
    window.muminoConfig?.showGlobalTransition ?? true;

  // SEQUENCE 1: Initial page load
  // Only fade out the initial transition if preloader is NOT showing
  if (shouldShowGlobalTransition) {
    // When the page first loads, the global-transition div starts at opacity 1 (from CSS)
    // Immediately fade it out to opacity 0 and hide it
    gsap.fromTo(
      ".global-transition",
      {
        opacity: 1,
      },
      {
        opacity: 0,
        duration: 0.3,
        ease: "sine.out",
        onComplete: () => {
          gsap.set(".global-transition", { display: "none" });
        },
      }
    );
  } else {
    // If preloader is showing, just hide the global transition immediately
    const globalTransition = document.querySelector(".global-transition");
    if (globalTransition) {
      gsap.set(globalTransition, { display: "none", opacity: 0 });
    }
  }

  // SEQUENCE 2: Link click and page transition
  // When an internal link is clicked:
  // 1. Show the transition div
  // 2. Fade it in to opacity 1
  // 3. Navigate to the new page once fade-in is complete
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a");

    if (!link) return;

    // Enhanced validation checks for internal links
    // Check if the link is to the same domain/website
    const isInternalLink = link.hostname === window.location.hostname;

    // Normalize current path (remove trailing slash except for root)
    const currentPath =
      window.location.pathname === "/"
        ? ""
        : window.location.pathname.replace(/\/$/, "");

    // Normalize link path (remove trailing slash except for root)
    const linkPath =
      link.pathname === "/" ? "" : link.pathname.replace(/\/$/, "");

    // Ensure the href exists and isn't just a hash on any path
    const hasValidHref =
      link.href &&
      link.href.trim() !== "" &&
      link.href !== window.location.origin + currentPath + "#" &&
      (link.hash === "" || link.hash.length > 1); // Ensure hash isn't empty or just '#'

    // Prevent transitions for hash links on the same page
    const isNotHashOnly = !link.hash || (link.hash && linkPath !== currentPath);
    // Skip transition for links that open in new tabs
    const isNotBlankTarget = link.target !== "_blank";
    // Skip transition for downloadable files
    const isNotDownload = !link.hasAttribute("download");
    // Skip transition for email links
    const isNotMailTo = !link.href.startsWith("mailto:");
    // Skip transition for telephone links
    const isNotTel = !link.href.startsWith("tel:");
    // Ensure link uses standard web protocols
    const hasValidProtocol =
      link.protocol === "http:" || link.protocol === "https:";

    // Only proceed with transition if all conditions are met
    if (
      isInternalLink &&
      hasValidHref &&
      isNotHashOnly &&
      isNotBlankTarget &&
      isNotDownload &&
      isNotMailTo &&
      isNotTel &&
      hasValidProtocol
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
