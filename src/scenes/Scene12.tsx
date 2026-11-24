import { AbsoluteFill, Easing, interpolate } from "remotion";
import { clamp, ease, Finish, Glitch, Grade, Snow, Svg, useT } from "../components/fx";
import { Landscape } from "../components/landscape";
import { ManiacFace } from "../components/maniac";
import { CameraFrame, Figure, Shack } from "../components/props";
import { Sfx } from "../components/audio";

export const DUR = 5.5;
// голова фигуры у домика — точка, куда едет зум
const HEAD = { x: 720 + 170, y: 1090 - 330 * 0.62 };

/** Сцена 12: один плавный медленный зум камеры Димы на фигуру; из белой метели проступает лицо. Тишина. */
export const Scene12 = () => {
  const t = useT();
  // как зум настоящей камеры: плавный разгон и плавная остановка, без ступенек и тряски
  const z = interpolate(t, [0, 3.2], [1, 9], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.4, 0, 0.3, 1) });
  // лицо проступает поверх приближающейся фигуры и продолжает медленно приближаться
  const reveal = ease(t, 2.2, 3.6, 0, 1);
  const faceScale = interpolate(t, [2.2, DUR], [0.55, 1.08], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.3, 0, 0.3, 1) });
  return (
    <AbsoluteFill style={{ background: "#e9edf0", overflow: "hidden" }}>
      {/* гул лезет вверх и обрывается в мёртвую тишину, когда проступает лицо */}
      <Sfx name="sfx/zoom" vol={0.6} dur={2.4} />
      <Sfx name="sfx/riser" vol={0.9} dur={2.4} />
      <Sfx name="sfx/blizzard" vol={0.2} dur={2.4} loop />
      <Sfx at={2.4} name="sfx/boom" vol={0.6} />
      <AbsoluteFill style={{ transformOrigin: `${HEAD.x}px ${HEAD.y}px`, transform: `scale(${z})`, filter: `blur(${1 + reveal * 4}px)`, opacity: 1 - reveal }}>
        <Grade>
          <Landscape t={t} cam={-100} wind={0.8} fog={0.75} />
          <Svg>
            <Shack x={720} y={1080} s={0.85} lit={1} />
            <Figure x={890} y={1090} s={0.62} t={t} wave={0.4} />
          </Svg>
        </Grade>
      </AbsoluteFill>
      {reveal > 0 && (
        <AbsoluteFill style={{ opacity: reveal, transform: `scale(${faceScale})`, filter: `contrast(1.15) saturate(.35) blur(${(1 - reveal) * 5}px)` }}>
          <ManiacFace t={t} />
        </AbsoluteFill>
      )}
      {/* белая пелена метели постепенно отступает */}
      <AbsoluteFill style={{ background: "#e9edf0", opacity: 0.55 * (1 - reveal) + 0.15 }} />
      <Snow t={t} n={70} opacity={0.75} speed={1.2} wind={0.7} />
      <Finish vig={0.55} tint="#6f8496" tintOpacity={0.1} grain={1.4} />
      <CameraFrame t={t + 41} label={`ZOOM ×${Math.round(z * 2 * (1 + reveal))}`} />
      {t > DUR - 0.25 && <Glitch amount={clamp((t - (DUR - 0.25)) / 0.1)} />}
    </AbsoluteFill>
  );
};
