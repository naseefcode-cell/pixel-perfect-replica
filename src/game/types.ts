export type Vec3 = [number, number, number];

export type NodeKind = "plain" | "goal" | "fakeGoal" | "hole" | "checkpoint";

export interface GNode {
  id: number;
  p: Vec3;
  kind?: NodeKind;
  /** oscillating movement */
  move?: { axis: "x" | "y" | "z"; amp: number; speed: number; phase?: number };
  /** rotation around a vertical axis */
  spin?: { cx: number; cz: number; speed: number };
  color?: string;
}

export interface Prop {
  type: "sign" | "npc" | "duck" | "button" | "blob" | "monolith" | "arrow";
  p: Vec3;
  text?: string;
  secret?: boolean;
}

export interface LevelData {
  nodes: GNode[];
  edges: [number, number][];
  start: number;
  goal: number;
  props: Prop[];
}

export interface Level extends LevelData {
  id: number;
  title: string;
  quip: string;
  hint: string;
  charScale?: number;
  /** second half of the final troll */
  swap?: LevelData;
}
