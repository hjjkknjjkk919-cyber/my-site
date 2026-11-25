import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { Outlines } from "@react-three/drei";
import * as THREE from "three";
import { clamp } from "../components/fx";
import { lamp } from "../train/lamp";
import { Box, CamRig, Dust, INK, makeCracks, makeTex, OL, rnd, useMats, useMonsterTexture, type Pose } from "../train/Pov3D";

/**
 * «Не открывай», серия 1 — 3D-прихожая старой квартиры.
 * Вся анимация от глобального времени серии g (секунды), чтобы флеш-форвард мог показать кадр из кульминации.
 */
const FPS = 30;
const W = 1080;
const H = 1920;
// холодный свет экрана телефона и тёплый грязно-жёлтый из кухни
const PHONE = "#b8dcff";
const WARM = "#d9a043";

// геометрия (метры): коридор вдоль −z, спальня у z=0, входная дверь на z=DOOR
const HW = 0.72;
const DOOR = -4.2;
const WR = { x: 0.43, z: -2.85, w: 0.56, len: 0.9, h: 2.1 }; // шкаф у правой стены
const WR_FRONT = WR.x - WR.w / 2; // фасад шкафа
const HINGE_Z = WR.z - WR.len / 2; // петля створки (ближе к двери)

export const T = {
  hallIn: 7.0,
  atDoor: 9.8,
  lockReach: 14.0,
  glance: 16.6,
  backToDoor: 20.6,
  cross: 23.6,
  retreat: 28.4,
  dolly: 30.0,
  fingers: 34.5,
  unison: 36.0,
  silence: 43.6,
  burst: 44.0,
  end: 49.75,
};

