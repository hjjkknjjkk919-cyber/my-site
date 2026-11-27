import React from "react";
import { AbsoluteFill, Freeze, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { ez, MONT } from "../../pelmeni/kit";
import GAME from "./game.json";
import VO from "./vo.json";

export const REMAKE_FRAMES = Math.round(55 * 30);
const TOP_H = 1152; // верх 60% — мульт, низ 40% — залипалка
const COL = ["#39ff6a", "#3fc8ff"];
const LABEL = ["Ч", "П"];

/* ── верх: исходный ролик без звука, кадр без вшитых субтитров; после 53 с — стоп-кадр ── */
const Story = () => {
  const end = Math.round(VO.end * 30);
  const video = <OffthreadVideo src={staticFile("remake/src.mp4")} muted style={{ width: 1080, height: 1920, position: "absolute", top: -60 }} />;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: TOP_H, overflow: "hidden", background: "#111" }}>
      <Sequence durationInFrames={end} layout="none">{video}</Sequence>
      <Sequence from={end} layout="none">
        <Freeze frame={end - 3}>{video}</Freeze>
      </Sequence>
    </div>
  );
};

/* ── низ: два шара в круге, лучи от точек удара о стенку, искры, счёт ── */
const Game = ({ f, t }: { f: number; t: number }) => {
  const fr = GAME.frames[Math.min(f, GAME.frames.length - 1)];
  const pos = [[fr[0], fr[1]], [fr[2], fr[3]]];
  const past = GAME.hits.filter((h) => h.t <= t);
  const score = [0, 1].map((b) => past.filter((h) => h.b === b).length);
  const clash = GAME.clashes.filter((c) => t >= c.t && t < c.t + 0.4);
  return (
    <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={6} result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id="circ"><circle cx={GAME.cx} cy={GAME.cy} r={GAME.r} /></clipPath>
      </defs>
      <g clipPath="url(#circ)">
        {[0, 1].map((b) => (
          <g key={b} stroke={COL[b]} strokeWidth={2.2} opacity={0.75}>
            {past.filter((h) => h.b === b).slice(-70).map((h, i, arr) => (
              <line key={i} x1={h.x} y1={h.y} x2={pos[b][0]} y2={pos[b][1]} opacity={0.35 + 0.65 * (i / arr.length)} />
            ))}
          </g>
        ))}
        {/* искры от свежих ударов */}
        {past.filter((h) => t - h.t < 0.45).map((h, i) => {
          const k = (t - h.t) / 0.45;
          return Array.from({ length: 8 }, (_, j) => {
            const a = (j / 8) * Math.PI * 2 + h.t * 7;
            return <circle key={`${i}-${j}`} cx={h.x + (GAME.cx - h.x) * 0.15 * k + Math.cos(a) * 60 * k} cy={h.y + (GAME.cy - h.y) * 0.15 * k + Math.sin(a) * 60 * k} r={3.5 * (1 - k)} fill={COL[h.b]} />;
          });
        })}
        {clash.map((c, i) => {
          const k = (t - c.t) / 0.4;
          return <circle key={i} cx={c.x} cy={c.y} r={30 + 120 * k} fill="none" stroke="#fff" strokeWidth={6 * (1 - k)} opacity={1 - k} />;
        })}
      </g>
      <circle cx={GAME.cx} cy={GAME.cy} r={GAME.r} fill="none" stroke="#f4f4f4" strokeWidth={8} />
      {[0, 1].map((b) => (
        <g key={b} filter="url(#glow)">
          <circle cx={pos[b][0]} cy={pos[b][1]} r={GAME.br} fill="#0c0f14" stroke={COL[b]} strokeWidth={8} />
          <text x={pos[b][0]} y={pos[b][1] + 15} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={42} fill="#fff">{LABEL[b]}</text>
        </g>
      ))}
      {/* счёт */}
      <g fontFamily={MONT} fontWeight={900}>
        <text x={400} y={GAME.cy - GAME.r + 95} textAnchor="middle" fontSize={52} fill={COL[0]} opacity={0.85}>{score[0]}</text>
        <text x={540} y={GAME.cy - GAME.r + 95} textAnchor="middle" fontSize={36} fill="#fff" opacity={0.5}>:</text>
        <text x={680} y={GAME.cy - GAME.r + 95} textAnchor="middle" fontSize={52} fill={COL[1]} opacity={0.85}>{score[1]}</text>
        <text x={400} y={GAME.cy - GAME.r + 125} textAnchor="middle" fontSize={20} fill={COL[0]} opacity={0.7}>ЧУШПАНЫ</text>
        <text x={680} y={GAME.cy - GAME.r + 125} textAnchor="middle" fontSize={20} fill={COL[1]} opacity={0.7}>ПАЦАНЫ</text>
      </g>
    </svg>
  );
};

/* ── крупное слово на стыке: слово за словом по таймингу реплики ── */
const BigWord = ({ t }: { t: number }) => {
  const line = VO.lines.find((l) => t >= l.at && t < l.at + l.dur + 0.15);
  if (!line) return null;
  const words = line.text.split(/\s+/).filter((w) => w !== "—");
  const total = words.reduce((s, w) => s + w.length + 1, 0);
  let acc = 0;
  let cur = words[words.length - 1];
  let from = line.at;
  for (const w of words) {
    const len = (line.dur * (w.length + 1)) / total;
    if (t < line.at + acc + len) {
      cur = w;
      from = line.at + acc;
      break;
    }
    acc += len;
  }
  const k = ez(t, from, from + 0.08);
  const boss = line.who !== "hero";
  return (
    <div style={{ position: "absolute", left: 0, top: TOP_H - 82, width: 1080, textAlign: "center", fontFamily: MONT, fontWeight: 900, fontSize: 112, lineHeight: 1, color: boss ? "#ffd23a" : "#fff", WebkitTextStroke: "16px #000", paintOrder: "stroke fill", transform: `scale(${0.85 + 0.15 * k})` }}>
      {cur.replace(/[.,!?:]+$/, "").toLowerCase()}
    </div>
  );
};

const EndCard = ({ t }: { t: number }) => {
  const k = ez(t, VO.end, VO.end + 0.4);
  if (k <= 0) return null;
  return (
    <>
      <AbsoluteFill style={{ height: TOP_H, background: `rgba(0,0,0,${0.55 * k})` }} />
      <div style={{ position: "absolute", left: 70, top: 420, width: 940, textAlign: "center", fontFamily: MONT, fontWeight: 900, fontSize: 92, color: "#fff", WebkitTextStroke: "14px #000", paintOrder: "stroke fill", opacity: k }}>
        ЧАСТЬ 3<br />
        <span style={{ color: "#ffd23a" }}>ЗАВТРА</span>
      </div>
      <div style={{ position: "absolute", left: 70, top: 1620, width: 940, textAlign: "center", fontFamily: MONT, fontWeight: 900, fontSize: 52, color: "#fff", WebkitTextStroke: "10px #000", paintOrder: "stroke fill", opacity: k }}>
        КТО ПОБЕДИЛ? ПИШИ В КОММЕНТЫ
      </div>
    </>
  );
};

export const Remake90s = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Story />
      <Game f={f} t={t} />
      <div style={{ position: "absolute", left: 0, top: TOP_H - 3, width: 1080, height: 6, background: "#fff", opacity: 0.85 }} />
      <BigWord t={t} />
      <EndCard t={t} />
      {VO.lines.map((l) => (
        <Sequence key={l.file} from={Math.round(l.at * 30)} layout="none">
          <Audio src={staticFile(`remake/${l.file}.mp3`)} volume={1} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
