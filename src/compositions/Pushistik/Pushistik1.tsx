import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { Sfx } from "../../components/audio";
import { ez, MONT } from "../../pelmeni/kit";
import { useAudioData } from "@remotion/media-utils";
import { staticFile } from "remotion";
import { Arm, Leg } from "../AvitoWardrobe/rig";
import { speechEnergy } from "../AvitoWardrobe/useLipSync";

/* «Утренняя зарядка с Пушистиком. Кассета №1» — аналог-хоррор под VHS, ~35 с. */
/** Холодный открывающий кадр (по скану трендов: «потерянный выпуск» + вспышка скримера в 1-ю секунду). */
const CO = 1.8;
export const PUSH_FRAMES = Math.round((34.5 + CO) * 30);

const LINE = "#2a1f24";
const OUT = { stroke: LINE, strokeWidth: 3, strokeLinejoin: "round" as const, strokeLinecap: "round" as const, vectorEffect: "non-scaling-stroke" as const };
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

/* ── Пушистик в стиле Димы: кости (ноги → тело → голова / руки), тени, контур 3px, глаза и зубы в clipPath ── */
const FUR = "#e8b67a";
const FUR_SH = "#c98f55";
const BELLY = "#f8e3c2";

const PushMouth = ({ open, creep }: { open: number; creep: number }) => {
  const id = React.useId().replace(/:/g, "");
  const w = 34 + creep * 34;
  const h = 6 + open * 30 + creep * 24;
  const d = `M${-w} -372 Q0 ${-372 - 6 + creep * 4} ${w} -372 Q${w * 0.7} ${-372 + h} 0 ${-370 + h} Q${-w * 0.7} ${-372 + h} ${-w} -372 Z`;
  return (
    <g>
      <defs>
        <clipPath id={id}>
          <path d={d} />
        </clipPath>
      </defs>
      <path d={d} fill="#4a1018" />
      {/* зубы и язык лежат ВНУТРИ рта — обрезаны по его контуру */}
      <g clipPath={`url(#${id})`}>
        {creep > 0.5
          ? Array.from({ length: 10 }, (_, i) => <path key={i} d={`M${-w + i * (w / 5)} ${-376} l${w / 10} ${10 + creep * 6} l${w / 10} ${-10 - creep * 6} Z`} fill="#fffbe8" stroke={LINE} strokeWidth={1.5} />)
          : <rect x={-w * 0.6} y={-374} width={w * 1.2} height={7} rx={3} fill="#fffbe8" />}
        <ellipse cx={0} cy={-370 + h} rx={w * 0.45} ry={8} fill="#d8566a" />
      </g>
      <path d={d} fill="none" {...OUT} strokeWidth={3} />
    </g>
  );
};

const PushEye = ({ cx, look, creep, voidEyes }: { cx: number; look: number; creep: number; voidEyes: boolean }) => {
  const id = React.useId().replace(/:/g, "");
  return (
    <g>
      <defs>
        <clipPath id={id}>
          <ellipse cx={cx} cy={-440} rx={26} ry={32} />
        </clipPath>
      </defs>
      <ellipse cx={cx} cy={-440} rx={26} ry={32} fill={voidEyes ? "#050505" : "#ffffff"} />
      {!voidEyes && (
        <g clipPath={`url(#${id})`}>
          <circle cx={cx + look * 8} cy={-436} r={13 - creep * 7} fill="#2a1a12" />
          <circle cx={cx + look * 8 + 5} cy={-442} r={4} fill="#fff" />
        </g>
      )}
      <ellipse cx={cx} cy={-440} rx={26} ry={32} fill="none" {...OUT} strokeWidth={3} />
    </g>
  );
};

