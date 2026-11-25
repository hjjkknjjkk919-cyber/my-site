import React from "react";
import { AbsoluteFill, random, Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { Sfx } from "../components/audio";
import { clamp, ease, Svg, useT } from "../components/fx";

/**
 * Новый стиль (как «Гость»): мягкие плоские цвета, тёмно-коричневый контур, детальные глаза,
 * румянец, морщины, щетина точками, мягкие тени, виньетка.
 */
const LINE = "#3b2b26";
const LW = 7;

// ── Дима, новый дизайн ─────────────────────────────────────────────────
const SKIN = "#e9c4a8";
const SKIN_SH = "#cf9f84";
const HAIR = "#3a2a22";
const HOOD = "#2f5f9e";
const HOOD_SH = "#1b365c";

export type DimaProps = {
  t: number;
  fear?: number; // 0..1
  eyes?: number; // открытость 0..1.3
  look?: [number, number];
  mouth?: "closed" | "clench" | "open" | "o";
  sweat?: number;
  tears?: number;
  tremble?: number;
};

/** Лицо Димы анфас; центр лица (540, 900), ширина ~620. */
export const DimaFace = ({ t, fear = 0.3, eyes = 1, look = [0, 0], mouth = "closed", sweat = 0, tears = 0, tremble = 0 }: DimaProps) => {
  const tr = tremble * (Math.sin(t * 63) * 3 + Math.sin(t * 101) * 2);
  const eo = clamp(eyes, 0.05, 1.3);
  const lx = look[0] * 28;
  const ly = look[1] * 16;
  const pupil = 26 - fear * 12;
  const browY = -fear * 30;
  const jaw = mouth === "clench" ? Math.abs(Math.sin(t * 8)) * 5 : 0;
  const tearPh = clamp((tears - 0.5) * 2);
  const drops = Array.from({ length: 3 }, (_, i) => {
    const ph = (t * (0.15 + i * 0.05) + random(`ds${i}`)) % 1;
    return { x: i === 1 ? 810 : 268 + i * 6, y: 640 + ph * 420, a: sweat * Math.sin(ph * Math.PI) };
  });
  const eye = (cx: number, side: -1 | 1) => (
    <g key={cx}>
      <defs>
        <clipPath id={`gE${cx}`}>
          <path d={`M${cx - 98} 860 C${cx - 60} ${860 - 66 * eo} ${cx + 60} ${860 - 66 * eo} ${cx + 98} 860 C${cx + 60} ${860 + 52 * eo} ${cx - 60} ${860 + 52 * eo} ${cx - 98} 860 Z`} />
        </clipPath>
        <radialGradient id={`gI${cx}`} cx="50%" cy="40%" r="60%">
          <stop offset="0" stopColor="#9a7552" />
          <stop offset="0.7" stopColor="#6b4a30" />
          <stop offset="1" stopColor="#3e2a1b" />
        </radialGradient>
      </defs>
      {/* тёмные круги под глазами от страха */}
      <path d={`M${cx - 92} ${880 + 40 * eo} C${cx - 40} ${905 + 56 * eo} ${cx + 40} ${905 + 56 * eo} ${cx + 92} ${880 + 40 * eo}`} stroke="#b98c78" strokeWidth="10" fill="none" opacity={0.3 + fear * 0.4} />
      <path d={`M${cx - 98} 860 C${cx - 60} ${860 - 66 * eo} ${cx + 60} ${860 - 66 * eo} ${cx + 98} 860 C${cx + 60} ${860 + 52 * eo} ${cx - 60} ${860 + 52 * eo} ${cx - 98} 860 Z`} fill="#fbf7f3" />
      <g clipPath={`url(#gE${cx})`}>
        <path d={`M${cx - 96} 860 l30 -4 l14 8 M${cx + 96} 862 l-28 2 l-12 -9`} stroke="#d06a6a" strokeWidth="2.5" fill="none" opacity={fear * 0.8} />
        <circle cx={cx + lx} cy={858 + ly} r="46" fill={`url(#gI${cx})`} stroke={LINE} strokeWidth="4" />
        <circle cx={cx + lx} cy={858 + ly} r={pupil} fill="#141010" />
        <circle cx={cx + lx - 16} cy={858 + ly - 16} r="11" fill="#fff" />
        <circle cx={cx + lx + 14} cy={858 + ly + 12} r="5" fill="#fff" opacity="0.8" />
        {/* тень верхнего века */}
        <path d={`M${cx - 100} 800 H${cx + 100} V${860 - 50 * eo} C${cx + 40} ${860 - 60 * eo} ${cx - 40} ${860 - 60 * eo} ${cx - 100} ${860 - 50 * eo} Z`} fill="#000" opacity="0.12" />
      </g>
      {/* верхнее веко с ресницами */}
      <path d={`M${cx - 104} 862 C${cx - 62} ${858 - 70 * eo} ${cx + 62} ${858 - 70 * eo} ${cx + 104} 862`} fill="none" stroke={LINE} strokeWidth="9" strokeLinecap="round" />
      {[-0.7, -0.35, 0, 0.35, 0.7].map((k, i) => (
        <path key={i} d={`M${cx + k * 92} ${860 - 64 * eo * (1 - k * k * 0.5)} l${k * 10 + side * 4} -16`} stroke={LINE} strokeWidth="5" strokeLinecap="round" />
      ))}
      <path d={`M${cx - 86} ${866 + 44 * eo} C${cx - 40} ${872 + 54 * eo} ${cx + 40} ${872 + 54 * eo} ${cx + 86} ${866 + 44 * eo}`} fill="none" stroke={LINE} strokeWidth="4" opacity="0.7" />
      {/* влажная кромка */}
      <path d={`M${cx - 80} ${868 + 44 * eo} C${cx - 40} ${874 + 52 * eo} ${cx + 40} ${874 + 52 * eo} ${cx + 80} ${868 + 44 * eo}`} fill="none" stroke="#dff1ff" strokeWidth="5" opacity={tears} />
      {/* бровь: внутренний край поднимается от страха */}
      <path d={side < 0 ? `M${cx - 110} ${752 + browY * 0.2} C${cx - 50} ${722 + browY * 0.6} ${cx + 30} ${716 + browY} ${cx + 96} ${738 + browY * 1.6}` : `M${cx + 110} ${752 + browY * 0.2} C${cx + 50} ${722 + browY * 0.6} ${cx - 30} ${716 + browY} ${cx - 96} ${738 + browY * 1.6}`} fill="none" stroke={HAIR} strokeWidth="26" strokeLinecap="round" />
    </g>
  );
  return (
    <g transform={`translate(${tr} 0)`}>
      {/* капюшон / куртка */}
      <path d="M60 1920 C40 1500 120 1300 300 1230 L780 1230 C960 1300 1040 1500 1020 1920 Z" fill={HOOD} stroke={LINE} strokeWidth={LW} />
      <path d="M760 1240 C930 1320 1000 1500 1020 1920 L860 1920 C860 1600 840 1400 760 1240 Z" fill={HOOD_SH} />
      <path d="M540 1260 V1920" stroke={LINE} strokeWidth="6" />
      <path d="M400 1230 C420 1330 470 1380 540 1380 C610 1380 660 1330 680 1230" fill="#ddd2c4" stroke={LINE} strokeWidth="6" />
      {/* шея */}
      <path d="M440 1150 L440 1280 C480 1310 600 1310 640 1280 L640 1150 Z" fill={SKIN_SH} stroke={LINE} strokeWidth={LW} />
      {/* капюшон вокруг головы */}
      <path d="M100 1300 C60 900 140 380 540 340 C940 380 1020 900 980 1300 C900 1260 860 1200 840 1150 C900 900 840 560 540 520 C240 560 180 900 240 1150 C220 1200 180 1260 100 1300 Z" fill={HOOD} stroke={LINE} strokeWidth={LW} />
      <path d="M760 400 C930 500 1010 760 980 1300 C930 1270 890 1230 860 1180 C900 900 860 620 760 400 Z" fill={HOOD_SH} />
      {/* мех по краю капюшона */}
      <path d="M215 1160 C150 900 230 530 540 500 C850 530 930 900 865 1160" fill="none" stroke="#c9d1d8" strokeWidth="56" strokeLinecap="round" />
      {Array.from({ length: 40 }, (_, i) => {
        const a = Math.PI * (0.08 + (i / 39) * 0.84);
        const x = 540 - Math.cos(a) * 335;
        const y = 1160 - Math.sin(a) * 640;
        return <path key={i} d={`M${x} ${y} l${-Math.cos(a) * 22 + (i % 2) * 6} ${-Math.sin(a) * 20}`} stroke="#eef2f5" strokeWidth="9" strokeLinecap="round" />;
      })}
      {/* лицо */}
      <path d="M540 540 C750 540 845 670 845 860 C845 1050 810 1150 740 1200 C680 1240 400 1240 340 1200 C270 1150 235 1050 235 860 C235 670 330 540 540 540 Z" fill={SKIN} stroke={LINE} strokeWidth={LW} />
      <path d="M770 640 C850 760 860 960 800 1110 C760 1170 720 1200 690 1215 C770 1110 800 940 770 640 Z" fill={SKIN_SH} opacity="0.55" />
      {/* щетина */}
      {Array.from({ length: 160 }, (_, i) => {
        const a = random(`gs${i}`);
        const x = 320 + a * 440;
        const y = 1060 + random(`gy${i}`) * 150 - Math.abs(x - 540) * 0.15;
        return <circle key={i} cx={x} cy={y} r="3.2" fill="#6e5244" opacity="0.55" />;
      })}
      {/* румянец */}
      <ellipse cx="335" cy="1010" rx="60" ry="30" fill="#e39b8e" opacity="0.35" />
      <ellipse cx="745" cy="1010" rx="60" ry="30" fill="#e39b8e" opacity="0.35" />
      {/* волосы: чёлка прядями */}
      <path d="M268 700 C290 590 390 548 540 548 C690 548 790 590 812 700 C780 660 750 640 715 640 L690 676 L650 632 L610 672 L570 628 L530 672 L490 632 L450 674 L410 640 C350 645 300 665 268 700 Z" fill={HAIR} stroke={LINE} strokeWidth={LW} strokeLinejoin="round" />
      {/* морщины на лбу от страха */}
      <g stroke={SKIN_SH} strokeWidth="5" fill="none" opacity={fear} strokeLinecap="round">
        <path d="M470 700 C510 692 570 692 610 700" />
        <path d="M530 760 L536 800 M550 760 L544 800" />
      </g>
      {eye(395, -1)}
      {eye(685, 1)}
      {/* нос */}
      <path d="M555 900 C570 960 585 1010 575 1035 C560 1050 520 1050 505 1035" fill="none" stroke={LINE} strokeWidth="6" strokeLinecap="round" />
      <ellipse cx="540" cy="1040" rx="50" ry="10" fill={SKIN_SH} opacity="0.5" />
      {/* рот */}
      {mouth === "closed" && <path d="M480 1120 C515 1112 565 1112 600 1120" stroke={LINE} strokeWidth="7" fill="none" strokeLinecap="round" />}
      {mouth === "clench" && (
        <g>
          <path d="M455 1110 C500 1096 580 1096 625 1110 C620 1140 580 1155 540 1155 C500 1155 460 1140 455 1110 Z" fill="#4a1e1e" stroke={LINE} strokeWidth="6" />
          <path d="M462 1112 C505 1102 575 1102 618 1112 L615 1132 C575 1128 505 1128 465 1132 Z" fill="#fbf6ee" />
          <path d="M465 1132 C505 1128 575 1128 615 1132 L612 1148 C575 1152 505 1152 468 1148 Z" fill="#efe6da" />
          {[485, 510, 535, 560, 585].map((x) => <path key={x} d={`M${x} 1104 V1152`} stroke="#c8baa8" strokeWidth="2" />)}
          <path d={`M${300 - jaw} 1080 C${312 - jaw} 1110 ${320 - jaw} 1130 ${330 - jaw} 1150 M${780 + jaw} 1080 C${768 + jaw} 1110 ${760 + jaw} 1130 ${750 + jaw} 1150`} stroke={SKIN_SH} strokeWidth="7" fill="none" strokeLinecap="round" />
        </g>
      )}
      {(mouth === "open" || mouth === "o") && (
        <g>
          <path d={mouth === "o" ? "M500 1100 C505 1080 575 1080 580 1100 C590 1150 570 1185 540 1185 C510 1185 490 1150 500 1100 Z" : "M460 1100 C480 1080 600 1080 620 1100 C625 1180 590 1225 540 1225 C490 1225 455 1180 460 1100 Z"} fill="#3d1414" stroke={LINE} strokeWidth="7" />
          {mouth === "open" && <path d="M478 1096 C500 1088 580 1088 602 1096 L598 1112 C575 1106 505 1106 482 1112 Z" fill="#fbf6ee" />}
          <ellipse cx="540" cy={mouth === "o" ? 1165 : 1200} rx={mouth === "o" ? 20 : 40} ry="12" fill="#a24545" />
        </g>
      )}
      {/* пот */}
      {drops.map((d, i) => (
        <g key={i} opacity={d.a}>
          <path d={`M${d.x} ${d.y - 26} C${d.x + 12} ${d.y - 6} ${d.x + 12} ${d.y + 12} ${d.x} ${d.y + 12} C${d.x - 12} ${d.y + 12} ${d.x - 12} ${d.y - 6} ${d.x} ${d.y - 26} Z`} fill="#8fd0f2" stroke={LINE} strokeWidth="3" />
          <circle cx={d.x - 4} cy={d.y - 2} r="3.5" fill="#fff" />
        </g>
      ))}
      {/* слеза */}
      {tears > 0.05 && (
        <g>
          {tearPh > 0 && <path d={`M700 925 C703 980 708 ${930 + tearPh * 220} 710 ${930 + tearPh * 260}`} stroke="#bfe6fb" strokeWidth="7" fill="none" opacity="0.8" strokeLinecap="round" />}
          <path d={`M710 ${922 + tearPh * 260 - 18 * clamp(tears * 2)} C724 ${938 + tearPh * 260} 724 ${954 + tearPh * 260} 710 ${954 + tearPh * 260} C696 ${954 + tearPh * 260} 696 ${938 + tearPh * 260} 710 ${922 + tearPh * 260 - 18 * clamp(tears * 2)} Z`} fill="#8fd0f2" stroke={LINE} strokeWidth="3" />
        </g>
      )}
    </g>
  );
};

/** Дима со спины по плечи (вид из-за плеча). Центр затылка (540, 1300). */
export const DimaBack = ({ t, lean = 0 }: { t: number; lean?: number }) => {
  const br = Math.sin(t * 2.4) * 6;
  return (
    <g transform={`translate(0 ${br - lean * 60}) `}>
      <path d="M-60 1920 C-40 1650 120 1520 330 1480 L750 1480 C960 1520 1120 1650 1140 1920 Z" fill={HOOD} stroke={LINE} strokeWidth={LW} />
      <path d="M760 1490 C960 1540 1100 1660 1140 1920 L900 1920 C880 1700 840 1580 760 1490 Z" fill={HOOD_SH} />
      <path d="M430 1420 L430 1500 C470 1520 610 1520 650 1500 L650 1420 Z" fill={SKIN_SH} stroke={LINE} strokeWidth={LW} />
      {/* капюшон со спины */}
      <path d="M540 900 C790 900 850 1080 845 1260 C840 1420 760 1500 540 1510 C320 1500 240 1420 235 1260 C230 1080 290 900 540 900 Z" fill={HOOD} stroke={LINE} strokeWidth={LW} />
      <path d="M700 930 C820 1000 850 1150 845 1260 C840 1400 790 1470 700 1500 C780 1380 790 1150 700 930 Z" fill={HOOD_SH} />
      <path d="M540 905 C560 1100 560 1300 540 1505" stroke={HOOD_SH} strokeWidth="8" fill="none" />
      <path d="M300 1060 C360 980 450 950 520 945" stroke="#5f87c0" strokeWidth="12" fill="none" opacity="0.6" />
    </g>
  );
};

// ── существо ───────────────────────────────────────────────────────────
const PALE = "#d9d6c8";
const PALE_SH = "#aaa79a";

/** Лицо существа вплотную к стеклу: впалые глаза, огромная улыбка, острые зубы, пальцы на стекле. */
export const CreatureFace = ({ t, open = 1, press = 1 }: { t: number; open?: number; press?: number }) => {
  const tw = Math.sin(t * 40) * 3;
  const teeth = (n: number, y0: number, w: number, dir: 1 | -1, h: number) =>
    Array.from({ length: n }, (_, i) => {
      const x0 = 540 - w / 2 + (i * w) / n;
      const hh = h * (0.7 + 0.3 * random(`ct${i}${dir}`)) * (1 - Math.abs(i - n / 2) / n);
      return <path key={i} d={`M${x0} ${y0} L${x0 + w / n / 2} ${y0 + dir * hh} L${x0 + w / n} ${y0} Z`} fill="#efe8d0" stroke={LINE} strokeWidth="3" />;
    });
  const hand = (x: number, flip: 1 | -1) => (
    <g transform={`translate(${x} 1150) scale(${flip} 1)`}>
      <path d="M0 0 C-40 -30 -60 -80 -50 -120 L-20 -110 C-10 -80 10 -50 30 -40 Z" fill={PALE} stroke={LINE} strokeWidth="5" />
      {[-150, -110, -70, -30].map((a, i) => {
        const r = (a * Math.PI) / 180;
        const L = 230 + i * 20;
        return (
          <g key={i}>
            <path d={`M0 0 L${Math.cos(r) * L} ${Math.sin(r) * L}`} stroke={LINE} strokeWidth="30" strokeLinecap="round" />
            <path d={`M0 0 L${Math.cos(r) * L} ${Math.sin(r) * L}`} stroke={PALE} strokeWidth="22" strokeLinecap="round" />
            <circle cx={Math.cos(r) * L * 0.5} cy={Math.sin(r) * L * 0.5} r="9" fill={PALE_SH} />
            <ellipse cx={Math.cos(r) * L} cy={Math.sin(r) * L} rx="16" ry="12" fill="#e9e6da" stroke={LINE} strokeWidth="3" transform={`rotate(${a} ${Math.cos(r) * L} ${Math.sin(r) * L})`} />
          </g>
        );
      })}
    </g>
  );
  return (
    <g transform={`translate(${tw} 0) translate(540 900) scale(${1 + press * 0.04}) translate(-540 -900)`}>
      {/* шея */}
      <path d="M470 1300 L450 1920 H630 L610 1300 Z" fill={PALE_SH} stroke={LINE} strokeWidth="6" />
      {/* голова: вытянутая, лысая */}
      <path d="M540 260 C780 260 860 470 850 760 C840 1080 760 1360 540 1380 C320 1360 240 1080 230 760 C220 470 300 260 540 260 Z" fill={PALE} stroke={LINE} strokeWidth={LW} />
      <path d="M770 420 C860 640 850 1000 760 1260 C700 1340 640 1370 590 1380 C760 1240 800 900 770 420 Z" fill={PALE_SH} opacity="0.6" />
      {/* шрам и морщины */}
      <path d="M330 520 L400 640 M345 560 l20 -8 M365 595 l20 -8" stroke="#b55b5b" strokeWidth="6" fill="none" strokeLinecap="round" />
      <g stroke={PALE_SH} strokeWidth="5" fill="none" strokeLinecap="round">
        <path d="M400 440 C470 425 610 425 680 440" />
        <path d="M420 480 C490 468 590 468 660 480" />
        <path d="M290 900 C300 980 330 1040 360 1080 M790 900 C780 980 750 1040 720 1080" />
      </g>
      {/* пятна */}
      {Array.from({ length: 50 }, (_, i) => (
        <circle key={i} cx={300 + random(`cp${i}`) * 480} cy={700 + random(`cq${i}`) * 500} r={2 + random(`cr${i}`) * 4} fill="#7d7464" opacity="0.6" />
      ))}
      {/* глазницы и глаза */}
      {[400, 680].map((cx, i) => (
        <g key={cx}>
          <ellipse cx={cx} cy="700" rx="105" ry="85" fill="#6f6b62" opacity="0.75" />
          <ellipse cx={cx} cy="705" rx="70" ry="54" fill="#f7f3e6" stroke={LINE} strokeWidth="5" />
          <path d={`M${cx - 66} 705 l26 -6 M${cx + 66} 708 l-24 4`} stroke="#c44" strokeWidth="3" />
          <circle cx={cx + (i ? -8 : 8)} cy="708" r="24" fill="#7fa0b6" stroke={LINE} strokeWidth="3" />
          <circle cx={cx + (i ? -8 : 8)} cy="708" r="7" fill="#000" />
          <circle cx={cx + (i ? -14 : 2)} cy="700" r="5" fill="#fff" />
        </g>
      ))}
      {/* нос — две щели */}
      <path d="M520 860 l-8 30 M560 860 l8 30" stroke={LINE} strokeWidth="6" strokeLinecap="round" />
      {/* улыбка от уха до уха */}
      <path d={`M290 980 C380 ${1010 + open * 40} 700 ${1010 + open * 40} 790 980 C760 ${1080 + open * 150} 640 ${1140 + open * 180} 540 ${1140 + open * 180} C440 ${1140 + open * 180} 320 ${1080 + open * 150} 290 980 Z`} fill="#2a0a0a" stroke={LINE} strokeWidth={LW} />
      <g>{teeth(16, 990 + open * 18, 470, 1, 60 + open * 30)}</g>
      <g>{teeth(14, 1110 + open * 170, 380, -1, 50 + open * 30)}</g>
      <path d="M290 980 C270 960 262 940 270 920 M790 980 C810 960 818 940 810 920" stroke={LINE} strokeWidth="6" fill="none" strokeLinecap="round" />
      {/* щетина-точки */}
      {Array.from({ length: 60 }, (_, i) => (
        <circle key={i} cx={330 + random(`cs${i}`) * 420} cy={1200 + random(`ct${i}`) * 130} r="3" fill="#5c574e" opacity="0.6" />
      ))}
      {hand(150, 1)}
      {hand(930, -1)}
    </g>
  );
};

/** Стекло межвагонной двери: рама, грязь, блик, запотевание дыханием. */
const DoorGlass = ({ children, fogA = 0, crack = 0 }: { children?: React.ReactNode; fogA?: number; crack?: number }) => (
  <g>
    <defs>
      <clipPath id="dgClip">
        <rect x="140" y="260" width="800" height="1200" rx="40" />
      </clipPath>
      <linearGradient id="dgShine" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity="0.14" />
        <stop offset="0.4" stopColor="#fff" stopOpacity="0" />
      </linearGradient>
    </defs>
    {/* дверь */}
    <rect x="0" y="0" width="1080" height="1920" fill="#5b6b72" />
    <rect x="40" y="80" width="1000" height="1840" rx="30" fill="#6f8088" stroke={LINE} strokeWidth="10" />
    <g clipPath="url(#dgClip)">
      <rect x="140" y="260" width="800" height="1200" fill="#06080c" />
      {children}
      <rect x="140" y="260" width="800" height="1200" fill="url(#dgShine)" />
      <ellipse cx="540" cy="1100" rx={260 * fogA} ry={160 * fogA} fill="#dfe8ef" opacity={0.35 * fogA} />
      {Array.from({ length: 30 }, (_, i) => (
        <circle key={i} cx={160 + random(`dd${i}`) * 760} cy={280 + random(`de${i}`) * 1160} r={2 + random(`df${i}`) * 5} fill="#9aa7ad" opacity="0.25" />
      ))}
      {crack > 0 && (
        <g stroke="#e9f1f5" strokeWidth="4" fill="none" opacity={crack}>
          <path d="M540 820 L420 620 L380 420 M540 820 L700 640 L820 520 M540 820 L560 1080 L500 1300 M540 820 L300 900 M540 820 L820 960" />
        </g>
      )}
    </g>
    <rect x="140" y="260" width="800" height="1200" rx="40" fill="none" stroke={LINE} strokeWidth="14" />
    <rect x="150" y="270" width="780" height="1180" rx="34" fill="none" stroke="#2a3236" strokeWidth="10" />
    {/* ручка */}
    <rect x="880" y="1540" width="60" height="200" rx="20" fill="#c3cbcf" stroke={LINE} strokeWidth="8" />
  </g>
);

// ── атмосфера вагона: приглушённый свет, мигание, пыль, тряска, огни за окном ──
/** Яркость лампы: приглушённо, иногда проваливается и мигает. */
export const lampLevel = (t: number) => {
  const burst = (t % 6.3) > 5.6; // раз в ~6 с короткая серия миганий
  const f = burst ? (Math.sin(t * 70) > 0.2 ? 1 : 0.25) : 1;
  return (0.78 + 0.06 * Math.sin(t * 3.1)) * f;
};
/** Покачивание вагона и толчок на стыке рельсов (раз в ~0.95 с). */
export const ride = (t: number) => {
  const ph = (t % 0.95) / 0.95;
  const bump = ph < 0.08 ? Math.sin((ph / 0.08) * Math.PI) : 0;
  return { x: Math.sin(t * 1.3) * 6, y: bump * 7 + Math.sin(t * 2.1) * 2, rot: Math.sin(t * 0.9) * 0.4 };
};

/** Свет сверху + тень + пыль в луче. Кладётся поверх сцены. */
const Atmos = ({ t, beam = true, side = 1 }: { t: number; beam?: boolean; side?: 1 | -1 }) => {
  const L = lampLevel(t);
  return (
    <>
      {/* общий полумрак */}
      <AbsoluteFill style={{ background: "#0b1016", opacity: 0.42 + (1 - L) * 0.45, mixBlendMode: "multiply" }} />
      {/* тень с одной стороны (свет сверху и чуть сбоку) */}
      <AbsoluteFill style={{ background: `linear-gradient(${side > 0 ? 90 : 270}deg, rgba(10,14,20,0) 35%, rgba(10,14,20,.55) 100%)` }} />
      {/* тёплое пятно света сверху */}
      <AbsoluteFill style={{ background: `radial-gradient(60% 40% at 50% 8%, rgba(255,236,200,${0.28 * L}) 0%, rgba(255,236,200,0) 70%)`, mixBlendMode: "screen" }} />
      {beam && (
        <Svg>
          <defs>
            <linearGradient id="atBeam" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fff3dc" stopOpacity={0.22 * L} />
              <stop offset="1" stopColor="#fff3dc" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M440 -20 L640 -20 L900 1500 L180 1500 Z" fill="url(#atBeam)" />
          {/* пыль: медленно плывёт, видна только в луче */}
          {Array.from({ length: 70 }, (_, i) => {
            const sp = 0.02 + random(`du${i}`) * 0.05;
            const y = ((random(`dy${i}`) + t * sp) % 1) * 1500;
            const x = 300 + random(`dx${i}`) * 480 + Math.sin(t * (0.5 + random(`dw${i}`)) + i) * 30 + (y / 1500) * (random(`dz${i}`) - 0.5) * 300;
            const r = 1.2 + random(`dr${i}`) * 2.8;
            return <circle key={i} cx={x} cy={y} r={r} fill="#fff6e0" opacity={(0.25 + 0.5 * Math.abs(Math.sin(t * 2 + i))) * L} />;
          })}
        </Svg>
      )}
      {/* мигание: на мгновение темнеет */}
      <AbsoluteFill style={{ background: "#000", opacity: (1 - L) * 0.6 }} />
    </>
  );
};

/** Огни за окном, проносятся слева направо. */
const PassingLights = ({ t, x, y, w, h }: { t: number; x: number; y: number; w: number; h: number }) => (
  <g>
    <clipPath id={`pl${x}${y}`}>
      <rect x={x} y={y} width={w} height={h} rx="20" />
    </clipPath>
    <g clipPath={`url(#pl${x}${y})`}>
      <rect x={x} y={y} width={w} height={h} fill="#05070a" />
      {Array.from({ length: 6 }, (_, i) => {
        const ph = (t * (0.6 + (i % 3) * 0.2) + random(`pl${i}`)) % 1.6;
        const lx = x - 200 + ph * (w + 400);
        return <ellipse key={i} cx={lx} cy={y + h * (0.3 + random(`py${i}`) * 0.5)} rx={60 + random(`pw${i}`) * 80} ry={6 + random(`ph${i}`) * 6} fill={i % 2 ? "#ffd38a" : "#bfe1ff"} opacity="0.5" />;
      })}
    </g>
  </g>
);

// ── пробные кадры ──────────────────────────────────────────────────────
const Vignette = ({ k = 1 }: { k?: number }) => (
  <AbsoluteFill style={{ background: `radial-gradient(70% 55% at 50% 45%, rgba(0,0,0,0) 40%, rgba(0,0,0,${0.75 * k}) 100%)` }} />
);
export const _Flicker = ({ t }: { t: number }) => {
  const a = Math.sin(t * 11) + Math.sin(t * 27 + 1);
  return <AbsoluteFill style={{ background: "#000", opacity: a < -1.5 ? 0.6 : 0.05 }} />;
};

/** 1. Дима подходит: камера из-за плеча едет к двери. */
const Approach = () => {
  const t = useT();
  const z = ease(t, 0, 5, 0.62, 1.0);
  return (
    <AbsoluteFill style={{ background: "#1b2226", transform: `translate(${ride(t).x}px,${ride(t).y}px) rotate(${ride(t).rot}deg) scale(1.04)` }}>
      <AbsoluteFill style={{ transform: `scale(${z})`, transformOrigin: "50% 40%" }}>
        <Svg>
          <DoorGlass>
            <PassingLights t={t} x={140} y={700} w={800} h={300} />
          </DoorGlass>
        </Svg>
      </AbsoluteFill>
      <Svg>
        <g transform={`translate(0 ${ease(t, 0, 5, 160, -40)}) scale(1)`}>
          <DimaBack t={t} lean={ease(t, 3, 5, 0, 1)} />
        </g>
      </Svg>
      <Atmos t={t} />
      <Vignette />
    </AbsoluteFill>
  );
};

/** 2. Лицо Димы у стекла: распахнутые глаза, пот, стиснутые зубы, слеза. */
const Stare = () => {
  const t = useT();
  return (
    <AbsoluteFill style={{ background: "#202a30", transform: `translate(${ride(t).x}px,${ride(t).y}px) rotate(${ride(t).rot}deg) scale(1.04)` }}>
      <Svg>
        <g transform={`translate(540 960) scale(${ease(t, 0, 5, 1.05, 1.2)}) translate(-540 -900)`}>
          <DimaFace t={t} fear={ease(t, 0, 3, 0.4, 1)} eyes={ease(t, 0, 2, 0.9, 1.25)} look={[Math.sin(t * 0.7) * 0.4, -0.1]} mouth="clench" sweat={ease(t, 0, 2, 0.3, 1)} tears={ease(t, 1, 5, 0, 1)} tremble={ease(t, 0, 4, 0.2, 1)} />
        </g>
      </Svg>
      {/* блик стекла перед лицом и запотевание от дыхания */}
      <AbsoluteFill style={{ background: "linear-gradient(120deg, rgba(255,255,255,.08), rgba(255,255,255,0) 40%)" }} />
      <Svg>
        <ellipse cx="540" cy="1130" rx={140 + Math.sin(t * 3) * 30} ry={70 + Math.sin(t * 3) * 15} fill="#e3edf3" opacity={0.18 + 0.12 * Math.sin(t * 3)} />
      </Svg>
      <Atmos t={t} side={-1} />
      <Vignette />
    </AbsoluteFill>
  );
};

/** 3. Скример: тишина, пустое стекло — и лицо существа влетает в стекло. */
const Scream = () => {
  const t = useT();
  const hit = 1.6;
  const p = clamp((t - hit) / 0.12);
  const shake = t > hit && t < hit + 0.6 ? Math.sin(t * 90) * 24 * (1 - (t - hit) / 0.6) : 0;
  return (
    <AbsoluteFill style={{ background: "#000", transform: `translate(${shake}px, ${shake * 0.6}px)` }}>
      <Svg>
        <DoorGlass fogA={t < hit ? 0.6 + 0.2 * Math.sin(t * 3) : 0.2} crack={t > hit ? 1 : 0}>
          {t < hit && <PassingLights t={t} x={140} y={700} w={800} h={300} />}
          {t > hit && (
            <g transform={`translate(540 860) scale(${0.3 + 0.75 * p}) translate(-540 -860)`}>
              <CreatureFace t={t} open={clamp((t - hit) * 3)} press={p} />
            </g>
          )}
        </DoorGlass>
      </Svg>
      {t < hit && <Atmos t={t} />}
      {t > hit && t < hit + 0.1 && <AbsoluteFill style={{ background: "#fff", opacity: 0.8 }} />}
      <Vignette k={0.9} />
    </AbsoluteFill>
  );
};

export const GOST_TEST_FRAMES = 450;
export const GostTest = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Audio src={staticFile("audio/train/ride.mp3")} loop volume={(f) => (f > 300 + 48 ? 0.15 : 0.55)} />
    {Array.from({ length: 15 }, (_, i) => (
      <Sfx key={i} at={i * 0.95 * 1} name="train/clack" vol={0.25} />
    ))}
    <Sfx at={5.6} name="train/buzz" vol={0.35} dur={1} />
    <Sfx at={11.8} name="train/buzz" vol={0.35} dur={1} />
    <Sfx at={5} name="train/breath" vol={0.7} />
    <Sfx at={10 + 1.6} name="train/sting" vol={1} />
    <Sfx at={10 + 1.6} name="train/glass" vol={0.9} />
    <Sequence durationInFrames={150}>
      <Approach />
    </Sequence>
    <Sequence from={150} durationInFrames={150}>
      <Stare />
    </Sequence>
    <Sequence from={300} durationInFrames={150}>
      <Scream />
    </Sequence>
  </AbsoluteFill>
);
