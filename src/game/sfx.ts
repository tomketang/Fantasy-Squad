let ctx: AudioContext | null = null;
let enabled = true;

export function setSfxEnabled(value: boolean) {
  enabled = value;
}

export function unlockAudio() {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === "suspended") void ctx.resume();
}

function tone(freq: number, dur: number, type: OscillatorType, gain: number) {
  if (!enabled || !ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.value = gain;
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
  o.connect(g);
  g.connect(ctx.destination);
  o.start();
  o.stop(ctx.currentTime + dur);
}

export const sfx = {
  click: () => tone(720, 0.03, "sine", 0.03),
  hit: () => tone(480, 0.05, "square", 0.025),
  heal: () => tone(680, 0.09, "sine", 0.04),
  skill: () => {
    tone(420, 0.07, "triangle", 0.045);
    window.setTimeout(() => tone(640, 0.09, "triangle", 0.04), 60);
  },
  win: () => {
    tone(523, 0.1, "triangle", 0.05);
    window.setTimeout(() => tone(659, 0.1, "triangle", 0.05), 90);
    window.setTimeout(() => tone(784, 0.16, "triangle", 0.05), 180);
  },
  lose: () => tone(196, 0.22, "sawtooth", 0.03),
  level: () => tone(880, 0.12, "triangle", 0.05),
};
