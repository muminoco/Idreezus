// Configuration
const USE_SYSTEM_PREFERENCE = true; // Set to false to always start with light mode
const THEME_TOGGLE_SELECTOR = "[data-theme-toggle]"; // Selector for theme toggle buttons
const THEME_CLASS_DARK = "theme-dark";
const THEME_CLASS_LIGHT = "theme-light";
const THEME_PREFERENCE_KEY = "user-theme-preference";

// Prevent theme flash by setting theme immediately
export function preventThemeFlash() {
  const storedTheme = localStorage.getItem(THEME_PREFERENCE_KEY);

  if (USE_SYSTEM_PREFERENCE && !storedTheme) {
    // Use system preference if no stored preference
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    document.documentElement.classList.add(
      prefersDark ? THEME_CLASS_DARK : THEME_CLASS_LIGHT
    );
  } else {
    // Use stored preference or default to light
    document.documentElement.classList.add(
      storedTheme === "dark" ? THEME_CLASS_DARK : THEME_CLASS_LIGHT
    );
  }
}

// Initialize theme with tracking based on system preference or stored preference
function initializeTheme() {
  const storedTheme = localStorage.getItem(THEME_PREFERENCE_KEY);
  let initialTheme;
  let themeSource;

  if (USE_SYSTEM_PREFERENCE && !storedTheme) {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    initialTheme = prefersDark ? "dark" : "light";
    themeSource = "system_preference";
  } else if (storedTheme) {
    initialTheme = storedTheme;
    themeSource = "stored_preference";
  } else {
    initialTheme = "light";
    themeSource = "default";
  }

  setTheme(initialTheme);

  // Set user properties for GA4
  if (typeof gtag === "function") {
    gtag("set", {
      theme_preference: initialTheme,
      theme_source: themeSource,
    });
  }
}

// Set theme and update UI
function setTheme(theme) {
  const pageDiv = document.querySelector(".page");
  if (!pageDiv) return;

  // Remove both classes first
  document.documentElement.classList.remove(
    THEME_CLASS_DARK,
    THEME_CLASS_LIGHT
  );
  pageDiv.classList.remove(THEME_CLASS_DARK, THEME_CLASS_LIGHT);

  // Add the appropriate class
  if (theme === "dark") {
    document.documentElement.classList.add(THEME_CLASS_DARK);
    pageDiv.classList.add(THEME_CLASS_DARK);
  } else {
    document.documentElement.classList.add(THEME_CLASS_LIGHT);
    pageDiv.classList.add(THEME_CLASS_LIGHT);
  }

  // Store preference
  localStorage.setItem(THEME_PREFERENCE_KEY, theme);
}

function toggleTheme() {
  const currentTheme = localStorage.getItem(THEME_PREFERENCE_KEY) || "light";
  const newTheme = currentTheme === "light" ? "dark" : "light";

  setTheme(newTheme);

  // Update user property and track the toggle event
  if (typeof gtag === "function") {
    // Update the user property with new preference
    gtag("set", {
      theme_preference: newTheme,
    });

    // Track the toggle as a simple event
    gtag("event", "theme_toggle", {
      event_category: "Design Preferences",
    });
  }
}

// Add click event listeners to all theme toggle buttons
function initializeThemeButtons() {
  const themeButtons = document.querySelectorAll(THEME_TOGGLE_SELECTOR);
  themeButtons.forEach((button) => {
    button.addEventListener("click", toggleTheme);
  });
}

// Main initialization function
export function initThemeToggler() {
  initializeTheme();
  initializeThemeButtons();
}
