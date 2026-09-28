import type { GNode, Vec3 } from "./types";

export const PITCH = Math.atan(1 / Math.SQRT2); // classic isometric pitch
export const MERGE_EPS = 0.38; // world units on the projection plane

export function evalNode(n: GNode, t: number): Vec3 {
  let [x, y, z] = n.p;
  if (n.spin) {
    const a = t * n.spin.speed;
    const dx = x - n.spin.cx;
    const dz = z - n.spin.cz;
    x = n.spin.cx + dx * Math.cos(a) - dz * Math.sin(a);
    z = n.spin.cz + dx * Math.sin(a) + dz * Math.cos(a);
  }
  if (n.move) {
    const d = Math.sin(t * n.move.speed + (n.move.phase ?? 0)) * n.move.amp;
    if (n.move.axis === "x") x += d;
    else if (n.move.axis === "y") y += d;
    else z += d;
  }
  return [x, y, z];
}

export interface Basis {
  right: Vec3;
  up: Vec3;
}

export function basisFor(yaw: number, pitch = PITCH): Basis {
  // camera direction (from camera toward scene)
  const cp = Math.cos(pitch);
  const dir: Vec3 = [-Math.sin(yaw) * cp, -Math.sin(pitch), -Math.cos(yaw) * cp];
  const right: Vec3 = [Math.cos(yaw), 0, -Math.sin(yaw)];
  // up = right x dir
  const up: Vec3 = [
    right[1] * dir[2] - right[2] * dir[1],
    right[2] * dir[0] - right[0] * dir[2],
    right[0] * dir[1] - right[1] * dir[0],
  ];
  return { right, up };
}

export function project(p: Vec3, b: Basis): [number, number] {
  return [
    p[0] * b.right[0] + p[1] * b.right[1] + p[2] * b.right[2],
    p[0] * b.up[0] + p[1] * b.up[1] + p[2] * b.up[2],
  ];
}

/** union-find clustering of nodes that visually overlap */
export function clusterNodes(worldPos: Vec3[], b: Basis): number[] {
  const n = worldPos.length;
  const parent = Array.from({ length: n }, (_, i) => i);
  const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  const uni = (a: number, c: number) => {
    const ra = find(a);
    const rc = find(c);
    if (ra !== rc) parent[ra] = rc;
  };
  const scr = worldPos.map((p) => project(p, b));
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (
        Math.abs(scr[i][0] - scr[j][0]) < MERGE_EPS &&
        Math.abs(scr[i][1] - scr[j][1]) < MERGE_EPS
      ) {
        uni(i, j);
      }
    }
  }
  return worldPos.map((_, i) => find(i));
}

export interface Step {
  /** node to visually snap to (same screen spot as current) */
  from: number;
  /** node to walk to */
  to: number;
}

/**
 * Find the next walking step from `cur` toward `goal`, travelling through
 * perspective merges. Returns null when no route currently exists.
 */
export function nextStep(
  edges: [number, number][],
  cluster: number[],
  cur: number,
  goal: number,
): Step | null {
  const startC = cluster[cur];
  const goalC = cluster[goal];
  if (startC === goalC) return null;

  const adj = new Map<number, { edge: [number, number]; to: number }[]>();
  for (const [a, b] of edges) {
    const ca = cluster[a];
    const cb = cluster[b];
    if (ca === cb) continue;
    if (!adj.has(ca)) adj.set(ca, []);
    if (!adj.has(cb)) adj.set(cb, []);
    adj.get(ca)!.push({ edge: [a, b], to: cb });
    adj.get(cb)!.push({ edge: [b, a], to: ca });
  }

  const prev = new Map<number, { from: number; edge: [number, number] }>();
  const seen = new Set<number>([startC]);
  const q = [startC];
  let found = false;
  while (q.length) {
    const c = q.shift()!;
    if (c === goalC) {
      found = true;
      break;
    }
    for (const e of adj.get(c) ?? []) {
      if (seen.has(e.to)) continue;
      seen.add(e.to);
      prev.set(e.to, { from: c, edge: e.edge });
      q.push(e.to);
    }
  }
  if (!found) return null;

  // walk backwards to the first edge leaving startC
  let c = goalC;
  let firstEdge: [number, number] | null = null;
  while (c !== startC) {
    const p = prev.get(c);
    if (!p) return null;
    firstEdge = p.edge;
    c = p.from;
  }
  if (!firstEdge) return null;
  return { from: firstEdge[0], to: firstEdge[1] };
}

/** neighbours of a node through real geometry only */
export function neighbours(edges: [number, number][], id: number): number[] {
  const out: number[] = [];
  for (const [a, b] of edges) {
    if (a === id) out.push(b);
    else if (b === id) out.push(a);
  }
  return out;
}
