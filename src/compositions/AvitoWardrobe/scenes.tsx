import React from "react";
import { AbsoluteFill } from "remotion";
import { DurCtx, ez, MONT, useLT, useSpr } from "../../pelmeni/kit";
import { AMBER, AvitoCard, ChatScreen, Cloud, Receipt, ReviewCard, Sink, doorHandle, Drill, FLOOR_Y, FrontDoor, HallDecor, Level, Mug, Nightstand, NightWindow, PhoneItem, Push, Room, Rug, Shelf, Wardrobe } from "./props";
import { Dima, DimaHead, dimaReach, LINE, Nuance, nuanceReach, OUT, RIM, SOCK, Thief, ThiefDown } from "./rig";

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

/* Дима крупно: по колено, ~65% высоты кадра. Начало координат — стопы за нижним краем кадра. */
const DY = 2100;
const DS = 1.9;

/* ── 1. Хук: Нюанс выходит из правой половины шкафа, Дима крупно с кружкой и телефоном ── */
export const S1Hook = ({ ovalAt, yawnAt }: { ovalAt: number; yawnAt: number }) => {
  const t = useLT();
  const dur = React.useContext(DurCtx);
  const card = useSpr(1.0, 16, 110);
  const out = ez(t, 0, 1.6, 0, 1);
  const stare = ez(t, 1.5, 1.8) * (1 - ez(t, 2.8, 3.1)); // Дима смотрит на монстра
  const hide = ez(t, 1.8, 2.1) * (1 - ez(t, 3.0, 3.6)); // монстр пятится обратно
  return (
    <Shot to={dur} origin={[540, 1000]}>
      <Room glow={{ x: 860, w: 300 }} />
      <NightWindow x={170} t={t} />
      <Rug x={600} w={760} />
      <Nightstand x={470} />
      <Backlight x={860} y={900} r={560} o={0.45} />
      <Wardrobe x={760} w={400} />
      <Nuance x={880 - out * 20 + hide * 90} y={FLOOR_Y} s={0.9} t={t} pose={{ armL: nuanceReach(-1, 760 + hide * 90, 1040, 860 + hide * 90, FLOOR_Y, 0.9), armR: nuanceReach(1, 1000 + hide * 90, 1040, 860 + hide * 90, FLOOR_Y, 0.9), head: 6 + hide * 14, guilty: hide, mouth: 0.3 * (1 - hide), crouch: hide * 0.25 }} />
      <Dima x={300} y={DY} s={DS} t={t} pose={{ armR: dimaReach(1, 480, 1270, 300, DY, DS), itemR: <Mug t={t} steam />, armL: dimaReach(-1, 130, 1300, 300, DY, DS), itemL: <PhoneItem t={t} mode="avito" />, head: 4, look: -0.1 + stare * 0.8, lid: 0.55 + stare * 0.15, yawn: ez(t, yawnAt, yawnAt + 0.4) * (1 - ez(t, yawnAt + 1.2, yawnAt + 1.6)) }} />
      <g transform="translate(430 330) scale(0.78) translate(-540 -330)">
        <AvitoCard x={540} y={330} k={card} oval={ez(t, ovalAt, ovalAt + 0.8)} />
      </g>
    </Shot>
  );
};

