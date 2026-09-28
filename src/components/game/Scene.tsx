import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { cam, useGame } from "@/game/store";
import { basisFor, clusterNodes, evalNode, nextStep, neighbours } from "@/game/perspective";
import type { LevelData, Level, Vec3 } from "@/game/types";
import { Character, type CharState } from "./Character";

const PLAT = { w: 0.92, h: 0.22, d: 0.92 };

function colorFor(kind?: string) {
  switch (kind) {
    case "goal":
      return "#ffd166";
    case "fakeGoal":
      return "#ffd166";
    case "checkpoint":
      return "#7ce0c8";
    case "hole":
      return "#d8cfe6";
    default:
      return "#f5f0ff";
  }
}

function Geometry({ data }: { data: LevelData }) {
  const plats = useRef<(THREE.Mesh | null)[]>([]);
  const beams = useRef<(THREE.Mesh | null)[]>([]);
  const goalRing = useRef<THREE.Mesh>(null);

  const dynamic = useMemo(() => data.nodes.some((n) => n.move || n.spin), [data]);

  useFrame((s) => {
    const t = s.clock.elapsedTime;
    const wp = data.nodes.map((n) => evalNode(n, t));
    if (dynamic) {
      wp.forEach((p, i) => {
        const m = plats.current[i];
        if (m) m.position.set(p[0], p[1], p[2]);
      });
    }
    data.edges.forEach(([a, b], i) => {
      const m = beams.current[i];
      if (!m) return;
      if (!dynamic && m.userData.done) return;
      const pa = new THREE.Vector3(...wp[a]);
      const pb = new THREE.Vector3(...wp[b]);
      const mid = pa.clone().add(pb).multiplyScalar(0.5);
      const len = pa.distanceTo(pb);
      m.position.copy(mid);
      m.scale.set(1, 1, Math.max(0.001, len));
      m.lookAt(pb);
      m.userData.done = true;
    });
    if (goalRing.current) {
      const g = wp[data.goal];
      goalRing.current.position.set(g[0], g[1] + 0.55 + Math.sin(t * 2) * 0.08, g[2]);
      goalRing.current.rotation.y = t * 1.4;
    }
  });

  return (
    <group>
      {data.nodes.map((n, i) => (
        <mesh
          key={n.id}
          ref={(el) => {
            plats.current[i] = el;
          }}
          position={n.p}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[PLAT.w, PLAT.h, PLAT.d]} />
          <meshStandardMaterial
            color={colorFor(n.kind)}
            roughness={0.7}
            emissive={n.kind === "goal" || n.kind === "fakeGoal" ? "#ff9f1c" : "#000000"}
            emissiveIntensity={n.kind === "goal" || n.kind === "fakeGoal" ? 0.35 : 0}
          />
        </mesh>
      ))}
      {data.edges.map((e, i) => (
        <mesh
          key={`e${i}`}
          ref={(el) => {
            beams.current[i] = el;
          }}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.55, 0.14, 1]} />
          <meshStandardMaterial color="#cdbdf0" roughness={0.8} />
        </mesh>
      ))}
      <mesh ref={goalRing}>
        <torusGeometry args={[0.3, 0.06, 10, 24]} />
        <meshStandardMaterial color="#ffb703" emissive="#ff9f1c" emissiveIntensity={0.9} />
      </mesh>
    </group>
  );
}

