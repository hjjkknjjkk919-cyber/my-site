import React from "react";
import { chainAngles, LimbChain2D, solveArmIK, solveLegIK } from "../../rig/AnatomicalRig2D";
import { LipSyncMouth } from "../AvitoWardrobe/LipSyncMouth";
import { DimaHead, Eye as DEye, LINE, MON, MON_HI, MON_SH, MouthCtx, NuanceHead, OUT, SKIN, SKIN_SH } from "../AvitoWardrobe/rig";
import { visemeOf } from "../AvitoWardrobe/useLipSync";
import { MONT } from "../../pelmeni/kit";

/* ── Все руки и ноги всех персонажей серии 3 — только через AnatomicalRig2D (IK + ограничители + капсулы). +X персонажа — вперёд. ── */
export type P2 = [number, number];
export const S3 = 3; // толщина контура

/** Нога: тазобедренный сустав → щиколотка (IK), стопа держит горизонт (keepEndLevel), тень под подошвой рисует тело. */
export const LegIK = ({ hip, ankle, l1, l2, r: [r1, r2, r3], c1, c2, foot, decor1, decor2 }: { hip: P2; ankle: P2; l1: number; l2: number; r: [number, number, number]; c1: string; c2: string; foot: React.ReactNode; decor1?: React.ReactNode; decor2?: React.ReactNode }) => {
  const ik = solveLegIK(ankle[0] - hip[0], ankle[1] - hip[1], l1, l2);
  return <LimbChain2D type="leg" rootX={hip[0]} rootY={hip[1]} angle1={ik.hipDeg} angle2={ik.kneeDeg} angle3={0} len1={l1} len2={l2} r1={r1} r2={r2} r3={r3} color1={c1} color2={c2} keepEndLevel renderEndEffector={() => foot} decor1={decor1} decor2={decor2} />;
};

/** Рука: плечо → запястье (IK); кисть получает мировой угол, чтобы предмет в «сэндвиче» держался ровно. */
export const ArmIK = ({ sh, wrist, l1, l2, r: [r1, r2, r3], c1, c2, hand }: { sh: P2; wrist: P2; l1: number; l2: number; r: [number, number, number]; c1: string; c2: string; hand: (world: number) => React.ReactNode }) => {
  const ik = solveArmIK(wrist[0] - sh[0], wrist[1] - sh[1], l1, l2);
  const { world } = chainAngles("arm", ik.shoulderDeg, ik.elbowDeg, ik.wristDeg);
  return <LimbChain2D type="arm" rootX={sh[0]} rootY={sh[1]} angle1={ik.shoulderDeg} angle2={ik.elbowDeg} angle3={ik.wristDeg} len1={l1} len2={l2} r1={r1} r2={r2} r3={r3} color1={c1} color2={c2} renderEndEffector={() => hand(world)} />;
};

/** Человеческая кисть, сэндвич: ладонь (сзади) → предмет → фаланги единым path (спереди). */
export const HumanHand = ({ skin = SKIN, item, world, grip = !!item, s = 1 }: { skin?: string; item?: React.ReactNode; world: number; grip?: boolean; s?: number }) => (
  <g transform={`scale(${s})`}>
    <path d="M-13 -4 C-17 10 -16 24 -9 30 L9 30 C16 24 17 10 13 -4 Z" fill={skin} stroke={LINE} strokeWidth={S3} strokeLinejoin="round" />
    {item && <g transform={`translate(0 22) rotate(${-world})`}>{item}</g>}
    {grip ? (
      <path d="M-15 12 C-19 20 -17 33 -11 35 C-9 39 -4 39 -2 35 C0 39 5 39 7 35 C10 38 15 34 14 24 C19 22 19 14 14 12 Z" fill={skin} stroke={LINE} strokeWidth={S3} strokeLinejoin="round" />
    ) : (
      <path d="M-13 22 C-15 38 -12 47 -8 47 C-6 51 -2 51 -1 47 C1 52 5 52 6 47 C9 50 13 45 12 30 C18 28 19 18 13 16 Z" fill={skin} stroke={LINE} strokeWidth={S3} strokeLinejoin="round" />
    )}
  </g>
);

