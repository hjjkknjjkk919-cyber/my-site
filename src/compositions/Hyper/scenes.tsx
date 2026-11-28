import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { ez, MONT } from "../../pelmeni/kit";
import { Mug as AvMug } from "../AvitoWardrobe/props";
import { dimaReach, nuanceReach, OUT } from "../AvitoWardrobe/rig";
import { DimaV2, ICE_RIM } from "../NuansEp2/chars";
import { at, end, mk, MuteCtx, type SceneData, scene, Shell } from "./engine";
import { Alcohol, Butchery, Camp, Checkout, FLOOR, Home } from "./locations";
import { Bottle, DOWN, Flashlight, Megaphone, Monster, Mop, Pelmeni, Person, Scanner } from "./people";

const MS = 0.86; // масштаб Макса
const NS = 0.72; // масштаб монстра
/** Макс (риг Димы) с кружкой «МНЕ ПОХУЙ»; sip 0..1 — подносит кружку к груди. */
const Maks = ({ x, t, sip = 0, look = 0.2, rim, itemL }: { x: number; t: number; sip?: number; look?: number; rim?: string; itemL?: React.ReactNode }) => (
  <DimaV2 x={x} y={FLOOR} s={MS} t={t} rim={rim} pose={{ armR: dimaReach(1, x + 140 - sip * 40, FLOOR - 280 - sip * 140, x, FLOOR, MS), itemR: <AvMug t={t} steam />, armL: dimaReach(-1, x - 120, FLOOR - 260, x, FLOOR, MS), itemL, look, head: 3 }} />
);
const palmDown = (p: { sh: number; el: number }) => ({ ...p, wr: -(p.sh + Math.sign(p.el) * Math.min(115, Math.abs(p.el))) });
const reachM = (side: -1 | 1, wx: number, wy: number, x: number, crouch = 0) => nuanceReach(side, wx, wy, x, FLOOR, NS, crouch);
const fwd = { sh: -70, el: -10 };
const fwdL = { sh: 70, el: 10 };
const up = { sh: 160, el: -10 };
const upL = { sh: -160, el: 10 };
const shake = (t: number, a: number, b: number, amp = 6) => (t >= a && t < b ? `translate(${Math.sin(t * 61) * amp} ${Math.cos(t * 47) * amp})` : "");
const Crowd = ({ t, xs, s = 0.8, y = FLOOR - 30 }: { t: number; xs: [string, number][]; s?: number; y?: number }) => (
  <>{xs.map(([k, x]) => <Person key={k + x} kind={k as never} x={x} y={y} s={s} t={t} pose={{ ...DOWN, look: ((x % 7) - 3) / 6 }} />)}</>
);
const Stroller = ({ x }: { x: number }) => (
  <g>
    <path d={`M${x} ${FLOOR - 220} a110 90 0 0 1 220 0 Z`} fill="#c77dff" {...OUT} />
    <rect x={x} y={FLOOR - 220} width={220} height={110} rx={20} fill="#9d4edd" {...OUT} />
    {[x + 40, x + 180].map((cx) => <circle key={cx} cx={cx} cy={FLOOR - 40} r={36} fill="#222" {...OUT} />)}
  </g>
);
const Cart = ({ x }: { x: number }) => (
  <g>
    <rect x={x} y={FLOOR - 230} width={110} height={170} rx={20} fill="#3a5a40" {...OUT} />
    <line x1={x + 55} y1={FLOOR - 230} x2={x + 55} y2={FLOOR - 320} stroke="#333" strokeWidth={8} />
    {[x + 20, x + 90].map((cx) => <circle key={cx} cx={cx} cy={FLOOR - 30} r={28} fill="#222" />)}
  </g>
);

