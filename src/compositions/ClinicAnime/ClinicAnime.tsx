import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { useAudioData } from "@remotion/media-utils";
import { Sfx } from "../../components/audio";
import { ez, MONT } from "../../pelmeni/kit";
import { LipSyncMouth } from "../AvitoWardrobe/LipSyncMouth";
import { speechEnergy, visemeOf } from "../AvitoWardrobe/useLipSync";
import { Arm, type ArmPose, Dima, GripHand, Leg, LINE, MouthCtx, OUT, SKIN, SKIN_SH } from "../AvitoWardrobe/rig";

/* «Аниме-битва в поликлинике»: бытовуха → битва → бытовуха → битва… — 60 с. */
export const CLINIC_FRAMES = 60 * 30;
const FLOOR = 1500;

type Who = "dima" | "bab1" | "bab2" | "nurse";
const VO: [string, Who, number, number, string, string[]][] = [
  ["q01", "bab1", 1.9, 1.49, "Кто последний к терапевту?", ["последний"]],
  ["q02", "dima", 3.6, 1.65, "Я.", ["я."]],
  ["q03", "bab1", 5.4, 1.88, "Ой, а я только спросить.", ["спросить."]],
  ["q04", "dima", 8.6, 1.99, "Я по записи! Десять пятнадцать!", ["записи!"]],
  ["q05", "bab1", 11.0, 2.35, "Техника! Я только спросить!", ["техника!"]],
  ["q06", "nurse", 17.6, 2.19, "Кто карточку забыл?", ["карточку"]],
  ["q07", "bab2", 21.5, 3.58, "Ой, девочки, мне только рецепт подписать. Я на минуточку.", ["минуточку."]],
  ["q08", "bab2", 26.4, 1.31, "Двойная техника!", ["двойная"]],
  ["q09", "bab1", 27.8, 1.23, "На минуточку!", ["минуточку!"]],
  ["q10", "dima", 29.5, 1.8, "Защита! Щит из бахил!", ["бахил!"]],
  ["q11", "dima", 38.0, 1.15, "Я тут постою.", ["постою."]],
  ["q12", "dima", 42.8, 2.32, "Ульта! Я! За вами! Занимал!", ["занимал!"]],
  ["q13", "bab1", 45.5, 2.27, "Контратака! Я ветеран очередей!", ["ветеран"]],
  ["q14", "nurse", 53.0, 2.09, "Терапевт ушёл на обед.", ["обед."]],
  ["q15", "dima", 55.6, 0.68, "Ну ладно.", []],
  ["q16", "bab1", 56.6, 1.93, "Подождём.", []],
];

/* ── биты: бытовуха / битва ── */
type Beat = { from: number; to: number; kind: "life" | "fight"; round?: string };
const BEATS: Beat[] = [
  { from: 0, to: 7.5, kind: "life" },
  { from: 7.5, to: 17, kind: "fight", round: "РАУНД 1" },
  { from: 17, to: 25.4, kind: "life" },
  { from: 25.4, to: 35, kind: "fight", round: "РАУНД 2" },
  { from: 35, to: 41.8, kind: "life" },
  { from: 41.8, to: 52, kind: "fight", round: "ФИНАЛЬНЫЙ РАУНД" },
  { from: 52, to: 60, kind: "life" },
];
/* кадры битвы: [от, до, кто в кадре, цвет ауры, подпись приёма] */
const SHOTS: [number, number, Who | "clash" | "beam" | "ult", string, string][] = [
  [7.5, 10.9, "dima", "#3aa0ff", "ТЕХНИКА: ТАЛОН НА 10:15!"],
  [10.9, 13.5, "bab1", "#ff3030", "ТЕХНИКА: Я ТОЛЬКО СПРОСИТЬ!"],
  [13.5, 17, "clash", "#ffffff", "СТОЛКНОВЕНИЕ!"],
  [25.4, 29.3, "beam", "#b040ff", "ДВОЙНАЯ ТЕХНИКА: НА МИНУТОЧКУ!"],
  [29.3, 35, "dima", "#3ad8ff", "ЩИТ ИЗ БАХИЛ!"],
  [41.8, 45.4, "ult", "#ffd23a", "УЛЬТА: Я ЗА ВАМИ ЗАНИМАЛ!"],
  [45.4, 48.1, "bab1", "#ff3030", "КОНТРАТАКА: ВЕТЕРАН ОЧЕРЕДЕЙ!"],
  [48.1, 52, "clash", "#ffffff", "НИЧЬЯ!"],
];
/** Карточки персонажей при первом появлении (аниме-приём): [время, имя, роль, цвет]. */
const INTROS: [number, string, string, string][] = [
  [1.9, "БАБА ВАЛЯ", "ВЕТЕРАН ОЧЕРЕДЕЙ · 40 ЛЕТ БЕЗ ТАЛОНА", "#ff5a5a"],
  [3.6, "ДИМА", "ТАЛОН НА 10:15 · ЕЩЁ ВЕРИТ В СИСТЕМУ", "#3aa0ff"],
  [17.5, "МЕДСЕСТРА", "ФИНАЛЬНЫЙ БОСС", "#f2f2f2"],
  [21.4, "БАБА ЗИНА", "«Я НА МИНУТОЧКУ» · РАНГ S", "#b05aff"],
];
const IMPACTS = [7.55, 8.7, 11.1, 14.0, 15.2, 25.45, 28.0, 31.5, 41.85, 48.2, 49.4];
const COUGH = 36.0;
const TELEPORT = 36.8;

