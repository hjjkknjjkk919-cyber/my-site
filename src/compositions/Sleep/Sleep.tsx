import React from "react";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { ez, MONT } from "../../pelmeni/kit";
import { Bedroom3D, type BedState, type Spot } from "./Bedroom3D";
import { DimaBed, MonsterLayer, Trail, Vhs } from "./Overlays";
import VO from "./vo.json";
import { Choice3D } from "../../train/Pov3D";
import { loadFont as loadStencil } from "@remotion/google-fonts/RussoOne";

const { fontFamily: STENCIL } = loadStencil("normal", { weights: ["400"], subsets: ["latin", "cyrillic"] });
const CHOICE = { header: "ЧТО ДЕЛАТЬ ДИМЕ?", row1: "1 — ПОЙТИ К РОДИТЕЛЯМ", row2: "2 — ВЫЗВАТЬ ПОЛИЦИЮ", footer: "ПИШИ 1 ИЛИ 2 В КОММЕНТАРИЯХ", note: "ПРОДОЛЖЕНИЕ СНИМЕМ ПО ВЫБОРУ БОЛЬШИНСТВА" };

const D = VO.durs;
const DD: number[] = (VO as { dima?: number[] }).dima ?? [0, 0, 0];
const DSUBS = ["ЭТО ПРОСТО СОН... ПРОСТО СОН.", "БЛЯДЬ... ТОЛЬКО НЕ ТУДА!", "МАМА... МАМОЧКА..."];

/* ── тайминг: голос сначала, сегменты подстраиваются под фразы; реплики Димы — после фразы диктора в его планах ── */
const build = () => {
  const v: number[] = [];
  const seg: number[] = [0];
  const dv: number[] = [];
  let ad = 0;
  let t = 0.47;
  v.push(t);
  t += D[0];
  const step = (blink: boolean, dima = -1, adBreak = false) => {
    seg.push(t + 0.1);
    t = t + 0.1 + (blink ? 0.22 : 0.08);
    v.push(t);
    t += D[v.length - 1];
    if (dima >= 0) {
      dv[dima] = t + 0.2;
      t += 0.2 + DD[dima] + 0.1;
    }
    if (adBreak) {
      ad = t + 0.2; // рекламная пауза 6 с: сцена живёт дальше, притемнена; баннер накладывается ffmpeg (scripts/banner_overlay.sh)
      t += 0.2 + 6.0 + 0.25;
    }
  };
  step(true); // 2: окно открыто, монстр за изножьем
  step(false, 0); // 3: Дима сверху 1
  step(true); // 4: поднимается над изножьем
  step(true, -1, true); // 5: его уже нет (+ реклама)
  step(false, 1); // 6: Дима сверху 2
  step(true); // 7: пропал
  step(true, 2); // 8: Дима сверху 3
  seg.push(t + 0.05); // 9: выбор
  v.push(t + 0.1);
  return { v, seg, dv, ad };
};
const { v: V, seg: S, dv: DV, ad: AD } = build();
export const SLEEP_AD = AD;
export const SLEEP_FRAMES = Math.round((V[8] + D[8] + 1.3) * 30);
const BLINKS = [S[1], S[3], S[4], S[6], S[7]];
const segAt = (t: number) => S.reduce((a, s, i) => (t >= s ? i : a), 0) + 1;

