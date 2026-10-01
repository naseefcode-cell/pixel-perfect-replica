import { useEffect, useState } from "react";
import { getAudioSettings, setAudioSettings, sfx } from "@/game/audio";
import { cam, resetCam, useGame } from "@/game/store";

const TUT_KEY = "mindtilt-tutorial-done";

export function Tutorial() {
  const levelId = useGame((s) => s.level.id);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (levelId !== 1 || localStorage.getItem(TUT_KEY)) return;
    setShow(true);
    const start = cam.targetYaw;
    const id = window.setInterval(() => {
      if (Math.abs(cam.targetYaw - start) > 0.6) done();
    }, 200);
    function done() {
      localStorage.setItem(TUT_KEY, "1");
      setShow(false);
      window.clearInterval(id);
    }
    return () => window.clearInterval(id);
  }, [levelId]);

  if (!show) return null;
  const skip = () => {
    localStorage.setItem(TUT_KEY, "1");
    setShow(false);
  };
  return (
    <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 flex-col items-center gap-3">
      <div className="relative h-16 w-48">
        <div className="tut-hand absolute top-2 text-4xl">👆</div>
        <div className="absolute top-12 left-4 right-4 h-1 rounded-full bg-ink/20" />
      </div>
      <div className="flex items-center gap-1 text-xs font-black">
        <kbd className="kbd">←</kbd>
        <kbd className="kbd">→</kbd>
        <span className="mx-1 text-muted-foreground">or</span>
        <kbd className="kbd">A</kbd>
        <kbd className="kbd">D</kbd>
      </div>
      <div className="rounded-full bg-ink px-4 py-2 text-sm font-black text-background shadow-pop">
        Drag to rotate the world
      </div>
      <button className="btn-ghost pointer-events-auto text-xs" onClick={skip}>
        Skip
      </button>
    </div>
  );
}

export function PauseMenu() {
  const paused = useGame((s) => s.paused);
  const setPaused = useGame((s) => s.setPaused);
  const restart = useGame((s) => s.restart);
  const goSelect = useGame((s) => s.goSelect);
  const [a, setA] = useState(getAudioSettings());
  if (!paused) return null;
  const upd = (p: Partial<typeof a>) => {
    setAudioSettings(p);
    setA(getAudioSettings());
    sfx.click();
  };
  return (
    <div className="pointer-events-auto absolute inset-0 z-30 flex items-center justify-center bg-ink/30 p-4">
      <div className="w-full max-w-xs rounded-3xl border-4 border-ink bg-card p-6 shadow-pop">
        <div className="text-center text-3xl font-black">Paused</div>
        <div className="mt-4 space-y-3 text-sm font-bold">
          <label className="flex items-center justify-between">
            Sound effects
            <input type="checkbox" checked={a.sfx} onChange={(e) => upd({ sfx: e.target.checked })} />
          </label>
          <label className="flex items-center justify-between">
            Music
            <input type="checkbox" checked={a.music} onChange={(e) => upd({ music: e.target.checked })} />
          </label>
          <label className="block">
            Volume
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={a.volume}
              onChange={(e) => upd({ volume: Number(e.target.value) })}
              className="mt-1 w-full accent-[var(--primary)]"
            />
          </label>
        </div>
        <div className="mt-5 flex flex-col gap-2">
          <button className="btn-primary" onClick={() => setPaused(false)}>
            Resume
          </button>
          <button
            className="btn-ghost"
            onClick={() => {
              resetCam();
              restart();
            }}
          >
            Restart level
          </button>
          <button className="btn-ghost" onClick={goSelect}>
            Level select
          </button>
        </div>
      </div>
    </div>
  );
}
