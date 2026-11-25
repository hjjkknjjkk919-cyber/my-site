import React from "react";
import { AbsoluteFill, random, Sequence } from "remotion";
import { clamp, ease, Finish, INK, Svg, useT } from "../components/fx";
import { DIMA as DIMA_BASE, Hero, onGround } from "../components/Hero";

/**
 * Пробные кадры «лес ночью»: плоская рисовка, но настоящее 3D-пространство.
 * Деревья стоят в мире (x, z), камера движется, всё проецируется перспективой:
 * ближние стволы крупнее и проносятся быстрее, дальние тонут в тумане.
 */

const DIMA: typeof DIMA_BASE = { ...DIMA_BASE, legs: 1.45 };
const W = 1080;
const H = 1920;
const FOCAL = 900; // «фокусное расстояние» камеры
const HORIZON = 900; // линия горизонта на экране

type Cam3 = { x: number; y: number; z: number; tilt?: number };

/** Проекция точки мира на экран. y — высота над землёй (вверх положительно). */
const project = (cam: Cam3, x: number, y: number, z: number) => {
  const dz = z - cam.z;
  const k = FOCAL / dz;
  return { sx: W / 2 + (x - cam.x) * k, sy: HORIZON + (cam.y - y) * k + (cam.tilt ?? 0), k, dz };
};

// лес: деревья в шахматном порядке вдоль тропы (тропа идёт по оси z, x≈0)
const TREES = Array.from({ length: 140 }, (_, i) => {
  const side = i % 2 ? 1 : -1;
  const x = side * (180 + random(`tx${i}`) * 900);
  const z = -200 + i * 38 + random(`tz${i}`) * 30;
  return { x, z, h: 900 + random(`th${i}`) * 700, w: 0.8 + random(`tw${i}`) * 0.5, seed: i };
});

const FOG = [18, 30, 52];
const fogMix = (base: number[], depth: number) => {
  const f = clamp((depth - 300) / 3200);
  return `rgb(${base.map((v, i) => Math.round(v + (FOG[i] - v) * f)).join(",")})`;
};

/** Ель силуэтом: ствол + ярусы лап, с лунным краем справа и снегом на лапах. */
const Spruce = ({ sx, sy, k, h, w, depth, seed }: { sx: number; sy: number; k: number; h: number; w: number; depth: number; seed: number }) => {
  const hh = h * k;
  const ww = 260 * w * k;
  const col = fogMix([8, 14, 22], depth);
  const rim = clamp(1 - depth / 2600) * 0.55;
  const tiers = 6;
  return (
    <g>
      <rect x={sx - 14 * k} y={sy - hh * 0.25} width={28 * k} height={hh * 0.25} fill={col} />
      {Array.from({ length: tiers }, (_, i) => {
        const ty = sy - hh * (0.15 + i * 0.14);
        const tw = ww * (1 - i * 0.14);
        const th = hh * 0.26;
        const jag = (random(`j${seed}${i}`) - 0.5) * 20 * k;
        return (
          <g key={i}>
            <path d={`M${sx} ${ty - th} L${sx + tw / 2 + jag} ${ty} L${sx - tw / 2 - jag} ${ty} Z`} fill={col} />
            {/* лунный край */}
            <path d={`M${sx} ${ty - th} L${sx + tw / 2 + jag} ${ty}`} stroke="#9fb8d8" strokeWidth={Math.max(1, 3 * k)} opacity={rim} />
            {/* снег на лапах */}
            <path d={`M${sx - tw * 0.38} ${ty - 2 * k} Q${sx} ${ty - th * 0.18} ${sx + tw * 0.4} ${ty - 2 * k}`} stroke="#dfe9f5" strokeWidth={Math.max(1, 6 * k)} fill="none" opacity={0.5 * (1 - depth / 4000)} />
          </g>
        );
      })}
    </g>
  );
};

