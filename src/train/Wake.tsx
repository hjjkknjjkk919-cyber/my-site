import React from "react";
import { AbsoluteFill, random } from "remotion";
import { clamp, ease, Svg, useT } from "../components/fx";
import { DimaFace } from "./GostOld";
import { Wagon2, LEN, type Cam } from "./Wagon2";
import { Atmos } from "./GostOld";

/** Пробуждение Димы (3-е лицо) → переход в POV (глаза, расфокус) → телефон → подъём и ходьба от первого лица → взгляд назад. */
const LINE = "#2b1d16";
const SKIN = "#e9c4a8";
const JK = "#3b4d63";
const JK_SH = "#2a384a";
export const MONT_FALLBACK = "Montserrat, sans-serif";

const ride = (t: number) => {
  const ph = (t % 0.9) / 0.9;
  return { rot: Math.sin((t / 1.4) * Math.PI * 2) * 0.6, y: ph < 0.1 ? Math.sin((ph / 0.1) * Math.PI) * 3 : 0 };
};
/** Мигающая лампа: в основном горит, иногда проваливается. */
import { lamp as lampAt } from "./lamp";
export { lampAt };

const Vig = ({ k = 1 }: { k?: number }) => (
  <AbsoluteFill style={{ background: `radial-gradient(75% 60% at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,${0.72 * k}) 100%)` }} />
);

const SKIN_SH = "#cf9f84";
const NAIL = "#f3dccd";
const DENIM = "#2c3a52";
const DENIM_SH = "#1f2a3d";

/** Палец: фаланги (две складки), ноготь; dir — угол в градусах (0 — вниз). */
export const Finger = ({ x, y, len, w, dir = 0, curl = 0 }: { x: number; y: number; len: number; w: number; dir?: number; curl?: number }) => {
  const L = len * (1 - 0.35 * curl);
  return (
    <g transform={`translate(${x} ${y}) rotate(${dir})`}>
      <rect x={-w / 2} y={-6} width={w} height={L + 6} rx={w / 2} fill={SKIN} stroke={LINE} strokeWidth="5" />
      {/* тень по краю */}
      <rect x={w / 2 - 8} y={2} width={6} height={L - 10} rx={3} fill={SKIN_SH} opacity="0.55" />
      {/* сгибы фаланг */}
      <path d={`M${-w / 2 + 5} ${L * 0.36} q${w / 2 - 5} 5 ${w - 10} 0`} stroke={LINE} strokeWidth="2.5" fill="none" opacity="0.6" />
      <path d={`M${-w / 2 + 6} ${L * 0.68} q${w / 2 - 6} 4 ${w - 12} 0`} stroke={LINE} strokeWidth="2.5" fill="none" opacity="0.6" />
      {/* ноготь */}
      <rect x={-w / 2 + 6} y={L - w * 0.62} width={w - 12} height={w * 0.5} rx={w * 0.22} fill={NAIL} stroke={LINE} strokeWidth="2.5" />
      <path d={`M${-w / 2 + 9} ${L - w * 0.56} h${w - 18}`} stroke="#fff" strokeWidth="2" opacity="0.6" />
    </g>
  );
};

/**
 * Кисть сверху (тыльная сторона): рукав, манжета-резинка, запястье, сухожилия, костяшки,
 * четыре пальца с фалангами и ногтями, большой палец. Пальцы направлены вниз (+y).
 */
