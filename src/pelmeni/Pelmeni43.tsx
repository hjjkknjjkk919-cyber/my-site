import React from "react";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { loadFont as loadStencil } from "@remotion/google-fonts/RussoOne";
import { loadFont as loadCaveat } from "@remotion/google-fonts/Caveat";
import { Sfx } from "../components/audio";
import { ez, GOLD, MONT, RED } from "./kit";
import { S10Split, S11Bag, S12Flash, S13DM, S14Face, S15Door, S16Peephole, S1Bedroom, S2Mom, S3Chat, S4Board, S5Press, S6Recorder, S7Kitchen, S8Fork, S9Napkin } from "./scenes";

loadStencil();
loadCaveat();

export const PEL_FRAMES = 1980;

/* ── монтаж: [начало, конец, сцена] ── */
const SCENES: [number, number, React.FC][] = [
  [0, 3, S1Bedroom],
  [3, 6, S2Mom],
  [6, 11, S3Chat],
  [11, 15, S4Board],
  [15, 18, S5Press],
  [18, 23, S6Recorder],
  [23, 26, S7Kitchen],
  [26, 28, S8Fork],
  [28, 32, S9Napkin],
  [32, 35, S10Split],
  [35, 38, S11Bag],
  [38, 41, S12Flash],
  [41, 45, S13DM],
  [45, 47, S14Face],
  [47, 50, S15Door],
  [50, 66, S16Peephole],
];

/* ── озвучка: [файл, старт, длительность, текст субтитров, ключевые слова, цвет] ── */
type Line = [string, number, number, string, string[], string];
const VO: Line[] = [
  ["v01", 0.1, 2.85, "Если в три ночи за стенкой гудит мясорубка — не стучи соседу.", ["мясорубка"], RED],
  ["v02", 3.1, 2.77, "Мама ушла в ночную смену, ты в квартире один.", ["один"], GOLD],
  ["v03", 6.1, 4.86, "В чате дома сосед из сорок четвёртой продаёт пельмени. Пишет — свежее парное мясо.", ["парное", "мясо"], RED],
  ["v04", 11.15, 3.55, "А утром у лифта вешают три ориентировки: пропала старшая по подъезду.", ["пропала"], RED],
  ["v05", 15.1, 2.85, "Правило первое: не выдавай себя — просто запиши звук.", ["запиши"], GOLD],
  ["v06", 18.6, 4.05, "Ровно в три ноль две за стеной снова ревёт мясорубка и шуршат пакеты.", ["мясорубка"], RED],
  ["v07", 23.1, 2.77, "Вечером на кухне стоит тарелка: мама пишет — сосед угостил.", ["угостил"], GOLD],
  ["v08", 26.02, 1.96, "На третьем пельмене зубы натыкаются на металл.", ["металл"], RED],
  ["v09", 28.1, 3.84, "Ты сплёвываешь на салфетку — в фарше блестит золотая серёжка с зелёным камнем.", ["серёжка"], GOLD],
  ["v10", 32.2, 2.66, "Точно такая же была в ушах у пропавшей соседки.", ["пропавшей"], RED],
  ["v11", 35.1, 2.85, "Правило второе: не мой улику — убери в пакет и спрячь.", ["улику"], GOLD],
  ["v12", 38.6, 2.22, "И в ту же секунду телефон на столе вибрирует.", ["вибрирует"], GOLD],
  ["v13", 41.1, 3.84, "Личка от соседа: «Дань, ну как, счастливый пельмень попался?»", ["счастливый", "пельмень"], RED],
  ["v14", 45.04, 1.93, "Откуда он знает, что ты сел есть?!", ["знает"], RED],
  ["v16", 50.3, 4.49, "Ты смотришь в глазок: на площадке стоит он — в фартуке и с новой тарелкой.", ["он"], RED],
  ["s17", 54.94, 2.56, "Дань, открой на секунду, я тебе не те пельмени отдал.", ["не", "те"], RED],
  ["v18", 58.4, 5.09, "Он стоит прямо за дверью. Что сделаешь? Выбирай: один или два — в комментариях.", ["один", "два"], GOLD],
];
const talking = (t: number) => VO.some(([, a, d]) => t > a - 0.1 && t < a + d + 0.1);
const SILENCE: [number, number] = [57.5, 58.0];
const inSilence = (t: number) => t >= SILENCE[0] && t < SILENCE[1];

