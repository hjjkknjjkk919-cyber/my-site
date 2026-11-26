import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { MONT } from "../train/Ep1Test";

export { MONT };
export const INK = "#0c0a0e";
export const RED = "#e5262b";
export const GOLD = "#f2b632";
export const PAPER = "#efe6d2";
export const SKIN = "#e9b994";
export const SKIN_SH = "#c98d6c";
export const OL = { stroke: INK, strokeWidth: 7, strokeLinejoin: "round" as const, strokeLinecap: "round" as const, filter: "url(#pk-sh)" };

/** Длительность текущей сцены (сек) — задаётся монтажом. */
export const DurCtx = React.createContext(3);

/** Общие фильтры: мягкая тень под объектами, бумажная фактура. */
export const KitDefs = () => (
  <defs>
    <filter id="pk-sh" x="-20%" y="-20%" width="140%" height="150%">
      <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#000" floodOpacity="0.45" />
    </filter>
    <filter id="pk-tex" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves={4} seed={7} />
      <feColorMatrix type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.45  0 0 0 0 0.4  0 0 0 1.4 -0.45" />
    </filter>
    <filter id="pk-blur">
      <feGaussianBlur stdDeviation="6" />
    </filter>
  </defs>
);

export type Light = { x: number; y: number; color: string; r?: number; o?: number; rays?: boolean };

/** Световой проход: тёплый/холодный ореол, лучи, пыль в луче, затемнение углов. */
const LightPass = ({ l, t, id }: { l: Light; t: number; id: string }) => {
  const r = l.r ?? 900;
  const o = (l.o ?? 0.55) * (0.94 + 0.06 * Math.sin(t * 2.3));
  return (
    <g style={{ pointerEvents: "none" }}>
      <defs>
        <radialGradient id={`${id}-l`} cx={l.x} cy={l.y} r={r} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={l.color} stopOpacity={o} />
          <stop offset="45%" stopColor={l.color} stopOpacity={o * 0.35} />
          <stop offset="100%" stopColor={l.color} stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${id}-d`} cx={l.x} cy={l.y} r={r * 1.5} gradientUnits="userSpaceOnUse">
          <stop offset="35%" stopColor="#000" stopOpacity={0} />
          <stop offset="100%" stopColor="#000" stopOpacity={0.7} />
        </radialGradient>
      </defs>
      <rect width={1080} height={1920} fill={`url(#${id}-d)`} />
      <rect width={1080} height={1920} fill={`url(#${id}-l)`} style={{ mixBlendMode: "screen" }} />
      {l.rays &&
        [-0.5, -0.2, 0.15, 0.45].map((a, i) => (
          <path key={i} d={`M${l.x} ${l.y} L${l.x + Math.sin(a - 0.06) * 2400} ${l.y + Math.cos(a - 0.06) * 2400} L${l.x + Math.sin(a + 0.06) * 2400} ${l.y + Math.cos(a + 0.06) * 2400} Z`} fill={l.color} opacity={0.05 + 0.03 * Math.sin(t * 1.3 + i)} filter="url(#pk-blur)" style={{ mixBlendMode: "screen" }} />
        ))}
      {Array.from({ length: 26 }, (_, i) => {
        const px = l.x + Math.sin(i * 12.9) * r * 0.6 + Math.sin(t * 0.4 + i) * 30;
        const py = l.y + Math.cos(i * 7.3) * r * 0.6 - ((t * 18 + i * 37) % 120);
        return <circle key={i} cx={px} cy={py} r={1.5 + (i % 3)} fill="#fff" opacity={0.25 + 0.2 * Math.sin(t * 3 + i)} />;
      })}
      <rect width={1080} height={1920} filter="url(#pk-tex)" opacity={0.55} style={{ mixBlendMode: "multiply" }} />
    </g>
  );
};

const BZ = Easing.bezier(0.22, 1, 0.36, 1);
/** Плавная интерполяция t∈[a,b] → [from,to] с кривой (0.22, 1, 0.36, 1). */
export const ez = (t: number, a: number, b: number, from = 0, to = 1) =>
  interpolate(t, [a, b], [from, to], { easing: BZ, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

/** Локальное время сцены в секундах. */
export const useLT = () => useCurrentFrame() / 30;

/** Пружина, стартующая в момент `at` (сек, локально). */
export const useSpr = (at: number, damping = 14, stiffness = 120) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: f - Math.round(at * fps), fps, config: { damping, stiffness } });
};

