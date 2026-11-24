import { AbsoluteFill } from "remotion";
import { clamp, ease, Finish, INK, Subtitle, Svg, useT } from "../components/fx";
import { lip, Sfx, timeline, Voices } from "../components/audio";

// после титров: 2 с черноты, стук по палатке, шёпот «Ди-и-ма… Открой.»
const KNOCK = 2.0;
const TL = timeline(KNOCK + 1.6, [{ clip: "n18", text: "Ди-и-ма… *Открой*.", gap: 0, step: 0.4 }]);
export const DUR = TL.end + 1.2;

/** Сцена 14 (после титров): ночь в палатке, фонарь. Снаружи на стенку ложится тень ладони, стук и шёпот. */
export const Scene14 = () => {
  const t = useT();
  const on = ease(t, KNOCK - 0.6, KNOCK, 0, 1);
  // тень ладони прижимается к ткани с каждым стуком
  const press = [0, 0.7, 1.4].reduce((m, d) => Math.max(m, Math.max(0, 1 - Math.abs(t - KNOCK - d) / 0.25)), 0);
  const hand = ease(t, KNOCK - 0.3, KNOCK + 0.2, 0, 1);
  const breathe = 1 + 0.02 * Math.sin(t * 2.2) + 0.06 * lip(TL, ["n18"], t);
  const fl = 0.85 + 0.1 * Math.sin(t * 9);
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Sfx at={KNOCK} name="sfx/knock" vol={0.9} />
      <Sfx at={KNOCK} name="music/drone" vol={0.35} />
      <Voices tl={TL} />
      <AbsoluteFill style={{ opacity: on * (t > DUR - 0.5 ? clamp((DUR - t) / 0.5) : 1) }}>
        <Svg>
          {/* стенка палатки изнутри, свет фонаря */}
          <rect width={1080} height={1920} fill="#1d3a57" />
          <path d="M-40 1920 L540 180 L1120 1920 Z" fill="#244666" stroke={INK} strokeWidth="10" />
          <path d="M540 180 L540 1920" stroke="#16304a" strokeWidth="8" opacity="0.7" />
          {[600, 900, 1200, 1500].map((y) => (
            <path key={y} d={`M${540 - (y - 180) * 0.33} ${y} Q540 ${y + 40} ${540 + (y - 180) * 0.33} ${y}`} fill="none" stroke="#16304a" strokeWidth="5" opacity="0.6" />
          ))}
          {/* тень ладони снаружи */}
          <g opacity={hand * 0.85} transform={`translate(560 980) scale(${(1 + press * 0.08) * breathe})`}>
            <path d="M-90 160 C-120 60 -110 -40 -95 -120 C-90 -160 -60 -160 -55 -120 L-45 -40 L-40 -200 C-38 -245 0 -245 2 -200 L8 -50 L18 -215 C20 -258 58 -256 58 -212 L52 -40 L70 -170 C76 -208 110 -204 108 -166 L90 10 C120 -40 160 -40 150 10 C120 100 90 150 60 190 Z" fill="#060a10" opacity="0.9" />
          </g>
        </Svg>
        <AbsoluteFill style={{ mixBlendMode: "overlay", opacity: fl, background: "radial-gradient(60% 45% at 50% 85%,rgba(230,120,50,.6) 0%,rgba(0,0,0,0) 100%)" }} />
        <Finish vig={1} tint="#1d3a57" tintOpacity={0.15} grain={1.2} bigSnow={false} />
      </AbsoluteFill>
      <Subtitle t={t} cues={TL.cues} />
    </AbsoluteFill>
  );
};
