import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

import { CanvasStoryEngine } from "./src/canvas2d.js";
import { getCharacterSvgMarkup } from "./src/characterSvg.js";
import { SoundDesign } from "./src/audio.js";
import { POEM, ROMAN, capitalise } from "./src/poem.js";

gsap.registerPlugin(ScrollTrigger);

// Respect the user's motion preference: keep the story, drop the autonomous motion.
const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

// Application state (declared before the Lenis handler that writes to it)
const state = {
  scrollProgress: 0,
  scrollVelocity: 0,
  truthMode: 0, // 0 = Descent (Burnout), 1 = Ascent (Flight)
  isAscentMode: false,
  hasTriggeredBottomImpact: false,
};

// ==========================================
// LENIS SMOOTH SCROLL ENGINE INITIALIZATION
// ==========================================
const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;

const lenis = new Lenis({
  lerp: reduceMotion ? 1 : isTouchDevice ? 0.08 : 0.05, // Natural fluid momentum on touch & desktop
  wheelMultiplier: 0.65, // Calms wheel speed so user doesn't fly past chapters
  touchMultiplier: 1.6, // Tactile, responsive swipe momentum on mobile
  syncTouch: true, // Eliminates mobile touch lag and rubber-band stutter
  smoothWheel: !reduceMotion,
  infinite: false,
  respectReducedMotion: true,
});

// Synchronize Lenis with GSAP ScrollTrigger
lenis.on("scroll", (e) => {
  ScrollTrigger.update();
  state.scrollVelocity = e.velocity || 0;
  if (typeof startAudio === "function") startAudio();
});

// Drive Lenis smoothly via GSAP's central RAF ticker
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// ==========================================
// 1. PRELOADER & AUDIO ACTIVATION GATE
// ==========================================
const preloader = document.getElementById("preloader");
const loaderFill = document.getElementById("loader-fill");
const loaderTrack = document.getElementById("loader-track");
const loaderEnter = document.getElementById("loader-enter");
const loaderEnterBtn = document.getElementById("loader-enter-btn");

const LOADER_MIN_MS = 1000;
const loaderStart = performance.now();
let loaderTarget = 0;
let loaderShown = 0;
let isRevealed = false;

gsap.ticker.add(() => {
  loaderShown += (loaderTarget - loaderShown) * 0.18;
  if (loaderTarget >= 1 && loaderShown > 0.99) loaderShown = 1;
  loaderFill.style.width = `${(loaderShown * 100).toFixed(1)}%`;
});

async function enterExperience() {
  if (isRevealed) return;
  isRevealed = true;

  // Unlocks & plays audio directly inside this user activation gesture
  try {
    await sound.enable();
  } catch (_) {}

  loaderShown = 1;
  loaderTarget = 1;
  loaderFill.style.width = "100%";
  preloader.classList.add("loaded");
  ScrollTrigger.refresh();
  lenis.resize();
}

function readyToEnter() {
  loaderShown = 1;
  loaderTarget = 1;
  loaderFill.style.width = "100%";

  // If autoplay is already running with sound, reveal immediately
  if (sound.isRunning()) {
    enterExperience();
    return;
  }

  // Present the high-fashion editorial Enter gate
  if (loaderTrack) loaderTrack.style.opacity = "0";
  if (loaderEnter) loaderEnter.classList.add("ready");
}

if (preloader) {
  preloader.addEventListener("click", enterExperience);
}
window.addEventListener("keydown", () => {
  if (!isRevealed) enterExperience();
});

// ==========================================
// 2. KINETIC MAGNETIC CURSOR
// ==========================================
const cursorDot = document.getElementById("cursor-dot");
const cursorRing = document.getElementById("cursor-ring");

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let dotX = mouseX,
  dotY = mouseY;
let ringX = mouseX,
  ringY = mouseY;

function updatePointerPos(x, y) {
  mouseX = x;
  mouseY = y;
}

window.addEventListener(
  "mousemove",
  (e) => updatePointerPos(e.clientX, e.clientY),
  { passive: true },
);
window.addEventListener(
  "touchmove",
  (e) => {
    if (e.touches && e.touches.length > 0) {
      updatePointerPos(e.touches[0].clientX, e.touches[0].clientY);
    }
  },
  { passive: true },
);
window.addEventListener(
  "touchstart",
  (e) => {
    if (e.touches && e.touches.length > 0) {
      updatePointerPos(e.touches[0].clientX, e.touches[0].clientY);
    }
  },
  { passive: true },
);

if (reduceMotion) {
  // No trailing/eased cursor: track the pointer exactly, no per-frame motion.
  window.addEventListener("mousemove", () => {
    const t = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    cursorDot.style.transform = t;
    cursorRing.style.transform = t;
  });
} else {
  gsap.ticker.add(() => {
    dotX += (mouseX - dotX) * 0.35;
    dotY += (mouseY - dotY) * 0.35;
    ringX += (mouseX - ringX) * 0.16;
    ringY += (mouseY - ringY) * 0.16;

    cursorDot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
    cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
  });
}

