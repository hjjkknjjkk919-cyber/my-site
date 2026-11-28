import React from "react";
import { MONT } from "../../pelmeni/kit";

const LINE = "#16121a";
const SK = "#e9c4a8";
const SK_SH = "#c99c80";
const OUT = { stroke: LINE, strokeWidth: 5, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

/**
 * Дима сверху под ~35° на подушке (2D SVG, 1080×1920). stage 1 — лёгкий страх, 2 — ужас и скрип зубов, 3 — слёзы и сопли.
 * k — прогресс сегмента 0..1, t — секунды, flinch — вздрагивание от звука.
 */
export const DimaTop = ({ stage, k, t, flinch = 0 }: { stage: 1 | 2 | 3; k: number; t: number; flinch?: number }) => {
  const zoom = stage === 1 ? 1 + 0.05 * k : stage === 2 ? 1.08 + 0.1 * k : 1.12;
  const shake = stage === 2 ? [Math.sin(t * 43) * 2.5, Math.cos(t * 37) * 2.5] : [0, flinch * Math.sin(t * 60) * 6];
  const dart = stage === 1 ? Math.sin(t * 2.4) * 0.35 - 0.2 : stage === 2 ? Math.sin(t * 7) * 0.15 : 0.1;
  const pupilR = stage === 2 ? 7 : stage === 3 ? 10 : 11;
  const eyeRy = stage === 2 ? 30 : stage === 3 ? 22 : 26;
  const jaw = stage === 2 ? Math.sin(t * 54) * 1.6 : 0;
  const trem = stage === 3 ? Math.sin(t * 19) * 3 : 0;
  // брови: 1 — чуть приподняты, 2 — резко сведены, 3 — «домиком»
  const brow = stage === 1 ? "M380 728 Q440 712 492 724 M588 724 Q640 712 700 728" : stage === 2 ? "M380 716 Q440 730 500 750 M580 750 Q640 730 700 716" : "M380 748 Q440 730 494 706 M586 706 Q640 730 700 748";
  return (
    <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
      <defs>
        <radialGradient id="dtBlue" cx="0.35" cy="0.25" r="0.7">
          <stop offset="0%" stopColor="#7fa6ff" stopOpacity={0.45} />
          <stop offset="100%" stopColor="#7fa6ff" stopOpacity={0} />
        </radialGradient>
        <linearGradient id="dtDrop" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.95} />
          <stop offset="100%" stopColor="#9fc4ff" stopOpacity={0.55} />
        </linearGradient>
        {[-1, 1].map((d) => <clipPath key={d} id={`dtEye${d}`}><ellipse cx={540 + d * 96} cy={800} rx={56} ry={eyeRy} /></clipPath>)}
      </defs>
      <rect width={1080} height={1920} fill="#070912" />
      <g transform={`translate(${540 + shake[0]} ${900 + shake[1]}) scale(${zoom}) translate(-540 -900)`}>
        {/* подушка и одеяло */}
        <rect x={110} y={420} width={860} height={900} rx={160} fill="#2b3346" />
        <path d="M150 520 Q540 440 930 520 L930 1200 Q540 1260 150 1200 Z" fill="#3a4560" />
        {/* край тумбочки с часами 03:17 */}
        <g transform="rotate(-8 150 380)">
          <rect x={-60} y={240} width={300} height={260} rx={10} fill="#3a2618" {...OUT} />
          <rect x={20} y={300} width={180} height={80} rx={10} fill="#050505" {...OUT} />
          <text x={110} y={360} textAnchor="middle" fontFamily="monospace" fontWeight={900} fontSize={54} fill="#ff2020" style={{ filter: "drop-shadow(0 0 10px #ff0000)" }}>03:17</text>
          <ellipse cx={110} cy={340} rx={150} ry={90} fill="#ff2020" opacity={0.08} />
        </g>
        {/* голова (верх головы — вверх кадра) */}
        <g>
          <ellipse cx={540} cy={860} rx={215} ry={250} fill={SK} {...OUT} />
          {[-1, 1].map((d) => <ellipse key={d} cx={540 + d * 210} cy={860} rx={26} ry={44} fill={SK} {...OUT} />)}
          <path d="M330 760 C320 600 420 560 540 556 C660 560 760 600 750 760 L728 720 L700 772 L668 704 L636 770 L600 700 L566 768 L530 698 L496 768 L462 704 L430 772 L398 712 L366 770 Z" fill="#3a2a22" {...OUT} />
          <path d="M700 640 C740 700 748 780 736 880" stroke={SK_SH} strokeWidth={14} fill="none" opacity={0.6} />
          {/* глаза: белок, зрачок и веко внутри clipPath */}
          {[-1, 1].map((d) => (
            <g key={d}>
              <ellipse cx={540 + d * 96} cy={800} rx={56} ry={eyeRy} fill="#fbf8f2" />
              <g clipPath={`url(#dtEye${d})`}>
                <circle cx={540 + d * 96 + dart * 30} cy={804} r={pupilR} fill="#151214" />
                <circle cx={540 + d * 96 + dart * 30 + 4} cy={798} r={3} fill="#fff" />
                {stage === 3 && <rect x={540 + d * 96 - 60} y={800 - eyeRy - 2} width={120} height={eyeRy * 0.6} fill={SK} />}
              </g>
              <ellipse cx={540 + d * 96} cy={800} rx={56} ry={eyeRy} fill="none" {...OUT} />
              <path d={`M${540 + d * 96 - 50} ${838 + (stage === 3 ? 4 : 0)} q50 16 100 0`} stroke={stage === 3 ? "#d98080" : SK_SH} strokeWidth={6} fill="none" />
            </g>
          ))}
          <path d={brow} stroke="#3a2a22" strokeWidth={16} strokeLinecap="round" fill="none" />
          <path d="M540 820 q-14 60 6 78" {...OUT} fill="none" />
          {/* щетина */}
          {Array.from({ length: 60 }, (_, i) => {
            const a = i * 2.39996;
            const r = Math.sqrt((i + 0.5) / 60);
            return <circle key={i} cx={540 + Math.cos(a) * r * 120} cy={1010 + Math.sin(a) * r * 40} r={2.2} fill="#3a2a22" opacity={0.45} />;
          })}
          {/* рот */}
          {stage === 1 && <path d="M486 980 Q540 990 594 978" {...OUT} fill="none" />}
          {stage === 2 && (
            <g transform={`translate(${jaw} 0)`}>
              <path d="M470 966 Q540 950 610 966 Q600 1004 540 1006 Q480 1004 470 966 Z" fill="#3b0d11" {...OUT} />
              <rect x={482} y={966} width={116} height={30} rx={8} fill="#f4f1ea" stroke={LINE} strokeWidth={3} />
              {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={502 + i * 19} y1={968} x2={502 + i * 19} y2={994} stroke="#b9b2a6" strokeWidth={2} />)}
              <line x1={484} y1={981} x2={596} y2={981} stroke="#b9b2a6" strokeWidth={2} />
            </g>
          )}
          {stage === 3 && <path d={`M480 ${1000 + trem} Q510 ${970 - trem} 540 ${978 + trem} Q570 ${970 + trem} 600 ${1000 - trem}`} {...OUT} fill="none" />}
          {/* холодный синий блик из окна на лбу */}
          <ellipse cx={500} cy={700} rx={260} ry={200} fill="url(#dtBlue)" />
        </g>
        {/* пот */}
        {stage >= 1 && <path d={`M712 ${700 + k * 300} q10 18 0 30 q-14 -4 -10 -18 Z`} fill="url(#dtDrop)" stroke="#b9d4ff" strokeWidth={2} />}
        {stage === 2 &&
          [[420, 640], [610, 650], [360, 760], [730, 780], [500, 660]].map(([x, y], i) => (
            <g key={i}>
              <path d={`M${x} ${y} q${(i % 2 ? 6 : -6)} ${60 * k + 20} ${(i % 2 ? 2 : -2)} ${120 * k + 30}`} stroke="#cfe0ff" strokeWidth={6} opacity={0.55} fill="none" strokeLinecap="round" />
              <path d={`M${x} ${y + 120 * k + 30} q8 14 0 24 q-12 -4 -8 -14 Z`} fill="url(#dtDrop)" />
            </g>
          ))}
        {/* слёзы и сопли */}
        {stage === 3 && (
          <g>
            {[-1, 1].map((d) => (
              <g key={d}>
                <path d={`M${540 + d * 150} 820 C${540 + d * 170} ${880 + k * 80} ${540 + d * 200} ${960 + k * 160} ${540 + d * 230} ${1000 + k * 220}`} stroke="#d7e8ff" strokeWidth={14} opacity={0.65} fill="none" strokeLinecap="round" />
                <ellipse cx={540 + d * 230} cy={1004 + k * 220 + ((t * 120) % 60)} rx={12} ry={18} fill="url(#dtDrop)" stroke="#b9d4ff" strokeWidth={2} />
              </g>
            ))}
            <path d="M524 902 C516 920 522 944 532 952 C540 958 552 950 552 934 C552 918 548 906 544 900 Z" fill="rgba(200,230,170,.75)" stroke="#a8c690" strokeWidth={2} />
            <circle cx={534} cy={924} r={5} fill="#fff" opacity={0.9} />
          </g>
        )}
      </g>
      <text x={-100} y={-100} fontFamily={MONT}>.</text>
    </svg>
  );
};
