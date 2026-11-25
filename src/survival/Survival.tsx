import React from "react";
import { AbsoluteFill, interpolate, random, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/google-fonts/Montserrat";
import { clamp, ease, Finish, INK, shake, Snow, Svg, useT } from "../components/fx";
import { DIMA as DIMA_BASE, GENA, Hero, LERA, onGround, STAS } from "../components/Hero";

// Дима здесь выше ростом: длиннее ноги
const DIMA: typeof DIMA_BASE = { ...DIMA_BASE, legs: 1.45 };
import { Sfx } from "../components/audio";
import voice from "./voice.json";

/**
 * Отдельный ролик «Один на 6000 метров». Дима сам рассказывает от первого лица,
 * кадр меняется на каждой фразе, много вида «из глаз» — руки в варежках у камеры.
 */

const { fontFamily: MONT } = loadFont("normal", { weights: ["800"], subsets: ["cyrillic", "latin"] });
const ORANGE = "#ff8a1f";
const GREEN = "#3fd17a";
const RED = "#ff2b3a";
const JACKET = "#2f5f9e";
const MITT = "#2a2f35";
const L = { strokeLinecap: "round", strokeLinejoin: "round" } as const;
type V = { text: string; start: number; end: number };
const VO = voice as Record<string, V>;
/**
 * Небо и горы. dawn 0 — глухая ночь, 1 — рассвет. fog — мгла метели.
 * aurora 0..1 — северное сияние; ночью ещё Млечный путь, падающие звёзды, дымка между хребтами, блики на снегу.
 */
const Sky = ({ t, dawn = 0, fog = 0, cam = 0, aurora = 0 }: { t: number; dawn?: number; fog?: number; cam?: number; aurora?: number }) => {
  const mix = (a: number[], b: number[]) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * dawn)).join(",")})`;
  const top = mix([6, 12, 28], [46, 78, 140]);
  const mid = mix([22, 40, 72], [236, 150, 128]);
  const low = mix([40, 66, 104], [255, 210, 150]);
  const far2 = mix([40, 58, 88], [150, 140, 175]);
  const far = mix([48, 68, 100], [108, 112, 152]);
  const near = mix([26, 38, 60], [72, 78, 118]);
  const night = (1 - dawn) * (1 - fog);
  const au = aurora * night;
  // падающая звезда раз в ~3.5 с
  const sp = (t % 3.5) / 0.5;
  const sx = 900 - random(`ssx${Math.floor(t / 3.5)}`) * 500;
  const sy = 120 + random(`ssy${Math.floor(t / 3.5)}`) * 300;
  const wave = (k: number, amp: number, base: number) =>
    Array.from({ length: 13 }, (_, i) => {
      const x = -100 + i * 110;
      const y = base + Math.sin(i * 0.7 + t * (0.6 + k * 0.2) + k) * amp + Math.sin(i * 1.9 - t * 0.9) * amp * 0.3;
      return `${i === 0 ? "M" : "L"}${x} ${y}`;
    }).join(" ");
  return (
    <Svg>
      <defs>
        <linearGradient id="svSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="0.45" stopColor={mid} />
          <stop offset="0.62" stopColor={low} />
        </linearGradient>
        <linearGradient id="svAu1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a35cff" stopOpacity="0" />
          <stop offset="0.45" stopColor="#7cffb2" stopOpacity="0.85" />
          <stop offset="1" stopColor="#2affc6" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="svAu2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff5ad1" stopOpacity="0" />
          <stop offset="0.5" stopColor="#8a7dff" stopOpacity="0.7" />
          <stop offset="1" stopColor="#4fe3ff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="svRay" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff2c8" stopOpacity="0.5" />
          <stop offset="1" stopColor="#fff2c8" stopOpacity="0" />
        </linearGradient>
        <filter id="svSoft" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
        <filter id="svSoft2" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="50" />
        </filter>
      </defs>
      <rect width={1080} height={1920} fill="url(#svSky)" />
      {/* Млечный путь: светлая диагональная полоса и густые мелкие звёзды */}
      <g opacity={night * 0.9}>
        <path d="M-200 900 C200 500 700 250 1300 -100 L1300 200 C800 450 300 750 -200 1150 Z" fill="#b9c8ff" opacity="0.13" filter="url(#svSoft2)" />
        {Array.from({ length: 90 }, (_, i) => {
          const u = random(`mw${i}`);
          const off = (random(`mo${i}`) - 0.5) * 260;
          return <circle key={i} cx={-100 + u * 1300} cy={950 - u * 1000 + off} r={0.8 + random(`mr${i}`) * 1.6} fill="#fff" opacity={0.35 + 0.4 * random(`mq${i}`)} />;
        })}
      </g>
      {/* яркие звёзды с мерцанием */}
      <g fill="#fff" opacity={night}>
        {Array.from({ length: 55 }, (_, i) => (
          <circle key={i} cx={random(`sx${i}`) * 1080} cy={random(`sy${i}`) * 900} r={1.4 + random(`sr${i}`) * 2.6} opacity={0.35 + 0.65 * Math.abs(Math.sin(t * (1 + random(`st${i}`) * 3) + i))} />
        ))}
        {[0, 1, 2, 3].map((i) => {
          const x = 120 + random(`bx${i}`) * 840;
          const y = 80 + random(`by${i}`) * 500;
          const k = 0.6 + 0.4 * Math.sin(t * 2 + i);
          return <path key={i} d={`M${x - 22 * k} ${y} L${x + 22 * k} ${y} M${x} ${y - 22 * k} L${x} ${y + 22 * k}`} stroke="#fff" strokeWidth="2.5" opacity="0.8" />;
        })}
      </g>
      {/* падающая звезда */}
      {sp < 1 && night > 0.3 && <path d={`M${sx - sp * 260} ${sy + sp * 130} l 160 -80`} stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity={(1 - sp) * night} />}
      {/* северное сияние: две волнистые ленты */}
      {au > 0.01 && (
        <g opacity={Math.min(1, au * 1.3)} style={{ mixBlendMode: "screen" }} filter="url(#svSoft)" transform="translate(0 -260) scale(1 1.7)">
          <path d={`${wave(0, 70, 260)} L1300 620 L-100 620 Z`} fill="url(#svAu1)" transform="translate(0 -40)" />
          <path d={`${wave(1, 90, 380)} L1300 760 L-100 760 Z`} fill="url(#svAu2)" opacity="0.8" />
          <path d={`${wave(2, 50, 200)} L1300 480 L-100 480 Z`} fill="url(#svAu1)" opacity="0.6" />
        </g>
      )}
      {/* луна с ореолом */}
      <circle cx="250" cy="330" r="200" fill="#cfe0ff" opacity={(1 - dawn) * 0.12} filter="url(#svSoft2)" />
      <circle cx="250" cy="330" r="70" fill="#f6f3e6" opacity={(1 - dawn) * (1 - fog * 0.6)} />
      <circle cx="228" cy="312" r="14" fill="#d8d3c2" opacity={(1 - dawn) * 0.6} />
      <circle cx="275" cy="350" r="9" fill="#d8d3c2" opacity={(1 - dawn) * 0.6} />
      {/* солнце на рассвете и лучи */}
      <circle cx="760" cy={900 - dawn * 260} r="260" fill="#ffd38a" opacity={dawn * 0.45} filter="url(#svSoft2)" />
      <circle cx="760" cy={900 - dawn * 260} r="110" fill="#fff4cf" opacity={dawn * 0.95} />
      {dawn > 0.4 && (
        <g opacity={(dawn - 0.4) * 1.3} style={{ mixBlendMode: "screen" }}>
          {[-50, -28, -8, 12, 34, 58].map((a, i) => (
            <path key={i} d={`M760 ${900 - dawn * 260} L${760 + Math.tan(((a + Math.sin(t * 0.5 + i) * 2) * Math.PI) / 180) * 1800 - 60} 2000 L${760 + Math.tan(((a + Math.sin(t * 0.5 + i) * 2) * Math.PI) / 180) * 1800 + 60} 2000 Z`} fill="url(#svRay)" />
          ))}
        </g>
      )}
      {/* блик объектива от солнца: полоса и кольца */}
      {dawn > 0.3 && (() => {
        const sx0 = 760;
        const sy0 = 900 - dawn * 260;
        const k = (dawn - 0.3) / 0.7;
        return (
          <g style={{ mixBlendMode: "screen" }} opacity={k}>
            <ellipse cx={sx0} cy={sy0} rx="760" ry="7" fill="#bfe1ff" opacity="0.55" />
            <ellipse cx={sx0} cy={sy0} rx="380" ry="3" fill="#fff" opacity="0.7" />
            {[0.45, 0.8, 1.15, 1.6].map((m, i) => (
              <circle key={i} cx={sx0 + (540 - sx0) * m * 2} cy={sy0 + (960 - sy0) * m * 2} r={[60, 26, 110, 44][i]} fill={["#ffcf8a", "#9fe8ff", "#ff9fd6", "#c9ffb0"][i]} opacity="0.13" />
            ))}
          </g>
        );
      })()}
      {/* дальний хребет, тонет в дымке */}
      <g transform={`translate(${cam * 0.08} 0)`} {...L}>
        <path d="M-60 980 L120 760 L260 840 L420 640 L560 760 L760 560 L960 800 L1140 700 L1140 1000 Z" fill={far2} opacity="0.85" />
        <path d="M760 560 L720 640 L760 625 L790 670 L815 610 Z M420 640 L392 700 L430 690 Z" fill="#e8f0f8" opacity="0.6" />
      </g>
      <ellipse cx={540 + Math.sin(t * 0.2) * 80} cy="900" rx="900" ry="80" fill={mix([90, 120, 160], [255, 220, 200])} opacity="0.35" filter="url(#svSoft)" />
      <g transform={`translate(${cam * 0.15} 0)`} filter="url(#rough)" {...L}>
        <path d="M-60 1060 L250 640 L380 760 L600 430 L860 820 L1140 1060 Z" fill={far} stroke={INK} strokeWidth="5" />
        <path d="M600 430 L540 560 L600 530 L640 610 L690 520 Z M250 640 L215 720 L270 700 Z" fill="#eef3f7" opacity={0.9} />
        {/* освещённые солнцем склоны (альпийское зарево) */}
        <path d="M600 430 L860 820 L700 820 L640 600 Z M250 640 L380 760 L300 760 Z" fill="#ffad6b" opacity={dawn * 0.75} />
        <path d="M600 430 L690 520 L640 610 L600 530 Z" fill="#ffe0bf" opacity={dawn * 0.9} />
        {/* лунный край на склонах */}
        <path d="M250 640 L120 820 M600 430 L470 640" stroke="#dfeaff" strokeWidth="5" opacity={(1 - dawn) * 0.45} />
      </g>
      <ellipse cx={540 - Math.sin(t * 0.25) * 120} cy="1100" rx="800" ry="70" fill={mix([110, 140, 180], [255, 230, 215])} opacity="0.4" filter="url(#svSoft)" />
      <g transform={`translate(${cam * 0.35} 0)`} filter="url(#rough)" {...L}>
        <path d="M-100 1200 L180 900 L420 1080 L700 820 L1180 1200 Z" fill={near} stroke={INK} strokeWidth="6" />
        <path d="M700 820 L640 920 L700 900 L740 960 L780 890 Z" fill="#e3ebf1" />
        <path d="M180 900 L60 1040 M700 820 L600 960" stroke="#dfeaff" strokeWidth="5" opacity={(1 - dawn) * 0.4} />
        <path d="M700 820 L1180 1200 L900 1200 L760 960 Z M180 900 L420 1080 L300 1080 Z" fill="#ff9e5e" opacity={dawn * 0.7} />
        <path d="M700 820 L780 890 L740 960 L700 900 Z" fill="#ffd9b0" opacity={dawn * 0.9} />
      </g>
      {/* снежное поле */}
      <path d="M-50 1180 C300 1130 700 1160 1130 1120 V1960 H-50 Z" fill={mix([150, 172, 198], [255, 228, 200])} stroke={INK} strokeWidth="6" />
      <path d="M-50 1190 L520 1190 L-50 1700 Z M300 1200 L700 1180 L120 1960 L-50 1960 Z" fill="#6f7fb8" opacity={dawn * 0.35} />
      <path d="M-50 1400 C350 1360 760 1420 1130 1370 V1960 H-50 Z" fill={mix([176, 196, 218], [255, 244, 236])} opacity="0.8" />
      {/* отражение сияния на снегу */}
      <rect x="0" y="1150" width="1080" height="800" fill="#7cffb2" opacity={au * 0.08} />
      {/* блики на снегу */}
      <g fill="#fff">
        {Array.from({ length: 36 }, (_, i) => {
          const k = Math.max(0, Math.sin(t * (2 + random(`gk${i}`) * 3) + i * 1.7));
          return <circle key={i} cx={random(`gx${i}`) * 1080} cy={1170 + random(`gy${i}`) * 740} r={1.5 + k * 3.5} opacity={k * 0.9} />;
        })}
      </g>
      {/* мгла метели */}
      <rect width={1080} height={1920} fill="#5d7690" opacity={fog * 0.55} />
    </Svg>
  );
};

/** Скала со снежной шапкой. */
const Rock = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#rough)" {...L}>
    <path d="M-260 0 L-220 -260 L-60 -420 L140 -380 L260 -200 L280 0 Z" fill="#3b4656" stroke={INK} strokeWidth="9" />
    <path d="M140 -380 L260 -200 L280 0 L90 0 L120 -220 Z" fill="#000" opacity="0.25" />
    <path d="M-220 -260 L-60 -420 L140 -380 L80 -330 L-20 -350 L-120 -260 Z" fill="#eef3f7" stroke={INK} strokeWidth="6" />
  </g>
);

/** Нора в сугробе: open 0..1 — насколько вырыта. */
const Burrow = ({ x, y, s = 1, open = 1 }: { x: number; y: number; s?: number; open?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} {...L}>
    <path d="M-330 0 C-300 -230 300 -230 330 0 Z" fill="#e8eff5" stroke={INK} strokeWidth="8" />
    <ellipse cx="0" cy="-10" rx={150 * open} ry={120 * open} fill="#141c26" stroke={INK} strokeWidth="6" />
  </g>
);


/** Пар изо рта. */
const Breath = ({ t, x, y, s = 1 }: { t: number; x: number; y: number; s?: number }) => {
  const ph = (t % 2.2) / 2.2;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={Math.sin(ph * Math.PI) * 0.7}>
      <circle cx={ph * 60} cy={-ph * 40} r={18 + ph * 30} fill="#eef4f8" />
      <circle cx={ph * 100} cy={-ph * 70} r={10 + ph * 24} fill="#eef4f8" opacity="0.7" />
    </g>
  );
};

/** Пещера изнутри: тёмные стенки норы вокруг кадра. */
const CaveFrame = ({ glow = 0.4 }: { glow?: number }) => (
  <Svg>
    <defs>
      <radialGradient id="svCave" cx="50%" cy="45%" r="60%">
        <stop offset="0.55" stopColor="#0d141c" stopOpacity="0" />
        <stop offset="1" stopColor="#0d141c" stopOpacity="1" />
      </radialGradient>
    </defs>
    <rect width={1080} height={1920} fill={`rgba(120,150,180,${glow * 0.25})`} />
    <path d="M-20 1960 L-20 700 C40 260 1040 260 1100 700 L1100 1960 Z M80 1960 C60 900 200 450 540 430 C880 450 1020 900 1000 1960 Z" fill="#cfdbe6" fillRule="evenodd" stroke={INK} strokeWidth="8" />
    <rect width={1080} height={1920} fill="url(#svCave)" />
  </Svg>
);

// ── сцены ──────────────────────────────────────────────────────────────

type SceneProps = { t: number; d: number; v: { from: number; to: number } };

/**
 * Камера: z — зум, (cx, cy) — точка мира в центре кадра, rot — наклон (градусы), hand — «ручная» тряска.
 * Кадр не выходит за края мира: центр зажат так, чтобы не было чёрных полей.
 */
const Cam = ({ t, z = 1, cx = 540, cy = 960, rot = 0, hand = 3, children }: { t: number; z?: number; cx?: number; cy?: number; rot?: number; hand?: number; children: React.ReactNode }) => {
  const zz = Math.max(1, z);
  const x = clamp(cx, 540 / zz, 1080 - 540 / zz);
  const y = clamp(cy, 960 / zz, 1920 - 960 / zz);
  // плавная тряска рук оператора (низкие частоты) + чуть мелкой дрожи
  const hx = (Math.sin(t * 1.3) + 0.6 * Math.sin(t * 2.9 + 1) + 0.25 * Math.sin(t * 11)) * hand;
  const hy = (Math.cos(t * 1.1 + 2) + 0.6 * Math.sin(t * 2.3) + 0.25 * Math.cos(t * 13)) * hand;
  const hr = Math.sin(t * 0.9) * hand * 0.08;
  const over = Math.abs(rot) > 0 ? 1 + Math.abs(rot) / 60 : 1; // при наклоне чуть увеличиваем, чтобы не было углов
  return (
    <AbsoluteFill style={{ transform: `rotate(${rot + hr}deg) scale(${over})`, transformOrigin: "50% 50%" }}>
      <AbsoluteFill style={{ transformOrigin: "0 0", transform: `translate(${540 - x * zz + hx}px,${960 - y * zz + hy}px) scale(${zz})` }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Крупные размытые снежинки у самого объектива — глубина кадра. */
const NearSnow = ({ t, n = 7, wind = 0.6, opacity = 0.7 }: { t: number; n?: number; wind?: number; opacity?: number }) => (
  <AbsoluteFill style={{ opacity }}>
    {Array.from({ length: n }, (_, i) => {
      const sp = 0.25 + random(`ns${i}`) * 0.3;
      const ph = (t * sp + random(`np${i}`)) % 1;
      const r = 18 + random(`nr${i}`) * 40;
      const x = ((random(`nx${i}`) * 1300 + ph * 900 * wind) % 1400) - 160;
      const y = ph * 2200 - 140;
      return <div key={i} style={{ position: "absolute", left: x, top: y, width: r * 2, height: r * 2, borderRadius: "50%", background: "#f2f8ff", filter: `blur(${4 + r / 8}px)`, opacity: 0.55 }} />;
    })}
  </AbsoluteFill>
);


/** Бутылка под курткой, water 0..1 — сколько натаяло. */
const Bottle = ({ water, x, y }: { water: number; x: number; y: number }) => (
  <g transform={`translate(${x} ${y})`} {...L}>
    <rect x="-60" y="-170" width="120" height="260" rx="34" fill="#d9eefc" opacity="0.9" stroke={INK} strokeWidth="8" />
    <rect x="-52" y={80 - 230 * water} width="104" height={230 * water} rx="26" fill="#4aa3ff" />
    <rect x="-34" y="-215" width="68" height="50" rx="10" fill="#e07a2a" stroke={INK} strokeWidth="7" />
  </g>
);


/** Спасательный вертолёт: белый с красной полосой, большое окно, прозрачный винт, маячок. tilt — наклон носа. */
const Heli = ({ t, x, y, s = 1, tilt = 0 }: { t: number; x: number; y: number; s?: number; tilt?: number }) => {
  const beacon = Math.floor(t * 2.5) % 2 === 0;
  const tr = t * 40;
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${-s} ${s})`} {...L}>
      {/* хвостовая балка */}
      <path d="M-70 -20 C-180 -30 -280 -40 -360 -60 L-370 -30 C-280 -10 -180 10 -70 30 Z" fill="#f4f6f8" stroke={INK} strokeWidth="8" />
      <path d="M-300 -44 L-360 -54 L-364 -38 L-300 -30 Z" fill="#e0453b" />
      <path d="M-360 -60 L-395 -125 L-370 -125 L-340 -58 Z" fill="#e0453b" stroke={INK} strokeWidth="6" />
      {/* хвостовой винт — размытый круг */}
      <circle cx="-372" cy="-48" r="48" fill="#cfd8e0" opacity="0.35" stroke={INK} strokeWidth="3" />
      <path d={`M${-372 + Math.cos(tr) * 44} ${-48 + Math.sin(tr) * 44} L${-372 - Math.cos(tr) * 44} ${-48 - Math.sin(tr) * 44}`} stroke={INK} strokeWidth="6" opacity="0.6" />
      <defs>
        <linearGradient id="heBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.55" stopColor="#e6ebef" />
          <stop offset="1" stopColor="#a9b3bc" />
        </linearGradient>
        <linearGradient id="heGlass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2c4f6e" />
          <stop offset="0.5" stopColor="#14283b" />
          <stop offset="1" stopColor="#3d6b8e" />
        </linearGradient>
        <radialGradient id="heDisc" cx="50%" cy="50%" r="50%">
          <stop offset="0.2" stopColor="#d9e2ea" stopOpacity="0.05" />
          <stop offset="0.9" stopColor="#d9e2ea" stopOpacity="0.4" />
          <stop offset="1" stopColor="#d9e2ea" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* корпус */}
      <path d="M-110 -70 C-60 -125 120 -130 190 -70 C240 -30 240 50 180 80 C90 115 -60 110 -110 70 C-150 40 -150 -40 -110 -70 Z" fill="url(#heBody)" stroke={INK} strokeWidth="9" />
      <path d="M-140 10 C-60 30 120 32 225 10 L222 40 C120 62 -60 60 -138 40 Z" fill="#e0453b" />
      {/* большое окно кабины с бликом */}
      <path d="M70 -95 C150 -95 215 -50 222 0 L110 0 C95 -40 85 -70 70 -95 Z" fill="url(#heGlass)" stroke={INK} strokeWidth="7" />
      <path d="M95 -82 C140 -78 175 -55 192 -28" fill="none" stroke="#fff" strokeWidth="9" opacity="0.8" />
      <rect x="-60" y="-60" width="95" height="60" rx="14" fill="url(#heGlass)" stroke={INK} strokeWidth="6" />
      <path d="M-50 -50 L0 -50" stroke="#9fc8e6" strokeWidth="6" opacity="0.7" />
      {/* надпись */}
      <text x="-40" y="95" transform="scale(-1 1)" textAnchor="middle" fontFamily={MONT} fontWeight="800" fontSize="34" fill="#e0453b">СПАСАТЕЛИ</text>
      <g transform="translate(-95 -10)">
        <rect x="-16" y="-6" width="32" height="12" fill="#e0453b" />
        <rect x="-6" y="-16" width="12" height="32" fill="#e0453b" />
      </g>
      {/* полозья */}
      <path d="M-80 105 L-70 150 M140 105 L130 150 M-130 150 H200 C220 150 230 140 236 128" fill="none" stroke={INK} strokeWidth="11" />
      {/* мачта и прозрачный размытый винт */}
      <rect x="20" y="-160" width="34" height="40" rx="8" fill="#d6dde3" stroke={INK} strokeWidth="6" />
      <ellipse cx="37" cy="-165" rx="330" ry="26" fill="url(#heDisc)" />
      <ellipse cx="37" cy="-165" rx={330 * Math.abs(Math.cos(t * 26))} ry="7" fill={INK} opacity="0.5" />
      {/* маячок */}
      <circle cx="37" cy="-130" r="12" fill={beacon ? "#ff3b3b" : "#7a1d1d"} />
      {beacon && <circle cx="37" cy="-130" r="40" fill="#ff3b3b" opacity="0.25" />}
    </g>
  );
};


