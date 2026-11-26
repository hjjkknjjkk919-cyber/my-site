import React, { useMemo } from "react";
import { AbsoluteFill, type CalculateMetadataFunction, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { getAudioDurationInSeconds, useAudioData } from "@remotion/media-utils";
import { speechEnergy } from "./useLipSync";
import { Sfx } from "../../components/audio";
import { DurCtx, ez, MONT } from "../../pelmeni/kit";
import { ORANGE, REDK } from "./props";
import { MouthCtx } from "./rig";
import { S1Hook, S2Voice, S3Recruit, S4Shelf, S5Climax, S5Kitchen, S6Payoff } from "./scenes";

/* ── реплики: файл, кто говорит, текст субтитров (без цензуры), ключевые слова, цвет ── */
type Line = { file: string; who: "dima" | "nuance" | "robber"; text: string; keys: string[]; color: string };
const LINES: Line[] = [
  { file: "01_dima_hook", who: "dima", text: "Купил, блядь, шкаф на Авито за пятьсот рублей. В описании: небольшой нюанс, ночью свет в прихожей не включать. Ну спасибо, сука.", keys: ["небольшой", "нюанс", "свет"], color: ORANGE },
  { file: "02_dima_voice", who: "dima", text: "Слышь, Валера, про трёхметрового демона ни слова не было. Кидай триста обратно, или такой отзыв въебу — хуй чё продашь.", keys: ["демона", "отзыв"], color: REDK },
  { file: "03_nuance_sorry", who: "nuance", text: "Бля, братан... я вообще не Валера. Я в комплекте шёл.", keys: ["валера.", "комплекте"], color: ORANGE },
  { file: "04_dima_drill", who: "dima", text: "Короче, возврата нет. Раз прописался на халяву — бери перфоратор, вешай полку в прихожей. А то кривая, аж бесит.", keys: ["перфоратор", "полку"], color: ORANGE },
  { file: "07_dima_scold", who: "dima", text: "Не ной, блядь, ровнее держи. Правый край заваливаешь, рукожоп потусторонний.", keys: ["рукожоп"], color: ORANGE },
  { file: "08_dima_sleep", who: "dima", text: "Слышь, нюанс, сходи разберись, там какой-то долбоёб замок ковыряет.", keys: ["замок"], color: REDK },
  { file: "11_dima_bills", who: "dima", text: "И посуду помой. А, и ещё — с тебя половина коммуналки. Свет жрёшь, воду льёшь.", keys: ["посуду", "коммуналки"], color: ORANGE },
  { file: "12_nuance_rent", who: "nuance", text: "Братан, я древнее зло! Я триста лет за аренду не платил!", keys: ["триста", "аренду"], color: REDK },
  { file: "13_dima_welcome", who: "dima", text: "Ну вот и начнёшь.", keys: ["начнёшь"], color: ORANGE },
  { file: "09_robber", who: "robber", text: "Всем лежать, это ограбление!", keys: ["ограбление!"], color: REDK },
  { file: "10_nuance_roar", who: "nuance", text: "СВЕТ ВЫКЛЮЧИ, СУКА! И С ТЕБЯ ТРЕТЬ ЗА КОММУНАЛКУ!", keys: ["свет", "коммуналку!"], color: REDK },
  { file: "12_robber_scream", who: "robber", text: "ДА НУ НАХУЙ!", keys: ["нахуй!"], color: REDK },
  { file: "11_dima_outro", who: "dima", text: "Короче, шкаф себя окупил за одну ночь. Поставил пять звёзд. А Валера уже пишет про диван с сюрпризом... Беру, хули — как раз на ремонт хватит.", keys: ["окупил", "пять", "диван"], color: ORANGE },
];
const src = (f: string) => staticFile(`audio/avito/${f}.mp3`);
const PAUSE = 0.2;

export type AvitoProps = { durs: number[] };

/* ── монтаж: длительности сцен считаются из реальной длины аудио + паузы 0.35 с ── */
type Placed = { Scene: React.FC<any>; from: number; to: number; props: object };
type Timeline = { placed: Placed[]; vo: [number, number][]; sfx: [string, number, number?, number?][]; total: number; plate: number };

const buildTimeline = (d: number[]): Timeline => {
  const placed: Placed[] = [];
  const vo: [number, number][] = [];
  const sfx: [string, number, number?, number?][] = [];
  let cur = 0;
  let plate = 0;
  const scene = (Scene: React.FC<any>, length: number, props: object) => {
    placed.push({ Scene, from: cur, to: cur + length, props });
    cur += length;
  };
  const say = (i: number, at: number) => vo.push([i, cur + at]);
  const fx = (name: string, at: number, vol?: number, dur?: number) => sfx.push([name, cur + at, vol, dur]);

  // индексы LINES: 0 хук, 1 голосовое, 2 «не Валера», 3 перфоратор, 4 «не ной», 5 «сходи разберись»,
  // 6 коммуналка, 7 «аренду не платил», 8 «начнёшь», 9 грабитель, 10 рёв, 11 «да ну нахуй», 12 финал
  // 1. хук
  say(0, PAUSE);
  fx("creak", 0, 0.55);
  fx("whoosh", 0.8, 0.5);
  scene(S1Hook, PAUSE + d[0] + PAUSE, { ovalAt: PAUSE + d[0] * 0.35, yawnAt: PAUSE + d[0] + 0.02 });
  // 2. голосовое → комедийная пауза («?», лапы за спину) → оправдания
  {
    const n1 = PAUSE + d[1] + 0.6;
    fx("growl", 0.1, 0.5);
    fx("rec", 0.2, 0.6);
    say(1, PAUSE);
    fx("sent", PAUSE + d[1] + 0.05, 0.6);
    say(2, n1);
    scene(S2Voice, n1 + d[2] + PAUSE, { cut1: 2.2, cut2: n1 - 0.1, qAt: PAUSE + d[1] + 0.1 });
  }
  // 3. чат без голоса → передача инструментов
  {
    const chatEnd = 1.0;
    const d3 = chatEnd + PAUSE;
    const handAt = d3 + d[3] * 0.62;
    fx("sfx_chat", 0, 0.7);
    say(3, d3);
    scene(S3Recruit, Math.max(d3 + d[3] + PAUSE, handAt + 1.2), { chatEnd, handAt });
  }
  // 4. полка: «ВЖЖЖ» → Дима командует
  {
    const d4 = 1.3;
    fx("drill", 0.1, 0.6);
    say(4, d4);
    scene(S4Shelf, d4 + d[4] + PAUSE, { drillOn: 0.1, drillOff: 1.2, fixAt: d4 + d[4] * 0.45 });
  }
  // 4½. кухня: посуда и коммуналка
  {
    const n7 = PAUSE + d[6] + PAUSE;
    const d8 = n7 + d[7] + PAUSE;
    say(6, PAUSE);
    fx("dish", n7 - 0.05, 0.7);
    say(7, n7);
    say(8, d8);
    scene(S5Kitchen, d8 + d[8] + 0.25, { dropAt: n7 - 0.4, shockFrom: n7 - 0.4, shockTo: d8 + d[8] });
  }
  // 5. кульминация: скважина → пятка в шкаф → грабитель → древний ужас и коммуналка
  {
    const keyEnd = 1.0;
    const d5 = keyEnd + 0.1;
    const bedEnd = d5 + d[5] + 0.15;
    const kickAt = bedEnd + 0.1;
    const clickAt = bedEnd + 0.5;
    const robberAt = clickAt + 0.12;
    const horrorAt = robberAt + d[9] + 0.08;
    const roarAt = horrorAt + 0.2;
    const dropAt = roarAt + d[10] * 0.55;
    const billsAt = dropAt + 0.2;
    const screamAt = roarAt + d[10] + 0.05;
    const exitAt = screamAt + d[11] * 0.6;
    fx("pick", 0.02, 0.7);
    say(5, d5);
    fx("doorkick", kickAt, 0.85);
    fx("switch", clickAt - 0.05, 0.8);
    say(9, robberAt);
    fx("horror", horrorAt, 0.7);
    say(10, roarAt);
    fx("gun", dropAt + 0.35, 0.7);
    fx("cash", billsAt, 0.6);
    say(11, screamAt);
    scene(S5Climax, screamAt + d[11] + 0.3, { keyEnd, bedEnd, kickAt, clickAt, horrorAt, dropAt, billsAt, screamAt, exitAt });
  }
  // 6. утро: окупился, 5 из 5, пуш про диван; плашка — последние 3 с
  {
    const pushAt = PAUSE + d[12] * 0.55;
    const plateAt = PAUSE + d[12] + PAUSE;
    say(12, PAUSE);
    fx("whoosh", 0.2, 0.4);
    fx("push", pushAt, 0.8);
    plate = cur + plateAt;
    scene(S6Payoff, plateAt + 3.0, { pushAt, plateAt });
  }
  return { placed, vo, sfx, total: cur, plate };
};

const FALLBACK = [7.94, 6.03, 5.85, 6.35, 4.02, 3.21, 4.65, 4.91, 0.97, 2.19, 5.64, 1.57, 7.42];
export const calcAvitoMetadata: CalculateMetadataFunction<AvitoProps> = async () => {
  const durs = await Promise.all(LINES.map((l) => getAudioDurationInSeconds(src(l.file))));
  return { durationInFrames: Math.ceil(buildTimeline(durs).total * 30), props: { durs } };
};
export const AVITO_DEFAULT_FRAMES = Math.ceil(buildTimeline(FALLBACK).total * 30);

/* ── субтитры: 2–4 слова, капс, ключевые слова цветом ── */
type Chunk = { from: number; to: number; words: string[]; keys: string[]; color: string };
const norm = (w: string) => w.toLowerCase().replace(/[^а-яёa-z0-9-]/g, "");
const buildChunks = (vo: [number, number][], d: number[]): Chunk[] =>
  vo.flatMap(([i, at]) => {
    const { text, keys, color } = LINES[i];
    const words = text.split(/\s+/).filter((w) => w !== "—");
    const groups: string[][] = [];
    for (let j = 0; j < words.length; ) {
      const left = words.length - j;
      const n = left <= 4 ? left : left === 5 ? 3 : /[.,:?!]$/.test(words[j + 1]) ? 2 : 3;
      groups.push(words.slice(j, j + n));
      j += n;
    }
    const total = groups.reduce((s, g) => s + g.join(" ").length, 0);
    let t0 = at;
    return groups.map((g) => {
      const len = (d[i] * g.join(" ").length) / total;
      const c = { from: t0, to: t0 + len, words: g, keys, color };
      t0 += len;
      return c;
    });
  });

const Subs = ({ t, chunks, plate }: { t: number; chunks: Chunk[]; plate: number }) => {
  if (t >= plate) return null; // финальная плашка — субтитры прячем
  const c = chunks.find((x) => t >= x.from && t < x.to + 0.05);
  if (!c) return null;
  const k = ez(t, c.from, c.from + 0.12);
  return (
    <AbsoluteFill style={{ alignItems: "center", pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: 1740, width: 980, textAlign: "center", fontFamily: MONT, fontWeight: 900, fontSize: 70, lineHeight: 1.08, textTransform: "uppercase", color: "#fff", WebkitTextStroke: "14px #000", paintOrder: "stroke fill", transform: `scale(${0.9 + 0.1 * k})`, opacity: k }}>
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

/* ── капсула статуса ── */
const NAV_TEXT = ["АВИТО • СДЕЛКА ЗА 500 ₽", "СПОР ПО ТОВАРУ", "", "ОТРАБОТКА В ПРИХОЖЕЙ", "ВЕЧЕР • КУХНЯ И КОММУНАЛКА", "03:15 • ОГРАБЛЕНИЕ", "ОТЗЫВ: 5 ИЗ 5"];
const Nav = ({ t, placed }: { t: number; placed: Placed[] }) => {
  const marks = placed.map((p, i) => [p.from, NAV_TEXT[i]] as [number, string]).filter(([, s]) => s);
  const i = marks.reduce((acc, [a], j) => (t >= a ? j : acc), 0);
  const k = ez(t, marks[i][0], marks[i][0] + 0.35);
  return (
    <AbsoluteFill style={{ alignItems: "center", pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: 34, display: "flex", alignItems: "center", gap: 12, fontFamily: MONT, fontWeight: 900, fontSize: 34, color: "#fff", background: "rgba(10,10,12,.86)", padding: "12px 28px", borderRadius: 999, border: "3px solid rgba(255,255,255,.16)", opacity: 0.3 + 0.7 * k, transform: `translateY(${(1 - k) * -12}px)` }}>
        <span style={{ color: "#00aaff" }}>●</span>
        {marks[i][1]}
      </div>
    </AbsoluteFill>
  );
};

const Film = ({ f }: { f: number }) => (
  <>
    <AbsoluteFill style={{ mixBlendMode: "overlay", opacity: 0.14, pointerEvents: "none" }}>
      <svg width={1080} height={1920}>
        <filter id="av-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={1} seed={f % 10} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width={1080} height={1920} filter="url(#av-grain)" />
      </svg>
    </AbsoluteFill>
    <AbsoluteFill style={{ background: "radial-gradient(85% 62% at 50% 46%, rgba(0,0,0,0) 55%, rgba(0,0,0,.6) 100%)", pointerEvents: "none" }} />
  </>
);

export const AvitoWardrobe = ({ durs }: AvitoProps) => {
  const f = useCurrentFrame();
  const t = f / 30;
  const d = durs.length === LINES.length ? durs : FALLBACK;
  const tl = useMemo(() => buildTimeline(d), [d]);
  const chunks = useMemo(() => buildChunks(tl.vo, d), [tl, d]);
  const audio = LINES.map((l) => useAudioData(src(l.file)));
  const talking = (tt: number) => tl.vo.some(([i, a]) => tt > a - 0.1 && tt < a + d[i] + 0.1);
  // lip-sync: рот двигается только у того, чья реплика звучит
  const mouth = { dima: 0, nuance: 0, robber: 0 };
  for (const [i, a] of tl.vo) {
    if (t >= a && t < a + d[i]) mouth[LINES[i].who] = speechEnergy(audio[i], f - Math.round(a * 30), 30);
  }
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {/* фон с авто-дакингом −12 дБ под голосом */}
      <Audio src={staticFile("audio/avito/room.mp3")} loop volume={(fr) => (talking(fr / 30) ? 0.3 * 0.25 : 0.3)} />
      {tl.sfx.map(([name, at, vol, dur], i) => (
        <Sfx key={i} at={at} name={`avito/${name}`} vol={(fr) => (talking(fr / 30 + at) ? (vol ?? 0.6) * 0.5 : vol ?? 0.6)} dur={dur} />
      ))}
      {tl.vo.map(([i, at]) => (
        <Sfx key={LINES[i].file} at={at} name={`avito/${LINES[i].file}`} vol={1.15} />
      ))}
      <MouthCtx.Provider value={mouth}>
        {tl.placed.map(({ Scene, from, to, props }, i) => (
          <Sequence key={i} from={Math.round(from * 30)} durationInFrames={Math.round(to * 30) - Math.round(from * 30)}>
            <DurCtx.Provider value={to - from}>
              <Scene {...props} />
            </DurCtx.Provider>
          </Sequence>
        ))}
      </MouthCtx.Provider>
      <Film f={f} />
      <Nav t={t} placed={tl.placed} />
      <Subs t={t} chunks={chunks} plate={tl.plate} />
    </AbsoluteFill>
  );
};