/* ── бабушка: платок, очки, пальто с тенью, сумка; руки жестикулируют ── */
type GMode = "idle" | "talk" | "fight" | "walk";
const Grandma = ({ x, y, s = 1, t, coat, coatSh, scarf, viseme, mode, lean = 0 }: { x: number; y: number; s?: number; t: number; coat: string; coatSh: string; scarf: string; viseme: ReturnType<typeof visemeOf>; mode: GMode; lean?: number }) => {
  const br = 2 * Math.sin(t * 2.4);
  const step = mode === "walk" ? Math.sin(t * 12) : 0;
  const bag = (
    <g>
      <rect x={-34} y={0} width={68} height={56} rx={10} fill="#5a2a1a" {...OUT} />
      <path d="M-20 0 C-20 -26 20 -26 20 0" fill="none" stroke={LINE} strokeWidth={7} />
      <rect x={-10} y={18} width={20} height={10} rx={3} fill="#c9a24a" />
    </g>
  );
  const poseL: ArmPose = mode === "fight" ? { sh: 60, el: 80 } : { sh: 14 + step * 8, el: 20 };
  const poseR: ArmPose =
    mode === "talk" ? { sh: -40 - Math.sin(t * 7) * 18, el: -70 + Math.sin(t * 9) * 25 } : mode === "fight" ? { sh: -150, el: -20 } : { sh: -12 - step * 8, el: -30 };
  const arms = (pass: "out" | "fill") => (
    <>
      <Arm sx={-58} sy={-430} up={110} fo={100} w={30} color={SKIN} sleeve={{ color: coat, len: 190 }} pose={poseL} pass={pass} hand={(wx, wy) => <GripHand x={wx} y={wy} item={mode === "fight" ? undefined : bag} itemRot={-(poseL.sh + poseL.el)} />} />
      <Arm sx={58} sy={-430} up={110} fo={100} w={30} color={SKIN} sleeve={{ color: coat, len: 190 }} pose={poseR} pass={pass} hand={(wx, wy) => <GripHand x={wx} y={wy} point={mode === "talk"} />} />
    </>
  );
  return (
    <g transform={`translate(${x} ${y}) rotate(${lean}) scale(${s})`}>
      <ellipse cx={0} cy={0} rx={100} ry={14} fill="#000" opacity={0.3} />
      {[-1, 1].map((d) => <Leg key={`o${d}`} hx={d * 24} hy={-230} kx={d * 26 + d * step * 10} ky={-110} fx={d * 30 + d * step * 14} w={34} color="#6b5a4a" pass="out" />)}
      {[-1, 1].map((d) => <Leg key={`f${d}`} hx={d * 24} hy={-230} kx={d * 26 + d * step * 10} ky={-110} fx={d * 30 + d * step * 14} w={34} color="#6b5a4a" pass="fill" />)}
      {[-1, 1].map((d) => <path key={d} d={`M${d * 30 + d * step * 14 - 28} 0 C${d * 30 - 28} -28 ${d * 30 + 26} -30 ${d * 30 + d * step * 14 + 30} 0 Z`} fill="#2a2a2e" {...OUT} />)}
      <g transform={`translate(0 ${-br})`}>
        <g transform={`rotate(${mode === "talk" ? Math.sin(t * 6) * 4 : 0} 0 -450)`}>
          <rect x={-14} y={-480} width={28} height={40} fill={SKIN_SH} {...OUT} />
          <ellipse cx={0} cy={-540} rx={62} ry={68} fill={SKIN} {...OUT} />
          <path d="M30 -596 C60 -570 62 -520 44 -486 C52 -520 50 -560 30 -596 Z" fill={SKIN_SH} opacity={0.6} />
          <path d="M-74 -530 C-80 -640 80 -640 74 -530 C66 -580 -66 -580 -74 -530 Z" fill={scarf} {...OUT} />
          <path d="M-74 -530 C-70 -490 -40 -470 -10 -470 M74 -530 C70 -490 40 -470 10 -470" fill="none" stroke={scarf} strokeWidth={14} />
          <path d="M-12 -472 l-20 26 l26 -6 Z M12 -472 l20 26 l-26 -6 Z" fill={scarf} {...OUT} strokeWidth={3} />
          {[[-30, -600], [10, -612], [40, -592], [-50, -575]].map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r={7} fill="#fff4a8" stroke={LINE} strokeWidth={1.5} />)}
          {[-1, 1].map((d) => (
            <g key={d}>
              <circle cx={d * 24} cy={-548} r={17} fill="#ffffff" {...OUT} strokeWidth={4} />
              <circle cx={d * 24} cy={-546} r={5} fill="#1a1a1a" />
              <path d={`M${d * 44} -520 q${d * 8} 4 ${d * 12} -2 M${d * 46} -508 q${d * 6} 3 ${d * 10} -1`} stroke={SKIN_SH} strokeWidth={3} fill="none" />
            </g>
          ))}
          <path d="M-7 -548 H7" stroke={LINE} strokeWidth={4} />
          <path d="M0 -540 q-8 18 4 22" stroke={LINE} strokeWidth={3} fill="none" />
          <path d={mode === "fight" ? "M-38 -582 L-12 -566 M38 -582 L12 -566" : "M-36 -578 L-12 -572 M36 -578 L12 -572"} stroke="#8a7a6a" strokeWidth={6} strokeLinecap="round" />
          <LipSyncMouth viseme={viseme} variant="dima" x={0} y={-500} />
        </g>
        <path d="M-74 -200 L-80 -400 C-80 -440 -40 -462 0 -462 C40 -462 80 -440 80 -400 L74 -200 Z" fill={coat} {...OUT} />
        <path d="M40 -455 C70 -440 80 -410 76 -200 L56 -200 C62 -300 60 -400 40 -455 Z" fill={coatSh} opacity={0.8} />
        <path d="M-40 -460 L0 -400 L40 -460" fill="none" stroke={coatSh} strokeWidth={6} />
        {[-380, -320, -260].map((by) => <circle key={by} cx={0} cy={by} r={7} fill="#2a2a2e" />)}
        {arms("out")}
        {arms("fill")}
      </g>
    </g>
  );
};

