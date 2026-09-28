import { LB, diag } from "./builder";
import type { Level, LevelData, Vec3 } from "./types";

/*
 * Every level is built so that at least one camera yaw makes the required
 * platforms visually merge. See builder.ts for the alignment rule.
 */

type Make = () => LevelData;

function L(
  id: number,
  title: string,
  quip: string,
  hint: string,
  make: Make,
  extra: Partial<Level> = {},
): Level {
  return { id, title, quip, hint, ...make(), ...extra };
}

/* ------------------------------------------------------------------ 01-05 */

const m01: Make = () => {
  const b = new LB();
  const a = b.run([-3, 0, -1], [1, 0, 0], 3);
  const c = b.run([2, 2, 1], [1, 0, 0], 2);
  b.prop("sign", [-3, 0.8, -1], "START");
  b.prop("duck", [1, 0.7, -1], undefined, true);
  return b.build(a[0], c[c.length - 1]);
};

const m02: Make = () => {
  const b = new LB();
  const a = b.run([-4, 0, 0], [1, 0, 0], 3);
  const c = b.run([0, 2, 2], [1, 0, 0], 3);
  b.prop("sign", [-4, 0.8, 0], "MIND THE GAP");
  return b.build(a[0], c[c.length - 1]);
};

const m03: Make = () => {
  const b = new LB();
  const a = b.run([-4, 0, 0], [1, 0, 0], 2);
  const trap = b.run([-2, 0, 0], [1, 0, 0], 2);
  b.nodes[trap[trap.length - 1]].kind = "hole";
  const c = b.run([-1, 2, -2], [0, 0, -1], 3);
  b.prop("sign", [-4, 0.8, 0], "DEFINITELY SAFE");
  b.prop("blob", [0, -2, 0]);
  return b.build(a[0], c[c.length - 1]);
};

const m04: Make = () => {
  const b = new LB();
  const a = b.run([-4, 0, 2], [1, 0, 0], 2);
  const big = b.run([-2, 0, 2], [1, 0, 0], 5);
  b.nodes[big[big.length - 1]].kind = "hole";
  const tiny = b.run([-3, 1, 3], [0, 0, 1], 2);
  b.link(a[1], tiny[0]);
  const c = b.run([-1, 3, 7], [0, 0, 1], 2);
  b.prop("arrow", [1, 1.4, 2], "THE OBVIOUS WAY");
  b.prop("duck", [-3, 1.7, 4], undefined, true);
  return b.build(a[0], c[c.length - 1]);
};

const m05: Make = () => {
  const b = new LB();
  const a = b.run([-4, 0, 0], [1, 0, 0], 3);
  const c = b.run([0, 3, 3], [0, 0, 1], 3);
  b.prop("monolith", [0, 2.5, -1], "WHY IS THAT THERE?");
  return b.build(a[0], c[c.length - 1]);
};

/* ------------------------------------------------------------------ 06-10 */

const m06: Make = () => {
  const b = new LB();
  const a = b.run([-4, 0, 0], [1, 0, 0], 4);
  b.nodes[a[a.length - 1]].kind = "fakeGoal";
  const c = b.run([1, 3, 3], [0, 0, 1], 2);
  b.prop("sign", [0, 0.8, 0], "EXIT →");
  return b.build(a[0], c[c.length - 1]);
};

const m07: Make = () => {
  const b = new LB();
  const a = b.run([-4, 0, 0], [1, 0, 0], 2);
  const lie = b.run([-2, 0, 0], [0, 0, 1], 3);
  b.nodes[lie[lie.length - 1]].kind = "hole";
  const c = b.run([-1, 1, -1], [0, 0, -1], 3);
  b.prop("sign", [-2, 0.8, 1], "TRUST THIS PATH");
  b.prop("duck", [-2, 0.7, 3], undefined, true);
  return b.build(a[0], c[c.length - 1]);
};

const m08: Make = () => {
  const b = new LB();
  const a = b.run([-4, 0, 0], [1, 0, 0], 3);
  const c = b.run([-1, 2, 2], [1, 0, 0], 3);
  b.prop("button", [2, 1.2, -2], "BIG RED BUTTON");
  b.prop("button", [-4, 0.5, -1], "tiny button", true);
  return b.build(a[0], c[c.length - 1]);
};