/* ═══ АКТ 1 ═══ */
export const Scene01 = () => (
  <Shell n={1} focus={{ maks: [430, 560], galya: [760, 380], tolyan: [1060, 450] }}>
    {(t, d) => {
      const jump = mk(d, "galya_jump");
      const beam = mk(d, "beam");
      const onBelt = t >= jump && t < beam;
      const gx = t < beam ? 700 : 900;
      const gl = onBelt ? 190 * ez(t, jump, jump + 0.3) : 0;
      const bm = t >= beam ? ez(t, beam, beam + 0.3) : 0;
      return (
        <g>
          <Checkout t={t} />
          <Crowd t={t} xs={[["it", 1300], ["mom", 1420], ["oldman", 1530], ["it2", 1640], ["jock", 1760], ["oldman2", 1180], ["petrovich", 1860]]} />
          <Person kind="zina" x={1120} y={FLOOR} s={0.92} t={t} pose={{ ...DOWN, look: -0.8 }} />
          <Person kind="galya" x={gx} y={FLOOR} s={0.95} t={t} pose={{ lift: gl, armR: bm > 0 ? { sh: -92, el: -4 } : onBelt ? { sh: -150, el: -20 } : DOWN.armR, itemR: <Scanner beam={bm} />, armL: onBelt ? { sh: 30, el: 60 } : DOWN.armL, look: 0.8 }} />
          <Person kind="tolyan" x={1060} y={FLOOR} s={0.95} t={t} pose={{ armL: t > beam ? { sh: 40, el: 30 } : fwdL, look: -0.8, scared: t > beam + 0.2 && t < at(d, 5) + 2 ? 0.6 : 0 }} />
          <Maks x={430} t={t} sip={ez(t, mk(d, "sip"), mk(d, "sip") + 0.3)} itemL={<Pelmeni />} />
        </g>
      );
    }}
  </Shell>
);

export const Scene02 = () => (
  <Shell n={2} focus={{ galya: [1020, 420], lyokha: [1300, 450], roma: [1480, 440], petrovich: [480, 470], maks: [760, 560], sveta: [1700, 470], zina: [300, 500] }}>
    {(t, d) => {
      const night = ez(t, mk(d, "lights_off"), mk(d, "lights_off") + 0.5);
      return (
        <g>
          <Camp t={t} board={ez(t, 0.1, at(d, 1) + 3)} night={night} />
          <Stroller x={1760} />
          <Person kind="zina" x={300} y={FLOOR} s={0.9} t={t} pose={{ ...DOWN, look: t > mk(d, "lights_off") ? -0.8 : 0.6 }} />
          <Person kind="petrovich" x={480} y={FLOOR} s={0.95} t={t} pose={{ armR: { sh: -150, el: -60 }, lid: t < mk(d, "pan_mattress") ? 1 : 0.6, head: -6 }} />
          <Maks x={760} t={t} />
          <Person kind="galya" x={1020} y={FLOOR} s={0.95} t={t} pose={{ armR: t < at(d, 2) ? { sh: -135, el: -30 } : { sh: -70, el: -20 }, itemR: <rect x={-6} y={-40} width={12} height={60} fill="#d00000" />, look: -0.3 }} />
          <Person kind="it" x={1300} y={FLOOR} s={0.9} t={t} talk="lyokha" pose={{ armR: { sh: -100, el: -40 }, look: -0.6 }} />
          <Person kind="jock" x={1480} y={FLOOR} s={0.95} t={t} talk="roma" pose={{ armL: { sh: 40, el: 90 }, armR: { sh: -40, el: -90 }, look: -0.6 }} />
          <Person kind="mom" x={1650} y={FLOOR} s={0.9} t={t} talk="sveta" pose={{ ...DOWN, look: -0.7 }} />
          {night > 0 && <rect x={1700} y={360} width={220} height={640} fill="#000" opacity={0} />}
        </g>
      );
    }}
  </Shell>
);

export const Scene03 = () => (
  <Shell n={3} focus={{ maks: [520, 560], zina: [780, 520], monster: [1590, 330] }}>
    {(t, d) => {
      const op = mk(d, "door_open");
      const rv = mk(d, "reveal");
      const door = ez(t, op, op + 1.2);
      const paw = ez(t, op + 1.2, op + 2.2);
      return (
        <g transform={shake(t, rv, rv + 0.5)}>
          <Butchery t={t} door={door} fog={door} />
          <defs><clipPath id="dw3"><rect x={1400} y={240} width={380} height={760} /></clipPath></defs>
          <g clipPath="url(#dw3)" opacity={door}>
            <Monster x={1600} y={FLOOR} s={NS} t={t} pose={t < rv ? { armL: { sh: 4, el: 2 }, armR: reachM(1, 1420 - paw * 260, 640, 1600), gripR: 1, itemR: <Pelmeni empty />, head: 10 } : { armL: reachM(-1, 1560, 640, 1600), armR: reachM(1, 1640, 640, 1600), gripR: 1, behind: true, guilty: 1, head: 12 }} />
          </g>
          {t >= op + 1.2 && t < rv && (
            <g opacity={paw}>
              <Monster x={1600} y={FLOOR} s={NS} t={t} pose={{ armL: { sh: 4, el: 2 }, armR: reachM(1, 1420 - paw * 260, 640, 1600), gripR: 1, itemR: <Pelmeni empty />, head: 10 }} />
            </g>
          )}
          <Maks x={520} t={t} look={t > op ? 0.9 : 0.3} itemL={<Flashlight on />} />
          <Person kind="zina" x={780} y={FLOOR} s={0.9} t={t} pose={{ armR: t > op ? { sh: -120, el: -30 } : { sh: -40, el: -50 }, itemR: <Mop />, look: t > op ? 0.9 : 0.2, scared: t > rv ? 0.4 : 0 }} />
          {t > rv && t < rv + 0.8 && <rect width={1920} height={1080} fill="#fff" opacity={0.5 * (1 - (t - rv) / 0.8)} />}
        </g>
      );
    }}
  </Shell>
);

