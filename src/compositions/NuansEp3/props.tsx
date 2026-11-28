import React from "react";
import { MONT } from "../../pelmeni/kit";
import { LINE } from "../AvitoWardrobe/rig";

const O = { stroke: LINE, strokeWidth: 3, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
const rnd = (i: number) => {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

/* ════ предметы в руке (точка хвата — 0,0; предмет всегда вертикален) ════ */
export const MugP = ({ t, ice = 0 }: { t: number; ice?: number }) => (
  <g transform="translate(4 -26)">
    <path d="M0 6 C-18 6 -18 34 0 34" fill="none" stroke={LINE} strokeWidth={7} />
    <path d="M0 6 C-18 6 -18 34 0 34" fill="none" stroke="#f4f4f2" strokeWidth={3} />
    <rect x={0} y={-6} width={56} height={58} rx={7} fill="#f4f4f2" {...O} />
    <text x={28} y={16} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={11} fill="#111">МНЕ</text>
    <text x={28} y={32} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={11} fill="#c1121f">ПОХУЙ</text>
    {ice < 0.3 &&
      [0, 1, 2].map((i) => {
        const ph = (t * 0.6 + i * 0.33) % 1;
        return <path key={i} d={`M${14 + i * 14} ${-10 - ph * 70} q${8 * Math.sin(t * 3 + i)} -14 0 -28`} stroke="#fff" strokeWidth={5} fill="none" opacity={(1 - ph) * 0.6} strokeLinecap="round" />;
      })}
    {ice > 0 && (
      <g opacity={ice}>
        <rect x={-2} y={-8} width={60} height={14} rx={6} fill="#dff3ff" opacity={0.85} />
        {[4, 14, 26, 38, 50].map((x, i) => <path key={i} d={`M${x} 50 l4 ${14 + (i % 3) * 8} l4 ${-14 - (i % 3) * 8} Z`} fill="#dff3ff" stroke="#7fc4f0" strokeWidth={1.5} />)}
      </g>
    )}
  </g>
);

export const Mop = ({ len = 380, t = 0 }: { len?: number; t?: number }) => (
  <g>
    <rect x={-6} y={-200} width={12} height={200 + len} rx={6} fill="#c9a26a" {...O} />
    <g transform={`translate(0 ${len}) rotate(${Math.sin(t * 6) * 6})`}>
      <rect x={-50} y={-8} width={100} height={16} rx={6} fill="#5a6a7a" {...O} />
      {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${-44 + i * 11} 6 q${Math.sin(t * 8 + i) * 4} 14 ${2} 26`} stroke="#d8d4c8" strokeWidth={7} strokeLinecap="round" fill="none" />)}
    </g>
  </g>
);

export const Umbrella = ({ open }: { open: number }) => (
  <g>
    <path d="M0 0 C0 18 -14 22 -18 10" stroke="#3b2a1e" strokeWidth={7} fill="none" strokeLinecap="round" />
    <rect x={-4} y={-300} width={8} height={300} fill="#2b2b30" {...O} />
    {open < 0.05 ? (
      <path d="M0 -300 L-14 -110 L14 -110 Z" fill="#1e3a6e" {...O} />
    ) : (
      <g transform={`translate(0 -300) scale(${0.25 + 0.75 * open} ${0.4 + 0.6 * open})`}>
        <path d="M-210 40 C-200 -110 200 -110 210 40 C180 20 150 20 126 40 C100 20 70 20 42 40 C14 20 -14 20 -42 40 C-70 20 -100 20 -126 40 C-150 20 -180 20 -210 40 Z" fill="#1e3a6e" {...O} />
        {[-126, -42, 42, 126].map((x) => <path key={x} d={`M0 -70 Q${x * 0.6} -40 ${x} 40`} stroke="#14294f" strokeWidth={4} fill="none" />)}
        <path d="M-150 -30 C-90 -80 -20 -86 30 -84" stroke="#5b8de0" strokeWidth={8} fill="none" opacity={0.6} strokeLinecap="round" />
      </g>
    )}
  </g>
);

export const RollingPin = () => (
  <g transform="rotate(-70)">
    <rect x={-120} y={-16} width={240} height={32} rx={16} fill="#d9a968" {...O} />
    <rect x={-150} y={-8} width={34} height={16} rx={8} fill="#b07a40" {...O} />
    <rect x={116} y={-8} width={34} height={16} rx={8} fill="#b07a40" {...O} />
    <path d="M-100 -6 H100" stroke="#f0cf96" strokeWidth={4} />
  </g>
);

export const Money = ({ t }: { t: number }) => (
  <g transform="translate(6 -10)">
    {[-16, -6, 4].map((r, i) => (
      <g key={i} transform={`rotate(${r + Math.sin(t * 9 + i) * 4})`}>
        <rect x={-6} y={-62} width={36} height={64} rx={3} fill="#c58b5b" stroke="#6d4a2a" strokeWidth={2} />
        <text x={12} y={-26} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={12} fill="#6d4a2a">5000</text>
      </g>
    ))}
  </g>
);

export const Barsetka = () => (
  <g>
    <path d="M-6 0 L-10 30 M6 0 L10 30" stroke="#1a1a1a" strokeWidth={4} />
    <rect x={-34} y={28} width={68} height={52} rx={8} fill="#2a1d16" {...O} />
    <rect x={-8} y={46} width={16} height={8} rx={2} fill="#c9a24a" />
  </g>
);

export const Radio = () => (
  <g transform="translate(4 -40)">
    <rect x={-12} y={0} width={30} height={56} rx={5} fill="#111" {...O} />
    <rect x={10} y={-26} width={5} height={28} fill="#111" />
    <circle cx={3} cy={14} r={4} fill={"#2ecc71"} />
  </g>
);

export const Chicken = ({ rot = 0 }: { rot?: number }) => (
  <g transform={`rotate(${rot})`}>
    <ellipse cx={0} cy={0} rx={56} ry={38} fill="#f2e2c9" {...O} />
    {[-1, 1].map((d) => (
      <g key={d}>
        <path d={`M${d * 30} 20 L${d * 48} 56`} stroke="#f2e2c9" strokeWidth={18} strokeLinecap="round" />
        <path d={`M${d * 30} 20 L${d * 48} 56`} stroke={LINE} strokeWidth={3} fill="none" opacity={0} />
        <circle cx={d * 50} cy={60} r={9} fill="#fff" {...O} />
      </g>
    ))}
    <path d="M-40 -10 C-20 -24 20 -24 40 -10" stroke="#fff" strokeWidth={6} fill="none" opacity={0.7} />
    <rect x={-30} y={-8} width={60} height={22} rx={4} fill="#dff3ff" opacity={0.5} />
  </g>
);

/* ════ холодильник Валеры ════ */
export const Fridge = ({ x, door = 0, top = 0, t, shake = 0 }: { x: number; door?: number; top?: number; t: number; shake?: number }) => {
  const W = 250;
  const sh = shake * Math.sin(t * 60) * 3;
  return (
    <g transform={`translate(${x + sh} 1430)`}>
      <ellipse cx={0} cy={4} rx={150} ry={12} fill="#000" opacity={0.35} />
      <rect x={-W / 2} y={-640} width={W} height={630} rx={26} fill="#d8d4c6" {...O} />
      <rect x={W / 2 - 40} y={-630} width={30} height={610} rx={14} fill="#bdb8a8" opacity={0.8} />
      {/* ржавчина */}
      {Array.from({ length: 9 }, (_, i) => <ellipse key={i} cx={-W / 2 + 30 + rnd(i) * 180} cy={-600 + rnd(i + 9) * 570} rx={8 + rnd(i + 3) * 18} ry={5 + rnd(i + 5) * 10} fill="#9a5a2a" opacity={0.55} />)}
      <path d={`M${-W / 2} -440 H${W / 2}`} stroke={LINE} strokeWidth={3} />
      {/* наклейка */}
      <g transform="translate(-30 -330) rotate(-4)">
        <rect x={-74} y={-40} width={150} height={84} rx={8} fill="#ffd21f" {...O} />
        <text x={0} y={-8} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={26} fill="#c1121f">−600°C</text>
        <text x={0} y={18} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={13} fill="#111">ОСТОРОЖНО,</text>
        <text x={0} y={34} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={13} fill="#111">МАТЕРИТСЯ</text>
      </g>
      <rect x={W / 2 - 34} y={-420} width={12} height={110} rx={6} fill="#8d8a80" {...O} />
      {/* морозилка: пустая чёрно-синяя камера, когда дверца открыта (открывается на нас, петли слева) */}
      <rect x={-W / 2 + 12} y={-628} width={W - 24} height={176} rx={14} fill="#0e2033" {...O} />
      <rect x={-W / 2 + 12} y={-628} width={W - 24} height={176} rx={14} fill="#5dade2" opacity={0.18 + 0.1 * Math.sin(t * 5) * (top > 0 ? 1 : 0)} />
      <g transform={`translate(${-W / 2} 0) scale(${Math.cos((top * Math.PI) / 2) * 0.98 + 0.02} 1)`}>
        <rect x={0} y={-640} width={W} height={196} rx={26} fill="#e0dccf" {...O} />
        <rect x={W - 34} y={-560} width={12} height={70} rx={6} fill="#8d8a80" {...O} />
        <rect x={20} y={-622} width={W - 70} height={26} rx={8} fill="#f0ede4" opacity={0.6} />
      </g>
      {door > 0 && <rect x={-W / 2} y={-440} width={W * door * 0.2} height={430} fill="#000" opacity={0} />}
      {[-1, 1].map((d) => <rect key={d} x={d * 90 - 12} y={-14} width={24} height={14} fill="#555" {...O} />)}
    </g>
  );
};

/* ════ детальная кухня хрущёвки, пол y=1430 ════ */
export const DetailedKitchen2D = ({ t, meter = 0, doorOpen = 0, drip = 1, frost = 0 }: { t: number; meter?: number; doorOpen?: number; drip?: number; frost?: number }) => {
  const dial = ((t * (8 + meter * 160)) % 1) * 360;
  return (
    <g>
      <defs>
        <pattern id="k3wall" width={120} height={150} patternUnits="userSpaceOnUse">
          <rect width={120} height={150} fill="#b8a77e" />
          <path d="M60 20 c-14 10 -14 30 0 40 c14 -10 14 -30 0 -40 Z M0 95 c-14 10 -14 30 0 40 c14 -10 14 -30 0 -40 Z M120 95 c-14 10 -14 30 0 40 c14 -10 14 -30 0 -40 Z" fill="#a39168" />
          <circle cx={60} cy={110} r={5} fill="#9c8a62" />
          <circle cx={0} cy={35} r={5} fill="#9c8a62" />
          <circle cx={120} cy={35} r={5} fill="#9c8a62" />
        </pattern>
        <pattern id="k3tile" width={60} height={60} patternUnits="userSpaceOnUse">
          <rect width={60} height={60} fill="#e8eef0" stroke="#b9c3c8" strokeWidth={3} />
        </pattern>
        <pattern id="k3lino" width={120} height={120} patternUnits="userSpaceOnUse">
          <rect width={120} height={120} fill="#8b6d4a" />
          <rect width={60} height={60} fill="#a2835c" />
          <rect x={60} y={60} width={60} height={60} fill="#a2835c" />
        </pattern>
        <linearGradient id="k3night" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a1328" />
          <stop offset="1" stopColor="#24375e" />
        </linearGradient>
      </defs>
      {/* стены: облезлые обои, потёртости, отошедший уголок */}
      <rect width={1080} height={1430} fill="url(#k3wall)" />
      <rect width={1080} height={1430} fill="#2a1e10" opacity={0.18} />
      {Array.from({ length: 10 }, (_, i) => <ellipse key={i} cx={rnd(i) * 1080} cy={200 + rnd(i + 20) * 900} rx={30 + rnd(i + 3) * 60} ry={14 + rnd(i + 7) * 30} fill="#6a5a3a" opacity={0.16} />)}
      <path d="M40 160 L150 160 L110 250 Z" fill="#d8c9a0" stroke="#7a6a4a" strokeWidth={2} />
      <path d="M40 160 L110 250 L40 250 Z" fill="#7e6c48" opacity={0.6} />
      {/* окно: ночные панельки и снег */}
      <g>
        <rect x={360} y={300} width={360} height={460} fill="url(#k3night)" stroke="#e9e4d4" strokeWidth={22} />
        {Array.from({ length: 4 }, (_, b) => (
          <g key={b}>
            <rect x={380 + b * 90} y={460 + (b % 2) * 60} width={70} height={300} fill="#141d33" />
            {Array.from({ length: 12 }, (_, w) => <rect key={w} x={388 + b * 90 + (w % 3) * 20} y={480 + (b % 2) * 60 + Math.floor(w / 3) * 50} width={12} height={16} fill={rnd(b * 12 + w) > 0.6 ? "#ffd27a" : "#1d2a48"} />)}
          </g>
        ))}
        {Array.from({ length: 26 }, (_, i) => <circle key={i} cx={370 + ((rnd(i) * 340 + t * 20 * (0.5 + rnd(i + 2))) % 340)} cy={310 + ((rnd(i + 5) * 440 + t * 70 * (0.6 + rnd(i + 3))) % 440)} r={2 + rnd(i + 8) * 3} fill="#fff" opacity={0.85} />)}
        <path d="M540 300 V760 M360 520 H720" stroke="#e9e4d4" strokeWidth={14} />
        <rect x={340} y={760} width={400} height={34} fill="#efe9d8" {...O} />
        {/* подоконник: кактус, соленья, пепельница */}
        <g transform="translate(410 760)">
          <path d="M-22 0 L-18 -40 L18 -40 L22 0 Z" fill="#b5532a" {...O} />
          <path d="M0 -40 C-10 -90 10 -110 6 -130 C14 -110 18 -80 8 -40 Z" fill="#3f8f4a" {...O} />
          <path d="M-4 -80 C-24 -84 -26 -100 -22 -110" stroke="#3f8f4a" strokeWidth={10} fill="none" strokeLinecap="round" />
        </g>
        {[520, 580].map((x, i) => (
          <g key={x} transform={`translate(${x} 760)`}>
            <rect x={-22} y={-70} width={44} height={70} rx={8} fill="#cfe8c8" opacity={0.75} {...O} />
            <rect x={-24} y={-80} width={48} height={14} rx={4} fill="#c9a24a" {...O} />
            {[0, 1, 2].map((k) => <ellipse key={k} cx={-8 + k * 8 + i * 2} cy={-40 + k * 10} rx={9} ry={14} fill="#5a8a3a" />)}
          </g>
        ))}
        <ellipse cx={670} cy={754} rx={30} ry={9} fill="#7d8a96" {...O} />
        <path d="M660 748 l22 -10" stroke="#ddd" strokeWidth={4} />
      </g>
      {/* кафельный фартук с трещинами и жирными пятнами */}
      <rect x={0} y={880} width={700} height={240} fill="url(#k3tile)" />
      <path d="M130 900 l30 50 l-14 40 M520 960 l40 30 l10 50" stroke="#7a8a90" strokeWidth={3} fill="none" />
      {[120, 180, 230].map((x, i) => <ellipse key={x} cx={x} cy={960 + i * 30} rx={26} ry={14} fill="#c9a24a" opacity={0.28} />)}
      {/* электросчётчик над дверью */}
      <g transform="translate(940 470)">
        <rect x={-70} y={-80} width={140} height={160} rx={10} fill="#d9d4c4" {...O} />
        <rect x={-50} y={-60} width={100} height={30} rx={4} fill="#120404" />
        <text x={0} y={-38} textAnchor="middle" fontFamily="monospace" fontWeight={900} fontSize={22} fill="#ff2a2a" style={{ filter: "drop-shadow(0 0 6px #ff0000)" }}>99999</text>
        <text x={44} y={-14} fontFamily={MONT} fontWeight={800} fontSize={11} fill="#333">кВт</text>
        <circle cx={0} cy={30} r={30} fill="#eee" {...O} />
        <g transform={`rotate(${dial} 0 30)`}>
          <rect x={-28} y={27} width={56} height={6} fill="#555" />
          <rect x={20} y={26} width={10} height={8} fill="#e00" />
        </g>
      </g>
      {/* дверь в коридор */}
      <g>
        <rect x={880} y={620} width={200} height={810} fill="#2b1d14" />
        <g transform={`translate(880 620) scale(${1 - doorOpen * 0.85} 1)`}>
          <rect x={0} y={0} width={200} height={810} fill="#8a6a4a" {...O} />
          <rect x={26} y={40} width={148} height={300} fill="#7a5a3a" {...O} />
          <rect x={26} y={400} width={148} height={360} fill="#7a5a3a" {...O} />
          <circle cx={30} cy={430} r={10} fill="#c9a24a" {...O} />
        </g>
        <rect x={868} y={608} width={14} height={822} fill="#d9d0bc" {...O} />
      </g>
      {/* плита с закопчённым чайником + клетчатое полотенце */}
      <g transform="translate(160 1430)">
        <rect x={-130} y={-340} width={260} height={340} fill="#e9e6dc" {...O} />
        <rect x={-130} y={-360} width={260} height={24} fill="#d4d0c4" {...O} />
        <rect x={-100} y={-230} width={200} height={170} rx={8} fill="#2b2d33" {...O} />
        <rect x={-86} y={-214} width={172} height={120} rx={6} fill="#4a4d55" opacity={0.6} />
        {[-60, -20, 20, 60].map((x) => <circle key={x} cx={x} cy={-300} r={10} fill="#333" {...O} />)}
        <g transform="translate(-50 -360)">
          <path d="M-46 0 C-50 -50 50 -50 46 0 Z" fill="#4a4a4a" {...O} />
          <path d="M-10 -40 C-6 -60 6 -60 10 -40" fill="none" stroke="#222" strokeWidth={6} />
          <path d="M40 -16 L74 -36" stroke="#4a4a4a" strokeWidth={12} strokeLinecap="round" />
          <ellipse cx={0} cy={-14} rx={36} ry={12} fill="#1a1a1a" opacity={0.5} />
        </g>
        <path d="M-60 -60 h80 v130 h-80 Z" fill="#fff" opacity={0} />
        <g transform="translate(40 -210)">
          <rect x={0} y={0} width={70} height={120} fill="#c1121f" {...O} />
          {[0, 1, 2, 3].map((i) => <path key={i} d={`M0 ${15 + i * 30} H70 M${8 + i * 18} 0 V120`} stroke="#fff" strokeWidth={6} opacity={0.75} />)}
        </g>
      </g>
      {/* раковина с горой посуды и капающим краном */}
      <g transform="translate(470 1430)">
        <rect x={-150} y={-320} width={300} height={320} fill="#cfc6b0" {...O} />
        <rect x={-160} y={-340} width={320} height={26} fill="#b8b0a0" {...O} />
        <path d="M-120 -340 L-110 -300 L110 -300 L120 -340 Z" fill="#9aa3a8" {...O} />
        <path d="M60 -340 V-400 C60 -420 20 -420 20 -400" fill="none" stroke="#9aa3a8" strokeWidth={12} strokeLinecap="round" />
        {drip > 0 && <ellipse cx={20} cy={-390 + ((t * 1.1) % 1) * 60} rx={5} ry={7} fill="#7fc4f0" opacity={1 - ((t * 1.1) % 1) * 0.6} />}
        {[[-80, -350], [-40, -362], [10, -356], [-100, -372]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={46} ry={12} fill={["#f4f4f2", "#e8e2d4", "#f4f4f2", "#d9e4ec"][i]} {...O} />)}
        <path d="M30 -360 C30 -330 110 -330 110 -360 Z" fill="#333" {...O} />
        <path d="M110 -352 L160 -370" stroke="#222" strokeWidth={10} strokeLinecap="round" />
        <rect x={-130} y={-400} width={36} height={40} rx={6} fill="#f4f4f2" {...O} />
        <rect x={-120} y={-200} width={240} height={180} fill="#bfb59c" {...O} />
        <path d="M0 -200 V-20" stroke={LINE} strokeWidth={3} />
      </g>
      {/* стол с клеёнкой, солонка, крошки, пустая пачка пельменей */}
      <g transform="translate(680 1430)">
        <path d="M-90 -250 L90 -250 L104 -210 L-104 -210 Z" fill="#d94d4d" {...O} />
        {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={-80 + i * 32} cy={-232} r={6} fill="#fff" opacity={0.7} />)}
        <rect x={-90} y={-210} width={14} height={210} fill="#7a5a3a" {...O} />
        <rect x={76} y={-210} width={14} height={210} fill="#7a5a3a" {...O} />
        <rect x={-60} y={-286} width={18} height={34} rx={4} fill="#eee" {...O} />
        <g transform="translate(20 -270) rotate(-12)">
          <rect x={-34} y={-22} width={68} height={40} rx={4} fill="#ffe08a" {...O} />
          <text x={0} y={2} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={11} fill="#c1121f">ПЕЛЬМЕНИ</text>
        </g>
        {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={-40 + rnd(i) * 100} cy={-254 + rnd(i + 4) * 4} r={2} fill="#c9a24a" />)}
      </g>
      {/* линолеум в клетку + плинтус ровно по y=1430 */}
      <g>
        <path d="M0 1430 H1080 V1920 H0 Z" fill="url(#k3lino)" />
        <path d="M0 1430 H1080 V1920 H0 Z" fill="#000" opacity={0.2} />
        {Array.from({ length: 7 }, (_, i) => <ellipse key={i} cx={rnd(i + 40) * 1080} cy={1500 + rnd(i + 50) * 380} rx={60} ry={14} fill="#5a4630" opacity={0.25} />)}
        <rect x={0} y={1416} width={1080} height={18} fill="#6a5038" {...O} />
      </g>
      {/* общий иней на стенах при морозе */}
      {frost > 0 && <rect width={1080} height={1430} fill="#bfe6ff" opacity={0.18 * frost} />}
    </g>
  );
};

/* ════ входной холл ночного гипермаркета ════ */
export const HyperHall = ({ t }: { t: number }) => (
  <g>
    <rect width={1080} height={1430} fill="#232a36" />
    {/* потолок с лампами */}
    {[0, 1, 2, 3].map((i) => <rect key={i} x={60 + i * 260} y={70} width={180} height={18} rx={6} fill="#fdf6d8" opacity={0.85} />)}
    {/* стеклянные двери, снаружи заваливает метелью */}
    <g>
      <rect x={250} y={420} width={580} height={1010} fill="#0d1626" stroke="#9aa3b0" strokeWidth={16} />
      <path d="M540 420 V1430" stroke="#9aa3b0" strokeWidth={12} />
      <path d={`M258 ${1430 - 260 - Math.min(300, t * 30)} C400 ${1380 - 300 - Math.min(300, t * 30)} 680 ${1400 - 340 - Math.min(300, t * 30)} 822 ${1430 - 300 - Math.min(300, t * 30)} L822 1430 L258 1430 Z`} fill="#e8f2fb" opacity={0.92} />
      {Array.from({ length: 40 }, (_, i) => <circle key={i} cx={260 + ((rnd(i) * 560 + t * 160 * (0.5 + rnd(i + 1))) % 560)} cy={430 + ((rnd(i + 2) * 990 + t * 120 * (0.6 + rnd(i + 3))) % 990)} r={2 + rnd(i + 4) * 4} fill="#fff" opacity={0.8} />)}
      <rect x={250} y={420} width={580} height={1010} fill="#9fc4ff" opacity={0.07} />
      <rect x={330} y={330} width={420} height={70} rx={10} fill="#c1121f" {...O} />
      <text x={540} y={378} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={40} fill="#fff">ГИПЕРМАРКЕТ 24</text>
    </g>
    {/* торговые холодильники по бокам */}
    {[0, 1].map((side) => (
      <g key={side} transform={`translate(${side ? 880 : 0} 0)`}>
        <rect x={0} y={760} width={200} height={670} fill="#d9dee6" {...O} />
        <rect x={14} y={780} width={172} height={600} fill="#1a2c44" />
        {Array.from({ length: 12 }, (_, i) => <rect key={i} x={24 + (i % 3) * 54} y={800 + Math.floor(i / 3) * 140} width={44} height={110} rx={6} fill={["#e63946", "#ffd166", "#06d6a0", "#f1faee"][i % 4]} opacity={0.85} />)}
        <rect x={14} y={780} width={172} height={600} fill="#9fe0ff" opacity={0.12 + 0.04 * Math.sin(t * 3 + side)} />
      </g>
    ))}
    {/* турникет */}
    <g transform="translate(830 1430)">
      <rect x={-20} y={-240} width={40} height={240} fill="#9aa3b0" {...O} />
      <path d="M0 -180 L-110 -180" stroke="#c9ced6" strokeWidth={12} strokeLinecap="round" />
    </g>
    {/* пол-плитка + плинтус y=1430 */}
    <rect x={0} y={1430} width={1080} height={490} fill="#cfd5dc" />
    {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M${i * 140 - 200} 1920 L${540 + (i * 140 - 740) * 0.4} 1430`} stroke="#b4bcc6" strokeWidth={3} />)}
    {[1530, 1660, 1820].map((y) => <path key={y} d={`M0 ${y} H1080`} stroke="#b4bcc6" strokeWidth={3} />)}
    <rect x={0} y={1418} width={1080} height={14} fill="#8d96a2" {...O} />
  </g>
);

/** Тележка (колёса на полу y=0, ручка в (0,-300)). */
export const Cart = () => (
  <g>
    <path d="M0 -300 L30 -300 L60 -110 L250 -110 L280 -260 L40 -260" fill="none" stroke="#9aa3b0" strokeWidth={8} strokeLinejoin="round" />
    {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M${60 + i * 36} -258 L${70 + i * 34} -112`} stroke="#9aa3b0" strokeWidth={4} />)}
    <rect x={90} y={-230} width={60} height={90} rx={6} fill="#ffd166" stroke={LINE} strokeWidth={3} />
    <rect x={160} y={-210} width={70} height={70} rx={6} fill="#e63946" stroke={LINE} strokeWidth={3} />
    {[70, 240].map((x) => <circle key={x} cx={x} cy={-14} r={14} fill="#333" stroke={LINE} strokeWidth={3} />)}
  </g>
);
