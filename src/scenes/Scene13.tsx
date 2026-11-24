import { AbsoluteFill } from "remotion";
import { loadFont } from "@remotion/google-fonts/Oswald";
import { clamp, Subtitle, useT } from "../components/fx";
import { line, Say, Sfx } from "../components/audio";

const { fontFamily } = loadFont("normal", { weights: ["700"], subsets: ["cyrillic", "latin"] });

const CUES = [...line(0.3, 1.3, "Дальше решаешь ты.", 0.3), ...line(2.1, 1.91, "Только не тяни. Я *жду*.", 0.3)];

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

/** Сцена 13 (4.7 с): чёрный экран, выбор зрителя и титр серии. Шёпот рассказчика. */
export const Scene13 = () => {
  const t = useT();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Sfx name="sfx/boom" vol={0.9} />
      <Say at={0.3} clip="n16" />
      <Say at={2.1} clip="n17" />
      <div style={{ position: "absolute", top: 300, width: "100%", textAlign: "center", fontFamily, color: "#e6ecef", opacity: clamp(t / 0.4) }}>
        <div style={{ fontSize: 140, letterSpacing: "0.12em" }}>ЭВЕРЕСТ</div>
        <div style={{ fontSize: 56, opacity: 0.8 }}>СЕРИЯ 1 — «УЛЫБКА»</div>
      </div>
      <div style={{ position: "absolute", top: 760, width: "100%" }}>
        <Plate n="1" text="Рассказать друзьям" op={clamp((t - 0.8) / 0.4)} />
        <Plate n="2" text="Промолчать" op={clamp((t - 1.2) / 0.4)} />
      </div>
      <Subtitle t={t} cues={CUES} />
    </AbsoluteFill>
  );
};
