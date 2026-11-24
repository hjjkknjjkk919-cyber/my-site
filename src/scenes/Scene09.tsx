import { AbsoluteFill } from "remotion";
import { Finish, Grade, shake, Snow, Subtitle, Svg, useT } from "../components/fx";
import { DIMA, GENA, Hero, LERA, onGround, STAS } from "../components/Hero";
import { Landscape } from "../components/landscape";
import { CameraFrame, NoodleBrick } from "../components/props";
import { line, Say, Sfx } from "../components/audio";

const CUES = [
  ...line(0.3, 2.43, "Ставьте лайк, если вам тоже нечем дышать."),
  ...line(2.9, 3.11, "Тебе нечем дышать, потому что ты не затыкаешься."),
  ...line(6.25, 3.4, "На такой высоте дышать нечем. Гостям — тем более."),
];

/** Сцена 9 (9.8 с): вид с палки Димы на 5 800 м. Все идут в полный рост, ветер усиливается. */
export const Scene09 = () => {
  const t = useT();
  const wind = 0.45;
  const { dx, dy } = shake(t, 2.5);
  const walk = (o: number) => -Math.abs(Math.sin(t * 3 + o)) * 12;
  const gS = 0.29;
  const gY = onGround(GENA, 1360, gS);
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Sfx name="sfx/wind_strong" vol={0.45} loop />
      <Sfx name="sfx/breath" vol={0.35} />
      <Sfx name="sfx/steps" vol={0.3} loop />
      <Say at={0.3} clip="d8" />
      <Say at={2.9} clip="l3" />
      <Say at={6.25} clip="n12" />
      <Grade>
        <AbsoluteFill style={{ transform: `translate(${dx}px,${dy}px) scale(1.05)` }}>
          <Landscape t={t} cam={-60} wind={wind} fog={0.3} />
          <Svg>
            <Hero cfg={STAS} x={690} y={onGround(STAS, 1230, 0.2) + walk(3)} s={0.2} t={t + 0.4} look={[0, 10]} lid={0.45} blinks={[4.4]} frost={0.45} full wind={wind} />
            <Hero cfg={GENA} x={840} y={gY + walk(1)} s={gS} flip={-1} t={t + 1} talk look={[10, 8]} lid={0.3} blinks={[2.8]} frost={0.45} lightLeft={false} full wind={wind} />
            <NoodleBrick x={840 - 40} y={gY + 150 + walk(1)} s={0.42} rot={-12} />
            <Hero cfg={LERA} x={300} y={onGround(LERA, 1390, 0.27) + walk(2)} s={0.27} t={t + 2} emotion="skeptic" talk={t > 2.9 && t < 6.01} look={[18, 0]} lid={0.35} blinks={[1.4, 7.6]} frost={0.45} full wind={wind} />
            <Hero cfg={DIMA} x={560} y={onGround(DIMA, 1560, 0.35) + walk(0)} s={0.35} t={t} emotion={t < 2.8 ? "smile" : "calm"} talk={t > 0.3 && t < 2.73} look={t < 2.8 ? [0, -4] : [-18, 2]} blinks={[4.2]} frost={0.45} full wind={wind} />
          </Svg>
          <Snow t={t} n={44} opacity={0.65} speed={1} wind={wind} />
          <Finish vig={0.45} tint="#6f8496" tintOpacity={0.12} grain={0.9} />
        </AbsoluteFill>
      </Grade>
      <CameraFrame t={t + 52} label="5 800 м" />
      <Subtitle t={t} cues={CUES} />
    </AbsoluteFill>
  );
};
