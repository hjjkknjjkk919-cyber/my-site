import React from "react";
import { MONT } from "../../pelmeni/kit";
import { LINE, OUT } from "./rig";

export const AMBER = "#ffb347";
export const ORANGE = "#F5A623";
export const REDK = "#FF4D4D";
export const FLOOR_Y = 1380;

/* ── предметы в руке: начало координат — точка хвата ── */
/** Кружка «МНЕ ПОХУЙ»; flip — ручка наружу для левой руки (ручка всегда от корпуса). */
export const Mug = ({ t = 0, steam = false, flip = false, line2 = "ПОХУЙ" }: { t?: number; steam?: boolean; flip?: boolean; line2?: string }) => (
  // хват за ручку: надпись «МНЕ ПОХУЙ» остаётся открытой
  <g transform={`translate(${flip ? 58 : -58} 15)`}>
    {steam &&
      [-12, 10].map((x, i) => (
        <path key={i} d={`M${x} -66 c-14 -20 14 -34 0 -56`} stroke="#fff" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.35 + 0.2 * Math.sin(t * 4 + i)} transform={`translate(${Math.sin(t * 2 + i) * 4} ${-((t * 20 + i * 12) % 14)})`} />
      ))}
    <g transform={`scale(${flip ? -1 : 1} 1)`}>
      <path d="M40 -40 C70 -40 70 10 40 10" fill="none" stroke={LINE} strokeWidth={11} />
      <path d="M40 -40 C70 -40 70 10 40 10" fill="none" stroke="#f1ece2" strokeWidth={6} />
    </g>
    <rect x={-42} y={-60} width={84} height={92} rx={9} fill="#f1ece2" {...OUT} />
    <ellipse cx={0} cy={-60} rx={42} ry={8} fill="#7a4a24" {...OUT} />
    <text x={0} y={-22} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={21} fill="#c0392b">МНЕ</text>
    <text x={0} y={6} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={21} fill="#c0392b">{line2}</text>
  </g>
);

