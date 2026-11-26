import React from "react";
import { AbsoluteFill } from "remotion";
import { Bubble, ChatHeader, Dumplings, Earring, ez, Glow, GOLD, Hand, INK, Marker, MONT, OL, PAPER, Phone, RED, SKIN, SKIN_SH, Stage, Tamara, useLT, useSpr, Wave } from "./kit";

const STENCIL = "Russo One";
const shakeXY = (t: number, a: number) => `translate(${Math.sin(t * 61) * a} ${Math.cos(t * 47) * a})`;

/* ── 1. Тёмная спальня, диктофон у стены (3с) ── */
export const S1Bedroom = () => {
  const t = useLT();
  return (
    <Stage bg="#07080c" dur={3} zoom={[1.0, 1.12]} origin={[600, 1180]}>
      <rect width={1080} height={1920} fill="#141823" />
      {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${i * 130} 0 V1400`} stroke="#1b2130" strokeWidth={26} />)}
      <rect y={1400} width={1080} height={520} fill="#0d0f15" />
      <rect x={-40} y={1180} width={560} height={300} rx={30} fill="#2a2f3e" {...OL} />
      <rect x={-40} y={1130} width={260} height={110} rx={40} fill="#d6d2c6" {...OL} />
      <rect x={620} y={1230} width={300} height={250} fill="#3a2a20" {...OL} />
      <Glow id="s1g" x={700} y={1150} r={360} color="#ff3b3b" o={0.25 + 0.1 * Math.sin(t * 8)} />
      <Phone x={700} y={1130} s={0.22} rot={-12} screen="#14080a">
        <text x={260} y={300} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={90} fill="#fff">03:02</text>
        <circle cx={260} cy={830} r={70} fill={RED} opacity={0.6 + 0.4 * Math.sin(t * 6)} />
        <Wave t={t} x={40} y={560} w={440} h={260} />
      </Phone>
      <text x={700} y={980} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={34} fill={RED} opacity={0.5 + 0.5 * Math.sin(t * 6)}>● REC</text>
    </Stage>
  );
};

/* ── 2. Прихожая кв. 43: мама в куртке уходит, дверь закрывается (3с) ── */
export const S2Mom = () => {
  const t = useLT();
  const walk = ez(t, 0.1, 1.6, 0, 1);
  const close = ez(t, 1.5, 2.3, 0, 1);
  return (
    <Stage bg="#1a140f" dur={3} zoom={[1.04, 1.0]}>
      <rect width={1080} height={1920} fill="#3b2f24" />
      {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={(i % 4) * 280 + 120} cy={Math.floor(i / 4) * 420 + 200} r={10} fill="#4a3b2d" />)}
      <rect y={1560} width={1080} height={360} fill="#2a1f17" />
      <Glow id="s2g" x={540} y={260} r={700} color="#ffc070" o={0.35} />
      {/* проём: за дверью темнота площадки */}
      <rect x={300} y={420} width={480} height={1150} fill="#07090c" {...OL} />
      <Glow id="s2h" x={540} y={700} r={300} color="#9fb7c9" o={0.18 * (1 - close)} />
      {/* мама: силуэт в куртке, уходит в проём */}
      <g transform={`translate(${540 + walk * 40} ${980 - walk * 60}) scale(${1 - walk * 0.35})`} opacity={1 - close}>
        <path d="M-120 520 L-110 120 C-110 40 110 40 110 120 L120 520 Z" fill="#5b1f2a" {...OL} />
        <path d="M0 60 V520" stroke="#3d141c" strokeWidth={6} />
        <circle cx={0} cy={-30} r={78} fill={SKIN} {...OL} />
        <path d="M-82 -30 C-90 -140 90 -140 82 -30 C60 -80 -60 -80 -82 -30 Z" fill="#4a2c1d" {...OL} />
        <path d="M-120 140 L-150 360 M120 140 L150 380" stroke="#5b1f2a" strokeWidth={40} strokeLinecap="round" />
        <rect x={110} y={340} width={90} height={110} rx={14} fill="#1c1a1a" {...OL} />
      </g>
      {/* дверь на петле справа: закрывается сжатием по X */}
      <g transform={`translate(780 0) scale(${-0.08 - close * 0.92} 1) translate(-780 0)`}>
        <rect x={300} y={420} width={480} height={1150} fill="#6b3a26" {...OL} />
        <rect x={350} y={480} width={380} height={1030} fill="none" stroke="#552c1b" strokeWidth={10} />
      </g>
      <circle cx={360} cy={1010} r={16} fill="#c9a24a" opacity={close} {...OL} strokeWidth={4} />
      <text x={540} y={1720} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={40} fill={PAPER} opacity={ez(t, 2.2, 2.6)}>НОЧНАЯ СМЕНА ДО 8:00</text>
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
    <Stage bg="#06070a" dur={5} zoom={[1.0, 1.14]} origin={[540, 1050]}>
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
    <Stage bg="#1d2420" dur={4} zoom={[1.0, 1.12]} origin={[540, 1250]}>
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
            {p.tam ? <Tamara x={0} y={20} s={0.82} /> : <rect x={-100} y={-120} width={200} height={240} fill="#9a958a" {...OL} strokeWidth={4} />}
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
    <Stage bg="#2b2420" dur={3} zoom={[1.0, 1.08]}>
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
    <Stage bg="#0a0608" dur={5} zoom={[1.0, 1.1]}>
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
    <Stage bg="#1d150e" dur={3} zoom={[1.0, 1.1]} origin={[540, 1100]}>
      <rect width={1080} height={1920} fill="#4b3b2b" />
      {Array.from({ length: 6 }, (_, i) => <rect key={i} x={0} y={i * 120} width={1080} height={118} fill={i % 2 ? "#d8d0bc" : "#cfc6b0"} />)}
      <rect y={760} width={1080} height={1160} fill="#8a5a36" {...OL} />
      <Glow id="s7g" x={540} y={600} r={800} color="#ffcf7a" o={0.45} />
      <Dumplings x={480} y={1150} s={1.5} t={t} />
      <g transform={`translate(800 1560) rotate(${-8 + (1 - note) * 20}) scale(${note})`}>
        <rect x={-190} y={-110} width={380} height={220} fill="#fff7c2" {...OL} strokeWidth={5} />
        <text x={0} y={-24} textAnchor="middle" fontFamily="Caveat, cursive" fontWeight={700} fontSize={50} fill="#1d3b8a">Поешь,</text>
        <text x={0} y={44} textAnchor="middle" fontFamily="Caveat, cursive" fontWeight={700} fontSize={50} fill="#1d3b8a">сосед угостил ♥</text>
      </g>
    </Stage>
  );
};

/* ── 8. Вилка с третьим пельменем, «ХРУСТ!» (2с) ── */
export const S8Fork = () => {
  const t = useLT();
  const up = ez(t, 0, 0.8, 0, 1);
  const hit = ez(t, 0.98, 1.12);
  return (
    <Stage bg="#140d08" dur={2} zoom={[1.05, 1.2]}>
      <rect width={1080} height={1920} fill="#2a1a10" />
      <Glow id="s8g" x={540} y={800} r={700} color="#ffcf7a" o={0.35} />
      <g transform={`translate(${540 + (hit > 0 ? Math.sin(t * 90) * 10 * (1 - ez(t, 1.1, 1.6)) : 0)} ${1300 - up * 300}) rotate(-20)`}>
        <rect x={-18} y={0} width={36} height={700} rx={14} fill="#c9ccd2" {...OL} />
        {[-36, -12, 12, 36].map((x) => <rect key={x} x={x - 7} y={-180} width={14} height={190} rx={7} fill="#c9ccd2" {...OL} strokeWidth={5} />)}
        <g transform="translate(0 -170) scale(2.4)">
          <path d="M-46 8 C-46 -30 46 -30 46 8 C30 18 -30 18 -46 8 Z" fill="#f6ecd6" {...OL} strokeWidth={4} />
          <path d="M-30 -8 q8 -8 16 0 q8 -8 16 0 q8 -8 16 0" fill="none" stroke="#c9b899" strokeWidth={2} />
        </g>
      </g>
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
    <Stage bg="#1d150e" dur={4} zoom={[1.0, 1.25]} origin={[560, 1000]}>
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
    <Stage bg="#08090c" dur={3} zoom={[1.0, 1.04]}>
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
        <g transform="translate(540 1420) scale(2.2)">
          <path d="M-110 160 C-130 40 -120 -40 -80 -70 L80 -70 C120 -40 130 40 110 160 Z" fill={SKIN} {...OL} strokeWidth={4} />
          <path d="M-60 0 C-20 30 30 30 60 0" fill="none" stroke={SKIN_SH} strokeWidth={4} />
        </g>
        <Earring x={540} y={1250} s={2.2} shine={0.5 + 0.5 * Math.sin(t * 7)} />
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
    <Stage bg="#130e0a" dur={3} zoom={[1.0, 1.06]}>
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
  const on = ez(t, 0.05, 0.2);
  const buzz = t > 0.1 && t < 1.8 ? Math.sin(t * 95) * 8 : 0;
  return (
    <Stage bg="#06070a" dur={3} zoom={[1.0, 1.15]} origin={[540, 1150]}>
      <rect width={1080} height={1920} fill="#2a1d14" />
      <Glow id="s12g" x={540} y={1150} r={900} color="#ffffff" o={0.5 * on} />
      <g transform={`translate(${buzz} 0)`}>
        <Phone x={540} y={1150} s={0.85} rot={78} screen={on > 0.5 ? "#f2f6fa" : "#101418"}>
          <rect x={30} y={420} width={460} height={200} rx={30} fill="#17212b" opacity={on} />
          <text x={60} y={500} fontFamily={MONT} fontWeight={800} fontSize={34} fill="#fff" opacity={on}>Кв. 44 · Геннадий</text>
          <text x={60} y={560} fontFamily={MONT} fontSize={30} fill="#b8c7d6" opacity={on}>Новое сообщение</text>
        </Phone>
      </g>
      {buzz !== 0 && [0, 1, 2].map((i) => <path key={i} d={`M${120 + i * 30} ${1050 + i * 10} q-20 100 0 200`} fill="none" stroke="#fff" strokeWidth={8} opacity={0.6} />)}
      {buzz !== 0 && [0, 1, 2].map((i) => <path key={i} d={`M${960 - i * 30} ${1050 + i * 10} q20 100 0 200`} fill="none" stroke="#fff" strokeWidth={8} opacity={0.6} />)}
    </Stage>
  );
};

/* ── 13. Личка от соседа: «счастливый пельмень» (4с) ── */
export const S13DM = () => {
  const t = useLT();
  const m = useSpr(0.2);
  return (
    <Stage bg="#06070a" dur={4} zoom={[1.0, 1.14]} origin={[540, 980]}>
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
  const pupil = ez(t, 0.3, 0.7, 30, 7);
  const tr = Math.sin(t * 55) * 4;
  return (
    <Stage bg="#050608" dur={2} zoom={[1.08, 1.3]} origin={[540, 860]}>
      <g transform={`translate(${tr} 0)`}>
        <path d="M120 1920 C140 1500 260 1300 540 1300 C820 1300 940 1500 960 1920 Z" fill="#2e3646" {...OL} />
        <ellipse cx={540} cy={900} rx={340} ry={430} fill={SKIN} {...OL} />
        <path d="M200 760 C180 380 900 380 880 760 C820 560 300 560 200 760 Z" fill="#2b1e16" {...OL} />
        {[380, 700].map((x, i) => (
          <g key={i}>
            <path d={`M${x - 90} ${700 - 40} q90 -60 180 0`} fill="none" stroke="#2b1e16" strokeWidth={22} strokeLinecap="round" />
            <ellipse cx={x} cy={830} rx={92} ry={70} fill="#fbf6ee" {...OL} />
            <circle cx={x + 6} cy={830} r={46} fill="#5b7a52" stroke={INK} strokeWidth={4} />
            <circle cx={x + 6} cy={830} r={pupil} fill={INK} />
            <circle cx={x + 22} cy={812} r={10} fill="#fff" />
          </g>
        ))}
        <path d="M520 900 q-30 90 0 120 q30 6 40 -10" fill="none" stroke={SKIN_SH} strokeWidth={8} />
        <ellipse cx={540} cy={1120} rx={50} ry={34 + Math.sin(t * 20) * 6} fill="#4a1414" {...OL} />
        <path d="M800 760 q16 40 0 60 q-16 -20 0 -60" fill="#cfe8ff" opacity={0.85} />
      </g>
      <Glow id="s14g" x={540} y={1500} r={700} color="#8fb8ff" o={0.35} />
    </Stage>
  );
};

/* ── 15. Входная дверь: ТУК… ТУК… ТУК (3с; удары в 0, 1, 2 с) ── */
export const S15Door = () => {
  const t = useLT();
  const knock = (at: number) => Math.max(0, 1 - Math.abs(t - at - 0.05) * 6);
  const hit = knock(0) + knock(1) + knock(2);
  return (
    <Stage bg="#0a0806" dur={3} zoom={[1.0, 1.1]}>
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
const Neighbor = ({ t, talk }: { t: number; talk: number }) => (
  <g>
    {/* площадка */}
    <rect x={-600} y={-700} width={1200} height={1400} fill="#5d6e5a" />
    <rect x={-600} y={-700} width={1200} height={560} fill="#b9b19c" />
    <rect x={-600} y={420} width={1200} height={300} fill="#3c3a34" />
    <rect x={260} y={-500} width={240} height={920} fill="#8d8a80" stroke={INK} strokeWidth={6} />
    <circle cx={0} cy={-620} r={40} fill="#fff3c4" opacity={0.6 + 0.4 * Math.sin(t * 31) * Math.sin(t * 7)} />
    {/* сосед */}
    <path d="M-250 720 L-230 60 C-220 -40 220 -40 230 60 L250 720 Z" fill="#7d8a96" stroke={INK} strokeWidth={8} />
    <path d="M-150 30 L150 30 L170 720 L-170 720 Z" fill="#1e1a1a" stroke={INK} strokeWidth={8} />
    <path d="M-150 30 C-120 -40 -60 -60 -40 -80 M150 30 C120 -40 60 -60 40 -80" stroke="#1e1a1a" strokeWidth={12} fill="none" />
    <path d="M-60 330 C-20 360 40 300 70 340" stroke="#5a1414" strokeWidth={14} fill="none" opacity={0.8} />
    <rect x={-50} y={-110} width={100} height={70} fill={SKIN_SH} />
    <ellipse cx={0} cy={-230} rx={130} ry={155} fill={SKIN} stroke={INK} strokeWidth={8} />
    <path d="M-132 -250 C-140 -420 140 -420 132 -250 C110 -330 -110 -330 -132 -250 Z" fill="#3a3530" stroke={INK} strokeWidth={8} />
    {/* глаза над маской: спокойные, не моргают */}
    {[-50, 50].map((x) => (
      <g key={x}>
        <ellipse cx={x} cy={-250} rx={26} ry={16} fill="#f4efe6" stroke={INK} strokeWidth={5} />
        <circle cx={x + 2} cy={-250} r={9} fill={INK} />
      </g>
    ))}
    <path d={`M-118 -210 C-120 -120 -60 ${-80 + talk * 6} 0 ${-76 + talk * 8} C60 ${-80 + talk * 6} 120 -120 118 -210 Z`} fill="#bcd7e6" stroke={INK} strokeWidth={6} />
    <path d="M-110 -190 H110 M-100 -150 H100" stroke="#97b6c8" strokeWidth={5} />
    {/* тарелка с пельменями в руках */}
    <path d="M-230 160 C-200 260 -120 300 -60 300 M230 160 C200 260 120 300 60 300" stroke="#7d8a96" strokeWidth={60} strokeLinecap="round" fill="none" />
    <Dumplings x={0} y={300} s={0.8} t={t} n={6} steam={0.7} />
  </g>
);

export const S16Peephole = () => {
  const t = useLT();
  const zoom = ez(t, 0, 5, 0.86, 0.92) * ez(t, 5, 8, 1, 1.25) * ez(t, 8, 16, 1, 1.1);
  const talk = t > 5 && t < 7.5 ? Math.abs(Math.sin(t * 16)) : 0;
  const freeze = t >= 8 ? ez(t, 8, 8.3) : 0;
  const tt = t >= 8 ? 8 : t;
  const b1 = useSpr(8.6);
  const b2 = useSpr(9.0);
  const ask = ez(t, 9.6, 10.1);
  return (
    <AbsoluteFill style={{ background: "#020203" }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
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
            <Neighbor t={tt} talk={talk} />
          </g>
          <circle cx={540} cy={820} r={470} fill="url(#ph-v)" />
          {/* звуковая волна из-за двери */}
          {t > 5 && t < 7.6 && [0, 1, 2].map((i) => {
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
