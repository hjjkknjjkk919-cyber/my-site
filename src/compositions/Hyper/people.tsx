import React from "react";
import { MONT } from "../../pelmeni/kit";
import { Arm, type ArmPose, GripHand, LINE, OUT } from "../AvitoWardrobe/rig";
import { NuansV2 } from "../NuansEp2/chars";

export const AmpCtx = React.createContext<Record<string, number>>({});

const SK = "#e9c4a8";
const SK_SH = "#cf9f84";

/** Рот в 6 фазах по громкости реплики: закрыт → щель → узкий → средний → открытый → «О». */
const Mouth = ({ a, y = -652 }: { a: number; y?: number }) => {
  const ph = a < 0.06 ? 0 : a < 0.16 ? 1 : a < 0.3 ? 2 : a < 0.48 ? 3 : a < 0.7 ? 4 : 5;
  if (ph === 0) return <path d={`M-14 ${y} Q0 ${y + 3} 14 ${y}`} stroke={LINE} strokeWidth={3.5} fill="none" strokeLinecap="round" />;
  const ry = [0, 2.5, 5, 8, 11, 13][ph];
  const rx = ph === 5 ? 9 : 14;
  return (
    <g>
      <ellipse cx={0} cy={y + 2} rx={rx} ry={ry} fill="#3b0d11" stroke={LINE} strokeWidth={3} />
      {ry >= 8 && <rect x={-9} y={y + 2 - ry + 1.5} width={18} height={4} rx={2} fill="#f4f4f5" />}
    </g>
  );
};

/** Глаз, обрезанный по белку: зрачок и веко не выходят за контур. */
let eyeN = 0;
const Eye = ({ cx, cy, lid, look = 0, r = 11 }: { cx: number; cy: number; lid: number; look?: number; r?: number }) => {
  const id = React.useMemo(() => `pe${eyeN++}`, []);
  return (
    <g>
      <defs><clipPath id={id}><ellipse cx={cx} cy={cy} rx={r} ry={r * 0.8} /></clipPath></defs>
      <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.8} fill="#fbf8f2" />
      <g clipPath={`url(#${id})`}>
        <circle cx={cx + look * r * 0.45} cy={cy + 1} r={r * 0.38} fill="#151214" />
        {lid > 0 && <rect x={cx - r - 2} y={cy - r} width={r * 2 + 4} height={r * 2 * lid} fill={SK} />}
        {lid > 0 && <line x1={cx - r} y1={cy - r + r * 2 * lid} x2={cx + r} y2={cy - r + r * 2 * lid} stroke={LINE} strokeWidth={2.5} />}
      </g>
      <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.8} fill="none" {...OUT} />
    </g>
  );
};

export type Kind = "galya" | "tolyan" | "zina" | "petrovich" | "it" | "it2" | "jock" | "mom" | "oldman" | "oldman2" | "mchs";
export type Pose = { armL?: ArmPose; armR?: ArmPose; itemL?: React.ReactNode; itemR?: React.ReactNode; head?: number; lean?: number; look?: number; lid?: number; scared?: number; lift?: number };
const LOOK: Record<Kind, { top: string; pants: string; h: number; w: number }> = {
  galya: { top: "#1e5bd8", pants: "#2a2d36", h: 1, w: 1.15 },
  tolyan: { top: "#2f4a3a", pants: "#3a3d46", h: 1.02, w: 1.1 },
  zina: { top: "#7a4a2c", pants: "#4a3f3a", h: 0.86, w: 1.05 },
  petrovich: { top: "#1c1f26", pants: "#1c1f26", h: 1, w: 1.25 },
  it: { top: "#3d405b", pants: "#2b3a55", h: 0.98, w: 0.95 },
  it2: { top: "#6b4f8a", pants: "#2b3a55", h: 1.03, w: 0.9 },
  jock: { top: "#e5383b", pants: "#222", h: 1.05, w: 1.35 },
  mom: { top: "#c77dff", pants: "#333", h: 0.94, w: 1 },
  oldman: { top: "#8d6e63", pants: "#5d4037", h: 0.92, w: 1 },
  oldman2: { top: "#607d8b", pants: "#455a64", h: 0.9, w: 1.05 },
  mchs: { top: "#ff7a1a", pants: "#ff7a1a", h: 1.02, w: 1.15 },
};
export const DOWN: Pose = { armL: { sh: 6, el: 4 }, armR: { sh: -6, el: -4 } };

