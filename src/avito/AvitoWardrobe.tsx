import React, { useMemo } from "react";
import { AbsoluteFill, type CalculateMetadataFunction, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { getAudioDurationInSeconds, useAudioData, visualizeAudio } from "@remotion/media-utils";
import { Sfx } from "../components/audio";
import { DurCtx, ez, MONT } from "../pelmeni/kit";
import { ORANGE, REDK } from "./props";
import { MouthCtx } from "./rig";
import { S1Hook, S2Voice, S3Recruit, S4Shelf, S5Guard, S6Review } from "./scenes";

/* ── реплики: файл, кто говорит, текст субтитров (без цензуры), ключевые слова, цвет ── */
type Line = { file: string; who: "dima" | "nuance"; text: string; keys: string[]; color: string };
const LINES: Line[] = [
  { file: "01_dima_hook", who: "dima", text: "Купил, блядь, шкаф на Авито за пятьсот рублей... Продавец написал: самовывоз, без торга, внутри небольшой нюанс. Ну спасибо, сука, не наебал.", keys: ["небольшой", "нюанс"], color: ORANGE },
  { file: "02_dima_voice", who: "dima", text: "Слышь, уёбок, ты про древнего демона в описании ни слова не писал. Либо кидаешь триста рублей обратно на карту, либо я тебе такой отзыв въебу — хуй ты тут больше чё продашь, Валера.", keys: ["демона", "отзыв", "валера"], color: REDK },
  { file: "03_nuance_sorry", who: "nuance", text: "Р-р-р... Бля, братан... ну чё сразу единицу-то... я вообще не Валера...", keys: ["единицу-то", "валера"], color: ORANGE },
  { file: "04_dima_drill", who: "dima", text: "Продавец кинул в ЧС, говорит — возврата нет, тварь неприхотливая. Ладно, хуй с тобой. Раз уж прописался на халяву — бери перфоратор, пойдёшь полку в прихожей вешать. А то кривая, аж бесит.", keys: ["чс", "перфоратор", "полку"], color: ORANGE },
  { file: "05_nuance_wall", who: "nuance", text: "Пиздец... тут бетон армированный, сверло вообще нихуя не берёт...", keys: ["бетон"], color: REDK },
  { file: "06_dima_scold", who: "dima", text: "Не ной, блядь, ровнее держи. Правый край заваливаешь, рукожоп потусторонний.", keys: ["рукожоп"], color: ORANGE },
  { file: "07_dima_sleep", who: "dima", text: "Слышь, нюанс, сходи разберись, там какой-то долбоёб замок ковыряет, спать мешает.", keys: ["замок"], color: REDK },
  { file: "08_nuance_thief", who: "nuance", text: "Мужчина, вы дверью ошиблись, тут уже занято. Хорошего вечера.", keys: ["занято"], color: ORANGE },
  { file: "09_dima_outro", who: "dima", text: "Короче, поставил четыре звезды. Одну снял за то, что шкаф, сука, скрипит. А через час продавец пишет, что у него ещё бабушкин диван есть — с сюрпризом. Думаю, надо брать, хули.", keys: ["четыре", "диван"], color: ORANGE },
];
const src = (f: string) => staticFile(`audio/avito/${f}.mp3`);
const PAUSE = 0.35;

export type AvitoProps = { durs: number[] };

/* ── монтаж: длительности сцен считаются из реальной длины аудио + паузы 0.35 с ── */
type Placed = { Scene: React.FC<any>; from: number; to: number; props: object };
type Timeline = { placed: Placed[]; vo: [number, number][]; sfx: [string, number, number?, number?][]; total: number; plate: number };

const buildTimeline = (d: number[]): Timeline => {
  const placed: Placed[] = [];
  const vo: [number, number][] = [];
  const sfx: [string, number, number?, number?][] = [];
  let cur = 0;
  const scene = (Scene: React.FC<any>, length: number, props: object) => {
    placed.push({ Scene, from: cur, to: cur + length, props });
    cur += length;
  };
  const say = (i: number, at: number) => vo.push([i, cur + at]);
  const fx = (name: string, at: number, vol?: number, dur?: number) => sfx.push([name, cur + at, vol, dur]);

  // 1. хук
  say(0, PAUSE);
  fx("creak", 0, 0.55);
  fx("whoosh", 1.0, 0.5);
  scene(S1Hook, PAUSE + d[0] + PAUSE, { ovalAt: PAUSE + d[0] * 0.66, yawnAt: PAUSE + d[0] + 0.05 });
  // 2. голосовое → извинения
  {
    const n1 = PAUSE + d[1] + PAUSE;
    fx("growl", 0.1, 0.5);
    fx("rec", 0.25, 0.6);
    say(1, PAUSE);
    fx("sent", n1 - 0.25, 0.6);
    say(2, n1);
    scene(S2Voice, n1 + d[2] + PAUSE, { cut1: 2.6, cut2: n1 - 0.1 });
  }
  // 3. чат → передача инструментов
  {
    const chatEnd = 5.0;
    const handAt = PAUSE + d[3] * 0.6;
    say(3, PAUSE);
    scene(S3Recruit, Math.max(PAUSE + d[3] + PAUSE, handAt + 2.6), { chatEnd, handAt });
  }
  // 4. полка
  {
    const n2 = 1.4;
    const d4 = n2 + d[4] + PAUSE;
    fx("drill", 0.2, 0.55);
    say(4, n2);
    say(5, d4);
    scene(S4Shelf, d4 + d[5] + PAUSE, { drillOn: 0.2, drillOff: 1.6, fixAt: d4 + d[5] * 0.45 });
  }
  // 5. охрана в 03:15
  {
    const keyEnd = 2.6;
    const d5 = keyEnd + 0.2;
    const bedEnd = d5 + d[6] + PAUSE;
    const openAt = bedEnd + 0.2;
    const dropAt = openAt + 0.5;
    const cloudAt = openAt + 0.6;
    const n3 = openAt + 0.8;
    const fallAt = n3 + d[7] * 0.62;
    fx("pick", 0.05, 0.7);
    say(6, d5);
    fx("creak", openAt - 0.1, 0.5);
    fx("thud", fallAt + 0.05, 0.85);
    say(7, n3);
    scene(S5Guard, n3 + d[7] + 0.6, { keyEnd, bedEnd, openAt, dropAt, cloudAt, fallAt, talkAt: n3, talkEnd: n3 + d[7] });
  }
  // 6. отзыв и диван
  const pushAt = PAUSE + d[8] * 0.55;
  const plateAt = PAUSE + d[8] + PAUSE;
  say(8, PAUSE);
  fx("whoosh", 0.2, 0.4);
  fx("push", pushAt, 0.8);
  const plate = cur + plateAt;
  scene(S6Review, plateAt + 2.6, { pushAt, plateAt });
  return { placed, vo, sfx, total: cur, plate };
};

const FALLBACK = [9.33, 10.27, 7.13, 12.59, 7.34, 4.44, 5.09, 5.22, 10.29];
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
const NAV_TEXT = ["АВИТО • СДЕЛКА ЗА 500 ₽", "СПОР ПО ТОВАРУ", "", "ОТРАБОТКА В ПРИХОЖЕЙ", "03:15 • ВЗЛОМ ЗАМКА", "ОТЗЫВ: 4 ИЗ 5"];
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

/** Громкость голоса на кадре: среднее нижних полос спектра реплики → 0..1. */
const loudness = (data: ReturnType<typeof useAudioData>, frame: number) => {
  if (!data || frame < 0) return 0;
  const bins = visualizeAudio({ fps: 30, frame, audioData: data, numberOfSamples: 32, smoothing: true });
  const lo = bins.slice(0, 12);
  return Math.min(1, (lo.reduce((a, b) => a + b, 0) / lo.length) * 9);
};

export const AvitoWardrobe = ({ durs }: AvitoProps) => {
  const f = useCurrentFrame();
  const t = f / 30;
  const d = durs.length === LINES.length ? durs : FALLBACK;
  const tl = useMemo(() => buildTimeline(d), [d]);
  const chunks = useMemo(() => buildChunks(tl.vo, d), [tl, d]);
  const audio = LINES.map((l) => useAudioData(src(l.file)));
  const talking = (tt: number) => tl.vo.some(([i, a]) => tt > a - 0.1 && tt < a + d[i] + 0.1);
  // lip-sync: рот двигается только у того, чья реплика звучит
  const mouth = { dima: 0, nuance: 0 };
  for (const [i, a] of tl.vo) {
    if (t >= a && t < a + d[i]) mouth[LINES[i].who] = loudness(audio[i], f - Math.round(a * 30));
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
