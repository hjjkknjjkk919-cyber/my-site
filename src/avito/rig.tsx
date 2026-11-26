import React from "react";

/* ── палитра и контур ── */
export const LINE = "#1d1a1c";
export const OUT = { stroke: LINE, strokeWidth: 3, strokeLinejoin: "round" as const, strokeLinecap: "round" as const, vectorEffect: "non-scaling-stroke" as const };
export const SKIN = "#e9c4a8";
export const SKIN_SH = "#cf9f84";
export const HAIR = "#3a2a22";
export const SHOE = "#18181c";
export const MON = "#22252c";
export const MON_SH = "#16181D";
export const MON_HI = "#2B2E36";
export const TEE = "#8a9488";
export const TEE_SH = "#6f786d";
export const PANTS = "#5b5f66";
export const SOCK = "#d9d6cf";
export const RIM = "#ffc95e";

const uid = () => React.useId().replace(/:/g, "");

/** Громкость текущего слога (0..1) для каждого персонажа — задаётся монтажом из useAudioData/visualizeAudio. */
export const MouthCtx = React.createContext({ dima: 0, nuance: 0 });
/** 4 виземы: 0 — тишина, 1 — тихо, 2 — средне, 3 — громко. */
export const viseme = (a: number) => (a < 0.08 ? 0 : a < 0.22 ? 1 : a < 0.45 ? 2 : 3);

export type ArmPose = { sh: number; el: number; wr?: number };
type Pass = "out" | "fill";

/**
 * Рука-цепочка костей: плечо → (rotate sh) плечевая кость → локоть → (rotate el) предплечье → запястье → (rotate wr) кисть.
 * Рисуется в два прохода (сначала контуры, потом заливки) по одной и той же иерархии — стыки без швов и щелей.
 */
export const Arm = ({ sx, sy, up, fo, w, color, pose, pass, hand, sleeve }: { sx: number; sy: number; up: number; fo: number; w: number; color: string; pose: ArmPose; pass: Pass; hand?: (wx: number, wy: number) => React.ReactNode; sleeve?: { color: string; len: number } }) => {
  const ey = sy + up;
  const wy = ey + fo;
  const st = pass === "out" ? LINE : color;
  const k = pass === "out" ? 6 : 0;
  return (
    <g transform={`rotate(${pose.sh} ${sx} ${sy})`}>
      <line x1={sx} y1={sy} x2={sx} y2={ey} stroke={st} strokeWidth={w + k} strokeLinecap="round" />
      {sleeve && <line x1={sx} y1={sy} x2={sx} y2={sy + sleeve.len} stroke={pass === "out" ? LINE : sleeve.color} strokeWidth={w + 12 + k} strokeLinecap="round" />}
      <g transform={`rotate(${pose.el} ${sx} ${ey})`}>
        <line x1={sx} y1={ey} x2={sx} y2={wy} stroke={st} strokeWidth={w * 0.88 + k} strokeLinecap="round" />
        {pass === "fill" && hand && <g transform={`rotate(${pose.wr ?? 0} ${sx} ${wy})`}>{hand(sx, wy)}</g>}
      </g>
    </g>
  );
};

/** Нога-цепочка: бедро → колено → стопа на линии пола (y=0). Колено смещается при приседе, стопа не отрывается от пола. */
export const Leg = ({ hx, hy, kx, ky, fx, w, color, pass }: { hx: number; hy: number; kx: number; ky: number; fx: number; w: number; color: string; pass: Pass }) => {
  const st = pass === "out" ? LINE : color;
  const k = pass === "out" ? 6 : 0;
  return <path d={`M${hx} ${hy} L${kx} ${ky} L${fx} -14`} stroke={st} strokeWidth={w + k} strokeLinecap="round" strokeLinejoin="round" fill="none" />;
};

/**
 * Кисть Димы, свисающая из запястья (x,y). Слои строго: ладонь → предмет → пальцы поверх.
 * item рисуется с началом координат в точке хвата; itemRot компенсирует поворот руки (кружка стоит ровно).
 */