/* ── 2. Замах на камеру → Дима записывает голосовое → «?», руки вдоль тела ── */
export const S2Voice = ({ cut1, cut2, qAt }: { cut1: number; cut2: number; qAt: number }) => {
  const t = useLT();
  const dur = React.useContext(DurCtx);
  const q = useSpr(qAt, 9, 160);
  const hideK = t >= qAt + 0.2;
  const bg = (
    <>
      <Room glow={{ x: 540, w: 400 }} />
      <Wardrobe x={900} w={400} />
      <rect width={1080} height={1920} fill="#05060a" opacity={0.55} />
    </>
  );
  if (t < cut1) {
    const lunge = ez(t, 0, cut1, 0, 1);
    // когти на камеру: кисти перед грудью, пальцы веером вверх-наружу
    const claw = (side: -1 | 1, tx: number, ty: number) => {
      const p = nuanceReach(side, tx, ty, 540, 2300, 1.3);
      return { ...p, wr: 180 + side * 25 - (p.sh + p.el) };
    };
    return (
      <Shot to={cut1} origin={[540, 900]} bg="#0c0d10">
        {bg}
        <Backlight x={540} y={700} r={760} o={0.5} />
        <Nuance x={540} y={2300} s={1.3 + lunge * 0.08} t={t} pose={{ armL: claw(-1, 140 + lunge * 20, 1480 - lunge * 60), armR: claw(1, 940 - lunge * 20, 1480 - lunge * 60), hand: 2.0 + lunge * 0.4, head: -4, mouth: 1 }} />
      </Shot>
    );
  }
  const down = { armL: { sh: 4, el: 2 }, armR: { sh: -4, el: -2 } };
  if (t < cut2)
    return (
      <Shot from={cut1} to={cut2} origin={[540, 1000]} bg="#0c0d10">
        <Room glow={{ x: 880, w: 300 }} />
        <Wardrobe x={1000} w={400} />
        <Backlight x={880} y={800} r={600} o={0.4} />
        <Nuance x={880} y={DY} s={1.25} t={t} pose={hideK ? { armL: nuanceReach(-1, 860, 1150, 880, DY, 1.25), armR: nuanceReach(1, 900, 1150, 880, DY, 1.25), gripL: 1, gripR: 1, behind: true, guilty: q, head: 6 } : { ...down, guilty: q, head: 6 }} />
        <Question x={880} y={480} k={q} />
        <Dima x={330} y={DY} s={DS} t={t} pose={{ armR: dimaReach(1, 640, 1120, 330, DY, DS), itemR: <PhoneItem t={t} mode="voice" s={1.3} />, armL: dimaReach(-1, 230, 1340, 330, DY, DS), itemL: <Mug t={t} flip />, head: 3 }} />
      </Shot>
    );
  return (
    <Shot from={cut2} to={dur} origin={[540, 700]} bg="#0c0d10">
      {bg}
      <Backlight x={540} y={760} r={760} o={0.4} />
      <Nuance x={540} y={2785} s={1.9} t={t} pose={{ armL: nuanceReach(-1, 520, 1341, 540, 2785, 1.9), armR: nuanceReach(1, 560, 1341, 540, 2785, 1.9), gripL: 1, gripR: 1, behind: true, head: 8, guilty: 1 }} />
      <Question x={540} y={400} k={1} size={170} />
    </Shot>
  );
};

/* ── 3. Чат → передача перфоратора и уровня: руки плавно тянутся навстречу (15 кадров), предмет переходит из кисти в кисть ── */
const lerp = (a: [number, number], b: [number, number], k: number): [number, number] => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
const handoff = (t: number, at: number) => {
  const go = ez(t, at - 0.5, at); // 15 кадров навстречу
  const back = ez(t, at + 0.15, at + 0.65); // и обратно
  return { go, back, done: t >= at + 0.15 };
};
export const S3Recruit = ({ chatEnd, handAt }: { chatEnd: number; handAt: number }) => {
  const t = useLT();
  const dur = React.useContext(DurCtx);
  if (t < chatEnd)
    return (
      <Shot to={chatEnd} bg="#0e1014">
        <ChatScreen k1={ez(t, 0.0, 0.3)} k2={ez(t, 0.5, 0.9)} ban={ez(t, 1.6, 1.9)} />
      </Shot>
    );
  const NX = 850;
  const NS = 1.25;
  const DXp = 290;
  const h1 = handoff(t, handAt);
  const h2 = handoff(t, handAt + 1.1);
  // перфоратор: правая кисть Димы ↔ левая лапа Нюанса
  const m1: [number, number] = [560, 1320];
  const dR = lerp(lerp([460, 1480], m1, h1.go), [470, 1520], h1.done ? h1.back : 0);
  const nL = lerp(lerp([700, 1500], [m1[0] + 64, m1[1] - 6], h1.go), [740, 840], h1.done ? h1.back : 0);
  // уровень: левая кисть Димы ↔ правая лапа Нюанса
  const m2: [number, number] = [400, 1180];
  const dL = lerp(lerp([110, 1460], m2, h2.go), [110, 1460], h2.done ? h2.back : 0);
  const nR = lerp(lerp([1000, 1500], [m2[0] + 70, m2[1] - 6], h2.go), [1010, 1400], h2.done ? h2.back : 0);
  const drill = (
    <g transform="rotate(-15) scale(0.6)">
      <Drill t={t} />
    </g>
  );
  const level = (
    <g transform="rotate(90)">
      <Level w={190} />
    </g>
  );
  return (
    <Shot from={chatEnd} to={dur} origin={[540, 1000]}>
      <Room glow={{ x: 860, w: 360 }} />
      <NightWindow x={140} t={t} />
      <Wardrobe x={930} w={380} />
      <Backlight x={860} y={820} r={560} o={0.35} />
      <Nuance x={NX} y={DY} s={NS} t={t} pose={{ armL: nuanceReach(-1, nL[0], nL[1], NX, DY, NS), armR: nuanceReach(1, nR[0], nR[1], NX, DY, NS), head: 10, gripL: h1.done ? 1 : 0, itemL: h1.done ? drill : undefined, gripR: h2.done ? 1 : 0, itemR: h2.done ? level : undefined }} />
      <Dima x={DXp} y={DY} s={DS} t={t} pose={{ armR: dimaReach(1, dR[0], dR[1], DXp, DY, DS), itemR: h1.done ? undefined : drill, armL: dimaReach(-1, dL[0], dL[1], DXp, DY, DS), itemL: h2.done ? undefined : level }} />
    </Shot>
  );
};

