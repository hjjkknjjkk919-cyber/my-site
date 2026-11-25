import React from "react";
import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { clamp, ease, Svg, useT } from "../components/fx";
import { Sfx } from "../components/audio";
import { LEN, proj, Wagon2, type Cam } from "./Wagon2";
import { DimaBack, DimaFace, lampLevel, ride } from "./Gost";
import { Rake } from "./Rake";

/** Пробный монтаж в 3D-вагоне: идём за Димой → лицо → существо ползёт по потолку соседнего вагона → прыжок на стекло. */

const Vig = ({ k = 1 }: { k?: number }) => <AbsoluteFill style={{ background: `radial-gradient(75% 60% at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,${0.7 * k}) 100%)` }} />;

/** Пыль в воздухе (поверх 3D). */
const Dust = ({ t, l }: { t: number; l: number }) => (
  <Svg>
    {Array.from({ length: 60 }, (_, i) => {
      const y = ((Math.sin(i * 12.9) * 0.5 + 0.5 + t * (0.015 + (i % 5) * 0.006)) % 1) * 1920;
      const x = ((Math.sin(i * 7.3) * 0.5 + 0.5) * 1080 + Math.sin(t * 0.6 + i) * 40) % 1080;
      return <circle key={i} cx={x} cy={y} r={1 + (i % 4) * 0.8} fill="#fff4dc" opacity={(0.15 + 0.35 * Math.abs(Math.sin(t + i))) * l} />;
    })}
  </Svg>
);

/** Дима со спины в мире: затылок на высоте 175 см, тело уходит вниз за кадр. */
const dimaActor = (z: number, x: number, t: number, walk: number) => ({
  z,
  draw: (cam: Cam) => {
    const p = proj(cam, x, 178, z);
    const s = p.k / 20; // 20 единиц рисунка на см
    const bob = Math.abs(Math.sin(walk * Math.PI)) * 3 * p.k;
    return (
      <g transform={`translate(${p.x - 540 * s} ${p.y - 900 * s + bob}) scale(${s})`}>
        {/* продолжение куртки вниз, чтобы тело не обрывалось */}
        <path d="M-120 1700 C-200 2200 -220 2900 -200 3600 H1280 C1300 2900 1280 2200 1200 1700 Z" fill="#2f5f9e" stroke="#3b2b26" strokeWidth="8" />
        <path d="M980 1700 C1100 2200 1120 2900 1100 3600 H1280 C1300 2900 1280 2200 1200 1700 Z" fill="#1b365c" />
        <path d="M-150 2100 C-180 2500 -170 2900 -140 3300 M1230 2100 C1260 2500 1250 2900 1220 3300" stroke="#3b2b26" strokeWidth="8" fill="none" />
        <path d="M540 1600 V3600" stroke="#1b365c" strokeWidth="10" opacity="0.6" />
        <DimaBack t={t} />
      </g>
    );
  },
});

/** 1. Идём за Димой по проходу к торцевой двери (3D). */
const Follow = () => {
  const t = useT();
  const dz = ease(t, 0, 5, 900, 2050);
  const r = ride(t);
  const cam: Cam = { x: Math.sin(t * 0.8) * 6, y: 168, z: dz - 170, roll: r.rot, pitch: r.y * 2 };
  const L = lampLevel(t);
  return (
    <AbsoluteFill style={{ transform: `translate(${r.x}px,0)` }}>
      <Wagon2 cam={cam} t={t} light={L} actors={[dimaActor(dz, Math.sin(t * 1.2) * 4, t, t * 1.6)]} />
      <Dust t={t} l={L} />
      <Vig />
    </AbsoluteFill>
  );
};

