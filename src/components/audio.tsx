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
export const Sfx = ({ at = 0, name, vol = 0.6, dur, loop, duck }: { at?: number; name: string; vol?: number | ((frame: number) => number); dur?: number; loop?: boolean; duck?: Timeline }) => {
  const start = Math.round(at * 30);
  // duck: фон сам притихает, пока кто-то говорит (кадры звука локальные от начала звука)
  const volume = (f: number) => {
    const base = typeof vol === "function" ? vol(f) : vol;
    if (!duck) return base;
    const t = (f + start) / 30;
    const talking = Object.values(duck.at).some((v) => t > v.from - 0.1 && t < v.to + 0.1);
    return talking ? base * 0.35 : base;
  };
  return (
    <Sequence from={start} durationInFrames={dur ? Math.round(dur * 30) : undefined} layout="none">
      <Audio src={staticFile(`audio/${name}.mp3`)} volume={volume} loop={loop} />
    </Sequence>
  );
};

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
    // реплики героев в кавычках, рассказчик (клипы n..) — без
    const quoted = b.text && !b.clip.startsWith("n") && !b.text.includes("«") ? `«${b.text}»` : b.text;
    if (quoted) cues.push(...line(t, d, quoted, b.step));
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

import envelopes from "../envelopes.json";

/** Насколько открыт рот (0..1) по громкости реальной записи; 0 — молчит. */
export const lip = (tl: Timeline, clipsList: string[], t: number) => {
  let v = 0;
  clipsList.forEach((c) => {
    const at = tl.at[c];
    if (!at || t < at.from || t >= at.to) return;
    const env = (envelopes as Record<string, number[]>)[c];
    v = Math.max(v, env[Math.min(env.length - 1, Math.floor((t - at.from) * 30))] ?? 0);
  });
  return v;
};
