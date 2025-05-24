// This script should be added to the <head> section of your site
(function () {
  // Check if preloader should be shown
  function shouldShowPreloader() {
    const debugMode = false; // Make sure this matches your preloader.js debugMode value
    if (debugMode) return true;

    const lastShownTime = localStorage.getItem("lastPreloaderTime");
    const currentTime = new Date().getTime();

    if (!lastShownTime) return true;

    // Check if 24 hours have passed
    return currentTime - parseInt(lastShownTime) >= 24 * 60 * 60 * 1000;
  }

  // Set initial display state
  document.documentElement.style.setProperty(
    "--preloader-display",
    shouldShowPreloader() ? "flex" : "none"
  );
})();
