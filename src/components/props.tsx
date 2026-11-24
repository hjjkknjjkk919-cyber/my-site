import { loadFont } from "@remotion/google-fonts/Caveat";
import { clamp, INK, Svg } from "./fx";
import { Hero, MISHA } from "./Hero";

const { fontFamily: hand } = loadFont("normal", { weights: ["700"], subsets: ["cyrillic", "latin"] });

const L = { strokeLinecap: "round", strokeLinejoin: "round" } as const;
const BG_LINE = "#22303c";

/**
 * Дневной фон в бумажной рисовке: небо с бликом, дальний хребет в дымке, ближний хребет
 * с теневыми гранями, снежный склон. dusk 0..1 — сумерки.
 */
export const DayBg = ({ dusk = 0 }: { dusk?: number }) => (
  <Svg>
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#2f6aa8" />
        <stop offset="0.45" stopColor="#8fbbe0" />
        <stop offset="0.6" stopColor="#d6e6f2" />
      </linearGradient>
      <radialGradient id="sun" cx="18%" cy="8%" r="55%">
        <stop offset="0" stopColor="#fffbe8" stopOpacity="0.75" />
        <stop offset="1" stopColor="#fffbe8" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#d6e6f2" stopOpacity="0" />
        <stop offset="1" stopColor="#d6e6f2" stopOpacity="0.85" />
      </linearGradient>
    </defs>
    <rect width={1080} height={1920} fill="url(#sky)" />
    <rect width={1080} height={1920} fill="url(#sun)" />
    {/* облака-полосы */}
    <g fill="#eaf2f8" opacity="0.55" filter="url(#rough)">
      <path d="M-40 300 C120 270 260 290 380 280 C300 310 120 320 -40 320 Z" />
      <path d="M640 190 C760 170 900 180 1120 170 C980 200 800 205 640 190 Z" />
    </g>
    <g filter="url(#rough)" {...L}>
      {/* дальний хребет в дымке */}
      <path d="M-20 820 L120 640 L230 700 L380 520 L470 600 L560 430 L690 610 L800 540 L930 660 L1100 560 V1000 H-20 Z" fill="#a9c1d6" stroke={BG_LINE} strokeWidth="4" opacity="0.8" />
      <path d="M560 430 L520 540 L575 515 L610 590 L690 610 L630 520 Z M380 520 L350 600 L400 580 Z" fill="#eef5fa" opacity="0.9" />
      <rect x="-20" y="500" width="1120" height="500" fill="url(#haze)" />
      {/* ближний хребет */}
      <path d="M-20 960 L160 800 L300 880 L470 760 L620 880 L800 770 L1100 930 V1300 H-20 Z" fill="#c9dae8" stroke={BG_LINE} strokeWidth="6" />
      <path d="M470 760 L560 880 L620 880 Z M800 770 L900 900 L1100 930 L1100 980 L880 940 Z M160 800 L230 900 L300 880 Z" fill="#8eaac2" opacity="0.7" />
      {/* камни */}
      <path d="M120 1010 L160 975 L215 990 L230 1020 Z M880 1000 L920 970 L980 985 L990 1012 Z" fill="#3a4652" stroke={BG_LINE} strokeWidth="5" />
      {/* склон */}
      <path d="M-20 1080 C300 1010 700 1060 1100 990 V1940 H-20 Z" fill="#eef4f8" stroke={BG_LINE} strokeWidth="6" />
      <path d="M-20 1180 C260 1120 600 1170 1100 1100 V1940 H-20 Z" fill="#dde8f0" />
      <path d="M200 1300 C400 1270 620 1290 820 1260 M80 1480 C300 1440 560 1470 760 1440" fill="none" stroke="#b9cddd" strokeWidth="8" opacity="0.8" />
    </g>
    <rect width={1080} height={1920} fill="#1b3350" opacity={dusk * 0.55} />
  </Svg>
);