export const Scene04 = () => (
  <Shell n={4} focus={{ maks: [460, 560], monster: [1420, 330], zina: [800, 520], galya: [260, 430] }}>
    {(t, d) => {
      const gi = mk(d, "galya_in");
      const attention = t > at(d, 8);
      const poke = mk(d, "poke");
      const cover = t < at(d, 1) + 1.5;
      const gx = -200 + 460 * ez(t, gi, gi + 0.7);
      return (
        <g>
          <Butchery t={t} door={1} fog={0.4} />
          <Monster x={1420} y={FLOOR} s={NS} t={t} pose={attention ? { armL: { sh: 2, el: 0 }, armR: { sh: -2, el: 0 }, head: -6, crouch: 0 } : cover ? { crouch: 0.3, armL: palmDown(reachM(-1, 1385, 270, 1420, 0.3)), armR: palmDown(reachM(1, 1450, 275, 1420, 0.3)), head: 14, guilty: 1 } : { crouch: 0.25, armL: reachM(-1, 1360, 640, 1420, 0.25), armR: reachM(1, 1480, 640, 1420, 0.25), behind: true, head: 10, guilty: 1 }} />
          <Maks x={460} t={t} look={0.9} itemL={<Flashlight on />} />
          <Person kind="zina" x={800} y={FLOOR} s={0.9} t={t} pose={{ armR: t > poke && t < at(d, 5) ? { sh: -95, el: -5 } : { sh: -40, el: -50 }, itemR: <Mop />, look: 0.9 }} />
          {t > gi && <Person kind="galya" x={gx} y={FLOOR} s={0.95} t={t} pose={{ armR: { sh: -92, el: -4 }, itemR: <Scanner beam={t > at(d, 8) ? 1 : 0} />, look: 0.9 }} />}
        </g>
      );
    }}
  </Shell>
);

export const Scene05 = () => (
  <Shell n={5} focus={{ maks: [330, 560], sveta: [1500, 470], monster: [1230, 330], mikhalych: [1010, 470], galya: [770, 430], tolyan: [1780, 450] }}>
    {(t, d) => {
      const sc = mk(d, "scan");
      return (
        <g>
          <Checkout t={t} />
          <Person kind="galya" x={770} y={FLOOR - 40} s={0.95} t={t} pose={{ armR: t > sc && t < sc + 1.2 ? { sh: -92, el: -4 } : { sh: -40, el: -40 }, itemR: <Scanner beam={t > sc && t < sc + 0.3 ? 0.4 : 0} />, look: 0.8 }} />
          <Person kind="oldman" x={1010} y={FLOOR} s={0.9} t={t} talk="mikhalych" pose={{ ...DOWN, look: -0.6 }} />
          <Monster x={1230} y={FLOOR} s={NS} t={t} pose={{ crouch: 0.15, armL: reachM(-1, 1150, 700, 1230, 0.15), gripL: 1, itemL: <Pelmeni />, armR: reachM(1, 1300, 720, 1230, 0.15), head: 8, happy: t > at(d, 6) ? 1 : 0 }} />
          <Person kind="mom" x={1460} y={FLOOR} s={0.9} t={t} talk="sveta" pose={{ ...DOWN, look: -0.7 }} />
          <Stroller x={1520} />
          <Person kind="tolyan" x={1790} y={FLOOR} s={0.92} t={t} pose={{ armL: { sh: 30, el: 40 }, look: -0.9 }} />
          <Maks x={330} t={t} look={0.8} />
        </g>
      );
    }}
  </Shell>
);