// ── руки «из глаз» ─────────────────────────────────────────────────────

/** Рука в варежке от нижнего края кадра: рукав до запястья (wx, wy), варежка повёрнута на ang. fist 0..1 — сжата. */
const Mitt = ({ wx, wy, ang = 0, from = 1, fist = 0, s = 1, children }: { wx: number; wy: number; ang?: number; from?: number; fist?: number; s?: number; children?: React.ReactNode }) => {
  const bx = wx + from * 260;
  return (
    <g {...L}>
      <path d={`M${bx} 2100 L${wx} ${wy}`} stroke={INK} strokeWidth={250 * s} />
      <path d={`M${bx} 2100 L${wx} ${wy}`} stroke={JACKET} strokeWidth={226 * s} />
      <path d={`M${bx + 40} 2100 L${wx + 30} ${wy + 60}`} stroke="#1b365c" strokeWidth={70 * s} opacity="0.6" />
      <g transform={`translate(${wx} ${wy}) rotate(${ang}) scale(${s})`}>
        <ellipse cx="0" cy="10" rx="135" ry="60" fill="#a9b5bd" stroke={INK} strokeWidth="8" />
        <g transform={`scale(1 ${1 - fist * 0.35})`}>
          <rect x="-110" y={-250} width="220" height="260" rx="95" fill={MITT} stroke={INK} strokeWidth="9" />
          <path d="M-60 -210 C-30 -230 30 -230 60 -210" fill="none" stroke="#454c54" strokeWidth="12" opacity="0.8" />
        </g>
        <rect x={from > 0 ? -175 : 95} y={-150 + fist * 40} width="80" height="150" rx="40" fill={MITT} stroke={INK} strokeWidth="8" transform={`rotate(${from > 0 ? -25 : 25} ${from > 0 ? -135 : 135} -75)`} />
        {children}
      </g>
    </g>
  );
};

