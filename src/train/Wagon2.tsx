import React from "react";
import { random } from "remotion";
import { clamp, Svg } from "../components/fx";

/**
 * Вагон электрички в 3D, стиль «Гость»: мягкие плоские цвета, тёмный контур, приглушённый свет.
 * Мир в сантиметрах: x поперёк (−160..160), y вверх от пола, z вдоль вагона (0..LEN; в конце — дверь со стеклом).
 * Скамейки друг напротив друга, полки для сумок, длинные лампы, окна (снаружи проносятся огни).
 */
export const LEN = 2600;
const HALF = 160;
const HGT = 250;
const FOCAL = 900;
const LINE = "#241b18";

export type Cam = { x: number; y: number; z: number; roll?: number; pitch?: number };

export const proj = (c: Cam, x: number, y: number, z: number) => {
  const dz = Math.max(z - c.z, 1);
  const k = FOCAL / dz;
  return { x: 540 + (x - c.x) * k, y: 960 - (y - c.y) * k + (c.pitch ?? 0), k, dz };
};

/** Затемнение к глубине и при мигании лампы. */
const shade = (hex: string, depth: number, light: number) => {
  const f = clamp(depth / 2000) * 0.85 + (1 - light) * 0.55 + 0.12;
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  const to = [10, 12, 16];
  return `rgb(${c.map((v, i) => Math.round(v + (to[i] - v) * f)).join(",")})`;
};

type Item = { z: number; el: React.ReactNode };

export type Actor = { z: number; draw: (cam: Cam) => React.ReactNode };