export const Pushistik = ({ t, arms, bend, creep, voidEyes, talk, wave }: { t: number; arms: number; bend: number; creep: number; voidEyes: boolean; talk: number; wave?: number }) => {
  const br = 3 * Math.sin(t * 2.2);
  const shL = 12 + arms * 158;
  const paw = (wx: number, wy: number) => <circle cx={wx} cy={wy + 14} r={28} fill={BELLY} {...OUT} strokeWidth={3} />;
  const armsPass = (pass: "out" | "fill") => (
    <>
      <Arm sx={-112} sy={-262} up={95} fo={85} w={44} color={FUR} pose={{ sh: shL, el: arms * 15 }} pass={pass} hand={paw} />
      <Arm sx={112} sy={-262} up={95} fo={85} w={44} color={FUR} pose={wave === undefined ? { sh: -shL, el: -arms * 15 } : { sh: -150 - Math.sin(t * 9) * 12, el: -20 + Math.sin(t * 9) * 25 }} pass={pass} hand={paw} />
    </>
  );
  return (
    <g>
      <ellipse cx={0} cy={0} rx={150} ry={20} fill="#000" opacity={0.25} />
      {[-1, 1].map((d) => <Leg key={`o${d}`} hx={d * 50} hy={-110} kx={d * 54} ky={-60} fx={d * 58} w={62} color={FUR} pass="out" />)}
      {[-1, 1].map((d) => <Leg key={`f${d}`} hx={d * 50} hy={-110} kx={d * 54} ky={-60} fx={d * 58} w={62} color={FUR} pass="fill" />)}
      {[-1, 1].map((d) => <ellipse key={d} cx={d * 62} cy={-14} rx={46} ry={22} fill={BELLY} {...OUT} strokeWidth={3} />)}
      <g transform={`translate(0 ${-br}) rotate(${bend * 26} 0 -90)`}>
        {/* тело: груша с тенью и светлым пузом */}
        <path d="M-118 -100 C-150 -200 -128 -290 -60 -310 C-20 -320 20 -320 60 -310 C128 -290 150 -200 118 -100 C70 -70 -70 -70 -118 -100 Z" fill={FUR} {...OUT} strokeWidth={3} />
        <path d="M70 -300 C130 -270 146 -190 116 -102 C96 -92 84 -88 76 -86 C110 -160 108 -240 70 -300 Z" fill={FUR_SH} opacity={0.75} />
        <ellipse cx={-6} cy={-185} rx={70} ry={88} fill={BELLY} />
        {[-40, 0, 40].map((x, i) => <path key={i} d={`M${x - 8} -308 q8 -12 16 0`} stroke={FUR_SH} strokeWidth={4} fill="none" />)}
        {armsPass("out")}
        {armsPass("fill")}
        {/* голова: поворот у шеи */}
        <g transform={`rotate(${Math.sin(t * 2) * 4 * (1 - creep) + creep * 8 + talk * 2 * Math.sin(t * 20)} 0 -320)`}>
          {[-1, 1].map((d) => (
            <g key={d}>
              <circle cx={d * 92} cy={-520} r={40} fill={FUR} {...OUT} strokeWidth={3} />
              <circle cx={d * 92} cy={-518} r={22} fill="#f2a0ae" />
            </g>
          ))}
          <ellipse cx={0} cy={-430} rx={132} ry={118} fill={FUR} {...OUT} strokeWidth={3} />
          <path d="M70 -530 C130 -500 140 -420 112 -350 C120 -410 116 -480 70 -530 Z" fill={FUR_SH} opacity={0.7} />
          <path d="M-60 -540 q20 -22 40 -6 q16 -20 36 -4 q20 -16 34 6" stroke={FUR_SH} strokeWidth={5} fill="none" strokeLinecap="round" />
          <ellipse cx={0} cy={-385} rx={70} ry={48} fill={BELLY} />
          <PushEye cx={-48} look={Math.sin(t * 0.8) * 0.5} creep={creep} voidEyes={voidEyes} />
          <PushEye cx={48} look={Math.sin(t * 0.8) * 0.5} creep={creep} voidEyes={voidEyes} />
          <path d={`M-76 ${-482 - creep * 6} q24 -12 48 0 M28 ${-482 - creep * 6} q24 -12 48 0`} stroke="#7a4a2a" strokeWidth={6} fill="none" strokeLinecap="round" />
          <path d="M-14 -402 Q0 -414 14 -402 Q0 -388 -14 -402 Z" fill="#5a2a2a" {...OUT} strokeWidth={2.5} />
          <PushMouth open={talk} creep={creep} />
          {[-1, 1].map((d) => <ellipse key={`b${d}`} cx={d * 86} cy={-392} rx={18} ry={10} fill="#f2a0ae" opacity={0.7 * (1 - creep)} />)}
        </g>
      </g>
    </g>
  );
};

