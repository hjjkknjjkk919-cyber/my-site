import { useCurrentFrame, useVideoConfig } from "remotion";
import { type MediaUtilsAudioData, useAudioData, visualizeAudio } from "@remotion/media-utils";

export type Viseme = "closed" | "narrow" | "open" | "wide";

/** Калибровка: сырые значения visualizeAudio для наших реплик ~0.01–0.05, усиление приводит их к порогам визем. */
const SPEECH_GAIN = 8;

/** Энергия речевого диапазона (300–3000 Гц → полосы 2..12) на кадре реплики. */
export const speechEnergy = (audioData: MediaUtilsAudioData | null, frame: number, fps: number) => {
  if (!audioData || frame < 0) return 0;
  const spectrum = visualizeAudio({ fps, frame, audioData, numberOfSamples: 32 });
  const speechBins = spectrum.slice(2, 13);
  return Math.min(1, (speechBins.reduce((sum, val) => sum + val, 0) / speechBins.length) * SPEECH_GAIN);
};

/** 4 виземы по энергии голоса. */
export const visemeOf = (energy: number): Viseme => (energy > 0.38 ? "wide" : energy > 0.2 ? "open" : energy > 0.07 ? "narrow" : "closed");

/** Хук для компонента внутри <Sequence> реплики: визема + микро-кивок головы. */
export const useLipSync = (audioSrc: string | null, isSpeaking: boolean): { viseme: Viseme; headNodDeg: number } => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const audioData = useAudioData(audioSrc ?? "");
  if (!audioSrc || !isSpeaking || !audioData) return { viseme: "closed", headNodDeg: 0 };
  const energy = speechEnergy(audioData, frame, fps);
  return { viseme: visemeOf(energy), headNodDeg: energy > 0.28 ? Math.sin(frame * 0.8) * 2.5 : 0 };
};
