# Mumino Preloader & Page Transition System Documentation

## User-Friendly Summary

This system manages two key animations on your Webflow website:

1. **Daily Preloader**: A greeting animation that shows once per day to returning visitors
2. **Page Transitions**: Smooth animations when users navigate between pages

### Key Behaviors:
- **First-time visitors** always see the preloader
- **Returning visitors** see the preloader once per calendar day (resets at midnight)
- **Page transitions** work for all internal navigation, but are disabled when the preloader shows
- **Debug mode** can be enabled to test the preloader on every page refresh

### What Users Experience:
- On their first visit or once daily: They see a personalized greeting with rotating text ("HELLO", "SALAAMS", etc.) and today's date
- When clicking internal links: Smooth transition animations between pages
- The two animations never conflict - only one plays at a time

---

## Technical Implementation

### Architecture Overview

The system uses a **coordination pattern** where a lightweight head script determines which animation should be active, then sets CSS custom properties and global configuration that other scripts can read.

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Head Script   │───▶│  CSS Properties  │───▶│  Page Elements  │
│  (Lightweight)  │    │   Visibility     │    │   Immediate     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Global Config   │───▶│   Main Scripts   │───▶│   Animations    │
│  muminoConfig   │    │  Coordination    │    │     GSAP        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### File Structure

```
mumino/
├── components/
│   ├── preloader-head.js      # Lightweight coordination script
│   ├── preloader.js           # Main preloader animation
│   └── pageTransition.js      # Page transition animations
└── mumino.js                  # Main initialization
```

---

## Core Components

### 1. Head Script (`preloader-head.js`)

**Purpose**: Runs immediately in `<head>` to determine which animation should be active and set up the page accordingly.

**Key Responsibilities**:
- Check if preloader should show (daily reset logic)
- Set CSS custom properties for immediate element visibility
- Create global configuration object for other scripts

**Critical Design Decisions**:
- Uses `toDateString()` for true daily reset (not 24-hour timer)
- Stores `debugMode` as single source of truth
- Minimal code for performance (runs in `<head>`)

```javascript
// Core logic simplified:
const lastShownDate = localStorage.getItem("lastPreloaderDate");
const today = new Date().toDateString();
const showPreloader = debugMode || lastShownDate !== today;
```

**Storage Schema**:
```javascript
localStorage: {
  "lastPreloaderDate": "Wed Jan 01 2025",        // Date string for daily reset
  "lastPreloaderTime": "1704067140000",          // Timestamp (backward compatibility)
  "lastPreloaderTextIndex": "3"                  // Cycling through greeting texts
}
```

### 2. Preloader Animation (`preloader.js`)

**Purpose**: Manages the daily greeting animation with rotating text and date display.

**Animation Sequence**:
1. **Setup**: Disable scrolling, set content, add `.is-active` class
2. **Text Animation**: Fade in main greeting text with blur effect (1.25s)
3. **Date Animation**: Fade in date with lower opacity (1s, overlapping)
4. **Exit**: Fade out entire preloader (0.5s delay, then 0.5s duration)
5. **Cleanup**: Re-enable scrolling, remove `.is-active` class

**Text Rotation System**:
- Cycles through predefined greeting texts: `["AYYY", "YERRR", "WHATDAHELLY", "SALAAMS", "HELLO", "HALO", "IDREEZUS", "WELCOME"]`
- Uses `lastPreloaderTextIndex` to track position in array
- Resets to 0 when reaching end of array

**H1 Animation Delay**:
- Sets `data-ani-delay="2500"` on element with ID `has-preloader` when preloader shows
- Removes the attribute when preloader is skipped
- Ensures text animations don't conflict with preloader timing

**State Management**:
```javascript
// Coordination with head script
const shouldShow = window.muminoConfig?.showPreloader ?? false;

if (!shouldShow) {
  // Clean exit: hide element, remove H1 delay
  preloader.style.display = "none";
  if (animatedH1?.hasAttribute("data-ani-delay")) {
    animatedH1.removeAttribute("data-ani-delay");
  }
  return;
}
```

### 3. Page Transitions (`pageTransition.js`)

**Purpose**: Handles smooth transitions between pages using a global overlay element.

**Three Animation Sequences**:

#### Sequence 1: Initial Page Load
- Fades out the `.global-transition` overlay (starts visible from CSS)
- **Conditional behavior**: Only animates if preloader is NOT showing
- If preloader is active: immediately hides overlay without animation