export const HandTop = ({ x, y, rot = 0, s = 1, flip = 1, curl = 0, twitch = 0 }: { x: number; y: number; rot?: number; s?: number; flip?: 1 | -1; curl?: number; twitch?: number }) => {
  const lens = [64, 78, 74, 58];
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${flip * s} ${s})`}>
      {/* рукав куртки со складками */}
      <path d="M-100 -240 C-104 -170 -96 -110 -84 -66 L84 -66 C96 -110 104 -170 100 -240 Z" fill={JK} stroke={LINE} strokeWidth="7" />
      <path d="M-70 -200 C-40 -186 -10 -190 14 -206 M-60 -140 C-30 -128 10 -132 40 -150" stroke={JK_SH} strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M60 -230 C80 -170 84 -120 76 -70" stroke={JK_SH} strokeWidth="14" fill="none" opacity="0.7" />
      {/* манжета-резинка */}
      <path d="M-86 -80 L86 -80 L80 -46 L-80 -46 Z" fill={JK_SH} stroke={LINE} strokeWidth="6" />
      {Array.from({ length: 11 }, (_, i) => <path key={i} d={`M${-72 + i * 14.4} -76 V-50`} stroke={LINE} strokeWidth="2" opacity="0.45" />)}
      {/* большой палец */}
      <Finger x={-64} y={-6} len={62} w={30} dir={38 - curl * 10} curl={curl * 0.5} />
      {/* запястье и тыльная сторона ладони */}
      <path d="M-62 -48 C-70 -12 -78 30 -74 74 C-40 84 40 84 74 74 C78 30 70 -12 62 -48 Z" fill={SKIN} stroke={LINE} strokeWidth="6" />
      <path d="M44 -40 C60 0 66 40 64 72" stroke={SKIN_SH} strokeWidth="14" fill="none" opacity="0.5" strokeLinecap="round" />
      {/* сухожилия и вены */}
      {[-36, -12, 12, 36].map((dx) => <path key={dx} d={`M${dx * 0.45} -26 L${dx} 62`} stroke={SKIN_SH} strokeWidth="4" opacity="0.5" strokeLinecap="round" />)}
      <path d="M-20 -40 C-30 -10 -10 10 -22 40" stroke="#9fb4c8" strokeWidth="3" fill="none" opacity="0.35" />
      {/* пальцы */}
      {lens.map((l, i) => (
        <Finger key={i} x={-54 + i * 36} y={70} len={l} w={i === 3 ? 28 : 32} dir={(i - 1.5) * -3 + (i === 1 ? twitch : 0)} curl={curl} />
      ))}
      {/* костяшки */}
      {lens.map((_, i) => <path key={i} d={`M${-66 + i * 36} 74 q12 -9 24 0`} stroke={LINE} strokeWidth="3" fill="none" opacity="0.55" />)}
    </g>
  );
};

/** Телефон в руке: только 00:47 и «Нет сети». */
export const PhoneInHand = ({ glow = 1 }: { glow?: number }) => (
  <g>
    {/* рукав с манжетой */}
    <path d="M250 1920 C262 1800 300 1720 350 1690 L760 1690 C810 1730 836 1820 840 1920 Z" fill={JK} stroke={LINE} strokeWidth="8" />
    <path d="M330 1700 L780 1700 L790 1752 L320 1752 Z" fill={JK_SH} stroke={LINE} strokeWidth="6" />
    {Array.from({ length: 22 }, (_, i) => <path key={i} d={`M${334 + i * 20.5} 1704 V1748`} stroke={LINE} strokeWidth="2" opacity="0.4" />)}
    <path d="M300 1800 C380 1780 470 1790 520 1830 M640 1820 C700 1790 760 1800 810 1830" stroke={JK_SH} strokeWidth="7" fill="none" strokeLinecap="round" />
    {/* ладонь под телефоном */}
    <path d="M350 1700 C340 1600 350 1520 400 1460 L700 1460 C750 1520 770 1600 760 1700 Z" fill={SKIN} stroke={LINE} strokeWidth="8" />
    <path d="M690 1480 C730 1540 748 1610 744 1690" stroke={SKIN_SH} strokeWidth="18" fill="none" opacity="0.5" strokeLinecap="round" />
    <path d="M420 1560 C480 1590 560 1596 640 1580" stroke={SKIN_SH} strokeWidth="5" fill="none" opacity="0.6" />
    {/* пальцы за задней крышкой: из-за левого ребра выглядывают только их боковины, без ногтей */}
    {[1120, 1235, 1345, 1440].map((y, i) => (
      <g key={i}>
        <path d={`M352 ${y - 44 + i * 3} C318 ${y - 46} 300 ${y - 24} 300 ${y} C300 ${y + 26} 318 ${y + 44 - i * 3} 352 ${y + 42 - i * 3} Z`} fill={SKIN} stroke={LINE} strokeWidth="6" />
        <path d={`M322 ${y - 30} C312 ${y - 10} 312 ${y + 10} 322 ${y + 30}`} stroke={SKIN_SH} strokeWidth="7" fill="none" opacity="0.6" />
      </g>
    ))}
    <rect x="330" y="760" width="420" height="820" rx="56" fill="#0d1014" stroke={LINE} strokeWidth="12" />
    <rect x="350" y="780" width="380" height="780" rx="44" fill="#111a24" />
    <rect x="350" y="780" width="380" height="780" rx="44" fill="#9fc3ff" opacity={0.06 * glow} />
    <text x="540" y="960" textAnchor="middle" fontFamily={MONT_FALLBACK} fontWeight="800" fontSize="118" fill="#e9eef3">00:47</text>
    <g transform="translate(540 1150)">
      {[0, 1, 2, 3].map((i) => <rect key={i} x={-60 + i * 30} y={-16 - i * 16} width="18" height={24 + i * 16} rx="4" fill="#3b4652" />)}
      <path d="M-74 -86 L66 22" stroke="#e53935" strokeWidth="10" strokeLinecap="round" />
    </g>
    <text x="540" y="1270" textAnchor="middle" fontFamily={MONT_FALLBACK} fontWeight="800" fontSize="50" fill="#e9eef3">Нет сети</text>
    {/* большой палец справа: фаланга, сгиб, ноготь */}
    <g transform="translate(762 1340) rotate(-6) scale(0.82)">
      <path d="M-30 190 C-34 120 -30 40 -14 -20 C-6 -46 30 -46 36 -18 C42 20 40 120 34 190 Z" fill={SKIN} stroke={LINE} strokeWidth="7" />
      <path d="M-18 70 q22 8 44 0" stroke={LINE} strokeWidth="3" fill="none" opacity="0.55" />
      <path d="M-6 -24 C-2 -40 26 -40 28 -22 L26 14 C14 20 2 20 -6 14 Z" fill={NAIL} stroke={LINE} strokeWidth="3" />
      <path d="M22 -10 V120" stroke={SKIN_SH} strokeWidth="8" opacity="0.5" strokeLinecap="round" />
    </g>
  </g>
);

/**
 * 1. Сидит у окна, голова опущена, глаза закрыты → пальцы шевелятся → открывает глаза, моргает,
 * щурится от лампы → осматривает вагон → берёт телефон с сиденья и поднимает к лицу.
 * Длительность ≈ 9 с. Камера медленно наезжает к глазам (перед переходом в POV).
 */
export const Sleeper = ({ d, lead = 0 }: { d: number; lead?: number }) => {
  const t = useT() - lead;
  const r = ride(t);
  const L = lampAt(t + 1);
  // фазы
  const wake = ease(t, 2.4, 3.1, 0, 1); // голова поднимается
  // медленно разлепляет глаза, тяжело моргает дважды, потом распахивает от испуга
  const openEyes =
    t < 2.9 ? 0.05 : t < 3.4 ? ease(t, 2.9, 3.4, 0.05, 0.4) : t < 3.75 ? ease(t, 3.4, 3.75, 0.4, 0.08) : t < 4.3 ? ease(t, 3.75, 4.3, 0.08, 0.55) : t < 4.55 ? ease(t, 4.3, 4.55, 0.55, 0.1) : ease(t, 4.55, 5.2, 0.1, 1.15);
  // эмоция плавно: сонная хмурость (−0.35) → тревога (0.85)
  const fearK = t < 4.6 ? -0.35 : ease(t, 4.6, 6.4, -0.35, 0.85);
  const gape = t > 5.6 ? "o" : "closed";
  const sheen = ease(t, 5.0, 7.0, 0, 1);
  const squint = L < 0.6 && t > 4 ? 0.7 : 1; // щурится, когда лампа мигает
  const lookX = t < 4.4 ? 0 : t < 5.4 ? ease(t, 4.4, 5.0, 0, -0.9) : t < 6.3 ? ease(t, 5.4, 6.0, -0.9, 0.8) : ease(t, 6.3, 6.7, 0.8, 0.2);
  const headTurn = lookX * 10;
  const reach = ease(t, 6.0, 6.6, 0, 1) * (1 - ease(t, 6.6, 7.0, 0, 1));
  const phoneUp = ease(t, 6.6, 7.8, 0, 1);
  const finger = t > 1.4 && t < 2.3 ? Math.sin((t - 1.4) * 18) * 5 : 0;
  const breath = Math.sin(t * 1.9) * (t < 2.5 ? 6 : 9);
  const push = ease(t, d - 1.6, d, 1, 1.9); // наезд к глазам
  const headTilt = (1 - wake) * 18; // спящая голова свешена
  const headDrop = (1 - wake) * 70;
  return (
    <AbsoluteFill style={{ background: "#0d1116", transform: `translateY(${r.y}px) rotate(${r.rot}deg)` }}>
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "52% 41%" }}>
        <Svg>
          {/* стена вагона и окно за спиной (ночь, проносятся огни) */}
          <rect width="1080" height="1920" fill="#3a4644" />
          <rect x="0" y="1180" width="1080" height="740" fill="#2c3533" />
          <rect x="560" y="300" width="560" height="620" rx="24" fill="#07090c" stroke={LINE} strokeWidth="14" />
          {Array.from({ length: 4 }, (_, i) => {
            const x = ((random(`wl${i}`) * 800 - t * 900) % 900 + 900) % 900 + 520;
            return <ellipse key={i} cx={x} cy={430 + random(`wy${i}`) * 400} rx="90" ry="8" fill="#ffd38a" opacity="0.35" />;
          })}
          {/* спинка сиденья (подголовник) */}
          <path d="M120 760 C120 640 200 600 300 600 L780 600 C880 600 960 640 960 760 L980 1500 H100 Z" fill="#7a4a36" stroke={LINE} strokeWidth="9" />
          <path d="M800 610 C900 640 960 700 960 760 L980 1500 H860 Z" fill="#4e2f24" opacity="0.6" />
          {/* мягкая контактная тень от тела на сиденье */}
          <defs>
            <radialGradient id="slShadow" cx="50%" cy="50%" r="50%">
              <stop offset="0" stopColor="#000" stopOpacity="0.55" />
              <stop offset="1" stopColor="#000" stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx="560" cy="1380" rx="520" ry="380" fill="url(#slShadow)" />
          <ellipse cx="580" cy="900" rx="300" ry="260" fill="url(#slShadow)" opacity="0.6" />
          {/* тело: куртка, дыхание грудной клетки */}
          <g transform={`translate(0 ${breath * 0.3})`}>
            <path d={`M110 1920 C120 1560 190 1280 370 ${1170 + breath} L710 ${1170 + breath} C890 1280 960 1560 970 1920 Z`} fill={JK} stroke={LINE} strokeWidth="9" />
            <path d="M710 1180 C880 1280 960 1560 970 1920 H840 C850 1680 820 1400 710 1180 Z" fill={JK_SH} />
            <path d="M540 1220 V1920" stroke={LINE} strokeWidth="6" />
            {/* молния, бегунок, воротник-стойка, складки, карман */}
            <path d="M540 1220 V1920" stroke="#9aa6b2" strokeWidth="3" strokeDasharray="6 6" opacity="0.6" />
            <rect x="530" y="1260" width="20" height="40" rx="5" fill="#9aa6b2" stroke={LINE} strokeWidth="3" />
            <path d={`M380 ${1190 + breath} C420 ${1150 + breath} 470 ${1140 + breath} 540 ${1146 + breath} C610 ${1140 + breath} 660 ${1150 + breath} 700 ${1190 + breath} L690 ${1230 + breath} C640 ${1202 + breath} 600 ${1196 + breath} 540 ${1198 + breath} C480 ${1196 + breath} 440 ${1202 + breath} 390 ${1230 + breath} Z`} fill={JK_SH} stroke={LINE} strokeWidth="6" />
            <path d="M260 1520 C320 1560 360 1620 380 1700 M820 1520 C770 1560 730 1630 712 1700 M300 1640 C360 1660 400 1700 420 1760" stroke={JK_SH} strokeWidth="9" fill="none" strokeLinecap="round" />
            <path d="M600 1560 L720 1548 L728 1600 L606 1612 Z" fill="none" stroke={LINE} strokeWidth="4" opacity="0.55" />
          </g>
          {/* колени в джинсах: швы, потёртости, складки */}
          <g>
            <path d="M120 1920 C130 1800 190 1720 300 1700 C390 1690 470 1720 520 1780 L530 1920 Z" fill={DENIM} stroke={LINE} strokeWidth="8" />
            <path d="M960 1920 C950 1800 890 1720 780 1700 C690 1690 610 1720 560 1780 L550 1920 Z" fill={DENIM} stroke={LINE} strokeWidth="8" />
            <path d="M440 1730 C490 1770 512 1840 516 1920 M640 1730 C590 1770 568 1840 564 1920" stroke={DENIM_SH} strokeWidth="16" fill="none" opacity="0.8" />
            <path d="M200 1760 C260 1730 340 1722 410 1740 M870 1760 C810 1730 740 1722 670 1740" stroke="#c9a640" strokeWidth="2.5" strokeDasharray="7 6" fill="none" opacity="0.6" />
            <ellipse cx="300" cy="1800" rx="70" ry="34" fill="#5a6d8c" opacity="0.35" />
            <ellipse cx="780" cy="1800" rx="70" ry="34" fill="#5a6d8c" opacity="0.35" />
            <path d="M230 1850 C280 1836 330 1840 370 1860 M700 1860 C750 1838 800 1836 850 1850" stroke={DENIM_SH} strokeWidth="5" fill="none" />
          </g>
          {/* левая рука лежит на колене */}
          <HandTop x={310} y={1660} rot={-16} s={0.95} curl={0.25} twitch={finger * 0.8} />
          {phoneUp === 0 && (
            <g transform="translate(900 1560) rotate(78)">
              <rect x="-60" y="-110" width="120" height="220" rx="18" fill="#0d1014" stroke={LINE} strokeWidth="6" />
            </g>
          )}
          {/* голова: свешена, потом поднимается */}
          <g transform={`translate(${headTurn * 2} ${headDrop + breath * 0.4}) rotate(${headTilt + headTurn * 0.3} 540 1300) translate(540 880) scale(0.62) translate(-540 -900)`}>
            <defs>
              <clipPath id="slHead">
                <rect x="-200" y="-200" width="1480" height="1520" />
              </clipPath>
            </defs>
            <g clipPath="url(#slHead)">
            <DimaFace t={t} fear={fearK} eyes={openEyes * squint} look={[lookX, phoneUp > 0.5 ? 0.6 : 0]} mouth={gape} tremble={sheen * 0.25} />
            </g>
            {/* лёгкая испарина: влажный блеск на лбу и висках, без крупных капель */}
            <g opacity={sheen * 0.55}>
              <ellipse cx="470" cy="660" rx="70" ry="14" fill="#fff" opacity="0.35" />
              <ellipse cx="620" cy="645" rx="45" ry="10" fill="#fff" opacity="0.3" />
              <ellipse cx="292" cy="780" rx="10" ry="24" fill="#fff" opacity="0.28" />
              <ellipse cx="790" cy="790" rx="9" ry="22" fill="#fff" opacity="0.25" />
              {[[420, 700], [560, 690], [650, 712], [330, 840], [760, 860]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="4" fill="#fff" opacity="0.55" />)}
            </g>
          </g>
          {/* правая рука: лежит на колене → тянется к телефону на сиденье → поднимает к лицу */}
          <g transform={`translate(${phoneUp * -60} ${-phoneUp * 560})`}>
            {phoneUp < 0.15 && <HandTop x={770} y={1660} rot={14 - reach * 30} s={0.95} flip={-1} curl={0.2 + reach * 0.5} twitch={finger} />}
            {phoneUp > 0 && (
              <g transform="translate(770 1760) rotate(-12) scale(1.25)">
                {/* предплечье в рукаве и ладонь за телефоном */}
                <path d="M-20 640 C-6 420 20 260 40 150 L120 150 C126 260 140 420 150 640 Z" fill={JK} stroke={LINE} strokeWidth="5" />
                <path d="M100 170 C110 300 120 460 126 640" stroke={JK_SH} strokeWidth="16" fill="none" opacity="0.7" />
                <path d="M36 150 L124 150 L126 182 L32 182 Z" fill={JK_SH} stroke={LINE} strokeWidth="4" />
                <path d="M44 160 C40 120 44 80 56 40 L104 40 C112 80 114 120 110 160 Z" fill={SKIN} stroke={LINE} strokeWidth="5" />
                {/* задняя крышка телефона (экран повёрнут к лицу Димы): чехол, блок камер, логотип */}
                <rect x="-60" y="-110" width="120" height="220" rx="18" fill="#2b3036" stroke={LINE} strokeWidth="6" />
                <rect x="-52" y="-102" width="104" height="204" rx="14" fill="#353b42" />
                <rect x="-46" y="-96" width="44" height="52" rx="10" fill="#1a1d21" stroke={LINE} strokeWidth="3" />
                <circle cx="-34" cy="-82" r="8" fill="#0b0c0e" stroke="#5a6470" strokeWidth="2" />
                <circle cx="-34" cy="-58" r="8" fill="#0b0c0e" stroke="#5a6470" strokeWidth="2" />
                <circle cx="-14" cy="-70" r="4" fill="#e9e2c8" opacity="0.7" />
                <circle cx="0" cy="10" r="10" fill="none" stroke="#4a525b" strokeWidth="3" />
                {/* отсвет экрана по краю корпуса */}
                <rect x="-60" y="-110" width="120" height="220" rx="18" fill="none" stroke="#9fc3ff" strokeWidth="2" opacity="0.35" />
                {/* четыре пальца обхватывают крышку от правого края (ладонь — на ребре), кончики на середине крышки */}
                {[-34, 6, 44, 80].map((yy, i) => (
                  <g key={i}>
                    <rect x={-14 + i * 4} y={yy - 16} width={92 - i * 6} height="32" rx="16" fill={SKIN} stroke={LINE} strokeWidth="4" />
                    <path d={`M${30 + i * 2} ${yy - 12} q-5 12 0 24`} stroke={LINE} strokeWidth="2" fill="none" opacity="0.55" />
                    <path d={`M${6 + i * 3} ${yy - 12} q-5 12 0 24`} stroke={LINE} strokeWidth="2" fill="none" opacity="0.55" />
                    <path d={`M${-8 + i * 4} ${yy + 10} q20 6 40 0`} stroke={SKIN_SH} strokeWidth="5" fill="none" opacity="0.6" />
                  </g>
                ))}
                {/* ладонь и основание пальцев на правом ребре телефона */}
                <path d="M58 -60 C92 -50 100 60 92 150 C80 170 56 170 50 150 L54 -50 Z" fill={SKIN} stroke={LINE} strokeWidth="5" />
                <path d="M82 -30 C90 30 90 90 84 140" stroke={SKIN_SH} strokeWidth="10" fill="none" opacity="0.5" />
              </g>
            )}
          </g>
          {/* отсвет экрана на лице */}
          {phoneUp > 0.3 && <ellipse cx="560" cy="980" rx="260" ry="200" fill="#9fc3ff" opacity={0.12 * phoneUp} />}
        </Svg>
      </AbsoluteFill>
      {/* край спинки переднего сиденья в нижнем углу — размытый передний план для глубины */}
      <AbsoluteFill style={{ filter: "blur(14px)", pointerEvents: "none" }}>
        <svg width="1080" height="1920" viewBox="0 0 1080 1920">
          <path d="M-40 1920 L-40 1560 C40 1500 180 1490 300 1530 C360 1550 390 1600 400 1660 L420 1920 Z" fill="#3e2418" />
          <path d="M-40 1560 C40 1500 180 1490 300 1530 C360 1550 390 1600 400 1660" stroke="#7a4a33" strokeWidth="26" fill="none" />
          <rect x="250" y="1600" width="40" height="320" fill="#1d120c" opacity="0.7" />
        </svg>
      </AbsoluteFill>
      {/* мягкий луч лампы сверху, без общего затемнения */}
      <AbsoluteFill style={{ background: "radial-gradient(60% 45% at 50% 10%, rgba(235,196,116,.2) 0%, rgba(0,0,0,0) 70%)", mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ background: "#000", opacity: (1 - L) * 0.35 }} />
      <Vig />
    </AbsoluteFill>
  );
};

/**
 * 2. POV: веки смыкаются → открываются уже от первого лица; расфокус уходит за 1.5 с;
 * в руке телефон (00:47 / Нет сети), потом опускается.
 */
export const PovPhone = ({ d }: { d: number }) => {
  const t = useT();
  const r = ride(t);
  const lids = t < 0.25 ? ease(t, 0, 0.25, 0.6, 1) : t < 0.55 ? 1 : t < 0.9 ? ease(t, 0.55, 0.9, 1, 0.25) : t < 1.0 ? 0.6 : ease(t, 1.0, 1.25, 0.6, 0);
  const blur = ease(t, 0.6, 2.1, 14, 0);
  const lower = ease(t, d - 1.4, d - 0.4, 0, 1);
  const cam: Cam = { x: 0, y: 118, z: 260, roll: r.rot - 3 + ease(t, 0, 2, 3, 0), pitch: r.y + 40 };
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ filter: blur > 0.1 ? `blur(${blur}px)` : undefined }}>
        <Wagon2 cam={cam} t={t} light={0.6 * lampAt(t + 3)} />
        <Atmos t={t + 4} beam={false} />
        <Svg>
          <g transform={`translate(0 ${lower * 1000 + Math.sin(t * 2) * 6}) rotate(${-3 + Math.sin(t * 1.3)} 540 1400)`}>
            <PhoneInHand />
          </g>
        </Svg>
      </AbsoluteFill>
      {/* веки от первого лица: мягкие размытые шторки по всей ширине — сверху 80%, снизу 20% */}
      {lids > 0.01 && (
        <>
          <AbsoluteFill style={{ background: `radial-gradient(70% 55% at 50% 72%, rgba(0,0,0,0) 30%, rgba(0,0,0,${0.85 * lids}) 100%)` }} />
          <div style={{ position: "absolute", left: "-15%", width: "130%", top: -160, height: `calc(${lids * 80}% + 160px)`, background: "#000", borderRadius: "0 0 50% 50% / 0 0 120px 120px", filter: "blur(32px)" }} />
          <div style={{ position: "absolute", left: "-15%", width: "130%", bottom: -160, height: `calc(${lids * 20}% + 160px)`, background: "#000", borderRadius: "50% 50% 0 0 / 60px 60px 0 0", filter: "blur(32px)" }} />
          {lids > 0.96 && <AbsoluteFill style={{ background: "#000", opacity: (lids - 0.96) / 0.04 }} />}
        </>
      )}
      <Vig k={1.1} />
    </AbsoluteFill>
  );
};

/** Руки от первого лица. */
const PovHands = ({ left, right, swing = 0 }: { left: [number, number]; right: [number, number]; swing?: number }) => (
  <g>
    {[left, right].map(([x, y], i) => (
      <g key={i} transform={`translate(${x} ${y + (i ? -swing : swing)})`}>
        <path d={`M${i ? 120 : -120} 700 C${i ? 60 : -60} 400 0 200 0 0`} stroke={LINE} strokeWidth="190" fill="none" strokeLinecap="round" />
        <path d={`M${i ? 120 : -120} 700 C${i ? 60 : -60} 400 0 200 0 0`} stroke={JK} strokeWidth="172" fill="none" strokeLinecap="round" />
        <ellipse cx="0" cy="-30" rx="80" ry="60" fill={SKIN} stroke={LINE} strokeWidth="7" />
        {[-45, -15, 15, 45].map((dx) => <path key={dx} d={`M${dx} -70 q0 -30 ${dx * 0.1} -50`} stroke={LINE} strokeWidth="5" fill="none" />)}
      </g>
    ))}
  </g>
);

/**
 * 3. POV: опускает телефон, опирается о сиденье, встаёт (камера поднимается), идёт по проходу,
 * на секунду оглядывается — позади пусто (резкий поворот с размытием).
 */
export const PovStandWalk = ({ d }: { d: number }) => {
  const t = useT();
  const r = ride(t);
  const rise = ease(t, 0.4, 1.9, 0, 1);
  const walkT = Math.max(0, t - 2.0);
  const step = Math.sin(walkT * Math.PI * 1.8);
  const z = 260 + ease(t, 2.0, d, 0, 900);
  const back = t > d - 1.6 && t < d - 0.5; // оглядывается
  const whip = (t > d - 1.75 && t < d - 1.55) || (t > d - 0.65 && t < d - 0.45);
  const cam: Cam = back
    ? { x: 0, y: 168, z: LEN - z - 300, roll: r.rot, pitch: r.y }
    : { x: Math.sin(walkT * Math.PI * 0.9) * 6 * (walkT > 0 ? 1 : 0), y: 112 + rise * 56 + Math.abs(step) * 3 * (walkT > 0 ? 1 : 0), z, roll: r.rot + (walkT > 0 ? Math.sin(walkT * Math.PI * 0.9) * 1.2 : -4 * (1 - rise)), pitch: r.y + (1 - rise) * 60 };
  const handsY = 1500 - rise * 120;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ filter: whip ? "blur(10px)" : undefined, transform: whip ? "scaleX(1.06)" : undefined }}>
        <Wagon2 cam={cam} t={t} light={0.6 * lampAt(t + 6)} />
        <Atmos t={t + 8} beam={false} />
        {!back && (
          <Svg>
            {t < 2.0 && <PovHands left={[160, handsY]} right={[920, handsY + 20]} />}
          </Svg>
        )}
      </AbsoluteFill>
      <Vig />
    </AbsoluteFill>
  );
};

export { clamp };