export const Scene06 = () => (
  <Shell n={6} focus={{ tolyan: [720, 450], roma: [1000, 440], petrovich: [1260, 470] }}>
    {(t, d) => {
      const sm = mk(d, "smash");
      const keys = t > mk(d, "keys");
      return (
        <g transform={shake(t, sm, sm + 0.6, 9)}>
          <Alcohol t={t} night={1} />
          <circle cx={760} cy={620} r={420} fill="url(#lighter)" />
          <defs><radialGradient id="lighter"><stop offset="0%" stopColor="#ffb347" stopOpacity={0.55} /><stop offset="100%" stopColor="#ffb347" stopOpacity={0} /></radialGradient></defs>
          <Person kind="tolyan" x={720} y={FLOOR} s={0.95} t={t} pose={{ armR: keys ? { sh: -150, el: -30 } : { sh: -70, el: -60 }, itemR: keys ? <g>{[0, 1, 2].map((i) => <rect key={i} x={-6 + i * 8} y={-30} width={6} height={30} fill="#d4a017" />)}</g> : <rect x={-8} y={-30} width={16} height={30} fill="#e63946" />, look: 0.5 }} />
          <Person kind="jock" x={1000} y={FLOOR} s={0.95} t={t} talk="roma" pose={{ ...DOWN, look: -0.5 }} />
          <Person kind="petrovich" x={1260} y={FLOOR} s={0.95} t={t} pose={{ armL: { sh: 50, el: 80 }, look: -0.6, scared: 0.4 }} />
          {t > sm && t < sm + 1.2 && Array.from({ length: 16 }, (_, i) => <path key={i} d={`M${900 + Math.cos(i) * 300 * ez(t, sm, sm + 0.6)} ${500 + Math.sin(i * 1.7) * 250 * ez(t, sm, sm + 0.6)} l18 -8 l-6 20 Z`} fill="#bfe9ff" />)}
          {t > sm && t < sm + 0.3 && <rect width={1920} height={1080} fill="#fff" opacity={0.6} />}
        </g>
      );
    }}
  </Shell>
);

/* ═══ АКТ 3 ═══ */
export const Scene07 = () => (
  <Shell n={7} focus={{ maks: [170, 560], lyokha: [1700, 450], galya: [330, 430], tolyan: [980, 150], zina: [520, 520] }}>
    {(t, d) => {
      const jar = mk(d, "jar");
      const k = ez(t, jar, jar + 0.6);
      return (
        <g>
          <Alcohol t={t} barricade={ez(t, 0, 0.8)} />
          <Person kind="tolyan" x={980} y={FLOOR} s={0.92} t={t} pose={{ lift: 360, armR: t < jar + 0.2 && t > jar - 0.4 ? up : { sh: -130, el: -50 }, itemR: <Bottle />, look: -0.6 }} />
          <path d="M930 280 h100 l-10 -60 h-80 Z" fill="#9aa0a8" {...OUT} transform="translate(0 0)" />
          {t > jar && k < 1 && <ellipse cx={980 - k * 640} cy={260 + k * 640 - Math.sin(k * Math.PI) * 200} rx={22} ry={30} fill="#7cb342" {...OUT} />}
          {k >= 1 && t < jar + 1.6 && Array.from({ length: 10 }, (_, i) => <path key={i} d={`M${340 + i * 12} ${FLOOR - 10} l10 -14 l8 14 Z`} fill="#9be7a0" />)}
          <Person kind="galya" x={330} y={FLOOR} s={0.95} t={t} pose={{ armR: { sh: -150, el: -40 }, itemR: <Megaphone />, look: 0.8, scared: k > 0.8 && t < jar + 1 ? 0.6 : 0 }} />
          <Person kind="zina" x={520} y={FLOOR} s={0.9} t={t} pose={{ armR: { sh: -60, el: -60 }, look: 0.8 }} />
          <Person kind="it" x={1700} y={FLOOR} s={0.9} t={t} talk="lyokha" pose={{ ...DOWN, look: -0.8 }} />
          <Maks x={170} t={t} look={0.8} />
        </g>
      );
    }}
  </Shell>
);

