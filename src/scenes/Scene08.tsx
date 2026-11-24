import { AbsoluteFill } from "remotion";
import { ease, Finish, Grade, Snow, Subtitle, Svg, useT } from "../components/fx";
import { handPos, Hero, onGround, STAS } from "../components/Hero";
import { Landscape } from "../components/landscape";
import { Photo } from "../components/props";
import { line, Say, Sfx } from "../components/audio";

const CUES = [
  ...line(0.3, 4.85, "Друзьям Стас не сказал главного. Пять лет назад здесь *пропал* его брат Миша."),
  ...line(5.6, 1.4, "Миша тоже был тихий.", 0.3),
];

/** Сцена 8 (7.6 с): ночь, Стас один с фото брата. Крупно фото, наезд на окно лачуги — там улыбка. */
export const Scene08 = () => {
  const t = useT();
  const close = t > 2.8;
  const s = 0.4;
  const y = onGround(STAS, 1640, s);
  const arm = -20;
  const h = handPos(540, y, s, arm);
  // фото: сначала целиком, потом медленный наезд на окно лачуги (оно справа от центра)
  const zp = ease(t, 3.4, 7.6, 1, 2.4);
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Sfx name="sfx/wind_light" vol={0.2} loop />
      <Sfx name="music/drone" vol={0.35} />
      <Sfx at={2.8} name="sfx/heartbeat" vol={0.55} />
      <Say at={0.3} clip="n10" />
      <Say at={5.6} clip="n11" />
      {!close ? (
        <AbsoluteFill style={{ transformOrigin: "50% 45%", transform: `scale(${ease(t, 0, 2.8, 1, 1.12)})` }}>
          <Grade>
            <Landscape t={t} wind={0.1} fog={0.35} camp />
            <Svg>
              <rect width={1080} height={1920} fill="#060b12" opacity="0.62" />
              <Hero cfg={STAS} x={540} y={y} s={s} t={t} look={[4, 22]} lid={0.4} blinks={[1.6]} frost={0.3} full wind={0.1} />
            </Svg>
            <Snow t={t} n={14} opacity={0.4} speed={0.3} wind={0.1} />
            <Finish vig={0.85} tint="#1b3350" tintOpacity={0.3} grain={1} />
          </Grade>
          {/* фото в руке — цветное */}
          <Svg>
            <Photo x={h.x - 30} y={h.y - 70} s={0.22} rot={-10} t={0} />
          </Svg>
          <AbsoluteFill style={{ mixBlendMode: "overlay", background: "radial-gradient(30% 20% at 50% 55%,rgba(230,150,70,.5) 0%,rgba(0,0,0,0) 100%)" }} />
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={{ background: "#070b10" }}>
          <AbsoluteFill style={{ transformOrigin: "639px 744px", transform: `scale(${zp})` }}>
            <Svg>
              <Photo x={540} y={760} s={1.35} rot={-4} t={0} />
            </Svg>
          </AbsoluteFill>
          <AbsoluteFill style={{ mixBlendMode: "overlay", background: "radial-gradient(50% 35% at 50% 45%,rgba(230,150,70,.45) 0%,rgba(0,0,0,0) 100%)" }} />
          <AbsoluteFill style={{ background: "radial-gradient(70% 50% at 50% 45%,rgba(0,0,0,0) 40%,rgba(0,0,0,.85) 100%)" }} />
        </AbsoluteFill>
      )}
      <Subtitle t={t} cues={CUES} />
    </AbsoluteFill>
  );
};
