import React, { useMemo } from "react";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { useAudioData } from "@remotion/media-utils";
import { Sfx } from "../../components/audio";
import { DurCtx, ez, MONT } from "../../pelmeni/kit";
import { ORANGE, REDK } from "../AvitoWardrobe/props";
import { MouthCtx } from "../AvitoWardrobe/rig";
import { speechEnergy } from "../AvitoWardrobe/useLipSync";
import D from "./durs.json";
import { AmpCtx, type Amp, BannerAd, S1Hook, S2Council, S3Shift, S4Quest, S5Door, S6Payoff } from "./scenes";

const BANNER_LEN = 6.0;
const STARE = 2.8;
type Who = keyof Amp;
type LineId = keyof typeof D;
/** Субтитры: мат в тексте закрыт одной звёздочкой (в озвучке — без цензуры). */
const LINES: Record<LineId, { who: Who; text: string; keys: string[]; color: string }> = {
  l01: { who: "dima", text: "Купил, бл*дь, у Валеры диван с сюрпризом. Сюрприз — мама моего демона. И через пять минут у меня в хате начался полный п*здец.", keys: ["сюрпризом.", "мама", "п*здец."], color: ORANGE },
  l02: { who: "mom", text: "Триста лет балбесу, а он всё по шкафам шкерится! Полка кривая, свет жжёшь, за хату не платишь — п*здуй работать!", keys: ["триста", "кривая,", "п*здуй", "работать!"], color: REDK },
  l03: { who: "nuance", text: "Мам, бл*дь, ну не при Диме же! Я древнее зло, какой нах*р «работать»?", keys: ["диме", "древнее", "зло,"], color: ORANGE },
  l04: { who: "dima", text: "Не-не, продолжайте. Коммуналку теперь на троих пилим.", keys: ["на", "троих"], color: ORANGE },
  l05: { who: "dima", text: "Короче, собрали князя тьмы как в первый класс: бутерброд в фольгу и вакансию в хоррор-квест.", keys: ["первый", "класс:", "хоррор-квест."], color: ORANGE },
  l05b: { who: "dima", text: "Правда, туториал «как пугать людей» у него не грузился — заблокировано. Ну я включил VPN — и князь тьмы снова в теме.", keys: ["заблокировано.", "vpn"], color: "#7CFFB2" },
  l06: { who: "dima", text: "Слышь, инфернальный, только хату не позорь.", keys: ["хату", "позорь."], color: ORANGE },
  l07: { who: "nuance", text: "Дима, расслабься. У меня три века стажа, они там обоср*тся.", keys: ["три", "века", "обоср*тся."], color: ORANGE },
  l08: { who: "kid", text: "Чё за х*йня, пацаны? Смотри, какой-то дед в колготках сутулится. Ставлю одну звезду.", keys: ["колготках", "одну", "звезду."], color: REDK },
  l09: { who: "nuance", text: "Они назвали меня сутулой шваброй, Дима... Я разучился пугать людей, бл*дь.", keys: ["шваброй,", "разучился"], color: ORANGE },
  l10: { who: "admin", text: "Б-боже... Вот это психология! Вы приняты, аванс сразу!", keys: ["психология!", "аванс"], color: "#7fb3d5" },
  l11: { who: "dima", text: "Да я вообще-то за этим долбо*бом зашёл.", keys: ["долбо*бом"], color: ORANGE },
  l12: { who: "dima", text: "Короче, за свет закрыл я. Валере ставлю пять звёзд. Шесть — если заберёт маму.", keys: ["пять", "шесть", "маму."], color: ORANGE },
};
const IDS = Object.keys(LINES) as LineId[];
const src = (id: string) => staticFile(`audio/nuans2/${id}.mp3`);

type Placed = { Scene: React.FC<any>; from: number; to: number; props: object; amb: string; nav: string };
type TL = { placed: Placed[]; vo: [LineId, number][]; sfx: [string, number, number?][]; punch: number[]; shake: [number, number][] };

