import { LEVELS } from "@/game/levels";
import { resetCam, useGame } from "@/game/store";

export function TitleScreen() {
  const play = useGame((s) => s.play);
  const goSelect = useGame((s) => s.goSelect);
  const save = useGame((s) => s.save);
  const nextLevel = Math.min(save.completed.length, LEVELS.length - 1);

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6 bg-[radial-gradient(circle_at_50%_20%,var(--sky),var(--background))] p-6 text-center">
      <div>
        <h1 className="text-6xl font-black tracking-tighter sm:text-8xl">
          MIND<span className="text-primary">TILT</span>
        </h1>
        <p className="mt-2 max-w-sm text-sm font-bold text-muted-foreground">
          Rotate the world until impossible paths become real. The puzzle is fair. Everything else
          is not.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          className="btn-primary text-base"
          onClick={() => {
            resetCam();
            play(nextLevel);
          }}
        >
          {save.completed.length ? "Continue" : "Play"}
        </button>
        <button className="btn-ghost text-base" onClick={goSelect}>
          Levels
        </button>
      </div>
      <div className="text-xs font-bold text-muted-foreground">
        {save.completed.length}/{LEVELS.length} solved · {save.secrets.length} secrets · {save.falls}{" "}
        falls
      </div>
    </div>
  );
}

export function LevelSelect() {
  const play = useGame((s) => s.play);
  const goTitle = useGame((s) => s.goTitle);
  const save = useGame((s) => s.save);
  const unlockedTo = save.completed.length;

  return (
    <div className="absolute inset-0 z-20 overflow-auto bg-background p-5">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black">Levels</h2>
          <button className="btn-ghost" onClick={goTitle}>
            Back
          </button>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-5">
          {LEVELS.map((l, i) => {
            const done = save.completed.includes(l.id);
            const locked = i > unlockedTo;
            return (
              <button
                key={l.id}
                disabled={locked}
                onClick={() => {
                  resetCam();
                  play(i);
                }}
                className={`rounded-2xl border-2 p-3 text-left transition ${
                  locked
                    ? "border-ink/10 bg-muted text-muted-foreground opacity-60"
                    : done
                      ? "border-ink bg-accent text-accent-foreground shadow-pop hover:-translate-y-0.5"
                      : "border-ink bg-card shadow-pop hover:-translate-y-0.5"
                }`}
              >
                <div className="text-[10px] font-black tracking-widest opacity-60">
                  {String(l.id).padStart(2, "0")}
                </div>
                <div className="text-xs leading-tight font-black">{locked ? "???" : l.title}</div>
                {done && (
                  <div className="mt-1 text-[10px] font-bold">
                    {save.best[l.id] ? `${save.best[l.id].toFixed(1)}s` : "✓"}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
