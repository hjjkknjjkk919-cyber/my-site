import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { clamp, ease, Finish, Glitch, Grade, Snow, Svg, useT } from "../components/fx";
import { Landscape } from "../components/landscape";
import { ManiacFace } from "../components/maniac";
import { CameraFrame, Figure, Shack } from "../components/props";
import { Sfx } from "../components/audio";

/** Сцена 12 (4.7 с): зум камеры Димы. Из белой метели проступает лицо. Тишина. */
export const Scene12 = () => {
  const t = useT();
  const f = useCurrentFrame();
  const face = t > 1.5;
  // цифровой зум ступеньками
  const z = t < 0.5 ? 1 : t < 1.0 ? 2.2 : 4;
  const jx = (random(`jx${f}`) - 0.5) * 10;
  const jy = (random(`jy${f}`) - 0.5) * 8;
  const reveal = ease(t, 1.5, 3.0, 0, 1);
  return (
    <AbsoluteFill style={{ background: "#e9edf0", overflow: "hidden" }}>
      <Sfx name="sfx/zoom" vol={0.8} />
      <Sfx at={0.6} name="sfx/zoom" vol={0.7} dur={1.2} />
      <Sfx name="sfx/blizzard" vol={(fr) => (fr / 30 > 1.5 ? 0.04 : 0.2)} loop />
      {!face ? (
        <AbsoluteFill style={{ transformOrigin: "80% 54%", transform: `scale(${z})`, filter: "blur(2px)" }}>
          <Grade>
            <Landscape t={t} cam={-100} wind={0.8} fog={0.75} />
            <Svg>
              <Shack x={720} y={1080} s={0.85} lit={1} />
              <Figure x={890} y={1090} s={0.62} t={t} wave={0.4} />
            </Svg>
            <Snow t={t} n={90} opacity={0.85} speed={1.5} wind={0.8} />
          </Grade>
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={{ transform: `translate(${jx}px,${jy}px) scale(${1 + 0.04 * reveal})`, filter: `contrast(1.15) saturate(.35) blur(${(1 - reveal) * 6}px)` }}>
          <ManiacFace t={t} />
          {/* белая пелена метели отступает */}
          <AbsoluteFill style={{ background: "#e9edf0", opacity: 0.85 * (1 - reveal) }} />
          <Snow t={t} n={60} opacity={0.7} speed={1.2} wind={0.6} />
          <Finish vig={0.6} tint="#6f8496" tintOpacity={0.1} grain={1.6} />
        </AbsoluteFill>
      )}
      <CameraFrame t={t + 41} label={`ZOOM ×${face ? 16 : Math.round(z * 2)}`} />
      {t > 4.45 && <Glitch amount={clamp((t - 4.45) / 0.1)} />}
    </AbsoluteFill>
  );
};