export const Scene08 = () => (
  <Shell n={8} focus={{ roma: [600, 440], tolyan: [980, 150], galya: [260, 430], monster: [460, 330], petrovich: [1300, 350] }}>
    {(t, d) => {
      const jk = mk(d, "jock");
      const mw = mk(d, "monster_walk");
      const rx = 120 + 480 * ez(t, jk, jk + 1.2);
      const tp = ez(t, jk + 1.0, jk + 1.6);
      const mx = -300 + 760 * ez(t, mw, mw + 1.8);
      return (
        <g>
          <Alcohol t={t} barricade={1} />
          <Person kind="petrovich" x={1300} y={FLOOR} s={0.92} t={t} pose={{ lift: 140, ...DOWN, look: -0.8, scared: t > mw ? 0.6 : 0 }} />
          <Person kind="tolyan" x={980} y={FLOOR} s={0.92} t={t} pose={{ lift: 360, armR: t > jk && t < at(d, 3) ? up : { sh: -130, el: -50 }, itemR: <Bottle />, look: -0.6, scared: t > at(d, 6) ? 0.8 : 0 }} />
          {t > mw && <Monster x={mx} y={FLOOR} s={NS} t={t} vest pose={{ armL: { sh: 6, el: 2 }, armR: { sh: -6, el: -2 }, head: -4 }} />}
          <Person kind="galya" x={260} y={FLOOR} s={0.95} t={t} pose={{ armR: { sh: -150, el: -70 }, itemR: <rect x={-10} y={-40} width={20} height={44} rx={4} fill="#111" />, look: 0.8 }} />
          {t < at(d, 3) + 2 && (
            <g>
              <Person kind="jock" x={rx} y={FLOOR} s={0.95} t={t} talk="roma" pose={{ armL: fwdL, armR: fwd, lean: 8 }} />
              {tp > 0 && Array.from({ length: 7 }, (_, i) => <ellipse key={i} cx={rx - 40 + (i % 3) * 40} cy={FLOOR - 200 - Math.floor(i / 3) * 160} rx={58 * tp} ry={40 * tp} fill="#f8f8f8" {...OUT} />)}
            </g>
          )}
        </g>
      );
    }}
  </Shell>
);

export const Scene09 = () => (
  <Shell n={9} focus={{ maks: [170, 560], tolyan: [760, 380], monster: [900, 300], petrovich: [1060, 380], sveta: [330, 470], mikhalych: [500, 470], galya: [1260, 430] }}>
    {(t, d) => {
      const cg = mk(d, "cage");
      const caged = t > cg + 0.6;
      const bob = Math.sin(t * 6) * 8;
      return (
        <g>
          <Checkout t={t} />
          <Person kind="mom" x={330} y={FLOOR} s={0.9} t={t} talk="sveta" pose={{ ...DOWN, look: 0.8 }} />
          <Person kind="oldman" x={500} y={FLOOR} s={0.88} t={t} talk="mikhalych" pose={{ ...DOWN, look: 0.8 }} />
          {/* клетка для тележек */}
          <g>
            <rect x={1360} y={520} width={360} height={480} fill="none" stroke="#9aa0a8" strokeWidth={10} />
            {Array.from({ length: 9 }, (_, i) => <line key={i} x1={1360 + i * 45} y1={520} x2={1360 + i * 45} y2={1000} stroke="#9aa0a8" strokeWidth={5} />)}
          </g>
          {!caged ? (
            <>
              <Person kind="tolyan" x={760} y={FLOOR} s={0.85} t={t} pose={{ lift: 280 + bob, armL: upL, armR: up, lean: Math.sin(t * 7) * 6, scared: 0.5 }} />
              <Person kind="petrovich" x={1060} y={FLOOR} s={0.85} t={t} pose={{ lift: 280 - bob, ...DOWN, lid: 0.7, lean: Math.sin(t * 5) * 4 }} />
              <Monster x={910} y={FLOOR} s={NS} t={t} vest pose={{ armL: reachM(-1, 770, 380, 910), gripL: 1, armR: reachM(1, 1050, 380, 910), gripR: 1, head: -2 }} />
            </>
          ) : (
            <>
              <Person kind="tolyan" x={1540} y={FLOOR} s={0.85} t={t} pose={{ armL: { sh: 60, el: 80 }, look: -0.6 }} />
              <rect x={1505} y={355} width={70} height={30} fill="#ffd60a" {...OUT} />
              <text x={1540} y={376} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={14} fill="#111">ШТРАФ</text>
              <Person kind="petrovich" x={1220} y={FLOOR} s={0.85} t={t} pose={{ ...DOWN, look: 0.6 }} />
              <Monster x={880} y={FLOOR} s={NS} t={t} vest pose={{ armL: { sh: 4, el: 2 }, armR: { sh: -4, el: -2 }, head: -4, happy: 1 }} />
              <Person kind="galya" x={1260} y={FLOOR} s={0.95} t={t} pose={{ armR: { sh: -80, el: -20 }, look: 0.8 }} />
            </>
          )}
          <Maks x={170} t={t} look={0.9} sip={t > at(d, 10) ? 1 : 0} />
        </g>
      );
    }}
  </Shell>
);

