import React from "react";
import { AbsoluteFill } from "remotion";
import { DurCtx, ez, MONT, useLT, useSpr } from "../pelmeni/kit";
import { AMBER, AvitoCard, ChatScreen, Cloud, doorHandle, Drill, FLOOR_Y, FrontDoor, HallDecor, Level, Mug, Nightstand, NightWindow, PhoneItem, Push, ReviewCard, Room, Rug, Shelf, Wardrobe } from "./props";
import { Dima, dimaReach, HAIR, LINE, Nuance, nuanceReach, OUT, RIM, SOCK, Thief, ThiefDown } from "./rig";

/** Кадр: плавный наезд 1.0 → 1.07 за время плана. */
const Shot = ({ from = 0, to, origin = [540, 960], bg = "#101216", children }: { from?: number; to: number; origin?: [number, number]; bg?: string; children: React.ReactNode }) => {
  const t = useLT();
  const s = ez(t, from, to, 1, 1.07);
  return (
    <AbsoluteFill style={{ background: bg }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        <g transform={`translate(${origin[0]} ${origin[1]}) scale(${s}) translate(${-origin[0]} ${-origin[1]})`}>{children}</g>
      </svg>
    </AbsoluteFill>
  );
};

const Backlight = ({ x, y, r, o = 0.5, color = AMBER }: { x: number; y: number; r: number; o?: number; color?: string }) => {
  const id = `bl${Math.round(x)}${Math.round(y)}${color.slice(1)}`;
  return (
    <>
      <defs>
        <radialGradient id={id}>
          <stop offset="0%" stopColor={color} stopOpacity={o} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={x} cy={y} r={r} fill={`url(#${id})`} />
    </>
  );
};

/** Знак «?» над головой — выпрыгивает пружиной. */
const Question = ({ x, y, k, size = 140 }: { x: number; y: number; k: number; size?: number }) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={size} fill="#fff" stroke={LINE} strokeWidth={10} paintOrder="stroke" opacity={Math.min(1, k * 2)} transform={`translate(${x} ${y}) scale(${k}) translate(${-x} ${-y})`}>
    ?
  </text>
);

/* ── 1. Хук: монстр вылезает из шкафа, Дима дует на чай и листает Авито ── */
export const S1Hook = ({ ovalAt }: { ovalAt: number }) => {
  const t = useLT();
  const dur = React.useContext(DurCtx);
  const card = useSpr(1.0, 16, 110);
  const out = ez(t, 0, 1.6, 0, 1);
  return (
    <Shot to={dur} origin={[540, 1100]}>
      <Room glow={{ x: 800, w: 320 }} />
      <NightWindow x={200} t={t} />
      <Rug x={540} w={760} />
      <Nightstand x={470} />
      <Backlight x={800} y={900} r={600} o={0.45} />
      <Wardrobe x={690} w={400} />
      <Nuance x={820 - out * 20} y={FLOOR_Y} s={0.9} t={t} pose={{ armL: nuanceReach(-1, 680, 1030, 800, FLOOR_Y, 0.9, 0, 1), armR: nuanceReach(1, 950, 1030, 800, FLOOR_Y, 0.9, 0, -1), head: 6, mouth: 0.3 }} />
      <Dima x={250} y={FLOOR_Y} s={0.92} t={t} pose={{ armR: dimaReach(1, 262, 846, 250, FLOOR_Y, 0.92, -1), itemR: <Mug t={t} steam />, armL: dimaReach(-1, 214, 1006, 250, FLOOR_Y, 0.92, 1), itemL: <PhoneItem t={t} mode="avito" s={0.9} />, head: 8, look: -0.2, yawn: ez(t, 6.8, 7.3) * (1 - ez(t, 8.2, 8.7)) }} />
      <AvitoCard x={540} y={1530} k={card} oval={ez(t, ovalAt, ovalAt + 0.8)} />
    </Shot>
  );
};