/** Пастельная студия детской передачи; night 0..1 — за окном темнеет. */
export const Studio = ({ night }: { night: number }) => (
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

const PushMain = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const reps = repsAt(t);
  // lip-sync: энергия голоса активной реплики → открытие рта
  const audio = VO.map(([k]) => useAudioData(staticFile(`audio/pushistik/${k}.mp3`)));
  let talk = 0;
  VO.forEach(([, at, dur], i) => {
    if (t >= at && t < at + dur) talk = Math.min(1, speechEnergy(audio[i], f - Math.round(at * 30), 30) * 2.2);
  });
  const night = ez(t, 10.5, 13, 0, 1);
  const creep = ez(t, 11, 15, 0, 0.6);
  // упражнения: руки вверх-вниз в такт счёту, наклоны — плавно и всё медленнее
  const arms = t < T.p2 ? 0.05 : t < T.p3 ? (Math.floor((t - T.p2) / 0.425) % 2 ? 1 : 0.1) : 0.15;
  const bend = t >= T.p3 && t < T.dark ? Math.sin((t - T.p3) * (2.4 - (t - T.p3) * 0.2)) : 0;
  const jitter = t >= T.face && t < T.rew ? `translate(${Math.sin(t * 61) * 8}px, ${Math.cos(t * 47) * 6}px)` : "none";
  const rgb = "drop-shadow(4px 0 rgba(255,0,90,.45)) drop-shadow(-4px 0 rgba(0,200,255,.45))";
  let scene: React.ReactNode;
  if (t < T.dark) {
    scene = (
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        <Studio night={night} />
        <g transform={`translate(540 1440) scale(${1.45 + creep * 0.25})`}>
          <Pushistik t={t} arms={arms} bend={bend} creep={creep} voidEyes={false} talk={talk} wave={t < T.p2 ? 1 : undefined} />
        </g>
        <g opacity={ez(t, 0.3, 0.6) * (1 - ez(t, 3.6, 4.0))}>
          <rect x={160} y={180} width={760} height={120} rx={60} fill="#ffe14a" {...OUT} />
          <text x={540} y={262} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={60} fill="#e8457a">ПОВТОРЯЙ ЗА МНОЙ!</text>
        </g>
      </svg>
    );
  } else if (t < T.face) {
    scene = (
      <AbsoluteFill style={{ background: t < T.dark + 2.5 ? "#0a1a8a" : "#020203", alignItems: "center", justifyContent: "center", gap: 30 }}>
        <div style={{ fontFamily: VCR, fontWeight: 900, fontSize: 70, color: "#fff", background: "#c0101a", padding: "8px 24px", opacity: ez(t, T.dark + 0.1, T.dark + 0.3) }}>ВНИМАНИЕ</div>
        <div style={{ fontFamily: VCR, fontWeight: 900, fontSize: 58, color: "#fff", textAlign: "center", width: 900, lineHeight: 1.25, opacity: ez(t, T.dark + 0.4, T.dark + 0.8) }}>ЗАКРОЙТЕ ГЛАЗА.<br />НЕ ОТКРЫВАЙТЕ ИХ<br />ДО КОНЦА ПЕРЕДАЧИ.</div>
      </AbsoluteFill>
    );
  } else if (t < T.rew) {
    scene = (
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        <Studio night={1} />
        <rect width={1080} height={1920} fill="#5a0010" opacity={0.35} />
        <g transform={`translate(540 ${2300 + ez(t, T.face, T.face + 0.3, 200, 0)}) scale(${3.1 + ez(t, T.face, T.rew, 0, 0.4)})`}>
          <Pushistik t={t} arms={0.1} bend={0} creep={1} voidEyes talk={talk} />
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
      {t < T.tape && (
        <div style={{ position: "absolute", right: 46, top: 64, fontFamily: MONT, fontWeight: 900, fontSize: 40, padding: "4px 16px", borderRadius: 14, color: "#fff", background: t >= T.dark ? "#8a0010" : "linear-gradient(90deg,#ff5a5a,#ffb43a,#5ad66a,#3aa0ff,#a05aff)", opacity: 0.85, transform: t >= T.face ? `skewX(${Math.sin(f) * 20}deg)` : undefined }}>{t >= T.dark ? "Р4ДУГ4" : "РАДУГА"}</div>
      )}
      <VHS t={t} f={f} strong={t >= T.dark && t < T.face ? 1 : t >= T.rew && t < T.p6 ? 1 : 0} />
      <Subs t={t} />
    </AbsoluteFill>
  );
};

/** Холодный старт: вспышка скримера (0–0.5 с) → плашка «этот выпуск не вышел в эфир». */
const ColdOpen = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  if (t < 0.5)
    return (
      <AbsoluteFill style={{ background: "#000", filter: "drop-shadow(5px 0 rgba(255,0,90,.5)) drop-shadow(-5px 0 rgba(0,200,255,.5))", transform: `translate(${Math.sin(f * 7) * 10}px, 0)` }}>
        <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
          <Studio night={1} />
          <rect width={1080} height={1920} fill="#5a0010" opacity={0.45} />
          <g transform="translate(540 2450) scale(3.3)">
            <Pushistik t={t} arms={0.1} bend={0} creep={1} voidEyes talk={0.6} />
          </g>
        </svg>
        <VHS t={0} f={f} strong={1} />
      </AbsoluteFill>
    );
  return (
    <AbsoluteFill style={{ background: "#0a1a8a", alignItems: "center", justifyContent: "center", gap: 36 }}>
      <div style={{ fontFamily: VCR, fontWeight: 900, fontSize: 62, color: "#fff", textAlign: "center", width: 920, lineHeight: 1.25 }}>ЭТОТ ВЫПУСК<br />НЕ ВЫШЕЛ В ЭФИР</div>
      <div style={{ fontFamily: VCR, fontWeight: 900, fontSize: 40, color: "#ffd84a", textAlign: "center", width: 920 }}>«УТРЕННЯЯ ЗАРЯДКА С ПУШИСТИКОМ»<br />12.03.1997</div>
      <VHS t={0} f={f} strong={0.6} />
    </AbsoluteFill>
  );
};

export const Pushistik1 = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Sfx at={0} name="pushistik/hit" vol={0.9} />
    <Sfx at={0.45} name="pushistik/vhs" vol={0.4} dur={CO - 0.45} />
    <Sequence durationInFrames={Math.round(CO * 30)}>
      <ColdOpen />
    </Sequence>
    <Sequence from={Math.round(CO * 30)}>
      <PushMain />
    </Sequence>
  </AbsoluteFill>
);
