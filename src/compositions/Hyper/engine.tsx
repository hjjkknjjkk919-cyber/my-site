import React from "react";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { ez, MONT } from "../../pelmeni/kit";
import { MouthCtx } from "../AvitoWardrobe/rig";
import { Defs } from "./locations";
import { AmpCtx } from "./people";
import TL from "./timeline.json";

export type Line = { id: string; who: string; at: number; dur: number; text: string; env: number[] };
export type SceneData = { n: number; loc: string; day: number; frames: number; lines: Line[]; marks: Record<string, number>; sfx: { name: string; at: number }[] };
export const SCENES = TL as unknown as SceneData[];
export const scene = (n: number) => SCENES.find((s) => s.n === n)!;
/** Тизер встраивает готовые сцены: их звук и субтитры глушатся. */
export const MuteCtx = React.createContext(false);

/** Мат в субтитрах — со звёздочкой. */
const MASK: [RegExp, string][] = [[/бляд/gi, "бл*д"], [/блять/gi, "бл*ть"], [/ебан/gi, "*бан"], [/нахуй/gi, "нах*й"], [/хуй/gi, "х*й"], [/переебу/gi, "пере*бу"], [/заебись/gi, "за*бись"], [/сука/gi, "с*ка"]];
const mask = (s: string) => MASK.reduce((a, [r, v]) => a.replace(r, v), s);

type Chunk = { from: number; to: number; text: string; who: string };
const chunks = (lines: Line[]): Chunk[] =>
  lines.flatMap((l) => {
    const words = mask(l.text).split(/\s+/).filter((w) => w !== "—");
    const groups: string[] = [];
    for (let j = 0; j < words.length; ) {
      const left = words.length - j;
      const n = left <= 4 ? left : left === 5 ? 3 : /[.,:?!…]$/.test(words[j + 1]) ? 2 : 3;
      groups.push(words.slice(j, j + n).join(" "));
      j += n;
    }
    const total = groups.reduce((s, g) => s + g.length, 0);
    let t0 = l.at;
    return groups.map((g) => {
      const len = (l.dur * g.length) / total;
      const c = { from: t0, to: t0 + len, text: g, who: l.who };
      t0 += len;
      return c;
    });
  });

const COLOR: Record<string, string> = { galya: "#7fb2ff", tolyan: "#ff8a8a", zina: "#ffd166", monster: "#7ff0e6", mchs: "#ffa94d" };

/**
 * Оболочка сцены: камера (резкий кадр на говорящего с медленным наездом, общий план на действиях),
 * плашка «ДЕНЬ N ИЗ 30», субтитры, звук (голоса 0 dB, эмбиент и SFX −20 dB с дакингом под речью), зерно и виньетка.
 */