/* ── 4. Прихожая: Нюанс в очках — перфоратор у полки слева, уровень справа; Дима крупно у косяка тычет пальцем вверх ── */
export const S4Shelf = ({ drillOn, drillOff, fixAt }: { drillOn: number; drillOff: number; fixAt: number }) => {
  const t = useLT();
  const dur = React.useContext(DurCtx);
  const tilt = ez(t, fixAt, fixAt + 0.8, 4, 0);
  const NX = 470;
  const S = 0.95;
  const crouch = 0.62;
  const on = t > drillOn && t < drillOff;
  return (
    <Shot to={dur} origin={[540, 900]}>
      <Room wall="#3a4136" pattern="#434b3e" floor="#3b2a20" ceiling={258} />
      <HallDecor />
      <rect x={808} y={FLOOR_Y - 882} width={344} height={882} fill="#3a2a20" {...OUT} />
      <rect x={830} y={FLOOR_Y - 860} width={300} height={860} fill="#6b3a26" {...OUT} />
      <circle cx={980} cy={FLOOR_Y - 600} r={10} fill="#c9a24a" {...OUT} />
      <path d="M850 750 q50 40 100 0" stroke="#c9ccd2" strokeWidth={6} fill="none" strokeDasharray="10 6" />
      <Backlight x={430} y={600} r={460} o={0.25} />
      <Shelf x={430} y={632} w={420} tilt={tilt} />
      <Nuance
        x={NX}
        y={FLOOR_Y}
        s={S}
        t={t}
        pose={{
          crouch,
          head: 10,
          goggles: true,
          armL: nuanceReach(-1, 290, 590, NX, FLOOR_Y, S, crouch),
          gripL: 1,
          itemL: <Drill t={t} on={on} flip />,
          armR: nuanceReach(1, 560, 553, NX, FLOOR_Y, S, crouch),
          gripR: 1,
          itemR: (
            <g transform={`rotate(${tilt})`}>
              <Level w={260} tilt={tilt / 4} />
            </g>
          ),
        }}
      />
      <Dima x={860} y={DY} s={1.7} t={t} pose={{ lean: 3, armL: dimaReach(-1, 640, 880, 860, DY, 1.7), pointL: true, armR: dimaReach(1, 930, 1350, 860, DY, 1.7), itemR: <Mug t={t} steam />, head: -4 }} />
      {on && <text x={70 + Math.sin(t * 70) * 5} y={470 + Math.cos(t * 60) * 4} fontFamily={MONT} fontWeight={900} fontSize={72} fill="#fff" stroke={LINE} strokeWidth={8} paintOrder="stroke" transform="rotate(-8 70 470)">ВЖЖЖ!</text>}
    </Shot>
  );
};

