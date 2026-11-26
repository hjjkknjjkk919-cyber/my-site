import React from "react";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { loadFont as loadStencil } from "@remotion/google-fonts/RussoOne";
import { loadFont as loadCaveat } from "@remotion/google-fonts/Caveat";
import { Sfx } from "../components/audio";
import { DurCtx, ez, GOLD, MONT, RED } from "./kit";
import { S13DM, S14Face, S15Door, S16Peephole, S1Bedroom, S3Chat, S4Board, S6Recorder, S7Kitchen, S8Fork, S9Napkin } from "./scenes";

loadStencil();
loadCaveat();

/* ── озвучка: [файл, длительность, текст субтитров, ключевые слова, цвет] ── */
type Vo = [string, number, string, string[], string];
const V: Record<string, Vo> = Object.fromEntries(
  ([
    ["v01", 3.84, "Если в три ночи за стенкой гудит мясорубка — не стучи соседу.", ["мясорубка"], RED],
    ["v02", 2.66, "Мама ушла в ночную смену. Ты в квартире один.", ["один"], GOLD],
    ["v03", 5.54, "В чате дома сосед из сорок четвёртой продаёт пельмени. Пишет — свежее парное мясо.", ["парное", "мясо"], RED],
    ["v04", 4.1, "А утром у лифта вешают три ориентировки: пропала старшая по подъезду.", ["пропала"], RED],
    ["v05", 3.58, "Правило первое: не выдавай себя — просто запиши звук.", ["запиши"], GOLD],
    ["v06", 4.28, "Ровно в три ноль две за стеной снова ревёт мясорубка и шуршат пакеты.", ["мясорубка"], RED],
    ["v07", 3.76, "Вечером на кухне стоит тарелка. Мама пишет: сосед угостил.", ["угостил"], GOLD],
    ["v08", 2.61, "На третьем пельмене зубы натыкаются на металл.", ["металл"], RED],
    ["v09", 4.94, "Ты сплёвываешь на салфетку. В фарше блестит золотая серёжка с зелёным камнем.", ["серёжка"], GOLD],
    ["v10", 2.59, "Точно такая же была в ушах у пропавшей соседки.", ["пропавшей"], RED],
    ["v11", 3.66, "Правило второе: не мой улику — убери в пакет и спрячь.", ["улику"], GOLD],
    ["v12", 2.56, "И в ту же секунду телефон на столе вибрирует.", ["вибрирует"], GOLD],
    ["v13", 4.6, "Личка от соседа: «Дань… Ну как, счастливый пельмень попался?»", ["счастливый", "пельмень"], RED],
    ["v14", 2.17, "Откуда он знает, что ты сел есть?!", ["знает"], RED],
    ["v16", 4.55, "Ты смотришь в глазок. На площадке стоит он — в фартуке и с новой тарелкой.", ["он"], RED],
    ["s17", 3.29, "Дань, открой на секунду. Я тебе не те пельмени отдал.", ["не", "те"], RED],
    ["v18", 5.51, "Он стоит прямо за дверью. Что сделаешь? Выбирай: один или два — в комментариях.", ["один", "два"], GOLD],
  ] as Vo[]).map((v) => [v[0], v])
);

/* ── монтаж считается от длины реплик: сцена = max(минимум, вступление + реплика + хвост) ── */
type Beat = { Scene: React.FC<any>; vo?: string; lead?: number; tail?: number; min: number; props?: (start: number) => object };
const BEATS: Beat[] = [
  { Scene: S1Bedroom, vo: "v01", min: 2.5 },
  { Scene: S3Chat, vo: "v03", min: 3.5 },
  { Scene: S4Board, vo: "v04", min: 3 },
  { Scene: S6Recorder, vo: "v06", lead: 0.6, min: 3.5 },
  { Scene: S7Kitchen, vo: "v07", min: 2.5 },
  { Scene: S8Fork, vo: "v08", lead: 0.25, tail: 0.9, min: 2.2, props: () => ({ hitAt: 0.25 + V.v08[1] + 0.05 }) },
  { Scene: S9Napkin, vo: "v09", min: 3 },
  { Scene: S13DM, vo: "v13", lead: 0.5, min: 3 },
  { Scene: S14Face, vo: "v14", lead: 0.2, tail: 0.4, min: 1.8 },
  { Scene: S15Door, min: 3.0 },
];
const PAD_IN = 0.25;
const PAD_OUT = 0.3;
type Placed = { Scene: React.FC<any>; from: number; to: number; props: object };
const VO: [string, number][] = [];
const PLACED: Placed[] = [];
let cursor = 0;
for (const b of BEATS) {
  const lead = b.lead ?? PAD_IN;
  const len = b.vo ? Math.max(b.min, lead + V[b.vo][1] + (b.tail ?? PAD_OUT)) : b.min;
  if (b.vo) VO.push([b.vo, cursor + lead]);
  PLACED.push({ Scene: b.Scene, from: cursor, to: cursor + len, props: b.props?.(cursor) ?? {} });
  cursor += len;
}
const at = (i: number) => PLACED[i].from;
/* финал в глазке: реплика рассказчика → сосед → 0.5 с тишины → выбор */
const P0 = cursor;
const pv16 = 0.25;
const ps17 = pv16 + V.v16[1] + 0.35;
const pFreeze = ps17 + V.s17[1] + 0.5;
const pv18 = pFreeze + 0.3;
const pEnd = pv18 + V.v18[1] + 1.5;
VO.push(["v16", P0 + pv16], ["s17", P0 + ps17], ["v18", P0 + pv18]);
PLACED.push({ Scene: S16Peephole, from: P0, to: P0 + pEnd, props: { talkAt: ps17, talkEnd: ps17 + V.s17[1], freezeAt: pFreeze, end: pEnd } });
const T_END = P0 + pEnd;
export const PEL_FRAMES = Math.ceil(T_END * 30);