/** Коридор поликлиники. */
const Hall = ({ doorOpen, closed }: { doorOpen: number; closed: boolean }) => (
  <g>
    <rect width={1080} height={1920} fill="#f2ecd8" />
    <rect y={900} width={1080} height={FLOOR - 900} fill="#9cc7a8" />
    <rect y={890} width={1080} height={16} fill="#6fa182" />
    <rect y={FLOOR} width={1080} height={1920 - FLOOR} fill="#c9c2b0" />
    {Array.from({ length: 8 }, (_, i) => <line key={i} x1={i * 160} y1={FLOOR} x2={i * 160 - 120} y2={1920} stroke="#a9a28f" strokeWidth={4} />)}
    <rect x={720} y={680} width={300} height={FLOOR - 680} fill="#2b2b30" {...OUT} />
    <rect x={720} y={680} width={300} height={FLOOR - 680} fill="#fff8d8" opacity={doorOpen} />
    <g transform={`translate(720 0) scale(${1 - doorOpen * 0.85} 1) translate(-720 0)`}>
      <rect x={720} y={680} width={300} height={FLOOR - 680} fill="#d9d2c0" {...OUT} />
      <rect x={760} y={720} width={220} height={130} fill="#ffffff" {...OUT} />
      <text x={870} y={772} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={30} fill="#111">ТЕРАПЕВТ</text>
      <text x={870} y={826} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={44} fill="#c0392b">12</text>
      <circle cx={980} cy={1110} r={12} fill="#888" {...OUT} />
      {closed && (
        <g>
          <rect x={750} y={900} width={240} height={90} fill="#fff" {...OUT} />
          <text x={870} y={958} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={30} fill="#c0392b">ОБЕД</text>
        </g>
      )}
    </g>
    <rect x={120} y={360} width={360} height={150} rx={12} fill="#111" {...OUT} />
    <text x={300} y={455} textAnchor="middle" fontFamily='"Courier New", monospace' fontWeight={900} fontSize={60} fill="#ff4a2a">А-015 → 12</text>
    <rect x={560} y={330} width={200} height={260} fill="#fff" {...OUT} />
    <text x={660} y={420} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={30} fill="#1a6fd6">МОЙТЕ</text>
    <text x={660} y={460} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={30} fill="#1a6fd6">РУКИ</text>
    <rect x={40} y={1260} width={460} height={40} rx={8} fill="#8a5a36" {...OUT} />
    {[80, 460].map((lx) => <rect key={lx} x={lx} y={1300} width={20} height={200} fill="#555" {...OUT} />)}
  </g>
);

