import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

import { CanvasStoryEngine } from './src/canvas2d.js';
import { getCharacterSvgMarkup } from './src/characterSvg.js';
import { SoundDesign } from './src/audio.js';

gsap.registerPlugin(ScrollTrigger);

// ==========================================
// LENIS SMOOTH SCROLL ENGINE INITIALIZATION
// ==========================================
const lenis = new Lenis({
  lerp: 0.08, // Silky luxury inertia (authentic Awwwards physics)
  wheelMultiplier: 1.0,
  touchMultiplier: 1.5,
  smoothWheel: true,
  infinite: false,
});

// Synchronize Lenis with GSAP ScrollTrigger
lenis.on('scroll', (e) => {
  ScrollTrigger.update();
  state.scrollVelocity = e.velocity || 0;
});

// Drive Lenis via GSAP's central RAF ticker
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// ==========================================
// 1. PRELOADER & INITIALIZATION
// ==========================================
const preloader = document.getElementById('preloader');
const loaderFill = document.getElementById('loader-fill');
let loadProgress = 0;

const loadInterval = setInterval(() => {
  loadProgress += Math.floor(Math.random() * 25) + 15;
  if (loadProgress >= 100) {
    loadProgress = 100;
    clearInterval(loadInterval);
    setTimeout(() => {
      preloader.classList.add('loaded');
      ScrollTrigger.refresh();
      lenis.resize();
    }, 250);
  }
  loaderFill.style.width = `${loadProgress}%`;
}, 40);

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

gsap.ticker.add(() => {
  dotX += (mouseX - dotX) * 0.35;
  dotY += (mouseY - dotY) * 0.35;
  ringX += (mouseX - ringX) * 0.16;
  ringY += (mouseY - ringY) * 0.16;

  cursorDot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
  cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
});

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

audioBtn.addEventListener('click', () => {
  const active = sound.toggle();
  if (active) {
    audioBtn.classList.add('audio-active');
    audioBtnLabel.textContent = 'SOUND: ON';
  } else {
    audioBtn.classList.remove('audio-active');
    audioBtnLabel.textContent = 'SOUND: OFF';
  }
});

// ==========================================
// 4. 2D CANVAS CINEMATIC STORY ENGINE & HERO CHARACTER
// ==========================================
const canvas = document.getElementById('story-canvas');
const storyEngine = new CanvasStoryEngine(canvas);

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
const state = {
  scrollProgress: 0,
  scrollVelocity: 0,
  truthMode: 0, // 0 = Descent (Burnout), 1 = Ascent (Flight)
  isAscentMode: false,
  hasTriggeredBottomImpact: false
};

// UI Elements
const hudBadge = document.getElementById('hud-mode-badge');
const hudGravity = document.getElementById('hud-gravity');
const hudVelocity = document.getElementById('hud-velocity');
const altThumb = document.getElementById('alt-thumb');
const invertBtn = document.getElementById('invert-view-btn');
const invertLabel = document.getElementById('invert-label');
const launchBtn = document.getElementById('launch-climax-btn');
const climaxBox = document.getElementById('climax-action-box');

function applyAscentModeUI(isAscent) {
  state.isAscentMode = isAscent;

  if (isAscent) {
    document.body.classList.add('ascent-mode');
    if (climaxBox) climaxBox.classList.remove('visible');
    invertBtn.classList.add('ascent-highlight');
    hudBadge.textContent = 'Ascent // Defiance & Wings Ignited';
    hudGravity.innerHTML = 'GRAVITY: <strong style="color: #fbbf24;">-19.6 m/s² (ZERO-G THRUST)</strong>';
    invertLabel.textContent = 'RESTORE DESCENT';
  } else {
    document.body.classList.remove('ascent-mode');
    invertBtn.classList.remove('ascent-highlight');
    hudBadge.textContent = 'Descent // Burnout & Collapse';
    hudGravity.innerHTML = 'GRAVITY: <strong>+9.81 m/s² (PULL)</strong>';
    invertLabel.textContent = 'INVERT AXIS';
    if (climaxBox && state.scrollProgress >= 0.86) {
      climaxBox.classList.add('visible');
    }
  }
}

// Invert Perspective & Truth Mode Transition Function
function toggleInversion(triggerAutoAscentScroll = false) {
  const targetMode = !state.isAscentMode;
  applyAscentModeUI(targetMode);

  gsap.to(state, {
    truthMode: targetMode ? 1.0 : 0.0,
    duration: 2.0,
    ease: 'power3.inOut'
  });

  if (targetMode) {
    storyEngine.triggerImpact();
    sound.playImpact();
    setTimeout(() => sound.playAscentChord(), 600);

    if (triggerAutoAscentScroll) {
      // Auto-propel upward to experience the ascension
      lenis.scrollTo(0, {
        duration: 8.5,
        easing: (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
      });
    }
  } else {
    sound.playChime(330, 0.1, 1.5);
  }
}

invertBtn.addEventListener('click', () => toggleInversion(false));
launchBtn.addEventListener('click', () => toggleInversion(true));

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

    // Trigger water ripple when reaching bottom (without auto-changing mode)
    if (p > 0.94 && !state.hasTriggeredBottomImpact) {
      state.hasTriggeredBottomImpact = true;
      storyEngine.triggerImpact();
      sound.playImpact();
    } else if (p < 0.88 && state.hasTriggeredBottomImpact) {
      state.hasTriggeredBottomImpact = false;
    }

    // Show Launch Button docked cleanly at the bottom when approaching obsidian mirror floor
    if (climaxBox) {
      if (p >= 0.86 && !state.isAscentMode) {
        climaxBox.classList.add('visible');
      } else {
        climaxBox.classList.remove('visible');
      }
    }
  }
});

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
    const normX = (mouseX / window.innerWidth) * 2 - 1;
    const breathY = Math.sin(currentTime * 1.5) * 8;
    const tilt = normX * 4 - state.scrollVelocity * 0.12;
    const soarLift = state.truthMode * -24;

    charContainer.style.transform = `translate(-50%, -50%) translate3d(${normX * 16}px, ${breathY + soarLift}px, 0) rotate(${tilt}deg)`;
  }
}

animate();

// Window Resize Handling
window.addEventListener('resize', () => {
  lenis.resize();
  ScrollTrigger.refresh();
});
