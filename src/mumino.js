import { initializeTextAnimations } from "../animations/global/text.js";
import { initBatchAnimations } from "../animations/global/batch.js";
import { initNavbarAnimations } from "../components/navbar/navbar.js";
import { initThemeToggler } from "../components/themeToggler.js";
import { initCopyButtons } from "../components/copyButtons.js";
import { initializeHoverEffects } from "../animations/global/hover.js";
import { initPreloader } from "../components/pageTransitions/preloader.js";
import { initRevealAnimations } from "../animations/global/reveal.js";
import { initPageTransition } from "../components/pageTransitions/pageTransition.js";

function initializeMumino() {
  // Initialize features
  initializeTextAnimations();
  initBatchAnimations();
  initNavbarAnimations();
  initThemeToggler();
  initCopyButtons();
  initializeHoverEffects();
  initPreloader();
  initRevealAnimations();
  initPageTransition();
}

initializeMumino();
