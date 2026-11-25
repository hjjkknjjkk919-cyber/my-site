import React from "react";
import { AbsoluteFill, random, Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { clamp, ease, Svg, useT } from "../components/fx";
import { Sfx } from "../components/audio";
import { Wagon2, type Cam } from "./Wagon2";
import { Atmos } from "./GostOld";
import { cuesFor, type Cue, Face, Follow, Hook, Hud, MONT, ride, Slam, Subs, Vig, Watch } from "./Ep1Test";

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
            {/* отражение салона и лица в стекле */}
            <ellipse cx="560" cy="520" rx="120" ry="150" fill="#e8c2a6" opacity="0.07" />
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

/** Карточка «ПРАВИЛО №N» в стиле листка/инфографики. */
const RuleCard = ({ n, title, children }: { n: number; title: string; children: React.ReactNode }) => {
  const t = useT();
  const pop = ease(t, 0, 0.25, 0.9, 1);
  return (
    <AbsoluteFill style={{ background: "#0c0f13" }}>
      <AbsoluteFill style={{ transform: `scale(${pop})`, opacity: ease(t, 0, 0.2, 0, 1) }}>
        <div style={{ position: "absolute", top: 260, left: 0, right: 0, textAlign: "center", fontFamily: MONT, fontWeight: 900 }}>
          <span style={{ background: "#f2e6c8", color: "#1a120e", fontSize: 64, padding: "10px 30px", borderRadius: 12, border: "5px solid #1a120e" }}>ПРАВИЛО №{n}</span>
          <div style={{ marginTop: 50, color: "#fff", fontSize: 58, lineHeight: 1.15, padding: "0 80px" }}>{title}</div>
        </div>
        <Svg>{children}</Svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Схема поезда: первый вагон подсвечен, стрелка к машинисту. */
const Rule1 = () => {
  const t = useT();
  const hl = 0.6 + 0.4 * Math.abs(Math.sin(t * 3));
  return (
    <RuleCard n={1} title="Ночью — первый вагон">
      <g transform="translate(60 820)">
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i} transform={`translate(${i * 192} 0)`}>
            <rect x="0" y="0" width="180" height="120" rx={i === 0 ? 50 : 14} fill={i === 0 ? `rgba(255,90,31,${hl})` : "#3a4450"} stroke="#f2e6c8" strokeWidth="5" />
            {[0, 1, 2].map((w) => <rect key={w} x={24 + w * 48} y="26" width="34" height="34" rx="6" fill="#0c0f13" />)}
          </g>
        ))}
        <text x="90" y="200" textAnchor="middle" fontFamily={MONT} fontWeight="800" fontSize="36" fill="#ff5a1f">ТЫ ЗДЕСЬ</text>
        <path d="M90 -40 V-110 M70 -70 L90 -110 L110 -70" stroke="#ff5a1f" strokeWidth="10" fill="none" strokeLinecap="round" />
        <text x="90" y="-130" textAnchor="middle" fontFamily={MONT} fontWeight="800" fontSize="34" fill="#f2e6c8">машинист</text>
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
    <g transform="translate(0 120)">
      <IntercomPanel />
    </g>
  </RuleCard>
);

/** Палец жмёт кнопку, треск, огонёк. */
const Button = () => {
  const t = useT();
  const r = ride(t);
  const press = t > 0.2 && t < 0.6 ? 1 : 0;
  const fx = ease(t, 0, 0.2, 1500, 1300) + press * 20;
  const glow = t > 0.6 ? 0.5 + 0.5 * Math.abs(Math.sin(t * 20)) * (t < 1.8 ? 1 : 0.4) : 0;
  return (
    <AbsoluteFill style={{ background: "#151a1e", transform: `translateY(${r.y}px) rotate(${r.rot}deg) scale(1.05)` }}>
      <Svg>
        <rect width="1080" height="1920" fill="#4f5b58" />
        <g transform="translate(540 960) scale(1.25) translate(-540 -1000)">
          <IntercomPanel pressed={press} glow={glow} />
        </g>
        {/* палец */}
        <g transform={`translate(560 ${fx})`}>
          <path d="M-60 0 C-62 -60 -40 -90 0 -92 C40 -90 62 -60 60 0 L70 700 H-70 Z" fill="#e8c2a6" stroke={LINE} strokeWidth="9" />
          <path d="M-36 -60 C-30 -80 30 -80 36 -60 L30 -20 H-30 Z" fill="#f3d9c6" stroke={LINE} strokeWidth="4" />
          <path d="M-60 260 C-20 250 20 250 60 260" stroke={LINE} strokeWidth="5" fill="none" opacity="0.5" />
        </g>
      </Svg>
      <Atmos t={t + 9} beam={false} />
      <Vig />
    </AbsoluteFill>
  );
};

