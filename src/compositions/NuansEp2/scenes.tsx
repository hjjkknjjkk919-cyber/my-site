import React from "react";
import { AbsoluteFill, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { DurCtx, ez, MONT, useLT, useSpr } from "../../pelmeni/kit";
import { BillsFan, FLOOR_Y, FrontDoor, HallDecor, Level, Mug, Push, Receipt, Room, Shelf, Sink, Wardrobe } from "../AvitoWardrobe/props";
import { ClawHand, dimaReach, LINE, nuanceReach, OUT } from "../AvitoWardrobe/rig";
import { Admin, Briefcase, DimaV2, GOLD_RIM, ICE_RIM, KidBack, Teen, Magnifier, MomDemon, NuansV2, Sandwich, ShopBag } from "./chars";

/* ── константы интеграции: поменять бренд/промокод можно здесь, озвучка бренд не называет ── */
export const VPN_NAME = "ВАШ VPN";
export const VPN_PROMO = "ПРОМОКОД В ОПИСАНИИ";

export type Amp = { dima: number; nuance: number; mom: number; kid: number; admin: number };
export const AmpCtx = React.createContext<Amp>({ dima: 0, nuance: 0, mom: 0, kid: 0, admin: 0 });

/** Кадр с 3 планами: задний (blur), средний (резкий), передний (blur), медленный наезд и параллакс. */
const Shot = ({ to, from = 0, origin = [540, 960], bg = "#101216", zoom = [1, 1.07], back, front, children }: { to: number; from?: number; origin?: [number, number]; bg?: string; zoom?: [number, number]; back?: React.ReactNode; front?: React.ReactNode; children: React.ReactNode }) => {
  const t = useLT();
  const k = ez(t, from, to);
  const s = zoom[0] + (zoom[1] - zoom[0]) * k;
  const cam = (depth: number) => `translate(${origin[0]} ${origin[1]}) scale(${1 + (s - 1) * depth}) translate(${-origin[0] - k * 14 * (depth - 1)} ${-origin[1]})`;
  return (
    <AbsoluteFill style={{ background: bg }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        <defs>
          <filter id="bl15"><feGaussianBlur stdDeviation={1.5} /></filter>
          <filter id="bl2"><feGaussianBlur stdDeviation={2} /></filter>
        </defs>
        {back && <g transform={cam(0.6)}>{back}</g>}
        <g transform={cam(1)}>{children}</g>
        {front && <g transform={cam(1.5)} filter="url(#bl2)">{front}</g>}
      </svg>
    </AbsoluteFill>
  );
};

const Glow = ({ x, y, r, color, o = 0.5 }: { x: number; y: number; r: number; color: string; o?: number }) => {
  const id = `g${Math.round(x)}${Math.round(y)}${color.slice(1)}`;
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

/** Световые лучи из окна. */
const Rays = ({ x, y, color = "#ffd8a0", o = 0.12 }: { x: number; y: number; color?: string; o?: number }) => (
  <g opacity={o} style={{ mixBlendMode: "screen" }}>
    {[0, 1, 2].map((i) => <path key={i} d={`M${x + i * 60} ${y} L${x + 200 + i * 160} 1380 L${x + 80 + i * 160} 1380 Z`} fill={color} />)}
  </g>
);

/** Окно квартиры (задний план, размыто). */
const Window = ({ x }: { x: number }) => (
  <g filter="url(#bl15)">
    <rect x={x} y={300} width={300} height={420} fill="#1c2a44" {...OUT} />
    <circle cx={x + 210} cy={400} r={34} fill="#f3eccc" opacity={0.9} />
    {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={x + 30 + i * 52} y={560 + (i % 2) * 40} width={30} height={160} fill="#26324a" />)}
    <path d={`M${x} 510 H${x + 300} M${x + 150} 300 V720`} stroke="#d9cdb6" strokeWidth={12} />
    <rect x={x - 20} y={1110} width={340} height={150} rx={10} fill="#9aa0a8" {...OUT} />
    {Array.from({ length: 8 }, (_, i) => <rect key={i} x={x - 6 + i * 40} y={1120} width={26} height={130} rx={8} fill="#b7bcc4" {...OUT} strokeWidth={2} />)}
  </g>
);

/** Велюровый диван: спинка (за персонажами) и фасад сиденья (перекрывает ноги). */
const SofaBack = ({ x, burst }: { x: number; burst: number }) => (
  <g>
    <rect x={x - 400} y={1000} width={800} height={330} rx={60} fill="#7b2d3a" {...OUT} />
    {[-1, 0, 1].map((i) => <path key={i} d={`M${x + i * 260 - 100} 1060 q100 -30 200 0`} stroke="#5f1f2c" strokeWidth={8} fill="none" />)}
    {/* подушки разъезжаются */}
    {[-1, 1].map((d) => (
      <g key={d} transform={`translate(${d * burst * 160} ${-burst * 120}) rotate(${d * burst * 25} ${x + d * 190} 1340)`}>
        <rect x={x + d * 190 - 180} y={1290} width={360} height={110} rx={40} fill="#8e3646" {...OUT} />
      </g>
    ))}
  </g>
);
const SofaFront = ({ x, sag }: { x: number; sag: number }) => (
  <g>
    <rect x={x - 420} y={1400 + sag} width={840} height={260} rx={30} fill="#6a2431" {...OUT} />
    {[-1, 1].map((d) => <rect key={d} x={x + d * 420 - 70} y={1180} width={140} height={480} rx={50} fill="#7b2d3a" {...OUT} />)}
    <path d={`M${x - 340} ${1470 + sag} q340 ${30 + sag} 680 0`} stroke="#521a26" strokeWidth={8} fill="none" />
    {sag > 4 && [-200, 0, 200].map((d) => <path key={d} d={`M${x + d - 20} ${1410 + sag} l10 -24 l10 24 l10 -24`} stroke="#c9ccd2" strokeWidth={4} fill="none" />)}
  </g>
);

/** Кисть когтями вниз (закрывает морду), независимо от направления руки. */
const palmDown = (p: { sh: number; el: number }) => ({ ...p, wr: -(p.sh + Math.sign(p.el) * Math.min(115, Math.abs(p.el))) });

const DY = 2100;
const DS = 1.9;

/* ── 1. Холодный хук: Дима падает на диван → из подушек вылезает мама в бигуди ── */
export const S1Hook = ({ momAt }: { momAt: number }) => {
  const t = useLT();
  const dur = React.useContext(DurCtx);
  const a = React.useContext(AmpCtx);
  const fall = ez(t, 0.1, 0.55);
  const sag = Math.max(0, Math.sin(Math.min(1, (t - 0.45) / 0.5) * Math.PI)) * 18 * (t > 0.45 ? 1 : 0);
  const burst = ez(t, momAt - 0.1, momAt + 0.3);
  const rise = ez(t, momAt, momAt + 0.8);
  const shocked = t > momAt + 0.3;
  const dy = DY - 150 * (1 - fall) + sag;
  return (
    <Shot to={dur} origin={[400, 900]} back={<><Window x={70} /><Rays x={120} y={320} /></>} front={<rect x={-40} y={1640} width={1160} height={300} fill="#2a1a14" />}>
      <Room wall="#3b3240" pattern="#433a49" floor="#4a3426" glow={{ x: 300, w: 300 }} />
      <Glow x={400} y={700} r={700} color="#ffcf8a" o={0.28} />
      <SofaBack x={560} burst={burst} />
      <MomDemon x={800} y={2950 - rise * 1300} s={0.95} t={t} amp={a.mom} pose={{ armL: nuanceReach(-1, 640, 1150 + (1 - rise) * 1000, 800, 2950 - rise * 1300, 1.03), armR: nuanceReach(1, 1000, 1000 + (1 - rise) * 1000, 800, 2950 - rise * 1300, 1.03), head: -8, mouth: 0.4 }} />
      <DimaV2 x={330} y={dy} s={DS} t={t} pose={{ armR: dimaReach(1, 520, 1260, 330, dy, DS), itemR: <Mug t={t} steam />, armL: dimaReach(-1, 120, 1200, 330, dy, DS), head: shocked ? -6 : 4, look: shocked ? 0.9 : 0.1, lid: shocked ? 0.3 : 0.55 }} />
      <SofaFront x={560} sag={sag} />
      {t > momAt && t < momAt + 0.9 && <text x={760} y={900} fontFamily={MONT} fontWeight={900} fontSize={80} fill="#fff" stroke={LINE} strokeWidth={9} paintOrder="stroke" transform="rotate(-8 760 900)">ХРУСЬ!</text>}
    </Shot>
  );
};

/* ── 2. Инспекция полки → Нюанс краснеет → квитанция «ДЕЛИМ НА 3» и глоток ── */
export const S2Council = ({ cutB, cutC, slapAt, sipAt }: { cutB: number; cutC: number; slapAt: number; sipAt: number }) => {
  const t = useLT();
  const dur = React.useContext(DurCtx);
  const a = React.useContext(AmpCtx);
  if (t < cutB) {
    const MX = 470;
    const point = ez(t, cutB * 0.55, cutB * 0.62);
    return (
      <Shot to={cutB} origin={[420, 700]} back={<Window x={-120} />} front={<rect x={1000} y={0} width={140} height={1920} fill="#3a2a20" />}>
        <Room wall="#3b3240" pattern="#433a49" floor="#4a3426" />
        <Glow x={300} y={560} r={500} color="#ffcf8a" o={0.3} />
        <Shelf x={300} y={560} w={420} tilt={4} />
        <g transform="translate(300 520) rotate(4)"><Level w={260} tilt={1} /></g>
        <Wardrobe x={930} w={380} open={0} />
        <MomDemon x={MX} y={FLOOR_Y} s={0.8} t={t} amp={a.mom} pose={{ armL: nuanceReach(-1, 330, 700, MX, FLOOR_Y, 0.864), gripL: 1, itemL: <Magnifier />, armR: point > 0 ? nuanceReach(1, 860, 760, MX, FLOOR_Y, 0.864) : nuanceReach(1, 600, 1080, MX, FLOOR_Y, 0.864), head: -6 }} />
        <DimaV2 x={880} y={DY} s={1.6} t={t} pose={{ armR: dimaReach(1, 1010, 1580, 880, DY, 1.6), itemR: <Mug t={t} steam />, armL: dimaReach(-1, 740, 1590, 880, DY, 1.6), head: -4, look: -0.6 }} />
      </Shot>
    );
  }
  if (t < cutC) {
    return (
      <Shot from={cutB} to={cutC} origin={[540, 600]} zoom={[1.02, 1.1]} back={<Wardrobe x={540} w={600} open={1} />}>
        <rect width={1080} height={1920} fill="#2b2430" />
        <g filter="url(#bl15)"><Wardrobe x={540} w={640} open={1} /></g>
        <Glow x={540} y={700} r={700} color="#ff8fb1" o={0.25} />
        <NuansV2 x={540} y={2785} s={1.9} t={t} amp={a.nuance} blush={ez(t, cutB, cutB + 0.4)} pose={{ apron: true, crouch: 0.35, armL: nuanceReach(-1, 330, 1420, 540, 2785, 1.9, 0.35), armR: palmDown(nuanceReach(1, 560, 600, 540, 2785, 1.9, 0.35)), head: 14, guilty: 1 }} />
      </Shot>
    );
  }
  const show = ez(t, slapAt - 0.35, slapAt);
  const sip = ez(t, sipAt, sipAt + 0.35) * (1 - ez(t, sipAt + 0.9, sipAt + 1.2));
  const receipt = (
    <g transform="scale(0.62)">
      <Receipt />
      <g transform="translate(-6 -160) rotate(-12)" opacity={ez(t, slapAt, slapAt + 0.15)}>
        <rect x={-122} y={-42} width={244} height={84} rx={10} fill="rgba(255,255,255,.75)" stroke="#d62828" strokeWidth={9} />
        <text x={0} y={18} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={42} fill="#d62828">ДЕЛИМ НА 3</text>
      </g>
    </g>
  );
  return (
    <Shot from={cutC} to={dur} origin={[540, 1100]} back={<><Window x={680} /><Rays x={720} y={320} /></>}>
      <Room wall="#3b3240" pattern="#433a49" floor="#4a3426" />
      <MomDemon x={760} y={FLOOR_Y} s={0.68} t={t} amp={a.mom} pose={{ armL: nuanceReach(-1, 640, 1160, 760, FLOOR_Y, 0.734), armR: nuanceReach(1, 880, 1120, 760, FLOOR_Y, 0.734), head: 4 }} />
      <DimaV2 x={330} y={DY} s={DS} t={t} pose={{ armL: dimaReach(-1, 230, 1560 - show * 300, 330, DY, DS), itemL: receipt, armR: dimaReach(1, 560 - sip * 60, 1600 - sip * 330, 330, DY, DS), itemR: <Mug t={t} steam />, head: 2 - sip * 4, lid: 0.6 }} />
      {t > slapAt && t < slapAt + 0.7 && <text x={640} y={1200} fontFamily={MONT} fontWeight={900} fontSize={80} fill="#fff" stroke={LINE} strokeWidth={9} paintOrder="stroke" transform="rotate(-8 640 1200)">ШЛЁП!</text>}
    </Shot>
  );
};

/* ── 3. Сборы на смену → интеграция VPN → «у меня три века стажа» ── */
export const S3Shift = ({ vpnFrom, blockAt, toggleAt, doorFrom }: { vpnFrom: number; blockAt: number; toggleAt: number; doorFrom: number }) => {
  const t = useLT();
  const dur = React.useContext(DurCtx);
  const a = React.useContext(AmpCtx);
  const card = useSpr(0.5, 14, 120);
  const hall = (
    <>
      <Room wall="#3a4136" pattern="#434b3e" floor="#3b2a20" ceiling={258} />
      <HallDecor />
      <FrontDoor x={850} open={0} />
      <Shelf x={330} y={600} w={360} tilt={4} />
    </>
  );
  if (t < vpnFrom) {
    const NX = 760;
    return (
      <Shot to={vpnFrom} origin={[540, 900]} front={<rect x={-60} y={0} width={110} height={1920} fill="#5a3a24" />}>
        {hall}
        <Glow x={540} y={500} r={600} color="#ffcf8a" o={0.25} />
        <MomDemon x={300} y={FLOOR_Y} s={0.76} t={t} amp={0} pose={{ armR: nuanceReach(1, 560, 1040, 300, FLOOR_Y, 0.82), gripR: 1, itemR: <Sandwich />, armL: nuanceReach(-1, 200, 1080, 300, FLOOR_Y, 0.82), head: 6 }} />
        <NuansV2 x={NX} y={FLOOR_Y} s={0.95} t={t} amp={0} pose={{ apron: true, armL: nuanceReach(-1, 620, 1040, NX, FLOOR_Y, 0.95), gripL: 1, itemL: <Briefcase />, armR: nuanceReach(1, 900, 1060, NX, FLOOR_Y, 0.95), head: 8, guilty: 0.5 }} />
        <g opacity={card} transform={`translate(470 ${330 + (1 - card) * 60}) rotate(-3)`}>
          <rect x={-330} y={-120} width={660} height={240} rx={20} fill="#fbfaf6" {...OUT} />
          <text x={0} y={-58} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={30} fill="#111">ВАКАНСИЯ</text>
          <text x={0} y={-6} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={38} fill="#c0392b">Хоррор-квест «Склеп»</text>
          <text x={0} y={46} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={30} fill="#333">Аниматор. Оплата сразу</text>
          <text x={0} y={92} textAnchor="middle" fontFamily={MONT} fontWeight={700} fontSize={22} fill="#888">опыт приветствуется</text>
        </g>
      </Shot>
    );
  }
  if (t < doorFrom) {
    // интеграция: крупно телефон в лапе, свет экрана на морде Нюанса
    const lt = t - vpnFrom;
    const blocked = t >= blockAt - 1.2;
    const on = ez(t, toggleAt, toggleAt + 0.35);
    const ring = ez(t, toggleAt + 0.1, toggleAt + 1.0);
    const play = t > toggleAt + 0.9;
    const ad = ez(t, vpnFrom + 0.2, vpnFrom + 0.6);
    const glow = play ? "#7CFFB2" : blocked ? "#ff5a5a" : "#9fc4ff";
    return (
      <Shot from={vpnFrom} to={doorFrom} origin={[540, 900]} zoom={[1, 1]} bg="#07080c">
        <rect width={1080} height={1920} fill="#0b0d12" />
        {Array.from({ length: 30 }, (_, i) => <circle key={i} cx={(i * 137) % 1080} cy={(i * 251 + lt * 40) % 1600} r={2 + (i % 3)} fill="#fff" opacity={0.12} />)}
        <g opacity={0.9}>
          <NuansV2 x={330} y={2700} s={1.5} t={t} amp={0} pose={{ apron: true, armL: { sh: 4, el: 2 }, armR: { sh: -4, el: -2 }, head: 14, happy: play ? 1 : 0, guilty: blocked && !play ? 1 : 0 }} />
        </g>
        <Glow x={560} y={900} r={620} color={glow} o={0.45} />
        <g transform="translate(560 1290) scale(1.35)">
          <ClawHand x={0} y={0} grip={1} dir={1} size={1} item={
            <g transform="translate(0 -160)">
              <rect x={-120} y={-230} width={240} height={460} rx={30} fill="#111318" {...OUT} />
              <rect x={-108} y={-214} width={216} height={428} rx={20} fill={play ? "#0e1a14" : "#15171d"} />
              {!play ? (
                <g>
                  <rect x={-96} y={-196} width={192} height={110} rx={10} fill="#222" />
                  <path d="M-14 -150 v-14 a14 14 0 0 1 28 0 v14" stroke="#ff5a5a" strokeWidth={5} fill="none" opacity={blocked ? 1 : 0} />
                  <rect x={-20} y={-150} width={40} height={30} rx={5} fill="#ff5a5a" opacity={blocked ? 1 : 0} />
                  <text x={0} y={-60} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={15} fill="#fff">КАК ПУГАТЬ ЛЮДЕЙ</text>
                  <text x={0} y={-36} textAnchor="middle" fontFamily={MONT} fontWeight={700} fontSize={12} fill={blocked ? "#ff7a7a" : "#999"}>{blocked ? "Недоступно в вашем регионе" : "загрузка..."}</text>
                  {/* переключатель VPN */}
                  <rect x={-96} y={10} width={192} height={150} rx={16} fill="#1e2330" stroke={on > 0.5 ? "#7CFFB2" : "#3a4256"} strokeWidth={3} />
                  <text x={0} y={46} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={18} fill="#fff">{VPN_NAME}</text>
                  <rect x={-40} y={70} width={80} height={40} rx={20} fill={on > 0.5 ? "#2fbf71" : "#4a4f5e"} />
                  <circle cx={-20 + on * 40} cy={90} r={16} fill="#fff" />
                  <circle cx={0} cy={90} r={30 + ring * 90} fill="none" stroke="#7CFFB2" strokeWidth={4} opacity={(1 - ring) * (ring > 0 ? 1 : 0)} />
                  <text x={0} y={140} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={13} fill={on > 0.5 ? "#7CFFB2" : "#888"}>{on > 0.5 ? "ПОДКЛЮЧЕНО" : "ОТКЛЮЧЕНО"}</text>
                </g>
              ) : (
                <g>
                  <rect x={-108} y={-214} width={216} height={170} fill="#2a0d10" />
                  <ellipse cx={0} cy={-130} rx={40} ry={48} fill="#e9e2d0" {...OUT} />
                  {[-14, 14].map((ex) => <circle key={ex} cx={ex} cy={-138} r={8} fill="#111" />)}
                  <ellipse cx={0} cy={-104} rx={12} ry={16} fill="#111" />
                  <text x={0} y={-16} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={16} fill="#fff">КАК ПУГАТЬ ЛЮДЕЙ · 2026</text>
                  <rect x={-96} y={6} width={192} height={6} rx={3} fill="#333" />
                  <rect x={-96} y={6} width={30 + (t - toggleAt) * 50} height={6} rx={3} fill="#e5262b" />
                  <text x={0} y={60} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={14} fill="#7CFFB2">● {VPN_NAME} · ЗАЩИЩЕНО</text>
                </g>
              )}
            </g>
          } />
        </g>
        {/* рекламный блок = 25% кадра: 855×606 в безопасной зоне (x 70–925, y 150–756) */}
        <g opacity={ad} transform={`translate(0 ${(1 - ad) * -40})`}>
          <defs>
            <linearGradient id="vpnbg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0c2a1e" />
              <stop offset="100%" stopColor="#06110d" />
            </linearGradient>
          </defs>
          <rect x={70} y={150} width={855} height={606} rx={44} fill="url(#vpnbg)" stroke={on > 0.5 ? "#7CFFB2" : "#3a4a44"} strokeWidth={6} />
          <circle cx={240} cy={330} r={110 + ring * 60} fill="#7CFFB2" opacity={0.12 + 0.2 * on} />
          <path d="M240 230 l90 36 v70 c0 70 -46 106 -90 128 c-44 -22 -90 -58 -90 -128 v-70 Z" fill={on > 0.5 ? "#2fbf71" : "#4a5a54"} stroke="#0c0a0e" strokeWidth={6} strokeLinejoin="round" />
          {on > 0.5 ? <path d="M196 346 l32 32 l62 -70" stroke="#fff" strokeWidth={16} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : <rect x={214} y={320} width={52} height={44} rx={8} fill="#c9ccd2" />}
          <text x={390} y={300} fontFamily={MONT} fontWeight={900} fontSize={78} fill="#fff">{VPN_NAME}</text>
          <text x={390} y={350} fontFamily={MONT} fontWeight={800} fontSize={30} fill="#b9d6c8">Открывает всё. Даже</text>
          <text x={390} y={388} fontFamily={MONT} fontWeight={800} fontSize={30} fill="#b9d6c8">туториалы для демонов</text>
          {/* большой переключатель */}
          <rect x={390} y={420} width={170} height={84} rx={42} fill={on > 0.5 ? "#2fbf71" : "#4a4f5e"} stroke="#0c0a0e" strokeWidth={5} />
          <circle cx={432 + on * 86} cy={462} r={34} fill="#fff" />
          <text x={580} y={474} fontFamily={MONT} fontWeight={900} fontSize={34} fill={on > 0.5 ? "#7CFFB2" : "#9aa0a8"}>{on > 0.5 ? "ПОДКЛЮЧЕНО" : "ОТКЛЮЧЕНО"}</text>
          <rect x={110} y={560} width={775} height={150} rx={28} fill="#7CFFB2" />
          <text x={497} y={630} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={52} fill="#06110d">{VPN_PROMO}</text>
          <text x={497} y={684} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={30} fill="#0c2a1e">ссылка и скидка — в описании</text>
        </g>
      </Shot>
    );
  }
  const proud = ez(t, doorFrom + 0.3, doorFrom + 0.8);
  const NX = 720;
  return (
    <Shot from={doorFrom} to={dur} origin={[540, 900]} front={<rect x={-60} y={0} width={130} height={1920} fill="#5a3a24" />}>
      {hall}
      <Glow x={700} y={600} r={600} color="#ffcf8a" o={0.25} />
      <g transform={`translate(${NX} ${FLOOR_Y}) scale(${1 + proud * 0.05} 1) translate(${-NX} ${-FLOOR_Y})`}>
        <NuansV2 x={NX} y={FLOOR_Y} s={0.95} t={t} amp={a.nuance} pose={{ apron: true, armL: nuanceReach(-1, 560, 1040, NX, FLOOR_Y, 0.95), gripL: 1, itemL: <Briefcase />, armR: nuanceReach(1, 820, 560 - proud * 40, NX, FLOOR_Y, 0.95), head: -10 * proud, happy: proud > 0.5 && a.nuance === 0 ? 1 : 0 }} />
      </g>
      <DimaV2 x={250} y={DY} s={1.7} t={t} pose={{ lean: 4, armR: dimaReach(1, 470, 1530, 250, DY, 1.7), itemR: <Mug t={t} />, armL: dimaReach(-1, 60, 1560, 250, DY, 1.7), head: -6, look: 0.6 }} />
    </Shot>
  );
};

/* ── 4. Хоррор-квест: рёв, лампы, школьники со вспышками, 1★, Нюанс в углу ── */
export const S4Quest = ({ roarEnd, kidsFrom, starAt, cornerFrom, flashes }: { roarEnd: number; kidsFrom: number; starAt: number; cornerFrom: number; flashes: number[] }) => {
  const t = useLT();
  const dur = React.useContext(DurCtx);
  const a = React.useContext(AmpCtx);
  const star = useSpr(starAt, 13, 120);
  const strobe = Math.sin(t * 9) > 0.2 ? 1 : 0.35;
  const fog = (
    <g opacity={0.55} filter="url(#bl2)">
      {[0, 1, 2, 3].map((i) => <ellipse key={i} cx={((i * 380 + t * 40) % 1500) - 200} cy={1330 + (i % 2) * 40} rx={420} ry={70} fill="#9aa3b5" opacity={0.35} />)}
    </g>
  );
  const basement = (
    <>
      <rect width={1080} height={1920} fill="#140b0c" />
      {Array.from({ length: 16 }, (_, r) => Array.from({ length: 6 }, (_, c) => <rect key={`${r}-${c}`} x={c * 190 - (r % 2) * 95} y={r * 88} width={180} height={80} fill="#24130f" stroke="#0c0606" strokeWidth={6} />))}
      <rect y={FLOOR_Y} width={1080} height={540} fill="#0d0809" />
      <Glow x={540} y={140} r={900} color="#ff2a2a" o={0.35 * strobe} />
    </>
  );
  if (t < kidsFrom) {
    const roar = ez(t, 0.05, 0.3) * (1 - ez(t, roarEnd - 0.2, roarEnd));
    const shake = roar > 0 ? `translate(${Math.sin(t * 61) * 5} ${Math.cos(t * 47) * 5})` : "";
    return (
      <Shot to={kidsFrom} origin={[540, 800]} bg="#0b0607">
        <g transform={shake}>
          {basement}
          {[200, 540, 880].map((x, i) => (
            <g key={x}>
              <path d={`M${x} 0 V120`} stroke="#222" strokeWidth={4} />
              <circle cx={x} cy={140} r={22} fill={t > 0.3 ? "#333" : "#ffe9a8"} {...OUT} />
              {t > 0.3 && t < 0.9 && Array.from({ length: 8 }, (_, j) => <path key={j} d={`M${x} 150 l${Math.cos(j + i) * 90 * ez(t, 0.3, 0.8)} ${Math.abs(Math.sin(j)) * 120 * ez(t, 0.3, 0.8)}`} stroke="#ffd166" strokeWidth={4} />)}
            </g>
          ))}
          <Glow x={540} y={760} r={600} color="#5a0010" o={0.8 * roar} />
          <NuansV2 x={540} y={FLOOR_Y + 120} s={1.05} t={t} amp={0} pose={{ apron: true, crouch: 0.25 * roar, head: -14 * roar, horror: roar, armL: nuanceReach(-1, 200, 600, 540, FLOOR_Y + 120, 1.05, 0.25 * roar), armR: nuanceReach(1, 880, 600, 540, FLOOR_Y + 120, 1.05, 0.25 * roar) }} />
          {fog}
        </g>
      </Shot>
    );
  }
  if (t < cornerFrom) {
    const fl = flashes.reduce((m, at) => Math.max(m, t >= at && t < at + 0.15 ? 1 - (t - at) / 0.15 : 0), 0);
    return (
      <Shot from={kidsFrom} to={cornerFrom} origin={[540, 900]} bg="#0b0607">
        {basement}
        <NuansV2 x={780} y={FLOOR_Y} s={0.95} t={t} amp={0} blush={0.6} pose={{ apron: true, crouch: 0.15, armL: nuanceReach(-1, 740, 1100, 780, FLOOR_Y, 0.95, 0.15), armR: nuanceReach(1, 830, 1100, 780, FLOOR_Y, 0.95, 0.15), gripL: 1, gripR: 1, head: 12, guilty: 1 }} />
        {fog}
        <Teen x={130} y={1560} s={1.0} t={t} hoodie="#3b5bdb" cap="#f2c14e" flash={fl} />
        <Teen x={300} y={1610} s={1.08} t={t + 1} hoodie="#2b2b2b" cap="#e5262b" flash={fl * 0.8} phoneUp={0} />
        <Teen x={470} y={1580} s={1.02} t={t + 2} hoodie="#c92a2a" cap="#1c1c1c" flash={fl} />
        {fl > 0 && <rect width={1080} height={1920} fill="#fff" opacity={fl * 0.35} />}
        <g opacity={star} transform={`translate(470 ${300 + (1 - star) * 60}) rotate(-2)`}>
          <rect x={-400} y={-100} width={800} height={200} rx={26} fill="#fff" {...OUT} />
          <path transform="translate(-330 -24)" d="M0 -36 L11 -12 L36 -10 L16 7 L22 34 L0 20 L-22 34 L-16 7 L-36 -10 L-11 -12 Z" fill="#ffb400" {...OUT} />
          {[1, 2, 3, 4].map((i) => <path key={i} transform={`translate(${-330 + i * 80} -24)`} d="M0 -36 L11 -12 L36 -10 L16 7 L22 34 L0 20 L-22 34 L-16 7 L-36 -10 L-11 -12 Z" fill="#ddd" {...OUT} />)}
          <text x={10} y={-12} fontFamily={MONT} fontWeight={900} fontSize={44} fill="#111">1 ★</text>
          <text x={-370} y={58} fontFamily={MONT} fontWeight={800} fontSize={30} fill="#333">Дешёвый костюм, аниматор стесняется</text>
        </g>
      </Shot>
    );
  }
  return (
    <Shot from={cornerFrom} to={dur} origin={[300, 1100]} zoom={[1.05, 1.15]} bg="#0b0607">
      {basement}
      <rect x={0} y={0} width={420} height={1920} fill="#000" opacity={0.35} />
      <NuansV2 x={330} y={FLOOR_Y} s={0.95} t={t} amp={a.nuance} pose={{ apron: true, crouch: 1, armL: palmDown(nuanceReach(-1, 300, 400, 330, FLOOR_Y, 0.95, 1)), armR: palmDown(nuanceReach(1, 360, 405, 330, FLOOR_Y, 0.95, 1)), head: 16, guilty: 1 }} />
      {fog}
      {[0, 1].map((i) => <ellipse key={i} cx={320 + i * 40} cy={1010 + ((t * 120 + i * 50) % 120)} rx={4} ry={7} fill="#9fd0ff" opacity={0.8} />)}
    </Shot>
  );
};

/* ── 5. Железная дверь → Дима в полосе синего света (3 с тишины) → визг → админ с деньгами ── */
export const S5Door = ({ stareEnd, fleeAt, giveAt }: { stareEnd: number; fleeAt: number; giveAt: number }) => {
  const t = useLT();
  const dur = React.useContext(DurCtx);
  const a = React.useContext(AmpCtx);
  const open = ez(t, 0.05, 1.0);
  const zoom = ez(t, 0.9, stareEnd, 1, 1.15);
  const flee = ez(t, fleeAt, fleeAt + 0.9);
  const give = ez(t, giveAt, giveAt + 0.6);
  const after = t > fleeAt + 0.3;
  return (
    <AbsoluteFill style={{ background: "#07080b" }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        <g transform={`translate(540 800) scale(${after ? 1.0 : zoom}) translate(-540 -800)`}>
          <rect width={1080} height={1920} fill="#120a0b" />
          {Array.from({ length: 16 }, (_, r) => Array.from({ length: 6 }, (_, c) => <rect key={`${r}-${c}`} x={c * 190 - (r % 2) * 95} y={r * 88} width={180} height={80} fill="#1e1110" stroke="#0a0505" strokeWidth={6} />))}
          {/* проём и полоса ледяного света */}
          <rect x={360} y={260} width={360} height={1120} fill="#0a1220" {...OUT} />
          <path d={`M${540 - 180 * open} 260 L${540 + 180 * open} 260 L${540 + 420 * open} 1920 L${540 - 420 * open} 1920 Z`} fill="#7fb3d5" opacity={0.28} />
          <rect x={360} y={260} width={360 * open} height={1120} fill="#cfe6ff" opacity={0.35} />
          {/* створка железной двери — позади Димы */}
          <g transform={`translate(720 0) scale(${1 - open * 0.85} 1) translate(-720 0)`}>
            <rect x={360} y={260} width={360} height={1120} fill="#3a3f46" {...OUT} />
            {[0, 1, 2, 3].map((i) => <circle key={i} cx={390} cy={330 + i * 300} r={8} fill="#222" />)}
          </g>
          {after && (
            <g>
              <rect x={30} y={300} width={170} height={70} rx={8} fill="#1f9d55" {...OUT} />
              <text x={115} y={348} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={34} fill="#fff">ВЫХОД</text>
              {flee < 1 && [0, 1, 2].map((i) => (
                <g key={i} opacity={1 - ez(t, fleeAt + 0.7, fleeAt + 1.1)}>
                  <Teen x={330 - flee * 330 + i * 70} y={1180 + i * 20} s={0.42} t={t + i} hoodie={["#3b5bdb", "#2b2b2b", "#c92a2a"][i]} cap={["#f2c14e", "#e5262b", "#1c1c1c"][i]} dir={-1} run={1} />
                </g>
              ))}
            </g>
          )}
          <DimaV2 x={540} y={DY - 120} s={1.7} t={t} rim="#7fb3d5" blink={t > stareEnd} pose={{ armL: dimaReach(-1, 360, 1470, 540, DY - 120, 1.7), itemL: <ShopBag />, armR: dimaReach(1, 720, 1480, 540, DY - 120, 1.7), head: 0, look: 0, lid: 0.62 }} />
          {after && (
            <g transform="translate(220 1400) scale(1.85) translate(-220 -1400)">
              <Admin x={220} y={1400} t={t} give={give} amp={a.admin} />
            </g>
          )}
          {after && <rect x={-20} y={1380} width={430} height={540} fill="#2a1a18" {...OUT} />}
        </g>
        {/* виньетка во время взгляда */}
        <rect width={1080} height={1920} fill="url(#vig5)" />
        <defs>
          <radialGradient id="vig5" cx="0.5" cy="0.4" r="0.7">
            <stop offset="55%" stopColor="#000" stopOpacity={0} />
            <stop offset="100%" stopColor="#000" stopOpacity={t < stareEnd ? 0.8 : 0.5} />
          </radialGradient>
        </defs>
      </svg>
    </AbsoluteFill>
  );
};

/* ── 6. Квартира: мама считает деньги, Нюанс моет посуду, отзыв 5★ и пуш про холодильник ── */
export const S6Payoff = ({ reviewAt, pushAt }: { reviewAt: number; pushAt: number }) => {
  const t = useLT();
  const dur = React.useContext(DurCtx);
  const a = React.useContext(AmpCtx);
  const review = useSpr(reviewAt, 14, 120);
  const push = useSpr(pushAt, 13, 130);
  const scrub = Math.sin(t * 9) * 14;
  const nod = Math.sin(t * 5) * 5;
  return (
    <Shot to={dur} origin={[540, 1000]} back={<Sink x={760} />}>
      <rect width={1080} height={1920} fill="#3d4a52" opacity={0} />
      <Glow x={760} y={700} r={700} color="#fff2c4" o={0.3} />
      <g filter="url(#bl15)">
        <NuansV2 x={780} y={FLOOR_Y} s={0.8} t={t} amp={0} pose={{ apron: true, crouch: 0.62, head: 14, armL: nuanceReach(-1, 720 + scrub, 1090, 780, FLOOR_Y, 0.8, 0.62), armR: nuanceReach(1, 840 - scrub, 1090, 780, FLOOR_Y, 0.8, 0.62) }} />
      </g>
      <MomDemon x={290} y={FLOOR_Y + 80} s={0.74} t={t} amp={0} pose={{ armR: nuanceReach(1, 500, 930, 290, FLOOR_Y + 80, 0.8), gripR: 1, itemR: <g transform="scale(0.7) translate(0 40)"><BillsFan /></g>, armL: nuanceReach(-1, 150, 1120, 290, FLOOR_Y + 80, 0.8), head: nod, happy: 1 }} />
      <DimaV2 x={820} y={DY} s={1.7} t={t} pose={{ armL: dimaReach(-1, 650, 1560, 820, DY, 1.7), itemL: <Mug t={t} steam flip />, armR: dimaReach(1, 990, 1580, 820, DY, 1.7), head: -3, look: -0.4 }} />
      <g opacity={review} transform={`translate(470 ${360 + (1 - review) * 60})`}>
        <rect x={-380} y={-90} width={760} height={180} rx={26} fill="#fff" {...OUT} />
        <text x={-340} y={-30} fontFamily={MONT} fontWeight={900} fontSize={32} fill="#111">Валера Перекуп — Отзыв отправлен</text>
        {[0, 1, 2, 3, 4].map((i) => <path key={i} transform={`translate(${-310 + i * 74} 40)`} d="M0 -30 L9 -10 L30 -8 L13 6 L18 28 L0 17 L-18 28 L-13 6 L-30 -8 L-9 -10 Z" fill="#ffb400" {...OUT} />)}
        <text x={60} y={52} fontFamily={MONT} fontWeight={900} fontSize={38} fill="#111">★★★★★</text>
      </g>
      <g transform="translate(-70 0) translate(540 660) scale(0.8) translate(-540 -660)">
        <Push k={push} y={660} lines={["Брат, есть холодильник с нюансом.", "Морозит до −600, иногда матерится"]} />
      </g>
    </Shot>
  );
};

/* ── Рекламный баннер (6 с, со своей озвучкой): поверх размытой прихожей, углы скруглены маской, без хромакея ── */
export const BannerAd = () => {
  const t = useLT();
  const k = ez(t, 0, 0.3) * (1 - ez(t, 5.7, 6.0));
  return (
    <AbsoluteFill style={{ background: "#05070c" }}>
      {/* живая сцена прихожей продолжается, плавно притемняется; сам баннер (60 fps, с ключом) накладывается на финальном монтаже ffmpeg */}
      <AbsoluteFill style={{ filter: `brightness(${1 - 0.45 * k})` }}>
        <DurCtx.Provider value={6}>
          <S3Shift vpnFrom={0} blockAt={0} toggleAt={0} doorFrom={0} />
        </DurCtx.Provider>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(52% 16% at 50% 29%, rgba(60,120,255,${0.45 * k}), rgba(0,0,0,0) 100%)` }} />
      <Audio src={staticFile("ads/sout_audio.mp3")} volume={1} />
    </AbsoluteFill>
  );
};