/** Кисть демона: ладонь → предмет → 4 длинных тонких пальца единым path со скруглёнными кончиками. БЕЗ когтей (правило пользователя). */
export const DemonHand = ({ item, world, grip = !!item, s = 1, color = MON }: { item?: React.ReactNode; world: number; grip?: boolean; s?: number; color?: string }) => {
  const len = grip ? 26 : 62;
  const fingers = [-12, -4, 4, 12]
    .map((x, i) => {
      const L = len - Math.abs(i - 1.5) * 6;
      const sp = grip ? 0 : x * 0.35;
      return `M${x - 4} 18 L${x - 4 + sp} ${18 + L} A4 4 0 0 0 ${x + 4 + sp} ${18 + L} L${x + 4} 18 Z`;
    })
    .join(" ");
  return (
    <g transform={`scale(${s})`}>
      <ellipse cx={0} cy={10} rx={17} ry={16} fill={color} stroke={LINE} strokeWidth={S3} />
      {item && <g transform={`translate(0 24) rotate(${-world})`}>{item}</g>}
      <path d={fingers} fill={color} stroke={LINE} strokeWidth={S3} strokeLinejoin="round" />
    </g>
  );
};

/* ── обувь (стопа смотрит в +X, подошва на y=+22 → ровно на пол) ── */
export const Slipper = ({ c = "#4a5a8a" }: { c?: string }) => <path d="M-16 4 C-18 18 -14 22 -8 22 L42 22 C52 22 52 10 40 8 C24 4 6 0 -16 4 Z" fill={c} stroke={LINE} strokeWidth={S3} strokeLinejoin="round" />;
export const Shoe = ({ c = "#1b1b1f" }: { c?: string }) => (
  <g>
    <path d="M-16 0 C-18 16 -14 22 -8 22 L46 22 C56 22 54 6 40 4 C24 0 6 -6 -16 0 Z" fill={c} stroke={LINE} strokeWidth={S3} strokeLinejoin="round" />
    <path d="M-12 18 H50" stroke="#555" strokeWidth={3} />
  </g>
);
export const Valenok = () => <path d="M-18 -60 L18 -60 L20 0 C40 2 52 8 50 22 L-16 22 C-22 22 -22 10 -18 0 Z" fill="#8d8f94" stroke={LINE} strokeWidth={S3} strokeLinejoin="round" />;
export const DemonFoot = ({ color = MON }: { color?: string }) => <path d="M-14 0 C-18 16 -14 22 -8 22 L52 22 C60 22 58 10 46 8 C30 4 8 -4 -14 0 Z" fill={color} stroke={LINE} strokeWidth={S3} strokeLinejoin="round" />;

/** Мягкий контурный свет вокруг силуэта (жёлтый у Нюанса, ледяной у Отморозка). */
export const GlowDefs = ({ id, color, r = 5, o = 0.85 }: { id: string; color: string; r?: number; o?: number }) => (
  <defs>
    <filter id={id} x="-30%" y="-15%" width="160%" height="130%">
      <feMorphology in="SourceAlpha" operator="dilate" radius={r} result="d" />
      <feGaussianBlur in="d" stdDeviation={r * 1.8} result="b" />
      <feFlood floodColor={color} floodOpacity={o} />
      <feComposite in2="b" operator="in" result="g" />
      <feMerge>
        <feMergeNode in="g" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
);

export type BodyPose = {
  wL?: P2; // запястья в координатах тела (стопы в 0,0)
  wR?: P2;
  itemL?: React.ReactNode;
  itemR?: React.ReactNode;
  aL?: P2; // щиколотки
  aR?: P2;
  head?: number;
  lean?: number;
  lid?: number;
  look?: number;
  lift?: number; // подъём корпуса (прыжок/полёт), ноги тянутся следом
  armsBehindHead?: boolean;
};

const blinkLid = (t: number, ph: number, base: number) => ((t + ph) % 3 < 0.13 ? 1 : base);
const breathOf = (t: number) => 2.5 * (0.5 + 0.5 * Math.sin(t * 2.4));

