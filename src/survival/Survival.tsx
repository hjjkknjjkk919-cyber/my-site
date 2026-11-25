import React from "react";
import { AbsoluteFill, interpolate, random, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/google-fonts/Montserrat";
import { clamp, ease, Finish, INK, shake, Snow, Svg, useT } from "../components/fx";
import { DIMA, Hero, onGround } from "../components/Hero";
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
/** Небо и горы. dawn 0 — глухая ночь, 1 — рассвет. fog — белая мгла метели. */
const Sky = ({ t, dawn = 0, fog = 0, cam = 0 }: { t: number; dawn?: number; fog?: number; cam?: number }) => {
  const mix = (a: number[], b: number[]) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * dawn)).join(",")})`;
  const top = mix([14, 24, 44], [255, 150, 110]);
  const mid = mix([38, 58, 88], [255, 205, 160]);
  const far = mix([52, 72, 102], [196, 170, 190]);
  const near = mix([30, 44, 66], [140, 120, 150]);
  return (
    <Svg>
      <defs>
        <linearGradient id="svSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="0.6" stopColor={mid} />
        </linearGradient>
      </defs>
      <rect width={1080} height={1920} fill="url(#svSky)" />
      {/* звёзды ночью */}
      <g fill="#fff" opacity={(1 - dawn) * (1 - fog) * 0.8}>
        {Array.from({ length: 40 }, (_, i) => (
          <circle key={i} cx={random(`sx${i}`) * 1080} cy={random(`sy${i}`) * 700} r={1.5 + random(`sr${i}`) * 2.5} opacity={0.4 + 0.6 * Math.abs(Math.sin(t * (1 + random(`st${i}`) * 3) + i))} />
        ))}
      </g>
      {/* луна ночью */}
      <circle cx="250" cy="330" r="70" fill="#f3f1e6" opacity={(1 - dawn) * (1 - fog * 0.6)} />
      <circle cx="250" cy="330" r="160" fill="#cfe0ff" opacity={(1 - dawn) * 0.12} />
      {/* солнце на рассвете */}
      <circle cx="760" cy={900 - dawn * 260} r="120" fill="#fff1c4" opacity={dawn * 0.9} />
      <circle cx="760" cy={900 - dawn * 260} r="230" fill="#ffd38a" opacity={dawn * 0.3} />
      <g transform={`translate(${cam * 0.15} 0)`} filter="url(#rough)" {...L}>
        <path d="M-60 1060 L250 640 L380 760 L600 430 L860 820 L1140 1060 Z" fill={far} stroke={INK} strokeWidth="5" />
        <path d="M600 430 L540 560 L600 530 L640 610 L690 520 Z M250 640 L215 720 L270 700 Z" fill="#eef3f7" opacity={0.85} />
      </g>
      <g transform={`translate(${cam * 0.35} 0)`} filter="url(#rough)" {...L}>
        <path d="M-100 1200 L180 900 L420 1080 L700 820 L1180 1200 Z" fill={near} stroke={INK} strokeWidth="6" />
        <path d="M700 820 L640 920 L700 900 L740 960 L780 890 Z" fill="#e3ebf1" />
      </g>
      {/* снежное поле */}
      <path d="M-50 1180 C300 1130 700 1160 1130 1120 V1960 H-50 Z" fill={mix([150, 172, 198], [255, 236, 226])} stroke={INK} strokeWidth="6" />
      <path d="M-50 1400 C350 1360 760 1420 1130 1370 V1960 H-50 Z" fill={mix([176, 196, 218], [255, 244, 236])} opacity="0.8" />
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


/** Вертолёт. */
const Heli = ({ t, x, y, s = 1 }: { t: number; x: number; y: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} {...L}>
    <path d="M-60 -10 L-330 -30 L-330 10 L-60 30 Z" fill="#c8352e" stroke={INK} strokeWidth="8" />
    <path d="M-330 -60 L-300 -60 L-300 30 L-330 30 Z" fill="#c8352e" stroke={INK} strokeWidth="6" />
    <ellipse cx="40" cy="0" rx="150" ry="90" fill="#e2453b" stroke={INK} strokeWidth="9" />
    <path d="M60 -60 C130 -60 175 -20 180 10 L60 10 Z" fill="#bfe3f7" stroke={INK} strokeWidth="6" />
    <path d="M-60 120 H170 M-20 90 V120 M120 90 V120" stroke={INK} strokeWidth="10" />
    <rect x="25" y="-112" width="30" height="24" fill={INK} />
    <ellipse cx="40" cy="-116" rx={260 * Math.abs(Math.sin(t * 30))} ry="10" fill={INK} opacity="0.75" />
  </g>
);


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
  const words = text.split(" ");
  const step = Math.min(0.22, (dur * 0.7) / words.length);
  if (t < from - 0.05) return null;
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: "66%", textAlign: "center", fontFamily: MONT, fontWeight: 800, fontSize: 84, lineHeight: 1.12, color: "#fff", WebkitTextStroke: "14px #000", paintOrder: "stroke fill", textShadow: "0 6px 18px rgba(0,0,0,.6)" }}>
      {words.map((w, i) => {
        const a = clamp((t - from - i * step) / 0.08);
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

const Bust = ({ t, emotion = "calm", lid, frost = 0.8, look = [0, 0] as [number, number], trem = 0 }: { t: number; emotion?: "calm" | "fear" | "smile"; lid?: number; frost?: number; look?: [number, number]; trem?: number }) => (
  <g transform={`translate(${Math.sin(t * 60) * trem} 0)`}>
    <Hero cfg={DIMA} x={540} y={820} s={0.62} t={t} emotion={emotion} lid={lid} frost={frost} look={look} blinks={[]} wind={0.2} />
  </g>
);

const SHOTS: Record<string, React.FC<P>> = {
  // широкий: крошечный Дима в метели
  p01: ({ t, d }) => (
    <AbsoluteFill>
      <Cam t={t} z={ease(t, 0, d, 1, 1.4)} cy={1000} hand={5}>
        <Sky t={t} fog={0.45} />
        <Svg><Hero cfg={DIMA} x={540} y={fy(1500, 0.24)} s={0.24} t={t} emotion="fear" look={[Math.sin(t * 2) * 20, 0]} frost={0.8} full wind={1} /></Svg>
        <Snow t={t} n={120} opacity={0.85} speed={2.2} wind={1} />
      </Cam>
      <NearSnow t={t} wind={1.2} />
      <Sfx name="sfx/gust" vol={0.6} />
    </AbsoluteFill>
  ),
  // лицо вплотную
  p02: ({ t }) => (
    <AbsoluteFill>
      <Cam t={t} z={ease(t, 0, 1.2, 2.3, 2.8)} cy={800} hand={4}>
        <Sky t={t} fog={0.3} />
        <Svg><Bust t={t} emotion="fear" look={[0, 0]} /></Svg>
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
        <Sfx name="sfx/steps" vol={0.6} />
      </AbsoluteFill>
    );
  },
  // паника: лицо вплотную, трясёт
  p06: ({ t }) => (
    <AbsoluteFill>
      <Cam t={t} z={3.1} cy={790} rot={-4} hand={14}>
        <Sky t={t} fog={0.3} />
        <Svg><Bust t={t} emotion="fear" trem={4} look={[Math.sin(t * 9) * 20, 0]} /></Svg>
      </Cam>
      <AbsoluteFill style={{ boxShadow: `inset 0 0 220px rgba(255,30,40,${0.35 + 0.2 * Math.sin(t * 12)})` }} />
      <Sfx name="sfx/heartbeat" vol={0.6} />
    </AbsoluteFill>
  ),
  // стоп, дышу
  p07: ({ t }) => (
    <AbsoluteFill>
      <Cam t={t} z={ease(t, 0, 1.6, 2.4, 1.8)} cy={830} hand={2}>
        <Sky t={t} fog={0.2} />
        <Svg>
          <Bust t={t} emotion="calm" lid={0.4} />
          <Breath t={t + 1.1} x={600} y={1040} s={1.4} />
        </Svg>
        <Snow t={t} n={30} opacity={0.6} speed={0.6} wind={0.3} />
      </Cam>
      <Sfx name="sfx/breath" vol={0.6} />
    </AbsoluteFill>
  ),
  // лежит, заметает, заваленный горизонт
  p08: ({ t, d }) => {
    const drift = clamp(t / d) * 0.6;
    return (
      <AbsoluteFill>
        <Cam t={t} z={ease(t, 0, d, 1.5, 1.8)} cx={560} cy={1620} rot={-6} hand={7}>
          <Sky t={t} fog={0.3} />
          <Svg>
            <g transform="translate(540 1640) rotate(-90) translate(-540 -1640)">
              <Hero cfg={DIMA} x={540} y={fy(1870, 0.28)} s={0.28} t={t} emotion="fear" frost={1} full wind={1} />
            </g>
            <path d={`M240 1720 C320 ${1720 - 140 * drift} 760 ${1720 - 170 * drift} 860 1720 Z`} fill="#eef3f7" stroke={INK} strokeWidth="6" />
          </Svg>
          <Snow t={t} n={70} opacity={0.9} speed={2.6} wind={1.2} />
        </Cam>
        <NearSnow t={t} wind={1.4} n={11} />
        <Sfx name="sfx/gust" vol={0.7} />
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
        <Sfx name="sfx/rustle" vol={0.8} />
      </AbsoluteFill>
    );
  },
  // в норе, капюшон, руки под мышки
  p10: ({ t, d }) => (
    <AbsoluteFill>
      <Cam t={t} z={ease(t, 0, d, 1.1, 1.7)} cy={ease(t, 0, d, 960, 860)} hand={2}>
        <AbsoluteFill style={{ background: "#26384c" }} />
        <Svg>
          <Bust t={t} emotion="fear" trem={2.5} frost={0.9} />
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
        <Svg><Bust t={t} emotion="calm" lid={ease(t, 0, d, 0.3, 0.97)} frost={0.9} /></Svg>
      </Cam>
      <AbsoluteFill style={{ background: "#000", opacity: ease(t, 0, d, 0, 0.8) }} />
      <Sfx name="sfx/heartbeat" vol={0.5} />
    </AbsoluteFill>
  ),
  // рывок: спать нельзя
  p14: ({ t }) => (
    <AbsoluteFill>
      <Cam t={t} z={ease(t, 0, 0.2, 3.4, 1.6)} cy={ease(t, 0, 0.2, 780, 860)} hand={t < 0.4 ? 24 : 4}>
        <AbsoluteFill style={{ background: "#26384c" }} />
        <Svg><Bust t={t} emotion="fear" frost={0.8} /></Svg>
        <CaveFrame glow={0.4} />
      </Cam>
      <AbsoluteFill style={{ background: "#fff", opacity: clamp(0.5 - t * 3) }} />
      <Sfx name="sfx/gust" vol={0.7} dur={1} />
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
        <AbsoluteFill style={{ background: "#03060c", opacity: on ? 0.25 : 0.55 }} />
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
      <Cam t={t} z={ease(t, 0, d, 1.3, 1)} cy={1100} hand={2}>
        <Sky t={t} />
        <AbsoluteFill style={{ background: "#03060c", opacity: 0.5 }} />
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
  // считаю вдохи: лицо в темноте, только пар
  p19: ({ t, d }) => (
    <AbsoluteFill>
      <Cam t={t} z={ease(t, 0, d, 1.8, 2.2)} cy={840} rot={-2} hand={1.5}>
        <AbsoluteFill style={{ background: "#1a2738" }} />
        <Svg>
          <Bust t={t} emotion="calm" lid={0.5} frost={1} />
          <Breath t={t} x={600} y={1040} s={1.3} />
        </Svg>
      </Cam>
      <AbsoluteFill style={{ background: "#000", opacity: 0.45 }} />
      <Sfx name="sfx/breath" vol={0.5} />
    </AbsoluteFill>
  ),
  // утро: вертолёт
  p20: ({ t, d }) => {
    const hx = ease(t, 0, d, 1350, 640);
    const hy = 520 + Math.sin(t * 2) * 12;
    return (
      <AbsoluteFill>
        <Cam t={t} z={ease(t, 0, d, 1.6, 1.1)} cx={ease(t, 0, d, 430, 600)} cy={ease(t, 0, d, 1400, 800)} hand={6}>
          <Sky t={t} dawn={ease(t, 0, d, 0.5, 0.9)} />
          <Svg>
            <Burrow x={430} y={1500} s={0.9} />
            <Heli t={t} x={hx} y={hy} s={0.9} />
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
              <rect x="-16" y="-120" width="34" height="90" rx="17" fill={MITT} stroke={INK} strokeWidth="8" />
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
const TEMP: [string, number][] = [["p01", 36.6], ["p05", 35.9], ["p08", 35.0], ["p10", 34.6], ["p12", 35.2], ["p13", 34.3], ["p15", 34.8], ["p18", 34.0], ["p19", 33.6], ["p21", 36.4]];

/** Интерфейс в углах, как в примере: красный REC с высотой, отсчёт до рассвета, температура тела. */
const Hud = () => {
  const f = useCurrentFrame();
  const startOf = (id: string) => PLAN.find((p) => p.id === id)!.start;
  const temp = interpolate(f, TEMP.map(([id]) => startOf(id)), TEMP.map(([, v]) => v), { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const dawnAt = startOf("p20");
  const left = interpolate(f, [0, dawnAt], [8 * 3600, 0], { extrapolateRight: "clamp" });
  const hh = String(Math.floor(left / 3600)).padStart(2, "0");
  const mm = String(Math.floor((left % 3600) / 60)).padStart(2, "0");
  const ss = String(Math.floor(left % 60)).padStart(2, "0");
  const saved = f >= startOf("p21");
  const cold = clamp((35 - temp) / 1.4);
  const blink = Math.floor(f / 15) % 2 === 0;
  const tag: React.CSSProperties = { fontFamily: MONT, fontWeight: 800, background: "rgba(0,0,0,.55)", borderRadius: 10, padding: "8px 16px" };
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: `radial-gradient(75% 60% at 50% 50%, rgba(0,0,0,0) 55%, rgba(220,240,255,${0.15 + cold * 0.35}) 100%)` }} />
      {cold > 0.4 && !saved && <AbsoluteFill style={{ boxShadow: `inset 0 0 160px rgba(255,30,40,${0.3 * (blink ? 1 : 0.5)})` }} />}
      <div style={{ ...tag, position: "absolute", top: 70, left: 50, color: RED, fontSize: 40, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ width: 22, height: 22, borderRadius: 11, background: RED, opacity: blink ? 1 : 0.25 }} /> 6000 м
      </div>
      <div style={{ ...tag, position: "absolute", top: 64, right: 50, textAlign: "right", color: "#fff" }}>
        <div style={{ fontSize: 22, opacity: 0.75 }}>{saved ? "" : "ДО РАССВЕТА"}</div>
        <div style={{ fontSize: 40, color: saved ? GREEN : "#fff" }}>{saved ? "СПАСЁН" : `${hh}:${mm}:${ss}`}</div>
      </div>
      <div style={{ ...tag, position: "absolute", top: 160, right: 50, fontSize: 36, color: saved ? GREEN : cold > 0.4 ? RED : cold > 0 ? ORANGE : "#7fd1ff" }}>
        тело {temp.toFixed(1).replace(".", ",")}°
      </div>
    </AbsoluteFill>
  );
};

const Shot = ({ id, d, v, dur }: { id: string; d: number; v: number; dur: number }) => {
  const t = useT();
  const C = SHOTS[id];
  const vo = VO[id];
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill>
        <C t={t} d={d} v={v} />
      </AbsoluteFill>
      <Finish vig={0.8} tint="#2a5a85" tintOpacity={0.08} grain={1} bigSnow={false} />
      <Sub t={t} text={vo.text} from={v} dur={dur} />
      {/* вспышка на склейке */}
      <AbsoluteFill style={{ background: "#fff", opacity: clamp(0.12 - t * 1.2) }} />
    </AbsoluteFill>
  );
};

export const Survival = () => {
  const dawnAt = PLAN.find((p) => p.id === "p20")!.start;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Audio src={staticFile("audio/sfx/wind_strong.mp3")} loop volume={(f) => (f < dawnAt ? 0.3 : Math.max(0.05, 0.3 - (f - dawnAt) / 90))} />
      <Audio src={staticFile("audio/music/drone.mp3")} loop volume={(f) => (f < dawnAt ? 0.25 : 0)} />
      {PLAN.map((p) => (
        <Sequence key={p.id} from={p.start} durationInFrames={p.frames}>
          <Shot id={p.id} d={p.d} v={p.v} dur={p.dur} />
        </Sequence>
      ))}
      <Sequence from={Math.round(LEAD * FPS)} layout="none">
        <Audio src={staticFile("audio/survival/mono.mp3")} volume={1.2} />
      </Sequence>
      <Hud />
    </AbsoluteFill>
  );
};
