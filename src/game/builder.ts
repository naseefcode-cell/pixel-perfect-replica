import type { GNode, Prop, Vec3, LevelData } from "./types";

/**
 * Perspective alignment cheat-sheet.
 *
 * The camera is orthographic with a FIXED pitch of atan(1/sqrt(2)) (classic
 * isometric). Under that projection two points merge on screen when their
 * offset is (k, k, k) style: a horizontal run of length L paired with a
 * vertical rise of L / sqrt(2). `diag()` produces exactly such offsets, so
 * levels built with it always have a real, findable camera angle.
 */
export function diag(p: Vec3, sx: number, k: number, sz: number): Vec3 {
  return [p[0] + sx * k, p[1] + k, p[2] + sz * k];
}

export function add(p: Vec3, d: Vec3): Vec3 {
  return [p[0] + d[0], p[1] + d[1], p[2] + d[2]];
}

export class LB {
  nodes: GNode[] = [];
  edges: [number, number][] = [];
  props: Prop[] = [];

  n(p: Vec3, o: Partial<GNode> = {}): number {
    const id = this.nodes.length;
    this.nodes.push({ id, p, ...o });
    return id;
  }

  /** chain of nodes connected in sequence */
  chain(pts: Vec3[], o: Partial<GNode> = {}): number[] {
    const ids = pts.map((p) => this.n(p, o));
    for (let i = 0; i < ids.length - 1; i++) this.edges.push([ids[i], ids[i + 1]]);
    return ids;
  }

  /** straight run of `count` steps from `from` in direction `dir` */
  run(from: Vec3, dir: Vec3, count: number, o: Partial<GNode> = {}): number[] {
    const pts: Vec3[] = [from];
    let cur = from;
    for (let i = 0; i < count; i++) {
      cur = add(cur, dir);
      pts.push(cur);
    }
    return this.chain(pts, o);
  }

  /** optical staircase: rises while running */
  stair(from: Vec3, dir: Vec3, rise: number, count: number, o: Partial<GNode> = {}): number[] {
    return this.run(from, [dir[0], rise, dir[2]], count, o);
  }

  link(a: number, b: number) {
    this.edges.push([a, b]);
  }

  prop(type: Prop["type"], p: Vec3, text?: string, secret = false) {
    this.props.push({ type, p, text, secret });
  }

  build(start: number, goal: number): LevelData {
    this.nodes[goal] = { ...this.nodes[goal], kind: "goal" };
    return { nodes: this.nodes, edges: this.edges, start, goal, props: this.props };
  }
}

export function pos(n: GNode): Vec3 {
  return n.p;
}