export const Wagon2 = ({ cam, t, light = 1, beyond, actors = [] }: { cam: Cam; t: number; light?: number; beyond?: React.ReactNode; actors?: Actor[] }) => {
  const items: Item[] = [];
  const add = (z: number, el: React.ReactNode) => items.push({ z, el });
  const near = cam.z + 4;
  const poly = (pts: [number, number, number][], fill: string, key: string, z: number, stroke = true, sw = 3) => {
    const cl = pts.map(([x, y, zz]) => [x, y, Math.max(zz, near)] as [number, number, number]);
    if (pts.every(([, , zz]) => zz < near)) return;
    const p = cl.map(([x, y, zz]) => proj(cam, x, y, zz));
    add(z, <polygon key={key} points={p.map((q) => `${q.x},${q.y}`).join(" ")} fill={fill} stroke={stroke ? LINE : "none"} strokeWidth={sw} strokeLinejoin="round" />);
  };
  // проносящийся снаружи фонарь: идёт назад вдоль вагона
  const passZ = LEN - ((t * 900) % (LEN + 1400));

  const SEC = 260;
  for (let i = 0; i * SEC < LEN; i++) {
    const z0 = i * SEC;
    const z1 = z0 + SEC;
    if (z1 < near) continue;
    const d = (z0 + z1) / 2 - cam.z;
    // пол (линолеум) + центральная дорожка
    poly([[-HALF, 0, z0], [HALF, 0, z0], [HALF, 0, z1], [-HALF, 0, z1]], shade("#4a4038", d, light), `f${i}`, 1e6 - z0, false);
    poly([[-38, 0.5, z0], [38, 0.5, z0], [38, 0.5, z1], [-38, 0.5, z1]], shade("#5a3d33", d, light), `fr${i}`, 1e6 - z0 - 1, false);
    // потолок
    poly([[-HALF, HGT, z0], [HALF, HGT, z0], [HALF, HGT, z1], [-HALF, HGT, z1]], shade("#5c625f", d, light), `c${i}`, 1e6 - z0, false);
    // длинная лампа + свечение
    const lampOn = light * (random(`lmp${i}${Math.floor(t * 6)}`) > 0.04 ? 1 : 0.2);
    poly([[-9, HGT - 1, z0 + 70], [9, HGT - 1, z0 + 70], [9, HGT - 1, z1 - 70], [-9, HGT - 1, z1 - 70]], `rgba(235,225,200,${0.15 + 0.45 * lampOn})`, `l${i}`, 1e6 - z0 - 2, true, 2);
    if (z0 + 130 > near) {
      const c = proj(cam, 0, HGT - 60, z0 + 130);
      add(1e6 - z0 - 3, <ellipse key={`lg${i}`} cx={c.x} cy={c.y} rx={220 * c.k} ry={130 * c.k} fill="#ffe9c4" opacity={0.08 * lampOn} />);
    }
    [-1, 1].forEach((s) => {
      // стена
      poly([[s * HALF, 0, z0], [s * HALF, HGT, z0], [s * HALF, HGT, z1], [s * HALF, 0, z1]], shade("#4f5b58", d, light), `w${i}${s}`, 1e6 - z0 - 5, false);
      // нижняя панель стены (темнее)
      poly([[s * HALF, 0, z0], [s * HALF, 95, z0], [s * HALF, 95, z1], [s * HALF, 0, z1]], shade("#4e5a58", d, light), `wp${i}${s}`, 1e6 - z0 - 6, false);
      // окно с огнями снаружи
      const near2 = Math.abs(passZ - (z0 + SEC / 2)) < 180;
      const wfill = near2 ? shade("#e8c98c", d, light * 0.9) : shade("#0b0f15", d, 1);
      poly([[s * HALF - s * 0.5, 110, z0 + 30], [s * HALF - s * 0.5, 205, z0 + 30], [s * HALF - s * 0.5, 205, z1 - 30], [s * HALF - s * 0.5, 110, z1 - 30]], wfill, `win${i}${s}`, 1e6 - z0 - 7, true, 4);
      // полка для сумок
      poly([[s * HALF, 212, z0 + 10], [s * 105, 212, z0 + 10], [s * 105, 212, z1 - 10], [s * HALF, 212, z1 - 10]], shade("#9aa3a6", d, light), `rk${i}${s}`, z0 + 20, true, 2);
      // скамейки: две, лицом друг к другу
      [z0 + 20, z1 - 20].forEach((bz, j) => {
        const dir = j === 0 ? 1 : -1; // спинка у края секции, сиденье внутрь
        const back0 = bz;
        const front = bz + dir * 55;
        const dd = bz - cam.z;
        // сиденье (подушка)
        poly([[s * HALF, 46, back0], [s * 42, 46, back0], [s * 42, 46, front], [s * HALF, 46, front]], shade("#8b4f36", dd, light), `st${i}${s}${j}`, Math.min(back0, front) + 3, true, 3);
        // передняя грань сиденья
        poly([[s * HALF, 46, front], [s * 42, 46, front], [s * 42, 20, front], [s * HALF, 20, front]], shade("#6d3c28", dd, light), `sf${i}${s}${j}`, Math.min(back0, front) + 2, true, 3);
        // спинка
        poly([[s * HALF, 46, back0], [s * 42, 46, back0], [s * 46, 118, back0 - dir * 8], [s * HALF, 118, back0 - dir * 8]], shade("#9a5a3e", dd, light), `bk${i}${s}${j}`, back0 + (dir > 0 ? -1 : 1) * 2, true, 3);
        // кант спинки
        poly([[s * HALF, 118, back0 - dir * 8], [s * 46, 118, back0 - dir * 8], [s * 46, 124, back0 - dir * 12], [s * HALF, 124, back0 - dir * 12]], shade("#c8cdd0", dd, light), `bt${i}${s}${j}`, back0 - 1, true, 2);
      });
    });
    // поручни-стойки у прохода
    if (z0 + SEC / 2 > near) {
      [-40, 40].forEach((x) => {
        const a = proj(cam, x, 0, z0 + SEC / 2);
        const b = proj(cam, x, HGT, z0 + SEC / 2);
        add(z0 + SEC / 2, <line key={`p${i}${x}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={shade("#cfd6da", d, light)} strokeWidth={Math.max(1.5, 4 * a.k)} />);
      });
    }
  }

  // торцевая дверь со стеклом
  const dz = LEN - cam.z;
  poly([[-HALF, 0, LEN], [HALF, 0, LEN], [HALF, HGT, LEN], [-HALF, HGT, LEN]], shade("#5f6e70", dz, light), "endwall", 3e6, false);
  poly([[-55, 0, LEN - 1], [55, 0, LEN - 1], [55, 215, LEN - 1], [-55, 215, LEN - 1]], shade("#7d8b8e", dz, light), "door", 3e6 - 1, true, 5);
  const g0 = proj(cam, -38, 200, LEN - 2);
  const g1 = proj(cam, 38, 95, LEN - 2);
  add(
    3e6 - 2,
    <g key="glass">
      <svg x={g0.x} y={g0.y} width={g1.x - g0.x} height={g1.y - g0.y} viewBox="0 0 400 600" preserveAspectRatio="none">
        <rect width="400" height="600" fill="#05070a" />
        {beyond}
        <rect width="400" height="600" fill="url(#w2shine)" />
      </svg>
      <rect x={g0.x} y={g0.y} width={g1.x - g0.x} height={g1.y - g0.y} fill="none" stroke={LINE} strokeWidth={Math.max(2, 6 * g0.k)} rx={4 * g0.k} />
    </g>,
  );

  actors.forEach((a, i) => {
    if (a.z > near) add(a.z, <g key={`a${i}`}>{a.draw(cam)}</g>);
  });

  items.sort((a, b) => b.z - a.z);
  return (
    <Svg>
      <defs>
        <linearGradient id="w2shine" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.12" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width={1080} height={1920} fill="#0a0c10" />
      <g transform={`rotate(${cam.roll ?? 0} 540 960)`}>{items.map((i) => i.el)}</g>
    </Svg>
  );
};
