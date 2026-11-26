import React from "react";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { Sfx } from "../components/audio";
import { DurCtx, ez, MONT } from "../pelmeni/kit";
import { ORANGE, REDK } from "./props";
import { S1Hook, S2Voice, S3Recruit, S4Shelf, S5Guard, S6Review } from "./scenes";

/* ── реплики: [файл, длительность, текст, ключевые слова, цвет] — без цензуры, как в озвучке ── */
type Vo = [string, number, string, string[], string];
const V: Record<string, Vo> = Object.fromEntries(
  ([
    ["d1", 9.33, "Купил, блядь, шкаф на Авито за пятьсот рублей... Продавец написал: самовывоз, без торга, внутри небольшой нюанс. Ну спасибо, сука, не наебал.", ["небольшой", "нюанс"], ORANGE],
    ["d2", 10.27, "Слышь, уёбок, ты про древнего демона в описании ни слова не писал. Либо кидаешь триста рублей обратно на карту, либо я тебе такой отзыв въебу — хуй ты тут больше чё продашь, Валера.", ["демона", "отзыв", "валера"], REDK],
    ["n1", 7.13, "Р-р-р... Бля, братан... ну чё сразу единицу-то... я вообще не Валера...", ["единицу-то", "валера"], ORANGE],
    ["d3", 12.59, "Продавец кинул в ЧС, говорит — возврата нет, тварь неприхотливая. Ладно, хуй с тобой. Раз уж прописался на халяву — бери перфоратор, пойдёшь полку в прихожей вешать. А то кривая, аж бесит.", ["чс", "перфоратор", "полку"], ORANGE],
    ["n2", 7.34, "Пиздец... тут бетон армированный, сверло вообще нихуя не берёт...", ["бетон"], REDK],
    ["d4", 4.44, "Не ной, блядь, ровнее держи. Правый край заваливаешь, рукожоп потусторонний.", ["рукожоп"], ORANGE],
    ["d5", 5.09, "Слышь, нюанс, сходи разберись, там какой-то долбоёб замок ковыряет, спать мешает.", ["замок"], REDK],
    ["n3", 5.22, "Мужчина, вы дверью ошиблись, тут уже занято. Хорошего вечера.", ["занято"], ORANGE],
    ["d6", 10.29, "Короче, поставил четыре звезды. Одну снял за то, что шкаф, сука, скрипит. А через час продавец пишет, что у него ещё бабушкин диван есть — с сюрпризом. Думаю, надо брать, хули.", ["четыре", "диван"], ORANGE],
  ] as Vo[]).map((v) => [v[0], v])
);
const len = (k: string) => V[k][1];

/* ── монтаж от длины реплик (минимум — длительности сцен из сценария) ── */
type Placed = { Scene: React.FC<any>; from: number; to: number; props: object };
const VO: [string, number][] = [];
const SFX: [string, number, number?, number?][] = [];
const PLACED: Placed[] = [];
let cur = 0;
let PLATE = Infinity;
const scene = (Scene: React.FC<any>, length: number, props: object) => {
  PLACED.push({ Scene, from: cur, to: cur + length, props });
  cur += length;
};
const say = (k: string, at: number) => VO.push([k, cur + at]);
const fx = (name: string, at: number, vol?: number, dur?: number) => SFX.push([name, cur + at, vol, dur]);