const m09: Make = () => {
  const b = new LB();
  const ring = b.chain([
    [-2, 0, -2],
    [0, 0, -2],
    [2, 0, -2],
    [2, 0, 0],
    [0, 0, 0],
    [-2, 0, 0],
    [-2, 0, -2],
  ]);
  const c = b.run([4, 2, 2], [1, 0, 0], 2);
  b.link(ring[0], ring[6]);
  b.prop("sign", [-2, 0.8, -2], "ROUND AND ROUND");
  return b.build(ring[0], c[c.length - 1]);
};

const m10: Make = () => {
  const b = new LB();
  const a = b.run([-4, 0, -2], [1, 0, 0], 3);
  const c = b.run([-2, 3, 1], [1, 0, 0], 2);
  const d = b.run([2, 4, 2], [0, 0, 1], 2);
  b.prop("duck", [-4, 0.7, -2], undefined, true);
  return b.build(a[0], d[d.length - 1]);
};

/* ------------------------------------------------------------------ 11-15 */

const m11: Make = () => {
  const b = new LB();
  const a = b.run([-3, 0, 2], [0, 0, -1], 3);
  const c = b.run([-1, 2, -3], [0, 0, -1], 3);
  b.prop("sign", [-3, 0.8, 2], "DO NOT ROTATE");
  b.prop("npc", [-1, 0.6, 2], "seriously");
  return b.build(a[0], c[c.length - 1]);
};

const m12: Make = () => {
  const b = new LB();
  const a = b.run([-4, 0, 0], [1, 0, 0], 2);
  const lift = b.n([-1, 0, 0], { move: { axis: "x", amp: 1.5, speed: 0.9 } });
  b.link(a[a.length - 1], lift);
  const c = b.run([1, 2, 2], [1, 0, 0], 2);
  b.link(lift, c[0]);
  b.prop("sign", [-4, 0.8, 0], "ELEVATOR");
  return b.build(a[0], c[c.length - 1]);
};

const m13: Make = () => {
  const b = new LB();
  const a = b.run([-4, 0, 0], [1, 0, 0], 2);
  const wrong = b.run([-2, 0, 0], [0, 0, -1], 2);
  b.nodes[wrong[wrong.length - 1]].kind = "hole";
  const c = b.run([-1, 1, 1], [0, 0, 1], 3);
  b.prop("npc", [-2, 0.6, -1], "it's that way. no wait.");
  return b.build(a[0], c[c.length - 1]);
};

const m14: Make = () => {
  const b = new LB();
  const a = b.run([-4, 0, 1], [1, 0, 0], 3);
  const c = b.run([-1, 3, 4], [0, 0, 1], 2);
  const d = b.run([1, 4, 6], [1, 0, 0], 2);
  b.prop("duck", [3, 4.7, 6], undefined, true);
  return b.build(a[0], d[d.length - 1]);
};

const m15: Make = () => {
  const b = new LB();
  const a = b.run([-4, 0, -2], [1, 0, 0], 3);
  const c = b.run([-2, 2, 0], [1, 0, 0], 3);
  const d = b.run([4, 3, 1], [0, 0, 1], 2);
  b.prop("monolith", [-1, 2, 4], "BIG");
  return b.build(a[0], d[d.length - 1]);
};

/* ------------------------------------------------------------------ 16-20 */

const m16: Make = () => {
  const b = new LB();
  const a = b.run([-4, 0, 0], [1, 0, 0], 2);
  const doorA = b.run([-2, 0, -2], [0, 0, -1], 2);
  b.nodes[doorA[doorA.length - 1]].kind = "hole";
  b.link(a[a.length - 1], doorA[0]);
  const doorB = b.run([-2, 0, 2], [0, 0, 1], 2);
  b.nodes[doorB[doorB.length - 1]].kind = "fakeGoal";
  b.link(a[a.length - 1], doorB[0]);
  const c = b.run([-1, 1, 1], [1, 0, 0], 3);
  b.prop("sign", [-2, 0.8, -2], "DOOR 1");
  b.prop("sign", [-2, 0.8, 2], "DOOR 2");
  b.prop("sign", [-1, 1.8, 1], "DOOR 3");
  return b.build(a[0], c[c.length - 1]);
};

