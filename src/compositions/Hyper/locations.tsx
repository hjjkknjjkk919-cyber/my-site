import React from "react";
import { MONT } from "../../pelmeni/kit";
import { LINE, OUT } from "../AvitoWardrobe/rig";

export const FLOOR = 1000;

const Floor = ({ c1 = "#c9c4b8", c2 = "#bdb7a9" }: { c1?: string; c2?: string }) => (
  <g>
    <rect y={FLOOR - 40} width={1920} height={1080 - FLOOR + 40} fill={c1} />
    {Array.from({ length: 13 }, (_, i) => <line key={i} x1={i * 160} y1={FLOOR - 40} x2={i * 160 - 120} y2={1080} stroke={c2} strokeWidth={3} />)}
    {[0, 1, 2].map((i) => <line key={i} x1={0} y1={FLOOR - 10 + i * 40} x2={1920} y2={FLOOR - 10 + i * 40} stroke={c2} strokeWidth={3} />)}
  </g>
);
const CeilLights = ({ color = "#fffbe8", o = 1 }: { color?: string; o?: number }) => (
  <g opacity={o}>
    {Array.from({ length: 6 }, (_, i) => (
      <g key={i}>
        <rect x={80 + i * 320} y={28} width={220} height={16} rx={6} fill={color} />
        <path d={`M${80 + i * 320} 44 L${i * 320} 260 L${380 + i * 320} 260 L${300 + i * 320} 44 Z`} fill={color} opacity={0.07} />
      </g>
    ))}
  </g>
);
/** Стеллаж с товарами: ряды разноцветных упаковок. */
const Rack = ({ x, y, w, h, rows = 5, palette, seed = 1, bottles = false }: { x: number; y: number; w: number; h: number; rows?: number; palette: string[]; seed?: number; bottles?: boolean }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill="#5b6270" {...OUT} />
    {Array.from({ length: rows }, (_, r) => {
      const ry = y + 14 + (r * (h - 20)) / rows;
      const rh = (h - 20) / rows - 14;
      const n = Math.floor(w / (bottles ? 26 : 38));
      return (
        <g key={r}>
          <rect x={x + 6} y={ry + rh} width={w - 12} height={10} fill="#8a919e" />
          {Array.from({ length: n }, (_, i) => {
            const c = palette[(i * 7 + r * 3 + seed) % palette.length];
            const bw = bottles ? 18 : 30;
            const bx = x + 10 + i * (bottles ? 26 : 38);
            return bottles ? <path key={i} d={`M${bx} ${ry + rh} v${-rh * 0.62} q0 -10 6 -14 v${-rh * 0.24} h6 v${rh * 0.24} q6 4 6 14 v${rh * 0.62} Z`} fill={c} opacity={0.92} /> : <rect key={i} x={bx} y={ry + rh * (0.15 + ((i + r) % 3) * 0.08)} width={bw} height={rh * (0.85 - ((i + r) % 3) * 0.08)} rx={3} fill={c} />;
          })}
        </g>
      );
    })}
  </g>
);