export const GripHand = ({ x, y, item, itemRot = 0, point = false, open = false }: { x: number; y: number; item?: React.ReactNode; itemRot?: number; point?: boolean; open?: boolean }) => {
  /* все пути в локальных координатах кисти: запястье (0,0), рука смотрит вниз (+y) */
  const palm = "M-18 -4 C-23 12 -23 34 -15 46 L15 46 C23 34 23 12 18 -4 Z";
  // сжатые пальцы с большим пальцем — один контур (костяшки — волна по верхнему краю)
  const fist = "M-24 14 C-34 10 -36 30 -26 36 C-26 46 -18 56 -6 57 C6 58 18 54 22 44 C26 34 25 20 21 12 Q16 19 11 12 Q6 19 1 12 Q-4 19 -9 12 Q-14 19 -18 12 C-20 12 -22 13 -24 14 Z";
  // кулак с вытянутым указательным — тоже один контур, палец не отрывается от кисти
  const pointer = "M-24 14 C-34 10 -36 30 -26 36 C-26 46 -18 56 -6 57 L-1 57 L-1 104 C-1 112 13 112 13 104 L13 55 C20 50 25 36 21 12 Q16 19 11 12 Q6 19 1 12 Q-4 19 -9 12 Q-14 19 -18 12 C-20 12 -22 13 -24 14 Z";
  const openHand = "M-18 -4 C-24 14 -26 34 -20 44 L-22 74 C-22 80 -14 80 -14 74 L-10 50 L-8 84 C-8 90 0 90 0 84 L1 52 L5 82 C5 88 13 88 13 82 L12 50 L18 70 C19 76 27 74 25 68 L20 38 C24 22 22 8 18 -4 Z";
  return (
    <g transform={`translate(${x} ${y})`}>
      {open ? (
        <path d={openHand} fill={SKIN} {...OUT} />
      ) : (
        <>
          <path d={palm} fill={SKIN} {...OUT} />
          {item && <g transform={`translate(0 26) rotate(${itemRot})`}>{item}</g>}
          <path d={point ? pointer : fist} fill={SKIN} {...OUT} />
          <path d="M-9 20 v14 M1 20 v16 M11 20 v14" stroke={SKIN_SH} strokeWidth={2.5} strokeLinecap="round" />
          <path d="M-26 30 q6 4 10 -2" stroke={SKIN_SH} strokeWidth={2.5} fill="none" />
        </>
      )}
    </g>
  );
};

/** Глаз, обрезанный по белку: зрачок-точка и прямое веко «-_-» не выходят за контур. */
const Eye = ({ cx, cy, rx, ry, lid, pupil = 3.2, look = 0, skin = SKIN, glow }: { cx: number; cy: number; rx: number; ry: number; lid: number; pupil?: number; look?: number; skin?: string; glow?: string }) => {
  const id = uid();
  const lidY = cy - ry + ry * 2 * lid;
  return (
    <g>
      <defs>
        <clipPath id={id}>
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} />
        </clipPath>
      </defs>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={glow ? "#0b0c0e" : "#fbf8f2"} />
      <g clipPath={`url(#${id})`}>
        <circle cx={cx + look * rx * 0.4} cy={cy + ry * 0.15} r={pupil} fill={glow ?? "#151214"} />
        {glow && <circle cx={cx + look * rx * 0.4} cy={cy + ry * 0.15} r={pupil * 2.6} fill={glow} opacity={0.25} />}
        {lid > 0 && <rect x={cx - rx - 2} y={cy - ry - 2} width={rx * 2 + 4} height={lidY - (cy - ry) + 2} fill={skin} />}
        {lid > 0 && <line x1={cx - rx} y1={lidY} x2={cx + rx} y2={lidY} stroke={LINE} strokeWidth={3} vectorEffect="non-scaling-stroke" />}
      </g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" {...OUT} />
    </g>
  );
};

export type DimaPose = {
  armL: ArmPose;
  armR: ArmPose;
  head?: number;
  itemL?: React.ReactNode;
  itemR?: React.ReactNode;
  pointR?: boolean;
  pointL?: boolean;
  /** 0.55 — полуприкрытые «-_-», 1 — закрыты */
  lid?: number;
  look?: number;
  lean?: number;
  yawn?: number;
};

/**
 * Дима во весь рост, сутулый. Начало координат — середина стоп на полу; рост ~750.
 * Иерархия: ноги → верх (дыхание 2–3px, подол футболки заходит на треники) → голова (rotate у основания шеи) / руки (кости, короткий рукав поверх плеча).
 */