/* ── субтитры: куски по 2–4 слова, время пропорционально длине ── */
type Chunk = { from: number; to: number; words: string[]; keys: string[]; color: string };
const norm = (w: string) => w.toLowerCase().replace(/[^а-яёa-z0-9]/g, "");
const CHUNKS: Chunk[] = VO.flatMap(([, at, dur, text, keys, color]) => {
  const words = text.split(/\s+/).filter((w) => w !== "—");
  const groups: string[][] = [];
  for (let i = 0; i < words.length; ) {
    const left = words.length - i;
    const n = left <= 4 ? left : left === 5 ? 3 : /[.,:?!»]$/.test(words[i + 1]) ? 2 : 3;
    groups.push(words.slice(i, i + n));
    i += n;
  }
  const total = groups.reduce((s, g) => s + g.join(" ").length, 0);
  let t0 = at;
  return groups.map((g) => {
    const d = (dur * g.join(" ").length) / total;
    const c = { from: t0, to: t0 + d, words: g, keys, color };
    t0 += d;
    return c;
  });
});

const Subs = ({ t }: { t: number }) => {
  const c = CHUNKS.find((x) => t >= x.from && t < x.to + 0.05);
  if (!c) return null;
  const k = ez(t, c.from, c.from + 0.12);
  const fin = t >= 58;
  const top = fin ? 1300 : 1450;
  return (
    <AbsoluteFill style={{ alignItems: "center", pointerEvents: "none" }}>
      <div style={{ position: "absolute", top, width: 980, textAlign: "center", fontFamily: MONT, fontWeight: 900, fontSize: fin ? 58 : 74, lineHeight: 1.1, textTransform: "uppercase", color: "#fff", WebkitTextStroke: "14px #000", paintOrder: "stroke fill", transform: `scale(${0.88 + 0.12 * k})`, opacity: k }}>
        {c.words.map((w, i) => (
          <span key={i} style={{ color: c.keys.includes(norm(w)) ? c.color : "#fff" }}>
            {w}
            {i < c.words.length - 1 ? " " : ""}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/* ── капсула-навигатор ── */
const NAV: [number, string][] = [
  [0, "03:02 НОЧИ • КВ. 43"],
  [6, "ДОМОВОЙ ЧАТ • КВ. 44"],
  [15, "ПРАВИЛО №1: НЕ СТУЧИ"],
  [28, "УЛИКА: СЕРЁЖКА"],
  [35, "ПРАВИЛО №2: НЕ МОЙ УЛИКУ"],
  [47, "ОН ЗА ДВЕРЬЮ"],
];
const Nav = ({ t }: { t: number }) => {
  const i = NAV.reduce((acc, [a], j) => (t >= a ? j : acc), 0);
  const k = ez(t, NAV[i][0], NAV[i][0] + 0.35);
  const alarm = i >= 2 && i !== 3;
  return (
    <AbsoluteFill style={{ alignItems: "center", pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: 40, display: "flex", alignItems: "center", gap: 14, fontFamily: MONT, fontWeight: 900, fontSize: 36, color: "#f4ead2", background: "rgba(8,8,10,.86)", padding: "14px 30px", borderRadius: 999, border: `3px solid ${alarm ? RED : "rgba(255,255,255,.16)"}`, boxShadow: "0 8px 30px rgba(0,0,0,.6)", opacity: 0.3 + 0.7 * k, transform: `translateY(${(1 - k) * -14}px)` }}>
        <span style={{ color: RED, opacity: 0.55 + 0.45 * Math.sin(t * 6) }}>●</span>
        {NAV[i][1]}
      </div>
    </AbsoluteFill>
  );
};

/* ── мини-схема площадки: кв. 43 (ты) | кв. 44 (сосед) ── */
const MiniMap = ({ t }: { t: number }) => {
  const threat = (t > 18 && t < 23) || (t > 38 && t < 66);
  const p = threat ? 0.5 + 0.5 * Math.sin(t * 12) : 0;
  const onLanding = t > 47;
  const nx = onLanding ? 112 : 190;
  const ny = onLanding ? 162 : 80;
  return (
    <div style={{ position: "absolute", top: 130, right: 28, opacity: 0.88, pointerEvents: "none" }}>
      <svg width={250} height={210} viewBox="0 0 250 210">
        <rect x={2} y={2} width={246} height={206} rx={16} fill="rgba(8,10,14,.7)" stroke="rgba(255,255,255,.22)" strokeWidth={2} />
        <rect x={16} y={20} width={104} height={118} fill="rgba(95,208,104,.12)" stroke="#f4ead2" strokeWidth={3} />
        <rect x={130} y={20} width={104} height={118} fill={`rgba(229,38,43,${0.12 + 0.35 * p})`} stroke="#f4ead2" strokeWidth={3} />
        <rect x={121} y={20} width={8} height={118} fill={t > 15 && t < 23 ? RED : "#8a7a66"} />
        <rect x={16} y={146} width={218} height={46} fill="rgba(255,255,255,.06)" stroke="#f4ead2" strokeWidth={2} strokeDasharray="6 5" />
        <text x={68} y={52} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={17} fill="#f4ead2">КВ. 43</text>
        <text x={68} y={72} textAnchor="middle" fontFamily={MONT} fontWeight={700} fontSize={14} fill="#5fd068">(ТЫ)</text>
        <text x={182} y={52} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={17} fill="#f4ead2">КВ. 44</text>
        <text x={182} y={72} textAnchor="middle" fontFamily={MONT} fontWeight={700} fontSize={14} fill="#ff8a8a">(СОСЕД)</text>
        <circle cx={68} cy={104} r={9} fill="#5fd068" stroke="#000" strokeWidth={2} />
        {p > 0 && <circle cx={nx} cy={ny} r={10 + 12 * p} fill={RED} opacity={0.4} />}
        <circle cx={nx} cy={ny} r={9} fill={RED} stroke="#000" strokeWidth={2} />
      </svg>
    </div>
  );
};

/* ── плёночное зерно + виньетка ── */
const Film = ({ f }: { f: number }) => (
  <>
    <AbsoluteFill style={{ mixBlendMode: "overlay", opacity: 0.2, pointerEvents: "none" }}>
      <svg width={1080} height={1920}>
        <filter id="pel-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={1} seed={f % 10} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width={1080} height={1920} filter="url(#pel-grain)" />
      </svg>
    </AbsoluteFill>
    <AbsoluteFill style={{ background: "radial-gradient(80% 60% at 50% 48%, rgba(0,0,0,0) 50%, rgba(0,0,0,.72) 100%)", pointerEvents: "none" }} />
  </>
);

/* ── звук ── */
const Sound = () => (
  <>
    {/* фон: авто-дакинг −12 дБ под голосом, гробовая тишина 57.5–58.0 */}
    <Audio src={staticFile("audio/pelmeni/drone.mp3")} loop volume={(f) => (inSilence(f / 30) ? 0 : talking(f / 30) ? 0.32 * 0.25 : 0.32)} />
    <Sfx at={4.4} name="pelmeni/doorclose" vol={0.45} />
    <Sfx at={18.0} name="pelmeni/grinder" vol={(f) => (f / 30 + 18 > 18.55 ? 0.42 : 0.8)} dur={4.8} />
    <Sfx at={26.22} name="pelmeni/crunch" vol={0.9} />
    <Sfx at={28.1} name="pelmeni/sting" vol={0.35} dur={1.8} />
    <Sfx at={38.1} name="dontopen/phonebuzz" vol={0.75} dur={2.0} />
    <Sfx at={45.0} name="pelmeni/sting" vol={0.4} dur={1.8} />
    <Sfx at={46.96} name="pelmeni/knocks3" vol={1.0} />
    <Sfx at={58.0} name="pelmeni/sting" vol={0.6} dur={2} />
    {VO.map(([k, at]) => (
      <Sfx key={k} at={at} name={`pelmeni/${k}`} vol={1.15} />
    ))}
  </>
);

export const Pelmeni43 = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Sound />
      {SCENES.map(([a, b, Scene], i) => (
        <Sequence key={i} from={Math.round(a * 30)} durationInFrames={Math.round((b - a) * 30)}>
          <Scene />
        </Sequence>
      ))}
      <Film f={f} />
      <Nav t={t} />
      <MiniMap t={t} />
      <Subs t={t} />
    </AbsoluteFill>
  );
};