const build = (preG: number, stare: number): TL & { pre: number; total: number } => {
  const placed: Placed[] = [];
  const vo: [LineId, number][] = [];
  const sfx: [string, number, number?][] = [];
  const punch: number[] = [];
  const shake: [number, number][] = [];
  let cur = 0;
  const say = (id: LineId, at: number) => {
    vo.push([id, cur + at]);
    return at + D[id];
  };
  const fx = (n: string, at: number, vol?: number) => sfx.push([n, cur + at, vol]);
  const scene = (Scene: React.FC<any>, len: number, props: object, amb: string, nav: string) => {
    placed.push({ Scene, from: cur, to: cur + len, props, amb, nav });
    cur += len;
  };
  // 1. хук
  {
    const e = say("l01", 0.2);
    const momAt = 0.2 + D.l01 * 0.42;
    fx("springs", 0.35);
    fx("thud", momAt);
    punch.push(cur + momAt + 0.1);
    scene(S1Hook, e + 0.6 + preG, { momAt }, "room", "ДИВАН ОТ ВАЛЕРЫ ПЕРЕКУПА");
  }
  // 2. семейный совет: мама → Нюанс сразу, без паузы → квитанция в руке Димы и глоток
  {
    const e2 = say("l02", 0.1);
    shake.push([cur + 0.1, cur + e2]);
    const s3 = e2 + 0.1;
    const e3 = say("l03", s3);
    punch.push(cur + s3 + 0.05);
    const s4 = e3 + preG + 0.8;
    const showAt = e3 + preG;
    fx("slap", showAt + 0.1);
    const e4 = say("l04", s4);
    const sipAt = e4 + 0.1;
    fx("slurp", sipAt + 0.3);
    punch.push(cur + s4 + D.l04 * 0.55);
    scene(S2Council, sipAt + 1.2 + preG, { cutB: s3 - 0.05, cutC: showAt - 0.1, slapAt: showAt + 0.1, sipAt }, "room", "СЕМЕЙНЫЙ СОВЕТ • КОММУНАЛКА ÷3");
  }
  // 3. сборы → дверь → БАННЕР в центре ролика → «три века стажа»
  let pre = 0;
  {
    const e5 = say("l05", 0.1);
    fx("foil", 1.2);
    const s6 = e5 + preG;
    const e6 = say("l06", s6);
    scene(S3Shift, e6 + 1.2 + preG, { vpnFrom: e5 + 0.05, blockAt: 0, toggleAt: 0, doorFrom: e5 + 0.05 }, "room", "ПЕРВЫЙ РАБОЧИЙ ДЕНЬ");
    pre = cur;
    scene(BannerAd, BANNER_LEN, {}, "none", "");
    const e7 = say("l07", 0.15);
    punch.push(cur + e7 - 1.3);
    fx("lock", e7 + 0.1);
    scene(S3Shift, e7 + 0.45, { vpnFrom: 0, blockAt: 0, toggleAt: 0, doorFrom: 0 }, "room", "ПЕРВЫЙ РАБОЧИЙ ДЕНЬ");
  }
  // 4. квест
  {
    fx("roar", 0.05, 0.3);
    shake.push([cur + 0.05, cur + 1.35]);
    const s8 = 1.4;
    const e8 = say("l08", s8);
    const flashes = [0.4, 0.9, 1.4, 2.2, 2.9].map((x) => s8 + x);
    fx("shutter", s8 + 0.4);
    punch.push(cur + e8 - 1.4);
    const s9 = e8 + 0.15;
    const e9 = say("l09", s9);
    scene(S4Quest, e9 + 0.3, { roarEnd: 1.35, kidsFrom: 1.35, starAt: e8 - 1.2, cornerFrom: e8 + 0.05, flashes }, "quest", "ХОРРОР-КВЕСТ «СКЛЕП»");
  }
  // 5. дверь и взгляд
  {
    const stareEnd = 0.5 + stare;
    fx("irondoor", 0, 0.2);
    fx("subboom", 1.0, 0.25);
    fx("teens", stareEnd, 0.18);
    const s10 = stareEnd + 0.6;
    const e10 = say("l10", s10);
    const giveAt = s10 + D.l10 * 0.55;
    fx("money", giveAt);
    const s11 = e10 + 0.15;
    const e11 = say("l11", s11);
    punch.push(cur + s11 + 0.9);
    scene(S5Door, e11 + 0.2, { stareEnd, fleeAt: stareEnd, giveAt }, "quest", "КОНЕЦ СМЕНЫ");
  }
  // 6. панчлайн и пуш (+0.6 с на чтение пуша)
  {
    const e12 = say("l12", 0.3);
    fx("dishes", 0, 0.1);
    const reviewAt = 0.3 + D.l12 * 0.5;
    fx("sent", reviewAt);
    punch.push(cur + e12 - 1.8);
    const pushAt = e12 + 0.1;
    fx("push", pushAt, 0.2);
    scene(S6Payoff, pushAt + 1.0 + 0.6, { reviewAt, pushAt }, "room", "ОТЗЫВ: 5 ИЗ 5");
  }
  return { placed, vo, sfx, punch, shake, pre, total: cur };
};

