import { AbsoluteFill } from "remotion";
import { Glitch, useT } from "../components/fx";
import { ManiacFace } from "../components/maniac";
import { Sfx } from "../components/audio";

export const DUR = 0.5;

/** Сцена 0 (0.5 с): вспышка гнилой улыбки с помехами — чтобы листающий ленту застыл с первой секунды. */
export const Scene00 = () => {
  const t = useT();
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Sfx name="sfx/boom" vol={0.7} dur={0.5} />
      <Sfx name="sfx/camfall" vol={0.5} dur={0.5} />
      <AbsoluteFill style={{ transform: `scale(${1.25 - t * 0.2}) translateX(${Math.sin(t * 90) * 12}px)`, filter: "contrast(1.4) saturate(.4) brightness(.9)" }}>
        <ManiacFace t={t} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#e5262b", mixBlendMode: "multiply", opacity: 0.35 }} />
      <Glitch amount={0.55} />
    </AbsoluteFill>
  );
};