/** Телефон экраном к зрителю; mode: волна голосового / Авито. */
export const PhoneItem = ({ t, mode = "off", s = 1 }: { t: number; mode?: "off" | "wave" | "avito" | "voice"; s?: number }) => (
  // хват за нижний край корпуса: пальцы не закрывают экран
  <g transform={`scale(${s}) translate(0 -62)`}>
    <rect x={-36} y={-80} width={72} height={140} rx={12} fill="#16171b" {...OUT} />
    <rect x={-30} y={-72} width={60} height={124} rx={8} fill={mode === "off" ? "#1c2633" : "#f4f6f8"} />
    {mode === "wave" && (
      <g>
        <circle cx={0} cy={22} r={13} fill="#e74c3c" opacity={0.6 + 0.4 * Math.sin(t * 8)} />
        {Array.from({ length: 11 }, (_, i) => {
          const h = 6 + 24 * Math.abs(Math.sin(t * 11 + i * 0.9));
          return <rect key={i} x={-26 + i * 4.8} y={-26 - h / 2} width={3} height={h} rx={1.5} fill="#21a36b" />;
        })}
      </g>
    )}
    {mode === "voice" && (
      <g>
        {/* шапка чата Авито */}
        <rect x={-30} y={-72} width={60} height={22} rx={6} fill="#ffffff" />
        <circle cx={-20} cy={-61} r={6} fill="#00aaff" />
        <rect x={-11} y={-65} width={30} height={4} rx={2} fill="#222" />
        <rect x={-11} y={-58} width={20} height={3} rx={1.5} fill="#999" />
        {/* запись голосового: волна, таймер 0:04, красная кнопка */}
        {Array.from({ length: 12 }, (_, i) => {
          const h = 4 + 20 * Math.abs(Math.sin(t * 11 + i * 0.8));
          return <rect key={i} x={-27 + i * 4.6} y={-22 - h / 2} width={2.8} height={h} rx={1.4} fill="#00aaff" />;
        })}
        <text x={-26} y={14} fontFamily={MONT} fontWeight={800} fontSize={10} fill="#e74c3c">● 0:04</text>
        <circle cx={14} cy={34} r={13} fill="#e74c3c" opacity={0.75 + 0.25 * Math.sin(t * 8)} />
        <rect x={10} y={27} width={8} height={12} rx={4} fill="#fff" />
      </g>
    )}
    {mode === "avito" && (
      <g>
        <rect x={-26} y={-66} width={52} height={10} rx={3} fill="#00aaff" />
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(0 ${-44 + i * 32 - ((t * 14) % 32)})`}>
            <rect x={-26} y={0} width={18} height={24} rx={3} fill="#c9c2b4" />
            <rect x={-4} y={4} width={28} height={5} rx={2} fill="#333" />
            <rect x={-4} y={14} width={18} height={5} rx={2} fill="#00aa55" />
          </g>
        ))}
      </g>
    )}
  </g>
);

/** Перфоратор: ручка в точке хвата, корпус и бур вправо. */
export const Drill = ({ t, on = false, flip = false }: { t: number; on?: boolean; flip?: boolean }) => {
  const j = on ? Math.sin(t * 90) * 2 : 0;
  return (
    <g transform={`translate(${j} 0) scale(${flip ? -1 : 1} 1)`}>
      <rect x={-14} y={-22} width={28} height={70} rx={10} fill="#1d1f24" {...OUT} />
      <path d="M-22 -60 H120 C134 -60 140 -50 140 -36 V-24 H-22 Z" fill="#1f6fd6" {...OUT} />
      <rect x={-20} y={-50} width={60} height={20} rx={4} fill="#ffd23a" {...OUT} />
      <rect x={140} y={-48} width={24} height={18} fill="#4a4d55" {...OUT} />
      <rect x={164} y={-42} width={90} height={7} fill="#b9bec7" {...OUT} />
      {on && <circle cx={254} cy={-38} r={14} fill="#d8d2c4" opacity={0.5} />}
    </g>
  );
};

/** Жёлтый строительный уровень с пузырьком. */
export const Level = ({ w = 360, tilt = 0 }: { w?: number; tilt?: number }) => (
  <g>
    <rect x={-w / 2} y={-18} width={w} height={36} rx={6} fill="#f4c21f" {...OUT} />
    <rect x={-40} y={-11} width={80} height={22} rx={10} fill="#bff0b0" {...OUT} />
    <ellipse cx={tilt * 26} cy={0} rx={11} ry={7} fill="#ffffff" stroke="#6aa85c" strokeWidth={2} />
    <path d="M-12 -11 V11 M12 -11 V11" stroke={LINE} strokeWidth={2} />
    {[-0.36, 0.36].map((k) => <rect key={k} x={k * w - 14} y={-8} width={28} height={16} rx={7} fill="#bff0b0" {...OUT} />)}
  </g>
);

/* ── окружение ── */
/** Комната: обои с узором, потолок, плинтус, пол; glow — янтарная полоса света на полу. */
export const Room = ({ wall = "#2a2f3a", pattern = "#323848", floor = "#3b2a20", ceiling = 120, glow }: { wall?: string; pattern?: string; floor?: string; ceiling?: number; glow?: { x: number; w: number } }) => (
  <g>
    <rect width={1080} height={1920} fill={wall} />
    {Array.from({ length: 12 }, (_, c) => (
      <g key={c}>
        <rect x={c * 90 + 34} y={ceiling} width={22} height={FLOOR_Y - ceiling} fill={pattern} />
        {Array.from({ length: 12 }, (_, r) => <path key={r} d={`M${c * 90} ${ceiling + 60 + r * 110} l12 18 l-12 18 l-12 -18 Z`} fill={pattern} />)}
      </g>
    ))}
    <rect width={1080} height={ceiling} fill="#14161c" />
    <rect y={ceiling - 10} width={1080} height={12} fill="#1c1f26" {...OUT} />
    <rect y={FLOOR_Y} width={1080} height={1920 - FLOOR_Y} fill={floor} />
    {Array.from({ length: 6 }, (_, i) => <line key={i} x1={0} y1={FLOOR_Y + 40 + i * 90} x2={1080} y2={FLOOR_Y + 40 + i * 90} stroke="#000" strokeOpacity={0.25} strokeWidth={3} />)}
    <rect y={FLOOR_Y - 26} width={1080} height={26} fill="#d8cbb4" {...OUT} />
    {glow && (
      <>
        <defs>
          <radialGradient id="room-glow" cx="0.5" cy="0" r="0.9">
            <stop offset="0%" stopColor={AMBER} stopOpacity={0.55} />
            <stop offset="100%" stopColor={AMBER} stopOpacity={0} />
          </radialGradient>
        </defs>
        <path d={`M${glow.x - glow.w / 2} ${FLOOR_Y} L${glow.x + glow.w / 2} ${FLOOR_Y} L${glow.x + glow.w * 1.2} 1920 L${glow.x - glow.w * 1.2} 1920 Z`} fill="url(#room-glow)" />
      </>
    )}
  </g>
);

/** Окно с ночными шторами, луна, чугунная батарея под ним. */
export const NightWindow = ({ x, t }: { x: number; t: number }) => (
  <g>
    <rect x={x - 150} y={300} width={300} height={430} fill="#0d1a36" {...OUT} />
    <circle cx={x + 60} cy={400} r={40} fill="#e8eeff" />
    <circle cx={x + 74} cy={392} r={34} fill="#0d1a36" opacity={0.25} />
    <path d={`M${x - 150} 515 H${x + 150} M${x} 300 V730`} stroke="#d8d2c4" strokeWidth={12} />
    <rect x={x - 168} y={726} width={336} height={18} fill="#d8d2c4" {...OUT} />
    <path d={`M${x - 190} 270 C${x - 150} 450 ${x - 170 + Math.sin(t) * 5} 620 ${x - 160} 780 L${x - 210} 780 L${x - 210} 270 Z`} fill="#4a2a4a" {...OUT} />
    <path d={`M${x + 190} 270 C${x + 150} 450 ${x + 170 - Math.sin(t) * 5} 620 ${x + 160} 780 L${x + 210} 780 L${x + 210} 270 Z`} fill="#4a2a4a" {...OUT} />
    <rect x={x - 220} y={256} width={440} height={16} rx={6} fill="#8a6a40" {...OUT} />
    {/* лунный свет на полу */}
    <path d={`M${x - 150} ${FLOOR_Y} L${x + 150} ${FLOOR_Y} L${x + 260} 1700 L${x - 40} 1700 Z`} fill="#9fb8ff" opacity={0.08} />
    {/* чугунная батарея с вертикальными трубами */}
    <path d={`M${x + 150} 820 V250 M${x + 150} 980 V${FLOOR_Y - 26}`} stroke="#b9b4a8" strokeWidth={14} />
    <path d={`M${x + 150} 820 V250 M${x + 150} 980 V${FLOOR_Y - 26}`} stroke={LINE} strokeWidth={3} strokeDasharray="0" opacity={0.4} />
    <rect x={x - 140} y={820} width={280} height={160} rx={10} fill="#b9b4a8" {...OUT} />
    {Array.from({ length: 8 }, (_, i) => <rect key={i} x={x - 128 + i * 33} y={826} width={26} height={148} rx={12} fill="#cfc9bc" {...OUT} />)}
  </g>
);

/** Ковёр на полу (вид спереди — сплюснутый овал с узором). */
export const Rug = ({ x, w }: { x: number; w: number }) => (
  <g>
    <ellipse cx={x} cy={FLOOR_Y + 120} rx={w / 2} ry={70} fill="#7a2230" {...OUT} />
    <ellipse cx={x} cy={FLOOR_Y + 120} rx={w / 2 - 30} ry={48} fill="none" stroke="#d9a441" strokeWidth={6} />
    <ellipse cx={x} cy={FLOOR_Y + 120} rx={w / 5} ry={22} fill="#203a6a" stroke="#d9a441" strokeWidth={4} />
  </g>
);

/** Тумбочка с зарядкой и часами. */
export const Nightstand = ({ x, time = "03:15" }: { x: number; time?: string }) => (
  <g>
    <rect x={x - 90} y={FLOOR_Y - 230} width={180} height={230} fill="#5a3a24" {...OUT} />
    <rect x={x - 76} y={FLOOR_Y - 200} width={152} height={80} fill="#6b4630" {...OUT} />
    <circle cx={x} cy={FLOOR_Y - 160} r={7} fill="#c9a24a" {...OUT} />
    <rect x={x - 70} y={FLOOR_Y - 290} width={110} height={58} rx={10} fill="#16161a" {...OUT} />
    <text x={x - 15} y={FLOOR_Y - 250} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={30} fill="#ff3b3b">{time}</text>
    <path d={`M${x + 50} ${FLOOR_Y - 232} C${x + 70} ${FLOOR_Y - 180} ${x + 110} ${FLOOR_Y - 150} ${x + 100} ${FLOOR_Y - 60}`} stroke="#eee" strokeWidth={4} fill="none" />
  </g>
);

/** Старый советский шкаф с антресолью и табличкой «НЕ ВЛЕЗАЙ — УБЬЁТ»; open — левая створка распахнута. */
export const Wardrobe = ({ x, w = 420, h = 980, open = 1 }: { x: number; w?: number; h?: number; open?: number }) => {
  const top = FLOOR_Y - h;
  return (
    <g>
      {/* антресоль */}
      <rect x={x - w / 2} y={top - 150} width={w} height={150} fill="#5a3a24" {...OUT} />
      <rect x={x - w / 2 + 14} y={top - 136} width={w / 2 - 20} height={122} fill="#6b4630" {...OUT} />
      <rect x={x + 6} y={top - 136} width={w / 2 - 20} height={122} fill="#6b4630" {...OUT} />
      <rect x={x - w / 2} y={top} width={w} height={h} fill="#5a3a24" {...OUT} />
      {/* открытая правая половина: тёплый свет изнутри */}
      <rect x={x - 4} y={top + 20} width={w / 2 - 12} height={h - 70} fill="#1a120b" {...OUT} />
      <rect x={x - 4} y={top + 20} width={w / 2 - 12} height={h - 70} fill={AMBER} opacity={0.4 * open} />
      {/* левая закрытая створка с табличкой */}
      <rect x={x - w / 2 + 16} y={top + 20} width={w / 2 - 20} height={h - 70} fill="#6b4630" {...OUT} />
      <rect x={x - w / 2 + 36} y={top + 50} width={w / 2 - 60} height={h - 140} fill="none" stroke="#4e321f" strokeWidth={6} />
      <circle cx={x - 22} cy={top + h / 2} r={7} fill="#c9a24a" {...OUT} />
      <g transform={`rotate(-6 ${x - w / 4} ${top + 300})`}>
        <rect x={x - w / 4 - 70} y={top + 220} width={140} height={150} fill="#f2c200" {...OUT} />
        <path d={`M${x - w / 4} ${top + 234} l-28 52 l24 0 l-10 40 l40 -58 l-24 0 l10 -34 Z`} fill="#111" />
        <text x={x - w / 4} y={top + 352} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={14} fill="#111">НЕ ВЛЕЗАЙ — УБЬЁТ</text>
        <rect x={x - w / 4 - 84} y={top + 212} width={46} height={14} fill="rgba(255,255,240,.6)" transform={`rotate(-30 ${x - w / 4 - 60} ${top + 219})`} />
      </g>
      {/* правая створка распахнута наружу в перспективе */}
      <path d={`M${x + w / 2} ${top + 6} L${x + w / 2 + 140 * open} ${top + 50} L${x + w / 2 + 140 * open} ${FLOOR_Y - 60} L${x + w / 2} ${FLOOR_Y - 20} Z`} fill="#6b4630" {...OUT} />
      <rect x={x - w / 2 - 10} y={top - 166} width={w + 20} height={20} fill="#4a2f1d" {...OUT} />
      <rect x={x - w / 2 + 10} y={FLOOR_Y - 26} width={w - 20} height={26} fill="#3a2516" {...OUT} />
    </g>
  );
};

/** Полка на кронштейнах со следами сверления вокруг; tilt — наклон в градусах. */
export const Shelf = ({ x, y, w = 420, tilt = 0 }: { x: number; y: number; w?: number; tilt?: number }) => (
  <g>
    {[[-0.42, 70], [0.38, 74], [-0.1, 90], [0.46, 60], [-0.3, 100]].map(([k, dy], i) => <circle key={i} cx={x + k * w} cy={y + dy} r={6} fill="#1a1a1a" opacity={0.7} />)}
    <g transform={`rotate(${tilt} ${x} ${y})`}>
      <rect x={x - w / 2} y={y - 14} width={w} height={28} rx={4} fill="#a86f3e" {...OUT} />
      <path d={`M${x - w / 2 + 20} ${y - 2} H${x + w / 2 - 20}`} stroke="#8a5530" strokeWidth={3} />
      {[-1, 1].map((d) => <path key={d} d={`M${x + d * (w / 2 - 50)} ${y + 14} v60 l${-d * 40} -60 Z`} fill="#4a4d55" {...OUT} />)}
    </g>
  </g>
);

/** Прихожая: вешалка с куртками, обувница, электрощиток, лист «ГОСТ». */
export const HallDecor = () => (
  <g>
    <rect x={40} y={FLOOR_Y - 190} width={300} height={190} fill="#6b4630" {...OUT} />
    {[0, 1].map((i) => <rect key={i} x={56 + i * 142} y={FLOOR_Y - 172} width={126} height={150} fill="#7a5238" {...OUT} />)}
    {[[90, "#2a2a2e"], [170, "#7a2a2a"], [250, "#2a2a2e"]].map(([x, c], i) => <path key={i} d={`M${x} ${FLOOR_Y - 190} c0 -30 50 -30 50 0 Z`} fill={c as string} {...OUT} />)}
    <rect x={430} y={280} width={120} height={150} fill="#c9c6bd" {...OUT} />
    <rect x={442} y={294} width={96} height={56} fill="#2a2a2e" />
    {[0, 1, 2, 3].map((i) => <rect key={i} x={450 + i * 22} y={302} width={14} height={40} fill="#e8e2d6" />)}
    <rect x={960} y={860} width={54} height={80} rx={8} fill="#efeae0" {...OUT} />
    <rect x={976} y={880} width={22} height={40} rx={4} fill="#d9d2c4" {...OUT} />
    {[90, 200].map((x, i) => (
      <g key={`sn${i}`}>
        <path d={`M${x} ${FLOOR_Y - 216} c0 -26 30 -34 46 -22 l40 14 c14 6 14 22 0 24 l-86 0 Z`} fill="#f1f1f1" {...OUT} />
        <path d={`M${x + 10} ${FLOOR_Y - 206} h70`} stroke="#c0392b" strokeWidth={4} />
      </g>
    ))}
    {/* вешалка с куртками */}
    <rect x={620} y={300} width={300} height={22} rx={6} fill="#5a3a24" {...OUT} />
    {[660, 760, 860].map((x, i) => (
      <g key={x}>
        <circle cx={x} cy={330} r={9} fill="#c9a24a" {...OUT} />
        <path d={`M${x - 50} 340 C${x - 60} 480 ${x - 56} 620 ${x - 46} 700 L${x + 46} 700 C${x + 56} 620 ${x + 60} 480 ${x + 50} 340 Z`} fill={["#3b4d63", "#6a5a3a", "#2e2e33"][i]} {...OUT} />
        <path d={`M${x} 350 V690`} stroke="#000" strokeOpacity={0.3} strokeWidth={4} />
      </g>
    ))}
    <g transform="rotate(-4 200 900)">
      <rect x={110} y={820} width={190} height={250} fill="#ffffff" {...OUT} />
      <text x={205} y={900} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={28} fill="#111">ГОСТ:</text>
      <text x={205} y={950} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={24} fill="#111">ПОЛКА</text>
      <text x={205} y={990} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={24} fill="#c0392b">РОВНАЯ</text>
      <rect x={180} y={810} width={50} height={16} fill="rgba(255,255,240,.7)" />
    </g>
  </g>
);

/** Входная дверь, петля справа; open 0..1 сжимает полотно к петле. handle() — где сейчас ручка. */
export const doorHandle = (x: number, w: number, open: number) => ({ x: x - w / 2 + 34 + (w - 34) * open * 0.86, y: FLOOR_Y - 430 });
export const FrontDoor = ({ x, w = 360, h = 860, open = 0, landing }: { x: number; w?: number; h?: number; open?: number; landing?: React.ReactNode }) => {
  const top = FLOOR_Y - h;
  const hinge = x + w / 2;
  const hd = doorHandle(x, w, open);
  return (
    <g>
      <rect x={x - w / 2 - 22} y={top - 22} width={w + 44} height={h + 22} fill="#3a2a20" {...OUT} />
      <rect x={x - w / 2} y={top} width={w} height={h} fill="#c7cfb2" />
      <rect x={x - w / 2} y={top + h - 120} width={w} height={120} fill="#8a8a7a" />
      {landing}
      <g transform={`translate(${hinge} 0) scale(${1 - open * 0.86} 1) translate(${-hinge} 0)`}>
        <rect x={x - w / 2} y={top} width={w} height={h} fill="#6b3a26" {...OUT} />
        {Array.from({ length: 5 }, (_, i) => <path key={i} d={`M${x - w / 2} ${top + 40 + i * 170} L${x + w / 2} ${top + 200 + i * 170} M${x + w / 2} ${top + 40 + i * 170} L${x - w / 2} ${top + 200 + i * 170}`} stroke="#5a2e1c" strokeWidth={4} />)}
        <circle cx={x} cy={top + 260} r={12} fill="#c9a24a" {...OUT} />
        <path d={`M${x - w / 2 + 20} ${top + 380} q60 40 120 0`} stroke="#c9ccd2" strokeWidth={6} fill="none" strokeDasharray="10 6" />
      </g>
      <rect x={hd.x - 12} y={hd.y - 8} width={44} height={16} rx={8} fill="#c9a24a" {...OUT} />
    </g>
  );
};

/* ── интерфейс ── */
export const Oval = ({ cx, cy, rx, ry, k, color = "#e5262b" }: { cx: number; cy: number; rx: number; ry: number; k: number; color?: string }) => {
  if (k <= 0) return null;
  const len = Math.PI * 2 * Math.max(rx, ry) * 1.15;
  return (
    <g fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" transform={`rotate(-3 ${cx} ${cy})`}>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} strokeDasharray={`${len * k} ${len}`} />
      <ellipse cx={cx + 3} cy={cy - 2} rx={rx * 1.04} ry={ry * 0.95} strokeDasharray={`${len * Math.max(0, k - 0.2)} ${len}`} opacity={0.5} strokeWidth={4} />
    </g>
  );
};

/** Белая карточка Авито от Валеры Перекупа, наклон −2°. */
export const AvitoCard = ({ x, y, k, oval }: { x: number; y: number; k: number; oval: number }) => (
  <g transform={`translate(${x} ${y + (1 - k) * -260}) rotate(-2)`} opacity={k}>
    <rect x={-420} y={-180} width={840} height={420} rx={26} fill="#ffffff" {...OUT} />
    <text x={-396} y={212} fontFamily={MONT} fontWeight={800} fontSize={22} fill="#c0392b">P.S. Верхний свет в коридоре ночью при нём НЕ ВКЛЮЧАТЬ</text>
    <rect x={-396} y={-156} width={210} height={250} rx={16} fill="#5a3a24" />
    <rect x={-372} y={-134} width={162} height={206} fill="#3a2516" />
    <rect x={-290} y={-134} width={80} height={206} fill="#6b4630" stroke={LINE} strokeWidth={2} />
    <text x={-166} y={-118} fontFamily={MONT} fontWeight={900} fontSize={38} fill="#111">Шкаф СССР</text>
    <text x={-166} y={-60} fontFamily={MONT} fontWeight={900} fontSize={46} fill="#111">500 ₽</text>
    <text x={0} y={-60} fontFamily={MONT} fontWeight={700} fontSize={28} fill="#999" textDecoration="line-through">50 000 ₽</text>
    <line x1={-2} y1={-70} x2={150} y2={-70} stroke="#999" strokeWidth={3} />
    <text x={-166} y={-12} fontFamily={MONT} fontWeight={600} fontSize={26} fill="#555">Самовывоз, без торга, внутри</text>
    <text x={-166} y={32} fontFamily={MONT} fontWeight={900} fontSize={32} fill="#111">небольшой нюанс</text>
    <rect x={-396} y={110} width={792} height={48} rx={12} fill="#f1f3f5" />
    <text x={-380} y={143} fontFamily={MONT} fontWeight={700} fontSize={21} fill="#444">🚫 Авито Доставкой не отправлю (в постамат не влезет)</text>
    <rect x={250} y={-160} width={150} height={42} rx={10} fill="#00aaff" />
    <text x={325} y={-131} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={22} fill="#fff">Авито</text>
    <text x={250} y={70} fontFamily={MONT} fontWeight={800} fontSize={22} fill="#00aaff">Валера Перекуп</text>
    <text x={250} y={96} fontFamily={MONT} fontWeight={600} fontSize={18} fill="#999">★ 4.1 · 312 отзывов</text>
    <Oval cx={-24} cy={20} rx={170} ry={40} k={oval} />
  </g>
);

/** Экран чата с продавцом + плашка «чёрный список». */
export const ChatScreen = ({ k1, k2, ban }: { k1: number; k2: number; ban: number }) => (
  <g>
    <rect x={130} y={180} width={820} height={1180} rx={70} fill="#16171b" {...OUT} />
    <rect x={156} y={206} width={768} height={1128} rx={50} fill="#eef1f4" />
    <rect x={156} y={206} width={768} height={150} rx={50} fill="#ffffff" />
    <circle cx={230} cy={290} r={36} fill="#00aaff" />
    <text x={230} y={302} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={30} fill="#fff">ВП</text>
    <text x={284} y={282} fontFamily={MONT} fontWeight={900} fontSize={32} fill="#111">Валера Перекуп</text>
    <text x={284} y={318} fontFamily={MONT} fontWeight={600} fontSize={22} fill="#888">Шкаф СССР • 500 ₽</text>
    <g opacity={k1} transform={`translate(0 ${(1 - k1) * 30})`}>
      <rect x={440} y={410} width={460} height={110} rx={28} fill="#00aaff" />
      <text x={464} y={458} fontFamily={MONT} fontWeight={700} fontSize={27} fill="#fff">Тут демон в шкафу. Верни</text>
      <text x={464} y={496} fontFamily={MONT} fontWeight={700} fontSize={27} fill="#fff">300 ₽, или отзыв въебу</text>
    </g>
    <g opacity={k2} transform={`translate(0 ${(1 - k2) * 30})`}>
      <rect x={180} y={570} width={620} height={290} rx={28} fill="#ffffff" {...OUT} />
      {["Возврата нет. Он тихий,", "хату сторожит. Напоминаю:", "свет в коридоре ночью", "не врубать"].map((l, i) => (
        <text key={i} x={206} y={624 + i * 44} fontFamily={MONT} fontWeight={700} fontSize={28} fill="#111">{l}</text>
      ))}
      <text x={776} y={840} textAnchor="end" fontFamily={MONT} fontSize={20} fill="#999">23:41</text>
      <Oval cx={420} cy={700} rx={210} ry={60} k={k2 > 0.95 ? 1 : 0} />
    </g>
    <g opacity={ban} transform={`translate(0 ${(1 - ban) * 120})`}>
      <rect x={176} y={1180} width={728} height={110} rx={24} fill="#5f6368" />
      <circle cx={232} cy={1235} r={24} fill="none" stroke="#fff" strokeWidth={5} />
      <path d="M215 1252 L249 1218" stroke="#fff" strokeWidth={5} />
      <text x={276} y={1246} fontFamily={MONT} fontWeight={800} fontSize={28} fill="#fff">Продавец добавил вас в чёрный список</text>
    </g>
  </g>
);

/** Карточка отзыва 4 из 5 «Шкаф с изюминкой». */
export const ReviewCard = ({ k, stars }: { k: number; stars: number }) => (
  <g transform={`translate(540 ${760 + (1 - k) * 80}) rotate(-2)`} opacity={k}>
    <rect x={-420} y={-260} width={840} height={560} rx={30} fill="#ffffff" {...OUT} />
    <text x={-370} y={-180} fontFamily={MONT} fontWeight={900} fontSize={48} fill="#111">Шкаф с изюминкой</text>
    <text x={-370} y={-130} fontFamily={MONT} fontWeight={600} fontSize={26} fill="#888">Отзыв о Валере Перекупе • Дмитрий</text>
    {[0, 1, 2, 3, 4].map((i) => {
      const on = i < 4 && stars > i;
      return <path key={i} transform={`translate(${-330 + i * 100} -40) scale(${on ? 1 : 0.9})`} d="M0 -38 L11 -12 L38 -10 L17 8 L24 36 L0 21 L-24 36 L-17 8 L-38 -10 L-11 -12 Z" fill={on ? "#ffb400" : "#d9d9d9"} {...OUT} />;
    })}
    <text x={150} y={-28} fontFamily={MONT} fontWeight={900} fontSize={44} fill="#111">4 из 5</text>
    {["Шкаф скрипит, но нюанс рукастый —", "полку повесил, посуду помыл,", "вора отпугнул. Рекомендую"].map((l, i) => (
      <text key={i} x={-380} y={60 + i * 52} fontFamily={MONT} fontWeight={800} fontSize={40} fill="#222">{l}</text>
    ))}
  </g>
);

/** Пуш от Валеры Перекупа. */
export const Push = ({ k, lines = ["Брат, есть бабушкин диван с сюрпризом.", "Тебе как постояннику за косарь"] }: { k: number; lines?: string[] }) => (
  <g transform={`translate(540 ${300 - (1 - k) * 360})`} opacity={k}>
    <rect x={-480} y={-110} width={960} height={220} rx={36} fill="rgba(250,250,252,.97)" {...OUT} />
    <circle cx={-410} cy={-52} r={34} fill="#00aaff" />
    <text x={-410} y={-41} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={26} fill="#fff">ВП</text>
    <text x={-358} y={-60} fontFamily={MONT} fontWeight={900} fontSize={30} fill="#111">Валера Перекуп · Авито</text>
    <text x={-358} y={-26} fontFamily={MONT} fontWeight={600} fontSize={22} fill="#888">сейчас</text>
    {lines.map((l, i) => <text key={i} x={-440} y={28 + i * 44} fontFamily={MONT} fontWeight={800} fontSize={30} fill="#111">{l}</text>)}
  </g>
);

/** Облачко-реплика. */
export const Cloud = ({ x, y, text, k }: { x: number; y: number; text: string; k: number }) => (
  <g transform={`translate(${x} ${y}) scale(${0.4 + 0.6 * k})`} opacity={k}>
    <path d="M-200 30 C-240 -20 -190 -80 -130 -66 C-110 -120 -20 -124 10 -80 C50 -120 150 -110 160 -50 C230 -50 240 30 180 50 C190 100 110 120 70 90 C30 130 -60 120 -80 86 C-140 110 -220 90 -200 30 Z" fill="#fff" {...OUT} />
    <path d="M-60 100 l-30 60 l60 -40 Z" fill="#fff" {...OUT} />
    <text x={0} y={18} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={46} fill="#c0392b">{text}</text>
  </g>
);


/** Кухонная мойка со столешницей, фартуком из плитки и стопкой тарелок. */
export const Sink = ({ x }: { x: number }) => (
  <g>
    {Array.from({ length: 6 }, (_, r) => Array.from({ length: 9 }, (_, c) => <rect key={`${r}-${c}`} x={c * 124 - 20} y={700 + r * 70} width={120} height={66} fill={(r + c) % 2 ? "#d9d4c6" : "#cfc9b8"} stroke="#b7b09d" strokeWidth={2} />))}
    <rect x={0} y={1120} width={1080} height={40} fill="#8a6a46" {...OUT} />
    <rect x={0} y={1160} width={1080} height={220} fill="#6b4a30" {...OUT} />
    {[0, 1, 2, 3].map((i) => <rect key={i} x={20 + i * 270} y={1180} width={250} height={180} fill="#7a5638" {...OUT} />)}
    <rect x={x - 170} y={1100} width={340} height={40} rx={10} fill="#b9bec7" {...OUT} />
    <path d={`M${x + 120} 1100 v-120 q0 -30 -40 -30 h-30`} stroke="#9aa0a8" strokeWidth={14} fill="none" strokeLinecap="round" />
    {[0, 1, 2, 3].map((i) => <ellipse key={i} cx={x - 250} cy={1110 - i * 14} rx={60} ry={12} fill="#f4f1ea" {...OUT} />)}
    {[0, 1, 2].map((i) => <circle key={`b${i}`} cx={x - 60 + i * 50} cy={1094 - (i % 2) * 10} r={14 - i * 3} fill="#ffffff" opacity={0.85} {...OUT} strokeWidth={1.5} />)}
  </g>
);

/** Квитанция ЖКХ в руке: половина — на Нюанса. */
export const Receipt = () => (
  <g transform="translate(-10 -150) rotate(-4)">
    <rect x={-110} y={-140} width={220} height={290} fill="#fbfaf6" {...OUT} />
    <text x={0} y={-100} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={22} fill="#111">КВИТАНЦИЯ ЖКХ</text>
    {["Свет ........ 2 140 ₽", "Вода ........ 1 980 ₽", "Отопл. ..... 750 ₽"].map((l, i) => <text key={i} x={-94} y={-56 + i * 32} fontFamily={MONT} fontWeight={700} fontSize={17} fill="#444">{l}</text>)}
    <text x={0} y={62} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={26} fill="#111">ИТОГО 4 870 ₽</text>
    <text x={0} y={112} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={24} fill="#c0392b">½ — НЮАНС</text>
    <Oval cx={0} cy={104} rx={92} ry={28} k={1} />
  </g>
);
