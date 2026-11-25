import React from "react";
import { AbsoluteFill, random, Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { clamp, ease, Svg, useT } from "../components/fx";
import { Sfx } from "../components/audio";
import { Wagon2, type Cam } from "./Wagon2";
import { Atmos } from "./GostOld";
import { Beyond, cuesFor, type Cue, Face, flickerOn, Follow, Hook, Hud, MONT, ride, Slam, Subs, Vig, Watch } from "./Ep1Test";
import { Finger, PovPhone, PovStandWalk, Sleeper } from "./Wake";
import { lamp, lampDipsIn } from "./lamp";
import { LEN } from "./Wagon2";
import { BLINK_STATION, BLINK_WALK, Choice3D, HITS, Hits3D, ONC_A, Pov3D, Slam3D, Station3D } from "./Pov3D";
import { loadFont as loadStencil } from "@remotion/google-fonts/RussoOne";
const { fontFamily: STENCIL } = loadStencil("normal", { weights: ["400"], subsets: ["latin", "cyrillic"] });

/** «Последняя электричка», серия 1 «Без остановок». Сценарий одобрен; без мата. */
const FPS = 30;
const LINE = "#2b1d16";

// ── новые кадры ────────────────────────────────────────────────────────

/** Проснулся: телефон в руке (00:47, нет сети), за ним пустой тёмный вагон. */
const Wake = () => {
  const t = useT();
  const r = ride(t);
  const cam: Cam = { x: 0, y: 140, z: ease(t, 0, 6, 200, 420), roll: r.rot, pitch: r.y };
  const phoneIn = ease(t, 0.2, 0.8, 1, 0);
  return (
    <AbsoluteFill>
      <Wagon2 cam={cam} t={t} light={0.6} />
      <Atmos t={t + 7} beam={false} />
      <Svg>
        <g transform={`translate(0 ${phoneIn * 900 + ease(t, 3.2, 3.8, 0, 900)}) rotate(${-4 + Math.sin(t * 1.3) * 1.5} 540 1300)`}>
          {/* рука */}
          <path d="M300 1920 C320 1700 360 1560 420 1480 L700 1480 C760 1560 790 1700 800 1920 Z" fill="#e8c2a6" stroke={LINE} strokeWidth="8" />
          <path d="M260 1920 C250 1760 280 1650 330 1600 L380 1920 Z" fill="#2f5f9e" stroke={LINE} strokeWidth="8" />
          {/* телефон */}
          <rect x="330" y="760" width="420" height="820" rx="56" fill="#0d1014" stroke={LINE} strokeWidth="12" />
          <rect x="350" y="780" width="380" height="780" rx="44" fill="#111a24" />
          <text x="540" y="930" textAnchor="middle" fontFamily={MONT} fontWeight="800" fontSize="104" fill="#e9eef3">00:47</text>
          <text x="540" y="990" textAnchor="middle" fontFamily={MONT} fontWeight="800" fontSize="30" fill="#8ea2b5">среда, 26 ноября</text>
          <g transform="translate(540 1130)">
            {[0, 1, 2, 3].map((i) => <rect key={i} x={-60 + i * 30} y={-16 - i * 16} width="18" height={24 + i * 16} rx="4" fill="#3b4652" />)}
            <path d="M-74 -86 L66 22" stroke="#e53935" strokeWidth="10" strokeLinecap="round" />
          </g>
          <text x="540" y="1250" textAnchor="middle" fontFamily={MONT} fontWeight="800" fontSize="46" fill="#e9eef3">Нет сети</text>
          {/* большой палец */}
          <path d="M700 1500 C760 1430 790 1380 780 1330 C770 1300 740 1300 720 1330 L660 1440 Z" fill="#e8c2a6" stroke={LINE} strokeWidth="8" />
        </g>
      </Svg>
      <Vig />
    </AbsoluteFill>
  );
};

/** Мимо проносится станция без названия: вид в окно, платформа, фонари, пустая табличка. */
const Station = () => {
  const t = useT();
  const r = ride(t);
  const sp = 1250; // px/с
  const x0 = 700 - t * sp;
  return (
    <AbsoluteFill style={{ background: "#07090c", transform: `translateY(${r.y}px) rotate(${r.rot}deg) scale(1.04)` }}>
      <Svg>
        {/* ночь за окном */}
        <rect x="120" y="420" width="840" height="900" fill="#0b1018" />
        <g clipPath="inset(0)">
          <svg x="120" y="420" width="840" height="900" viewBox="0 0 840 900">
            <rect width="840" height="900" fill="#0b1018" />
            {Array.from({ length: 30 }, (_, i) => <circle key={i} cx={random(`s${i}`) * 840} cy={random(`y${i}`) * 300} r="1.6" fill="#fff" opacity="0.5" />)}
            {/* лес вдали медленнее */}
            <path d={`M${-200 - ((t * 140) % 200)} 520 ${Array.from({ length: 14 }, (_, i) => `l60 -${60 + (i % 3) * 30} l60 ${60 + (i % 3) * 30}`).join(" ")} V900 H-200 Z`} fill="#06080b" />
            {/* платформа */}
            <g transform={`translate(${x0} 0)`}>
              <rect x="0" y="640" width="2400" height="70" fill="#8a9096" />
              <rect x="0" y="700" width="2400" height="200" fill="#3d4248" />
              {[0, 1, 2, 3].map((i) => (
                <g key={i} transform={`translate(${200 + i * 600} 0)`}>
                  <rect x="-8" y="320" width="16" height="320" fill="#3a3f45" />
                  <rect x="-40" y="305" width="80" height="22" rx="6" fill="#3a3f45" />
                  <ellipse cx="0" cy="560" rx="150" ry="110" fill="#ffd98a" opacity="0.22" />
                  <circle cx="0" cy="330" r="12" fill="#ffe2a0" />
                </g>
              ))}
              {/* табличка без названия */}
              <g transform="translate(1000 430)">
                <rect x="-6" y="60" width="12" height="150" fill="#3a3f45" />
                <rect x="-190" y="0" width="380" height="80" rx="8" fill="#2c5aa0" stroke="#e9eef3" strokeWidth="6" />
                <rect x="-140" y="30" width="280" height="20" rx="6" fill="#e9eef3" opacity="0.25" />
              </g>
            </g>
            {/* смаз скорости */}
            {Array.from({ length: 12 }, (_, i) => <rect key={i} x={((random(`m${i}`) * 840 - t * 1800) % 1000 + 1000) % 1000 - 80} y={random(`n${i}`) * 900} width="160" height="3" fill="#cfd6dc" opacity="0.15" />)}
            {/* отражение в стекле: лицо Димы и на мгновение — высокий силуэт позади */}
            <ellipse cx="560" cy="520" rx="120" ry="150" fill="#e8c2a6" opacity="0.08" />
            {t > 4.6 && t < 5.15 && (
              <g opacity={0.22 * Math.sin(((t - 4.6) / 0.55) * Math.PI)}>
                <ellipse cx="300" cy="300" rx="55" ry="70" fill="#d9d4c3" />
                <path d="M255 360 C240 520 250 700 265 900 L335 900 C350 700 360 520 345 360 Z" fill="#d9d4c3" />
                <circle cx="282" cy="292" r="6" fill="#000" />
                <circle cx="318" cy="292" r="6" fill="#000" />
              </g>
            )}
          </svg>
        </g>
        {/* рама окна */}
        <path d="M0 0 H1080 V1920 H0 Z M120 420 V1320 H960 V420 Z" fill="#4f5b58" fillRule="evenodd" />
        <rect x="120" y="420" width="840" height="900" fill="none" stroke={LINE} strokeWidth="18" rx="20" />
        <rect x="100" y="1320" width="880" height="40" fill="#8b9294" stroke={LINE} strokeWidth="6" />
      </Svg>
      <Vig k={0.7} />
    </AbsoluteFill>
  );
};

/** Карточка «ПРАВИЛО №N»: резкий вход (scale 0.15 с) + короткий глитч. */
const RuleCard = ({ n, title, children }: { n: number; title: string; children: React.ReactNode }) => {
  const t = useT();
  const pop = t < 0.15 ? 1.25 - (t / 0.15) * 0.25 : 1;
  const g = t < 0.2 ? 1 : 0;
  const gx = g ? (Math.floor(t * 60) % 2 ? 14 : -10) : 0;
  return (
    <AbsoluteFill style={{ background: "#0c0f13" }}>
      <AbsoluteFill style={{ transform: `scale(${pop}) translateX(${gx}px)`, filter: g ? "drop-shadow(8px 0 0 rgba(255,40,60,.7)) drop-shadow(-8px 0 0 rgba(40,200,255,.7))" : undefined }}>
        <div style={{ position: "absolute", top: 260, left: 0, right: 0, textAlign: "center", fontFamily: MONT, fontWeight: 900 }}>
          <span style={{ background: "#f2e6c8", color: "#1a120e", fontSize: 64, padding: "10px 30px", borderRadius: 12, border: "5px solid #1a120e" }}>ПРАВИЛО №{n}</span>
          <div style={{ marginTop: 50, color: "#fff", fontSize: 58, lineHeight: 1.15, padding: "0 80px" }}>{title}</div>
        </div>
        <Svg>{children}</Svg>
      </AbsoluteFill>
      {g ? <AbsoluteFill style={{ background: "#fff", opacity: 0.25 }} /> : null}
    </AbsoluteFill>
  );
};

/** Схема: 7 вагонов, машинист слева, первый вагон — цель, крайний правый (7-й) — «ТЫ ЗДЕСЬ». */
const Rule1 = () => {
  const t = useT();
  const hl = 0.65 + 0.35 * Math.abs(Math.sin(t * 3));
  const W = 128;
  return (
    <RuleCard n={1} title="Ночью — первый вагон, ближе к машинисту">
      <g transform="translate(46 860)">
        {Array.from({ length: 7 }, (_, i) => (
          <g key={i} transform={`translate(${i * (W + 8)} 0)`}>
            <path d={i === 0 ? `M0 120 L0 40 C0 10 30 0 60 0 L${W} 0 L${W} 120 Z` : `M0 0 H${W} V120 H0 Z`} fill={i === 0 ? `rgba(255,90,31,${hl})` : i === 6 ? "#3e5a7a" : "#3a4450"} stroke="#f2e6c8" strokeWidth="5" />
            {i === 0 && <path d="M8 36 C12 22 26 14 46 12 L46 46 L8 46 Z" fill="#0c0f13" />}
            {[0, 1].map((w) => <rect key={w} x={(i === 0 ? 56 : 18) + w * (i === 0 ? 34 : 50)} y="24" width={i === 0 ? 26 : 40} height="34" rx="6" fill="#0c0f13" />)}
            <text x={W / 2} y="104" textAnchor="middle" fontFamily={MONT} fontWeight="800" fontSize="30" fill="#f2e6c8">{i + 1}</text>
          </g>
        ))}
        <text x="60" y="-30" textAnchor="middle" fontFamily={MONT} fontWeight="900" fontSize="34" fill="#ff5a1f">МАШИНИСТ</text>
        <path d="M30 -16 L10 10" stroke="#ff5a1f" strokeWidth="6" strokeLinecap="round" />
        <text x={W / 2} y="180" textAnchor="middle" fontFamily={MONT} fontWeight="900" fontSize="34" fill="#ff5a1f">ЦЕЛЬ</text>
        <text x={6 * (W + 8) + W / 2} y="180" textAnchor="middle" fontFamily={MONT} fontWeight="900" fontSize="34" fill="#8fc0ff">ТЫ ЗДЕСЬ</text>
        <path d={`M${6 * (W + 8) + 20} 230 C${4 * (W + 8)} 300 ${2 * (W + 8)} 300 ${W / 2 + 20} 230`} stroke="#ff5a1f" strokeWidth="8" fill="none" strokeDasharray="18 14" />
        <path d={`M${W / 2 + 40} 214 L${W / 2 + 14} 232 L${W / 2 + 44} 248`} stroke="#ff5a1f" strokeWidth="8" fill="none" strokeLinecap="round" />
      </g>
    </RuleCard>
  );
};

/** Кнопка связи у дверей. */
const IntercomPanel = ({ pressed = 0, glow = 0 }: { pressed?: number; glow?: number }) => (
  <g>
    <rect x="300" y="760" width="480" height="560" rx="30" fill="#c9ced1" stroke={LINE} strokeWidth="10" />
    <text x="540" y="850" textAnchor="middle" fontFamily={MONT} fontWeight="800" fontSize="40" fill="#1a120e">СВЯЗЬ С</text>
    <text x="540" y="900" textAnchor="middle" fontFamily={MONT} fontWeight="800" fontSize="40" fill="#1a120e">МАШИНИСТОМ</text>
    {/* решётка динамика */}
    {Array.from({ length: 5 }, (_, r) => Array.from({ length: 7 }, (_, c) => <circle key={`${r}${c}`} cx={420 + c * 40} cy={970 + r * 34} r="9" fill="#5b6266" />))}
    <circle cx="540" cy="1210" r={70} fill="#2a2f33" stroke={LINE} strokeWidth="8" />
    <circle cx="540" cy={1210 + pressed * 6} r={52} fill={glow > 0 ? `rgb(${120 + glow * 120},40,40)` : "#b8322f"} stroke={LINE} strokeWidth="6" />
    {glow > 0 && <circle cx="540" cy="1210" r={90 + glow * 30} fill="#ff4d4d" opacity={0.18 * glow} />}
  </g>
);

const Rule2 = () => (
  <RuleCard n={2} title="У каждых дверей — кнопка связи">
    <g transform="translate(0 -160)">
      <IntercomPanel glow={0.6} />
      <path d="M880 1440 C820 1400 760 1360 660 1335" stroke="#ff5a1f" strokeWidth="14" fill="none" strokeLinecap="round" />
      <path d="M690 1305 L650 1333 L695 1360" stroke="#ff5a1f" strokeWidth="14" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <text x="880" y="1500" textAnchor="middle" fontFamily={MONT} fontWeight="900" fontSize="44" fill="#ff5a1f">ЖМИ</text>
    </g>
  </RuleCard>
);

/** Палец жмёт кнопку, треск, огонёк. */
const Button = () => {
  const t = useT();
  const r = ride(t);
  const press = 0;
  const fx = ease(t, 0, 4.6, 1700, 1330) + Math.sin(t * 30) * 4; // рука медленно тянется, дрожит
  const glow = t > 1.1 ? 0.4 + 0.6 * Math.abs(Math.sin(t * 20)) * (Math.sin(t * 3) > 0 ? 1 : 0.3) : 0;
  return (
    <AbsoluteFill style={{ background: "#151a1e", transform: `translateY(${r.y}px) rotate(${r.rot}deg) scale(1.05)` }}>
      <Svg>
        <rect width="1080" height="1920" fill="#4f5b58" />
        <g transform="translate(540 960) scale(1.25) translate(-540 -1000)">
          <IntercomPanel pressed={press} glow={glow} />
        </g>
        {/* палец */}
        {/* рука: указательный палец вытянут к кнопке, остальные поджаты, дрожит */}
        <g transform={`translate(520 ${fx + 210}) scale(1.6)`}>
          <path d="M-110 520 C-104 400 -96 300 -86 200 L94 200 C104 300 112 400 118 520 Z" fill="#3b4d63" stroke={LINE} strokeWidth="6" />
          <path d="M50 220 C70 320 84 420 90 520" stroke="#2a384a" strokeWidth="18" fill="none" opacity="0.7" />
          <path d="M-92 196 L98 196 L94 232 L-88 232 Z" fill="#2a384a" stroke={LINE} strokeWidth="5" />
          {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${-80 + i * 15} 200 V228`} stroke={LINE} strokeWidth="2" opacity="0.45" />)}
          <path d="M-84 196 C-96 140 -96 60 -78 10 L80 10 C96 60 96 140 84 196 Z" fill="#e9c4a8" stroke={LINE} strokeWidth="6" />
          <path d="M56 30 C70 80 74 140 70 190" stroke="#cf9f84" strokeWidth="14" fill="none" opacity="0.5" strokeLinecap="round" />
          {/* поджатые пальцы: костяшки и ногти снизу */}
          {[-50, -14, 22].map((x, i) => (
            <g key={i}>
              <rect x={x - 18} y={-14} width="36" height="60" rx="17" fill="#e9c4a8" stroke={LINE} strokeWidth="5" />
              <path d={`M${x - 12} 14 q12 5 24 0`} stroke={LINE} strokeWidth="2.5" fill="none" opacity="0.6" />
              <rect x={x - 10} y={30} width="20" height="14" rx="6" fill="#f3dccd" stroke={LINE} strokeWidth="2" />
            </g>
          ))}
          {/* большой палец прижат сбоку */}
          <Finger x={-80} y={110} len={86} w={36} dir={140} curl={0.2} />
          {/* указательный палец вытянут вверх к кнопке */}
          <Finger x={58} y={20} len={170} w={40} dir={180} />
        </g>
      </Svg>
      <Atmos t={t + 9} beam={false} />
      <Vig />
    </AbsoluteFill>
  );
};

/** У двери: соседний вагон освещён, за стеклом едва проходит силуэт, щелчок — там гаснет свет. */
const DoorWait = () => {
  const t = useT();
  const r = ride(t);
  const off = t > 4.5;
  const cam = { x: -25, y: 190, z: LEN - 240 - ease(t, 0, 4.5, 80, 0), roll: r.rot, pitch: r.y - 120 };
  return (
    <AbsoluteFill>
      <Wagon2 cam={cam} t={t} light={off ? 0.45 : 0.62} beyond={<Beyond t={t} frame={0} on={!off} creature={false} ghost={(t - 2.2) / 1.6} />} />
      <Atmos t={t + 11} />
      <Vig />
    </AbsoluteFill>
  );
};

/** Финальный выбор: старая металлическая панель связи, вмонтированная в тёмную стену вагона. */
const Choice = () => {
  const t = useT();
  const L = 0.82 + 0.18 * lamp(t + 40); // свет лампы над панелью слегка мигает
  const rivet = (x: number, y: number) => (
    <g key={`${x}${y}`}>
      <circle cx={x} cy={y} r="15" fill="#7d8387" stroke="#1b1e21" strokeWidth="4" />
      <circle cx={x - 4} cy={y - 4} r="5" fill="#c9ced1" />
    </g>
  );
  const row = (y: number, n: string, text: string, led: "red" | "amber", d: number) => {
    const on = t > d;
    const blink = led === "red" ? (Math.floor(t * 4) % 2 ? 1 : 0.35) : 0.55 + 0.1 * Math.sin(t * 3);
    return (
      <g opacity={on ? 1 : 0} transform={`translate(${on ? 0 : -16} 0)`}>
        <rect x="150" y={y - 62} width="780" height="124" rx="10" fill="#1f2427" stroke="#596166" strokeWidth="4" />
        <circle cx="222" cy={y} r="30" fill="#0e0f10" stroke="#596166" strokeWidth="5" />
        <circle cx="222" cy={y} r="19" fill={led === "red" ? `rgba(255,40,40,${blink})` : `rgba(255,190,90,${blink})`} />
        {led === "red" && <circle cx="222" cy={y} r="44" fill="#ff3030" opacity={0.14 * blink} />}
        {/* текст целиком помещается: ширина подогнана под поле 600 px с отступами */}
        <text x="276" y={y + 13} fontFamily={STENCIL} fontWeight="400" fontSize="37" fill="#e9e4d4" textLength={n === "2" ? 616 : 560} lengthAdjust="spacingAndGlyphs">
          {n} — {text}
        </text>
      </g>
    );
  };
  return (
    <AbsoluteFill style={{ background: "#0b0d0f" }}>
      <Svg>
        <defs>
          <linearGradient id="chWall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2c3433" />
            <stop offset="1" stopColor="#151a1a" />
          </linearGradient>
          <linearGradient id="chMetal" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#3a4044" />
            <stop offset="0.5" stopColor="#2b3034" />
            <stop offset="1" stopColor="#1d2124" />
          </linearGradient>
          <linearGradient id="chCone" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#dfeaff" stopOpacity={0.26 * L} />
            <stop offset="1" stopColor="#dfeaff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* стена вагона: панели, швы, грязь */}
        <rect width="1080" height="1920" fill="url(#chWall)" />
        {[0, 1, 2].map((i) => <path key={i} d={`M0 ${420 + i * 520} H1080`} stroke="#0e1212" strokeWidth="6" />)}
        <path d="M60 0 V1920 M1020 0 V1920" stroke="#0e1212" strokeWidth="5" />
        {Array.from({ length: 40 }, (_, i) => (
          <circle key={i} cx={random(`wd${i}`) * 1080} cy={random(`we${i}`) * 1920} r={6 + random(`wf${i}`) * 30} fill="#0b0e0e" opacity="0.18" />
        ))}
        {/* потолочная лампа и конус холодного света на панель */}
        <rect x="380" y="0" width="320" height="34" rx="10" fill={`rgba(235,240,250,${0.5 + 0.5 * L})`} stroke="#141717" strokeWidth="5" />
        <path d="M400 30 L680 30 L1060 1500 L20 1500 Z" fill="url(#chCone)" />
        {Array.from({ length: 34 }, (_, i) => {
          const y = ((random(`dy${i}`) + t * (0.02 + (i % 4) * 0.008)) % 1) * 1450 + 40;
          const half = 140 + (y / 1500) * 380;
          const x = 540 + (random(`dx${i}`) - 0.5) * 2 * half * 0.9;
          return <circle key={i} cx={x} cy={y} r={1.3 + (i % 3)} fill="#eef3ff" opacity={(0.25 + 0.4 * Math.abs(Math.sin(t * 1.5 + i))) * L} />;
        })}
        {/* тень панели на стене (контакт) */}
        <rect x="92" y="560" width="920" height="880" rx="24" fill="#000" opacity="0.45" transform="translate(14 22)" />
        {/* корпус панели */}
        <rect x="80" y="540" width="920" height="880" rx="22" fill="url(#chMetal)" stroke="#9aa1a6" strokeWidth="8" />
        <rect x="98" y="558" width="884" height="844" rx="16" fill="none" stroke="#121517" strokeWidth="4" />
        {/* свет сверху на корпусе */}
        <rect x="80" y="540" width="920" height="300" rx="22" fill="#cfe0ff" opacity={0.07 * L} />
        {Array.from({ length: 26 }, (_, i) => {
          const x = 120 + random(`sc${i}`) * 840;
          const y = 580 + random(`sd${i}`) * 800;
          return <path key={i} d={`M${x} ${y} l${30 + random(`se${i}`) * 80} ${(random(`sf${i}`) - 0.5) * 20}`} stroke="#6b7278" strokeWidth="2" opacity="0.35" />;
        })}
        {/* немного запёкшейся крови на корпусе и у края красного индикатора */}
        <path d="M940 600 C950 650 944 700 952 760" stroke="#3f0d10" strokeWidth="9" fill="none" strokeLinecap="round" opacity="0.65" />
        <ellipse cx="190" cy="860" rx="14" ry="6" fill="#3f0d10" opacity="0.6" />
        <path d="M180 868 C176 890 182 905 178 925" stroke="#3f0d10" strokeWidth="5" fill="none" opacity="0.55" />
        {rivet(126, 586)}
        {rivet(954, 586)}
        {rivet(126, 1374)}
        {rivet(954, 1374)}
        <text x="540" y="706" textAnchor="middle" fontFamily={STENCIL} fontWeight="400" fontSize="68" fill="#f2c94c" opacity={t > 0.15 ? 1 : 0}>ЧТО ДЕЛАТЬ ДИМЕ?</text>
        <path d="M160 756 H920" stroke="#596166" strokeWidth="4" opacity={t > 0.15 ? 1 : 0} />
        {row(900, "1", "НАЖАТЬ КНОПКУ СВЯЗИ", "red", 0.6)}
        {row(1100, "2", "БЕЖАТЬ ОБРАТНО В ВАГОН", "amber", 1.1)}
        <text x="540" y="1306" textAnchor="middle" fontFamily={STENCIL} fontWeight="400" fontSize="36" fill="#9aa1a6" opacity={t > 1.5 ? 1 : 0}>ПИШИ 1 ИЛИ 2 В КОММЕНТАРИЯХ</text>
        {/* провисшие провода внизу, кабель-канал сбоку */}
        <rect x="1012" y="0" width="40" height="1920" fill="#202626" stroke="#0e1212" strokeWidth="4" />
        <path d="M120 1420 C200 1620 380 1640 470 1520 M300 1420 C360 1700 600 1760 760 1600 C820 1540 880 1520 1012 1560" stroke="#111" strokeWidth="14" fill="none" strokeLinecap="round" />
        <path d="M300 1420 C360 1700 600 1760 760 1600" stroke="#7a2a24" strokeWidth="5" fill="none" opacity="0.6" />
      </Svg>
      <Vig k={0.85} />
    </AbsoluteFill>
  );
};

// ── монтаж (1:30) ─────────────────────────────────────────────────────
const S = {
  hook: [0, 2],
  sleep: [2, 11],
  pov: [11, 21],
  station: [21, 29],
  rule1: [29, 37],
  walk: [37, 42],
  follow: [42, 47],
  door: [47, 56],
  watch: [56, 66],
  rule2: [66, 74],
  button: [74, 77.0],
  slam: [77.0, 81.8],
  black: [81.8, 82.5],
  choice: [82.5, 90],
} as const;
const fr = (s: number) => Math.round(s * FPS);
export const EP1_FRAMES = fr(S.choice[1]);

// реплики: [клип, старт, длительность, текст]
const VO: [string, number, number, string][] = [
  ["v1", 6.6, 1.8, "Ни одного *пассажира*."],
  ["e1", 13.0, 5.4, "Ты проснулся. Электричка идёт сорок минут… без *остановок*."],
  ["v5", 19.0, 1.8, "Вагон совсем *пустой*."],
  ["e2", 21.6, 3.6, "Мимо проносится станция. Ты её *не знаешь*."],
  ["v2", 25.7, 3.2, "В стекле… только ты. *Почти*."],
  ["e3", 29.6, 5.1, "Правило первое. Ночью садись в *первый* вагон. Ближе к машинисту."],
  ["e4", 38.6, 1.6, "Ты идёшь *вперёд*."],
  ["v3", 42.3, 3.3, "Позади — никого. *Пока*."],
  ["v4", 48.6, 1.9, "Там кто-то *ходит*."],
  ["e5", 51.8, 2.4, "В соседнем вагоне гаснет *свет*."],
  ["e6", 57.0, 4.7, "Вспышка. Пусто. Вспышка… оно *ближе*."],
  ["e7", 66.6, 5.5, "Правило второе. У каждых дверей есть *кнопка* связи с машинистом. Жми."],
  ["e8", 75.4, 3.4, "Треск. Потом голос: не *смотри* на него."],
  ["v6", 86.4, 1.5, "Решай *быстрее*."],
];
const CUES: Cue[] = [{ from: 0, to: 2, text: "В этой электричке ты *не один*" }, ...VO.flatMap(([, at, d, tx]) => cuesFor(at, d, tx))];

const seq = (k: keyof typeof S, el: React.ReactNode) => (
  <Sequence key={k} from={fr(S[k][0])} durationInFrames={fr(S[k][1]) - fr(S[k][0])}>
    {el}
  </Sequence>
);
const dur = (k: keyof typeof S) => S[k][1] - S[k][0];

// провалы в тишину перед пугающими моментами
const SILENCE: [number, number][] = [
  [50.0, 51.5],
  [76.6, 77.0],
  [81.8, 82.5],
];
const silentAt = (g: number) => SILENCE.some(([a, b]) => g >= a && g < b);
const voiceAt = (g: number) => VO.some(([, at, d]) => g > at - 0.1 && g < at + d + 0.1);
/** Фон: приглушается под голосом наполовину, в паузах тишины — ноль. */
const bed = (base: number, start = 0) => (f: number) => {
  const g = start + f / FPS;
  if (silentAt(g)) return 0;
  return voiceAt(g) ? base * 0.4 : base;
};
// треск лампы на её провалах (сцены пробуждения и прохода; там лампа = lamp(локальное t + сдвиг))
const crackles = [...lampDipsIn(1, 10).map((x) => x + 1), ...lampDipsIn(3, 13).map((x) => x + 8), ...lampDipsIn(14, 22).map((x) => x + 7), ...lampDipsIn(6, 25).map((x) => x + 31)];

// плавные переходы: короткое затемнение (0.3 с в каждую сторону) на стыках сцен;
// пробуждение→POV уже закрыто веками, удар монстра остаётся резким (это скример)
const HOOK = 0.8;
const CUTS = [HOOK, S.station[0], S.rule1[0], S.walk[0], S.rule2[0], S.button[0]];
const dipAt = (t: number) => {
  let v = 0;
  for (const c of CUTS) v = Math.max(v, 1 - Math.abs(t - c) / 0.3);
  // выход из темноты на панель выбора и плавный уход в конце
  v = Math.max(v, t >= S.choice[0] ? 1 - (t - S.choice[0]) / 0.5 : 0, t > S.choice[1] - 0.6 ? (t - (S.choice[1] - 0.6)) / 0.6 : 0);
  return clamp(v);
};

// плашки: первые 3.5 с и 1.8 с после каждой склейки, с мягким появлением/уходом
const hudK = (t: number) => {
  let v = clamp((3.5 - t) / 0.4);
  for (const c of CUTS) if (t >= c + 0.2 && t < c + 2.0) v = Math.max(v, clamp((t - c - 0.2) / 0.3) * clamp((c + 2.0 - t) / 0.4));
  return v;
};

// низкий рык на вспышках, когда существо уже в тамбуре (со 2.4 с вспышек), не чаще раза в 1.5 с
const growlAt = (() => {
  const out: number[] = [];
  for (let f = 1; f < 10 * FPS; f++) {
    const w = f / FPS;
    if (w < 2.4 || !flickerOn(f) || flickerOn(f - 1)) continue;
    if (out.length && w - out[out.length - 1] < 1.5) continue;
    if (Math.abs(w - 3.7) < 0.8) continue;
    out.push(w);
  }
  return out.map((w) => S.watch[0] + w);
})();

export const Ep1 = () => {
  const t = useT();
  const inS = (k: keyof typeof S) => t >= S[k][0] && t < S[k][1];
  const noHud = inS("rule1") || inS("rule2") || t >= S.slam[0];
  const clacks = Array.from({ length: 90 }, (_, i) => 2 + i * 0.9).filter((g) => !silentAt(g) && g < S.slam[0]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {/* фон электрички */}
      <Audio src={staticFile("audio/train/ride.mp3")} loop volume={(f) => (f > fr(S.slam[0]) ? 0 : bed(f > fr(S.watch[0]) ? 0.3 : 0.42)(f))} />
      {clacks.map((g, i) => (
        <Sfx key={`c${i}`} at={g} name="train/clack" vol={voiceAt(g) ? 0.1 : 0.2} />
      ))}
      {[9.5, 24, 36.5, 46, 63, 72].map((g, i) => <Sfx key={`k${i}`} at={g} name="train/creak" vol={voiceAt(g) ? 0.2 : 0.4} />)}
      {crackles.map((g, i) => <Sfx key={`l${i}`} at={g} name="train/crackle" vol={0.45} />)}
      {/* лампа подмигивает на развороте камеры и на силуэте — громкий треск с гулом */}
      {[...BLINK_WALK.map((b) => S.walk[0] + b), ...BLINK_STATION.map((b) => S.station[0] + b)].map((g, i) => (
        <React.Fragment key={`bl${i}`}>
          <Sfx at={g} name="train/ballast" vol={0.9} />
          <Sfx at={g + 0.12} name="train/buzz" vol={0.35} dur={0.5} />
        </React.Fragment>
      ))}
      {/* крючок */}
      {/* крючок */}
      <Sfx at={0.02} name="train/sting" vol={0.9} dur={0.8} />
      <Sfx at={0.04} name="train/glass" vol={0.8} dur={0.8} />
      {/* пробуждение */}
      <Sfx at={2.1} name="train/breath" vol={0.3} dur={2.6} />
      <Sfx at={3.4} name="train/rustle" vol={0.6} />
      <Sfx at={4.4} name="train/seat" vol={0.6} />
      <Sfx at={6.5} name="train/inhale" vol={0.7} />
      <Sfx at={8.4} name="train/phone" vol={0.7} />
      <Sfx at={11.1} name="train/inhale" vol={0.4} dur={1.2} />
      <Sfx at={S.station[0] + 0.4} name="train/pass" vol={0.55} />
      {/* правила: цифровые сбои */}
      <Sfx at={S.rule1[0]} name="train/glitch" vol={0.7} />
      <Sfx at={S.rule2[0]} name="train/glitch" vol={0.7} />
      {/* подъём и проход */}
      <Sfx at={S.walk[0] + 0.3} name="train/seat" vol={0.55} />
      <Sfx at={S.walk[0] + 0.5} name="train/rustle" vol={0.5} />
      <Sfx at={S.walk[0] + 1.7} name="train/steps2" vol={0.65} dur={3.6} />
      <Sfx at={S.walk[0] + 5.3} name="train/whoosh" vol={0.45} />
      {/* ложный скример: грохот встречной электрички, когда Дима оглянулся */}
      <Sfx at={S.walk[0] + ONC_A - 0.15} name="train/oncoming" vol={1.1} />
      <Sfx at={S.walk[0] + ONC_A + 0.2} name="train/pass" vol={0.6} />
      <Sfx at={S.walk[0] + 7.3} name="train/whoosh" vol={0.4} />
      <Sfx at={S.walk[0] + 7.9} name="train/steps2" vol={0.55} dur={4.6} />
      {/* у двери: гаснет свет после тишины */}
      <Sfx at={50.0} name="train/breath" vol={0.55} dur={1.5} />
      <Sfx at={S.door[0] + 4.5} name="train/lightsoff" vol={0.9} />
      <Sfx at={S.door[0] + 4.8} name="train/drone" vol={0.45} />
      {/* монстр */}
      <Sfx at={S.watch[0]} name="train/buzz" vol={0.35} dur={9} />
      <Sfx at={S.watch[0] + 1.6} name="train/claws" vol={0.6} />
      {[1, 2, 3].map((k) => <Sfx key={`sc${k}`} at={S.watch[0] + 2.4 + 1.9 * k - 0.7} name="train/scrape" vol={0.6} dur={1.2} />)}
      <Sfx at={S.watch[0] + 3.7} name="train/growl" vol={0.6} />
      {growlAt.map((g, i) => <Sfx key={`gr${i}`} at={g} name="train/growl" vol={0.45} dur={1.0} />)}
      <Sfx at={S.watch[0] + 5.5} name="train/cbreath" vol={0.55} />
      <Sfx at={S.watch[0] + 7.4} name="train/claws" vol={0.5} />
      <Sfx at={S.button[0] + 0.4} name="train/cbreath" vol={0.45} />
      <Sfx at={S.button[0] + 1.0} name="train/static" vol={0.6} />
      {/* три удара в стекло */}
      <Sfx at={S.slam[0] + HITS[0] - 0.02} name="train/hit1" vol={0.9} />
      <Sfx at={S.slam[0] + HITS[1] - 0.02} name="train/hit2" vol={1.0} />
      <Sfx at={S.slam[0] + HITS[1] + 0.1} name="train/vibrate" vol={0.6} />
      <Sfx at={S.slam[0] + HITS[2] - 0.02} name="train/hit3" vol={1.1} />
      <Sfx at={S.slam[0] + HITS[2] - 0.02} name="train/sting" vol={0.9} />
      <Sfx at={S.slam[0] + HITS[2] + 0.25} name="train/growl" vol={0.9} dur={1.5} />
      <Sfx at={S.slam[0] + 1.1} name="train/cbreath" vol={0.5} dur={0.8} />
      {/* финальная панель: реле и потрескивание динамика */}
      {[0.15, 0.6, 1.1, 1.6, 2.1].map((d, i) => <Sfx key={`r${i}`} at={S.choice[0] + d} name="train/relay" vol={0.8} />)}
      <Sfx at={S.choice[0] + 0.2} name="train/speaker" vol={0.3} dur={7} />
      {/* нарастающий низкий гул: с 45 с, обрывается в тишину за 0.4 с до удара в стекло */}
      <Sequence from={fr(45)} durationInFrames={fr(S.slam[0] - 0.4) - fr(45)}>
        <Audio src={staticFile("audio/train/infra.mp3")} loop volume={(f) => 0.12 + 0.6 * clamp(f / (fr(S.slam[0] - 0.4) - fr(45)))} />
      </Sequence>
      {/* голос — всегда поверх */}
      {VO.map(([k, at]) => <Sfx key={k} at={at} name={`train/${k}`} vol={1.25} />)}
      <Sequence from={0} durationInFrames={fr(S.sleep[1])}>
        <Sleeper d={dur("sleep")} lead={S.sleep[0]} />
      </Sequence>
      {/* крючок на пересмотр: доля секунды финального 3D-скримера */}
      <Sequence from={0} durationInFrames={fr(HOOK)}>
        <Slam3D from={0} />
      </Sequence>
      {seq("pov", <PovPhone d={dur("pov")} />)}
      {seq("station", <Station3D />)}
      {seq("rule1", <Rule1 />)}
      {/* 00:37–01:06 — один непрерывный POV в 3D: подъём, проход, оглядка, дверь, вспышки */}
      <Sequence from={fr(S.walk[0])} durationInFrames={fr(S.watch[1]) - fr(S.walk[0])}>
        <Pov3D />
      </Sequence>
      {seq("rule2", <Rule2 />)}
      {seq("button", <Button />)}
      {seq("slam", <Hits3D />)}
      {seq("black", <AbsoluteFill style={{ background: "#000" }} />)}
      {seq("choice", <Choice3D font={STENCIL} />)}
      {/* грязно-жёлтый тусклый свет старых ламп — на всём, что в вагоне (3D-проход уже освещён так сам) */}
      {t < S.black[0] && !inS("rule1") && !inS("rule2") && !(t >= S.walk[0] && t < S.watch[1]) && (
        <>
          <AbsoluteFill style={{ background: "#d2b06a", mixBlendMode: "multiply", opacity: 0.55 }} />
          <AbsoluteFill style={{ background: "rgba(30,22,8,.16)" }} />
        </>
      )}
      {dipAt(t) > 0 && <AbsoluteFill style={{ background: "#000", opacity: dipAt(t) }} />}
      {/* единое плёночное зерно и виньетка поверх 2D и 3D — склеивают стили */}
      <AbsoluteFill style={{ mixBlendMode: "overlay", opacity: 0.16, pointerEvents: "none" }}>
        <svg width="1080" height="1920" viewBox="0 0 1080 1920">
          <filter id="grain" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed={Math.round(t * FPS) % 12} stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="1080" height="1920" filter="url(#grain)" />
        </svg>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(90% 70% at 50% 48%, rgba(0,0,0,0) 60%, rgba(6,4,1,.45) 100%)", pointerEvents: "none" }} />
      {!noHud && hudK(t) > 0 && (
        <AbsoluteFill style={{ opacity: hudK(t) }}>
          <Hud />
        </AbsoluteFill>
      )}
      {t < S.black[0] && <Subs t={t} cues={CUES} />}
    </AbsoluteFill>
  );
};

export { clamp };
