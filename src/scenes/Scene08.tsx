import { AbsoluteFill, Easing, interpolate } from "remotion";
import { Finish, Grade, INK, Snow, Subtitle, Svg, useT } from "../components/fx";
import { handPos, Hero, onGround, STAS } from "../components/Hero";
import { Landscape } from "../components/landscape";
import { Photo } from "../components/props";
import { Sfx, timeline, Voices } from "../components/audio";

const TL = timeline(0, [
  { clip: "n10", text: "Друзьям Стас не сказал главного. Пять лет назад здесь *пропал* его брат Миша.", gap: 0.5 },
  { clip: "n11", text: "Миша тоже был тихий.", gap: 0.9, step: 0.3 },
]);
export const DUR = TL.end + 1.0;

// Стас держит фото у груди; окно лачуги на фото — точка, куда едет камера
const S = 0.4;
const Y = onGround(STAS, 1700, S);
const H = handPos(540, Y, S, 40);
const PS = 0.26;
const P = { x: H.x - 10, y: H.y - 70 };
const WIN = { x: P.x + 73 * PS, y: P.y - 12 * PS };

/** Сцена 8: ночь, Стас один с фото брата. Один непрерывный плавный наезд: Стас → руки с фото → окно лачуги, где улыбка. */
export const Scene08 = () => {
  const t = useT();
  // как у настоящей камеры: медленный разгон, ровный ход, мягкая остановка
  const z = interpolate(t, [0.6, DUR - 0.4], [1, 22], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.45, 0, 0.25, 1) });
  const drift = { x: Math.sin(t * 0.9) * 3, y: Math.cos(t * 0.7) * 3 };
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Sfx name="sfx/wind_light" vol={0.2} loop />
      <Sfx name="music/drone" vol={0.35} />
      <Sfx at={TL.at.n10.to - 1} name="sfx/heartbeat" vol={0.55} />
      <Voices tl={TL} />
      <AbsoluteFill style={{ transformOrigin: `${WIN.x}px ${WIN.y}px`, transform: `translate(${drift.x}px,${drift.y}px) scale(${z})` }}>
        <Grade>
          <Landscape t={t} wind={0.1} fog={0.35} camp />
          <Svg>
            <rect width={1080} height={1920} fill="#060b12" opacity="0.62" />
            <Hero cfg={STAS} x={540} y={Y} s={S} t={t} arm={40} look={[4, 22]} lid={0.4} blinks={[1.6]} frost={0.3} full wind={0.1} />
          </Svg>
        </Grade>
        {/* фото цветное: красная куртка Миши; держат две руки в перчатках */}
        <Svg>
          <Photo x={P.x} y={P.y} s={PS} rot={0} t={0} />
          <ellipse cx={P.x - 262 * PS} cy={P.y + 60 * PS} rx="22" ry="30" fill="#2a2f35" stroke={INK} strokeWidth="5" />
          <ellipse cx={P.x + 262 * PS} cy={P.y + 90 * PS} rx="22" ry="30" fill="#2a2f35" stroke={INK} strokeWidth="5" />
        </Svg>
      </AbsoluteFill>
      {/* тёплый свет фонарика, снег, зерно и виньетка — поверх, не масштабируются */}
      <AbsoluteFill style={{ mixBlendMode: "overlay", background: "radial-gradient(40% 28% at 50% 50%,rgba(230,150,70,.5) 0%,rgba(0,0,0,0) 100%)" }} />
      <Snow t={t} n={14} opacity={0.4} speed={0.3} wind={0.1} />
      <Finish vig={0.9} tint="#1b3350" tintOpacity={0.2} grain={1} />
      <Subtitle t={t} cues={TL.cues} />
    </AbsoluteFill>
  );
};