/* ── 5. 03:15: скважина → Дима лицом в подушку стучит пяткой → Нюанс открывает вору ── */
export const S5Guard = ({ keyEnd, bedEnd, openAt, clickAt, dropAt, cloudAt, fallAt }: { keyEnd: number; bedEnd: number; openAt: number; clickAt: number; dropAt: number; cloudAt: number; fallAt: number }) => {
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
    const jolt = kick > 0.85 ? 4 : 0;
    return (
      <Shot from={keyEnd} to={bedEnd} origin={[540, 1100]} bg="#0b0e16">
        <Room wall="#1c2333" pattern="#222a3d" floor="#241c18" />
        <NightWindow x={260} t={t} />
        <Nightstand x={120} />
        {/* боковая стенка шкафа: пятка упирается в неё, но не проходит насквозь */}
        <rect x={900 + jolt} y={300} width={200} height={1080} fill="#5a3a24" {...OUT} />
        <rect x={60 + 160} y={1120} width={680} height={150} rx={20} fill="#4b3a5a" {...OUT} />
        <rect x={220} y={1270} width={680} height={110} fill="#3a2a20" {...OUT} />
        <ellipse cx={340} cy={1080} rx={120} ry={56} fill="#e8e4f0" {...OUT} />
        {/* голова на подушке: спит, глаза закрыты */}
        <g transform="translate(330 1040) rotate(-80) scale(0.62) translate(0 682)">
          <DimaHead lid={1} />
        </g>
        <path d="M380 1000 C480 930 760 940 840 1010 L860 1130 L360 1130 Z" fill="#6a5a8a" {...OUT} />
        <path d="M480 1000 C560 1030 660 1030 760 1000" stroke="#4b3a6a" strokeWidth={6} fill="none" />
        {/* пятка в носке всегда касается стенки шкафа (x=900), на ударе стенка вздрагивает вместе с ней */}
        <g transform={`translate(${jolt} 0)`}>
          <path d="M836 1012 C870 1004 900 1026 900 1058 C898 1082 852 1086 834 1072 Z" fill={SOCK} {...OUT} />
        </g>
        {kick > 0.85 && <text x={700} y={920} fontFamily={MONT} fontWeight={900} fontSize={70} fill="#fff" stroke={LINE} strokeWidth={8} paintOrder="stroke" transform="rotate(-6 700 920)">ТУК-ТУК</text>}
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
  const light = ez(t, clickAt, clickAt + 0.12) * (0.85 + 0.15 * Math.abs(Math.sin(t * 40)));
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
      <Nuance x={NX} y={FLOOR_Y} s={0.95} t={t} pose={{ armL: t > openAt - 0.4 ? nuanceReach(-1, hd.x, hd.y - 50, NX, FLOOR_Y, 0.95, 0, 1) : nuanceReach(-1, 620, 1020, NX, FLOOR_Y, 0.95, 0, 1), gripL: t > openAt - 0.4 ? 1 : 0, armR: { sh: -4, el: -6 }, head: -10, squint: light > 0.5 ? 1 : 0 }} />
      {/* настенный выключатель у двери и верхний свет */}
      <rect x={110} y={860} width={54} height={80} rx={8} fill="#efeae0" {...OUT} />
      <rect x={126} y={light > 0 ? 872 : 896} width={22} height={32} rx={4} fill="#d9d2c4" {...OUT} />
      <path d="M540 0 V140" stroke={LINE} strokeWidth={6} />
      <ellipse cx={540} cy={150} rx={70} ry={22} fill={light > 0 ? "#fffbe0" : "#3a3a3a"} {...OUT} />
      {light > 0 && <rect width={1080} height={1920} fill="#fff6d0" opacity={0.28 * light} style={{ mixBlendMode: "screen" }} />}
      {light > 0 && <path d="M470 160 L170 1380 L910 1380 L610 160 Z" fill="#fffbe0" opacity={0.18 * light} />}
      {t > clickAt && t < clickAt + 0.8 && <text x={190} y={830} fontFamily={MONT} fontWeight={900} fontSize={64} fill="#fff" stroke={LINE} strokeWidth={8} paintOrder="stroke" transform="rotate(-8 190 830)">ЩЕЛК!</text>}
      {down && <ThiefDown x={380} y={1580} s={0.9} t={t} />}
      {down && <rect x={560} y={1566} width={80} height={8} rx={4} fill="#c9ccd2" {...OUT} transform="rotate(12 600 1570)" />}
      {t > cloudAt && !down && <Cloud x={DX - 30} y={300} text="ДА НУ НАХУЙ" k={ez(t, cloudAt, cloudAt + 0.25)} />}
    </Shot>
  );
};

