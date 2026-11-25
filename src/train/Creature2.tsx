import React from "react";
import { random } from "remotion";
import { clamp } from "../components/fx";

/**
 * Существо вплотную к стеклу (скример), по ревью:
 * маленькая вытянутая голова со впалыми висками, длинная шея с позвонками, узкий высокий торс,
 * рёбра дугами по бокам, асимметрия, мутные глаза с прожилками, рот разорван до ушей,
 * зубы-иглы в 2–3 ряда, огромные ладони с длинными пальцами прижаты к стеклу — крупнее головы.
 * Координаты кадра 1080×1920. slide — насколько ладони сползли вниз (px), tilt — наклон головы, open 0..1 — пасть.
 */
const LINE = "#2b1d16";
const SKIN = "#cfc7b2";
const SH = "#8e8573";
const BRUISE = "#9aa3a8";
const SOCKET = "#4a3f38";
const GUM = "#5a1e22";
const TOOTH = "#e6dfc8";
const CLAW = "#3b2e26";

const Hand = ({ x, y, flip, spread, slide }: { x: number; y: number; flip: 1 | -1; spread: number; slide: number }) => {
  // ладонь прижата: светлее в центре (давление), пальцы по 3 фаланги
  const fingers = [-62, -30, 0, 28, 58];
  return (
    <g transform={`translate(${x} ${y + slide}) scale(${flip} 1)`}>
      {/* предплечье уходит вниз за кадр */}
      <path d="M-45 60 C-55 300 -50 600 -35 900 L50 900 C60 600 58 300 45 60 Z" fill="#7d7565" stroke={LINE} strokeWidth="6" />
      <path d="M20 120 C25 400 30 650 40 900" stroke="#6e6656" strokeWidth="6" fill="none" />
      {/* ладонь прижата к стеклу */}
      <path d="M-95 70 C-112 -20 -92 -108 -62 -122 L62 -122 C92 -108 112 -20 95 70 C60 108 -60 108 -95 70 Z" fill={SKIN} stroke={LINE} strokeWidth="5" />
      <ellipse cx="0" cy="-25" rx="55" ry="50" fill="#e4ddc9" opacity="0.7" />
      {/* сухожилия */}
      {[-50, -20, 10, 40].map((dx) => <path key={dx} d={`M${dx * 0.6} 60 L${dx} -110`} stroke={SH} strokeWidth="5" opacity="0.6" />)}
      {fingers.map((a, i) => {
        const ang = ((a * spread) * Math.PI) / 180;
        const len = [230, 300, 320, 290, 200][i];
        const ex = Math.sin(ang) * len;
        const ey = -110 - Math.cos(ang) * len;
        const k1x = Math.sin(ang) * len * 0.38;
        const k1y = -110 - Math.cos(ang) * len * 0.38;
        const k2x = Math.sin(ang) * len * 0.7;
        const k2y = -110 - Math.cos(ang) * len * 0.7;
        return (
          <g key={i}>
            <path d={`M${Math.sin(ang) * 20} -110 L${k1x} ${k1y} L${k2x} ${k2y} L${ex} ${ey}`} stroke={LINE} strokeWidth="26" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d={`M${Math.sin(ang) * 20} -110 L${k1x} ${k1y} L${k2x} ${k2y} L${ex} ${ey}`} stroke={SKIN} strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <circle cx={k1x} cy={k1y} r="14" fill={SH} opacity="0.7" />
            <circle cx={k2x} cy={k2y} r="11" fill={SH} opacity="0.7" />
            {/* коготь 40–60 px */}
            <path d={`M${ex - 10} ${ey + 4} L${ex + Math.sin(ang) * 55} ${ey - Math.cos(ang) * 55} L${ex + 10} ${ey + 4} Z`} fill={CLAW} stroke={LINE} strokeWidth="3" />
            {/* бледный отпечаток подушечки на стекле */}
            <ellipse cx={ex} cy={ey + 10} rx="20" ry="14" fill="#efe9da" opacity="0.5" />
          </g>
        );
      })}
    </g>
  );
};