/* ── 2. Замах на камеру → Дима зажимает голосовое → «?» и лапы за спину ── */
export const S2Voice = ({ cut1, cut2 }: { cut1: number; cut2: number }) => {
  const t = useLT();
  const dur = React.useContext(DurCtx);
  const q = useSpr(cut1 + 0.3, 9, 160);
  if (t < cut1) {
    const lunge = ez(t, 0, cut1, 0, 1);
    // когти на камеру: кисти перед грудью, пальцы веером вверх-наружу
    const claw = (side: -1 | 1, tx: number, ty: number) => {
      const p = nuanceReach(side, tx, ty, 540, 2785, 1.9, 0, side === -1 ? 1 : -1);
      return { ...p, wr: 180 + side * 25 - (p.sh + p.el) };
    };
    return (
      <Shot to={cut1} origin={[540, 900]} bg="#0c0d10">
        <Room glow={{ x: 540, w: 400 }} />
        <Wardrobe x={900} w={400} />
        <rect width={1080} height={1920} fill="#05060a" opacity={0.55} />
        <Backlight x={540} y={700} r={760} o={0.5} />
        <Nuance x={540} y={2785} s={1.9} t={t} pose={{ armL: claw(-1, 300 + lunge * 20, 1330 - lunge * 40), armR: claw(1, 780 - lunge * 20, 1330 - lunge * 40), hand: 1.6 + lunge * 0.4, head: -4, mouth: 1 }} />
      </Shot>
    );
  }
  if (t < cut2)
    return (
      <Shot from={cut1} to={cut2} origin={[540, 900]} bg="#0c0d10">
        <Room glow={{ x: 820, w: 300 }} />
        <Backlight x={820} y={800} r={620} o={0.4} />
        <Nuance x={820} y={1950} s={1.15} t={t} pose={{ armL: nuanceReach(-1, 800, 1076, 820, 1950, 1.15, 0, -1), armR: nuanceReach(1, 840, 1076, 820, 1950, 1.15, 0, 1), gripL: 1, gripR: 1, behind: true, guilty: q, head: 6 }} />
        <Question x={820} y={470} k={q} />
        <Dima x={290} y={1800} s={1.45} t={t} pose={{ armR: dimaReach(1, 610, 990, 290, 1800, 1.45, 1), itemR: <PhoneItem t={t} mode="wave" s={1.05} />, armL: dimaReach(-1, 236, 1170, 290, 1800, 1.45, 1), itemL: <Mug t={t} flip />, head: 4 }} />
      </Shot>
    );
  return (
    <Shot from={cut2} to={dur} origin={[540, 700]} bg="#0c0d10">
        <Room glow={{ x: 540, w: 400 }} />
        <Wardrobe x={900} w={400} />
        <rect width={1080} height={1920} fill="#05060a" opacity={0.55} />
      <Backlight x={540} y={760} r={760} o={0.4} />
      <Nuance x={540} y={2785} s={1.9} t={t} pose={{ armL: nuanceReach(-1, 520, 1341, 540, 2785, 1.9, 0, -1), armR: nuanceReach(1, 560, 1341, 540, 2785, 1.9, 0, 1), gripL: 1, gripR: 1, behind: true, head: 8, guilty: 1, mouth: t < dur - 0.4 ? 0.8 : 0 }} />
      <Question x={540} y={400} k={1} size={170} />
    </Shot>
  );
};

/* ── 3. Чат: ответ Валеры и чёрный список → вручение перфоратора на уровне пояса ── */
export const S3Recruit = ({ chatEnd, handAt }: { chatEnd: number; handAt: number }) => {
  const t = useLT();
  const dur = React.useContext(DurCtx);
  if (t < chatEnd)
    return (
      <Shot to={chatEnd} bg="#0e1014">
        <ChatScreen k1={ez(t, 0.2, 0.6)} k2={ez(t, 1.0, 1.5)} ban={ez(t, 3.0, 3.5)} />
      </Shot>
    );
  const given = t >= handAt;
  const reach = ez(t, chatEnd, handAt, 0, 1);
  return (
    <Shot from={chatEnd} to={dur} origin={[540, 1100]}>
      <Room glow={{ x: 800, w: 360 }} />
      <NightWindow x={130} t={t} />
      <Backlight x={800} y={820} r={560} o={0.35} />
      <Nuance
        x={800}
        y={FLOOR_Y}
        s={0.95}
        t={t}
        pose={{
          armL: given ? nuanceReach(-1, 640, 960, 800, FLOOR_Y, 0.95, 0, 1) : nuanceReach(-1, 780 - reach * 30, 1010, 800, FLOOR_Y, 0.95, 0, 1),
          armR: nuanceReach(1, 985, 960, 800, FLOOR_Y, 0.95, 0, -1),
          head: 10,
          gripL: given ? 1 : 0,
          itemL: given ? <Drill t={t} flip /> : undefined,
          gripR: given ? 1 : 0,
          itemR: given ? <Level w={150} /> : undefined,
        }}
      />
      <Dima
        x={260}
        y={FLOOR_Y}
        s={0.95}
        t={t}
        pose={{
          armL: { sh: 6, el: 0 },
          armR: given ? { sh: -8, el: 0 } : dimaReach(1, 360 + reach * 70, 1060, 260, FLOOR_Y, 0.95, 1),
          itemR: given ? undefined : <Drill t={t} />,
          itemL: given ? undefined : <Level w={200} />,
        }}
      />
    </Shot>
  );
};

