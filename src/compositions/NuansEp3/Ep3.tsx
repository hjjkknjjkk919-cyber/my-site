import React from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, spring, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { MONT } from "../../pelmeni/kit";
import { Demon, Human, type P2 } from "./body";
import { Barsetka, Cart, Chicken, DetailedKitchen2D, Fridge, HyperHall, Money, Mop, MugP, Radio, RollingPin, Umbrella } from "./props";
import { ArcticFrostVFX, ImpactFrameVFX, SparkingMeterVFX } from "./vfx";
import VO from "./vo.json";

/* ══ СЕРИЯ 3 «Холодильник от Валеры Перекупа» — чистый 2D, риг AnatomicalRig2D, пол y=1430, 2250 кадров ══ */
export const EP3_FRAMES = 2250;
const FLOOR = 1430;
type V = { id: string; who: string; dur: number; text: string; env: number[] };
const VOL = VO as V[];
// реплики заполняют весь хронометраж (индексы как в scripts/ep3_audio.py)
const START = [0.35, 5.6, 14.85, 20.55, 26.4, 37.0, 51.75, 63.4, 12.3, 30.35, 34.0, 35.1, 40.6, 45.8, 49.0, 56.95, 59.7, 61.1];
const T_SLAM = 29.9;
const T_FLICK = 1035 / 30;
const T_HIT = 1270 / 30;
const SFX: [string, number][] = [["fridge", 0.1], ["freezer", 12.2], ["frost", 12.6], ["slam", T_SLAM], ["flick", T_FLICK - 0.35], ["chicken", T_HIT - 2.05], ["meter", 48.3], ["hyper", 63.0]];

