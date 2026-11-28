import React from "react";
import { AbsoluteFill, Freeze } from "remotion";
import { MONT } from "../../pelmeni/kit";
import { DimaHead, MouthCtx } from "../AvitoWardrobe/rig";
import { GOLD_RIM, RimDefs } from "../NuansEp2/chars";
import { MuteCtx } from "./engine";
import { Scene09 } from "./scenes";

/** Кликбейтное превью лонга 1280×720: йети в жилетке охранника тащит Толяна, крупно шокированный Макс, стрелка, обводка, крупный текст. */
export const HyperThumb = () => {
  const Z = 1.12; // масштаб сцены 1920×1080 в кадре 1280×720
  const [sx, sy] = [905, 360]; // точка сцены (монстр) → в кадре (850, 330)
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, transformOrigin: "0 0", transform: `translate(${850 - sx * Z}px, ${330 - sy * Z}px) scale(${Z})`, filter: "saturate(1.25) contrast(1.08)" }}>
        <MuteCtx.Provider value={true}>
          <Freeze frame={96}>
            <Scene09 />
          </Freeze>
        </MuteCtx.Provider>
      </div>
      {/* красная тревожная виньетка слева, чтобы текст читался */}
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(20,0,0,.92) 0%, rgba(40,0,0,.55) 38%, rgba(0,0,0,0) 62%), radial-gradient(70% 80% at 70% 45%, rgba(0,0,0,0) 55%, rgba(60,0,0,.55) 100%)" }} />
      <svg viewBox="0 0 1280 720" width={1280} height={720} style={{ position: "absolute", left: 0, top: 0 }}>
        <RimDefs id="thr" color={GOLD_RIM} />
        {/* обводка вокруг морды йети + стрелка */}
        <ellipse cx={848} cy={158} rx={86} ry={78} fill="none" stroke="#ff1f1f" strokeWidth={10} />
        <ellipse cx={848} cy={300} rx={170} ry={300} fill="#7ff0e6" opacity={0.08} />
        <path d="M470 360 C560 300 640 240 732 196" stroke="#ff1f1f" strokeWidth={22} fill="none" strokeLinecap="round" />
        <path d="M700 172 L768 178 L732 236 Z" fill="#ff1f1f" stroke="#ff1f1f" strokeWidth={10} strokeLinejoin="round" />
        {/* шокированный Макс крупно */}
        <MouthCtx.Provider value={{ dima: 0.6, nuance: 0 }}>
          <g filter="url(#thr)" transform="translate(220 1660) scale(1.72)">
            <DimaHead lid={0} look={0.95} />
          </g>
        </MouthCtx.Provider>
        <path d="M330 380 C342 400 342 418 330 424 C318 418 318 400 330 380 Z" fill="#8fd0f2" stroke="#2b1d16" strokeWidth={3} />
      </svg>
      <div style={{ position: "absolute", left: 34, top: 26, width: 640, fontFamily: MONT, fontWeight: 900, fontSize: 92, lineHeight: 0.98, color: "#fff", WebkitTextStroke: "14px #000", paintOrder: "stroke fill", textTransform: "uppercase" }}>
        Заперли
        <br />
        на <span style={{ color: "#ffd21f" }}>30 дней</span>
      </div>
      <div style={{ position: "absolute", left: 990, top: 470, transform: "rotate(-6deg)", fontFamily: MONT, fontWeight: 900, fontSize: 54, color: "#fff", background: "#e00000", border: "6px solid #000", borderRadius: 14, padding: "4px 18px" }}>ОН НА КАССЕ?!</div>
    </AbsoluteFill>
  );
};
