import React from "react";
import { AbsoluteFill, random } from "remotion";
import { clamp, ease, Svg, useT } from "../components/fx";
import { DimaFace } from "../train/GostOld";
import { Finger, HandTop } from "../train/Wake";
import { MONT } from "../train/Ep1Test";
import { lamp } from "../train/lamp";

/** «Не открывай» — 2D-сцены: телефон на тумбочке, Дима в кровати, глазок с «мамой», руки от первого лица. */
const LINE = "#2b1d16";
const SKIN = "#e9c4a8";
const SKIN_SH = "#cf9f84";
const NAIL = "#f3dccd";
const TEE = "#5b6168";
const TEE_SH = "#41464c";
const PHONE_GLOW = "rgba(184,220,255,";

/** Экран телефона с SMS. */
const Screen = ({ k = 1 }: { k?: number }) => (
  <g>
    <rect x="-150" y="-300" width="300" height="600" rx="40" fill="#0b0f15" />
    <rect x="-150" y="-300" width="300" height="600" rx="40" fill="#b8dcff" opacity={0.08 * k} />
    <text x="0" y="-150" textAnchor="middle" fontFamily={MONT} fontWeight="800" fontSize="92" fill="#eef4fb" opacity={k}>03:12</text>
    <text x="0" y="-100" textAnchor="middle" fontFamily={MONT} fontWeight="800" fontSize="22" fill="#9fb3c6" opacity={k}>среда, 26 ноября</text>
    <g opacity={k} transform="translate(0 0)">
      <rect x="-130" y="-60" width="260" height="120" rx="22" fill="#1b2533" stroke="#36506d" strokeWidth="2" />
      <text x="-110" y="-24" fontFamily={MONT} fontWeight="800" fontSize="22" fill="#cfe2f5">Мама</text>
      <text x="110" y="-24" textAnchor="end" fontFamily={MONT} fontWeight="800" fontSize="16" fill="#7f95ab">сейчас</text>
      <text x="-110" y="10" fontFamily={MONT} fontWeight="800" fontSize="21" fill="#eef4fb">Я на даче,</text>
      <text x="-110" y="38" fontFamily={MONT} fontWeight="800" fontSize="21" fill="#eef4fb">буду завтра</text>
    </g>
  </g>
);

/** 0:00–1:30 — темнота, телефон вибрирует на тумбочке и вспыхивает. */
export const PhoneFlash = () => {
  const t = useT();
  const on = t > 0.04 ? 1 : 0;
  const buzz = t < 0.9 ? Math.sin(t * 90) * 4 : 0;
  const push = ease(t, 0, 1.3, 1.0, 1.12);
  return (
    <AbsoluteFill style={{ background: "#020203" }}>
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        <Svg>
          {/* тумбочка: дерево в темноте */}
          <rect x="0" y="900" width="1080" height="1020" fill="#1b120c" />
          {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M0 ${960 + i * 110} C300 ${940 + i * 110} 700 ${990 + i * 110} 1080 ${960 + i * 110}`} stroke="#120b07" strokeWidth="4" fill="none" />)}
          <rect x="0" y="880" width="1080" height="30" fill="#2a1b11" />
          {/* стакан воды и зарядка */}
          <ellipse cx="230" cy="1120" rx="70" ry="22" fill="#0c0d10" />
          <path d="M600 1500 C700 1560 860 1520 1080 1600" stroke="#0a0a0b" strokeWidth="10" fill="none" />
          {/* отсвет экрана на дереве */}
          <ellipse cx="560" cy="1260" rx={420} ry={330} fill="#b8dcff" opacity={0.18 * on} />
          <g transform={`translate(${560 + buzz} 1240) rotate(-8)`}>
            <rect x="-162" y="-312" width="324" height="624" rx="46" fill="#111" stroke={LINE} strokeWidth="8" />
            <Screen k={on} />
          </g>
        </Svg>
      </AbsoluteFill>
      {/* размытый край ночника на переднем плане */}
      <AbsoluteFill style={{ filter: "blur(18px)" }}>
        <Svg>
          <path d="M-60 1920 L-60 1500 C80 1440 260 1460 360 1560 L420 1920 Z" fill="#0c0806" />
        </Svg>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(60% 40% at 52% 64%, rgba(0,0,0,0) 30%, rgba(0,0,0,.85) 100%)` }} />
    </AbsoluteFill>
  );
};