/** Человек 2D: ноги → торс (одежда) → голова (поворот у шеи) → руки-кости с кистью «ладонь → предмет → пальцы». Стопы в (x,y), рост ≈ 700·s. */
export const Person = ({ kind, x, y, s = 1, t, pose = DOWN, talk }: { kind: Kind; x: number; y: number; s?: number; t: number; pose?: Pose; talk?: string }) => {
  const L = LOOK[kind];
  const amp = React.useContext(AmpCtx)[talk ?? kind] ?? 0;
  const blink = (t + x * 0.013) % 3.7 < 0.12;
  const sway = amp > 0.05 ? Math.sin(t * 4.5) * 1.5 : 0;
  const br = 2 * Math.sin(t * 2 + x);
  const w = 74 * L.w;
  const aL = pose.armL ?? DOWN.armL!;
  const aR = pose.armR ?? DOWN.armR!;
  const hand = (item: React.ReactNode, p: ArmPose) => (wx: number, wy: number) => <GripHand x={wx} y={wy} item={item} itemRot={-(p.sh + Math.sign(p.el) * Math.min(115, Math.abs(p.el)) + (p.wr ?? 0))} />;
  const sleeve = kind === "jock" ? undefined : { color: L.top, len: 110 };
  const arms = (pass: "out" | "fill") => (
    <>
      <Arm sx={-w + 8} sy={-520} up={130} fo={118} w={24} color={kind === "jock" ? SK : SK} sleeve={sleeve} pose={aL} pass={pass} hand={hand(pose.itemL, aL)} />
      <Arm sx={w - 8} sy={-520} up={130} fo={118} w={24} color={SK} sleeve={sleeve} pose={aR} pass={pass} hand={hand(pose.itemR, aR)} />
    </>
  );
  const scared = pose.scared ?? 0;
  return (
    <g transform={`translate(${x} ${y - (pose.lift ?? 0)}) scale(${s * L.h} ${s * L.h}) rotate(${pose.lean ?? 0})`}>
      <ellipse cx={0} cy={0} rx={w + 20} ry={12} fill="#000" opacity={0.3} />
      {[-1, 1].map((d) => (
        <g key={d}>
          <path d={`M${d * 26} -300 L${d * 30} -16`} stroke={LINE} strokeWidth={46} strokeLinecap="round" />
          <path d={`M${d * 26} -300 L${d * 30} -16`} stroke={L.pants} strokeWidth={40} strokeLinecap="round" />
          <path d={`M${d * 30 - 26} 0 C${d * 30 - 26} -28 ${d * 30 + 30} -30 ${d * 30 + 40} 0 Z`} fill={kind === "mchs" ? "#222" : "#2b2b2b"} {...OUT} />
        </g>
      ))}
      <g transform={`translate(0 ${-br})`}>
        {/* торс */}
        <path d={`M${-w} -290 C${-w - 10} -420 ${-w} -520 ${-w + 14} -548 C${-w + 30} -572 ${w - 30} -572 ${w - 14} -548 C${w} -520 ${w + 10} -420 ${w} -290 Z`} fill={L.top} {...OUT} />
        {kind === "tolyan" && (
          <g>
            <path d={`M-30 -560 L30 -560 L26 -290 L-26 -290 Z`} fill="#f4f4f4" />
            {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M-28 ${-548 + i * 30} H28`} stroke="#1d3557" strokeWidth={9} />)}
            <path d={`M-30 -560 L-26 -290 M30 -560 L26 -290`} stroke={LINE} strokeWidth={3} />
            {[-1, 1].map((d) => <path key={d} d={`M${d * 34} -560 C${d * 60} -470 ${d * 64} -380 ${d * 60} -290`} stroke="#22382c" strokeWidth={6} fill="none" />)}
          </g>
        )}
        {kind === "galya" && (
          <g>
            <path d="M-26 -562 L0 -500 L26 -562 Z" fill="#fff" {...OUT} />
            <rect x={-60} y={-480} width={46} height={26} rx={4} fill="#fff" {...OUT} />
            <text x={-37} y={-461} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={14} fill="#1e5bd8">ГАЛЯ</text>
            <rect x={w - 34} y={-570} width={28} height={44} rx={5} fill="#111" {...OUT} />
            <line x1={w - 14} y1={-570} x2={w - 14} y2={-606} stroke="#111" strokeWidth={5} />
          </g>
        )}
        {kind === "petrovich" && (
          <g>
            <ellipse cx={0} cy={-370} rx={w - 8} ry={70} fill="#262a33" />
            <rect x={-56} y={-500} width={66} height={24} rx={4} fill="#ffd166" {...OUT} />
            <text x={-23} y={-482} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={14} fill="#111">ОХРАНА</text>
          </g>
        )}
        {kind === "mchs" && (
          <g>
            <rect x={-w + 6} y={-430} width={w * 2 - 12} height={18} fill="#e8e8e8" />
            <text x={0} y={-480} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={24} fill="#fff">МЧС</text>
          </g>
        )}
        {kind === "jock" && <path d="M-40 -560 Q0 -520 40 -560" stroke={SK} strokeWidth={22} fill="none" />}
        {(kind === "it" || kind === "it2") && <path d={`M${-w + 10} -548 C-30 -610 30 -610 ${w - 10} -548`} fill={L.top} {...OUT} />}
        {/* голова */}
        <g transform={`rotate(${(pose.head ?? 0) + sway} 0 -566)`}>
          <rect x={-15} y={-600} width={30} height={40} fill={SK_SH} {...OUT} />
          <ellipse cx={0} cy={-660} rx={52} ry={60} fill={SK} {...OUT} />
          {kind === "galya" && <path d="M-60 -660 C-90 -760 -30 -800 0 -790 C40 -810 96 -770 62 -660 C60 -700 40 -720 0 -722 C-40 -722 -58 -700 -60 -660 Z" fill="#b5532a" {...OUT} />}
          {kind === "zina" && (
            <g>
              <path d="M-66 -650 C-80 -740 80 -740 66 -650 C70 -600 60 -580 40 -570 L30 -620 C30 -690 -30 -690 -30 -620 L-40 -570 C-60 -580 -70 -600 -66 -650 Z" fill="#d8d0c4" {...OUT} />
              {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={-50 + i * 20} cy={-690 + (i % 2) * 14} r={4} fill="#a89f92" />)}
              {[-20, 20].map((cx) => <circle key={cx} cx={cx} cy={-664} r={15} fill="none" stroke={LINE} strokeWidth={3} />)}
              <path d="M-35 -664 C-50 -620 -40 -600 -30 -580 M35 -664 C50 -620 40 -600 30 -580" stroke="#c9a24a" strokeWidth={2} fill="none" />
            </g>
          )}
          {kind === "tolyan" && (
            <g transform="rotate(-12 0 -715)">
              <path d="M-54 -690 C-50 -760 50 -760 54 -690 Z" fill="#c1121f" {...OUT} />
              <path d="M-54 -690 H54" stroke="#fff" strokeWidth={8} />
              <circle cx={4} cy={-770} r={16} fill="#fff" {...OUT} />
            </g>
          )}
          {(kind === "petrovich" || kind === "oldman" || kind === "oldman2") && (
            <path d="M-56 -690 C-52 -748 52 -748 56 -690 L76 -684 L-56 -684 Z" fill={kind === "petrovich" ? "#111" : "#5d4037"} {...OUT} />
          )}
          {kind === "mchs" && <path d="M-62 -680 C-62 -770 62 -770 62 -680 Z" fill="#fff" {...OUT} />}
          {(kind === "it" || kind === "it2" || kind === "jock" || kind === "mom") && (
            <path d="M-54 -680 C-58 -740 58 -744 54 -680 L44 -700 L30 -686 L14 -706 L-2 -688 L-18 -706 L-34 -688 Z" fill={kind === "mom" ? "#8d5524" : kind === "jock" ? "#222" : "#3a2a22"} {...OUT} />
          )}
          {kind === "mom" && <path d="M-54 -680 C-80 -640 -70 -590 -50 -570 M54 -680 C80 -640 70 -590 50 -570" stroke="#8d5524" strokeWidth={14} fill="none" />}
          <Eye cx={-20} cy={-664} lid={blink ? 1 : pose.lid ?? (kind === "petrovich" ? 0.6 : kind === "tolyan" ? 0.35 : 0.15)} look={pose.look ?? 0} r={scared ? 14 : 11} />
          <Eye cx={20} cy={-664} lid={blink ? 1 : pose.lid ?? (kind === "petrovich" ? 0.6 : kind === "tolyan" ? 0.35 : 0.15)} look={pose.look ?? 0} r={scared ? 14 : 11} />
          <path d={`M-32 ${-684 - scared * 8} l22 ${-3 + (kind === "galya" ? 6 : 0)} M10 ${-687 + (kind === "galya" ? 6 : 0) - scared * 8} l22 3`} stroke="#3a2a22" strokeWidth={5} strokeLinecap="round" />
          <ellipse cx={0} cy={-644} rx={8} ry={kind === "tolyan" ? 10 : 6} fill={kind === "tolyan" ? "#e63946" : SK_SH} {...OUT} />
          {kind === "tolyan" && Array.from({ length: 20 }, (_, i) => <circle key={i} cx={Math.cos(i * 2.4) * Math.sqrt(i / 20) * 40} cy={-618 + Math.sin(i * 2.4) * 10} r={1.4} fill="#3a2a22" opacity={0.6} />)}
          <Mouth a={amp} y={-626} />
        </g>
        {arms("out")}
        {arms("fill")}
      </g>
    </g>
  );
};

/* ── предметы ── */
export const Scanner = ({ beam = 0 }: { beam?: number }) => (
  <g transform="rotate(-90)">
    <path d="M-10 -10 L60 -14 L66 10 L20 14 L14 50 L-6 50 Z" fill="#f2c14e" {...OUT} />
    <rect x={56} y={-16} width={14} height={28} rx={3} fill="#222" />
    {beam > 0 && <path d={`M70 -2 L${70 + 420 * beam} -10 L${70 + 420 * beam} 6 Z`} fill="#ff2a2a" opacity={0.85} />}
  </g>
);
export const Pelmeni = ({ empty = false }: { empty?: boolean }) => (
  <g>
    <rect x={-46} y={-70} width={92} height={120} rx={10} fill={empty ? "#d9d4c6" : "#2b6cb0"} {...OUT} />
    <text x={0} y={-32} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={18} fill={empty ? "#888" : "#fff"}>ЦЕЗАРЬ</text>
    <ellipse cx={0} cy={6} rx={26} ry={16} fill="#f4ecd8" {...OUT} />
  </g>
);
export const Mop = () => (
  <g>
    <line x1={0} y1={-260} x2={0} y2={60} stroke="#8d6e63" strokeWidth={10} />
    <path d="M-40 60 h80 l10 30 h-100 Z" fill="#9aa0a8" {...OUT} />
  </g>
);
export const Bottle = () => (
  <g transform="rotate(180)">
    <path d="M-14 0 v-20 h28 v20 c10 10 14 30 14 60 v80 h-56 v-80 c0 -30 4 -50 14 -60 Z" fill="#2d6a4f" {...OUT} transform="scale(0.8)" />
  </g>
);
export const Mug = () => (
  <g transform="translate(-50 10)">
    <path d="M36 -36 C62 -36 62 8 36 8" fill="none" stroke={LINE} strokeWidth={10} />
    <path d="M36 -36 C62 -36 62 8 36 8" fill="none" stroke="#f1ece2" strokeWidth={5} />
    <rect x={-38} y={-54} width={76} height={84} rx={8} fill="#f1ece2" {...OUT} />
    <text x={0} y={-20} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={19} fill="#c0392b">МНЕ</text>
    <text x={0} y={4} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={19} fill="#c0392b">ПОХУЙ</text>
  </g>
);
export const Megaphone = () => (
  <g transform="rotate(-80)">
    <path d="M0 -14 L70 -40 L70 40 L0 14 Z" fill="#ffffff" {...OUT} />
    <rect x={-20} y={-14} width={22} height={28} fill="#e63946" {...OUT} />
  </g>
);
export const Flashlight = ({ on = true }: { on?: boolean }) => (
  <g transform="rotate(-90)">
    <rect x={-10} y={-12} width={60} height={24} rx={6} fill="#333" {...OUT} />
    {on && <path d="M50 -10 L520 -120 L520 120 L50 10 Z" fill="#fff6c8" opacity={0.22} />}
  </g>
);

/* ── Монстр «Уценённый»: риг Нюанса + бирюзовый иней на плечах, бирка «УЦЕНКА −50%» на левом ухе, жилетка охранника ── */
export const Monster = ({ x, y, s, t, pose, vest = false, hat = false, coat = false }: { x: number; y: number; s: number; t: number; pose: Parameters<typeof NuansV2>[0]["pose"]; vest?: boolean; hat?: boolean; coat?: boolean }) => {
  const amp = React.useContext(AmpCtx).monster ?? 0;
  const c = pose.crouch ?? 0;
  const br = 3 * Math.sin(t * 1.6);
  const body = `translate(${x} ${y}) scale(${s}) translate(0 ${c * 170 - br})`;
  const head = `translate(0 40) rotate(${pose.head ?? 0} 0 -1000)`;
  return (
    <g>
      <NuansV2 x={x} y={y} s={s} t={t} amp={amp} pose={{ ...pose, apron: false }} />
      <g transform={body}>
        {vest && (
          <g>
            <path d="M-96 -980 L-40 -990 L-30 -640 L-96 -600 Z M96 -980 L40 -990 L30 -640 L96 -600 Z" fill="#1e5bd8" {...OUT} strokeWidth={2.5} />
            <rect x={44} y={-900} width={60} height={30} rx={4} fill="#fff" {...OUT} strokeWidth={2} />
            <text x={74} y={-879} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={14} fill="#1e5bd8">СТАЖЁР</text>
          </g>
        )}
        {coat && <path d="M-130 -1000 C-150 -800 -140 -600 -150 -380 L150 -380 C140 -600 150 -800 130 -1000 C80 -1040 -80 -1040 -130 -1000 Z" fill="#3d405b" {...OUT} strokeWidth={2.5} />}
        {/* иней на плечах */}
        {[-1, 1].map((d) => (
          <path key={d} d={`M${d * 30} -1010 L${d * 60} -1040 L${d * 74} -1012 L${d * 96} -1046 L${d * 110} -1010 L${d * 126} -1030 L${d * 122} -975 C${d * 90} -990 ${d * 60} -995 ${d * 30} -1000 Z`} fill="#7ff0e6" opacity={0.85} stroke="#bffaf5" strokeWidth={2} />
        ))}
        <g transform={head}>
          {hat ? (
            <path d="M-90 -1150 C-110 -1300 110 -1300 90 -1150 C90 -1100 70 -1060 40 -1050 L-40 -1050 C-70 -1060 -90 -1100 -90 -1150 Z" fill="#d8d0c4" stroke={LINE} strokeWidth={2.5} />
          ) : (
            <g transform={`rotate(${Math.sin(t * 2) * 4} -74 -1150)`}>
              <line x1={-74} y1={-1150} x2={-96} y2={-1100} stroke="#c9a24a" strokeWidth={3} />
              <rect x={-150} y={-1104} width={108} height={50} rx={6} fill="#ffd60a" stroke={LINE} strokeWidth={3} />
              <text x={-96} y={-1084} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={15} fill="#111">УЦЕНКА</text>
              <text x={-96} y={-1062} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={19} fill="#d00000">−50%</text>
            </g>
          )}
        </g>
      </g>
    </g>
  );
};
