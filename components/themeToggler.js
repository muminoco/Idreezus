// Configuration
const USE_SYSTEM_PREFERENCE = true; // Set to false to always start with light mode
const THEME_BUTTON_ID = "theme-toggle"; // ID for theme toggle buttons
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

// Initialize theme based on system preference or stored preference
function initializeTheme() {
  const storedTheme = localStorage.getItem(THEME_PREFERENCE_KEY);

  if (USE_SYSTEM_PREFERENCE && !storedTheme) {
    // Use system preference if no stored preference
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setTheme(prefersDark ? "dark" : "light");
  } else {
    // Use stored preference or default to light
    setTheme(storedTheme || "light");
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

// Toggle theme function
function toggleTheme() {
  const currentTheme = localStorage.getItem(THEME_PREFERENCE_KEY) || "light";
  const newTheme = currentTheme === "light" ? "dark" : "light";
  setTheme(newTheme);
}

// Add click event listeners to all theme toggle buttons
function initializeThemeButtons() {
  const themeButtons = document.querySelectorAll(`#${THEME_BUTTON_ID}`);
  themeButtons.forEach((button) => {
    button.addEventListener("click", toggleTheme);
  });
}

// Main initialization function
export function initThemeToggler() {
  initializeTheme();
  initializeThemeButtons();
}