/** Субтитры как в примере: обычные буквы, жирно, чёрная обводка, ключевое слово красным. */
const Sub = ({ t, text, from, dur }: { t: number; text: string; from: number; dur: number }) => {
  const shout = text.startsWith("!");
  const words = (shout ? text.slice(1) : text).split(" ");
  const step = Math.min(0.22, (dur * 0.7) / words.length);
  if (t < from - 0.05) return null;
  const sx = shout ? Math.sin(t * 70) * 8 : 0;
  const sy = shout ? Math.cos(t * 53) * 6 : 0;
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: shout ? "68%" : "75%", textAlign: "center", fontFamily: MONT, fontWeight: 800, fontSize: shout ? 118 : 84, color: shout ? RED : "#fff", transform: `translate(${sx}px,${sy}px) rotate(${shout ? Math.sin(t * 9) * 2 : 0}deg)`, lineHeight: 1.12, WebkitTextStroke: "14px #000", paintOrder: "stroke fill" }}>
      {words.map((w, i) => {
        const a = t - from - i * step >= 0 ? 1 : 0;
        const pop = 1 + 0.15 * (1 - clamp((t - from - i * step) / 0.15));
        return (
          <span key={i} style={{ display: "inline-block", marginRight: "0.22em", opacity: a, transform: `scale(${a > 0 ? pop : 1})`, color: w.includes("_") ? RED : undefined }}>
            {w.replace(/_/g, "")}
          </span>
        );
      })}
    </div>
  );
};

// ── кадры ──────────────────────────────────────────────────────────────
type P = { t: number; d: number; v: number };
const fy = (g: number, s: number) => onGround(DIMA, g, s);

// ── «живость»: резкие взгляды с перелётом, плавное дыхание и перенос веса ──
/** Перелёт пружины: быстро доходит, чуть проскакивает и мягко садится. */
const backOut = (p: number) => {
  const c = 1.9;
  return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2);
};
/** Ступенчатое значение: в моменты keys резко (за dur) переходит к новой цели с перелётом. */
const snapTo = (t: number, keys: [number, number][], dur = 0.14) => {
  let v = keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [kt, kv] = keys[i];
    if (t < kt) break;
    v = v + (kv - v) * backOut(clamp((t - kt) / dur));
  }
  return v;
};
/** Случайные моменты взглядов: чем больше energy, тем чаще и резче. */
const glances = (seed: string, energy: number, range: number): [number, number][] => {
  const out: [number, number][] = [[0, 0]];
  let at = 0.15 + random(`${seed}g0`) * 0.3;
  for (let i = 1; at < 8; i++) {
    out.push([at, (random(`${seed}v${i}`) - 0.5) * 2 * range]);
    at += (1.5 - energy) * (0.6 + random(`${seed}d${i}`) * 0.8);
  }
  return out;
};

