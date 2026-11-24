import { AbsoluteFill, Easing, interpolate } from "remotion";
import { Finish, INK, Snow, Subtitle, Svg, useT } from "../components/fx";
import { Photo } from "../components/props";
import { Sfx, timeline, Voices } from "../components/audio";

const TL = timeline(0, [
  { clip: "n10", text: "Друзьям Стас не сказал главного. Пять лет назад здесь *пропал* его брат Миша.", gap: 0.5 },
  { clip: "n11", text: "Миша тоже был тихий.", gap: 0.9, step: 0.3 },
]);
export const DUR = TL.end + 1.2;

const L = { strokeLinecap: "round", strokeLinejoin: "round" } as const;
const JACKET = "#8d9aa5";
const SHADE = "#5b6873";
const GLOVE = "#2a2f35";
const GLOVE_LIT = "#454c54";

// фото в руках: центр, масштаб; окно лачуги на фото — куда медленно смотрит Стас
const P = { x: 540, y: 860, s: 1.55 };
const WIN = { x: P.x + 73 * P.s, y: P.y - 11 * P.s };

/** Рука в перчатке: рукав куртки с меховой манжетой, ладонь за фото, большой палец поверх края фото. */
const Hand = ({ side }: { side: 1 | -1 }) => (
  <g transform={side === -1 ? "translate(1080 0) scale(-1 1)" : undefined} filter="url(#rough)" {...L}>
    {/* рукав */}
    <path d="M-60 1960 L150 1210" stroke={INK} strokeWidth="300" />
    <path d="M-60 1960 L150 1210" stroke={JACKET} strokeWidth="276" />
    <path d="M30 1960 L200 1290" stroke={SHADE} strokeWidth="90" opacity="0.6" />
    {[1450, 1640].map((y) => (
      <path key={y} d={`M${-40 + (1960 - y) * 0.06} ${y} C${40} ${y - 30} ${160} ${y - 40} ${250 - (1960 - y) * 0.2} ${y - 60}`} fill="none" stroke={INK} strokeWidth="6" opacity="0.6" />
    ))}
    {/* меховая манжета */}
    <ellipse cx="150" cy="1215" rx="150" ry="70" fill="#a9b5bd" stroke={INK} strokeWidth="8" transform="rotate(-18 150 1215)" />
    <ellipse cx="150" cy="1215" rx="150" ry="70" fill="none" stroke="#eef4f8" strokeWidth="6" strokeDasharray="3 20" transform="rotate(-18 150 1215)" />
    {/* ладонь и пальцы за краем фото */}
    <path d="M60 1180 C40 1060 80 960 160 930 C210 912 250 940 250 990 L250 1150 C220 1200 120 1220 60 1180 Z" fill={GLOVE} stroke={INK} strokeWidth="9" />
    <path d="M80 1150 C70 1060 100 990 160 960" fill="none" stroke={GLOVE_LIT} strokeWidth="14" opacity="0.7" />
  </g>
);

/** Большой палец поверх фото (рисуется после снимка). */
const Thumb = ({ side, y }: { side: 1 | -1; y: number }) => (
  <g transform={side === -1 ? "translate(1080 0) scale(-1 1)" : undefined} filter="url(#rough)" {...L}>
    <path d={`M160 ${y + 120} C190 ${y + 60} 220 ${y + 20} 262 ${y}`} stroke={INK} strokeWidth="78" />
    <path d={`M160 ${y + 120} C190 ${y + 60} 220 ${y + 20} 262 ${y}`} stroke={GLOVE} strokeWidth="62" />
    <path d={`M175 ${y + 95} C200 ${y + 55} 225 ${y + 25} 255 ${y + 8}`} stroke={GLOVE_LIT} strokeWidth="12" opacity="0.8" />
    {/* иней на перчатке */}
    <circle cx="230" cy={y + 30} r="4" fill="#eef4f8" opacity="0.8" />
    <circle cx="205" cy={y + 62} r="3" fill="#eef4f8" opacity="0.7" />
  </g>
);

/** Сцена 8: от первого лица — Стас держит в руках фото брата. Медленно вглядывается в окно лачуги: там то самое лицо. */
export const Scene08 = () => {
  const t = useT();
  // взгляд медленно сужается к окну на фото
  const z = interpolate(t, [0.8, DUR], [1, 2.6], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.45, 0, 0.25, 1) });
  // руки чуть дрожат от холода и дышат
  const bx = Math.sin(t * 1.1) * 4 + Math.sin(t * 23) * 0.8;
  const by = Math.sin(t * 1.3) * 7;
  const rot = -3 + Math.sin(t * 0.8) * 0.6;
  return (
    <AbsoluteFill style={{ background: "#050709", overflow: "hidden" }}>
      <Sfx name="sfx/wind_light" vol={0.2} loop duck={TL} />
      <Sfx name="music/drone" vol={0.35} duck={TL} />
      <Sfx at={TL.at.n10.to - 1} name="sfx/heartbeat" vol={0.55} />
      <Sfx at={0.2} name="sfx/rustle" vol={0.6} />
      <Voices tl={TL} />
      <AbsoluteFill style={{ transformOrigin: `${WIN.x}px ${WIN.y}px`, transform: `scale(${z})` }}>
        {/* под ногами тёмный снег в пятне фонаря */}
        <Svg>
          <rect width={1080} height={1920} fill="#0a0e12" />
          <ellipse cx="540" cy="1250" rx="700" ry="520" fill="#2a3138" opacity="0.6" />
          <path d="M-50 1500 C300 1440 700 1480 1130 1420 V1960 H-50 Z" fill="#1a2026" />
        </Svg>
        <AbsoluteFill style={{ transform: `translate(${bx}px,${by}px) rotate(${rot}deg)`, transformOrigin: "50% 60%" }}>
          <Svg>
            <Hand side={1} />
            <Hand side={-1} />
            <Photo x={P.x} y={P.y} s={P.s} rot={0} t={0} />
            <Thumb side={1} y={960} />
            <Thumb side={-1} y={1010} />
          </Svg>
        </AbsoluteFill>
      </AbsoluteFill>
      {/* тёплый свет фонарика, снег и тьма по краям — не масштабируются */}
      <AbsoluteFill style={{ mixBlendMode: "overlay", background: "radial-gradient(45% 30% at 50% 47%,rgba(230,150,70,.55) 0%,rgba(0,0,0,0) 100%)" }} />
      <Snow t={t} n={16} opacity={0.45} speed={0.3} wind={0.1} />
      <Finish vig={1} tint="#1b3350" tintOpacity={0.18} grain={1.1} />
      <Subtitle t={t} cues={TL.cues} />
    </AbsoluteFill>
  );
};
