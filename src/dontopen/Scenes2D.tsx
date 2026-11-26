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
const Screen = ({ k = 1, play = -1 }: { k?: number; play?: number }) => (
  <g>
    <rect x="-150" y="-300" width="300" height="600" rx="40" fill="#0b0f15" />
    <rect x="-150" y="-300" width="300" height="600" rx="40" fill="#b8dcff" opacity={0.08 * k} />
    <g opacity={k}>
      <text x="0" y="-205" textAnchor="middle" fontFamily={MONT} fontWeight="800" fontSize="78" fill="#eef4fb">03:12</text>
      <text x="0" y="-168" textAnchor="middle" fontFamily={MONT} fontWeight="800" fontSize="20" fill="#9fb3c6">среда, 26 ноября</text>
      {/* чат с другом */}
      <rect x="-135" y="-140" width="270" height="86" rx="20" fill="#1e2630" />
      <text x="-118" y="-112" fontFamily={MONT} fontWeight="800" fontSize="19" fill="#9fd0ff">Лёха</text>
      <text x="-118" y="-84" fontFamily={MONT} fontWeight="800" fontSize="17" fill="#e6edf5">лан, я спать, не ссы</text>
      <text x="-118" y="-62" fontFamily={MONT} fontWeight="800" fontSize="17" fill="#e6edf5">там один)</text>
      {/* SMS мамы */}
      <rect x="-135" y="-40" width="270" height="86" rx="20" fill="#1b2533" stroke="#36506d" strokeWidth="2" />
      <text x="-118" y="-12" fontFamily={MONT} fontWeight="800" fontSize="19" fill="#cfe2f5">Мама</text>
      <text x="118" y="-12" textAnchor="end" fontFamily={MONT} fontWeight="800" fontSize="14" fill="#7f95ab">сейчас</text>
      <text x="-118" y="16" fontFamily={MONT} fontWeight="800" fontSize="18" fill="#eef4fb">Я на даче, буду завтра</text>
      {/* голосовое 0:02 */}
      <rect x="-135" y="60" width="270" height="70" rx="20" fill="#1b2533" stroke="#36506d" strokeWidth="2" />
      <circle cx="-100" cy="95" r="20" fill="#3d8bfd" />
      {play >= 0 ? <rect x="-107" y="86" width="5" height="18" fill="#fff" /> : <path d="M-106 84 L-90 95 L-106 106 Z" fill="#fff" />}
      {play >= 0 && <rect x="-97" y="86" width="5" height="18" fill="#fff" />}
      {Array.from({ length: 18 }, (_, i) => {
        const h = 6 + Math.abs(Math.sin(i * 1.7)) * 22;
        const lit = play >= 0 && i / 18 < play;
        return <rect key={i} x={-70 + i * 9} y={95 - h / 2} width="5" height={h} rx="2" fill={lit ? "#9fd0ff" : "#56708c"} />;
      })}
      <text x="118" y="122" textAnchor="end" fontFamily={MONT} fontWeight="800" fontSize="14" fill="#7f95ab">0:02</text>
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
          {t > 0.25 && t < 0.7 && (
            <g transform={`translate(${470 - (0.7 - t) * 80} ${1355 + (0.7 - t) * 260})`}>
              <path d="M-26 300 C-28 160 -24 60 -10 0 C-2 -24 26 -24 32 0 C40 60 40 160 38 300 Z" fill="#e9c4a8" stroke={LINE} strokeWidth="6" />
              <path d="M-4 -6 C0 -20 22 -20 24 -4 L22 24 C12 30 2 30 -4 24 Z" fill="#f3dccd" stroke={LINE} strokeWidth="3" />
            </g>
          )}
          <g transform={`translate(${545 + buzz} 1160) rotate(-6) scale(1.35)`}>
            <rect x="-162" y="-312" width="324" height="624" rx="46" fill="#111" stroke={LINE} strokeWidth="8" />
            <Screen k={on} play={t > 0.4 ? clamp((t - 0.4) / 0.9) : -1} />
            {/* красные овалы-маркеры улик: время и «Я на даче» */}
            {[
              [0, -222, 118, 50, 0.2],
              [0, 4, 150, 50, 0.45],
            ].map(([cx, cy, rx, ry, d], i) => {
              const k = clamp((t - (d as number)) / 0.35);
              const len = Math.PI * 2 * (rx as number) * 1.05;
              return k > 0 ? (
                <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke="#e5262b" strokeWidth="6" strokeLinecap="round" strokeDasharray={`${len * k} ${len}`} transform={`rotate(-4 ${cx} ${cy})`} />
              ) : null;
            })}
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
        {/* окно со шторами: слабый холодный отсвет улицы */}
        <rect x="30" y="120" width="330" height="470" fill="#1a2436" stroke={LINE} strokeWidth="10" />
        <path d="M195 120 V590 M30 355 H360" stroke={LINE} strokeWidth="8" />
        <rect x="30" y="120" width="330" height="470" fill="#6f8fbf" opacity="0.18" />
        {Array.from({ length: 5 }, (_, i) => <circle key={i} cx={70 + i * 62} cy={480 - (i % 2) * 30} r="5" fill="#ffd38a" opacity="0.6" />)}
        <path d="M0 90 C30 250 10 420 40 640 L0 640 Z" fill="#2a1f2c" stroke={LINE} strokeWidth="6" />
        <path d="M390 90 C350 250 380 420 340 640 L400 640 L400 90 Z" fill="#2a1f2c" stroke={LINE} strokeWidth="6" />
        {[60, 100, 360].map((x, i) => <path key={i} d={`M${x} 110 C${x + 8} 300 ${x - 6} 460 ${x + 4} 630`} stroke="#1c141e" strokeWidth="5" fill="none" />)}
        <path d="M0 640 L420 640 L600 1920 L0 1920 Z" fill="#6f8fbf" opacity="0.05" />
        <rect x="80" y="560" width="920" height="560" rx="30" fill="#1f1712" stroke={LINE} strokeWidth="8" />
        {/* подушка */}
        <rect x="120" y="1050" width="840" height="150" rx="70" fill="#2b2f36" stroke={LINE} strokeWidth="6" />
        {/* тело в футболке: садится */}
        <g transform={`translate(0 ${(1 - up) * 260 + breath * 0.3})`}>
          <path d={`M170 1920 C180 1580 250 1400 390 1330 L690 1330 C830 1400 900 1580 910 1920 Z`} fill={TEE} stroke={LINE} strokeWidth="9" />
          <path d="M690 1340 C830 1410 900 1580 910 1920 H800 C810 1700 780 1480 690 1340 Z" fill={TEE_SH} />
          <path d="M440 1330 C470 1380 610 1380 640 1330" fill="none" stroke={LINE} strokeWidth="6" />
          <path d="M300 1520 C340 1560 360 1620 370 1700 M780 1520 C740 1570 720 1630 712 1700" stroke={TEE_SH} strokeWidth="8" fill="none" />
          {/* голова */}
          <g transform={`translate(0 0) translate(540 1075) scale(0.62) translate(-540 -900) rotate(${(1 - up) * 14} 540 1300)`} style={{ filter: "drop-shadow(5px -2px 3px rgba(217,155,56,.55))" }}>
            <defs>
              <clipPath id="doHead">
                <rect x="-200" y="-200" width="1480" height="1430" />
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
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.45) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 70%, rgba(0,0,0,.55) 100%), linear-gradient(90deg, rgba(0,0,0,.35) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 75%, rgba(0,0,0,.4) 100%)" }} />
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
const Mom = ({ t, smile, near, talk }: { t: number; smile: number; near: number; talk: number }) => {
  const s = 0.75 + near * 0.9;
  const blink = Math.floor(t * 10) % 37 === 0 && smile > 0.5 ? 0.15 : 1;
  return (
    <g transform={`translate(540 ${980 + near * 120}) scale(${s}) translate(-540 -900)`}>
      {/* пальто и шарф */}
      <path d="M250 1700 C260 1420 330 1260 440 1220 L640 1220 C750 1260 820 1420 830 1700 Z" fill="#6e1f24" stroke={LINE} strokeWidth="8" />
      <path d="M540 1240 V1700 M500 1400 l0 0 M520 1420 a8 8 0 1 0 0.1 0 M520 1540 a8 8 0 1 0 0.1 0" stroke="#3a0e10" strokeWidth="6" fill="#2a0a0c" />
      <path d="M430 1220 C470 1290 610 1290 650 1220 L640 1320 C590 1350 490 1350 440 1320 Z" fill="#8a8580" stroke={LINE} strokeWidth="6" />
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
        <g transform={`translate(540 1068) scale(1 ${1 + talk * 0.9}) translate(-540 -1068)`}>
          <path d="M372 1030 C440 1130 640 1130 708 1030 C640 1075 440 1075 372 1030 Z" fill="#3a0c0c" stroke={LINE} strokeWidth="6" />
          <path d="M392 1042 C460 1072 620 1072 688 1042 L680 1056 C620 1080 460 1080 400 1056 Z" fill="#f1ece0" stroke={LINE} strokeWidth="2.5" />
          {Array.from({ length: 13 }, (_, i) => <path key={i} d={`M${410 + i * 21} 1050 v14`} stroke={LINE} strokeWidth="2" />)}
          <path d="M360 1022 l-16 -10 M720 1022 l16 -10" stroke={LINE} strokeWidth="5" />
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
/** Карта смещений для бочкообразного искажения «рыбьего глаза» (R — x, G — y). */
let fishMap: string | null = null;
const getFishMap = () => {
  if (fishMap) return fishMap;
  const S = 256;
  const c = document.createElement("canvas");
  c.width = S;
  c.height = S;
  const g = c.getContext("2d")!;
  const img = g.createImageData(S, S);
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const nx = (x / S) * 2 - 1;
      const ny = (y / S) * 2 - 1;
      const r2 = nx * nx + ny * ny;
      const k = -0.5 * r2; // тянет края к центру
      const i = (y * S + x) * 4;
      img.data[i] = Math.max(0, Math.min(255, 128 + nx * k * 127));
      img.data[i + 1] = Math.max(0, Math.min(255, 128 + ny * k * 127));
      img.data[i + 2] = 128;
      img.data[i + 3] = 255;
    }
  g.putImageData(img, 0, 0);
  fishMap = c.toDataURL();
  return fishMap;
};

/** Вид в глазок: рыбий глаз, запотевание от дыхания, мигающая лампа и красная кнопка лифта. talk — интервалы речи [с,по] (локально), frozen — рот не двигается. */
export const Peephole = ({ smile = 1, near = 0, talk = [], frozen = false }: { smile?: number; near?: number; talk?: [number, number][]; frozen?: boolean }) => {
  const t = useT();
  const L = lamp(t * 1.3 + 5);
  const flick = L < 0.6 ? 0.35 : 1;
  const zoomIn = ease(t, 0, 0.35, 1.25, 1);
  const talking = !frozen && talk.some(([a, b]) => t > a && t < b);
  const mouth = talking ? Math.abs(Math.sin(t * 17)) * (0.5 + 0.5 * Math.abs(Math.sin(t * 5.3))) : 0;
  const fog = 0.5 + 0.5 * Math.sin(t * 2.3);
  const lift = Math.floor(t * 2.2) % 2 === 0;
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
          <radialGradient id="peepFog" cx="50%" cy="58%" r="50%">
            <stop offset="0" stopColor="#dfe6e8" stopOpacity="0.5" />
            <stop offset="1" stopColor="#dfe6e8" stopOpacity="0" />
          </radialGradient>
          <filter id="fisheye" x="-10%" y="-10%" width="120%" height="120%">
            <feImage href={getFishMap()} x="70" y="490" width="940" height="940" result="map" preserveAspectRatio="none" />
            <feDisplacementMap in="SourceGraphic" in2="map" scale="300" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        <g clipPath="url(#peep)">
          <g filter="url(#fisheye)" transform={`translate(540 960) scale(${zoomIn}) translate(-540 -960)`}>
            <rect x="0" y="0" width="1080" height="1920" fill="#2d3a2e" />
            <path d="M70 400 C300 520 780 520 1010 400 L1010 1520 C780 1400 300 1400 70 1520 Z" fill="#3c4c3a" />
            <path d="M70 1520 C300 1400 780 1400 1010 1520 L1010 1920 H70 Z" fill="#3a2e26" />
            <path d="M70 1120 C300 1060 780 1060 1010 1120" stroke="#26301f" strokeWidth="16" fill="none" />
            {Array.from({ length: 6 }, (_, i) => (
              <circle key={i} cx={200 + random(`pp${i}`) * 680} cy={560 + random(`pq${i}`) * 500} r={4 + random(`pr${i}`) * 8} fill="#1e271b" opacity="0.6" />
            ))}
            <path d="M130 600 C150 640 160 1400 150 1450 L260 1430 C270 1380 260 650 245 610 Z" fill="#4a2e22" stroke={LINE} strokeWidth="6" />
            {/* лифт: створки и мигающая красная кнопка */}
            <rect x="800" y="660" width="170" height="640" fill="#5a5f5c" stroke={LINE} strokeWidth="6" />
            <path d="M885 660 V1300" stroke={LINE} strokeWidth="5" />
            <rect x="770" y="900" width="22" height="44" rx="4" fill="#2a2a2a" stroke={LINE} strokeWidth="3" />
            <circle cx="781" cy="922" r="8" fill={lift ? "#ff2a1a" : "#4a0d08"} />
            {lift && <circle cx="781" cy="922" r="26" fill="#ff2a1a" opacity="0.25" />}
            <circle cx="540" cy="470" r="22" fill={`rgba(255,226,160,${flick})`} />
            <ellipse cx="540" cy="760" rx="420" ry="360" fill="#ffd98a" opacity={0.14 * flick} />
            <Mom t={t} smile={smile} near={near} talk={mouth} />
            <rect x="0" y="0" width="1080" height="1920" fill="#000" opacity={(1 - flick) * 0.75} />
          </g>
          {/* запотевание стекла в такт дыханию */}
          <circle cx="540" cy="1000" r="430" fill="url(#peepFog)" opacity={0.35 + 0.5 * fog} />
        </g>
        <circle cx="540" cy="960" r="470" fill="url(#peepVig)" />
        <ellipse cx="400" cy="760" rx="120" ry="60" fill="#fff" opacity="0.05" transform="rotate(-30 400 760)" />
        <circle cx="540" cy="960" r="470" fill="none" stroke="#120d0a" strokeWidth="26" />
      </Svg>
    </AbsoluteFill>
  );
};