/** Полотно сцены 1080×1920 с медленным наездом камеры. */
export const Stage = ({ bg, zoom = [1, 1.06], origin = [540, 960], light, children }: { bg: string; zoom?: [number, number]; dur?: number; origin?: [number, number]; light?: Light; children: React.ReactNode }) => {
  const t = useLT();
  const dur = React.useContext(DurCtx);
  const id = React.useId().replace(/:/g, "");
  const s = ez(t, 0, dur, zoom[0], zoom[1]);
  const [ox, oy] = origin;
  return (
    <AbsoluteFill style={{ background: bg }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        <KitDefs />
        <g transform={`translate(${ox} ${oy}) scale(${s}) translate(${-ox} ${-oy})`}>
          {children}
          {light && <LightPass l={light} t={t} id={id} />}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/** Мягкое световое пятно. */
export const Glow = ({ id, x, y, r, color, o = 0.6 }: { id: string; x: number; y: number; r: number; color: string; o?: number }) => (
  <>
    <defs>
      <radialGradient id={id}>
        <stop offset="0%" stopColor={color} stopOpacity={o} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </radialGradient>
    </defs>
    <circle cx={x} cy={y} r={r} fill={`url(#${id})`} />
  </>
);

/** Красный маркер, «обводящий от руки» (k: 0→1 — прогресс штриха). */
export const Marker = ({ cx, cy, rx, ry, k, color = RED, w = 8 }: { cx: number; cy: number; rx: number; ry: number; k: number; color?: string; w?: number }) => {
  if (k <= 0) return null;
  const len = Math.PI * 2 * Math.max(rx, ry) * 1.15;
  return (
    <g transform={`rotate(-3 ${cx} ${cy})`} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round">
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} strokeDasharray={`${len * k} ${len}`} />
      <ellipse cx={cx + 4} cy={cy - 3} rx={rx * 1.04} ry={ry * 0.96} strokeDasharray={`${len * Math.max(0, k - 0.15)} ${len}`} opacity={0.55} strokeWidth={w * 0.5} />
    </g>
  );
};

/** Смартфон: корпус + экран (детям доступна область 0..W × 0..H экрана). */
export const Phone = ({ x, y, s = 1, rot = 0, w = 520, h = 1040, screen = "#101418", children }: { x: number; y: number; s?: number; rot?: number; w?: number; h?: number; screen?: string; children?: React.ReactNode }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s}) translate(${-w / 2} ${-h / 2})`}>
    <rect x={-22} y={-22} width={w + 44} height={h + 44} rx={70} fill="#16161a" {...OL} />
    <rect width={w} height={h} rx={52} fill={screen} />
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} overflow="hidden">
      {children}
    </svg>
    <rect x={w / 2 - 70} y={14} width={140} height={34} rx={17} fill="#050507" />
  </g>
);

/** Звуковая волна-столбики (amp: 0..1, flat: 0..1 — переход в ровную линию). */
export const Wave = ({ t, x, y, w, h, n = 42, amp = 1, flat = 0, color = RED }: { t: number; x: number; y: number; w: number; h: number; n?: number; amp?: number; flat?: number; color?: string }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const v = Math.abs(Math.sin(t * 9 + i * 0.7) * Math.sin(t * 3.3 + i * 0.23)) * 0.85 + 0.15 * Math.abs(Math.sin(i * 1.7 + t * 23));
      const bh = Math.max(4, h * v * amp * (1 - flat));
      const bw = (w / n) * 0.62;
      return <rect key={i} x={x + (i * w) / n} y={y - bh / 2} width={bw} height={bh} rx={bw / 2} fill={color} />;
    })}
  </g>
);

/** Пузырь сообщения в чате. */
export const Bubble = ({ x, y, w, name, nameColor, lines, time, k, mine = false }: { x: number; y: number; w: number; name?: string; nameColor?: string; lines: React.ReactNode[]; time: string; k: number; mine?: boolean }) => {
  const h = (name ? 54 : 24) + lines.length * 42 + 30;
  return (
    <g opacity={k} transform={`translate(${x} ${y + (1 - k) * 40})`}>
      <rect width={w} height={h} rx={22} fill={mine ? "#2b5278" : "#1f2a36"} />
      {name && (
        <text x={22} y={40} fontFamily={MONT} fontWeight={800} fontSize={26} fill={nameColor}>
          {name}
        </text>
      )}
      {lines.map((l, i) => (
        <text key={i} x={22} y={(name ? 86 : 52) + i * 42} fontFamily={MONT} fontWeight={600} fontSize={30} fill="#eef2f6">
          {l}
        </text>
      ))}
      <text x={w - 18} y={h - 12} textAnchor="end" fontFamily={MONT} fontSize={20} fill="#8fa3b5">
        {time}
      </text>
    </g>
  );
};

/** Шапка Telegram-подобного чата. */
export const ChatHeader = ({ w, title, sub, avatar, color }: { w: number; title: string; sub: string; avatar: string; color: string }) => (
  <g>
    <rect width={w} height={170} fill="#17212b" />
    <circle cx={92} cy={112} r={40} fill={color} />
    <text x={92} y={124} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={32} fill="#fff">
      {avatar}
    </text>
    <text x={152} y={106} fontFamily={MONT} fontWeight={800} fontSize={32} fill="#fff">
      {title}
    </text>
    <text x={152} y={144} fontFamily={MONT} fontSize={24} fill="#7f97ab">
      {sub}
    </text>
  </g>
);

/** Кисть руки (ладонь + пальцы), смотрит вверх; s — масштаб. */
/** Палец из трёх фаланг: сгибы, ноготь, тень сбоку и рефлекс света. Основание в (0,0), растёт вверх. */
const Finger = ({ x, y, len, w, rot = 0, bend = 0 }: { x: number; y: number; len: number; w: number; rot?: number; bend?: number }) => {
  const seg = [len * 0.42, len * 0.32, len * 0.26];
  const piece = (h: number, ww: number, tip: boolean) =>
    tip ? `M${-ww / 2} 0 L${-ww * 0.46} ${-h + ww * 0.5} Q0 ${-h - ww * 0.15} ${ww * 0.46} ${-h + ww * 0.5} L${ww / 2} 0 Z` : `M${-ww / 2} 2 L${-ww * 0.47} ${-h - 2} L${ww * 0.47} ${-h - 2} L${ww / 2} 2 Z`;
  let acc = 0;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      {seg.map((h, i) => {
        const ww = w * (1 - i * 0.08);
        const g = (
          <g key={i} transform={`translate(0 ${-acc}) rotate(${bend * i})`}>
            <path d={piece(h, ww, i === 2)} fill={SKIN} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
            <path d={`M${ww * 0.16} 0 L${ww * 0.2} ${-h + (i === 2 ? ww * 0.5 : 0)} L${ww * 0.47} ${-h + (i === 2 ? ww * 0.5 : 0)} L${ww / 2} 0 Z`} fill={SKIN_SH} opacity={0.55} />
            <path d={`M${-ww * 0.36} -4 L${-ww * 0.34} ${-h + 6}`} stroke="#ffe3cf" strokeWidth={3} opacity={0.7} strokeLinecap="round" />
            {i < 2 && <path d={`M${-ww * 0.3} ${-h + 3} q${ww * 0.3} 6 ${ww * 0.6} 0`} stroke="#9a6a54" strokeWidth={2.5} fill="none" />}
            {i === 2 && <path d={`M${-ww * 0.3} ${-h + ww * 0.95} L${-ww * 0.3} ${-h + ww * 0.42} Q0 ${-h + ww * 0.05} ${ww * 0.3} ${-h + ww * 0.42} L${ww * 0.3} ${-h + ww * 0.95} Q0 ${-h + ww * 1.08} ${-ww * 0.3} ${-h + ww * 0.95} Z`} fill="#f4d4c2" stroke="#a7786a" strokeWidth={2} />}
            {i === 2 && <path d={`M${-ww * 0.14} ${-h + ww * 0.5} l0 ${ww * 0.3}`} stroke="#fff" strokeWidth={2.5} opacity={0.8} strokeLinecap="round" />}
          </g>
        );
        acc += h - 2;
        return g;
      })}
    </g>
  );
};

/** Анатомическая кисть (ладонью к зрителю, пальцы вверх). */
export const Hand = ({ x, y, s = 1, rot = 0, sleeve = "#3b4250", curl = 0 }: { x: number; y: number; s?: number; rot?: number; sleeve?: string; curl?: number }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} filter="url(#pk-sh)">
    <path d="M-92 270 L-82 128 L82 128 L92 270 Z" fill={sleeve} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <path d="M-82 128 L82 128 L84 150 L-84 150 Z" fill="#000" opacity={0.28} />
    {[-50, -16, 18, 52].map((rx) => <path key={rx} d={`M${rx} 160 l3 100`} stroke="#000" strokeWidth={3} opacity={0.22} />)}
    {/* пальцы: длины и наклоны как у настоящей кисти */}
    {[
      [-50, -22, 128, 30, -6],
      [-17, -32, 150, 32, -2],
      [17, -30, 140, 31, 2],
      [48, -16, 112, 27, 8],
    ].map(([fx, fy, len, w, r], i) => (
      <Finger key={i} x={fx} y={fy} len={len} w={w} rot={r} bend={curl * (i % 2 ? 1 : -1) * 4} />
    ))}
    {/* ладонь */}
    <path d="M-72 132 C-86 80 -84 20 -66 -22 C-30 -36 30 -36 66 -18 C82 20 84 80 72 132 Z" fill={SKIN} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <path d="M30 -24 C66 -14 82 30 80 80 C78 110 74 124 72 132 L50 132 C64 90 60 20 30 -24 Z" fill={SKIN_SH} opacity={0.6} />
    {/* костяшки и тени между пальцами */}
    {[-50, -17, 17, 48].map((kx, i) => (
      <g key={i}>
        <path d={`M${kx - 12} ${-24 - (i === 1 || i === 2 ? 6 : 0)} q12 -8 24 0`} stroke="#9a6a54" strokeWidth={3} fill="none" />
        {i < 3 && <path d={`M${kx + 16} -26 l2 18`} stroke="#7a4a3a" strokeWidth={5} opacity={0.5} strokeLinecap="round" />}
      </g>
    ))}
    <path d="M-48 40 C-10 64 30 60 58 34 M-40 84 C-6 98 24 96 40 80" stroke="#a8735c" strokeWidth={3} fill="none" opacity={0.7} />
    <path d="M-66 -10 C-80 40 -80 90 -70 128" stroke="#ffe3cf" strokeWidth={4} fill="none" opacity={0.6} />
    {/* большой палец */}
    <g transform="translate(-66 70) rotate(-48)">
      <path d="M-20 0 L-18 -70 Q0 -100 18 -70 L22 0 Z" fill={SKIN} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d="M8 0 L10 -66 Q16 -76 18 -70 L22 0 Z" fill={SKIN_SH} opacity={0.55} />
      <path d="M-12 -50 L-12 -74 Q0 -92 12 -74 L12 -50 Q0 -44 -12 -50 Z" fill="#f4d4c2" stroke="#a7786a" strokeWidth={2} />
      <path d="M-14 -30 q14 6 28 0" stroke="#9a6a54" strokeWidth={2.5} fill="none" />
    </g>
  </g>
);

/** Золотая серёжка с зелёным камнем. */
export const Earring = ({ x, y, s = 1, shine = 0 }: { x: number; y: number; s?: number; shine?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M0 -70 C-26 -70 -26 -40 0 -40" fill="none" stroke="#c8901c" strokeWidth={9} strokeLinecap="round" />
    <circle cx={0} cy={-34} r={9} fill={GOLD} stroke={INK} strokeWidth={4} />
    <path d="M0 -26 L26 8 L0 50 L-26 8 Z" fill={GOLD} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M0 -10 L14 10 L0 34 L-14 10 Z" fill="#1fae5b" stroke="#0b4d27" strokeWidth={3} />
    <path d="M-5 0 L2 4 L-3 14 Z" fill="#c8ffd9" opacity={0.9} />
    {shine > 0 && (
      <g opacity={shine} stroke="#fff6d0" strokeWidth={4} strokeLinecap="round">
        <path d="M30 -30 L30 -6 M18 -18 L42 -18" />
        <path d="M-34 24 L-34 40 M-42 32 L-26 32" />
      </g>
    )}
  </g>
);

/** Тарелка пельменей с паром. */
export const Dumplings = ({ x, y, s = 1, t, n = 7, steam = 1 }: { x: number; y: number; s?: number; t: number; n?: number; steam?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={18} rx={250} ry={92} fill="#d9d4c8" {...OL} />
    <ellipse cx={0} cy={10} rx={190} ry={62} fill="#efebe2" stroke="#b9b2a2" strokeWidth={4} />
    {Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      const px = i === n - 1 ? 0 : Math.cos(a) * 110;
      const py = i === n - 1 ? 0 : Math.sin(a) * 34;
      return (
        <g key={i} transform={`translate(${px} ${py - 6})`}>
          <path d="M-46 8 C-46 -30 46 -30 46 8 C30 18 -30 18 -46 8 Z" fill="#f6ecd6" {...OL} strokeWidth={5} />
          <path d="M-30 -8 q8 -8 16 0 q8 -8 16 0 q8 -8 16 0" fill="none" stroke="#c9b899" strokeWidth={3} />
        </g>
      );
    })}
    {steam > 0 &&
      [-80, 0, 80].map((sx, i) => (
        <path
          key={i}
          d={`M${sx} -40 C${sx - 30} -90 ${sx + 30} -130 ${sx} -180 C${sx - 26} -220 ${sx + 20} -250 ${sx} -290`}
          fill="none"
          stroke="#ffffff"
          strokeWidth={10}
          strokeLinecap="round"
          opacity={steam * (0.22 + 0.12 * Math.sin(t * 3 + i))}
          transform={`translate(${Math.sin(t * 1.6 + i) * 12} ${-((t * 30 + i * 40) % 40)})`}
        />
      ))}
  </g>
);

/** Фото пропавшей (Тамара Ильинична): седые волосы в пучок, очки. */
export const Tamara = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-110} y={-130} width={220} height={260} fill="#c9c3b4" {...OL} strokeWidth={5} />
    <path d="M-80 130 C-80 60 80 60 80 130 Z" fill="#6e4a5a" />
    <ellipse cx={0} cy={-20} rx={56} ry={66} fill={SKIN} stroke={INK} strokeWidth={5} />
    <path d="M-60 -30 C-64 -100 64 -100 60 -30 C40 -70 -40 -70 -60 -30 Z" fill="#b9b6b0" stroke={INK} strokeWidth={5} />
    <circle cx={0} cy={-98} r={22} fill="#b9b6b0" stroke={INK} strokeWidth={5} />
    <circle cx={-22} cy={-18} r={15} fill="none" stroke={INK} strokeWidth={4} />
    <circle cx={22} cy={-18} r={15} fill="none" stroke={INK} strokeWidth={4} />
    <path d="M-20 22 q20 10 40 0" fill="none" stroke={INK} strokeWidth={4} />
    <Earring x={-58} y={14} s={0.32} />
    <Earring x={58} y={14} s={0.32} />
  </g>
);