const m17: Make = () => {
  const b = new LB();
  const a = b.run([-4, 0, 3], [1, 0, 0], 2);
  const c = b.run([0, 2, 5], [1, 0, 0], 1);
  const d = b.run([3, 3, 4], [0, 0, -1], 3);
  b.prop("sign", [-4, 0.8, 3], "INVISIBLE BRIDGE");
  b.prop("duck", [1, 2.7, 5], undefined, true);
  return b.build(a[0], d[d.length - 1]);
};

const m18: Make = () => {
  const b = new LB();
  const a = b.run([-4, 0, 0], [1, 0, 0], 2);
  const mv = b.n([-1, 0, 0], { move: { axis: "z", amp: 1.2, speed: 0.7 } });
  b.link(a[a.length - 1], mv);
  const mv2 = b.n([1, 2, 2], { move: { axis: "z", amp: 1.2, speed: 0.7, phase: Math.PI } });
  const c = b.run([1, 2, 2], [1, 0, 0], 2);
  b.link(mv2, c[0]);
  b.prop("sign", [-4, 0.8, 0], "EVERYTHING IS MOVING");
  return b.build(a[0], c[c.length - 1]);
};

const m19: Make = () => {
  const b = new LB();
  const a = b.run([-4, 0, -1], [1, 0, 0], 3);
  b.nodes[a[2]].kind = "checkpoint";
  const c = b.run([-1, 2, 1], [0, 0, 1], 3);
  b.prop("sign", [-2, 0.8, -1], "IMPORTANT CHECKPOINT");
  b.prop("duck", [-1, 2.7, 4], undefined, true);
  return b.build(a[0], c[c.length - 1]);
};

const m20: Make = () => {
  const b = new LB();
  const a = b.run([0, 0, 0], [1, 0, 0], 4);
  b.nodes[a[a.length - 1]].kind = "hole";
  const back = b.run([0, 0, 0], [-1, 0, 0], 2);
  const c = b.run([-4, 2, 2], [-1, 0, 0], 2);
  b.prop("arrow", [2, 1.2, 0], "GOAL THIS WAY (probably)");
  return b.build(a[0], c[c.length - 1]);
};

/* ------------------------------------------------------------------ 21-25 */

const m21: Make = () => {
  const b = new LB();
  const a = b.run([-4, 0, 0], [1, 0, 0], 2);
  const w1 = b.run([-1, 1, 1], [0, 0, 1], 2);
  b.nodes[w1[w1.length - 1]].kind = "hole";
  const w2 = b.run([-1, 1, -1], [0, 0, -1], 2);
  b.nodes[w2[w2.length - 1]].kind = "hole";
  const c = b.run([0, 2, 2], [1, 0, 0], 3);
  b.prop("sign", [-4, 0.8, 0], "PICK WISELY");
  return b.build(a[0], c[c.length - 1]);
};

const m22: Make = () => {
  const b = new LB();
  const a = b.run([-4, 0, 0], [1, 0, 0], 2);
  const wrong = b.run([-2, 0, 0], [1, 0, 0], 2);
  b.nodes[wrong[wrong.length - 1]].kind = "hole";
  const c = b.run([-3, 1, 1], [0, 0, 1], 3);
  b.prop("npc", [0, 0.6, 0], "he's going the wrong way");
  b.prop("duck", [-3, 1.7, 4], undefined, true);
  return b.build(a[0], c[c.length - 1]);
};

const m23: Make = () => {
  const b = new LB();
  const a = b.run([-4, 0, 0], [1, 0, 0], 2);
  const tower = b.chain(
    [
      [0, 1, 0],
      [1, 1, 0],
      [2, 1, 0],
    ],
    { spin: { cx: 1, cz: 0, speed: 0.4 } },
  );
  const c = b.run([-1, 3, 3], [0, 0, 1], 2);
  b.link(tower[2], c[0]);
  b.prop("sign", [-4, 0.8, 0], "THE ROTATING TOWER");
  return b.build(a[0], c[c.length - 1]);
};

const m24: Make = () => {
  const b = new LB();
  const a = b.run([-4, 0, 0], [1, 0, 0], 2);
  const left = b.run([-2, 0, -1], [0, 0, -1], 3);
  b.nodes[left[left.length - 1]].kind = "hole";
  b.link(a[a.length - 1], left[0]);
  const right = b.run([-2, 0, 1], [0, 0, 1], 3);
  b.link(a[a.length - 1], right[0]);
  const c = b.run([-1, 1, 5], [1, 0, 0], 2);
  b.prop("sign", [-4, 0.8, 0], "MIRROR WORLD");
  return b.build(a[0], c[c.length - 1]);
};