/** 1:30–4:00 — Дима подрывается в кровати, телефон в руке экраном к лицу, холодный свет снизу, тёплый клин из двери. */
export const BedSitUp = () => {
  const t = useT();
  const up = ease(t, 0.0, 0.35, 0, 1);
  const eyes = t < 0.2 ? 0.25 : ease(t, 0.2, 0.7, 0.35, 1.25);
  const fear = ease(t, 0.3, 1.6, 0.0, 0.9);
  const look = t < 1.2 ? [0, 0.5] : [ease(t, 1.2, 1.6, 0, 0.9), -0.1];
  const mouth = t > 1.4 ? "o" : "closed";
  const breath = Math.sin(t * 5) * 6;
  const shake = t < 0.3 ? Math.sin(t * 70) * 10 * (1 - t / 0.3) : 0;
  const warm = 0.75 + 0.25 * lamp(t + 9);
  return (
    <AbsoluteFill style={{ background: "#050507", transform: `translate(${shake}px, 0)` }}>
      <Svg>
        {/* стена и изголовье */}
        <rect width="1080" height="1920" fill="#14161a" />
        <rect x="80" y="560" width="920" height="560" rx="30" fill="#1f1712" stroke={LINE} strokeWidth="8" />
        {/* подушка */}
        <ellipse cx="540" cy="1120" rx="420" ry="120" fill="#2b2f36" stroke={LINE} strokeWidth="6" />
        {/* тело в футболке: садится */}
        <g transform={`translate(0 ${(1 - up) * 260 + breath * 0.3})`}>
          <path d={`M170 1920 C180 1580 250 1400 390 1330 L690 1330 C830 1400 900 1580 910 1920 Z`} fill={TEE} stroke={LINE} strokeWidth="9" />
          <path d="M690 1340 C830 1410 900 1580 910 1920 H800 C810 1700 780 1480 690 1340 Z" fill={TEE_SH} />
          <path d="M440 1330 C470 1380 610 1380 640 1330" fill="none" stroke={LINE} strokeWidth="6" />
          <path d="M300 1520 C340 1560 360 1620 370 1700 M780 1520 C740 1570 720 1630 712 1700" stroke={TEE_SH} strokeWidth="8" fill="none" />
          {/* голова */}
          <g transform={`translate(0 0) translate(540 900) scale(0.62) translate(-540 -900) rotate(${(1 - up) * 14} 540 1300)`}>
            <defs>
              <clipPath id="doHead">
                <rect x="-200" y="-200" width="1480" height="1520" />
              </clipPath>
            </defs>
            <g clipPath="url(#doHead)">
              <DimaFace t={t} fear={fear} eyes={eyes} look={look as [number, number]} mouth={mouth} sweat={ease(t, 1.0, 2.5, 0, 0.8)} tremble={ease(t, 0.8, 2.0, 0, 0.5)} />
            </g>
          </g>
          {/* рука с телефоном: зрителю — задняя крышка, экран к лицу */}
          <g transform="translate(700 1300) rotate(-14) scale(1.3)">
            <path d="M40 520 C40 380 50 260 60 160 L140 160 C150 260 160 380 170 520 Z" fill={TEE} stroke={LINE} strokeWidth="5" />
            <path d="M48 160 C42 120 44 70 56 30 L128 30 C138 70 140 120 134 160 Z" fill={SKIN} stroke={LINE} strokeWidth="5" />
            <rect x="-60" y="-110" width="120" height="220" rx="18" fill="#2b3036" stroke={LINE} strokeWidth="6" />
            <rect x="-52" y="-102" width="104" height="204" rx="14" fill="#353b42" />
            <rect x="-46" y="-96" width="44" height="52" rx="10" fill="#1a1d21" stroke={LINE} strokeWidth="3" />
            <circle cx="-34" cy="-82" r="8" fill="#0b0c0e" stroke="#5a6470" strokeWidth="2" />
            <circle cx="-34" cy="-58" r="8" fill="#0b0c0e" stroke="#5a6470" strokeWidth="2" />
            <rect x="-60" y="-110" width="120" height="220" rx="18" fill="none" stroke="#b8dcff" strokeWidth="3" opacity="0.5" />
            {[-34, 6, 44, 80].map((yy, i) => (
              <g key={i}>
                <rect x={-14 + i * 4} y={yy - 16} width={92 - i * 6} height="32" rx="16" fill={SKIN} stroke={LINE} strokeWidth="4" />
                <path d={`M${30 + i * 2} ${yy - 12} q-5 12 0 24`} stroke={LINE} strokeWidth="2" fill="none" opacity="0.55" />
              </g>
            ))}
            <path d="M58 -60 C92 -50 100 60 92 150 C80 170 56 170 50 150 L54 -50 Z" fill={SKIN} stroke={LINE} strokeWidth="5" />
          </g>
        </g>
        {/* одеяло */}
        <path d="M0 1700 C200 1640 420 1660 560 1700 C720 1740 900 1700 1080 1660 V1920 H0 Z" fill="#1d2a40" stroke={LINE} strokeWidth="8" />
        {Array.from({ length: 5 }, (_, i) => <path key={i} d={`M${100 + i * 200} 1740 C${160 + i * 200} 1800 ${120 + i * 200} 1860 ${170 + i * 200} 1920`} stroke="#141d2c" strokeWidth="8" fill="none" />)}
      </Svg>
      {/* тёплый клин из приоткрытой двери справа: резкий, с длинной тенью */}
      <AbsoluteFill style={{ clipPath: "polygon(78% 0%, 92% 0%, 100% 100%, 58% 100%)", background: `linear-gradient(180deg, rgba(217,160,67,${0.38 * warm}) 0%, rgba(217,160,67,${0.12 * warm}) 100%)`, mixBlendMode: "screen", filter: "blur(10px)" }} />
      {/* глубокая тьма комнаты */}
      <AbsoluteFill style={{ background: "radial-gradient(38% 26% at 50% 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,.55) 70%, rgba(0,0,0,.82) 100%)" }} />
      {/* холодный свет экрана снизу-спереди на лицо, подбородок и пальцы */}
      <AbsoluteFill style={{ background: `radial-gradient(20% 9% at 50% 47%, ${PHONE_GLOW}.32) 0%, ${PHONE_GLOW}0) 100%), radial-gradient(10% 8% at 68% 66%, ${PHONE_GLOW}.4) 0%, ${PHONE_GLOW}0) 100%)`, mixBlendMode: "screen" }} />
      {/* размытый край тумбочки на переднем плане */}
      <AbsoluteFill style={{ filter: "blur(16px)" }}>
        <Svg>
          <path d="M-60 1920 L-60 1480 C60 1420 240 1430 330 1500 L360 1920 Z" fill="#120c08" />
          <path d="M-60 1480 C60 1420 240 1430 330 1500" stroke="#3a2618" strokeWidth="20" fill="none" />
        </Svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** «Мама» на лестничной клетке. smile: 1 — слишком широкая неподвижная улыбка, 0 — без улыбки. near — насколько вплотную к глазку. */
const Mom = ({ t, smile, near }: { t: number; smile: number; near: number }) => {
  const s = 0.75 + near * 0.9;
  const blink = Math.floor(t * 10) % 37 === 0 && smile > 0.5 ? 0.15 : 1;
  return (
    <g transform={`translate(540 ${980 + near * 120}) scale(${s}) translate(-540 -900)`}>
      {/* пальто и шарф */}
      <path d="M250 1700 C260 1420 330 1260 440 1220 L640 1220 C750 1260 820 1420 830 1700 Z" fill="#6e5a48" stroke={LINE} strokeWidth="8" />
      <path d="M430 1220 C470 1290 610 1290 650 1220 L640 1320 C590 1350 490 1350 440 1320 Z" fill="#8a2f2f" stroke={LINE} strokeWidth="6" />
      {/* шея и лицо */}
      <path d="M480 1120 L480 1230 L600 1230 L600 1120 Z" fill={SKIN_SH} stroke={LINE} strokeWidth="6" />
      <ellipse cx="540" cy="930" rx="190" ry="235" fill={SKIN} stroke={LINE} strokeWidth="8" />
      <path d="M680 820 C720 920 710 1040 660 1120 C700 1020 700 920 680 820 Z" fill={SKIN_SH} opacity="0.6" />
      {/* причёска: каре с завивкой, рыжеватая краска */}
      <path d="M345 920 C320 720 420 640 540 640 C680 640 770 730 740 930 C720 860 690 800 640 780 C590 820 500 830 430 790 C390 820 360 860 345 920 Z" fill="#7a3f24" stroke={LINE} strokeWidth="8" />
      <path d="M350 900 C330 990 350 1060 380 1100 M735 900 C755 990 735 1060 705 1100" stroke="#7a3f24" strokeWidth="34" fill="none" strokeLinecap="round" />
      {/* брови и глаза: неподвижный взгляд прямо в глазок */}
      <path d="M430 870 C460 855 500 855 520 868 M560 868 C580 855 620 855 650 870" stroke="#4a2818" strokeWidth="9" fill="none" strokeLinecap="round" />
      {[480, 600].map((cx) => (
        <g key={cx}>
          <ellipse cx={cx} cy="920" rx="30" ry={18 * blink} fill="#f4efe6" stroke={LINE} strokeWidth="4" />
          <circle cx={cx} cy="921" r={9 * blink} fill="#2a1a14" />
          <circle cx={cx - 4} cy="917" r={3 * blink} fill="#fff" />
        </g>
      ))}
      <path d="M535 940 C545 990 548 1010 535 1022" stroke={LINE} strokeWidth="5" fill="none" />
      {/* рот: слишком широкая улыбка → ровная линия */}
      {smile > 0.5 ? (
        <g>
          <path d="M420 1060 C470 1110 610 1110 660 1060 C620 1080 460 1080 420 1060 Z" fill="#5a1d1d" stroke={LINE} strokeWidth="5" />
          <path d="M440 1066 C490 1082 590 1082 640 1066" stroke="#f1ece0" strokeWidth="9" fill="none" />
          <path d="M410 1055 l-14 -6 M670 1055 l14 -6" stroke={LINE} strokeWidth="4" />
        </g>
      ) : (
        <path d="M480 1075 C510 1072 570 1072 600 1075" stroke={LINE} strokeWidth="6" fill="none" />
      )}
      {/* холодный пот / мертвенная бледность */}
      <ellipse cx="540" cy="930" rx="190" ry="235" fill="#c9d6c8" opacity={0.18 + (1 - smile) * 0.12} />
    </g>
  );
};

/** Вид в глазок: рыбий глаз, лестничная клетка, мигающая лампа подъезда. */
export const Peephole = ({ smile = 1, near = 0 }: { smile?: number; near?: number }) => {
  const t = useT();
  const L = lamp(t * 1.3 + 5);
  const flick = L < 0.6 ? 0.35 : 1;
  const zoomIn = ease(t, 0, 0.35, 1.25, 1);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Svg>
        <defs>
          <clipPath id="peep">
            <circle cx="540" cy="960" r="470" />
          </clipPath>
          <radialGradient id="peepVig" cx="50%" cy="50%" r="50%">
            <stop offset="0.55" stopColor="#000" stopOpacity="0" />
            <stop offset="0.92" stopColor="#000" stopOpacity="0.85" />
            <stop offset="1" stopColor="#000" stopOpacity="1" />
          </radialGradient>
        </defs>
        <g clipPath="url(#peep)" transform={`translate(540 960) scale(${zoomIn}) translate(-540 -960)`}>
          {/* подъезд: стены, изогнутые рыбьим глазом */}
          <rect x="0" y="0" width="1080" height="1920" fill="#2d3a2e" />
          <path d="M70 400 C300 520 780 520 1010 400 L1010 1520 C780 1400 300 1400 70 1520 Z" fill="#3c4c3a" />
          <path d="M70 1520 C300 1400 780 1400 1010 1520 L1010 1920 H70 Z" fill="#3a2e26" />
          <path d="M70 1120 C300 1060 780 1060 1010 1120" stroke="#26301f" strokeWidth="16" fill="none" />
          {Array.from({ length: 6 }, (_, i) => (
            <circle key={i} cx={200 + random(`pp${i}`) * 680} cy={560 + random(`pq${i}`) * 500} r={4 + random(`pr${i}`) * 8} fill="#1e271b" opacity="0.6" />
          ))}
          {/* соседская дверь и лампа под потолком */}
          <path d="M130 600 C150 640 160 1400 150 1450 L260 1430 C270 1380 260 650 245 610 Z" fill="#4a2e22" stroke={LINE} strokeWidth="6" />
          <circle cx="540" cy="470" r="22" fill={`rgba(255,226,160,${flick})`} />
          <ellipse cx="540" cy="760" rx="420" ry="360" fill="#ffd98a" opacity={0.14 * flick} />
          <Mom t={t} smile={smile} near={near} />
          {/* мигание лампы гасит площадку */}
          <rect x="0" y="0" width="1080" height="1920" fill="#000" opacity={(1 - flick) * 0.75} />
        </g>
        <circle cx="540" cy="960" r="470" fill="url(#peepVig)" />
        {/* блик и мутное стекло линзы */}
        <ellipse cx="400" cy="760" rx="120" ry="60" fill="#fff" opacity="0.05" transform="rotate(-30 400 760)" />
        <circle cx="540" cy="960" r="470" fill="none" stroke="#120d0a" strokeWidth="26" />
      </Svg>
    </AbsoluteFill>
  );
};

/** POV: телефон в левой руке (экран к глазам, большой палец на рамке), свет экрана на пальцах. */
export const PovPhone = ({ k = 1 }: { k?: number }) => {
  const t = useT();
  const bob = Math.sin(t * Math.PI * 3.8) * 10;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <Svg>
        <g transform={`translate(${-40} ${(1 - k) * 700 + bob}) rotate(8 300 1700)`}>
          {/* пальцы за корпусом: только боковины у левого края */}
          {[1430, 1510, 1590].map((y, i) => (
            <path key={i} d={`M232 ${y - 34} C204 ${y - 36} 190 ${y - 16} 190 ${y} C190 ${y + 20} 204 ${y + 34} 232 ${y + 32} Z`} fill={SKIN} stroke={LINE} strokeWidth="5" />
          ))}
          <path d="M150 1920 C170 1800 200 1720 240 1690 L470 1690 C500 1730 520 1820 520 1920 Z" fill={SKIN} stroke={LINE} strokeWidth="6" />
          <path d="M120 1920 C140 1840 170 1790 200 1770 L250 1920 Z" fill={TEE} stroke={LINE} strokeWidth="6" />
          <rect x="220" y="1180" width="270" height="540" rx="38" fill="#0d1014" stroke={LINE} strokeWidth="9" />
          <g transform="translate(355 1450) scale(0.82)">
            <Screen />
          </g>
          {/* большой палец лежит на правой рамке */}
          <g transform="translate(490 1560) rotate(-12) scale(0.7)">
            <path d="M-30 190 C-34 120 -30 40 -14 -20 C-6 -46 30 -46 36 -18 C42 20 40 120 34 190 Z" fill={SKIN} stroke={LINE} strokeWidth="7" />
            <path d="M-6 -24 C-2 -40 26 -40 28 -22 L26 14 C14 20 2 20 -6 14 Z" fill={NAIL} stroke={LINE} strokeWidth="3" />
          </g>
        </g>
      </Svg>
      {/* холодный отсвет экрана на руку */}
      <AbsoluteFill style={{ background: `radial-gradient(22% 16% at 30% 76%, ${PHONE_GLOW}.4) 0%, ${PHONE_GLOW}0) 100%)`, mixBlendMode: "screen", opacity: k }} />
    </AbsoluteFill>
  );
};

/** POV: правая рука тянется к верхнему замку и замирает. */
export const LockHand = ({ freezeAt = 2.6 }: { freezeAt?: number }) => {
  const t = useT();
  const reach = ease(t, 0, Math.min(freezeAt, 2.2), 0, 1);
  const tremble = t > freezeAt ? Math.sin(t * 45) * 4 : Math.sin(t * 20) * 1.5;
  const pull = t > freezeAt ? ease(t, freezeAt, freezeAt + 0.4, 0, 1) : 0;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <Svg>
        <g transform={`translate(${760 + tremble} ${1980 - reach * 620 + pull * 140}) rotate(${172 - reach * 8}) scale(1.4)`}>
          <HandTop x={0} y={0} curl={0.15 + pull * 0.5} twitch={tremble * 0.3} />
        </g>
      </Svg>
      {/* тёплый свет подъезда из-под двери на пальцах */}
      <AbsoluteFill style={{ background: "radial-gradient(18% 12% at 70% 70%, rgba(217,160,67,.18) 0%, rgba(0,0,0,0) 100%)", mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
};

export { Finger, clamp };