/** Обои: выцветшая полоска с мелким узором и потёками. */
export const makeWallpaper = () => {
  const S = 512;
  const c = document.createElement("canvas");
  c.width = S;
  c.height = S;
  const g = c.getContext("2d")!;
  g.fillStyle = "#7d7458";
  g.fillRect(0, 0, S, S);
  for (let x = 0; x < S; x += 64) {
    g.fillStyle = "rgba(60,52,36,.35)";
    g.fillRect(x, 0, 10, S);
    g.fillStyle = "rgba(160,150,110,.18)";
    g.fillRect(x + 26, 0, 4, S);
  }
  for (let i = 0; i < 90; i++) {
    const x = (i % 8) * 64 + 44;
    const y = Math.floor(i / 8) * 46 + ((i % 2) * 23);
    g.fillStyle = "rgba(90,70,45,.35)";
    g.beginPath();
    g.ellipse(x, y, 7, 10, 0.4, 0, Math.PI * 2);
    g.ellipse(x + 8, y - 6, 5, 7, -0.5, 0, Math.PI * 2);
    g.fill();
  }
  for (let i = 0; i < 40; i++) {
    g.fillStyle = `rgba(40,30,15,${0.04 + rnd(i + 3000) * 0.08})`;
    g.beginPath();
    g.ellipse(rnd(i + 3001) * S, rnd(i + 3002) * S, 20 + rnd(i + 3003) * 70, 30 + rnd(i + 3004) * 90, 0, 0, Math.PI * 2);
    g.fill();
  }
  for (let i = 0; i < 4000; i++) {
    g.fillStyle = `rgba(0,0,0,${rnd(i + 3100) * 0.1})`;
    g.fillRect(rnd(i + 3101) * S, rnd(i + 3102) * S, 1.5, 1.5);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(2.5, 1.5);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

/** Паркет «ёлочкой» с потёртостями. */
const makeParquet = () => {
  const S = 512;
  const c = document.createElement("canvas");
  c.width = S;
  c.height = S;
  const g = c.getContext("2d")!;
  g.fillStyle = "#5a3a22";
  g.fillRect(0, 0, S, S);
  for (let y = 0; y < S; y += 32)
    for (let x = 0; x < S; x += 128) {
      const o = (y / 32) % 2 ? 64 : 0;
      g.fillStyle = `rgba(${90 + rnd(x + y) * 40},${55 + rnd(x * 3 + y) * 25},${30 + rnd(x + y * 7) * 15},1)`;
      g.fillRect(x + o, y, 126, 30);
      g.strokeStyle = "rgba(20,10,5,.6)";
      g.strokeRect(x + o, y, 126, 30);
    }
  for (let i = 0; i < 3000; i++) {
    g.fillStyle = `rgba(0,0,0,${rnd(i + 3200) * 0.15})`;
    g.fillRect(rnd(i + 3201) * S, rnd(i + 3202) * S, 2, 1);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(1.5, 4);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

/** Дерматин входной двери: стёганые ромбы. */
const makeLeather = () => {
  const S = 256;
  const c = document.createElement("canvas");
  c.width = S;
  c.height = S;
  const g = c.getContext("2d")!;
  g.fillStyle = "#4a2a1c";
  g.fillRect(0, 0, S, S);
  g.strokeStyle = "rgba(15,6,3,.7)";
  g.lineWidth = 3;
  for (let k = -S; k < S * 2; k += 64) {
    g.beginPath();
    g.moveTo(k, 0);
    g.lineTo(k + S, S);
    g.moveTo(k, S);
    g.lineTo(k + S, 0);
    g.stroke();
  }
  for (let i = 0; i < 2000; i++) {
    g.fillStyle = `rgba(255,220,180,${rnd(i + 3300) * 0.05})`;
    g.fillRect(rnd(i + 3301) * S, rnd(i + 3302) * S, 2, 2);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(1.4, 3);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

const useHallMats = () =>
  useMemo(
    () => ({
      wall: new THREE.MeshStandardMaterial({ color: "#b8ad8c", roughness: 0.9, map: makeWallpaper() }),
      floor: new THREE.MeshStandardMaterial({ color: "#9a7a5a", roughness: 0.75, map: makeParquet() }),
      ceil: new THREE.MeshStandardMaterial({ color: "#8f8a7a", roughness: 1, map: makeTex("grime", 2, 4) }),
      wood: new THREE.MeshStandardMaterial({ color: "#6b4528", roughness: 0.65, map: makeTex("grime", 1, 2) }),
      woodDark: new THREE.MeshStandardMaterial({ color: "#3b2414", roughness: 0.7, map: makeTex("grime", 1, 2) }),
      leather: new THREE.MeshStandardMaterial({ color: "#7a4a33", roughness: 0.55, map: makeLeather() }),
      metal: new THREE.MeshStandardMaterial({ color: "#b9b2a0", roughness: 0.3, metalness: 0.8 }),
      brass: new THREE.MeshStandardMaterial({ color: "#c9a25a", roughness: 0.35, metalness: 0.85 }),
      coatA: new THREE.MeshStandardMaterial({ color: "#2f3a33", roughness: 0.95, map: makeTex("fabric", 1, 2) }),
      coatB: new THREE.MeshStandardMaterial({ color: "#5a4632", roughness: 0.95, map: makeTex("fabric", 1, 2) }),
      coatC: new THREE.MeshStandardMaterial({ color: "#2a2b38", roughness: 0.95, map: makeTex("fabric", 1, 2) }),
      black: new THREE.MeshStandardMaterial({ color: "#050403", roughness: 1 }),
      frosted: new THREE.MeshStandardMaterial({ color: "#e8c98a", emissive: new THREE.Color(WARM), emissiveIntensity: 0.9, roughness: 0.6, transparent: true, opacity: 0.92 }),
      skin: new THREE.MeshStandardMaterial({ color: "#cfc6b0", roughness: 0.8 }),
      plastic: new THREE.MeshStandardMaterial({ color: "#d8d2c0", roughness: 0.5 }),
    }),
    [],
  );
type HM = ReturnType<typeof useHallMats>;

// ── камера ───────────────────────────────────────────────────────────
type K = { t: number; x: number; y: number; z: number; yaw: number; pitch: number; fov: number };
const KEYS: K[] = [
  { t: 7.0, x: 0.05, y: 1.6, z: 0.55, yaw: 0.12, pitch: -0.06, fov: 70 },
  { t: 8.5, x: -0.05, y: 1.6, z: -1.7, yaw: -0.05, pitch: -0.03, fov: 68 },
  { t: 9.8, x: 0.02, y: 1.58, z: -3.62, yaw: 0, pitch: 0.0, fov: 66 },
  { t: 14.0, x: 0.1, y: 1.58, z: -3.3, yaw: 0.05, pitch: 0.02, fov: 66 },
  { t: 16.6, x: 0.1, y: 1.58, z: -3.38, yaw: 0.04, pitch: 0.0, fov: 66 },
  { t: 17.3, x: 0.02, y: 1.58, z: -3.55, yaw: -2.0, pitch: -0.08, fov: 64 },
  { t: 20.4, x: -0.02, y: 1.56, z: -3.45, yaw: -2.06, pitch: -0.06, fov: 60 },
  { t: 20.8, x: 0.02, y: 1.58, z: -3.58, yaw: 0, pitch: 0.02, fov: 64 },
  { t: 25.0, x: 0.02, y: 1.58, z: -3.55, yaw: 0, pitch: 0.02, fov: 64 },
  { t: 25.25, x: 0.0, y: 1.56, z: -3.5, yaw: -2.0, pitch: -0.05, fov: 62 },
  { t: 26.5, x: 0.0, y: 1.56, z: -3.45, yaw: -2.04, pitch: -0.05, fov: 60 },
  { t: 26.75, x: 0.0, y: 1.58, z: -3.4, yaw: -0.05, pitch: 0.02, fov: 64 },
  { t: 28.4, x: -0.05, y: 1.58, z: -3.2, yaw: -0.1, pitch: 0.0, fov: 62 },
  { t: 30.0, x: -0.38, y: 1.56, z: -0.75, yaw: -0.13, pitch: -0.03, fov: 55 },
  { t: 43.6, x: -0.4, y: 1.55, z: 0.5, yaw: -0.15, pitch: -0.03, fov: 42 },
  { t: 44.0, x: -0.4, y: 1.55, z: 0.5, yaw: -0.15, pitch: -0.03, fov: 42 },
];
const sm = (x: number) => x * x * (3 - 2 * x);
const keyAt = (g: number): K => {
  if (g <= KEYS[0].t) return KEYS[0];
  for (let i = 0; i < KEYS.length - 1; i++) {
    const a = KEYS[i];
    const b = KEYS[i + 1];
    if (g <= b.t) {
      const k = sm((g - a.t) / (b.t - a.t));
      const L = (p: keyof K) => (a[p] as number) + ((b[p] as number) - (a[p] as number)) * k;
      return { t: g, x: L("x"), y: L("y"), z: L("z"), yaw: L("yaw"), pitch: L("pitch"), fov: L("fov") };
    }
  }
  return KEYS[KEYS.length - 1];
};

// после удара: существо бросается из шкафа, камера отшатывается к стене
const burstK = (g: number) => clamp((g - T.burst) / 0.32);
export const hallPose = (g: number): Pose => {
  const k = keyAt(g);
  let { x, y, z, yaw, pitch } = k;
  // шаги на проходе
  const walk = g > T.hallIn && g < T.atDoor ? 1 : 0;
  const ph = (g - T.hallIn) * Math.PI * 2 * 1.9;
  y += walk * Math.abs(Math.sin(ph)) * 0.03;
  let roll = walk * Math.sin(ph / 2) * 0.012;
  // ручная камера
  x += Math.sin(g * 1.3) * 0.006;
  y += Math.sin(g * 1.9) * 0.004;
  yaw += Math.sin(g * 0.7) * 0.006;
  // завал горизонта во время перекрёстного допроса и дальше
  roll += (3.6 * Math.PI) / 180 * clamp((g - 23.4) / 0.6) * (1 - clamp((g - T.burst) / 0.3) * 0.4);
  // дрожь при рывках двери
  const rat = rattleK(g);
  x += Math.sin(g * 73) * 0.004 * rat;
  roll += Math.sin(g * 51) * 0.006 * rat;
  // скример: отшатывание и тряска
  if (g >= T.burst) {
    const b = g - T.burst;
    const sh = Math.exp(-b * 2.2) * (b < 4.5 ? 1 : 0.3);
    x += Math.sin(b * 67) * 0.03 * sh;
    y += Math.sin(b * 89) * 0.025 * sh - 0.05 * clamp(b / 0.3);
    z += 0.08 * clamp(b / 0.3);
    roll += Math.sin(b * 41) * 0.05 * sh;
    pitch += 0.06 * clamp(b / 0.3);
  }
  return { x, y, z, yaw, pitch, roll, yawVel: 0, fov: k.fov };
};

/** Рывки ручки и цепочки снаружи (0..1). */
export const rattleK = (g: number) => {
  const seg = (a: number, b: number) => (g > a && g < b ? Math.min(1, (g - a) / 0.1, (b - g) / 0.15) : 0);
  return Math.max(seg(33.0, 35.6), seg(38.3, 41.2), seg(42.0, 43.5));
};

// ── квартира ─────────────────────────────────────────────────────────
const Coat = ({ z, m, len = 1.05, sw }: { z: number; m: THREE.Material; len?: number; sw: number }) => (
  <group position={[-HW + 0.16, 1.78, z]} rotation={[sw, 0, 0]}>
    <mesh position={[0, -len / 2, 0]} castShadow receiveShadow material={m}>
      <capsuleGeometry args={[0.13, len - 0.26, 6, 12]} />
      <Outlines thickness={OL} color={INK} />
    </mesh>
    <mesh position={[0, -0.05, 0]} castShadow material={m}>
      <sphereGeometry args={[0.15, 12, 10]} />
    </mesh>
  </group>
);

const FrontDoor = ({ g, hm }: { g: number; hm: HM }) => {
  const rat = rattleK(g);
  // дверь открывается наружу: при рывке уходит на 1–2 см, цепочка натягивается
  const pull = rat * (0.012 + 0.012 * Math.abs(Math.sin(g * 23)));
  const handle = -rat * (0.35 + 0.25 * Math.sin(g * 31));
  const studs = useMemo(() => {
    const out: [number, number][] = [];
    for (let i = 0; i < 6; i++) for (let j = 0; j < 12; j++) out.push([-0.38 + i * 0.152, 0.12 + j * 0.165]);
    return out;
  }, []);
  return (
    <group>
      {/* коробка */}
      <Box p={[-0.5, 1.05, DOOR + 0.02]} s={[0.08, 2.15, 0.12]} m={hm.woodDark} ol />
      <Box p={[0.5, 1.05, DOOR + 0.02]} s={[0.08, 2.15, 0.12]} m={hm.woodDark} ol />
      <Box p={[0, 2.13, DOOR + 0.02]} s={[1.08, 0.08, 0.12]} m={hm.woodDark} ol />
      {/* полотно на левой петле */}
      <group position={[-0.45, 0, DOOR]} rotation={[0, -pull * 3, 0]}>
        <group position={[0.45, 0, 0]}>
          <Box p={[0, 1.03, 0]} s={[0.9, 2.06, 0.06]} m={hm.leather} ol />
          {studs.map(([x, y], i) => (
            <mesh key={i} position={[x, y, 0.035]} material={hm.brass}>
              <sphereGeometry args={[0.008, 6, 5]} />
            </mesh>
          ))}
          {/* глазок */}
          <mesh position={[0, 1.55, 0.035]} rotation={[Math.PI / 2, 0, 0]} material={hm.brass}>
            <cylinderGeometry args={[0.018, 0.02, 0.02, 16]} />
            <Outlines thickness={OL * 0.4} color={INK} />
          </mesh>
          <mesh position={[0, 1.55, 0.046]}>
            <circleGeometry args={[0.009, 16]} />
            <meshStandardMaterial color="#ffe3a0" emissive={new THREE.Color("#ffcf7a")} emissiveIntensity={1.2 * lamp(g + 3)} />
          </mesh>
          {/* замки */}
          {[1.32, 0.92].map((y) => (
            <group key={y}>
              <Box p={[0.33, y, 0.04]} s={[0.07, 0.14, 0.02]} m={hm.metal} ol />
              <mesh position={[0.33, y, 0.055]} rotation={[Math.PI / 2, 0, 0]} material={hm.brass}>
                <cylinderGeometry args={[0.014, 0.014, 0.02, 12]} />
              </mesh>
            </group>
          ))}
          {/* ручка-нажим */}
          <group position={[0.33, 1.08, 0.06]} rotation={[0, 0, handle]}>
            <Box p={[-0.06, 0, 0.02]} s={[0.13, 0.025, 0.03]} m={hm.metal} ol />
          </group>
        </group>
      </group>
      {/* цепочка: планка на коробке и звенья до двери */}
      <Box p={[0.5, 1.42, DOOR + 0.09]} s={[0.03, 0.12, 0.02]} m={hm.brass} ol />
      {Array.from({ length: 7 }, (_, i) => {
        const k = i / 6;
        const sag = (1 - rat) * Math.sin(k * Math.PI) * 0.05;
        const jit = rat * Math.sin(g * 47 + i) * 0.004;
        return (
          <mesh key={i} position={[0.48 - k * 0.2, 1.42 - sag + jit, DOOR + 0.1 - k * 0.01]} rotation={[Math.PI / 2, i % 2 ? Math.PI / 2 : 0, 0.1]} material={hm.brass} castShadow>
            <torusGeometry args={[0.012, 0.003, 6, 12]} />
          </mesh>
        );
      })}
    </group>
  );
};

/** Длинные суставчатые пальцы из щели шкафа (ползут по краю створки). */
const Fingers = ({ g, hm }: { g: number; hm: HM }) => {
  const k = clamp((g - T.fingers) / 1.4);
  if (k <= 0 || g >= T.burst) return null;
  return (
    <group position={[WR_FRONT - 0.01, 1.42, HINGE_Z + 0.43]} scale={3.2}>
      {[0, 1, 2, 3].map((i) => {
        const y = 0.12 - i * 0.07;
        const reach = (0.08 + k * 0.1) * (1 - i * 0.08);
        const curl = 0.5 + k * 0.5 + Math.sin(g * 6 + i) * 0.05;
        return (
          <group key={i} position={[0, y, 0]} rotation={[0, 0, 0]}>
            {/* фаланги: из щели наружу и загибаются на фасад */}
            <mesh position={[-reach / 2, 0, -0.01]} rotation={[0, 0, Math.PI / 2]} material={hm.skin} castShadow>
              <capsuleGeometry args={[0.009, reach, 4, 8]} />
              <Outlines thickness={OL * 0.4} color={INK} />
            </mesh>
            <group position={[-reach, 0, -0.01]} rotation={[0, -curl, 0]}>
              <mesh position={[0, 0, -0.035]} rotation={[Math.PI / 2, 0, 0]} material={hm.skin} castShadow>
                <capsuleGeometry args={[0.008, 0.05, 4, 8]} />
                <Outlines thickness={OL * 0.4} color={INK} />
              </mesh>
              <mesh position={[0, 0, -0.07]} rotation={[Math.PI / 2, 0, 0]} material={hm.black}>
                <coneGeometry args={[0.006, 0.025, 6]} />
              </mesh>
            </group>
          </group>
        );
      })}
    </group>
  );
};

const Wardrobe = ({ g, hm }: { g: number; hm: HM }) => {
  // створка: закрыта → щель 3 см со скрипом → распахивается на скримере
  const ajar = g < T.glance ? 0 : g < T.burst ? 0.07 * clamp((g - T.glance) / 0.6) + (g > T.fingers ? 0.05 * clamp((g - T.fingers) / 1.4) : 0) : 0.12 + 1.75 * sm(clamp((g - T.burst) / 0.15));
  return (
    <group>
      {/* корпус */}
      <Box p={[WR.x + 0.02, WR.h / 2, WR.z]} s={[WR.w - 0.04, WR.h, WR.len]} m={hm.wood} ol />
      <Box p={[WR.x, WR.h + 0.03, WR.z]} s={[WR.w + 0.04, 0.06, WR.len + 0.06]} m={hm.woodDark} ol />
      {/* тёмное нутро за фасадом */}
      <Box p={[WR_FRONT + 0.03, WR.h / 2, WR.z]} s={[0.01, WR.h - 0.1, WR.len - 0.06]} m={hm.black} cast={false} />
      {/* неподвижная левая створка */}
      <Box p={[WR_FRONT - 0.012, WR.h / 2, WR.z + WR.len / 4]} s={[0.022, WR.h - 0.08, WR.len / 2 - 0.01]} m={hm.wood} ol />
      <Box p={[WR_FRONT - 0.03, 1.1, WR.z + 0.04]} s={[0.02, 0.12, 0.02]} m={hm.brass} />
      {/* правая створка на петле у двери */}
      <group position={[WR_FRONT - 0.012, 0, HINGE_Z]} rotation={[0, -ajar, 0]}>
        <Box p={[0, WR.h / 2, WR.len / 4]} s={[0.022, WR.h - 0.08, WR.len / 2 - 0.01]} m={hm.wood} ol />
        <Box p={[-0.018, 1.1, WR.len / 2 - 0.05]} s={[0.02, 0.12, 0.02]} m={hm.brass} />
      </group>
      <Fingers g={g} hm={hm} />
    </group>
  );
};

const Apartment = ({ g, hm, m }: { g: number; hm: HM; m: ReturnType<typeof useMats> }) => {
  const sw = Math.sin(g * 0.9) * 0.015 + rattleK(g) * Math.sin(g * 19) * 0.02;
  return (
    <group>
      {/* пол, потолок, стены */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -2]} receiveShadow material={hm.floor}>
        <planeGeometry args={[HW * 2, 6.5]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 2.6, -2]} material={hm.ceil}>
        <planeGeometry args={[HW * 2, 6.5]} />
      </mesh>
      <Box p={[-HW - 0.03, 1.3, -2]} s={[0.06, 2.6, 6.5]} m={hm.wall} cast={false} />
      <Box p={[HW + 0.03, 1.3, -2]} s={[0.06, 2.6, 6.5]} m={hm.wall} cast={false} />
      <Box p={[0, 1.3, DOOR - 0.06]} s={[HW * 2, 2.6, 0.06]} m={hm.wall} cast={false} />
      {/* плинтусы */}
      {[-1, 1].map((sd) => (
        <Box key={sd} p={[sd * (HW - 0.01), 0.04, -2]} s={[0.02, 0.08, 6.5]} m={hm.woodDark} cast={false} ol />
      ))}
      {/* дверной проём спальни (камера стартует из него) */}
      <Box p={[-0.62, 1.3, 0]} s={[0.2, 2.6, 0.12]} m={hm.wall} ol />
      <Box p={[0.62, 1.3, 0]} s={[0.2, 2.6, 0.12]} m={hm.wall} ol />
      <Box p={[0, 2.35, 0]} s={[1.4, 0.5, 0.12]} m={hm.wall} ol />
      <Box p={[-0.5, 1.05, 0.0]} s={[0.05, 2.1, 0.14]} m={hm.woodDark} ol />
      <Box p={[0.5, 1.05, 0.0]} s={[0.05, 2.1, 0.14]} m={hm.woodDark} ol />
      {/* спальня за спиной — темнота с кроватью */}
      <Box p={[0, 1.3, 2.6]} s={[3, 2.6, 0.06]} m={hm.wall} cast={false} />
      <Box p={[0.6, 0.25, 1.6]} s={[1.4, 0.5, 2]} m={hm.coatC} cast={false} />
      {/* кухонная дверь с матовым стеклом на левой стене — источник тёплого клина */}
      <Box p={[-HW + 0.01, 1.03, -1.15]} s={[0.05, 2.06, 0.8]} m={hm.woodDark} ol />
      <mesh position={[-HW + 0.04, 1.35, -1.15]} rotation={[0, Math.PI / 2, 0]} material={hm.frosted}>
        <planeGeometry args={[0.5, 1.0]} />
      </mesh>
      {/* вешалка с пальто */}
      <Box p={[-HW + 0.06, 1.8, -2.35]} s={[0.04, 0.05, 1.0]} m={hm.woodDark} ol />
      {[[-1.98, hm.coatA, 1.05], [-2.25, hm.coatB, 0.95], [-2.55, hm.coatC, 1.1], [-2.78, hm.coatA, 0.85]].map(([z, mat, len], i) => (
        <Coat key={i} z={z as number} m={mat as THREE.Material} len={len as number} sw={sw * (i % 2 ? -1 : 1)} />
      ))}
      {/* обувница и ботинки */}
      <Box p={[-HW + 0.18, 0.22, -3.55]} s={[0.32, 0.44, 0.8]} m={hm.wood} ol />
      {[-3.4, -3.7].map((z) => (
        <Box key={z} p={[-HW + 0.2, 0.5, z]} s={[0.12, 0.1, 0.26]} m={hm.black} ol />
      ))}
      {/* выключатель и свисающий провод */}
      <Box p={[-HW + 0.01, 1.3, -3.95]} s={[0.02, 0.1, 0.07]} m={hm.plastic} ol />
      <mesh position={[0, 2.35, -2.3]} material={hm.black}>
        <cylinderGeometry args={[0.005, 0.005, 0.5, 6]} />
      </mesh>
      <mesh position={[0, 2.08, -2.3]} material={hm.plastic}>
        <sphereGeometry args={[0.05, 12, 10]} />
        <Outlines thickness={OL * 0.5} color={INK} />
      </mesh>
      <FrontDoor g={g} hm={hm} />
      <Wardrobe g={g} hm={hm} />
      <Dust u={g} cz={-1.2} />
      {/* (материалы вагона не нужны — m оставлен для общих частей) */}
      {m ? null : null}
    </group>
  );
};

// ── существо ─────────────────────────────────────────────────────────
/** Поза существа: внутри шкафа → бросок к камере → вплотную (как во флеш-форварде). */
const Creature = ({ g, pose, monster }: { g: number; pose: Pose; monster: THREE.Texture | null }) => {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ transparent: true, alphaTest: 0.02, roughness: 0.85, color: "#bfb39a", emissive: new THREE.Color("#ffffff"), emissiveIntensity: 0.14 }), []);
  const glint = useMemo(() => new THREE.SpriteMaterial({ map: makeTex("glow"), color: "#ffe9b8", blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }), []);
  if (monster && mat.map !== monster) {
    mat.map = monster;
    mat.emissiveMap = monster;
    mat.needsUpdate = true;
  }
  // глаз в щели шкафа (до скримера)
  const eyeOn = g > 25.0 && g < T.burst;
  if (g < T.burst) {
    glint.opacity = 0.75 + 0.25 * Math.sin(g * 5);
    return eyeOn ? <sprite position={[WR_FRONT + 0.04, 1.62, HINGE_Z + 0.04]} scale={[0.03, 0.03, 1]} material={glint} /> : null;
  }
  const b = burstK(g);
  // точка вплотную перед камерой
  const dir = new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(pose.pitch, pose.yaw, 0, "YXZ"));
  const near = new THREE.Vector3(pose.x, pose.y, pose.z).add(dir.multiplyScalar(0.95));
  const from = new THREE.Vector3(WR.x - 0.1, 1.15, WR.z);
  const p = from.lerp(near, b);
  p.y += -0.17 * b + Math.sin(g * 37) * 0.01 * b;
  const yaw = pose.yaw + (1 - b) * -1.2;
  glint.opacity = 0.9;
  return (
    <group position={[p.x, p.y, p.z]} rotation={[0, yaw, Math.sin(g * 9) * 0.04]} scale={0.42 + (1 - b) * 0.3}>
      <mesh material={mat}>
        <planeGeometry args={[1.65, 2.93]} />
      </mesh>
      {[
        [-0.2166, 0.4816],
        [0.0102, 0.4993],
      ].map(([x, y], i) => (
        <sprite key={i} position={[x, y, 0.01]} scale={[0.03, 0.03, 1]} material={glint} />
      ))}
    </group>
  );
};

