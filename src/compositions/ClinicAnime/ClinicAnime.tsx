import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { useAudioData } from "@remotion/media-utils";
import { Sfx } from "../../components/audio";
import { ez, MONT } from "../../pelmeni/kit";
import { LipSyncMouth } from "../AvitoWardrobe/LipSyncMouth";
import { speechEnergy, visemeOf } from "../AvitoWardrobe/useLipSync";
import { Arm, Dima, GripHand, Leg, LINE, MouthCtx, OUT, SKIN, SKIN_SH } from "../AvitoWardrobe/rig";

/* «Аниме-битва в реальной жизни: очередь в поликлинике» — пародия-экшн, 30 с. */
export const CLINIC_FRAMES = 30 * 30;
const FLOOR = 1500;

type Who = "narr" | "dima" | "bab1" | "bab2" | "nurse";
const VO: [string, Who, number, number, string, string[]][] = [
  ["c1", "narr", 0.4, 3.68, "Поликлиника номер четыре. Здесь выживают сильнейшие.", ["сильнейшие."]],
  ["c2", "dima", 4.6, 2.06, "Я по записи. На десять пятнадцать.", ["записи."]],
  ["c3", "bab1", 8.4, 1.54, "Я только спросить!", ["спросить!"]],
  ["c4", "bab2", 12.9, 2.04, "А мне только рецепт подписать!", ["рецепт"]],
  ["c5", "dima", 17.6, 3.24, "Я… за вами… занимал!", ["занимал!"]],
  ["c6", "nurse", 22.6, 1.7, "Следующий!", ["следующий!"]],
  ["c7", "narr", 26.2, 2.38, "Очередь… непобедима.", ["непобедима."]],
];
/* приёмы: [начало, конец, подпись, цвет ауры, кто] */
const MOVES: [number, number, string, string, Who][] = [
  [4.9, 7.6, "ТЕХНИКА: ТАЛОН НА 10:15!", "#3aa0ff", "dima"],
  [8.4, 12.2, "ТЕХНИКА: Я ТОЛЬКО СПРОСИТЬ!", "#ff3030", "bab1"],
  [12.9, 16.6, "ДВОЙНАЯ ТЕХНИКА: РЕЦЕПТ ПОДПИСАТЬ!", "#b040ff", "bab2"],
  [18.0, 21.6, "УЛЬТА: Я ЗА ВАМИ ЗАНИМАЛ!", "#ffd23a", "dima"],
];
const IMPACTS = [4.9, 8.4, 12.9, 20.9];
const BAB1_DASH = 10.2;
const DOOR_OPEN = 22.2;
const RUSH = 23.8;
const SLAM = 24.8;

