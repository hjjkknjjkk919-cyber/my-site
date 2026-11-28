import React from "react";
import { MONT } from "../../pelmeni/kit";
import { Arm, type ArmPose, Eye as DEye, GripHand, LINE, OUT } from "../AvitoWardrobe/rig";
import { LipSyncMouth } from "../AvitoWardrobe/LipSyncMouth";
import { visemeOf } from "../AvitoWardrobe/useLipSync";
import { GOLD_RIM, NuansV2, RimDefs } from "../NuansEp2/chars";

export const AmpCtx = React.createContext<Record<string, number>>({});

const SK = "#e9c4a8";
const SK_SH = "#cf9f84";

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
  const male = !["galya", "zina", "mom"].includes(kind);
  const lid = blink ? 1 : pose.lid ?? (kind === "petrovich" ? 0.6 : kind === "tolyan" ? 0.45 : 0.3);
  const browC = kind === "zina" || kind === "oldman" || kind === "oldman2" ? "#9a948c" : kind === "galya" ? "#7a3418" : kind === "mom" ? "#5a3414" : "#3a2a22";
  return (
    <g>
    <RimDefs id="prim" color={GOLD_RIM} />
    <g filter="url(#prim)" transform={`translate(${x} ${y - (pose.lift ?? 0)}) scale(${s * L.h} ${s * L.h}) rotate(${pose.lean ?? 0})`}>
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
        {/* cel-тень на одежде, как у Димы */}
        <path d={`M${w - 24} -520 C${w + 6} -450 ${w + 12} -370 ${w} -292 L${w - 18} -292 C${w - 8} -380 ${w - 10} -450 ${w - 24} -520 Z`} fill="#000" opacity={0.2} />
        <path d="M-30 -572 C-22 -548 22 -548 30 -572" fill="none" {...OUT} />
        {/* голова в стиле Димы: крупная, уши, cel-тень, глаза «-_-» в clipPath, мешки, ровные брови, щетина, lip-sync */}
        <g transform={`translate(0 14) rotate(${(pose.head ?? 0) + sway} 0 -578)`}>
          <rect x={-16} y={-626} width={32} height={56} fill={SK_SH} {...OUT} />
          {kind === "galya" && <path d="M-88 -650 C-126 -806 -40 -858 0 -848 C52 -866 128 -806 90 -650 Z" fill="#b5532a" {...OUT} />}
          {kind === "mom" && <path d="M-84 -690 C-102 -804 102 -804 84 -690 L94 -556 L-94 -556 Z" fill="#8d5524" {...OUT} />}
          {kind === "zina" && <path d="M-82 -664 C-98 -796 98 -796 82 -664 Z" fill="#d8d0c4" {...OUT} />}
          {(kind === "it" || kind === "it2") && <path d="M-74 -700 C-82 -790 82 -790 74 -700 L70 -680 L-70 -680 Z" fill={kind === "it" ? "#3a2a22" : "#6b4f2a"} {...OUT} />}
          {[-1, 1].map((d) => <ellipse key={d} cx={d * 70} cy={-684} rx={12} ry={18} fill={SK} {...OUT} />)}
          <ellipse cx={0} cy={-682} rx={68} ry={78} fill={SK} {...OUT} />
          <path d="M30 -740 C62 -716 66 -670 52 -628 C62 -660 60 -700 30 -740 Z" fill={SK_SH} opacity={0.7} />
          {/* причёски и головные уборы */}
          {kind === "galya" && <path d="M-74 -698 C-78 -786 76 -792 76 -702 C58 -736 24 -748 -6 -740 C-36 -746 -62 -730 -74 -698 Z" fill="#b5532a" {...OUT} />}
          {kind === "galya" && [-1, 1].map((d) => <circle key={d} cx={d * 72} cy={-660} r={5} fill="#f5c542" {...OUT} />)}
          {kind === "zina" && Array.from({ length: 7 }, (_, i) => <circle key={i} cx={-60 + i * 20} cy={-748 + (i % 2) * 14} r={12} fill="#d8d0c4" {...OUT} />)}
          {kind === "mom" && <path d="M-72 -700 C-70 -774 72 -780 74 -704 C40 -742 -10 -730 -30 -712 C-46 -716 -60 -712 -72 -700 Z" fill="#8d5524" {...OUT} />}
          {(kind === "it" || kind === "it2") && <path d="M-72 -700 C-70 -770 70 -775 74 -704 L58 -716 L50 -694 L34 -722 L20 -700 L4 -726 L-12 -702 L-28 -728 L-42 -704 L-56 -724 Z" fill={kind === "it" ? "#3a2a22" : "#6b4f2a"} {...OUT} />}
          {kind === "jock" && <path d="M-70 -700 C-70 -770 70 -774 72 -704 C40 -724 -40 -724 -70 -700 Z" fill="#222" {...OUT} />}
          {kind === "tolyan" && (
            <g transform="rotate(-12 0 -740)">
              <path d="M-74 -712 C-74 -802 74 -802 74 -712 Z" fill="#c1121f" {...OUT} />
              <path d="M-76 -712 H76" stroke="#fff" strokeWidth={10} />
              <circle cx={6} cy={-806} r={18} fill="#fff" {...OUT} />
            </g>
          )}
          {(kind === "petrovich" || kind === "oldman" || kind === "oldman2") && (
            <g>
              {kind !== "petrovich" && [-1, 1].map((d) => <path key={d} d={`M${d * 66} -700 q${d * 10} 14 ${d * 2} 30`} stroke="#d8d4cc" strokeWidth={10} fill="none" strokeLinecap="round" />)}
              <path d="M-72 -712 C-68 -792 68 -792 72 -712 L100 -704 L-72 -704 Z" fill={kind === "petrovich" ? "#111" : kind === "oldman" ? "#5d4037" : "#455a64"} {...OUT} />
            </g>
          )}
          {kind === "mchs" && (
            <g>
              <path d="M-80 -700 C-80 -812 80 -812 80 -700 Z" fill="#fff" {...OUT} />
              <path d="M0 -808 V-704" stroke="#d9d9d9" strokeWidth={6} />
              <path d="M-88 -700 H88" stroke="#eee" strokeWidth={9} strokeLinecap="round" />
            </g>
          )}
          <DEye cx={-26} cy={-684} rx={scared ? 19 : 16} ry={scared ? 14 : 11} lid={lid} look={pose.look ?? 0.1} skin={SK} />
          <DEye cx={26} cy={-684} rx={scared ? 19 : 16} ry={scared ? 14 : 11} lid={lid} look={pose.look ?? 0.1} skin={SK} />
          {(kind === "zina" || kind === "it" || kind === "it2" || kind === "oldman2") && (
            <g fill="none" stroke={LINE} strokeWidth={3.5}>
              {kind === "it" ? [-26, 26].map((cx) => <rect key={cx} x={cx - 21} y={-700} width={42} height={30} rx={6} />) : [-26, 26].map((cx) => <circle key={cx} cx={cx} cy={-684} r={21} />)}
              <path d="M-5 -686 H5" />
              {kind === "zina" && <path d="M-47 -684 C-62 -630 -50 -606 -40 -588 M47 -684 C62 -630 50 -606 40 -588" stroke="#c9a24a" strokeWidth={2} />}
            </g>
          )}
          <path d="M-34 -666 q8 4 16 0 M18 -666 q8 4 16 0" stroke={SK_SH} strokeWidth={3} fill="none" />
          {kind === "zina" || kind === "oldman" || kind === "oldman2" ? (
            <path d="M-50 -676 l-8 -4 M50 -676 l8 -4 M-22 -740 H22 M-16 -728 H16" stroke={SK_SH} strokeWidth={3} fill="none" strokeLinecap="round" />
          ) : null}
          {kind === "galya" ? (
            <path d={`M-44 ${-702 - scared * 8} Q-28 -716 -10 ${-704 + 4} M10 ${-704 + 4} Q28 -716 44 ${-702 - scared * 8}`} stroke={browC} strokeWidth={5} fill="none" strokeLinecap="round" />
          ) : (
            <path d={`M-42 ${-704 - scared * 9} H-12 M12 ${-704 - scared * 9} H42`} stroke={browC} strokeWidth={6} strokeLinecap="round" />
          )}
          {kind === "tolyan" ? <ellipse cx={2} cy={-660} rx={11} ry={13} fill="#e63946" {...OUT} /> : <path d="M0 -676 q-6 18 4 22" {...OUT} fill="none" />}
          {(kind === "petrovich" || kind === "oldman" || kind === "oldman2") && <path d="M-28 -650 C-12 -662 12 -662 28 -650 C14 -643 -14 -643 -28 -650 Z" fill={kind === "petrovich" ? "#3a2a22" : "#ece8e0"} {...OUT} />}
          <LipSyncMouth viseme={visemeOf(amp)} variant="dima" x={0} y={-638} />
          {kind === "galya" && amp < 0.07 && <path d="M-12 -638 Q0 -634 12 -638" stroke="#c1121f" strokeWidth={4} fill="none" strokeLinecap="round" />}
          {male && kind !== "mchs" && Array.from({ length: kind === "tolyan" ? 60 : 30 }, (_, i) => {
            const n = kind === "tolyan" ? 60 : 30;
            const a = i * 2.39996;
            const r = Math.sqrt((i + 0.5) / n);
            return <circle key={i} cx={Math.cos(a) * r * 44} cy={-618 + Math.sin(a) * r * 16} r={1.4} fill="#3a2a22" opacity={0.5} />;
          })}
        </g>
        {arms("out")}
        {arms("fill")}
      </g>
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
