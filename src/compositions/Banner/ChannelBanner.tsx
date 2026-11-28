import React from "react";
import { AbsoluteFill } from "remotion";
import { MONT } from "../../pelmeni/kit";
import { AvitoCard, FLOOR_Y, Mug, NightWindow, PhoneItem, Push, Rug, Wardrobe } from "../AvitoWardrobe/props";
import { dimaReach, nuanceReach } from "../AvitoWardrobe/rig";
import { DimaV2, NuansV2 } from "../NuansEp2/chars";

/**
 * Баннер канала 2560×1440. Всё важное — в безопасной зоне 1546×423 по центру (x 507–2053, y 508–931):
 * Нюанс выглядывает из «Шкафа СССР», Дима с покерфейсом и кружкой, Валера Перекуп — объявлением на Авито и пушем про диван.
 */
const K = 0.34; // масштаб ригов (координаты AvitoWardrobe, пол FLOOR_Y=1380)
const X0 = 448;
const Y0 = 915 - FLOOR_Y * K;
export const ChannelBanner = () => {
  const t = 1.2;
  const DX = 1640;
  return (
    <AbsoluteFill style={{ background: "#14171f" }}>
      <svg viewBox="0 0 2560 1440" width={2560} height={1440}>
        <defs>
          <pattern id="wp" width={64} height={64} patternUnits="userSpaceOnUse">
            <rect width={64} height={64} fill="#252b39" />
            <path d="M32 6 l8 14 l-8 14 l-8 -14 Z" fill="#2d3445" />
          </pattern>
          <radialGradient id="lamp" cx="0.5" cy="0.45" r="0.6">
            <stop offset="0" stopColor="#ffb347" stopOpacity={0.32} />
            <stop offset="1" stopColor="#ffb347" stopOpacity={0} />
          </radialGradient>
          <linearGradient id="fl" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#4a3326" />
            <stop offset="1" stopColor="#1e140e" />
          </linearGradient>
        </defs>
        {/* комната: обои, тёплый свет лампы, пол с досками */}
        <rect width={2560} height={915} fill="url(#wp)" />
        <rect y={915} width={2560} height={525} fill="url(#fl)" />
        {Array.from({ length: 22 }, (_, i) => <path key={i} d={`M${i * 128 - 200} 1440 L${1280 + (i * 128 - 1280) * 0.55} 915`} stroke="#2a1c14" strokeWidth={3} opacity={0.6} />)}
        <rect y={905} width={2560} height={14} fill="#1b1410" />
        <ellipse cx={1280} cy={700} rx={1300} ry={620} fill="url(#lamp)" />
        <g transform={`translate(${X0} ${Y0}) scale(${K})`}>
          <NightWindow x={-440} t={t} />
          <Rug x={1150} w={1500} />
          <Wardrobe x={800} w={400} />
          <NuansV2 x={930} y={FLOOR_Y} s={0.9} t={t} amp={0.25} pose={{ armL: nuanceReach(-1, 800, 1040, 930, FLOOR_Y, 0.9), armR: nuanceReach(1, 1050, 1040, 930, FLOOR_Y, 0.9), head: 8, mouth: 0.4 }} />
          <DimaV2 x={DX} y={FLOOR_Y} s={1.35} t={t} pose={{ armR: dimaReach(1, DX + 128, FLOOR_Y - 590, DX, FLOOR_Y, 1.35), itemR: <Mug t={t} steam />, armL: dimaReach(-1, DX - 120, FLOOR_Y - 568, DX, FLOOR_Y, 1.35), itemL: <PhoneItem t={t} mode="avito" />, head: -6, look: -0.85, lid: 0.55 }} />
        </g>
        {/* Валера Перекуп: объявление «Шкаф СССР · небольшой нюанс» и пуш про диван с сюрпризом */}
        <g transform="translate(1872 772) scale(0.4) translate(-540 -330)">
          <AvitoCard x={540} y={330} k={1} oval={1} />
        </g>
        <g transform="translate(1662 572) scale(0.4)">
          <Push k={1} y={0} />
        </g>
      </svg>
      {/* имена героев — по центру безопасной зоны */}
      <div style={{ position: "absolute", left: 1150, top: 552, width: 560, textAlign: "center", fontFamily: MONT, fontWeight: 900, fontSize: 92, lineHeight: 0.98, color: "#fff", WebkitTextStroke: "14px #0b0d12", paintOrder: "stroke fill", textTransform: "uppercase", letterSpacing: 1 }}>
        Дима
        <br />
        <span style={{ color: "#F5A623" }}>Нюанс</span>
        <br />
        <span style={{ color: "#33b5ff" }}>Валера</span>
      </div>
      <div style={{ position: "absolute", left: 1110, top: 852, width: 640, textAlign: "center", fontFamily: MONT, fontWeight: 800, fontSize: 34, color: "#ffe6b0", WebkitTextStroke: "6px #0b0d12", paintOrder: "stroke fill" }}>
        жиза с небольшим нюансом
      </div>
    </AbsoluteFill>
  );
};