/* ═══════════ ЧЕЛОВЕК (Дима, Валера, массовка): пропорции рига Димы ═══════════ */
export type HumanKind = "dima" | "valera" | "guard" | "shopperW" | "shopperM";
const HUMAN: Record<HumanKind, { top: string; topSh: string; arm: string; pants: string; foot: React.ReactNode; skin?: string }> = {
  dima: { top: "#8a9488", topSh: "#6f786d", arm: "#8a9488", pants: "#3d5a99", foot: <Slipper c="#5b4a3a" /> },
  valera: { top: "#2a2224", topSh: "#171214", arm: "#2a2224", pants: "#1d1f26", foot: <Shoe c="#3b2a1e" /> },
  guard: { top: "#1c2028", topSh: "#10131a", arm: "#1c2028", pants: "#1c2028", foot: <Shoe /> },
  shopperW: { top: "#8e3b46", topSh: "#6d2c35", arm: "#8e3b46", pants: "#2e2f3a", foot: <Shoe c="#4a2e22" /> },
  shopperM: { top: "#3e5c4a", topSh: "#2c4436", arm: "#3e5c4a", pants: "#3a3a44", foot: <Shoe /> },
};

export const HumanHead = ({ kind, amp, lid, look, t }: { kind: HumanKind; amp: number; lid: number; look: number; t: number }) => {
  if (kind === "dima") {
    return (
      <MouthCtx.Provider value={{ dima: amp, nuance: 0 }}>
        <DimaHead lid={lid} look={look} />
        {/* две светлые залысины на макушке */}
        <ellipse cx={-22} cy={-758} rx={12} ry={7} fill={SKIN} opacity={0.85} />
        <ellipse cx={18} cy={-762} rx={11} ry={6} fill={SKIN} opacity={0.85} />
      </MouthCtx.Provider>
    );
  }
  const hair = kind === "shopperW" ? "#6b3a1f" : kind === "valera" ? "#2a1e18" : "#3a2a22";
  return (
    <g>
      {kind === "shopperW" && <path d="M-84 -690 C-100 -800 100 -800 84 -690 L90 -600 L-90 -600 Z" fill={hair} stroke={LINE} strokeWidth={S3} />}
      {[-1, 1].map((d) => <ellipse key={d} cx={d * 70} cy={-684} rx={12} ry={18} fill={SKIN} stroke={LINE} strokeWidth={S3} />)}
      <ellipse cx={0} cy={-682} rx={68} ry={78} fill={SKIN} stroke={LINE} strokeWidth={S3} />
      <path d="M30 -740 C62 -716 66 -670 52 -628 C62 -660 60 -700 30 -740 Z" fill={SKIN_SH} opacity={0.7} />
      {kind === "valera" && (
        <g>
          {/* кепка-восьмиклинка */}
          <path d="M-74 -706 C-80 -790 76 -796 78 -708 Z" fill="#3a3a3e" stroke={LINE} strokeWidth={S3} />
          <path d="M-20 -708 C30 -716 80 -712 112 -700 C96 -690 50 -692 -20 -696 Z" fill="#2a2a2e" stroke={LINE} strokeWidth={S3} />
          <circle cx={0} cy={-786} r={6} fill="#2a2a2e" />
        </g>
      )}
      {kind === "guard" && (
        <g>
          <path d="M-72 -712 C-68 -792 68 -792 72 -712 L102 -704 L-72 -704 Z" fill="#111" stroke={LINE} strokeWidth={S3} />
          <rect x={-12} y={-760} width={24} height={16} rx={3} fill="#c9a24a" />
        </g>
      )}
      {kind === "shopperM" && (
        <g>
          <path d="M-74 -712 C-74 -802 74 -802 74 -712 Z" fill="#2f5d8a" stroke={LINE} strokeWidth={S3} />
          <path d="M-76 -712 H76" stroke="#d9d9d9" strokeWidth={9} />
        </g>
      )}
      {kind === "shopperW" && <path d="M-72 -700 C-70 -774 72 -780 74 -704 C40 -742 -10 -730 -30 -712 C-46 -716 -60 -712 -72 -700 Z" fill={hair} stroke={LINE} strokeWidth={S3} />}
      <DEye cx={-26} cy={-684} rx={16} ry={11} lid={lid} look={look} />
      <DEye cx={26} cy={-684} rx={16} ry={11} lid={lid} look={look} />
      <path d="M-34 -666 q8 4 16 0 M18 -666 q8 4 16 0" stroke={SKIN_SH} strokeWidth={3} fill="none" />
      {kind === "valera" ? (
        <path d="M-42 -708 L-12 -702 M12 -704 L42 -714" stroke={hair} strokeWidth={6} strokeLinecap="round" />
      ) : (
        <path d="M-42 -704 H-12 M12 -704 H42" stroke={kind === "shopperW" ? "#5a3414" : hair} strokeWidth={kind === "shopperW" ? 4 : 6} strokeLinecap="round" />
      )}
      <path d="M0 -676 q-6 18 4 22" stroke={LINE} strokeWidth={S3} fill="none" strokeLinecap="round" />
      <LipSyncMouth viseme={visemeOf(amp)} variant="dima" x={0} y={-638} />
      {kind === "valera" && amp < 0.07 && <path d="M-14 -640 Q4 -630 18 -644" stroke={LINE} strokeWidth={3} fill="none" />}
      {kind === "valera" && <rect x={4} y={-642} width={7} height={6} fill="#f2c94c" opacity={amp > 0.2 ? 1 : 0} />}
      {kind !== "shopperW" &&
        Array.from({ length: kind === "valera" ? 44 : 26 }, (_, i) => {
          const n = kind === "valera" ? 44 : 26;
          const a = i * 2.39996;
          const r = Math.sqrt((i + 0.5) / n);
          return <circle key={i} cx={Math.cos(a) * r * 44} cy={-618 + Math.sin(a) * r * 16} r={1.4} fill="#3a2a22" opacity={0.5} />;
        })}
      {t < 0 && <text fontFamily={MONT}>.</text>}
    </g>
  );
};

