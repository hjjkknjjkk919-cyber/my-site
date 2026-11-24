import { AbsoluteFill } from "remotion";
import { StasFace } from "../components/Character";
import { clamp, Cue, Finish, Glitch, ShackLight, shake, Snow, Subtitle, Svg, useT } from "../components/fx";
import { CameraFrame } from "../components/props";
import { line, Say, Sfx } from "../components/audio";

const CUES: Cue[] = [...line(0.2, 1.95, "Четыре дня назад они ржали."), ...line(2.45, 2.05, "Сейчас один из них еле *дышит*.")];

/** Сцена 1 (0–5 с): хук. Тайминги из исходного HTML. Чёрный 4.75–4.85, затем остаток помех до склейки. */
export const Scene01 = () => {
  const t = useT();
  let sc = 1;
  let amp = 1.5;
  if (t >= 0.3 && t < 2) {
    const p = (t - 0.3) / 1.7;
    sc = 1 + 0.08 * p;
    amp = 2 + p;
  } else if (t >= 2 && t < 4.3) {
    const q = (t - 2) / 2.3;
    sc = 1.06 + 0.19 * q * q;
    amp = 3 + 9 * q;
  } else if (t >= 4.3) {
    sc = 1.25;
    amp = 0;
  }
  if (t >= 2.8) amp *= Math.max(0, (3 - t) / 0.2);
  let { dx, dy } = shake(t, amp);
  let rot = 0;
  let fy = 0;
  if (t >= 4.3) {
    const f = clamp((t - 4.3) / 0.15);
    const ff = f * f;
    rot = -22 * ff;
    fy = 0.06 * ff * 1920;
    sc = 1.25 + 0.15 * ff;
    if (t >= 4.45) {
      // дрожь после падения: детерминированная, чтобы рендер был повторяемым
      dx += Math.sin(t * 400) * 15;
      dy += Math.cos(t * 330) * 10;
    }
  }
  const glitch = t >= 4.5 && t < 4.75;
  const splash = t >= 4.4 && t < 4.75 ? 1 - Math.pow(1 - clamp((t - 4.4) / 0.1), 3) : 0;
  const hue = Math.sin(t * 977) * 60;

  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Sfx name="sfx/wind_light" vol={0.45} />
      <Sfx name="sfx/breath" vol={0.5} dur={4.3} />
      <Sfx at={4.3} name="sfx/camfall" vol={0.9} />
      <Say at={0.2} clip="n01" />
      <Say at={2.45} clip="n02" />
      <AbsoluteFill
        style={{
          transformOrigin: "50% 27%",
          transform: `translate(${dx}px,${dy + fy}px) rotate(${rot}deg) scale(${sc})`,
          filter: glitch ? `contrast(1.7) saturate(2) hue-rotate(${hue}deg)` : "contrast(1.15) saturate(.8) brightness(.9)",
        }}
      >
        <Svg>
          <rect width={1080} height={1920} fill="#0a1118" />
        </Svg>
        <Snow t={t} n={20} />
        <StasFace t={t} trem={t < 2 ? 0.6 : 0.6 + (t - 2)} />
        <Finish />
      </AbsoluteFill>
      {/* жёлтый свет окна лачуги + виньетка кино */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(62% 44% at 52% 40%,rgba(0,0,0,0) 0%,rgba(2,2,3,.35) 50%,rgba(1,1,2,.93) 100%)",
        }}
      />
      <ShackLight t={t} />
      {/* это запись с камеры Димы, которую Стас унёс ночью */}
      {t < 4.4 && <CameraFrame t={t} />}
      <Subtitle t={t} cues={CUES} />
      {/* снежная вспышка с трещиной: линии из точки удара */}
      <AbsoluteFill style={{ transformOrigin: "28% 78%", transform: `scale(${splash})` }}>
        <Svg>
          <g fill="#dbe6ee">
            {[[250, 1550, 700], [800, 1650, 600], [700, 900, 620], [200, 700, 520], [850, 300, 520], [300, 150, 450]].map(([x, y, r]) => (
              <circle key={x} cx={x} cy={y} r={r} />
            ))}
          </g>
          <g fill="#f5f9fc" opacity=".9">
            {[[330, 1450, 260], [720, 1180, 200], [520, 700, 230], [850, 520, 160], [240, 420, 180], [640, 1700, 180]].map(([x, y, r]) => (
              <circle key={x} cx={x} cy={y} r={r} />
            ))}
          </g>
          <g fill="none" stroke="#1a232c" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M300 1500 L520 1320 L610 1090 L860 880 L1080 760" />
            <path d="M300 1500 L140 1180 L60 900" />
            <path d="M300 1500 L560 1610 L820 1580 L1080 1700" />
            <path d="M610 1090 L540 860 L600 600" />
            <path d="M300 1500 L280 1760 L340 1920" />
          </g>
        </Svg>
      </AbsoluteFill>
      {glitch && <Glitch />}
      {/* 4.75–4.85 чёрный (0.1 с), 4.85–5.0 затухающие помехи до склейки */}
      {t >= 4.75 && t < 4.85 && <AbsoluteFill style={{ background: "#000" }} />}
      {t >= 4.85 && <Glitch amount={clamp((5 - t) / 0.15) * 0.7} />}
    </AbsoluteFill>
  );
};
