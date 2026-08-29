/**
 * Procedural sound design — zero asset weight.
 *
 * Every cue is synthesised with the Web Audio API on demand: a filtered-noise
 * "whoosh" for emergence / return and a short body-thump for the peak.
 * Muted by default; the host must call `unlock()` from a user gesture before
 * anything plays (mobile autoplay policy).
 */

type Cue = "emerge" | "peak" | "return";

class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  enabled = false;
  unlocked = false;

  private ensure() {
    if (this.ctx) return;
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return;
    this.ctx = new Ctor();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.9;
    this.master.connect(this.ctx.destination);

    const len = Math.floor(this.ctx.sampleRate * 1.2);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    this.noiseBuffer = buf;
  }

  /** call from a click/touch handler */
  unlock() {
    this.ensure();
    if (!this.ctx) return;
    if (this.ctx.state === "suspended") void this.ctx.resume();
    this.unlocked = true;
  }

  setEnabled(v: boolean) {
    this.enabled = v;
    if (v) this.unlock();
  }

  private whoosh(direction: 1 | -1, when: number, dur: number) {
    if (!this.ctx || !this.master || !this.noiseBuffer) return;
    const t0 = this.ctx.currentTime + when;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.loop = true;

    const bp = this.ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = 0.9;
    const fStart = direction > 0 ? 320 : 1600;
    const fEnd = direction > 0 ? 1700 : 260;
    bp.frequency.setValueAtTime(fStart, t0);
    bp.frequency.exponentialRampToValueAtTime(fEnd, t0 + dur);

    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.5, t0 + dur * 0.35);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

    src.connect(bp).connect(g).connect(this.master);
    src.start(t0);
    src.stop(t0 + dur + 0.05);
  }

  private thump(when: number) {
    if (!this.ctx || !this.master) return;
    const t0 = this.ctx.currentTime + when;
    const osc = this.ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(180, t0);
    osc.frequency.exponentialRampToValueAtTime(46, t0 + 0.28);

    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.7, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.4);

    osc.connect(g).connect(this.master);
    osc.start(t0);
    osc.stop(t0 + 0.45);
  }

  play(cue: Cue, delay = 0) {
    if (!this.enabled || !this.unlocked) return;
    this.ensure();
    if (!this.ctx) return;
    if (this.ctx.state === "suspended") void this.ctx.resume();
    if (cue === "emerge") this.whoosh(1, delay, 0.6);
    else if (cue === "return") this.whoosh(-1, delay, 0.55);
    else this.thump(delay);
  }
}

export const sound =
  typeof window !== "undefined" ? new SoundEngine() : (null as never);