/** Дима по пояс, но живой: глаза бегают и опережают голову, тело дышит, шатается, вздрагивает. */
const Bust = ({ t, emotion = "calm", lid, frost = 0.8, look, trem = 0, seed = "b", energy = 0.4, breath = 1, droop = 0, flinch }: { t: number; emotion?: "calm" | "fear" | "smile"; lid?: number; frost?: number; look?: [number, number]; trem?: number; seed?: string; energy?: number; breath?: number; droop?: number; flinch?: number }) => {
  const keys = glances(seed, energy, 1);
  const eyeX = snapTo(t + 0.09, keys, 0.08) * 24; // глаза первыми
  const head = snapTo(t, keys, 0.16 + (1 - energy) * 0.2) * (4 + energy * 8); // голова догоняет
  const sway = Math.sin(t * 0.8 + seed.length) * 6 + Math.sin(t * 1.9) * 2; // перенос веса
  const br = Math.sin(t * 2.1) * breath; // дыхание
  // вздрагивание: резкий рывок вверх с перелётом и плавный возврат
  const fl = flinch !== undefined && t > flinch ? Math.exp(-(t - flinch) * 5) * Math.sin(Math.min(1, (t - flinch) / 0.08) * Math.PI * 0.5) : 0;
  const dy = droop * 120 - fl * 70 + br * 6;
  const rot = sway * 0.15 + head * 0.25 + droop * 6 - fl * 3;
  const sh = trem ? Math.sin(t * 60) * trem + Math.sin(t * 37) * trem * 0.6 : 0;
  return (
    <g transform={`translate(${sh + sway} ${dy}) rotate(${rot} 540 1300) translate(540 1300) scale(1 ${1 + br * 0.012}) translate(-540 -1300)`}>
      <Hero cfg={DIMA} x={540} y={820} s={0.62} t={t} emotion={emotion} lid={lid} frost={frost} look={look ?? [eyeX, droop * 14]} headTurn={head + droop * 10} blinks={[0.7 + random(seed) * 2, 3.1]} wind={0.2} />
    </g>
  );
};