/** Баннер — ровно в центре: досчитываем паузы до/после так, чтобы до и после баннера было поровну. */
const plan = () => {
  const p1 = build(0.25, STARE);
  const post = p1.total - p1.pre - BANNER_LEN;
  const diff = post - p1.pre;
  return diff > 0 ? build(0.25 + diff / 6, STARE) : build(0.25, STARE - diff);
};
const TLINE = plan();
export const NUANS2_FRAMES = Math.round(TLINE.total * 30);
export const BANNER_AT = TLINE.pre;

/* ── субтитры: 2–4 слова, в безопасной зоне (y < 1495, x < 925) ── */
type Chunk = { from: number; to: number; words: string[]; keys: string[]; color: string };
const norm = (w: string) => w.toLowerCase().replace(/[«»"]/g, "");
const chunks = (vo: [LineId, number][]): Chunk[] =>
  vo.flatMap(([id, at]) => {
    const { text, keys, color } = LINES[id];
    const words = text.split(/\s+/).filter((w) => w !== "—");
    const groups: string[][] = [];
    for (let j = 0; j < words.length; ) {
      const left = words.length - j;
      const n = left <= 4 ? left : left === 5 ? 3 : /[.,:?!…]$/.test(words[j + 1]) ? 2 : 3;
      groups.push(words.slice(j, j + n));
      j += n;
    }
    const total = groups.reduce((s, g) => s + g.join(" ").length, 0);
    let t0 = at;
    return groups.map((g) => {
      const len = (D[id] * g.join(" ").length) / total;
      const c = { from: t0, to: t0 + len, words: g, keys, color };
      t0 += len;
      return c;
    });
  });

const Subs = ({ t, list }: { t: number; list: Chunk[] }) => {
  const c = list.find((x) => t >= x.from && t < x.to + 0.05);
  if (!c) return null;
  const k = ez(t, c.from, c.from + 0.12);
  return (
    <div style={{ position: "absolute", left: 70, top: 1300, width: 800, textAlign: "center", fontFamily: MONT, fontWeight: 900, fontSize: 64, lineHeight: 1.08, textTransform: "uppercase", color: "#fff", WebkitTextStroke: "13px #000", paintOrder: "stroke fill", transform: `scale(${0.9 + 0.1 * k})`, opacity: k }}>
      {c.words.map((w, i) => (
        <span key={i} style={{ color: c.keys.includes(norm(w)) ? c.color : "#fff" }}>
          {w}
          {i < c.words.length - 1 ? " " : ""}
        </span>
      ))}
    </div>
  );
};

const Nav = ({ t, placed }: { t: number; placed: Placed[] }) => {
  const i = placed.reduce((acc, p, j) => (t >= p.from ? j : acc), 0);
  if (!placed[i].nav) return null;
  const k = ez(t, placed[i].from, placed[i].from + 0.35);
  return (
    <div style={{ position: "absolute", left: 50, top: 60, maxWidth: 830, display: "flex", alignItems: "center", gap: 12, fontFamily: MONT, fontWeight: 900, fontSize: 32, color: "#fff", background: "rgba(10,10,12,.86)", padding: "12px 26px", borderRadius: 999, border: "3px solid rgba(255,255,255,.16)", opacity: 0.3 + 0.7 * k }}>
      <span style={{ color: "#00aaff" }}>●</span>
      {placed[i].nav}
    </div>
  );
};

const Film = ({ f }: { f: number }) => (
  <>
    <AbsoluteFill style={{ mixBlendMode: "overlay", opacity: 0.12, pointerEvents: "none" }}>
      <svg width={1080} height={1920}>
        <filter id="n2-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={1} seed={f % 10} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width={1080} height={1920} filter="url(#n2-grain)" />
      </svg>
    </AbsoluteFill>
    <AbsoluteFill style={{ background: "radial-gradient(85% 62% at 50% 46%, rgba(0,0,0,0) 55%, rgba(0,0,0,.55) 100%)", pointerEvents: "none" }} />
  </>
);

export const NuansEp2 = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const tl = TLINE;
  const subs = useMemo(() => chunks(tl.vo), [tl]);
  const audio = IDS.map((id) => useAudioData(src(id)));
  const talking = (tt: number) => (tt >= BANNER_AT && tt < BANNER_AT + BANNER_LEN) || tl.vo.some(([id, a]) => tt > a - 0.1 && tt < a + D[id] + 0.1);
  const amp: Amp = { dima: 0, nuance: 0, mom: 0, kid: 0, admin: 0 };
  for (const [id, a] of tl.vo) {
    if (t >= a && t < a + D[id]) amp[LINES[id].who] = speechEnergy(audio[IDS.indexOf(id)], f - Math.round(a * 30), 30);
  }
  // punch-in 1.0 → 1.12 за 4 кадра на панчлайнах, тряска ±4px на крике мамы и рёве
  const p = tl.punch.reduce((m, at) => Math.max(m, t < at ? 0 : t < at + 4 / 30 ? (t - at) * 7.5 : t < at + 1.0 ? 1 : 1 - ez(t, at + 1.0, at + 1.3)), 0);
  const sh = tl.shake.some(([a, b]) => t >= a && t < b) ? 4 : 0;
  const cam = `translate(${Math.sin(t * 53) * sh}px, ${Math.cos(t * 41) * sh}px) scale(${1 + 0.12 * p})`;
  const vol = (base: number, at = 0) => (fr: number) => (talking(fr / 30 + at) ? base * 0.5 : base);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {tl.placed.filter((s) => s.amb !== "none").map((s, i) => (
        <Sequence key={`a${i}`} from={Math.round(s.from * 30)} durationInFrames={Math.round(s.to * 30) - Math.round(s.from * 30)} layout="none">
          <Audio src={staticFile(`audio/nuans2/sfx_${s.amb}.mp3`)} loop volume={vol(0.08, s.from)} />
        </Sequence>
      ))}
      {tl.sfx.map(([n, at, v], i) => (
        <Sfx key={i} at={at} name={`nuans2/sfx_${n}`} vol={vol(v ?? 0.125, at)} />
      ))}
      {tl.vo.map(([id, at]) => (
        <Sfx key={id} at={at} name={`nuans2/${id}`} vol={1} />
      ))}
      <AbsoluteFill style={{ transform: cam, transformOrigin: "540px 900px" }}>
        <AmpCtx.Provider value={amp}>
          <MouthCtx.Provider value={{ dima: amp.dima, nuance: 0 }}>
            {tl.placed.map(({ Scene, from, to, props }, i) => (
              <Sequence key={i} from={Math.round(from * 30)} durationInFrames={Math.round(to * 30) - Math.round(from * 30)}>
                <DurCtx.Provider value={to - from}>
                  <Scene {...props} />
                </DurCtx.Provider>
              </Sequence>
            ))}
          </MouthCtx.Provider>
        </AmpCtx.Provider>
      </AbsoluteFill>
      <Film f={f} />
      <Nav t={t} placed={tl.placed} />
      <Subs t={t} list={subs} />
    </AbsoluteFill>
  );
};
