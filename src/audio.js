/**
 * Web Audio API Procedural Sound Design
 * Sub-bass drones, wind noise generator, stone shattering crunch, and crystalline ascension chimes.
 */
export class SoundDesign {
  constructor() {
    this.ctx = null;
    this.isActive = false;

    // Nodes
    this.droneOsc1 = null;
    this.droneOsc2 = null;
    this.droneGain = null;
    this.filter = null;

    this.windNode = null;
    this.windGain = null;
    this.windFilter = null;

    this.lastCrackTime = 0;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();

    // 1. Binaural Sub Drone (43.65Hz / F1 and 44.4Hz)
    this.droneOsc1 = this.ctx.createOscillator();
    this.droneOsc2 = this.ctx.createOscillator();
    this.droneGain = this.ctx.createGain();
    this.filter = this.ctx.createBiquadFilter();

    this.droneOsc1.type = 'sawtooth';
    this.droneOsc1.frequency.setValueAtTime(43.65, this.ctx.currentTime);

    this.droneOsc2.type = 'sine';
    this.droneOsc2.frequency.setValueAtTime(44.25, this.ctx.currentTime);

    this.filter.type = 'lowpass';
    this.filter.frequency.setValueAtTime(120, this.ctx.currentTime);
    this.filter.Q.setValueAtTime(3.5, this.ctx.currentTime);

    this.droneGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);

    this.droneOsc1.connect(this.filter);
    this.droneOsc2.connect(this.filter);
    this.filter.connect(this.droneGain);
    this.droneGain.connect(this.ctx.destination);

    this.droneOsc1.start();
    this.droneOsc2.start();

    // 2. Filtered Wind Noise
    this.initWindNoise();
  }

  initWindNoise() {
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    this.windFilter = this.ctx.createBiquadFilter();
    this.windFilter.type = 'bandpass';
    this.windFilter.frequency.setValueAtTime(380, this.ctx.currentTime);
    this.windFilter.Q.setValueAtTime(1.8, this.ctx.currentTime);

    this.windGain = this.ctx.createGain();
    this.windGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);

    whiteNoise.connect(this.windFilter);
    this.windFilter.connect(this.windGain);
    this.windGain.connect(this.ctx.destination);
    whiteNoise.start();
  }

  toggle() {
    if (!this.ctx) this.init();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isActive = !this.isActive;
    const now = this.ctx.currentTime;

    if (this.isActive) {
      this.droneGain.gain.cancelScheduledValues(now);
      this.droneGain.gain.linearRampToValueAtTime(0.22, now + 1.2);
      this.windGain.gain.cancelScheduledValues(now);
      this.windGain.gain.linearRampToValueAtTime(0.06, now + 1.5);
    } else {
      this.droneGain.gain.cancelScheduledValues(now);
      this.droneGain.gain.linearRampToValueAtTime(0.0001, now + 0.8);
      this.windGain.gain.cancelScheduledValues(now);
      this.windGain.gain.linearRampToValueAtTime(0.0001, now + 0.8);
    }

    return this.isActive;
  }

  updateScroll(progress, velocity = 0) {
    if (!this.isActive || !this.ctx) return;
    const now = this.ctx.currentTime;

    const targetFreq = 100 + Math.pow(progress, 1.8) * 850 + Math.abs(velocity) * 350;
    this.filter.frequency.setTargetAtTime(targetFreq, now, 0.1);

    const targetWindGain = Math.min(0.16, 0.04 + Math.abs(velocity) * 0.1);
    this.windGain.gain.setTargetAtTime(targetWindGain, now, 0.1);
  }

  playStoneCrack() {
    if (!this.isActive || !this.ctx) return;
    const now = this.ctx.currentTime;
    if (now - this.lastCrackTime < 0.4) return;
    this.lastCrackTime = now;

    // Concrete snap & crunch (lowpass noise burst)
    const bufferSize = this.ctx.sampleRate * 0.35;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(260, now);
    filter.frequency.exponentialRampToValueAtTime(60, now + 0.35);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);

    // Deep sub thump
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(95, now);
    subOsc.frequency.exponentialRampToValueAtTime(32, now + 0.28);
    subGain.gain.setValueAtTime(0.35, now);
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 0.3);
  }

  playImpact() {
    if (!this.isActive || !this.ctx) return;
    const now = this.ctx.currentTime;

    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(140, now);
    subOsc.frequency.exponentialRampToValueAtTime(28, now + 1.2);

    subGain.gain.setValueAtTime(0.45, now);
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 1.4);

    this.playChime(1174.66, 0.15, 1.8);
  }

  playChime(freq = 528, volume = 0.15, duration = 2.5) {
    if (!this.isActive || !this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  }

  playAscentChord() {
    if (!this.isActive || !this.ctx) return;
    const chord = [369.99, 466.16, 554.37, 698.46, 830.61];
    chord.forEach((freq, idx) => {
      setTimeout(() => {
        this.playChime(freq, 0.12, 3.0);
      }, idx * 160);
    });
  }
}
