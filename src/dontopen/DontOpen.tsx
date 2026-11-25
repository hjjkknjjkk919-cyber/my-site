import React, { useMemo } from "react";
import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import * as THREE from "three";
import { clamp, useT } from "../components/fx";
import { Sfx } from "../components/audio";
import { cuesFor, type Cue, MONT, Subs } from "../train/Ep1Test";
import { Choice3D } from "../train/Pov3D";
import { loadFont as loadStencil } from "@remotion/google-fonts/RussoOne";
import { Hall3D, makeWallpaper, T } from "./Hall3D";
import { BedSitUp, LockHand, Peephole, PhoneFlash, PovPhone } from "./Scenes2D";
const { fontFamily: STENCIL } = loadStencil("normal", { weights: ["400"], subsets: ["latin", "cyrillic"] });

/** «Не открывай», серия 1. Ровно 1:00. Действие с первой секунды, событие каждые 2–3 с, живые диалоги. */
const FPS = 30;
export const DO1_FRAMES = 60 * FPS;
const fr = (s: number) => Math.round(s * FPS);

// реплики: [клип, старт, длительность, текст субтитра]
const VO: [string, number, number, string][] = [
  ["d1", 0.95, 2.85, "Чего?.. Мама же на *даче*."],
  ["d2", 7.5, 3.7, "Мам? Ты чего приехала, ты ж секунду назад с *дачи* писала…"],
  ["m1", 11.4, 5.25, "Димочка, связь глючит, сообщение поздно дошло. Открой, я *замёрзла*."],
  ["x1", 17.3, 2.8, "Не открывай ей. Это *не я*."],
  ["d3", 20.3, 2.85, "Что за… Мама, ты *где*?"],
  ["m2", 23.6, 2.45, "Дима, открой дверь, ну что ты там *стоишь*!"],
  ["x2", 24.0, 3.5, "Иди сюда… не пускай *её*…"],
  ["d4", 28.4, 1.8, "Да кто вы обе *такие*?!"],
  ["u1", 36.0, 2.05, "Мы знаем, что ты *один*."],
  ["n1", 51.6, 2.95, "Кому ты поверишь? Решай *быстрее*."],
];
// x2 звучит одновременно с m2 — субтитр второй реплики показываем после первой
const CUES: Cue[] = VO.flatMap(([k, at, d, tx]) => (k === "x2" ? cuesFor(26.0, 1.5, tx) : k === "m2" ? cuesFor(at, 2.4, tx) : cuesFor(at, d, tx)));

const voiceAt = (g: number) => VO.some(([, at, d]) => g > at - 0.1 && g < at + d + 0.1);
const SILENCE: [number, number][] = [[T.silence, T.burst]];
const silentAt = (g: number) => SILENCE.some(([a, b]) => g >= a && g < b);
/** Фон: под голосом −10.5 дБ, в провале тишины — ноль. */
const bed = (base: number, start = 0) => (f: number) => {
  const g = start + f / FPS;
  if (silentAt(g)) return 0;
  return voiceAt(g) ? base * 0.3 : base;
};

// склейки, после которых коротко показываем плашки
const CUTS = [7.0, 25.0];
const hudK = (t: number) => {
  let v = clamp((2.5 - t) / 0.3);
  for (const c of CUTS) if (t >= c && t < c + 1.5) v = Math.max(v, clamp((t - c) / 0.2) * clamp((c + 1.5 - t) / 0.3));
  return v;
};
const GLITCH: [number, number][] = [
  [4.0, 4.15],
  [7.0, 7.15],
  [44.0, 44.2],
];
const glitchAt = (t: number) => GLITCH.some(([a, b]) => t >= a && t < b);

