import React from "react";
import { AbsoluteFill } from "remotion";
import { DimaFace } from "../train/GostOld";
import { DurCtx, KitDefs, Bubble, ChatHeader, Dumplings, Earring, ez, Glow, GOLD, Hand, INK, Marker, MONT, OL, PAPER, Phone, RED, SKIN, SKIN_SH, Stage, Tamara, useLT, useSpr, Wave } from "./kit";

const STENCIL = "Russo One";
const shakeXY = (t: number, a: number) => `translate(${Math.sin(t * 61) * a} ${Math.cos(t * 47) * a})`;

/* ── 1. Тёмная спальня, диктофон у стены (3с) ── */
export const S1Bedroom = () => {
  const t = useLT();
  const rec = 0.6 + 0.4 * Math.sin(t * 6);
  return (
    <Stage bg="#07080c" light={{ x: 540, y: 980, color: "#ff5a5a", r: 900, o: 0.32 }} zoom={[1.0, 1.16]} origin={[540, 980]}>
      {/* вид строго сверху: край кровати, тумбочка, на ней лежит телефон */}
      <rect width={1080} height={1920} fill="#0d0f15" />
      <path d="M0 0 H210 C230 640 200 1280 220 1920 H0 Z" fill="#2a2f3e" />
      {[40, 90, 140, 180].map((x, i) => <path key={i} d={`M${x} 0 C${x + 20} 600 ${x - 20} 1300 ${x + 10} 1920`} stroke="#1c2030" strokeWidth={5} fill="none" />)}
      <rect x={250} y={300} width={790} height={1400} rx={18} fill="#4a3324" {...OL} />
      {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${260 + i * 66} 300 C${276 + i * 66} 800 ${248 + i * 66} 1200 ${266 + i * 66} 1700`} stroke="#3c281b" strokeWidth={5} fill="none" opacity={0.8} />)}
      <rect x={250} y={300} width={790} height={1400} rx={18} fill="none" stroke="#6a4a34" strokeWidth={6} opacity={0.6} />
      {/* лампа, стакан воды, будильник 03:02 */}
      <circle cx={850} cy={480} r={130} fill="#2b2b2f" {...OL} />
      <circle cx={850} cy={480} r={60} fill="#3c3c42" />
      <circle cx={420} cy={480} r={70} fill="rgba(190,215,240,.25)" stroke="#cfe0f0" strokeWidth={5} />
      <circle cx={420} cy={480} r={52} fill="rgba(150,190,230,.18)" />
      <path d="M396 456 a30 30 0 0 1 40 -10" stroke="#fff" strokeWidth={4} fill="none" opacity={0.6} />
      <rect x={520} y={510} width={190} height={100} rx={18} fill="#16161a" {...OL} />
      <text x={615} y={580} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={54} fill="#ff3b3b">03:02</text>
      {/* телефон лежит ровно, с тенью */}
      <rect x={350} y={640} width={400} height={790} rx={58} fill="#000" opacity={0.5} filter="url(#pk-blur)" transform="translate(14 24)" />
      <Phone x={550} y={1030} s={0.7} screen="#14080a">
        <text x={260} y={150} textAnchor="middle" fontFamily={MONT} fontWeight={700} fontSize={34} fill="#c9a0a0">Диктофон</text>
        <text x={260} y={280} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={100} fill="#fff">03:02</text>
        <rect x={30} y={400} width={460} height={300} rx={20} fill="#1a1114" />
        <Wave t={t} x={46} y={550} w={430} h={240} />
        <circle cx={260} cy={860} r={74} fill={RED} opacity={rec} stroke={INK} strokeWidth={6} />
        <text x={260} y={980} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={34} fill={RED} opacity={rec}>● REC</text>
      </Phone>
      <Glow id="s1g" x={550} y={1030} r={420} color="#ff3b3b" o={0.2 + 0.08 * Math.sin(t * 8)} />
    </Stage>
  );
};

/* ── 2. Прихожая кв. 43: мама в куртке уходит, дверь закрывается (3с) ── */
export const S2Mom = () => {
  const t = useLT();
  const dur = React.useContext(DurCtx);
  const walk = ez(t, 0.2, dur * 0.55, 0, 1);
  const close = ez(t, dur * 0.5, dur * 0.78, 0, 1);
  return (
    <Stage bg="#1a140f" light={{ x: 540, y: 200, color: "#ffc070", r: 1100, o: 0.5, rays: true }} zoom={[1.04, 1.0]}>
      <rect width={1080} height={1920} fill="#3b2f24" />
      {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={(i % 4) * 280 + 120} cy={Math.floor(i / 4) * 420 + 200} r={10} fill="#4a3b2d" />)}
      <rect y={1560} width={1080} height={360} fill="#2a1f17" />
      <Glow id="s2g" x={540} y={260} r={700} color="#ffc070" o={0.35} />
      {/* проём: за дверью темнота площадки */}
      <rect x={300} y={420} width={480} height={1150} fill="#07090c" {...OL} />
      <defs>
        <linearGradient id="s2-st" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffe2a8" stopOpacity={0.15} />
          <stop offset="100%" stopColor="#ffd48a" stopOpacity={0.85} />
        </linearGradient>
      </defs>
      <path d="M470 420 L610 420 L700 1570 L380 1570 Z" fill="url(#s2-st)" opacity={1 - close * 0.9} />
      <path d={`M380 1570 L700 1570 L${780 + 120 * (1 - close)} 1900 L${300 - 120 * (1 - close)} 1900 Z`} fill="#ffd48a" opacity={0.28 * (1 - close)} />
      {/* мама: силуэт в куртке, уходит в проём */}
      <g transform={`translate(${540 + walk * 30} ${1000 - walk * 40}) scale(${1 - walk * 0.3})`} opacity={1 - close * 0.95}>
        <g fill="#0b090b" stroke="#ffcf7a" strokeWidth={4} strokeOpacity={0.55}>
          <path d="M-120 560 L-118 150 C-120 60 -70 30 0 30 C70 30 120 60 118 150 L120 560 Z" />
          <path d="M-56 560 L-50 760 L-14 760 L-10 560 Z M10 560 L14 760 L50 760 L56 560 Z" />
          <circle cx={0} cy={-36} r={72} />
          <path d="M-74 -40 C-80 -130 80 -130 74 -40 C80 20 70 50 58 64 L-58 64 C-70 50 -80 20 -74 -40 Z" />
          <path d="M-118 160 C-150 260 -150 360 -140 440 L-112 440 C-112 360 -100 260 -96 180 Z M118 160 C150 260 150 360 140 440 L112 440 C112 360 100 260 96 180 Z" />
          <path d="M110 300 L150 300 L180 470 L100 470 Z" />
          <path d="M120 300 C120 230 150 230 152 300" fill="none" strokeWidth={8} />
        </g>
      </g>
      {/* дверь на петле справа: закрывается сжатием по X */}
      <g transform={`translate(780 0) scale(${-0.08 - close * 0.92} 1) translate(-780 0)`}>
        <rect x={300} y={420} width={480} height={1150} fill="#6b3a26" {...OL} />
        <rect x={350} y={480} width={380} height={1030} fill="none" stroke="#552c1b" strokeWidth={10} />
      </g>
      <circle cx={360} cy={1010} r={16} fill="#c9a24a" opacity={close} {...OL} strokeWidth={4} />
      <text x={540} y={1720} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={40} fill={PAPER} opacity={ez(t, dur * 0.7, dur * 0.85)}>НОЧНАЯ СМЕНА ДО 8:00</text>
    </Stage>
  );
};

/* ── 3. Чат подъезда: «парное мясо» (5с) ── */
export const S3Chat = () => {
  const t = useLT();
  const m1 = useSpr(0.2);
  const m2 = useSpr(0.9);
  const m3 = useSpr(1.6);
  return (
    <Stage bg="#06070a" zoom={[1.0, 1.14]} origin={[540, 1050]} light={{ x: 540, y: 900, color: "#7fb0ff", r: 1000, o: 0.4 }}>
      <Glow id="s3g" x={540} y={960} r={700} color="#4f7fb0" o={0.25} />
      <Phone x={540} y={980} s={1.42} rot={-2}>
        <rect width={520} height={1040} fill="#0e1621" />
        <ChatHeader w={520} title="Дом 7 · Подъезд 2" sub="86 участников" avatar="Д7" color="#3f7ec1" />
        <Bubble x={20} y={210} w={420} name="Кв. 12 · Ольга" nameColor="#e3a14b" lines={["Кто опять оставил", "коляску у лифта?"]} time="21:40" k={m1} />
        <Bubble x={20} y={420} w={480} name="Кв. 44 · Геннадий" nameColor="#e06666" lines={["Домашние пельмени 🥟", "1 кг — 450 ₽. Лепим сами,", "ночью. Мясо свежее,", <tspan key="m" fill="#ff6b6b" fontWeight={900}>ПАРНОЕ МЯСО</tspan>]} time="23:58" k={m2} />
        <Bubble x={20} y={760} w={360} name="Кв. 9 · Ира" nameColor="#7fc97f" lines={["А чьё мясо? 😅"]} time="00:03" k={m3} />
      </Phone>
      {/* обводка «ПАРНОЕ МЯСО» в координатах кадра */}
      <Marker cx={372} cy={1122} rx={200} ry={50} k={ez(t, 2.1, 3.0)} w={10} />
    </Stage>
  );
};

/* ── 4. Стенд у лифта: три «ПРОПАЛ» (4с) ── */
export const S4Board = () => {
  const t = useLT();
  const posters = [
    { x: 270, y: 760, name: "ВАСИЛИЙ, 61", tam: false },
    { x: 810, y: 780, name: "ПЁС БАРОН", tam: false },
    { x: 540, y: 1230, name: "ТАМАРА ИЛЬИНИЧНА, 68", tam: true },
  ];
  return (
    <Stage bg="#1d2420" light={{ x: 540, y: 120, color: "#e8f2ff", r: 1300, o: 0.45, rays: true }} zoom={[1.0, 1.12]} origin={[540, 1250]}>
      <rect width={1080} height={1920} fill="#3e5a4c" />
      <rect y={1000} width={1080} height={920} fill="#2e463a" />
      <rect x={60} y={420} width={960} height={1330} fill="#7a5a3c" {...OL} />
      <rect x={90} y={450} width={900} height={1270} fill="#b39672" />
      <Glow id="s4g" x={540} y={300} r={800} color="#e8f2ff" o={0.3 + 0.08 * Math.sin(t * 40)} />
      {posters.map((p, i) => {
        const k = ez(t, 0.1 + i * 0.25, 0.6 + i * 0.25);
        return (
          <g key={i} transform={`translate(${p.x} ${p.y + (1 - k) * 30}) rotate(${(i - 1) * 3})`} opacity={k}>
            <rect x={-200} y={-250} width={400} height={500} fill={PAPER} {...OL} strokeWidth={5} />
            <text x={0} y={-180} textAnchor="middle" fontFamily={STENCIL} fontSize={76} fill={RED}>ПРОПАЛ{p.tam ? "А" : ""}</text>
            {p.tam ? <Tamara x={0} y={20} s={0.82} /> : (
              <g>
                <rect x={-100} y={-120} width={200} height={240} fill="#9a958a" stroke={INK} strokeWidth={4} />
                {i === 0 ? (
                  <g fill="#26231f">
                    <path d="M-80 120 C-80 50 -40 30 0 30 C40 30 80 50 80 120 Z" />
                    <ellipse cx={0} cy={-20} rx={40} ry={48} />
                    <path d="M-52 -40 C-50 -80 50 -80 52 -40 L60 -36 L-60 -36 Z" />
                  </g>
                ) : (
                  <g fill="#26231f">
                    <path d="M-70 110 L-60 30 C-60 0 -30 -10 0 -6 L40 -4 L50 110 L34 110 L30 50 L-30 50 L-40 110 Z" />
                    <path d="M20 -6 C20 -50 50 -70 70 -56 L80 -30 L56 -20 L46 0 Z" />
                    <path d="M44 -66 L36 -96 L56 -70 Z M62 -66 L70 -94 L74 -62 Z" />
                    <path d="M-60 30 C-86 20 -90 -10 -80 -24" stroke="#26231f" strokeWidth={10} fill="none" strokeLinecap="round" />
                  </g>
                )}
              </g>
            )}
            <text x={0} y={200} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={p.tam ? 24 : 30} fill={INK}>{p.name}</text>
            <circle cx={0} cy={-236} r={9} fill="#c33" />
          </g>
        );
      })}
      <Marker cx={540} cy={1240} rx={250} ry={300} k={ez(t, 1.6, 2.5)} w={11} />
      <text x={540} y={1860} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={34} fill={PAPER}>СТАРШАЯ ПО ПОДЪЕЗДУ</text>
    </Stage>
  );
};

/* ── 5. Телефон с диктофоном прижат к обоям (3с) ── */
export const S5Press = () => {
  const t = useLT();
  const press = useSpr(0.1, 16, 90);
  return (
    <Stage bg="#2b2420" light={{ x: 560, y: 900, color: "#ff8a7a", r: 900, o: 0.35 }} zoom={[1.0, 1.08]}>
      <rect width={1080} height={1920} fill="#6d5a4a" />
      {Array.from({ length: 10 }, (_, i) => (
        <g key={i}>
          <path d={`M${i * 120 + 30} 0 V1920`} stroke="#7c6855" strokeWidth={40} />
          {Array.from({ length: 12 }, (_, j) => <path key={j} d={`M${i * 120 + 60} ${j * 170 + (i % 2) * 85} l14 22 l-14 22 l-14 -22 Z`} fill="#8a7560" />)}
        </g>
      ))}
      <Glow id="s5g" x={540} y={900} r={520} color="#ff4d4d" o={0.22} />
      <g transform={`translate(0 ${(1 - press) * 260}) scale(${1 + (1 - press) * 0.1})`} style={{ transformOrigin: "540px 960px" }}>
        <Phone x={540} y={880} s={0.9} rot={4} screen="#14080a">
          <text x={260} y={210} textAnchor="middle" fontFamily={MONT} fontWeight={700} fontSize={36} fill="#c9a0a0">Диктофон</text>
          <text x={260} y={330} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={96} fill="#fff">00:0{Math.floor(t)}</text>
          <Wave t={t} x={40} y={560} w={440} h={120} amp={0.35} />
          <circle cx={260} cy={860} r={70} fill={RED} {...OL} />
        </Phone>
        <Hand x={430} y={1480} s={1.5} rot={8} />
      </g>
      <text x={540} y={1800} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={44} fill={PAPER}>СТЕНА С КВ. 44</text>
    </Stage>
  );
};

/* ── 6. Экран диктофона 03:02: мясорубка, потом тишина (5с) ── */
export const S6Recorder = () => {
  const t = useLT();
  const flat = ez(t, 3.6, 4.0);
  const sec = Math.floor(t * 1.0);
  return (
    <Stage bg="#0a0608" light={{ x: 540, y: 700, color: "#ff3b3b", r: 900, o: 0.35 }} zoom={[1.0, 1.1]}>
      <g transform={flat < 1 ? shakeXY(t, 3 * (1 - flat)) : undefined}>
        <Phone x={540} y={960} s={1.5} screen="#100a0c">
          <text x={260} y={150} textAnchor="middle" fontFamily={MONT} fontWeight={700} fontSize={30} fill="#c9a0a0">Запись · 03:02</text>
          <text x={260} y={300} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={110} fill="#fff">03:0{2 + Math.floor(sec / 2)}</text>
          <rect x={30} y={420} width={460} height={300} rx={20} fill="#1a1114" />
          <Wave t={t} x={46} y={570} w={430} h={270} n={36} flat={flat} />
          {flat > 0 && <rect x={46} y={568} width={430 * flat} height={4} fill={RED} />}
          <text x={260} y={790} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={30} fill={flat > 0.5 ? "#8fa3b5" : GOLD}>{flat > 0.5 ? "ТИШИНА" : "ГУЛ · ШУРШАНИЕ ПАКЕТОВ"}</text>
          <circle cx={260} cy={910} r={60} fill={RED} opacity={0.6 + 0.4 * Math.sin(t * 6)} />
        </Phone>
      </g>
    </Stage>
  );
};

/* ── 7. Кухня: пельмени и записка мамы (3с) ── */
export const S7Kitchen = () => {
  const t = useLT();
  const note = useSpr(0.6);
  return (
    <Stage bg="#1d150e" zoom={[1.0, 1.1]} light={{ x: 540, y: 80, color: "#ffcf7a", r: 1400, o: 0.55, rays: true }} origin={[540, 1100]}>
      <rect width={1080} height={1920} fill="#4b3b2b" />
      {Array.from({ length: 7 }, (_, r) => Array.from({ length: 8 }, (_, c) => <rect key={`${r}-${c}`} x={c * 140 + (r % 2) * 70 - 70} y={r * 110} width={136} height={106} rx={6} fill={(r + c) % 3 ? "#d8d0bc" : "#cdc3ab"} stroke="#a99d84" strokeWidth={3} />))}
      <path d="M540 0 V120" stroke={INK} strokeWidth={6} />
      <path d="M440 200 C440 120 640 120 640 200 Z" fill="#2c4a3a" {...OL} />
      <ellipse cx={540} cy={204} rx={40} ry={14} fill="#fff3c4" />
      <rect y={760} width={1080} height={1160} fill="#8a5a36" {...OL} />
      <Glow id="s7g" x={540} y={600} r={800} color="#ffcf7a" o={0.45} />
      <Dumplings x={480} y={1150} s={1.5} t={t} />
      <g transform={`translate(270 820) rotate(${-8 + (1 - note) * 20}) scale(${note})`}>
        <rect x={-190} y={-110} width={380} height={220} fill="#fff7c2" {...OL} strokeWidth={5} />
        <text x={0} y={-24} textAnchor="middle" fontFamily="Caveat, cursive" fontWeight={700} fontSize={50} fill="#1d3b8a">Поешь,</text>
        <text x={0} y={44} textAnchor="middle" fontFamily="Caveat, cursive" fontWeight={700} fontSize={50} fill="#1d3b8a">сосед угостил ♥</text>
      </g>
    </Stage>
  );
};

/* ── 8. Вилка с третьим пельменем, «ХРУСТ!» (2с) ── */
export const S8Fork = ({ hitAt = 1 }: { hitAt?: number }) => {
  const t = useLT();
  const up = ez(t, 0, 0.8, 0, 1);
  const hit = ez(t, hitAt - 0.02, hitAt + 0.12);
  return (
    <Stage bg="#140d08" light={{ x: 540, y: 500, color: "#ffcf7a", r: 1000, o: 0.5 }} zoom={[1.05, 1.2]}>
      <rect width={1080} height={1920} fill="#2a1a10" />
      <path d="M0 1180 L1080 1060 L1080 1920 L0 1920 Z" fill="#5a3a22" />
      {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M0 ${1230 + i * 110} C360 ${1180 + i * 105} 720 ${1150 + i * 100} 1080 ${1110 + i * 98}`} stroke="#4a2f1b" strokeWidth={6} fill="none" />)}
      <path d="M0 1180 L1080 1060 L1080 1920 L0 1920 Z" fill="url(#s8-tbl)" />
      <defs>
        <linearGradient id="s8-tbl" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#000" stopOpacity={0.75} />
          <stop offset="55%" stopColor="#000" stopOpacity={0} />
          <stop offset="100%" stopColor="#000" stopOpacity={0.55} />
        </linearGradient>
      </defs>
      <ellipse cx={560} cy={1420} rx={300} ry={70} fill="#000" opacity={0.35} />
      <Glow id="s8g" x={540} y={800} r={700} color="#ffcf7a" o={0.35} />
      <g transform={`translate(${540 + (hit > 0 ? Math.sin(t * 90) * 10 * (1 - ez(t, hitAt + 0.1, hitAt + 0.6)) : 0)} ${1300 - up * 300}) rotate(-20)`}>
        <rect x={-18} y={0} width={36} height={700} rx={14} fill="#c9ccd2" {...OL} />
        {[-36, -12, 12, 36].map((x) => <rect key={x} x={x - 7} y={-180} width={14} height={190} rx={7} fill="#c9ccd2" {...OL} strokeWidth={5} />)}
        <g transform="translate(0 -170) scale(2.4)">
          <path d="M-46 8 C-46 -30 46 -30 46 8 C30 18 -30 18 -46 8 Z" fill="#f6ecd6" {...OL} strokeWidth={4} />
          <path d="M-30 -8 q8 -8 16 0 q8 -8 16 0 q8 -8 16 0" fill="none" stroke="#c9b899" strokeWidth={2} />
          {/* надкус: фарш и металл внутри */}
          <path d="M12 -24 C18 -10 34 -10 40 -22 C44 -8 46 2 46 8 C36 12 22 10 14 4 Z" fill="#a8574a" stroke={INK} strokeWidth={3} />
          <path d="M26 -10 L36 -4 L30 4 L22 -2 Z" fill="#e8c25a" stroke="#6b4a10" strokeWidth={1.5} />
          {hit > 0 && (
            <g opacity={hit * (1 - ez(t, hitAt + 0.5, hitAt + 1.2) * 0.6)} stroke="#fffbe8" strokeLinecap="round">
              <path d="M30 -30 L30 22 M4 -4 L56 -4" strokeWidth={3} />
              <path d="M18 -16 L42 8 M42 -16 L18 8" strokeWidth={1.6} />
              <circle cx={30} cy={-4} r={6} fill="#fff" stroke="none" />
            </g>
          )}
        </g>
      </g>
      <rect width={1080} height={1920} fill="#fff" opacity={hit * (1 - ez(t, hitAt + 0.05, hitAt + 0.35))} />
      <g opacity={hit} transform={`translate(540 520) rotate(-8) scale(${0.6 + hit * 0.5})`}>
        <path d="M-330 0 L-250 -90 L-200 -20 L-120 -130 L-60 -30 L20 -150 L70 -40 L170 -120 L200 -20 L320 -70 L250 40 L330 100 L190 110 L210 190 L80 120 L0 200 L-60 110 L-180 170 L-170 80 L-320 90 Z" fill={GOLD} {...OL} strokeWidth={9} />
        <text x={0} y={40} textAnchor="middle" fontFamily={STENCIL} fontSize={120} fill={RED} stroke={INK} strokeWidth={6} paintOrder="stroke">ХРУСТ!</text>
      </g>
    </Stage>
  );
};