/** Аниме-фон битвы: радиальный градиент цвета ауры + спидлайны. */
const FightBG = ({ color, t }: { color: string; t: number }) => (
  <g>
    <defs>
      <radialGradient id={`fbg${color.slice(1)}`}>
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="35%" stopColor={color} />
        <stop offset="100%" stopColor="#0a0a14" />
      </radialGradient>
    </defs>
    <rect width={1080} height={1920} fill={`url(#fbg${color.slice(1)})`} />
    {Array.from({ length: 44 }, (_, i) => {
      const a = (i / 44) * Math.PI * 2 + Math.sin(t * 40 + i) * 0.02;
      const r1 = 380 + ((i * 53) % 160);
      return <path key={i} d={`M${540 + Math.cos(a) * r1} ${960 + Math.sin(a) * r1} L${540 + Math.cos(a - 0.01) * 1700} ${960 + Math.sin(a - 0.01) * 1700} L${540 + Math.cos(a + 0.01) * 1700} ${960 + Math.sin(a + 0.01) * 1700} Z`} fill="#fff" opacity={0.75} />;
    })}
  </g>
);

const Subs = ({ t }: { t: number }) => {
  for (const [, , at, dur, text, keys] of VO) {
    if (t < at || t > at + dur + 0.1) continue;
    const words = text.split(" ");
    const groups: string[][] = [];
    for (let i = 0; i < words.length; i += 3) groups.push(words.slice(i, i + 3));
    const g = groups[Math.min(groups.length - 1, Math.floor(((t - at) / dur) * groups.length))];
    return (
      <AbsoluteFill style={{ alignItems: "center", pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: 1640, width: 980, textAlign: "center", fontFamily: MONT, fontWeight: 900, fontSize: 70, textTransform: "uppercase", color: "#fff", WebkitTextStroke: "14px #000", paintOrder: "stroke fill" }}>
          {g.map((w, i) => <span key={i} style={{ color: keys.includes(w.toLowerCase()) ? "#ffd23a" : "#fff" }}>{w}{i < g.length - 1 ? " " : ""}</span>)}
        </div>
      </AbsoluteFill>
    );
  }
  return null;
};

const ticket = (
  <g>
    <rect x={-34} y={-46} width={68} height={52} rx={4} fill="#fff" {...OUT} />
    <text x={0} y={-12} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={16} fill="#111">10:15</text>
  </g>
);

