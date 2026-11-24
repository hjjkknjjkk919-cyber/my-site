import { AbsoluteFill } from "remotion";
import { ease, Finish, Grade, Snow, Subtitle, Svg, useT } from "../components/fx";
import { DIMA, Hero, onGround, STAS } from "../components/Hero";
import { Foreground, Landscape } from "../components/landscape";
import { line, Say, Sfx } from "../components/audio";

const CUES = [
  ...line(0.25, 4.5, "Идею подал Стас. Тихий такой. В кафе соль попросить стесняется."),
  ...line(4.95, 1.75, "Тихих я запоминаю лучше."),
  ...line(7.0, 2.06, "Без гида — это же контент!"),
];

/** Сцена 3 (9.3 с): Стас в полный рост с огромным рюкзаком. Дима входит в кадр. */
export const Scene03 = () => {
  const t = useT();
  const z = ease(t, 0, 4.9, 1.0, 1.1) - ease(t, 6.3, 7.0, 0, 0.1);
  const cam = ease(t, 0, 9.3, 20, -30);
  const hitch = ease(t, 0.6, 0.9, 0, -24) + ease(t, 0.9, 1.3, 0, 24);
  const dimaX = ease(t, 6.2, 7.0, 1350, 800);
  const step = t > 6.2 && t < 7.0 ? -Math.abs(Math.sin(t * 12)) * 14 : 0;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Sfx name="sfx/wind_light" vol={0.4} loop />
      <Sfx at={6.1} name="sfx/steps" vol={0.6} dur={1.2} />
      <Say at={0.25} clip="n04" />
      <Say at={4.95} clip="n05" />
      <Say at={7.0} clip="d3" />
      <Grade>
        <AbsoluteFill style={{ transformOrigin: "40% 40%", transform: `scale(${z})` }}>
          <Landscape t={t} cam={cam} wind={0.18} fog={0.06} />
          <Svg>
            <g transform={`translate(${cam * 0.8} 0)`}>
              <Hero cfg={STAS} x={400} y={onGround(STAS, 1560, 0.36) + hitch} s={0.36} t={t} look={t < 6.2 ? [-20, 6] : [18, 0]} lid={0.3} blinks={[2.2, 8.0]} frost={0.2} full wind={0.18} />
              <Hero cfg={DIMA} x={dimaX} y={onGround(DIMA, 1590, 0.36) + step} s={0.36} flip={-1} t={t + 2} emotion="smile" talk={t > 7.0 && t < 9.06} look={[10, 0]} blinks={[8.6]} frost={0.2} lightLeft={false} full wind={0.18} />
            </g>
          </Svg>
          <Foreground cam={cam * 1.2} />
          <Snow t={t} n={18} opacity={0.45} speed={0.5} wind={0.18} />
          <Finish vig={0.4} tint="#6f8496" tintOpacity={0.08} grain={0.8} />
        </AbsoluteFill>
      </Grade>
      <Subtitle t={t} cues={CUES} />
    </AbsoluteFill>
  );
};
