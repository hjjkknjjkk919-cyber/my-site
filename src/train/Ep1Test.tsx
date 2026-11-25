import React from "react";
import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/google-fonts/Montserrat";
import { clamp, ease, Svg, useT } from "../components/fx";
import { Sfx } from "../components/audio";
import { LEN, proj, Wagon2, type Cam } from "./Wagon2";
import { Rake } from "./Rake";
import { DimaBack2 } from "./Dima2";
import { Atmos, DimaBack as DimaBackOld, DimaFace as DimaFaceOld } from "./GostOld";
import { Cracks, CreatureGlass } from "./Creature2";

/** Пробный монтаж v2 (по ревью): крючок → идём за Димой → лицо → вспышки в окне → скример. */
const { fontFamily: MONT } = loadFont("normal", { weights: ["800", "900"], subsets: ["cyrillic", "latin"] });
const FPS = 30;

// ── ритм поезда ───────────────────────────────────────────────────────
/** Покачивание ±0.6° с периодом 1.4 с и толчок 3 px на стыке каждые 0.9 с. */
const ride = (t: number) => {
  const ph = (t % 0.9) / 0.9;
  const bump = ph < 0.1 ? Math.sin((ph / 0.1) * Math.PI) * 3 : 0;
  return { rot: Math.sin((t / 1.4) * Math.PI * 2) * 0.6, y: bump };
};
/** Неравномерное мигание (в кадрах): 6 вкл, 2 выкл, 1 вкл, 8 выкл, 3 вкл, 1 выкл, 2 вкл … */
const PATTERN = [12, 2, 2, 5, 9, 1, 3, 6];
const flickerOn = (frame: number) => {
  const total = PATTERN.reduce((a, b) => a + b, 0);
  let f = frame % total;
  for (let i = 0; i < PATTERN.length; i++) {
    if (f < PATTERN[i]) return i % 2 === 0;
    f -= PATTERN[i];
  }
  return true;
};

// ── оформление как в референсе ────────────────────────────────────────
const Hud = () => (
  <div style={{ position: "absolute", top: 70, left: 40, right: 40, display: "flex", justifyContent: "space-between", fontFamily: MONT, fontWeight: 800 }}>
    <div style={{ display: "flex", gap: 14 }}>
      <div style={{ background: "#1a1a1a", border: "3px solid #3a3a3a", borderRadius: 10, padding: "8px 18px", color: "#f2e6c8", fontSize: 40, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ width: 16, height: 16, borderRadius: 8, background: "#e53935", display: "inline-block" }} />
        00:47 <span style={{ fontSize: 26, opacity: 0.7 }}>ночь</span>
      </div>
      <div style={{ background: "#d32f2f", borderRadius: 10, padding: "8px 18px", color: "#fff", fontSize: 40 }}>ЧАСТЬ 1</div>
    </div>
    <div style={{ background: "#1a1a1a", border: "3px solid #d32f2f", borderRadius: 10, padding: "8px 18px", color: "#fff", fontSize: 32 }}>
      ВАГОН <span style={{ color: "#ff5a1f", fontSize: 42 }}>7</span>
    </div>
  </div>
);

type Cue = { from: number; to: number; text: string };
/** Субтитры: жирный, белый, тёмная обводка, ключевое слово (в *звёздочках*) оранжевым. */
const Subs = ({ t, cues }: { t: number; cues: Cue[] }) => {
  const c = cues.find((q) => t >= q.from && t < q.to);
  if (!c) return null;
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 1430, textAlign: "center", fontFamily: MONT, fontWeight: 900, fontSize: 70, lineHeight: 1.1, color: "#fff", WebkitTextStroke: "12px #1a120e", paintOrder: "stroke fill", textTransform: "uppercase" }}>
      {c.text.split(" ").map((w, i) => (
        <span key={i} style={{ display: "inline-block", margin: "0 0.15em", color: w.includes("*") ? "#ff5a1f" : undefined }}>
          {w.replace(/\*/g, "")}
        </span>
      ))}
    </div>
  );
};
/** Слова фразы по 2–3, равномерно по длительности клипа. */
const cuesFor = (at: number, dur: number, text: string): Cue[] => {
  const w = text.split(" ");
  const chunks: string[] = [];
  for (let i = 0; i < w.length; i += 3) chunks.push(w.slice(i, i + 3).join(" "));
  return chunks.map((c, i) => ({ from: at + (dur * i) / chunks.length, to: at + (dur * (i + 1)) / chunks.length, text: c }));
};
const CUES: Cue[] = [
  { from: 0, to: 1.6, text: "В этой электричке ты *не один*" },
  ...cuesFor(1.8, 5.3, "Ты проснулся. Электричка идёт сорок минут… без *остановок*."),
  ...cuesFor(7.2, 2.3, "В соседнем вагоне гаснет *свет*."),
  ...cuesFor(10.2, 4.8, "Вспышка. Пусто. Вспышка… оно *ближе*."),
];