export const ClinicAnime = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const audio = VO.map(([k]) => useAudioData(staticFile(`audio/clinic/${k}.mp3`)));
  const energy: Record<Who, number> = { dima: 0, bab1: 0, bab2: 0, nurse: 0 };
  VO.forEach(([, who, at, dur], i) => {
    if (t >= at && t < at + dur) energy[who] = speechEnergy(audio[i], f - Math.round(at * 30), 30);
  });
  const beat = BEATS.find((b) => t >= b.from && t < b.to) ?? BEATS[BEATS.length - 1];
  const shot = beat.kind === "fight" ? SHOTS.find(([a, b]) => t >= a && t < b) : undefined;
  const impact = IMPACTS.some((a) => t >= a && t < a + 0.1);
  const talking = (w: Who) => energy[w] > 0.02;
  // бытовые позиции: бабушки раздельно, телепорт после кашля
  const tp = t >= TELEPORT && t < 52;
  const dimaX = tp ? 150 : 280;
  const b1x = t < 1.8 ? ez(t, 0.3, 1.8, 1200, 620) : tp ? 560 : 620;
  const b2x = t < 21.4 ? ez(t, 20.0, 21.4, 1250, 900) : tp ? 960 : 900;
  const doorOpen = ez(t, 17.3, 17.6) * (1 - ez(t, 20, 20.3)) + ez(t, 52.5, 52.8) * (1 - ez(t, 55.5, 55.8));
  const nurseIn = (t > 17.4 && t < 20.1) || (t > 52.6 && t < 55.6);
  const b1mode: GMode = t < 1.8 ? "walk" : talking("bab1") ? "talk" : "idle";
  const b2mode: GMode = t >= 20 && t < 21.4 ? "walk" : talking("bab2") ? "talk" : "idle";
  const shake = shot ? `translate(${Math.sin(t * 60) * 7} ${Math.cos(t * 50) * 6})` : "";

  const aura = (c: string) => `drop-shadow(0 0 ${20 + Math.sin(t * 30) * 8}px ${c}) drop-shadow(0 0 46px ${c})`;
  let world: React.ReactNode;
  if (!shot) {
    world = (
      <g>
        <Hall doorOpen={doorOpen} closed={t > 55.5} />
        {nurseIn && (
          <g transform="translate(950 1060)">
            <rect x={-50} y={-10} width={100} height={200} fill="#ffffff" {...OUT} />
            <ellipse cx={0} cy={-60} rx={50} ry={56} fill={SKIN} {...OUT} />
            <path d="M-46 -96 H46 V-120 H-46 Z" fill="#fff" {...OUT} />
            <path d="M-8 -116 h16 M0 -124 v16" stroke="#e33" strokeWidth={5} />
            {[-1, 1].map((d) => <path key={d} d={`M${d * 22 - 10} -66 h20`} stroke={LINE} strokeWidth={5} />)}
            <LipSyncMouth viseme={visemeOf(energy.nurse)} variant="dima" x={0} y={-30} />
          </g>
        )}
        {t >= 20 && <Grandma x={b2x} y={FLOOR} s={0.95} t={t} coat="#7a4a8a" coatSh="#5a3268" scarf="#2a6fd6" viseme={visemeOf(energy.bab2)} mode={b2mode} />}
        <Grandma x={b1x} y={FLOOR} s={0.95} t={t} coat="#8a5a3a" coatSh="#6a4026" scarf="#d23a3a" viseme={visemeOf(energy.bab1)} mode={b1mode} />
        <Dima x={dimaX} y={FLOOR} s={1.0} t={t} pose={{ armL: { sh: 8, el: 0 }, armR: { sh: -30, el: -95 }, itemR: ticket, head: talking("dima") ? 2 : 0 }} />
        {t >= TELEPORT - 0.1 && t < TELEPORT + 0.5 && [150, 560, 960].map((px) => <circle key={px} cx={px} cy={FLOOR - 60} r={ez(t, TELEPORT - 0.1, TELEPORT + 0.5, 20, 140)} fill="#ffffff" opacity={1 - ez(t, TELEPORT, TELEPORT + 0.5)} />)}
        {t >= COUGH && t < COUGH + 1.2 && <text x={1000} y={760} textAnchor="end" fontFamily={MONT} fontWeight={900} fontSize={80} fill="#fff" stroke={LINE} strokeWidth={8} paintOrder="stroke" transform="rotate(-8 1000 760)">КХЕ-КХЕ!</text>}
      </g>
    );
  } else {
    const [, , who, color] = shot;
    const dimaFight = (pose: "fist" | "shield" | "ult") => (
      <Dima x={540} y={2050} s={1.85} t={t} pose={{ armL: pose === "shield" ? { sh: 70, el: 40 } : { sh: 30, el: 60 }, armR: pose === "ult" ? { sh: -165, el: -5 } : pose === "shield" ? { sh: -70, el: -40 } : { sh: -100, el: -60 }, lid: 0.3, head: -4 }} />
    );
    world = (
      <g>
        <FightBG color={color} t={t} />
        {who === "dima" && <g style={{ filter: aura(color) }}>{dimaFight(t >= 29.3 ? "shield" : "fist")}</g>}
        {who === "dima" && t >= 29.6 && (
          <g opacity={ez(t, 29.6, 29.9)}>
            <ellipse cx={540} cy={1000} rx={430} ry={520} fill="rgba(80,200,255,.25)" stroke="#9fe8ff" strokeWidth={10} />
            <path d="M440 1000 C440 930 640 930 640 1000 C640 1060 440 1060 440 1000 Z" fill="#5ab8ff" stroke="#fff" strokeWidth={6} />
            <text x={540} y={1150} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={50} fill="#fff" stroke="#1a6fd6" strokeWidth={6} paintOrder="stroke">БАХИЛЫ</text>
          </g>
        )}
        {who === "ult" && <g style={{ filter: aura(color) }}>{dimaFight("ult")}</g>}
        {who === "bab1" && (
          <g style={{ filter: aura(color) }}>
            <Grandma x={540} y={2000} s={1.9} t={t} coat="#8a5a3a" coatSh="#6a4026" scarf="#d23a3a" viseme={visemeOf(energy.bab1)} mode="fight" />
          </g>
        )}
        {who === "beam" && (
          <g>
            <g style={{ filter: aura("#b040ff") }}>
              <Grandma x={330} y={1750} s={1.25} t={t} coat="#8a5a3a" coatSh="#6a4026" scarf="#d23a3a" viseme={visemeOf(energy.bab1)} mode="fight" />
              <Grandma x={760} y={1750} s={1.25} t={t} coat="#7a4a8a" coatSh="#5a3268" scarf="#2a6fd6" viseme={visemeOf(energy.bab2)} mode="fight" />
            </g>
            {t >= 28.0 && <rect x={0} y={520} width={1080} height={160 + Math.sin(t * 40) * 20} fill="#e8b0ff" opacity={0.85} style={{ filter: "blur(6px)" }} />}
          </g>
        )}
        {who === "clash" && (
          <g>
            <g style={{ filter: aura("#3aa0ff") }}>
              <Dima x={240} y={1850} s={1.25} t={t} pose={{ armL: { sh: 20, el: 40 }, armR: { sh: -100, el: -10 }, lid: 0.3 }} />
            </g>
            <g style={{ filter: aura("#ff3030") }}>
              <Grandma x={840} y={1850} s={1.25} t={t} coat="#8a5a3a" coatSh="#6a4026" scarf="#d23a3a" viseme="closed" mode="fight" />
            </g>
            <circle cx={540} cy={1050} r={140 + Math.sin(t * 30) * 30} fill="#ffffff" style={{ filter: "blur(10px)" }} />
          </g>
        )}
      </g>
    );
  }
  const flashIn = BEATS.some((b) => b.kind === "fight" && t >= b.from && t < b.from + 0.25);
  return (
    <AbsoluteFill style={{ background: "#000", filter: impact ? "invert(1) contrast(1.4)" : undefined }}>
      <Sfx at={0} name="clinic/ambience" vol={(fr) => (BEATS.find((b) => fr / 30 >= b.from && fr / 30 < b.to)?.kind === "fight" ? 0.05 : 0.25)} loop />
      {BEATS.filter((b) => b.kind === "fight").map((b) => <Sfx key={b.from} at={b.from - 0.05} name="clinic/flash" vol={0.7} />)}
      {IMPACTS.map((a) => <Sfx key={a} at={a - 0.02} name="clinic/impact" vol={0.75} />)}
      <Sfx at={8.4} name="clinic/aura" vol={0.4} />
      <Sfx at={10.8} name="clinic/dash" vol={0.6} />
      <Sfx at={27.9} name="clinic/beam" vol={0.7} />
      <Sfx at={29.6} name="clinic/shield" vol={0.7} />
      <Sfx at={42.6} name="clinic/aura" vol={0.6} />
      <Sfx at={43.2} name="clinic/choir" vol={0.55} />
      <Sfx at={COUGH} name="clinic/cough" vol={0.8} />
      <Sfx at={TELEPORT - 0.05} name="clinic/teleport" vol={0.7} />
      <Sfx at={17.3} name="clinic/door" vol={0.5} />
      <Sfx at={52.5} name="clinic/door" vol={0.5} />
      {VO.map(([k, , at]) => <Sfx key={k} at={at} name={`clinic/${k}`} vol={1.15} />)}
      <MouthCtx.Provider value={{ dima: energy.dima, nuance: 0 }}>
        <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
          <g transform={shake}>{world}</g>
        </svg>
      </MouthCtx.Provider>
      {flashIn && <AbsoluteFill style={{ background: "#fff", opacity: 0.9 }} />}
      {/* титры */}
      {t < 1.8 && (
        <AbsoluteFill style={{ alignItems: "center" }}>
          {/* аниме-опенинг: катакана + название серии */}
          <div style={{ position: "absolute", top: 180, fontFamily: MONT, fontWeight: 900, fontSize: 96, color: "#ff3030", WebkitTextStroke: "6px #111", paintOrder: "stroke fill", transform: `rotate(-4deg) scale(${ez(t, 0, 0.25, 1.8, 1)})` }}>ポリクリニカ</div>
          <div style={{ position: "absolute", top: 330, padding: "12px 30px", background: "#111", color: "#fff", fontFamily: MONT, fontWeight: 900, fontSize: 44, whiteSpace: "nowrap", transform: "rotate(-4deg)", border: "5px solid #ffd23a" }}>ПОЛИКЛИНИКА: ПОСЛЕДНИЙ ТАЛОН</div>
        </AbsoluteFill>
      )}
      {INTROS.map(([a, name, role, color]) =>
        t >= a && t < a + 1.6 ? (
          <AbsoluteFill key={name} style={{ pointerEvents: "none" }}>
            <div style={{ position: "absolute", left: -40, right: -40, top: 1340, padding: "12px 80px", background: color, transform: `rotate(-5deg) translateX(${(1 - ez(t, a, a + 0.2)) * -1100}px)`, borderTop: "6px solid #111", borderBottom: "6px solid #111" }}>
              <div style={{ fontFamily: MONT, fontWeight: 900, fontSize: 64, color: "#fff", WebkitTextStroke: "4px #111", paintOrder: "stroke fill" }}>{name}</div>
              <div style={{ fontFamily: MONT, fontWeight: 800, fontSize: 36, color: "#111" }}>{role}</div>
            </div>
          </AbsoluteFill>
        ) : null
      )}
      {beat.kind === "fight" && beat.round && t < beat.from + 1.1 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontFamily: MONT, fontWeight: 900, fontSize: 120, color: "#fff", WebkitTextStroke: "12px #111", paintOrder: "stroke fill", transform: `rotate(-6deg) scale(${ez(t, beat.from, beat.from + 0.2, 2, 1)})` }}>{beat.round}</div>
        </AbsoluteFill>
      )}
      {shot && t >= shot[0] + (shot[0] === beat.from ? 1.1 : 0) && (
        <AbsoluteFill style={{ alignItems: "center" }}>
          <div style={{ position: "absolute", top: 220, width: 960, textAlign: "center", fontFamily: MONT, fontWeight: 900, fontSize: shot[4].length > 24 ? 62 : 76, color: "#fff", WebkitTextStroke: `10px ${shot[3] === "#ffffff" ? "#111" : shot[3]}`, paintOrder: "stroke fill", transform: `rotate(-6deg) scale(${ez(t, shot[0], shot[0] + 0.15, 1.6, 1)})`, textShadow: "6px 6px 0 #000" }}>{shot[4]}</div>
        </AbsoluteFill>
      )}
      {t > 57 && (
        <AbsoluteFill style={{ alignItems: "center" }}>
          <div style={{ position: "absolute", top: 240, padding: "16px 36px", background: "#111", color: "#ffd23a", fontFamily: MONT, fontWeight: 900, fontSize: 60, transform: `rotate(-3deg) scale(${ez(t, 57, 57.3, 0.6, 1)})`, border: "6px solid #fff" }}>РАУНД 3 — ПОСЛЕ ОБЕДА</div>
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{ background: "radial-gradient(85% 62% at 50% 46%, rgba(0,0,0,0) 60%, rgba(0,0,0,.45) 100%)", pointerEvents: "none" }} />
      <Subs t={t} />
    </AbsoluteFill>
  );
};