/** Лачуга на склоне. lit 0..1 — грязно-жёлтый свет в окне с ореолом. */
export const Shack = ({ x, y, s = 1, lit = 1 }: { x: number; y: number; s?: number; lit?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} {...L}>
    <defs>
      <radialGradient id="winGlow">
        <stop offset="0" stopColor="#f2c94c" stopOpacity="0.7" />
        <stop offset="1" stopColor="#f2c94c" stopOpacity="0" />
      </radialGradient>
    </defs>
    <ellipse cx="0" cy="8" rx="170" ry="22" fill="#2c4a6b" opacity="0.35" />
    <g filter="url(#rough)">
      <path d="M-130 0 V-120 L0 -205 L130 -120 V0 Z" fill="#4a3a30" stroke={INK} strokeWidth="8" />
      {[-90, -60, -30].map((yy) => (
        <path key={yy} d={`M-130 ${yy} H130`} stroke="#2e231c" strokeWidth="5" />
      ))}
      <path d="M0 -205 L130 -120 V0 H60 V-150 Z" fill="#000" opacity="0.25" />
      <path d="M-150 -112 L0 -218 L150 -112 L150 -96 L0 -196 L-150 -96 Z" fill="#eef5fa" stroke={INK} strokeWidth="6" />
      <rect x="-100" y="-104" width="66" height="60" fill={lit > 0.02 ? "#d8b04e" : "#10181f"} opacity={lit > 0.02 ? 0.4 + lit * 0.6 : 1} stroke={INK} strokeWidth="6" />
      <path d="M-67 -104 V-44 M-100 -74 H-34" stroke={INK} strokeWidth="5" />
      <rect x="34" y="-78" width="54" height="78" fill="#2b2420" stroke={INK} strokeWidth="6" />
      <path d="M-110 -40 H-24" stroke="#eef5fa" strokeWidth="10" />
    </g>
    <circle cx="-67" cy="-74" r="120" fill="url(#winGlow)" opacity={lit} />
  </g>
);

/** Стаканчик лапши. Центр в (0,0), ширина ~150 при s=1. */
export const Cup = ({ x, y, s = 1, rot = 0 }: { x: number; y: number; s?: number; rot?: number }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} filter="url(#rough)" {...L}>
    <path d="M-70 -60 L70 -60 L58 62 L-58 62 Z" fill="#f2b632" stroke={INK} strokeWidth="7" />
    <path d="M-66 -22 L66 -22 L61 26 L-61 26 Z" fill="#c1272d" />
    <path d="M-44 2 C-30 -10 -18 14 -4 2 C10 -10 22 14 36 2" fill="none" stroke="#f7e08a" strokeWidth="6" />
    <path d="M18 62 L28 -60" stroke="#000" strokeWidth="40" opacity="0.12" />
    <rect x="-80" y="-74" width="160" height="16" rx="4" fill="#e7edf2" stroke={INK} strokeWidth="6" />
  </g>
);

/** Сухой брикет лапши. */
export const NoodleBrick = ({ x, y, s = 1, rot = 0 }: { x: number; y: number; s?: number; rot?: number }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} filter="url(#rough)" {...L}>
    <path d="M-60 -40 H44 L60 -24 V40 H-60 Z" fill="#f0c860" stroke={INK} strokeWidth="7" />
    {[-22, -4, 14].map((yy) => (
      <path key={yy} d={`M-52 ${yy} C-38 ${yy - 12} -24 ${yy + 12} -10 ${yy} C4 ${yy - 12} 18 ${yy + 12} 32 ${yy}`} fill="none" stroke="#b88a2a" strokeWidth="5" />
    ))}
  </g>
);

