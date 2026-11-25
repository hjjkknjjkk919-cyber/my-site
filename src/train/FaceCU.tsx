import React from "react";
import { random } from "remotion";
import { clamp, INK } from "../components/fx";

/**
 * Лицо Димы крупным планом (на весь кадр 1080×1920) с мелкими эмоциями:
 * распахнутые глаза с узкими зрачками, пот по виску, слеза на нижнем веке,
 * стиснутые зубы с желваками, дрожь, мигающий свет.
 */
export type FaceProps = {
  t: number;
  /** 0 — спокойно, 1 — ужас: брови вверх, глаза шире, зрачки сужаются */
  fear?: number;
  /** открытость глаз 0..1.25 (1.25 — распахнуты) */
  eyes?: number;
  /** взгляд [-1..1, -1..1] */
  look?: [number, number];
  /** рот: закрыт / стиснутые зубы / открыт в крике / шёпот */
  mouth?: "closed" | "clench" | "open" | "talk";
  /** громкость голоса 0..1 для «talk» */
  talk?: number;
  /** пот 0..1 */
  sweat?: number;
  /** слёзы 0..1 (1 — слеза срывается и течёт) */
  tears?: number;
  /** дрожь 0..1 */
  tremble?: number;
  /** освещение 0..1 (мигающая лампа) */
  light?: number;
};

const SKIN = "#a8897a";
const SKIN_SH = "#7c6052";
const SKIN_HI = "#c9a898";
const HOOD = "#2f5f9e";
const HOOD_SH = "#1b365c";

