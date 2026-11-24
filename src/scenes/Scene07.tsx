import { AbsoluteFill } from "remotion";
import { ease, Finish, Grade, shake, Snow, Subtitle, Svg, useT } from "../components/fx";
import { DIMA, GENA, Hero, LERA, onGround, STAS } from "../components/Hero";
import { Landscape } from "../components/landscape";
import { Comment, Live, Stove, StoveFlame } from "../components/props";
import { Sfx, speaking, timeline, Voices } from "../components/audio";

const TL = timeline(0, [
  { clip: "g2", text: "Шеф Гена. Блюдо дня — лапша.", gap: 0.4 },
  { clip: "d7", text: "Пишут: «вы там сдохнете». «Слабо без гида?» Видите — верят в нас.", gap: 0.9 },
  { clip: "l2", text: "Это не вера, Дим.", gap: 0.6 },
  { clip: "n09", text: "Лапша пахла на весь склон. Я… я тоже люблю лапшу.", gap: 1.4 },
]);
export const DUR = TL.end + 0.5;

// эфир от первого лица: от чуть раньше слов Димы до чуть позже
const LIVE_FROM = TL.at.d7.from - 0.5;
const LIVE_TO = TL.at.d7.to + 0.4;
const d7 = TL.at.d7.from;
const COMMENTS: Comment[] = [
  { at: LIVE_FROM - 2, nick: "kirill_09", text: "где гид??" },
  { at: LIVE_FROM - 1, nick: "masha.k", text: "лайк из тёплой кровати" },
  { at: d7 + 0.5, nick: "dark_hiker", text: "вы там сдохнете" },
  { at: d7 + 1.9, nick: "gosha_pro", text: "слабо без гида?" },
  { at: d7 + 3.2, nick: "lena_lena", text: "Дима го до вершины" },
  { at: d7 + 4.2, nick: "anon_777", text: "кто там сзади стоит?" },
];

/** Сцена 7: вечер у примуса. Гена варит, Дима ведёт эфир (экран телефона от первого лица), все смеются. Стас смотрит в темноту. */
export const Scene07 = () => {
  const t = useT();
  const live = t >= LIVE_FROM && t < LIVE_TO;
  const laugh = t > TL.at.l2.to && t < TL.at.l2.to + 1.6;
  // на словах рассказчика плавный наезд на Стаса у края; без сдвига, поэтому края кадра всегда заполнены
  const z = ease(t, TL.at.n09.from - 0.5, DUR, 1.0, 1.35);
  const { dx, dy } = shake(t, live ? 2 : 0);
  const gArm = -40 + Math.sin(t * 3) * 12;
  const scene = (
    <Grade>
      <Landscape t={t} wind={0.15} fog={0.3} camp />
      <Svg>
        <rect width={1080} height={1920} fill="#0c1520" opacity="0.5" />
        <Hero cfg={GENA} x={250} y={onGround(GENA, 1520, 0.3)} s={0.3} t={t} emotion={laugh ? "laugh" : "smile"} talk={speaking(TL, "g2", t)} arm={gArm} look={[10, 14]} blinks={[5.2, 13.1]} frost={0.25} full wind={0.1} />
        <Hero cfg={DIMA} x={520} y={onGround(DIMA, 1560, 0.31)} s={0.31} t={t + 1} emotion={laugh ? "laugh" : "smile"} talk={speaking(TL, "d7", t)} arm={-35} look={live ? [0, 0] : [14, 0]} blinks={[3.1, 14.2]} frost={0.25} full wind={0.1} />
        <Hero cfg={LERA} x={760} y={onGround(LERA, 1550, 0.29)} s={0.29} flip={-1} t={t + 2} emotion={laugh ? "laugh" : "skeptic"} talk={speaking(TL, "l2", t)} look={[16, 4]} blinks={[2.4, 8.8]} frost={0.25} lightLeft={false} full wind={0.1} />
        <Hero cfg={STAS} x={1000} y={onGround(STAS, 1500, 0.28)} s={0.28} flip={-1} t={t + 0.5} look={[-22, -6]} lid={0.25} blinks={[6.6, 12.4]} frost={0.25} lightLeft={false} full wind={0.1} />
        <Stove x={420} y={1650} s={0.6} />
      </Svg>
      <Snow t={t} n={14} opacity={0.35} speed={0.3} wind={0.1} />
      <Finish vig={0.75} tint="#1b3350" tintOpacity={0.25} grain={0.9} />
    </Grade>
  );
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Sfx name="sfx/primus" vol={0.45} loop />
      <Sfx name="sfx/wind_light" vol={0.25} loop />
      <Sfx at={TL.at.l2.to} name="sfx/laugh" vol={0.5} />
      <Sfx at={TL.at.n09.from - 0.5} name="music/drone" vol={0.25} />
      <Voices tl={TL} />
      <AbsoluteFill style={{ transformOrigin: "93% 52%", transform: `translate(${dx}px,${dy}px) scale(${z})` }}>
        {scene}
        {/* цветной огонёк примуса поверх серой палитры */}
        <Svg>
          <StoveFlame x={420} y={1650} s={0.6} t={t} />
        </Svg>
        <AbsoluteFill style={{ mixBlendMode: "screen", background: "radial-gradient(18% 10% at 39% 82%,rgba(90,160,255,.35) 0%,rgba(0,0,0,0) 100%)" }} />
      </AbsoluteFill>
      {live && <Live t={t} comments={COMMENTS} />}
      <Subtitle t={t} cues={TL.cues} />
    </AbsoluteFill>
  );
};