export const Shell = ({ n, focus, children, bare = false }: { n: number; focus: Record<string, [number, number]>; children: (t: number, d: SceneData) => React.ReactNode; bare?: boolean }) => {
  const mute = React.useContext(MuteCtx);
  const f = useCurrentFrame();
  const t = f / 30;
  const d = scene(n);
  const cur = d.lines.find((l) => t >= l.at && t < l.at + l.dur + 0.12);
  const amp: Record<string, number> = {};
  for (const l of d.lines) {
    if (t >= l.at && t < l.at + l.dur) {
      const v = l.env[Math.floor((t - l.at) * 30)] ?? 0;
      if (l.who === "all") ["maks", "galya", "tolyan", "zina", "petrovich", "lyokha", "roma", "sveta", "mikhalych"].forEach((w) => (amp[w] = v));
      else amp[l.who] = v;
    }
  }
  // камера: на реплике героя в кадре — крупнее на нём, иначе общий план
  const fp = cur ? focus[cur.who] : undefined;
  const since = cur ? t - cur.at : 0;
  const z = fp ? 1.16 + since * 0.006 : 1.0 + (t / Math.max(1, d.frames / 30)) * 0.05;
  const [fx, fy] = fp ?? [960, 540];
  const cx = Math.min(1920 - 960 / z, Math.max(960 / z, fx));
  const cy = Math.min(1080 - 540 / z, Math.max(540 / z, fy));
  const talking = (tt: number) => d.lines.some((l) => tt > l.at - 0.05 && tt < l.at + l.dur + 0.05);
  const amb = d.loc === "butchery" ? "amb_storage" : "amb_hall";
  const sub = chunks(d.lines).find((c) => t >= c.from && t < c.to + 0.05);
  const plate = ez(t, 0.1, 0.5);
  if (bare)
    return (
      <AbsoluteFill>
        {sub && <div style={{ position: "absolute", left: 160, width: 1600, top: 900, textAlign: "center", fontFamily: MONT, fontWeight: 900, fontSize: 64, lineHeight: 1.1, textTransform: "uppercase", color: COLOR[sub.who] ?? "#fff", WebkitTextStroke: "12px #000", paintOrder: "stroke fill" }}>{sub.text}</div>}
        {d.sfx.map((s, i) => (
          <Sequence key={i} from={Math.round(s.at * 30)} layout="none"><Audio src={staticFile(`audio/hyper/sfx_${s.name}.mp3`)} volume={0.12} /></Sequence>
        ))}
        {d.lines.map((l) => (
          <Sequence key={l.id} from={Math.round(l.at * 30)} layout="none"><Audio src={staticFile(`audio/hyper/${l.id}.mp3`)} volume={1} /></Sequence>
        ))}
      </AbsoluteFill>
    );
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AmpCtx.Provider value={amp}>
        <MouthCtx.Provider value={{ dima: amp.maks ?? 0, nuance: 0 }}>
          <AbsoluteFill>
            <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
              <Defs />
              <g transform={`translate(960 540) scale(${z}) translate(${-cx} ${-cy})`}>{children(t, d)}</g>
            </svg>
          </AbsoluteFill>
        </MouthCtx.Provider>
      </AmpCtx.Provider>
      {/* зерно + виньетка */}
      <AbsoluteFill style={{ background: "radial-gradient(80% 70% at 50% 45%, rgba(0,0,0,0) 60%, rgba(0,0,0,.5) 100%)", pointerEvents: "none" }} />
      {/* дневник дней */}
      <div style={{ position: "absolute", left: 40, top: 36, transform: `translateX(${(1 - plate) * -40}px)`, opacity: plate, fontFamily: MONT, fontWeight: 900, fontSize: 40, color: "#fff", background: "rgba(10,10,14,.82)", border: "3px solid rgba(255,255,255,.2)", borderRadius: 14, padding: "8px 22px" }}>
        ДЕНЬ <span style={{ color: "#ffd166" }}>{d.day}</span> ИЗ 30
      </div>
      {sub && !mute && (
        <div style={{ position: "absolute", left: 160, width: 1600, top: 900, textAlign: "center", fontFamily: MONT, fontWeight: 900, fontSize: 64, lineHeight: 1.1, textTransform: "uppercase", color: COLOR[sub.who] ?? "#fff", WebkitTextStroke: "12px #000", paintOrder: "stroke fill" }}>{sub.text}</div>
      )}
      {!mute && <>
      <Audio src={staticFile(`audio/hyper/sfx_${amb}.mp3`)} loop volume={(fr) => (talking(fr / 30) ? 0.05 : 0.1)} />
      {d.loc === "checkout" && <Audio src={staticFile("audio/hyper/sfx_blizzard.mp3")} loop volume={(fr) => (talking(fr / 30) ? 0.03 : 0.06)} />}
      {d.sfx.map((s, i) => (
        <Sequence key={i} from={Math.round(s.at * 30)} layout="none">
          <Audio src={staticFile(`audio/hyper/sfx_${s.name}.mp3`)} volume={(fr) => (talking(fr / 30 + s.at) ? 0.05 : 0.1)} />
        </Sequence>
      ))}
      {d.lines.map((l) => (
        <Sequence key={l.id} from={Math.round(l.at * 30)} layout="none">
          <Audio src={staticFile(`audio/hyper/${l.id}.mp3`)} volume={1} />
        </Sequence>
      ))}
      </>}
    </AbsoluteFill>
  );
};

/** Время начала реплики i (по порядку реплик сцены) и метки действия. */
export const at = (d: SceneData, i: number) => d.lines[Math.min(i, d.lines.length - 1)].at;
export const end = (d: SceneData, i: number) => d.lines[Math.min(i, d.lines.length - 1)].at + d.lines[Math.min(i, d.lines.length - 1)].dur;
export const mk = (d: SceneData, name: string) => d.marks[name] ?? 0;