export const Dima = ({ x, y, s = 1, t, pose }: { x: number; y: number; s?: number; t: number; pose: DimaPose }) => {
  const br = 2.5 * (0.5 + 0.5 * Math.sin(t * 2.1));
  const lid = pose.lid ?? 0.55;
  const amp = React.useContext(MouthCtx).dima;
  const nod = amp * 3 * Math.sin(t * 9);
  const totL = pose.armL.sh + pose.armL.el + (pose.armL.wr ?? 0);
  const totR = pose.armR.sh + pose.armR.el + (pose.armR.wr ?? 0);
  const sleeve = { color: TEE, len: 58 };
  const arms = (pass: Pass) => (
    <>
      <Arm sx={-62} sy={-548} up={140} fo={128} w={28} color={SKIN} sleeve={sleeve} pose={pose.armL} pass={pass} hand={(wx, wy) => <GripHand x={wx} y={wy} item={pose.itemL} itemRot={-totL} point={pose.pointL} />} />
      <Arm sx={62} sy={-548} up={140} fo={128} w={28} color={SKIN} sleeve={sleeve} pose={pose.armR} pass={pass} hand={(wx, wy) => <GripHand x={wx} y={wy} item={pose.itemR} itemRot={-totR} point={pose.pointR} />} />
    </>
  );
  return (
    <g transform={`translate(${x} ${y}) rotate(${pose.lean ?? 0}) scale(${s})`}>
      <ellipse cx={0} cy={0} rx={110} ry={16} fill="#000" opacity={0.35} />
      {/* треники с вытянутыми коленками, стопы в носках на полу */}
      <Leg hx={-26} hy={-350} kx={-32} ky={-170} fx={-36} w={50} color={PANTS} pass="out" />
      <Leg hx={26} hy={-350} kx={32} ky={-170} fx={36} w={50} color={PANTS} pass="out" />
      <Leg hx={-26} hy={-350} kx={-32} ky={-170} fx={-36} w={50} color={PANTS} pass="fill" />
      <Leg hx={26} hy={-350} kx={32} ky={-170} fx={36} w={50} color={PANTS} pass="fill" />
      {[-1, 1].map((d) => <path key={`k2${d}`} d={`M${d * 34 - 16} -178 q16 10 30 0 M${d * 34 - 14} -150 q14 8 28 0`} stroke="#474b52" strokeWidth={3} fill="none" strokeLinecap="round" />)}
      {[-1, 1].map((d) => <path key={`l${d}`} d={`M${d * 50} -340 L${d * 56} -170 L${d * 58} -20`} stroke="#f2f2f2" strokeWidth={6} fill="none" strokeLinecap="round" />)}
      {[-1, 1].map((d) => <path key={d} d={`M${d * 36 - 26} 0 C${d * 36 - 30} -34 ${d * 36 + 26} -38 ${d * 36 + 34} 0 Z`} fill={SOCK} {...OUT} />)}
      <g transform={`translate(0 ${-br})`}>
        {/* голова и шея: сутулость — голова вперёд и вниз */}
        <g transform={`translate(0 14) rotate(${(pose.head ?? 0) + nod} 0 -578)`}>
          <rect x={-16} y={-626} width={32} height={56} fill={SKIN_SH} {...OUT} />
          <DimaHead lid={lid} look={pose.look ?? 0.1} yawn={pose.yawn ?? 0} />
        </g>
        {/* растянутая футболка: пузо, пятно, подол заходит на пояс треников */}
        <path d="M-82 -318 C-96 -400 -88 -500 -80 -530 C-74 -566 -40 -580 0 -580 C40 -580 74 -566 80 -530 C88 -500 100 -400 86 -318 C40 -306 -40 -306 -82 -318 Z" fill={TEE} {...OUT} />
        <path d="M-32 -580 C-24 -556 24 -556 32 -580" fill={TEE_SH} {...OUT} />
        <path d="M60 -500 C92 -440 96 -370 86 -318 L70 -318 C80 -380 76 -440 60 -500 Z" fill={TEE_SH} opacity={0.7} />
        <path d="M-40 -432 c10 -14 30 -10 32 4 c10 2 12 18 0 22 c-6 12 -26 10 -30 -2 c-12 -2 -14 -18 -2 -24 Z" fill="#8a6a3a" opacity={0.6} />
        {arms("out")}
        {arms("fill")}
      </g>
    </g>
  );
};

/** Голова Димы (центр 0,-690): лохматые тёмные волосы, щетина, «-_-», ровный рот. Для крупных планов масштабируется целиком. */
export const DimaHead = ({ lid = 0.55, look = 0.1, yawn = 0 }: { lid?: number; look?: number; yawn?: number }) => (
  <g>
    <path d="M-74 -700 C-82 -790 82 -790 74 -700 L70 -680 L-70 -680 Z" fill={HAIR} {...OUT} />
    {[-1, 1].map((d) => <ellipse key={d} cx={d * 70} cy={-684} rx={12} ry={18} fill={SKIN} {...OUT} />)}
    <ellipse cx={0} cy={-682} rx={68} ry={78} fill={SKIN} {...OUT} />
    <path d="M30 -740 C62 -716 66 -670 52 -628 C62 -660 60 -700 30 -740 Z" fill={SKIN_SH} opacity={0.7} />
    <path d="M-72 -700 C-70 -770 70 -775 74 -704 L58 -716 L50 -694 L34 -722 L20 -700 L4 -726 L-12 -702 L-28 -728 L-42 -704 L-56 -724 Z" fill={HAIR} {...OUT} />
    <Eye cx={-26} cy={-684} rx={16} ry={11} lid={lid} look={look} />
    <Eye cx={26} cy={-684} rx={16} ry={11} lid={lid} look={look} />
    <path d="M-34 -666 q8 4 16 0 M18 -666 q8 4 16 0" stroke={SKIN_SH} strokeWidth={3} fill="none" />
    <path d="M-42 -704 H-12 M12 -704 H42" stroke={HAIR} strokeWidth={6} strokeLinecap="round" />
    <path d="M0 -676 q-6 18 4 22" {...OUT} fill="none" />
    <DimaMouth yawn={yawn} />
    {Array.from({ length: 30 }, (_, i) => <circle key={i} cx={-36 + ((i * 23) % 72)} cy={-628 + ((i * 7) % 22)} r={1.5} fill={HAIR} opacity={0.6} />)}
    {Array.from({ length: 10 }, (_, i) => <circle key={`c${i}`} cx={-52 + ((i * 31) % 104)} cy={-652 + ((i * 11) % 16)} r={1.3} fill={HAIR} opacity={0.45} />)}
  </g>
);

