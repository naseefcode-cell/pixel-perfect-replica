import { create } from "zustand";
import { LEVELS } from "./levels";
import type { Level, LevelData } from "./types";

const KEY = "mindtilt-save-v1";

export interface SaveData {
  completed: number[];
  best: Record<number, number>;
  falls: number;
  attempts: number;
  secrets: string[];
}

function load(): SaveData {
  if (typeof window === "undefined")
    return { completed: [], best: {}, falls: 0, attempts: 0, secrets: [] };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) throw new Error("empty");
    const p = JSON.parse(raw) as SaveData;
    return {
      completed: p.completed ?? [],
      best: p.best ?? {},
      falls: p.falls ?? 0,
      attempts: p.attempts ?? 0,
      secrets: p.secrets ?? [],
    };
  } catch {
    return { completed: [], best: {}, falls: 0, attempts: 0, secrets: [] };
  }
}

function persist(s: SaveData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(s));
}

export type Screen = "title" | "select" | "play";
export type Phase = "playing" | "won" | "outro";

export interface Toast {
  id: number;
  text: string;
}

interface GameState {
  hydrated: boolean;
  screen: Screen;
  index: number;
  level: Level;
  data: LevelData;
  swapped: boolean;
  phase: Phase;
  runFalls: number;
  runTime: number;
  rotations: number;
  confetti: boolean;
  toasts: Toast[];
  save: SaveData;

  hydrate: () => void;
  goTitle: () => void;
  goSelect: () => void;
  play: (index: number) => void;
  restart: () => void;
  next: () => void;
  say: (text: string) => void;
  fall: () => void;
  tick: (dt: number) => void;
  bumpRotation: () => void;
  trollSwap: () => void;
  win: () => void;
  findSecret: (key: string) => void;
}

let toastId = 0;

export const useGame = create<GameState>((set, get) => ({
  hydrated: false,
  screen: "title",
  index: 0,
  level: LEVELS[0],
  data: LEVELS[0],
  swapped: false,
  phase: "playing",
  runFalls: 0,
  runTime: 0,
  rotations: 0,
  confetti: false,
  toasts: [],
  save: { completed: [], best: {}, falls: 0, attempts: 0, secrets: [] },

  hydrate: () => set({ save: load(), hydrated: true }),
  goTitle: () => set({ screen: "title", confetti: false }),
  goSelect: () => set({ screen: "select", confetti: false }),

  play: (index) => {
    const level = LEVELS[index];
    const save = { ...get().save, attempts: get().save.attempts + 1 };
    persist(save);
    set({
      screen: "play",
      index,
      level,
      data: level,
      swapped: false,
      phase: "playing",
      runFalls: 0,
      runTime: 0,
      rotations: 0,
      confetti: false,
      toasts: [],
      save,
    });
  },

  restart: () => {
    const { index, play } = get();
    play(index);
  },

  next: () => {
    const i = get().index + 1;
    if (i >= LEVELS.length) {
      set({ screen: "select", confetti: false });
      return;
    }
    get().play(i);
  },

  say: (text) => {
    const id = ++toastId;
    set((s) => ({ toasts: [...s.toasts, { id, text }].slice(-3) }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3200);
  },

  fall: () => {
    const save = { ...get().save, falls: get().save.falls + 1 };
    persist(save);
    set((s) => ({ runFalls: s.runFalls + 1, save }));
  },

  tick: (dt) => {
    if (get().phase === "playing") set((s) => ({ runTime: s.runTime + dt }));
  },

  bumpRotation: () => set((s) => ({ rotations: s.rotations + 1 })),

  trollSwap: () => {
    const level = get().level;
    if (!level.swap) return;
    set({ data: level.swap, swapped: true, phase: "playing" });
  },

  win: () => {
    const { level, runTime, save } = get();
    const completed = save.completed.includes(level.id)
      ? save.completed
      : [...save.completed, level.id];
    const prev = save.best[level.id];
    const best = { ...save.best, [level.id]: prev ? Math.min(prev, runTime) : runTime };
    const next = { ...save, completed, best };
    persist(next);
    set({ phase: "won", confetti: true, save: next });
  },

  findSecret: (key) => {
    const save = get().save;
    if (save.secrets.includes(key)) return;
    const next = { ...save, secrets: [...save.secrets, key] };
    persist(next);
    set({ save: next });
    get().say("🦆 Secret found!");
  },
}));

/** camera state lives outside React so useFrame can mutate it freely */
export const cam = {
  yaw: Math.PI * 0.1,
  targetYaw: Math.PI * 0.1,
  zoom: 74,
  targetZoom: 74,
  dragging: false,
  shake: 0,
  punch: 0,
};

export function resetCam() {
  cam.yaw = Math.PI * 0.1;
  cam.targetYaw = Math.PI * 0.1;
  cam.zoom = 74;
  cam.targetZoom = 74;
  cam.dragging = false;
  cam.shake = 0;
  cam.punch = 0;
}
