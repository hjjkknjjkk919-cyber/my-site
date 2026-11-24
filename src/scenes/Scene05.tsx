import { AbsoluteFill } from "remotion";
import { ease, Finish, Grade, Snow, Subtitle, useT } from "../components/fx";
import { Camp } from "../components/camp";
import { line, Say, Sfx } from "../components/audio";

const CUES = [
  ...line(0.15, 3.5, "Старика этого я знаю. Он всем говорит одно и то же."),
  ...line(3.85, 2.58, "Нам бы проводника. До самого верха."),
  ...line(7.6, 2.42, "Наверху стоит домик.", 0.4),
  ...line(10.3, 2.32, "Если в окне *свет* — не машите.", 0.36),
  ...line(12.9, 1.4, "Он машет в ответ.", 0.3),
];

const sherpaSpeaks = (t: number) => t > 7.5 && t < 14.2;

/** Сцена 5 (14.4 с): базовый лагерь. Шерпа отказывается вести и предупреждает про домик. */
export const Scene05 = () => {
  const t = useT();
  const cam = ease(t, 0, 14.4, 30, -40);
  const z = ease(t, 0, 14.4, 1.0, 1.15);
  const no = t > 6.45 && t < 7.4 ? Math.sin((t - 6.45) * 12) * 7 : 0;
  // когда говорит шерпа, ветер стихает
  const windVol = (f: number) => (sherpaSpeaks(f / 30) ? 0.08 : 0.4);
  const sherpaTalk = (t > 7.6 && t < 10.0) || (t > 10.3 && t < 12.6) || (t > 12.9 && t < 14.1);
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Sfx name="sfx/wind_light" vol={windVol} loop />
      <Sfx name="sfx/flags" vol={(f) => (sherpaSpeaks(f / 30) ? 0.05 : 0.3)} loop />
      <Sfx at={7} name="music/drone" vol={0.25} />
      <Say at={0.15} clip="n07" />
      <Say at={3.85} clip="d5" />
      <Say at={7.6} clip="s1" />
      <Say at={10.3} clip="s2" />
      <Say at={12.9} clip="s3" />
      <Grade>
        <AbsoluteFill style={{ transformOrigin: "30% 50%", transform: `scale(${z})` }}>
          <Camp t={t} cam={cam} wind={sherpaSpeaks(t) ? 0.08 : 0.25} dimaTalk={t > 3.85 && t < 6.4} sherpaTalk={sherpaTalk} sherpaLook={t > 7.4 ? [0, 0] : [-14, 2]} no={no} />
          <Snow t={t} n={34} opacity={0.6} speed={0.5} wind={sherpaSpeaks(t) ? 0.05 : 0.25} />
          <Finish vig={0.45} tint="#6f8496" tintOpacity={0.1} grain={0.9} />
        </AbsoluteFill>
      </Grade>
      <Subtitle t={t} cues={CUES} />
    </AbsoluteFill>
  );
};