/** Рот Димы: 4 виземы по громкости его реплики; зевок поверх. */
const DimaMouth = ({ yawn = 0 }: { yawn?: number }) => {
  const v = viseme(React.useContext(MouthCtx).dima);
  if (yawn > 0.05) return <ellipse cx={0} cy={-636} rx={10 + yawn * 6} ry={4 + yawn * 16} fill="#4a1a1a" {...OUT} />;
  if (v === 0) return <line x1={-18} y1={-638} x2={18} y2={-638} {...OUT} />;
  if (v === 1) return <path d="M-16 -640 Q0 -634 16 -640 Q0 -630 -16 -640 Z" fill="#4a1a1a" {...OUT} />;
  const h = v === 2 ? 14 : 24;
  const w = v === 2 ? 16 : 20;
  return (
    <g>
      <path d={`M${-w} -642 Q0 -646 ${w} -642 Q${w * 0.8} ${-642 + h} 0 ${-640 + h} Q${-w * 0.8} ${-642 + h} ${-w} -642 Z`} fill="#3a1212" {...OUT} />
      <path d={`M${-w + 4} -642 Q0 -645 ${w - 4} -642 L${w - 6} -637 Q0 -639 ${-w + 6} -637 Z`} fill="#f4f0e8" />
      {v === 3 && <ellipse cx={0} cy={-642 + h - 6} rx={9} ry={5} fill="#c45a5a" />}
    </g>
  );
};

/** Коготь-палец: три сужающиеся фаланги и чёрный коготь, всё одним контуром 2.5px. */
const ClawFinger = ({ x, y, ang, len, w, curl = 0 }: { x: number; y: number; ang: number; len: number; w: number; curl?: number }) => {
  const a = (ang * Math.PI) / 180;
  const seg = [len * 0.42, len * 0.33, len * 0.25];
  let px = x;
  let py = y;
  let dir = a;
  const pts: [number, number, number][] = [[px, py, w]];
  seg.forEach((l, i) => {
    dir += ((curl * 38) * Math.PI) / 180;
    px += Math.sin(dir) * l;
    py += Math.cos(dir) * l;
    pts.push([px, py, w * (0.85 - i * 0.18)]);
  });
  const nx = Math.sin(dir + Math.PI / 2);
  const ny = Math.cos(dir + Math.PI / 2);
  const left = pts.map(([X, Y, W]) => `${X + (nx * W) / 2} ${Y + (ny * W) / 2}`);
  const right = pts.map(([X, Y, W]) => `${X - (nx * W) / 2} ${Y - (ny * W) / 2}`).reverse();
  const [tx, ty, tw] = pts[3];
  const cl = 26;
  return (
    <g>
      <path d={`M${left.join(" L")} L${right.join(" L")} Z`} fill={MON_HI} stroke={LINE} strokeWidth={2.5} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      {pts.slice(1, 3).map(([X, Y, W], i) => <line key={i} x1={X + (nx * W) / 2.6} y1={Y + (ny * W) / 2.6} x2={X - (nx * W) / 2.6} y2={Y - (ny * W) / 2.6} stroke={MON_SH} strokeWidth={2} />)}
      <path d={`M${tx + (nx * tw) / 2} ${ty + (ny * tw) / 2} Q${tx + Math.sin(dir) * cl * 0.7 + nx * 4} ${ty + Math.cos(dir) * cl * 0.7 + ny * 4} ${tx + Math.sin(dir + 0.35) * cl} ${ty + Math.cos(dir + 0.35) * cl} L${tx - (nx * tw) / 2} ${ty - (ny * tw) / 2} Z`} fill="#0d0d10" stroke={LINE} strokeWidth={2.5} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </g>
  );
};

