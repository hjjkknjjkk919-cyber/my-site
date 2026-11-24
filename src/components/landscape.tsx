import { INK, Svg } from "./fx";

const L = { strokeLinecap: "round", strokeLinejoin: "round" } as const;
const LINE = "#25313b";

type Props = {
  t: number;
  /** сдвиг камеры по x, px: ближние слои едут сильнее (параллакс) */
  cam?: number;
  /** сила ветра 0..1: флажки, снежный шлейф с вершины */
  wind?: number;
  /** метель 0..1: дальние слои тонут в серой мгле */
  fog?: number;
  /** базовый лагерь: палатки и молитвенные флажки */
  camp?: boolean;
};

const Tent = ({ x, y, s, color }: { x: number; y: number; s: number; color: string }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} {...L}>
    <path d="M-150 0 L150 0 L260 40 L-40 40 Z" fill="#1d2b3a" opacity="0.3" />
    <path d="M-130 0 C-120 -150 120 -150 130 0 Z" fill={color} stroke={INK} strokeWidth="7" />
    <path d="M20 -110 C90 -90 125 -50 130 0 H40 C45 -40 40 -80 20 -110 Z" fill="#000" opacity="0.3" />
    <path d="M-40 0 L0 -90 L40 0 Z" fill="#141a20" stroke={INK} strokeWidth="5" />
    <path d="M-130 0 L-190 30 M130 0 L190 30" stroke={LINE} strokeWidth="3" />
  </g>
);

const FLAG_COLORS = ["#3f6fb5", "#f2f2ee", "#c8352e", "#3f8a4a", "#e2b32e"];