/* ── 4. Прихожая: Нюанс в строительных очках с уровнем у полки, Дима у косяка тычет пальцем ── */
export const S4Shelf = ({ drillOn, drillOff, fixAt }: { drillOn: number; drillOff: number; fixAt: number }) => {
  const t = useLT();
  const dur = React.useContext(DurCtx);
  const tilt = ez(t, fixAt, fixAt + 0.8, 4, 0);
  const NX = 520;
  const S = 0.95;
  const crouch = 0.62;
  const lx = 330;
  const ly = 600;
  const on = t > drillOn && t < drillOff;
  return (
    <Shot to={dur} origin={[540, 900]}>
      <Room wall="#3a4136" pattern="#434b3e" floor="#3b2a20" ceiling={258} />
      <HallDecor />
      {/* входная дверь справа с глазком и цепочкой */}
      <rect x={808} y={FLOOR_Y - 882} width={344} height={882} fill="#3a2a20" {...OUT} />
      <rect x={830} y={FLOOR_Y - 860} width={300} height={860} fill="#6b3a26" {...OUT} />
      <circle cx={980} cy={FLOOR_Y - 600} r={10} fill="#c9a24a" {...OUT} />
      <path d="M850 750 q50 40 100 0" stroke="#c9ccd2" strokeWidth={6} fill="none" strokeDasharray="10 6" />
      <Backlight x={300} y={600} r={460} o={0.25} />
      <Shelf x={lx} y={ly + 32} w={400} tilt={tilt} />
      <Nuance
        x={NX}
        y={FLOOR_Y}
        s={S}
        t={t}
        pose={{
          crouch,
          head: 14,
          goggles: true,
          armL: nuanceReach(-1, lx, ly - 48, NX, FLOOR_Y, S, crouch, 1),
          armR: nuanceReach(1, 230, 700, NX, FLOOR_Y, S, crouch, 1),
          gripL: 1,
          itemL: (
            <g transform={`rotate(${tilt})`}>
              <Level w={300} tilt={tilt / 4} />
            </g>
          ),
          gripR: 1,
          itemR: <Drill t={t} on={on} flip />,
          mouth: 0.6,
        }}
      />
      <Dima x={760} y={FLOOR_Y} s={0.82} t={t} pose={{ lean: 3, armL: dimaReach(-1, 712, 770, 760, FLOOR_Y, 0.82, -1), pointL: true, armR: dimaReach(1, 790, 1000, 760, FLOOR_Y, 0.82, -1), itemR: <Mug t={t} steam />, head: -4 }} />
      {on && <text x={70 + Math.sin(t * 70) * 5} y={470 + Math.cos(t * 60) * 4} fontFamily={MONT} fontWeight={900} fontSize={72} fill="#fff" stroke={LINE} strokeWidth={8} paintOrder="stroke" transform="rotate(-8 70 470)">ВЖЖЖ!</text>}
    </Shot>
  );
};