const Vig = ({ k = 1 }: { k?: number }) => <AbsoluteFill style={{ background: `radial-gradient(75% 60% at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,${0.72 * k}) 100%)` }} />;
/** Пыль: дрейфует наискосок, ярче в луче (центр сверху). */
const Dust = ({ t, l }: { t: number; l: number }) => (
  <Svg>
    {Array.from({ length: 55 }, (_, i) => {
      const sp = 0.012 + (i % 5) * 0.005;
      const y = ((Math.sin(i * 12.9) * 0.5 + 0.5 + t * sp) % 1) * 1920;
      const x = (((Math.sin(i * 7.3) * 0.5 + 0.5) * 1080 + y * 0.15 + Math.sin(t * 0.6 + i) * 20) % 1080 + 1080) % 1080;
      const inBeam = Math.max(0, 1 - Math.abs(x - 540) / 380) * Math.max(0, 1 - y / 1600);
      return <circle key={i} cx={x} cy={y} r={1 + (i % 3)} fill="#e8e2d0" opacity={(0.3 + 0.3 * inBeam + 0.2 * Math.abs(Math.sin(t + i))) * l} />;
    })}
  </Svg>
);

// ── Дима в 3D ─────────────────────────────────────────────────────────
const dimaActor = (z: number, x: number, t: number, walk: number, _turn = 0, dark = 0) => ({
  z,
  draw: (cam: Cam) => {
    const p = proj(cam, x, 182, z);
    const s = p.k / 20;
    return (
      <g transform={`translate(${p.x - 540 * s} ${p.y - 960 * s + Math.abs(Math.sin(walk * Math.PI * 2)) * 6 * s}) scale(${s})`}>
        {/* тело до пояса, чтобы не обрывалось */}
        <path d="M-120 1600 C-180 2100 -190 2800 -170 3500 H1250 C1270 2800 1260 2100 1200 1600 Z" fill={dark ? "#141924" : "#2a384a"} stroke="#3b2b26" strokeWidth="8" />
        <g opacity={dark ? 0.55 : 1}>
          <DimaBackOld t={t} />
        </g>
      </g>
    );
  },
});

// ── кадры ─────────────────────────────────────────────────────────────
/** 0. Крючок: 6 кадров в тёмном окне видна рука с когтями. */
const Hook = () => {
  const t = useT();
  const show = t > 0.1 && t < 0.3;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {show && (
        <Svg>
          <rect x="140" y="300" width="800" height="1100" rx="40" fill="#0c1013" stroke="#2b1d16" strokeWidth="14" />
          <g transform="translate(0 -150) scale(1)">
            <CreatureGlass t={t} open={0.2} />
          </g>
          <rect x="0" y="0" width="1080" height="300" fill="#000" />
          <rect x="0" y="1400" width="1080" height="520" fill="#000" />
        </Svg>
      )}
    </AbsoluteFill>
  );
};

/** 1. Идём за Димой по проходу; на 3.5 с он оглядывается через плечо. */
const Follow = () => {
  const t = useT();
  const z = ease(t, 0, 5.5, 1000, 1950);
  const r = ride(t);
  const cam: Cam = { x: 0, y: 175, z: z - 190, roll: r.rot, pitch: r.y };
  const L = 0.85;
  const turn = ease(t, 3.0, 3.4, 0, 1) - ease(t, 4.2, 4.6, 0, 1);
  return (
    <AbsoluteFill>
      <Wagon2 cam={cam} t={t} light={0.55} actors={[dimaActor(z, 0, t, (t * 0.85) % 1, turn)]} />
      <Atmos t={t + 2} />
      <Vig />
    </AbsoluteFill>
  );
};