/* ═══ АКТ 4 ═══ */
export const Scene10 = () => (
  <Shell n={10} focus={{ maks: [380, 560], sveta: [1550, 470], lyokha: [900, 450], zina: [1150, 500], tolyan: [650, 450] }}>
    {(t, d) => {
      const rt = ez(t, mk(d, "rates"), mk(d, "rates") + 0.6);
      return (
        <g>
          <Camp t={t} cozy={1} rates={rt} />
          <Person kind="mom" x={1550} y={FLOOR} s={0.9} t={t} talk="sveta" pose={{ armR: { sh: -120, el: -30 }, look: -0.6 }} />
          <Person kind="tolyan" x={650} y={FLOOR} s={0.92} t={t} pose={{ armR: { sh: -60, el: -60 }, itemR: <g><ellipse cx={0} cy={-20} rx={34} ry={28} fill="#c1121f" {...OUT} /><path d="M30 -24 l26 -14" stroke="#c1121f" strokeWidth={8} /></g>, look: 0.6 }} />
          <Person kind="it" x={900} y={FLOOR} s={0.9} t={t} talk="lyokha" pose={{ armR: { sh: -80, el: -30 }, itemR: <rect x={-20} y={-30} width={40} height={50} fill="#2a9d8f" {...OUT} />, look: 0.8 }} />
          <Person kind="zina" x={1150} y={FLOOR} s={0.9} t={t} pose={{ armL: { sh: 80, el: 30 }, itemL: <g><rect x={-30} y={-80} width={60} height={90} rx={10} fill="rgba(160,220,140,.7)" {...OUT} /><ellipse cx={0} cy={-34} rx={12} ry={30} fill="#558b2f" /></g>, look: -0.8 }} />
          <Maks x={380} t={t} look={0.6} itemL={<g>{[0, 1, 2].map((i) => <circle key={i} cx={i * 14 - 14} cy={-10} r={9} fill="#d4a017" {...OUT} />)}</g>} />
        </g>
      );
    }}
  </Shell>
);

export const Scene11 = () => (
  <Shell n={11} focus={{ maks: [1080, 560], zina: [1260, 500], roma: [1460, 440], monster: [960, 420], galya: [560, 430], tolyan: [740, 450] }}>
    {(t, d) => {
      const cake = mk(d, "cake");
      const blow = mk(d, "blow");
      const rb = mk(d, "rumble");
      const scarf = ez(t, blow, blow + 1.2);
      return (
        <g transform={shake(t, rb, rb + 1.4, 4)}>
          <Camp t={t} cozy={1} party={1} night={0.6} />
          <Person kind="petrovich" x={180} y={FLOOR} s={0.85} t={t} pose={{ ...DOWN, look: 0.8 }} />
          <Person kind="it" x={360} y={FLOOR} s={0.85} t={t} talk="lyokha" pose={{ ...DOWN, look: 0.8 }} />
          <Person kind="galya" x={560} y={FLOOR} s={0.9} t={t} pose={{ ...DOWN, look: 0.8 }} />
          <Person kind="tolyan" x={740} y={FLOOR} s={0.9} t={t} pose={{ armR: t > at(d, 8) ? up : DOWN.armR, itemR: <AvMug t={t} />, look: 0.6 }} />
          <Monster x={960} y={FLOOR} s={NS} t={t} vest pose={{ crouch: 0.55, armL: reachM(-1, 880, 820, 960, 0.55), armR: reachM(1, 1040, 820, 960, 0.55), head: 6, happy: t > at(d, 9) ? 1 : 0 }} />
          {/* праздничный колпак */}
          <path d={`M928 ${FLOOR - 826} L960 ${FLOOR - 950} L992 ${FLOOR - 826} Z`} fill="#ef476f" {...OUT} transform="translate(0 0)" />
          {t > cake && (
            <g>
              <rect x={900} y={FLOOR - 120} width={120} height={70} rx={10} fill="#a0522d" {...OUT} />
              <rect x={900} y={FLOOR - 130} width={120} height={18} rx={8} fill="#fff3d6" {...OUT} />
              {t < blow + 0.2 && Array.from({ length: 8 }, (_, i) => <line key={i} x1={960} y1={FLOOR - 180} x2={960 + Math.cos(i + t * 20) * 30} y2={FLOOR - 180 + Math.sin(i + t * 20) * 30} stroke="#ffd166" strokeWidth={3} />)}
              <line x1={960} y1={FLOOR - 130} x2={960} y2={FLOOR - 180} stroke="#999" strokeWidth={3} />
            </g>
          )}
          <Maks x={1080} t={t} look={-0.6} />
          <Person kind="zina" x={1260} y={FLOOR} s={0.9} t={t} pose={{ ...DOWN, look: -0.7, scared: scarf > 0 && scarf < 1 ? 0.5 : 0 }} />
          {scarf > 0 && scarf < 1 && <path d={`M${1240 + scarf * 300} ${420 - scarf * 200} q40 -30 80 0 q-20 40 -80 0 Z`} fill="#d8d0c4" {...OUT} />}
          <Person kind="jock" x={1460} y={FLOOR} s={0.9} t={t} talk="roma" pose={{ armL: upL, armR: up, look: -0.7 }} />
          <Person kind="mom" x={1640} y={FLOOR} s={0.85} t={t} talk="sveta" pose={{ ...DOWN, look: -0.7 }} />
          {t > rb && <rect width={1920} height={1080} fill={Math.sin(t * 12) > 0 ? "#ff2a2a" : "#2a6aff"} opacity={0.12} />}
        </g>
      );
    }}
  </Shell>
);