/* ── Локация А: кассы и вход, двери завалены снегом ── */
export const Checkout = ({ t, open = 0, night = 0, ticker = "ТАЛОННАЯ СИСТЕМА • ГРЕЧКА ПО ГРАФИКУ • ПАКЕТ 5 ₽ • " }: { t: number; open?: number; night?: number; ticker?: string }) => (
  <g>
    <rect width={1920} height={1080} fill="#2b2f3a" />
    <rect y={0} width={1920} height={70} fill="#1d2028" />
    <CeilLights o={1 - night * 0.8} />
    {/* двери справа: снег до верха, голубой свет; open — раздвинуты */}
    <g filter="url(#hb15)">
      <rect x={1240} y={170} width={640} height={830} fill="#7fb3d5" />
      <path d={`M1240 ${1000 - 830 * (1 - open)} Q1400 ${960 - 860 * (1 - open)} 1560 ${980 - 840 * (1 - open)} T1880 ${990 - 830 * (1 - open)} L1880 1000 L1240 1000 Z`} fill="#f4f8fc" />
      {open > 0 && <rect x={1240} y={170} width={640} height={830} fill="#ffe8a8" opacity={0.25 * open} />}
      {Array.from({ length: 40 }, (_, i) => <circle key={i} cx={1240 + ((i * 97 + t * 160) % 640)} cy={170 + ((i * 131 + t * 220) % 830)} r={3 + (i % 3)} fill="#fff" opacity={0.7} />)}
    </g>
    <g transform={`translate(${-open * 300} 0)`}><rect x={1240} y={170} width={320} height={830} fill="rgba(200,230,255,.12)" stroke="#9aa3b5" strokeWidth={10} /></g>
    <g transform={`translate(${open * 300} 0)`}><rect x={1560} y={170} width={320} height={830} fill="rgba(200,230,255,.12)" stroke="#9aa3b5" strokeWidth={10} /></g>
    <rect x={1460} y={110} width={200} height={50} rx={8} fill="#1f9d55" {...OUT} />
    <text x={1560} y={145} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={30} fill="#fff">ВЫХОД</text>
    {/* бегущая строка */}
    <rect x={60} y={110} width={1100} height={60} rx={8} fill="#0b0b0e" {...OUT} />
    <svg x={70} y={110} width={1080} height={60}>
      <text x={1080 - ((t * 160) % 2200)} y={42} fontFamily={MONT} fontWeight={900} fontSize={34} fill="#ff5a3a">{ticker + ticker}</text>
    </svg>
    {/* сигаретный бокс и стеллажи за кассами */}
    <g filter="url(#hb15)">
      <Rack x={60} y={200} w={520} h={400} palette={["#d62828", "#f2f2f2", "#1d3557", "#ffb703", "#2a9d8f"]} />
      <Rack x={620} y={200} w={560} h={400} palette={["#e76f51", "#f4a261", "#e9c46a", "#264653", "#8ab17d"]} seed={3} />
    </g>
    <Floor />
    {/* 4 кассы */}
    {[0, 1, 2, 3].map((i) => {
      const x = 80 + i * 280;
      return (
        <g key={i}>
          <line x1={x + 180} y1={620} x2={x + 180} y2={760} stroke="#333" strokeWidth={6} />
          <rect x={x + 120} y={560} width={120} height={60} rx={8} fill="#1e5bd8" {...OUT} />
          <text x={x + 180} y={600} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={22} fill="#fff">КАССА №{i + 1}</text>
          <path d={`M${x} 820 L${x + 230} 820 L${x + 250} 980 L${x - 10} 980 Z`} fill="#8a919e" {...OUT} />
          <rect x={x} y={790} width={230} height={34} fill="#2b2b2b" {...OUT} />
          <rect x={x + 170} y={740} width={60} height={50} rx={6} fill="#cfd4dc" {...OUT} />
        </g>
      );
    })}
    {[0, 1, 2].map((i) => <rect key={i} x={1120 + i * 6} y={930 - i * 26} width={100} height={60} rx={8} fill="#e63946" {...OUT} />)}
    {night > 0 && <rect width={1920} height={1080} fill="#08122a" opacity={0.55 * night} />}
  </g>
);

/* ── Локация Б: алко-отдел ── */
export const Alcohol = ({ t, barricade = 0, night = 0 }: { t: number; barricade?: number; night?: number }) => (
  <g>
    <rect width={1920} height={1080} fill="#241f2b" />
    <CeilLights o={1 - night * 0.85} color="#ffe9c8" />
    <g filter="url(#hb15)">
      {[0, 1, 2, 3].map((i) => <Rack key={i} x={40 + i * 470} y={180} w={440} h={640} rows={6} bottles palette={["#2d6a4f", "#7f4f24", "#b08968", "#386641", "#9d0208", "#e9d8a6"]} seed={i * 2} />)}
    </g>
    <g opacity={0.85 + 0.15 * Math.sin(t * 13)}>
      <rect x={640} y={86} width={640} height={80} rx={14} fill="none" stroke="#ff4fd8" strokeWidth={6} />
      <text x={960} y={142} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={46} fill="#ff9ff3" stroke="#ff4fd8" strokeWidth={2}>ЭЛИТНЫЙ АЛКОГОЛЬ</text>
    </g>
    <Floor c1="#b8b0a4" c2="#a9a194" />
    {barricade > 0 && (
      <g transform={`translate(0 ${(1 - barricade) * 400})`} opacity={barricade}>
        {Array.from({ length: 18 }, (_, i) => {
          const col = i % 6;
          const row = Math.floor(i / 6);
          const x = 560 + col * 140 + (row % 2) * 60;
          const y = 960 - row * 120;
          return (
            <g key={i} transform={`rotate(${(i % 3) * 8 - 8} ${x + 60} ${y})`}>
              <path d={`M${x} ${y - 90} h130 l-16 70 h-100 Z`} fill="none" stroke="#c9ccd2" strokeWidth={6} />
              {[1, 2, 3].map((k) => <line key={k} x1={x + k * 32} y1={y - 90} x2={x + 6 + k * 26} y2={y - 20} stroke="#c9ccd2" strokeWidth={3} />)}
              <circle cx={x + 26} cy={y - 8} r={9} fill="#333" />
              <circle cx={x + 104} cy={y - 8} r={9} fill="#333" />
            </g>
          );
        })}
        {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={500 + i * 190} y={930} width={110} height={70} fill="#c8a96e" {...OUT} />)}
        {[0, 1, 2].map((i) => <g key={i}><circle cx={540 + i * 420} cy={870} r={34} fill="#fff" {...OUT} /><circle cx={540 + i * 420} cy={870} r={10} fill="#ddd" /></g>)}
      </g>
    )}
    {night > 0 && <rect width={1920} height={1080} fill="#060818" opacity={0.6 * night} />}
  </g>
);

