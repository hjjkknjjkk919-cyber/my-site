import React from "react";
import { random } from "remotion";
import { clamp } from "../components/fx";

/** Дима, вариант 2 (по ревью): правильные пропорции, читаемый страх, силуэт со спины с руками и шагом. */
const LINE = "#2b1d16";
const SKIN = "#e8c2a6";
const SKIN_SH = "#c08a70";
const SKIN_DK = "#a8705a";
const HAIR = "#3a2a22";
const JK = "#3f5f9e";
const JK_SH = "#2b416e";
const JK_HI = "#5e82c2";
const LINING = "#9aa7b8";

export type Face2Props = {
  t: number;
  fear?: number;
  eyes?: number;
  look?: [number, number];
  mouth?: "closed" | "clench" | "open";
  sweat?: number;
  /** 0..1: 0–0.4 набухает, 0.4–1 катится */
  tear?: number;
  tremble?: number;
};

/** Лицо крупно. Центр лица (540, 900). */
export const Face2 = ({ t, fear = 0.3, eyes = 1, look = [0, 0], mouth = "closed", sweat = 0, tear = 0, tremble = 0 }: Face2Props) => {
  const shake = tremble * (Math.floor(t * 15) % 2 ? 2 : -2);
  const chin = tremble * (Math.floor(t * 15) % 2 ? 2 : -2);
  const eo = clamp(eyes, 0.05, 1.3);
  const lx = look[0] * 18;
  const ly = look[1] * 12;
  const brow = fear * 18; // «домик»: внутренние концы вверх
  const pupil = 26 * (1 - fear * 0.55);
  const EYE = (cx: number, s: -1 | 1) => {
    const w = 84;
    const up = 46 * eo; // верхняя дуга
    const dn = 30 * eo; // нижняя дуга
    const outer = cx + s * w;
    const inner = cx - s * w;
    // миндалевидный разрез: внешний уголок чуть выше
    const shape = `M${inner} 866 C${inner + s * 30} ${866 - up} ${outer - s * 40} ${858 - up} ${outer} 852 C${outer - s * 30} ${852 + dn} ${inner + s * 40} ${866 + dn} ${inner} 866 Z`;
    return (
      <g key={cx}>
        <defs>
          <clipPath id={`f2e${cx}`}>
            <path d={shape} />
          </clipPath>
          <radialGradient id={`f2i${cx}`} cx="45%" cy="40%" r="60%">
            <stop offset="0" stopColor="#9a7350" />
            <stop offset="0.7" stopColor="#5e4029" />
            <stop offset="1" stopColor="#2f1f14" />
          </radialGradient>
        </defs>
        {/* складка над веком и тень глазницы */}
        <path d={`M${inner - s * 6} 846 C${inner + s * 30} ${836 - up} ${outer - s * 40} ${826 - up} ${outer + s * 8} 838`} fill="none" stroke={SKIN_DK} strokeWidth="5" opacity="0.7" />
        <path d={`M${inner} 866 C${inner + s * 30} ${866 - up - 14} ${outer - s * 40} ${858 - up - 14} ${outer} 852 Z`} fill={SKIN_SH} opacity="0.35" />
        {/* мешки под глазами */}
        <path d={`M${inner + s * 10} ${882 + dn} C${cx} ${900 + dn} ${cx + s * 30} ${896 + dn} ${outer - s * 8} ${872 + dn}`} fill="none" stroke="#b48a78" strokeWidth="6" opacity={0.35 + fear * 0.4} />
        <path d={shape} fill="#f4efe8" />
        <g clipPath={`url(#f2e${cx})`}>
          <path d={`M${outer} 856 q${-s * 22} 2 ${-s * 34} -4 M${outer} 864 q${-s * 18} 4 ${-s * 26} 10`} stroke="#c4464a" strokeWidth="1.8" fill="none" opacity={fear * 0.55} />
          <circle cx={cx + lx} cy={860 + ly} r="36" fill={`url(#f2i${cx})`} stroke={LINE} strokeWidth="3" />
          <circle cx={cx + lx} cy={860 + ly} r={15 - fear * 5} fill="#0d0907" />
          <circle cx={cx + lx - 12} cy={860 + ly - 12} r="8" fill="#fff" />
          <circle cx={cx + lx + 10} cy={860 + ly + 9} r="3.5" fill="#fff" opacity="0.8" />
          {/* тень верхнего века на глазном яблоке */}
          <path d={`M${inner - 10} 800 H${outer + 10} V${852 - up * 0.6} C${cx} ${862 - up * 0.9} ${cx} ${862 - up * 0.9} ${inner - 10} ${862 - up * 0.6} Z`} fill="#000" opacity="0.13" />
        </g>
        {/* верхнее веко толще, нижнее тоньше */}
        <path d={`M${inner} 866 C${inner + s * 30} ${866 - up} ${outer - s * 40} ${858 - up} ${outer + s * 6} 850`} fill="none" stroke={LINE} strokeWidth="9" strokeLinecap="round" />
        <path d={`M${outer} 852 C${outer - s * 30} ${852 + dn} ${inner + s * 40} ${866 + dn} ${inner} 866`} fill="none" stroke={LINE} strokeWidth="3.5" opacity="0.75" />
        {/* влажная кромка */}
        <path d={`M${outer - s * 14} ${858 + dn * 0.6} C${cx + s * 10} ${866 + dn} ${inner + s * 30} ${870 + dn * 0.8} ${inner + s * 10} ${868}`} fill="none" stroke="#dcefff" strokeWidth="4" opacity={clamp(tear * 3)} />
        {/* бровь «домиком», густая */}
        <path d={s < 0 ? `M${cx - 100} 800 C${cx - 55} 786 ${cx + 5} ${760 - brow} ${cx + 70} ${750 - brow * 2.2}` : `M${cx + 100} 800 C${cx + 55} 786 ${cx - 5} ${760 - brow} ${cx - 70} ${750 - brow * 2.2}`} fill="none" stroke={HAIR} strokeWidth="26" strokeLinecap="round" />
      </g>
    );
  };
  // пот: капли 12–18 px, сползают по виску за 1.5 с
  const drops = [0, 1, 2].map((i) => {
    const ph = ((t + i * 0.55) % 1.5) / 1.5;
    return { x: i === 2 ? 822 : 262 + i * 10, y: 700 + ph * 360, r: 12 + i * 3, a: sweat * Math.min(1, Math.sin(ph * Math.PI) * 1.5) };
  });
  const tearSwell = clamp(tear / 0.4);
  const tearRoll = clamp((tear - 0.4) / 0.6);
  const tY = 920 + tearRoll * 260;
  return (
    <g transform={`translate(${shake} 0)`}>
      {/* куртка и шея */}
      <path d="M90 1920 C80 1550 170 1360 330 1290 L750 1290 C910 1360 1000 1550 990 1920 Z" fill={JK} stroke={LINE} strokeWidth="7" />
      <path d="M760 1300 C930 1380 990 1560 990 1920 L850 1920 C860 1650 840 1450 760 1300 Z" fill={JK_SH} />
      <path d="M200 1500 C260 1420 320 1380 380 1360" stroke={JK_HI} strokeWidth="12" fill="none" opacity="0.7" />
      <path d="M540 1330 V1920" stroke={LINE} strokeWidth="6" />
      <path d="M420 1170 L415 1280 C470 1315 610 1315 665 1280 L660 1170 Z" fill={SKIN_SH} stroke={LINE} strokeWidth="6" />
      {/* капюшон */}
      <path d="M120 1330 C70 950 160 420 540 380 C920 420 1010 950 960 1330 C890 1290 850 1230 830 1170 C880 930 820 600 540 570 C260 600 200 930 250 1170 C230 1230 190 1290 120 1330 Z" fill={JK} stroke={LINE} strokeWidth="7" />
      <path d="M760 440 C920 540 1000 800 960 1330 C910 1300 870 1250 850 1190 C880 930 860 650 760 440 Z" fill={JK_SH} />
      {/* мех по краю капюшона */}
      <path d="M250 1170 C210 900 260 610 540 585 C820 610 870 900 830 1170" fill="none" stroke="#c4ccd4" strokeWidth="46" strokeLinecap="round" />
      {Array.from({ length: 44 }, (_, i) => {
        const a = Math.PI * (0.06 + (i / 43) * 0.88);
        const x = 540 - Math.cos(a) * 300;
        const y = 1170 - Math.sin(a) * 585;
        return <path key={i} d={`M${x} ${y} l${-Math.cos(a) * 20 + (i % 2 ? 5 : -5)} ${-Math.sin(a) * 18}`} stroke="#eef2f5" strokeWidth="8" strokeLinecap="round" />;
      })}
      <path d="M250 1170 C210 900 260 610 540 585 C820 610 870 900 830 1170" fill="none" stroke={LINING} strokeWidth="4" opacity="0.6" />
      {/* уши */}
      <ellipse cx="262" cy="900" rx="30" ry="52" fill={SKIN} stroke={LINE} strokeWidth="6" />
      <ellipse cx="818" cy="900" rx="30" ry="52" fill={SKIN} stroke={LINE} strokeWidth="6" />
      {/* лицо: овал с челюстью (ширина/высота ≈ 0.78) */}
      <path d={`M540 600 C730 600 805 720 805 880 C805 1010 790 1090 750 1150 C710 ${1205 + chin} 640 ${1222 + chin} 540 ${1222 + chin} C440 ${1222 + chin} 370 ${1205 + chin} 330 1150 C290 1090 275 1010 275 880 C275 720 350 600 540 600 Z`} fill={SKIN} stroke={LINE} strokeWidth="7" />
      <path d="M720 680 C790 780 800 960 760 1090 C735 1140 710 1165 690 1175 C750 1080 770 900 720 680 Z" fill={SKIN_SH} opacity="0.5" />
      {/* чёлка из-под капюшона */}
      <path d="M300 760 C320 650 410 610 540 610 C670 610 760 650 780 760 C750 720 720 700 690 700 L668 735 L640 695 L610 730 L585 690 L555 728 L525 690 L495 730 L465 695 L438 735 L410 700 C360 705 325 725 300 760 Z" fill={HAIR} stroke={LINE} strokeWidth="6" strokeLinejoin="round" />
      {/* морщины на лбу */}
      <g stroke={SKIN_DK} strokeWidth="4" fill="none" opacity={fear * 0.8} strokeLinecap="round">
        <path d="M480 772 C510 766 570 766 600 772" />
        <path d="M528 795 L534 830 M552 795 L546 830" />
      </g>
      {EYE(445, -1)}
      {EYE(635, 1)}
      {/* нос с объёмом */}
      <path d="M548 880 C560 940 578 990 572 1012 C560 1030 520 1030 508 1012" fill="none" stroke={LINE} strokeWidth="6" strokeLinecap="round" />
      <path d="M560 900 C575 950 585 985 580 1005" stroke={SKIN_SH} strokeWidth="10" fill="none" opacity="0.6" />
      <path d="M505 1010 C500 1000 505 990 515 992 M575 1010 C580 1000 575 990 565 992" stroke={LINE} strokeWidth="4" fill="none" />
      <ellipse cx="540" cy="1022" rx="38" ry="8" fill={SKIN_SH} opacity="0.5" />
      {/* густая щетина: тень по челюсти и над губой + точки */}
      <path d={`M300 1000 C305 1100 340 1170 420 ${1205 + chin} C480 ${1220 + chin} 600 ${1220 + chin} 660 ${1205 + chin} C740 1170 775 1100 780 1000 C760 1080 700 1150 540 1160 C380 1150 320 1080 300 1000 Z`} fill="#4a3428" opacity="0.32" />
      <path d="M470 1048 C500 1040 580 1040 610 1048 L605 1068 C580 1062 500 1062 475 1068 Z" fill="#4a3428" opacity="0.3" />
      {Array.from({ length: 220 }, (_, i) => {
        const a = random(`s2${i}`);
        const up = i < 40;
        const x = up ? 470 + a * 140 : 305 + a * 470;
        const base = up ? 1045 : 1010 + (1 - Math.pow((x - 540) / 235, 2)) * 190;
        const y = base + random(`t2${i}`) * (up ? 22 : 40) - (up ? 0 : 20);
        return <circle key={i} cx={x} cy={y + (up ? 0 : chin)} r="2.2" fill="#3d2a20" opacity="0.5" />;
      })}
      {/* рот */}
      {mouth === "clench" && (
        <g transform={`translate(0 ${chin})`}>
          {/* губы растянуты в оскал, уголки вниз */}
          <path d="M440 1100 C480 1078 600 1078 640 1100 C630 1128 595 1142 540 1142 C485 1142 450 1128 440 1100 Z" fill="#7a3a33" stroke={LINE} strokeWidth="6" />
          <path d="M458 1100 C495 1088 585 1088 622 1100 C612 1120 585 1130 540 1130 C495 1130 468 1120 458 1100 Z" fill="#ede6d6" />
          <path d="M462 1112 C500 1116 580 1116 618 1112" stroke="#b5a690" strokeWidth="3" fill="none" />
          <path d="M500 1092 V1128 M540 1090 V1130 M580 1092 V1128" stroke="#cfc3ae" strokeWidth="2" />
          <path d="M440 1100 L425 1118 M640 1100 L655 1118" stroke={LINE} strokeWidth="5" strokeLinecap="round" />
          {/* напряжённые складки от носа */}
          <path d="M470 1040 C450 1070 445 1090 440 1100 M610 1040 C630 1070 635 1090 640 1100" stroke={SKIN_DK} strokeWidth="5" fill="none" opacity="0.7" />
        </g>
      )}
      {mouth === "open" && <path d="M480 1090 C500 1075 580 1075 600 1090 C605 1150 580 1180 540 1180 C500 1180 475 1150 480 1090 Z" fill="#3a1414" stroke={LINE} strokeWidth="6" />}
      {mouth === "closed" && <path d="M480 1105 C515 1098 565 1098 600 1105" stroke={LINE} strokeWidth="6" fill="none" strokeLinecap="round" />}
      {/* пот */}
      {drops.map((d, i) => (
        <g key={i} opacity={d.a}>
          <path d={`M${d.x} ${d.y - d.r * 1.8} C${d.x + d.r} ${d.y - d.r * 0.5} ${d.x + d.r} ${d.y + d.r} ${d.x} ${d.y + d.r} C${d.x - d.r} ${d.y + d.r} ${d.x - d.r} ${d.y - d.r * 0.5} ${d.x} ${d.y - d.r * 1.8} Z`} fill="#bcd8ee" stroke="#7fa6c9" strokeWidth="3" />
          <circle cx={d.x - d.r * 0.35} cy={d.y - d.r * 0.1} r={d.r * 0.3} fill="#fff" />
        </g>
      ))}
      {/* слеза: набухает, потом катится с влажным следом */}
      {tear > 0.02 && (
        <g>
          {tearRoll > 0 && <path d={`M640 ${920} C642 ${960} 646 ${tY - 20} 648 ${tY}`} stroke="#cfe6f7" strokeWidth="8" fill="none" opacity="0.7" strokeLinecap="round" />}
          {tearRoll > 0 && <path d={`M637 ${930} C639 ${960} 642 ${tY - 30} 644 ${tY - 10}`} stroke="#fff" strokeWidth="2" fill="none" opacity="0.8" />}
          <g transform={`translate(${640 + tearRoll * 8} ${tearRoll > 0 ? tY : 915}) scale(${0.4 + tearSwell * 0.6})`}>
            <path d="M0 -20 C12 -4 14 12 0 14 C-14 12 -12 -4 0 -20 Z" fill="#bcd8ee" stroke="#7fa6c9" strokeWidth="3" />
            <circle cx="-4" cy="2" r="4" fill="#fff" />
          </g>
        </g>
      )}
    </g>
  );
};

