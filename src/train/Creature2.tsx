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
        const bend = 0.22; // фаланги загибаются, как когти, цепляющие стекло
        const a1 = ang;
        const a2 = ang - Math.sign(ang || 1) * bend * 0.5;
        const a3 = ang - Math.sign(ang || 1) * bend;
        const k1x = Math.sin(a1) * len * 0.38;
        const k1y = -110 - Math.cos(a1) * len * 0.38;
        const k2x = k1x + Math.sin(a2) * len * 0.32;
        const k2y = k1y - Math.cos(a2) * len * 0.32;
        const ex = k2x + Math.sin(a3) * len * 0.26;
        const ey = k2y - Math.cos(a3) * len * 0.26 + 14;
        return (
          <g key={i}>
            <path d={`M${Math.sin(ang) * 20} -110 L${k1x} ${k1y} L${k2x} ${k2y} L${ex} ${ey}`} stroke={LINE} strokeWidth="26" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d={`M${Math.sin(ang) * 20} -110 L${k1x} ${k1y} L${k2x} ${k2y} L${ex} ${ey}`} stroke={SKIN} strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <circle cx={k1x} cy={k1y} r="14" fill={SH} opacity="0.7" />
            <circle cx={k2x} cy={k2y} r="11" fill={SH} opacity="0.7" />
            {/* коготь 40–60 px */}
            <path d={`M${ex - 10} ${ey + 4} L${ex + Math.sin(ang) * 55} ${ey - Math.cos(ang) * 55} L${ex + 10} ${ey + 4} Z`} fill={CLAW} stroke={LINE} strokeWidth="3" />
            {/* бледный отпечаток подушечки на стекле и запёкшаяся кровь на кончике */}
            <ellipse cx={ex} cy={ey + 10} rx="20" ry="14" fill="#efe9da" opacity="0.5" />
            <path d={`M${ex - 9} ${ey + 2} C${ex - 6} ${ey - 10} ${ex + 6} ${ey - 10} ${ex + 9} ${ey + 2} Z`} fill="#4a0f12" opacity="0.75" />
          </g>
        );
      })}
    </g>
  );
};