/** Экран «Локатора»: мама на даче за 60 км, поверх всплывает видеозвонок «Мама ❤️». */
export const LocatorCall = () => {
  const t = useT();
  const buzz = t > 0.5 ? Math.sin(t * 80) * 6 : 0;
  const call = ease(t, 0.5, 0.75, -420, 0);
  return (
    <AbsoluteFill style={{ background: "#020203" }}>
      <Svg>
        <g transform={`translate(${540 + buzz} 980) scale(2.6)`}>
          <rect x="-165" y="-320" width="330" height="640" rx="44" fill="#111" stroke={LINE} strokeWidth="6" />
          <clipPath id="locClip">
            <rect x="-150" y="-300" width="300" height="600" rx="36" />
          </clipPath>
          <g clipPath="url(#locClip)">
            <rect x="-150" y="-300" width="300" height="600" fill="#1d2a22" />
            {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M-160 ${-280 + i * 70} C-40 ${-300 + i * 70} 60 ${-250 + i * 70} 160 ${-270 + i * 70}`} stroke="#2f4236" strokeWidth={i % 3 ? 3 : 7} fill="none" />)}
            {Array.from({ length: 5 }, (_, i) => <path key={i} d={`M${-120 + i * 60} -300 L${-100 + i * 55} 300`} stroke="#2f4236" strokeWidth="3" />)}
            <path d="M0 200 C-40 80 60 -40 20 -190" stroke="#e85d75" strokeWidth="4" strokeDasharray="10 8" fill="none" />
            <circle cx="0" cy="200" r="12" fill="#3d8bfd" stroke="#fff" strokeWidth="4" />
            <text x="18" y="206" fontFamily={MONT} fontWeight="800" fontSize="16" fill="#fff">Вы</text>
            <circle cx="20" cy="-190" r="16" fill="#e85d75" stroke="#fff" strokeWidth="4" />
            <rect x="-110" y="-260" width="220" height="40" rx="12" fill="#0d1014" opacity="0.9" />
            <text x="0" y="-234" textAnchor="middle" fontFamily={MONT} fontWeight="800" fontSize="17" fill="#fff">Мама · Дача · 60 км</text>
            {/* входящий видеозвонок */}
            <g transform={`translate(0 ${call})`}>
              <rect x="-150" y="-300" width="300" height="170" fill="#0d1014" opacity="0.94" />
              <circle cx="-100" cy="-215" r="30" fill="#6e1f24" />
              <text x="-100" y="-206" textAnchor="middle" fontFamily={MONT} fontWeight="800" fontSize="24" fill="#fff">М</text>
              <text x="-55" y="-228" fontFamily={MONT} fontWeight="800" fontSize="22" fill="#fff">Мама ❤️</text>
              <text x="-55" y="-202" fontFamily={MONT} fontWeight="800" fontSize="15" fill="#9fb3c6">Видеозвонок…</text>
              <circle cx="60" cy="-160" r="18" fill="#e74c3c" />
              <circle cx="110" cy="-160" r="18" fill="#2ecc71" />
            </g>
          </g>
        </g>
      </Svg>
      <AbsoluteFill style={{ background: "radial-gradient(60% 45% at 50% 50%, rgba(184,220,255,.12) 0%, rgba(0,0,0,0) 70%)", mixBlendMode: "screen" }} />
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
        <g transform={`translate(1090 1930) scale(0.65) translate(-1000 -1920) translate(${-40} ${(1 - k) * 700 + bob}) rotate(8 300 1700)`}>
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
      <AbsoluteFill style={{ background: `radial-gradient(16% 12% at 66% 86%, ${PHONE_GLOW}.4) 0%, ${PHONE_GLOW}0) 100%)`, mixBlendMode: "screen", opacity: k }} />
    </AbsoluteFill>
  );
};

/** POV: правая рука тянется к верхнему замку и замирает. */
/** Крупно: дрожащая рука в рукаве серой кофты сжимает щеколду, костяшки побелели. */
export const LockHand = ({ freezeAt = 2.6 }: { freezeAt?: number }) => {
  const t = useT();
  const reach = ease(t, 0, 0.6, 0, 1);
  const tremble = (t > freezeAt ? 5 : 2) * Math.sin(t * 43) + Math.sin(t * 71) * 1.5;
  const white = ease(t, 0.6, freezeAt, 0, 1);
  return (
    <AbsoluteFill style={{ background: "#0a0806" }}>
      <Svg>
        {/* дверь крупно: дерматин, щеколда и натянутая цепочка */}
        <rect width="1080" height="1920" fill="#3a2016" />
        {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${-200 + i * 220} 0 L${400 + i * 220} 1920 M${400 + i * 220} 0 L${-200 + i * 220} 1920`} stroke="#22120c" strokeWidth="6" />)}
        {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={(i % 4) * 300 + 90} cy={Math.floor(i / 4) * 640 + 330} r="10" fill="#b8924a" stroke={LINE} strokeWidth="3" />)}
        <rect x="380" y="700" width="420" height="80" rx="12" fill="#8d8a82" stroke={LINE} strokeWidth="6" />
        <rect x="560" y="660" width="70" height="160" rx="10" fill="#a9a69e" stroke={LINE} strokeWidth="6" />
        <path d="M300 900 C420 940 560 940 760 900" stroke="#c9c6bd" strokeWidth="14" fill="none" strokeDasharray="22 10" />
        {/* рука: рукав кофты снизу справа, кулак сжимает щеколду */}
        <g transform={`translate(${tremble} ${(1 - reach) * 500}) `}>
          <path d="M760 1920 C740 1600 700 1300 640 1080 L840 1020 C900 1240 960 1600 1000 1920 Z" fill={TEE} stroke={LINE} strokeWidth="9" />
          <path d="M650 1090 L835 1035 L850 1090 L668 1150 Z" fill={TEE_SH} stroke={LINE} strokeWidth="6" />
          {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${660 + i * 20} ${1145 - i * 6} l${8} ${-48}`} stroke={LINE} strokeWidth="2.5" opacity="0.5" />)}
          {/* ладонь и сжатые пальцы вокруг щеколды */}
          <path d="M560 760 C540 860 580 1010 650 1090 L840 1040 C860 960 840 860 800 770 Z" fill={SKIN} stroke={LINE} strokeWidth="8" />
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <rect x={560 + i * 58} y={690} width="56" height="120" rx="26" fill={SKIN} stroke={LINE} strokeWidth="6" />
              {/* побелевшие костяшки */}
              <ellipse cx={588 + i * 58} cy={705} rx="20" ry="13" fill="#f4ece4" opacity={0.35 + 0.55 * white} />
              <path d={`M${572 + i * 58} 760 q16 6 32 0`} stroke={LINE} strokeWidth="3" fill="none" opacity="0.6" />
            </g>
          ))}
          <path d="M540 820 C500 780 490 720 520 690 C550 670 590 690 600 730 L610 800 Z" fill={SKIN} stroke={LINE} strokeWidth="7" />
          <path d="M520 700 C530 690 556 692 566 708 L560 730 C548 736 530 732 522 722 Z" fill={NAIL} stroke={LINE} strokeWidth="3" />
          <path d="M600 880 C650 900 720 900 780 880" stroke={SKIN_SH} strokeWidth="10" fill="none" opacity="0.6" />
        </g>
      </Svg>
      <AbsoluteFill style={{ background: "radial-gradient(55% 40% at 55% 45%, rgba(217,160,67,.12) 0%, rgba(0,0,0,.65) 100%)" }} />
    </AbsoluteFill>
  );
};

/** Перебивка: испуганное лицо Димы крупно в холодном свете телефона. */
export const ScaredFace = () => {
  const t = useT();
  const tr = Math.sin(t * 50) * 3;
  return (
    <AbsoluteFill style={{ background: "#040507" }}>
      <Svg>
        <g transform={`translate(${tr} 0) translate(540 940) scale(1.15) translate(-540 -900)`}>
          <defs>
            <clipPath id="sfHead">
              <rect x="-200" y="-200" width="1480" height="1460" />
            </clipPath>
          </defs>
          <g clipPath="url(#sfHead)">
            <DimaFace t={t} fear={1} eyes={1.3} look={[0.6, -0.1]} mouth="o" sweat={1} tears={1} tremble={0.8} />
          </g>
        </g>
      </Svg>
      <AbsoluteFill style={{ background: `radial-gradient(45% 30% at 50% 62%, ${PHONE_GLOW}.35) 0%, ${PHONE_GLOW}0) 100%)`, mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ background: "radial-gradient(60% 45% at 50% 48%, rgba(0,0,0,0) 40%, rgba(0,0,0,.85) 100%)" }} />
    </AbsoluteFill>
  );
};

export { Finger, clamp };
