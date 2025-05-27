// Debug mode is now managed in the head script

// Preloader text options - easily add or remove texts here
const preloaderTexts = [
  "IDREEZUS",
  "WHATDAHELLY",
  "SALAAMS",
  "HELLO",
  "WELCOME",
  "AYYY",
];

// Function to disable scrolling
function disableScroll() {
  document.body.style.overflow = "hidden";
  document.body.style.height = "100vh";
}

// Function to enable scrolling
function enableScroll() {
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
  const lastShownIndex = localStorage.getItem("lastPreloaderTextIndex");

  let nextIndex;
  if (
    lastShownIndex === null ||
    parseInt(lastShownIndex) >= preloaderTexts.length - 1
  ) {
    nextIndex = 0;
  } else {
    nextIndex = parseInt(lastShownIndex) + 1;
  }

  // Store the current index and date
  localStorage.setItem("lastPreloaderTextIndex", nextIndex);
  localStorage.setItem("lastPreloaderDate", new Date().toDateString());
  localStorage.setItem("lastPreloaderTime", new Date().getTime()); // Keep for backward compatibility

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
  const animatedH1 = document.getElementById("has-preloader");

  // Check if preloader exists on the page
  if (!preloader) {
    console.log("Preloader not found on page, skipping initialization");
    return;
  }

  // Check if preloader should be shown (using global config set in head)
  const shouldShow = window.muminoConfig?.showPreloader ?? false;

  if (!shouldShow) {
    console.log("Preloader skipped - not due to show");
    preloader.style.display = "none";

    // Remove animation delay from H1 if preloader is not showing
    if (animatedH1 && animatedH1.hasAttribute("data-ani-delay")) {
      animatedH1.removeAttribute("data-ani-delay");
    }
    return;
  }

  console.log("Initializing preloader animation");

  // Add animation delay to H1 if it exists
  if (animatedH1) {
    animatedH1.setAttribute("data-ani-delay", "2500");
  }

  // Disable scrolling when preloader starts
  disableScroll();

  // Set up the initial state
  const textElement = preloader.querySelector(".preloader_text");
  const dateElement = preloader.querySelector(".preloader_date");

  // Check if required elements exist
  if (!textElement || !dateElement) {
    console.error("Required preloader elements not found");
    enableScroll(); // Re-enable scrolling if there's an error
    return;
  }

  // Get and set content
  const preloaderText = getNextPreloaderText();
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
  gsap.set([textElement, dateElement], {
    autoAlpha: 0,
    y: 10,
    filter: "blur(2px)",
  });

  // Build the animation sequence
  tl.to(textElement, {
    autoAlpha: 1,
    y: 0,
    duration: 1.25,
    filter: "blur(0px)",
    ease: "power1.out",
  })
    .to(
      dateElement,
      {
        autoAlpha: 0.5,
        duration: 1,
        y: 0,
        filter: "blur(0px)",
        ease: "power1.out",
      },
      "-=0.75"
    )
    .to(preloader, {
      autoAlpha: 0,
      duration: 0.5,
      ease: "sine.out",
      delay: 1,
      onStart: () => {
        enableScroll(); // Re-enable scrolling when preloader starts fading out
      },
    });
}

// Set initial content as soon as possible
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setInitialContent);
} else {
  setInitialContent();
}