export const CreatureGlass = ({ t, open = 1, tilt = 0, slide = 0 }: { t: number; open?: number; tilt?: number; slide?: number }) => {
  const twitch = (Math.floor(t * 12) % 7 === 0 ? 1 : 0) * 6;
  const jaw = 120 + open * 200;
  const teethRow = (n: number, y0: number, w: number, dir: 1 | -1, h: number, seed: string) =>
    Array.from({ length: n }, (_, i) => {
      const x0 = 540 - w / 2 + (i * w) / n + (random(`${seed}o${i}`) - 0.5) * 6;
      const hh = h * (0.55 + 0.45 * random(`${seed}${i}`));
      const lean = (random(`${seed}l${i}`) - 0.5) * 10;
      return <path key={i} d={`M${x0} ${y0} L${x0 + w / n / 2 + lean} ${y0 + dir * hh} L${x0 + w / n} ${y0} Z`} fill={TOOTH} stroke={LINE} strokeWidth="2.5" />;
    });
  return (
    <g>
      {/* узкий высокий торс, одно плечо выше */}
      <path d="M330 1500 C300 1640 320 1820 350 1920 H760 C790 1800 800 1640 770 1470 C700 1420 420 1440 330 1500 Z" fill={SH} stroke={LINE} strokeWidth="6" />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i} stroke="#6e6656" strokeWidth="6" fill="none" strokeLinecap="round">
          <path d={`M360 ${1560 + i * 60} C420 ${1540 + i * 60} 470 ${1560 + i * 60} 500 ${1590 + i * 60}`} />
          <path d={`M750 ${1560 + i * 60} C690 ${1540 + i * 60} 640 ${1560 + i * 60} 610 ${1590 + i * 60}`} />
        </g>
      ))}
      {/* колено, поднятое под подбородок (асимметрия) */}
      <path d="M640 1920 C660 1750 700 1620 760 1560 C810 1530 850 1560 840 1620 C820 1720 780 1840 770 1920 Z" fill={SKIN} stroke={LINE} strokeWidth="6" />
      <ellipse cx="790" cy="1585" rx="40" ry="30" fill="#e2dbc6" stroke={LINE} strokeWidth="4" />
      {/* длинная шея с позвонками */}
      <path d="M480 1180 C470 1300 470 1400 470 1500 H630 C630 1400 630 1300 620 1180 Z" fill={SKIN} stroke={LINE} strokeWidth="6" />
      {Array.from({ length: 5 }, (_, i) => <path key={i} d={`M500 ${1230 + i * 55} C530 ${1220 + i * 55} 570 ${1220 + i * 55} 600 ${1230 + i * 55}`} stroke={SH} strokeWidth="5" fill="none" />)}
      {/* голова: маленькая, вытянутая, наклонена */}
      <g transform={`rotate(${tilt + twitch} 550 1180)`}>
        <path d="M550 380 C690 380 740 520 735 700 C730 880 700 1080 620 1170 C590 1200 510 1200 480 1170 C400 1080 370 880 365 700 C360 520 410 380 550 380 Z" fill={SKIN} stroke={LINE} strokeWidth="7" />
        <path d="M660 420 C730 520 740 700 720 880 C700 1040 660 1140 620 1170 C680 1030 710 820 660 420 Z" fill={SH} opacity="0.55" />
        {/* впалые виски и синюшные пятна */}
        <ellipse cx="385" cy="640" rx="26" ry="80" fill={SH} opacity="0.6" />
        <ellipse cx="715" cy="640" rx="26" ry="80" fill={SH} opacity="0.6" />
        <ellipse cx="460" cy="980" rx="40" ry="26" fill={BRUISE} opacity="0.55" />
        {/* морщины и поры */}
        <g stroke={SH} strokeWidth="4" fill="none" strokeLinecap="round">
          <path d="M470 470 C520 460 580 460 630 470" />
          <path d="M480 505 C530 497 575 497 620 505" />
        </g>
        {Array.from({ length: 60 }, (_, i) => (
          <circle key={i} cx={400 + random(`pp${i}`) * 300} cy={560 + random(`pq${i}`) * 520} r={1.5 + random(`pr${i}`) * 2.5} fill="#7a7160" opacity="0.55" />
        ))}
        {/* глазницы и мутные глаза с прожилками */}
        {[475, 625].map((cx, i) => (
          <g key={cx}>
            <ellipse cx={cx} cy={680 + i * 8} rx="62" ry="58" fill={SOCKET} />
            <ellipse cx={cx} cy={684 + i * 8} rx="40" ry={30 + i * 4} fill="#d9d4c3" stroke={LINE} strokeWidth="4" />
            {[0, 1, 2].map((k) => <path key={k} d={`M${cx + (k - 1) * 30} ${670 + i * 8 + k * 8} q8 4 12 14`} stroke="#b0353a" strokeWidth="2.5" fill="none" />)}
            <circle cx={cx + (i ? -6 : 6)} cy={686 + i * 8} r="5" fill="#111" />
          </g>
        ))}
        {/* нос: две щели */}
        <path d="M535 820 l-6 26 M565 820 l6 26" stroke={LINE} strokeWidth="5" strokeLinecap="round" />
        {/* рот, разорванный до ушей */}
        <path d={`M385 900 C440 ${905 + open * 20} 660 ${905 + open * 20} 715 900 C690 ${920 + jaw * 0.6} 620 ${930 + jaw} 550 ${930 + jaw} C480 ${930 + jaw} 410 ${920 + jaw * 0.6} 385 900 Z`} fill={GUM} stroke={LINE} strokeWidth="6" />
        <path d={`M430 ${930 + jaw * 0.4} C490 ${960 + jaw * 0.6} 610 ${960 + jaw * 0.6} 670 ${930 + jaw * 0.4}`} fill="#280808" opacity="0.8" />
        {/* разрывы в уголках */}
        <path d="M385 900 L350 880 L330 890 M715 900 L750 880 L770 892" stroke="#7a2a2a" strokeWidth="5" fill="none" strokeLinecap="round" />
        {/* зубы-иглы, 3 ряда сверху, 2 снизу */}
        {teethRow(15, 906, 300, 1, 50, "a")}
        <g opacity="0.85">{teethRow(13, 920, 240, 1, 40, "b")}</g>
        <g opacity="0.7">{teethRow(10, 934, 180, 1, 32, "c")}</g>
        {teethRow(13, 925 + jaw, 260, -1, 46, "d")}
        <g opacity="0.8">{teethRow(10, 912 + jaw, 190, -1, 36, "e")}</g>
      </g>
      {/* ладони — самое крупное пятно кадра */}
      <Hand x={230} y={1050} flip={1} spread={1} slide={slide} />
      <Hand x={850} y={1010} flip={-1} spread={1.1} slide={slide * 0.7} />
    </g>
  );
};