/* ── Локация В: мясной цех, дверь морозилки −24°C ── */
export const Butchery = ({ t, door = 0, fog = 0 }: { t: number; door?: number; fog?: number }) => {
  const flick = Math.sin(t * 23) > 0.85 ? 0.35 : 1;
  return (
    <g>
      <rect width={1920} height={1080} fill="#cfe0ea" />
      {Array.from({ length: 12 }, (_, r) => Array.from({ length: 20 }, (_, c) => <rect key={`${r}-${c}`} x={c * 100} y={r * 80} width={98} height={78} fill={(r + c) % 2 ? "#dceaf2" : "#c8dce8"} />))}
      <rect x={300} y={40} width={500} height={18} rx={6} fill="#f4fbff" opacity={flick} />
      <rect width={1920} height={1080} fill="#0b2a40" opacity={0.35 + (1 - flick) * 0.2} />
      {/* дверь морозилки */}
      <rect x={1380} y={220} width={420} height={780} fill="#2a3542" {...OUT} />
      <rect x={1400} y={240} width={380} height={760} fill="#0e1a24" />
      <g transform={`translate(1400 0) scale(${1 - door * 0.9} 1) translate(-1400 0)`}>
        <rect x={1400} y={240} width={380} height={760} fill="#9aa7b4" {...OUT} />
        {[0, 1, 2, 3].map((i) => <line key={i} x1={1410} y1={300 + i * 180} x2={1770} y2={300 + i * 180} stroke="#7d8a97" strokeWidth={6} />)}
        <rect x={1720} y={560} width={24} height={120} rx={8} fill="#5a6672" {...OUT} />
        <rect x={1500} y={320} width={180} height={80} rx={8} fill="#fff" {...OUT} />
        <text x={1590} y={372} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={40} fill="#1e5bd8">−24°C</text>
        <path d="M1400 240 L1780 240 L1780 300 Q1600 320 1400 290 Z" fill="#eaf6ff" opacity={0.8} />
      </g>
      {fog > 0 && <g filter="url(#hb2)" opacity={fog}>{[0, 1, 2, 3].map((i) => <ellipse key={i} cx={1500 + i * 70 + Math.sin(t + i) * 20} cy={700 + i * 60} rx={260} ry={110} fill="#eef8ff" opacity={0.55} />)}</g>}
      <Floor c1="#9fb3c2" c2="#8ca2b2" />
      {/* витрина */}
      <rect x={120} y={640} width={1100} height={340} fill="#dfe6ec" {...OUT} />
      <rect x={140} y={560} width={1060} height={180} rx={10} fill="rgba(210,240,255,.35)" stroke="#9aa7b4" strokeWidth={6} />
      {Array.from({ length: 8 }, (_, i) => <ellipse key={i} cx={210 + i * 128} cy={700} rx={52} ry={26} fill={i % 3 === 0 ? "#2b6cb0" : "#b5303a"} {...OUT} />)}
      <rect x={140} y={740} width={1060} height={20} fill="#9aa7b4" />
    </g>
  );
};