/** 2. Лицо крупно. */
const Face = () => {
  const t = useT();
  const r = ride(t);
  const L = lampLevel(t + 3);
  return (
    <AbsoluteFill style={{ background: "#1a2026", transform: `translate(${r.x}px,${r.y}px) rotate(${r.rot}deg) scale(1.04)` }}>
      <Svg>
        <g transform={`translate(540 960) scale(${ease(t, 0, 4, 1.0, 1.15)}) translate(-540 -880)`}>
          <DimaFace t={t} fear={ease(t, 0, 2.5, 0.5, 1)} eyes={ease(t, 0, 1.5, 0.95, 1.25)} look={[0.15, -0.15]} mouth="clench" sweat={ease(t, 0, 2, 0.4, 1)} tears={ease(t, 0.5, 4, 0, 1)} tremble={ease(t, 0, 3, 0.3, 1)} />
        </g>
      </Svg>
      <AbsoluteFill style={{ background: `radial-gradient(70% 45% at 45% 15%, rgba(255,236,200,${0.25 * L}) 0%, rgba(0,0,0,0) 70%)`, mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(8,10,14,0) 40%, rgba(8,10,14,.6) 100%)" }} />
      <AbsoluteFill style={{ background: "#000", opacity: (1 - L) * 0.6 }} />
      <Dust t={t} l={L} />
      <Vig />
    </AbsoluteFill>
  );
};

/** Соседний вагон за стеклом: тёмный проход, свет вспышками, существо ползёт по потолку к нам. */
const Beyond = ({ t, near, on }: { t: number; near: number; on: boolean }) => (
  <g>
    <rect width="400" height="600" fill={on ? "#1e2326" : "#030405"} />
    {on && (
      <g>
        <path d="M0 0 L150 230 L250 230 L400 0 Z" fill="#5a605c" />
        <path d="M0 600 L150 330 L250 330 L400 600 Z" fill="#2f2924" />
        <path d="M0 0 L150 230 L150 330 L0 600 Z" fill="#3c4542" />
        <path d="M400 0 L250 230 L250 330 L400 600 Z" fill="#323b38" />
        <rect x="150" y="230" width="100" height="100" fill="#0b0d10" />
      </g>
    )}
    {/* существо на потолке, вверх ногами */}
    <g opacity={on ? 1 : 0.0}>
      <g transform={`translate(200 ${200 - near * 150}) scale(${0.12 + near * 0.45}) scale(1 -1)`}>
        <Rake t={t} phase={t * 1.4} jaw={0.4 + near * 0.4} />
      </g>
    </g>
    {/* в темноте видны только глаза */}
    {!on && near > 0.2 && (
      <g transform={`translate(200 ${200 - near * 150}) scale(${0.12 + near * 0.45})`}>
        <circle cx="-30" cy="130" r="6" fill="#fff" />
        <circle cx="30" cy="130" r="6" fill="#fff" />
      </g>
    )}
  </g>
);

/** 3. Через плечо Димы в стекло: вспышки, существо ближе с каждой. */
const Watch = () => {
  const t = useT();
  const r = ride(t);
  const on = (t % 0.85) < 0.42;
  const near = clamp(t / 4.2);
  const cam: Cam = { x: 10, y: 160, z: LEN - 300 + ease(t, 0, 4.5, 0, 140), roll: r.rot, pitch: r.y * 2 };
  return (
    <AbsoluteFill>
      <Wagon2 cam={cam} t={t} light={on ? 0.85 : 0.25} beyond={<Beyond t={t} near={near} on={on} />} actors={[dimaActor(LEN - 160, -55, t, 0)]} />
      <Dust t={t} l={on ? 1 : 0.3} />
      <Vig k={1.1} />
    </AbsoluteFill>
  );
};

/** 4. Прыжок на стекло: морда, когти, трещины, тряска. */
const Slam = () => {
  const t = useT();
  const p = clamp(t / 0.12);
  const sh = t < 0.6 ? Math.sin(t * 90) * 26 * (1 - t / 0.6) : 0;
  return (
    <AbsoluteFill style={{ background: "#000", transform: `translate(${sh}px,${sh * 0.6}px)` }}>
      <Svg>
        <rect width="1080" height="1920" fill="#1b2023" />
        <g transform={`translate(540 ${900 + (1 - p) * 200}) scale(${(0.4 + 2.4 * p) * (1 + Math.sin(t * 9) * 0.02)})`}>
          <Rake t={t} phase={0.25} jaw={clamp(0.6 + t * 0.8)} />
        </g>
        <g stroke="#e9f1f5" strokeWidth="5" fill="none" opacity={p}>
          <path d="M540 820 L420 600 L380 380 M540 820 L720 620 L860 480 M540 820 L560 1100 L480 1360 M540 820 L260 920 M540 820 L840 980" />
        </g>
        <rect x="0" y="0" width="1080" height="1920" fill="none" stroke="#5f6e70" strokeWidth="120" />
      </Svg>
      {t < 0.08 && <AbsoluteFill style={{ background: "#fff", opacity: 0.85 }} />}
      <Vig k={0.8} />
    </AbsoluteFill>
  );
};

export const EP1_TEST_FRAMES = 480;
export const Ep1Test = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Audio src={staticFile("audio/train/ride.mp3")} loop volume={(f) => (f > 405 ? 0.12 : 0.55)} />
    {Array.from({ length: 14 }, (_, i) => (
      <Sfx key={i} at={i * 0.95} name="train/clack" vol={0.25} />
    ))}
    <Sfx at={5} name="train/breath" vol={0.75} />
    <Sfx at={9} name="train/buzz" vol={0.4} dur={4.5} />
    <Sfx at={13.5} name="train/sting" vol={1} />
    <Sfx at={13.5} name="train/glass" vol={0.9} />
    <Sequence durationInFrames={150}>
      <Follow />
    </Sequence>
    <Sequence from={150} durationInFrames={120}>
      <Face />
    </Sequence>
    <Sequence from={270} durationInFrames={135}>
      <Watch />
    </Sequence>
    <Sequence from={405} durationInFrames={75}>
      <Slam />
    </Sequence>
  </AbsoluteFill>
);