/* ═══ АКТ 5 ═══ */
const Mchs = ({ t, x0, enter, flash = true, drop = 99 }: { t: number; x0: number; enter: number; flash?: boolean; drop?: number }) => (
  <>
    {[0, 1, 2].map((i) => {
      const x = x0 + i * 130 + (1 - ez(t, enter, enter + 1.0)) * 600;
      const dropped = i === 0 && t > drop;
      return <Person key={i} kind="mchs" x={x} y={FLOOR} s={0.95} t={t + i} talk={i === 0 ? "mchs" : "mchs_"} pose={{ armR: dropped ? DOWN.armR : { sh: -95, el: -5 }, itemR: dropped ? undefined : <Flashlight on={flash} />, look: -0.8, scared: dropped ? 0.7 : 0 }} />;
    })}
  </>
);

export const Scene12 = () => (
  <Shell n={12} focus={{ maks: [200, 560], mchs: [1500, 450], galya: [560, 430], monster: [320, 330] }}>
    {(t, d) => {
      const dig = mk(d, "dig");
      return (
        <g>
          <Checkout t={t} open={ez(t, dig, dig + 1.6)} ticker="КАССА №1 СВОБОДНА • СКИДКА НА БАХИЛЫ • СОТРУДНИК МЕСЯЦА — УЦЕНЁННЫЙ • " />
          <path d="M0 160 Q480 230 960 160 T1920 160" stroke="#222" strokeWidth={3} fill="none" />
          {Array.from({ length: 24 }, (_, i) => <circle key={i} cx={i * 82 + 20} cy={160 + Math.sin((i / 23) * Math.PI * 2) * 34 + 30} r={8} fill={["#ffd166", "#06d6a0", "#ef476f", "#118ab2"][i % 4]} opacity={0.6 + 0.4 * Math.sin(t * 4 + i)} />)}
          <Monster x={320} y={FLOOR - 20} s={NS} t={t} vest pose={{ armL: { sh: 4, el: 2 }, armR: reachM(1, 450, 640, 320), gripR: 1, itemR: <Scanner />, head: -2, happy: 1 }} />
          <Person kind="galya" x={560} y={FLOOR} s={0.95} t={t} pose={{ ...DOWN, look: 0.8 }} />
          <Person kind="tolyan" x={820} y={FLOOR} s={0.92} t={t} pose={{ armR: { sh: -60, el: -70 }, itemR: <AvMug t={t} />, look: 0.8 }} />
          <Mchs t={t} x0={1380} enter={dig + 1.0} drop={mk(d, "drop")} />
          <Maks x={160} t={t} look={0.9} />
        </g>
      );
    }}
  </Shell>
);

export const Scene13 = () => (
  <Shell n={13} focus={{ maks: [200, 560], mchs: [1500, 450], galya: [560, 430], lyokha: [1050, 450] }}>
    {(t, d) => (
      <g>
        <Checkout t={t} open={1} ticker="КАССА №1 СВОБОДНА • ИНВЕНТАРИЗАЦИЯ • НИКОГО НЕ ВЫПУСКАЕМ • " />
        <Monster x={320} y={FLOOR - 20} s={NS} t={t} vest pose={{ armL: { sh: 4, el: 2 }, armR: { sh: -4, el: -2 }, head: -2 }} />
        <Person kind="galya" x={560} y={FLOOR} s={0.95} t={t} pose={{ armR: { sh: -92, el: -4 }, itemR: <Scanner beam={t > at(d, 3) && t < end(d, 3) ? 0.3 : 0} />, look: 0.8 }} />
        <Person kind="it" x={1050} y={FLOOR} s={0.9} t={t} talk="lyokha" pose={{ ...DOWN, look: 0.8 }} />
        <Mchs t={t} x0={1380} enter={-5} />
        <Maks x={160} t={t} look={0.9} sip={ez(t, mk(d, "sip"), mk(d, "sip") + 0.3) * (1 - ez(t, at(d, 1) + 1, at(d, 1) + 1.3))} />
      </g>
    )}
  </Shell>
);

