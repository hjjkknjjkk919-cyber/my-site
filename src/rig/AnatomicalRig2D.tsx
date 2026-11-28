import React from "react";

export const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

const radToDeg = (rad: number) => (rad * 180) / Math.PI;

/**
 * Жёсткие анатомические ограничители углов (в градусах).
 * Система координат персонажа: +X = вперёд (куда смотрит перс), +Y = вниз.
 * При повороте перса влево оборачиваем корень в scale(-1, 1) — знаки углов сохраняются!
 */
export const JOINT_LIMITS = {
  // Ноги: бедро вперёд (-), назад (+); колено сгибается ТОЛЬКО назад (+)
  hip: [-95, 65] as const,
  knee: [0, 130] as const,
  ankle: [-35, 35] as const,
  // Руки: плечо вперёд (-), назад (+); локоть сгибается ТОЛЬКО вперёд (-)
  shoulder: [-165, 65] as const,
  elbow: [-140, 0] as const,
  wrist: [-40, 40] as const,
};

/** Двухкостная IK для ноги (коленом строго вперёд, сгиб голени строго назад). targetX, targetY — щиколотка относительно тазобедренного сустава. */
export function solveLegIK(targetX: number, targetY: number, thighLen: number, shinLen: number) {
  const minDist = Math.abs(thighLen - shinLen) + 1;
  const maxDist = thighLen + shinLen - 1;
  const rawDist = Math.hypot(targetX, targetY);
  const d = clamp(rawDist, minDist, maxDist);
  const alpha = Math.atan2(-targetX, targetY);
  const cosBeta = clamp((thighLen * thighLen + d * d - shinLen * shinLen) / (2 * thighLen * d), -1, 1);
  const cosGamma = clamp((thighLen * thighLen + shinLen * shinLen - d * d) / (2 * thighLen * shinLen), -1, 1);
  const beta = Math.acos(cosBeta);
  const bend = Math.PI - Math.acos(cosGamma); // всегда >= 0
  const hipDeg = clamp(radToDeg(alpha - beta), ...JOINT_LIMITS.hip);
  const kneeDeg = clamp(radToDeg(bend), ...JOINT_LIMITS.knee);
  // Компенсация наклона голени, чтобы стопа стояла ровно на полу (worldAngle = 0)
  const ankleDeg = clamp(-(hipDeg + kneeDeg), ...JOINT_LIMITS.ankle);
  return { hipDeg, kneeDeg, ankleDeg };
}

/** Двухкостная IK для руки (локтем строго назад, сгиб предплечья строго вперёд). targetX, targetY — запястье относительно плечевого сустава. */
export function solveArmIK(targetX: number, targetY: number, upperArmLen: number, forearmLen: number) {
  const minDist = Math.abs(upperArmLen - forearmLen) + 1;
  const maxDist = upperArmLen + forearmLen - 1;
  const rawDist = Math.hypot(targetX, targetY);
  const d = clamp(rawDist, minDist, maxDist);
  const alpha = Math.atan2(-targetX, targetY);
  const cosBeta = clamp((upperArmLen * upperArmLen + d * d - forearmLen * forearmLen) / (2 * upperArmLen * d), -1, 1);
  const cosGamma = clamp((upperArmLen * upperArmLen + forearmLen * forearmLen - d * d) / (2 * upperArmLen * forearmLen), -1, 1);
  const beta = Math.acos(cosBeta);
  const bend = Math.PI - Math.acos(cosGamma);
  const shoulderDeg = clamp(radToDeg(alpha + beta), ...JOINT_LIMITS.shoulder);
  const elbowDeg = clamp(-radToDeg(bend), ...JOINT_LIMITS.elbow);
  const wristDeg = clamp(-(shoulderDeg + elbowDeg) * 0.4, ...JOINT_LIMITS.wrist);
  return { shoulderDeg, elbowDeg, wristDeg };
}

/** Капсула сегмента конечности: центры скруглений строго в (0,0) и (0,length) — стык без дыр при любом повороте. */
export const CapsuleSegment: React.FC<{ length: number; rTop: number; rBottom: number; fill: string; stroke?: string; strokeWidth?: number }> = ({ length, rTop, rBottom, fill, stroke = "#1c1c1c", strokeWidth = 3 }) => {
  const d = `M ${-rTop} 0 A ${rTop} ${rTop} 0 0 1 ${rTop} 0 L ${rBottom} ${length} A ${rBottom} ${rBottom} 0 0 1 ${-rBottom} ${length} Z`;
  return <path d={d} fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" strokeLinecap="round" />;
};

/** Итоговые (после ограничителей) углы цепочки — те же формулы, что внутри LimbChain2D. */
export const chainAngles = (type: "arm" | "leg", angle1: number, angle2: number, angle3 = 0, keepEndLevel = false) => {
  const limits1 = type === "arm" ? JOINT_LIMITS.shoulder : JOINT_LIMITS.hip;
  const limits2 = type === "arm" ? JOINT_LIMITS.elbow : JOINT_LIMITS.knee;
  const limits3 = type === "arm" ? JOINT_LIMITS.wrist : JOINT_LIMITS.ankle;
  const a1 = clamp(angle1, limits1[0], limits1[1]);
  const a2 = clamp(angle2, limits2[0], limits2[1]);
  const raw3 = keepEndLevel ? -(a1 + a2) + angle3 : angle3;
  const a3 = clamp(raw3, limits3[0], limits3[1]);
  return { a1, a2, a3, world: a1 + a2 + a3 };
};

/**
 * Иерархическая цепочка из 3 суставов (Плечо → Локоть → Кисть или Бедро → Колено → Стопа).
 * Дочерний сустав жёстко привязан к (0, parentLength), поэтому разрыв сустава невозможен.
 * decor1/decor2 — детали поверх капсул (лампасы, складки) в локальных координатах сегмента.
 */
export const LimbChain2D: React.FC<{
  type: "arm" | "leg";
  rootX: number;
  rootY: number;
  angle1: number;
  angle2: number;
  angle3?: number;
  len1: number;
  len2: number;
  r1: number;
  r2: number;
  r3: number;
  color1: string;
  color2: string;
  keepEndLevel?: boolean;
  renderEndEffector: () => React.ReactNode;
  decor1?: React.ReactNode;
  decor2?: React.ReactNode;
}> = ({ type, rootX, rootY, angle1, angle2, angle3 = 0, len1, len2, r1, r2, r3, color1, color2, keepEndLevel = false, renderEndEffector, decor1, decor2 }) => {
  const { a1, a2, a3 } = chainAngles(type, angle1, angle2, angle3, keepEndLevel);
  return (
    <g transform={`translate(${rootX}, ${rootY}) rotate(${a1})`}>
      <CapsuleSegment length={len1} rTop={r1} rBottom={r2} fill={color1} />
      {decor1}
      {/* Средний сустав (локоть / колено) строго в конце первой кости */}
      <g transform={`translate(0, ${len1}) rotate(${a2})`}>
        <CapsuleSegment length={len2} rTop={r2} rBottom={r3} fill={color2} />
        {decor2}
        {/* Крайний сустав (запястье / лодыжка) строго в конце второй кости */}
        <g transform={`translate(0, ${len2}) rotate(${a3})`}>{renderEndEffector()}</g>
      </g>
    </g>
  );
};
