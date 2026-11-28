import React from "react";

const rnd = (i: number) => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/** Морозный узор из угла: ветвящиеся процедурные иглы. */
const FrostCorner = ({ x, y, sx, sy, k, seed }: { x: number; y: number; sx: number; sy: number; k: number; seed: number }) => {
  const paths: string[] = [];
  const grow = (px: number, py: number, a: number, len: number, depth: number, id: number) => {
    if (depth > 3 || len < 12) return;
    const nx = px + Math.cos(a) * len * k;
    const ny = py + Math.sin(a) * len * k;
    paths.push(`M${px} ${py} L${nx} ${ny}`);
    for (let b = 0; b < 3; b++) grow(nx, ny, a + (rnd(id * 7 + b + seed) - 0.5) * 1.6, len * 0.62, depth + 1, id * 3 + b + 1);
  };
  for (let i = 0; i < 6; i++) grow(0, 0, (i / 6) * (Math.PI / 2) + 0.1, 150 + rnd(i + seed) * 90, 0, i + seed);
  return (
    <g transform={`translate(${x} ${y}) scale(${sx} ${sy})`} opacity={Math.min(1, k * 1.4)}>
      <path d={paths.join(" ")} stroke="#e9f7ff" strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.8} />
      <path d={paths.join(" ")} stroke="#7fc4f0" strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.18} />
    </g>
  );
};

/** 4 слоя холода: туман по полу, морозные узоры по углам, снег на 3 планах, клубы пара изо рта. */
export const ArcticFrostVFX = ({ k, t, breath = [] }: { k: number; t: number; breath?: [number, number, number][] }) => {
  if (k <= 0.01) return null;
  return (
    <g pointerEvents="none">
      <defs>
        <filter id="afB3" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={3} /></filter>
        <filter id="afFog" x="-30%" y="-80%" width="160%" height="260%"><feGaussianBlur stdDeviation={22} /></filter>
      </defs>
      {/* (1) ледяной туман вдоль плинтуса */}
      <g filter="url(#afFog)" opacity={0.75 * k}>
        {Array.from({ length: 9 }, (_, i) => <ellipse key={i} cx={((rnd(i) * 1300 + t * 40 * (0.6 + rnd(i + 3))) % 1300) - 110} cy={1430 + (rnd(i + 5) - 0.5) * 50} rx={170 + rnd(i + 2) * 90} ry={42 + rnd(i + 7) * 20} fill="#e6f5ff" />)}
      </g>
      {/* (2) морозные узоры по углам */}
      <FrostCorner x={0} y={0} sx={1} sy={1} k={k} seed={1} />
      <FrostCorner x={1080} y={0} sx={-1} sy={1} k={k} seed={9} />
      <FrostCorner x={0} y={1920} sx={1} sy={-1} k={k} seed={17} />
      <FrostCorner x={1080} y={1920} sx={-1} sy={-1} k={k} seed={23} />
      {/* (3) снежинки на 3 планах */}
      {[0, 1, 2].map((plane) => (
        <g key={plane} filter={plane === 2 ? "url(#afB3)" : undefined} opacity={k * (plane === 0 ? 0.55 : plane === 1 ? 0.8 : 0.9)}>
          {Array.from({ length: plane === 2 ? 14 : 34 }, (_, i) => {
            const sp = (plane + 1) * 90;
            const id = plane * 100 + i;
            const xx = ((rnd(id) * 1180 + t * sp * 1.3 * (0.5 + rnd(id + 1))) % 1180) - 50;
            const yy = ((rnd(id + 2) * 1960 + t * sp * (0.7 + rnd(id + 3))) % 1960) - 20;
            return <circle key={i} cx={xx} cy={yy} r={(plane + 1) * 2.2 + rnd(id + 4) * 3} fill="#fff" />;
          })}
        </g>
      ))}
      {/* (4) клубы пара изо рта на выдохе */}
      {breath.map(([bx, by, ph], i) => {
        const c = ((t + ph) % 2.4) / 2.4;
        if (c > 0.55) return null;
        const u = c / 0.55;
        return <ellipse key={i} cx={bx + u * 46} cy={by - u * 26} rx={14 + u * 36} ry={10 + u * 22} fill="#ffffff" opacity={(1 - u) * 0.55 * k} filter="url(#afB3)" />;
      })}
    </g>
  );
};