const OLD: Record<string, React.FC<P>> = {
  // широкий: крошечный Дима в метели
  p01: ({ t, d }) => (
    <AbsoluteFill>
      <Cam t={t} z={ease(t, 0, d, 1.25, 1.45)} cy={ease(t, 0, d, 700, 1150)} hand={4}>
        <Sky t={t} fog={0.15} />
        <Svg><Hero cfg={DIMA} x={540} y={fy(1500, 0.24)} s={0.24} t={t} emotion="fear" look={[Math.sin(t * 2) * 20, 0]} frost={0.8} full wind={1} /></Svg>
        <Snow t={t} n={120} opacity={0.85} speed={2.2} wind={1} />
      </Cam>
      <NearSnow t={t} wind={1.2} />
      <Sfx name="survival/gust" vol={0.6} />
    </AbsoluteFill>
  ),
  // лицо вплотную
  p02: ({ t }) => (
    <AbsoluteFill>
      <Cam t={t} z={ease(t, 0, 1.2, 2.3, 2.8)} cy={800} hand={4}>
        <Sky t={t} fog={0.3} />
        <Svg><Bust t={t} emotion="fear" seed="p02" energy={1} /></Svg>
        <Snow t={t} n={60} opacity={0.7} speed={1.6} wind={0.8} />
      </Cam>
      <NearSnow t={t} />
    </AbsoluteFill>
  ),
  // телефон в варежке: нет сети
  p03: ({ t }) => {
    const sh = t > 0.9 && t < 1.3 ? shake(t, 10) : { dx: 0, dy: 0 };
    return (
      <AbsoluteFill style={{ transform: `translate(${sh.dx}px,${sh.dy}px)` }}>
        <AbsoluteFill style={{ background: "#0c1420" }} />
        <Svg>
          <g transform={`translate(0 ${ease(t, 0, 0.3, 120, 0) - 300})`}>
            <rect x="250" y="520" width="580" height="1100" rx="80" fill="#0b0f14" stroke={INK} strokeWidth="12" />
            <rect x="280" y="550" width="520" height="1040" rx="60" fill="#121b27" />
            <text x="540" y="700" textAnchor="middle" fontFamily={MONT} fontWeight="800" fontSize="110" fill="#fff">04:13</text>
            <g transform="translate(540 880)">
              {[0, 1, 2, 3].map((i) => <rect key={i} x={-70 + i * 38} y={-20 - i * 22} width="24" height={30 + i * 22} rx="5" fill="#45505c" />)}
              <path d="M-90 -110 L90 40" stroke={RED} strokeWidth="14" strokeLinecap="round" />
            </g>
            <text x="540" y="1030" textAnchor="middle" fontFamily={MONT} fontWeight="800" fontSize="62" fill="#fff">Нет сети</text>
            <rect x="310" y="1100" width="460" height="120" rx="26" fill={RED} opacity={0.8 + 0.2 * Math.sin(t * 10)} />
            <text x="540" y="1178" textAnchor="middle" fontFamily={MONT} fontWeight="800" fontSize="46" fill="#fff">SOS недоступен</text>
          </g>
          <Mitt wx={850} wy={1150} ang={-12} from={1} />
        </Svg>
        <Snow t={t} n={25} opacity={0.5} speed={1} wind={0.5} />
      </AbsoluteFill>
    );
  },
  // часы на запястье: минус 31
  p04: ({ t }) => (
    <AbsoluteFill>
      <Cam t={t} z={ease(t, 0, 3, 1.05, 1.25)} hand={3}>
        <Sky t={t} fog={0.2} />
        <AbsoluteFill style={{ background: "#03060c", opacity: 0.35 }} />
        <Svg>
          <g {...L}>
            <path d="M-120 2050 L560 1080" stroke={INK} strokeWidth="300" />
            <path d="M-120 2050 L560 1080" stroke={JACKET} strokeWidth="274" />
            <g transform="translate(470 1220) rotate(-35)">
              <rect x="-150" y="-160" width="300" height="320" rx="70" fill="#111" stroke={INK} strokeWidth="10" />
              <rect x="-125" y="-135" width="250" height="270" rx="50" fill="#0e1a24" />
              <text x="0" y="-40" textAnchor="middle" fontFamily={MONT} fontWeight="800" fontSize="96" fill="#7fd1ff">−31°</text>
              <text x="0" y="70" textAnchor="middle" fontFamily={MONT} fontWeight="800" fontSize="58" fill="#fff">04:14</text>
            </g>
          </g>
        </Svg>
        <Snow t={t} n={60} opacity={0.7} speed={1.4} wind={0.8} />
      </Cam>
      <NearSnow t={t} />
    </AbsoluteFill>
  ),
  // бежит, камера мечется
  p05: ({ t }) => {
    const x = 540 + 280 * Math.sin(t * 2.6);
    const dir: 1 | -1 = Math.cos(t * 2.6) >= 0 ? 1 : -1;
    return (
      <AbsoluteFill>
        <Cam t={t} z={1.5} cx={x} cy={1150} rot={Math.sin(t * 2.6) * 5} hand={8}>
          <Sky t={t} fog={0.35} cam={-x * 0.2} />
          <Svg><Hero cfg={DIMA} x={x} y={fy(1560, 0.32)} s={0.32} flip={dir} t={t} emotion="fear" walk={t * 2} look={[dir * 18, 0]} frost={0.7} full wind={0.9} /></Svg>
          <Snow t={t} n={90} opacity={0.8} speed={1.8} wind={0.9} />
        </Cam>
        <NearSnow t={t} wind={1} />
        <Sfx name="survival/steps" vol={0.6} />
      </AbsoluteFill>
    );
  },
  // паника: лицо вплотную, трясёт
  p06: ({ t }) => (
    <AbsoluteFill>
      <Cam t={t} z={3.1} cy={790} rot={-4} hand={14}>
        <Sky t={t} fog={0.3} />
        <Svg><Bust t={t} emotion="fear" trem={3} seed="p06" energy={1.2} flinch={0.35} /></Svg>
      </Cam>
      <AbsoluteFill style={{ boxShadow: `inset 0 0 220px rgba(255,30,40,${0.35 + 0.2 * Math.sin(t * 12)})` }} />
      <Sfx name="survival/heartbeat" vol={0.6} />
    </AbsoluteFill>
  ),
  // стоп, дышу
  p07: ({ t }) => (
    <AbsoluteFill>
      <Cam t={t} z={ease(t, 0, 1.6, 2.4, 1.8)} cy={830} hand={2}>
        <Sky t={t} fog={0.2} />
        <Svg>
          <Bust t={t} emotion="calm" lid={ease(t, 0.2, 0.7, 0.1, 0.97)} seed="p07" energy={0.1} breath={2.6} />
          <Breath t={t + 1.1} x={600} y={1040} s={1.4} />
        </Svg>
        <Snow t={t} n={30} opacity={0.6} speed={0.6} wind={0.3} />
      </Cam>
      <Sfx name="survival/breath" vol={0.6} />
    </AbsoluteFill>
  ),
  // лежит, заметает, заваленный горизонт
  p08: ({ t, d }) => {
    const drift = clamp(t / d) * 0.6;
    return (
      <AbsoluteFill>
        <Cam t={t} z={ease(t, 0, d, 1.5, 1.8)} cx={400} cy={1250} rot={-6} hand={7}>
          <Sky t={t} fog={0.3} />
          <Svg>
            <g transform="translate(540 1230) rotate(-90) translate(-540 -1230)">
              <Hero cfg={DIMA} x={540} y={fy(1460, 0.28)} s={0.28} t={t} emotion="fear" frost={1} full wind={1} />
            </g>
            <path d={`M240 1310 C320 ${1310 - 140 * drift} 760 ${1310 - 170 * drift} 860 1310 Z`} fill="#eef3f7" stroke={INK} strokeWidth="6" />
          </Svg>
          <Snow t={t} n={70} opacity={0.9} speed={2.6} wind={1.2} />
        </Cam>
        <NearSnow t={t} wind={1.4} n={11} />
        <Sfx name="survival/gust" vol={0.7} />
      </AbsoluteFill>
    );
  },
  // роет нору руками — вид из глаз
  p09: ({ t }) => {
    const a = Math.sin(t * 9);
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{ background: "#1a2738" }} />
        <Svg>
          <path d="M-50 300 C300 260 800 280 1130 320 V1960 H-50 Z" fill="#dfe8f0" stroke={INK} strokeWidth="8" />
          <ellipse cx="540" cy={1050} rx={180 + t * 50} ry={150 + t * 40} fill="#16202c" stroke={INK} strokeWidth="7" />
          {Array.from({ length: 8 }, (_, i) => {
            const ph = (t * 1.8 + i / 8) % 1;
            return <circle key={i} cx={540 + (i % 2 ? 1 : -1) * ph * 520} cy={1050 + ph * 700} r={(14 + (i % 3) * 8) * (1 + ph * 3)} fill="#f1f6fa" stroke={INK} strokeWidth="5" />;
          })}
          <Mitt wx={380 + a * 60} wy={1250 - a * 120} ang={20 + a * 15} from={-1} />
          <Mitt wx={700 - a * 60} wy={1250 + a * 120} ang={-20 - a * 15} from={1} />
        </Svg>
        <Sfx name="survival/dig" vol={0.8} />
      </AbsoluteFill>
    );
  },
  // в норе, капюшон, руки под мышки
  p10: ({ t, d }) => (
    <AbsoluteFill>
      <Cam t={t} z={ease(t, 0, d, 1.1, 1.7)} cy={ease(t, 0, d, 960, 860)} hand={2}>
        <AbsoluteFill style={{ background: "#26384c" }} />
        <Svg>
          <Bust t={t} emotion="fear" trem={1.8} frost={0.9} seed="p10" energy={0.6} flinch={1.1} />
          <Breath t={t} x={600} y={1040} s={1.2} />
        </Svg>
        <CaveFrame glow={0.4} />
      </Cam>
    </AbsoluteFill>
  ),
  // снег в варежке у самого рта
  p11: ({ t, d }) => {
    const no = t > d * 0.55;
    const sh = no && t < d * 0.55 + 0.35 ? shake(t, 14) : { dx: 0, dy: 0 };
    return (
      <AbsoluteFill style={{ transform: `translate(${sh.dx}px,${sh.dy}px)` }}>
        <AbsoluteFill style={{ background: "#26384c" }} />
        <CaveFrame glow={0.4} />
        <Svg>
          <Mitt wx={560} wy={ease(t, 0, d * 0.5, 1500, 1150)} ang={no ? 30 : 0} from={1} s={1.25}>
            <ellipse cx="0" cy="-270" rx="150" ry="85" fill="#f4f8fb" stroke={INK} strokeWidth="7" opacity={no ? clamp(1 - (t - d * 0.55) * 3) : 1} />
          </Mitt>
        </Svg>
        {no && <AbsoluteFill style={{ background: RED, opacity: 0.18 * clamp(1 - (t - d * 0.55) * 2) }} />}
      </AbsoluteFill>
    );
  },
  // бутылка под курткой
  p12: ({ t, d }) => (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "#0d1520" }} />
      <Svg>
        <path d="M-50 -50 H420 C380 600 360 1300 420 1980 H-50 Z" fill={JACKET} stroke={INK} strokeWidth="10" />
        <path d="M1130 -50 H660 C700 600 720 1300 660 1980 H1130 Z" fill={JACKET} stroke={INK} strokeWidth="10" />
        <path d="M420 -50 C380 600 360 1300 420 1980" fill="none" stroke="#9aa6b0" strokeWidth="14" strokeDasharray="10 14" />
        <path d="M660 -50 C700 600 720 1300 660 1980" fill="none" stroke="#9aa6b0" strokeWidth="14" strokeDasharray="10 14" />
        <rect x="430" y="-50" width="220" height="2050" fill="#33465c" />
        <g transform="translate(540 1050) scale(1.7)">
          <Bottle water={ease(t, 0.2, d, 0.05, 0.75)} x={0} y={0} />
        </g>
        <Mitt wx={760} wy={1500} ang={-30} from={1} />
      </Svg>
    </AbsoluteFill>
  ),
  // глаза закрываются — во весь экран
  p13: ({ t, d }) => (
    <AbsoluteFill>
      <Cam t={t} z={ease(t, 0, d, 2.8, 3.5)} cy={780} hand={1.5}>
        <AbsoluteFill style={{ background: "#26384c" }} />
        <Svg><Bust t={t} emotion="calm" lid={ease(t, 0, d, 0.3, 0.97)} frost={0.9} seed="p13" energy={0.05} droop={ease(t, 0.1, d, 0, 1) - (t > d * 0.55 && t < d * 0.7 ? 0.25 * Math.sin(((t - d * 0.55) / (d * 0.15)) * Math.PI) : 0)} /></Svg>
      </Cam>
      <AbsoluteFill style={{ background: "#000", opacity: ease(t, 0, d, 0, 0.8) }} />
      <Sfx name="survival/heartbeat" vol={0.5} />
    </AbsoluteFill>
  ),
  // рывок: спать нельзя
  p14: ({ t }) => (
    <AbsoluteFill>
      <Cam t={t} z={ease(t, 0, 0.2, 3.4, 1.6)} cy={ease(t, 0, 0.2, 780, 860)} hand={t < 0.4 ? 24 : 4}>
        <AbsoluteFill style={{ background: "#26384c" }} />
        <Svg><Bust t={t} emotion="fear" frost={0.8} seed="p14" energy={1} flinch={0} /></Svg>
        <CaveFrame glow={0.4} />
      </Cam>
      <AbsoluteFill style={{ background: "#fff", opacity: clamp(0.5 - t * 3) }} />
      <Sfx name="survival/gust" vol={0.7} dur={1} />
    </AbsoluteFill>
  ),
  // сжимает кулаки — вид из глаз
  p15: ({ t }) => {
    const f = Math.max(0, Math.sin(t * 7));
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{ background: "#1a2738" }} />
        <CaveFrame glow={0.35} />
        <Svg>
          <Mitt wx={330} wy={1200} ang={12} from={-1} fist={f} s={1.1} />
          <Mitt wx={750} wy={1200} ang={-12} from={1} fist={Math.max(0, Math.sin(t * 7 + 1.5))} s={1.1} />
        </Svg>
      </AbsoluteFill>
    );
  },
  // фонарик: SOS в ночь
  p16: ({ t, d, v }) => {
    const s0 = v + 0.5;
    const k = Math.min(1, (d - 0.15 - s0) / SOS_LEN);
    const ts = (t - s0) / k;
    const on = SOS.some((q) => ts >= q.from && ts < q.to);
    return (
      <AbsoluteFill>
        <Sky t={t} />
        <AbsoluteFill style={{ background: "#03060c", opacity: on ? 0.1 : 0.35 }} />
        <Svg>
          {on && <path d="M560 1180 L-200 -100 L1280 -100 Z" fill="#fff6c8" opacity="0.28" />}
          <Mitt wx={600} wy={1300} ang={-8} from={1} s={1.1}>
            <rect x="-60" y="-420" width="120" height="330" rx="24" fill="#3a4048" stroke={INK} strokeWidth="9" />
            <ellipse cx="0" cy="-420" rx="80" ry="28" fill={on ? "#fff6c8" : "#555"} stroke={INK} strokeWidth="8" />
          </Mitt>
          <g transform="translate(540 560)">
            {SOS.map((q, i) => {
              const w = q.to - q.from > 0.5 ? 90 : 34;
              const x = -400 + i * 92 + (i > 2 ? 20 : 0) + (i > 5 ? 20 : 0);
              return <rect key={i} x={x} y={-17} width={w} height="34" rx="17" fill={ts >= q.from ? ORANGE : "#3a4656"} />;
            })}
          </g>
        </Svg>
        <Snow t={t} n={40} opacity={0.6} speed={0.8} wind={0.3} />
        {SOS.map((q, i) => <Sfx key={i} at={s0 + q.from * k} name="survival/click" vol={0.6} />)}
      </AbsoluteFill>
    );
  },
  // никто не отвечает: широкий, крошечный луч в темноте
  p17: ({ t, d }) => (
    <AbsoluteFill>
      <Cam t={t} z={ease(t, 0, d, 1.35, 1)} cy={ease(t, 0, d, 650, 1000)} hand={1.5}>
        <Sky t={t} />
        <Svg>
          <Burrow x={330} y={1560} s={0.6} />
          <path d="M360 1480 L1100 1050 L1100 1250 Z" fill="#fff6c8" opacity={Math.floor(t * 3) % 2 ? 0.25 : 0.05} />
        </Svg>
        <Snow t={t} n={50} opacity={0.6} speed={1} wind={0.6} />
      </Cam>
    </AbsoluteFill>
  ),
  // батарея садится: фонарик гаснет
  p18: ({ t, d }) => {
    const bat = ease(t, 0, d, 0.25, 0);
    const on = bat > 0.03 && Math.sin(t * 37) > -0.3;
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{ background: "#05080d" }} />
        <Svg>
          {on && <path d="M560 1100 L-100 -100 L1180 -100 Z" fill="#fff6c8" opacity={bat} />}
          <Mitt wx={600} wy={1250} ang={-8} from={1} s={1.25}>
            <rect x="-60" y="-420" width="120" height="330" rx="24" fill="#3a4048" stroke={INK} strokeWidth="9" />
            <ellipse cx="0" cy="-420" rx="80" ry="28" fill={on ? "#fff6c8" : "#333"} stroke={INK} strokeWidth="8" />
            <rect x="-38" y="-300" width="76" height="130" rx="10" fill="none" stroke="#fff" strokeWidth="6" />
            <rect x="-28" y={-180 - 110 * bat * 4} width="56" height={110 * bat * 4} fill={RED} />
          </Mitt>
        </Svg>
      </AbsoluteFill>
    );
  },
  // считаю вдохи: камера медленно поднимается от норы к сиянию
  p19: ({ t, d }) => (
    <AbsoluteFill>
      <Cam t={t} z={ease(t, 0, d, 1.15, 1.35)} cy={ease(t, 0, d, 1000, 640)} hand={1.2}>
        <Sky t={t} aurora={1.6} />
        <Svg>
          <Burrow x={540} y={1560} s={0.8} />
          <ellipse cx="540" cy="1545" rx="60" ry="45" fill="#ffb760" opacity={0.25 + 0.1 * Math.sin(t * 3)} />
          <Breath t={t} x={560} y={1480} s={0.8} />
        </Svg>
        <Snow t={t} n={25} opacity={0.5} speed={0.4} wind={0.2} />
      </Cam>
      <Sfx name="survival/breath" vol={0.5} />
    </AbsoluteFill>
  ),
  // утро: вертолёт
  p20: ({ t, d }) => {
    const hx = ease(t, 0, d, 1350, 640);
    const hy = 520 + Math.sin(t * 1.4) * 10;
    const vx = ease(t + 0.05, 0, d, 1350, 640) - hx; // скорость → наклон носа
    const tilt = clamp(vx * 0.5, -6, 6);
    return (
      <AbsoluteFill>
        <Cam t={t} z={ease(t, 0, d, 1.6, 1.1)} cx={ease(t, 0, d, 430, 600)} cy={ease(t, 0, d, 1400, 800)} hand={6}>
          <Sky t={t} dawn={ease(t, 0, d, 0.5, 0.9)} />
          <Svg>
            <Burrow x={430} y={1500} s={0.9} />
            <Heli t={t} x={hx} y={hy} s={0.9} tilt={tilt} />
          </Svg>
          <Snow t={t} n={40} opacity={0.6} speed={0.8} wind={1} />
        </Cam>
        <NearSnow t={t} wind={1.4} n={9} />
        <Sfx name="survival/heli" vol={0.8} />
      </AbsoluteFill>
    );
  },
  // я выжил: рука «класс» из норы, луч сверху
  p21: ({ t, d }) => {
    const thumb = ease(t, 0, 0.5, 0, 1);
    return (
      <AbsoluteFill>
        <Cam t={t} z={ease(t, 0, d, 1.2, 1.5)} cx={430} cy={1300} hand={3}>
          <Sky t={t} dawn={1} />
          <Svg>
            <path d="M600 200 L250 1520 L610 1520 Z" fill="#fff6c8" opacity="0.35" />
            <Burrow x={430} y={1500} s={0.9} />
            <g transform={`translate(430 ${1480 - thumb * 160})`} opacity={thumb} {...L}>
              <path d="M0 160 L0 40" stroke={INK} strokeWidth="90" />
              <path d="M0 160 L0 40" stroke={JACKET} strokeWidth="72" />
              <rect x="-55" y="-50" width="110" height="100" rx="34" fill={MITT} stroke={INK} strokeWidth="8" />
              <rect x="-62" y="-118" width="36" height="92" rx="18" fill={MITT} stroke={INK} strokeWidth="8" transform="rotate(-18 -44 -40)" />
              <path d="M-40 -20 H40 M-40 5 H40 M-40 30 H40" stroke="#454c54" strokeWidth="7" />
            </g>
          </Svg>
          <Snow t={t} n={14} opacity={0.5} speed={0.4} wind={0.3} />
        </Cam>
        <Sfx name="survival/heli" vol={0.4} />
        <Sfx at={0.4} name="survival/ding" vol={0.4} />
      </AbsoluteFill>
    );
  },
  // сохрани
  p22: ({ t }) => (
    <AbsoluteFill>
      <Sky t={t} dawn={1} />
      <AbsoluteFill style={{ background: "rgba(10,16,24,.6)" }} />
      <Svg>
        <g transform={`translate(540 760) scale(${ease(t, 0, 0.3, 0, 1) * (1 + 0.06 * Math.sin(t * 6))})`} {...L}>
          <path d="M-110 -170 H110 V170 L0 90 L-110 170 Z" fill={ORANGE} stroke={INK} strokeWidth="12" />
        </g>
      </Svg>
    </AbsoluteFill>
  ),
};

