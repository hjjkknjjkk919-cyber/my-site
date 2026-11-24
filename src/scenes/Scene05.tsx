import { AbsoluteFill } from "remotion";
import { ease, Finish, Grade, Snow, Subtitle, useT } from "../components/fx";
import { Camp } from "../components/camp";
import { Sfx, speaking, timeline, Voices } from "../components/audio";

const TL = timeline(0, [
  { clip: "n07", text: "Старика этого я знаю. Он всем говорит одно и то же.", gap: 0.3 },
  { clip: "d5", text: "Нам бы проводника. До самого верха.", gap: 0.6 },
  { clip: "s1", text: "Наверху стоит домик.", gap: 1.4, step: 0.4 },
  { clip: "s2", text: "Если в окне *свет* — не машите.", gap: 0.5, step: 0.36 },
  { clip: "s3", text: "Он машет в ответ.", gap: 0.5, step: 0.3 },
]);
export const DUR = TL.end + 0.7;
const NO = TL.at.d5.to + 0.1;
const SHERPA_FROM = TL.at.s1.from - 0.2;

/** Сцена 5: базовый лагерь. Шерпа отказывается вести и предупреждает про домик. На его словах ветер стихает. */
export const Scene05 = () => {
  const t = useT();
  const quiet = t > SHERPA_FROM;
  const cam = ease(t, 0, DUR, 30, -40);
  const z = ease(t, 0, DUR, 1.0, 1.15);
  const no = t > NO && t < NO + 1 ? Math.sin((t - NO) * 12) * 7 : 0;
  const sherpaTalk = speaking(TL, "s1", t) || speaking(TL, "s2", t) || speaking(TL, "s3", t);
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Sfx name="sfx/wind_light" vol={(f) => (f / 30 > SHERPA_FROM ? 0.08 : 0.4)} loop />
      <Sfx name="sfx/flags" vol={(f) => (f / 30 > SHERPA_FROM ? 0.05 : 0.3)} loop />
      <Sfx at={NO} name="music/drone" vol={0.25} />
      <Voices tl={TL} />
      <Grade>
        <AbsoluteFill style={{ transformOrigin: "30% 50%", transform: `scale(${z})` }}>
          <Camp t={t} cam={cam} wind={quiet ? 0.08 : 0.25} dimaTalk={speaking(TL, "d5", t)} sherpaTalk={sherpaTalk} sherpaLook={t > NO ? [0, 0] : [-14, 2]} no={no} />
          <Snow t={t} n={34} opacity={0.6} speed={0.5} wind={quiet ? 0.05 : 0.25} />
          <Finish vig={0.45} tint="#6f8496" tintOpacity={0.1} grain={0.9} />
        </AbsoluteFill>
      </Grade>
      <Subtitle t={t} cues={TL.cues} />
    </AbsoluteFill>
  );
};