function Props({ data, levelId }: { data: LevelData; levelId: number }) {
  const findSecret = useGame((s) => s.findSecret);
  const say = useGame((s) => s.say);
  const bob = useRef<THREE.Group[]>([]);

  useFrame((s) => {
    const t = s.clock.elapsedTime;
    bob.current.forEach((g, i) => {
      if (g) g.position.y = (g.userData.baseY ?? 0) + Math.sin(t * 2 + i) * 0.08;
    });
  });

  return (
    <group>
      {data.props.map((p, i) => {
        const key = `${levelId}:${i}`;
        if (p.type === "duck") {
          return (
            <group
              key={key}
              position={p.p}
              ref={(el) => {
                if (el) {
                  el.userData.baseY = p.p[1];
                  bob.current[i] = el;
                }
              }}
              onClick={(e) => {
                e.stopPropagation();
                findSecret(key);
              }}
            >
              <mesh castShadow>
                <sphereGeometry args={[0.14, 12, 10]} />
                <meshStandardMaterial color="#ffd60a" />
              </mesh>
              <mesh position={[0, 0.13, 0.05]} castShadow>
                <sphereGeometry args={[0.09, 12, 10]} />
                <meshStandardMaterial color="#ffd60a" />
              </mesh>
              <mesh position={[0, 0.13, 0.15]} rotation={[Math.PI / 2, 0, 0]}>
                <coneGeometry args={[0.04, 0.09, 6]} />
                <meshStandardMaterial color="#fb8500" />
              </mesh>
            </group>
          );
        }
        if (p.type === "sign" || p.type === "arrow") {
          return (
            <group key={key} position={p.p}>
              <mesh position={[0, 0.25, 0]} castShadow>
                <boxGeometry args={[0.05, 0.5, 0.05]} />
                <meshStandardMaterial color="#8b7fa8" />
              </mesh>
              <Html position={[0, 0.72, 0]} center distanceFactor={9} zIndexRange={[5, 0]}>
                <div className="rounded-md border-2 border-[#4b3f6b] bg-[#fff6e5] px-2 py-1 text-[10px] font-black whitespace-nowrap text-[#4b3f6b] shadow">
                  {p.text}
                </div>
              </Html>
            </group>
          );
        }
        if (p.type === "npc") {
          return (
            <group key={key} position={p.p}>
              <mesh castShadow>
                <capsuleGeometry args={[0.12, 0.16, 4, 10]} />
                <meshStandardMaterial color="#5ec5ff" />
              </mesh>
              <Html position={[0, 0.55, 0]} center distanceFactor={10} zIndexRange={[5, 0]}>
                <div className="rounded-full bg-[#26203a]/80 px-2 py-0.5 text-[9px] whitespace-nowrap text-white">
                  {p.text}
                </div>
              </Html>
            </group>
          );
        }
        if (p.type === "button") {
          return (
            <group
              key={key}
              position={p.p}
              onClick={(e) => {
                e.stopPropagation();
                if (p.secret) findSecret(key);
                else say("The button does nothing. It is decorative.");
              }}
            >
              <mesh castShadow>
                <cylinderGeometry
                  args={[p.secret ? 0.09 : 0.42, p.secret ? 0.09 : 0.45, 0.18, 20]}
                />
                <meshStandardMaterial color={p.secret ? "#9d4edd" : "#ef476f"} />
              </mesh>
            </group>
          );
        }
        if (p.type === "monolith") {
          return (
            <mesh key={key} position={p.p} castShadow>
              <boxGeometry args={[1.1, 4.2, 1.1]} />
              <meshStandardMaterial color="#6c5ce7" roughness={0.6} />
            </mesh>
          );
        }
        return (
          <mesh key={key} position={p.p} castShadow>
            <icosahedronGeometry args={[0.5, 0]} />
            <meshStandardMaterial color="#b892ff" flatShading />
          </mesh>
        );
      })}
    </group>
  );
}

const IDLE_EMOTES: CharState["emote"][] = ["confused", "look", "shrug", "facepalm"];