// ── свет ─────────────────────────────────────────────────────────────
const Lights = ({ g, pose }: { g: number; pose: Pose }) => {
  const tgt = useMemo(() => new THREE.Object3D(), []);
  tgt.position.set(0.6, 0.4, -3.3);
  tgt.updateMatrixWorld();
  const warmK = 0.85 + 0.15 * lamp(g + 11);
  // телефон в руке до глазка и когда отступает к стене — холодный свет снизу-спереди
  const phoneOn = g > T.hallIn && g < 10.2 ? 1 : g < T.burst + 0.2 ? 0.7 : 0.35;
  const dir = new THREE.Vector3(0, -0.45, -0.35).applyEuler(new THREE.Euler(0, pose.yaw, 0));
  const flash = g >= T.burst && g < T.burst + 0.25 ? 1 - (g - T.burst) / 0.25 : 0;
  return (
    <>
      <ambientLight color="#8a7a55" intensity={0.03} />
      <hemisphereLight args={["#3a3428", "#000000", 0.06]} />
      {/* тёплый клин из кухни через матовое стекло: длинные тени от вешалки и шкафа */}
      <primitive object={tgt} />
      <spotLight position={[-0.6, 1.5, -1.15]} target={tgt} color={WARM} intensity={32 * warmK} angle={0.62} penumbra={0.4} distance={7} decay={1.5} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-bias={-0.0004} />
      <pointLight position={[-0.5, 1.4, -1.15]} color={WARM} intensity={2.6 * warmK} distance={2.6} decay={1.8} />
      {/* лампочка в подъезде через глазок и щель под дверью */}
      <pointLight position={[0, 0.05, DOOR + 0.08]} color="#ffcf7a" intensity={1.6 * lamp(g + 3)} distance={1.4} decay={2} />
      <pointLight position={[WR_FRONT - 0.35, 1.6, HINGE_Z + 0.5]} color="#d8cdb0" intensity={g > T.fingers && g < T.burst ? 1.4 * clamp((g - T.fingers) / 1.2) : 0} distance={1.2} decay={2} />
      <pointLight position={[0.3, 1.5, DOOR + 0.5]} color={WARM} intensity={1.8 * (0.6 + 0.4 * rattleK(g))} distance={1.6} decay={2} />
      {/* экран телефона */}
      <pointLight position={[pose.x + dir.x, pose.y + dir.y, pose.z + dir.z]} color={PHONE} intensity={7 * phoneOn} distance={4.5} decay={1.5} />
      {flash > 0 && <pointLight position={[pose.x, pose.y + 0.3, pose.z - 0.5]} color="#fff1d0" intensity={6 * flash} distance={4} decay={1.5} />}
    </>
  );
};

