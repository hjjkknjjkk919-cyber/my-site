import React from "react";
import { random } from "remotion";
import { clamp, INK, Svg } from "../components/fx";

/**
 * Вагон электрички в 3D: пол, потолок с лампами, ряды сидений, окна, поручни, торцевая дверь со стеклом.
 * Плоская рисовка, но всё проецируется перспективой — камера может лететь по проходу.
 * Координаты мира: x — поперёк (−W..W), y — высота от пола, z — вдоль вагона (0 — задний торец, LEN — передний).
 */
export const WAGON_LEN = 2400;
const HALF = 150; // полуширина вагона
const HGT = 240; // высота до потолка
const FOCAL = 900;
const CX = 540;
const CY = 900;

export type Cam = { x: number; y: number; z: number; yaw?: number; roll?: number };

const proj = (c: Cam, x: number, y: number, z: number) => {
  // поворот по горизонтали (yaw) вокруг камеры
  const yaw = ((c.yaw ?? 0) * Math.PI) / 180;
  let dx = x - c.x;
  let dz = z - c.z;
  const rx = dx * Math.cos(yaw) - dz * Math.sin(yaw);
  const rz = dx * Math.sin(yaw) + dz * Math.cos(yaw);
  dx = rx;
  dz = Math.max(rz, 1);
  const k = FOCAL / dz;
  return { x: CX + dx * k, y: CY - (y - c.y) * k, k, z: dz };
};

const quad = (c: Cam, pts: [number, number, number][]) => {
  const p = pts.map(([x, y, z]) => proj(c, x, y, z));
  if (pts.some(([, , z]) => z - c.z < 2)) return null;
  return p.map((q) => `${q.x},${q.y}`).join(" ");
};

const fog = (hex: string, depth: number, dark: number) => {
  const f = clamp(depth / 2600) * 0.85 + dark * 0.4;
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const to = [8, 12, 20];
  return `rgb(${Math.round(r + (to[0] - r) * f)},${Math.round(g + (to[1] - g) * f)},${Math.round(b + (to[2] - b) * f)})`;
};

type Props = {
  cam: Cam;
  t: number;
  /** 0..1 — общая яркость ламп (мигание) */
  light?: number;
  /** что видно за стеклом торцевой двери (соседний вагон) */
  beyond?: React.ReactNode;
  /** фигуры внутри вагона: [z, нода] — рисуются в порядке глубины */
  actors?: { z: number; x: number; node: (p: { x: number; y: number; k: number }) => React.ReactNode }[];
};

