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
    this.isActive = false;
    this.buffers = {};
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

  async init() {
    // Guard against concurrent first clicks starting two AudioContexts.
    if (this.ctx) return this.readyPromise;
    this.readyPromise = (async () => {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Create gain nodes for ambient loops
      this.gains.descent = this.ctx.createGain();
      this.gains.descent.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.gains.descent.connect(this.masterGain);

      this.gains.ascent = this.ctx.createGain();
      this.gains.ascent.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      this.gains.ascent.connect(this.masterGain);

      // SFX Bus
      this.gains.sfx = this.ctx.createGain();
      this.gains.sfx.gain.setValueAtTime(0.85, this.ctx.currentTime);
      this.gains.sfx.connect(this.masterGain);

      // Preload audio files
      await this.loadAllBuffers();
    })();
    return this.readyPromise;
  }

  async loadBuffer(url) {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      return await this.ctx.decodeAudioData(arrayBuffer);
    } catch (err) {
      console.warn(`[SoundDesign] Error loading audio from ${url}:`, err);
      return null;
    }
  }

  async loadAllBuffers() {
    const entries = Object.entries(this.audioPaths);
    await Promise.all(
      entries.map(async ([key, url]) => {
        const buffer = await this.loadBuffer(url);
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

  async toggle() {
    if (!this.ctx) {
      await this.init();
    }

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    this.isActive = !this.isActive;
    const now = this.ctx.currentTime;

    if (this.isActive) {
      if (this.isLoaded) {
        this.startAmbientLoops();
      }
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(0.75, now + 1.2);
    } else {
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.8);
    }

    return this.isActive;
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
