// Debug mode - set to true to test preloader on every refresh
const debugMode = true;

// Preloader text options - easily add or remove texts here
const preloaderTexts = [
  "WASGUUD",
  "YERRR",
  "WHATDAHELLY",
  "SALAAMS",
  "HELLO FRIEND",
  "HALO",
  "IDREEZUS",
  "LOCK IN",
];

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
  const lastShownIndex = localStorage.getItem("lastPreloaderTextIndex");
  const lastShownTime = localStorage.getItem("lastPreloaderTime");
  const currentTime = new Date().getTime();

  // Skip 24-hour check if debug mode is enabled
  if (!debugMode) {
    // Check if 24 hours have passed
    if (
      lastShownTime &&
      currentTime - parseInt(lastShownTime) < 24 * 60 * 60 * 1000
    ) {
      return null; // Don't show preloader if less than 24 hours have passed
    }
  }

  let nextIndex;
  if (
    lastShownIndex === null ||
    parseInt(lastShownIndex) >= preloaderTexts.length - 1
  ) {
    nextIndex = 0;
  } else {
    nextIndex = parseInt(lastShownIndex) + 1;
  }

  // Store the current index and time
  localStorage.setItem("lastPreloaderTextIndex", nextIndex);
  localStorage.setItem("lastPreloaderTime", currentTime);

  return preloaderTexts[nextIndex];
}

// Function to set initial content immediately
function setInitialContent() {
  const preloader = document.querySelector(".preloader");
  if (!preloader) return;

  const textElement = preloader.querySelector(".preloader_text");
  const dateElement = preloader.querySelector(".preloader_date");

  if (textElement && dateElement) {
    textElement.textContent = preloaderTexts[0]; // Set initial text
    dateElement.textContent = getCurrentDateEST();
  }
}

// Main preloader animation function
export function initPreloader() {
  const preloader = document.querySelector(".preloader");

  // Check if preloader exists on the page
  if (!preloader) {
    console.log("Preloader not found on page, skipping initialization");
    return;
  }

  const preloaderText = getNextPreloaderText();

  // If no preloader should be shown, return
  if (!preloaderText) {
    preloader.style.display = "none";
    return;
  }

  // Set up the initial state
  const textElement = preloader.querySelector(".preloader_text");
  const dateElement = preloader.querySelector(".preloader_date");

  // Check if required elements exist
  if (!textElement || !dateElement) {
    console.error("Required preloader elements not found");
    return;
  }

  // Set content
  textElement.textContent = preloaderText;
  dateElement.textContent = getCurrentDateEST();

  // Add active class to show preloader
  preloader.classList.add("is-active");

  // Create the animation timeline
  const tl = gsap.timeline({
    onComplete: () => {
      preloader.classList.remove("is-active");
    },
  });

  // Set initial states
  gsap.set([textElement, dateElement], { autoAlpha: 0 });

  // Build the animation sequence
  tl.to(textElement, {
    autoAlpha: 1,
    duration: 1,
    ease: "power2.inOut",
  })
    .to(
      dateElement,
      {
        autoAlpha: 1,
        duration: 1,
        ease: "power2.inOut",
      },
      "-=0.5"
    )
    .to(preloader, {
      autoAlpha: 0,
      duration: 1,
      ease: "power2.inOut",
      delay: 1,
    });
}

// Set initial content as soon as possible
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setInitialContent);
} else {
  setInitialContent();
}