/** Человек целиком: ноги на полу (y=0), корпус дышит (sin(t·2.4)), голова моргает раз в 3 с. flip — смотрит влево. */
export const Human = ({ kind, x, y, s = 1, t, flip = false, pose = {}, amp = 0, ph = 0, extra }: { kind: HumanKind; x: number; y: number; s?: number; t: number; flip?: boolean; pose?: BodyPose; amp?: number; ph?: number; extra?: React.ReactNode }) => {
  const L = HUMAN[kind];
  const br = breathOf(t + ph);
  const lift = pose.lift ?? 0;
  const by = -br - lift;
  const aL = pose.aL ?? [-30, -26];
  const aR = pose.aR ?? [30, -26];
  const wL = pose.wL ?? [-72, -300];
  const wR = pose.wR ?? [72, -300];
  const lid = blinkLid(t, ph, pose.lid ?? (kind === "dima" ? 0.55 : kind === "valera" ? 0.45 : 0.3));
  const shL: P2 = [-62, -548 + by];
  const shR: P2 = [62, -548 + by];
  const arm = (sh: P2, w: P2, item?: React.ReactNode) => (
    <ArmIK sh={sh} wrist={[w[0], w[1] - lift]} l1={140} l2={128} r={[17, 14, 12]} c1={L.arm} c2={kind === "dima" || kind === "shopperM" ? SKIN : L.arm} hand={(world) => <HumanHand world={world} item={item} />} />
  );
  const stripe = kind === "valera" ? <path d="M10 6 V160" stroke="#e8e8e8" strokeWidth={5} /> : undefined;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      {[aL, aR].map((a, i) => <ellipse key={i} cx={a[0] + 14} cy={0} rx={34} ry={7} fill="#000" opacity={0.28} />)}
      <g transform={`rotate(${pose.lean ?? 0} 0 -350)`}>
        {[[-24, aL], [24, aR]].map(([hx, a], i) => (
          <LegIK key={i} hip={[hx as number, -350 + by * 0.3]} ankle={a as P2} l1={170} l2={160} r={[24, 20, 16]} c1={L.pants} c2={L.pants} foot={L.foot} decor1={stripe} decor2={kind === "valera" ? <path d="M9 4 V150" stroke="#e8e8e8" strokeWidth={4} /> : undefined} />
        ))}
        <g transform={`translate(0 ${by})`}>
          {/* торс по типу одежды + cel-тень */}
          {kind === "dima" && (
            <g>
              <path d="M-82 -318 C-96 -400 -88 -500 -80 -530 C-74 -566 -40 -580 0 -580 C40 -580 74 -566 80 -530 C88 -500 100 -400 86 -318 C40 -306 -40 -306 -82 -318 Z" fill={L.top} stroke={LINE} strokeWidth={S3} />
              <path d="M-32 -580 C-24 -556 24 -556 32 -580" fill={L.topSh} stroke={LINE} strokeWidth={S3} />
              <path d="M60 -500 C92 -440 96 -370 86 -318 L70 -318 C80 -380 76 -440 60 -500 Z" fill={L.topSh} opacity={0.7} />
              <path d="M-40 -432 c10 -14 30 -10 32 4 c10 2 12 18 0 22 c-6 12 -26 10 -30 -2 c-12 -2 -14 -18 -2 -24 Z" fill="#8a6a3a" opacity={0.6} />
            </g>
          )}
          {kind === "valera" && (
            <g>
              <path d="M-86 -318 C-98 -410 -92 -510 -82 -536 C-74 -570 -40 -584 0 -584 C40 -584 74 -570 82 -536 C92 -510 98 -410 86 -318 Z" fill={L.top} stroke={LINE} strokeWidth={S3} />
              <path d="M-30 -584 L0 -520 L30 -584 M0 -520 V-318" stroke="#0b0809" strokeWidth={4} fill="none" />
              <path d="M-60 -540 C-70 -480 -66 -400 -60 -340 M40 -560 C64 -500 70 -420 66 -340" stroke="#4a3e42" strokeWidth={5} fill="none" opacity={0.8} />
              <path d="M-26 -584 C-14 -566 14 -566 26 -584" fill="#e8e8e8" />
              <path d="M-14 -584 C-6 -560 6 -560 14 -584" fill="#9c8b6a" />
            </g>
          )}
          {kind === "guard" && (
            <g>
              <path d="M-90 -318 C-100 -420 -92 -510 -82 -538 C-74 -572 -40 -582 0 -582 C40 -582 74 -572 82 -538 C92 -510 100 -420 90 -318 Z" fill={L.top} stroke={LINE} strokeWidth={S3} />
              <rect x={-60} y={-500} width={66} height={24} rx={4} fill="#ffd166" stroke={LINE} strokeWidth={2} />
              <text x={-27} y={-482} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={14} fill="#111">ОХРАНА</text>
              <path d="M-90 -340 H90" stroke="#0b0d12" strokeWidth={10} />
            </g>
          )}
          {(kind === "shopperW" || kind === "shopperM") && (
            <g>
              <path d="M-92 -290 C-104 -400 -94 -510 -84 -538 C-76 -572 -40 -584 0 -584 C40 -584 76 -572 84 -538 C94 -510 104 -400 92 -290 Z" fill={L.top} stroke={LINE} strokeWidth={S3} />
              <path d="M0 -580 V-292" stroke={L.topSh} strokeWidth={5} />
              <path d="M-40 -584 C-20 -548 20 -548 40 -584" fill={kind === "shopperW" ? "#e3c16f" : "#c9c9c9"} stroke={LINE} strokeWidth={2} />
            </g>
          )}
          <path d="M66 -520 C92 -450 98 -380 88 -318" stroke="#000" strokeWidth={10} opacity={0.18} fill="none" />
          <g transform={`translate(0 14) rotate(${pose.head ?? 0} 0 -578)`}>
            <rect x={-16} y={-626} width={32} height={56} fill={SKIN_SH} stroke={LINE} strokeWidth={S3} />
            <HumanHead kind={kind} amp={amp} lid={lid} look={pose.look ?? 0.1} t={t} />
          </g>
          {extra}
        </g>
        {arm(shL, wL, pose.itemL)}
        {arm(shR, wR, pose.itemR)}
      </g>
    </g>
  );
};

