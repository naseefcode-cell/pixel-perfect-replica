// Tiny Web Audio sound engine: all sounds are synthesized, no files.
const KEY = "mindtilt-audio-v1";

export interface AudioSettings {
  sfx: boolean;
  music: boolean;
  volume: number; // 0..1
}

let settings: AudioSettings = { sfx: true, music: true, volume: 0.7 };
if (typeof window !== "undefined") {
  try {
    settings = { ...settings, ...JSON.parse(localStorage.getItem(KEY) ?? "{}") };
  } catch {
    /* ignore */
  }
}

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let musicGain: GainNode | null = null;
let musicTimer: number | null = null;
let adMuted = false;

function ensure() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.connect(ctx.destination);
    musicGain = ctx.createGain();
    musicGain.connect(master);
    apply();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function apply() {
  if (!master || !musicGain || !ctx) return;
  master.gain.setTargetAtTime(adMuted ? 0 : settings.volume, ctx.currentTime, 0.05);
  musicGain.gain.setTargetAtTime(settings.music ? 0.18 : 0, ctx.currentTime, 0.2);
}

export function getAudioSettings() {
  return settings;
}

export function setAudioSettings(p: Partial<AudioSettings>) {
  settings = { ...settings, ...p };
  localStorage.setItem(KEY, JSON.stringify(settings));
  apply();
}

export function setAdMute(m: boolean) {
  adMuted = m;
  apply();
}

function tone(freq: number, dur: number, type: OscillatorType = "sine", vol = 0.25, delay = 0, slide = 0) {
  const c = ensure();
  if (!c || !master || !settings.sfx) return;
  const t = c.currentTime + delay;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + dur + 0.05);
}

export const sfx = {
  step: () => tone(520 + Math.random() * 80, 0.06, "triangle", 0.08),
  align: () => {
    tone(880, 0.08, "sine", 0.15);
    tone(1320, 0.12, "sine", 0.12, 0.06);
  },
  fall: () => tone(600, 0.7, "sawtooth", 0.12, 0, -540),
  win: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.25, "triangle", 0.18, i * 0.11)),
  troll: () => {
    tone(300, 0.25, "square", 0.1);
    tone(220, 0.45, "square", 0.1, 0.25);
  },
  secret: () => [988, 1319, 1568].forEach((f, i) => tone(f, 0.15, "sine", 0.14, i * 0.07)),
  click: () => tone(700, 0.04, "triangle", 0.1),
};

const CHORDS = [
  [262, 330, 392],
  [220, 262, 330],
  [175, 220, 262],
  [196, 247, 294],
];

export function startMusic() {
  const c = ensure();
  if (!c || musicTimer != null) return;
  let i = 0;
  const playChord = () => {
    if (!ctx || !musicGain) return;
    const t = ctx.currentTime;
    CHORDS[i++ % CHORDS.length].forEach((f) => {
      const o = ctx!.createOscillator();
      const g = ctx!.createGain();
      o.type = "sine";
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.3, t + 1.2);
      g.gain.linearRampToValueAtTime(0.0001, t + 4);
      o.connect(g).connect(musicGain!);
      o.start(t);
      o.stop(t + 4.1);
    });
  };
  playChord();
  musicTimer = window.setInterval(playChord, 3600);
}
