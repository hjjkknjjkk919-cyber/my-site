import { AbsoluteFill } from "remotion";
import { ease, Finish, Grade, shake, Snow, Subtitle, Svg, useT } from "../components/fx";
import { DIMA, Hero, LERA, onGround } from "../components/Hero";
import { Landscape } from "../components/landscape";
import { Figure, Shack } from "../components/props";
import { Sfx, speaking, timeline, Voices } from "../components/audio";

const TL = timeline(0, [
  { clip: "d9", text: "О, местный! Здорова!", gap: 0.9 },
  { clip: "l5", text: "Дима… шерпа же сказал…", gap: 0.5 },
  { clip: "n15", text: "Я помахал. И он *помахал* в ответ.", gap: 1.0, step: 0.3 },
]);
export const DUR = TL.end + 0.6;
const MUTE = TL.at.n15.from - 0.2;

const SH = { x: 720, y: 1080, s: 0.85 };
const WIN = { x: SH.x - 67 * SH.s, y: SH.y - 74 * SH.s };

/** Сцена 11: у домика тёмная фигура медленно машет. Дима машет в ответ. Голос рассказчика выдаёт себя. */
export const Scene11 = () => {
  const t = useT();
  const wind = 0.8;
  const { dx, dy } = shake(t, 2);
  const muffled = t > MUTE;
  const z = ease(t, MUTE, DUR, 1.0, 1.15);
  const glow = 0.8 + 0.12 * Math.sin(t * 29);
  const dimaWave = t > TL.at.d9.from - 0.3 && t < TL.at.l5.to ? 160 + Math.sin(t * 8) * 18 : undefined;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      {/* на «Я помахал» всё глохнет */}
      <Sfx name="sfx/blizzard" vol={(f) => (f / 30 > MUTE ? 0.08 : 0.5)} loop />
      <Sfx at={MUTE} name="music/drone" vol={0.45} />
      <Voices tl={TL} />
      <AbsoluteFill style={{ transformOrigin: "60% 50%", transform: `translate(${dx}px,${dy}px) scale(${z})` }}>
        <Grade>
          <Landscape t={t} cam={-100} wind={wind} fog={0.6} />
          <Svg>
            <Shack x={SH.x} y={SH.y} s={SH.s} lit={1} />
            <Figure x={SH.x + 170} y={SH.y + 10} s={0.62} t={t} />
            <Hero cfg={LERA} x={170} y={onGround(LERA, 1800, 0.4)} s={0.4} t={t + 2} emotion="fear" talk={speaking(TL, "l5", t)} look={[22, -12]} blinks={[]} frost={0.7} full wind={wind} />
            <Hero cfg={DIMA} x={420} y={onGround(DIMA, 1850, 0.42)} s={0.42} t={t} emotion={t < TL.at.d9.to ? "smile" : "calm"} talk={speaking(TL, "d9", t)} arm={dimaWave} look={[20, -12]} blinks={[4.4]} frost={0.7} full wind={wind} />
          </Svg>
          <Snow t={t} n={muffled ? 40 : 80} opacity={0.8} speed={muffled ? 0.4 : 1.5} wind={muffled ? 0.2 : wind} />
          <Finish vig={0.6} tint="#6f8496" tintOpacity={0.16} grain={1} />
        </Grade>
        <Svg>
          <circle cx={WIN.x} cy={WIN.y} r="110" fill="#f2c94c" opacity={0.22 * glow} />
          <rect x={WIN.x - 28} y={WIN.y - 25} width="56" height="51" fill="#e0b53e" opacity={0.85 * glow} />
        </Svg>
      </AbsoluteFill>
      <Subtitle t={t} cues={TL.cues} />
    </AbsoluteFill>
  );
};
