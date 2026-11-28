import React from "react";
import { AbsoluteFill } from "remotion";
import { DimaFace } from "../../train/GostOld";
import { type BedState, project } from "./Bedroom3D";

const RIM = "#8ab4f8";
const SKIN = "#b8bcc2";
const SKIN_SH = "#8c9198";
const CLOAK = "#1a1e24";
const HAIR = "#1a1d22";

/** Кисть монстра: бледная ладонь и длинные тонкие пальцы со скруглёнными кончиками — БЕЗ когтей. */
/** Кисть монстра: 4 длинных пальца веером, каждый из своей костяшки (расходятся, не пересекаются), большой палец сбоку ладони. Без когтей. */
const fingerPath = (bx: number, by: number, deg: number, deg2: number, len: number) => {
  const a = (deg * Math.PI) / 180;
  const b = (deg2 * Math.PI) / 180;
  const jx = bx + Math.sin(a) * len * 0.55;
  const jy = by + Math.cos(a) * len * 0.55;
  return `M${bx} ${by} L${jx} ${jy} L${jx + Math.sin(b) * len * 0.45} ${jy + Math.cos(b) * len * 0.45}`;
};
const Hand = ({ x, y, rot = 0, spread = 1 }: { x: number; y: number; rot?: number; spread?: number }) => {
  const fingers = [-1.5, -0.5, 0.5, 1.5].map((k, i) => {
    const deg = k * 8 * spread;
    return fingerPath(k * 13, 4, deg, deg * 1.35, [74, 90, 86, 70][i]);
  });
  const t1 = -(38 + 12 * spread);
  const thumb = fingerPath(-21, -6, t1, t1 + 22, 46);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(1.6)`}>
      <path d={thumb} stroke="#0a0b0e" strokeWidth={12.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d={thumb} stroke={SKIN} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {fingers.map((d, i) => (
        <g key={i}>
          <path d={d} stroke="#0a0b0e" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d={d} stroke={SKIN} strokeWidth={6.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>
      ))}
      <path d="M-26 -18 C-26 -28 26 -28 26 -18 L27 6 C27 14 -27 14 -27 6 Z" fill={SKIN} stroke="#0a0b0e" strokeWidth={3} />
      <path d="M-20 -16 q10 -8 22 -4" stroke={RIM} strokeWidth={3} fill="none" />
    </g>
  );
};

const FACE = "M0 -1118 C-60 -1118 -80 -1052 -78 -992 C-76 -930 -56 -880 0 -866 C56 -880 76 -930 78 -992 C80 -1052 60 -1118 0 -1118 Z";
const hash = (n: number) => {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};
/** Голова-гибрид: мертвенное вытянутое лицо с бумажной фактурой, впалые скулы, носогубные складки, растрёпанные пряди, ОГРОМНЫЕ налитые кровью глаза в чёрных провалах с дёргающимися точками-зрачками, ухмылка от щеки до щеки. Центр — (0,-990). */
const Head = ({ pupil, grin, t }: { pupil: number; grin: number; t: number }) => {
  const gw = 62 + grin * 14;
  const ph = Math.floor(t * 3.3);
  const px = pupil * 6 + (hash(ph) - 0.5) * 7;
  const py = (hash(ph + 31) - 0.5) * 5;
  return (
    <g>
      <defs>
        <clipPath id="mFace"><path d={FACE} /></clipPath>
        <radialGradient id="mEye" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#f1e4dc" />
          <stop offset="0.5" stopColor="#e0a297" />
          <stop offset="1" stopColor="#7e0910" />
        </radialGradient>
        <filter id="mPaper" x="0" y="0" width="1" height="1">
          <feTurbulence type="fractalNoise" baseFrequency="0.22" numOctaves="2" seed="7" />
          <feColorMatrix values="0 0 0 0 0.08  0 0 0 0 0.08  0 0 0 0 0.1  0 0 0 0.6 -0.18" />
        </filter>
      </defs>
      <path d={FACE} fill={SKIN} stroke="#0a0b0e" strokeWidth={4} />
      <rect x={-80} y={-1120} width={160} height={256} filter="url(#mPaper)" clipPath="url(#mFace)" />
      {/* впалые скулы и носогубные складки */}
      {[-1, 1].map((d) => (
        <g key={d}>
          <ellipse cx={d * 50} cy={-950} rx={18} ry={34} fill={SKIN_SH} opacity={0.8} />
          <ellipse cx={d * 54} cy={-946} rx={8} ry={22} fill="#5f646b" opacity={0.55} />
          <path d={`M${d * 12} -974 C${d * 30} -964 ${d * 44} -956 ${d * (gw - 2)} -946`} stroke="#4e5359" strokeWidth={3} fill="none" />
        </g>
      ))}
      <path d="M3 -1004 C1 -990 -6 -978 -10 -972 C-4 -967 7 -967 11 -972" stroke="#2b2e33" strokeWidth={2.6} fill="none" strokeLinecap="round" />
      {/* волосы с пробором + растрёпанные пряди */}
      <path d="M-78 -1010 C-84 -1100 -40 -1132 6 -1132 C52 -1130 86 -1100 78 -1010 C70 -1060 50 -1080 18 -1084 L10 -1060 L2 -1086 C-36 -1082 -66 -1062 -78 -1010 Z" fill={HAIR} stroke="#0a0b0e" strokeWidth={3} />
      <path d="M8 -1130 L6 -1064" stroke="#3a3f47" strokeWidth={3} />
      <g stroke={HAIR} strokeWidth={5} strokeLinecap="round" fill="none">
        <path d="M-30 -1082 C-46 -1054 -40 -1032 -52 -1004" />
        <path d="M-10 -1086 C-16 -1062 -6 -1044 -18 -1022" />
        <path d="M34 -1082 C52 -1058 50 -1036 62 -1012" />
        <path d="M56 -1074 C70 -1050 74 -1030 70 -1000" />
      </g>
      {/* огромные налитые кровью глаза в чёрных провалах, зрачки-точки дёргаются */}
      {[-32, 32].map((cx) => (
        <g key={cx}>
          {[40, 32, 25].map((r, i) => <ellipse key={r} cx={cx} cy={-1004} rx={r} ry={r * 0.92} fill="#08090b" opacity={0.42 + i * 0.27} />)}
          <circle cx={cx} cy={-1004} r={17} fill="url(#mEye)" stroke="#3a0507" strokeWidth={1.6} />
          <path d={`M${cx - 17} -1006 l7 2 l4 -3 M${cx + 17} -1001 l-7 -1 l-3 4 M${cx - 4} -1021 l2 7 l-3 4 M${cx + 6} -987 l-2 -6 l3 -3`} stroke="#b0121a" strokeWidth={1.3} fill="none" />
          <circle cx={cx + px} cy={-1004 + py} r={2.3} fill="#050505" />
          <circle cx={cx - 6} cy={-1010} r={1.6} fill="#fff" opacity={0.85} />
        </g>
      ))}
      {/* натянутая ухмылка от щеки до щеки с мелкими вертикальными зубами */}
      <path d={`M${-gw} -946 Q0 ${-918 + grin * 6} ${gw} -946 Q0 ${-932 + grin * 4} ${-gw} -946 Z`} fill="#2a0507" stroke="#0a0b0e" strokeWidth={3} />
      <path d={`M${-gw + 8} -944 Q0 ${-926 + grin * 5} ${gw - 8} -944`} stroke="#e6e0d2" strokeWidth={6} fill="none" />
      {Array.from({ length: 15 }, (_, i) => {
        const x = -gw + 10 + ((gw * 2 - 20) * i) / 14;
        return <line key={i} x1={x} y1={-948} x2={x} y2={-938 + (1 - Math.abs(x / gw)) * 6} stroke="#0a0b0e" strokeWidth={1.4} />;
      })}
      <path d={`M${-gw + 12} -941 Q0 ${-924 + grin * 5} ${gw - 12} -941`} stroke="#7a0a10" strokeWidth={3} fill="none" opacity={0.85} />
      {[-1, 1].map((d) => <path key={d} d={`M${d * gw} -946 q${d * 8} -6 ${d * 10} -14`} stroke="#0a0b0e" strokeWidth={2} fill="none" />)}
      {/* холодный контровой блик */}
      <path d="M-74 -1030 C-78 -980 -64 -920 -30 -880" stroke={RIM} strokeWidth={4} fill="none" opacity={0.9} />
    </g>
  );
};

/** Кровь изо рта: точки рта поворачиваются вместе с головой, а капли стекают строго вниз (гравитация), растут и срываются. */
const Blood = ({ tilt, grin, t }: { tilt: number; grin: number; t: number }) => {
  const gw = 62 + grin * 14;
  const a = (tilt * Math.PI) / 180;
  const rot = (x: number, y: number) => [x * Math.cos(a) - (y + 870) * Math.sin(a), -870 + x * Math.sin(a) + (y + 870) * Math.cos(a)];
  const src = [[-gw, -945], [-gw * 0.5, -936], [6, -930], [gw * 0.6, -936], [gw, -945]];
  return (
    <g>
      {src.map(([x, y], i) => {
        const [bx, by] = rot(x, y);
        const ph = (t * (0.28 + i * 0.06) + i * 0.29) % 1;
        const len = 24 + i * 10 + ph * 70;
        const wob = Math.sin(i * 2.1) * 4;
        return (
          <g key={i}>
            <path d={`M${bx} ${by} C${bx + wob} ${by + len * 0.4} ${bx - wob} ${by + len * 0.7} ${bx} ${by + len}`} stroke="#5e040a" strokeWidth={13 - i * 0.8} fill="none" strokeLinecap="round" />
            <path d={`M${bx} ${by} L${bx} ${by + len * 0.8}`} stroke="#9a1018" strokeWidth={2.5} fill="none" strokeLinecap="round" opacity={0.8} />
            <ellipse cx={bx} cy={by + len + 5} rx={7} ry={10} fill="#7a0a10" />
            {ph > 0.75 && <ellipse cx={bx} cy={by + len + 14 + (ph - 0.75) * 260} rx={3.4} ry={5} fill="#7a0a10" opacity={1 - (ph - 0.75) * 3} />}
          </g>
        );
      })}
    </g>
  );
};

export type MPose = "stand" | "lean" | "peek" | "crouch";
/**
 * Монстр-гибрид (2D-слой поверх ThreeCanvas, чёткий, без blur). Начало координат — стопы; рост ≈ 1130 единиц.
 * Ноги целые и сгибаются только вперёд; пальцы без когтей.
 */
export const Monster = ({ pose, tilt, pupil, grin, hands, t }: { pose: MPose; tilt: number; pupil: number; grin: number; hands: "down" | "glass" | "edge" | "none"; t: number }) => {
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
          <Head pupil={pupil} grin={grin} t={t} />
          {/* растянутая сломанная шея */}
          {Math.abs(tilt) > 30 && <path d="M-16 -872 C-10 -900 10 -900 16 -872" stroke="#5f646b" strokeWidth={3} fill="none" />}
        </g>
        <Blood tilt={tilt} grin={grin} t={t} />
      </g>
    </g>
  );
};

/** Монстр в кадре: позиция по проекции 3D-точки стоп, масштаб по глубине; clip — обрезка по окну/изножью; grip — костлявые кисти вцепились в верхний край изножья (поверх доски); картонная падающая тень. */
export const MonsterLayer = ({ s, at, pose, tilt, pupil, grin, hands, clip, bars, grip }: { s: BedState; at: [number, number, number]; pose: MPose; tilt: number; pupil: number; grin: number; hands: "down" | "glass" | "edge" | "none"; clip?: [number, number, number][]; bars?: boolean; grip?: boolean }) => {
  const p = project(s, at);
  const sc = (p.ppm * 2.05) / 1130;
  const poly = clip?.map((q) => project(s, q)).map((q) => `${q.x},${q.y}`).join(" ");
  const W = (q: [number, number, number]) => project(s, q);
  const body = <Monster pose={pose} tilt={tilt} pupil={pupil} grin={grin} hands={hands} t={s.t} />;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        <defs>
          {poly && <clipPath id="mclip"><polygon points={poly} /></clipPath>}
          <filter id="mShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" />
            <feGaussianBlur stdDeviation={14} />
          </filter>
        </defs>
        <g clipPath={poly ? "url(#mclip)" : undefined}>
          {!bars && (
            <g transform={`translate(${p.x + 34} ${p.y + 12}) scale(${sc})`} filter="url(#mShadow)" opacity={0.6}>
              {body}
            </g>
          )}
          <g transform={`translate(${p.x} ${p.y}) scale(${sc})`}>{body}</g>
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
        {/* кисти поверх изножья: ладонь на верхнем крае, длинные пальцы свисают по передней стороне доски */}
        {grip &&
          ([[-0.44, -1], [0.44, 1]] as const).map(([x, d]) => {
            const q = W([x, 0.62, -1.7]);
            const hs = (q.ppm * 2.05 * 0.62) / 1130;
            const sq = Math.sin(s.t * 5 + d) * 2;
            return (
              <g key={x} transform={`translate(${q.x} ${q.y}) scale(${hs})`}>
                <Hand x={0} y={-8 + sq} rot={d * 3} spread={0.3} />
                <path d="M-40 -2 Q0 -14 40 -2" stroke={RIM} strokeWidth={3} fill="none" opacity={0.7} />
              </g>
            );
          })}
      </svg>
    </AbsoluteFill>
  );
};

/** Маленький Дима из «Электрички» (DimaFace из GostOld + тело Sleeper в куртке) — лежит на подушке: дышит грудью и плечами, бегают глаза, сужаются зрачки, стучит сердце; talk — шевелит губами на своих репликах. */
export const DimaBed = ({ stage, k, t, bpm, flinch = 0, talk = false }: { stage: 1 | 2 | 3; k: number; t: number; bpm: number; flinch?: number; talk?: boolean }) => {
  const LN = "#2b1d16";
  const JK = "#3b4d63";
  const JK_SH = "#2a384a";
  const beat = ((t * bpm) / 60) % 1;
  const pulse = beat < 0.1 ? 1 - beat / 0.1 : 0;
  const breath = Math.sin(t * 4.2) * (stage === 2 ? 12 : 8); // breathCycle из ТЗ
  const zoom = (stage === 1 ? 1 + 0.05 * k : stage === 2 ? 1.08 + 0.14 * k : 1.1) + pulse * 0.012 + breath * 0.001;
  const shake = stage === 2 ? [Math.sin(t * 43) * 3, Math.cos(t * 37) * 3] : [0, flinch * Math.sin(t * 60) * 6];
  // глаза: стадия 1 — микро-вздёрги каждые 12 кадров в сторону ног; стадия 2 — рывки каждые 6 кадров + высокочастотная дрожь
  const fr = Math.floor(t * 30);
  const n1 = Math.floor(fr / 12);
  const n2 = Math.floor(fr / 6);
  const look: [number, number] =
    stage === 1 ? [(hash(n1) - 0.5) * 0.8, 0.45 + hash(n1 + 7) * 0.3] : stage === 2 ? [(hash(n2) - 0.5) * 0.5 + Math.sin(t * 68) * 0.11, 0.35 + (hash(n2 + 3) - 0.5) * 0.4 + Math.cos(t * 71) * 0.08] : [0.1, 0.3];
  const fear = stage === 1 ? 0.35 + 0.35 * k : 1;
  // Дима сам моргает (0.17 с), в ужасе почти не моргает
  const per = stage === 2 ? 4.2 : 2.3;
  const bu = (t + 0.7) % per;
  const lid = bu < 0.17 ? Math.sin((bu / 0.17) * Math.PI) : 0;
  const lip = Math.sin(t * 15) > 0;
  const mouth = talk ? (lip ? "open" : stage === 2 ? "grit" : "o") : stage === 2 ? "grit" : "closed";
  return (
    <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
      <defs>
        <radialGradient id="dbBlue" cx="0.42" cy="0.32" r="0.55">
          <stop offset="0%" stopColor="#7fa6ff" stopOpacity={0.28} />
          <stop offset="100%" stopColor="#7fa6ff" stopOpacity={0} />
        </radialGradient>
        <radialGradient id="dbVig" cx="0.5" cy="0.45" r="0.7">
          <stop offset="55%" stopColor="#000" stopOpacity={0} />
          <stop offset="100%" stopColor="#000" stopOpacity={0.85} />
        </radialGradient>
      </defs>
      <rect width={1080} height={1920} fill="#05070b" />
      <g transform={`translate(${540 + shake[0]} ${900 + shake[1]}) scale(${zoom}) translate(-540 -900)`}>
        {/* подушка + мокрые пятна от слёз */}
        <rect x={150} y={470} width={780} height={760} rx={150} fill="#1f2530" />
        <path d="M210 520 Q540 470 870 520" stroke="#2c3442" strokeWidth={16} fill="none" />
        {stage === 3 && [[300, 1040], [780, 1050]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={50 + k * 40} ry={26 + k * 18} fill="#0d1118" opacity={0.7 * k} />)}
        {/* тело из «Электрички»: куртка; грудь и плечи ходят от дыхания */}
        <g transform={`translate(0 ${breath * 0.5})`}>
          <path d={`M110 1920 C120 1560 ${190 - breath * 0.6} 1280 ${370 - breath * 0.8} ${1170 - breath * 0.4} L${710 + breath * 0.8} ${1170 - breath * 0.4} C${890 + breath * 0.6} 1280 960 1560 970 1920 Z`} fill={JK} stroke={LN} strokeWidth={9} />
          <path d="M710 1180 C880 1280 960 1560 970 1920 H840 C850 1680 820 1400 710 1180 Z" fill={JK_SH} />
          <path d="M540 1220 V1920" stroke={LN} strokeWidth={6} />
          <path d="M380 1190 C420 1150 470 1140 540 1146 C610 1140 660 1150 700 1190 L690 1230 C640 1202 600 1196 540 1198 C480 1196 440 1202 390 1230 Z" fill={JK_SH} stroke={LN} strokeWidth={6} />
        </g>
        {/* голова на подушке — тот же масштаб, что в «Электричке» */}
        <g transform={`translate(0 ${breath * 0.2}) translate(540 880) scale(0.62) translate(-540 -900)`}>
          <DimaFace t={t} fear={fear} eyes={(stage === 2 ? 1.3 : stage === 3 ? 1.1 : 1.15) * (1 - 0.96 * lid)} bulge={stage === 2 ? 1.14 : stage === 3 ? 1.04 : 1} veins={stage === 2 ? 1 : stage === 3 ? 0.85 : 0.25} look={look} mouth={mouth} sweat={stage === 1 ? 0.6 : stage === 2 ? 1 : 0.3} tears={stage === 3 ? Math.min(1, k * 1.5) : 0} tremble={stage === 2 ? 1 : stage === 3 ? 0.6 : 0} />
          {/* стадия 1: капля пота ползёт по виску */}
          {stage === 1 && (() => {
            const y = 640 + ((t * 0.32) % 1) * 300;
            return <path d={`M246 ${y - 30} C262 ${y - 6} 262 ${y + 14} 246 ${y + 14} C230 ${y + 14} 230 ${y - 6} 246 ${y - 30} Z`} fill="#bfe3f6" stroke="#2b1d16" strokeWidth={3} opacity={0.9} />;
          })()}
          {/* стадия 2: 4 дорожки холодного пота по лбу и щетине */}
          {stage === 2 && [330, 470, 640, 770].map((x, i) => {
            const L = 80 + Math.min(1, k * 1.4 + i * 0.1) * 260;
            return (
              <g key={x}>
                <path d={`M${x} 710 C${x + 8} ${710 + L * 0.4} ${x - 6} ${710 + L * 0.7} ${x + 4} ${710 + L}`} stroke="rgba(200,232,248,0.5)" strokeWidth={8} fill="none" strokeLinecap="round" />
                <path d={`M${x - 2} 720 L${x} ${710 + L * 0.85}`} stroke="rgba(255,255,255,0.6)" strokeWidth={2.5} fill="none" />
                <ellipse cx={x + 4} cy={716 + L} rx={8} ry={11} fill="#bfe3f6" stroke="#2b1d16" strokeWidth={2} />
              </g>
            );
          })}
          {/* водянистый блеск соплей под ноздрями */}
          {stage === 3 && (
            <g opacity={Math.min(1, k * 2)}>
              {[515, 565].map((x) => <path key={x} d={`M${x - 12} 1050 C${x - 14} ${1076 + k * 14} ${x + 14} ${1076 + k * 14} ${x + 12} 1050 Z`} fill="rgba(225,235,245,0.5)" stroke="rgba(255,255,255,0.65)" strokeWidth={2} />)}
              {[510, 560].map((x) => <circle key={x} cx={x} cy={1060} r={4} fill="#fff" opacity={0.85} />)}
            </g>
          )}
        </g>
        {/* одеяло: край поднимается и опускается в такт дыханию */}
        <path d={`M60 ${1400 + breath * 0.6} Q540 ${1330 + breath} 1020 ${1400 + breath * 0.6} L1040 1920 L40 1920 Z`} fill="#1a2639" stroke="#0e1420" strokeWidth={6} />
        {[0, 1, 2].map((i) => <path key={i} d={`M${160 + i * 260} ${1460 + i * 20 + breath * 0.5} q90 40 180 0`} stroke="#121b2a" strokeWidth={10} fill="none" />)}
        <ellipse cx={480} cy={760} rx={300} ry={230} fill="url(#dbBlue)" />
      </g>
      {/* край тумбочки с полным циферблатом 03:17 */}
      <g transform="rotate(-6 200 330)">
        <rect x={20} y={230} width={340} height={220} rx={12} fill="#2a1c12" stroke="#120c08" strokeWidth={5} />
        <rect x={60} y={270} width={250} height={100} rx={12} fill="#050505" stroke="#222" strokeWidth={4} />
        <text x={185} y={346} textAnchor="middle" fontFamily="monospace" fontWeight={900} fontSize={70} fill="#ff2020" style={{ filter: "drop-shadow(0 0 10px #ff0000)" }}>03:17</text>
      </g>
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
