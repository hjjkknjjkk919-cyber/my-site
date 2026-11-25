import React from "react";
import { AbsoluteFill, random, Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { clamp, Cue, ease, Finish, INK, shake, Snow, Subtitle, Svg, useT } from "../components/fx";
import { DIMA, Hero, handPos, onGround } from "../components/Hero";
import { line, Sfx } from "../components/audio";
import voice from "./voice.json";

/**
 * Отдельный ролик «Ты один застрял на высоте 6000 метров» — формат «что делать, если…».
 * Рассказчик говорит со зрителем на «ты», Дима молча показывает каждый совет.
 * Длительности реплик — из voice.json (после озвучки там реальные секунды, voiced: true).
 */

const ORANGE = "#ff8a1f";
const GREEN = "#3fd17a";
const L = { strokeLinecap: "round", strokeLinejoin: "round" } as const;

type V = { text: string; dur: number; voiced?: boolean };
const VO = voice as Record<string, V>;

// ── фон ────────────────────────────────────────────────────────────────

/** Небо и горы. dawn 0 — глухая ночь, 1 — рассвет. fog — белая мгла метели. */
const Sky = ({ t, dawn = 0, fog = 0, cam = 0 }: { t: number; dawn?: number; fog?: number; cam?: number }) => {
  const mix = (a: number[], b: number[]) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * dawn)).join(",")})`;
  const top = mix([14, 24, 44], [255, 150, 110]);
  const mid = mix([38, 58, 88], [255, 205, 160]);
  const far = mix([52, 72, 102], [196, 170, 190]);
  const near = mix([30, 44, 66], [140, 120, 150]);
  return (
    <Svg>
      <defs>
        <linearGradient id="svSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="0.6" stopColor={mid} />
        </linearGradient>
      </defs>
      <rect width={1080} height={1920} fill="url(#svSky)" />
      {/* звёзды ночью */}
      <g fill="#fff" opacity={(1 - dawn) * (1 - fog) * 0.8}>
        {Array.from({ length: 40 }, (_, i) => (
          <circle key={i} cx={random(`sx${i}`) * 1080} cy={random(`sy${i}`) * 700} r={1.5 + random(`sr${i}`) * 2.5} opacity={0.4 + 0.6 * Math.abs(Math.sin(t * (1 + random(`st${i}`) * 3) + i))} />
        ))}
      </g>
      {/* солнце на рассвете */}
      <circle cx="760" cy={900 - dawn * 260} r="120" fill="#fff1c4" opacity={dawn * 0.9} />
      <circle cx="760" cy={900 - dawn * 260} r="230" fill="#ffd38a" opacity={dawn * 0.3} />
      <g transform={`translate(${cam * 0.15} 0)`} filter="url(#rough)" {...L}>
        <path d="M-60 1060 L250 640 L380 760 L600 430 L860 820 L1140 1060 Z" fill={far} stroke={INK} strokeWidth="5" />
        <path d="M600 430 L540 560 L600 530 L640 610 L690 520 Z M250 640 L215 720 L270 700 Z" fill="#eef3f7" opacity={0.85} />
      </g>
      <g transform={`translate(${cam * 0.35} 0)`} filter="url(#rough)" {...L}>
        <path d="M-100 1200 L180 900 L420 1080 L700 820 L1180 1200 Z" fill={near} stroke={INK} strokeWidth="6" />
        <path d="M700 820 L640 920 L700 900 L740 960 L780 890 Z" fill="#e3ebf1" />
      </g>
      {/* снежное поле */}
      <path d="M-50 1180 C300 1130 700 1160 1130 1120 V1960 H-50 Z" fill={mix([150, 172, 198], [255, 236, 226])} stroke={INK} strokeWidth="6" />
      <path d="M-50 1400 C350 1360 760 1420 1130 1370 V1960 H-50 Z" fill={mix([176, 196, 218], [255, 244, 236])} opacity="0.8" />
      {/* мгла метели */}
      <rect width={1080} height={1920} fill="#dfe8ef" opacity={fog * 0.75} />
    </Svg>
  );
};

/** Скала со снежной шапкой. */
const Rock = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#rough)" {...L}>
    <path d="M-260 0 L-220 -260 L-60 -420 L140 -380 L260 -200 L280 0 Z" fill="#3b4656" stroke={INK} strokeWidth="9" />
    <path d="M140 -380 L260 -200 L280 0 L90 0 L120 -220 Z" fill="#000" opacity="0.25" />
    <path d="M-220 -260 L-60 -420 L140 -380 L80 -330 L-20 -350 L-120 -260 Z" fill="#eef3f7" stroke={INK} strokeWidth="6" />
  </g>
);

/** Нора в сугробе: open 0..1 — насколько вырыта. */
const Burrow = ({ x, y, s = 1, open = 1 }: { x: number; y: number; s?: number; open?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} {...L}>
    <path d="M-330 0 C-300 -230 300 -230 330 0 Z" fill="#e8eff5" stroke={INK} strokeWidth="8" />
    <ellipse cx="0" cy="-10" rx={150 * open} ry={120 * open} fill="#141c26" stroke={INK} strokeWidth="6" />
  </g>
);

/** Плашка совета сверху: номер в оранжевом круге и заголовок. */
const Tip = ({ t, n, title }: { t: number; n: number; title: string }) => {
  const a = ease(t, 0, 0.35, 0, 1);
  return (
    <div style={{ position: "absolute", top: 150, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: a, transform: `translateY(${(1 - a) * -40}px)` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 24, background: "rgba(10,16,24,.82)", border: "4px solid #0b1218", borderRadius: 28, padding: "18px 40px 18px 22px" }}>
        <div style={{ width: 96, height: 96, borderRadius: 48, background: ORANGE, color: "#10161d", fontFamily: "Oswald", fontWeight: 700, fontSize: 64, display: "flex", alignItems: "center", justifyContent: "center" }}>{n}</div>
        <div style={{ color: "#fff", fontFamily: "Oswald", fontWeight: 700, fontSize: 64, textTransform: "uppercase" }}>{title}</div>
      </div>
    </div>
  );
};

/** Большой значок «так нельзя» (✗) или «так правильно» (✓). */
const Mark = ({ t, ok, x = 860, y = 560 }: { t: number; ok: boolean; x?: number; y?: number }) => {
  const p = clamp(t / 0.25);
  const sc = p < 1 ? 0.4 + 0.8 * p : 1 + 0.04 * Math.sin(t * 8);
  return (
    <Svg>
      <g transform={`translate(${x} ${y}) scale(${sc})`} opacity={p} {...L}>
        <circle r="110" fill={ok ? GREEN : "#e5262b"} stroke={INK} strokeWidth="10" />
        {ok ? <path d="M-50 0 L-12 40 L55 -40" fill="none" stroke="#fff" strokeWidth="26" /> : <path d="M-45 -45 L45 45 M45 -45 L-45 45" fill="none" stroke="#fff" strokeWidth="26" />}
      </g>
    </Svg>
  );
};

/** Пар изо рта. */
const Breath = ({ t, x, y, s = 1 }: { t: number; x: number; y: number; s?: number }) => {
  const ph = (t % 2.2) / 2.2;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={Math.sin(ph * Math.PI) * 0.7}>
      <circle cx={ph * 60} cy={-ph * 40} r={18 + ph * 30} fill="#eef4f8" />
      <circle cx={ph * 100} cy={-ph * 70} r={10 + ph * 24} fill="#eef4f8" opacity="0.7" />
    </g>
  );
};

/** Пещера изнутри: тёмные стенки норы вокруг кадра. */
const CaveFrame = ({ glow = 0.4 }: { glow?: number }) => (
  <Svg>
    <defs>
      <radialGradient id="svCave" cx="50%" cy="45%" r="60%">
        <stop offset="0.55" stopColor="#0d141c" stopOpacity="0" />
        <stop offset="1" stopColor="#0d141c" stopOpacity="1" />
      </radialGradient>
    </defs>
    <rect width={1080} height={1920} fill={`rgba(120,150,180,${glow * 0.25})`} />
    <path d="M-20 1960 L-20 700 C40 260 1040 260 1100 700 L1100 1960 Z M80 1960 C60 900 200 450 540 430 C880 450 1020 900 1000 1960 Z" fill="#cfdbe6" fillRule="evenodd" stroke={INK} strokeWidth="8" />
    <rect width={1080} height={1920} fill="url(#svCave)" />
  </Svg>
);

// ── сцены ──────────────────────────────────────────────────────────────

type SceneProps = { t: number; d: number; v: { from: number; to: number } };

/** 0. Хук: Дима один в белой мгле. */
const Hook = ({ t }: SceneProps) => {
  const z = ease(t, 0, 6, 1, 1.25);
  const { dx, dy } = shake(t, 3);
  return (
    <AbsoluteFill style={{ transform: `translate(${dx}px,${dy}px) scale(${z})`, transformOrigin: "50% 55%" }}>
      <Sky t={t} fog={0.55} />
      <Svg>
        <Hero cfg={DIMA} x={540} y={onGround(DIMA, 1500, 0.3)} s={0.3} t={t} emotion="fear" look={[Math.sin(t * 1.4) * 20, -4]} frost={0.8} full wind={1} />
      </Svg>
      <Snow t={t} n={110} opacity={0.85} speed={2} wind={1} />
      <Sfx name="sfx/gust" vol={0.6} />
    </AbsoluteFill>
  );
};

/** 1. Не паникуй: мечется, потом замирает. */
const Panic = ({ t, v }: SceneProps) => {
  const stop = v.from + 0.9;
  const run = t < stop;
  const x = run ? 540 + 300 * Math.sin(t * 2.4) : 540;
  const dir: 1 | -1 = Math.cos(t * 2.4) >= 0 ? 1 : -1;
  return (
    <AbsoluteFill>
      <Sky t={t} fog={0.35} cam={-x * 0.2} />
      <Svg>
        <Hero cfg={DIMA} x={x} y={onGround(DIMA, 1560, 0.32)} s={0.32} flip={run ? dir : 1} t={t} emotion={run ? "fear" : "calm"} walk={run ? t * 1.8 : undefined} look={run ? [dir * 18, 0] : [0, 0]} frost={0.7} full wind={0.8} />
        {!run && <Breath t={t} x={x + 40} y={onGround(DIMA, 1560, 0.32) + 40} s={0.6} />}
      </Svg>
      <Snow t={t} n={80} opacity={0.75} speed={1.6} wind={0.8} />
      <Tip t={t} n={1} title="Не паникуй" />
      {!run && <Mark t={t - stop} ok />}
      <Sfx at={stop} name="survival/ding" vol={0.5} />
    </AbsoluteFill>
  );
};

/** 2. Укройся от ветра: на открытом снегу — нельзя; нора под скалой — можно. */
const Wind = ({ t, v }: SceneProps) => {
  const cut = v.from + (v.to - v.from) * 0.45;
  const a = t < cut;
  const drift = clamp(t / cut) * 0.55;
  const dig = clamp((t - cut) / 2.5);
  return (
    <AbsoluteFill>
      <Sky t={t} fog={0.3} />
      <Svg>
        {a ? (
          <g>
            {/* лежит на открытом месте, его заметает */}
            <g transform="translate(540 1420) rotate(-90) translate(-540 -1420)">
              <Hero cfg={DIMA} x={540} y={onGround(DIMA, 1420 + 230, 0.28) } s={0.28} t={t} emotion="fear" frost={0.9} full wind={1} />
            </g>
            <path d={`M240 1500 C320 ${1500 - 140 * drift} 760 ${1500 - 170 * drift} 860 1500 Z`} fill="#eef3f7" stroke={INK} strokeWidth="6" />
          </g>
        ) : (
          <g>
            <Rock x={760} y={1420} s={1} />
            <Burrow x={700} y={1430} s={0.75} open={dig} />
            <Hero cfg={DIMA} x={380} y={onGround(DIMA, 1500, 0.3)} s={0.3} t={t} emotion="calm" arm={110 + 45 * Math.sin(t * 11)} look={[18, 6]} frost={0.7} full wind={0.6} />
            {/* летящие комья снега */}
            {Array.from({ length: 6 }, (_, i) => {
              const ph = (t * 1.6 + i / 6) % 1;
              return <circle key={i} cx={560 + ph * 180} cy={1330 - Math.sin(ph * Math.PI) * 220} r={14 + (i % 3) * 6} fill="#eef3f7" stroke={INK} strokeWidth="4" opacity={dig < 1 ? 1 : 0} />;
            })}
          </g>
        )}
      </Svg>
      <Snow t={t} n={a ? 140 : 60} opacity={0.85} speed={a ? 2.4 : 1} wind={a ? 1 : 0.4} />
      <Tip t={t} n={2} title="Укройся от ветра" />
      {a ? <Mark t={t - 0.6} ok={false} /> : <Mark t={t - cut - 1.8} ok />}
      <Sfx at={0.6} name="survival/buzz" vol={0.35} />
      <Sfx at={cut + 1.8} name="survival/ding" vol={0.5} />
      <Sfx at={cut} name="sfx/rustle" vol={0.6} dur={1.8} />
    </AbsoluteFill>
  );
};

/** Термометр: p 0 — синий холод, 1 — тепло. */
const Thermo = ({ p, x = 900, y = 900 }: { p: number; x?: number; y?: number }) => (
  <g transform={`translate(${x} ${y})`} {...L}>
    <rect x="-34" y="-300" width="68" height="340" rx="34" fill="#f4f7fa" stroke={INK} strokeWidth="9" />
    <rect x="-16" y={-280 + 260 * (1 - p)} width="32" height={260 * p + 40} rx="16" fill={p > 0.5 ? ORANGE : "#4aa3ff"} />
    <circle cy="70" r="62" fill={p > 0.5 ? ORANGE : "#4aa3ff"} stroke={INK} strokeWidth="9" />
  </g>
);

/** 3. Держи тепло: сидит в норе, дрожь уходит, термометр растёт. */
const Warm = ({ t, d }: SceneProps) => {
  const p = ease(t, 1, d - 1, 0.1, 0.85);
  const trem = (1 - p) * 6;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "#26384c" }} />
      <Svg>
        <g transform={`translate(${Math.sin(t * 60) * trem} 0)`}>
          <Hero cfg={DIMA} x={540} y={820} s={0.62} t={t} emotion={p < 0.5 ? "fear" : "calm"} frost={1 - p * 0.7} lid={p > 0.5 ? 0.3 : undefined} wind={0.1} />
        </g>
        <Breath t={t} x={600} y={1040} s={1.2} />
      </Svg>
      <CaveFrame glow={0.4} />
      <Svg>
        <Thermo p={p} />
      </Svg>
      <Tip t={t} n={3} title="Держи тепло" />
    </AbsoluteFill>
  );
};

/** Бутылка под курткой, water 0..1 — сколько натаяло. */
const Bottle = ({ water, x, y }: { water: number; x: number; y: number }) => (
  <g transform={`translate(${x} ${y})`} {...L}>
    <rect x="-60" y="-170" width="120" height="260" rx="34" fill="#d9eefc" opacity="0.9" stroke={INK} strokeWidth="8" />
    <rect x="-52" y={80 - 230 * water} width="104" height={230 * water} rx="26" fill="#4aa3ff" />
    <rect x="-34" y="-215" width="68" height="50" rx="10" fill="#e07a2a" stroke={INK} strokeWidth="7" />
  </g>
);

/** 4. Не ешь снег: тянет горсть снега ко рту — нельзя; топит в бутылке — можно. */
const SnowEat = ({ t, v }: SceneProps) => {
  const cut = v.from + (v.to - v.from) * 0.45;
  const a = t < cut;
  const arm = a ? ease(t, 0.3, 1.2, 40, 158) : undefined;
  const hp = arm !== undefined ? handPos(540, 820, 0.62, arm) : null;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "#26384c" }} />
      <Svg>
        <Hero cfg={DIMA} x={540} y={820} s={0.62} t={t} emotion={a ? "calm" : "smile"} frost={0.6} arm={arm} look={a ? [10, 14] : [0, 10]} wind={0.1} />
        {hp && <circle cx={hp.x} cy={hp.y - 30} r="46" fill="#f4f8fb" stroke={INK} strokeWidth="6" />}
        {!a && <Bottle water={ease(t, cut + 0.5, cut + 3.5, 0.05, 0.8)} x={540} y={1460} />}
      </Svg>
      <CaveFrame glow={0.4} />
      <Tip t={t} n={4} title="Не ешь снег" />
      {a ? <Mark t={t - 1.2} ok={false} /> : <Mark t={t - cut - 0.6} ok />}
      <Sfx at={1.2} name="survival/buzz" vol={0.35} />
      <Sfx at={cut + 0.6} name="survival/ding" vol={0.5} />
    </AbsoluteFill>
  );
};

/** Кулак-иконка «сжимай». */
const Fist = ({ t, x = 860, y = 1000 }: { t: number; x?: number; y?: number }) => {
  const sq = 1 - 0.12 * Math.max(0, Math.sin(t * 6));
  return (
    <g transform={`translate(${x} ${y}) scale(${sq})`} {...L}>
      <rect x="-90" y="-80" width="180" height="160" rx="50" fill="#2a2f35" stroke={INK} strokeWidth="9" />
      {[-55, -18, 19, 56].map((cx) => (
        <path key={cx} d={`M${cx} -80 V-20`} stroke="#454c54" strokeWidth="8" />
      ))}
    </g>
  );
};

/** 5. Не спи: веки закрываются, наползает темнота и снег; рывок — проснулся. */
const Sleep = ({ t, v }: SceneProps) => {
  const jolt = v.from + 1.4;
  const lid = t < jolt ? ease(t, 0.2, jolt - 0.1, 0.2, 0.97) : 0;
  const dark = t < jolt ? ease(t, 0.2, jolt, 0, 0.75) : clamp(0.75 - (t - jolt) * 3);
  const { dx, dy } = t > jolt && t < jolt + 0.35 ? shake(t, 18) : { dx: 0, dy: 0 };
  return (
    <AbsoluteFill style={{ transform: `translate(${dx}px,${dy}px)` }}>
      <AbsoluteFill style={{ background: "#26384c" }} />
      <Svg>
        <Hero cfg={DIMA} x={540} y={820} s={0.62} t={t} emotion={t > jolt && t < jolt + 1.2 ? "fear" : "calm"} lid={lid} frost={0.8} blinks={[]} wind={0.1} />
      </Svg>
      <CaveFrame glow={0.3} />
      <AbsoluteFill style={{ background: "#05080c", opacity: dark }} />
      {t > jolt + 0.6 && (
        <Svg>
          <Fist t={t} />
        </Svg>
      )}
      <Tip t={t} n={5} title="Не спи" />
      <Sfx name="sfx/heartbeat" vol={0.5} dur={jolt} />
      <Sfx at={jolt} name="sfx/gust" vol={0.6} dur={1.2} />
    </AbsoluteFill>
  );
};

// SOS: три коротких, три длинных, три коротких (секунды от начала сигнала)
const SOS = (() => {
  const seq = [0.25, 0.25, 0.25, 0.7, 0.7, 0.7, 0.25, 0.25, 0.25];
  let at = 0;
  return seq.map((d) => {
    const s = { from: at, to: at + d };
    at += d + 0.22;
    return s;
  });
})();

/** 6. Подай сигнал: фонарик мигает SOS в ночь. */
const Signal = ({ t, v }: SceneProps) => {
  const s0 = v.from + 1.2;
  const ts = t - s0;
  const on = SOS.some((q) => ts >= q.from && ts < q.to);
  const arm = -100;
  const hp = handPos(330, onGround(DIMA, 1560, 0.32), 0.32, arm);
  return (
    <AbsoluteFill>
      <Sky t={t} />
      <AbsoluteFill style={{ background: "#03060c", opacity: 0.45 }} />
      <Svg>
        <Burrow x={250} y={1560} s={0.8} />
        {on && <path d={`M${hp.x} ${hp.y} L1180 ${hp.y - 380} L1180 ${hp.y + 220} Z`} fill="#fff6c8" opacity="0.35" />}
        <Hero cfg={DIMA} x={330} y={onGround(DIMA, 1560, 0.32)} s={0.32} t={t} emotion="calm" arm={arm} look={[22, -4]} frost={0.7} full wind={0.4} />
        <circle cx={hp.x} cy={hp.y} r={on ? 26 : 12} fill={on ? "#fff6c8" : "#555"} />
        {/* полоска SOS: точки и тире подсвечиваются по ходу */}
        <g transform="translate(540 430)">
          {SOS.map((q, i) => {
            const w = q.to - q.from > 0.5 ? 90 : 34;
            const x = -400 + i * 92 + (i > 2 ? 20 : 0) + (i > 5 ? 20 : 0);
            const lit = ts >= q.from;
            return <rect key={i} x={x} y={-17} width={w} height="34" rx="17" fill={lit ? ORANGE : "#3a4656"} />;
          })}
        </g>
      </Svg>
      <Snow t={t} n={40} opacity={0.6} speed={0.8} wind={0.3} />
      <Tip t={t} n={6} title="Подай сигнал" />
      {SOS.map((q, i) => (
        <Sfx key={i} at={s0 + q.from} name="survival/click" vol={0.6} />
      ))}
    </AbsoluteFill>
  );
};

/** 7. Дождись утра: ночь, фонарик садится, батарейка пустеет, пар дыхания. */
const Night = ({ t, d }: SceneProps) => {
  const bat = ease(t, 0.5, d - 1.5, 1, 0);
  const flick = bat < 0.2 ? (Math.sin(t * 40) > 0 ? 1 : 0.2) * (bat / 0.2) : 1;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "#26384c" }} />
      <Svg>
        <Hero cfg={DIMA} x={540} y={860} s={0.56} t={t} emotion="calm" lid={0.45} frost={0.9} wind={0.1} />
        <Breath t={t} x={600} y={1060} s={1.1} />
      </Svg>
      <CaveFrame glow={0.3 * flick} />
      <AbsoluteFill style={{ background: "#03060c", opacity: 0.6 - 0.35 * flick }} />
      <Svg>
        <g transform="translate(870 380)" {...L}>
          <rect x="-70" y="-120" width="140" height="240" rx="18" fill="none" stroke="#fff" strokeWidth="10" />
          <rect x="-28" y="-145" width="56" height="25" rx="6" fill="#fff" />
          <rect x="-52" y={100 - 200 * bat} width="104" height={200 * bat} rx="8" fill={bat < 0.25 ? "#e5262b" : GREEN} />
        </g>
      </Svg>
      <Tip t={t} n={7} title="Дождись утра" />
      <Sfx name="sfx/breath" vol={0.35} />
    </AbsoluteFill>
  );
};

/** Вертолёт. */
const Heli = ({ t, x, y, s = 1 }: { t: number; x: number; y: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} {...L}>
    <path d="M-60 -10 L-330 -30 L-330 10 L-60 30 Z" fill="#c8352e" stroke={INK} strokeWidth="8" />
    <path d="M-330 -60 L-300 -60 L-300 30 L-330 30 Z" fill="#c8352e" stroke={INK} strokeWidth="6" />
    <ellipse cx="40" cy="0" rx="150" ry="90" fill="#e2453b" stroke={INK} strokeWidth="9" />
    <path d="M60 -60 C130 -60 175 -20 180 10 L60 10 Z" fill="#bfe3f7" stroke={INK} strokeWidth="6" />
    <path d="M-60 120 H170 M-20 90 V120 M120 90 V120" stroke={INK} strokeWidth="10" />
    <rect x="25" y="-112" width="30" height="24" fill={INK} />
    <ellipse cx="40" cy="-116" rx={260 * Math.abs(Math.sin(t * 30))} ry="10" fill={INK} opacity="0.75" />
  </g>
);

/** 8. Утро: вертолёт, луч находит нору, из норы — рука «класс». */
const Rescue = ({ t, d }: SceneProps) => {
  const hx = ease(t, 0, 2.5, 1350, 640);
  const hy = 420 + Math.sin(t * 2) * 12;
  const beamX = ease(t, 2.2, 3.6, 200, 430);
  const thumb = ease(t, 3.4, 3.9, 0, 1);
  return (
    <AbsoluteFill>
      <Sky t={t} dawn={ease(t, 0, d, 0.6, 1)} />
      <Svg>
        <path d={`M${hx + 40} ${hy + 90} L${beamX - 160} 1500 L${beamX + 160} 1500 Z`} fill="#fff6c8" opacity={ease(t, 1.8, 2.3, 0, 0.35)} />
        <Burrow x={430} y={1500} s={0.9} />
        <g transform={`translate(430 ${1480 - thumb * 160})`} opacity={thumb} {...L}>
          <path d="M0 160 L0 40" stroke={INK} strokeWidth="90" />
          <path d="M0 160 L0 40" stroke="#2f5f9e" strokeWidth="72" />
          <rect x="-55" y="-50" width="110" height="100" rx="34" fill="#2a2f35" stroke={INK} strokeWidth="8" />
          <rect x="-16" y="-120" width="34" height="90" rx="17" fill="#2a2f35" stroke={INK} strokeWidth="8" />
        </g>
        <Heli t={t} x={hx} y={hy} s={0.9} />
      </Svg>
      <Snow t={t} n={14} opacity={0.5} speed={0.4} wind={0.1} />
      <Sfx name="survival/heli" vol={0.7} />
      <Sfx at={3.6} name="survival/ding" vol={0.4} />
    </AbsoluteFill>
  );
};

/** 9. Финал: «сохрани это видео». */
const Outro = ({ t }: SceneProps) => {
  const p = ease(t, 0, 0.4, 0, 1);
  const pulse = 1 + 0.06 * Math.sin(t * 6);
  return (
    <AbsoluteFill>
      <Sky t={t} dawn={1} />
      <AbsoluteFill style={{ background: "rgba(10,16,24,.55)" }} />
      <Svg>
        <g transform={`translate(540 760) scale(${p * pulse})`} {...L}>
          <path d="M-110 -170 H110 V170 L0 90 L-110 170 Z" fill={ORANGE} stroke={INK} strokeWidth="12" />
        </g>
      </Svg>
    </AbsoluteFill>
  );
};

// ── сборка ─────────────────────────────────────────────────────────────

const SCENES: { id: string; C: React.FC<SceneProps>; gap?: number; tail?: number; min?: number }[] = [
  { id: "sv01", C: Hook, gap: 0.3, tail: 0.4 },
  { id: "sv02", C: Panic, gap: 0.5, tail: 0.6 },
  { id: "sv03", C: Wind, gap: 0.2, tail: 1.4 },
  { id: "sv04", C: Warm, gap: 0.3, tail: 0.8 },
  { id: "sv05", C: SnowEat, gap: 0.2, tail: 1.0 },
  { id: "sv06", C: Sleep, gap: 0.3, tail: 0.8 },
  { id: "sv07", C: Signal, gap: 0.2, tail: 1.6 },
  { id: "sv08", C: Night, gap: 0.3, tail: 1.0 },
  { id: "sv09", C: Rescue, gap: 3.2, tail: 0.8 },
  { id: "sv10", C: Outro, gap: 0.3, tail: 1.2 },
];

const FPS = 30;
const PLAN = (() => {
  let at = 0;
  return SCENES.map((s) => {
    const v = VO[s.id];
    const from = s.gap ?? 0.3;
    const d = Math.max(s.min ?? 0, from + v.dur + (s.tail ?? 0.6));
    const frames = Math.round(d * FPS);
    const p = { ...s, start: at, frames, d: frames / FPS, v: { from, to: from + v.dur }, cues: line(from, v.dur, v.text) as Cue[] };
    at += frames;
    return p;
  });
})();

export const SURVIVAL_FRAMES = PLAN.reduce((s, p) => s + p.frames, 0);

const SceneWrap = ({ p }: { p: (typeof PLAN)[number] }) => {
  const t = useT();
  const C = p.C;
  // склейка: короткое затемнение на входе
  const fade = clamp(t / 0.2);
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ opacity: fade }}>
        <C t={t} d={p.d} v={p.v} />
        <Finish vig={0.7} tint="#2a5a85" tintOpacity={0.08} grain={0.8} bigSnow={false} />
      </AbsoluteFill>
      <Subtitle t={t} cues={p.cues} accent={ORANGE} />
    </AbsoluteFill>
  );
};

/** Звук: ветер под всем роликом (тише на рассвете), голос рассказчика. */
export const Survival = () => {
  const rescueAt = PLAN.find((p) => p.id === "sv09")!.start;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Audio src={staticFile("audio/sfx/wind_strong.mp3")} loop volume={(f) => (f < rescueAt ? 0.35 : Math.max(0.05, 0.35 - (f - rescueAt) / 90))} />
      {PLAN.map((p) => (
        <Sequence key={p.id} from={p.start} durationInFrames={p.frames}>
          <SceneWrap p={p} />
          {VO[p.id].voiced && (
            <Sequence from={Math.round(p.v.from * FPS)} layout="none">
              <Audio src={staticFile(`audio/survival/${p.id}.mp3`)} />
            </Sequence>
          )}
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
