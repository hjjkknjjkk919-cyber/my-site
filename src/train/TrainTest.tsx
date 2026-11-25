import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { clamp, ease, Finish, Svg, useT } from "../components/fx";
import { DIMA as DIMA_BASE, Hero, onGround } from "../components/Hero";
import { Creature, Wagon, WAGON_LEN } from "./Wagon";
import { FaceCU } from "./FaceCU";

/** Пробные кадры «Последняя электричка»: 3D-вагон, существо за стеклом, лицо крупно. */

const DIMA: typeof DIMA_BASE = { ...DIMA_BASE, legs: 1.45 };

/** Мигание ламп: в основном горят, иногда проваливаются. */
const flicker = (t: number, rate = 1) => {
  const a = Math.sin(t * 13 * rate) + Math.sin(t * 29 * rate + 1);
  return a < -1.6 ? 0.15 : 0.85 + 0.15 * Math.sin(t * 50);
};

/** 1. Полёт камеры по пустому вагону к спящему Диме. */
const FlyThrough = () => {
  const t = useT();
  const cam = { x: Math.sin(t * 0.7) * 10, y: 160, z: ease(t, 0, 5, 60, 1500), roll: Math.sin(t * 2.2) * 0.8 };
  const light = flicker(t);
  return (
    <AbsoluteFill>
      <Wagon
        cam={cam}
        t={t}
        light={light}
        actors={[
          {
            z: 1900,
            x: -95,
            node: (p) => {
              const s = (230 * p.k) / 2400;
              return <Hero cfg={DIMA} x={p.x} y={p.y - 230 * p.k * 0.62} s={s} t={t} emotion="calm" lid={0.95} frost={0} wind={0.1} />;
            },
          },
        ]}
      />
      <Finish vig={1} tint="#20304a" tintOpacity={0.18} grain={1.1} bigSnow={false} />
    </AbsoluteFill>
  );
};

/** 2. Через стекло двери: с каждой вспышкой существо ближе, в конце прилипает к стеклу. */
const ThroughGlass = () => {
  const t = useT();
  const step = Math.floor(t / 0.9);
  const on = (t % 0.9) < 0.45;
  const near = clamp(step / 4);
  const lunge = ease(t, 3.8, 4.1, 0, 1);
  const cam = { x: 0, y: 150, z: ease(t, 0, 4, WAGON_LEN - 700, WAGON_LEN - 420) + lunge * 120 };
  const beyond = (
    <g>
      {on && <rect width="400" height="600" fill="#1c2630" />}
      {/* соседний вагон: перспектива прохода */}
      {on && <path d="M0 600 L150 330 L250 330 L400 600 Z" fill="#2c3238" />}
      {(on || lunge > 0) && <Creature t={t} x={200} y={260 + near * 80 + lunge * 60} s={0.35 + near * 0.55 + lunge * 1.4} flash={on || lunge > 0 ? 1 : 0} lunge={lunge} />}
    </g>
  );
  return (
    <AbsoluteFill>
      <Wagon cam={cam} t={t} light={0.7 + 0.3 * flicker(t)} beyond={beyond} />
      {lunge > 0.9 && <AbsoluteFill style={{ background: "#fff", opacity: clamp(1 - (t - 4.1) * 6) * 0.5 }} />}
      <Finish vig={1.1} tint="#20304a" tintOpacity={0.2} grain={1.2} bigSnow={false} />
    </AbsoluteFill>
  );
};

/** 3. Лицо крупно: распахнутые глаза, стиснутые зубы, пот, слеза срывается. */
const FaceShot = () => {
  const t = useT();
  const light = flicker(t, 1.3);
  return (
    <AbsoluteFill style={{ background: "#0a0e14" }}>
      <Svg>
        <g transform={`translate(540 960) scale(${ease(t, 0, 5, 1.0, 1.12)}) translate(-540 -900)`}>
          <FaceCU
            t={t}
            fear={ease(t, 0, 2, 0.4, 1)}
            eyes={ease(t, 0, 1.5, 0.9, 1.25)}
            look={[Math.sin(t * 0.8) * 0.5 + (t > 3 ? 0.7 : 0), 0.1]}
            mouth={t < 3 ? "clench" : "open"}
            sweat={ease(t, 0, 2, 0.3, 1)}
            tears={ease(t, 1, 4.5, 0, 1)}
            tremble={ease(t, 0, 3, 0.2, 1)}
            light={light}
          />
        </g>
      </Svg>
      <Finish vig={1} tint="#20304a" tintOpacity={0.15} grain={1.1} bigSnow={false} />
    </AbsoluteFill>
  );
};

export const TRAIN_TEST_FRAMES = 450;
export const TrainTest = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Sequence durationInFrames={150}>
      <FlyThrough />
    </Sequence>
    <Sequence from={150} durationInFrames={150}>
      <ThroughGlass />
    </Sequence>
    <Sequence from={300} durationInFrames={150}>
      <FaceShot />
    </Sequence>
  </AbsoluteFill>
);

export { onGround };
