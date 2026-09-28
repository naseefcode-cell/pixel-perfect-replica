import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export type Emote =
  | "walk"
  | "idle"
  | "confused"
  | "fall"
  | "celebrate"
  | "look"
  | "facepalm"
  | "shrug"
  | "bonk";

export interface CharState {
  emote: Emote;
  phase: number;
}

/** A small geometric mascot with procedural, expressive animation. */
export function Character({ state }: { state: React.MutableRefObject<CharState> }) {
  const body = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);

  useFrame((s, d) => {
    const dt = Math.min(d, 0.05);
    const t = s.clock.elapsedTime;
    const e = state.current.emote;
    const p = state.current.phase;
    const k = 1 - Math.exp(-12 * dt);

    const set = (
      ref: React.RefObject<THREE.Group | null>,
      rx: number,
      rz: number,
      py = 0,
      px = 0,
    ) => {
      const o = ref.current;
      if (!o) return;
      o.rotation.x += (rx - o.rotation.x) * k;
      o.rotation.z += (rz - o.rotation.z) * k;
      o.position.y += (py - o.position.y) * k;
      o.position.x += (px - o.position.x) * k;
    };

    let bodyY = 0;
    let bodyTilt = 0;
    let headTilt = 0;
    let headTurn = 0;
    let swing = 0;
    let armLx = 0;
    let armRx = 0;
    let armLz = 0.15;
    let armRz = -0.15;

    switch (e) {
      case "walk":
        swing = Math.sin(p * 9) * 0.7;
        bodyY = Math.abs(Math.sin(p * 9)) * 0.06;
        armLx = -swing;
        armRx = swing;
        bodyTilt = Math.sin(p * 9) * 0.05;
        break;
      case "idle":
        bodyY = Math.sin(t * 2) * 0.03;
        headTurn = Math.sin(t * 0.7) * 0.25;
        break;
      case "confused":
        headTilt = Math.sin(t * 3) * 0.35;
        headTurn = Math.sin(t * 1.6) * 0.6;
        armLz = 0.8;
        armRz = -0.8;
        break;
      case "look":
        headTurn = 0;
        headTilt = Math.sin(t * 8) * 0.06;
        bodyY = Math.sin(t * 2) * 0.02;
        break;
      case "facepalm":
        armRx = -2.4;
        headTilt = 0.4;
        bodyTilt = 0.12;
        break;
      case "shrug":
        armLz = 1.5;
        armRz = -1.5;
        bodyY = 0.08 + Math.sin(t * 3) * 0.03;
        headTilt = Math.sin(t * 2) * 0.15;
        break;
      case "celebrate":
        armLx = -2.6;
        armRx = -2.6;
        bodyY = Math.abs(Math.sin(t * 8)) * 0.35;
        headTilt = Math.sin(t * 12) * 0.12;
        break;
      case "bonk":
        bodyTilt = Math.sin(t * 22) * 0.3;
        headTilt = Math.sin(t * 22) * 0.3;
        break;
      case "fall":
        bodyTilt = Math.sin(t * 12) * 0.5;
        armLx = -2.2;
        armRx = -2.2;
        swing = Math.sin(t * 16) * 1.1;
        break;
    }

    if (body.current) {
      body.current.position.y += (bodyY - body.current.position.y) * k;
      body.current.rotation.z += (bodyTilt - body.current.rotation.z) * k;
    }
    if (head.current) {
      head.current.rotation.z += (headTilt - head.current.rotation.z) * k;
      head.current.rotation.y += (headTurn - head.current.rotation.y) * k;
    }
    set(armL, armLx, armLz);
    set(armR, armRx, armRz);
    set(legL, e === "walk" ? swing : e === "fall" ? swing : 0, 0);
    set(legR, e === "walk" ? -swing : e === "fall" ? -swing : 0, 0);
  });

  return (
    <group ref={body}>
      <mesh position={[0, 0.42, 0]} castShadow>
        <capsuleGeometry args={[0.16, 0.24, 6, 14]} />
        <meshStandardMaterial color="#ff6b5a" roughness={0.45} />
      </mesh>
      <group ref={head} position={[0, 0.8, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.21, 20, 16]} />
          <meshStandardMaterial color="#ffd9c7" roughness={0.5} />
        </mesh>
        <mesh position={[0.07, 0.03, 0.19]}>
          <sphereGeometry args={[0.038, 10, 10]} />
          <meshStandardMaterial color="#26203a" />
        </mesh>
        <mesh position={[-0.07, 0.03, 0.19]}>
          <sphereGeometry args={[0.038, 10, 10]} />
          <meshStandardMaterial color="#26203a" />
        </mesh>
        <mesh position={[0, 0.2, 0]} rotation={[0, 0, 0.3]}>
          <coneGeometry args={[0.09, 0.18, 8]} />
          <meshStandardMaterial color="#ffd166" />
        </mesh>
      </group>
      <group ref={armL} position={[0.2, 0.62, 0]}>
        <mesh position={[0, -0.14, 0]} castShadow>
          <capsuleGeometry args={[0.048, 0.18, 4, 8]} />
          <meshStandardMaterial color="#ff8f7a" />
        </mesh>
      </group>
      <group ref={armR} position={[-0.2, 0.62, 0]}>
        <mesh position={[0, -0.14, 0]} castShadow>
          <capsuleGeometry args={[0.048, 0.18, 4, 8]} />
          <meshStandardMaterial color="#ff8f7a" />
        </mesh>
      </group>
      <group ref={legL} position={[0.08, 0.24, 0]}>
        <mesh position={[0, -0.12, 0]} castShadow>
          <capsuleGeometry args={[0.052, 0.14, 4, 8]} />
          <meshStandardMaterial color="#3d3357" />
        </mesh>
      </group>
      <group ref={legR} position={[-0.08, 0.24, 0]}>
        <mesh position={[0, -0.12, 0]} castShadow>
          <capsuleGeometry args={[0.052, 0.14, 4, 8]} />
          <meshStandardMaterial color="#3d3357" />
        </mesh>
      </group>
    </group>
  );
}