/** Открытый рюкзак Гены, доверху набитый лапшой. */
export const NoodleBackpack = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} {...L}>
    <ellipse cx="0" cy="210" rx="230" ry="26" fill="#2c4a6b" opacity="0.35" />
    <g filter="url(#rough)">
      <path d="M-190 -190 C-150 -330 150 -330 190 -190 Z" fill="#5a3520" stroke={INK} strokeWidth="8" />
      <ellipse cx="0" cy="-180" rx="200" ry="52" fill="#24150c" stroke={INK} strokeWidth="8" />
    </g>
    {[[-120, -200, -14], [-40, -230, 6], [50, -215, -4], [130, -195, 16], [-80, -175, 10], [90, -170, -12], [0, -185, 0]].map(([cx, cy, r], i) => (
      <Cup key={i} x={cx} y={cy} s={0.72} rot={r} />
    ))}
    <g filter="url(#rough)">
      <path d="M-200 -180 C-200 -130 200 -130 200 -180 C212 -40 202 120 172 200 H-172 C-202 120 -212 -40 -200 -180 Z" fill="#7a4a2a" stroke={INK} strokeWidth="8" />
      <path d="M60 -130 C140 -120 200 -100 200 -180 C212 -40 202 120 172 200 H90 C120 80 110 -40 60 -130 Z" fill="#000" opacity="0.2" />
      <rect x="-110" y="20" width="220" height="140" rx="26" fill="#6a3e22" stroke={INK} strokeWidth="7" />
      <path d="M-110 70 H110" stroke={INK} strokeWidth="6" />
    </g>
  </g>
);

/** Плашка сверху по центру (высота, дата). Плавно проявляется с момента from. */
export const Plaque = ({ t, text, from = 0.2 }: { t: number; text: string; from?: number }) => (
  <Svg>
    <g opacity={clamp((t - from) / 0.3)}>
      <rect x="370" y="150" width="340" height="80" rx="16" fill="#10161d" opacity="0.82" />
      <text x="540" y="205" textAnchor="middle" fontFamily="Arial" fontWeight="700" fontSize="44" fill="#fff">
        {text}
      </text>
    </g>
  </Svg>
);

/** Старое фото: Миша у той самой лачуги. Центр (x,y), размер ~520×640 при s=1. */
export const Photo = ({ x, y, s = 1, rot = 0, t }: { x: number; y: number; s?: number; rot?: number; t: number }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} {...L}>
    <defs>
      <clipPath id="photoClip">
        <rect x="-230" y="-290" width="460" height="460" />
      </clipPath>
      <linearGradient id="photoSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#6f93b3" />
        <stop offset="1" stopColor="#cdd9e2" />
      </linearGradient>
    </defs>
    <rect x="-262" y="-322" width="524" height="644" fill="#000" opacity="0.35" transform="translate(14 18)" />
    <rect x="-262" y="-322" width="524" height="644" fill="#efe9dc" stroke={INK} strokeWidth="6" filter="url(#rough)" />
    <g clipPath="url(#photoClip)">
      <rect x="-230" y="-290" width="460" height="460" fill="url(#photoSky)" />
      <path d="M-240 -40 L-120 -150 L-30 -80 L90 -190 L240 -60 V180 H-240 Z" fill="#a7b8c6" />
      <path d="M-240 40 C-80 0 80 20 240 -10 V180 H-240 Z" fill="#eef2f4" />
      <Shack x={110} y={30} s={0.55} lit={0} />
      {/* в тёмном окне едва видна улыбка */}
      <g opacity="0.75">
        <circle cx="73" cy="-12" r="11" fill="#8a8270" />
        <circle cx="69" cy="-15" r="1.6" fill="#111" />
        <circle cx="77" cy="-15" r="1.6" fill="#111" />
        <path d="M64 -8 Q73 -1 82 -8" fill="none" stroke="#e8e0c8" strokeWidth="2.6" />
      </g>
      {/* выцветание старого снимка; красная куртка Миши поверх — остаётся яркой */}
      <rect x="-230" y="-290" width="460" height="460" fill="#9a958c" opacity="0.45" />
      <Hero cfg={MISHA} x={-80} y={-60} s={0.3} t={t} emotion="smile" frost={0} breath={0} blinks={[]} />
    </g>
    <rect x="-230" y="-290" width="460" height="460" fill="none" stroke="#3a3328" strokeWidth="4" />
    <text x="0" y="250" textAnchor="middle" fontFamily={hand} fontWeight="700" fontSize="64" fill="#2a2a3a" transform="rotate(-3)">
      Миша, 2021
    </text>
  </g>
);