#### Sequence 2: Link Click Transition
- Intercepts clicks on internal links
- Shows overlay with fade-in animation
- Navigates to destination once fade-in completes
- **Always active** regardless of preloader state (ensures future navigation works)

#### Sequence 3: New Page Load
- Fades out overlay on `pageshow` event
- Handles browser back/forward navigation
- **Always active** for consistent experience

**Link Detection Logic**:
```javascript
// Only intercept internal links
if (
  link.hostname === window.location.hostname &&  // Same domain
  !link.hash &&                                  // Not anchor link
  link.target !== "_blank"                       // Not opening new tab
) {
  // Handle transition
}
```

**Critical Fix for First-Visit Issue**:
- **Problem**: Originally, when preloader showed, page transitions were completely disabled
- **Solution**: Always set up click handlers, but conditionally handle initial page load animation
- **Result**: Page transitions work immediately after preloader, even on first visit

---

## CSS Integration

### Required Custom Code (in Webflow `<head>`):

```css
<style>
.preloader {
  display: var(--preloader-display, none);
}

.global-transition {
  display: var(--global-transition-display, flex);
}
</style>
```

### CSS Custom Properties Set by Head Script:

```css
:root {
  --preloader-display: flex | none;        /* Controls preloader visibility */
  --global-transition-display: flex | none; /* Controls transition visibility */
}
```

### Why This Approach:
- **Immediate visibility**: CSS custom properties take effect before JavaScript loads
- **No FOUC**: Elements are visible/hidden instantly, preventing flash of unstyled content
- **Webflow compatibility**: Allows setting `display: none` in Designer while maintaining functionality

---

## Global Configuration Object

The head script creates a global configuration object that other scripts can read:

```javascript
window.muminoConfig = {
  debugMode: boolean,           // Single source of truth for debug state
  showPreloader: boolean,       // Whether preloader should show this visit
  showGlobalTransition: boolean // Whether page transitions should show (inverse of showPreloader)
}
```

**Usage Pattern**:
```javascript
// Safe access with fallback
const shouldShow = window.muminoConfig?.showPreloader ?? false;
```

---

## State Transitions & Edge Cases

### Daily Reset Logic

```
Day 1, 11:59 PM: Preloader shows → stores "Mon Jan 01 2025"
Day 2, 12:00 AM: New date "Tue Jan 02 2025" ≠ stored → Preloader shows again ✓
Day 2, 3:00 PM:  Same date "Tue Jan 02 2025" = stored → No preloader ✓
```

### Debug Mode Behavior

```javascript
const debugMode = true; // In head script

// Results in:
// - Preloader shows on every page refresh
// - Page transitions are disabled on every page
// - Useful for testing preloader animation and timing
```

### First-Time Visitor Flow

```
1. No localStorage data exists
2. Head script: showPreloader = true
3. CSS: preloader visible, transition hidden
4. Preloader plays, stores date and text index
5. User clicks link → page transition works immediately
```

### Returning Visitor Flow

```
1. localStorage has today's date
2. Head script: showPreloader = false  
3. CSS: preloader hidden, transition visible
4. Page transition fades out on load
5. All subsequent navigation uses transitions
```

---

## Integration with GSAP

### Timeline Structure (Preloader):

```javascript
const tl = gsap.timeline({
  onComplete: () => preloader.classList.remove("is-active")
});

// Parallel animations with offset timing
tl.to(textElement, { /* main text animation */ })
  .to(dateElement, { /* date animation */ }, "-=0.75") // Start 0.75s before previous ends
  .to(preloader, { /* fade out */ }, delay: 1);       // 1s pause before fade
```

### Performance Optimizations:

- Uses `autoAlpha` instead of separate `opacity` and `visibility`
- Sets initial states with `gsap.set()` for immediate application
- Uses efficient easing functions (`power1.out`, `sine.out`)
- Minimal DOM queries (cache elements)

---

## Error Handling & Fallbacks

### Graceful Degradation:

```javascript
// Safe element selection
const preloader = document.querySelector(".preloader");
if (!preloader) {
  console.log("Preloader not found, skipping");
  return;
}

// Safe global config access
const shouldShow = window.muminoConfig?.showPreloader ?? false;

// Safe localStorage access (already handled by date string comparison)
```

### Scroll Management:

```javascript
// Always re-enable scrolling, even on errors
function enableScroll() {
  document.body.style.overflow = "";
  document.body.style.height = "";
}

// Error handling example
if (!textElement || !dateElement) {
  console.error("Required preloader elements not found");
  enableScroll(); // ← Critical: don't leave user unable to scroll
  return;
}
```