/** Глубокий горный фон из 5 слоёв с параллаксом, туманом и блёклым солнцем сквозь облака. */
export const Landscape = ({ t, cam = 0, wind = 0.3, fog = 0, camp = false }: Props) => {
  const plume = Math.sin(t * 1.3) * 10 * wind;
  return (
    <Svg>
      <defs>
        <linearGradient id="lsSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#66737f" />
          <stop offset="0.55" stopColor="#b7c0c7" />
        </linearGradient>
        <linearGradient id="lsFog" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dfe4e8" stopOpacity="0" />
          <stop offset="0.6" stopColor="#dfe4e8" stopOpacity="0.75" />
          <stop offset="1" stopColor="#dfe4e8" stopOpacity="0" />
        </linearGradient>
        <filter id="lsBlur" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="45" />
        </filter>
      </defs>
      <rect width={1080} height={1920} fill="url(#lsSky)" />
      {/* блёклое солнце сквозь облачность */}
      <circle cx="260" cy="300" r="170" fill="#f6f2e4" opacity={0.4 * (1 - fog)} filter="url(#lsBlur)" />
      <circle cx="260" cy="300" r="60" fill="#f6f2e4" opacity={0.35 * (1 - fog)} filter="url(#lsBlur)" />

      {/* 1. дальний пик со снежным шлейфом */}
      <g transform={`translate(${cam * 0.12} 0)`} opacity={1 - fog * 0.85} filter="url(#rough)" {...L}>
        <path d="M120 960 L430 520 L520 580 L690 300 L890 650 L1180 960 Z" fill="#98a4ae" stroke={LINE} strokeWidth="4" />
        <path d="M690 300 L890 650 L1180 960 L780 960 L740 620 Z" fill="#76838e" />
        <path d="M690 300 L630 430 L690 410 L720 480 L760 400 Z M430 520 L400 600 L450 580 Z" fill="#e9eef1" />
        <path d={`M690 300 C800 ${270 + plume} 950 ${300 - plume} 1160 ${250 + plume} C990 ${330 + plume} 830 320 700 312 Z`} fill="#eef2f4" opacity="0.55" />
      </g>
      <rect y="640" width={1080} height="420" fill="url(#lsFog)" opacity={0.7 + fog * 0.3} />

      {/* 2. средний хребет */}
      <g transform={`translate(${cam * 0.3} 0)`} opacity={1 - fog * 0.6} filter="url(#rough)" {...L}>
        <path d="M-160 1040 L80 840 L230 930 L400 780 L590 920 L790 810 L1240 1020 V1250 H-160 Z" fill="#7b8893" stroke={LINE} strokeWidth="5" />
        <path d="M400 780 L470 900 L590 920 Z M790 810 L900 930 L1240 1020 L1240 1060 L860 980 Z M80 840 L150 930 L230 930 Z" fill="#59656f" />
        <path d="M400 780 L370 850 L420 840 L440 870 L470 830 Z M790 810 L760 870 L810 860 Z" fill="#e3e9ed" />
      </g>
      <rect y="900" width={1080} height="360" fill="url(#lsFog)" opacity={0.6 + fog * 0.4} />

      {/* 3. морена / площадка лагеря */}
      <g transform={`translate(${cam * 0.6} 0)`} filter="url(#rough)" {...L}>
        <path d="M-300 1140 C100 1090 640 1130 1400 1070 V1960 H-300 Z" fill="#c4ccd2" stroke={LINE} strokeWidth="6" />
        <path d="M-300 1260 C200 1210 700 1250 1400 1190 V1960 H-300 Z" fill="#d8dfe3" />
        <path d="M-100 1420 C250 1380 600 1410 1000 1370 M0 1620 C350 1580 700 1610 1200 1570" fill="none" stroke="#b3bec6" strokeWidth="10" opacity="0.8" />
        {[[60, 1180, 1], [930, 1150, 0.8], [700, 1300, 0.7], [180, 1330, 0.6]].map(([x, y, s], i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
            <path d="M-70 0 L-40 -50 L20 -62 L70 -20 L80 0 Z" fill="#454e57" stroke={LINE} strokeWidth="6" />
            <path d="M-40 -50 L20 -62 L10 -40 L-30 -36 Z" fill="#e6ecef" />
          </g>
        ))}
      </g>

      {camp && (
        <g transform={`translate(${cam * 0.6} 0)`}>
          {/* молитвенные флажки на верёвке между шестами */}
          <path d="M110 1150 V600 M1000 1120 V640" stroke={INK} strokeWidth="9" />
          <path d="M110 610 Q555 740 1000 650" fill="none" stroke={LINE} strokeWidth="3" />
          {Array.from({ length: 14 }, (_, i) => {
            const u = (i + 0.5) / 14;
            const x = 110 + 890 * u;
            const y = (1 - u) * (1 - u) * 610 + 2 * (1 - u) * u * 740 + u * u * 650;
            const flap = Math.sin(t * 8 * (0.6 + wind) + i * 0.9) * 14 * (0.4 + wind);
            return (
              <path
                key={i}
                d={`M${x - 22} ${y} L${x + 22} ${y + 2} L${x + 22 + flap} ${y + 58} L${x - 22 + flap} ${y + 56} Z`}
                fill={FLAG_COLORS[i % 5]}
                stroke={INK}
                strokeWidth="3"
              />
            );
          })}
          <Tent x={480} y={1110} s={0.45} color="#d9732b" />
          <Tent x={640} y={1090} s={0.35} color="#e0b23a" />
          <Tent x={1010} y={1100} s={0.5} color="#3a6aa0" />
        </g>
      )}

      {/* общая серая мгла метели */}
      <rect width={1080} height={1920} fill="#d4dade" opacity={fog * 0.45} />
    </Svg>
  );
};

/** Крупные тёмные камни на переднем плане для глубины (самый быстрый слой параллакса). */
export const Foreground = ({ cam = 0 }: { cam?: number }) => (
  <Svg>
    <g transform={`translate(${cam} 0)`} filter="url(#rough)" {...L}>
      <path d="M-60 1920 L-40 1640 L120 1560 L300 1600 L380 1760 L360 1920 Z" fill="#2f363d" stroke={INK} strokeWidth="9" />
      <path d="M-40 1640 L120 1560 L300 1600 L250 1640 L100 1620 Z" fill="#e6ecef" />
      <path d="M840 1920 L880 1760 L1000 1700 L1140 1740 V1920 Z" fill="#2f363d" stroke={INK} strokeWidth="9" />
      <path d="M880 1760 L1000 1700 L1100 1730 L990 1750 Z" fill="#e6ecef" />
    </g>
  </Svg>
);