function bindHoverables() {
  document.querySelectorAll(".interactive, button, a").forEach((el) => {
    el.addEventListener("mouseenter", () =>
      document.body.classList.add("hovering"),
    );
    el.addEventListener("mouseleave", () =>
      document.body.classList.remove("hovering"),
    );
  });
}
bindHoverables();

// ==========================================
// 3. SOUND DESIGN ENGINE
// ==========================================
const sound = new SoundDesign();
const audioBtn = document.getElementById("audio-toggle-btn");
const audioBtnLabel = document.getElementById("audio-btn-label");

// Sound is ON by default. Browsers block playback until the user interacts with
// the page, so the soundtrack is unlocked on the first scroll/click/key press —
// the HUD shows the intended state ("SOUND: ON") from the very first frame.
let audioDesired = true;
let audioStarted = false;

function setAudioUI(on) {
  audioBtn.classList.toggle("audio-active", on);
  audioBtnLabel.textContent = on ? "SOUND: ON" : "SOUND: OFF";
}
setAudioUI(true);

async function startAudio() {
  if (!audioDesired) return;
  sound.unlock();

  try {
    await sound.enable();
    if (!audioDesired) {
      await sound.disable();
      return;
    }
  } catch (err) {
    console.warn("[SoundDesign] Auto-audio attempt:", err);
  }

  setAudioUI(audioDesired);
}

// 1. Warm audio and attempt immediate playback on boot
sound.prefetch();
startAudio();

// 2. Also unlock on any subtle movement or presence (mouse move, scroll, touch) — no clicks required
const audioGestures = [
  "mousemove",
  "pointermove",
  "pointerdown",
  "mousedown",
  "wheel",
  "scroll",
  "touchstart",
  "touchmove",
  "keydown",
  "click",
];
function onFirstAudioGesture(e) {
  if (audioBtn && audioBtn.contains(e.target)) return;
  startAudio();
}
audioGestures.forEach((evt) =>
  window.addEventListener(evt, onFirstAudioGesture, { passive: true }),
);

audioBtn.addEventListener("click", async (e) => {
  e.stopPropagation();
  audioDesired = !audioDesired;
  setAudioUI(audioDesired);

  if (audioDesired) {
    await sound.enable();
  } else {
    await sound.disable();
  }
  setAudioUI(audioDesired);
});

// ==========================================
// 4. 2D CANVAS CINEMATIC STORY ENGINE & HERO CHARACTER
// ==========================================
const canvas = document.getElementById("story-canvas");
const storyEngine = new CanvasStoryEngine(canvas, { reduceMotion });

// Feed real texture download progress into the preloader, then reveal the site
const particleEngine = storyEngine.particleImageEngine;
particleEngine.onLoadProgress = (p) => {
  loaderTarget = p;
};
loaderTarget = particleEngine.loadProgress;

Promise.all([particleEngine.ready, document.fonts.ready]).then(() => {
  loaderTarget = 1;
  const remaining = Math.max(
    0,
    LOADER_MIN_MS - (performance.now() - loaderStart),
  );
  setTimeout(readyToEnter, remaining + 100);
});

// Sound effect callback when the boy collides with & shatters an environmental wall
storyEngine.onWallHit = () => {
  sound.playStoneCrack();
};

// Inject Hero Freefall Character Illustration
const charContainer = document.getElementById("character-container");
if (charContainer) {
  charContainer.innerHTML = getCharacterSvgMarkup();
}

// ==========================================
// 5. APPLICATION STATE & PALINDROME MODES
// ==========================================
// (`state` is declared near the top, before the Lenis scroll handler.)

// UI Elements
const hudBadge = document.getElementById("hud-mode-badge");
const hudGravity = document.getElementById("hud-gravity");
const hudVelocity = document.getElementById("hud-velocity");
const altThumb = document.getElementById("alt-thumb");
const hudAxisPill = document.getElementById("hud-axis-pill");
const invertLabel = document.getElementById("invert-label");
const ascentHintDock = document.getElementById("ascent-hint-dock");
const replayDock = document.getElementById("finale");
const introEl = document.getElementById("intro");
const transcriptEl = document.getElementById("transcript");
const transcriptList = document.getElementById("transcript-list");
const transcriptLabel = document.getElementById("transcript-label");
const srNarration = document.getElementById("sr-narration");
const inversionEl = document.getElementById("inversion");

