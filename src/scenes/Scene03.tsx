import { AbsoluteFill } from "remotion";
import { ease, Finish, Grade, Snow, Subtitle, Svg, useT } from "../components/fx";
import { DIMA, Hero, onGround, STAS } from "../components/Hero";
import { Foreground, Landscape } from "../components/landscape";
import { lip, Sfx, speaking, timeline, Voices } from "../components/audio";

const TL = timeline(0, [
  { clip: "n04", text: "Идею подал Стас. Тихий такой. В кафе соль попросить стесняется.", gap: 0.3 },
  { clip: "n05", text: "Тихих я запоминаю лучше.", gap: 0.6 },
  { clip: "d3", text: "Без гида — это же контент!", gap: 1.4 },
]);
export const DUR = TL.end + 0.5;
const IN = TL.at.n05.to + 0.1;

/** Сцена 3: Стас в полный рост с огромным рюкзаком. Дима входит в кадр. */
export const Scene03 = () => {
  const t = useT();
  const z = ease(t, 0, TL.at.n05.to, 1.0, 1.1) - ease(t, IN, TL.at.d3.from, 0, 0.1);
  const cam = ease(t, 0, DUR, 20, -30);
  const hitch = ease(t, 0.6, 0.9, 0, -24) + ease(t, 0.9, 1.3, 0, 24);
  const dimaX = ease(t, IN, TL.at.d3.from, 1350, 800);
  const step = t > IN && t < TL.at.d3.from ? -Math.abs(Math.sin(t * 12)) * 14 : 0;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Sfx name="sfx/wind_light" vol={0.4} loop duck={TL} />
      <Sfx at={IN} name="sfx/steps" vol={0.6} dur={1.3} duck={TL} />
      <Voices tl={TL} />
      <Grade>
        <AbsoluteFill style={{ transformOrigin: "40% 40%", transform: `scale(${z})` }}>
          <Landscape t={t} cam={cam} wind={0.18} fog={0.06} />
          <Svg>
            <g transform={`translate(${cam * 0.8} 0)`}>
              <Hero cfg={STAS} x={400} y={onGround(STAS, 1560, 0.36) + hitch} s={0.36} t={t} look={t < IN ? [-20, 6] : [18, 0]} lid={0.3} blinks={[2.2, 8.0]} frost={0.2} full wind={0.18} />
              <Hero cfg={DIMA} x={dimaX} y={onGround(DIMA, 1590, 0.36) + step} s={0.36} flip={-1} t={t + 2} walk={t > IN && t < TL.at.d3.from ? t : undefined} emotion="smile" mouth={lip(TL, ["d3"], t)} look={[10, 0]} blinks={[DUR - 0.6]} frost={0.2} lightLeft={false} full wind={0.18} />
            </g>
          </Svg>
          <Foreground cam={cam * 1.2} />
          <Snow t={t} n={18} opacity={0.45} speed={0.5} wind={0.18} />
          <Finish vig={0.4} tint="#6f8496" tintOpacity={0.08} grain={0.8} />
        </AbsoluteFill>
      </Grade>
      <Subtitle t={t} cues={TL.cues} />
    </AbsoluteFill>
  );
};