export const FaceCU = ({ t, fear = 0.5, eyes = 1, look = [0, 0], mouth = "closed", talk = 0, sweat = 0, tears = 0, tremble = 0, light = 1 }: FaceProps) => {
  const tr = tremble * (Math.sin(t * 61) * 4 + Math.sin(t * 97 + 1) * 2.5);
  const breath = Math.sin(t * (2 + fear * 3)) * (4 + fear * 6);
  const brow = -fear * 38; // брови вверх при страхе
  const browIn = fear * 14; // и к переносице
  const eo = clamp(eyes, 0, 1.3);
  const pupil = 34 - fear * 14; // зрачок сужается
  const lx = look[0] * 26 + tr * 0.6;
  const ly = look[1] * 16;
  const jaw = mouth === "clench" ? 6 + Math.abs(Math.sin(t * 7)) * 6 : 0; // желваки ходят
  const open = mouth === "open" ? 1 : mouth === "talk" ? talk : 0;

  // пот: капли сползают по виску с разной скоростью
  const drops = Array.from({ length: 4 }, (_, i) => {
    const sp = 0.12 + random(`sw${i}`) * 0.15;
    const ph = (t * sp + random(`sp${i}`)) % 1;
    return { x: (i % 2 ? 905 : 175) + random(`sx${i}`) * 30, y: 520 + ph * 520, r: 9 + random(`sr${i}`) * 7, a: sweat * Math.sin(ph * Math.PI) };
  });
  // слеза: набухает на нижнем веке, потом срывается
  const tearPh = clamp((tears - 0.5) * 2);
  const tearY = 820 + tearPh * 480;

  return (
    <g transform={`translate(${tr} ${breath * 0.4})`}>
      <defs>
        <radialGradient id="fcSkin" cx="45%" cy="40%" r="70%">
          <stop offset="0" stopColor={SKIN_HI} />
          <stop offset="0.55" stopColor={SKIN} />
          <stop offset="1" stopColor={SKIN_SH} />
        </radialGradient>
        <radialGradient id="fcEye" cx="50%" cy="45%" r="60%">
          <stop offset="0.7" stopColor="#fbf7f2" />
          <stop offset="1" stopColor="#e3cfc6" />
        </radialGradient>
        <clipPath id="fcEyeL">
          <ellipse cx="370" cy="760" rx="130" ry={78 * eo} />
        </clipPath>
        <clipPath id="fcEyeR">
          <ellipse cx="710" cy="760" rx="130" ry={78 * eo} />
        </clipPath>
      </defs>

      {/* капюшон */}
      <path d="M-120 2000 L-120 520 C-60 60 1140 60 1200 520 L1200 2000 Z" fill={HOOD} stroke={INK} strokeWidth="14" />
      <path d="M760 160 C1000 250 1200 420 1200 700 L1200 2000 L900 2000 C980 1500 980 900 760 160 Z" fill={HOOD_SH} opacity="0.7" />
      {/* меховая оторочка */}
      <path d="M40 1700 C-10 900 160 300 540 270 C920 300 1090 900 1040 1700" fill="none" stroke="#9aa6b0" strokeWidth="110" />
      <path d="M40 1700 C-10 900 160 300 540 270 C920 300 1090 900 1040 1700" fill="none" stroke="#c9d2d9" strokeWidth="80" />
      {Array.from({ length: 46 }, (_, i) => {
        const a = Math.PI * (0.05 + (i / 45) * 0.9);
        const x = 540 - Math.cos(a) * 470;
        const y = 1700 - Math.sin(a) * 1380 + (i % 3) * 8;
        return <path key={i} d={`M${x} ${y} l${-Math.cos(a) * 30} ${-Math.sin(a) * 26}`} stroke="#eef3f7" strokeWidth="10" strokeLinecap="round" opacity="0.8" />;
      })}

      {/* лицо */}
      <path d="M540 360 C840 360 930 600 925 860 C922 1100 880 1290 760 1370 C680 1420 400 1420 320 1370 C200 1290 158 1100 155 860 C150 600 240 360 540 360 Z" fill="url(#fcSkin)" stroke={INK} strokeWidth="12" />
      {/* щетина */}
      <path d="M260 1120 C320 1330 760 1330 820 1120 C800 1280 700 1400 540 1410 C380 1400 280 1280 260 1120 Z" fill="#3b2a22" opacity="0.28" />
      {Array.from({ length: 70 }, (_, i) => (
        <circle key={i} cx={290 + random(`st${i}`) * 500} cy={1140 + random(`sy${i}`) * 240} r="3" fill="#2a1d17" opacity="0.4" />
      ))}
      {/* желваки */}
      {mouth === "clench" && (
        <g stroke={SKIN_SH} strokeWidth="10" fill="none" opacity="0.7" strokeLinecap="round">
          <path d={`M${250 - jaw} 1080 C${270 - jaw} 1130 ${280 - jaw} 1160 ${290 - jaw} 1190`} />
          <path d={`M${830 + jaw} 1080 C${810 + jaw} 1130 ${800 + jaw} 1160 ${790 + jaw} 1190`} />
        </g>
      )}
      {/* лоб: морщины страха */}
      <g stroke={SKIN_SH} strokeWidth="8" fill="none" opacity={0.25 + fear * 0.6} strokeLinecap="round">
        <path d="M380 500 C460 480 620 480 700 500" />
        <path d="M410 545 C480 530 600 530 670 545" />
        <path d="M520 600 L530 650 M560 600 L550 650" opacity={fear} />
      </g>

      {/* глаза */}
      {[
        { cx: 370, id: "fcEyeL", s: -1 },
        { cx: 710, id: "fcEyeR", s: 1 },
      ].map(({ cx, id, s }) => (
        <g key={id}>
          {/* тень глазницы */}
          <ellipse cx={cx} cy="770" rx="160" ry={110 + fear * 10} fill={SKIN_SH} opacity="0.35" />
          <ellipse cx={cx} cy="760" rx="130" ry={78 * eo} fill="url(#fcEye)" stroke={INK} strokeWidth="10" />
          <g clipPath={`url(#${id})`}>
            {/* сосуды при ужасе */}
            <path d={`M${cx - 125} 760 l40 -6 l20 10 M${cx + 125} 765 l-36 4 l-18 -12`} stroke="#c55" strokeWidth="3" fill="none" opacity={fear * 0.7} />
            <circle cx={cx + lx} cy={760 + ly} r="54" fill="#5a4632" />
            <circle cx={cx + lx} cy={760 + ly} r="54" fill="none" stroke="#2c2016" strokeWidth="6" />
            <circle cx={cx + lx} cy={760 + ly} r={pupil} fill="#0b0806" />
            <circle cx={cx + lx - 20} cy={760 + ly - 20} r="13" fill="#fff" opacity={0.6 + 0.4 * light} />
            <circle cx={cx + lx + 18} cy={760 + ly + 16} r="5" fill="#fff" opacity="0.7" />
          </g>
          {/* веки */}
          <path d={`M${cx - 138} 760 C${cx - 90} ${760 - 100 * eo} ${cx + 90} ${760 - 100 * eo} ${cx + 138} 760`} fill="none" stroke={INK} strokeWidth="14" strokeLinecap="round" />
          <path d={`M${cx - 120} ${770 + 70 * eo} C${cx - 60} ${790 + 80 * eo} ${cx + 60} ${790 + 80 * eo} ${cx + 120} ${770 + 70 * eo}`} fill="none" stroke={SKIN_SH} strokeWidth="8" opacity="0.6" />
          {/* влажная кромка века, когда подступают слёзы */}
          <path d={`M${cx - 110} ${760 + 72 * eo} C${cx - 50} ${768 + 80 * eo} ${cx + 50} ${768 + 80 * eo} ${cx + 110} ${760 + 72 * eo}`} fill="none" stroke="#e8f4ff" strokeWidth="6" opacity={tears * 0.9} />
          {/* брови */}
          <path
            d={`M${cx - 150 * s * -1 - (s < 0 ? 0 : 0)} ${650 + brow * (s < 0 ? 0.6 : 0.6)} `}
            fill="none"
          />
          <path
            d={s < 0 ? `M${cx - 150} ${645 + brow * 0.3} C${cx - 60} ${615 + brow} ${cx + 60} ${610 + brow * 1.2} ${cx + 140 + browIn} ${640 + brow * 1.5}` : `M${cx + 150} ${645 + brow * 0.3} C${cx + 60} ${615 + brow} ${cx - 60} ${610 + brow * 1.2} ${cx - 140 - browIn} ${640 + brow * 1.5}`}
            fill="none"
            stroke="#2a1d17"
            strokeWidth="34"
            strokeLinecap="round"
          />
        </g>
      ))}

      {/* нос */}
      <path d="M560 790 C580 900 610 960 600 1010 C580 1040 520 1040 490 1015" fill="none" stroke={INK} strokeWidth="10" strokeLinecap="round" />
      <path d="M470 1000 C480 1030 510 1040 530 1035 M610 1000 C600 1030 575 1040 555 1035" fill="none" stroke={SKIN_SH} strokeWidth="8" opacity="0.8" />
      <ellipse cx="575" cy="900" rx="12" ry="40" fill="#fff" opacity="0.18" />

      {/* рот */}
      {mouth === "clench" && (
        <g>
          <path d="M400 1170 C470 1150 610 1150 680 1170 C670 1215 600 1235 540 1235 C480 1235 410 1215 400 1170 Z" fill="#3a1414" stroke={INK} strokeWidth="10" />
          <path d="M412 1172 C480 1158 600 1158 668 1172 L664 1200 C600 1192 480 1192 416 1200 Z" fill="#f3ece2" />
          <path d="M416 1200 C480 1194 600 1194 664 1200 L660 1222 C600 1230 480 1230 420 1222 Z" fill="#e9e0d2" />
          {[450, 490, 530, 570, 610, 640].map((x) => (
            <path key={x} d={`M${x} 1162 V1226`} stroke="#b9ab98" strokeWidth="3" />
          ))}
        </g>
      )}
      {(mouth === "open" || mouth === "talk") && (
        <g>
          <path d={`M${450 + open * 20} ${1185 + open * 10} C${470 + open * 10} ${1140 - open * 20} ${610 - open * 10} ${1140 - open * 20} ${630 - open * 20} ${1185 + open * 10} C${640 - open * 10} ${1230 + open * 120} ${590} ${1250 + open * 150} 540 ${1250 + open * 150} C490 ${1250 + open * 150} ${440 + open * 10} ${1230 + open * 120} ${450 + open * 20} ${1185 + open * 10} Z`} fill="#2a0d0d" stroke={INK} strokeWidth="10" />
          <path d={`M${478 + open * 10} ${1160 - open * 6} C${510} ${1150 - open * 14} ${570} ${1150 - open * 14} ${602 - open * 10} ${1160 - open * 6} L${598 - open * 10} ${1178} C570 1172 510 1172 ${482 + open * 10} 1178 Z`} fill="#f3ece2" opacity={open > 0.2 ? 1 : 0} />
          <ellipse cx="540" cy={1220 + open * 120} rx={60 * open} ry={34 * open} fill="#a23a3a" />
        </g>
      )}
      {mouth === "closed" && <path d="M430 1190 C500 1175 580 1175 650 1190" fill="none" stroke={INK} strokeWidth="11" strokeLinecap="round" />}

      {/* пот */}
      {drops.map((d, i) => (
        <g key={i} opacity={d.a}>
          <path d={`M${d.x} ${d.y - d.r * 2.2} C${d.x + d.r} ${d.y - d.r * 0.6} ${d.x + d.r} ${d.y + d.r} ${d.x} ${d.y + d.r} C${d.x - d.r} ${d.y + d.r} ${d.x - d.r} ${d.y - d.r * 0.6} ${d.x} ${d.y - d.r * 2.2} Z`} fill="#dff2ff" stroke="#6f8fa8" strokeWidth="3" />
          <circle cx={d.x - d.r * 0.3} cy={d.y - d.r * 0.2} r={d.r * 0.3} fill="#fff" />
          <path d={`M${d.x} ${d.y - d.r * 2.2} V${d.y - 120}`} stroke="#dff2ff" strokeWidth="3" opacity="0.5" />
        </g>
      ))}
      {/* блеск пота на лбу */}
      <ellipse cx="460" cy="470" rx="70" ry="16" fill="#fff" opacity={sweat * 0.35} />
      <ellipse cx="640" cy="440" rx="40" ry="10" fill="#fff" opacity={sweat * 0.3} />

      {/* слеза: набухает на правом нижнем веке, потом срывается и течёт по щеке */}
      {tears > 0.05 && (
        <g>
          {tearPh > 0 && <path d={`M720 ${835} C724 ${900} 730 ${tearY - 40} 734 ${tearY}`} stroke="#cfe8ff" strokeWidth="8" fill="none" opacity="0.6" strokeLinecap="round" />}
          <path d={`M734 ${tearY - 26 * clamp(tears * 2)} C754 ${tearY} 754 ${tearY + 24} 734 ${tearY + 24} C714 ${tearY + 24} 714 ${tearY} 734 ${tearY - 26 * clamp(tears * 2)} Z`} fill="#e6f5ff" stroke="#6f8fa8" strokeWidth="3" />
          <circle cx="728" cy={tearY + 8} r="5" fill="#fff" />
        </g>
      )}

      {/* мигающий холодный свет вагона */}
      <rect x="-200" y="-200" width="1480" height="2400" fill="#0a1220" opacity={0.55 * (1 - light)} />
      <path d="M160 860 C150 600 240 360 540 360 C380 420 300 600 300 860 Z" fill="#cfe4ff" opacity={0.12 * light} />
    </g>
  );
};
