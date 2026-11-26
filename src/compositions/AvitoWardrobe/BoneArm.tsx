import React from "react";

/**
 * Эталонная рука из ТЗ: плечо → (rotate) предплечье → кисть, локоть только 0..115° (без вывиха назад),
 * предмет между ладонью и фалангами. Персонажи используют ту же схему в rig.tsx (Arm + GripHand) с IK.
 */
export const BoneArm: React.FC<{ shoulderX: number; shoulderY: number; upperAngleDeg: number; elbowAngleDeg: number; shirtColor?: string; skinColor?: string; propElement?: React.ReactNode }> = ({ shoulderX, shoulderY, upperAngleDeg, elbowAngleDeg, shirtColor = "#52525B", skinColor = "#E7C6A5", propElement }) => {
  const safeElbow = Math.max(-10, Math.min(115, elbowAngleDeg));
  return (
    <g transform={`translate(${shoulderX}, ${shoulderY}) rotate(${upperAngleDeg})`}>
      <rect x={-11} y={-6} width={22} height={68} rx={11} fill={skinColor} stroke="#18181B" strokeWidth={3} />
      <path d="M -13 -4 H 13 V 34 H -13 Z" fill={shirtColor} stroke="#18181B" strokeWidth={3} />
      <g transform={`translate(0, 56) rotate(${-safeElbow})`}>
        <rect x={-10} y={-6} width={20} height={64} rx={10} fill={skinColor} stroke="#18181B" strokeWidth={3} />
        <g transform="translate(0, 54)">
          <circle cx={0} cy={6} r={12} fill={skinColor} stroke="#18181B" strokeWidth={3} />
          {propElement && <g transform="translate(8, 4)">{propElement}</g>}
          <rect x={-4} y={0} width={16} height={13} rx={6} fill={skinColor} stroke="#18181B" strokeWidth={2.5} />
        </g>
      </g>
    </g>
  );
};
