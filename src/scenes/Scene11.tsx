import { AbsoluteFill } from "remotion";
import { ease, Finish, Grade, shake, Snow, Subtitle, Svg, useT } from "../components/fx";
import { DIMA, Hero, LERA, onGround } from "../components/Hero";
import { Landscape } from "../components/landscape";
import { Figure, Shack } from "../components/props";
import { line, Say, Sfx } from "../components/audio";

const CUES = [
  ...line(0.9, 2.08, "О, местный! Здорова!"),
  ...line(3.2, 2.5, "Дима… шерпа же сказал…"),
  ...line(6.2, 2.5, "Я помахал. И он *помахал* в ответ.", 0.3),
];

const SH = { x: 720, y: 1080, s: 0.85 };
const WIN = { x: SH.x - 67 * SH.s, y: SH.y - 74 * SH.s };

/** Сцена 11 (9 с): у домика тёмная фигура медленно машет. Дима машет в ответ. Голос рассказчика выдаёт себя. */
export const Scene11 = () => {
  const t = useT();
  const wind = 0.8;
  const { dx, dy } = shake(t, 2);
  const muffled = t > 6.0;
  const z = ease(t, 6, 9, 1.0, 1.15);
  const glow = 0.8 + 0.12 * Math.sin(t * 29);
  const dimaWave = t > 0.6 && t < 5 ? 160 + Math.sin(t * 8) * 18 : undefined;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      {/* на «Я помахал» всё глохнет */}
      <Sfx name="sfx/blizzard" vol={(f) => (f / 30 > 6 ? 0.08 : 0.5)} loop />
      <Sfx at={6} name="music/drone" vol={0.45} />
      <Say at={0.9} clip="d9" />
      <Say at={3.2} clip="l5" />
      <Say at={6.2} clip="n15" />
      <AbsoluteFill style={{ transformOrigin: "60% 50%", transform: `translate(${dx}px,${dy}px) scale(${z})` }}>
        <Grade>
          <Landscape t={t} cam={-100} wind={wind} fog={0.6} />
          <Svg>
            <Shack x={SH.x} y={SH.y} s={SH.s} lit={1} />
            <Figure x={SH.x + 170} y={SH.y + 10} s={0.62} t={t} />
            <Hero cfg={LERA} x={170} y={onGround(LERA, 1800, 0.4)} s={0.4} t={t + 2} emotion="fear" talk={t > 3.2 && t < 5.7} look={[22, -12]} blinks={[]} frost={0.7} full wind={wind} />
            <Hero cfg={DIMA} x={420} y={onGround(DIMA, 1850, 0.42)} s={0.42} t={t} emotion={t < 3 ? "smile" : "calm"} talk={t > 0.9 && t < 2.98} arm={dimaWave} look={[20, -12]} blinks={[4.4]} frost={0.7} full wind={wind} />
          </Svg>
          <Snow t={t} n={muffled ? 40 : 80} opacity={0.8} speed={muffled ? 0.4 : 1.5} wind={muffled ? 0.2 : wind} />
          <Finish vig={0.6} tint="#6f8496" tintOpacity={0.16} grain={1} />
        </Grade>
        <Svg>
          <circle cx={WIN.x} cy={WIN.y} r="110" fill="#f2c94c" opacity={0.22 * glow} />
          <rect x={WIN.x - 28} y={WIN.y - 25} width="56" height="51" fill="#e0b53e" opacity={0.85 * glow} />
        </Svg>
      </AbsoluteFill>
      <Subtitle t={t} cues={CUES} />
    </AbsoluteFill>
  );
};
