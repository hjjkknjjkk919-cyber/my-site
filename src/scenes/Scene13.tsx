import { AbsoluteFill } from "remotion";
import { loadFont } from "@remotion/google-fonts/Oswald";
import { clamp, Defs, RED, Subtitle, useT } from "../components/fx";
import { DIMA, Hero } from "../components/Hero";
import { ManiacGroup } from "../components/maniac";
import { Sfx, timeline, Voices } from "../components/audio";

const { fontFamily } = loadFont("normal", { weights: ["700"], subsets: ["cyrillic", "latin"] });

const TL = timeline(0, [
  { clip: "n16", text: "Дальше решаешь ты.", gap: 0.4, step: 0.3 },
  { clip: "n17", text: "Только не тяни. Я *жду*.", gap: 0.6, step: 0.3 },
]);
export const DUR = TL.end + 0.8;

/** Картинка варианта: маленький кадр в рамке. */
const Thumb = ({ children, viewBox }: { children: React.ReactNode; viewBox: string }) => (
  <svg viewBox={viewBox} width="200" height="200" style={{ flex: "none", borderRadius: 14, border: "4px solid #3a4148", background: "#0d1114", filter: "saturate(.3) contrast(1.1) brightness(.85)" }}>
    <Defs />
    {children}
  </svg>
);

const Plate = ({ n, text, op, thumb }: { n: string; text: string; op: number; thumb: React.ReactNode }) => (
  <div
    style={{
      opacity: op,
      transform: `translateY(${(1 - op) * 24}px)`,
      margin: "26px auto",
      width: 920,
      padding: 18,
      display: "flex",
      alignItems: "center",
      gap: 30,
      border: "4px solid #2c3238",
      borderRadius: 22,
      background: "rgba(16,20,24,.85)",
      color: "#e6ecef",
      fontFamily,
      fontSize: 62,
      textTransform: "uppercase",
      lineHeight: 1.05,
    }}
  >
    {thumb}
    <span style={{ color: RED, fontSize: 110 }}>{n}</span>
    <span>{text}</span>
  </div>
);

/** Сцена 13: выбор зрителя с картинками, титр серии, кнопка «Голосуй в комментариях». Шёпот рассказчика. */
export const Scene13 = () => {
  const t = useT();
  return (
    <AbsoluteFill style={{ background: "radial-gradient(70% 50% at 50% 40%,#161b20 0%,#050607 100%)" }}>
      <Sfx name="sfx/boom" vol={0.9} />
      <Voices tl={TL} />
      <div style={{ position: "absolute", top: 170, width: "100%", textAlign: "center", fontFamily, color: "#e6ecef", opacity: clamp(t / 0.4) }}>
        <div style={{ fontSize: 46, letterSpacing: "0.3em", opacity: 0.6 }}>ЭВЕРЕСТ · СЕРИЯ 1 — «УЛЫБКА»</div>
        <div style={{ fontSize: 104, marginTop: 30 }}>ЧТО ДЕЛАТЬ ДИМЕ?</div>
      </div>
      <div style={{ position: "absolute", top: 520, width: "100%" }}>
        <Plate
          n="1"
          text="Рассказать друзьям"
          op={clamp((t - 0.7) / 0.4)}
          thumb={
            <Thumb viewBox="250 440 580 580">
              <ManiacGroup t={0} />
            </Thumb>
          }
        />
        <Plate
          n="2"
          text="Промолчать"
          op={clamp((t - 1.1) / 0.4)}
          thumb={
            <Thumb viewBox="180 160 720 720">
              <Hero cfg={DIMA} x={540} y={560} s={1} t={0} look={[-10, 18]} lid={0.45} frost={0.3} breath={0} />
            </Thumb>
          }
        />
      </div>
      <div
        style={{
          position: "absolute",
          top: 1150,
          left: "50%",
          transform: `translateX(-50%) scale(${1 + 0.03 * Math.sin(t * 5)})`,
          opacity: clamp((t - 1.6) / 0.4),
          background: RED,
          color: "#fff",
          fontFamily,
          fontSize: 58,
          padding: "22px 60px",
          borderRadius: 60,
          whiteSpace: "nowrap",
        }}
      >
        ГОЛОСУЙ В КОММЕНТАРИЯХ
      </div>
      <Subtitle t={t} cues={TL.cues} />
    </AbsoluteFill>
  );
};