// SOS: три коротких, три длинных, три коротких
const SOS = (() => {
  const seq = [0.25, 0.25, 0.25, 0.7, 0.7, 0.7, 0.25, 0.25, 0.25];
  let at = 0;
  return seq.map((d) => {
    const s = { from: at, to: at + d };
    at += d + 0.22;
    return s;
  });
})();
const SOS_LEN = SOS[SOS.length - 1].to;

// ── новые кадры для длинной версии ─────────────────────────────────────
const Shout = ({ t }: { t: number }) => (
  <AbsoluteFill style={{ background: RED, opacity: clamp(0.35 - t * 0.9), mixBlendMode: "screen" }} />
);

const NEW: Record<string, React.FC<P>> = {
  // выжил: лицо в рассветном свете, усталая улыбка; на «Ну… почти» морщится
  s34: ({ t, d }) => {
    const wince = t > d * 0.7;
    return (
      <AbsoluteFill>
        <Cam t={t} z={ease(t, 0, d, 1.5, 1.9)} cy={830} hand={2}>
          <Sky t={t} dawn={1} />
          <Svg>
            <Bust t={t} emotion={wince ? "fear" : "smile"} lid={wince ? 0.6 : 0.25} frost={0.35} seed="s34" energy={0.3} flinch={wince ? d * 0.7 : undefined} />
          </Svg>
          <Snow t={t} n={14} opacity={0.5} speed={0.4} wind={0.3} />
        </Cam>
        <Sfx name="survival/heli" vol={0.35} />
      </AbsoluteFill>
    );
  },
  // орёт в камеру: лицо во весь экран, сильная тряска
  s04: ({ t }) => (
    <AbsoluteFill>
      <Cam t={t} z={ease(t, 0, 0.25, 2.6, 3.6)} cy={840} rot={Math.sin(t * 30) * 3} hand={26}>
        <Sky t={t} fog={0.3} />
        <Svg><Bust t={t} emotion="fear" trem={5} seed="s04" energy={1.3} flinch={0} /></Svg>
      </Cam>
      <AbsoluteFill style={{ boxShadow: "inset 0 0 260px rgba(255,20,30,.55)" }} />
      <Shout t={t} />
      <Sfx name="survival/gust" vol={0.8} dur={1} />
    </AbsoluteFill>
  ),
  // группа уходит в метель и пропадает
  s05: ({ t, d }) => {
    const fog = ease(t, 0, d, 0.15, 0.75);
    const g = (cfg: typeof DIMA, x0: number, k: number) => (
      <Hero cfg={cfg} x={x0 + t * 22 * k} y={fy(1330, 0.17)} s={0.17} flip={-1} t={t + k} walk={t * 1.4 + k} emotion="calm" frost={0.6} full wind={1} />
    );
    return (
      <AbsoluteFill>
        <Cam t={t} z={ease(t, 0, d, 1.1, 1.35)} cy={1150} hand={3}>
          <Sky t={t} fog={0.2} />
          <Svg>
            <g opacity={1 - fog}>
              {g(STAS, 600, 1)}
              {g(LERA, 700, 1.2)}
              {g(GENA, 800, 0.9)}
            </g>
          </Svg>
          <AbsoluteFill style={{ background: "#9fb3c6", opacity: fog * 0.7 }} />
          <Snow t={t} n={150} opacity={0.9} speed={2.4} wind={1.3} />
          <Svg><Hero cfg={DIMA} x={230} y={fy(1900, 0.42)} s={0.42} t={t} emotion="fear" look={[22, -4]} frost={0.8} full wind={1} arm={ease(t, 0, 1, 40, 215)} /></Svg>
        </Cam>
        <NearSnow t={t} wind={1.4} n={10} />
        <Sfx name="survival/blizzard" vol={0.6} />
      </AbsoluteFill>
    );
  },
  // огромные горы, крошечный Дима
  s07: ({ t, d }) => (
    <AbsoluteFill>
      <Cam t={t} z={ease(t, 0, d, 2.2, 1)} cy={ease(t, 0, d, 1380, 1050)} hand={2}>
        <Sky t={t} fog={0.25} />
        <Svg><Hero cfg={DIMA} x={540} y={fy(1420, 0.08)} s={0.08} t={t} emotion="fear" frost={0.8} full wind={1} /></Svg>
        <Snow t={t} n={80} opacity={0.7} speed={1.6} wind={1} />
      </Cam>
    </AbsoluteFill>
  ),
  // падение кубарем: мир крутится, удар — вспышка
  s10: ({ t, d }) => {
    const fall = clamp((t - d * 0.35) / (d * 0.55));
    const spin = fall * 620;
    return (
      <AbsoluteFill>
        <Cam t={t} z={1.6 + fall * 0.6} cy={1100} rot={spin} hand={fall > 0 ? 18 : 6}>
          <Sky t={t} fog={0.2} />
          <Svg>
            <Hero cfg={DIMA} x={300 + Math.min(t, d * 0.35) * 160 + fall * 200} y={fy(1560, 0.32) + fall * 300} s={0.32} flip={1} t={t} emotion="fear" walk={fall > 0 ? undefined : t * 2} look={[22, 0]} frost={0.7} full wind={1} />
          </Svg>
          <Snow t={t} n={120} opacity={0.9} speed={3} wind={1.5} />
        </Cam>
        {fall > 0 && <AbsoluteFill style={{ background: "#fff", opacity: fall > 0.92 ? (1 - fall) * 10 : fall * 0.15 }} />}
        <Sfx name="survival/steps" vol={0.6} dur={d * 0.35} />
        <Sfx at={d * 0.35} name="survival/whoosh" vol={0.8} />
        <Sfx at={d * 0.88} name="survival/thud" vol={0.6} dur={0.8} />
      </AbsoluteFill>
    );
  },
  // лежит на спине в снегу, задыхается
  s11: ({ t, d }) => (
    <AbsoluteFill>
      <Cam t={t} z={ease(t, 0, d, 1.5, 1.8)} cy={880} rot={-78} hand={3}>
        <AbsoluteFill style={{ background: "#dfe8f0" }} />
        <Svg>
          <Bust t={t} emotion="fear" trem={1.2} breath={2.8} seed="s11" energy={0.7} frost={1} />
          <Breath t={t * 1.6} x={600} y={1040} s={1.3} />
        </Svg>
      </Cam>
      <Sfx name="survival/breath" vol={0.8} />
    </AbsoluteFill>
  ),
  // телефон: сообщение маме не уходит
  s19: ({ t, d }) => {
    const sent = t > d * 0.62;
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{ background: "#0c1420" }} />
        <CaveFrame glow={0.25} />
        <Svg>
          <g transform={`translate(0 ${ease(t, 0, 0.3, 120, -200)})`}>
            <rect x="250" y="520" width="580" height="1100" rx="80" fill="#0b0f14" stroke={INK} strokeWidth="12" />
            <rect x="280" y="550" width="520" height="1040" rx="60" fill="#121b27" />
            <text x="320" y="625" fontFamily={MONT} fontWeight="800" fontSize="40" fill="#fff">Мама ❤</text>
            <rect x="660" y="592" width="90" height="40" rx="8" fill="none" stroke={RED} strokeWidth="5" />
            <rect x="666" y="598" width={8 + 4 * Math.abs(Math.sin(t * 6))} height="28" fill={RED} />
            <text x="705" y="660" textAnchor="middle" fontFamily={MONT} fontWeight="800" fontSize="28" fill={RED}>2%</text>
            <g transform="translate(0 0)">
              <rect x="295" y="1020" width="490" height="220" rx="34" fill="#2f6fe0" />
              <text x="320" y="1105" fontFamily={MONT} fontWeight="800" fontSize="50" fill="#fff">Мам, я тебя</text>
              <text x="320" y="1175" fontFamily={MONT} fontWeight="800" fontSize="50" fill="#fff">люблю. Прости.</text>
              {sent && <circle cx="770" cy="1030" r="34" fill={RED} />}
              {sent && <text x="770" y="1046" textAnchor="middle" fontFamily={MONT} fontWeight="800" fontSize="40" fill="#fff">!</text>}
              {sent && <text x="780" y="1300" textAnchor="end" fontFamily={MONT} fontWeight="800" fontSize="40" fill={RED}>Не доставлено</text>}
            </g>
          </g>
          <Mitt wx={880} wy={1450} ang={-12} from={1} />
        </Svg>
        {sent && <Sfx at={d * 0.62} name="survival/buzz" vol={0.4} />}
      </AbsoluteFill>
    );
  },
  // шёпот: глаза крупно в темноте
  s21: ({ t, d }) => (
    <AbsoluteFill>
      <Cam t={t} z={ease(t, 0, d, 3, 3.4)} cy={790} hand={1}>
        <AbsoluteFill style={{ background: "#1a2738" }} />
        <Svg><Bust t={t} emotion="fear" lid={0.35} frost={1} seed="s21" energy={0.2} /></Svg>
      </Cam>
      <AbsoluteFill style={{ background: "#000", opacity: 0.4 }} />
    </AbsoluteFill>
  ),
  // из норы: светлый вход, по нему проходит тень
  s24: ({ t, d }) => {
    const sh = ease(t, d * 0.45, d * 0.85, -400, 1400);
    return (
      <AbsoluteFill>
        <Cam t={t} z={ease(t, 0, d, 1, 1.35)} cy={900} hand={1.5}>
          <AbsoluteFill style={{ background: "#0b1119" }} />
          <Svg>
            <ellipse cx="540" cy="900" rx="330" ry="270" fill="#7f9bb8" stroke={INK} strokeWidth="10" />
            <ellipse cx="540" cy="980" rx="330" ry="120" fill="#b9cbdc" opacity="0.7" />
            {Array.from({ length: 14 }, (_, i) => {
              const ph = (t * 1.5 + i / 14) % 1;
              return <circle key={i} cx={210 + ph * 660} cy={700 + random(`s24${i}`) * 400} r="5" fill="#fff" opacity="0.8" />;
            })}
            {/* тень проходит мимо входа */}
            <g transform={`translate(${sh} 0)`} opacity="0.85">
              <ellipse cx="0" cy="760" rx="70" ry="80" fill="#05080c" />
              <rect x="-90" y="820" width="180" height="420" rx="70" fill="#05080c" />
            </g>
          </Svg>
          <AbsoluteFill style={{ background: "radial-gradient(40% 30% at 50% 47%, rgba(0,0,0,0) 60%, #05080c 100%)" }} />
        </Cam>
        <Sfx name="survival/heartbeat" vol={0.7} />
        <Sfx at={d * 0.3} name="survival/crunch" vol={0.8} />
      </AbsoluteFill>
    );
  },
  // тот же вход: просто метель
  s25: ({ t, d }) => (
    <AbsoluteFill>
      <Cam t={t} z={ease(t, 0, d, 1.35, 1.15)} cy={900} hand={1.5}>
        <AbsoluteFill style={{ background: "#0b1119" }} />
        <Svg>
          <ellipse cx="540" cy="900" rx="330" ry="270" fill="#7f9bb8" stroke={INK} strokeWidth="10" />
          <ellipse cx="540" cy="980" rx="330" ry="120" fill="#b9cbdc" opacity="0.7" />
          {Array.from({ length: 40 }, (_, i) => {
            const ph = (t * 2.4 + i / 40) % 1;
            return <path key={i} d={`M${210 + ph * 660} ${660 + random(`s25${i}`) * 480} l 40 6`} stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity="0.8" />;
          })}
        </Svg>
        <AbsoluteFill style={{ background: "radial-gradient(40% 30% at 50% 47%, rgba(0,0,0,0) 60%, #05080c 100%)" }} />
      </Cam>
      <Sfx name="survival/gust" vol={0.6} />
    </AbsoluteFill>
  ),
  // темнота: лицо, только пар изо рта
  s29: ({ t, d }) => (
    <AbsoluteFill>
      <Cam t={t} z={ease(t, 0, d, 1.8, 2.2)} cy={840} rot={-2} hand={1.2}>
        <AbsoluteFill style={{ background: "#1a2738" }} />
        <Svg>
          <Bust t={t} emotion="calm" lid={0.95} frost={1} seed="s29" energy={0.1} breath={2} />
          <Breath t={t} x={600} y={1040} s={1.3} />
        </Svg>
      </Cam>
      <AbsoluteFill style={{ background: "#000", opacity: 0.55 }} />
      <Sfx name="survival/breath" vol={0.5} />
    </AbsoluteFill>
  ),
  // вылезает и орёт, машет руками вертолёту
  s32: ({ t, d }) => {
    const shout = t > d * 0.35;
    return (
      <AbsoluteFill>
        <Cam t={t} z={shout ? 1.9 : 1.3} cy={shout ? 1000 : 1150} hand={shout ? 14 : 4}>
          <Sky t={t} dawn={0.85} />
          <Svg>
            <Burrow x={760} y={1560} s={0.8} />
            <Heli t={t} x={300 + t * 25} y={640} s={0.62} />
            <Hero cfg={DIMA} x={460} y={fy(1600, 0.34)} s={0.34} t={t} emotion="fear" arm={218 + Math.sin(t * 14) * 22} look={[18, -20]} frost={0.6} full wind={0.6} />
          </Svg>
          <Snow t={t} n={30} opacity={0.6} speed={0.8} wind={0.8} />
        </Cam>
        {shout && <Shout t={t - d * 0.35} />}
        <Sfx name="survival/heli" vol={0.8} />
      </AbsoluteFill>
    );
  },
  // прожектор вертолёта находит Диму
  s33: ({ t, d }) => {
    const on = ease(t, 0.1, 0.6, 0, 1);
    return (
      <AbsoluteFill>
        <Cam t={t} z={ease(t, 0, d, 1.2, 1.4)} cy={1000} hand={5}>
          <Sky t={t} dawn={0.9} />
          <Svg>
            <path d="M560 540 L360 1600 L720 1600 Z" fill="#fff6c8" opacity={0.4 * on} />
            <ellipse cx="540" cy="1600" rx="200" ry="50" fill="#fff6c8" opacity={0.5 * on} />
            <Hero cfg={DIMA} x={540} y={fy(1600, 0.3)} s={0.3} t={t} emotion="smile" arm={212 + Math.sin(t * 10) * 15} look={[0, -22]} frost={0.5} full wind={0.8} />
            {/* снежный вихрь от винта */}
            {Array.from({ length: 24 }, (_, i) => {
              const ph = (t * 1.3 + i / 24) % 1;
              const a = (i / 24) * Math.PI * 2;
              return <circle key={i} cx={540 + Math.cos(a) * ph * 520} cy={1600 + Math.sin(a) * ph * 90 - ph * 60} r={10 + ph * 26} fill="#fff" opacity={(1 - ph) * 0.6} />;
            })}
            <Heli t={t} x={560 + Math.sin(t * 1.2) * 10} y={480} s={0.75} />
          </Svg>
          <Snow t={t} n={60} opacity={0.7} speed={1.4} wind={1.4} />
        </Cam>
        <NearSnow t={t} wind={1.5} n={9} />
        <Sfx name="survival/heli" vol={1} />
      </AbsoluteFill>
    );
  },
};