/* ── 5. 03:15: скважина → Дима лицом в подушку стучит пяткой → Нюанс открывает вору ── */
export const S5Guard = ({ keyEnd, bedEnd, openAt, dropAt, cloudAt, fallAt, talkAt, talkEnd }: { keyEnd: number; bedEnd: number; openAt: number; dropAt: number; cloudAt: number; fallAt: number; talkAt: number; talkEnd: number }) => {
  const t = useLT();
  const dur = React.useContext(DurCtx);
  if (t < keyEnd) {
    const j = Math.sin(t * 40) * 6;
    return (
      <Shot to={keyEnd} bg="#120d0a">
        <rect width={1080} height={1920} fill="#5a3322" />
        {Array.from({ length: 9 }, (_, i) => <line key={i} x1={0} y1={i * 220 + 60} x2={1080} y2={i * 220 + 200} stroke="#4a2a1b" strokeWidth={8} />)}
        <rect x={340} y={420} width={400} height={860} rx={40} fill="#9a9a94" {...OUT} />
        <circle cx={540} cy={720} r={70} fill="#2a2a2c" {...OUT} />
        <path d="M520 740 L560 740 L574 920 L506 920 Z" fill="#0b0b0d" />
        <circle cx={540} cy={720} r={40} fill="#0b0b0d" />
        <g transform={`translate(${j * 0.6} 0) rotate(${-24 + Math.sin(t * 14) * 4} 548 840)`}>
          <rect x={540} y={830} width={420} height={14} rx={6} fill="#c9ccd2" {...OUT} />
          <path d="M540 830 l-14 -18 l10 -2 Z" fill="#c9ccd2" {...OUT} />
        </g>
        <path d="M520 900 L520 1100 L760 1240" stroke={LINE} strokeWidth={16} fill="none" strokeLinecap="round" />
        <path d="M520 900 L520 1100 L760 1240" stroke="#8a8d94" strokeWidth={10} fill="none" strokeLinecap="round" />
        <text x={540 + j} y={330} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={120} fill="#fff" stroke={LINE} strokeWidth={10} paintOrder="stroke" transform="rotate(-6 540 330)">СКРЕЖЕТ</text>
      </Shot>
    );
  }
  if (t < bedEnd) {
    const kick = Math.max(0, Math.sin((t - keyEnd) * 6));
    return (
      <Shot from={keyEnd} to={bedEnd} origin={[540, 1100]} bg="#0b0e16">
        <Room wall="#1c2333" pattern="#222a3d" floor="#241c18" />
        <NightWindow x={260} t={t} />
        <Nightstand x={120} />
        {/* боковая стенка шкафа: пятка упирается в неё, но не проходит насквозь */}
        <rect x={900} y={300} width={200} height={1080} fill="#5a3a24" {...OUT} />
        <rect x={60 + 160} y={1120} width={680} height={150} rx={20} fill="#4b3a5a" {...OUT} />
        <rect x={220} y={1270} width={680} height={110} fill="#3a2a20" {...OUT} />
        <ellipse cx={340} cy={1080} rx={120} ry={56} fill="#e8e4f0" {...OUT} />
        {/* затылок: лицом в подушку */}
        <ellipse cx={330} cy={1050} rx={70} ry={58} fill={HAIR} {...OUT} />
        {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M${290 + i * 14} 1000 q6 -18 14 -8`} stroke={HAIR} strokeWidth={8} fill="none" strokeLinecap="round" />)}
        <path d="M380 1000 C480 930 760 940 840 1010 L860 1130 L360 1130 Z" fill="#6a5a8a" {...OUT} />
        <path d="M480 1000 C560 1030 660 1030 760 1000" stroke="#4b3a6a" strokeWidth={6} fill="none" />
        {/* пятка в носке: поворот вокруг лодыжки, максимум — касание стенки x=900 */}
        <g transform={`rotate(${-kick * 12} 850 1050)`}>
          <path d="M840 1012 C872 1004 896 1030 896 1060 C892 1082 852 1086 836 1072 Z" fill={SOCK} {...OUT} />
        </g>
        {kick > 0.9 && <text x={760} y={900} fontFamily={MONT} fontWeight={900} fontSize={64} fill="#fff" stroke={LINE} strokeWidth={8} paintOrder="stroke">ТУК</text>}
        <text x={300} y={900} fontFamily={MONT} fontWeight={900} fontSize={60} fill="#8fb0ff" opacity={0.7}>Z z z</text>
      </Shot>
    );
  }
  const open = ez(t, openAt, openAt + 0.7);
  const down = t >= fallAt;
  const dropped = ez(t, dropAt, dropAt + 0.35);
  const DX = 420;
  const hd = doorHandle(DX, 360, open);
  const NX = 740;
  const talk = t > talkAt && t < talkEnd ? 0.8 : 0;
  const landing = (
    <g>
      {!down && <Thief x={DX - 30} y={FLOOR_Y} s={0.88} t={t} dizzy={ez(t, cloudAt, cloudAt + 0.3)} />}
      {/* выроненная отмычка падает на пол площадки */}
      <rect x={DX - 120} y={FLOOR_Y - 400 + dropped * 392} width={80} height={8} rx={4} fill="#c9ccd2" {...OUT} transform={`rotate(${dropped * 70} ${DX - 80} ${FLOOR_Y - 396 + dropped * 392})`} opacity={t > dropAt - 0.1 ? 1 : 0} />
    </g>
  );
  return (
    <Shot from={bedEnd} to={dur} origin={[540, 1000]} bg="#0f1114">
      <Room wall="#2f3530" pattern="#363d37" floor="#2c2420" />
      <FrontDoor x={DX} open={open} landing={landing} />
      <Backlight x={DX} y={900} r={460} o={0.28 * open} color="#fff2c4" />
      <Nuance x={NX} y={FLOOR_Y} s={0.95} t={t} pose={{ armL: t > openAt - 0.4 ? nuanceReach(-1, hd.x, hd.y - 50, NX, FLOOR_Y, 0.95, 0, 1) : nuanceReach(-1, 620, 1020, NX, FLOOR_Y, 0.95, 0, 1), gripL: t > openAt - 0.4 ? 1 : 0, armR: nuanceReach(1, 880, 1020, NX, FLOOR_Y, 0.95, 0, -1), head: -10, mouth: talk }} />
      {down && <ThiefDown x={380} y={1580} s={0.9} t={t} />}
      {down && <rect x={560} y={1566} width={80} height={8} rx={4} fill="#c9ccd2" {...OUT} transform="rotate(12 600 1570)" />}
      {t > cloudAt && <Cloud x={down ? 300 : DX - 30} y={down ? 1300 : 300} text="ДА НУ НАХУЙ" k={ez(t, cloudAt, cloudAt + 0.25)} />}
    </Shot>
  );
};

/* ── 6. Утро: отзыв «Шкаф с изюминкой», пуш Валеры, плашка ── */
export const S6Review = ({ pushAt, plateAt }: { pushAt: number; plateAt: number }) => {
  const t = useLT();
  const dur = React.useContext(DurCtx);
  const card = useSpr(0.2, 16, 100);
  const push = useSpr(pushAt, 13, 120);
  const plate = useSpr(plateAt, 12, 110);
  return (
    <Shot to={dur} bg="#f1e9dc">
      <Room wall="#d9cdb6" pattern="#cdbfa5" floor="#a07a52" />
      <rect x={60} y={300} width={300} height={430} fill="#bfe3ff" {...OUT} />
      <path d="M60 515 H360 M210 300 V730" stroke="#efe8da" strokeWidth={12} />
      <Wardrobe x={820} w={380} open={0.3} />
      <rect width={1080} height={1920} fill="#fff8e8" opacity={0.25} />
      <Backlight x={210} y={500} r={900} o={0.5} color="#fff6d8" />
      <ReviewCard k={card} stars={ez(t, 0.6, 1.6, 0, 4)} />
      <Push k={push} />
      <g opacity={plate} transform={`translate(540 ${1500 + (1 - plate) * 80})`}>
        <rect x={-490} y={-130} width={980} height={260} rx={30} fill="#111" stroke={RIM} strokeWidth={6} />
        <text x={0} y={-22} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={56} fill="#fff">ЖДЁШЬ СЕРИЮ ПРО ДИВАН?</text>
        <text x={0} y={62} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={56} fill="#F5A623">СТАВЬ + В КОММЕНТАХ</text>
      </g>
    </Shot>
  );
};
