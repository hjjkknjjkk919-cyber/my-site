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
export const lampAt = (t: number) => ((t % 4.7) > 4.2 && Math.sin(t * 60) > 0 ? 0.35 : 1);

const Vig = ({ k = 1 }: { k?: number }) => (
  <AbsoluteFill style={{ background: `radial-gradient(75% 60% at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,${0.72 * k}) 100%)` }} />
);

/** Телефон в руке: только 00:47 и «Нет сети». */
export const PhoneInHand = ({ glow = 1 }: { glow?: number }) => (
  <g>
    <path d="M300 1920 C320 1700 360 1560 420 1480 L700 1480 C760 1560 790 1700 800 1920 Z" fill={SKIN} stroke={LINE} strokeWidth="8" />
    <path d="M260 1920 C250 1760 280 1650 330 1600 L380 1920 Z" fill={JK} stroke={LINE} strokeWidth="8" />
    <rect x="330" y="760" width="420" height="820" rx="56" fill="#0d1014" stroke={LINE} strokeWidth="12" />
    <rect x="350" y="780" width="380" height="780" rx="44" fill="#111a24" />
    <rect x="350" y="780" width="380" height="780" rx="44" fill="#9fc3ff" opacity={0.06 * glow} />
    <text x="540" y="960" textAnchor="middle" fontFamily={MONT_FALLBACK} fontWeight="800" fontSize="118" fill="#e9eef3">00:47</text>
    <g transform="translate(540 1150)">
      {[0, 1, 2, 3].map((i) => <rect key={i} x={-60 + i * 30} y={-16 - i * 16} width="18" height={24 + i * 16} rx="4" fill="#3b4652" />)}
      <path d="M-74 -86 L66 22" stroke="#e53935" strokeWidth="10" strokeLinecap="round" />
    </g>
    <text x="540" y="1270" textAnchor="middle" fontFamily={MONT_FALLBACK} fontWeight="800" fontSize="50" fill="#e9eef3">Нет сети</text>
    <path d="M700 1500 C760 1430 790 1380 780 1330 C770 1300 740 1300 720 1330 L660 1440 Z" fill={SKIN} stroke={LINE} strokeWidth="8" />
  </g>
);

/**
 * 1. Сидит у окна, голова опущена, глаза закрыты → пальцы шевелятся → открывает глаза, моргает,
 * щурится от лампы → осматривает вагон → берёт телефон с сиденья и поднимает к лицу.
 * Длительность ≈ 9 с. Камера медленно наезжает к глазам (перед переходом в POV).
 */
export const Sleeper = ({ d }: { d: number }) => {
  const t = useT();
  const r = ride(t);
  const L = lampAt(t + 1);
  // фазы
  const wake = ease(t, 2.4, 3.1, 0, 1); // голова поднимается
  const openEyes = t < 3.0 ? 0.05 : t < 3.3 ? 0.4 : t < 3.45 ? 0.05 : t < 3.9 ? 0.75 : t < 4.0 ? 0.1 : 0.95; // открывает и моргает
  const squint = L < 1 && t > 4 ? 0.55 : 1; // щурится от мигания
  const lookX = t < 4.4 ? 0 : t < 5.4 ? ease(t, 4.4, 5.0, 0, -0.9) : t < 6.3 ? ease(t, 5.4, 6.0, -0.9, 0.8) : ease(t, 6.3, 6.7, 0.8, 0.2);
  const headTurn = lookX * 10;
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
          {/* тело: куртка, дыхание грудной клетки */}
          <g transform={`translate(0 ${breath * 0.3})`}>
            <path d={`M140 1920 C150 1600 230 1400 360 ${1330 + breath} L720 ${1330 + breath} C850 1400 930 1600 940 1920 Z`} fill={JK} stroke={LINE} strokeWidth="9" />
            <path d="M720 1340 C850 1410 930 1600 940 1920 H820 C830 1700 810 1500 720 1340 Z" fill={JK_SH} />
            <path d="M540 1350 V1920" stroke={LINE} strokeWidth="6" />
          </g>
          {/* рука на коленях с пальцами + телефон на сиденье рядом */}
          <g transform={`translate(${phoneUp * -40} ${-phoneUp * 520})`}>
            <path d="M600 1920 C620 1820 660 1770 720 1750 L860 1750 C900 1770 910 1820 900 1920 Z" fill={JK_SH} stroke={LINE} strokeWidth="8" />
            <ellipse cx="790" cy="1735" rx="90" ry="56" fill={SKIN} stroke={LINE} strokeWidth="7" />
            {[0, 1, 2, 3].map((i) => (
              <path key={i} d={`M${740 + i * 30} 1720 q${i === 1 ? finger : 0} 30 0 54`} stroke={LINE} strokeWidth="5" fill="none" />
            ))}
            {phoneUp > 0 && (
              <g transform="translate(770 1660) rotate(-12)">
                <rect x="-60" y="-110" width="120" height="220" rx="18" fill="#0d1014" stroke={LINE} strokeWidth="6" />
                <rect x="-50" y="-100" width="100" height="200" rx="12" fill="#9fc3ff" opacity="0.35" />
              </g>
            )}
          </g>
          {phoneUp === 0 && (
            <g transform="translate(900 1560) rotate(78)">
              <rect x="-60" y="-110" width="120" height="220" rx="18" fill="#0d1014" stroke={LINE} strokeWidth="6" />
            </g>
          )}
          {/* голова: свешена, потом поднимается */}
          <g transform={`translate(${headTurn * 2} ${headDrop + breath * 0.4}) rotate(${headTilt + headTurn * 0.3} 540 1300) translate(540 880) scale(0.62) translate(-540 -900)`}>
            <DimaFace t={t} fear={ease(t, 4.2, 6.5, 0.1, 0.45)} eyes={openEyes * squint} look={[lookX, phoneUp > 0.5 ? 0.6 : 0]} mouth="closed" />
          </g>
          {/* отсвет экрана на лице */}
          {phoneUp > 0.3 && <ellipse cx="560" cy="980" rx="260" ry="200" fill="#9fc3ff" opacity={0.12 * phoneUp} />}
        </Svg>
      </AbsoluteFill>
      {/* мягкий луч лампы сверху, без общего затемнения */}
      <AbsoluteFill style={{ background: "radial-gradient(60% 45% at 50% 10%, rgba(255,236,200,.22) 0%, rgba(0,0,0,0) 70%)", mixBlendMode: "screen" }} />
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
      {/* веки */}
      <AbsoluteFill style={{ background: "#000", clipPath: `inset(0 0 ${100 - lids * 52}% 0 round 0 0 50% 50%)` }} />
      <AbsoluteFill style={{ background: "#000", clipPath: `inset(${100 - lids * 52}% 0 0 0 round 50% 50% 0 0)` }} />
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
