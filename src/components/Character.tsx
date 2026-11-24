import { INK, Svg } from "./fx";

const line = { strokeLinecap: "round", strokeLinejoin: "round" } as const;
const FACE = "M540 250 C750 250 810 420 800 560 C795 720 700 860 540 870 C380 860 285 720 280 560 C270 420 330 250 540 250 Z";

/**
 * Лицо Стаса из хука (перенос 1-в-1): капюшон, мех, лицо, глаза, рот, пар.
 * Живое: качание головы, моргание, дрожь зрачков, дыхание. t — секунды сцены.
 * trem — сила дрожи зрачков, blinks — моменты моргания.
 */
export const StasFace = ({ t, trem = 0.6, blinks = [1.1, 3.3] }: { t: number; trem?: number; blinks?: number[] }) => {
  const ang = 1.5 * Math.sin(t * 1.7) + 0.5 * Math.sin(t * 3.1 + 1);
  const bob = Math.sin(t * 3.3) * 8;
  let s = 1;
  blinks.forEach((b) => {
    if (t >= b && t < b + 0.14) s = 1 - 0.93 * Math.sin(((t - b) / 0.14) * Math.PI);
  });
  const tr = trem * (Math.sin(t * 67) + Math.sin(t * 109 + 1)) * 1.5;
  const P = 1.9;
  const ph = (t % P) / P;
  const ms = 0.8 + 0.35 * (0.5 - 0.5 * Math.cos(ph * 6.2832));
  const e = Math.min(1, Math.max(0, (ph - 0.35) / 0.6));
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transformOrigin: "50% 62%",
        transform: `translateY(${bob}px) rotate(${ang}deg)`,
      }}
    >
      <Svg>
        <defs>
          <clipPath id="faceClip">
            <path d={FACE} />
          </clipPath>
          <pattern id="zipT" patternUnits="userSpaceOnUse" x="528" y="955" width="24" height="22">
            <rect x="1" y="1" width="11" height="9" rx="2" fill="#a3afb8" stroke={INK} strokeWidth="2" />
            <rect x="12" y="12" width="11" height="9" rx="2" fill="#a3afb8" stroke={INK} strokeWidth="2" />
          </pattern>
        </defs>
        <g transform="translate(0,-50)" filter="url(#rough)" {...line}>
          {/* капюшон */}
          <path d="M110 1100 C20 800 40 380 290 180 C450 70 630 70 790 180 C1040 380 1060 800 970 1100 Z" fill="#46535e" stroke={INK} strokeWidth="10" />
          <path d="M540 215 C790 215 865 410 855 560 C850 760 740 930 540 940 C340 930 230 760 225 560 C215 410 290 215 540 215 Z" fill="#10181f" />
          {/* меховая опушка с инеем */}
          <path d="M540 225 C775 225 845 415 835 560 C830 745 725 905 540 915 C355 905 250 745 245 560 C235 415 305 225 540 225 Z" fill="none" stroke="#8d9ea9" strokeWidth="46" />
          <path d="M540 225 C775 225 845 415 835 560 C830 745 725 905 540 915 C355 905 250 745 245 560 C235 415 305 225 540 225 Z" fill="none" stroke="#dbe7ef" strokeWidth="8" strokeDasharray="3 26" opacity="0.9" />
          {/* швы */}
          {["M160 520 C150 700 190 900 250 1040", "M920 520 C930 700 890 900 830 1040", "M330 130 C300 190 285 230 280 270", "M750 130 C780 190 795 230 800 270"].map((d) => (
            <path key={d} d={d} fill="none" stroke={INK} strokeWidth="6" opacity="0.8" />
          ))}
          {/* шея */}
          <path d="M455 840 L450 1010 L630 1010 L625 840 Z" fill="#53656f" stroke={INK} strokeWidth="8" />
          {/* лицо */}
          <path d={FACE} fill="#8497a4" stroke={INK} strokeWidth="9" />
          <g clipPath="url(#faceClip)">
            <ellipse cx="540" cy="250" rx="300" ry="120" fill={INK} opacity="0.55" />
            <path d="M690 240 C830 420 830 700 680 880 L860 920 L860 200 Z" fill="#1f2d38" opacity="0.5" />
            <ellipse cx="385" cy="705" rx="62" ry="40" fill="#8f7d8a" opacity="0.55" />
            <ellipse cx="695" cy="705" rx="62" ry="40" fill="#7d6f7c" opacity="0.55" />
            <g fill="#3f4e5a" opacity="0.7">
              {[470, 500, 540, 580, 610].map((x, i) => (
                <circle key={x} cx={x} cy={[830, 845, 850, 845, 830][i]} r="3" />
              ))}
              <circle cx="440" cy="805" r="3" />
              <circle cx="640" cy="805" r="3" />
            </g>
          </g>
          {/* мешки, брови, морщины, нос */}
          <path d="M370 625 C410 650 455 650 492 625" fill="none" stroke="#3b4b57" strokeWidth="7" />
          <path d="M588 625 C625 650 670 650 710 625" fill="none" stroke="#3b4b57" strokeWidth="7" />
          <path d="M335 490 C390 450 450 435 500 440" fill="none" stroke="#1c232a" strokeWidth="24" />
          <path d="M580 440 C630 435 690 450 745 490" fill="none" stroke="#1c232a" strokeWidth="24" />
          <path d="M350 478 C395 450 450 440 490 440" fill="none" stroke="#eef5fa" strokeWidth="6" strokeDasharray="10 18" />
          <path d="M590 440 C630 440 685 450 730 478" fill="none" stroke="#eef5fa" strokeWidth="6" strokeDasharray="10 18" />
          <path d="M430 395 C500 375 580 375 650 395" fill="none" stroke="#3b4b57" strokeWidth="6" opacity="0.8" />
          <path d="M450 350 C510 335 570 335 630 350" fill="none" stroke="#3b4b57" strokeWidth="5" opacity="0.6" />
          <path d="M540 585 C534 650 528 690 508 722" fill="none" stroke="#2f3e49" strokeWidth="7" />
          <path d="M508 722 C525 742 555 742 572 722" fill="none" stroke="#2f3e49" strokeWidth="7" />
          <ellipse cx="520" cy="728" rx="9" ry="6" fill="#1b252d" />
          <ellipse cx="560" cy="728" rx="9" ry="6" fill="#1b252d" />
          <ellipse cx="540" cy="718" rx="34" ry="22" fill="#9a8590" opacity="0.45" />
          {/* иней на лице */}
          <g fill="#f4f9fc" opacity="0.9">
            {[[350, 640], [740, 640], [395, 760], [690, 760], [540, 420], [330, 470], [755, 470]].map(([x, y]) => (
              <circle key={`${x}${y}`} cx={x} cy={y} r="4" />
            ))}
            <circle cx="470" cy="680" r="3" />
            <circle cx="610" cy="680" r="3" />
          </g>
          {/* воротник и молния */}
          <path d="M-20 1010 C220 930 860 930 1100 1010 V1940 H-20 Z" fill="#46535e" stroke={INK} strokeWidth="10" />
          {[1140, 1280, 1430].map((y) => (
            <path key={y} d={`M-20 ${y} C260 ${y - 70} 820 ${y - 70} 1100 ${y}`} fill="none" stroke={INK} strokeWidth="7" />
          ))}
          <rect x="518" y="955" width="44" height="990" fill="#262f37" stroke={INK} strokeWidth="6" />
          <rect x="528" y="955" width="24" height="990" fill="url(#zipT)" />
          <rect x="520" y="968" width="40" height="50" rx="9" fill="#b8c3cb" stroke={INK} strokeWidth="6" />
          <rect x="529" y="1012" width="22" height="66" rx="9" fill="#9aa7b1" stroke={INK} strokeWidth="6" />
          <rect x="535" y="1050" width="10" height="18" rx="4" fill={INK} />
        </g>
      </Svg>
      <Svg>
        <g transform="translate(0,-50)" {...line}>
          <g transform={`translate(0 570) scale(1 ${s}) translate(0 -570)`}>
            <ellipse cx="430" cy="570" rx="64" ry="54" fill="#dfe8ee" stroke={INK} strokeWidth="8" />
            <ellipse cx="650" cy="570" rx="64" ry="54" fill="#dfe8ee" stroke={INK} strokeWidth="8" />
            <g transform={`translate(${Math.sin(t * 1.3) * 5 + tr} ${Math.cos(t * 0.9) * 3 + tr * 0.6})`}>
              {[434, 646].map((x) => (
                <g key={x}>
                  <circle cx={x} cy="572" r="34" fill="#4f7088" />
                  <circle cx={x} cy="572" r="15" fill="#05090d" />
                  <circle cx={x + 12} cy="558" r="9" fill="#fff" />
                  {/* отражение окна лачуги */}
                  <rect x={x - 10} y="571" width="8" height="7" rx="1" fill="#f2c94c" />
                </g>
              ))}
            </g>
            <path d="M370 575 C385 572 395 576 400 582 M490 565 C478 568 470 572 466 578" fill="none" stroke="#c9565f" strokeWidth="3" opacity="0.75" />
            <path d="M590 565 C602 568 610 572 614 578 M710 575 C695 572 685 576 680 582" fill="none" stroke="#c9565f" strokeWidth="3" opacity="0.75" />
            <path d="M366 560 C390 500 470 498 494 560" fill="none" stroke={INK} strokeWidth="12" />
            <path d="M586 560 C610 498 690 500 714 560" fill="none" stroke={INK} strokeWidth="12" />
            <g fill="#f4f9fc" stroke="#a9bccb" strokeWidth="2">
              {[[380, 525, 7], [410, 508, 8], [445, 504, 8], [478, 518, 7], [600, 518, 7], [635, 504, 8], [670, 508, 8], [700, 525, 7]].map(([x, y, r]) => (
                <circle key={x} cx={x} cy={y} r={r} />
              ))}
            </g>
          </g>
          <g transform={`translate(540 800) scale(1 ${ms}) translate(-540 -800)`}>
            <path d="M490 800 C505 770 575 770 590 800 C585 850 495 850 490 800 Z" fill="#120a0d" stroke="#2b3944" strokeWidth="7" />
            <path d="M505 786 C520 778 560 778 575 786 L572 800 C555 794 525 794 508 800 Z" fill="#dfe8ee" />
            <path d="M510 830 C525 818 555 818 570 830 C560 842 520 842 510 830 Z" fill="#5c2a2f" />
            <path d="M470 790 C480 765 500 760 520 764 M610 790 C600 765 580 760 560 764" fill="none" stroke="#3f4f5c" strokeWidth="6" />
          </g>
          <g
            opacity={Math.sin(e * Math.PI) * 0.85}
            transform={`translate(${725 + e * 45} ${890 - e * 60}) scale(${0.7 + e * 0.7}) translate(-725 -890)`}
            fill="#e9f2f8"
            stroke="#8fa3b2"
            strokeWidth="3"
          >
            <circle cx="680" cy="900" r="26" />
            <circle cx="725" cy="870" r="34" />
            <circle cx="775" cy="905" r="26" />
          </g>
        </g>
      </Svg>
    </div>
  );
};