/** Примус с котелком. Пламя рисуется отдельно (StoveFlame), поверх серой палитры. */
export const Stove = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#rough)" {...L}>
    <ellipse cx="0" cy="40" rx="160" ry="22" fill="#000" opacity="0.35" />
    <path d="M-150 40 L-120 -10 H120 L150 40 Z" fill="#454e57" stroke={INK} strokeWidth="7" />
    <path d="M-30 -10 V-60 H30 V-10" fill="#6b747c" stroke={INK} strokeWidth="6" />
    <path d="M-110 -100 H110 L95 -180 H-95 Z" fill="#7b858d" stroke={INK} strokeWidth="8" />
    <path d="M-120 -180 H120" stroke={INK} strokeWidth="10" />
    <path d="M60 -150 L95 -180 L80 -100 L60 -100 Z" fill="#000" opacity="0.3" />
  </g>
);

export const StoveFlame = ({ x, y, s = 1, t }: { x: number; y: number; s?: number; t: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx="0" cy="-70" rx="120" ry="60" fill="#6fb6ff" opacity={0.18 + 0.05 * Math.sin(t * 23)} />
    {[-40, -20, 0, 20, 40].map((dx, i) => (
      <path key={dx} d={`M${dx - 9} -62 Q${dx} ${-95 - 8 * Math.sin(t * 17 + i)} ${dx + 9} -62 Z`} fill="#4aa3ff" opacity="0.9" />
    ))}
    {[0, 1, 2].map((i) => {
      const p = (t * 0.6 + i / 3) % 1;
      return <circle key={i} cx={Math.sin(t * 2 + i) * 30} cy={-200 - p * 160} r={20 + p * 30} fill="#e9eef2" opacity={0.35 * (1 - p)} />;
    })}
  </g>
);

/** Телефон в руке с холодным свечением экрана. */
export const Phone = ({ x, y, s = 1, glow = 1 }: { x: number; y: number; s?: number; glow?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} {...L}>
    <circle cx="0" cy="0" r="110" fill="#cfe2ff" opacity={0.18 * glow} />
    <rect x="-34" y="-60" width="68" height="120" rx="12" fill="#1a1f24" stroke={INK} strokeWidth="6" />
    <rect x="-26" y="-50" width="52" height="96" rx="6" fill="#bcd4ee" opacity={glow} />
  </g>
);

/** Тёмная фигура у домика: длинное пальто, медленно машет рукой. */
export const Figure = ({ x, y, s = 1, t, wave = 1 }: { x: number; y: number; s?: number; t: number; wave?: number }) => {
  const a = -150 + Math.sin(t * 2.2) * 25 * wave;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#rough)" {...L}>
      <ellipse cx="0" cy="0" rx="70" ry="12" fill="#000" opacity="0.4" />
      <path d="M-55 0 L-45 -260 C-45 -300 45 -300 45 -260 L55 0 Z" fill="#14181c" />
      <circle cx="0" cy="-330" r="42" fill="#14181c" />
      <g transform={`rotate(${a} 38 -270)`}>
        <path d="M38 -270 L38 -120" stroke="#14181c" strokeWidth="30" />
      </g>
      <path d="M-38 -270 L-50 -120" stroke="#14181c" strokeWidth="30" />
    </g>
  );
};

/** Рамка камеры REC: мигающая точка, таймкод, плашка. */
export const CameraFrame = ({ t, label }: { t: number; label?: string }) => (
  <Svg>
    <g fill="none" stroke="#fff" strokeWidth="6" opacity="0.85" {...L}>
      <path d="M50 120 V50 H120 M960 50 H1030 V120 M50 1800 V1870 H120 M960 1870 H1030 V1800" />
    </g>
    <circle cx="110" cy="110" r="16" fill="#e5262b" opacity={Math.floor(t * 2) % 2 ? 0.25 : 1} />
    <text x="145" y="124" fontFamily="Arial" fontWeight="700" fontSize="40" fill="#fff">
      REC {`00:${String(Math.floor(t)).padStart(2, "0")}`}
    </text>
    {label && (
      <g>
        <rect x="690" y="80" width="340" height="64" rx="12" fill="#10161d" opacity="0.8" />
        <text x="860" y="125" textAnchor="middle" fontFamily="Arial" fontWeight="700" fontSize="36" fill="#fff">
          {label}
        </text>
      </g>
    )}
  </Svg>
);