// Build the transcript and the finale's two readings from the single poem source
const transcriptItems = POEM.map((entry, i) => {
  const li = document.createElement("li");
  li.innerHTML = `<span class="num">${ROMAN[i]}</span><span></span>`;
  li.lastChild.textContent = entry.line;
  transcriptList?.appendChild(li);
  return li;
});
const fallList = document.getElementById("finale-fall");
const flyList = document.getElementById("finale-fly");
POEM.forEach((entry) => {
  const li = document.createElement("li");
  li.textContent = entry.line;
  fallList?.appendChild(li);
});
[...POEM].reverse().forEach((entry, i) => {
  const li = document.createElement("li");
  li.textContent = i === 0 ? capitalise(entry.line) : entry.line;
  flyList?.appendChild(li);
});

let lastNarrated = -1;
function updateNarrative(p) {
  if (introEl) {
    const o = Math.max(0, 1 - p / 0.05);
    introEl.style.opacity = o.toFixed(3);
    introEl.style.visibility = o < 0.01 ? "hidden" : "visible";
  }
  transcriptEl?.classList.toggle("visible", p > 0.04);

  // Lines reach the boy at their progress mark; in ascent they are read bottom → top
  let current = -1;
  POEM.forEach((entry, i) => {
    const reached = state.isAscentMode
      ? p <= entry.progress + 0.02
      : p >= entry.progress - 0.02;
    if (reached) {
      if (state.isAscentMode ? current === -1 : true) current = i;
    }
  });
  transcriptItems.forEach((li, i) => {
    const read = state.isAscentMode
      ? i >= current && current !== -1
      : i <= current;
    li.classList.toggle("read", read);
    li.classList.toggle("current", i === current);
  });
  if (current !== lastNarrated && current !== -1 && srNarration) {
    srNarration.textContent = POEM[current].line;
  }
  lastNarrated = current;
}

function setFinaleVisible(on) {
  if (!replayDock || replayDock.classList.contains("visible") === on) return;
  replayDock.classList.toggle("visible", on);
  replayDock.setAttribute("aria-hidden", on ? "false" : "true");
  if (replayBtn) replayBtn.tabIndex = on ? 0 : -1;
  gsap.killTweensOf(replayDock);
  if (on) {
    gsap.set(replayDock, { visibility: "visible" });
    gsap.fromTo(
      replayDock,
      { opacity: 0 },
      { opacity: 1, duration: 1.2, ease: "power2.out" },
    );
    gsap.fromTo(
      replayDock.querySelectorAll("li"),
      { opacity: 0, y: 12 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        stagger: 0.06,
        ease: "power3.out",
      },
    );
  } else {
    gsap.to(replayDock, {
      opacity: 0,
      duration: 0.5,
      onComplete: () => gsap.set(replayDock, { visibility: "hidden" }),
    });
  }
}

function playInversion() {
  storyEngine.triggerInversion();
  if (!inversionEl) return;
  const bars = ["#letterbox-top", "#letterbox-bottom"];
  const tl = gsap.timeline();
  tl.to(bars, { scaleY: 1, duration: 0.7, ease: "power3.inOut" }, 0)
    .set(inversionEl, { visibility: "visible", opacity: 1 }, 0.2)
    .fromTo(
      inversionEl.querySelectorAll(".inv-kicker, .inv-a, .inv-sub"),
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.9, stagger: 0.15, ease: "power3.out" },
      0.3,
    )
    .fromTo(
      inversionEl.querySelector(".inv-flip"),
      { rotateX: reduceMotion ? 0 : 180, opacity: 0 },
      { rotateX: 0, opacity: 1, duration: 1.2, ease: "expo.out" },
      0.6,
    )
    .to(inversionEl, { opacity: 0, duration: 0.8, ease: "power2.in" }, 2.9)
    .set(inversionEl, { visibility: "hidden" })
    .to(bars, { scaleY: 0, duration: 0.8, ease: "power3.inOut" }, 3.0);
}
const replayBtn = document.getElementById("replay-btn");

function applyAscentModeUI(isAscent) {
  state.isAscentMode = isAscent;

  if (isAscent) {
    document.body.classList.add("ascent-mode");
    if (ascentHintDock) ascentHintDock.classList.remove("visible");
    if (hudBadge) hudBadge.textContent = "Ascent // Defiance & Wings Ignited";
    if (hudGravity)
      hudGravity.innerHTML =
        'GRAVITY: <strong style="color: #fbbf24;">-19.6 m/s² (ZERO-G THRUST)</strong>';
    if (invertLabel) invertLabel.textContent = "AXIS // INVERTED";
    if (transcriptLabel) transcriptLabel.textContent = "Reading flying";
  } else {
    document.body.classList.remove("ascent-mode");
    if (hudBadge) hudBadge.textContent = "Descent // Burnout & Collapse";
    if (hudGravity)
      hudGravity.innerHTML = "GRAVITY: <strong>+9.81 m/s² (PULL)</strong>";
    if (invertLabel) invertLabel.textContent = "AXIS // NORMAL";
    if (transcriptLabel) transcriptLabel.textContent = "Reading falling";
  }
}