/* ── моргание как в «Электричке» (PovPhone): мягкие размытые веки от первого лица — сверху 80%, снизу 20%, склейка в полной черноте, дрожь век при открытии ── */
const lidsAt = (t: number) => {
  let v = t < 0.15 ? 1 : t < 0.45 ? 1 - (t - 0.15) / 0.3 * 0.7 : t < 0.52 ? 0.3 + (t - 0.45) / 0.07 * 0.2 : t < 0.75 ? 0.5 * (1 - (t - 0.52) / 0.23) : 0;
  for (const b of BLINKS) {
    const u = t - (b - 0.3);
    if (u < 0 || u > 1.15) continue;
    const e = (x: number) => x * x * (3 - 2 * x);
    v = Math.max(v, u < 0.3 ? e(u / 0.3) : u < 0.45 ? 1 : u < 0.8 ? 1 - e((u - 0.45) / 0.35) * 0.75 : u < 0.9 ? 0.25 + ((u - 0.8) / 0.1) * 0.35 : 0.6 * (1 - e((u - 0.9) / 0.25)));
  }
  return v;
};
const Blink = ({ f }: { f: number }) => {
  const lids = lidsAt(f / 30);
  if (lids <= 0.01) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: `radial-gradient(70% 55% at 50% 50%, rgba(0,0,0,0) 30%, rgba(0,0,0,${0.85 * lids}) 100%)` }} />
      <div style={{ position: "absolute", left: "-15%", width: "130%", top: -160, height: `calc(${lids * 80}% + 160px)`, background: "#000", borderRadius: "0 0 50% 50% / 0 0 120px 120px", filter: "blur(32px)" }} />
      <div style={{ position: "absolute", left: "-15%", width: "130%", bottom: -160, height: `calc(${lids * 20}% + 160px)`, background: "#000", borderRadius: "50% 50% 0 0 / 60px 60px 0 0", filter: "blur(32px)" }} />
      {lids > 0.96 && <AbsoluteFill style={{ background: "#000", opacity: (lids - 0.96) / 0.04 }} />}
    </AbsoluteFill>
  );
};

const SUBS: string[][] = [["УВИДЕЛ ЭТО В 03:17?", "НЕ МОРГАЙ.", "МОРГНЁШЬ — ОНО ВНУТРИ."], ["ВЕКИ СРЫВАЮТСЯ", "ОКНО ОТКРЫВАЕТСЯ."], ["ТЕЛО КАК СВИНЦОВОЕ", "ПРОСТО ИГРА МОЗГА."], ["НОВОЕ МОРГАНИЕ", "ИЗ-ЗА ИЗНОЖЬЯ."], ["ЕГО УЖЕ НЕТ", "К СПАЛЬНЕ РОДИТЕЛЕЙ."], ["ДИКИЙ УЖАС", "ГЛАЗА НАВЫКАТЕ", "ТЕЛО МЁРТВОЕ."], ["ТОПОТ У РОДИТЕЛЕЙ", "ПОТОМ ТИШИНА", "НОГИ ВАТНЫЕ."], ["ХРУСТ КОСТЕЙ", "КРИК МАМЫ", "ОН ОПОЗДАЛ."], []];
const Subs = ({ t }: { t: number }) => {
  const i = V.findIndex((s, k) => t >= s && t < s + D[k] + 0.1);
  if (i < 0 || !SUBS[i].length) return null;
  const n = SUBS[i].length;
  const j = Math.min(n - 1, Math.floor(((t - V[i]) / D[i]) * n));
  const k = ez(t, V[i] + (j * D[i]) / n, V[i] + (j * D[i]) / n + 0.12);
  return (
    <div style={{ position: "absolute", left: 70, width: 840, top: 1250, textAlign: "center", fontFamily: MONT, fontWeight: 900, fontSize: 70, lineHeight: 1.08, color: j === n - 1 ? "#ff5a5a" : "#fff", WebkitTextStroke: "13px #000", paintOrder: "stroke fill", transform: `scale(${0.88 + 0.12 * k})`, opacity: k }}>{SUBS[i][j]}</div>
  );
};

const DSub = ({ t }: { t: number }) => {
  const i = DV.findIndex((s, k) => t >= s && t < s + DD[k] + 0.15);
  if (i < 0) return null;
  const k = ez(t, DV[i], DV[i] + 0.12);
  return (
    <div style={{ position: "absolute", left: 70, width: 840, top: 1250, textAlign: "center", fontFamily: MONT, fontWeight: 900, fontSize: 66, lineHeight: 1.08, color: "#ffd166", WebkitTextStroke: "13px #000", paintOrder: "stroke fill", fontStyle: "italic", transform: `scale(${0.88 + 0.12 * k})`, opacity: k }}>{DSUBS[i]}</div>
  );
};