/* ── 9. Салфетка: серёжка в фарше (4с) ── */
export const S9Napkin = () => {
  const t = useLT();
  const shine = 0.5 + 0.5 * Math.sin(t * 7);
  return (
    <Stage bg="#1d150e" zoom={[1.0, 1.25]} light={{ x: 560, y: 300, color: "#ffd88a", r: 1200, o: 0.45, rays: true }} origin={[560, 1000]}>
      <rect width={1080} height={1920} fill="#7a4e2e" />
      <path d="M140 520 L960 470 L1000 1420 L100 1470 Z" fill="#f4f1ea" {...OL} />
      {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${160 + i * 105} 520 L${130 + i * 110} 1460`} stroke="#e2ddd2" strokeWidth={4} />)}
      <Glow id="s9g" x={560} y={960} r={500} color="#ffd88a" o={0.35} />
      <path d="M380 1060 C360 960 460 900 560 920 C680 900 760 980 730 1080 C700 1170 450 1180 380 1060 Z" fill="#a8574a" {...OL} />
      {Array.from({ length: 14 }, (_, i) => <circle key={i} cx={420 + ((i * 53) % 300)} cy={960 + ((i * 37) % 170)} r={10 + (i % 3) * 4} fill={i % 2 ? "#c06a5c" : "#8e4438"} />)}
      <Earring x={590} y={1000} s={2.4} shine={shine} />
      <Glow id="s9e" x={590} y={1010} r={180} color="#9cffc4" o={0.25 * shine} />
    </Stage>
  );
};

/* ── 10. Сплит: фото Тамары ↔ серёжка на ладони (3с) ── */
export const S10Split = () => {
  const t = useLT();
  const a = useSpr(0.05);
  const b = useSpr(0.35);
  const arrow = ez(t, 0.9, 1.6);
  return (
    <Stage bg="#08090c" light={{ x: 540, y: 960, color: "#ffd9a0", r: 1200, o: 0.3 }} zoom={[1.0, 1.04]}>
      <g transform={`translate(${(1 - a) * -600} 0)`}>
        <rect x={0} y={0} width={1080} height={955} fill="#2b3530" />
        <rect x={250} y={180} width={580} height={700} fill={PAPER} {...OL} />
        <text x={540} y={270} textAnchor="middle" fontFamily={STENCIL} fontSize={84} fill={RED}>ПРОПАЛА</text>
        <Tamara x={540} y={560} s={1.5} />
        <circle cx={453} cy={581} r={42} fill="none" stroke={GOLD} strokeWidth={7} opacity={ez(t, 1.4, 1.8)} />
      </g>
      <rect y={955} width={1080} height={10} fill={INK} />
      <g transform={`translate(${(1 - b) * 600} 0)`}>
        <rect x={0} y={965} width={1080} height={955} fill="#3a2a20" />
        <Hand x={540} y={1330} s={2.1} sleeve="#4a5160" curl={0.6} />
        <Earring x={540} y={1430} s={1.9} shine={0.5 + 0.5 * Math.sin(t * 7)} />
      </g>
      <g opacity={arrow}>
        <path d={`M760 620 C960 800 940 1060 ${640 + 120 * (1 - arrow)} ${1200 - 200 * (1 - arrow)}`} fill="none" stroke={RED} strokeWidth={16} strokeLinecap="round" />
        <path d="M640 1200 l70 -16 l-40 -56 Z" fill={RED} opacity={arrow > 0.95 ? 1 : 0} />
      </g>
      <text x={540} y={1000} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={54} fill="#fff" stroke={INK} strokeWidth={10} paintOrder="stroke" opacity={ez(t, 1.6, 2.0)}>ТА ЖЕ СЕРЁЖКА</text>
    </Stage>
  );
};

/* ── 11. Серёжка в зип-пакет и в ящик (3с) ── */
export const S11Bag = () => {
  const t = useLT();
  const drop = ez(t, 0.2, 1.0);
  const seal = ez(t, 1.0, 1.4);
  const drawer = ez(t, 1.6, 2.5);
  return (
    <Stage bg="#130e0a" light={{ x: 540, y: 300, color: "#ffcf7a", r: 1200, o: 0.5, rays: true }} zoom={[1.0, 1.06]}>
      <rect width={1080} height={1920} fill="#3a2a20" />
      <Glow id="s11g" x={540} y={700} r={700} color="#ffcf7a" o={0.3} />
      {/* ящик стола */}
      <rect x={120} y={1260} width={840} height={560} fill="#5a3a24" {...OL} />
      <rect x={160} y={1300 - 300 * (1 - drawer)} width={760} height={300 * (1 - drawer) + 40} fill="#1a110b" {...OL} />
      <rect x={160} y={1340} width={760} height={420} fill="#6b4630" {...OL} />
      <rect x={470} y={1520} width={140} height={34} rx={17} fill="#c9a24a" {...OL} strokeWidth={5} />
      {/* пакет с серёжкой опускается в ящик */}
      <g transform={`translate(540 ${700 + drawer * 640}) scale(${1 - drawer * 0.4})`} opacity={1 - ez(t, 2.2, 2.5)}>
        <rect x={-170} y={-200} width={340} height={400} rx={14} fill="rgba(220,235,255,.22)" stroke="#cfe0f0" strokeWidth={6} />
        <rect x={-170} y={-200} width={340} height={30} fill={seal > 0.5 ? "#e5262b" : "#7aa0c8"} />
        <Earring x={0} y={40 - (1 - drop) * 300} s={1.4} />
      </g>
      <Hand x={300} y={700 + drawer * 640} s={1.3} rot={-30} />
      <Hand x={790} y={720 + drawer * 640} s={1.3} rot={30} />
    </Stage>
  );
};

/* ── 12. Телефон на столе вспыхивает (3с) ── */
export const S12Flash = () => {
  const t = useLT();
  const dur = React.useContext(DurCtx);
  const on = ez(t, 0.05, 0.25);
  const push = useSpr(0.35);
  const buzz = t > 0.1 && t < 1.8 ? Math.sin(t * 95) * 5 : 0;
  const cam = ez(t, 0.6, dur, 1, 1.9);
  return (
    <AbsoluteFill style={{ background: "#120b07" }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        <KitDefs />
        {/* вид строго сверху: наезд камеры на экран */}
        <g transform={`translate(540 900) scale(${cam}) translate(-540 -900)`}>
          <rect width={1080} height={1920} fill="#5a3a22" />
          {Array.from({ length: 16 }, (_, i) => <path key={i} d={`M${i * 72} 0 C${i * 72 + 18} 640 ${i * 72 - 16} 1280 ${i * 72 + 10} 1920`} stroke="#4a2f1b" strokeWidth={5} fill="none" opacity={0.8} />)}
          <circle cx={190} cy={420} r={130} fill="#d8d2c6" {...OL} />
          <circle cx={190} cy={420} r={96} fill="#3a1f10" />
          <path d="M320 420 C380 420 380 500 320 500" fill="none" stroke="#d8d2c6" strokeWidth={26} />
          <rect x={760} y={1380} width={240} height={300} rx={10} fill="#f4f1ea" {...OL} transform="rotate(12 880 1530)" />
          <g transform={`translate(${buzz} 0)`}>
            <rect x={312} y={402} width={456} height={936} rx={66} fill="#000" opacity={0.45} filter="url(#pk-blur)" transform="translate(14 22)" />
            <Phone x={540} y={870} s={0.82} screen={on > 0.5 ? "#0f1726" : "#07090c"}>
              <rect width={520} height={1040} fill="#1b2a44" opacity={on} />
              <text x={260} y={190} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={110} fill="#fff" opacity={on}>20:14</text>
              <text x={260} y={240} textAnchor="middle" fontFamily={MONT} fontWeight={600} fontSize={28} fill="#c8d4e6" opacity={on}>четверг, 14 ноября</text>
              <g opacity={push} transform={`translate(0 ${(1 - push) * -60})`}>
                <rect x={24} y={310} width={472} height={190} rx={34} fill="rgba(240,244,250,.94)" />
                <circle cx={78} cy={364} r={30} fill="#c94a4a" />
                <text x={78} y={375} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={30} fill="#fff">Г</text>
                <text x={124} y={358} fontFamily={MONT} fontWeight={800} fontSize={26} fill="#111">Геннадий · кв. 44</text>
                <text x={124} y={390} fontFamily={MONT} fontSize={20} fill="#667">Telegram · сейчас</text>
                <text x={44} y={442} fontFamily={MONT} fontWeight={600} fontSize={26} fill="#111">Дань, ну как, счастливый</text>
                <text x={44} y={478} fontFamily={MONT} fontWeight={600} fontSize={26} fill="#111">пельмень попался? 🙂</text>
              </g>
            </Phone>
          </g>
          {buzz !== 0 && [0, 1, 2].map((i) => <path key={i} d={`M${290 - i * 26} ${780 + i * 6} q-16 90 0 180 M${790 + i * 26} ${780 + i * 6} q16 90 0 180`} fill="none" stroke="#fff" strokeWidth={6} opacity={0.55} />)}
          <Glow id="s12g" x={540} y={870} r={700} color="#bcd4ff" o={0.4 * on} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/* ── 13. Личка от соседа: «счастливый пельмень» (4с) ── */
export const S13DM = () => {
  const t = useLT();
  const m = useSpr(0.2);
  return (
    <Stage bg="#06070a" zoom={[1.0, 1.14]} origin={[540, 980]} light={{ x: 540, y: 900, color: "#ff8a8a", r: 1000, o: 0.35 }}>
      <Glow id="s13g" x={540} y={960} r={700} color="#e06666" o={0.2} />
      <Phone x={540} y={960} s={1.42} rot={1.5}>
        <rect width={520} height={1040} fill="#0e1621" />
        <ChatHeader w={520} title="Геннадий · кв. 44" sub={t > 2.5 ? "печатает…" : "был(а) только что"} avatar="Г" color="#c94a4a" />
        <Bubble x={20} y={300} w={470} lines={["Дань, ну как,", <tspan key="h" fill="#ff6b6b" fontWeight={900}>СЧАСТЛИВЫЙ ПЕЛЬМЕНЬ</tspan>, "попался? 🙂"]} time="20:14" k={m} />
      </Phone>
      <Marker cx={428} cy={768} rx={270} ry={52} k={ez(t, 1.2, 2.1)} w={10} />
    </Stage>
  );
};

/* ── 14. Лицо героя: зрачки сужаются (2с) ── */
export const S14Face = () => {
  const t = useLT();
  const dur = React.useContext(DurCtx);
  const fear = ez(t, 0.15, 0.55, 0.6, 1.65);
  return (
    <AbsoluteFill style={{ background: "#040507" }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        <g transform={`translate(${Math.sin(t * 52) * 3} ${Math.cos(t * 41) * 2}) translate(540 980) scale(${ez(t, 0, dur, 1.18, 1.32)}) translate(-540 -900)`}>
          <DimaFace t={t} fear={fear} eyes={1.2} look={[0.1, -0.05]} mouth="closed" sweat={1} tremble={0.9} />
          {/* сжатые дрожащие губы */}
          <path d={`M470 1122 ${Array.from({ length: 8 }, (_, i) => `L${478 + i * 18} ${1118 + Math.sin(t * 38 + i * 1.7) * 3 - Math.sin((i / 7) * Math.PI) * 6}`).join(" ")} L610 1122`} stroke="#5a2a24" strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M488 1132 C520 1146 560 1146 594 1132" stroke="#b77a6a" strokeWidth={6} fill="none" opacity={0.7} />
        </g>
      </svg>
      {/* глубокая тень на половине лица и холодный блик экрана снизу */}
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(2,3,6,.86) 0%, rgba(2,3,6,.7) 38%, rgba(2,3,6,.15) 52%, rgba(0,0,0,0) 60%)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(48% 26% at 52% 96%, rgba(110,165,255,.6) 0%, rgba(110,165,255,0) 100%)", mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ background: "radial-gradient(70% 55% at 55% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,.8) 100%)" }} />
    </AbsoluteFill>
  );
};

/* ── 15. Входная дверь: ТУК… ТУК… ТУК (3с; удары в 0, 1, 2 с) ── */
export const S15Door = () => {
  const t = useLT();
  const knock = (at: number) => Math.max(0, 1 - Math.abs(t - at - 0.05) * 6);
  const hit = knock(0) + knock(1) + knock(2);
  return (
    <Stage bg="#0a0806" light={{ x: 540, y: 1780, color: "#ffcf7a", r: 1100, o: 0.55, rays: true }} zoom={[1.0, 1.1]}>
      <g transform={hit > 0 ? shakeXY(t, hit * 8) : undefined}>
        <rect width={1080} height={1920} fill="#2e241b" />
        <rect x={190} y={260} width={700} height={1500} fill="#4a2a1c" {...OL} />
        {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M190 ${260 + i * 260} L890 ${520 + i * 260} M890 ${260 + i * 260} L190 ${520 + i * 260}`} stroke="#3a2016" strokeWidth={6} />)}
        <circle cx={540} cy={640} r={26} fill="#c9a24a" {...OL} strokeWidth={5} />
        <rect x={760} y={980} width={70} height={140} rx={14} fill="#a9a69e" {...OL} />
        <Glow id="s15g" x={540} y={1770} r={500} color="#ffcf7a" o={0.25} />
        <rect x={190} y={1756} width={700} height={8} fill="#ffcf7a" opacity={0.7} />
      </g>
      {[0, 1, 2].map((i) => {
        const k = ez(t, i, i + 0.12);
        const j = Math.floor(t * 30);
        return (
          <text key={i} x={300 + i * 230 + ((j * 7) % 9)} y={900 + i * 260 + ((j * 13) % 7)} textAnchor="middle" fontFamily={STENCIL} fontSize={130} fill="#f2e6c8" stroke={INK} strokeWidth={10} paintOrder="stroke" opacity={k} transform={`rotate(${(i - 1) * 8} ${300 + i * 230} ${900 + i * 260})`}>
            {i < 2 ? "ТУК…" : "ТУК"}
          </text>
        );
      })}
    </Stage>
  );
};

