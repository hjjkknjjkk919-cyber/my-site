import React from "react";
import { AbsoluteFill } from "remotion";
import { Pushistik } from "../Pushistik/Pushistik1";

/** Аватарка канала «милые анимации»: Пушистик машет, пастельный фон, сердечки и искры. Всё важное — внутри круга. */
const Heart = ({ x, y, s, c }: { x: number; y: number; s: number; c: string }) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} d="M0 30 C-40 0 -40 -30 -15 -32 C0 -33 0 -20 0 -14 C0 -20 0 -33 15 -32 C40 -30 40 0 0 30 Z" fill={c} stroke="#2a1f24" strokeWidth={4} vectorEffect="non-scaling-stroke" />
);
const Spark = ({ x, y, s }: { x: number; y: number; s: number }) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} d="M0 -30 L8 -8 L30 0 L8 8 L0 30 L-8 8 L-30 0 L-8 -8 Z" fill="#fff6b0" stroke="#2a1f24" strokeWidth={3} vectorEffect="non-scaling-stroke" />
);

export const Avatar = () => (
  <AbsoluteFill>
    <svg viewBox="0 0 1080 1080" width={1080} height={1080}>
      <defs>
        <radialGradient id="av-bg" cx="0.5" cy="0.45" r="0.7">
          <stop offset="0%" stopColor="#fff3f6" />
          <stop offset="60%" stopColor="#ffc8d6" />
          <stop offset="100%" stopColor="#c9b6ff" />
        </radialGradient>
      </defs>
      <rect width={1080} height={1080} fill="url(#av-bg)" />
      {Array.from({ length: 14 }, (_, i) => <circle key={i} cx={(i * 197) % 1080} cy={(i * 331) % 1080} r={18 + (i % 3) * 8} fill="#ffffff" opacity={0.45} />)}
      <g transform="translate(540 1230) scale(1.55)">
        <Pushistik t={0.9} arms={0.62} bend={-0.05} creep={0} voidEyes={false} talk={0.55} />
      </g>
      <Heart x={250} y={300} s={1.6} c="#ff6b8b" />
      <Heart x={840} y={260} s={1.1} c="#ff9db3" />
      <Heart x={880} y={560} s={0.8} c="#ff6b8b" />
      <Spark x={200} y={560} s={1.1} />
      <Spark x={790} y={400} s={0.8} />
      <Spark x={330} y={180} s={0.6} />
    </svg>
  </AbsoluteFill>
);
