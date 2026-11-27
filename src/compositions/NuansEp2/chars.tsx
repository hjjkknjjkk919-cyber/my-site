import React from "react";
import { MONT } from "../../pelmeni/kit";
import { Arm, Dima, type DimaPose, GripHand, LINE, MouthCtx, Nuance, type NuancePose, OUT, SKIN } from "../AvitoWardrobe/rig";

export const GOLD_RIM = "#f5b041";
export const ICE_RIM = "#7fb3d5";

/** Cel-shading + контровой свет одним фильтром: светлая кромка сверху-слева, тень-полоса снизу-справа по силуэту. */
export const RimDefs = ({ id, color }: { id: string; color: string }) => (
  <defs>
    <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
      <feOffset in="SourceAlpha" dx={-7} dy={-6} result="o1" />
      <feComposite in="SourceAlpha" in2="o1" operator="out" result="edge" />
      <feGaussianBlur in="edge" stdDeviation={1.6} result="edgeB" />
      <feFlood floodColor={color} floodOpacity={0.95} />
      <feComposite in2="edgeB" operator="in" result="rim" />
      <feOffset in="SourceAlpha" dx={12} dy={14} result="o2" />
      <feComposite in="SourceAlpha" in2="o2" operator="out" result="sh" />
      <feGaussianBlur in="sh" stdDeviation={3} result="shB" />
      <feFlood floodColor="#1a0f14" floodOpacity={0.32} />
      <feComposite in2="shB" operator="in" result="cel" />
      <feMerge>
        <feMergeNode in="SourceGraphic" />
        <feMergeNode in="cel" />
        <feMergeNode in="rim" />
      </feMerge>
    </filter>
  </defs>
);

/** Дима v2: риг 1-й серии + rim light / cel-тени + моргание каждые ~3.6 с + покачивание головы на репликах. */
export const DimaV2 = ({ x, y, s, t, pose, rim = GOLD_RIM, blink = true }: { x: number; y: number; s: number; t: number; pose: DimaPose; rim?: string; blink?: boolean }) => {
  const id = `dv2${rim.slice(1)}`;
  const amp = React.useContext(MouthCtx).dima;
  const blinking = blink && (t + 0.7) % 3.6 < 0.12;
  const sway = amp > 0.05 ? Math.sin(t * 4.5) * 1.4 : 0;
  return (
    <g>
      <RimDefs id={id} color={rim} />
      <g filter={`url(#${id})`}>
        <Dima x={x} y={y} s={s} t={t} pose={{ ...pose, lid: blinking ? 1 : pose.lid, head: (pose.head ?? 0) + sway }} />
      </g>
      {/* мешки под глазами и тень под чёлкой поверх головы */}
      <g transform={`translate(${x} ${y - 2.5 * (0.5 + 0.5 * Math.sin(t * 2.1)) * s}) rotate(${pose.lean ?? 0}) scale(${s}) translate(0 14) rotate(${(pose.head ?? 0) + sway} 0 -578)`} pointerEvents="none">
        <path d="M-66 -716 C-30 -704 30 -704 66 -716 L60 -700 C30 -694 -30 -694 -60 -700 Z" fill="#000" opacity={0.18} />
        <path d="M-40 -668 q14 7 28 0 M12 -668 q14 7 28 0" stroke="#8a5a4a" strokeWidth={3} fill="none" opacity={0.55} />
        <path d="M-50 -616 C-20 -600 20 -600 50 -616 L46 -604 C20 -592 -20 -592 -46 -604 Z" fill="#000" opacity={0.14} />
      </g>
    </g>
  );
};

/** Нюанс с собственным каналом lip-sync; embarrassed — румянец. */
export const NuansV2 = ({ x, y, s, t, pose, amp, blush = 0 }: { x: number; y: number; s: number; t: number; pose: NuancePose; amp: number; blush?: number }) => {
  const c = pose.crouch ?? 0;
  const br = 3 * Math.sin(t * 1.6);
  return (
    <MouthCtx.Provider value={{ dima: 0, nuance: amp }}>
      <Nuance x={x} y={y} s={s} t={t} pose={pose} />
      {blush > 0 && (
        <g transform={`translate(${x} ${y}) scale(${s}) translate(0 ${c * 170 - br}) translate(0 40) rotate(${pose.head ?? 0} 0 -1000)`} opacity={blush}>
          {[-44, 44].map((cx) => <ellipse key={cx} cx={cx} cy={-1118} rx={20} ry={11} fill="#ff4d6d" opacity={0.75} />)}
        </g>
      )}
    </MouthCtx.Provider>
  );
};