const m25: Make = () => {
  const b = new LB();
  const a = b.run([-5, 0, 0], [1, 0, 0], 2);
  const fake = b.run([-3, 0, 2], [0, 0, 1], 2);
  b.nodes[fake[fake.length - 1]].kind = "fakeGoal";
  b.link(a[a.length - 1], fake[0]);
  const mv = b.n([-3, 0, -1], { move: { axis: "z", amp: 1, speed: 0.8 } });
  b.link(a[a.length - 1], mv);
  const mid = b.run([-2, 1, -2], [1, 0, 0], 2);
  const c = b.run([1, 3, 0], [0, 0, 1], 3);
  b.prop("button", [3, 1.2, -3], "DO NOT PRESS");
  b.prop("npc", [-5, 0.6, 1], "good luck lol");
  b.prop("duck", [0, 3.7, 0], undefined, true);
  return b.build(a[0], c[c.length - 1]);
};

/* ------------------------------------------------------------------ 26-30 */

const m26: Make = () => {
  const b = new LB();
  const a = b.run([-5, 0, -2], [1, 0, 0], 2);
  const p2 = b.run([-2, 1, -1], [1, 0, 0], 2);
  const p3 = b.run([1, 2, 1], [0, 0, 1], 2);
  const p4 = b.run([3, 3, 4], [1, 0, 0], 2);
  b.prop("sign", [-5, 0.8, -2], "EVERYTHING CONNECTS");
  return b.build(a[0], p4[p4.length - 1]);
};

const m27: Make = () => {
  const b = new LB();
  const a = b.run([-4, 0, 0], [1, 0, 0], 2);
  const mv = b.n([-1, 0, 0], { move: { axis: "x", amp: 1.6, speed: 1.6 } });
  b.link(a[a.length - 1], mv);
  const mv2 = b.n([1, 2, 2], { move: { axis: "x", amp: 1.6, speed: 1.6, phase: 1 } });
  const c = b.run([1, 2, 2], [0, 0, 1], 2);
  b.link(mv2, c[0]);
  b.prop("sign", [-4, 0.8, 0], "DON'T PANIC");
  return b.build(a[0], c[c.length - 1]);
};

const m28: Make = () => {
  const b = new LB();
  const a = b.stair([-4, 0, -3], [1, 0, 0], 0.5, 4);
  const c = b.stair([-1, 4, 0], [0, 0, 1], 0.5, 4);
  const d = b.run([1, 6, 5], [1, 0, 0], 2);
  b.prop("sign", [-4, 0.8, -3], "THE IMPOSSIBLE STAIRCASE");
  b.prop("duck", [3, 6.7, 5], undefined, true);
  return b.build(a[0], d[d.length - 1]);
};

const m29: Make = () => {
  const b = new LB();
  const a = b.run([-4, 0, 1], [1, 0, 0], 2);
  const bad = b.run([-2, 0, 1], [0, 0, 1], 2);
  b.nodes[bad[bad.length - 1]].kind = "hole";
  const c = b.run([-1, 2, -1], [1, 0, 0], 2);
  const d = b.run([3, 3, 0], [0, 0, -1], 2);
  b.prop("npc", [-4, 0.6, 2], "the game is watching");
  return b.build(a[0], d[d.length - 1]);
};

const m30a: Make = () => {
  const b = new LB();
  const a = b.run([-2, 0, 0], [1, 0, 0], 3);
  b.prop("sign", [-2, 0.8, 0], "SO EASY");
  return b.build(a[0], a[a.length - 1]);
};

const m30b: Make = () => {
  const b = new LB();
  const a = b.run([-6, 0, -3], [1, 0, 0], 2);
  const mv = b.n([-4, 0, -3], { move: { axis: "z", amp: 1.2, speed: 0.8 } });
  b.link(a[a.length - 1], mv);
  const s = b.stair([-3, 1, -2], [1, 0, 0], 0.5, 3);
  const tower = b.chain(
    [
      [1, 3, 0],
      [2, 3, 0],
    ],
    { spin: { cx: 1.5, cz: 0, speed: 0.35 } },
  );
  const c = b.run([0, 4, 3], [0, 0, 1], 2);
  b.link(tower[1], c[0]);
  const fin = b.run([2, 5, 6], [1, 0, 0], 2);
  b.prop("button", [-6, 0.6, -2], "THE LAST BUTTON", true);
  b.prop("duck", [4, 5.7, 6], undefined, true);
  return b.build(a[0], fin[fin.length - 1]);
};

