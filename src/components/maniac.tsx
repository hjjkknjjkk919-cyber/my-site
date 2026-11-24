import { random } from "remotion";
import { INK, Svg } from "./fx";

const L = { strokeLinecap: "round", strokeLinejoin: "round" } as const;
const FACE = "M540 420 C770 420 830 620 820 860 C810 1120 700 1330 540 1340 C380 1330 270 1120 260 860 C250 620 310 420 540 420 Z";

// цвета гнилых зубов: желтизна, бурые пятна, чёрные дыры
const TOOTH = ["#d8c98c", "#c9b06a", "#b39a52", "#8d7a43", "#6e5a2e", "#2a1a12"];

/** Лицо маньяка крупно: сальные волосы, щетина, не моргает, улыбка во все 32 гнилых зуба. */
export const ManiacGroup = ({ t }: { t: number }) => {
  const twitch = Math.sin(t * 31) * 1.5;
  const teeth = (row: "up" | "down") =>
    Array.from({ length: 16 }, (_, i) => {
      const x = 362 + i * 23.5;
      const u = (x - 540) / 190;
      const yU = 1050 + 32 * (1 - u * u);
      const h = 34 - Math.abs(u) * 10;
      const y = row === "up" ? yU : yU + h + 6;
      const c = TOOTH[Math.floor(random(`t${row}${i}`) * TOOTH.length)];
      return <rect key={`${row}${i}`} x={x - 10} y={y} width="21" height={h} rx="5" fill={c} stroke="#3a2a18" strokeWidth="3" transform={`rotate(${(random(`r${row}${i}`) - 0.5) * 14} ${x} ${y + h / 2})`} />;
    });
  return (
    <g>
      <g filter="url(#rough)" {...L}>
        {/* тёмный капюшон с грязным мехом */}
        <path d="M60 1920 C40 1300 80 520 300 330 C440 220 640 220 780 330 C1000 520 1040 1300 1020 1920 Z" fill="#1b1e21" stroke={INK} strokeWidth="12" />
        <path d={FACE} fill="none" stroke="#5d5a52" strokeWidth="70" strokeDasharray="6 22" opacity="0.8" />
        {/* шея и ворот */}
        <path d="M440 1280 L430 1500 L650 1500 L640 1280 Z" fill="#7d755f" stroke={INK} strokeWidth="9" />
        <path d="M200 1920 C260 1520 820 1520 880 1920 Z" fill="#26292c" stroke={INK} strokeWidth="10" />
        {/* лицо */}
        <path d={FACE} fill="#a39a86" stroke={INK} strokeWidth="10" />
        <path d="M700 460 C840 640 840 1000 700 1300 L860 1300 L860 440 Z" fill="#1a1d20" opacity="0.5" />
        {/* щетина */}
        <path d="M300 980 C330 1240 450 1330 540 1335 C630 1330 750 1240 780 980 C720 1180 640 1220 540 1220 C440 1220 360 1180 300 980 Z" fill="#3f3d38" opacity="0.55" />
        {/* морщины от улыбки */}
        <path d="M330 1000 C300 1060 310 1110 340 1150 M750 1000 C780 1060 770 1110 740 1150 M360 960 C380 1000 380 1020 370 1040" fill="none" stroke="#4a4436" strokeWidth="7" opacity="0.8" />
        {/* сальные волосы прядями на лоб */}
        <path d="M300 640 C300 440 420 380 540 380 C680 380 790 450 790 640 C740 560 680 520 610 515 C560 560 470 580 380 580 C340 600 310 620 300 640 Z" fill="#24211d" />
        {[[420, 560, 400, 760], [480, 570, 470, 720], [560, 540, 580, 700], [640, 530, 660, 680], [700, 560, 730, 740]].map(([x1, y1, x2, y2], i) => (
          <path key={i} d={`M${x1} ${y1} C${x1 - 10} ${y1 + 60} ${x2 + 10} ${y2 - 60} ${x2} ${y2}`} fill="none" stroke="#24211d" strokeWidth="18" />
        ))}
        <path d="M430 470 C500 440 600 440 670 470" fill="none" stroke="#8d877a" strokeWidth="8" opacity="0.6" />
        {/* брови плоские */}
        <path d="M350 730 C400 715 460 712 500 718 M580 718 C620 712 680 715 730 730" fill="none" stroke="#2a2620" strokeWidth="18" />
        {/* нос */}
        <path d="M540 820 C532 900 525 950 500 985 C520 1005 560 1005 580 985" fill="none" stroke="#4a4436" strokeWidth="8" />
        {/* рот: огромная улыбка */}
        <path d="M325 1040 C420 1125 660 1125 755 1040 C700 1215 380 1215 325 1040 Z" fill="#240a0c" stroke={INK} strokeWidth="9" />
        <path d="M340 1045 C430 1100 650 1100 740 1045" fill="none" stroke="#6b2228" strokeWidth="12" />
        {teeth("up")}
        {teeth("down")}
        <path d="M325 1040 C420 1125 660 1125 755 1040" fill="none" stroke="#5a2a26" strokeWidth="6" opacity="0.6" />
      </g>
      {/* глаза: широко открыты, крошечные зрачки, не моргает */}
      <g {...L}>
        {[430, 650].map((cx) => (
          <g key={cx}>
            <ellipse cx={cx} cy="830" rx="74" ry="60" fill="#3a3630" opacity="0.5" transform="translate(0 18)" />
            <ellipse cx={cx} cy="820" rx="70" ry="58" fill="#e8e4d8" stroke={INK} strokeWidth="9" />
            <path d={`M${cx - 60} 830 C${cx - 40} 826 ${cx - 30} 834 ${cx - 22} 842 M${cx + 58} 812 C${cx + 44} 816 ${cx + 36} 822 ${cx + 30} 830`} fill="none" stroke="#b3484e" strokeWidth="3" />
            <circle cx={cx + twitch} cy="822" r="22" fill="#5b5a4c" />
            <circle cx={cx + twitch} cy="822" r="10" fill="#050505" />
            <circle cx={cx + 8 + twitch} cy="814" r="5" fill="#fff" />
          </g>
        ))}
      </g>
    </g>
  );
};

export const ManiacFace = ({ t }: { t: number }) => (
  <Svg>
    <ManiacGroup t={t} />
  </Svg>
);
