import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { clamp, Glitch, RED, Svg, useT } from "../components/fx";
import { ManiacFace } from "../components/maniac";
import { Sfx } from "../components/audio";

export const DUR = 1.1;

// по каким кадрам лицо видно (мелькает, как сбитая плёнка), остальное — чернота и помехи
const FACE_ON = [0, 1, 2, 5, 6, 9, 12, 13, 14, 15, 18, 22, 23, 24, 25, 26, 27, 28];

/** Брызги крови: капли разлетаются от точки и стекают вниз по экрану. */
const Blood = ({ t }: { t: number }) => {
  const hit = clamp(t / 0.12);
  return (
    <Svg>
      <g fill="#7a0b10">
        {Array.from({ length: 22 }, (_, i) => {
          const a = random(`ba${i}`) * Math.PI * 2;
          const d = (120 + random(`bd${i}`) * 520) * hit;
          const r = 10 + random(`br${i}`) * 34;
          return <circle key={i} cx={560 + Math.cos(a) * d} cy={760 + Math.sin(a) * d * 1.3} r={r * hit} />;
        })}
        <ellipse cx="560" cy="760" rx={160 * hit} ry={120 * hit} />
      </g>
      {/* стекающие потёки */}
      <g fill="#8c0d13">
        {Array.from({ length: 9 }, (_, i) => {
          const x = 200 + random(`dx${i}`) * 700;
          const y0 = 500 + random(`dy${i}`) * 500;
          const len = Math.max(0, t - 0.15) * (300 + random(`dl${i}`) * 500);
          const w = 10 + random(`dw${i}`) * 14;
          return (
            <g key={i}>
              <rect x={x - w / 2} y={y0} width={w} height={len} rx={w / 2} />
              <circle cx={x} cy={y0 + len} r={w * 0.9} />
            </g>
          );
        })}
      </g>
      <rect width={1080} height={1920} fill={RED} opacity={0.12 + 0.1 * Math.sin(t * 40)} style={{ mixBlendMode: "multiply" }} />
    </Svg>
  );
};

/** Сцена 0 (1.1 с): крик, мелькающее лицо маньяка и брызги крови — чтобы листающий ленту застыл с первой секунды. */
export const Scene00 = () => {
  const t = useT();
  const f = useCurrentFrame();
  const face = FACE_ON.includes(f);
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Sfx name="sfx/scream" vol={1} />
      <Sfx name="sfx/boom" vol={0.7} dur={DUR} />
      <Sfx at={0.1} name="sfx/camfall" vol={0.5} dur={0.8} />
      {face && (
        <AbsoluteFill style={{ transform: `scale(${1.3 - t * 0.25}) translate(${(random(`fx${f}`) - 0.5) * 40}px,${(random(`fy${f}`) - 0.5) * 30}px)`, filter: "contrast(1.5) saturate(.5) brightness(.85)" }}>
          <ManiacFace t={t} />
        </AbsoluteFill>
      )}
      {t > 0.18 && <Blood t={t - 0.18} />}
      <Glitch amount={face ? 0.35 : 0.8} />
    </AbsoluteFill>
  );
};
