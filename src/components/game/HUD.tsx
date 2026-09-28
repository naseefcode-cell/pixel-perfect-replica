import { useEffect, useState } from "react";
import { cam, resetCam, useGame } from "@/game/store";
import { LEVELS } from "@/game/levels";

function fmt(t: number) {
  const s = Math.floor(t);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

function Confetti() {
  const bits = Array.from({ length: 60 }, (_, i) => i);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {bits.map((i) => (
        <span
          key={i}
          className="confetti-bit"
          style={{
            left: `${(i * 37) % 100}%`,
            background: ["#ff6b5a", "#ffd166", "#7ce0c8", "#9d4edd", "#5ec5ff"][i % 5],
            animationDelay: `${(i % 12) * 0.12}s`,
            animationDuration: `${2.2 + ((i * 7) % 15) / 10}s`,
          }}
        />
      ))}
    </div>
  );
}

export function HUD() {
  const { level, phase, runFalls, runTime, toasts, save, swapped } = useGame();
  const restart = useGame((s) => s.restart);
  const next = useGame((s) => s.next);
  const goSelect = useGame((s) => s.goSelect);
  const confetti = useGame((s) => s.confetti);
  const [hint, setHint] = useState(false);

  useEffect(() => setHint(false), [level.id]);

  const isFinal = level.id === LEVELS.length;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-3 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="pointer-events-auto rounded-2xl border-2 border-ink/15 bg-card/85 px-3 py-2 shadow-pop backdrop-blur">
          <div className="text-[10px] font-black tracking-[0.2em] text-muted-foreground">
            LEVEL {level.id} / {LEVELS.length}
          </div>
          <div className="text-lg leading-tight font-black">{level.title}</div>
          <div className="mt-1 flex gap-3 text-[11px] font-bold text-muted-foreground">
            <span>⏱ {fmt(runTime)}</span>
            <span>💀 {runFalls}</span>
            <span>🦆 {save.secrets.length}</span>
          </div>
        </div>

        <div className="pointer-events-auto flex gap-2">
          <button className="btn-chip" onClick={() => setHint((h) => !h)}>
            ?
          </button>
          <button
            className="btn-chip"
            onClick={() => {
              resetCam();
              restart();
            }}
          >
            ↺
          </button>
          <button className="btn-chip" onClick={goSelect}>
            ☰
          </button>
        </div>
      </div>

      {hint && (
        <div className="pointer-events-none absolute top-24 right-3 max-w-[240px] rounded-2xl border-2 border-ink/15 bg-accent px-3 py-2 text-xs font-bold text-accent-foreground shadow-pop sm:right-5">
          {level.hint}
        </div>
      )}

      <div className="pointer-events-none absolute bottom-24 left-1/2 flex w-full max-w-md -translate-x-1/2 flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="animate-fade-in rounded-full border-2 border-ink/20 bg-ink px-4 py-2 text-center text-xs font-black text-background shadow-pop"
          >
            {t.text}
          </div>
        ))}
      </div>

      <div className="flex items-end justify-between">
        <div className="rounded-2xl bg-card/70 px-3 py-2 text-[11px] font-bold text-muted-foreground backdrop-blur">
          Drag to rotate · scroll/pinch to zoom · R to restart
        </div>
        <button
          className="btn-chip pointer-events-auto sm:hidden"
          onClick={() => (cam.targetYaw += Math.PI / 6)}
        >
          ⟲
        </button>
      </div>

      {phase === "won" && (
        <div className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-ink/25 p-4">
          {confetti && <Confetti />}
          <div className="w-full max-w-sm rounded-3xl border-4 border-ink bg-card p-6 text-center shadow-pop">
            <div className="text-3xl font-black">
              {isFinal && swapped ? "MINDTILT COMPLETE" : "SOLVED!"}
            </div>
            <p className="mt-2 text-sm font-bold text-muted-foreground">{level.quip}</p>
            <div className="mt-3 text-xs font-bold text-muted-foreground">
              {fmt(runTime)} · {runFalls} falls
              {save.best[level.id] != null && ` · best ${fmt(save.best[level.id])}`}
            </div>
            <div className="mt-5 flex justify-center gap-2">
              <button
                className="btn-primary"
                onClick={() => {
                  resetCam();
                  next();
                }}
              >
                {isFinal ? "Level select" : "Next level"}
              </button>
              <button
                className="btn-ghost"
                onClick={() => {
                  resetCam();
                  restart();
                }}
              >
                Replay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