const bpm = (t: number) => {
  const pts: [number, number][] = [[0, 118], [S[2], 134], [S[5], 176], [S[7], 194], [999, 194]];
  for (let i = 1; i < pts.length; i++) if (t < pts[i][0]) return Math.round(pts[i - 1][1] + ((pts[i][1] - pts[i - 1][1]) * (t - pts[i - 1][0])) / (pts[i][0] - pts[i - 1][0]));
  return 194;
};
const Hud = ({ f, t }: { f: number; t: number }) => {
  if (f < 18) return null;
  const k = Math.min(1, (f - 18) / 8);
  const beat = (t * bpm(t)) / 60 % 1 < 0.15 ? 1.15 : 1;
  return (
    <div style={{ position: "absolute", left: 40, top: 70, width: 860, display: "flex", justifyContent: "space-between", fontFamily: MONT, fontWeight: 900, fontSize: 32, color: "#fff", opacity: k }}>
      <div style={{ background: "rgba(0,0,0,.6)", padding: "8px 16px", borderRadius: 10 }}><span style={{ color: "#ff3030" }}>●</span> 03:17 НОЧЬ • СПАЛЬНЯ</div>
      <div style={{ background: "rgba(0,0,0,.6)", padding: "8px 16px", borderRadius: 10 }}><span style={{ color: "#ff3030", display: "inline-block", transform: `scale(${beat})` }}>♥</span> {bpm(t)} УД/МИН</div>
    </div>
  );
};

const SFX: [string, number, number?][] = [
  ["inhale", 0.2], ["neck", 1.5], ["window", S[1] + 0.2], ["sub", S[3] + 0.07], ["slither", S[4] + 0.25], ["teeth", V[5] + D[5] * 0.33], ["steps", S[6] + 0.3], ["gasp", V[6] + D[6] * 0.52],
  ["bones", V[7] + D[7] * 0.17], ["scream", V[7] + D[7] * 0.33], ["sob", V[7] + D[7] * 0.64], ["tick", S[8]], ...BLINKS.map((b) => ["lid", b - 0.28] as [string, number]),
];