/** Impact-кадр: радиальные линии скорости поверх ч/б контраста (ч/б делает обёртка). */
export const ImpactFrameVFX = ({ cx, cy, seed }: { cx: number; cy: number; seed: number }) => (
  <g pointerEvents="none">
    <rect width={1080} height={1920} fill="#fff" opacity={0.25} />
    {Array.from({ length: 64 }, (_, i) => {
      const a = (i / 64) * Math.PI * 2 + rnd(i + seed) * 0.05;
      const r0 = 140 + rnd(i + seed * 3) * 160;
      const r1 = 1500;
      const w = 4 + rnd(i + seed * 5) * 14;
      return <path key={i} d={`M${cx + Math.cos(a) * r0} ${cy + Math.sin(a) * r0} L${cx + Math.cos(a + 0.012) * r1} ${cy + Math.sin(a + 0.012) * r1} L${cx + Math.cos(a - 0.012) * r1} ${cy + Math.sin(a - 0.012) * r1} Z`} fill="#000" opacity={0.85} strokeWidth={w} />;
    })}
  </g>
);

/** Искрящийся счётчик: ветвящиеся молнии с двойным свечением (blur + screen), искры с гравитацией, оранжевые блики. */
export const SparkingMeterVFX = ({ x, y, t, k, frame }: { x: number; y: number; t: number; k: number; frame: number }) => {
  if (k <= 0.01) return null;
  const bolts: string[] = [];
  const bolt = (px: number, py: number, a: number, len: number, depth: number, id: number) => {
    let cx = px;
    let cy = py;
    let d = `M${cx} ${cy}`;
    const n = 5;
    for (let i = 0; i < n; i++) {
      const aa = a + (rnd(id * 13 + i + frame * 3) - 0.5) * 1.2;
      cx += Math.cos(aa) * (len / n);
      cy += Math.sin(aa) * (len / n);
      d += ` L${cx} ${cy}`;
      if (depth < 2 && rnd(id * 17 + i + frame) > 0.7) bolt(cx, cy, aa + (rnd(id + i + frame) - 0.5) * 1.8, len * 0.5, depth + 1, id * 5 + i + 1);
    }
    bolts.push(d);
  };
  const on = rnd(frame * 7) > 0.35;
  if (on) for (let b = 0; b < 3; b++) bolt(x, y, rnd(b + frame) * Math.PI * 2, 120 + rnd(b * 3 + frame) * 120, 0, b + 1);
  return (
    <g pointerEvents="none" opacity={k}>
      <defs>
        <filter id="smGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={6} result="b1" />
          <feGaussianBlur in="SourceGraphic" stdDeviation={16} result="b2" />
          <feMerge>
            <feMergeNode in="b2" />
            <feMergeNode in="b1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="smWall" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ff9a2e" stopOpacity={0.55} />
          <stop offset="1" stopColor="#ff9a2e" stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={x} cy={y + 60} rx={420} ry={360} fill="url(#smWall)" opacity={on ? 0.9 : 0.4} style={{ mixBlendMode: "screen" }} />
      <g filter="url(#smGlow)" style={{ mixBlendMode: "screen" }}>
        {bolts.map((d, i) => <path key={i} d={d} stroke={i % 2 ? "#bfe3ff" : "#ffffff"} strokeWidth={i < 3 ? 5 : 3} fill="none" strokeLinejoin="round" />)}
      </g>
      {Array.from({ length: 30 }, (_, i) => {
        const life = 1.1;
        const ph = (t + rnd(i) * life) % life;
        const vx = (rnd(i + 3) - 0.5) * 520;
        const vy = -rnd(i + 5) * 380;
        const px = x + vx * ph;
        const py = y + vy * ph + 900 * ph * ph;
        return <circle key={i} cx={px} cy={py} r={3 + rnd(i + 7) * 3} fill={i % 3 ? "#ffb347" : "#fff3c4"} opacity={1 - ph / life} />;
      })}
    </g>
  );
};