/* ── 16–18. Глазок: сосед в фартуке и маске; зум; финал с выбором (16с) ── */
/** Сосед в глазке: серая кожа, впалые глазницы, зрачки-точки, пропитанная кровью маска, растягивающаяся в улыбку. */
const Neighbor = ({ t, talk, dread = 0 }: { t: number; talk: number; dread?: number }) => {
  const tilt = -4 - dread * 10 + Math.sin(t * 0.7) * 1.5;
  const grin = 0.3 + dread * 0.7;
  const flick = Math.sin(t * 31) * Math.sin(t * 7) > 0.55 ? 0.15 : 1;
  const SK = "#b9b4a4";
  const SK_SH = "#7d786a";
  return (
    <g>
      {/* площадка: облупленная краска, мигающая лампа */}
      <rect x={-600} y={-700} width={1200} height={1400} fill="#3f4d3e" />
      <rect x={-600} y={-700} width={1200} height={560} fill="#8f8873" />
      {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M${-560 + i * 120} -140 l${20 + (i % 3) * 10} ${60 + (i % 4) * 30} l-30 20`} stroke="#2a3329" strokeWidth={6} fill="none" />)}
      <rect x={-600} y={420} width={1200} height={300} fill="#2a2824" />
      <rect x={260} y={-500} width={240} height={920} fill="#6d6a62" stroke={INK} strokeWidth={6} />
      <circle cx={0} cy={-620} r={40} fill="#fff3c4" opacity={0.25 + 0.7 * flick} />
      <rect x={-600} y={-700} width={1200} height={1400} fill="#000" opacity={0.5 * (1 - flick)} />
      <g transform={`rotate(${tilt} 0 -80)`}>
        {/* тело и фартук в пятнах */}
        <path d="M-250 720 L-230 60 C-220 -40 220 -40 230 60 L250 720 Z" fill="#59606a" stroke={INK} strokeWidth={8} />
        <path d="M-150 30 L150 30 L170 720 L-170 720 Z" fill="#171313" stroke={INK} strokeWidth={8} />
        <path d="M-150 30 C-120 -40 -60 -60 -40 -80 M150 30 C120 -40 60 -60 40 -80" stroke="#171313" strokeWidth={12} fill="none" />
        {[[-60, 200, 70], [40, 330, 55], [-20, 470, 80], [90, 560, 40]].map(([x, y, r], i) => (
          <g key={i} fill="#4a0a0a">
            <ellipse cx={x} cy={y} rx={r} ry={r * 0.7} opacity={0.9} />
            <path d={`M${x - 10} ${y + r * 0.5} q4 ${60 + i * 20} -2 ${90 + i * 25} q10 4 8 -10 q-2 -40 6 -80 Z`} />
          </g>
        ))}
        {[-90, -30, 30, 90].map((x) => <path key={x} d={`M${x} 60 q${x / 10} 300 ${x / 6} 640`} stroke="#000" strokeWidth={5} fill="none" opacity={0.5} />)}
        {/* шея и голова */}
        <rect x={-46} y={-110} width={92} height={70} fill={SK_SH} />
        <ellipse cx={0} cy={-230} rx={124} ry={160} fill={SK} stroke={INK} strokeWidth={8} />
        <path d="M-120 -260 C-110 -160 -70 -110 -20 -96 L-120 -150 Z" fill={SK_SH} opacity={0.7} />
        {/* сальные пряди свисают на лицо */}
        <path d="M-130 -250 C-140 -420 140 -420 130 -250 C110 -330 -110 -330 -130 -250 Z" fill="#1d1a17" stroke={INK} strokeWidth={8} />
        {Array.from({ length: 11 }, (_, i) => {
          const x = -112 + i * 22;
          const len = 60 + ((i * 37) % 70);
          return <path key={i} d={`M${x} -330 q${(i % 2 ? 8 : -8)} ${len * 0.6} ${(i % 3) * 4 - 4} ${len}`} stroke="#1d1a17" strokeWidth={6} fill="none" strokeLinecap="round" />;
        })}
        {/* впалые глазницы, налитые кровью белки, зрачки-точки */}
        {[-48, 48].map((x, i) => (
          <g key={x}>
            <ellipse cx={x} cy={-246} rx={44} ry={34} fill="#2a2420" opacity={0.85} />
            <ellipse cx={x} cy={-246} rx={30} ry={22 + dread * 3} fill="#efe7d2" stroke={INK} strokeWidth={5} />
            <path d={`M${x - 26} ${-250} l12 3 M${x + 26} ${-242} l-12 -2 M${x - 20} ${-236} l10 -4`} stroke="#b01818" strokeWidth={2} />
            <circle cx={x + (i ? -4 : 4)} cy={-246} r={4.5} fill="#000" />
            <circle cx={x + (i ? -4 : 4)} cy={-246} r={10} fill="#d01010" opacity={0.25 * dread} />
            <path d={`M${x - 34} ${-276 + (i ? 4 : -2)} q34 ${i ? -10 : 14} 68 ${i ? 8 : -6}`} stroke="#1d1a17" strokeWidth={8} fill="none" strokeLinecap="round" />
          </g>
        ))}
        {/* маска: пропитана кровью, под тканью проступает растущая улыбка */}
        <path d={`M-114 -206 C-116 -120 -60 ${-80 + talk * 6} 0 ${-74 + talk * 8} C60 ${-80 + talk * 6} 116 -120 114 -206 Z`} fill="#a9c2cf" stroke={INK} strokeWidth={6} />
        <path d={`M-70 -150 C-40 ${-130 + talk * 4} 40 ${-130 + talk * 4} 70 -150 C60 -110 -60 -110 -70 -150 Z`} fill="#6a0c0c" opacity={0.85} />
        <path d={`M-96 ${-160 + grin * -10} C-50 ${-120 + grin * 26} 50 ${-120 + grin * 26} 96 ${-160 + grin * -10}`} stroke="#2a0606" strokeWidth={6} fill="none" opacity={0.6 + grin * 0.4} />
        {[0, 1, 2].map((i) => <path key={i} d={`M${-30 + i * 30} -100 q3 ${40 + i * 12} -2 ${60 + i * 16}`} stroke="#6a0c0c" strokeWidth={6} fill="none" strokeLinecap="round" />)}
        <path d="M-110 -190 H110" stroke="#87a3b2" strokeWidth={5} />
        {/* руки с тарелкой, кровь на пальцах */}
        <path d="M-230 160 C-200 260 -120 300 -60 300 M230 160 C200 260 120 300 60 300" stroke="#59606a" strokeWidth={60} strokeLinecap="round" fill="none" />
        {[-1, 1].map((d) => (
          <g key={d} transform={`translate(${d * 70} 300)`}>
            <ellipse cx={0} cy={0} rx={46} ry={30} fill={SK} stroke={INK} strokeWidth={6} />
            {[-24, -8, 8, 24].map((fx) => <rect key={fx} x={fx - 7} y={-6} width={14} height={40} rx={7} fill={SK} stroke={INK} strokeWidth={4} />)}
            <path d="M-20 10 q10 20 30 6" stroke="#6a0c0c" strokeWidth={8} fill="none" strokeLinecap="round" />
          </g>
        ))}
        <Dumplings x={0} y={300} s={0.8} t={t} n={6} steam={0.7} />
        <ellipse cx={30} cy={300} rx={60} ry={14} fill="#6a0c0c" opacity={0.8} />
      </g>
    </g>
  );
};

export const S16Peephole = ({ talkAt, talkEnd, freezeAt, end }: { talkAt: number; talkEnd: number; freezeAt: number; end: number }) => {
  const t = useLT();
  const zoom = ez(t, 0, talkAt, 0.86, 0.92) * ez(t, talkAt, freezeAt, 1, 1.25) * ez(t, freezeAt, end, 1, 1.1);
  const talk = t > talkAt && t < talkEnd ? Math.abs(Math.sin(t * 16)) : 0;
  const freeze = t >= freezeAt ? ez(t, freezeAt, freezeAt + 0.3) : 0;
  const tt = Math.min(t, freezeAt);
  const b1 = useSpr(freezeAt + 0.6);
  const b2 = useSpr(freezeAt + 1.0);
  const ask = ez(t, freezeAt + 1.6, freezeAt + 2.1);
  return (
    <AbsoluteFill style={{ background: "#020203" }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        <KitDefs />
        <defs>
          <clipPath id="ph-c">
            <circle cx={540} cy={820} r={470} />
          </clipPath>
          <radialGradient id="ph-v">
            <stop offset="55%" stopColor="#000" stopOpacity={0} />
            <stop offset="100%" stopColor="#000" stopOpacity={0.95} />
          </radialGradient>
          <filter id="ph-bulge">
            <feTurbulence type="fractalNoise" baseFrequency="0.004" numOctaves="1" seed={3} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={26} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        <g clipPath="url(#ph-c)">
          <g transform={`translate(540 860) scale(${zoom})`} filter="url(#ph-bulge)">
            <Neighbor t={tt} talk={talk} dread={ez(t, talkAt - 1, freezeAt, 0, 1)} />
          </g>
          <circle cx={540} cy={820} r={470} fill="url(#ph-v)" />
          {/* звуковая волна из-за двери */}
          {t > talkAt && t < talkEnd + 0.1 && [0, 1, 2].map((i) => {
            const p = ((t * 1.4 + i / 3) % 1);
            return <circle key={i} cx={540} cy={1050} r={80 + p * 380} fill="none" stroke="#bcd7e6" strokeWidth={6} opacity={0.5 * (1 - p)} />;
          })}
          <rect x={0} y={0} width={1080} height={1920} fill="#d2141a" opacity={0.42 * freeze} style={{ mixBlendMode: "multiply" }} />
        </g>
        <circle cx={540} cy={820} r={470} fill="none" stroke="#15120f" strokeWidth={40} />
        <circle cx={540} cy={820} r={500} fill="none" stroke="#3a2a1e" strokeWidth={24} />
        {/* финал: две кнопки выбора */}
        {[
          { k: b1, y: 1460, n: "1", l1: "ОТКРЫТЬ И ОТДАТЬ ТАРЕЛКУ,", l2: "ЧТОБЫ ОН УШЁЛ", c: "#d7262b" },
          { k: b2, y: 1660, n: "2", l1: "НЕ ОТКРЫВАТЬ И ВЫЗВАТЬ", l2: "112 ЧЕРЕЗ ДВЕРЬ", c: "#1f6fd6" },
        ].map((b) => (
          <g key={b.n} transform={`translate(${(1 - b.k) * 1100} 0)`} opacity={b.k > 0.01 ? 1 : 0}>
            <rect x={50} y={b.y} width={980} height={180} rx={28} fill="#f7f1e3" stroke={INK} strokeWidth={8} />
            <rect x={50} y={b.y} width={170} height={180} rx={28} fill={b.c} stroke={INK} strokeWidth={8} />
            <text x={135} y={b.y + 125} textAnchor="middle" fontFamily={STENCIL} fontSize={110} fill="#fff">{b.n}</text>
            <text x={250} y={b.y + 78} fontFamily={MONT} fontWeight={900} fontSize={42} fill={INK}>{b.l1}</text>
            <text x={250} y={b.y + 136} fontFamily={MONT} fontWeight={900} fontSize={42} fill={b.c}>{b.l2}</text>
          </g>
        ))}
        <text x={540} y={1888} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={40} fill={GOLD} stroke={INK} strokeWidth={10} paintOrder="stroke" opacity={ask}>КАК ПОСТУПИШЬ? ПИШИ В КОММЕНТАХ</text>
      </svg>
    </AbsoluteFill>
  );
};