/** Небо, луна, земля со снегом; горизонт слегка «дышит» вместе с камерой. */
const Backdrop = ({ cam, t }: { cam: Cam3; t: number }) => {
  const hy = HORIZON + (cam.tilt ?? 0);
  return (
    <Svg>
      <defs>
        <linearGradient id="fSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#04070e" />
          <stop offset="1" stopColor="#14223a" />
        </linearGradient>
        <linearGradient id="fGround" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1c2a40" />
          <stop offset="1" stopColor="#5d7390" />
        </linearGradient>
        <radialGradient id="fMoon" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#f4f1e2" stopOpacity="0.55" />
          <stop offset="1" stopColor="#f4f1e2" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={W} height={hy} fill="url(#fSky)" />
      {Array.from({ length: 60 }, (_, i) => (
        <circle key={i} cx={random(`s${i}`) * W} cy={random(`sy${i}`) * hy * 0.8} r={1 + random(`sr${i}`) * 2} fill="#fff" opacity={0.3 + 0.5 * Math.abs(Math.sin(t * (1 + random(`st${i}`)) + i))} />
      ))}
      <circle cx={780 - cam.x * 0.02} cy={hy - 620} r="260" fill="url(#fMoon)" />
      <circle cx={780 - cam.x * 0.02} cy={hy - 620} r="62" fill="#f4f1e2" />
      <rect y={hy} width={W} height={H - hy} fill="url(#fGround)" />
      {/* тропа в перспективе */}
      {(() => {
        const a = project(cam, -120, 0, cam.z + 60);
        const b = project(cam, 120, 0, cam.z + 60);
        const c = project(cam, 60, 0, cam.z + 6000);
        const d = project(cam, -60, 0, cam.z + 6000);
        return <path d={`M${a.sx} ${a.sy} L${b.sx} ${b.sy} L${c.sx} ${c.sy} L${d.sx} ${d.sy} Z`} fill="#8aa3c2" opacity="0.35" />;
      })()}
    </Svg>
  );
};

/** Весь лес + герой, отсортированные по глубине (дальние первыми). */
const World = ({ cam, t, hero }: { cam: Cam3; t: number; hero?: { x: number; z: number; walk: number; look: [number, number]; head: number; flip?: 1 | -1; back?: boolean } }) => {
  const items: { z: number; el: React.ReactNode }[] = [];
  TREES.forEach((tr) => {
    const dz = tr.z - cam.z;
    if (dz < 40 || dz > 4200) return;
    const p = project(cam, tr.x, 0, tr.z);
    if (p.sx < -600 * p.k || p.sx > W + 600 * p.k) return;
    items.push({ z: tr.z, el: <Spruce key={tr.seed} sx={p.sx} sy={p.sy} k={p.k} h={tr.h} w={tr.w} depth={dz} seed={tr.seed} /> });
  });
  if (hero) {
    const p = project(cam, hero.x, 0, hero.z);
    // высота героя в мире ~ 520 единиц → масштаб компонента Hero
    const s = (520 * p.k) / (1140 + 740 * (DIMA.legs ?? 1) + 240);
    items.push({
      z: hero.z,
      el: (
        <g key="hero">
          <ellipse cx={p.sx} cy={p.sy} rx={160 * s * 2.2} ry={26 * s * 2.2} fill="#000" opacity="0.35" />
          <Hero cfg={DIMA} x={p.sx} y={onGround(DIMA, p.sy, s)} s={s} flip={hero.flip ?? 1} t={t} emotion="calm" walk={hero.walk} look={hero.look} headTurn={hero.head} frost={0.6} full wind={0.3} />
          {hero.back && (
            <g transform={`translate(${p.sx} ${onGround(DIMA, p.sy, s) + Math.sin(t * 3.3) * 8 * s}) rotate(${hero.head * 0.6})`}>
              <ellipse cx="0" cy={-10 * s} rx={330 * s} ry={370 * s} fill={DIMA.jacket} stroke={INK} strokeWidth={10 * s} />
              <path d={`M0 ${-370 * s} Q${30 * s} ${-60 * s} 0 ${340 * s}`} stroke={DIMA.shade} strokeWidth={10 * s} fill="none" opacity="0.7" />
              <ellipse cx={-120 * s} cy={-120 * s} rx={90 * s} ry={200 * s} fill="#fff" opacity="0.08" />
              <path d={`M${330 * s} ${-60 * s} A${330 * s} ${370 * s} 0 0 1 ${120 * s} ${330 * s}`} stroke="#9fb8d8" strokeWidth={8 * s} fill="none" opacity="0.5" />
            </g>
          )}
        </g>
      ),
    });
  }
  items.sort((a, b) => b.z - a.z);
  return <Svg>{items.map((i) => i.el)}</Svg>;
};