const Hud = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div style={{ position: "absolute", top: 70, left: 46, display: "flex", gap: 14, fontFamily: MONT, fontWeight: 800 }}>
      <div style={{ background: "rgba(10,10,12,.78)", color: "#f2e6c8", padding: "10px 20px", borderRadius: 12, fontSize: 40, border: "2px solid rgba(255,255,255,.12)" }}>
        <span style={{ color: "#e5262b" }}>●</span> 03:12 <span style={{ fontSize: 24, opacity: 0.7 }}>ночь</span>
      </div>
      <div style={{ background: "#d7262b", color: "#fff", padding: "10px 20px", borderRadius: 12, fontSize: 40 }}>ЧАСТЬ 1</div>
    </div>
    <div style={{ position: "absolute", top: 70, right: 46, fontFamily: MONT, fontWeight: 800, background: "rgba(10,10,12,.78)", color: "#f2e6c8", padding: "10px 20px", borderRadius: 12, fontSize: 36, border: "2px solid rgba(255,255,255,.12)" }}>
      КВАРТИРА <span style={{ color: "#ff5a1f" }}>42</span>
    </div>
  </AbsoluteFill>
);

const Plate = ({ text }: { text: string }) => (
  <AbsoluteFill style={{ alignItems: "center", paddingTop: 230, pointerEvents: "none" }}>
    <div style={{ fontFamily: STENCIL, fontSize: 64, color: "#f2e6c8", background: "rgba(0,0,0,.72)", padding: "12px 30px", letterSpacing: 4, border: "3px solid #d7262b" }}>{text}</div>
  </AbsoluteFill>
);

const ChoiceWall = () => {
  const wall = useMemo(() => new THREE.MeshStandardMaterial({ color: "#a89c7e", roughness: 0.9, map: makeWallpaper() }), []);
  return (
    <Choice3D
      font={STENCIL}
      wall={wall}
      texts={{ header: "КОМУ ПОВЕРИТ ДИМА?", row1: "1 — ОТКРЫТЬ ВХОДНУЮ ДВЕРЬ", row2: "2 — ЗАПЕРЕТЬСЯ В ВАННОЙ", footer: "ПИШИ 1 ИЛИ 2 В КОММЕНТАРИЯХ", note: "ПРОДОЛЖЕНИЕ СНИМЕМ ПО ВЫБОРУ БОЛЬШИНСТВА" }}
    />
  );
};

const at = (a: number, b: number, el: React.ReactNode, key?: string) => (
  <Sequence key={key ?? `${a}`} from={fr(a)} durationInFrames={fr(b) - fr(a)}>
    {el}
  </Sequence>
);

