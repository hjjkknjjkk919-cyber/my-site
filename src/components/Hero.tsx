import { INK } from "./fx";

/**
 * Герой в стиле хука: та же геометрия лица (координаты хука 1080×1920, центр лица 540,560),
 * капюшон с мехом или шапка/волосы, обводка INK, «бумажная» шероховатость, тень на половине лица.
 */
export type HeroCfg = {
  id: string;
  skin: string;
  jacket: string;
  shade: string;
  head: "hood" | "beanie" | "hair";
  eye: string;
  hat?: string;
  hair?: string;
  stubble?: boolean;
  backpack?: boolean;
  /** грубое лицо: квадратная челюсть, толстые брови, густая щетина */
  rough?: boolean;
  /** морщины: лоб, у глаз, носогубные складки */
  old?: boolean;
  stubbleColor?: string;
  pants?: string;
  /** помпон на шапке (по умолчанию есть) */
  pompom?: boolean;
  /** длина ног: рост героя */
  legs?: number;
};

/** y центра лица, чтобы герой в полный рост стоял ботинками на земле groundY. */
export const onGround = (cfg: HeroCfg, groundY: number, s: number) => groundY - (1140 + 740 * (cfg.legs ?? 1)) * s;

/** Где на экране кисть поднятой руки (для реквизита в руке). */
export const handPos = (x: number, y: number, s: number, arm: number, flip: 1 | -1 = 1) => {
  const r = (arm * Math.PI) / 180;
  const lx = 930 - 610 * Math.sin(r);
  const ly = 1120 + 610 * Math.cos(r);
  return { x: x + (lx - 540) * s * flip, y: y + (ly - 560) * s };
};

export const STAS: HeroCfg = { id: "stas", skin: "#a7a6a8", jacket: "#8d9aa5", shade: "#46535e", head: "hood", eye: "#4f7088", backpack: true, legs: 1.25 };
export const DIMA: HeroCfg = { id: "dima", skin: "#a8897a", jacket: "#2f5f9e", shade: "#1b365c", head: "hood", eye: "#5a4632", stubble: true, rough: true, legs: 1.05 };
export const MISHA: HeroCfg = { id: "misha", skin: "#b9a79c", jacket: "#b8442e", shade: "#6e2216", head: "hood", eye: "#4f7088" };
export const LERA: HeroCfg = { id: "lera", skin: "#c4a594", jacket: "#e07a2a", shade: "#93460f", head: "hair", eye: "#3f6a4e", hair: "#1c1612", legs: 0.8 };
export const GENA: HeroCfg = { id: "gena", skin: "#b08f7c", jacket: "#2c4a36", shade: "#16261b", head: "beanie", eye: "#4a3a2a", hat: "#c1272d", legs: 1.15 };

export const SHERPA: HeroCfg = {
  id: "sherpa",
  skin: "#8d6b55",
  jacket: "#5a4a3e",
  shade: "#2e241d",
  head: "beanie",
  hat: "#7a5a40",
  eye: "#2a1e14",
  stubble: true,
  stubbleColor: "#cfc9c0",
  old: true,
  pompom: false,
};

export type Emotion = "calm" | "smile" | "fear" | "skeptic" | "laugh";

const FACE_ROUND = "M540 250 C750 250 810 420 800 560 C795 720 700 860 540 870 C380 860 285 720 280 560 C270 420 330 250 540 250 Z";
const FACE_SQUARE = "M540 250 C750 250 812 420 808 560 C806 700 780 800 700 855 C640 885 440 885 380 855 C300 800 274 700 272 560 C268 420 330 250 540 250 Z";
const L = { strokeLinecap: "round", strokeLinejoin: "round" } as const;

const BROWS: Record<Emotion, [string, string]> = {
  fear: ["M335 490 C390 450 450 435 500 440", "M580 440 C630 435 690 450 745 490"],
  calm: ["M345 486 C395 464 450 458 500 466", "M580 466 C630 458 685 464 735 486"],
  smile: ["M345 474 C395 446 450 440 500 450", "M580 450 C630 440 685 446 735 474"],
  skeptic: ["M345 466 C395 432 450 426 500 436", "M580 476 C630 474 690 476 735 484"],
  laugh: ["M345 456 C395 422 450 416 500 430", "M580 430 C630 416 685 422 735 456"],
};