export const LEVELS: Level[] = [
  L(1, "Welcome", "That was suspiciously easy.", "Drag to rotate. Line the platforms up.", m01),
  L(2, "The Gap", "A gap is just a bridge with commitment issues.", "Find the angle where the two ledges touch.", m02),
  L(3, "Definitely Safe", "It was not, in fact, definitely safe.", "One route ends in nothing. Find the other.", m03),
  L(4, "The Shortcut", "The big obvious road was a personality test.", "The weird tiny route is the correct one.", m04),
  L(5, "Why Is That There?", "Nobody knows who put that there.", "Rotate around the giant useless block.", m05),
  L(6, "The Fake Exit", "Nope.", "That exit is a liar. The real one is above.", m06),
  L(7, "Trust Me", "The sign has been fired.", "Do the opposite of the sign.", m07),
  L(8, "Button", "The big button does nothing. It's decorative.", "Ignore buttons. Rotate.", m08),
  L(9, "The Loop", "Are we doing this all day?", "Break out of the circle with a merge.", m09),
  L(10, "The Floor", "Perfectly aligned. Suspicious.", "Two rotations, two connections.", m10),
  L(11, "Don't Rotate", "You rotated. Rebel.", "Yes, rotate. Obviously rotate.", m11),
  L(12, "Elevator", "That's a sideways elevator. A slidevator.", "Time the sliding platform, then align.", m12),
  L(13, "The Troll", "The NPC has no idea either.", "Ignore the pointing. Find your own angle.", m13),
  L(14, "Tiny Problem", "You are now bite-sized.", "Everything looks enormous. Same rules.", m14, { charScale: 0.45 }),
  L(15, "BIG Problem", "Big feelings. Big legs.", "Being huge changes nothing. Rotate anyway.", m15, { charScale: 1.9 }),
  L(16, "Three Doors", "Two doors were a prank.", "One door loops, one drops, one wins.", m16),
  L(17, "The Invisible Bridge", "It exists. Emotionally.", "The bridge only appears from one precise angle.", m17),
  L(18, "Everything Is Moving", "Even the level can't sit still.", "Wait for the platforms to sync up.", m18),
  L(19, "Fake Checkpoint", "That checkpoint was purely ceremonial.", "Keep going past the shiny thing.", m19),
  L(20, "The Exit Is Behind You", "It was behind you the whole time.", "Turn the camera around. Literally.", m20),
  L(21, "Perspective Panic", "So many options. One is real.", "Three merges look right. Only one leads up.", m21),
  L(22, "The Wrong Way", "He walks confidently in the wrong direction.", "Change the angle before he reaches the edge.", m22),
  L(23, "The Rotating Tower", "The tower rotates. You rotate. Everyone rotates.", "Catch the spinning tower at the right moment.", m23),
  L(24, "Mirror World", "One of these is a lie.", "Identical routes, one is real.", m24),
  L(25, "The Troll Room", "Fake exits, fake buttons, real puzzle.", "Everything here is a prank except the physics.", m25),
  L(26, "Everything Connects", "Plan ahead. Or don't. Chaos works too.", "Four stages, four alignments.", m26),
  L(27, "Don't Panic", "PANIC. But politely.", "Fast platforms, same calm rules.", m27),
  L(28, "The Impossible Staircase", "Stairs to nowhere are still stairs.", "Two staircases meet at exactly one angle.", m28),
  L(29, "The Game Knows", "The game has been taking notes.", "Maybe... another angle?", m29),
  L(30, "The Final Troll", "OKAY. NOW YOU ACTUALLY WIN.", "Everything you learned, at once.", m30a, {
    swap: m30b(),
  }),
];

export const LEVEL_COUNT = LEVELS.length;

export function levelByIndex(i: number): Level {
  return LEVELS[Math.max(0, Math.min(LEVELS.length - 1, i))];
}

export function startPos(l: { nodes: { p: Vec3 }[]; start: number }): Vec3 {
  return l.nodes[l.start].p;
}

export { diag };
