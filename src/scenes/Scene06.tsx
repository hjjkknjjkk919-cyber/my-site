import { AbsoluteFill } from "remotion";
import { ease, Finish, Grade, Snow, Subtitle, useT } from "../components/fx";
import { Camp } from "../components/camp";
import { line, Say, Sfx } from "../components/audio";

const CUES = [
  ...line(0.2, 3.16, "Дед, ты легенда! Это в видео!"),
  ...line(3.8, 1.87, "Твой брат тоже *смеялся*.", 0.32),
  ...line(6.0, 2.95, "Старик всегда был… слишком внимательный."),
];

/** Сцена 6 (9.2 с): все ржут, а шерпа смотрит только на Стаса и шепчет ему. Стас перестаёт смеяться. */
export const Scene06 = () => {
  const t = useT();
  const laugh = t < 3.6;
  // камера медленно наезжает на шерпу и Стаса
  const z = ease(t, 3.2, 9.2, 1.1, 1.5);
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Sfx name="sfx/laugh" vol={0.45} />
      <Sfx name="sfx/wind_light" vol={(f) => (f / 30 > 3.6 ? 0.12 : 0.35)} loop />
      <Sfx at={3.6} name="sfx/heartbeat" vol={0.5} />
      <Sfx name="music/drone" vol={0.3} />
      <Say at={0.2} clip="d6" />
      <Say at={3.8} clip="s4" />
      <Say at={6.0} clip="n08" />
      <Grade>
        <AbsoluteFill style={{ transformOrigin: "42% 48%", transform: `scale(${z})` }}>
          <Camp t={t} cam={-30} wind={0.2} dimaTalk={t > 0.2 && t < 3.36} laugh={laugh} stasSmile={t < 4.3} sherpaTalk={t > 3.8 && t < 5.6} sherpaLook={[20, -4]} />
          <Snow t={t} n={30} opacity={0.55} speed={0.4} wind={0.15} />
          <Finish vig={0.55} tint="#6f8496" tintOpacity={0.12} grain={0.9} />
        </AbsoluteFill>
      </Grade>
      <Subtitle t={t} cues={CUES} />
    </AbsoluteFill>
  );
};