---

## Debugging & Testing

### Debug Mode Activation:

1. Open `preloader-head.js` in Webflow Custom Code
2. Change `const debugMode = false;` to `const debugMode = true;`
3. Save and publish
4. Preloader will now show on every page refresh

### Console Logging:

The system provides helpful console messages:

```
"Preloader not found on page, skipping initialization"
"Preloader skipped - not due to show"  
"Initializing preloader animation"
"Initializing page transitions"
"Global transitions disabled - preloader is active" (old version)
```

### Testing Scenarios:

1. **First visit**: Clear localStorage, refresh → should see preloader
2. **Same day return**: Refresh → should see page transitions only
3. **Next day**: Set `lastPreloaderDate` to yesterday → should see preloader
4. **Debug mode**: Enable → should see preloader every refresh
5. **Navigation**: Click internal links → should see smooth transitions

### localStorage Inspection:

```javascript
// In browser console:
localStorage.getItem("lastPreloaderDate");     // "Wed Jan 01 2025"
localStorage.getItem("lastPreloaderTextIndex"); // "3"
localStorage.getItem("lastPreloaderTime");     // "1704067140000"

// Clear for testing:
localStorage.removeItem("lastPreloaderDate");
localStorage.removeItem("lastPreloaderTextIndex");
localStorage.removeItem("lastPreloaderTime");
```

---

## Common Issues & Solutions

### Issue: Page transitions don't work after preloader

**Symptoms**: First click after preloader shows does nothing, subsequent clicks work
**Cause**: Click handlers weren't being set up when preloader was active
**Solution**: Always initialize click handlers, only conditionally handle initial page load

### Issue: Preloader shows multiple times per day

**Symptoms**: Preloader appears more than once on the same calendar day
**Cause**: Using 24-hour timer instead of daily reset
**Solution**: Use `toDateString()` comparison instead of timestamp arithmetic

### Issue: Elements visible during page load before animation

**Symptoms**: Flash of unstyled content, elements jump
**Cause**: CSS custom properties not set immediately
**Solution**: Head script sets properties synchronously before DOM rendering

### Issue: Debug mode not working

**Symptoms**: Preloader doesn't show even with debugMode = true
**Cause**: Multiple debugMode variables in different files
**Solution**: Single source of truth in head script, accessed via global config

---

## Future Enhancement Opportunities

### Additional Preloader Features:
- Time-based greetings ("Good morning", "Good evening")
- User location-based greetings
- Custom text based on referring source
- Progress indicator for slow connections

### Page Transition Enhancements:
- Different transition types per page
- Direction-aware transitions (left/right based on navigation)
- Skip transitions for specific link types
- Preload next page content during transition

### Performance Optimizations:
- Intersection Observer for scroll re-enabling
- Web Workers for date calculations
- Service Worker integration for offline handling
- CSS containment for animation performance

### Analytics Integration:
- Track preloader completion rates
- Monitor transition smoothness metrics
- A/B testing different greeting texts
- User engagement correlation with preloader showing

---

## Dependencies

### Required Libraries:
- **GSAP**: Core animation library (must be loaded before mumino.js)
- **No other external dependencies**

### Browser Support:
- **Modern browsers**: Full support (Chrome 60+, Firefox 55+, Safari 11+)
- **Legacy browsers**: Graceful degradation (animations may not work but won't break functionality)
- **Mobile**: Full support on iOS Safari and Chrome Mobile

### Webflow Requirements:
- Custom Code access (for head script and CSS)
- Elements with classes: `.preloader`, `.global-transition`
- Optional: Element with ID `has-preloader` for H1 animation delay

---

## Maintenance Notes

### Regular Maintenance:
- Monitor localStorage usage (minimal impact)
- Update greeting texts seasonally if desired
- Test after GSAP updates
- Verify functionality after Webflow updates

### Monitoring:
- Check console for error messages
- Verify localStorage values are being set correctly
- Test cross-browser functionality periodically
- Monitor Core Web Vitals impact (should be minimal)

### When to Update:
- Adding new greeting texts: Update `preloaderTexts` array
- Changing timing: Modify GSAP timeline durations
- New animation requirements: Extend existing functions rather than replacing
- Debug issues: Use console logging and localStorage inspection

This documentation serves as a complete reference for understanding, maintaining, and extending the Mumino preloader and page transition system.