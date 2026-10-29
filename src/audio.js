/**
 * High-Quality Studio Audio Engine
 * Loads and plays stereo soundscapes (160 kbps MP3, ~10x smaller than the
 * original 16-bit WAV masters):
 * - ambient_descent.mp3: Deep binaural sub-drone & dark atmospheric descent pad
 * - ambient_ascent.mp3: Luminous golden harmonic pad & solfeggio ascension frequencies
 * - stone_shatter.mp3: Crisp stone crack, bass transient, and crumbling debris
 * - bedrock_impact.mp3: Cavernous obsidian impact with subterranean boom
 * - wings_ignite.mp3: Ethereal angelic arpeggio & solar ignition swell
 */

export class SoundDesign {
  constructor() {
    this.ctx = null;
    this.isActive = true;
    this.buffers = {};
    this.rawBuffers = {};
    this.prefetchPromise = null;
    this.readyPromise = null;
    this.sources = {};
    this.gains = {};
    this.masterGain = null;
    this.isLoaded = false;
    this.truth = 0;
    this.lastCrackTime = 0;

    this.audioPaths = {
      ambientDescent: '/audio/ambient_descent.mp3',
      ambientAscent: '/audio/ambient_ascent.mp3',
      stoneShatter: '/audio/stone_shatter.mp3',
      bedrockImpact: '/audio/bedrock_impact.mp3',
      wingsIgnite: '/audio/wings_ignite.mp3'
    };
  }