export const DontOpen1 = () => {
  const t = useT();
  const glitch = glitchAt(t);
  const gk = glitch ? (Math.floor(t * 60) % 2 ? 1 : -1) : 0;
  const steps = Math.round(t * FPS);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {/* ── звук ── */}
      <Audio src={staticFile("audio/dontopen/roomtone.mp3")} loop volume={(f) => (f > fr(T.end) && f < fr(50.25) ? 0 : bed(0.35)(f))} />
      <Sfx at={0.0} name="dontopen/phonebuzz" vol={0.8} />
      <Sfx at={0.1} name="dontopen/doorbell_l" vol={0.9} dur={0.8} />
      <Sfx at={4.0} name="train/glitch" vol={0.8} />
      <Sfx at={4.3} name="dontopen/choke" vol={0.95} />
      <Sfx at={4.45} name="train/growl" vol={0.45} dur={1.2} />
      <Sfx at={7.0} name="train/glitch" vol={0.6} />
      <Sfx at={7.05} name="train/steps2" vol={0.35} dur={2.7} />
      <Sfx at={16.7} name="dontopen/wardrobe_r" vol={0.9} />
      <Sfx at={20.55} name="train/whoosh" vol={0.35} />
      <Sfx at={25.0} name="train/whoosh" vol={0.3} />
      <Sfx at={26.5} name="train/whoosh" vol={0.3} />
      <Sfx at={30.3} name="train/breath" vol={0.4} dur={2.5} />
      <Sfx at={33.0} name="dontopen/rattle_l" vol={0.9} />
      <Sfx at={34.4} name="dontopen/wardrobe_r" vol={0.6} />
      <Sfx at={38.3} name="dontopen/rattle_l" vol={0.95} />
      <Sfx at={42.0} name="dontopen/rattle_l" vol={0.8} dur={1.5} />
      {/* нарастающий гул: с 30 с, обрыв в тишину за 0.4 с до броска */}
      <Sequence from={fr(30)} durationInFrames={fr(T.silence) - fr(30)}>
        <Audio src={staticFile("audio/train/infra.mp3")} loop volume={(f) => 0.1 + 0.65 * clamp(f / (fr(T.silence) - fr(30)))} />
      </Sequence>
      <Sfx at={T.burst} name="dontopen/burst_r" vol={1} />
      <Sfx at={T.burst} name="train/sting" vol={0.85} dur={1.2} />
      <Sfx at={T.burst + 0.05} name="dontopen/scream" vol={0.95} />
      <Sfx at={T.burst + 0.35} name="train/growl" vol={0.8} dur={1.6} />
      <Sfx at={T.burst + 1.2} name="dontopen/choke" vol={0.7} />
      {[0.15, 0.6, 1.1, 1.6, 2.1].map((d, i) => (
        <Sfx key={`r${i}`} at={50.25 + d} name="train/relay" vol={0.8} />
      ))}
      {VO.map(([k, a]) => (
        <Sfx key={k} at={a} name={`dontopen/${k}`} vol={1.2} />
      ))}

      {/* ── картинка ── */}
      <AbsoluteFill style={{ filter: glitch ? "url(#do-rgb)" : undefined, transform: glitch ? `translateX(${gk * 18}px)` : undefined }}>
        {at(0, 1.3, <PhoneFlash />)}
        {at(1.3, 4.0, <BedSitUp />)}
        {/* флеш-форвард: замедленный кусок кульминации */}
        {at(4.0, 7.0, <Hall3D timeAt={(l) => 45.25 + l * 0.45} />, "ff")}
        {at(7.0, 10.2, <Hall3D timeAt={(l) => 7.0 + l} />, "h1")}
        {at(7.0, 10.2, <PovPhone />, "ph")}
        {at(10.2, 14.0, <Peephole smile={1} near={0} />, "p1")}
        {at(14.0, 23.7, <Hall3D timeAt={(l) => 14.0 + l} />, "h2")}
        {at(14.0, 16.9, <LockHand freezeAt={2.4} />, "lh")}
        {at(23.7, 25.0, <Peephole smile={0} near={1} />, "p2")}
        {at(25.0, T.end, <Hall3D timeAt={(l) => 25.0 + l} />, "h3")}
        {at(50.25, 60, <ChoiceWall />, "ch")}
      </AbsoluteFill>
      {/* полосы глитча */}
      {glitch &&
        Array.from({ length: 6 }, (_, i) => (
          <div key={i} style={{ position: "absolute", left: 0, right: 0, top: ((steps * 37 + i * 311) % 1800) + 40, height: 8 + ((i * 13) % 30), background: i % 2 ? "rgba(255,255,255,.12)" : "rgba(0,0,0,.6)", transform: `translateX(${(i % 2 ? 1 : -1) * 40}px)` }} />
        ))}
      {t >= 4.0 && t < 7.0 && <Plate text="5 МИНУТ СПУСТЯ" />}
      {t >= 7.0 && t < 8.5 && <Plate text="5 МИНУТ ДО ЭТОГО" />}
      {/* единое плёночное зерно и глубокая виньетка поверх 2D и 3D */}
      <AbsoluteFill style={{ mixBlendMode: "overlay", opacity: 0.18, pointerEvents: "none" }}>
        <svg width="1080" height="1920" viewBox="0 0 1080 1920">
          <filter id="do-grain" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed={steps % 12} stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="1080" height="1920" filter="url(#do-grain)" />
        </svg>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(85% 65% at 50% 48%, rgba(0,0,0,0) 55%, rgba(4,3,1,.6) 100%)", pointerEvents: "none" }} />
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <filter id="do-rgb" x="-5%" y="0" width="110%" height="100%">
          <feOffset in="SourceGraphic" dx="14" result="ro" />
          <feColorMatrix in="ro" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="R" />
          <feOffset in="SourceGraphic" dx="-14" result="bo" />
          <feColorMatrix in="bo" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="B" />
          <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="G" />
          <feBlend in="R" in2="G" mode="screen" result="RG" />
          <feBlend in="RG" in2="B" mode="screen" />
        </filter>
      </svg>
      {hudK(t) > 0 && t < 50 && (
        <AbsoluteFill style={{ opacity: hudK(t) }}>
          <Hud />
        </AbsoluteFill>
      )}
      {t < 50 && <Subs t={t} cues={CUES} />}
    </AbsoluteFill>
  );
};