/** Снег и туман у самой камеры. */
const Air = ({ t, wind = 0.3 }: { t: number; wind?: number }) => (
  <Svg>
    <defs>
      <linearGradient id="fMist" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#2a3c58" stopOpacity="0" />
        <stop offset="0.5" stopColor="#3b5272" stopOpacity="0.35" />
        <stop offset="1" stopColor="#2a3c58" stopOpacity="0" />
      </linearGradient>
    </defs>
    <rect x="-200" y={HORIZON - 260 + Math.sin(t * 0.3) * 20} width={W + 400} height="420" fill="url(#fMist)" />
    {Array.from({ length: 70 }, (_, i) => {
      const sp = 0.15 + random(`a${i}`) * 0.25;
      const ph = (t * sp + random(`b${i}`)) % 1;
      const r = 1.5 + random(`c${i}`) * 4;
      return <circle key={i} cx={((random(`d${i}`) * W + ph * 300 * wind) % W)} cy={ph * H} r={r} fill="#e8f0fa" opacity={0.5} />;
    })}
  </Svg>
);

// плавный взгляд по сторонам: медленные синусы, без рывков
const smoothLook = (t: number): [number, number] => [Math.sin(t * 0.7) * 20 + Math.sin(t * 0.23) * 4, Math.sin(t * 0.4) * 4];
const smoothHead = (t: number) => Math.sin(t * 0.7 - 0.35) * 6;

/** Пробный кадр: он идёт на нас, камера пятится перед ним — от глаз вплотную до леса вокруг. */
const ShotPullBack = () => {
  const t = useT();
  const D = 10;
  const heroZ = 2400 - t * 130;
  const back = ease(t, 0, D, 130, 1300); // расстояние камера–герой
  const cam: Cam3 = {
    x: Math.sin(t * 0.45) * 14,
    y: ease(t, 0, D, 470, 330),
    z: heroZ - back,
    tilt: ease(t, 0, D, -60, 170) + Math.sin(t * 3.4) * 3, // лёгкое покачивание шага
  };
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Backdrop cam={cam} t={t} />
      <World cam={cam} t={t} hero={{ x: 0, z: heroZ, walk: t * 1.05, look: smoothLook(t), head: smoothHead(t), flip: 1 }} />
      <Air t={t} />
      <Finish vig={1} tint="#1b3350" tintOpacity={0.15} grain={1} bigSnow={false} />
    </AbsoluteFill>
  );
};

/** 2. Камера едет вбок, он идёт по диагонали; ближние стволы проносятся между нами. */
const NEAR = Array.from({ length: 14 }, (_, i) => ({ x: -500 + i * 230, z: 0, seed: 500 + i }));
const ShotTracking = () => {
  const t = useT();
  const heroZ = 1500 - t * 90;
  const heroX = -150 + t * 40;
  const cam: Cam3 = { x: -200 + t * 120, y: 360, z: heroZ - 900, tilt: 300 + Math.sin(t * 3.4) * 2 };
  const near = NEAR.map((n) => {
    const z = cam.z + 170 + (n.seed % 3) * 40;
    const p = project(cam, n.x, 0, z);
    return <Spruce key={n.seed} sx={p.sx} sy={p.sy + 300} k={p.k} h={1700} w={1.1} depth={60} seed={n.seed} />;
  });
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Backdrop cam={cam} t={t} />
      <World cam={cam} t={t} hero={{ x: heroX, z: heroZ, walk: t * 1.1, look: smoothLook(t + 2), head: smoothHead(t + 2), flip: 1 }} />
      <Svg>{near}</Svg>
      <Air t={t} wind={-0.4} />
      <Finish vig={1} tint="#1b3350" tintOpacity={0.15} grain={1} bigSnow={false} />
    </AbsoluteFill>
  );
};

/** 3. Камера идёт за ним в глубину: деревья надвигаются и расходятся по сторонам. */
const ShotFollow = () => {
  const t = useT();
  const heroZ = 500 + t * 150;
  const cam: Cam3 = { x: Math.sin(t * 0.6) * 30, y: 420, z: heroZ - 520, tilt: 200 + Math.sin(t * 3.4) * 4 };
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Backdrop cam={cam} t={t} />
      {/* лунный луч сквозь кроны */}
      <Svg>
        <path d="M760 0 L560 1500 L900 1500 L1000 0 Z" fill="#cfe0ff" opacity={0.07 + 0.03 * Math.sin(t)} />
      </Svg>
      <World cam={cam} t={t} hero={{ x: Math.sin(t * 0.4) * 20, z: heroZ, walk: t * 1.1, look: smoothLook(t), head: smoothHead(t), flip: 1, back: true }} />
      <Air t={t} />
      <Finish vig={1} tint="#1b3350" tintOpacity={0.15} grain={1} bigSnow={false} />
    </AbsoluteFill>
  );
};

export const FOREST_FRAMES = 300;
export const ForestTest = () => <ShotPullBack />;

export { INK };
