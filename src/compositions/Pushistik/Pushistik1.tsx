import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Sfx } from "../../components/audio";
import { ez, MONT } from "../../pelmeni/kit";

/* «Утренняя зарядка с Пушистиком. Кассета №1» — аналог-хоррор под VHS, ~35 с. */
export const PUSH_FRAMES = Math.round(34.5 * 30);

const LINE = "#2a1f24";
const OUT = { stroke: LINE, strokeWidth: 5, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
const VCR = '"Courier New", monospace';

/* ── тайминги (сек) ── */
const T = { p1: 0.6, p2: 4.2, p3: 8.6, dark: 15.0, p4: 15.4, face: 20.6, p5: 21.0, rew: 25.4, p6: 26.8, tape: 30.2 };
const VO: [string, number, number, string, string[]][] = [
  ["p1", T.p1, 3.32, "Привет, ребята! Утренняя зарядка! Повторяй за мной!", ["повторяй"]],
  ["p2", T.p2, 4.21, "Ручки вверх! Раз, два, три, четыре!", ["вверх!"]],
  ["p3", T.p3, 6.35, "Наклоны! Пять… шесть… семь…", ["семь…"]],
  ["p4", T.p4, 4.75, "А теперь закрой глазки… и не открывай.", ["не", "открывай."]],
  ["p5", T.p5, 4.15, "Ты открыл глаза. Я видел.", ["видел."]],
  ["p6", T.p6, 3.08, "Я уже… у тебя дома.", ["дома."]],
];

/** Счётчик повторений: 1–4 на «ручки вверх», 5–7 на наклонах, красная «8» на скримере. */
const repsAt = (t: number) => {
  if (t < T.p2 + 0.8) return 0;
  if (t < T.p3) return Math.min(4, 1 + Math.floor((t - T.p2 - 0.8) / 0.85));
  if (t < T.dark) return Math.min(7, 5 + Math.floor((t - T.p3 - 0.6) / 1.6));
  return 8;
};

/* ── Пушистик: круглый пушистый медвежонок; иерархия костей тело → голова / руки ── */
const fuzz = (rx: number, ry: number, n = 28, amp = 9) =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const r = i % 2 ? 1 : 1 + amp / Math.max(rx, ry);
    return `${i ? "L" : "M"}${(Math.cos(a) * rx * r).toFixed(1)} ${(Math.sin(a) * ry * r).toFixed(1)}`;
  }).join(" ") + " Z";

