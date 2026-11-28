import React from "react";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { ez, MONT } from "../../pelmeni/kit";
import { Mug, PhoneItem } from "../AvitoWardrobe/props";
import { dimaReach, MouthCtx, nuanceReach } from "../AvitoWardrobe/rig";
import { Butchery, Camp, Checkout, Defs } from "../Hyper/locations";
import { Bottle, Pelmeni, Scanner } from "../Hyper/people";
import { DimaV2, NuansV2 } from "../NuansEp2/chars";
import VO from "./vo.json";

/* ── «30 дней в гипермаркете», серия 1: похуистичный Дима и стеснительный грустный Нюанс, 10 проблем, переходы вспышкой ── */
type L = { id: string; beat: number; who: string; dur: number; text: string; env: number[] };
const LINES = VO as L[];
const GAP = 0.14;
const FLASH = 0.32; // пауза под вспышку между битами
const build = () => {
  let t = 0.35;
  const at: number[] = [];
  const beatStart: number[] = [0];
  LINES.forEach((l, i) => {
    if (i > 0 && l.beat !== LINES[i - 1].beat) {
      t += FLASH;
      beatStart[l.beat] = t - 0.12;
    }
    at.push(t);
    t += l.dur + GAP;
  });
  return { at, beatStart, end: t + 1.2 };
};
const { at: AT, beatStart: BS, end: END } = build();
export const SHORT30_FRAMES = Math.round(END * 30);

const TITLES = ["ДЕНЬ 1 ИЗ 30", "ЕДА", "КРАЖА", "ДУШ", "СОН", "ЗАРЯДКА", "КАМЕРЫ", "СКУКА", "ЛЮДИ", "ШОРОХИ", "ВЫХОД", "А ТЫ?"];
type Loc = "checkout" | "camp" | "butchery";
const BEATS: { loc: Loc; cx: number; open?: number; night?: number }[] = [
  { loc: "butchery", cx: 1160 },
  { loc: "checkout", cx: 700 },
  { loc: "checkout", cx: 1000 },
  { loc: "camp", cx: 900 },
  { loc: "camp", cx: 1300, night: 1 },
  { loc: "checkout", cx: 1300 },
  { loc: "checkout", cx: 500 },
  { loc: "camp", cx: 700 },
  { loc: "checkout", cx: 1100 },
  { loc: "butchery", cx: 1300 },
  { loc: "checkout", cx: 1600, open: 1 },
  { loc: "checkout", cx: 1600, open: 1 },
];

const Cards = () => (
  <g transform="translate(-30 -60)">
    {[-24, -8, 8, 24].map((r, i) => (
      <g key={i} transform={`rotate(${r})`}>
        <rect x={-22} y={-64} width={44} height={64} rx={6} fill="#fff" stroke="#1a1a1a" strokeWidth={3} />
        <text x={0} y={-30} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={18} fill={i % 2 ? "#e00" : "#111"}>{["♠", "♥", "♣", "♦"][i]}</text>
      </g>
    ))}
  </g>
);