const SHOTS: Record<string, React.FC<P>> = {
  s01: OLD.p01, s02: OLD.p02, s03: OLD.p03, s04: NEW.s04, s05: NEW.s05, s06: OLD.p04, s07: NEW.s07,
  s08: OLD.p05, s09: OLD.p06, s10: NEW.s10, s11: NEW.s11, s12: OLD.p07, s13: OLD.p08, s14: OLD.p09,
  s15: OLD.p09, s16: OLD.p10, s17: OLD.p11, s18: OLD.p12, s19: NEW.s19, s20: OLD.p13, s21: NEW.s21,
  s22: OLD.p14, s23: OLD.p15, s24: NEW.s24, s25: NEW.s25, s26: OLD.p16, s27: OLD.p17, s28: OLD.p18,
  s29: NEW.s29, s30: OLD.p19, s31: OLD.p20, s32: NEW.s32, s33: NEW.s33, s34: NEW.s34, s35: OLD.p22,
};

// ── сборка ─────────────────────────────────────────────────────────────
const FPS = 30;
// весь текст — один монолог (mono.mp3); кадр меняется чуть раньше начала своей фразы
const LEAD = 0.3;
const IDS = Object.keys(SHOTS);
const PLAN = (() => {
  const cut = IDS.map((id, i) => (i === 0 ? 0 : Math.round((LEAD + VO[id].start - 0.08) * FPS)));
  const endF = Math.round((LEAD + VO[IDS[IDS.length - 1]].end + 1.5) * FPS);
  return IDS.map((id, i) => {
    const start = cut[i];
    const frames = (i + 1 < IDS.length ? cut[i + 1] : endF) - start;
    // через сколько секунд от начала кадра звучит фраза и сколько длится
    const v = LEAD + VO[id].start - start / FPS;
    return { id, start, frames, d: frames / FPS, v, dur: VO[id].end - VO[id].start };
  });
})();
export const SURVIVAL_FRAMES = PLAN.reduce((s, p) => s + p.frames, 0);