const Pushistik = ({ t, arms, bend, creep, voidEyes }: { t: number; arms: number; bend: number; creep: number; voidEyes: boolean }) => {
  const smileW = 46 + creep * 40;
  const smileH = 18 + creep * 26;
  const arm = (side: -1 | 1) => (
    <g transform={`rotate(${-side * (20 + arms * 150)} ${side * 120} -250)`}>
      <line x1={side * 120} y1={-250} x2={side * 120} y2={-110} stroke={LINE} strokeWidth={50} strokeLinecap="round" />
      <line x1={side * 120} y1={-250} x2={side * 120} y2={-110} stroke="#f2c98e" strokeWidth={40} strokeLinecap="round" />
      <circle cx={side * 120} cy={-100} r={26} fill="#f7dcb0" {...OUT} />
    </g>
  );
  return (
    <g transform={`rotate(${bend * 28} 0 -60)`}>
      {/* ноги стоят на полу (y=0) */}
      {[-1, 1].map((d) => <ellipse key={d} cx={d * 60} cy={-22} rx={52} ry={26} fill="#f2c98e" {...OUT} />)}
      <path d={fuzz(150, 170)} transform="translate(0 -200)" fill="#f2c98e" {...OUT} />
      <ellipse cx={0} cy={-180} rx={84} ry={100} fill="#fbe8c8" />
      {arm(-1)}
      {arm(1)}
      {/* голова: поворот у шеи */}
      <g transform={`rotate(${Math.sin(t * 2) * 4 * (1 - creep) + creep * 8} 0 -340)`}>
        {[-1, 1].map((d) => (
          <g key={d}>
            <circle cx={d * 95} cy={-505} r={42} fill="#f2c98e" {...OUT} />
            <circle cx={d * 95} cy={-505} r={22} fill="#f6a5b5" />
          </g>
        ))}
        <path d={fuzz(135, 120)} transform="translate(0 -420)" fill="#f2c98e" {...OUT} />
        {[-1, 1].map((d) => (
          <g key={`e${d}`}>
            {voidEyes ? (
              <ellipse cx={d * 50} cy={-440} rx={30} ry={40} fill="#050505" />
            ) : (
              <>
                <ellipse cx={d * 50} cy={-440} rx={30} ry={36} fill="#ffffff" {...OUT} strokeWidth={4} />
                <circle cx={d * 50 + Math.sin(t) * 4} cy={-434} r={14 - creep * 8} fill="#1a1a1a" />
                <circle cx={d * 50 + 6} cy={-442} r={5} fill="#fff" />
              </>
            )}
          </g>
        ))}
        <ellipse cx={0} cy={-395} rx={16} ry={11} fill="#7a3b3b" />
        <path d={`M${-smileW} -372 Q0 ${-372 + smileH * 2} ${smileW} -372 Q0 ${-372 + smileH} ${-smileW} -372 Z`} fill="#5a1b22" {...OUT} strokeWidth={4} />
        {creep > 0.5 && Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${-smileW + 8 + i * ((smileW * 2 - 16) / 9)} -372 l5 12 l5 -12 Z`} fill="#fffbe8" />)}
        {[-1, 1].map((d) => <ellipse key={`b${d}`} cx={d * 88} cy={-390} rx={20} ry={11} fill="#f6a5b5" opacity={0.7 * (1 - creep)} />)}
      </g>
    </g>
  );
};

/** Пастельная студия детской передачи; night 0..1 — за окном темнеет. */
const Studio = ({ night }: { night: number }) => (
  <g>
    <rect width={1080} height={1920} fill="#f7c9d4" />
    {Array.from({ length: 10 }, (_, i) => <circle key={i} cx={80 + (i % 5) * 230} cy={300 + Math.floor(i / 5) * 420} r={26} fill="#fbe0e7" />)}
    <rect x={640} y={330} width={330} height={360} rx={20} fill="#9fd6ff" {...OUT} />
    <rect x={640} y={330} width={330} height={360} rx={20} fill="#0a0f2a" opacity={night} />
    <circle cx={880} cy={430} r={48} fill={night > 0.5 ? "#e8eeff" : "#ffd84a"} />
    <path d="M640 510 H970 M805 330 V690" stroke="#ffffff" strokeWidth={14} />
    <rect y={1380} width={1080} height={540} fill="#c9e7b8" />
    <ellipse cx={540} cy={1430} rx={360} ry={60} fill="#9fd08a" {...OUT} />
    <rect x={90} y={1180} width={120} height={200} rx={20} fill="#e88f5a" {...OUT} />
    <path d="M150 1180 C110 1080 90 1020 150 980 C210 1020 190 1080 150 1180" fill="#6cc46a" {...OUT} />
    <circle cx={200} cy={400} r={70} fill="#ffffff" {...OUT} />
    <path d="M200 400 V350 M200 400 L235 418" stroke={LINE} strokeWidth={8} strokeLinecap="round" />
  </g>
);

/** VHS-слой: строки развёртки, полоса трекинга, штамп даты, дрожание. */
const VHS = ({ t, f, strong = 0 }: { t: number; f: number; strong?: number }) => (
  <>
    <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,.16) 0px, rgba(0,0,0,.16) 2px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 5px)", pointerEvents: "none" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: ((f * 23) % 2100) - 120, height: 70 + strong * 120, background: "linear-gradient(180deg, rgba(255,255,255,0), rgba(255,255,255,.22), rgba(255,255,255,0))", transform: `translateX(${Math.sin(f) * 30}px)`, pointerEvents: "none" }} />
    <AbsoluteFill style={{ mixBlendMode: "overlay", opacity: 0.25 + strong * 0.4, pointerEvents: "none" }}>
      <svg width={1080} height={1920}>
        <filter id="vhs-n">
          <feTurbulence type="fractalNoise" baseFrequency="0.9 0.25" numOctaves={1} seed={f % 13} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width={1080} height={1920} filter="url(#vhs-n)" />
      </svg>
    </AbsoluteFill>
    <div style={{ position: "absolute", left: 50, top: 70, fontFamily: VCR, fontWeight: 900, fontSize: 58, color: "#fff", textShadow: "3px 0 #f0f, -3px 0 #0ff" }}>{t >= T.rew && t < T.p6 ? "◀◀ REW" : "▶ PLAY"}</div>
    <div style={{ position: "absolute", left: 50, bottom: 70, fontFamily: VCR, fontWeight: 900, fontSize: 46, color: "#fff", textShadow: "3px 0 #f0f, -3px 0 #0ff" }}>{`06:${String(Math.floor(t)).padStart(2, "0")} 12.03.1997`}</div>
    <AbsoluteFill style={{ background: "radial-gradient(80% 60% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,.7) 100%)", pointerEvents: "none" }} />
  </>
);

/* ── субтитры: 2–4 слова, капс, ключевые слова красным ── */
const Subs = ({ t }: { t: number }) => {
  if (t >= T.tape) return null;
  for (const [, at, dur, text, keys] of VO) {
    if (t < at || t > at + dur + 0.1) continue;
    const words = text.split(" ");
    const groups: string[][] = [];
    for (let i = 0; i < words.length; i += 3) groups.push(words.slice(i, i + 3));
    const g = groups[Math.min(groups.length - 1, Math.floor(((t - at) / dur) * groups.length))];
    return (
      <AbsoluteFill style={{ alignItems: "center", pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: 1560, width: 980, textAlign: "center", fontFamily: MONT, fontWeight: 900, fontSize: 70, textTransform: "uppercase", color: "#fff", WebkitTextStroke: "14px #000", paintOrder: "stroke fill" }}>
          {g.map((w, i) => <span key={i} style={{ color: keys.includes(w.toLowerCase()) ? "#ff3b3b" : "#fff" }}>{w}{i < g.length - 1 ? " " : ""}</span>)}
        </div>
      </AbsoluteFill>
    );
  }
  return null;
};

export const Pushistik1 = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const reps = repsAt(t);
  const night = ez(t, 10.5, 13, 0, 1);
  const creep = ez(t, 11, 15, 0, 0.6);
  // упражнения: руки вверх-вниз в такт счёту, наклоны — плавно и всё медленнее
  const arms = t < T.p2 ? 0.25 + 0.25 * Math.sin(t * 6) : t < T.p3 ? (Math.floor((t - T.p2) / 0.425) % 2 ? 1 : 0.1) : 0.15;
  const bend = t >= T.p3 && t < T.dark ? Math.sin((t - T.p3) * (2.4 - (t - T.p3) * 0.2)) : 0;
  const jitter = t >= T.face && t < T.rew ? `translate(${Math.sin(t * 61) * 8}px, ${Math.cos(t * 47) * 6}px)` : "none";
  const rgb = "drop-shadow(4px 0 rgba(255,0,90,.45)) drop-shadow(-4px 0 rgba(0,200,255,.45))";
  let scene: React.ReactNode;
  if (t < T.dark) {
    scene = (
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        <Studio night={night} />
        <g transform={`translate(540 1440) scale(${1.45 + creep * 0.25})`}>
          <Pushistik t={t} arms={arms} bend={bend} creep={creep} voidEyes={false} />
        </g>
        <g opacity={ez(t, 0.3, 0.6) * (1 - ez(t, 3.6, 4.0))}>
          <rect x={160} y={180} width={760} height={120} rx={60} fill="#ffe14a" {...OUT} />
          <text x={540} y={262} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={60} fill="#e8457a">ПОВТОРЯЙ ЗА МНОЙ!</text>
        </g>
      </svg>
    );
  } else if (t < T.face) {
    scene = (
      <AbsoluteFill style={{ background: "#020203", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: VCR, fontWeight: 900, fontSize: 84, color: "#ddd", opacity: ez(t, T.dark + 0.4, T.dark + 1) }}>ЗАКРОЙ ГЛАЗА</div>
      </AbsoluteFill>
    );
  } else if (t < T.rew) {
    scene = (
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        <Studio night={1} />
        <rect width={1080} height={1920} fill="#5a0010" opacity={0.35} />
        <g transform={`translate(540 ${2300 + ez(t, T.face, T.face + 0.3, 200, 0)}) scale(${3.1 + ez(t, T.face, T.rew, 0, 0.4)})`}>
          <Pushistik t={t} arms={0.1} bend={0} creep={1} voidEyes />
        </g>
      </svg>
    );
  } else if (t < T.tape) {
    const rewK = t < T.p6 ? 1 : 0;
    scene = (
      <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ transform: rewK ? `translateX(${Math.sin(f * 3) * 40}px)` : undefined }}>
        <Studio night={1} />
        <rect width={1080} height={1920} fill="#000" opacity={0.25} />
        {/* пустая студия: только вмятина на коврике там, где он стоял */}
        <ellipse cx={540} cy={1420} rx={140} ry={26} fill="#000" opacity={0.25} />
      </svg>
    );
  } else {
    scene = (
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        <rect width={1080} height={1920} fill="#141414" />
        <g transform={`translate(540 860) rotate(-4) scale(${ez(t, T.tape, T.tape + 0.5, 0.8, 1)})`}>
          <rect x={-400} y={-240} width={800} height={480} rx={26} fill="#1d1d1f" {...OUT} stroke="#000" />
          {[-1, 1].map((d) => <circle key={d} cx={d * 190} cy={20} r={80} fill="#0c0c0c" stroke="#333" strokeWidth={6} />)}
          <rect x={-320} y={-200} width={640} height={130} rx={8} fill="#f4f1e6" />
          <text x={0} y={-118} textAnchor="middle" fontFamily='"Comic Sans MS", cursive' fontWeight={900} fontSize={62} fill="#b0151b">№2 НЕ СМОТРЕТЬ</text>
        </g>
        <g opacity={ez(t, T.tape + 0.8, T.tape + 1.2)}>
          <rect x={60} y={1380} width={960} height={220} rx={30} fill="#000" stroke="#ff3b3b" strokeWidth={6} />
          <text x={540} y={1470} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={54} fill="#fff">СМОТРЕТЬ КАССЕТУ №2?</text>
          <text x={540} y={1550} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={54} fill="#ff3b3b">ПИШИ + В КОММЕНТАХ</text>
        </g>
      </svg>
    );
  }
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Sfx at={0} name="pushistik/jingle" vol={0.55} />
      <Sfx at={0} name="pushistik/vhs" vol={(fr) => (fr / 30 >= T.dark && fr / 30 < T.face ? 0.45 : 0.12)} loop />
      <Sfx at={T.dark} name="pushistik/drone" vol={0.5} loop dur={T.tape - T.dark + 4} />
      <Sfx at={T.face - 0.1} name="pushistik/hit" vol={0.9} />
      <Sfx at={T.rew - 0.1} name="pushistik/rewind" vol={0.7} />
      {VO.map(([k, at]) => <Sfx key={k} at={at} name={`pushistik/${k}`} vol={1.15} />)}
      <AbsoluteFill style={{ filter: rgb, transform: jitter }}>{scene}</AbsoluteFill>
      {reps > 0 && t < T.tape && (
        <div style={{ position: "absolute", right: 50, top: 170, fontFamily: VCR, fontWeight: 900, fontSize: 52, color: reps === 8 ? "#ff2a2a" : "#fff", textShadow: "3px 0 #f0f, -3px 0 #0ff" }}>ПОВТОР: {reps}</div>
      )}
      <VHS t={t} f={f} strong={t >= T.dark && t < T.face ? 1 : t >= T.rew && t < T.p6 ? 1 : 0} />
      <Subs t={t} />
    </AbsoluteFill>
  );
};