/** 2. Лицо крупно (дизайн из первого теста): полумрак, луч сверху, пыль. */
const Face = () => {
  const t = useT();
  const r = ride(t);
  return (
    <AbsoluteFill style={{ background: "#202a30", transform: `translateY(${r.y}px) rotate(${r.rot}deg) scale(1.04)` }}>
      <Svg>
        <g transform={`translate(540 960) scale(${ease(t, 0, 3.6, 1.05, 1.2)}) translate(-540 -900)`}>
          <DimaFaceOld t={t} fear={ease(t, 0, 2, 0.5, 1)} eyes={ease(t, 0, 1.2, 0.95, 1.25)} look={[Math.sin(t * 0.7) * 0.3, -0.1]} mouth="clench" sweat={ease(t, 0, 1.5, 0.4, 1)} tears={ease(t, 0.4, 3.4, 0, 1)} tremble={ease(t, 0, 2, 0.3, 1)} />
        </g>
      </Svg>
      <Svg>
        <ellipse cx="540" cy="1130" rx={140 + Math.sin(t * 3) * 30} ry={70 + Math.sin(t * 3) * 15} fill="#e3edf3" opacity={0.12 + 0.08 * Math.sin(t * 3)} />
      </Svg>
      <Atmos t={t} side={-1} />
      <Vig />
    </AbsoluteFill>
  );
};

/** Соседний вагон за стеклом: ряды сидений, плафоны; существо на потолке рывками, голова вывернута к нам. */
const Beyond = ({ t, frame, on }: { t: number; frame: number; on: boolean }) => {
  // три появления: 15% → 30% → 55% высоты окна; рывок 2 кадра, стоп 4
  const step = frame < 50 ? 0 : frame < 110 ? 1 : 2;
  const scale = [0.15, 0.3, 0.55][step];
  const jerk = Math.floor(frame / 6) % 2 === 0 && frame % 6 < 2 ? 1 : 0;
  const cx = [230, 170, 200][step] + jerk * 8;
  const cy = [120, 140, 170][step];
  return (
    <g>
      <rect width="400" height="600" fill={on ? "#1d2326" : "#030405"} />
      {on && (
        <g>
          <path d="M0 0 L150 210 L250 210 L400 0 Z" fill="#4e5552" />
          <path d="M0 600 L150 340 L250 340 L400 600 Z" fill="#2f2924" />
          <path d="M0 0 L150 210 L150 340 L0 600 Z" fill="#38413f" />
          <path d="M400 0 L250 210 L250 340 L400 600 Z" fill="#2f3836" />
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <path d={`M${20 + i * 45} ${560 - i * 80} L${130 - i * 5} ${470 - i * 50} L${130 - i * 5} ${430 - i * 45} L${20 + i * 45} ${500 - i * 75} Z`} fill="#6a3f2d" stroke="#1a120e" strokeWidth="2" />
              <path d={`M${380 - i * 45} ${560 - i * 80} L${270 + i * 5} ${470 - i * 50} L${270 + i * 5} ${430 - i * 45} L${380 - i * 45} ${500 - i * 75} Z`} fill="#6a3f2d" stroke="#1a120e" strokeWidth="2" />
              <rect x={190 - i * 4} y={60 + i * 50} width={20 - i * 4} height={60 - i * 15} fill="#e9e3c6" opacity={i === 1 && Math.floor(t * 9) % 3 === 0 ? 0.2 : 0.8} />
            </g>
          ))}
          <rect x="150" y="210" width="100" height="130" fill="#0b0d10" />
        </g>
      )}
      {/* существо: тело вверх ногами по потолку, голова вывернута к нам */}
      {on ? (
        <g transform={`translate(${cx} ${cy}) scale(${scale * 1.2})`}>
          <g transform="scale(1 -1)">
            <Rake t={t} phase={jerk * 0.15 + step * 0.3} jaw={0.4 + step * 0.25} look={0} />
          </g>
        </g>
      ) : (
        <g transform={`translate(${cx} ${cy}) scale(${scale * 1.2})`}>
          <circle cx="-30" cy="120" r={5 / (scale * 1.2) * 0.5 + 3} fill="#f2efd8" />
          <circle cx="30" cy="120" r={5 / (scale * 1.2) * 0.5 + 3} fill="#f2efd8" />
        </g>
      )}
    </g>
  );
};

/** 3. Через плечо: Дима тёмным силуэтом слева (25–30%), дверь в правой трети, наезд 100→130%. */
const Watch = () => {
  const t = useT();
  const frame = Math.round(t * FPS);
  const on = flickerOn(frame);
  const r = ride(t);
  const cam: Cam = { x: -25, y: 160, z: LEN - 240, roll: r.rot, pitch: r.y };
  return (
    <AbsoluteFill style={{ transform: `scale(${ease(t, 0, 6, 1.0, 1.3)})`, transformOrigin: "62% 48%" }}>
      <Wagon2 cam={cam} t={t} light={on ? 0.55 : 0.12} beyond={<Beyond t={t} frame={frame} on={on} />} actors={[dimaActor(LEN - 150, -62, t, 0, 0, 1)]} />
      <Atmos t={t + 5} />
      <Vig k={1.1} />
    </AbsoluteFill>
  );
};