// температура тела: ключевые точки по кадрам
const TEMP: [string, number][] = [["s01", 36.6], ["s07", 36.0], ["s11", 35.4], ["s13", 34.9], ["s16", 34.5], ["s18", 35.0], ["s20", 34.2], ["s23", 34.7], ["s28", 34.0], ["s30", 33.5], ["s34", 36.4]];

/** Интерфейс в углах, как в примере: красный REC с высотой, отсчёт до рассвета, температура тела. */
const Hud = () => {
  const f = useCurrentFrame();
  const startOf = (id: string) => PLAN.find((p) => p.id === id)!.start;
  const temp = interpolate(f, TEMP.map(([id]) => startOf(id)), TEMP.map(([, v]) => v), { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const dawnAt = startOf("s31");
  const left = interpolate(f, [0, dawnAt], [8 * 3600, 0], { extrapolateRight: "clamp" });
  const hh = String(Math.floor(left / 3600)).padStart(2, "0");
  const mm = String(Math.floor((left % 3600) / 60)).padStart(2, "0");
  const ss = String(Math.floor(left % 60)).padStart(2, "0");
  const saved = f >= startOf("s33");
  const cold = clamp((35 - temp) / 1.4);
  const blink = Math.floor(f / 15) % 2 === 0;
  const tag: React.CSSProperties = { fontFamily: MONT, fontWeight: 800, background: "rgba(0,0,0,.55)", borderRadius: 10, padding: "8px 16px" };
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: `radial-gradient(75% 60% at 50% 50%, rgba(0,0,0,0) 55%, rgba(200,225,255,${0.08 + cold * 0.22}) 100%)` }} />
      
      <div style={{ ...tag, position: "absolute", top: 70, left: 50, color: RED, fontSize: 54, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ width: 22, height: 22, borderRadius: 11, background: RED, opacity: blink ? 1 : 0.25 }} /> 6000 м
      </div>
      <div style={{ ...tag, position: "absolute", top: 64, right: 50, textAlign: "right", color: "#fff" }}>
        <div style={{ fontSize: 30, opacity: 0.8 }}>{saved ? "" : "ДО РАССВЕТА"}</div>
        <div style={{ fontSize: 56, color: saved ? GREEN : "#fff" }}>{saved ? "СПАСЁН" : `${hh}:${mm}:${ss}`}</div>
      </div>
      <div style={{ ...tag, position: "absolute", top: 200, right: 50, fontSize: 48, color: saved ? GREEN : cold > 0.4 ? RED : cold > 0 ? ORANGE : "#7fd1ff" }}>
        тело {temp.toFixed(1).replace(".", ",")}°
      </div>
    </AbsoluteFill>
  );
};

const HookTitle = () => {
  const t = useT();
  const lines = ["6000 М.", "НОЧЬ.", "ОДИН."];
  const step = 0.3;
  return (
    <div style={{ position: "absolute", top: "30%", left: 0, right: 0, textAlign: "center", fontFamily: MONT, fontWeight: 800, fontSize: 150, lineHeight: 1.0, color: "#fff", WebkitTextStroke: "16px #000", paintOrder: "stroke fill", opacity: clamp((1.3 - t) / 0.15) }}>
      {lines.map((l, i) => (
        <div key={i} style={{ opacity: t > i * step ? 1 : 0, transform: `scale(${1 + 0.2 * clamp(1 - (t - i * step) / 0.15)})`, color: i === 2 ? RED : "#fff" }}>{l}</div>
      ))}
    </div>
  );
};

const DAWN = new Set(["s31", "s32", "s33", "s34", "s35"]);

// слои: world — только картинка (её обрабатывают «шейдеры»), ui — только субтитры и часы на прозрачном фоне
type Layer = "all" | "world" | "ui";

const Shot = ({ id, d, v, dur, layer }: { id: string; d: number; v: number; dur: number; layer: Layer }) => {
  const t = useT();
  const C = SHOTS[id];
  const vo = VO[id];
  if (layer === "ui") return <Sub t={t} text={vo.text} from={v} dur={dur} />;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill>
        <C t={t} d={d} v={v} />
      </AbsoluteFill>
      {DAWN.has(id) && <AbsoluteFill style={{ background: "radial-gradient(80% 55% at 72% 30%, rgba(255,170,90,.45) 0%, rgba(255,120,60,.12) 45%, rgba(40,60,120,.18) 100%)", mixBlendMode: "soft-light" }} />}
      <Finish vig={0.8} tint={DAWN.has(id) ? "#7a4a2a" : "#2a5a85"} tintOpacity={0.08} grain={1} bigSnow={false} />
      {layer === "all" && <Sub t={t} text={vo.text} from={v} dur={dur} />}
      {/* вспышка на склейке */}
      <AbsoluteFill style={{ background: "#fff", opacity: clamp(0.12 - t * 1.2) }} />
    </AbsoluteFill>
  );
};

export const Survival = ({ layer = "all" }: { layer?: Layer }) => {
  const dawnAt = PLAN.find((p) => p.id === "s31")!.start;
  return (
    <AbsoluteFill style={{ background: layer === "ui" ? "transparent" : "#000" }}>
      <Audio src={staticFile("audio/survival/wind.mp3")} loop volume={(f) => (f < dawnAt ? 0.3 : Math.max(0.05, 0.3 - (f - dawnAt) / 90))} />
      <Audio src={staticFile("audio/music/drone.mp3")} loop volume={(f) => (f < dawnAt ? 0.25 : 0)} />
      {PLAN.map((p) => (
        <Sequence key={p.id} from={p.start} durationInFrames={p.frames}>
          <Shot id={p.id} d={p.d} v={p.v} dur={p.dur} layer={layer} />
        </Sequence>
      ))}
      <Sequence from={Math.round(LEAD * FPS)} layout="none">
        <Audio src={staticFile("audio/survival/mono.mp3")} volume={1.2} />
      </Sequence>
      {layer !== "world" && <Hud />}
      {/* крючок в первые секунды: крупный текст, пока он ещё ничего не сказал */}
      {layer !== "world" && (
        <Sequence durationInFrames={40} layout="none">
          <HookTitle />
        </Sequence>
      )}
    </AbsoluteFill>
  );
};