export const Wagon = ({ cam, t, light = 1, beyond, actors = [] }: Props) => {
  const dark = 1 - light;
  const items: { z: number; el: React.ReactNode }[] = [];
  const push = (z: number, el: React.ReactNode) => items.push({ z, el });

  // секции вагона: каждые 200 — окно, ряд сидений, лампа
  for (let i = 0; i < WAGON_LEN / 200; i++) {
    const z0 = i * 200;
    const z1 = z0 + 200;
    const dz = (z0 + z1) / 2 - cam.z;
    if (z1 < cam.z + 2) continue;
    const zz0 = Math.max(z0, cam.z + 3);
    // стены
    [-1, 1].forEach((s) => {
      const wall = quad(cam, [[s * HALF, 0, zz0], [s * HALF, HGT, zz0], [s * HALF, HGT, z1], [s * HALF, 0, z1]]);
      if (wall) push(z1 + 5000, <polygon key={`w${i}${s}`} points={wall} fill={fog("#24343c", dz, dark)} stroke={INK} strokeWidth="2" />);
      // окно
      const wz0 = Math.max(z0 + 30, cam.z + 3);
      const win = z0 + 170 > cam.z + 3 ? quad(cam, [[s * HALF, 95, wz0], [s * HALF, 200, wz0], [s * HALF, 200, z0 + 170], [s * HALF, 95, z0 + 170]]) : null;
      if (win) push(z1 + 4999, <polygon key={`win${i}${s}`} points={win} fill={fog("#05080e", dz, 0)} stroke={fog("#8a9aa5", dz, dark)} strokeWidth="5" />);
    });
    // пол и потолок
    const fl = quad(cam, [[-HALF, 0, zz0], [HALF, 0, zz0], [HALF, 0, z1], [-HALF, 0, z1]]);
    if (fl) push(z1 + 5001, <polygon key={`f${i}`} points={fl} fill={fog(i % 2 ? "#2e2823" : "#2a241f", dz, dark)} />);
    const ce = quad(cam, [[-HALF, HGT, zz0], [HALF, HGT, zz0], [HALF, HGT, z1], [-HALF, HGT, z1]]);
    if (ce) push(z1 + 5001, <polygon key={`c${i}`} points={ce} fill={fog("#59625f", dz, dark)} />);
    // лампа
    const lamp = quad(cam, [[-30, HGT - 1, z0 + 60], [30, HGT - 1, z0 + 60], [30, HGT - 1, z0 + 140], [-30, HGT - 1, z0 + 140]]);
    const flick = light * (0.75 + 0.25 * Math.sin(t * 40 + i * 2.1)) * (random(`lf${i}${Math.floor(t * 8)}`) > 0.06 ? 1 : 0.3);
    if (lamp) {
      const c = proj(cam, 0, HGT, z0 + 100);
      push(z1 + 4998, <g key={`l${i}`}>
        <ellipse cx={c.x} cy={c.y + 40 * c.k} rx={260 * c.k} ry={160 * c.k} fill="#dfeeff" opacity={0.16 * flick} />
        <polygon points={lamp} fill={`rgba(240,250,255,${0.25 + 0.75 * flick})`} />
      </g>);
    }
    // сиденья (спинки поперёк вагона)
    [-1, 1].forEach((s) => {
      [40, 140].forEach((oz) => {
        const z = z0 + oz;
        if (z < cam.z + 3) return;
        const d = z - cam.z;
        const back = quad(cam, [[s * HALF, 0, z], [s * 35, 0, z], [s * 35, 105, z], [s * HALF, 105, z]]);
        const seat = quad(cam, [[s * HALF, 45, z], [s * 35, 45, z], [s * 35, 45, Math.max(z - 55, cam.z + 3)], [s * HALF, 45, Math.max(z - 55, cam.z + 3)]]);
        if (seat) push(z + 1, <polygon key={`st${i}${s}${oz}`} points={seat} fill={fog("#5e3826", d, dark)} stroke={INK} strokeWidth="2" />);
        if (back) push(z, <polygon key={`b${i}${s}${oz}`} points={back} fill={fog("#6e4029", d, dark)} stroke={INK} strokeWidth="3" />);
      });
    });
    // поручень-стойка
    if (z0 + 100 > cam.z + 3) {
      const a = proj(cam, 30, 0, z0 + 100);
      const b = proj(cam, 30, HGT, z0 + 100);
      push(z0 + 100, <line key={`p${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={fog("#c8d0d6", z0 + 100 - cam.z, dark)} strokeWidth={Math.max(1.5, 6 * a.k)} />);
    }
  }

  // торцевая дверь со стеклом (передний конец)
  const zEnd = WAGON_LEN;
  const door = quad(cam, [[-HALF, 0, zEnd], [HALF, 0, zEnd], [HALF, HGT, zEnd], [-HALF, HGT, zEnd]]);
  const glass = proj(cam, -40, 200, zEnd);
  const glass2 = proj(cam, 40, 80, zEnd);
  if (door)
    push(
      zEnd + 6000,
      <g key="door">
        <polygon points={door} fill={fog("#33444c", zEnd - cam.z, dark)} stroke={INK} strokeWidth="4" />
        <svg x={glass.x} y={glass.y} width={glass2.x - glass.x} height={glass2.y - glass.y} viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice">
          <rect width="400" height="600" fill="#05070b" />
          {beyond}
        </svg>
        <rect x={glass.x} y={glass.y} width={glass2.x - glass.x} height={glass2.y - glass.y} fill="none" stroke={INK} strokeWidth={Math.max(2, 10 * glass.k)} />
      </g>,
    );

  actors.forEach((a, i) => {
    if (a.z < cam.z + 10) return;
    const p = proj(cam, a.x, 0, a.z);
    push(a.z, <g key={`a${i}`}>{a.node(p)}</g>);
  });

  items.sort((a, b) => b.z - a.z);
  return (
    <Svg>
      <rect width={1080} height={1920} fill="#05070b" />
      <g transform={`rotate(${cam.roll ?? 0} 540 960)`}>{items.map((i) => i.el)}</g>
    </Svg>
  );
};

/**
 * Существо: слишком длинные руки и ноги, тонкие пальцы, пасть с острыми зубами.
 * Рисуется в своей системе 400×600 (для стекла двери) или в любом масштабе через transform.
 */
export const Creature = ({ t, x = 200, y = 300, s = 1, flash = 1, lunge = 0 }: { t: number; x?: number; y?: number; s?: number; flash?: number; lunge?: number }) => {
  const sway = Math.sin(t * 1.7) * 6;
  const jaw = 30 + lunge * 50 + Math.abs(Math.sin(t * 5)) * 8;
  const teeth = (n: number, y0: number, dir: 1 | -1, w: number) =>
    Array.from({ length: n }, (_, i) => {
      const x0 = -w / 2 + (i * w) / n;
      return <path key={i} d={`M${x0} ${y0} L${x0 + w / n / 2} ${y0 + dir * (26 + (i % 2) * 14)} L${x0 + w / n} ${y0} Z`} fill="#efe6cf" stroke={INK} strokeWidth="2" />;
    });
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={flash}>
      {/* длинные руки по потолку и поручням */}
      <g stroke="#0d0d10" strokeLinecap="round" fill="none">
        <path d={`M-30 -60 C-120 -200 -200 -260 -260 ${-330 + sway}`} strokeWidth="18" />
        <path d={`M30 -60 C140 -180 220 -250 280 ${-320 - sway}`} strokeWidth="18" />
        <path d={`M-260 ${-330 + sway} l-40 -30 M-260 ${-330 + sway} l-50 -5 M-260 ${-330 + sway} l-30 -45`} strokeWidth="7" />
        <path d={`M280 ${-320 - sway} l45 -25 M280 ${-320 - sway} l50 5 M280 ${-320 - sway} l30 -45`} strokeWidth="7" />
        {/* ноги, согнутые как у паука */}
        <path d="M-20 80 C-110 120 -160 220 -150 330" strokeWidth="20" />
        <path d="M20 80 C120 130 170 220 160 330" strokeWidth="20" />
      </g>
      {/* тело: узкое, выгнутое */}
      <path d="M-45 -70 C-60 0 -40 70 -20 90 L20 90 C40 70 60 0 45 -70 C30 -100 -30 -100 -45 -70 Z" fill="#141418" stroke="#000" strokeWidth="4" />
      {Array.from({ length: 5 }, (_, i) => (
        <path key={i} d={`M-35 ${-40 + i * 22} C-10 ${-34 + i * 22} 10 ${-34 + i * 22} 35 ${-40 + i * 22}`} stroke="#2a2a30" strokeWidth="4" fill="none" />
      ))}
      {/* голова и пасть */}
      <g transform={`translate(0 ${-130 - lunge * 20}) scale(${1 + lunge * 0.6})`}>
        <ellipse cx="0" cy="0" rx="62" ry="70" fill="#1a1a1f" stroke="#000" strokeWidth="5" />
        <circle cx="-24" cy="-22" r="7" fill="#f2f2e0" />
        <circle cx="24" cy="-22" r="7" fill="#f2f2e0" />
        <path d={`M-52 10 C-30 ${10 + jaw} 30 ${10 + jaw} 52 10 Z`} fill="#3a0f12" stroke="#000" strokeWidth="4" />
        <g>{teeth(9, 10, 1, 100)}</g>
        <g transform={`translate(0 ${jaw * 0.75})`}>{teeth(8, 10, -1, 88)}</g>
      </g>
    </g>
  );
};
