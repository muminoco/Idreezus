import { initializeTextAnimations } from "../animations/global/text.js";
import { initBatchAnimations } from "../animations/global/batch.js";
import { initNavbarAnimations } from "../components/navbar/navbar.js";
import { initThemeToggler } from "../components/themeToggler.js";
import { initCopyButtons } from "../components/copyButtons.js";

function initializeMumino() {
  // Initialize features
  initializeTextAnimations();
  initBatchAnimations();
  initNavbarAnimations();
  initThemeToggler();
  initCopyButtons();
}

initializeMumino();
