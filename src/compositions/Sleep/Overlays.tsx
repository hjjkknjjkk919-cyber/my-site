import React from "react";
import { AbsoluteFill } from "remotion";
import { Face2 } from "../../train/Dima2";
import { type BedState, project } from "./Bedroom3D";

const RIM = "#7fb3d5";
const SKIN = "#b8bcc2";
const SKIN_SH = "#8c9198";
const CLOAK = "#1a1e24";
const HAIR = "#1e2126";

/** Кисть монстра: бледная ладонь и длинные тонкие пальцы со скруглёнными кончиками — БЕЗ когтей. */
const Hand = ({ x, y, rot = 0, spread = 1 }: { x: number; y: number; rot?: number; spread?: number }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(1.6)`}>
    {[-1.5, -0.5, 0.5, 1.5].map((k, i) => (
      <g key={i} transform={`rotate(${k * 9 * spread})`}>
        <line x1={k * 7} y1={0} x2={k * 7} y2={96 - Math.abs(k) * 12} stroke="#0a0b0e" strokeWidth={11} strokeLinecap="round" />
        <line x1={k * 7} y1={0} x2={k * 7} y2={96 - Math.abs(k) * 12} stroke={SKIN} strokeWidth={6.5} strokeLinecap="round" />
      </g>
    ))}
    <g transform={`rotate(${-48 * spread})`}>
      <line x1={-14} y1={-4} x2={-14} y2={40} stroke="#0a0b0e" strokeWidth={13} strokeLinecap="round" />
      <line x1={-14} y1={-4} x2={-14} y2={40} stroke={SKIN} strokeWidth={8} strokeLinecap="round" />
    </g>
    <ellipse cx={0} cy={-6} rx={22} ry={18} fill={SKIN} stroke="#0a0b0e" strokeWidth={3} />
    <path d="M-20 -14 q10 -8 22 -4" stroke={RIM} strokeWidth={3} fill="none" />
  </g>
);

/** Голова-гибрид: вытянутое бледное лицо, зачёсанные волосы с пробором, глаза в тёмных кругах с точками-зрачками, ухмылка от щеки до щеки. Центр — (0,-990). */
const Head = ({ pupil, grin }: { pupil: number; grin: number }) => {
  const gw = 58 + grin * 14;
  return (
    <g>
      <path d="M0 -1115 C-62 -1115 -78 -1050 -76 -990 C-74 -925 -50 -875 0 -868 C50 -875 74 -925 76 -990 C78 -1050 62 -1115 0 -1115 Z" fill={SKIN} stroke="#0a0b0e" strokeWidth={4} />
      {/* впалые скулы */}
      {[-1, 1].map((d) => <ellipse key={d} cx={d * 46} cy={-950} rx={16} ry={30} fill={SKIN_SH} opacity={0.7} />)}
      {/* волосы зачёсаны назад, высокий лоб, резкий пробор */}
      <path d="M-78 -1010 C-84 -1100 -40 -1132 6 -1132 C52 -1130 86 -1100 78 -1010 C70 -1060 50 -1080 18 -1084 L10 -1060 L2 -1086 C-36 -1082 -66 -1062 -78 -1010 Z" fill={HAIR} stroke="#0a0b0e" strokeWidth={3} />
      <path d="M8 -1130 L6 -1064" stroke="#3a3f47" strokeWidth={3} />
      {/* глаза в концентрических тёмных кругах */}
      {[-30, 30].map((cx) => (
        <g key={cx}>
          {[26, 20, 14].map((r, i) => <ellipse key={r} cx={cx} cy={-1002} rx={r} ry={r * 0.9} fill="#24272d" opacity={0.35 + i * 0.25} />)}
          <circle cx={cx} cy={-1002} r={9} fill="#f2f2ee" />
          <circle cx={cx + pupil * 5} cy={-1002} r={2.6} fill="#111" />
        </g>
      ))}
      {/* натянутая ухмылка с вертикальными линиями зубов */}
      <path d={`M${-gw} -946 Q0 ${-918 + grin * 6} ${gw} -946 Q0 ${-932 + grin * 4} ${-gw} -946 Z`} fill="#2a0f12" stroke="#0a0b0e" strokeWidth={3} />
      <path d={`M${-gw + 8} -944 Q0 ${-926 + grin * 5} ${gw - 8} -944`} stroke="#e6e0d2" strokeWidth={6} fill="none" />
      {Array.from({ length: 13 }, (_, i) => {
        const x = -gw + 10 + ((gw * 2 - 20) * i) / 12;
        return <line key={i} x1={x} y1={-948} x2={x} y2={-938 + (1 - Math.abs(x / gw)) * 6} stroke="#0a0b0e" strokeWidth={1.4} />;
      })}
      {[-1, 1].map((d) => <path key={d} d={`M${d * gw} -946 q${d * 8} -6 ${d * 10} -14`} stroke="#0a0b0e" strokeWidth={2} fill="none" />)}
      {/* холодный контровой блик */}
      <path d="M-74 -1030 C-78 -980 -64 -920 -30 -880" stroke={RIM} strokeWidth={4} fill="none" opacity={0.9} />
    </g>
  );
};

export type MPose = "stand" | "lean" | "peek" | "crouch";
/**
 * Монстр-гибрид (2D-слой поверх ThreeCanvas, чёткий, без blur). Начало координат — стопы; рост ≈ 1130 единиц.
 * Ноги целые и сгибаются только вперёд; пальцы без когтей.
 */
export const Monster = ({ pose, tilt, pupil, grin, hands, t }: { pose: MPose; tilt: number; pupil: number; grin: number; hands: "down" | "glass" | "edge"; t: number }) => {
  const crouch = pose === "crouch";
  const lean = pose === "lean" ? 14 : pose === "peek" ? 6 : crouch ? 22 : 4;
  const hipY = crouch ? -300 : -430;
  const br = Math.sin(t * 1.4) * 4;
  return (
    <g>
      {/* ноги: бедро → колено (вперёд) → стопа на полу */}
      {[-1, 1].map((d) => {
        const knee = crouch ? [d * 34 + 40, -250] : [d * 30 + 10, -220];
        const foot = [d * 34, -12];
        const path = `M${d * 28} ${hipY} L${knee[0]} ${knee[1]} L${foot[0]} ${foot[1]}`;
        return (
          <g key={d}>
            <path d={path} stroke="#0a0b0e" strokeWidth={34} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d={path} stroke="#15181d" strokeWidth={27} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d={`M${foot[0] - 14} 0 C${foot[0] - 14} -22 ${foot[0] + 30} -24 ${foot[0] + 44} 0 Z`} fill="#0d0f13" stroke="#0a0b0e" strokeWidth={3} />
          </g>
        );
      })}
      <g transform={`rotate(${lean} 0 ${hipY}) translate(0 ${br})`}>
        {/* плащ с глухим высоким воротником */}
        <path d={`M-74 -820 C-104 -700 -100 -560 -96 ${hipY + 40} L96 ${hipY + 40} C100 -560 104 -700 74 -820 C40 -846 -40 -846 -74 -820 Z`} fill={CLOAK} stroke="#0a0b0e" strokeWidth={4} />
        <path d="M-40 -880 L-46 -812 L46 -812 L40 -880 C20 -868 -20 -868 -40 -880 Z" fill="#14171c" stroke="#0a0b0e" strokeWidth={3} />
        <path d={`M74 -820 C104 -700 100 -560 96 ${hipY + 40}`} stroke={RIM} strokeWidth={4} fill="none" opacity={0.75} />
        {/* руки-рукава к кистям */}
        {hands === "down" &&
          [-1, 1].map((d) => (
            <g key={d}>
              <path d={`M${d * 70} -800 C${d * 96} -700 ${d * 104} -600 ${d * 96} -520`} stroke={CLOAK} strokeWidth={30} fill="none" strokeLinecap="round" />
              <Hand x={d * 96} y={-514} rot={d * -6} spread={0.7} />
            </g>
          ))}
        {hands === "glass" && (
          <g>
            <path d="M-70 -800 C-96 -700 -100 -600 -94 -520" stroke={CLOAK} strokeWidth={30} fill="none" strokeLinecap="round" />
            <Hand x={-94} y={-514} rot={8} spread={0.6} />
            <path d="M70 -800 C120 -800 150 -860 150 -930" stroke={CLOAK} strokeWidth={30} fill="none" strokeLinecap="round" />
            <Hand x={150} y={-936} rot={180} spread={1.3} />
          </g>
        )}
        {hands === "edge" &&
          [-1, 1].map((d) => (
            <g key={d}>
              <path d={`M${d * 70} -800 C${d * 130} -760 ${d * 150} -720 ${d * 160} -690`} stroke={CLOAK} strokeWidth={30} fill="none" strokeLinecap="round" />
              <Hand x={d * 160} y={-690} rot={d * -14} spread={0.9} />
            </g>
          ))}
        {/* шея и голова (наклон вокруг основания шеи) */}
        <path d="M-14 -880 L-12 -860 L12 -860 L14 -880 Z" fill={SKIN_SH} />
        <g transform={`rotate(${tilt} 0 -870)`}>
          <Head pupil={pupil} grin={grin} />
        </g>
      </g>
    </g>
  );
};

/** Монстр в кадре: позиция по проекции 3D-точки стоп, масштаб по глубине; clip — обрезка по окну/изножью. */
export const MonsterLayer = ({ s, at, pose, tilt, pupil, grin, hands, clip, bars }: { s: BedState; at: [number, number, number]; pose: MPose; tilt: number; pupil: number; grin: number; hands: "down" | "glass" | "edge"; clip?: [number, number, number][]; bars?: boolean }) => {
  const p = project(s, at);
  const sc = (p.ppm * 2.05) / 1130;
  const poly = clip?.map((q) => project(s, q)).map((q) => `${q.x},${q.y}`).join(" ");
  const W = (q: [number, number, number]) => project(s, q);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        {poly && <defs><clipPath id="mclip"><polygon points={poly} /></clipPath></defs>}
        <g clipPath={poly ? "url(#mclip)" : undefined}>
          <g transform={`translate(${p.x} ${p.y}) scale(${sc})`}>
            <Monster pose={pose} tilt={tilt} pupil={pupil} grin={grin} hands={hands} t={s.t} />
          </g>
          {/* за стеклом: рама и переплёт поверх силуэта, лёгкий блик стекла */}
          {bars && (
            <g>
              <polygon points={poly} fill="#9fb7e0" opacity={0.06} />
              {[-0.4, 0, 0.4].map((x) => {
                const a = W([x, 0.73, -3.18]);
                const b = W([x, 2.08, -3.18]);
                return <line key={x} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#cfcabd" strokeWidth={x === 0 ? 9 : 6} />;
              })}
              {(() => {
                const a = W([-0.8, 1.45, -3.18]);
                const b = W([0.8, 1.45, -3.18]);
                return <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#cfcabd" strokeWidth={6} />;
              })()}
            </g>
          )}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/** Старый Дима из «Электрички» на кровати: бегают глаза, сужаются зрачки, стучит сердце. */
export const DimaBed = ({ stage, k, t, bpm, flinch = 0 }: { stage: 1 | 2 | 3; k: number; t: number; bpm: number; flinch?: number }) => {
  const beat = ((t * bpm) / 60) % 1;
  const pulse = beat < 0.1 ? 1 - beat / 0.1 : 0;
  const zoom = (stage === 1 ? 1 + 0.05 * k : stage === 2 ? 1.08 + 0.1 * k : 1.1) + pulse * 0.012;
  const shake = stage === 2 ? [Math.sin(t * 43) * 2.5, Math.cos(t * 37) * 2.5] : [0, flinch * Math.sin(t * 60) * 6];
  const sacc = [-0.7, 0.5, -0.3, 0.8, -0.6, 0.2][Math.floor(t * (stage === 2 ? 4 : 2.5)) % 6];
  const look: [number, number] = stage === 1 ? [sacc * 0.8, -0.5] : stage === 2 ? [sacc, -0.2] : [0.1, 0.25];
  const fear = stage === 1 ? 0.3 + 0.35 * k : stage === 2 ? 0.85 + 0.15 * k : 1;
  return (
    <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
      <defs>
        <radialGradient id="dbBlue" cx="0.4" cy="0.3" r="0.6">
          <stop offset="0%" stopColor="#7fa6ff" stopOpacity={0.3} />
          <stop offset="100%" stopColor="#7fa6ff" stopOpacity={0} />
        </radialGradient>
        <radialGradient id="dbVig" cx="0.5" cy="0.47" r="0.7">
          <stop offset="55%" stopColor="#000" stopOpacity={0} />
          <stop offset="100%" stopColor="#000" stopOpacity={0.85} />
        </radialGradient>
      </defs>
      <rect width={1080} height={1920} fill="#05070b" />
      <g transform={`translate(${540 + shake[0]} ${960 + shake[1]}) scale(${zoom}) translate(-540 -960)`}>
        {/* тёмная подушка */}
        <rect x={90} y={420} width={900} height={1000} rx={170} fill="#1f2530" />
        <path d="M150 480 Q540 420 930 480" stroke="#2c3442" strokeWidth={18} fill="none" />
        {stage === 3 && [[250, 1180], [830, 1190]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={60 + k * 50} ry={30 + k * 22} fill="#0d1118" opacity={0.7 * k} />)}
        <Face2 t={t} fear={fear} eyes={stage === 2 ? 1.28 : stage === 3 ? 0.85 : 1.15} look={look} mouth={stage === 2 ? "clench" : "closed"} sweat={stage === 1 ? 0.55 : stage === 2 ? 1 : 0.3} tear={stage === 3 ? Math.min(1, k * 1.6) : 0} tremble={stage === 2 ? 1 : stage === 3 ? 0.6 : 0} bed />
        {/* левая слеза (правую рисует Face2) */}
        {stage === 3 && k > 0.25 && (
          <g>
            <path d={`M440 920 C438 ${960} 434 ${920 + (k - 0.25) * 340 - 20} 432 ${920 + (k - 0.25) * 340}`} stroke="#cfe6f7" strokeWidth={8} fill="none" opacity={0.6} strokeLinecap="round" />
            <ellipse cx={432} cy={924 + (k - 0.25) * 340} rx={9} ry={13} fill="#bcd8ee" opacity={0.85} stroke="#7fa6c9" strokeWidth={2} />
          </g>
        )}
        {/* водянистый блеск соплей под ноздрями */}
        {stage === 3 && (
          <g opacity={Math.min(1, k * 2)}>
            {[512, 568].map((x) => <path key={x} d={`M${x - 10} 1022 C${x - 12} ${1040 + k * 10} ${x + 12} ${1040 + k * 10} ${x + 10} 1022 Z`} fill="rgba(225,235,245,0.45)" stroke="rgba(255,255,255,0.6)" strokeWidth={1.5} />)}
            {[508, 564].map((x) => <circle key={x} cx={x} cy={1030} r={3} fill="#fff" opacity={0.85} />)}
          </g>
        )}
        {/* одеяло до плеч */}
        <path d="M60 1460 Q540 1380 1020 1460 L1040 1920 L40 1920 Z" fill="#1a2639" stroke="#0e1420" strokeWidth={6} />
        {[0, 1, 2].map((i) => <path key={i} d={`M${160 + i * 260} ${1520 + i * 20} q90 40 180 0`} stroke="#121b2a" strokeWidth={10} fill="none" />)}
        <ellipse cx={460} cy={700} rx={320} ry={240} fill="url(#dbBlue)" />
      </g>
      {/* край тумбочки с полным циферблатом 03:17 */}
      <g transform="rotate(-6 200 330)">
        <rect x={20} y={230} width={340} height={220} rx={12} fill="#2a1c12" stroke="#120c08" strokeWidth={5} />
        <rect x={60} y={270} width={250} height={100} rx={12} fill="#050505" stroke="#222" strokeWidth={4} />
        <text x={185} y={346} textAnchor="middle" fontFamily="monospace" fontWeight={900} fontSize={70} fill="#ff2020" style={{ filter: "drop-shadow(0 0 10px #ff0000)" }}>03:17</text>
      </g>
      {/* пульс: красная кромка на ударе */}
      <rect width={1080} height={1920} fill="url(#dbVig)" />
      <rect width={1080} height={1920} fill="none" stroke="#ff1a1a" strokeWidth={60} opacity={pulse * 0.25} />
    </svg>
  );
};

/** VHS-слой: болотная зелень, зерно, строки развёртки, полоса трекинга, виньетка. */
export const Vhs = ({ f }: { f: number }) => {
  const t = f / 30;
  const track = (t % 7.3) > 6.9 ? ((t % 7.3) - 6.9) / 0.4 : -1;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "#3b4a24", mixBlendMode: "color", opacity: 0.32 }} />
      <AbsoluteFill style={{ background: "#6f7d52", mixBlendMode: "multiply", opacity: 0.35 }} />
      <AbsoluteFill style={{ mixBlendMode: "overlay", opacity: 0.32 }}>
        <svg width={1080} height={1920}>
          <filter id="vhsg">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={f % 23} stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width={1080} height={1920} filter="url(#vhsg)" />
        </svg>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,.22) 0px, rgba(0,0,0,.22) 2px, transparent 2px, transparent 5px)" }} />
      {track >= 0 && <div style={{ position: "absolute", left: 0, right: 0, top: 1920 * (1 - track) - 60, height: 70, background: "linear-gradient(180deg, transparent, rgba(220,230,210,.18), rgba(255,255,255,.08), transparent)", transform: `translateX(${Math.sin(f) * 12}px)` }} />}
      <AbsoluteFill style={{ background: "radial-gradient(75% 60% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,.65) 100%)" }} />
    </AbsoluteFill>
  );
};