function Player({ data, level }: { data: LevelData; level: Level }) {
  const root = useRef<THREE.Group>(null);
  const charState = useRef<CharState>({ emote: "idle", phase: 0 });
  const st = useRef({
    cur: data.start,
    to: -1,
    t: 0,
    mode: "idle" as "walk" | "idle" | "fall" | "win",
    fallT: 0,
    stuckT: 0,
    emoteT: 0,
    saidFake: false,
    lastYaw: cam.yaw,
    rotAccum: 0,
    nagged: 0,
  });

  useEffect(() => {
    st.current = {
      cur: data.start,
      to: -1,
      t: 0,
      mode: "idle",
      fallT: 0,
      stuckT: 0,
      emoteT: 0,
      saidFake: false,
      lastYaw: cam.yaw,
      rotAccum: 0,
      nagged: 0,
    };
    charState.current.emote = "idle";
  }, [data]);

  useFrame((s, dRaw) => {
    const dt = Math.min(dRaw, 0.05);
    const time = s.clock.elapsedTime;
    const g = useGame.getState();
    const S = st.current;
    const wp = data.nodes.map((n) => evalNode(n, time));

    const place = (p: Vec3, extraY = 0) => {
      if (root.current) root.current.position.set(p[0], p[1] + 0.11 + extraY, p[2]);
    };

    if (g.phase !== "playing") {
      charState.current.emote = "celebrate";
      place(wp[data.goal]);
      return;
    }

    g.tick(dt);

    // track camera rotation for jokes
    const dy = Math.abs(cam.yaw - S.lastYaw);
    S.rotAccum += dy;
    S.lastYaw = cam.yaw;
    if (S.rotAccum > 14 && S.nagged < 3) {
      S.nagged++;
      S.rotAccum = 0;
      g.bumpRotation();
      g.say(
        ["Maybe... another angle?", "Are we doing this all day?", "You tried that already."][
          S.nagged - 1
        ],
      );
      charState.current.emote = "look";
      S.emoteT = 1.2;
      cam.punch = 0.5;
    }

    if (S.mode === "fall") {
      S.fallT += dt;
      charState.current.emote = "fall";
      const p = wp[S.cur];
      place(p, -S.fallT * S.fallT * 9);
      if (S.fallT > 1.1) {
        S.mode = "idle";
        S.fallT = 0;
        S.cur = data.start;
        S.t = 0;
        charState.current.emote = "idle";
      }
      return;
    }

    if (cam.dragging) {
      if (S.mode === "walk") {
        // hold position mid-edge while the player thinks
        const a = wp[S.cur];
        const b = wp[S.to];
        place([
          a[0] + (b[0] - a[0]) * S.t,
          a[1] + (b[1] - a[1]) * S.t,
          a[2] + (b[2] - a[2]) * S.t,
        ]);
      } else {
        place(wp[S.cur]);
      }
      charState.current.emote = "look";
      return;
    }

    if (S.mode === "walk") {
      const a = wp[S.cur];
      const b = wp[S.to];
      const len = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) || 1;
      S.t += (2.0 * dt) / len;
      charState.current.emote = "walk";
      charState.current.phase += dt;
      if (root.current) {
        const ang = Math.atan2(b[0] - a[0], b[2] - a[2]);
        root.current.rotation.y += (ang - root.current.rotation.y) * (1 - Math.exp(-10 * dt));
      }
      if (S.t >= 1) {
        S.cur = S.to;
        S.t = 0;
        S.mode = "idle";
        const node = data.nodes[S.cur];
        if (S.cur === data.goal) {
          S.mode = "win";
          charState.current.emote = "celebrate";
          if (level.swap && !g.swapped) {
            g.say("LEVEL COMPLETE! 🎉");
            cam.punch = 1;
            setTimeout(() => {
              useGame.getState().say("LOL. You thought.");
              useGame.getState().trollSwap();
              cam.shake = 0.6;
            }, 1100);
          } else {
            g.win();
          }
          place(wp[S.cur]);
          return;
        }
        if (node.kind === "hole") {
          g.say(
            ["Well that was a floor-shaped lie.", "Gravity: still undefeated.", "Nope."][
              Math.floor(Math.random() * 3)
            ],
          );
          g.fall();
          S.mode = "fall";
          cam.shake = 0.35;
          return;
        }
        if (node.kind === "fakeGoal" && !S.saidFake) {
          S.saidFake = true;
          g.say("Nope. That exit was a decoration.");
          charState.current.emote = "facepalm";
          S.emoteT = 1.4;
          cam.punch = 0.6;
        }
        if (node.kind === "checkpoint") {
          g.say("Checkpoint! (purely ceremonial)");
        }
      } else {
        place([
          a[0] + (b[0] - a[0]) * S.t,
          a[1] + (b[1] - a[1]) * S.t,
          a[2] + (b[2] - a[2]) * S.t,
        ]);
      }
      return;
    }

    // idle: look for a route using the current perspective
    place(wp[S.cur]);
    const basis = basisFor(cam.yaw);
    const cl = clusterNodes(wp, basis);
    const step = nextStep(data.edges, cl, S.cur, data.goal);
    if (step) {
      S.cur = step.from; // seamless perspective snap
      S.to = step.to;
      S.t = 0;
      S.mode = "walk";
      S.stuckT = 0;
      charState.current.emote = "walk";
      return;
    }

    S.stuckT += dt;
    S.emoteT -= dt;
    if (S.emoteT <= 0) {
      const dead = neighbours(data.edges, S.cur).length <= 1;
      charState.current.emote =
        S.stuckT > 4
          ? IDLE_EMOTES[Math.floor(time / 3) % IDLE_EMOTES.length]
          : dead
            ? "confused"
            : "idle";
    }
  });

  return (
    <group ref={root} scale={level.charScale ?? 1}>
      <Character state={charState} />
    </group>
  );
}

function RandomFun() {
  const say = useGame((s) => s.say);
  useEffect(() => {
    const lines = [
      "A platform just bounced for no reason.",
      "Somewhere, a duck appeared.",
      "That sign changed while you weren't looking.",
      "The camera did a dramatic zoom. For drama.",
      "An NPC fell off the level. He's fine.",
      "This platform is completely unnecessary.",
    ];
    const id = setInterval(
      () => {
        if (useGame.getState().phase !== "playing") return;
        if (Math.random() < 0.45) {
          say(lines[Math.floor(Math.random() * lines.length)]);
          cam.punch = 0.45;
        }
      },
      14000 + Math.random() * 6000,
    );
    return () => clearInterval(id);
  }, [say]);
  return null;
}

export function Scene() {
  const data = useGame((s) => s.data);
  const level = useGame((s) => s.level);

  const center = useMemo(() => {
    const ps = data.nodes.map((n) => n.p);
    const c = ps.reduce((a, p) => [a[0] + p[0], a[1] + p[1], a[2] + p[2]] as Vec3, [0, 0, 0] as Vec3);
    return [c[0] / ps.length, c[1] / ps.length, c[2] / ps.length] as Vec3;
  }, [data]);

  return (
    <group position={[-center[0], -center[1] * 0.6, -center[2]]}>
      <Geometry data={data} />
      <Props data={data} levelId={level.id} />
      <Player data={data} level={level} />
      <RandomFun />
      {/* soft shadow catcher far below */}
      <mesh rotation-x={-Math.PI / 2} position={[center[0], -6, center[2]]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#e8dcff" transparent opacity={0.35} />
      </mesh>
    </group>
  );
}