const HallScene = ({ g, pose, monster }: { g: number; pose: Pose; monster: THREE.Texture | null }) => {
  const m = useMats();
  const hm = useHallMats();
  return (
    <>
      <CamRig pose={pose} />
      <color attach="background" args={["#000"]} />
      <fog attach="fog" args={["#030302", 2.5, 9]} />
      <Lights g={g} pose={pose} />
      <Apartment g={g} hm={hm} m={m} />
      <Creature g={g} pose={pose} monster={monster} />
    </>
  );
};

/** Трещины и тёмные брызги на «линзе» после броска. */
const LensHit = ({ g }: { g: number }) => {
  const k = clamp((g - T.burst - 0.28) / 0.1);
  if (k <= 0) return null;
  return (
    <AbsoluteFill style={{ opacity: k, pointerEvents: "none" }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {Array.from({ length: 14 }, (_, i) => {
          const a = (i / 14) * Math.PI * 2 + rnd(i + 4000) * 0.4;
          let x = 610;
          let y = 760;
          let d = `M${x} ${y}`;
          for (let s = 0; s < 6; s++) {
            const an = a + (rnd(i * 9 + s + 4001) - 0.5) * 0.7;
            const len = 40 + rnd(i * 9 + s + 4002) * 90;
            x += Math.cos(an) * len;
            y += Math.sin(an) * len;
            d += ` L${x.toFixed(0)} ${y.toFixed(0)}`;
          }
          return <path key={i} d={d} stroke="rgba(235,230,215,.75)" strokeWidth="2.5" fill="none" />;
        })}
        {Array.from({ length: 22 }, (_, i) => (
          <ellipse key={i} cx={380 + rnd(i + 4100) * 520} cy={520 + rnd(i + 4101) * 700} rx={6 + rnd(i + 4102) * 26} ry={5 + rnd(i + 4103) * 18} fill="rgba(45,6,8,.8)" />
        ))}
        {Array.from({ length: 5 }, (_, i) => {
          const x = 440 + i * 90 + rnd(i + 4200) * 30;
          return <path key={i} d={`M${x} ${700 + rnd(i + 4201) * 80} C${x + 6} 900 ${x - 6} 1050 ${x + 3} ${1100 + rnd(i + 4202) * 200}`} stroke="rgba(50,8,10,.75)" strokeWidth={8 + rnd(i + 4203) * 8} fill="none" strokeLinecap="round" />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

/** 3D-прихожая. timeAt переводит кадр сцены во «время серии» (для флеш-форварда — замедленный кусок скримера). */
export const Hall3D = ({ timeAt }: { timeAt: (localSec: number) => number }) => {
  const frame = useCurrentFrame();
  const g = timeAt(frame / FPS);
  const pose = hallPose(g);
  const monster = useMonsterTexture();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <ThreeCanvas width={W} height={H} shadows="soft" dpr={1.5} gl={{ antialias: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.35, preserveDrawingBuffer: true }}>
        <HallScene g={g} pose={pose} monster={monster} />
      </ThreeCanvas>
      <LensHit g={g} />
    </AbsoluteFill>
  );
};

export { makeCracks };
