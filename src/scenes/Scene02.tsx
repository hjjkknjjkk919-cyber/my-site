import { AbsoluteFill } from "remotion";
import { ease, Finish, Grade, shake, Snow, Subtitle, Svg, useT } from "../components/fx";
import { DIMA, GENA, Hero, LERA, onGround, STAS } from "../components/Hero";
import { Landscape } from "../components/landscape";
import { CameraFrame } from "../components/props";
import { line, Say, Sfx } from "../components/audio";

const CUES = [
  ...line(0.25, 2.36, "Всем привет! Мы на Эвересте!"),
  ...line(2.75, 3.63, "Нас тут… триста двенадцать. Подписчиков."),
  ...line(6.9, 2.57, "Да это просто поход, чё ты."),
  ...line(9.6, 2.15, "Четверо. Я их сразу посчитал."),
];

/** Сцена 2 (0:05–0:16.8, 11.8 с): селфи с длинной палки, все в полный рост. Рывок на Гену, отъезд. */
export const Scene02 = () => {
  const t = useT();
  const { dx, dy } = shake(t, 1.2);
  const toGena = ease(t, 6.35, 6.85, 0, 1);
  const back = ease(t, 9.5, 11.8, 0, 1);
  const k = toGena * (1 - back);
  const z = 1.05 + 0.4 * k - 0.05 * back;
  const tx = -27 + (-486 + 27) * k + 27 * back;
  const ty = -48 + (-276 + 48) * k + 48 * back;
  const genaTalk = t > 6.9 && t < 9.47;
  const roll = t > 5.0 && t < 6.4;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Sfx name="sfx/beep" vol={0.7} />
      <Sfx name="sfx/flags" vol={0.3} loop />
      <Sfx name="sfx/wind_light" vol={0.35} loop />
      <Sfx at={9.3} name="sfx/laugh" vol={0.35} />
      <Say at={0.25} clip="d1" />
      <Say at={2.75} clip="d2" />
      <Say at={6.9} clip="g1" />
      <Say at={9.6} clip="n03" />
      <Grade>
        <AbsoluteFill style={{ transformOrigin: "0 0", transform: `translate(${tx + dx}px,${ty + dy}px) scale(${z})`, filter: t > 6.3 && t < 6.9 ? "blur(6px)" : undefined }}>
          <Landscape t={t} wind={0.15} fog={0.05} camp />
          <Svg>
            <Hero cfg={STAS} x={230} y={onGround(STAS, 1240, 0.25)} s={0.25} t={t + 0.7} look={[-6, 10]} lid={0.32} blinks={[2.6, 8.2]} frost={0.15} wind={0.15} full />
            <Hero cfg={GENA} x={850} y={onGround(GENA, 1230, 0.28)} s={0.28} flip={-1} t={t + 1.9} emotion="smile" talk={genaTalk} look={genaTalk ? [6, 2] : [14, 4]} arm={genaTalk ? 176 + Math.sin(t * 5) * 10 : undefined} blinks={[1.6, 5.4]} frost={0.15} wind={0.15} lightLeft={false} full />
            <Hero cfg={LERA} x={420} y={onGround(LERA, 1290, 0.26)} s={0.26} t={t + 1.1} emotion="skeptic" look={roll ? [6, -22] : [16, 2]} lid={roll ? 0.42 : 0.2} blinks={[2.1, 9.9]} frost={0.15} wind={0.15} full />
            <Hero cfg={DIMA} x={650} y={onGround(DIMA, 1400, 0.33)} s={0.33} t={t} emotion="smile" talk={(t > 0.25 && t < 2.61) || (t > 2.75 && t < 6.38)} look={[-2, 0]} blinks={[2.4, 8.4]} frost={0.15} wind={0.15} full />
          </Svg>
          <Snow t={t} n={16} opacity={0.4} speed={0.5} wind={0.15} />
          <Finish vig={0.3} tint="#6f8496" tintOpacity={0.08} grain={0.7} />
        </AbsoluteFill>
      </Grade>
      <CameraFrame t={t} label="4 ДНЯ НАЗАД" />
      <Subtitle t={t} cues={CUES} />
    </AbsoluteFill>
  );
};
