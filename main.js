import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

import { CanvasStoryEngine } from './src/canvas2d.js';
import { getCharacterSvgMarkup } from './src/characterSvg.js';
import { SoundDesign } from './src/audio.js';

gsap.registerPlugin(ScrollTrigger);

// Respect the user's motion preference: keep the story, drop the autonomous motion.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Application state (declared before the Lenis handler that writes to it)
const state = {
  scrollProgress: 0,
  scrollVelocity: 0,
  truthMode: 0, // 0 = Descent (Burnout), 1 = Ascent (Flight)
  isAscentMode: false,
  hasTriggeredBottomImpact: false
};

// ==========================================
// LENIS SMOOTH SCROLL ENGINE INITIALIZATION
// ==========================================
const lenis = new Lenis({
  lerp: reduceMotion ? 1 : 0.05, // Heavy, cinematic, weighted fluid momentum (much smoother & less twitchy)
  wheelMultiplier: 0.65, // Calms wheel speed so user doesn't fly past chapters
  touchMultiplier: 0.9,
  smoothWheel: !reduceMotion,
  infinite: false,
  respectReducedMotion: true,
});

// Synchronize Lenis with GSAP ScrollTrigger
lenis.on('scroll', (e) => {
  ScrollTrigger.update();
  state.scrollVelocity = e.velocity || 0;
});

// Drive Lenis smoothly via GSAP's central RAF ticker
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// ==========================================
// 1. PRELOADER (driven by real asset progress)
// ==========================================
const preloader = document.getElementById('preloader');
const loaderFill = document.getElementById('loader-fill');

const LOADER_MIN_MS = 1200;
const loaderStart = performance.now();
let loaderTarget = 0;
let loaderShown = 0;

gsap.ticker.add(() => {
  loaderShown += (loaderTarget - loaderShown) * 0.15;
  if (loaderTarget >= 1 && loaderShown > 0.995) loaderShown = 1;
  loaderFill.style.width = `${(loaderShown * 100).toFixed(1)}%`;
});

function revealSite() {
  loaderShown = 1;
  loaderTarget = 1;
  loaderFill.style.width = '100%';
  preloader.classList.add('loaded');
  ScrollTrigger.refresh();
  lenis.resize();
}

// ==========================================
// 2. KINETIC MAGNETIC CURSOR
// ==========================================
const cursorDot = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let dotX = mouseX, dotY = mouseY;
let ringX = mouseX, ringY = mouseY;

window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