/** Мама Нюанса: риг Нюанса массивнее, цветастый халат, бигуди, лупа в руке. */
export const MomDemon = ({ x, y, s, t, pose, amp }: { x: number; y: number; s: number; t: number; pose: NuancePose; amp: number }) => {
  const c = pose.crouch ?? 0;
  const br = 3 * Math.sin(t * 1.6);
  const body = `translate(${x} ${y}) scale(${s * 1.08}) translate(0 ${c * 170 - br})`;
  return (
    <MouthCtx.Provider value={{ dima: 0, nuance: amp }}>
      <Nuance x={x} y={y} s={s * 1.08} t={t} pose={{ ...pose, apron: false }} />
      <g transform={body}>
        {/* халат: запах, пояс, цветы */}
        <path d="M-80 -1000 C-96 -880 -92 -700 -100 -430 L100 -430 C92 -700 96 -880 80 -1000 C40 -1024 -40 -1024 -80 -1000 Z" fill="#b8325a" {...OUT} strokeWidth={2.5} />
        <path d="M-60 -1000 L20 -720 L-10 -430 M60 -1000 L20 -720" stroke="#7d1a3c" strokeWidth={6} fill="none" />
        <path d="M-96 -700 Q0 -680 96 -700" stroke="#f2c14e" strokeWidth={16} fill="none" strokeLinecap="round" />
        {[[-50, -900], [40, -860], [-30, -780], [50, -600], [-60, -540], [10, -500], [60, -950]].map(([cx, cy], i) => (
          <g key={i} transform={`translate(${cx} ${cy})`}>
            {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx={0} cy={-10} rx={6} ry={10} fill={i % 2 ? "#ffd166" : "#7fd8c8"} transform={`rotate(${a})`} />)}
            <circle r={5} fill="#fff4d6" />
          </g>
        ))}
        {/* бигуди поверх головы и рогов-прядей */}
        <g transform={`translate(0 40) rotate(${pose.head ?? 0} 0 -1000)`}>
          {[-56, -28, 0, 28, 56].map((cx, i) => (
            <g key={cx}>
              <rect x={cx - 15} y={-1300 + Math.abs(cx) * 0.3} width={30} height={46} rx={14} fill={["#ff7aa8", "#7ad0ff", "#ffe066", "#a8ff7a", "#ff7aa8"][i]} {...OUT} strokeWidth={2.5} />
              <path d={`M${cx - 15} ${-1284 + Math.abs(cx) * 0.3} h30 M${cx - 15} ${-1270 + Math.abs(cx) * 0.3} h30`} stroke={LINE} strokeWidth={2} />
            </g>
          ))}
        </g>
      </g>
    </MouthCtx.Provider>
  );
};

/** Лупа: ручка от точки хвата вниз, линза вверху. */
export const Magnifier = () => (
  <g transform="rotate(180)">
    <rect x={-8} y={-10} width={16} height={90} rx={6} fill="#5a3a24" {...OUT} />
    <circle cx={0} cy={130} r={52} fill="rgba(200,230,255,.35)" stroke="#c9ccd2" strokeWidth={12} />
    <circle cx={0} cy={130} r={52} fill="none" {...OUT} />
    <path d="M-24 104 q10 -12 26 -12" stroke="#fff" strokeWidth={5} opacity={0.8} fill="none" />
  </g>
);

/** Портфель за ручку. */
export const Briefcase = () => (
  <g>
    <path d="M-26 0 v-20 h52 v20" stroke={LINE} strokeWidth={9} fill="none" />
    <rect x={-90} y={0} width={180} height={130} rx={14} fill="#6b3f22" {...OUT} />
    <path d="M-90 40 H90" stroke="#4a2a16" strokeWidth={5} />
    <rect x={-12} y={32} width={24} height={18} rx={3} fill="#d9b44a" {...OUT} />
  </g>
);

/** Бутерброд в фольге. */
export const Sandwich = () => (
  <g>
    <path d="M-60 -10 L60 -22 L66 30 L-54 40 Z" fill="#c9ced6" {...OUT} />
    <path d="M-40 0 l30 10 l20 -14 l26 12" stroke="#fff" strokeWidth={4} fill="none" opacity={0.8} />
  </g>
);

