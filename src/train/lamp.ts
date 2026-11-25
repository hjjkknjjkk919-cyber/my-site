import { random } from "remotion";

/**
 * Неисправная люминесцентная лампа: в основном ровный свет с лёгким шумом,
 * изредка короткие провалы (0.08–0.25 с) и совсем редко — серия из 2–3 быстрых миганий.
 * Одна функция для всех сцен, чтобы мигание было одинаковым.
 */
const BUCKET = 1.3;
export const lampDip = (b: number) => {
  const r = random(`lamp${b}`);
  if (r < 0.18) return { at: b * BUCKET + random(`la${b}`) * 0.9, len: 0.08 + random(`ll${b}`) * 0.17, burst: 1 };
  if (r < 0.24) return { at: b * BUCKET + random(`la${b}`) * 0.6, len: 0.5, burst: 3 };
  return null;
};
export const lamp = (t: number) => {
  const b = Math.floor(t / BUCKET);
  let v = 1 - 0.025 + 0.025 * Math.sin(t * 47) * Math.sin(t * 13); // мелкая нестабильность
  for (const bb of [b - 1, b]) {
    const d = lampDip(bb);
    if (!d || t < d.at || t > d.at + d.len) continue;
    const k = (t - d.at) / d.len;
    if (d.burst === 1) v = 0.38;
    else v = Math.sin(k * Math.PI * d.burst * 2) > 0 ? 0.3 : 0.95;
  }
  return v;
};
/** Моменты провалов в интервале [from, to) — чтобы ставить треск лампы в звук. */
export const lampDipsIn = (from: number, to: number) => {
  const out: number[] = [];
  for (let b = Math.floor(from / BUCKET) - 1; b <= Math.floor(to / BUCKET); b++) {
    const d = lampDip(b);
    if (d && d.at >= from && d.at < to) out.push(d.at);
  }
  return out;
};