/* ── 6. Утро: отзыв 4 из 5, пуш про диван, плашка ── */
export const S6Review = ({ pushAt }: { pushAt: number }) => {
  const t = useLT();
  const dur = React.useContext(DurCtx);
  const card = useSpr(0.2, 16, 100);
  const push = useSpr(pushAt, 13, 120);
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
    </Shot>
  );
};

/* ── 4½. Вечер на кухне: Нюанс в фартуке моет посуду, Дима выставляет ему половину коммуналки ── */
export const S5Kitchen = ({ dropAt, shockFrom, shockTo }: { dropAt: number; shockFrom: number; shockTo: number }) => {
  const t = useLT();
  const dur = React.useContext(DurCtx);
  const shock = ez(t, shockFrom, shockFrom + 0.15) * (1 - ez(t, shockTo, shockTo + 0.4));
  const fall = ez(t, dropAt, dropAt + 0.45);
  const show = ez(t, 0.6, 1.2);
  const NX = 760;
  const scrub = Math.sin(t * 9) * 14 * (1 - shock);
  return (
    <Shot to={dur} origin={[540, 1000]}>
      <Room wall="#3d4a52" pattern="#46535c" floor="#5a4632" />
      <Sink x={720} />
      <Backlight x={760} y={700} r={600} o={0.3} color="#fff2c4" />
      <Nuance
        x={NX}
        y={FLOOR_Y}
        s={0.95}
        t={t}
        pose={{
          crouch: 0.62 + shock * 0.08,
          apron: true,
          head: 14 - shock * 18,
          guilty: shock,
          // моет посуду, а от шока вскидывает лапы по бокам головы
          armL: nuanceReach(-1, 690 + scrub - shock * 150, 1060 - shock * 420, NX, FLOOR_Y, 0.95, 0.62),
          armR: nuanceReach(1, 830 - scrub + shock * 150, 1060 - shock * 420, NX, FLOOR_Y, 0.95, 0.62),
          gripR: t < dropAt ? 1 : 0,
          itemR: t < dropAt ? <ellipse cx={0} cy={0} rx={60} ry={14} fill="#f4f1ea" stroke={LINE} strokeWidth={3} /> : undefined,
        }}
      />
      {t >= dropAt && fall < 1 && <ellipse cx={870 + fall * 40} cy={1060 + fall * 330} rx={60} ry={14} fill="#f4f1ea" stroke={LINE} strokeWidth={3} transform={`rotate(${fall * 220} ${870 + fall * 40} ${1060 + fall * 330})`} />}
      {fall >= 1 && [0, 1, 2, 3].map((i) => <path key={i} d={`M${860 + i * 30} 1392 l18 -10 l10 14 Z`} fill="#f4f1ea" stroke={LINE} strokeWidth={2} />)}
      {t > dropAt + 0.35 && t < dropAt + 1.3 && <text x={720} y={960} fontFamily={MONT} fontWeight={900} fontSize={80} fill="#fff" stroke={LINE} strokeWidth={8} paintOrder="stroke" transform="rotate(-6 720 960)">ДЗЫНЬ!</text>}
      <Dima x={280} y={DY} s={DS} t={t} pose={{ armR: dimaReach(1, 380 + show * 110, 1420 - show * 260, 280, DY, DS), itemR: <g transform="scale(0.5)"><Receipt /></g>, armL: dimaReach(-1, 140, 1330, 280, DY, DS), itemL: <Mug t={t} steam flip />, head: 4, look: 0.5 }} />
    </Shot>
  );
};