/** Пакет «Пятёрочки». */
export const ShopBag = () => (
  <g>
    <path d="M-30 0 C-30 -40 30 -40 30 0" stroke="#e8e8e8" strokeWidth={8} fill="none" />
    <path d="M-80 0 L80 0 L96 200 L-96 200 Z" fill="#f4f4f0" {...OUT} />
    <rect x={-60} y={60} width={120} height={70} rx={10} fill="#d7262f" />
    <text x={0} y={112} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={54} fill="#fff">5</text>
    <path d="M-60 140 h120" stroke="#2f9e44" strokeWidth={10} />
  </g>
);

/** Телефон тыльной стороной со вспышкой. */
const KidPhone = ({ flash }: { flash: number }) => (
  <g transform="translate(0 -40)">
    <rect x={-34} y={-70} width={68} height={130} rx={12} fill="#1b1d22" {...OUT} />
    <circle cx={-14} cy={-48} r={8} fill="#333" />
    <circle cx={10} cy={-48} r={6} fill={flash > 0 ? "#fff" : "#888"} />
    {flash > 0 && <circle cx={10} cy={-48} r={90 * flash} fill="#fff" opacity={0.55 * flash} />}
  </g>
);

/** Школьник со спины: капюшон, плечи, рука-кость поднимает телефон над головой. */
export const KidBack = ({ x, y, s = 1, hood, flash, t }: { x: number; y: number; s?: number; hood: string; flash: number; t: number }) => {
  const pose = { sh: 160 + Math.sin(t * 2 + x) * 4, el: -20, wr: 10 };
  const hand = (wx: number, wy: number) => <GripHand x={wx} y={wy} item={<KidPhone flash={flash} />} itemRot={-(pose.sh + pose.el + pose.wr)} />;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <Arm sx={60} sy={-300} up={130} fo={120} w={30} color={hood} pose={pose} pass="out" hand={hand} />
      <Arm sx={60} sy={-300} up={130} fo={120} w={30} color={hood} pose={pose} pass="fill" hand={hand} />
      <path d="M-130 200 C-130 -150 -90 -300 0 -310 C90 -300 130 -150 130 200 Z" fill={hood} {...OUT} />
      <ellipse cx={0} cy={-390} rx={86} ry={96} fill={hood} {...OUT} />
      <path d="M-60 -330 Q0 -300 60 -330" stroke="#000" strokeOpacity={0.3} strokeWidth={6} fill="none" />
    </g>
  );
};

/** Админ квеста за стойкой: голова, торс, руки-кости протягивают пачку купюр. */
export const Admin = ({ x, y, t, give, amp }: { x: number; y: number; t: number; give: number; amp: number }) => {
  const shake = Math.sin(t * 50) * 2;
  const pose = { sh: -60 - give * 30, el: -40 + give * 30, wr: 0 };
  const hand = (wx: number, wy: number) => (
    <GripHand x={wx} y={wy} itemRot={-(pose.sh + pose.el)} item={<g transform="scale(0.8)">{[0, 1, 2].map((i) => <rect key={i} x={-40} y={-20 + i * 6} width={80} height={44} rx={4} fill="#F472B6" {...OUT} />)}<text x={0} y={14} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={16} fill="#831843">5000 ₽</text></g>} />
  );
  return (
    <g transform={`translate(${x + shake} ${y})`}>
      <path d="M-90 0 C-96 -160 -70 -230 0 -236 C70 -230 96 -160 90 0 Z" fill="#2b2f3a" {...OUT} />
      <text x={0} y={-120} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={22} fill="#e5262b">СКЛЕП</text>
      <rect x={-14} y={-266} width={28} height={36} fill={SKIN} {...OUT} />
      <ellipse cx={0} cy={-320} rx={56} ry={64} fill={SKIN} {...OUT} />
      <path d="M-58 -340 C-60 -400 60 -404 58 -342 C40 -370 -40 -372 -58 -340 Z" fill="#c96a2b" {...OUT} />
      {[-22, 22].map((ex) => <g key={ex}><circle cx={ex} cy={-324} r={17} fill="#fff" {...OUT} /><circle cx={ex} cy={-322} r={5} fill="#111" /></g>)}
      <path d="M-5 -324 h10" stroke={LINE} strokeWidth={3} />
      <ellipse cx={0} cy={-284} rx={14} ry={3 + amp * 14} fill="#3B0D11" {...OUT} />
      <Arm sx={70} sy={-210} up={110} fo={100} w={24} color="#2b2f3a" pose={pose} pass="out" hand={hand} />
      <Arm sx={70} sy={-210} up={110} fo={100} w={24} color="#2b2f3a" pose={pose} pass="fill" hand={hand} />
    </g>
  );
};
