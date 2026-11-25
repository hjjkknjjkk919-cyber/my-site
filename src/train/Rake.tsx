import React from "react";
import { random } from "remotion";

/**
 * Существо в духе «Рейка»: истощённое бледное тело, проступают рёбра и позвоночник,
 * острые лопатки, длинные руки с вывернутыми локтями, когти, пасть с зубами.
 * Локальные координаты: центр туловища (0,0), высота фигуры ~600, ширина с конечностями ~900.
 */
const LINE = "#2a201c";
const SKIN = "#d6d1c2";
const SKIN_SH = "#a19c8e";
const SKIN_DK = "#6f6a5f";

const Limb = ({ a, b, c, w1, w2 }: { a: [number, number]; b: [number, number]; c: [number, number]; w1: number; w2: number }) => (
  <g strokeLinecap="round" strokeLinejoin="round" fill="none">
    <path d={`M${a[0]} ${a[1]} L${b[0]} ${b[1]}`} stroke={LINE} strokeWidth={w1 + 8} />
    <path d={`M${b[0]} ${b[1]} L${c[0]} ${c[1]}`} stroke={LINE} strokeWidth={w2 + 8} />
    <path d={`M${a[0]} ${a[1]} L${b[0]} ${b[1]}`} stroke={SKIN} strokeWidth={w1} />
    <path d={`M${b[0]} ${b[1]} L${c[0]} ${c[1]}`} stroke={SKIN} strokeWidth={w2} />
    {/* жилы/кость вдоль предплечья */}
    <path d={`M${b[0]} ${b[1]} L${c[0]} ${c[1]}`} stroke={SKIN_SH} strokeWidth={w2 * 0.25} transform="translate(4 2)" />
    {/* костлявый локоть */}
    <circle cx={b[0]} cy={b[1]} r={w1 * 0.75} fill={SKIN} stroke={LINE} strokeWidth="4" />
    <circle cx={b[0] - 3} cy={b[1] - 3} r={w1 * 0.3} fill="#eeeae0" />
  </g>
);

const Claws = ({ x, y, ang, len = 60 }: { x: number; y: number; ang: number; len?: number }) => (
  <g transform={`translate(${x} ${y}) rotate(${ang})`}>
    <ellipse cx="0" cy="0" rx="22" ry="16" fill={SKIN} stroke={LINE} strokeWidth="4" />
    {[-24, -8, 8, 24].map((dx, i) => (
      <g key={i}>
        <path d={`M${dx * 0.7} 8 L${dx} ${len * 0.6}`} stroke={LINE} strokeWidth="11" strokeLinecap="round" />
        <path d={`M${dx * 0.7} 8 L${dx} ${len * 0.6}`} stroke={SKIN} strokeWidth="6" strokeLinecap="round" />
        <path d={`M${dx - 4} ${len * 0.6} L${dx + 1} ${len} L${dx + 5} ${len * 0.6} Z`} fill="#2b2622" stroke={LINE} strokeWidth="2" />
      </g>
    ))}
  </g>
);

