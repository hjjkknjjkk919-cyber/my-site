import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/google-fonts/Oswald";

const { fontFamily } = loadFont("normal", { weights: ["700"], subsets: ["cyrillic", "latin"] });

export const INK = "#0b1218";
export const RED = "#e5262b";
export const W = 1080;
export const H = 1920;

/** Секунды от начала сцены (внутри <Sequence> кадр локальный). */
export const useT = () => useCurrentFrame() / 30;

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/** Плавный переход значения from→to между секундами a и b (разгон и торможение). */
export const ease = (t: number, a: number, b: number, from: number, to: number) =>
  interpolate(t, [a, b], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });

/** Тряска камеры: amp в px при 1080 ширине. */
export const shake = (t: number, amp: number) => ({
  dx: (Math.sin(t * 93) + Math.sin(t * 57 + 1)) * amp * 0.55,
  dy: (Math.sin(t * 71 + 2) + Math.sin(t * 113)) * amp * 0.55,
});

/** Бумажные фильтры: шероховатость линий и зерно. Определяются один раз на svg. */
export const Defs = () => (
  <defs>
    <filter id="rough" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="11" result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale="7" />
    </filter>
    <filter id="paper" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" seed="4" result="t" />
      <feColorMatrix in="t" type="matrix" values="0 0 0 0 0.55  0 0 0 0 0.65  0 0 0 0 0.75  0 0 0 0.16 -0.02" />
    </filter>
    <radialGradient id="vig" cx="50%" cy="38%" r="75%">
      <stop offset="45%" stopColor="#000" stopOpacity="0" />
      <stop offset="100%" stopColor="#02050a" stopOpacity="0.9" />
    </radialGradient>
  </defs>
);

export const Svg = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox={`0 0 ${W} ${H}`}
    preserveAspectRatio="xMidYMid slice"
    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", ...style }}
  >
    <Defs />
    {children}
  </svg>
);

/** Верхний слой: виньетка + холодный оттенок + зерно. */
export const Finish = ({ vig = 1, tint = "#2a5a85", tintOpacity = 0.12, grain = 1 }) => (
  <Svg>
    <rect width={W} height={H} fill="url(#vig)" opacity={vig} />
    <rect width={W} height={H} fill={tint} opacity={tintOpacity} />
    <rect width={W} height={H} filter="url(#paper)" opacity={grain} />
  </Svg>
);

/** Снег: детерминированные кружки, медленный дрейф. */
export const Snow = ({ t, n = 30, opacity = 0.55, speed = 1, wind = 0 }: { t: number; n?: number; opacity?: number; speed?: number; wind?: number }) => (
  <Svg>
    <g fill="#cfe0ec" opacity={opacity}>
      {Array.from({ length: n }, (_, i) => {
        const x = (((random(`sx${i}`) * W + t * ((20 + random(`vx${i}`) * 30) * speed + wind * 700)) % W) + W) % W;
        const y = (random(`sy${i}`) * H + t * (60 + random(`vy${i}`) * 80) * speed) % H;
        return <circle key={i} cx={x} cy={y} r={3 + random(`sr${i}`) * 3} />;
      })}
    </g>
  </Svg>
);

/** Свет лачуги: единственный тёплый источник ночью. */
export const ShackLight = ({ t, strength = 1 }: { t: number; strength?: number }) => {
  let fl = 0.82 + 0.12 * Math.sin(t * 29) + 0.06 * Math.sin(t * 83);
  if ((t * 6.3) % 4 < 0.18) fl *= 0.35;
  fl *= strength;
  return (
    <>
      <AbsoluteFill
        style={{
          opacity: fl,
          mixBlendMode: "overlay",
          background:
            "radial-gradient(58% 42% at 52% 38%,rgba(190,132,40,.95) 0%,rgba(140,95,28,.7) 45%,rgba(0,0,0,0) 90%)",
        }}
      />
      <AbsoluteFill
        style={{
          opacity: fl * 0.9,
          mixBlendMode: "screen",
          background: "radial-gradient(34% 20% at 52% 31%,rgba(140,95,30,.38) 0%,rgba(0,0,0,0) 75%)",
        }}
      />
    </>
  );
};

/**
 * Субтитры как в образце: Oswald 700 ЗАГЛАВНЫМИ, белые с обводкой, низ кадра (72%).
 * Слова появляются по одному под голос. *слово* — красное (только хук и финал).
 */
export type Cue = { from: number; to: number; text: string; /** секунд на слово, для медленной речи */ step?: number };

/** Серая метельная палитра: всё блёкнет, цветными остаются только слои поверх Grade. */
export const Grade = ({ children }: { children: React.ReactNode }) => (
  <AbsoluteFill style={{ filter: "saturate(.22) contrast(1.08) brightness(.97)" }}>{children}</AbsoluteFill>
);

export const Subtitle = ({ t, cues }: { t: number; cues: Cue[] }) => {
  const c = cues.find((q) => t >= q.from && t < q.to);
  if (!c) return null;
  const words = c.text.split(" ");
  const step = c.step ?? Math.min(0.28, ((c.to - c.from) * 0.6) / words.length);
  const fade = c.step ? 0.3 : 0.1;
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        top: "72%",
        transform: "translateY(-50%)",
        textAlign: "center",
        // морозный белый, обводка тёмный сланец, холодное свечение — в тон метели
        color: "#e6ecef",
        fontFamily,
        fontWeight: 700,
        fontSize: 92,
        lineHeight: 1.12,
        textTransform: "uppercase",
        letterSpacing: "0.02em",
        WebkitTextStroke: "6px #141b21",
        paintOrder: "stroke fill",
        textShadow: "0 0 22px rgba(190,210,225,.35), 0 6px 14px rgba(0,0,0,.6)",
      }}
    >
      {words.map((w, i) => {
        const a = clamp((t - c.from - i * step) / fade);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              marginRight: "0.24em",
              opacity: a,
              // слово проступает из снега: размытие уходит, ветер приносит его слева
              filter: a < 1 ? `blur(${(1 - a) * 6}px)` : undefined,
              transform: `translateX(${(a - 1) * 16}px)`,
              color: w.includes("*") ? RED : undefined,
            }}
          >
            {w.replace(/\*/g, "")}
          </span>
        );
      })}
    </div>
  );
};

/** Помехи 0.25 с: шум, цветные полосы, чёрный маскирует склейку. */
export const Glitch = ({ amount = 1 }: { amount?: number }) => {
  const f = useCurrentFrame();
  const cols = [RED, "#00dcff", "#f2c94c", "#000"];
  return (
    <AbsoluteFill style={{ opacity: clamp(amount * (0.5 + 0.45 * random(`go${f}`))) }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <filter id="gn">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" seed={f} />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0" intercept="1" />
          </feComponentTransfer>
        </filter>
        <rect width={W} height={H} filter="url(#gn)" />
        {Array.from({ length: 8 }, (_, j) => (
          <rect
            key={j}
            x={-60 * random(`gx${f}${j}`)}
            y={random(`gy${f}${j}`) * H}
            width={W + 60}
            height={10 + random(`gh${f}${j}`) * 90}
            fill={cols[j % 4]}
            opacity={0.65}
          />
        ))}
      </svg>
    </AbsoluteFill>
  );
};