export const Scene14 = () => (
  <Shell n={14} focus={{ mchs: [1600, 450], zina: [900, 500], maks: [700, 560] }}>
    {(t, d) => {
      const home = mk(d, "home");
      if (t >= home) {
        return (
          <g>
            <Home />
            <Monster x={1300} y={FLOOR} s={NS} t={t} vest pose={{ crouch: 0.5, armL: reachM(-1, 1230, 760, 1300, 0.5), armR: reachM(1, 1370, 760, 1300, 0.5), gripL: 1, itemL: <g><ellipse cx={0} cy={0} rx={60} ry={40} fill="#9aa0a8" {...OUT} /><ellipse cx={0} cy={-20} rx={50} ry={14} fill="#f4ecd8" /></g>, head: 8, happy: 1 }} />
            <Maks x={700} t={t} look={0.9} sip={0.6} />
          </g>
        );
      }
      const walk = ez(t, 0, home) * 160;
      return (
        <g>
          <Checkout t={t} open={1} />
          <Person kind="tolyan" x={1060 + walk} y={FLOOR} s={0.92} t={t} pose={{ ...DOWN, look: -0.4 }} />
          <Monster x={860 + walk} y={FLOOR} s={NS} t={t} hat coat pose={{ crouch: 0.2, armL: { sh: 4, el: 2 }, armR: { sh: -4, el: -2 }, head: 12, guilty: 1 }} />
          <Person kind="zina" x={620 + walk} y={FLOOR} s={0.9} t={t} pose={{ ...DOWN, look: 0.8 }} />
          <Maks x={440 + walk} t={t} look={0.6} />
          <Person kind="mchs" x={1640} y={FLOOR} s={0.95} t={t} talk="mchs" pose={{ ...DOWN, look: -0.8 }} />
        </g>
      );
    }}
  </Shell>
);

/* ── 0: холодный хук-тизер — нарезка лучших моментов (их звук заглушён), поверх голос Макса и титул ── */
export const Scene00 = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const d = scene(0);
  const shots: { C: React.FC; n: number; mark: string }[] = [
    { C: Scene09, n: 9, mark: "carry" },
    { C: Scene07, n: 7, mark: "jar" },
    { C: Scene12, n: 12, mark: "drop" },
    { C: Scene14, n: 14, mark: "home" },
  ];
  const starts = [0, ...d.lines.slice(1).map((l) => Math.round((l.at - 0.15) * 30))];
  const tt = mk(d, "title");
  const k = ez(t, tt - 0.2, tt + 0.3);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <MuteCtx.Provider value={true}>
        {shots.map((s, i) => {
          const from = starts[i];
          const to = i < shots.length - 1 ? starts[i + 1] : d.frames;
          const off = Math.max(0, Math.round((mk(scene(s.n), s.mark) - 0.4) * 30));
          return (
            <Sequence key={i} from={from} durationInFrames={to - from}>
              <Sequence from={-off}><s.C /></Sequence>
            </Sequence>
          );
        })}
      </MuteCtx.Provider>
      <AbsoluteFill style={{ background: `rgba(0,0,0,${0.55 * k})` }} />
      <div style={{ position: "absolute", left: 0, width: 1920, top: 330, textAlign: "center", fontFamily: MONT, fontWeight: 900, fontSize: 132, lineHeight: 1.02, color: "#fff", WebkitTextStroke: "16px #000", paintOrder: "stroke fill", opacity: k, transform: `scale(${0.85 + 0.15 * k})` }}>
        ЗАПЕРТЫ В ГИПЕРМАРКЕТЕ
        <div style={{ color: "#ffd166", fontSize: 110 }}>30 ДНЕЙ</div>
      </div>
      <Shell n={0} focus={{}} bare>{() => null}</Shell>
    </AbsoluteFill>
  );
};

export const HYPER_SCENES = [Scene01, Scene02, Scene03, Scene04, Scene05, Scene06, Scene07, Scene08, Scene09, Scene10, Scene11, Scene12, Scene13, Scene14];
export { ICE_RIM };