/** 4. Скример: вспышка, удар с перелётом масштаба, затухающая тряска, трещины, сползающие ладони, наклон головы, в конце — чёрный. */
const Slam = () => {
  const t = useT();
  const f = t * FPS;
  const sc = f < 2 ? 1.4 - 0.44 * (f / 2) : f < 4 ? 0.96 + 0.04 * ((f - 2) / 2) : 1;
  const shake = f < 12 ? Math.sin(t * 2 * Math.PI * 18) * 40 * (1 - f / 12) : 0;
  const crack = clamp((f - 2) / 4);
  const slide = ease(f, 3, 20, 0, 60);
  const tilt = ease(f, 20, 40, 0, 25);
  const open = ease(f, 0, 40, 0.5, 1);
  const black = t > 2.1;
  return (
    <AbsoluteFill style={{ background: "#000", transform: `translate(${shake}px, ${shake * 0.5}px)` }}>
      {!black && (
        <Svg>
          <rect width="1080" height="1920" fill="#12171a" />
          <g transform={`translate(540 960) scale(${sc}) translate(-540 -960)`}>
            <CreatureGlass t={t} open={open} tilt={tilt} slide={slide} />
          </g>
          {/* мутный отпечаток ладоней остаётся на стекле */}
          {f > 20 && (
            <g opacity="0.25">
              <ellipse cx="230" cy="990" rx="130" ry="110" fill="#cfc7b2" />
              <ellipse cx="850" cy="950" rx="130" ry="110" fill="#cfc7b2" />
            </g>
          )}
          <Cracks x={560} y={820} p={crack} />
          <rect x="0" y="0" width="1080" height="1920" fill="none" stroke="#5f6e70" strokeWidth="90" />
        </Svg>
      )}
      {f < 3 && <AbsoluteFill style={{ background: "#f4f1e6", opacity: 0.8 * (1 - f / 3) }} />}
      {!black && <Vig k={0.8} />}
    </AbsoluteFill>
  );
};

// ── сборка ────────────────────────────────────────────────────────────
const T = { hook: 0, follow: 0.5, face: 6.0, watch: 9.6, slam: 15.6, end: 18.0 };
const fr = (s: number) => Math.round(s * FPS);
export const EP1_TEST_FRAMES = fr(T.end);

export const Ep1Test = () => {
  const t = useT();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Audio src={staticFile("audio/train/ride.mp3")} loop volume={(f) => (f > fr(T.slam) ? 0.1 : 0.5)} />
      {Array.from({ length: 17 }, (_, i) => (
        <Sfx key={i} at={0.5 + i * 0.9} name="train/clack" vol={0.22} />
      ))}
      <Sfx at={0.1} name="train/sting" vol={0.6} dur={0.6} />
      <Sfx at={1.8} name="train/n1" vol={1.1} />
      <Sfx at={T.face} name="train/breath" vol={0.8} />
      <Sfx at={7.2} name="train/n2" vol={1.1} />
      <Sfx at={T.watch} name="train/buzz" vol={0.45} dur={6} />
      <Sfx at={10.2} name="train/n3" vol={1.1} />
      <Sfx at={T.slam} name="train/sting" vol={1} />
      <Sfx at={T.slam} name="train/glass" vol={1} />
      <Sequence from={fr(T.hook)} durationInFrames={fr(T.follow - T.hook)}>
        <Hook />
      </Sequence>
      <Sequence from={fr(T.follow)} durationInFrames={fr(T.face - T.follow)}>
        <Follow />
      </Sequence>
      <Sequence from={fr(T.face)} durationInFrames={fr(T.watch - T.face)}>
        <Face />
      </Sequence>
      <Sequence from={fr(T.watch)} durationInFrames={fr(T.slam - T.watch)}>
        <Watch />
      </Sequence>
      <Sequence from={fr(T.slam)} durationInFrames={fr(T.end - T.slam)}>
        <Slam />
      </Sequence>
      {t < T.slam && <Hud />}
      <Subs t={t} cues={CUES} />
    </AbsoluteFill>
  );
};