if (reduceMotion) {
  // No trailing/eased cursor: track the pointer exactly, no per-frame motion.
  window.addEventListener('mousemove', () => {
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
  document.querySelectorAll('.interactive, button, a').forEach((el) => {
    el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
  });
}
bindHoverables();

// ==========================================
// 3. SOUND DESIGN ENGINE
// ==========================================
const sound = new SoundDesign();
const audioBtn = document.getElementById('audio-toggle-btn');
const audioBtnLabel = document.getElementById('audio-btn-label');

let audioBusy = false;
audioBtn.addEventListener('click', async () => {
  if (audioBusy) return;
  audioBusy = true;

  // The first click downloads and decodes the soundscape (~750 kB)
  if (!sound.isLoaded) audioBtnLabel.textContent = 'SOUND: LOADING…';

  try {
    const active = await sound.toggle();
    audioBtn.classList.toggle('audio-active', active);
    audioBtnLabel.textContent = active ? 'SOUND: ON' : 'SOUND: OFF';
  } catch (err) {
    console.warn('[SoundDesign] Toggle failed:', err);
    sound.isActive = false;
    audioBtn.classList.remove('audio-active');
    audioBtnLabel.textContent = 'SOUND: OFF';
  } finally {
    audioBusy = false;
  }
});

// ==========================================
// 4. 2D CANVAS CINEMATIC STORY ENGINE & HERO CHARACTER
// ==========================================
const canvas = document.getElementById('story-canvas');
const storyEngine = new CanvasStoryEngine(canvas, { reduceMotion });

// Feed real texture download progress into the preloader, then reveal the site
const particleEngine = storyEngine.particleImageEngine;
particleEngine.onLoadProgress = (p) => {
  loaderTarget = p;
};
loaderTarget = particleEngine.loadProgress;

Promise.all([particleEngine.ready, document.fonts.ready]).then(() => {
  loaderTarget = 1;
  const remaining = Math.max(0, LOADER_MIN_MS - (performance.now() - loaderStart));
  setTimeout(revealSite, remaining + 220);
});

// Sound effect callback when the boy collides with & shatters an environmental wall
storyEngine.onWallHit = () => {
  sound.playStoneCrack();
};

// Inject Hero Freefall Character Illustration
const charContainer = document.getElementById('character-container');
if (charContainer) {
  charContainer.innerHTML = getCharacterSvgMarkup();
}

// ==========================================
// 5. APPLICATION STATE & PALINDROME MODES
// ==========================================
// (`state` is declared near the top, before the Lenis scroll handler.)

// UI Elements
const hudBadge = document.getElementById('hud-mode-badge');
const hudGravity = document.getElementById('hud-gravity');
const hudVelocity = document.getElementById('hud-velocity');
const altThumb = document.getElementById('alt-thumb');
const hudAxisPill = document.getElementById('hud-axis-pill');
const invertLabel = document.getElementById('invert-label');
const ascentHintDock = document.getElementById('ascent-hint-dock');
const replayDock = document.getElementById('replay-dock');
const replayBtn = document.getElementById('replay-btn');

function applyAscentModeUI(isAscent) {
  state.isAscentMode = isAscent;

  if (isAscent) {
    document.body.classList.add('ascent-mode');
    if (ascentHintDock) ascentHintDock.classList.remove('visible');
    if (hudBadge) hudBadge.textContent = 'Ascent // Defiance & Wings Ignited';
    if (hudGravity) hudGravity.innerHTML = 'GRAVITY: <strong style="color: #fbbf24;">-19.6 m/s² (ZERO-G THRUST)</strong>';
    if (invertLabel) invertLabel.textContent = 'AXIS // INVERTED';
  } else {
    document.body.classList.remove('ascent-mode');
    if (hudBadge) hudBadge.textContent = 'Descent // Burnout & Collapse';
    if (hudGravity) hudGravity.innerHTML = 'GRAVITY: <strong>+9.81 m/s² (PULL)</strong>';
    if (invertLabel) invertLabel.textContent = 'AXIS // NORMAL';
  }
}

// Invert Perspective & Truth Mode Transition Function
function setAscentMode(isAscent) {
  if (state.isAscentMode === isAscent) return;
  applyAscentModeUI(isAscent);

  gsap.to(state, {
    truthMode: isAscent ? 1.0 : 0.0,
    duration: 1.8,
    ease: 'power3.inOut',
    onUpdate: () => {
      sound.updateTruth(state.truthMode);
    }
  });

  if (isAscent) {
    storyEngine.triggerImpact();
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
  trigger: '#scroll-track',
  start: 'top top',
  end: 'bottom bottom',
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
        ascentHintDock.classList.add('visible');
      } else {
        ascentHintDock.classList.remove('visible');
      }
    }

    // 3. Dynamic Mode Transition:
    // When the user has reached the bottom (hasTriggeredBottomImpact) and starts scrolling back UP:
    // Immediately transform into Ascent Mode (wings ignite, kintsugi awakens, truthMode = 1)!
    if (state.hasTriggeredBottomImpact && !state.isAscentMode && (self.direction === -1 || (self.getVelocity() || 0) < -2)) {
      setAscentMode(true);
    }

    // 4. "Experience Again" Replay Dock:
    // When user reaches back to the top (zenith) in Ascent Mode, reveal the Replay button!
    if (replayDock) {
      if (state.isAscentMode && p <= 0.06) {
        replayDock.classList.add('visible');
      } else {
        replayDock.classList.remove('visible');
      }
    }
  }
});

// "Experience Again" Replay Button
if (replayBtn) {
  replayBtn.addEventListener('click', () => {
    if (replayDock) replayDock.classList.remove('visible');
    
    // Reset back to Descent Mode
    applyAscentModeUI(false);
    state.hasTriggeredBottomImpact = false;

    gsap.to(state, {
      truthMode: 0.0,
      duration: 1.2,
      ease: 'power2.inOut',
      onUpdate: () => {
        sound.updateTruth(0.0);
      }
    });

    // Reset scroll smoothly to top
    lenis.scrollTo(0, {
      duration: 1.0,
      immediate: true
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
    state.truthMode
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
window.addEventListener('resize', () => {
  lenis.resize();
  ScrollTrigger.refresh();
});
