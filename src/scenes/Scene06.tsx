import { AbsoluteFill } from "remotion";
import { ease, Finish, Grade, Snow, Subtitle, useT } from "../components/fx";
import { Camp } from "../components/camp";
import { lip, Sfx, speaking, timeline, Voices } from "../components/audio";

const TL = timeline(0, [
  { clip: "d6", text: "Дед, ты легенда! Это в видео!", gap: 0.2 },
  { clip: "s4", text: "Твой брат тоже *смеялся*.", gap: 0.8, step: 0.32 },
  { clip: "n08", text: "Старик всегда был… слишком внимательный.", gap: 0.9 },
]);
export const DUR = TL.end + 0.6;

/** Сцена 6: все ржут, а шерпа смотрит только на Стаса и шепчет ему. Стас перестаёт смеяться. */
export const Scene06 = () => {
  const t = useT();
  const whisper = TL.at.s4.from;
  const z = ease(t, whisper - 0.6, DUR, 1.1, 1.5);
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Sfx name="sfx/laugh" vol={0.45} />
      <Sfx name="sfx/wind_light" vol={(f) => (f / 30 > whisper - 0.2 ? 0.12 : 0.35)} loop />
      <Sfx at={whisper - 0.2} name="sfx/heartbeat" vol={0.5} />
      <Sfx name="music/drone" vol={0.3} duck={TL} />
      <Voices tl={TL} />
      <Grade>
        <AbsoluteFill style={{ transformOrigin: "42% 48%", transform: `scale(${z})` }}>
          <Camp t={t} cam={-30} wind={0.2} dimaTalk={lip(TL, ["d6"], t)} laugh={t < whisper - 0.2} stasSmile={t < whisper + 0.5} sherpaTalk={lip(TL, ["s4"], t)} sherpaLook={[20, -4]} />
          <Snow t={t} n={30} opacity={0.55} speed={0.4} wind={0.15} />
          <Finish vig={0.55} tint="#6f8496" tintOpacity={0.12} grain={0.9} />
        </AbsoluteFill>
      </Grade>
      <Subtitle t={t} cues={TL.cues} />
    </AbsoluteFill>
  );
};