/* ═══════════ ДЕМОНЫ: Нюанс, Мама Нюанса, Отморозок ═══════════ */
export type DemonKind = "nuance" | "mama" | "otm";
const DEMON = {
  nuance: { hipY: -600, hipX: 34, l1: 300, l2: 280, shY: -990, shX: 96, a1: 330, a2: 300, rim: "#ffc95e", headDy: 40 },
  mama: { hipY: -560, hipX: 32, l1: 280, l2: 262, shY: -930, shX: 90, a1: 310, a2: 280, rim: "#ffc95e", headDy: 100 },
  otm: { hipY: -370, hipX: 46, l1: 184, l2: 164, shY: -770, shX: 122, a1: 200, a2: 180, rim: "#5dade2", headDy: 270 },
} as const;

const Horns = ({ ice = false }: { ice?: boolean }) => (
  <g>
    {[-1, 1].map((d) => (
      <g key={d}>
        <path d={`M${d * 46} -1254 C${d * 70} -1300 ${d * 96} -1318 ${d * 112} -1336 C${d * 104} -1300 ${d * 82} -1262 ${d * 62} -1236 Z`} fill="#3a3d46" stroke={LINE} strokeWidth={S3} strokeLinejoin="round" />
        {ice && [0, 1, 2].map((i) => <path key={i} d={`M${d * (66 + i * 14)} ${-1262 - i * 22} l${d * 4} 22 l${d * 5} -20 Z`} fill="#dff3ff" stroke="#5dade2" strokeWidth={1.5} />)}
      </g>
    ))}
  </g>
);

