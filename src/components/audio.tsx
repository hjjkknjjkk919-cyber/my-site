import { Audio } from "@remotion/media";
import { Sequence, staticFile } from "remotion";
import { Cue } from "./fx";

/** Реплика: клип из public/audio/voice, начинается на секунде at сцены. */
export const Say = ({ at, clip, vol = 1 }: { at: number; clip: string; vol?: number }) => (
  <Sequence from={Math.round(at * 30)} layout="none">
    <Audio src={staticFile(`audio/voice/${clip}.wav`)} volume={vol} />
  </Sequence>
);

/** Звук из public/audio/sfx; dur обрезает, loop зацикливает. */
export const Sfx = ({ at = 0, name, vol = 0.6, dur, loop }: { at?: number; name: string; vol?: number | ((frame: number) => number); dur?: number; loop?: boolean }) => (
  <Sequence from={Math.round(at * 30)} durationInFrames={dur ? Math.round(dur * 30) : undefined} layout="none">
    <Audio src={staticFile(`audio/${name}.mp3`)} volume={vol} loop={loop} />
  </Sequence>
);

/**
 * Субтитры под реплику: режет текст на куски по 2–4 слова (по знакам препинания)
 * и делит длительность клипа пропорционально длине кусков.
 */
export const line = (at: number, dur: number, text: string, step?: number): Cue[] => {
  const words = text.split(" ");
  const chunks: string[][] = [[]];
  words.forEach((w) => {
    const cur = chunks[chunks.length - 1];
    cur.push(w);
    const clean = w.replace(/\*/g, "");
    if (cur.length >= 4 || (cur.length >= 2 && /[.,!?…—:]$/.test(clean))) chunks.push([]);
  });
  if (!chunks[chunks.length - 1].length) chunks.pop();
  const total = chunks.reduce((s, c) => s + c.join(" ").length, 0);
  let t = at;
  return chunks.map((c) => {
    const d = (dur * c.join(" ").length) / total;
    const cue = { from: t, to: t + d + 0.05, text: c.join(" "), step };
    t += d;
    return cue;
  });
};

import clips from "../clips.json";

/** Реплика в таймлайне сцены: клип, его субтитры и пауза перед ним (сек). */
export type Beat = { clip: string; text?: string; gap?: number; step?: number };

/**
 * Раскладывает реплики подряд с паузами по реальной длине записей.
 * at[clip] — когда реплика звучит, cues — субтитры, end — конец последней реплики.
 */
export const timeline = (start: number, beats: Beat[]) => {
  let t = start;
  const at: Record<string, { from: number; to: number }> = {};
  const cues: Cue[] = [];
  beats.forEach((b) => {
    t += b.gap ?? 0.7;
    const d = (clips as Record<string, number>)[b.clip];
    if (d === undefined) throw new Error(`Нет клипа ${b.clip}`);
    at[b.clip] = { from: t, to: t + d };
    if (b.text) cues.push(...line(t, d, b.text, b.step));
    t += d;
  });
  return { at, cues, end: t };
};

export type Timeline = ReturnType<typeof timeline>;

/** Все реплики таймлайна. */
export const Voices = ({ tl }: { tl: Timeline }) => (
  <>
    {Object.entries(tl.at).map(([clip, v]) => (
      <Say key={clip} at={v.from} clip={clip} />
    ))}
  </>
);

/** Говорит ли сейчас этот клип. */
export const speaking = (tl: Timeline, clip: string, t: number) => t > tl.at[clip].from && t < tl.at[clip].to;