// 1. хук
say("d1", 0.4);
fx("creak", 0.0, 0.55);
fx("whoosh", 1.0, 0.5);
scene(S1Hook, Math.max(10, 0.4 + len("d1") + 0.4), { ovalAt: 0.4 + len("d1") * 0.66 });
// 2. голосовое
{
  const n1 = 0.4 + len("d2") + 0.3;
  fx("growl", 0.1, 0.5);
  fx("rec", 0.25, 0.6);
  say("d2", 0.4);
  fx("sent", n1 - 0.25, 0.6);
  say("n1", n1);
  scene(S2Voice, Math.max(15, n1 + len("n1") + 0.4), { cut1: 2.6, cut2: n1 - 0.1 });
}
// 3. вербовка
say("d3", 0.4);
scene(S3Recruit, Math.max(13.5, 0.4 + len("d3") + 0.5), { chatEnd: 5.2, handAt: 0.4 + len("d3") * 0.6 });
// 4. полка
{
  const n2 = 1.5;
  const d4 = n2 + len("n2") + 0.3;
  fx("drill", 0.2, 0.55);
  say("n2", n2);
  say("d4", d4);
  scene(S4Shelf, Math.max(14, d4 + len("d4") + 0.4), { drillOn: 0.2, drillOff: 1.7, fixAt: d4 + len("d4") * 0.45 });
}
// 5. охрана в 03:15
{
  const keyEnd = 2.8;
  const d5 = 3.0;
  const bedEnd = d5 + len("d5") + 0.3;
  const openAt = bedEnd + 0.2;
  const dropAt = openAt + 0.5;
  const cloudAt = openAt + 0.6;
  const n3 = openAt + 0.8;
  const fallAt = n3 + len("n3") * 0.62;
  fx("pick", 0.05, 0.7);
  say("d5", d5);
  fx("creak", openAt - 0.1, 0.5);
  fx("thud", fallAt + 0.05, 0.85);
  say("n3", n3);
  scene(S5Guard, Math.max(15.6, n3 + len("n3") + 0.8), { keyEnd, bedEnd, openAt, dropAt, cloudAt, fallAt, talkAt: n3, talkEnd: n3 + len("n3") });
}
// 6. отзыв и диван
{
  const pushAt = 0.5 + len("d6") * 0.55;
  const plateAt = 0.5 + len("d6") + 0.3;
  say("d6", 0.5);
  fx("whoosh", 0.2, 0.4);
  fx("push", pushAt, 0.8);
  scene(S6Review, Math.max(13, plateAt + 2.6), { pushAt, plateAt });
  PLATE = PLACED[5].from + plateAt;
}
const T_END = cur;
export const AVITO_FRAMES = Math.ceil(T_END * 30);
const start = (i: number) => PLACED[i].from;

const talking = (t: number) => VO.some(([k, a]) => t > a - 0.1 && t < a + len(k) + 0.1);

/* ── субтитры: 2–4 слова, капс, ключевые слова цветом ── */
type Chunk = { from: number; to: number; words: string[]; keys: string[]; color: string };
const norm = (w: string) => w.toLowerCase().replace(/[^а-яёa-z0-9-]/g, "");
const CHUNKS: Chunk[] = VO.flatMap(([k, at]) => {
  const [, dur, text, keys, color] = V[k];
  const words = text.split(/\s+/).filter((w) => w !== "—");
  const groups: string[][] = [];
  for (let i = 0; i < words.length; ) {
    const left = words.length - i;
    const n = left <= 4 ? left : left === 5 ? 3 : /[.,:?!]$/.test(words[i + 1]) ? 2 : 3;
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
  if (t >= PLATE) return null; // финальная плашка — субтитры прячем
  const c = CHUNKS.find((x) => t >= x.from && t < x.to + 0.05);
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
const NAV: [number, string][] = [
  [0, "АВИТО • СДЕЛКА ЗА 500 ₽"],
  [start(1), "СПОР ПО ТОВАРУ"],
  [start(3), "ОТРАБОТКА В ПРИХОЖЕЙ"],
  [start(4), "03:15 • ВЗЛОМ ЗАМКА"],
  [start(5), "ОТЗЫВ: 4 ИЗ 5"],
];
const Nav = ({ t }: { t: number }) => {
  const i = NAV.reduce((acc, [a], j) => (t >= a ? j : acc), 0);
  const k = ez(t, NAV[i][0], NAV[i][0] + 0.35);
  return (
    <AbsoluteFill style={{ alignItems: "center", pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: 34, display: "flex", alignItems: "center", gap: 12, fontFamily: MONT, fontWeight: 900, fontSize: 34, color: "#fff", background: "rgba(10,10,12,.86)", padding: "12px 28px", borderRadius: 999, border: "3px solid rgba(255,255,255,.16)", opacity: 0.3 + 0.7 * k, transform: `translateY(${(1 - k) * -12}px)` }}>
        <span style={{ color: "#00aaff" }}>●</span>
        {NAV[i][1]}
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

const Sound = () => (
  <>
    {/* фон с авто-дакингом −12 дБ под голосом */}
    <Audio src={staticFile("audio/avito/room.mp3")} loop volume={(f) => (talking(f / 30) ? 0.3 * 0.25 : 0.3)} />
    {SFX.map(([name, at, vol, dur], i) => (
      <Sfx key={i} at={at} name={`avito/${name}`} vol={(f) => (talking(f / 30 + at) ? (vol ?? 0.6) * 0.5 : vol ?? 0.6)} dur={dur} />
    ))}
    {VO.map(([k, at]) => (
      <Sfx key={k} at={at} name={`avito/${k}`} vol={1.15} />
    ))}
  </>
);

export const AvitoWardrobe = () => {
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
      <Subs t={t} />
    </AbsoluteFill>
  );
};
