// Debug mode is now managed in the head script

// Preloader text options - easily add or remove texts here
const preloaderTexts = [
  "AYYY",
  "YERRR",
  "WHATDAHELLY",
  "SALAAMS",
  "HELLO",
  "HALO",
  "IDREEZUS",
  "WELCOME",
];

// Function to disable scrolling
function disableScroll() {
  console.log("[PRELOADER DEBUG] Disabling scroll");
  console.log(
    "[PRELOADER DEBUG] Body overflow before:",
    document.body.style.overflow
  );
  console.log(
    "[PRELOADER DEBUG] Body height before:",
    document.body.style.height
  );

  document.body.style.overflow = "hidden";
  document.body.style.height = "100vh";

  console.log(
    "[PRELOADER DEBUG] Body overflow after:",
    document.body.style.overflow
  );
  console.log(
    "[PRELOADER DEBUG] Body height after:",
    document.body.style.height
  );
}

// Function to enable scrolling
function enableScroll() {
  console.log("[PRELOADER DEBUG] Enabling scroll");
  document.body.style.overflow = "";
  document.body.style.height = "";
}

// Function to get current date in EST
function getCurrentDateEST() {
  const options = {
    timeZone: "America/New_York",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Date().toLocaleDateString("en-US", options);
}

// Function to get the next preloader text
function getNextPreloaderText() {
  console.log("[PRELOADER DEBUG] Getting next preloader text");
  const lastShownIndex = localStorage.getItem("lastPreloaderTextIndex");
  console.log(
    "[PRELOADER DEBUG] Last shown index from localStorage:",
    lastShownIndex
  );

  let nextIndex;
  if (
    lastShownIndex === null ||
    parseInt(lastShownIndex) >= preloaderTexts.length - 1
  ) {
    nextIndex = 0;
  } else {
    nextIndex = parseInt(lastShownIndex) + 1;
  }

  console.log("[PRELOADER DEBUG] Next index to show:", nextIndex);
  console.log("[PRELOADER DEBUG] Text to show:", preloaderTexts[nextIndex]);

  // Store the current index and date
  localStorage.setItem("lastPreloaderTextIndex", nextIndex);
  localStorage.setItem("lastPreloaderDate", new Date().toDateString());
  localStorage.setItem("lastPreloaderTime", new Date().getTime()); // Keep for backward compatibility

  return preloaderTexts[nextIndex];
}

// Function to set initial content immediately
function setInitialContent() {
  console.log("[PRELOADER DEBUG] Setting initial content");
  const preloader = document.querySelector(".preloader");

  if (!preloader) {
    console.log(
      "[PRELOADER DEBUG] Preloader element not found in setInitialContent"
    );
    return;
  }

  const textElement = preloader.querySelector(".preloader_text");
  const dateElement = preloader.querySelector(".preloader_date");

  console.log("[PRELOADER DEBUG] Text element found:", !!textElement);
  console.log("[PRELOADER DEBUG] Date element found:", !!dateElement);

  if (textElement && dateElement) {
    textElement.textContent = preloaderTexts[0]; // Set initial text
    dateElement.textContent = getCurrentDateEST();
    console.log(
      "[PRELOADER DEBUG] Initial content set - Text:",
      preloaderTexts[0],
      "Date:",
      getCurrentDateEST()
    );
  }
}

// Main preloader animation function
export function initPreloader() {
  console.log("[PRELOADER DEBUG] === initPreloader called ===");
  console.log("[PRELOADER DEBUG] User Agent:", navigator.userAgent);
  console.log("[PRELOADER DEBUG] Platform:", navigator.platform);
  console.log("[PRELOADER DEBUG] Document ready state:", document.readyState);

  const preloader = document.querySelector(".preloader");
  const animatedH1 = document.getElementById("has-preloader");

  console.log("[PRELOADER DEBUG] Preloader element found:", !!preloader);
  console.log("[PRELOADER DEBUG] Animated H1 element found:", !!animatedH1);

  // Log preloader element details if found
  if (preloader) {
    console.log("[PRELOADER DEBUG] Preloader computed styles:");
    const computedStyles = window.getComputedStyle(preloader);
    console.log("[PRELOADER DEBUG] - display:", computedStyles.display);
    console.log("[PRELOADER DEBUG] - visibility:", computedStyles.visibility);
    console.log("[PRELOADER DEBUG] - opacity:", computedStyles.opacity);
    console.log("[PRELOADER DEBUG] - position:", computedStyles.position);
    console.log("[PRELOADER DEBUG] - z-index:", computedStyles.zIndex);
    console.log("[PRELOADER DEBUG] - width:", computedStyles.width);
    console.log("[PRELOADER DEBUG] - height:", computedStyles.height);
    console.log("[PRELOADER DEBUG] - background:", computedStyles.background);

    // Check CSS custom properties
    const rootStyles = window.getComputedStyle(document.documentElement);
    console.log("[PRELOADER DEBUG] CSS Custom Properties:");
    console.log(
      "[PRELOADER DEBUG] - --preloader-display:",
      rootStyles.getPropertyValue("--preloader-display")
    );
    console.log(
      "[PRELOADER DEBUG] - --global-transition-display:",
      rootStyles.getPropertyValue("--global-transition-display")
    );

    console.log("[PRELOADER DEBUG] Preloader classes:", preloader.className);
    console.log(
      "[PRELOADER DEBUG] Preloader inline styles:",
      preloader.style.cssText
    );
  }

  // Check if preloader exists on the page
  if (!preloader) {
    console.log(
      "[PRELOADER DEBUG] Preloader not found on page, skipping initialization"
    );
    return;
  }

  // Check global config
  console.log("[PRELOADER DEBUG] window.muminoConfig:", window.muminoConfig);

  // Check if preloader should be shown (using global config set in head)
  const shouldShow = window.muminoConfig?.showPreloader ?? false;
  console.log("[PRELOADER DEBUG] Should show preloader:", shouldShow);

  if (!shouldShow) {
    console.log("[PRELOADER DEBUG] Preloader skipped - not due to show");
    preloader.style.display = "none";

    // Remove animation delay from H1 if preloader is not showing
    if (animatedH1 && animatedH1.hasAttribute("data-ani-delay")) {
      console.log("[PRELOADER DEBUG] Removing data-ani-delay from H1");
      animatedH1.removeAttribute("data-ani-delay");
    }
    return;
  }

  console.log("[PRELOADER DEBUG] Initializing preloader animation");

  // Add animation delay to H1 if it exists
  if (animatedH1) {
    console.log("[PRELOADER DEBUG] Adding data-ani-delay='2500' to H1");
    animatedH1.setAttribute("data-ani-delay", "2500");
  }

  // Disable scrolling when preloader starts
  disableScroll();

  // Set up the initial state
  const textElement = preloader.querySelector(".preloader_text");
  const dateElement = preloader.querySelector(".preloader_date");

  console.log(
    "[PRELOADER DEBUG] Text element found in animation:",
    !!textElement
  );
  console.log(
    "[PRELOADER DEBUG] Date element found in animation:",
    !!dateElement
  );

  // Log text/date element details
  if (textElement) {
    const textStyles = window.getComputedStyle(textElement);
    console.log("[PRELOADER DEBUG] Text element computed styles:");
    console.log("[PRELOADER DEBUG] - display:", textStyles.display);
    console.log("[PRELOADER DEBUG] - visibility:", textStyles.visibility);
    console.log("[PRELOADER DEBUG] - opacity:", textStyles.opacity);
    console.log("[PRELOADER DEBUG] - color:", textStyles.color);
    console.log("[PRELOADER DEBUG] - font-size:", textStyles.fontSize);
  }

  // Check if required elements exist
  if (!textElement || !dateElement) {
    console.error("[PRELOADER DEBUG] Required preloader elements not found");
    enableScroll(); // Re-enable scrolling if there's an error
    return;
  }

  // Get and set content
  const preloaderText = getNextPreloaderText();
  textElement.textContent = preloaderText;
  dateElement.textContent = getCurrentDateEST();

  console.log(
    "[PRELOADER DEBUG] Content set - Text:",
    preloaderText,
    "Date:",
    getCurrentDateEST()
  );

  // Add active class to show preloader
  console.log("[PRELOADER DEBUG] Adding 'is-active' class to preloader");
  preloader.classList.add("is-active");

  // Check styles after adding is-active
  setTimeout(() => {
    const updatedStyles = window.getComputedStyle(preloader);
    console.log("[PRELOADER DEBUG] Preloader styles after 'is-active' added:");
    console.log("[PRELOADER DEBUG] - display:", updatedStyles.display);
    console.log("[PRELOADER DEBUG] - visibility:", updatedStyles.visibility);
    console.log("[PRELOADER DEBUG] - opacity:", updatedStyles.opacity);
  }, 10);

  // Check if GSAP is available
  console.log("[PRELOADER DEBUG] GSAP available:", typeof gsap !== "undefined");

  if (typeof gsap === "undefined") {
    console.error("[PRELOADER DEBUG] GSAP is not defined!");
    enableScroll();
    return;
  }

  // Create the animation timeline
  console.log("[PRELOADER DEBUG] Creating GSAP timeline");
  const tl = gsap.timeline({
    onComplete: () => {
      console.log(
        "[PRELOADER DEBUG] Timeline complete, removing 'is-active' class"
      );
      preloader.classList.remove("is-active");
    },
  });

  // Set initial states
  console.log("[PRELOADER DEBUG] Setting initial GSAP states");
  gsap.set([textElement, dateElement], {
    autoAlpha: 0,
    y: 10,
    filter: "blur(2px)",
  });

  // Build the animation sequence
  console.log("[PRELOADER DEBUG] Building animation sequence");
  tl.to(textElement, {
    autoAlpha: 1,
    y: 0,
    duration: 1.25,
    filter: "blur(0px)",
    ease: "power1.out",
    onStart: () => console.log("[PRELOADER DEBUG] Text animation started"),
    onComplete: () => console.log("[PRELOADER DEBUG] Text animation completed"),
  })
    .to(
      dateElement,
      {
        autoAlpha: 0.5,
        duration: 1,
        y: 0,
        filter: "blur(0px)",
        ease: "power1.out",
        onStart: () => console.log("[PRELOADER DEBUG] Date animation started"),
        onComplete: () =>
          console.log("[PRELOADER DEBUG] Date animation completed"),
      },
      "-=0.75"
    )
    .to(preloader, {
      autoAlpha: 0,
      duration: 0.5,
      ease: "sine.out",
      delay: 1,
      onStart: () => {
        console.log("[PRELOADER DEBUG] Preloader fade-out started");
        enableScroll(); // Re-enable scrolling when preloader starts fading out
      },
      onComplete: () =>
        console.log("[PRELOADER DEBUG] Preloader fade-out completed"),
    });

  console.log("[PRELOADER DEBUG] Timeline created and playing");
}

// Set initial content as soon as possible
console.log(
  "[PRELOADER DEBUG] Document ready state at script load:",
  document.readyState
);
if (document.readyState === "loading") {
  console.log(
    "[PRELOADER DEBUG] Document still loading, adding DOMContentLoaded listener"
  );
  document.addEventListener("DOMContentLoaded", setInitialContent);
} else {
  console.log(
    "[PRELOADER DEBUG] Document already loaded, calling setInitialContent immediately"
  );
  setInitialContent();
}
