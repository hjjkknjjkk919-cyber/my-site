import { AbsoluteFill } from "remotion";
import { loadFont } from "@remotion/google-fonts/Oswald";
import { clamp, Subtitle, useT } from "../components/fx";
import { Sfx, timeline, Voices } from "../components/audio";

const { fontFamily } = loadFont("normal", { weights: ["700"], subsets: ["cyrillic", "latin"] });

const TL = timeline(0, [
  { clip: "n16", text: "Дальше решаешь ты.", gap: 0.4, step: 0.3 },
  { clip: "n17", text: "Только не тяни. Я *жду*.", gap: 0.6, step: 0.3 },
]);
export const DUR = TL.end + 0.5;

const Plate = ({ n, text, op }: { n: string; text: string; op: number }) => (
  <div
    style={{
      opacity: op,
      transform: `translateY(${(1 - op) * 20}px)`,
      margin: "22px auto",
      width: 820,
      padding: "26px 34px",
      border: "4px solid #e6ecef",
      borderRadius: 18,
      color: "#e6ecef",
      fontFamily,
      fontSize: 62,
      textTransform: "uppercase",
      textAlign: "left",
      background: "rgba(20,27,33,.7)",
    }}
  >
    <span style={{ color: "#e5262b", marginRight: 24 }}>{n}</span>
    {text}
  </div>
);

/** Сцена 13: чёрный экран, выбор зрителя и титр серии. Шёпот рассказчика. */
export const Scene13 = () => {
  const t = useT();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Sfx name="sfx/boom" vol={0.9} />
      <Voices tl={TL} />
      <div style={{ position: "absolute", top: 300, width: "100%", textAlign: "center", fontFamily, color: "#e6ecef", opacity: clamp(t / 0.4) }}>
        <div style={{ fontSize: 140, letterSpacing: "0.12em" }}>ЭВЕРЕСТ</div>
        <div style={{ fontSize: 56, opacity: 0.8 }}>СЕРИЯ 1 — «УЛЫБКА»</div>
      </div>
      <div style={{ position: "absolute", top: 760, width: "100%" }}>
        <Plate n="1" text="Рассказать друзьям" op={clamp((t - 0.8) / 0.4)} />
        <Plate n="2" text="Промолчать" op={clamp((t - 1.2) / 0.4)} />
      </div>
      <Subtitle t={t} cues={TL.cues} />
    </AbsoluteFill>
  );
};
