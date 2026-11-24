import { AbsoluteFill } from "remotion";
import { ease, Finish, Grade, shake, Snow, Subtitle, Svg, useT } from "../components/fx";
import { DIMA, GENA, Hero, LERA, onGround, STAS } from "../components/Hero";
import { Landscape } from "../components/landscape";
import { CameraFrame } from "../components/props";
import { lip, Sfx, speaking, timeline, Voices } from "../components/audio";

const TL = timeline(0, [
  { clip: "d1", text: "Всем привет! Мы на Эвересте!", gap: 0.3 },
  { clip: "d2", text: "Нас тут… триста двенадцать. Подписчиков.", gap: 0.6 },
  { clip: "g1", text: "Да это просто поход, чё ты.", gap: 1.1 },
  { clip: "n03", text: "Четверо. Я их сразу посчитал.", gap: 0.8 },
]);
export const DUR = TL.end + 0.5;
const WHIP = TL.at.d2.to + 0.1;

/** Сцена 2: селфи с длинной палки, все в полный рост. Рывок на Гену, отъезд на словах рассказчика. */
export const Scene02 = () => {
  const t = useT();
  const { dx, dy } = shake(t, 1.2);
  const toGena = ease(t, WHIP, WHIP + 0.5, 0, 1);
  const back = ease(t, TL.at.n03.from - 0.3, DUR, 0, 1);
  const k = toGena * (1 - back);
  const z = 1.05 + 0.4 * k - 0.05 * back;
  const tx = -27 + (-486 + 27) * k + 27 * back;
  const ty = -48 + (-276 + 48) * k + 48 * back;
  const genaTalk = speaking(TL, "g1", t);
  // после «чё ты» все смеются
  const laugh = t > TL.at.g1.to && t < TL.at.g1.to + 1.6;
  const roll = t > TL.at.d2.to - 1.4 && t < TL.at.d2.to;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Sfx name="sfx/beep" vol={0.7} />
      <Sfx name="sfx/flags" vol={0.3} loop duck={TL} />
      <Sfx name="sfx/wind_light" vol={0.35} loop duck={TL} />
      <Sfx at={TL.at.g1.to} name="sfx/laugh" vol={0.35} />
      <Voices tl={TL} />
      <Grade>
        <AbsoluteFill style={{ transformOrigin: "0 0", transform: `translate(${tx + dx}px,${ty + dy}px) scale(${z})`, filter: t > WHIP && t < WHIP + 0.5 ? "blur(6px)" : undefined }}>
          <Landscape t={t} wind={0.15} fog={0.05} camp />
          <Svg>
            <Hero cfg={STAS} x={230} y={onGround(STAS, 1240, 0.25)} s={0.25} t={t + 0.7} look={[-6, 10]} lid={0.32} blinks={[2.6, 8.2]} frost={0.15} wind={0.15} full />
            <Hero cfg={GENA} x={850} y={onGround(GENA, 1230, 0.28)} s={0.28} flip={-1} t={t + 1.9} emotion={laugh ? "laugh" : "smile"} talk={genaTalk} look={genaTalk ? [6, 2] : [14, 4]} arm={genaTalk ? 176 + Math.sin(t * 5) * 10 : undefined} blinks={[1.6, 5.4]} frost={0.15} wind={0.15} lightLeft={false} full />
            <Hero cfg={LERA} x={420} y={onGround(LERA, 1290, 0.26)} s={0.26} t={t + 1.1} emotion={laugh ? "laugh" : "skeptic"} look={roll ? [6, -22] : [16, 2]} lid={roll ? 0.42 : 0.2} blinks={[2.1, 9.9]} frost={0.15} wind={0.15} full />
            <Hero cfg={DIMA} x={650} y={onGround(DIMA, 1400, 0.33)} s={0.33} t={t} emotion={laugh ? "laugh" : "smile"} mouth={lip(TL, ["d1", "d2"], t)} look={[-2, 0]} blinks={[2.4, 8.4]} frost={0.15} wind={0.15} full />
          </Svg>
          <Snow t={t} n={16} opacity={0.4} speed={0.5} wind={0.15} />
          <Finish vig={0.3} tint="#6f8496" tintOpacity={0.08} grain={0.7} />
        </AbsoluteFill>
      </Grade>
      <CameraFrame t={t} label="4 ДНЯ НАЗАД" />
      <Subtitle t={t} cues={TL.cues} />
    </AbsoluteFill>
  );
};