type Props = {
  cfg: HeroCfg;
  /** центр лица на экране */
  x: number;
  y: number;
  s: number;
  flip?: 1 | -1;
  t: number;
  emotion?: Emotion;
  talk?: boolean;
  /** рот по громкости голоса 0..1 (важнее talk) */
  mouth?: number;
  /** смещение зрачков, px в координатах хука (±22 по x, ±18 по y) */
  look?: [number, number];
  /** опущенное верхнее веко 0..1 */
  lid?: number;
  blinks?: number[];
  /** иней на бровях, ресницах, лице 0..1 */
  frost?: number;
  breath?: number;
  /** правая рука: угол от «вниз», 150 — машет над головой, −110 — показывает вправо */
  arm?: number;
  /** ключевой свет слева (тень справа на лице) */
  lightLeft?: boolean;
  /** в полный рост: ноги, ботинки, обе руки, тень на снегу */
  full?: boolean;
  /** сила ветра 0..1: мех, хвост */
  wind?: number;
  /** идёт: фаза шага в секундах (ноги и руки качаются); не задано — стоит */
  walk?: number;
  /** доп. поворот головы, градусы (качание «нет») */
  headTurn?: number;
};

export const Hero = ({
  cfg,
  x,
  y,
  s,
  flip = 1,
  t,
  emotion = "calm",
  talk = false,
  mouth,
  look = [0, 0],
  lid,
  blinks = [],
  frost = 0.3,
  breath = 0.7,
  arm,
  lightLeft = true,
  full = false,
  wind = 0.3,
  headTurn = 0,
  walk,
}: Props) => {
  const id = cfg.id;
  const FACE = cfg.rough ? FACE_SQUARE : FACE_ROUND;
  const ang = 1.5 * Math.sin(t * 1.7) + 0.5 * Math.sin(t * 3.1 + 1);
  const bob = Math.sin(t * 3.3) * 8;
  let bl = 1;
  blinks.forEach((b) => {
    if (t >= b && t < b + 0.14) bl = 1 - 0.93 * Math.sin(((t - b) / 0.14) * Math.PI);
  });
  const fear = emotion === "fear";
  const laughing = emotion === "laugh";
  // смех: голова трясётся «ха-ха» и чуть запрокидывается
  const ha = Math.abs(Math.sin(t * 13));
  const lBob = laughing ? -ha * 12 : 0;
  const lTilt = laughing ? -3 - ha * 2 : 0;
  // брови живут, когда герой говорит
  const browY = (talk || (mouth ?? 0) > 0.08) && !laughing ? -Math.abs(Math.sin(t * 3.1)) * 10 : 0;
  const rx = fear ? 64 : 58;
  const ry = fear ? 54 : 46;
  const lidA = lid ?? (fear ? 0 : emotion === "skeptic" ? 0.35 : 0.14);
  const tr = fear ? (Math.sin(t * 67) + Math.sin(t * 109 + 1)) * 1.5 : 0;
  const px = look[0] + Math.sin(t * 1.3) * 3 + tr;
  const py = look[1] + Math.cos(t * 0.9) * 2 + tr * 0.6;
  // рот: говорит — нерегулярно открывается; страх — тяжёлое дыхание как в хуке
  const P = 1.9;
  const ph = (t % P) / P;
  const open = mouth !== undefined && !fear
    ? mouth > 0.08
      ? 0.2 + 0.8 * mouth
      : 0
    : talk
    ? 0.25 + 0.75 * Math.abs(Math.sin(t * 7) * Math.sin(t * 2.9 + 1))
    : fear
      ? 0.8 + 0.35 * (0.5 - 0.5 * Math.cos(ph * 6.2832))
      : 0;
  const e = Math.min(1, Math.max(0, (ph - 0.35) / 0.6));
  const hood = cfg.head === "hood";
  const shadow = "M690 240 C830 420 830 700 680 880 L860 920 L860 200 Z";
  const sway = Math.sin(t * 2.4) * 7 + Math.sin(t * 9) * 6 * wind + 10 * wind;
  const bottom = full ? 1740 : 1960;
  const pants = cfg.pants ?? "#2a333c";
  // шаг: ноги в противофазе, руки навстречу ногам
  const stride = walk === undefined ? 0 : Math.sin(walk * 7) * 16;
  const sleeve = (x1: number, x2: number, swing = 0) => (
    <g transform={`rotate(${swing} ${x1} 1120)`}>
      <path d={`M${x1} 1120 L${x2} 1640`} stroke={INK} strokeWidth="190" />
      <path d={`M${x1} 1120 L${x2} 1640`} stroke={cfg.jacket} strokeWidth="168" />
      <path d={`M${x1} 1120 L${x2} 1640`} stroke={cfg.shade} strokeWidth="60" opacity="0.35" transform={`translate(${lightLeft ? 40 : -40} 0)`} />
      <ellipse cx={x2} cy="1720" rx="78" ry="92" fill="#2a2f35" stroke={INK} strokeWidth="9" />
    </g>
  );

  return (
    <g transform={`translate(${x} ${y}) scale(${s * flip} ${s}) translate(-540 -560)`} {...L}>
      <defs>
        <clipPath id={`${id}F`}>
          <path d={FACE} />
        </clipPath>
        {[430, 650].map((cx) => (
          <clipPath key={cx} id={`${id}E${cx}`}>
            <ellipse cx={cx} cy="570" rx={rx} ry={ry} />
          </clipPath>
        ))}
      </defs>

      {/* тень на снегу: свет слева-сверху, тень уходит вправо */}
      {full && (
        <g transform={`translate(0 ${740 * ((cfg.legs ?? 1) - 1)})`}>
          <path d="M80 2440 L1000 2440 L1520 2560 L560 2560 Z" fill="#1d2b3a" opacity="0.28" />
          <ellipse cx="540" cy="2442" rx="520" ry="46" fill="#1d2b3a" opacity="0.35" />
        </g>
      )}
      {/* большой рюкзак за спиной со скаткой сверху */}
      {cfg.backpack && (
        <g filter="url(#rough)">
          <path d="M170 40 C170 -50 910 -50 910 40 L950 1500 H130 Z" fill="#6f4326" stroke={INK} strokeWidth="10" />
          <path d={lightLeft ? "M700 -20 C820 -10 910 10 910 40 L950 1500 H760 Z" : "M380 -20 C260 -10 170 10 170 40 L130 1500 H320 Z"} fill="#000" opacity="0.3" />
          <rect x="190" y="-200" width="700" height="150" rx="75" fill="#4a6a80" stroke={INK} strokeWidth="9" />
          <path d="M330 -200 V-50 M750 -200 V-50" stroke="#2a1a10" strokeWidth="22" />
        </g>
      )}
      {/* ноги и ботинки; legs растягивает их от бёдер (y=1700) */}
      {full && (
        <g filter="url(#rough)" transform={`translate(0 1700) scale(1 ${cfg.legs ?? 1}) translate(0 -1700)`}>
          <g transform={`rotate(${stride} 335 1720)`}>
            <path d="M150 1700 L170 2300 H500 L520 1750 Z" fill={pants} stroke={INK} strokeWidth="10" />
            {!lightLeft && <path d="M150 1700 L170 2300 H300 L320 1740 Z" fill="#000" opacity="0.3" />}
            <path d="M180 2000 C260 2020 420 2020 505 2000" fill="none" stroke={INK} strokeWidth="6" opacity="0.7" />
            <path d="M150 2290 H515 V2380 C515 2420 495 2440 455 2440 H120 C95 2440 88 2410 108 2380 Z" fill="#1d2126" stroke={INK} strokeWidth="9" />
            <path d="M130 2400 H500" stroke="#55606a" strokeWidth="8" opacity="0.7" />
          </g>
          <g transform={`rotate(${-stride} 745 1720)`}>
            <path d="M560 1750 L580 2300 H910 L930 1700 Z" fill={pants} stroke={INK} strokeWidth="10" />
            {lightLeft && <path d="M760 1740 L780 2300 H910 L930 1700 Z" fill="#000" opacity="0.3" />}
            <path d="M575 2000 C660 2020 820 2020 905 2000" fill="none" stroke={INK} strokeWidth="6" opacity="0.7" />
            <path d="M565 2290 H930 V2380 C950 2410 948 2440 925 2440 H605 C580 2440 565 2420 565 2380 Z" fill="#1d2126" stroke={INK} strokeWidth="9" />
            <path d="M580 2400 H930" stroke="#55606a" strokeWidth="8" opacity="0.7" />
          </g>
        </g>
      )}
      {/* туловище */}
      <g filter="url(#rough)">
        <path d={full ? "M-40 1060 C150 960 930 960 1120 1060 L1110 1740 C820 1790 260 1790 -30 1740 Z" : "M-40 1060 C150 960 930 960 1120 1060 L1160 2000 H-80 Z"} fill={cfg.jacket} stroke={INK} strokeWidth="10" />
        <path
          d={
            full
              ? lightLeft
                ? "M700 985 C900 995 1100 1040 1120 1060 L1110 1740 C950 1765 850 1772 760 1776 Z"
                : "M380 985 C180 995 -20 1040 -40 1060 L-30 1740 C130 1765 230 1772 320 1776 Z"
              : lightLeft
                ? "M700 985 C900 995 1100 1040 1120 1060 L1160 2000 H760 Z"
                : "M380 985 C180 995 -20 1040 -40 1060 L-80 2000 H320 Z"
          }
          fill={cfg.shade}
          opacity="0.7"
        />
        {/* блёклый блик по освещённому краю */}
        <path d={lightLeft ? "M-20 1080 C40 1040 120 1010 220 990" : "M1100 1080 C1040 1040 960 1010 860 990"} fill="none" stroke="#eef4f8" strokeWidth="14" opacity="0.3" />
        {[1200, 1360, 1520].map((yy) => (
          <path key={yy} d={`M-40 ${yy} C260 ${yy - 70} 820 ${yy - 70} 1120 ${yy}`} fill="none" stroke={INK} strokeWidth="7" opacity="0.8" />
        ))}
        {full && <path d="M-30 1700 C260 1750 820 1750 1110 1700" fill="none" stroke={INK} strokeWidth="8" />}
        <rect x="518" y="980" width="44" height={bottom - 980} fill="#262f37" stroke={INK} strokeWidth="6" />
        <rect x="520" y="992" width="40" height="50" rx="9" fill="#b8c3cb" stroke={INK} strokeWidth="6" />
        <rect x="529" y="1036" width="22" height="66" rx="9" fill="#9aa7b1" stroke={INK} strokeWidth="6" />
        {cfg.backpack && (
          <g>
            <path d={`M230 1010 C250 1200 270 1500 280 ${bottom}`} fill="none" stroke={INK} strokeWidth="70" />
            <path d={`M230 1010 C250 1200 270 1500 280 ${bottom}`} fill="none" stroke="#7a4a2a" strokeWidth="56" />
            <path d={`M850 1010 C830 1200 810 1500 800 ${bottom}`} fill="none" stroke={INK} strokeWidth="70" />
            <path d={`M850 1010 C830 1200 810 1500 800 ${bottom}`} fill="none" stroke="#7a4a2a" strokeWidth="56" />
            <rect x="290" y="1380" width="500" height="26" fill="#5a3520" stroke={INK} strokeWidth="5" />
            <rect x="505" y="1365" width="70" height="56" rx="8" fill="#2a2f35" stroke={INK} strokeWidth="5" />
          </g>
        )}
        {!hood && <ellipse cx="540" cy="1000" rx="340" ry="95" fill={cfg.jacket} stroke={INK} strokeWidth="9" />}
      </g>
      {/* опущенные руки в полный рост */}
      {full && sleeve(150, 70, -stride * 0.8)}
      {full && arm === undefined && sleeve(930, 1010, stride * 0.8)}

      {/* голова: качание и покачивание как в хуке */}
      <g transform={`translate(0 ${bob + lBob}) rotate(${ang + headTurn + lTilt} 540 900)`}>
        <g filter="url(#rough)">
          {hood && (
            <>
              <path d="M110 1100 C20 800 40 380 290 180 C450 70 630 70 790 180 C1040 380 1060 800 970 1100 Z" fill={cfg.jacket} stroke={INK} strokeWidth="10" />
              <path d="M760 200 C1000 380 1050 760 970 1100 L880 1100 C960 760 930 420 700 220 Z" fill={cfg.shade} opacity="0.65" transform={lightLeft ? undefined : "translate(1080 0) scale(-1 1)"} />
              <path d="M290 180 C150 300 70 500 80 760" fill="none" stroke="#eef4f8" strokeWidth="16" opacity="0.28" transform={lightLeft ? undefined : "translate(1080 0) scale(-1 1)"} />
              <path d="M540 215 C790 215 865 410 855 560 C850 760 740 930 540 940 C340 930 230 760 225 560 C215 410 290 215 540 215 Z" fill="#10181f" />
              <path d="M540 225 C775 225 845 415 835 560 C830 745 725 905 540 915 C355 905 250 745 245 560 C235 415 305 225 540 225 Z" fill="none" stroke="#a9b5bd" strokeWidth="46" />
              <path d="M540 225 C775 225 845 415 835 560 C830 745 725 905 540 915 C355 905 250 745 245 560 C235 415 305 225 540 225 Z" fill="none" stroke="#eef4f8" strokeWidth="8" strokeDasharray="3 26" strokeDashoffset={t * 60 * wind} opacity="0.9" />
              <path d="M160 520 C150 700 190 900 250 1040 M920 520 C930 700 890 900 830 1040" fill="none" stroke={INK} strokeWidth="6" opacity="0.8" />
            </>
          )}
          {cfg.head === "hair" && (
            <g transform={`rotate(${sway} 770 380)`}>
              <path d="M760 360 C930 400 980 620 900 820 C880 680 840 540 730 450 Z" fill={cfg.hair} stroke={INK} strokeWidth="9" />
              <ellipse cx="770" cy="390" rx="28" ry="36" fill={cfg.jacket} stroke={INK} strokeWidth="6" />
            </g>
          )}
          {!hood && (
            <>
              <ellipse cx="283" cy="600" rx="36" ry="58" fill={cfg.skin} stroke={INK} strokeWidth="8" />
              <ellipse cx="797" cy="600" rx="36" ry="58" fill={cfg.skin} stroke={INK} strokeWidth="8" />
            </>
          )}
          <path d="M455 840 L450 1010 L630 1010 L625 840 Z" fill={cfg.skin} stroke={INK} strokeWidth="8" />
          <path d="M455 840 L450 1010 L630 1010 L625 840 Z" fill="#1f2d38" opacity="0.5" />
          {/* стойка воротника под подбородком прячет шею */}
          <path d="M318 1020 C322 930 410 878 540 878 C670 878 758 930 762 1020 Z" fill={cfg.jacket} stroke={INK} strokeWidth="9" />
          <path d="M600 880 C690 890 755 940 762 1020 L640 1020 C640 960 625 910 600 880 Z" fill={cfg.shade} opacity="0.5" />
          <rect x="526" y="880" width="28" height="140" fill="#262f37" stroke={INK} strokeWidth="5" />
          {/* лицо */}
          <path d={FACE} fill={cfg.skin} stroke={INK} strokeWidth="9" />
          <g clipPath={`url(#${id}F)`}>
            {hood && <ellipse cx="540" cy="250" rx="300" ry="120" fill={INK} opacity="0.5" />}
            <path d={shadow} transform={lightLeft ? undefined : "translate(1080 0) scale(-1 1)"} fill="#1a2630" opacity="0.58" />
            {/* блёклый блик на освещённой скуле */}
            <path d="M320 480 C300 560 312 660 360 740" transform={lightLeft ? undefined : "translate(1080 0) scale(-1 1)"} fill="none" stroke="#f4f8fb" strokeWidth="12" opacity="0.3" />
            <ellipse cx="385" cy="705" rx="62" ry="40" fill="#c4777a" opacity="0.32" />
            <ellipse cx="695" cy="705" rx="62" ry="40" fill="#b86c70" opacity="0.32" />
            {cfg.stubble && (
              <path d="M290 660 C320 860 450 905 540 905 C630 905 760 860 790 660 C730 790 650 830 540 830 C430 830 350 790 290 660 Z" fill={cfg.stubbleColor ?? "#2a343c"} opacity={cfg.rough ? 0.6 : cfg.stubbleColor ? 0.75 : 0.4} />
            )}
            {cfg.old && (
              <path
                d="M420 360 C490 345 590 345 660 360 M440 395 C500 385 580 385 640 395 M350 560 L320 545 M352 580 L318 585 M730 560 L760 545 M728 580 L762 585 M470 690 C440 740 440 790 470 820 M610 690 C640 740 640 790 610 820"
                fill="none"
                stroke="#3b2a20"
                strokeWidth="6"
                opacity="0.6"
              />
            )}
            {cfg.rough && <path d="M470 770 C500 758 580 758 610 770 L600 785 C570 776 510 776 480 785 Z" fill="#2a343c" opacity="0.55" />}
          </g>
          {cfg.head === "hair" && (
            <path d="M268 600 C240 360 360 220 540 220 C720 220 840 360 812 600 C780 440 700 340 560 330 C520 380 420 420 330 430 C300 470 285 530 268 600 Z" fill={cfg.hair} stroke={INK} strokeWidth="9" />
          )}
          {cfg.head === "beanie" && (
            <>
              <path d="M262 520 C250 290 380 180 540 180 C700 180 830 290 818 520 Z" fill={cfg.hat} stroke={INK} strokeWidth="9" />
              <path d="M700 200 C800 260 830 380 818 520 L740 520 C760 400 740 290 660 210 Z" fill="#5c0f12" opacity="0.45" />
              {[360, 450, 540, 630, 720].map((xx) => (
                <path key={xx} d={`M${xx} ${215 + Math.abs(xx - 540) * 0.25} L${xx + (xx - 540) * 0.08} 450`} stroke="#5c0f12" strokeWidth="6" opacity="0.5" />
              ))}
              <path d="M250 470 C420 425 660 425 830 470 L836 548 C660 505 420 505 244 548 Z" fill="#8f1b20" stroke={INK} strokeWidth="8" />
              {cfg.pompom !== false && <circle cx="540" cy="160" r="58" fill="#eee7dc" stroke={INK} strokeWidth="8" />}
            </>
          )}
          {/* мешки, брови, нос */}
          <path d="M370 628 C410 650 455 650 492 628 M588 628 C625 650 670 650 710 628" fill="none" stroke="#3b4b57" strokeWidth="6" opacity="0.6" />
          {BROWS[emotion].map((d) => (
            <g key={d} transform={`translate(0 ${browY})`}>
              <path d={d} fill="none" stroke="#1c232a" strokeWidth={cfg.rough ? 34 : 24} />
              <path d={d} fill="none" stroke="#eef5fa" strokeWidth="6" strokeDasharray="10 18" opacity={frost} />
            </g>
          ))}
          {fear && <path d="M430 395 C500 375 580 375 650 395" fill="none" stroke="#3b4b57" strokeWidth="6" opacity="0.8" />}
          <path d="M540 585 C534 650 528 690 508 722 M508 722 C525 742 555 742 572 722" fill="none" stroke="#2f3e49" strokeWidth="7" />
          <ellipse cx="520" cy="728" rx="9" ry="6" fill="#1b252d" />
          <ellipse cx="560" cy="728" rx="9" ry="6" fill="#1b252d" />
          <ellipse cx="540" cy="716" rx="34" ry="22" fill="#c4777a" opacity="0.35" />
          <g fill="#f4f9fc" opacity={frost * 0.9}>
            {[[350, 640], [740, 640], [395, 760], [690, 760], [330, 470], [755, 470]].map(([cx, cy]) => (
              <circle key={`${cx}${cy}`} cx={cx} cy={cy} r="4" />
            ))}
          </g>
        </g>

        {/* глаза: при смехе — зажмуренные дуги и приподнятые щёки */}
        {laughing && (
          <g fill="none" stroke={INK} strokeLinecap="round">
            {[430, 650].map((cx) => (
              <g key={cx}>
                <path d={`M${cx - 54} 588 Q${cx} 526 ${cx + 54} 588`} strokeWidth="13" />
                <path d={`M${cx - 44} 628 Q${cx} 606 ${cx + 44} 628`} strokeWidth="6" opacity="0.6" />
              </g>
            ))}
          </g>
        )}
        {/* глаза: моргание, взгляд, веко */}
        <g transform={`translate(0 570) scale(1 ${bl}) translate(0 -570)`} opacity={laughing ? 0 : 1}>
          {[430, 650].map((cx) => (
            <g key={cx}>
              <ellipse cx={cx} cy="570" rx={rx} ry={ry} fill="#e6edf2" stroke={INK} strokeWidth="8" />
              <g clipPath={`url(#${id}E${cx})`}>
                <circle cx={cx + 4 + px} cy={572 + py} r={fear ? 34 : 31} fill={cfg.eye} />
                <circle cx={cx + 4 + px} cy={572 + py} r={fear ? 15 : 14} fill="#05090d" />
                <circle cx={cx + 15 + px} cy={559 + py} r="8" fill="#fff" />
                <rect x={cx - rx - 4} y={570 - ry - 4} width={rx * 2 + 8} height={4 + ry * 2 * lidA} fill={cfg.skin} />
                <path d={`M${cx - rx} ${570 - ry + ry * 2 * lidA} L${cx + rx} ${570 - ry + ry * 2 * lidA}`} stroke={INK} strokeWidth="9" />
              </g>
              <path d={`M${cx - rx} ${570 - ry * 0.2} C${cx - 40} ${570 - ry * 1.3} ${cx + 40} ${570 - ry * 1.33} ${cx + rx} ${570 - ry * 0.2}`} fill="none" stroke={INK} strokeWidth="12" />
              <g fill="#f4f9fc" stroke="#a9bccb" strokeWidth="2" opacity={frost}>
                {[-50, -22, 12, 44].map((dx) => (
                  <circle key={dx} cx={cx + dx} cy={570 - ry * 1.0 - (Math.abs(dx) < 30 ? 12 : 0)} r="7" />
                ))}
              </g>
            </g>
          ))}
        </g>

        {/* рот */}
        {laughing ? (
          <g transform={`translate(540 785) scale(1.05 ${0.75 + 0.25 * ha}) translate(-540 -785)`}>
            <path d="M468 784 C478 886 602 886 612 784 C580 800 500 800 468 784 Z" fill="#120a0d" stroke="#2b3944" strokeWidth="7" />
            <path d="M482 789 C510 801 570 801 598 789 L594 810 C565 820 515 820 486 810 Z" fill="#dfe8ee" />
            <path d="M503 852 C523 832 557 832 577 852 C562 870 518 870 503 852 Z" fill="#8c3a42" />
          </g>
        ) : open > 0 ? (
          <g transform={`translate(540 790) scale(${emotion === "smile" ? 1.15 : 1} ${open}) translate(-540 -790)`}>
            <path d="M490 800 C505 770 575 770 590 800 C585 850 495 850 490 800 Z" fill="#120a0d" stroke="#2b3944" strokeWidth="7" />
            <path d="M505 786 C520 778 560 778 575 786 L572 800 C555 794 525 794 508 800 Z" fill="#dfe8ee" />
            <path d="M510 830 C525 818 555 818 570 830 C560 842 520 842 510 830 Z" fill="#5c2a2f" />
          </g>
        ) : (
          <path
            d={emotion === "smile" ? "M482 792 C512 832 568 832 598 792" : emotion === "skeptic" ? "M495 812 C525 806 560 800 588 790" : "M498 806 C525 813 555 813 582 806"}
            fill="none"
            stroke="#2b3944"
            strokeWidth="8"
          />
        )}

        {/* пар изо рта */}
        <g
          opacity={Math.sin(e * Math.PI) * breath}
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

      {/* поднятая рука */}
      {arm !== undefined && (
        <g transform={`rotate(${arm} 930 1120)`} filter="url(#rough)">
          <path d="M930 1120 L930 1640" stroke={INK} strokeWidth="190" />
          <path d="M930 1120 L930 1640" stroke={cfg.jacket} strokeWidth="168" />
          <path d="M880 1300 C910 1320 950 1320 980 1300 M880 1460 C910 1480 950 1480 980 1460" fill="none" stroke={INK} strokeWidth="6" opacity="0.7" />
          <ellipse cx="930" cy="1730" rx="78" ry="92" fill="#2a2f35" stroke={INK} strokeWidth="9" />
          <ellipse cx="868" cy="1700" rx="30" ry="46" fill="#2a2f35" stroke={INK} strokeWidth="8" />
        </g>
      )}
    </g>
  );
};
