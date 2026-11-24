import { AbsoluteFill } from "remotion";
import { ease, Finish, Grade, Snow, Subtitle, Svg, useT } from "../components/fx";
import { DIMA, Hero, LERA, onGround } from "../components/Hero";
import { Foreground, Landscape } from "../components/landscape";
import { line, Say, Sfx } from "../components/audio";

const CUES = [
  ...line(0.25, 2.88, "Я пошла, только чтобы потом вас опознать."),
  ...line(3.35, 0.73, "Это вырежем."),
  ...line(4.4, 4.3, "Лера. Умная. С умными… с умными сложнее."),
];

/** Сцена 4 (8.9 с): Лера и Дима в полный рост. Лера сухо, Дима отмахивается. Рассказчик о Лере. */
export const Scene04 = () => {
  const t = useT();
  // на словах рассказчика камера медленно подъезжает к Лере
  const z = ease(t, 4.2, 8.9, 1.0, 1.22);
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Sfx name="sfx/wind_light" vol={0.4} loop />
      <Say at={0.25} clip="l1" />
      <Say at={3.35} clip="d4" />
      <Say at={4.4} clip="n06" />
      <Grade>
        <AbsoluteFill style={{ transformOrigin: "32% 38%", transform: `scale(${z})` }}>
          <Landscape t={t} cam={-40} wind={0.2} fog={0.08} camp />
          <Svg>
            <Hero cfg={LERA} x={330} y={onGround(LERA, 1560, 0.4)} s={0.4} t={t} emotion="skeptic" talk={t > 0.25 && t < 3.13} look={t < 3.3 ? [18, 2] : [4, 0]} lid={0.4} blinks={[3.6, 7.4]} frost={0.2} full wind={0.2} />
            <Hero cfg={DIMA} x={790} y={onGround(DIMA, 1590, 0.4)} s={0.4} flip={-1} t={t + 1} emotion={t < 3.3 ? "calm" : "smile"} talk={t > 3.35 && t < 4.08} look={[16, 0]} arm={t > 3.3 && t < 4.6 ? 150 + Math.sin(t * 8) * 15 : undefined} blinks={[1.6, 6.6]} frost={0.2} lightLeft={false} full wind={0.2} />
          </Svg>
          <Foreground cam={-50} />
          <Snow t={t} n={16} opacity={0.45} speed={0.5} wind={0.2} />
          <Finish vig={0.45} tint="#6f8496" tintOpacity={0.08} grain={0.8} />
        </AbsoluteFill>
      </Grade>
      <Subtitle t={t} cues={CUES} />
    </AbsoluteFill>
  );
};