/** Выбор зрителя: два варианта, голосование в комментариях. */
const Choice = () => {
  const t = useT();
  const opt = (n: string, text: string, col: string, d: number) => (
    <div style={{ display: "flex", alignItems: "center", gap: 28, background: "rgba(20,24,30,.9)", border: `5px solid ${col}`, borderRadius: 24, padding: "26px 36px", width: 820, opacity: ease(t, d, d + 0.2, 0, 1), transform: `translateX(${(1 - ease(t, d, d + 0.25, 0, 1)) * -60}px)` }}>
      <div style={{ width: 110, height: 110, borderRadius: 55, background: col, color: "#0c0f13", fontSize: 76, display: "flex", alignItems: "center", justifyContent: "center" }}>{n}</div>
      <div style={{ color: "#fff", fontSize: 64, lineHeight: 1.05 }}>{text}</div>
    </div>
  );
  return (
    <AbsoluteFill style={{ background: "#0a0c0f", alignItems: "center", justifyContent: "center", fontFamily: MONT, fontWeight: 900, gap: 44 }}>
      <div style={{ color: "#f2e6c8", fontSize: 58, letterSpacing: 2, opacity: ease(t, 0, 0.2, 0, 1) }}>ЧТО ДЕЛАТЬ ДИМЕ?</div>
      {opt("1", "Обернуться", "#ff5a1f", 0.3)}
      {opt("2", "Не оборачиваться", "#4fa3ff", 0.6)}
      <div style={{ color: "#9aa7b4", fontSize: 40, marginTop: 10, opacity: ease(t, 1.0, 1.3, 0, 1) }}>пиши 1 или 2 в комментариях ↓</div>
    </AbsoluteFill>
  );
};

// ── монтаж ─────────────────────────────────────────────────────────────
const S = {
  hook: [0, 1.0],
  wake: [1.0, 7.2],
  station: [7.2, 11.4],
  rule1: [11.4, 17.2],
  follow: [17.2, 22.7],
  face: [22.7, 26.3],
  watch: [26.3, 32.3],
  rule2: [32.3, 38.3],
  button: [38.3, 42.5],
  slam: [42.5, 44.9],
  question: [44.9, 49.5],
} as const;
const fr = (s: number) => Math.round(s * FPS);
export const EP1_FRAMES = fr(S.question[1]);

// реплики: [клип, старт, длительность, текст для субтитров]
const VO: [string, number, number, string][] = [
  ["e1", 1.3, 5.4, "Ты проснулся. Электричка идёт сорок минут… без *остановок*."],
  ["e2", 7.4, 3.6, "Мимо проносится станция. Ты её *не знаешь*."],
  ["e3", 11.6, 5.1, "Правило первое. Ночью садись в *первый* вагон. Ближе к машинисту."],
  ["e4", 17.6, 1.6, "Ты идёшь *вперёд*."],
  ["e5", 23.0, 2.4, "В соседнем вагоне гаснет *свет*."],
  ["e6", 26.6, 4.7, "Вспышка. Пусто. Вспышка… оно *ближе*."],
  ["e7", 32.5, 5.5, "Правило второе. У каждых дверей есть *кнопка* связи с машинистом. Жми."],
  ["e8", 38.9, 3.4, "Треск. Потом голос: не *смотри* на него."],
];
const CUES: Cue[] = [{ from: 0, to: 1.0, text: "В этой электричке ты *не один*" }, ...VO.filter((v) => v[3]).flatMap(([, at, d, tx]) => cuesFor(at, d, tx))];

const seq = (k: keyof typeof S, el: React.ReactNode) => (
  <Sequence key={k} from={fr(S[k][0])} durationInFrames={fr(S[k][1]) - fr(S[k][0])}>
    {el}
  </Sequence>
);

export const Ep1 = () => {
  const t = useT();
  const cards = (t >= S.rule1[0] && t < S.rule1[1]) || (t >= S.rule2[0] && t < S.rule2[1]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Audio src={staticFile("audio/train/ride.mp3")} loop volume={(f) => (f > fr(S.slam[0]) ? 0.08 : f > fr(S.watch[0]) ? 0.3 : 0.45)} />
      {Array.from({ length: 46 }, (_, i) => (
        <Sfx key={i} at={1 + i * 0.9} name="train/clack" vol={0.2} />
      ))}
      <Sfx at={0.05} name="train/sting" vol={0.55} dur={0.7} />
      <Sfx at={7.4} name="train/pass" vol={0.6} />
      <Sfx at={S.face[0]} name="train/breath" vol={0.7} />
      <Sfx at={S.watch[0]} name="train/buzz" vol={0.4} dur={6} />
      <Sfx at={S.button[0] + 0.2} name="train/press" vol={0.9} />
      <Sfx at={S.button[0] + 0.65} name="train/static" vol={0.7} />
      <Sfx at={S.slam[0]} name="train/sting" vol={1} />
      <Sfx at={S.slam[0]} name="train/glass" vol={1} />
      {VO.map(([k, at]) => <Sfx key={k} at={at} name={`train/${k}`} vol={1.15} />)}
      {seq("hook", <Hook />)}
      {seq("wake", <Wake />)}
      {seq("station", <Station />)}
      {seq("rule1", <Rule1 />)}
      {seq("follow", <Follow />)}
      {seq("face", <Face />)}
      {seq("watch", <Watch />)}
      {seq("rule2", <Rule2 />)}
      {seq("button", <Button />)}
      {seq("slam", <Slam />)}
      {seq("question", <Choice />)}
      {t < S.slam[0] && !cards && <Hud />}
      {t < S.slam[0] && <Subs t={t} cues={CUES} />}
    </AbsoluteFill>
  );
};

export { clamp };
