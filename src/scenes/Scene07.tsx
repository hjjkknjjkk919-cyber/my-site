import { AbsoluteFill } from "remotion";
import { ease, Finish, Grade, Snow, Subtitle, Svg, useT } from "../components/fx";
import { DIMA, GENA, handPos, Hero, LERA, onGround, STAS } from "../components/Hero";
import { Landscape } from "../components/landscape";
import { Phone, Stove, StoveFlame } from "../components/props";
import { line, Say, Sfx } from "../components/audio";

const CUES = [
  ...line(0.4, 3.46, "Шеф Гена. Блюдо дня — лапша."),
  ...line(4.05, 5.37, "Пишут: «вы там сдохнете». «Слабо без гида?» Видите — верят в нас."),
  ...line(9.6, 1.38, "Это не вера, Дим."),
  ...line(11.2, 4.3, "Лапша пахла на весь склон. Я… я тоже люблю лапшу."),
];

// где стоят герои; вечер, все в полный рост вокруг примуса
const G = { x: 250, g: 1520, s: 0.3 };
const D = { x: 520, g: 1560, s: 0.31 };

/** Сцена 7 (15.6 с): вечер у примуса. Гена варит, Дима читает комментарии, все смеются. Стас смотрит в темноту. */
export const Scene07 = () => {
  const t = useT();
  const laugh = t > 10.95 && t < 12.6;
  // на словах рассказчика камера уезжает к Стасу на краю
  const cam = ease(t, 11, 15.6, 0, -220);
  const z = ease(t, 11, 15.6, 1.0, 1.15);
  const gArm = -40 + Math.sin(t * 3) * 12;
  const dArm = -35;
  const gY = onGround(GENA, G.g, G.s);
  const dY = onGround(DIMA, D.g, D.s);
  const ph = handPos(D.x, dY, D.s, dArm);
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Sfx name="sfx/primus" vol={0.45} loop />
      <Sfx name="sfx/wind_light" vol={0.25} loop />
      <Sfx at={10.9} name="sfx/laugh" vol={0.5} />
      <Sfx at={11} name="music/drone" vol={0.25} />
      <Say at={0.4} clip="g2" />
      <Say at={4.05} clip="d7" />
      <Say at={9.6} clip="l2" />
      <Say at={11.2} clip="n09" />
      <AbsoluteFill style={{ transformOrigin: "80% 45%", transform: `translateX(${cam}px) scale(${z})` }}>
        <Grade>
          <Landscape t={t} wind={0.15} fog={0.3} camp />
          <Svg>
            <rect width={1080} height={1920} fill="#0c1520" opacity="0.5" />
            <Hero cfg={GENA} x={G.x} y={gY} s={G.s} t={t} emotion="smile" talk={(t > 0.4 && t < 3.86) || laugh} lid={laugh ? 0.4 : undefined} arm={gArm} look={[10, 14]} blinks={[5.2, 13.1]} frost={0.25} full wind={0.1} />
            <Hero cfg={DIMA} x={D.x} y={dY} s={D.s} t={t + 1} emotion="smile" talk={(t > 4.05 && t < 9.42) || laugh} lid={laugh ? 0.45 : undefined} arm={dArm} look={t < 9.4 ? [4, 18] : [14, 0]} blinks={[3.1, 14.2]} frost={0.25} full wind={0.1} />
            <Hero cfg={LERA} x={760} y={onGround(LERA, 1550, 0.29)} s={0.29} flip={-1} t={t + 2} emotion={laugh ? "smile" : "skeptic"} talk={(t > 9.6 && t < 10.98) || laugh} look={[16, 4]} blinks={[2.4, 8.8]} frost={0.25} lightLeft={false} full wind={0.1} />
            <Hero cfg={STAS} x={1010} y={onGround(STAS, 1500, 0.28)} s={0.28} flip={-1} t={t + 0.5} look={[-22, -6]} lid={0.25} blinks={[6.6, 12.4]} frost={0.25} lightLeft={false} full wind={0.1} />
            <Stove x={420} y={1650} s={0.6} />
            <Phone x={ph.x} y={ph.y - 30} s={0.5} glow={t < 9.6 ? 1 : 0.4} />
          </Svg>
          <Snow t={t} n={14} opacity={0.35} speed={0.3} wind={0.1} />
          <Finish vig={0.75} tint="#1b3350" tintOpacity={0.25} grain={0.9} />
        </Grade>
        {/* цветной огонёк примуса поверх серой палитры */}
        <Svg>
          <StoveFlame x={420} y={1650} s={0.6} t={t} />
        </Svg>
        <AbsoluteFill style={{ mixBlendMode: "screen", background: "radial-gradient(18% 10% at 39% 82%,rgba(90,160,255,.35) 0%,rgba(0,0,0,0) 100%)" }} />
      </AbsoluteFill>
      <Subtitle t={t} cues={CUES} />
    </AbsoluteFill>
  );
};