/** Бабушка: платок, очки, пальто, сумка. Иерархия: ноги → тело → голова (rotate у шеи) / руки (кости). */
const Grandma = ({ x, y, s = 1, t, coat, scarf, viseme, lean = 0 }: { x: number; y: number; s?: number; t: number; coat: string; scarf: string; viseme: ReturnType<typeof visemeOf>; lean?: number }) => {
  const br = 2 * Math.sin(t * 2.4);
  const bag = (
    <g>
      <rect x={-34} y={0} width={68} height={56} rx={10} fill="#5a2a1a" {...OUT} />
      <path d="M-20 0 C-20 -26 20 -26 20 0" fill="none" stroke={LINE} strokeWidth={7} />
    </g>
  );
  const arms = (pass: "out" | "fill") => (
    <>
      <Arm sx={-58} sy={-430} up={110} fo={100} w={30} color={SKIN} sleeve={{ color: coat, len: 190 }} pose={{ sh: 14, el: 20 }} pass={pass} hand={(wx, wy) => <GripHand x={wx} y={wy} item={bag} itemRot={-34} />} />
      <Arm sx={58} sy={-430} up={110} fo={100} w={30} color={SKIN} sleeve={{ color: coat, len: 190 }} pose={{ sh: -12, el: -30 }} pass={pass} hand={(wx, wy) => <GripHand x={wx} y={wy} />} />
    </>
  );
  return (
    <g transform={`translate(${x} ${y}) rotate(${lean}) scale(${s})`}>
      <ellipse cx={0} cy={0} rx={100} ry={14} fill="#000" opacity={0.3} />
      {[-1, 1].map((d) => <Leg key={`o${d}`} hx={d * 24} hy={-230} kx={d * 26} ky={-110} fx={d * 30} w={34} color="#6b5a4a" pass="out" />)}
      {[-1, 1].map((d) => <Leg key={`f${d}`} hx={d * 24} hy={-230} kx={d * 26} ky={-110} fx={d * 30} w={34} color="#6b5a4a" pass="fill" />)}
      {[-1, 1].map((d) => <path key={d} d={`M${d * 30 - 28} 0 C${d * 30 - 28} -28 ${d * 30 + 26} -30 ${d * 30 + 30} 0 Z`} fill="#2a2a2e" {...OUT} />)}
      <g transform={`translate(0 ${-br})`}>
        <g transform="rotate(0 0 -450)">
          <rect x={-14} y={-480} width={28} height={40} fill={SKIN_SH} {...OUT} />
          <ellipse cx={0} cy={-540} rx={62} ry={68} fill={SKIN} {...OUT} />
          {/* платок с узлом под подбородком */}
          <path d="M-74 -530 C-80 -640 80 -640 74 -530 C66 -580 -66 -580 -74 -530 Z" fill={scarf} {...OUT} />
          <path d="M-74 -530 C-70 -490 -40 -470 -10 -470 M74 -530 C70 -490 40 -470 10 -470" fill="none" stroke={scarf} strokeWidth={14} />
          <path d="M-12 -472 l-20 26 l26 -6 Z M12 -472 l20 26 l-26 -6 Z" fill={scarf} {...OUT} strokeWidth={3} />
          {[[-30, -600], [10, -612], [40, -592]].map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r={7} fill="#fff4a8" />)}
          {/* очки и морщинки */}
          {[-1, 1].map((d) => (
            <g key={d}>
              <circle cx={d * 24} cy={-548} r={17} fill="#ffffff" {...OUT} strokeWidth={4} />
              <circle cx={d * 24} cy={-546} r={5} fill="#1a1a1a" />
              <path d={`M${d * 44} -520 q${d * 8} 4 ${d * 12} -2`} stroke={SKIN_SH} strokeWidth={3} fill="none" />
            </g>
          ))}
          <path d="M-7 -548 H7" stroke={LINE} strokeWidth={4} />
          <path d="M-36 -578 L-12 -570 M36 -578 L12 -570" stroke="#8a7a6a" strokeWidth={6} strokeLinecap="round" />
          <LipSyncMouth viseme={viseme} variant="dima" x={0} y={-500} />
        </g>
        <path d="M-74 -200 L-80 -400 C-80 -440 -40 -462 0 -462 C40 -462 80 -440 80 -400 L74 -200 Z" fill={coat} {...OUT} />
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
    {/* дверь терапевта */}
    <rect x={700} y={680} width={300} height={FLOOR - 680} fill="#2b2b30" {...OUT} />
    <rect x={700} y={680} width={300} height={FLOOR - 680} fill="#fff8d8" opacity={doorOpen} />
    <g transform={`translate(700 0) scale(${1 - doorOpen * 0.85} 1) translate(-700 0)`}>
      <rect x={700} y={680} width={300} height={FLOOR - 680} fill="#d9d2c0" {...OUT} />
      <rect x={740} y={720} width={220} height={130} fill="#ffffff" {...OUT} />
      <text x={850} y={772} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={30} fill="#111">ТЕРАПЕВТ</text>
      <text x={850} y={826} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={44} fill="#c0392b">12</text>
      <circle cx={960} cy={1110} r={12} fill="#888" {...OUT} />
      {closed && (
        <g>
          <rect x={730} y={900} width={240} height={90} fill="#fff" {...OUT} />
          <text x={850} y={958} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={26} fill="#c0392b">ПРИЁМ ОКОНЧЕН</text>
        </g>
      )}
    </g>
    {/* табло талонов и плакат */}
    <rect x={120} y={360} width={360} height={150} rx={12} fill="#111" {...OUT} />
    <text x={300} y={455} textAnchor="middle" fontFamily='"Courier New", monospace' fontWeight={900} fontSize={60} fill="#ff4a2a">А-015 → 12</text>
    <rect x={560} y={330} width={200} height={260} fill="#fff" {...OUT} />
    <text x={660} y={420} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={30} fill="#1a6fd6">МОЙТЕ</text>
    <text x={660} y={460} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={30} fill="#1a6fd6">РУКИ</text>
    <rect x={40} y={1260} width={460} height={40} rx={8} fill="#8a5a36" {...OUT} />
    {[80, 460].map((lx) => <rect key={lx} x={lx} y={1300} width={20} height={200} fill="#555" {...OUT} />)}
  </g>
);