const talking = (t: number) => VO.some(([k, a]) => t > a - 0.1 && t < a + V[k][1] + 0.1);
const SILENCE: [number, number] = [P0 + pFreeze - 0.5, P0 + pFreeze];
const inSilence = (t: number) => t >= SILENCE[0] && t < SILENCE[1];
const FINALE = P0 + pFreeze;

/* ── субтитры: куски по 2–4 слова, время пропорционально длине ── */
type Chunk = { from: number; to: number; words: string[]; keys: string[]; color: string };
const norm = (w: string) => w.toLowerCase().replace(/[^а-яёa-z0-9]/g, "");
const CHUNKS: Chunk[] = VO.flatMap(([k, at]) => {
  const [, dur, text, keys, color] = V[k];
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
  if (t >= FINALE + 0.55) return null; // кнопки выбора выезжают — субтитры прячем
  const c = CHUNKS.find((x) => t >= x.from && t < x.to + 0.05);
  if (!c) return null;
  const k = ez(t, c.from, c.from + 0.12);
  const fin = t >= FINALE;
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
  [at(1), "ДОМОВОЙ ЧАТ • КВ. 44"],
  [at(3), "ПРАВИЛО №1: НЕ СТУЧИ"],
  [at(6), "УЛИКА: СЕРЁЖКА"],
  [at(9), "ОН ЗА ДВЕРЬЮ"],
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
  const threat = (t > at(3) && t < at(4)) || t > at(7);
  const p = threat ? 0.5 + 0.5 * Math.sin(t * 12) : 0;
  const onLanding = t > at(9);
  const nx = onLanding ? 112 : 190;
  const ny = onLanding ? 162 : 80;
  return (
    <div style={{ position: "absolute", top: 130, right: 28, opacity: 0.88, pointerEvents: "none" }}>
      <svg width={250} height={210} viewBox="0 0 250 210">
        <rect x={2} y={2} width={246} height={206} rx={16} fill="rgba(8,10,14,.7)" stroke="rgba(255,255,255,.22)" strokeWidth={2} />
        <rect x={16} y={20} width={104} height={118} fill="rgba(95,208,104,.12)" stroke="#f4ead2" strokeWidth={3} />
        <rect x={130} y={20} width={104} height={118} fill={`rgba(229,38,43,${0.12 + 0.35 * p})`} stroke="#f4ead2" strokeWidth={3} />
        <rect x={121} y={20} width={8} height={118} fill={t > at(3) && t < at(4) ? RED : "#8a7a66"} />
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
    <Sfx at={at(3)} name="pelmeni/grinder" vol={(f) => (f / 30 > 0.6 ? 0.42 : 0.8)} dur={PLACED[3].to - at(3)} loop />
    <Sfx at={at(5) + 0.25 + V.v08[1] + 0.05 - 0.78} name="pelmeni/crunch" vol={0.9} />
    <Sfx at={at(6)} name="pelmeni/sting" vol={0.35} dur={1.8} />
    <Sfx at={at(7)} name="dontopen/phonebuzz" vol={0.75} dur={1.2} />
    <Sfx at={at(8)} name="pelmeni/sting" vol={0.4} dur={1.8} />
    <Sfx at={at(9) - 0.04} name="pelmeni/knocks3" vol={1.0} />
    <Sfx at={FINALE} name="pelmeni/sting" vol={0.6} dur={2} />
    {VO.map(([k, a]) => (
      <Sfx key={k} at={a} name={`pelmeni/${k}`} vol={1.15} />
    ))}
  </>
);

export const Pelmeni43 = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Sound />
      {PLACED.map(({ Scene, from, to, props }, i) => (
        <Sequence key={i} from={Math.round(from * 30)} durationInFrames={Math.round(to * 30) - Math.round(from * 30)}>
          <DurCtx.Provider value={to - from}>
            <Scene {...props} />
          </DurCtx.Provider>
        </Sequence>
      ))}
      <Film f={f} />
      <Nav t={t} />
      <MiniMap t={t} />
      <Subs t={t} />
    </AbsoluteFill>
  );
};