/** Паутина трещин: лучи с изломами + концентрические дуги, проявляется от центра за p 0..1. */
export const Cracks = ({ x, y, p }: { x: number; y: number; p: number }) => {
  const rays = 8;
  return (
    <g>
      {Array.from({ length: rays }, (_, i) => {
        const a = (i / rays) * Math.PI * 2 + random(`cr${i}`) * 0.4;
        const pts: string[] = [`${x},${y}`];
        let cx = x;
        let cy = y;
        for (let s = 1; s <= 4; s++) {
          const len = (90 + random(`cl${i}${s}`) * 120) * clamp(p * 4 - (s - 1));
          const aa = a + (random(`cj${i}${s}`) - 0.5) * 0.5;
          cx += Math.cos(aa) * len;
          cy += Math.sin(aa) * len;
          pts.push(`${cx},${cy}`);
        }
        return (
          <g key={i}>
            <polyline points={pts.join(" ")} stroke="#2a3236" strokeWidth="6" fill="none" opacity="0.4" />
            <polyline points={pts.join(" ")} stroke="#e9eef0" strokeWidth={2.5 - (i % 3) * 0.5} fill="none" />
          </g>
        );
      })}
      {[110, 220, 340].map((r, i) => (
        <circle key={r} cx={x} cy={y} r={r * clamp(p * 3 - i)} fill="none" stroke="#e9eef0" strokeWidth="1.8" strokeDasharray="40 26" opacity={0.8 - i * 0.2} />
      ))}
      {/* сколы в точке удара */}
      {Array.from({ length: 10 }, (_, i) => (
        <circle key={i} cx={x + (random(`sk${i}`) - 0.5) * 60} cy={y + (random(`sl${i}`) - 0.5) * 60} r={3 + random(`sm${i}`) * 5} fill="#f4f7f8" opacity={p} />
      ))}
    </g>
  );
};