export const Sleep = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const sg = segAt(t);
  const lt = t - S[sg - 1];
  const spot: Spot = sg === 1 ? "out" : sg === 2 || sg === 4 ? "feet" : sg === 5 ? "door" : "none";
  const jerkAt = V[6] + D[6] * 0.52;
  const jerk = sg === 7 ? ez(t, jerkAt, jerkAt + 0.12) * (1 - ez(t, jerkAt + 0.35, jerkAt + 1.0)) : 0;
  const state: BedState = {
    t,
    spot,
    open: sg >= 2 ? 1 : 0,
    tilt: sg === 1 ? -90 * ez(t, 40 / 30, 70 / 30) : 0,
    pupil: sg === 1 ? ez(t, 95 / 30, 125 / 30) : 0,
    cam: { y: jerk * 0.18, pitch: (sg === 2 || sg === 4 ? -0.16 : 0) + jerk * 0.12, yaw: sg === 5 ? -0.18 : sg === 7 ? -0.1 : 0, shake: sg === 4 ? 1 : 0 },
    beam: sg >= 2 ? 1 : 0,
    bpm: bpm(t),
  };
  const top = sg === 3 || sg === 6 || sg === 8;
  const talking = (tt: number) => V.some((s, i) => tt > s - 0.05 && tt < s + D[i] + 0.05) || DV.some((s, i) => tt > s - 0.05 && tt < s + DD[i] + 0.05) || (tt > AD - 0.05 && tt < AD + 6.05);
  const adK = t >= AD && t < AD + 6 ? ez(t, AD, AD + 0.3) * (1 - ez(t, AD + 5.7, AD + 6)) : 0;
  const dimaTalk = DV.some((s, i) => t >= s && t < s + DD[i]);
  const vol = (base: number, at = 0) => (fr: number) => (talking(fr / 30 + at) ? base * 0.5 : base);
  const FOOT_TOP: [number, number, number][] = [[-0.75, 0.62, -1.7], [0.75, 0.62, -1.7], [0.75, 3, -1.7], [-0.75, 3, -1.7]];
  const WIN: [number, number, number][] = [[-0.8, 0.73, -3.18], [0.8, 0.73, -3.18], [0.8, 2.08, -3.18], [-0.8, 2.08, -3.18]];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {sg <= 8 && !top && <Bedroom3D s={state} />}
      {sg === 1 && <MonsterLayer s={state} at={[0.15, -0.38, -3.7]} pose="stand" tilt={state.tilt} pupil={state.pupil} grin={0.3} hands="glass" clip={WIN} bars />}
      {sg === 2 && <MonsterLayer s={state} at={[-0.15, -0.98, -1.98]} pose="peek" tilt={90} pupil={-0.4} grin={0.5 + 0.5 * Math.min(1, lt / 2.5)} hands="none" grip clip={FOOT_TOP} />}
      {sg === 4 && <MonsterLayer s={state} at={[-0.15, -0.74, -1.98]} pose="peek" tilt={90} pupil={-0.3} grin={1} hands="none" grip clip={FOOT_TOP} />}
      {/* после 3-го моргания монстра в комнате нет — он уже у мамы; остаётся только мокрый след в коридор */}
      {(sg === 5 || sg === 7) && <Trail s={state} />}
      {/* реклама: живая сцена плавно притемняется, мягкий синий ореол под баннер */}
      {adK > 0 && <AbsoluteFill style={{ background: `rgba(0,0,0,${0.45 * adK})` }} />}
      {adK > 0 && <AbsoluteFill style={{ background: `radial-gradient(60% 18% at 50% 50%, rgba(60,120,255,${0.45 * adK}), rgba(0,0,0,0) 100%)` }} />}
      {top && <DimaBed stage={sg === 3 ? 1 : sg === 6 ? 2 : 3} k={Math.min(1, lt / (S[sg] - S[sg - 1]))} t={t} bpm={bpm(t)} flinch={sg === 8 && t > V[7] + D[7] * 0.17 && t < V[7] + D[7] * 0.55 ? 1 : 0} talk={dimaTalk} />}
      {/* финальный выбор — 3D-табличка из «Электрички» */}
      <Sequence from={Math.round(S[8] * 30)} layout="none">
        <AbsoluteFill><Choice3D font={STENCIL} texts={CHOICE} /></AbsoluteFill>
      </Sequence>
      <Vhs f={f} />
      {sg <= 8 && <Hud f={f} t={t} />}
      <Subs t={t} />
      <DSub t={t} />
      <Blink f={f} />
      {/* звук: диктор 0 dB, гул/пульс/SFX −18…−22 dB с дакингом */}
      <Audio src={staticFile("audio/sleep/sfx_drone.mp3")} loop volume={vol(0.1)} />
      <Sequence durationInFrames={Math.round(S[2] * 30)} layout="none"><Audio src={staticFile("audio/sleep/sfx_heart_slow.mp3")} loop volume={vol(0.1)} /></Sequence>
      <Sequence from={Math.round(S[2] * 30)} durationInFrames={Math.round((S[8] - S[2]) * 30)} layout="none"><Audio src={staticFile("audio/sleep/sfx_heart_fast.mp3")} loop volume={vol(0.1, S[2])} /></Sequence>
      {SFX.map(([n, at, vv], i) => (
        <Sequence key={i} from={Math.round(at * 30)} layout="none"><Audio src={staticFile(`audio/sleep/sfx_${n}.mp3`)} volume={vol(vv ?? 0.12, at)} /></Sequence>
      ))}
      <Sequence from={Math.round(AD * 30)} durationInFrames={180} layout="none"><Audio src={staticFile("ads/sout_audio.mp3")} volume={1} /></Sequence>
      {DV.map((s, i) => (
        <Sequence key={`d${i}`} from={Math.round(s * 30)} layout="none"><Audio src={staticFile(`audio/sleep/d${i}.mp3`)} volume={1} /></Sequence>
      ))}
      {V.map((s, i) => (
        <Sequence key={`v${i}`} from={Math.round(s * 30)} layout="none"><Audio src={staticFile(`audio/sleep/v${i}.mp3`)} volume={1} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};