/**
 * Дима со спины (по пояс): капюшон с гребнем, плечи шире головы в 2.2 раза, рукава, руки.
 * walk — фаза шага (0..1); turn 0..1 — оглядывается через плечо (видна щека и глаз).
 * Точка привязки: макушка (540, 0). Масштаб: 1 единица ≈ 1/20 см.
 */
export const DimaBack2 = ({ t, walk = 0, turn = 0, dark = 0 }: { t: number; walk?: number; turn?: number; dark?: number }) => {
  const ph = walk * Math.PI * 2;
  const bob = -Math.abs(Math.sin(ph)) * 16;
  const sh = Math.sin(ph) * 3;
  const armL = Math.sin(ph) * 8;
  const armR = -Math.sin(ph) * 8;
  const body = dark > 0 ? "#1c2230" : JK;
  const bodySh = dark > 0 ? "#141924" : JK_SH;
  return (
    <g transform={`translate(0 ${bob}) rotate(${sh} 540 1200)`}>
      {/* руки (рукава) */}
      <g transform={`rotate(${armL} 120 700)`}>
        <path d="M120 700 C60 900 40 1150 60 1400 L190 1410 C190 1180 200 960 240 760 Z" fill={bodySh} stroke={LINE} strokeWidth="8" />
        <path d="M75 1150 C110 1140 150 1140 190 1150" stroke={LINE} strokeWidth="5" fill="none" opacity="0.7" />
      </g>
      <g transform={`rotate(${armR} 960 700)`}>
        <path d="M960 700 C1020 900 1040 1150 1020 1400 L890 1410 C890 1180 880 960 840 760 Z" fill={bodySh} stroke={LINE} strokeWidth="8" />
        <path d="M1005 1150 C970 1140 930 1140 890 1150" stroke={LINE} strokeWidth="5" fill="none" opacity="0.7" />
      </g>
      {/* спина */}
      <path d="M150 640 C300 560 780 560 930 640 C980 900 970 1300 950 1700 H130 C110 1300 100 900 150 640 Z" fill={body} stroke={LINE} strokeWidth="8" />
      <path d="M720 590 C860 620 950 700 950 900 L950 1700 H800 C820 1300 820 900 720 590 Z" fill={bodySh} opacity="0.8" />
      <path d="M220 700 C300 650 380 630 450 625" stroke={dark ? "#2a3346" : JK_HI} strokeWidth="14" fill="none" opacity="0.6" />
      {/* шов посередине и складки */}
      <path d="M540 620 V1700" stroke={bodySh} strokeWidth="7" />
      <path d="M200 1100 C320 1080 420 1090 500 1110 M580 1110 C660 1090 760 1080 880 1100" stroke={LINE} strokeWidth="4" fill="none" opacity="0.5" />
      {/* капюшон с гребнем */}
      <g transform={`rotate(${turn * 25} 540 560)`}>
        <path d="M540 0 C760 0 830 170 820 360 C810 520 720 620 540 640 C360 620 270 520 260 360 C250 170 320 0 540 0 Z" fill={body} stroke={LINE} strokeWidth="8" />
        <path d="M700 40 C800 120 830 250 820 360 C810 500 750 590 660 625 C760 500 780 300 700 40 Z" fill={bodySh} />
        <path d="M540 6 C556 220 556 430 540 636" stroke={bodySh} strokeWidth="9" fill="none" />
        {/* мех капюшона торчит по бокам */}
        <path d="M270 300 C250 380 262 470 300 540" stroke="#c4ccd4" strokeWidth="26" fill="none" strokeLinecap="round" />
        <path d="M810 300 C830 380 818 470 780 540" stroke="#c4ccd4" strokeWidth="26" fill="none" strokeLinecap="round" />
        {/* контровой свет от лампы по краю капюшона */}
        <path d="M330 60 C400 10 480 0 540 0 C600 0 680 10 750 60" stroke={dark ? "#4a5a7a" : "#8fb0e0"} strokeWidth="10" fill="none" strokeLinecap="round" />
        {/* щека и глаз видны при повороте */}
        {turn > 0.05 && (
          <g opacity={clamp(turn * 2)}>
            <path d="M250 300 C200 330 190 450 230 540 C250 570 280 580 300 570 C280 480 280 380 300 300 Z" fill={SKIN} stroke={LINE} strokeWidth="6" />
            <ellipse cx="250" cy="390" rx="16" ry={14 * turn} fill="#f8f4ee" stroke={LINE} strokeWidth="3" />
            <circle cx="244" cy="390" r={7 * turn} fill="#3a271a" />
          </g>
        )}
      </g>
    </g>
  );
};
