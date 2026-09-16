/**
 * ForcaMaster - Audio Engine (Web Audio API)
 * Síntese procedural de efeitos sonoros sem dependência de arquivos externos (0kb overhead).
 * Suporta mute/unmute e persistência no LocalStorage com proteção SSR/Node.
 */

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.muted = typeof localStorage !== 'undefined' ? localStorage.getItem('forcamaster_muted') === 'true' : false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = typeof window !== 'undefined' ? (window.AudioContext || window.webkitAudioContext) : null;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('forcamaster_muted', String(this.muted));
    }
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }

  // Tique suave de tecla ao digitar
  playKeyTick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, this.ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }

  // Acerto de letra (som ascendente brilhante)
  playCorrect() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.06);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.06 + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + idx * 0.06);
      osc.stop(this.ctx.currentTime + idx * 0.06 + 0.12);
    });
  }

  // Erro de letra (buzzer descendente discreto)
  playWrong() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(90, this.ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  // Fanfarra de vitória triunfante
  playWin() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const chords = [
      { freq: 523.25, time: 0.0 }, // C5
      { freq: 659.25, time: 0.1 }, // E5
      { freq: 783.99, time: 0.2 }, // G5
      { freq: 1046.50, time: 0.35 } // C6
    ];

    chords.forEach(chord => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(chord.freq, this.ctx.currentTime + chord.time);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime + chord.time);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + chord.time + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + chord.time);
      osc.stop(this.ctx.currentTime + chord.time + 0.35);
    });
  }

  // Som de derrota dramático
  playLose() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [293.66, 277.18, 261.63, 246.94]; // D4, C#4, C4, B3
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.15);

      gain.gain.setValueAtTime(0.14, this.ctx.currentTime + idx * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.15 + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + idx * 0.15);
      osc.stop(this.ctx.currentTime + idx * 0.15 + 0.25);
    });
  }

  // Notificação suave de dica/modal
  playHint() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1320, this.ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }
}

export const sound = new AudioEngine();