/** Существо ползёт на четвереньках «к нам». phase — фаза шага; jaw 0..1 — раскрыта ли пасть. */
export const Rake = ({ t, phase = 0, jaw = 0.3, look = 0 }: { t: number; phase?: number; jaw?: number; look?: number }) => {
  const s1 = Math.sin(phase * Math.PI * 2);
  const s2 = Math.sin(phase * Math.PI * 2 + Math.PI);
  const br = Math.sin(t * 6) * 3; // частое дыхание: рёбра ходят
  return (
    <g>
      {/* задние ноги (дальше, темнее) */}
      <g opacity="0.85">
        <Limb a={[-50, 90]} b={[-230, 30 + s2 * 20]} c={[-260, 250]} w1={34} w2={24} />
        <Limb a={[50, 90]} b={[230, 30 + s1 * 20]} c={[260, 250]} w1={34} w2={24} />
        <Claws x={-262} y={258} ang={8} len={46} />
        <Claws x={262} y={258} ang={-8} len={46} />
      </g>
      {/* передние руки: локти вывернуты вверх, выше головы */}
      <Limb a={[-80, -40]} b={[-300, -230 + s1 * 30]} c={[-360 + s1 * 20, 160]} w1={32} w2={22} />
      <Limb a={[80, -40]} b={[300, -230 + s2 * 30]} c={[360 + s2 * 20, 160]} w1={32} w2={22} />
      <Claws x={-362 + s1 * 20} y={168} ang={10} len={90} />
      <Claws x={362 + s2 * 20} y={168} ang={-10} len={90} />

      {/* туловище: впалый живот, выгнутая спина */}
      <path d={`M-95 -60 C-120 0 -90 70 -55 105 C-20 125 20 125 55 105 C90 70 120 0 95 -60 C60 -95 -60 -95 -95 -60 Z`} fill={SKIN} stroke={LINE} strokeWidth="6" />
      <path d="M95 -60 C120 0 90 70 55 105 C40 115 25 120 10 122 C70 70 90 10 95 -60 Z" fill={SKIN_SH} opacity="0.7" />
      {/* рёбра */}
      {Array.from({ length: 6 }, (_, i) => {
        const y = -40 + i * 18 + br * (i / 6);
        const w = 80 - i * 7;
        return (
          <g key={i} stroke={SKIN_DK} strokeWidth="4.5" fill="none" strokeLinecap="round">
            <path d={`M-8 ${y} C${-w * 0.5} ${y - 10} ${-w} ${y + 4} ${-w - 6} ${y + 16}`} />
            <path d={`M8 ${y} C${w * 0.5} ${y - 10} ${w} ${y + 4} ${w + 6} ${y + 16}`} />
          </g>
        );
      })}
      {/* грудина и позвонки, проступающие сквозь кожу */}
      <path d="M0 -50 V70" stroke={SKIN_DK} strokeWidth="5" />
      {Array.from({ length: 7 }, (_, i) => (
        <ellipse key={i} cx="0" cy={-48 + i * 18} rx="8" ry="5" fill="#e4e0d4" stroke={SKIN_DK} strokeWidth="2.5" />
      ))}
      {/* острые ключицы и лопатки */}
      <path d="M-95 -62 L-30 -78 M95 -62 L30 -78" stroke={SKIN_DK} strokeWidth="6" strokeLinecap="round" />
      <path d="M-100 -70 L-130 -110 L-80 -82 Z M100 -70 L130 -110 L80 -82 Z" fill={SKIN} stroke={LINE} strokeWidth="5" strokeLinejoin="round" />
      {/* таз — выступающие кости */}
      <path d="M-60 95 L-82 118 M60 95 L82 118" stroke={SKIN_DK} strokeWidth="6" strokeLinecap="round" />

      {/* голова: низко между плеч, вытянутая, череп проступает */}
      <g transform={`translate(${look * 20} -130)`}>
        <path d="M0 -100 C48 -100 70 -60 68 -10 C66 40 50 82 0 92 C-50 82 -66 40 -68 -10 C-70 -60 -48 -100 0 -100 Z" fill={SKIN} stroke={LINE} strokeWidth="6" />
        <path d="M50 -80 C80 -40 82 20 60 60 C50 75 30 84 10 88 C55 40 62 -20 50 -80 Z" fill={SKIN_SH} opacity="0.7" />
        {/* скулы */}
        <path d="M-62 10 C-50 0 -30 0 -20 10 M62 10 C50 0 30 0 20 10" stroke={SKIN_DK} strokeWidth="5" fill="none" strokeLinecap="round" />
        {/* огромные чёрные глаза с блеском */}
        {/* впалые глазницы и маленькие мутные глаза */}
        <ellipse cx="-30" cy="-28" rx="26" ry="22" fill={SKIN_DK} opacity="0.85" />
        <ellipse cx="30" cy="-28" rx="26" ry="22" fill={SKIN_DK} opacity="0.85" />
        <ellipse cx="-30" cy="-27" rx="12" ry="9" fill="#e9e6d6" stroke={LINE} strokeWidth="2.5" />
        <ellipse cx="30" cy="-27" rx="12" ry="9" fill="#e9e6d6" stroke={LINE} strokeWidth="2.5" />
        <circle cx="-30" cy="-27" r="3" fill="#000" />
        <circle cx="30" cy="-27" r="3" fill="#000" />
        <path d="M-58 -46 C-40 -56 -18 -54 -8 -44 M58 -46 C40 -56 18 -54 8 -44" stroke={LINE} strokeWidth="4" fill="none" />
        {/* дыры носа */}
        <path d="M-6 8 l-4 12 M6 8 l4 12" stroke={LINE} strokeWidth="4" strokeLinecap="round" />
        {/* пасть: широкая, зубы как иглы */}
        <path d={`M-60 38 C-30 ${40 + jaw * 30} 30 ${40 + jaw * 30} 60 38 C45 ${60 + jaw * 60} 20 ${72 + jaw * 70} 0 ${72 + jaw * 70} C-20 ${72 + jaw * 70} -45 ${60 + jaw * 60} -60 38 Z`} fill="#230808" stroke={LINE} strokeWidth="5" />
        {Array.from({ length: 13 }, (_, i) => {
          const x = -54 + i * 9;
          const top = 40 + jaw * 4;
          const h = 14 + (i % 2) * 8 + random(`rk${i}`) * 6;
          return <path key={i} d={`M${x - 4} ${top} L${x} ${top + h} L${x + 4} ${top} Z`} fill="#ece4cc" stroke={LINE} strokeWidth="1.5" />;
        })}
        {Array.from({ length: 10 }, (_, i) => {
          const x = -40 + i * 9;
          const bot = 66 + jaw * 68;
          return <path key={i} d={`M${x - 4} ${bot} L${x} ${bot - 16 - (i % 2) * 6} L${x + 4} ${bot} Z`} fill="#ece4cc" stroke={LINE} strokeWidth="1.5" />;
        })}
      </g>
    </g>
  );
};