/** Аниме-спидлайны вокруг точки. */
const SpeedLines = ({ cx, cy, t, k }: { cx: number; cy: number; t: number; k: number }) => (
  <g opacity={k}>
    {Array.from({ length: 36 }, (_, i) => {
      const a = (i / 36) * Math.PI * 2 + Math.sin(t * 40 + i) * 0.03;
      const r1 = 330 + ((i * 53) % 120);
      return <path key={i} d={`M${cx + Math.cos(a) * r1} ${cy + Math.sin(a) * r1} L${cx + Math.cos(a - 0.012) * 1600} ${cy + Math.sin(a - 0.012) * 1600} L${cx + Math.cos(a + 0.012) * 1600} ${cy + Math.sin(a + 0.012) * 1600} Z`} fill="#fff" opacity={0.85} />;
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

export const ClinicAnime = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const audio = VO.map(([k]) => useAudioData(staticFile(`audio/clinic/${k}.mp3`)));
  const energy: Record<Who, number> = { narr: 0, dima: 0, bab1: 0, bab2: 0, nurse: 0 };
  VO.forEach(([, who, at, dur], i) => {
    if (t >= at && t < at + dur) energy[who] = speechEnergy(audio[i], f - Math.round(at * 30), 30);
  });
  const move = MOVES.find(([a, b]) => t >= a && t < b);
  const impact = IMPACTS.some((a) => t >= a && t < a + 0.1);
  const doorOpen = ez(t, DOOR_OPEN, DOOR_OPEN + 0.3) * (1 - ez(t, SLAM, SLAM + 0.12));
  // позиции: бабушка 1 рвётся к двери, потом обе забегают внутрь
  const b1x = t < BAB1_DASH ? 640 : t < RUSH ? 760 : 760 + ez(t, RUSH, RUSH + 0.4, 0, 200);
  const b2in = ez(t, 12.4, 12.9);
  const b2x = t < RUSH ? 1180 - b2in * 330 : 850 + ez(t, RUSH, RUSH + 0.4, 0, 200);
  const gone = t >= SLAM;
  // камера: зум на говорящего
  const focus: [number, number, number] =
    t < 4.3 ? [540, 1000, ez(t, 0, 4.3, 1.25, 1)] : t < 8 ? [300, 1050, 1.45] : t < 12.5 ? [b1x, 1100, 1.5] : t < 17 ? [780, 1100, 1.3] : t < 22 ? [300, 1050, 1.6 + ez(t, 17, 21, 0, 0.3)] : t < 25.5 ? [560, 1050, 1.0] : [420, 1050, 1.3];
  const z = focus[2];
  // камера не выходит за край коридора (без чёрных полос)
  const fx = Math.min(1080 - 540 / z, Math.max(540 / z, focus[0]));
  const fy = Math.min(1920 - 960 / z, Math.max(960 / z, focus[1]));
  const shake = move && move[4] !== "narr" ? `translate(${Math.sin(t * 60) * 6} ${Math.cos(t * 50) * 5})` : "";
  const auraOf = (who: Who) => (move && (move[4] === who || (move[4] === "bab2" && who === "bab1")) ? move[3] : null);
  const aura = (who: Who) => {
    const c = auraOf(who);
    return c ? `drop-shadow(0 0 ${18 + Math.sin(t * 30) * 8}px ${c}) drop-shadow(0 0 40px ${c})` : "none";
  };
  return (
    <AbsoluteFill style={{ background: "#000", filter: impact ? "invert(1) contrast(1.4)" : undefined }}>
      <Sfx at={0} name="clinic/ambience" vol={0.25} loop />
      {IMPACTS.map((a) => <Sfx key={a} at={a - 0.02} name="clinic/impact" vol={0.8} />)}
      <Sfx at={4.7} name="clinic/aura" vol={0.45} />
      <Sfx at={17.4} name="clinic/aura" vol={0.6} />
      <Sfx at={18.2} name="clinic/choir" vol={0.55} />
      <Sfx at={BAB1_DASH - 0.05} name="clinic/dash" vol={0.7} />
      <Sfx at={RUSH - 0.05} name="clinic/dash" vol={0.7} />
      <Sfx at={DOOR_OPEN - 0.05} name="clinic/door" vol={0.7} />
      {VO.map(([k, , at]) => <Sfx key={k} at={at} name={`clinic/${k}`} vol={1.15} />)}
      <MouthCtx.Provider value={{ dima: energy.dima, nuance: 0 }}>
        <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
          <g transform={`${shake} translate(540 960) scale(${z}) translate(${-fx} ${-fy})`}>
            <Hall doorOpen={doorOpen} closed={t > 25.5} />
            {move && <SpeedLines cx={move[4] === "dima" ? 300 : b1x} cy={1050} t={t} k={0.55} />}
            {/* медсестра в проёме */}
            {doorOpen > 0.3 && !gone && (
              <g transform="translate(930 1060)">
                <rect x={-50} y={-10} width={100} height={200} fill="#ffffff" {...OUT} />
                <ellipse cx={0} cy={-60} rx={50} ry={56} fill={SKIN} {...OUT} />
                <path d="M-46 -96 H46 V-120 H-46 Z" fill="#fff" {...OUT} />
                <path d="M-8 -116 h16 M0 -124 v16" stroke="#e33" strokeWidth={5} />
                {[-1, 1].map((d) => <path key={d} d={`M${d * 22 - 10} -66 h20`} stroke={LINE} strokeWidth={5} />)}
                <LipSyncMouth viseme={visemeOf(energy.nurse)} variant="dima" x={0} y={-30} />
              </g>
            )}
            {!gone && (
              <g style={{ filter: aura("bab2") }}>
                <Grandma x={b2x} y={FLOOR} s={0.95} t={t} coat="#7a4a8a" scarf="#2a6fd6" viseme={visemeOf(energy.bab2)} lean={t >= RUSH ? 10 : 0} />
              </g>
            )}
            {!gone && (
              <g style={{ filter: aura("bab1") }}>
                <Grandma x={b1x} y={FLOOR} s={0.95} t={t} coat="#8a5a3a" scarf="#d23a3a" viseme={visemeOf(energy.bab1)} lean={t >= BAB1_DASH && t < BAB1_DASH + 0.4 ? 14 : t >= RUSH ? 10 : 0} />
              </g>
            )}
            <g style={{ filter: aura("dima") }}>
              <Dima x={300} y={FLOOR} s={1.0} t={t} pose={{ armL: { sh: 8, el: 0 }, armR: t >= 17.5 && t < 22 ? { sh: -140, el: -10 } : { sh: -30, el: -95 }, itemR: (
                <g>
                  <rect x={-34} y={-46} width={68} height={52} rx={4} fill="#fff" {...OUT} />
                  <text x={0} y={-12} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={16} fill="#111">10:15</text>
                </g>
              ), head: t > 25.5 ? 8 : 0, lid: t > 25.5 ? 0.7 : 0.55 }} />
            </g>
          </g>
        </svg>
      </MouthCtx.Provider>
      {/* титры */}
      {t < 4.2 && (
        <AbsoluteFill style={{ alignItems: "center" }}>
          <div style={{ position: "absolute", top: 240, padding: "16px 36px", background: "#111", color: "#fff", fontFamily: MONT, fontWeight: 900, fontSize: 64, transform: `rotate(-3deg) scale(${ez(t, 0.2, 0.5, 0.6, 1)})`, border: "6px solid #ffd23a" }}>ОЧЕРЕДЬ К ТЕРАПЕВТУ</div>
        </AbsoluteFill>
      )}
      {move && (
        <AbsoluteFill style={{ alignItems: "center" }}>
          <div style={{ position: "absolute", top: 260, width: 960, textAlign: "center", fontFamily: MONT, fontWeight: 900, fontSize: move[2].length > 26 ? 60 : 72, color: "#fff", WebkitTextStroke: `10px ${move[3]}`, paintOrder: "stroke fill", transform: `rotate(-6deg) scale(${ez(t, move[0], move[0] + 0.15, 1.6, 1)})`, textShadow: "6px 6px 0 #000" }}>{move[2]}</div>
        </AbsoluteFill>
      )}
      {t > 25.8 && (
        <AbsoluteFill style={{ alignItems: "center" }}>
          <div style={{ position: "absolute", top: 260, padding: "16px 36px", background: "#111", color: "#ffd23a", fontFamily: MONT, fontWeight: 900, fontSize: 66, transform: `rotate(-3deg) scale(${ez(t, 25.8, 26.1, 0.6, 1)})`, border: "6px solid #fff" }}>ПОБЕДИТЕЛЬ: ОЧЕРЕДЬ</div>
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{ background: "radial-gradient(85% 62% at 50% 46%, rgba(0,0,0,0) 60%, rgba(0,0,0,.5) 100%)", pointerEvents: "none" }} />
      <Subs t={t} />
    </AbsoluteFill>
  );
};