/** Когтистая кисть монстра из запястья (x,y): ладонь → предмет → пальцы (при хвате — загнуты поверх предмета). */
export const ClawHand = ({ x, y, spread = 1, grip = 0, item, itemRot = 0, dir = 1, size = 1.45 }: { x: number; y: number; spread?: number; grip?: number; item?: React.ReactNode; itemRot?: number; dir?: number; size?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${size}) translate(${-x} ${-y})`}>
    <ellipse cx={x} cy={y + 22} rx={24} ry={28} fill={MON} stroke={LINE} strokeWidth={2.5} vectorEffect="non-scaling-stroke" />
    {item && <g transform={`translate(${x} ${y + 34}) rotate(${itemRot}) scale(${1 / size})`}>{item}</g>}
    {[-1.5, -0.5, 0.5, 1.5].map((k, i) => (
      <ClawFinger key={i} x={x + k * 12} y={y + 40} ang={k * 9 * spread} len={grip > 0 ? 70 : 118 - Math.abs(k) * 12} w={12} curl={grip > 0 ? 1.05 * dir : 0.12 * dir} />
    ))}
    <ClawFinger x={x - 22 * dir} y={y + 22} ang={-50 * dir * spread} len={grip > 0 ? 54 : 74} w={12} curl={grip > 0 ? -0.9 * dir : 0} />
  </g>
);

export type NuancePose = {
  armL: ArmPose;
  armR: ArmPose;
  head?: number;
  crouch?: number;
  itemL?: React.ReactNode;
  itemR?: React.ReactNode;
  gripL?: number;
  gripR?: number;
  guilty?: number;
  mouth?: number;
  /** лапы спрятаны за спину (руки рисуются позади торса) */
  behind?: boolean;
  /** перспективный размер кистей (когти на камеру) */
  hand?: number;
  goggles?: boolean;
};

/**
 * Нюанс: жуткий сутулый трёхметровый силуэт (~1250), угольный градиент, рёбра и ключицы, растрёпанные пряди,
 * провалы глазниц с асимметричными светящимися точками, кривая ухмылка с острыми зубами, жёлтый контровой ореол.
 * crouch 0..1 — сгибает колени (бёдра ниже, стопы на полу).
 */
export const Nuance = ({ x, y, s = 1, t, pose }: { x: number; y: number; s?: number; t: number; pose: NuancePose }) => {
  const id = uid();
  const c = pose.crouch ?? 0;
  const hipY = -600 + c * 170;
  const kneeDx = 40 + c * 110;
  const br = 3 * Math.sin(t * 1.6);
  const hs = pose.hand ?? 1.45;
  const totL = pose.armL.sh + pose.armL.el + (pose.armL.wr ?? 0);
  const totR = pose.armR.sh + pose.armR.el + (pose.armR.wr ?? 0);
  const arms = (pass: Pass) => (
    <>
      <Arm sx={-96} sy={-990} up={330} fo={300} w={24} color={MON} pose={pose.armL} pass={pass} hand={(wx, wy) => <ClawHand x={wx} y={wy} grip={pose.gripL} item={pose.itemL} itemRot={-totL} dir={-1} size={hs} />} />
      <Arm sx={96} sy={-990} up={330} fo={300} w={24} color={MON} pose={pose.armR} pass={pass} hand={(wx, wy) => <ClawHand x={wx} y={wy} grip={pose.gripR} item={pose.itemR} itemRot={-totR} dir={1} size={hs} />} />
    </>
  );
  const legs = (pass: Pass) => [-1, 1].map((d) => <Leg key={`${pass}${d}`} hx={d * 34} hy={hipY} kx={d * kneeDx} ky={-300 + c * 60} fx={d * 52} w={24} color={MON} pass={pass} />);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <defs>
        <filter id={id} x="-30%" y="-10%" width="160%" height="120%">
          <feMorphology in="SourceAlpha" operator="dilate" radius="5" result="d" />
          <feGaussianBlur in="d" stdDeviation="9" result="b" />
          <feFlood floodColor={RIM} floodOpacity="0.85" />
          <feComposite in2="b" operator="in" result="g" />
          <feMerge>
            <feMergeNode in="g" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id={`${id}-b`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={MON_SH} />
          <stop offset="70%" stopColor={MON_HI} />
          <stop offset="100%" stopColor={MON_SH} />
        </linearGradient>
      </defs>
      <ellipse cx={0} cy={0} rx={150} ry={18} fill="#000" opacity={0.4} />
      <g filter={`url(#${id})`}>
        {legs("out")}
        {legs("fill")}
        {[-1, 1].map((d) => (
          <g key={d}>
            <path d={`M${d * 52 - 34} 0 C${d * 52 - 30} -26 ${d * 52 + 30} -30 ${d * 52 + 46} 0 Z`} fill={MON} {...OUT} strokeWidth={2.5} />
            {[0, 1, 2].map((i) => <path key={i} d={`M${d * 52 - 14 + i * 20} -2 l${d * 6} 0 l${-d * 2} -10 Z`} fill="#0d0d10" {...OUT} strokeWidth={2.5} />)}
          </g>
        ))}
        <g transform={`translate(0 ${c * 170 - br})`}>
          {pose.behind && arms("out")}
          {pose.behind && arms("fill")}
          {/* сутулость: голова ниже линии плеч, шея выгнута вперёд */}
          <g transform={`translate(0 40) rotate(${pose.head ?? 0} 0 -1000)`}>
            <path d="M-16 -1000 C-20 -1040 -10 -1070 0 -1086 C10 -1070 20 -1040 16 -1000 Z" fill={MON_SH} {...OUT} strokeWidth={2.5} />
            <NuanceHead guilty={pose.guilty ?? 0} mouth={pose.mouth ?? 0} t={t} goggles={pose.goggles} />
          </g>
          {/* торс: горб, узкая талия, выступающие рёбра и ключицы */}
          <path d="M-46 -560 C-60 -700 -116 -880 -118 -950 C-118 -1000 -70 -1030 0 -1024 C70 -1030 118 -1000 118 -950 C116 -880 60 -700 46 -560 Z" fill={`url(#${id}-b)`} {...OUT} strokeWidth={2.5} />
          <path d="M-100 -985 C-60 -965 -24 -968 -6 -990 M100 -985 C60 -965 24 -968 6 -990" stroke="#4a4f5a" strokeWidth={7} fill="none" strokeLinecap="round" />
          {Array.from({ length: 6 }, (_, i) => {
            const yy = -935 + i * 40;
            const w = 88 - i * 10;
            return (
              <g key={i}>
                <path d={`M${-w} ${yy} Q${-w * 0.4} ${yy + 24} -10 ${yy + 10}`} stroke="#4a4f5a" strokeWidth={6} fill="none" strokeLinecap="round" />
                <path d={`M${w} ${yy} Q${w * 0.4} ${yy + 24} 10 ${yy + 10}`} stroke="#4a4f5a" strokeWidth={6} fill="none" strokeLinecap="round" />
              </g>
            );
          })}
          <path d="M0 -990 V-640" stroke={MON_SH} strokeWidth={6} />
          {!pose.behind && arms("out")}
          {!pose.behind && arms("fill")}
        </g>
      </g>
    </g>
  );
};

