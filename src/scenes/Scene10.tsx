import { AbsoluteFill } from "remotion";
import { ease, Finish, Grade, INK, shake, Snow, Subtitle, Svg, useT } from "../components/fx";
import { DIMA, GENA, Hero, LERA, onGround, STAS } from "../components/Hero";
import { Landscape } from "../components/landscape";
import { Shack } from "../components/props";
import { line, Say, Sfx } from "../components/audio";

const CUES = [
  ...line(0.3, 3.07, "Всё, дальше не пройдём. Ставим палатки."),
  ...line(3.7, 3.9, "Лера первой увидела домик. Хотя на такой высоте никто не живёт."),
  ...line(8.1, 1.65, "Ну… почти никто."),
];

// домик и его окно (окно рисуем цветным поверх серой палитры)
const SH = { x: 900, y: 1010, s: 0.5 };
const WIN = { x: SH.x - 67 * SH.s, y: SH.y - 74 * SH.s };

/** Ветер бьёт палатку, которую рвёт из рук. Сцена 10 (10 с): ставят палатки, Лера видит домик с жёлтым окном. */
export const Scene10 = () => {
  const t = useT();
  const wind = 0.7;
  const { dx, dy } = shake(t, 3);
  const flap = Math.sin(t * 14) * 0.08;
  const point = ease(t, 3.4, 4.0, -20, -118);
  // в конце камера тянется к домику
  const z = ease(t, 7.6, 10, 1.0, 1.35);
  const glow = 0.75 + 0.15 * Math.sin(t * 29) + 0.1 * Math.sin(t * 83);
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Sfx name="sfx/wind_strong" vol={0.5} loop />
      <Sfx name="sfx/tent" vol={0.5} dur={7.5} />
      <Sfx at={6} name="sfx/blizzard" vol={0.3} />
      <Sfx at={3.6} name="music/drone" vol={0.35} />
      <Say at={0.3} clip="l4" />
      <Say at={3.7} clip="n13" />
      <Say at={8.1} clip="n14" />
      <AbsoluteFill style={{ transformOrigin: `${(WIN.x / 1080) * 100}% ${(WIN.y / 1920) * 100}%`, transform: `translate(${dx}px,${dy}px) scale(${z})` }}>
        <Grade>
          <Landscape t={t} cam={-80} wind={wind} fog={0.5} />
          <Svg>
            <Shack x={SH.x} y={SH.y} s={SH.s} lit={1} />
            {/* палатка, которую рвёт ветер */}
            <g transform={`translate(560 1480) scale(${0.9 + flap} 0.9)`} filter="url(#rough)">
              <path d="M-230 0 C-210 -260 210 -260 230 0 Z" fill="#d9732b" stroke={INK} strokeWidth="9" />
              <path d="M40 -200 C160 -170 220 -90 230 0 H80 C90 -70 80 -140 40 -200 Z" fill="#000" opacity="0.3" />
              <path d="M-230 0 L-330 60 M230 0 L330 60" stroke="#25313b" strokeWidth="4" />
            </g>
            <Hero cfg={DIMA} x={420} y={onGround(DIMA, 1560, 0.3)} s={0.3} t={t} emotion="calm" arm={150 + Math.sin(t * 6) * 10} look={[16, -6]} lid={0.35} blinks={[5.4]} frost={0.6} full wind={wind} />
            <Hero cfg={GENA} x={720} y={onGround(GENA, 1560, 0.31)} s={0.31} flip={-1} t={t + 1} emotion="calm" arm={160} look={[14, -4]} lid={0.35} blinks={[2.8]} frost={0.6} lightLeft={false} full wind={wind} />
            <Hero cfg={STAS} x={940} y={onGround(STAS, 1700, 0.34)} s={0.34} flip={-1} t={t + 0.5} emotion={t > 5 ? "fear" : "calm"} look={[-6, -16]} blinks={[]} frost={0.6} lightLeft={false} full wind={wind} />
            <Hero cfg={LERA} x={200} y={onGround(LERA, 1760, 0.38)} s={0.38} t={t + 2} emotion="calm" talk={t > 0.3 && t < 3.37} arm={point} look={t > 3.4 ? [22, -14] : [16, 0]} blinks={[2.2, 6.8]} frost={0.6} full wind={wind} />
          </Svg>
          <Snow t={t} n={70} opacity={0.75} speed={1.4} wind={wind} />
          <Finish vig={0.5} tint="#6f8496" tintOpacity={0.14} grain={1} />
        </Grade>
        {/* жёлтый свет окна — цветной */}
        <Svg>
          <circle cx={WIN.x} cy={WIN.y} r="70" fill="#f2c94c" opacity={0.25 * glow} />
          <rect x={WIN.x - 16} y={WIN.y - 15} width="33" height="30" fill="#e0b53e" opacity={0.85 * glow} />
        </Svg>
      </AbsoluteFill>
      <Subtitle t={t} cues={CUES} />
    </AbsoluteFill>
  );
};