const EIO = Easing.inOut(Easing.cubic);
const ei = (t: number, a: number, b: number, from = 0, to = 1) => interpolate(t, [a, b], [from, to], { easing: EIO, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
const SPR = { damping: 18, stiffness: 85, mass: 1.2 };
const spr = (f: number, at: number) => spring({ frame: f - Math.round(at * 30), fps: 30, config: SPR });
/** мировая точка → локальные координаты персонажа (стопы в 0,0, +X вперёд) */
const loc = (wx: number, wy: number, X: number, s: number, flip = false): P2 => [((wx - X) / s) * (flip ? -1 : 1), (wy - FLOOR) / s];
/** шаг: щиколотки по фазе, стопы касаются пола */
const walk = (ph: number, on: number, w = 24): { aL: P2; aR: P2 } => ({
  aL: [-w - 6 + 46 * Math.sin(ph) * on, -26 - 30 * Math.max(0, Math.cos(ph)) * on],
  aR: [w + 6 - 46 * Math.sin(ph) * on, -26 - 30 * Math.max(0, -Math.cos(ph)) * on],
});
const MASK: [RegExp, string][] = [[/блядь/gi, "бл*дь"], [/нахуй/gi, "нах*й"], [/сука/gi, "с*ка"]];

export const NuansEp3 = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const amp: Record<string, number> = {};
  VOL.forEach((l, i) => {
    if (t >= START[i] && t < START[i] + l.dur) amp[l.who] = l.env[Math.floor((t - START[i]) * 30)] ?? 0;
  });
  const A = (w: string) => amp[w] ?? 0;
  const talking = (tt: number) => VOL.some((l, i) => tt > START[i] - 0.05 && tt < START[i] + l.dur + 0.05);
  const scene = t < 12 ? 1 : t < 30 ? 2 : t < 48 ? 3 : t < 63.1 ? 4 : 5;

  /* ── камера: мягкие наезды/панорамы (easeInOut cubic) + затухающая тряска на ударах ── */
  const camZ = scene === 1 ? ei(t, 0, 12, 1.0, 1.05) : scene === 2 ? ei(t, 12, 13.5, 1.05, 1.1) : scene === 3 ? 1.06 : scene === 4 ? ei(t, 48, 50, 1.06, 1.0) : ei(t, 63, 75, 1.0, 1.05);
  const camX = scene === 2 ? ei(t, 12, 13.5, 0, 110) : scene === 3 ? ei(t, 31, 33.5, 0, 70) - ei(t, 39.8, 41, 0, 150) : scene === 4 ? 50 : 0;
  const shakeOf = (at: number) => {
    const df = f - Math.round(at * 30);
    return df >= 0 && df < 16 ? 8 * (1 - df / 16) : 0;
  };
  const sh = shakeOf(T_FLICK) + shakeOf(T_HIT) + shakeOf(T_SLAM) * 0.8 + shakeOf(2.0) * 0.6;
  const shx = sh * Math.sin(f * 7.3);
  const shy = sh * Math.cos(f * 5.1);
  const impact = (f >= 1035 && f <= 1036) || (f >= 1270 && f <= 1271);
  const layer = (depth: number) => `translate(${540 + shx * depth} ${960 + shy * depth}) scale(${camZ}) translate(${-540 - camX * depth} -960)`;

  /* ── состояние кухни ── */
  const fridgeX = interpolate(t, [0.1, 2.0], [880, 760], { easing: Easing.out(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fridgeDrop = t < 2.0 ? -Math.max(0, 14 * Math.sin(((t - 0.1) / 1.9) * Math.PI)) : 0;
  const topOpen = scene === 2 ? spr(f, 12.2) * (1 - spr(f, T_SLAM - 0.15)) : scene === 3 ? spr(f, 34.1) * (1 - spr(f, 41.6)) : scene === 4 ? spr(f, 49.2) : 0;
  const frostK = scene === 2 ? ei(t, 12.3, 13.4) * (1 - ei(t, T_SLAM, 30)) : scene === 3 ? 0.35 * (1 - ei(t, 30, 32)) + 0.4 * ei(t, 34.1, 34.6) * (1 - ei(t, 41.6, 43)) : 0;
  const meterK = scene === 4 ? ei(t, 48.3, 48.8) : 0;
  const doorOpen = scene === 1 ? 1 - ei(t, 11.6, 12) : scene === 4 ? spr(f, 48.2) : 0;

  /* ── ДИМА ── */
  const DS = 0.92;
  const DX = scene === 2 ? 560 : 205;
  const dimaPose = (() => {
    if (scene === 2) {
      const open = 1 - ei(t, 12.5, 13.2);
      const nose = ei(t, 20.2, 20.45) * (1 - ei(t, 20.8, 21.2));
      const handle = loc(857, 905, DX, DS);
      const rest: P2 = [74, -300];
      const wR: P2 = nose > 0 ? [rest[0] + (40 - rest[0]) * nose, rest[1] + (-640 - rest[1]) * nose] : [rest[0] + (handle[0] - rest[0]) * open, rest[1] + (handle[1] - rest[1]) * open];
      return { wR, wL: [-30, -430] as P2, itemL: <MugP t={t} ice={frostK} />, look: 0.6, head: -2 };
    }
    if (scene === 3) {
      const up = ei(t, 40.6, 41.0);
      return { wL: [-30, -430] as P2, itemL: <MugP t={t} />, wR: [80 + 40 * up, -300 - 230 * up] as P2, itemR: <Umbrella open={spr(f, 40.8)} />, look: t > 40 ? 0.7 : 0.3, head: t > 40 ? -4 : 0 };
    }
    return { wR: [96, -432] as P2, itemR: <MugP t={t} />, wL: [-74, -300] as P2, look: scene === 4 ? 0.8 : scene === 5 ? 0.15 : 0.6, head: scene === 5 ? 2 : -3 };
  })();
  const icicle = scene === 2 && t > 13.3 ? (t < 20.5 ? 1 : 0) : 0;

  /* ── НЮАНС ── */
  const NS = 0.7;
  const nuance = (() => {
    if (scene === 1) {
      const sw = Math.sin(t * 2.2);
      const gripY = -600;
      const wR: P2 = [110 + sw * 40, gripY];
      const gripWorldY = FLOOR + gripY * NS;
      const len = (FLOOR - gripWorldY) / (NS * 1.45) - 30;
      return { X: 470, flip: true, pose: { wR, wL: [60 + sw * 40, gripY + 120] as P2, itemR: <Mop len={len} t={t} />, head: 12, guilty: 0.6 }, sit: 0, ice: 0, lift: 0, rot: 0 };
    }
    if (scene === 2) return { X: 330, flip: false, pose: { wL: [-190, -1180] as P2, wR: [190, -1180] as P2, head: -6, mouth: 1 }, sit: 0, ice: ei(t, 12.8, 14.2), lift: 0, rot: 0 };
    if (scene === 3) {
      const thaw = 1 - ei(t, 30, 31);
      const walkK = ei(t, 31, 33.2);
      const X = 330 + 270 * walkK;
      const knock = t > 33.3 && t < 34.05 ? Math.abs(Math.sin((t - 33.3) * 12)) : 0;
      const door = loc(700, 900, X, NS);
      const fly = ei(t, T_FLICK + 0.05, 35.7);
      if (t >= T_FLICK + 0.05 && t < 35.75) {
        const fx = 600 + (420 - 600) * fly;
        const fy = FLOOR - Math.sin(fly * Math.PI) * 360 - fly * 120;
        return { X: fx, flip: false, pose: { wL: [-260, -1150] as P2, wR: [260, -1250] as P2, aL: [-120, -60] as P2, aR: [140, -40] as P2, mouth: 1, head: 20 }, sit: 0, ice: 0, lift: FLOOR - fy, rot: -40 * fly };
      }
      if (t >= 35.75) return { X: 420, flip: false, pose: { wL: [-120, -560] as P2, wR: [180, -520] as P2, head: 14, guilty: 1 }, sit: 1, ice: 0, lift: 0, rot: 0 };
      const wk = walk((X - 330) / 26, walkK > 0 && walkK < 1 ? 1 : 0, 34);
      return { X, flip: false, pose: { ...wk, wR: t > 33.2 ? ([door[0] - knock * 30, door[1]] as P2) : undefined, head: 4 }, sit: 0, ice: thaw, lift: 0, rot: 0 };
    }
    if (scene === 4) return { X: 420, flip: false, pose: { head: 10, guilty: 1, wL: [-150, -780] as P2, wR: [150, -760] as P2 }, sit: 1 - ei(t, 49, 50.2), ice: 0, lift: 0, rot: 0 };
    const sw = Math.sin(t * 1.8);
    return { X: 485, flip: true, pose: { wR: [110 + sw * 30, -600] as P2, wL: [60 + sw * 30, -480] as P2, itemR: <Mop len={(FLOOR - (FLOOR - 600 * NS)) / (NS * 1.45) - 30} t={t} />, head: 8, guilty: 0.5 }, sit: 0, ice: 0, lift: 0, rot: 0 };
  })();

  /* ── ОТМОРОЗОК ── */
  const OS = 0.55;
  const OX = 770;
  const OY = 1183;
  const otmIn = scene === 2 ? ei(t, 12.9, 13.6) * (1 - ei(t, T_SLAM - 0.4, T_SLAM)) : scene === 3 ? ei(t, 34.15, 34.4) * (1 - ei(t, 41.4, 41.7)) : 0;
  const otmFreezer = (() => {
    const door = loc(650, 905, OX, OS, true);
    const shelf = loc(860, 965, OX, OS, true);
    let wR = door;
    let wL = shelf;
    if (scene === 3) {
      const flick = ei(t, T_FLICK - 0.25, T_FLICK) * (1 - ei(t, T_FLICK + 0.1, T_FLICK + 0.5));
      const head = loc(615, 640, OX, OS, true);
      wR = [door[0] + (head[0] - door[0]) * flick, door[1] + (head[1] - door[1]) * flick];
      const thr = ei(t, 39.9, T_HIT - 2.05) * (1 - ei(t, T_HIT - 1.9, T_HIT - 1.3));
      const fw = loc(560, 800, OX, OS, true);
      wL = [shelf[0] + (fw[0] - shelf[0]) * thr, shelf[1] + (fw[1] - shelf[1]) * thr];
    }
    return { wL, wR, head: scene === 2 ? -8 : 6, mouth: 0.6 };
  })();

  /* ── курица ── */
  const chickK = ei(t, T_HIT - 2.05, T_HIT);
  const chickX = 700 + (DX + 230 - 700) * chickK;
  const chickY = 830 - Math.sin(chickK * Math.PI) * 160 + chickK * -60;
  const chickFall = t > T_HIT ? Math.min(1, (t - T_HIT) / 0.6) : 0;

  /* ── МАМА ── */
  const MS = 0.68;
  const mamaX = 1040 - 200 * ei(t, 48.6, 50.6);
  const swing = Math.max(ei(t, 51.8, 52.1) * (1 - ei(t, 52.3, 52.8)), ei(t, 53.9, 54.2) * (1 - ei(t, 54.4, 54.9)));
  const mamaW = walk((1040 - mamaX) / 30, t > 48.6 && t < 50.6 ? 1 : 0, 32);

  const sub = (() => {
    const i = VOL.findIndex((l, k) => t >= START[k] && t < START[k] + l.dur + 0.1);
    if (i < 0) return null;
    const l = VOL[i];
    const words = MASK.reduce((a, [r, v]) => a.replace(r, v), l.text).split(/\s+/);
    const n = Math.max(1, Math.ceil(words.length / 3));
    const j = Math.min(n - 1, Math.floor(((t - START[i]) / l.dur) * n));
    return { text: words.slice(j * 3, j * 3 + 3).join(" "), who: l.who };
  })();
  const COLORS: Record<string, string> = { dima: "#ffffff", valera: "#33b5ff", otm: "#9fdcff", nuance: "#ffb347", mama: "#ff7ab8" };

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ filter: impact ? "grayscale(1) contrast(4) brightness(1.1)" : undefined }}>
        <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
          {scene <= 4 ? (
            <>
              {/* задник (параллакс 0.85) */}
              <g transform={layer(0.85)}>
                <DetailedKitchen2D t={t} meter={meterK} doorOpen={doorOpen} frost={frostK} />
              </g>
              {/* мебель/холодильник + персонажи (параллакс 1.0) */}
              <g transform={layer(1)}>
                <g transform={`translate(0 ${fridgeDrop}) rotate(${t < 2 ? (1 - t / 2) * -5 : 0} ${fridgeX} ${FLOOR})`}>
                  <Fridge x={fridgeX} top={topOpen} t={t} shake={scene === 2 ? frostK * 0.4 : 0} />
                </g>
                {/* брызги посуды из раковины */}
                {t > 35.7 && t < 37.2 && [0, 1, 2, 3].map((i) => {
                  const u = (t - 35.7) / 1.5;
                  return <ellipse key={i} cx={430 + (i - 1.5) * 60 * u * 2} cy={1080 - Math.sin(u * Math.PI) * (120 + i * 30)} rx={30} ry={9} fill={i % 2 ? "#f4f4f2" : "#d9e4ec"} stroke="#1d1a1c" strokeWidth={3} transform={`rotate(${u * 360 * (i % 2 ? 1 : -1)} ${430 + (i - 1.5) * 60 * u * 2} ${1080 - Math.sin(u * Math.PI) * (120 + i * 30)})`} />;
                })}
                {/* Отморозок высовывается из морозилки: всё ниже дна камеры скрыто внутри холодильника */}
                {otmIn > 0.01 && (
                  <g>
                    <defs><clipPath id="otmClip"><rect x={560} y={0} width={420} height={980} /></clipPath></defs>
                    <g clipPath="url(#otmClip)">
                      <Demon kind="otm" x={OX} y={OY + (1 - otmIn) * 300} s={OS} t={t} flip pose={otmFreezer} amp={A("otm")} upperOnly />
                    </g>
                  </g>
                )}
                {scene === 4 && <Demon kind="otm" x={600} y={FLOOR - (1 - ei(t, 49.4, 50.4)) * 160} s={0.75} t={t} cower={ei(t, 50, 50.6)} pose={{ wL: [-30, -980], wR: [40, -990], head: 8 }} amp={A("otm")} />}
                {/* Нюанс */}
                <g transform={`rotate(${nuance.rot} ${nuance.X} ${FLOOR - nuance.lift - 400})`}>
                  <Demon kind="nuance" x={nuance.X} y={FLOOR - nuance.lift} s={NS} t={t} flip={nuance.flip} pose={nuance.pose} amp={A("nuance")} ice={nuance.ice} sit={nuance.sit} ph={0.7} />
                </g>
                {/* Валера: толкает холодильник, считает купюры и уходит в дверь */}
                {scene === 1 && (() => {
                  const X = 1000 - 80 * ei(t, 2.2, 3.4) + 160 * ei(t, 8.6, 11.8);
                  const push = t < 2.1;
                  const wk = walk((1000 - X) / 24, (t > 2.2 && t < 3.4) || (t > 8.6 && t < 11.8) ? 1 : 0);
                  const side = loc(fridgeX + 128, 1100, X, DS, true);
                  return <Human kind="valera" x={X} y={FLOOR} s={DS} t={t} flip={t < 8.6} pose={{ ...wk, wR: push ? side : [90, -430], wL: push ? [side[0] - 30, side[1] + 60] : [-70, -300], itemR: push ? undefined : <Money t={t} />, itemL: push ? undefined : <Barsetka />, look: 0.5, head: -4 }} amp={A("valera")} ph={1.3} />;
                })()}
                {/* Мама Нюанса со скалкой */}
                {scene === 4 && <Demon kind="mama" x={mamaX} y={FLOOR} s={MS} t={t} flip pose={{ ...mamaW, wR: [110 + 110 * swing, -1150 + 260 * swing], itemR: <RollingPin />, wL: [70, -620], head: -6 }} amp={A("mama")} ph={2.1} />}
                {/* Дима */}
                <Human kind="dima" x={DX} y={FLOOR} s={DS} t={t} pose={dimaPose} amp={A("dima")} extra={icicle ? <path d="M-2 -650 l8 34 l8 -34 Z" fill="#dff3ff" stroke="#5dade2" strokeWidth={2} /> : undefined} />
                {scene === 2 && t > 20.5 && t < 21.5 && <path d={`M${DX + 2} ${1430 - 590 * DS + (t - 20.5) * 900} l7 30 l7 -30 Z`} fill="#dff3ff" stroke="#5dade2" strokeWidth={2} />}
                {/* курица */}
                {scene === 3 && t > T_HIT - 2.05 && t < 47 && <g transform={`translate(${chickX + chickFall * 40} ${t > T_HIT ? chickY + chickFall * (FLOOR - 30 - chickY) : chickY})`}><Chicken rot={t * 400 * (1 - chickFall)} /></g>}
              </g>
              {/* передний план VFX (параллакс 1.1) */}
              <g transform={layer(1.1)}>
                <ArcticFrostVFX k={frostK} t={t} breath={scene === 2 ? [[DX + 10, 1430 - 580 * DS, 0], [OX - 30, OY - 840 * OS, 1.1]] : []} />
                <SparkingMeterVFX x={940} y={470} t={t} k={meterK} frame={f} />
              </g>
            </>
          ) : (
            <>
              <g transform={layer(0.85)}>
                <HyperHall t={t - 63} />
              </g>
              <g transform={layer(1)}>
                {/* качественная массовка: охранник с рацией у турникета, двое покупателей с тележками к выходу */}
                <Human kind="guard" x={985} y={FLOOR} s={0.6} t={t} flip pose={{ wR: [40, -600], itemR: <Radio />, wL: [-70, -300], head: 6 }} ph={0.4} />
                {(() => {
                  const k = ei(t, 63, 69);
                  const X1 = 300 + 200 * k;
                  const X2 = 760 - 180 * k;
                  const w1 = walk((X1 - 300) / 18, k < 1 ? 1 : 0);
                  const w2 = walk((760 - X2) / 18, k < 1 ? 1 : 0);
                  const op = 1 - ei(t, 68.4, 69.2);
                  return (
                    <g opacity={op}>
                      <g transform={`translate(${X1 + 60 * 0.58} ${FLOOR}) scale(0.58)`}><Cart /></g>
                      <Human kind="shopperW" x={X1} y={FLOOR} s={0.58} t={t} pose={{ ...w1, wR: [100, -300], wL: [96, -296] }} ph={0.9} />
                      <g transform={`translate(${X2 - 60 * 0.58} ${FLOOR}) scale(-0.58 0.58)`}><Cart /></g>
                      <Human kind="shopperM" x={X2} y={FLOOR} s={0.58} t={t} flip pose={{ ...w2, wR: [100, -300], wL: [96, -296] }} ph={1.7} />
                    </g>
                  );
                })()}
                <Demon kind="otm" x={805} y={FLOOR} s={0.72} t={t} flip pose={{ head: -4, wL: [-160, -420], wR: [150, -420] }} amp={A("otm")} extra={
                  <g>
                    <path d="M-150 -340 C-170 -500 -170 -720 -140 -790 C-100 -830 100 -830 140 -790 C170 -720 170 -500 150 -340 Z" fill="#2b4a7a" stroke="#1d1a1c" strokeWidth={3} />
                    {[0, 1, 2, 3].map((i) => <path key={i} d={`M-150 ${-420 - i * 100} Q0 ${-400 - i * 100} 150 ${-420 - i * 100}`} stroke="#1e3558" strokeWidth={6} fill="none" />)}
                    <rect x={-64} y={-640} width={128} height={42} rx={6} fill="#fff" stroke="#1d1a1c" strokeWidth={3} />
                    <text x={0} y={-610} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={26} fill="#1e5bd8">СТАЖЁР</text>
                  </g>
                } />
                <Demon kind="nuance" x={nuance.X} y={FLOOR} s={NS} t={t} flip pose={nuance.pose} amp={A("nuance")} ph={0.7} extra={
                  <g>
                    <path d="M-100 -960 L-50 -980 L-40 -600 L-110 -580 Z M100 -960 L50 -980 L40 -600 L110 -580 Z" fill="#ff8c1a" stroke="#1d1a1c" strokeWidth={3} />
                    <path d="M-106 -700 L-46 -712 M106 -700 L46 -712" stroke="#e8e8e8" strokeWidth={10} />
                  </g>
                } />
                <Human kind="dima" x={DX} y={FLOOR} s={DS} t={t} pose={dimaPose} amp={A("dima")} />
              </g>
            </>
          )}
        </svg>
        {impact && (
          <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
            <ImpactFrameVFX cx={f < 1200 ? 610 : DX + 240} cy={f < 1200 ? 650 : 700} seed={f} />
          </svg>
        )}
      </AbsoluteFill>
      {/* плашки сцен */}
      {(() => {
        const plates: [number, string][] = [[0.1, "СЕРИЯ 3 · ХОЛОДИЛЬНИК ОТ ВАЛЕРЫ"], [63.1, "НОЧНАЯ СМЕНА · ГИПЕРМАРКЕТ"]];
        return plates.map(([at, txt]) => {
          const k = ei(t, at, at + 0.4) * (1 - ei(t, at + 2.6, at + 3.0));
          return k > 0.01 ? <div key={txt} style={{ position: "absolute", left: 60, width: 860, top: 150, textAlign: "center", opacity: k, transform: `translateY(${(1 - k) * -20}px)` }}><span style={{ display: "inline-block", fontFamily: MONT, fontWeight: 900, fontSize: 44, color: "#fff", background: "rgba(10,10,14,.85)", border: "4px solid #ffd166", borderRadius: 16, padding: "8px 22px" }}>{txt}</span></div> : null;
        });
      })()}
      {sub && <div style={{ position: "absolute", left: 70, width: 840, top: 1250, textAlign: "center", fontFamily: MONT, fontWeight: 900, fontSize: 70, lineHeight: 1.08, textTransform: "uppercase", color: COLORS[sub.who] ?? "#fff", WebkitTextStroke: "13px #000", paintOrder: "stroke fill" }}>{sub.text}</div>}
      <AbsoluteFill style={{ background: "radial-gradient(85% 70% at 50% 45%, rgba(0,0,0,0) 62%, rgba(0,0,0,.5) 100%)", pointerEvents: "none" }} />
      {/* звук: голоса 0 dB, SFX −15…−19 dB с дакингом под речью */}
      {SFX.map(([n, at]) => (
        <Sequence key={n} from={Math.round(at * 30)} layout="none">
          <Audio src={staticFile(`audio/ep3/sfx_${n}.mp3`)} volume={(fr) => (talking(fr / 30 + at) ? 0.45 : 0.85)} />
        </Sequence>
      ))}
      {VOL.map((l, i) => (
        <Sequence key={l.id} from={Math.round(START[i] * 30)} layout="none">
          <Audio src={staticFile(`audio/ep3/${l.id}.mp3`)} volume={1} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