  /**
   * Synchronously create + resume the AudioContext and its gain graph.
   * MUST be called directly inside a user-gesture handler (no awaits before it),
   * otherwise Safari — and Chrome under some policies — keeps the context
   * suspended and the soundtrack stays silent.
   */
  unlock() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.buildGraph();
    }

    // 'interrupted' is iOS Safari's paused state
    if (this.ctx.state === 'suspended' || this.ctx.state === 'interrupted') {
      this.ctx.resume().catch(() => {});
    }

    if (this.isActive && this.isLoaded) {
      this.startAmbientLoops();
    }

    return this.ctx;
  }

  buildGraph() {
    const ctx = this.ctx;

    this.masterGain = ctx.createGain();
    const initialVol = this.isActive ? 0.75 : 0.0001;
    this.masterGain.gain.setValueAtTime(initialVol, ctx.currentTime);
    this.masterGain.connect(ctx.destination);

    // Create gain nodes for ambient loops
    this.gains.descent = ctx.createGain();
    this.gains.descent.gain.setValueAtTime(0.7, ctx.currentTime);
    this.gains.descent.connect(this.masterGain);

    this.gains.ascent = ctx.createGain();
    this.gains.ascent.gain.setValueAtTime(0.0001, ctx.currentTime);
    this.gains.ascent.connect(this.masterGain);

    // SFX Bus
    this.gains.sfx = ctx.createGain();
    this.gains.sfx.gain.setValueAtTime(0.85, ctx.currentTime);
    this.gains.sfx.connect(this.masterGain);
  }

  init() {
    // Guard against concurrent first clicks starting two AudioContexts.
    if (this.readyPromise) return this.readyPromise;

    this.readyPromise = (async () => {
      this.unlock();
      await this.loadAllBuffers();
    })();

    return this.readyPromise;
  }

  /**
   * Download the audio bytes ahead of any user gesture. Decoding needs an
   * AudioContext, but fetching does not — so the first interaction can start
   * the soundtrack with zero network delay.
   */
  prefetch() {
    if (this.prefetchPromise) return this.prefetchPromise;
    this.prefetchPromise = Promise.all(
      Object.entries(this.audioPaths).map(async ([key, url]) => {
        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
          this.rawBuffers[key] = await response.arrayBuffer();
        } catch (err) {
          console.warn(`[SoundDesign] Prefetch failed for ${url}:`, err);
        }
      })
    );
    return this.prefetchPromise;
  }

  async loadBuffer(key, url) {
    try {
      const raw = this.rawBuffers[key];
      const arrayBuffer = raw ? raw.slice(0) : await (await fetch(url)).arrayBuffer();
      return await this.ctx.decodeAudioData(arrayBuffer);
    } catch (err) {
      console.warn(`[SoundDesign] Error loading audio from ${url}:`, err);
      return null;
    }
  }

  async loadAllBuffers() {
    await this.prefetch();
    const entries = Object.entries(this.audioPaths);
    await Promise.all(
      entries.map(async ([key, url]) => {
        const buffer = await this.loadBuffer(key, url);
        if (buffer) {
          this.buffers[key] = buffer;
        }
      })
    );
    this.isLoaded = true;

    // Start ambient loops if active
    if (this.isActive) {
      this.startAmbientLoops();
    }
  }

  startAmbientLoops() {
    if (!this.ctx || !this.isLoaded) return;

    // Ambient Descent Loop
    if (this.buffers.ambientDescent && !this.sources.descent) {
      const srcDesc = this.ctx.createBufferSource();
      srcDesc.buffer = this.buffers.ambientDescent;
      srcDesc.loop = true;
      srcDesc.connect(this.gains.descent);
      srcDesc.start();
      this.sources.descent = srcDesc;
    }

    // Ambient Ascent Loop
    if (this.buffers.ambientAscent && !this.sources.ascent) {
      const srcAsc = this.ctx.createBufferSource();
      srcAsc.buffer = this.buffers.ambientAscent;
      srcAsc.loop = true;
      srcAsc.connect(this.gains.ascent);
      srcAsc.start();
      this.sources.ascent = srcAsc;
    }

    this.updateTruth(this.truth);

    if (this.isActive && this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(0.75, now + 0.3);
    }
  }

  stopAmbientLoops() {
    if (this.sources.descent) {
      try { this.sources.descent.stop(); } catch (_) {}
      this.sources.descent = null;
    }
    if (this.sources.ascent) {
      try { this.sources.ascent.stop(); } catch (_) {}
      this.sources.ascent = null;
    }
  }

  isRunning() {
    return !!this.ctx && this.ctx.state === 'running';
  }

  async enable() {
    this.isActive = true;

    // Create/resume the context synchronously, before any await, while the
    // user gesture is still active (required by Safari's autoplay policy).
    this.unlock();

    if (!this.isLoaded) await this.init();
    this.startAmbientLoops();

    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(0.75, now + 1.2);

    return this.isRunning();
  }

  async disable() {
    this.isActive = false;
    if (!this.ctx) return false;

    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.8);

    return false;
  }

  async toggle() {
    return this.isActive ? this.disable() : this.enable();
  }

  updateScroll(progress, velocity = 0) {
    if (!this.isActive || !this.ctx) return;
    // Subtly modulate volume based on freefall speed
    const speedBoost = Math.min(0.2, Math.abs(velocity) * 0.15);
    const now = this.ctx.currentTime;
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(0.70 + speedBoost, now, 0.1);
    }
  }

  updateTruth(truth) {
    this.truth = truth;
    if (!this.ctx || !this.gains.descent || !this.gains.ascent) return;

    const now = this.ctx.currentTime;
    // Crossfade between ambient descent and ambient ascent
    const descentVol = Math.max(0.0001, (1.0 - truth) * 0.75);
    const ascentVol = Math.max(0.0001, truth * 0.85);

    this.gains.descent.gain.cancelScheduledValues(now);
    this.gains.descent.gain.setValueAtTime(this.gains.descent.gain.value, now);
    this.gains.descent.gain.linearRampToValueAtTime(descentVol, now + 1.2);

    this.gains.ascent.gain.cancelScheduledValues(now);
    this.gains.ascent.gain.setValueAtTime(this.gains.ascent.gain.value, now);
    this.gains.ascent.gain.linearRampToValueAtTime(ascentVol, now + 1.2);
  }

  playOneShot(buffer, volume = 0.85) {
    if (!this.isActive || !this.ctx || !buffer) return;

    const source = this.ctx.createBufferSource();
    const gain = this.ctx.createGain();

    source.buffer = buffer;
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);

    source.connect(gain);
    gain.connect(this.gains.sfx || this.masterGain);

    source.start(0);
  }

  playStoneCrack() {
    if (!this.isActive || !this.ctx) return;
    const now = this.ctx.currentTime;
    if (now - this.lastCrackTime < 0.28) return;
    this.lastCrackTime = now;

    if (this.buffers.stoneShatter) {
      this.playOneShot(this.buffers.stoneShatter, 0.75);
    }
  }

  playImpact() {
    if (!this.isActive || !this.ctx) return;
    if (this.buffers.bedrockImpact) {
      this.playOneShot(this.buffers.bedrockImpact, 0.95);
    }
  }

  playAscentChord() {
    if (!this.isActive || !this.ctx) return;
    if (this.buffers.wingsIgnite) {
      this.playOneShot(this.buffers.wingsIgnite, 0.9);
    }
  }

  playChime(freq = 528, volume = 0.15, duration = 2.0) {
    // Elegant fallback / auxiliary chime
    if (!this.isActive || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + duration);
  }
}