// Invert Perspective & Truth Mode Transition Function
function setAscentMode(isAscent) {
  if (state.isAscentMode === isAscent) return;
  applyAscentModeUI(isAscent);

  gsap.to(state, {
    truthMode: isAscent ? 1.0 : 0.0,
    duration: 1.8,
    ease: "power3.inOut",
    onUpdate: () => {
      sound.updateTruth(state.truthMode);
    },
  });

  if (isAscent) {
    storyEngine.triggerImpact();
    playInversion();
    sound.playImpact();
    setTimeout(() => sound.playAscentChord(), 450);
  } else {
    sound.playChime(330, 0.1, 1.5);
  }
}

// Invert button is non-clickable status indicator as requested

// ==========================================
// 6. SCROLLTRIGGER & PARALLAX TRACKING
// ==========================================
ScrollTrigger.create({
  trigger: "#scroll-track",
  start: "top top",
  end: "bottom bottom",
  scrub: 0.5,
  onUpdate: (self) => {
    const p = self.progress;
    state.scrollProgress = p;

    // Telemetry HUD updates
    altThumb.style.top = `${p * 100}%`;
    const velocityMps = (Math.abs(self.getVelocity() || 0) * 0.05).toFixed(2);
    hudVelocity.textContent = `TERMINAL VELOCITY: ${velocityMps} M/S`;

    sound.updateScroll(p, self.getVelocity() * 0.001);

    // 1. Reaching Bedrock (Floor Impact):
    // Play obsidian mirror impact sound & shockwave
    if (p > 0.94 && !state.hasTriggeredBottomImpact) {
      state.hasTriggeredBottomImpact = true;
      storyEngine.triggerImpact();
      sound.playImpact();
    } else if (p < 0.88 && state.hasTriggeredBottomImpact) {
      state.hasTriggeredBottomImpact = false;
    }

    // 2. Hint Dock: When reaching bedrock in descent mode, hint user to scroll back up!
    if (ascentHintDock) {
      if (p >= 0.88 && !state.isAscentMode) {
        ascentHintDock.classList.add("visible");
      } else {
        ascentHintDock.classList.remove("visible");
      }
    }

    // 3. Dynamic Mode Transition:
    // When the user has reached the bottom (hasTriggeredBottomImpact) and starts scrolling back UP:
    // Immediately transform into Ascent Mode (wings ignite, kintsugi awakens, truthMode = 1)!
    if (
      state.hasTriggeredBottomImpact &&
      !state.isAscentMode &&
      (self.direction === -1 || (self.getVelocity() || 0) < -2)
    ) {
      setAscentMode(true);
    }

    // 4. "Experience Again" Replay Dock:
    // When user reaches back to the top (zenith) in Ascent Mode, reveal the Replay button!
    setFinaleVisible(state.isAscentMode && p <= 0.06);
    updateNarrative(p);
  },
});

// "Experience Again" Replay Button
if (replayBtn) {
  replayBtn.addEventListener("click", () => {
    setFinaleVisible(false);

    // Reset back to Descent Mode
    applyAscentModeUI(false);
    state.hasTriggeredBottomImpact = false;

    gsap.to(state, {
      truthMode: 0.0,
      duration: 1.2,
      ease: "power2.inOut",
      onUpdate: () => {
        sound.updateTruth(0.0);
      },
    });

    // Reset scroll smoothly to top
    lenis.scrollTo(0, {
      duration: 1.0,
      immediate: true,
    });
  });
}

// ==========================================
// 7. RENDER LOOP
// ==========================================
let startTime = performance.now();

function animate() {
  requestAnimationFrame(animate);

  const currentTime = (performance.now() - startTime) * 0.001;

  storyEngine.update(
    currentTime,
    state.scrollProgress,
    state.scrollVelocity * 0.015,
    state.truthMode,
  );

  storyEngine.render();

  // Smooth Hero Character Parallax & Weightless Drift
  if (charContainer) {
    const motion = reduceMotion ? 0 : 1;
    const normX = (mouseX / window.innerWidth) * 2 - 1;
    const breathY = Math.sin(currentTime * 1.5) * 8 * motion;
    const tilt = (normX * 4 - state.scrollVelocity * 0.12) * motion;
    const soarLift = state.truthMode * (reduceMotion ? -8 : -24);

    charContainer.style.transform = `translate(-50%, -50%) translate3d(${normX * 16 * motion}px, ${breathY + soarLift}px, 0) rotate(${tilt}deg)`;
  }
}

animate();

// Window Resize Handling
window.addEventListener("resize", () => {
  lenis.resize();
  ScrollTrigger.refresh();
});