/* ── Локация Г: лагерь на матрасах ── */
export const Camp = ({ t, board = 1, cozy = 0, party = 0, night = 0, rates = 0 }: { t: number; board?: number; cozy?: number; party?: number; night?: number; rates?: number }) => (
  <g>
    <rect width={1920} height={1080} fill="#3a3440" />
    <CeilLights o={1 - night * 0.85} color="#fff1d6" />
    <g filter="url(#hb15)">
      <Rack x={40} y={170} w={600} h={520} palette={["#f1faee", "#a8dadc", "#457b9d", "#e9c46a"]} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <line x1={1300 + i * 200} y1={300} x2={1300 + i * 200} y2={700} stroke="#999" strokeWidth={6} />
          <path d={`M${1240 + i * 200} 320 h120 c10 90 10 200 0 300 h-120 c-10 -100 -10 -210 0 -300 Z`} fill={["#e63946", "#2a9d8f", "#264653"][i]} {...OUT} />
        </g>
      ))}
    </g>
    {/* доска «Устав и пайки» */}
    <g>
      <rect x={700} y={200} width={520} height={360} rx={10} fill="#fbfaf6" stroke="#444" strokeWidth={10} />
      <text x={960} y={252} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={34} fill="#d00000">УСТАВ И ПАЙКИ</text>
      {(rates > 0.5 ? ["1 наклейка = 2 тушёнки", "5 крышек = ночь на матрасе", "огурец = 2 наклейки", "чай = только у Толяна"] : ["09:00 — Доширак (1 шт)", "14:00 — Чай без сахара", "20:00 — Галеты", "Алкоголь — ЗАПРЕЩЁН"]).map((l, i) => (
        <text key={l} x={730} y={310 + i * 60} fontFamily={MONT} fontWeight={800} fontSize={30} fill={i === 3 ? "#d00000" : "#1d3557"} opacity={Math.min(1, Math.max(0, board * 4 - i))}>{l}</text>
      ))}
    </g>
    {/* гирлянда из пауэрбанков */}
    <path d="M0 140 Q480 220 960 140 T1920 140" stroke="#222" strokeWidth={3} fill="none" />
    {Array.from({ length: 24 }, (_, i) => <circle key={i} cx={i * 82 + 20} cy={140 + Math.sin((i / 23) * Math.PI * 2) * 34 + 30} r={8} fill={["#ffd166", "#06d6a0", "#ef476f", "#118ab2"][i % 4]} opacity={0.5 + 0.5 * Math.sin(t * 4 + i)} />)}
    <Floor c1="#a39a8c" c2="#958c7e" />
    {/* домики из коробок (день 18) */}
    {cozy > 0 && (
      <g opacity={cozy}>
        {[[60, 620], [1500, 600]].map(([x, y], i) => (
          <g key={i}>
            <rect x={x} y={y} width={340} height={380} fill="#c8a96e" {...OUT} />
            <path d={`M${x - 20} ${y} L${x + 170} ${y - 120} L${x + 360} ${y} Z`} fill="#b08a52" {...OUT} />
            <rect x={x + 120} y={y + 200} width={100} height={180} fill="#7f5f34" {...OUT} />
            <rect x={x + 30} y={y + 60} width={80} height={70} fill="#ffe8a8" {...OUT} />
            <text x={x + 230} y={y + 110} fontFamily={MONT} fontWeight={900} fontSize={22} fill="#5a3e1c">{i ? "SAMSUNG" : "LG"}</text>
          </g>
        ))}
      </g>
    )}
    {/* матрасы */}
    {[0, 1, 2, 3].map((i) => <rect key={i} x={420 + i * 290} y={900 - (i % 2) * 20} width={270} height={70} rx={20} fill={i % 2 ? "#e9f1f7" : "#cfe3f0"} {...OUT} />)}
    {party > 0 && Array.from({ length: 40 }, (_, i) => <rect key={i} x={(i * 151) % 1920} y={((i * 97 + t * 120) % 900)} width={10} height={16} fill={["#ffd166", "#06d6a0", "#ef476f", "#118ab2"][i % 4]} transform={`rotate(${t * 90 + i * 30} ${(i * 151) % 1920} ${(i * 97 + t * 120) % 900})`} opacity={party} />)}
    {night > 0 && <rect width={1920} height={1080} fill="#081a3a" opacity={0.6 * night} />}
  </g>
);

/* ── Финал: хрущёвка Макса ── */
export const Home = () => (
  <g>
    <rect width={1920} height={1080} fill="#c8b48f" />
    {Array.from({ length: 16 }, (_, i) => <path key={i} d={`M${i * 130} 0 v1000`} stroke="#bba57f" strokeWidth={30} />)}
    <rect x={120} y={160} width={560} height={420} fill="#9fd3ff" {...OUT} />
    <path d="M120 370 H680 M400 160 V580" stroke="#efe8da" strokeWidth={16} />
    <rect x={1100} y={140} width={700} height={460} fill="#8b1e3f" {...OUT} />
    {Array.from({ length: 30 }, (_, i) => <circle key={i} cx={1150 + (i % 6) * 120} cy={190 + Math.floor(i / 6) * 90} r={22} fill="#d4a017" opacity={0.6} />)}
    <rect y={FLOOR - 40} width={1920} height={120} fill="#7a5638" />
    <path d="M820 700 h660 v240 h-660 Z" fill="#5f6f52" {...OUT} />
    <path d="M800 640 h700 v90 h-700 Z" fill="#6e8060" {...OUT} />
  </g>
);

export const Defs = () => (
  <defs>
    <filter id="hb15"><feGaussianBlur stdDeviation={1.5} /></filter>
    <filter id="hb2"><feGaussianBlur stdDeviation={2} /></filter>
  </defs>
);
export { LINE };
