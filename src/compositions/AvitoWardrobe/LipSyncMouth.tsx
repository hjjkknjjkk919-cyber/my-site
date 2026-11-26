import React from "react";
import type { Viseme } from "./useLipSync";

/** Рот по виземе: Дима — ровная линия → овал с зубами; Нюанс — кривая ухмылка с острыми зубами и отвисающей челюстью. */
export const LipSyncMouth: React.FC<{ viseme: Viseme; variant: "dima" | "nuance"; x: number; y: number }> = ({ viseme, variant, x, y }) => {
  if (variant === "dima") {
    if (viseme === "closed") return <path d={`M ${x - 16} ${y} Q ${x} ${y + 2} ${x + 16} ${y - 1}`} stroke="#18181B" strokeWidth={3.5} strokeLinecap="round" fill="none" />;
    const ry = viseme === "narrow" ? 5 : viseme === "open" ? 10 : 15;
    return (
      <g transform={`translate(${x}, ${y + 3})`}>
        <ellipse cx={0} cy={0} rx={15} ry={ry} fill="#3B0D11" stroke="#18181B" strokeWidth={3} />
        {ry >= 10 && <rect x={-10} y={-ry + 2} width={20} height={4} rx={2} fill="#F4F4F5" />}
        {ry >= 15 && <ellipse cx={0} cy={ry - 5} rx={8} ry={4} fill="#c45a5a" />}
      </g>
    );
  }
  const jawDrop = viseme === "closed" ? 0 : viseme === "narrow" ? 7 : viseme === "open" ? 14 : 21;
  return (
    <g transform={`translate(${x}, ${y})`}>
      <path d={`M -26 -4 Q 0 ${6 + jawDrop} 26 -6 Q 0 ${2 + jawDrop * 1.3} -26 -4 Z`} fill="#090A0D" stroke="#000000" strokeWidth={2.5} />
      <path d="M -18 -2 L -13 5 L -8 -1 L -2 6 L 4 -1 L 10 5 L 16 -2" stroke="#E4E4E7" strokeWidth={2.5} fill="none" strokeLinejoin="round" />
    </g>
  );
};
