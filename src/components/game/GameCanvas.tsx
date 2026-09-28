import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, OrthographicCamera } from "@react-three/drei";
import { useEffect, useRef } from "react";
import * as THREE from "three";

import { cam, useGame } from "@/game/store";
import { PITCH } from "@/game/perspective";
import { Scene } from "./Scene";

function CameraRig() {
  const ref = useRef<THREE.OrthographicCamera>(null);
  const { size } = useThree();

  useFrame((_, dRaw) => {
    const c = ref.current;
    if (!c) return;
    const dt = Math.min(dRaw, 0.05);
    const k = 1 - Math.exp(-9 * dt);
    cam.yaw += (cam.targetYaw - cam.yaw) * k;
    cam.zoom += (cam.targetZoom - cam.zoom) * k;
    cam.shake = Math.max(0, cam.shake - dt * 1.2);
    cam.punch = Math.max(0, cam.punch - dt * 1.4);

    const dist = 30;
    const cp = Math.cos(PITCH);
    const shake = cam.shake * 0.25;
    c.position.set(
      Math.sin(cam.yaw) * cp * dist + (Math.random() - 0.5) * shake,
      Math.sin(PITCH) * dist + (Math.random() - 0.5) * shake,
      Math.cos(cam.yaw) * cp * dist,
    );
    c.up.set(0, 1, 0);
    c.lookAt(0, 0, 0);
    const base = cam.zoom * Math.min(1, size.width / 900 + 0.35);
    c.zoom = base * (1 + cam.punch * 0.08);
    c.updateProjectionMatrix();
  });

  return <OrthographicCamera ref={ref} makeDefault near={-100} far={200} />;
}

function useControls(el: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const node = el.current;
    if (!node) return;
    let last: { x: number; y: number } | null = null;
    let pinch: number | null = null;

    const down = (e: PointerEvent) => {
      last = { x: e.clientX, y: e.clientY };
      cam.dragging = true;
    };
    const move = (e: PointerEvent) => {
      if (!last) return;
      const dx = e.clientX - last.x;
      last = { x: e.clientX, y: e.clientY };
      cam.targetYaw -= dx * 0.008;
    };
    const up = () => {
      last = null;
      cam.dragging = false;
    };
    const wheel = (e: WheelEvent) => {
      cam.targetZoom = THREE.MathUtils.clamp(cam.targetZoom - e.deltaY * 0.05, 32, 150);
    };
    const touchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const d = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY,
        );
        if (pinch != null) {
          cam.targetZoom = THREE.MathUtils.clamp(cam.targetZoom + (d - pinch) * 0.25, 32, 150);
        }
        pinch = d;
        cam.dragging = true;
      }
    };
    const touchEnd = () => {
      pinch = null;
    };

    node.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    node.addEventListener("wheel", wheel, { passive: true });
    node.addEventListener("touchmove", touchMove, { passive: true });
    node.addEventListener("touchend", touchEnd);

    const key = (e: KeyboardEvent) => {
      const s = useGame.getState();
      if (e.key === "r" || e.key === "R") s.restart();
      if (e.key === "Escape") s.goSelect();
      if (e.key === "ArrowLeft" || e.key === "a") cam.targetYaw += 0.12;
      if (e.key === "ArrowRight" || e.key === "d") cam.targetYaw -= 0.12;
      if (e.key === "ArrowUp" || e.key === "w")
        cam.targetZoom = THREE.MathUtils.clamp(cam.targetZoom + 4, 32, 150);
      if (e.key === "ArrowDown" || e.key === "s")
        cam.targetZoom = THREE.MathUtils.clamp(cam.targetZoom - 4, 32, 150);
      if (["ArrowLeft", "ArrowRight", "a", "d"].includes(e.key)) {
        cam.dragging = true;
        window.setTimeout(() => (cam.dragging = false), 180);
      }
    };
    window.addEventListener("keydown", key);

    return () => {
      node.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      node.removeEventListener("wheel", wheel);
      node.removeEventListener("touchmove", touchMove);
      node.removeEventListener("touchend", touchEnd);
      window.removeEventListener("keydown", key);
    };
  }, [el]);
}

export function GameCanvas() {
  const el = useRef<HTMLDivElement>(null);
  useControls(el);

  return (
    <div ref={el} className="absolute inset-0 touch-none select-none">
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }}>
        <color attach="background" args={["#efe6ff"]} />
        <fog attach="fog" args={["#efe6ff", 42, 78]} />
        <CameraRig />
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
          <Lightformer
            intensity={1.1}
            color="#9fd8ff"
            position={[-6, 2, -2]}
            rotation-y={Math.PI / 2}
            scale={[18, 3, 1]}
          />
        </Environment>
        <Scene />
      </Canvas>
    </div>
  );
}