export const Demon = ({ kind, x, y, s = 1, t, flip = false, pose = {}, amp = 0, ph = 0, ice = 0, cower = 0, sit = 0, extra, upperOnly = false }: { kind: DemonKind; x: number; y: number; s?: number; t: number; flip?: boolean; pose?: BodyPose & { guilty?: number; mouth?: number }; amp?: number; ph?: number; ice?: number; cower?: number; sit?: number; extra?: React.ReactNode; upperOnly?: boolean }) => {
  const D = DEMON[kind];
  const id = `dg${kind}`;
  const br = breathOf(t + ph) * 1.4;
  const lift = pose.lift ?? 0;
  const drop = sit * (-D.hipY - 210); // сидит на полу: таз опускается, колени вверх-вперёд
  const by = -br - lift + cower * 60 + drop;
  const aL = pose.aL ?? [-(D.hipX + 18) + sit * 230, -24];
  const aR = pose.aR ?? [D.hipX + 18 + sit * 250, -24];
  const reach = (D.a1 + D.a2) * 0.92;
  const wL = pose.wL ?? [-D.shX - 30, D.shY + reach * 0.96];
  const wR = pose.wR ?? [D.shX + 30, D.shY + reach * 0.96];
  const shL: P2 = [-D.shX, D.shY + by];
  const shR: P2 = [D.shX, D.shY + by];
  const hs = kind === "otm" ? 1.25 : 1.45;
  const arm = (sh: P2, w: P2, item?: React.ReactNode) => (
    <ArmIK sh={sh} wrist={[w[0], w[1] - lift + cower * 40]} l1={D.a1} l2={D.a2} r={kind === "otm" ? [26, 22, 17] : [22, 17, 13]} c1={kind === "otm" && pose.itemL === "coat" ? "#2b4a7a" : MON} c2={MON} hand={(world) => <DemonHand world={world} item={item} s={hs} />} />
  );
  const lamp = kind === "otm" ? <path d="M12 4 V170" stroke="#f0f0f0" strokeWidth={7} /> : undefined;
  const pantsC = kind === "otm" ? "#1f4fa8" : MON;
  const legs = !upperOnly && [[-D.hipX, aL], [D.hipX, aR]].map(([hx, a], i) => (
    <LegIK key={i} hip={[hx as number, D.hipY + (by - drop) * 0.3 + cower * 50 + drop]} ankle={a as P2} l1={D.l1} l2={kind === "otm" ? D.l2 - 0 : D.l2} r={kind === "otm" ? [30, 26, 22] : [24, 18, 14]} c1={pantsC} c2={kind === "otm" ? "#8d8f94" : MON} decor1={lamp} foot={kind === "otm" ? <Valenok /> : kind === "mama" ? <Slipper c="#e86a9a" /> : <DemonFoot />} />
  ));
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <GlowDefs id={id} color={D.rim} />
      {!upperOnly && [aL, aR].map((a, i) => <ellipse key={i} cx={a[0] + 18} cy={0} rx={44} ry={9} fill="#000" opacity={0.32} />)}
      <g filter={`url(#${id})`} transform={`rotate(${pose.lean ?? 0} 0 ${D.hipY})`}>
        {legs}
        <g transform={`translate(0 ${by})`}>
          {/* торс */}
          {kind === "otm" ? (
            <g>
              <path d="M-112 -330 C-130 -480 -150 -700 -130 -760 C-110 -800 110 -800 130 -760 C150 -700 130 -480 112 -330 Z" fill={MON_HI} stroke={LINE} strokeWidth={S3} />
              <path d="M-112 -380 H112 L106 -330 H-106 Z" fill={pantsC} stroke={LINE} strokeWidth={S3} />
              <path d="M70 -740 C110 -640 112 -480 96 -380" stroke="#000" strokeWidth={14} opacity={0.25} fill="none" />
              {[0, 1, 2].map((i) => <path key={i} d={`M-60 ${-660 + i * 70} Q0 ${-640 + i * 70} 60 ${-660 + i * 70}`} stroke="#3a3e48" strokeWidth={5} fill="none" />)}
            </g>
          ) : (
            <g>
              <path d={kind === "mama" ? "M-50 -520 C-64 -660 -112 -830 -112 -890 C-112 -940 -66 -966 0 -962 C66 -966 112 -940 112 -890 C112 -830 64 -660 50 -520 Z" : "M-46 -560 C-60 -700 -116 -880 -118 -950 C-118 -1000 -70 -1030 0 -1024 C70 -1030 118 -1000 118 -950 C116 -880 60 -700 46 -560 Z"} fill={MON_HI} stroke={LINE} strokeWidth={S3} />
              <path d={kind === "mama" ? "M0 -930 V-560" : "M0 -990 V-640"} stroke={MON_SH} strokeWidth={6} />
              {kind === "nuance" && (
                <g>
                  {Array.from({ length: 5 }, (_, i) => {
                    const yy = -935 + i * 40;
                    const w = 84 - i * 10;
                    return <path key={i} d={`M${-w} ${yy} Q${-w * 0.4} ${yy + 24} -10 ${yy + 10} M${w} ${yy} Q${w * 0.4} ${yy + 24} 10 ${yy + 10}`} stroke="#4a4f5a" strokeWidth={6} fill="none" strokeLinecap="round" />;
                  })}
                </g>
              )}
            </g>
          )}
          {/* голова */}
          <g transform={`translate(0 ${D.headDy}) rotate(${pose.head ?? 0} 0 -1000)`}>
            {kind !== "otm" && <path d="M-16 -1000 C-20 -1040 -10 -1070 0 -1086 C10 -1070 20 -1040 16 -1000 Z" fill={MON_SH} stroke={LINE} strokeWidth={2.5} />}
            {kind !== "otm" && <Horns />}
            <MouthCtx.Provider value={{ dima: 0, nuance: amp }}>
              <NuanceHead guilty={pose.guilty ?? 0} mouth={pose.mouth ?? 0} t={t} happy={0} squint={kind === "otm" ? 0.4 : 0} horror={cower} />
            </MouthCtx.Provider>
            {kind === "mama" && (
              <g>
                {/* бигуди */}
                {[-58, -30, 0, 30, 58].map((cx, i) => (
                  <g key={i}>
                    <rect x={cx - 15} y={-1300 + Math.abs(cx) * 0.5} width={30} height={22} rx={8} fill={["#ff8fb1", "#7fd1ff", "#ffe066", "#ff8fb1", "#9be37a"][i]} stroke={LINE} strokeWidth={2.5} />
                    <path d={`M${cx - 15} ${-1289 + Math.abs(cx) * 0.5} H${cx + 15}`} stroke="#fff" strokeWidth={2} opacity={0.7} />
                  </g>
                ))}
                {/* горящие жёлтые глаза */}
                {[-26, 26].map((cx) => (
                  <g key={cx}>
                    <circle cx={cx} cy={-1170} r={18} fill="#ffd21f" opacity={0.35} />
                    <circle cx={cx} cy={-1170} r={8} fill="#ffe866" />
                  </g>
                ))}
              </g>
            )}
            {kind === "otm" && (
              <g>
                <Horns ice />
                {/* ушанка с опущенными ушами */}
                <path d="M-92 -1196 C-96 -1290 96 -1290 92 -1196 Z" fill="#6b4a32" stroke={LINE} strokeWidth={S3} />
                <path d="M-96 -1200 C-60 -1186 60 -1186 96 -1200 L92 -1176 C60 -1164 -60 -1164 -92 -1176 Z" fill="#a37a55" stroke={LINE} strokeWidth={S3} />
                {[-1, 1].map((d) => <path key={d} d={`M${d * 74} -1188 C${d * 100} -1150 ${d * 102} -1100 ${d * 86} -1070 C${d * 70} -1080 ${d * 64} -1130 ${d * 62} -1180 Z`} fill="#a37a55" stroke={LINE} strokeWidth={S3} />)}
                <rect x={-14} y={-1262} width={28} height={22} rx={4} fill="#c9a24a" stroke={LINE} strokeWidth={2} />
              </g>
            )}
          </g>
          {kind === "nuance" && (
            <g>
              {/* розовый фартук в белый горошек */}
              <path d="M-70 -900 L70 -900 L86 -560 L-86 -560 Z" fill="#f29bb8" stroke={LINE} strokeWidth={S3} />
              {Array.from({ length: 14 }, (_, i) => <circle key={i} cx={-58 + (i % 4) * 38 + (Math.floor(i / 4) % 2) * 18} cy={-870 + Math.floor(i / 4) * 80} r={7} fill="#fff" />)}
              <path d="M-70 -900 L-40 -1000 M70 -900 L40 -1000" stroke="#f29bb8" strokeWidth={8} />
            </g>
          )}
          {kind === "mama" && (
            <g>
              {/* домашний халат в цветочек до колен */}
              <path d="M-104 -900 C-130 -700 -150 -520 -156 -330 L156 -330 C150 -520 130 -700 104 -900 C60 -930 -60 -930 -104 -900 Z" fill="#7b4fa0" stroke={LINE} strokeWidth={S3} />
              {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={-100 + (i % 4) * 66} cy={-820 + Math.floor(i / 4) * 160} r={10} fill="#f6c1df" />)}
              <path d="M0 -910 L-30 -330 M-120 -560 H120" stroke="#5a3678" strokeWidth={8} fill="none" />
            </g>
          )}
          {extra}
        </g>
        {arm(shL, wL, pose.itemL === "coat" ? undefined : pose.itemL)}
        {arm(shR, wR, pose.itemR)}
      </g>
      {/* ледяной панцирь поверх (полупрозрачный, с бликами) */}
      {ice > 0 && (
        <g opacity={ice}>
          <path d={`M${-180} 10 L${-200} ${D.shY - 380} L${-60} ${D.shY - 470} L${120} ${D.shY - 440} L${210} ${D.shY - 200} L${190} 10 Z`} fill="#bfe6ff" opacity={0.42} stroke="#e9f7ff" strokeWidth={6} />
          <path d={`M-150 ${D.shY - 300} L-40 ${D.shY - 400} M60 ${D.shY - 360} L150 ${D.shY - 220} M-120 -200 L-60 -320`} stroke="#ffffff" strokeWidth={10} opacity={0.7} strokeLinecap="round" />
        </g>
      )}
    </g>
  );
};
