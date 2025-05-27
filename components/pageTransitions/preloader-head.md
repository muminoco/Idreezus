<style>
/* These styles are needed for the page transition and preloader stuff to function properly */
.preloader {
  display: var(--preloader-display, none);
}

.global-transition {
  display: var(--global-transition-display, flex);
}

/* Preloader stuff initial states */
.preloader_text,
.preloader_date {
    opacity: 0; /* Start with 0 opacity */
    visibility: hidden; /* Hide the elements initially */
}

</style>

<script>
// This script should be added to the <head> section of your site
(function () {
  // Debug mode - set to true to test preloader on every refresh
  const debugMode = false;
  
  // Check if it's a new day since last preloader
  const lastShownDate = localStorage.getItem("lastPreloaderDate");
  const today = new Date().toDateString(); // e.g., "Wed Jan 01 2025"
  
  const showPreloader = debugMode || lastShownDate !== today;
  
  // Set visibility immediately
  const root = document.documentElement.style;
  root.setProperty("--preloader-display", showPreloader ? "flex" : "none");
  root.setProperty("--global-transition-display", showPreloader ? "none" : "flex");

  // Store config globally
  window.muminoConfig = {
    debugMode: debugMode,
    showPreloader: showPreloader,
    showGlobalTransition: !showPreloader
  };
})();
</script>