export const Short30 = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const beat = Math.max(0, BS.reduce((a, s, i) => (s !== undefined && t >= s ? i : a), 0));
  const lt = t - (BS[beat] ?? 0);
  const B = BEATS[beat];
  const amp: Record<string, number> = { dima: 0, nuance: 0 };
  LINES.forEach((l, i) => {
    if (t >= AT[i] && t < AT[i] + l.dur) amp[l.who] = l.env[Math.floor((t - AT[i]) * 30)] ?? 0;
  });
  const talking = (tt: number) => LINES.some((l, i) => tt > AT[i] - 0.05 && tt < AT[i] + l.dur + 0.05);
  // вспышка + удар зума на каждой смене бита
  const flash = beat > 0 ? Math.max(0, 1 - lt / 0.22) : 0;
  const punch = 1 + 0.06 * Math.max(0, 1 - lt / 0.3);
  const z = (1.45 + lt * 0.012) * punch;
  // персонажи (координаты портрета 1080×1920, пол y=1500)
  const FY = 1500;
  const DX = 330;
  const DS = 1.25;
  const NX = 790;
  const NS = 0.86;
  const shy = beat === 0 || beat === 1 || beat === 3 || beat === 10;
  const sad = beat === 6 || beat === 7 || beat === 9;
  const turned = beat === 3;
  const dItemR = beat === 1 ? <Pelmeni /> : beat === 2 ? <Scanner beam={(Math.floor(lt * 4) % 2) as number} /> : beat === 3 ? <Bottle /> : beat === 7 ? <Cards /> : <Mug t={t} steam />;
  const dItemL = beat === 5 || beat === 0 ? <PhoneItem t={t} mode="off" /> : undefined;
  const dimaPose = {
    armR: beat === 3 ? dimaReach(1, DX + 90, FY - 1050, DX, FY, DS) : dimaReach(1, DX + 120, FY - 545, DX, FY, DS),
    itemR: dItemR,
    armL: dimaReach(-1, DX - 115, FY - 525, DX, FY, DS),
    itemL: dItemL,
    head: beat === 9 ? 6 : -3,
    look: beat === 9 || beat === 10 || beat === 1 ? 0.8 : 0.05,
    lid: beat === 4 ? 1 : 0.55,
  };
  const nCrouch = beat === 9 ? 0.45 : 0;
  const reach = beat === 1 && lt > 1.5;
  const nuancePose = {
    armL: nuanceReach(-1, reach ? DX + 200 : NX - 120, FY - (reach ? 560 : 380), NX, FY, NS),
    armR: nuanceReach(1, NX + 160, FY - 380 + (sad ? 60 : 0), NX, FY, NS),
    head: turned ? -24 : sad ? 16 : shy ? 10 : 4,
    guilty: shy || sad ? 1 : 0,
    mouth: 0.2,
    crouch: nCrouch,
  };
  return (
    <AbsoluteFill style={{ background: "#07080b" }}>
      <MouthCtx.Provider value={{ dima: amp.dima, nuance: amp.nuance }}>
        <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
          <Defs />
          <defs><linearGradient id="s30floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a3d46" /><stop offset="1" stopColor="#121318" /></linearGradient></defs>
          <g transform={`translate(540 960) scale(${punch}) translate(-540 -960)`}>
            {/* локация 1920×1080 → портрет: масштаб z, пол локации (1000) ставим на y=FY */}
            <g transform={`translate(540 ${FY}) scale(${z}) translate(-540 -1000)`}>
              <g transform={`translate(${540 - B.cx} 0)`}>
                {B.loc === "checkout" && <Checkout t={t} open={B.open ?? 0} night={B.night ?? 0} ticker="ПЕЛЬМЕНИ ПО АКЦИИ • ОСТАЛОСЬ 29 ДНЕЙ • СМЕТАНА 20% •" />}
                {B.loc === "camp" && <Camp t={t} night={B.night ?? 0} />}
                {B.loc === "butchery" && <Butchery t={t} door={1} fog={beat === 9 ? 1 : 0.5} />}
              </g>
            </g>
            <rect y={FY + 100} width={1080} height={1920 - FY} fill="url(#s30floor)" />
            <rect y={FY - 6} width={1080} height={1920 - FY + 6} fill="#000" opacity={0.2} />
            <NuansV2 x={NX} y={FY} s={NS} t={t} amp={amp.nuance} blush={shy ? 1 : 0} pose={nuancePose} />
            {beat === 9 && [0, 1].map((i) => <path key={i} d={`M${NX - 30 + i * 60} ${FY - 980 + nCrouch * 170 + ((lt * 1.6 + i * 0.5) % 1) * 120} q6 14 0 22 q-6 -8 0 -22 Z`} fill="#8fd0f2" />)}
            <DimaV2 x={DX} y={FY} s={DS} t={t} pose={dimaPose} />
            {beat === 4 && <text x={DX + 110} y={FY - 900 - ((lt * 40) % 60)} fontFamily={MONT} fontWeight={900} fontSize={70} fill="#fff" opacity={0.85}>Zzz</text>}
            {beat === 6 && (
              <g transform="translate(120 330)">
                <rect x={-60} y={-30} width={120} height={60} rx={10} fill="#222" stroke="#000" strokeWidth={4} />
                <circle cx={40} cy={0} r={18} fill="#111" stroke="#555" strokeWidth={4} />
                <circle cx={-40} cy={-14} r={7} fill={Math.floor(t * 2) % 2 ? "#ff2a2a" : "#400"} />
              </g>
            )}
          </g>
        </svg>
      </MouthCtx.Provider>
      {/* плашка «ПРОБЛЕМА №N» */}
      {(() => {
        const k = ez(lt, 0.05, 0.3);
        const isP = beat >= 1 && beat <= 10;
        return (
          <div style={{ position: "absolute", left: 60, width: 860, top: 210, textAlign: "center", transform: `scale(${0.6 + 0.4 * k}) rotate(${(1 - k) * -6}deg)`, opacity: k }}>
            {isP && <div style={{ fontFamily: MONT, fontWeight: 900, fontSize: 52, color: "#ffd166", WebkitTextStroke: "10px #000", paintOrder: "stroke fill" }}>ПРОБЛЕМА №{beat}</div>}
            <div style={{ display: "inline-block", marginTop: 8, fontFamily: MONT, fontWeight: 900, fontSize: 96, color: "#fff", background: beat === 11 ? "#e00000" : "rgba(10,10,14,.85)", border: "6px solid #000", borderRadius: 22, padding: "4px 30px" }}>{TITLES[beat]}</div>
          </div>
        );
      })()}
      {/* прогресс 10 проблем */}
      {beat >= 1 && beat <= 10 && (
        <div style={{ position: "absolute", left: 90, top: 120, width: 800, display: "flex", gap: 10 }}>
          {Array.from({ length: 10 }, (_, i) => <div key={i} style={{ flex: 1, height: 14, borderRadius: 7, background: i < beat ? "#ffd166" : "rgba(255,255,255,.25)", border: "2px solid #000" }} />)}
        </div>
      )}
      {/* субтитры (без цензуры), безопасная зона */}
      {(() => {
        const i = LINES.findIndex((l, k) => t >= AT[k] && t < AT[k] + l.dur + 0.1);
        if (i < 0) return null;
        const l = LINES[i];
        const words = l.text.split(/\s+/);
        const n = Math.max(1, Math.ceil(words.length / 3));
        const j = Math.min(n - 1, Math.floor(((t - AT[i]) / l.dur) * n));
        const chunk = words.slice(j * 3, j * 3 + 3).join(" ");
        return <div style={{ position: "absolute", left: 70, width: 840, top: 1240, textAlign: "center", fontFamily: MONT, fontWeight: 900, fontSize: 74, lineHeight: 1.08, textTransform: "uppercase", color: l.who === "nuance" ? "#ffb347" : "#fff", WebkitTextStroke: "13px #000", paintOrder: "stroke fill" }}>{chunk}</div>;
      })()}
      {beat === 11 && <div style={{ position: "absolute", left: 60, width: 860, top: 1440, textAlign: "center", fontFamily: MONT, fontWeight: 900, fontSize: 56, color: "#ffd166", WebkitTextStroke: "10px #000", paintOrder: "stroke fill", opacity: ez(lt, 0.3, 0.6) }}>ПИШИ НОМЕР 1–10</div>}
      <AbsoluteFill style={{ background: `rgba(255,255,255,${flash})`, pointerEvents: "none" }} />
      <AbsoluteFill style={{ background: "radial-gradient(85% 70% at 50% 45%, rgba(0,0,0,0) 60%, rgba(0,0,0,.55) 100%)", pointerEvents: "none" }} />
      {/* звук */}
      <Audio src={staticFile("audio/hyper/sfx_amb_hall.mp3")} loop volume={(fr) => (talking(fr / 30) ? 0.05 : 0.1)} />
      {BS.map((s, i) => (i > 0 && s !== undefined ? (
        <Sequence key={`w${i}`} from={Math.max(0, Math.round((s - 0.05) * 30))} layout="none"><Audio src={staticFile("audio/hyper/sfx_whoosh.mp3")} volume={0.35} /></Sequence>
      ) : null))}
      <Sequence from={Math.round(((BS[2] ?? 0) + 0.6) * 30)} layout="none"><Audio src={staticFile("audio/hyper/sfx_scan.mp3")} volume={0.3} /></Sequence>
      {LINES.map((l, i) => (
        <Sequence key={l.id} from={Math.round(AT[i] * 30)} layout="none"><Audio src={staticFile(`audio/short30/${l.id}.mp3`)} volume={1} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};