/** bare: без левой руки и без полноэкранных затемнений — для текстуры в 3D-сцене. */
export const CreatureGlass = ({ t, open = 1, tilt = 0, slide = 0, bare = false }: { t: number; open?: number; tilt?: number; slide?: number; bare?: boolean }) => {
  const twitch = (Math.floor(t * 12) % 7 === 0 ? 1 : 0) * 6;
  const jaw = 120 + open * 200;
  const teethRow = (n: number, y0: number, w: number, dir: 1 | -1, h: number, seed: string) =>
    Array.from({ length: n }, (_, i) => {
      const x0 = 540 - w / 2 + (i * w) / n + (random(`${seed}o${i}`) - 0.5) * 6;
      const hh = h * (0.55 + 0.45 * random(`${seed}${i}`));
      const lean = (random(`${seed}l${i}`) - 0.5) * 10;
      return <path key={i} d={`M${x0} ${y0} L${x0 + w / n / 2 + lean} ${y0 + dir * hh} L${x0 + w / n} ${y0} Z`} fill={TOOTH} stroke={LINE} strokeWidth="2.5" />;
    });
  // нижняя челюсть: точки по дуге губы, чтобы зубы сидели на ней, а не висели планкой
  const lowY = (x: number) => {
    const u = (x - 550) / 165; // −1..1 в пределах рта
    return 902 + (1 - u * u) * (jaw + 28) * 0.98;
  };
  const upY = (x: number) => {
    const u = (x - 550) / 165;
    return 902 + (1 - u * u) * (6 + open * 14);
  };
  const arcTeeth = (n: number, w: number, top: boolean, h: number, seed: string, inset = 0) =>
    Array.from({ length: n }, (_, i) => {
      const xa = 550 - w / 2 + (i * w) / n;
      const xb = xa + w / n;
      const xm = (xa + xb) / 2 + (random(`${seed}l${i}`) - 0.5) * 8;
      const ya = (top ? upY(xa) : lowY(xa)) + (top ? inset : -inset);
      const yb = (top ? upY(xb) : lowY(xb)) + (top ? inset : -inset);
      const hh = h * (0.55 + 0.45 * random(`${seed}${i}`)) * (1 - Math.abs((xa - 550) / 200) * 0.4);
      const ym = (ya + yb) / 2 + (top ? hh : -hh);
      return <path key={i} d={`M${xa} ${ya} L${xm} ${ym} L${xb} ${yb} Z`} fill={TOOTH} stroke={LINE} strokeWidth="2.5" strokeLinejoin="round" />;
    });
  return (
    <g>
      <defs>
        <linearGradient id="cgNeck" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#6d6555" />
          <stop offset="0.35" stopColor={SKIN} />
          <stop offset="0.7" stopColor={SH} />
          <stop offset="1" stopColor="#4f483c" />
        </linearGradient>
        <radialGradient id="cgSock" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#120c0a" stopOpacity="1" />
          <stop offset="0.45" stopColor="#1d1512" stopOpacity="0.95" />
          <stop offset="0.75" stopColor="#2e2620" stopOpacity="0.5" />
          <stop offset="1" stopColor="#3a3128" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="cgChest" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={SH} />
          <stop offset="1" stopColor="#5e574a" />
        </linearGradient>
      </defs>
      {/* плечевой пояс и узкая грудная клетка — одна цельная форма, одно плечо выше */}
      <path d="M250 1560 C300 1490 420 1460 480 1440 L620 1440 C690 1455 790 1470 840 1540 C820 1650 790 1800 770 1920 H330 C310 1800 280 1680 250 1560 Z" fill="url(#cgChest)" stroke={LINE} strokeWidth="6" />
      {/* ключицы и рёбра дугами по бокам */}
      <path d="M300 1540 C370 1510 440 1500 500 1505 M800 1530 C740 1505 660 1498 600 1505" stroke="#e2dbc6" strokeWidth="9" fill="none" strokeLinecap="round" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i} stroke="#6e6656" strokeWidth="6" fill="none" strokeLinecap="round">
          <path d={`M320 ${1610 + i * 70} C380 ${1585 + i * 70} 450 ${1600 + i * 70} 490 ${1640 + i * 70}`} />
          <path d={`M790 ${1600 + i * 70} C730 ${1578 + i * 70} 660 ${1595 + i * 70} 615 ${1635 + i * 70}`} />
        </g>
      ))}
      <path d="M550 1520 V1920" stroke="#5e574a" strokeWidth="10" opacity="0.6" />
      {/* шея: тёмный градиент и тени, без гофры */}
      <path d="M485 1150 C475 1280 468 1380 460 1455 C500 1480 600 1480 640 1455 C632 1380 625 1280 615 1150 Z" fill="url(#cgNeck)" stroke={LINE} strokeWidth="6" />
      <path d="M505 1180 C500 1300 498 1380 495 1450" stroke="#5e574a" strokeWidth="14" fill="none" opacity="0.45" strokeLinecap="round" />
      {/* голова (+13%), наклонена */}
      <g transform={`rotate(${tilt + twitch} 550 1180) translate(550 1180) scale(1.13) translate(-550 -1180)`}>
        <path d="M550 380 C690 380 740 520 735 700 C730 880 700 1080 620 1170 C590 1200 510 1200 480 1170 C400 1080 370 880 365 700 C360 520 410 380 550 380 Z" fill={SKIN} stroke={LINE} strokeWidth="7" />
        <path d="M660 420 C730 520 740 700 720 880 C700 1040 660 1140 620 1170 C680 1030 710 820 660 420 Z" fill={SH} opacity="0.55" />
        {/* впалые виски и синюшные пятна */}
        <ellipse cx="385" cy="640" rx="26" ry="80" fill={SH} opacity="0.6" />
        <ellipse cx="715" cy="640" rx="26" ry="80" fill={SH} opacity="0.6" />
        <ellipse cx="460" cy="980" rx="40" ry="26" fill={BRUISE} opacity="0.55" />
        {/* скулы: боковые дуги к нижней челюсти */}
        <path d={`M392 820 C380 870 372 920 380 ${960 + jaw * 0.35}`} stroke={SH} strokeWidth="9" fill="none" strokeLinecap="round" />
        <path d={`M708 820 C720 870 728 920 720 ${960 + jaw * 0.35}`} stroke={SH} strokeWidth="9" fill="none" strokeLinecap="round" />
        <g stroke={SH} strokeWidth="4" fill="none" strokeLinecap="round">
          <path d="M470 470 C520 460 580 460 630 470" />
          <path d="M480 505 C530 497 575 497 620 505" />
        </g>
        {Array.from({ length: 60 }, (_, i) => (
          <circle key={i} cx={400 + random(`pp${i}`) * 300} cy={560 + random(`pq${i}`) * 520} r={1.5 + random(`pr${i}`) * 2.5} fill="#7a7160" opacity="0.55" />
        ))}
        {/* глубокие тёмные глазницы, маленькие мутные глаза, асимметричные зрачки, хищный прищур */}
        {[475, 625].map((cx, i) => {
          const sx = i ? -1 : 1; // внутренний край к переносице
          return (
            <g key={cx}>
              {/* глазница с мягким краем (градиент), без чётких «кругов панды» */}
              <ellipse cx={cx} cy={685 + i * 8} rx="88" ry="80" fill="url(#cgSock)" />
              <ellipse cx={cx + sx * 4} cy={692 + i * 8} rx={26 - i * 3} ry={15 + i * 2} fill="#c9c2ac" stroke={LINE} strokeWidth="3" />
              <path d={`M${cx - 24} ${694 + i * 8} q10 -2 14 6 M${cx + 6} ${688 + i * 8} q8 4 12 10`} stroke="#9a2c30" strokeWidth="2" fill="none" />
              <circle cx={cx + sx * (8 + i * 3)} cy={692 + i * 8} r={i ? 3.2 : 4.4} fill="#070505" />
              {/* тяжёлое верхнее веко скошено к переносице — направленный взгляд */}
              <path d={`M${cx - 34} ${670 + i * 8 + (sx > 0 ? -10 : 8)} L${cx + 34} ${670 + i * 8 + (sx > 0 ? 8 : -10)} L${cx + 34} ${652 + i * 8} L${cx - 34} ${652 + i * 8} Z`} fill="#2e2620" />
              <path d={`M${cx - 36} ${671 + i * 8 + (sx > 0 ? -10 : 8)} L${cx + 36} ${671 + i * 8 + (sx > 0 ? 8 : -10)}`} stroke={LINE} strokeWidth="5" strokeLinecap="round" />
            </g>
          );
        })}
        {/* дополнительные глаза: лоб, висок, скула — асимметрично, в своих тёмных глазницах */}
        {([
          [585, 520, 16, 10, 0.9],
          [700, 600, 11, 7, 1.0],
          [430, 860, 9, 6, 0.85],
        ] as const).map(([cx, cy, rx, ry, o], i) => (
          <g key={`x${i}`} opacity={o}>
            <ellipse cx={cx} cy={cy} rx={rx * 2.6} ry={ry * 2.8} fill="url(#cgSock)" />
            <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#b9b19b" stroke={LINE} strokeWidth="2.5" />
            <circle cx={cx + (i === 1 ? -3 : 2)} cy={cy + 1} r={Math.max(2.2, rx * 0.22)} fill="#060404" />
            <path d={`M${cx - rx - 3} ${cy - ry * 0.4} L${cx + rx + 3} ${cy - ry * 0.9}`} stroke={LINE} strokeWidth="3.5" strokeLinecap="round" />
            <path d={`M${cx - rx} ${cy + ry + 4} q${rx} 6 ${rx * 2} 0`} stroke="#4a3f38" strokeWidth="3" fill="none" />
          </g>
        ))}
        <path d="M535 820 l-6 26 M565 820 l6 26" stroke={LINE} strokeWidth="5" strokeLinecap="round" />
        {/* рот, разорванный до ушей */}
        <path d={`M385 900 C440 ${905 + open * 20} 660 ${905 + open * 20} 715 900 C690 ${920 + jaw * 0.6} 620 ${930 + jaw} 550 ${930 + jaw} C480 ${930 + jaw} 410 ${920 + jaw * 0.6} 385 900 Z`} fill={GUM} stroke={LINE} strokeWidth="6" />
        <path d={`M430 ${930 + jaw * 0.4} C490 ${960 + jaw * 0.6} 610 ${960 + jaw * 0.6} 670 ${930 + jaw * 0.4}`} fill="#280808" opacity="0.8" />
        <path d="M385 900 L350 880 L330 890 M715 900 L750 880 L770 892" stroke="#7a2a2a" strokeWidth="5" fill="none" strokeLinecap="round" />
        {/* тёмная запёкшаяся кровь вокруг пасти */}
        <path d="M392 905 C380 930 384 960 376 990 M712 908 C724 940 718 970 728 1000" stroke="#4a0f12" strokeWidth="7" fill="none" strokeLinecap="round" opacity="0.8" />
        <ellipse cx="470" cy={918 + jaw * 0.08} rx="28" ry="7" fill="#4a0f12" opacity="0.6" />
        <ellipse cx="640" cy={1000 + jaw * 0.5} rx="22" ry="6" fill="#4a0f12" opacity="0.55" />
        {/* зубы сидят на дугах губ: 3 ряда сверху, 2 снизу */}
        {arcTeeth(15, 300, true, 50, "a")}
        <g opacity="0.85">{arcTeeth(12, 236, true, 40, "b", 12)}</g>
        <g opacity="0.7">{arcTeeth(9, 176, true, 32, "c", 24)}</g>
        {arcTeeth(13, 280, false, 46, "d")}
        <g opacity="0.8">{arcTeeth(10, 210, false, 36, "e", 14)}</g>
        {Array.from({ length: 7 }, (_, i) => {
          const x = 420 + i * 42 + random(`bt${i}`) * 10;
          const u = (x - 550) / 165;
          const y = 902 + (1 - u * u) * (6 + open * 14) + 30;
          return <path key={`bt${i}`} d={`M${x - 4} ${y - 8} L${x} ${y + 4} L${x + 4} ${y - 8} Z`} fill="#4a0f12" opacity={0.55 + random(`bo${i}`) * 0.3} />;
        })}
      </g>
      {/* ладони — самое крупное пятно кадра */}
      {!bare && <Hand x={170} y={1180} flip={1} spread={1} slide={slide} />}
      <Hand x={920} y={1140} flip={-1} spread={1.1} slide={slide * 0.7} />
      {/* полумрак вагона: глубокая тень снизу, холодный контровой свет лампы сверху */}
      <defs>
        <linearGradient id="cgDark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a0d12" stopOpacity="0.15" />
          <stop offset="0.45" stopColor="#0a0d12" stopOpacity="0.35" />
          <stop offset="0.75" stopColor="#05070a" stopOpacity="0.7" />
          <stop offset="1" stopColor="#020304" stopOpacity="0.88" />
        </linearGradient>
        <radialGradient id="cgRim" cx="55%" cy="12%" r="55%">
          <stop offset="0" stopColor="#bfd6ff" stopOpacity="0.28" />
          <stop offset="1" stopColor="#bfd6ff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="cgSide" cx="50%" cy="45%" r="65%">
          <stop offset="0.55" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.6" />
        </radialGradient>
      </defs>
      {!bare && (
        <>
          <rect width="1080" height="1920" fill="url(#cgDark)" />
          <rect width="1080" height="1920" fill="url(#cgSide)" />
          <rect width="1080" height="1920" fill="url(#cgRim)" style={{ mixBlendMode: "screen" }} />
        </>
      )}
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
