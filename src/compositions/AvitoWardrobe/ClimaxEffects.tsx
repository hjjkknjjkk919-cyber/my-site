import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { MONT } from "../../pelmeni/kit";

/** Вспышка верхнего света на весь кадр (кадры — локальные в сцене). */
export const LightFlashOverlay: React.FC<{ triggerFrame: number }> = ({ triggerFrame }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [triggerFrame, triggerFrame + 3, triggerFrame + 14], [0, 0.92, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (opacity <= 0) return null;
  return <div style={{ position: "absolute", inset: 0, backgroundColor: "#FFFBEB", opacity, pointerEvents: "none", zIndex: 40 }} />;
};

/** Разлетающиеся купюры 5000 ₽ (рисуется внутри <svg>). */
export const FlyingBills: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const progress = frame - startFrame;
  if (progress < 0) return null;
  const bills = [
    { x: 320, vx: -6, vy: -14, rot: -18 },
    { x: 410, vx: 4, vy: -18, rot: 12 },
    { x: 490, vx: 9, vy: -12, rot: 28 },
    { x: 360, vx: -3, vy: -16, rot: -8 },
    { x: 450, vx: 7, vy: -15, rot: 21 },
  ];
  return (
    <g>
      {bills.map((b, i) => {
        const t = progress * 0.65;
        const cx = b.x + b.vx * t;
        const cy = 780 + b.vy * t + 0.45 * t * t;
        const angle = b.rot + progress * (i % 2 === 0 ? 4 : -4);
        return (
          <g key={i} transform={`translate(${cx}, ${cy}) rotate(${angle})`}>
            <rect x={-42} y={-20} width={84} height={40} rx={4} fill="#F472B6" stroke="#18181B" strokeWidth={2.5} />
            <text x={0} y={6} textAnchor="middle" fontFamily={MONT} fontSize={16} fontWeight={900} fill="#831843">5000 ₽</text>
          </g>
        );
      })}
    </g>
  );
};