/** Голова Нюанса (центр 0,-1150): череп, растрёпанные пряди, провалы глазниц с асимметричными огоньками, кривая ухмылка с острыми зубами. */
export const NuanceHead = ({ guilty = 0, mouth = 0, t = 0, goggles = false }: { guilty?: number; mouth?: number; t?: number; goggles?: boolean }) => {
  const id = uid();
  const amp = React.useContext(MouthCtx).nuance;
  const v = viseme(amp);
  // рот двигается только на его репликах; mouth — статичный оскал вне реплик
  const open = amp > 0 ? [8, 16, 28, 42][v] : mouth > 0 ? 10 + mouth * 18 : 8;
  const flick = 0.8 + 0.2 * Math.sin(t * 7);
  return (
    <g>
      <path d="M-70 -1150 C-80 -1260 -40 -1280 0 -1280 C40 -1280 80 -1260 70 -1150 C66 -1090 40 -1056 0 -1050 C-40 -1056 -66 -1090 -70 -1150 Z" fill={MON_HI} {...OUT} strokeWidth={2.5} />
      <path d="M30 -1270 C70 -1240 74 -1150 40 -1070 C58 -1140 60 -1220 30 -1270 Z" fill={MON_SH} />
      {/* растрёпанные пряди: шапка волос и пряди, свисающие вдоль лица (без торчащих концов) */}
      <path d="M-70 -1170 C-82 -1268 -40 -1290 0 -1288 C40 -1290 82 -1268 70 -1170 L62 -1200 L52 -1172 L40 -1214 L26 -1186 L12 -1222 L-4 -1190 L-18 -1224 L-32 -1188 L-46 -1214 L-58 -1176 Z" fill="#0c0d10" {...OUT} strokeWidth={2.5} />
      {[-58, -46, 46, 58].map((x0, i) => {
        const sw = Math.sin(t * 1.3 + i) * 4;
        return <path key={i} d={`M${x0} -1200 C${x0 + sw} -1150 ${x0 - sw} -1110 ${x0 + (x0 < 0 ? 4 : -4)} ${-1050 + (i % 2) * 30}`} stroke="#0c0d10" strokeWidth={8} fill="none" strokeLinecap="round" />;
      })}
      {/* надбровья: виноватая мина — внутренние концы вверх */}
      <path d={`M-58 ${-1196 + guilty * 6} L-12 ${-1190 - guilty * 14} M12 ${-1190 - guilty * 14} L58 ${-1196 + guilty * 6}`} stroke="#0c0d10" strokeWidth={9} strokeLinecap="round" />
      {/* провалы глазниц: огоньки разного размера и высоты */}
      <Eye cx={-30} cy={-1160} rx={22} ry={27} lid={0} pupil={5.5 * flick} skin={MON} glow="#ffffff" look={guilty * -0.4} />
      <Eye cx={31} cy={-1156} rx={20} ry={23} lid={0} pupil={3.6 * flick} skin={MON} glow="#ffffff" look={0.3 - guilty * 0.5} />
      {goggles && (
        <g>
          <rect x={-60} y={-1182} width={52} height={36} rx={10} fill="rgba(255,214,60,.55)" stroke={LINE} strokeWidth={3} />
          <rect x={8} y={-1178} width={48} height={32} rx={10} fill="rgba(255,214,60,.55)" stroke={LINE} strokeWidth={3} />
          <path d="M-8 -1164 H8 M-60 -1166 L-72 -1172 M56 -1164 L70 -1170" stroke={LINE} strokeWidth={4} />
          <path d="M-52 -1176 l12 0" stroke="#fff" strokeWidth={3} opacity={0.8} />
        </g>
      )}
      {/* кривая ухмылка с острыми зубами */}
      <defs>
        <clipPath id={id}>
          <path d={`M-48 -1108 Q-6 ${-1096 + open * 0.4} 50 -1120 Q20 ${-1100 + open} -40 ${-1098 + open * 0.8} Z`} />
        </clipPath>
      </defs>
      <path d={`M-48 -1108 Q-6 ${-1096 + open * 0.4} 50 -1120 Q20 ${-1100 + open} -40 ${-1098 + open * 0.8} Z`} fill="#09090b" />
      <g clipPath={`url(#${id})`}>
        {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${-46 + i * 12} ${-1112 + i * -1.2} l6 14 l6 -14 Z`} fill="#efe9da" stroke={LINE} strokeWidth={1.2} />)}
        {Array.from({ length: 7 }, (_, i) => <path key={`b${i}`} d={`M${-40 + i * 12} ${-1094 + open * 0.8 - i * 0.6} l6 -12 l6 12 Z`} fill="#efe9da" stroke={LINE} strokeWidth={1.2} />)}
      </g>
      <path d={`M-48 -1108 Q-6 ${-1096 + open * 0.4} 50 -1120 Q20 ${-1100 + open} -40 ${-1098 + open * 0.8} Z`} fill="none" {...OUT} strokeWidth={2.5} />
    </g>
  );
};

/** Вор в балаклаве и куртке, с мешком «₽». drop — уронил отмычку, dizzy — спиральки @_@. */
export const Thief = ({ x, y, s = 1, t, dizzy = 0 }: { x: number; y: number; s?: number; t: number; dizzy?: number }) => {
  const shake = Math.sin(t * 60) * 2 * dizzy;
  return (
    <g transform={`translate(${x + shake} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={0} rx={110} ry={14} fill="#000" opacity={0.35} />
      {[-1, 1].map((d) => <path key={d} d={`M${d * 24} -340 L${d * 30} -14`} stroke={LINE} strokeWidth={46} strokeLinecap="round" />)}
      {[-1, 1].map((d) => <path key={`f${d}`} d={`M${d * 24} -340 L${d * 30} -14`} stroke="#22252b" strokeWidth={40} strokeLinecap="round" />)}
      {[-1, 1].map((d) => <path key={`s${d}`} d={`M${d * 30 - 30} 0 C${d * 30 - 30} -28 ${d * 30 + 30} -30 ${d * 30 + 32} 0 Z`} fill={SHOE} {...OUT} />)}
      {/* мешок с $ за спиной */}
      <path d="M70 -520 C150 -540 190 -420 170 -330 C150 -280 70 -280 60 -340 Z" fill="#c9b48a" {...OUT} />
      <text x={122} y={-380} textAnchor="middle" fontFamily="Arial Black, sans-serif" fontWeight={900} fontSize={56} fill="#3a7a3a">₽</text>
      <path d="M-80 -300 L-86 -540 C-86 -580 86 -580 86 -540 L80 -300 Z" fill="#15161a" {...OUT} />
      <path d="M0 -572 V-310" stroke="#2a2c33" strokeWidth={4} />
      <rect x={-16} y={-610} width={32} height={50} fill="#101114" {...OUT} />
      {/* балаклава с прорезью для глаз */}
      <ellipse cx={0} cy={-670} rx={62} ry={72} fill="#101114" {...OUT} />
      <rect x={-48} y={-690} width={96} height={40} rx={18} fill={SKIN} {...OUT} />
      {dizzy > 0.5 ? (
        [-22, 22].map((ex) => <path key={ex} d={`M${ex} -670 m-10 0 a10 10 0 1 1 10 10 a6 6 0 1 1 -6 -6`} stroke={LINE} strokeWidth={3} fill="none" />)
      ) : (
        <>
          <Eye cx={-22} cy={-670} rx={13} ry={14} lid={0} pupil={3} />
          <Eye cx={22} cy={-670} rx={13} ry={14} lid={0} pupil={3} />
        </>
      )}
      {[-1, 1].map((d) => (
        <g key={`a${d}`} transform={`rotate(${d * (dizzy > 0.5 ? 20 : 140)} ${d * 70} -540)`}>
          <line x1={d * 70} y1={-540} x2={d * 70} y2={-300} stroke={LINE} strokeWidth={38} strokeLinecap="round" />
          <line x1={d * 70} y1={-540} x2={d * 70} y2={-300} stroke="#15161a" strokeWidth={32} strokeLinecap="round" />
          <GripHand x={d * 70} y={-300} open />
        </g>
      ))}
      {dizzy > 0 &&
        [0, 1, 2].map((i) => {
          const a = t * 6 + (i * Math.PI * 2) / 3;
          return <text key={i} x={Math.cos(a) * 90} y={-780 + Math.sin(a) * 22} textAnchor="middle" fontFamily="Arial Black, sans-serif" fontSize={40} fill="#ffd23a" stroke={LINE} strokeWidth={2} opacity={dizzy}>@</text>;
        })}
    </g>
  );
};

/** Вор в обмороке на полу: лежит целиком, на линии пола, со спиральками над головой. */
export const ThiefDown = ({ x, y, s = 1, t }: { x: number; y: number; s?: number; t: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={0} rx={330} ry={18} fill="#000" opacity={0.35} />
    {/* ноги вправо, голова влево */}
    {[0, 1].map((i) => <path key={i} d={`M60 ${-40 - i * 26} L300 ${-24 - i * 30}`} stroke={LINE} strokeWidth={44} strokeLinecap="round" />)}
    {[0, 1].map((i) => <path key={`f${i}`} d={`M60 ${-40 - i * 26} L300 ${-24 - i * 30}`} stroke="#22252b" strokeWidth={38} strokeLinecap="round" />)}
    {[0, 1].map((i) => <path key={`s${i}`} d={`M300 ${-6 - i * 30} C330 ${-6 - i * 30} 334 ${-50 - i * 30} 304 ${-52 - i * 30} Z`} fill={SHOE} {...OUT} />)}
    <path d="M-200 -6 L-200 -96 C-200 -110 70 -110 80 -96 L80 -6 Z" fill="#15161a" {...OUT} />
    <path d="M-120 -96 C-160 -190 -40 -230 0 -150 C20 -110 -20 -90 -60 -96 Z" fill="#c9b48a" {...OUT} />
    <text x={-62} y={-130} textAnchor="middle" fontFamily="Arial Black, sans-serif" fontWeight={900} fontSize={44} fill="#3a7a3a">₽</text>
    <ellipse cx={-262} cy={-56} rx={64} ry={52} fill="#101114" {...OUT} />
    <rect x={-300} y={-76} width={70} height={36} rx={16} fill={SKIN} {...OUT} />
    {[-282, -250].map((ex) => <path key={ex} d={`M${ex} -58 m-8 0 a8 8 0 1 1 8 8 a5 5 0 1 1 -5 -5`} stroke={LINE} strokeWidth={3} fill="none" />)}
    <path d="M-120 -96 L-160 -150 M-40 -96 L-10 -150" stroke={LINE} strokeWidth={30} strokeLinecap="round" />
    <path d="M-120 -96 L-160 -150 M-40 -96 L-10 -150" stroke="#15161a" strokeWidth={24} strokeLinecap="round" />
    {[0, 1, 2].map((i) => {
      const a = t * 6 + (i * Math.PI * 2) / 3;
      return <text key={i} x={-262 + Math.cos(a) * 80} y={-150 + Math.sin(a) * 18} textAnchor="middle" fontFamily="Arial Black, sans-serif" fontSize={36} fill="#ffd23a" stroke={LINE} strokeWidth={2}>@</text>;
    })}
  </g>
);

/** Прямая кинематика: где оказывается точка хвата кисти (в координатах персонажа до масштаба). */
export const gripPoint = (sx: number, sy: number, up: number, fo: number, p: ArmPose, grab: number) => {
  const r = Math.PI / 180;
  const a1 = p.sh * r;
  const a2 = (p.sh + p.el) * r;
  const a3 = (p.sh + p.el + (p.wr ?? 0)) * r;
  return {
    x: sx - Math.sin(a1) * up - Math.sin(a2) * fo - Math.sin(a3) * grab,
    y: sy + Math.cos(a1) * up + Math.cos(a2) * fo + Math.cos(a3) * grab,
  };
};

/** Двухзвенная обратная кинематика: углы плеча и локтя, чтобы запястье пришло в (tx,ty). bend — сторона сгиба локтя. */
export const ik = (sx: number, sy: number, tx: number, ty: number, up: number, fo: number, bend = 0): ArmPose => {
  const dx = tx - sx;
  const dy = ty - sy;
  const D = Math.min(up + fo - 1, Math.max(Math.abs(up - fo) + 1, Math.hypot(dx, dy)));
  const deg = 180 / Math.PI;
  const base = Math.atan2(-dx, dy) * deg;
  const a = Math.acos((up * up + D * D - fo * fo) / (2 * up * D)) * deg;
  const b = Math.acos((up * up + fo * fo - D * D) / (2 * up * fo)) * deg;
  const pick = (k: number) => ({ sh: base + k * a, el: -k * (180 - b) });
  if (bend !== 0) return pick(bend);
  // локоть вниз и наружу от корпуса: не выворачивается к спине и не перекрещивает руки
  const side = Math.sign(sx) || 1;
  const score = (k: number) => {
    const r = ((base + k * a) * Math.PI) / 180;
    return Math.cos(r) + 0.8 * side * -Math.sin(r);
  };
  return pick(score(1) >= score(-1) ? 1 : -1);
};
/** Рука Нюанса к точке кадра (wx,wy). */
export const nuanceReach = (side: -1 | 1, wx: number, wy: number, x: number, y: number, s: number, crouch = 0, _bend = 0) =>
  ik(side * 96, -990, (wx - x) / s, (wy - y) / s - crouch * 170, 330, 300, 0);
/** Рука Димы к точке кадра (wx,wy). */
export const dimaReach = (side: -1 | 1, wx: number, wy: number, x: number, y: number, s: number, _bend = 0) =>
  ik(side * 62, -548, (wx - x) / s, (wy - y) / s, 140, 128, 0);
