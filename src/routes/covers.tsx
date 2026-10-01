import { createFileRoute, Link } from "@tanstack/react-router";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, OrthographicCamera } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

import { Scene } from "@/components/game/Scene";
import { LEVELS } from "@/game/levels";
import { PITCH } from "@/game/perspective";
import { useGame } from "@/game/store";

export const Route = createFileRoute("/covers")({
  ssr: false,
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "MindTilt Cover Studio — Export CrazyGames Covers" },
      {
        name: "description",
        content: "Preview MindTilt levels and export cover images in CrazyGames sizes.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "MindTilt Cover Studio" },
      { property: "og:description", content: "Export MindTilt cover art in CrazyGames sizes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CoverStudio,
});

const FORMATS = [
  { id: "landscape", label: "Landscape", w: 1920, h: 1080 },
  { id: "portrait", label: "Portrait", w: 800, h: 1200 },
  { id: "square", label: "Square", w: 800, h: 800 },
] as const;

function CoverCamera({ yaw, zoom }: { yaw: number; zoom: number }) {
  const ref = useRef<THREE.OrthographicCamera>(null);
  const { size } = useThree();
  useFrame(() => {
    const c = ref.current;
    if (!c) return;
    const d = 30;
    const cp = Math.cos(PITCH);
    c.position.set(Math.sin(yaw) * cp * d, Math.sin(PITCH) * d, Math.cos(yaw) * cp * d);
    c.lookAt(0, 0, 0);
    // zoom relative to the shorter side so every format frames the level similarly
    c.zoom = (Math.min(size.width, size.height) / 500) * zoom;
    c.updateProjectionMatrix();
  });
  return <OrthographicCamera ref={ref} makeDefault near={-100} far={200} />;
}

function CoverStudio() {
  const [fmtId, setFmtId] = useState<(typeof FORMATS)[number]["id"]>("landscape");
  const [levelIdx, setLevelIdx] = useState(4);
  const [yaw, setYaw] = useState(Math.PI * 0.1);
  const [zoom, setZoom] = useState(80);
  const [title, setTitle] = useState(true);
  const [busy, setBusy] = useState(false);
  const glRef = useRef<HTMLCanvasElement | null>(null);
  const fmt = FORMATS.find((f) => f.id === fmtId)!;

  // show the chosen level with the mascot celebrating on the goal
  useEffect(() => {
    const l = LEVELS[levelIdx];
    useGame.setState({ level: l, data: l, phase: "won", swapped: false, toasts: [] });
  }, [levelIdx]);

  const previewW = Math.min(720, fmt.w * (480 / fmt.h) * (fmt.id === "landscape" ? 1.5 : 1));
  const previewH = (previewW * fmt.h) / fmt.w;
  const dpr = fmt.w / previewW;

  const exportPng = async () => {
    const src = glRef.current;
    if (!src) return;
    setBusy(true);
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    const out = document.createElement("canvas");
    out.width = fmt.w;
    out.height = fmt.h;
    const g = out.getContext("2d")!;
    g.drawImage(src, 0, 0, fmt.w, fmt.h);
    if (title) {
      const css = getComputedStyle(document.documentElement);
      const font = css.getPropertyValue("--font-display").trim() || "system-ui";
      const ink = css.getPropertyValue("--ink").trim();
      const primary = css.getPropertyValue("--primary").trim();
      const size = Math.round(Math.min(fmt.w, fmt.h) * (fmt.id === "landscape" ? 0.16 : 0.17));
      g.font = `900 ${size}px ${font}`;
      g.textBaseline = "alphabetic";
      const a = "MIND";
      const b = "TILT";
      const tw = g.measureText(a + b).width;
      const x = (fmt.w - tw) / 2;
      const y = fmt.id === "portrait" ? fmt.h * 0.2 : fmt.h * 0.24;
      g.lineJoin = "round";
      g.lineWidth = size * 0.14;
      g.strokeStyle = "#ffffff";
      g.strokeText(a + b, x, y);
      g.fillStyle = ink;
      g.fillText(a, x, y);
      g.fillStyle = primary;
      g.fillText(b, x + g.measureText(a).width, y);
    }
    const link = document.createElement("a");
    link.download = `mindtilt-cover-${fmt.w}x${fmt.h}.png`;
    link.href = out.toDataURL("image/png");
    link.click();
    setBusy(false);
  };

  return (
    <main className="min-h-screen bg-background p-5 text-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row">
        <aside className="w-full space-y-5 lg:w-72">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black">Cover studio</h1>
            <Link to="/" className="btn-ghost text-xs">
              Back
            </Link>
          </div>
          <p className="text-xs font-bold text-muted-foreground">
            Pick a size, frame a level, then download. Sizes match CrazyGames cover requirements.
          </p>

          <div>
            <div className="mb-2 text-xs font-black tracking-widest text-muted-foreground">SIZE</div>
            <div className="grid grid-cols-3 gap-2">
              {FORMATS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFmtId(f.id)}
                  className={`rounded-xl border-2 border-ink p-2 text-xs font-black ${
                    f.id === fmtId ? "bg-primary text-primary-foreground" : "bg-card"
                  }`}
                >
                  {f.label}
                  <div className="text-[10px] font-bold opacity-70">
                    {f.w}×{f.h}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <label className="block text-xs font-black tracking-widest text-muted-foreground">
            LEVEL
            <select
              value={levelIdx}
              onChange={(e) => setLevelIdx(Number(e.target.value))}
              className="mt-2 w-full rounded-xl border-2 border-ink bg-card p-2 text-sm font-bold text-foreground"
            >
              {LEVELS.map((l, i) => (
                <option key={l.id} value={i}>
                  {l.id}. {l.title}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-xs font-black tracking-widest text-muted-foreground">
            ANGLE
            <input
              type="range"
              min={-Math.PI}
              max={Math.PI}
              step={0.01}
              value={yaw}
              onChange={(e) => setYaw(Number(e.target.value))}
              className="mt-2 w-full"
            />
          </label>

          <label className="block text-xs font-black tracking-widest text-muted-foreground">
            ZOOM
            <input
              type="range"
              min={30}
              max={160}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="mt-2 w-full"
            />
          </label>

          <label className="flex items-center justify-between text-sm font-bold">
            Show game title
            <input type="checkbox" checked={title} onChange={(e) => setTitle(e.target.checked)} />
          </label>

          <button className="btn-primary w-full" disabled={busy} onClick={exportPng}>
            {busy ? "Exporting…" : `Download ${fmt.w}×${fmt.h} PNG`}
          </button>
        </aside>

        <section className="flex flex-1 items-start justify-center">
          <div
            className="relative overflow-hidden rounded-2xl border-4 border-ink shadow-pop"
            style={{ width: previewW, height: previewH, maxWidth: "100%" }}
          >
            <Canvas
              key={fmt.id}
              shadows
              dpr={dpr}
              gl={{ antialias: true, preserveDrawingBuffer: true }}
              onCreated={({ gl }) => (glRef.current = gl.domElement)}
            >
              <color attach="background" args={["#efe6ff"]} />
              <CoverCamera yaw={yaw} zoom={zoom} />
              <hemisphereLight args={["#fff3e0", "#b9a7e0", 0.85]} />
              <directionalLight
                position={[8, 14, 6]}
                intensity={1.5}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-camera-left={-18}
                shadow-camera-right={18}
                shadow-camera-top={18}
                shadow-camera-bottom={-18}
              />
              <Environment>
                <Lightformer intensity={2} position={[0, 6, 0]} scale={[12, 12, 1]} color="#fff6ea" />
              </Environment>
              <Scene />
            </Canvas>
            {title && (
              <div
                className="pointer-events-none absolute inset-x-0 text-center font-black tracking-tighter"
                style={{
                  top: fmt.id === "portrait" ? "8%" : "9%",
                  fontSize: Math.min(previewW, previewH) * (fmt.id === "landscape" ? 0.16 : 0.17),
                  lineHeight: 1,
                  WebkitTextStroke: "0px",
                  textShadow: "0 0 6px #fff, 0 0 6px #fff",
                }}
              >
                MIND<span className="text-primary">TILT</span>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
