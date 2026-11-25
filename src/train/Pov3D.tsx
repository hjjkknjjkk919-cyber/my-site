import React, { useEffect, useMemo, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from "remotion";
import { CreatureGlass } from "./Creature2";
import { DimaFace } from "./GostOld";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { SpotLight, Outlines } from "@react-three/drei";
import * as THREE from "three";
import { clamp, ease } from "../components/fx";
import { lamp } from "./lamp";
import { flickerOn } from "./Ep1Test";

/**
 * 00:37–01:06 одним непрерывным POV в настоящем 3D (Three.js):
 * подъём с сиденья → проход → оглядка назад на 180° → дошёл до двери → свет в соседнем вагоне гаснет → вспышки с существом.
 * Вся анимация — только от useCurrentFrame(), без useFrame/часов, чтобы рендер был детерминированным.
 */
const FPS = 30;
const W = 1080;
const H = 1920;
const FOV = 74;
// грязно-жёлтый свет старых люминесцентных ламп
// грязно-жёлтый тусклый свет старых люминесцентных ламп
const LAMP = "#e6c27a";
const LAMP_EMIT = "#d9b062";
// погасшие плафоны нашего вагона (индексы от заднего торца): свет бьёт пятнами
const DEAD = [1, 3, 5];

// геометрия вагона (метры)
const CAR_L = 20;
const HW = 1.45; // полуширина
const DOOR_Z = -20; // передняя торцевая дверь нашего вагона
const NEXT_Z = -21.1; // задний торец соседнего вагона

/** Лампа «подмигивает» в ключевые моменты: два быстрых провала (≈0.3 с). Под каждый ставится треск. */
export const BLINK_WALK = [5.75, 7.35]; // разворот назад и обратно (локальное время прохода)
export const BLINK_STATION = [4.55]; // силуэт в отражении
export const blink = (u: number, at: number[]) => {
  for (const b of at) {
    const k = u - b;
    if (k < 0 || k > 0.3) continue;
    if (k < 0.06 || (k > 0.12 && k < 0.22)) return 0.12;
    return 0.85;
  }
  return 1;
};

// ── хореография камеры ────────────────────────────────────────────────
const T_STAND = 2.0;
const T_TURN0 = 5.3; // 42.3 «Позади…»
const T_TURN1 = 6.4;
const T_HOLD1 = 7.3; // 0.9 с на пустом проходе
const T_BACK1 = 8.2;
const T_ARRIVE = 12.5; // ≈ 49.5
export const T_LIGHTS_OFF = 14.5; // 51.5
export const T_WATCH = 19; // 56.0
const SPEED = 1.3;

const speedAt = (u: number) => {
  const a = ease(u, 1.6, 2.3, 0, 1) * (1 - ease(u, 4.7, T_TURN0 + 0.3, 0, 1));
  const b = ease(u, T_HOLD1 + 0.6, T_BACK1 + 0.4, 0, 1) * (1 - ease(u, T_ARRIVE - 0.8, T_ARRIVE, 0, 1));
  return SPEED * Math.max(a, b);
};
const DT = 1 / 120;
const distTable = (() => {
  const out: number[] = [0];
  let s = 0;
  for (let i = 1; i <= 30 * 120; i++) {
    s += speedAt(i * DT) * DT;
    out.push(s);
  }
  return out;
})();
const dist = (u: number) => distTable[Math.min(distTable.length - 1, Math.max(0, Math.round(u / DT)))];
const TOTAL = dist(T_ARRIVE + 1);
const Z_END = DOOR_Z + 1.55;

const smooth = (x: number) => x * x * (3 - 2 * x);

/** Моменты, когда в соседнем вагоне вспыхивает свет (для отшатывания и дрожи). */
const flashOnsets = (() => {
  const out: number[] = [];
  for (let f = 1; f < 10 * FPS; f++) if (flickerOn(f) && !flickerOn(f - 1)) out.push(f / FPS);
  return out;
})();

export type Pose = { x: number; y: number; z: number; yaw: number; pitch: number; roll: number; yawVel: number };

export const poseAt = (u: number): Pose => {
  const s = dist(u);
  const z = Z_END + (TOTAL - s);
  // подъём: из-за сиденья в проход, вверх, лёгкий наклон от опоры рукой
  const rise = smooth(clamp((u - 0.25) / 1.6));
  const slide = smooth(clamp((u - 0.5) / 1.6));
  let x = -0.8 * (1 - slide);
  let y = 1.15 + 0.53 * rise;
  let roll = Math.sin(clamp(u / 1.9) * Math.PI) * 3.2;
  let pitch = -0.22 * (1 - rise) - Math.sin(clamp(u / 1.9) * Math.PI) * 0.08;
  let yaw = -0.5 * (1 - slide);
  // шаги: покачивание ±10px (≈0.012 рад по тангажу + 2.5 см по высоте) и крен ±0.7°
  const stepPh = (s / 0.72) * Math.PI;
  const moving = clamp(speedAt(u) / SPEED);
  y += Math.abs(Math.sin(stepPh)) * 0.025 * moving - 0.012 * moving;
  roll += Math.sin(stepPh) * 0.7 * moving;
  x += Math.sin(stepPh) * 0.02 * moving;
  // оглядка на 180° внутри POV
  const turnOut = smooth(clamp((u - T_TURN0) / (T_TURN1 - T_TURN0)));
  const turnIn = smooth(clamp((u - T_HOLD1) / (T_BACK1 - T_HOLD1)));
  yaw += Math.PI * (turnOut - turnIn);
  const yawVel = (Math.PI * (smooth(clamp((u + 0.02 - T_TURN0) / 1.1)) - smooth(clamp((u - 0.02 - T_TURN0) / 1.1)) + smooth(clamp((u + 0.02 - T_HOLD1) / 0.9)) - smooth(clamp((u - 0.02 - T_HOLD1) / 0.9)))) / 0.04;
  // у двери: взгляд в стекло, медленный наезд и отшатывания на вспышках
  const atDoor = ease(u, T_ARRIVE - 1, T_ARRIVE + 0.5, 0, 1);
  pitch += -0.07 * atDoor;
  let zz = z;
  if (u >= T_WATCH) {
    const w = u - T_WATCH;
    zz -= ease(w, 0, 9, 0, 0.45);
    const last = flashOnsets.filter((o) => o <= w).pop();
    if (last !== undefined) {
      const k = w - last;
      const recoil = Math.exp(-k * 5) * (1 - Math.exp(-k * 40));
      zz += recoil * 0.14;
      const sh = Math.exp(-k * 9);
      x += Math.sin(w * 97) * 0.012 * sh;
      y += Math.sin(w * 131) * 0.01 * sh;
      roll += Math.sin(w * 83) * 1.2 * sh;
    }
  }
  // лёгкая качка поезда
  roll += Math.sin((u / 1.4) * Math.PI * 2) * 0.35;
  y += Math.sin(u * 2 * Math.PI / 0.9) * 0.003;
  return { x, y, z: zz, yaw, pitch, roll: (roll * Math.PI) / 180, yawVel };
};

const applyPose = (cam: THREE.PerspectiveCamera, p: Pose) => {
  cam.position.set(p.x, p.y, p.z);
  cam.rotation.set(p.pitch, p.yaw, p.roll, "YXZ");
  cam.updateMatrixWorld(true);
};

const CamRig = ({ pose }: { pose: Pose }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  camera.fov = FOV;
  camera.near = 0.03;
  camera.far = 60;
  camera.updateProjectionMatrix();
  applyPose(camera, pose);
  return null;
};

// ── процедурные текстуры (детерминированные) ─────────────────────────
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const makeTex = (kind: "grime" | "fabric" | "glow", rx = 1, ry = 1) => {
  const S = 256;
  const c = document.createElement("canvas");
  c.width = S;
  c.height = S;
  const g = c.getContext("2d")!;
  if (kind === "glow") {
    const gr = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    gr.addColorStop(0, "rgba(255,255,255,1)");
    gr.addColorStop(0.25, "rgba(255,255,255,.45)");
    gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, S, S);
  } else {
    g.fillStyle = "#fff";
    g.fillRect(0, 0, S, S);
    // пятна грязи
    for (let i = 0; i < (kind === "grime" ? 70 : 30); i++) {
      g.fillStyle = `rgba(60,45,25,${0.02 + rnd(i) * 0.05})`;
      g.beginPath();
      g.ellipse(rnd(i + 1) * S, rnd(i + 2) * S, 6 + rnd(i + 3) * 40, 4 + rnd(i + 4) * 30, rnd(i + 5) * 3, 0, Math.PI * 2);
      g.fill();
    }
    // зерно
    for (let i = 0; i < 5000; i++) {
      g.fillStyle = `rgba(0,0,0,${rnd(i + 99) * 0.12})`;
      g.fillRect(rnd(i + 7) * S, rnd(i + 13) * S, 1.5, 1.5);
    }
    if (kind === "grime") {
      // царапины и потёки
      g.strokeStyle = "rgba(30,25,15,.18)";
      for (let i = 0; i < 40; i++) {
        g.lineWidth = 0.6 + rnd(i + 50);
        g.beginPath();
        const x = rnd(i + 21) * S;
        const y = rnd(i + 22) * S;
        g.moveTo(x, y);
        g.lineTo(x + (rnd(i + 23) - 0.5) * 60, y + (rnd(i + 24) - 0.3) * 40);
        g.stroke();
      }
    } else {
      // переплетение обивки
      g.strokeStyle = "rgba(0,0,0,.08)";
      for (let i = 0; i < S; i += 4) {
        g.beginPath();
        g.moveTo(0, i);
        g.lineTo(S, i);
        g.stroke();
      }
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

/** Грязное стекло: прозрачное, с разводами, пылью и потёками (RGBA). */
const makeDirtyGlass = () => {
  const S = 512;
  const c = document.createElement("canvas");
  c.width = S;
  c.height = S;
  const g = c.getContext("2d")!;
  g.fillStyle = "rgba(190,180,150,0.06)";
  g.fillRect(0, 0, S, S);
  for (let i = 0; i < 60; i++) {
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, 1);
    gr.addColorStop(0, `rgba(205,195,165,${0.05 + rnd(i + 300) * 0.08})`);
    gr.addColorStop(1, "rgba(205,195,165,0)");
    g.save();
    g.translate(rnd(i + 301) * S, rnd(i + 302) * S);
    g.scale(20 + rnd(i + 303) * 90, 12 + rnd(i + 304) * 60);
    g.fillStyle = gr;
    g.beginPath();
    g.arc(0, 0, 1, 0, Math.PI * 2);
    g.fill();
    g.restore();
  }
  // пыль у нижнего края и потёки
  for (let i = 0; i < 2500; i++) {
    const y = S - Math.pow(rnd(i + 400), 2.2) * S;
    g.fillStyle = `rgba(215,205,175,${rnd(i + 401) * 0.22})`;
    g.fillRect(rnd(i + 402) * S, y, 1.6, 1.6);
  }
  g.strokeStyle = "rgba(200,190,160,.12)";
  for (let i = 0; i < 14; i++) {
    g.lineWidth = 2 + rnd(i + 500) * 4;
    const x = rnd(i + 501) * S;
    g.beginPath();
    g.moveTo(x, rnd(i + 502) * S * 0.5);
    g.bezierCurveTo(x + 6, S * 0.6, x - 6, S * 0.8, x + 3, S);
    g.stroke();
  }
  // отпечаток ладони
  g.fillStyle = "rgba(210,200,170,.1)";
  g.beginPath();
  g.ellipse(S * 0.68, S * 0.42, 46, 60, 0.2, 0, Math.PI * 2);
  g.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

/** SVG-элемент → CanvasTexture (рендер ждёт загрузки). mask — мягкие края по альфе. */
const useSvgTexture = (label: string, el: React.ReactElement, mask: boolean) => {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  const [handle] = useState(() => delayRender(label));
  useEffect(() => {
    const svg = renderToStaticMarkup(
      <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
        {el}
      </svg>,
    );
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = 1080;
      c.height = 1920;
      const g = c.getContext("2d")!;
      g.drawImage(img, 0, 0);
      if (mask) {
        // мягкая альфа-маска по краям, чтобы не читалась прямая граница полигона
        g.globalCompositeOperation = "destination-in";
        const gx = g.createLinearGradient(0, 0, 1080, 0);
        gx.addColorStop(0, "rgba(0,0,0,0)");
        gx.addColorStop(0.12, "rgba(0,0,0,1)");
        gx.addColorStop(0.8, "rgba(0,0,0,1)");
        gx.addColorStop(1, "rgba(0,0,0,0)");
        g.fillStyle = gx;
        g.fillRect(0, 0, 1080, 1920);
        const gy = g.createLinearGradient(0, 0, 0, 1920);
        gy.addColorStop(0, "rgba(0,0,0,0)");
        gy.addColorStop(0.1, "rgba(0,0,0,1)");
        gy.addColorStop(0.85, "rgba(0,0,0,1)");
        gy.addColorStop(1, "rgba(0,0,0,0)");
        g.fillStyle = gy;
        g.fillRect(0, 0, 1080, 1920);
      }
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
      setTex(t);
      continueRender(handle);
    };
    img.onerror = () => continueRender(handle);
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handle]);
  return tex;
};

/** Монстр (CreatureGlass) как текстура. */
export const useMonsterTexture = () => useSvgTexture("monster texture", <CreatureGlass t={0.3} open={0.55} tilt={-8} bare />, true);

// ── материалы ─────────────────────────────────────────────────────────
const useMats = () =>
  useMemo(
    () => ({
      floor: new THREE.MeshStandardMaterial({ color: "#3a2f26", roughness: 0.85, map: makeTex("grime", 2, 12) }),
      wallLow: new THREE.MeshStandardMaterial({ color: "#4a524a", roughness: 0.8, map: makeTex("grime", 10, 1) }),
      wallUp: new THREE.MeshStandardMaterial({ color: "#6d7365", roughness: 0.75, map: makeTex("grime", 3, 1) }),
      ceil: new THREE.MeshStandardMaterial({ color: "#a9a48d", roughness: 0.9, side: THREE.DoubleSide, map: makeTex("grime", 1, 10) }),
      seat: new THREE.MeshStandardMaterial({ color: "#7a4a33", roughness: 0.6, map: makeTex("fabric", 2, 1) }),
      glow: new THREE.SpriteMaterial({ map: makeTex("glow"), color: "#e8c27a", blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }),
      seatDark: new THREE.MeshStandardMaterial({ color: "#3a2a22", roughness: 0.8 }),
      metal: new THREE.MeshStandardMaterial({ color: "#c9c3b3", metalness: 0.75, roughness: 0.28 }),
      glass: new THREE.MeshStandardMaterial({ color: "#0a0e10", roughness: 0.08, metalness: 0.4, transparent: true, opacity: 0.42, depthWrite: false }),
      frame: new THREE.MeshStandardMaterial({ color: "#8a8a7c", roughness: 0.5, metalness: 0.3 }),
      door: new THREE.MeshStandardMaterial({ color: "#5c6457", roughness: 0.6, metalness: 0.2 }),
      dark: new THREE.MeshStandardMaterial({ color: "#0c0d0d", roughness: 1 }),
      glassPane: new THREE.MeshStandardMaterial({ color: "#8d9a8c", transparent: true, opacity: 0.07, roughness: 0.05, metalness: 0.6, depthWrite: false }),
    }),
    [],
  );
type Mats = ReturnType<typeof useMats>;

const INK = "#0e0e0e";
const OL = 0.012;
const Box = ({ p, s, m, cast = true, recv = true, ol = false }: { p: [number, number, number]; s: [number, number, number]; m: THREE.Material; cast?: boolean; recv?: boolean; ol?: boolean }) => (
  <mesh position={p} castShadow={cast} receiveShadow={recv} material={m}>
    <boxGeometry args={s} />
    {ol && <Outlines thickness={OL} color={INK} />}
  </mesh>
);

/** Торцевая стена с дверью и окном-проёмом (сквозь него виден соседний вагон). */
const EndWall = ({ z, m, facing }: { z: number; m: Mats; facing: 1 | -1 }) => {
  const t = 0.08;
  const dz = z + (facing * t) / 2;
  return (
    <group>
      {/* стена по бокам и над дверью */}
      <Box p={[-(HW + 0.45) / 2 - 0.0, 1.3, dz]} s={[HW - 0.45, 2.6, t]} m={m.wallUp} />
      <Box p={[(HW + 0.45) / 2, 1.3, dz]} s={[HW - 0.45, 2.6, t]} m={m.wallUp} />
      <Box p={[0, 2.35, dz]} s={[0.9, 0.5, t]} m={m.wallUp} />
      {/* дверное полотно с окном: проём x ±0.3, y 1.0–1.85 */}
      <Box p={[0, 0.5, dz]} s={[0.9, 1.0, 0.05]} m={m.door} ol />
      <Box p={[0, 1.975, dz]} s={[0.9, 0.25, 0.05]} m={m.door} ol />
      <Box p={[-0.375, 1.425, dz]} s={[0.15, 0.85, 0.05]} m={m.door} ol />
      <Box p={[0.375, 1.425, dz]} s={[0.15, 0.85, 0.05]} m={m.door} ol />
      {/* рама окна и дверная коробка */}
      <Box p={[0, 1.0, dz + facing * 0.03]} s={[0.64, 0.04, 0.03]} m={m.frame} ol />
      <Box p={[0, 1.85, dz + facing * 0.03]} s={[0.64, 0.04, 0.03]} m={m.frame} ol />
      <Box p={[-0.31, 1.425, dz + facing * 0.03]} s={[0.04, 0.89, 0.03]} m={m.frame} ol />
      <Box p={[0.31, 1.425, dz + facing * 0.03]} s={[0.04, 0.89, 0.03]} m={m.frame} ol />
      <Box p={[-0.47, 1.05, dz + facing * 0.02]} s={[0.04, 2.1, 0.06]} m={m.dark} ol />
      <Box p={[0.47, 1.05, dz + facing * 0.02]} s={[0.04, 2.1, 0.06]} m={m.dark} ol />
      {/* ручка */}
      <Box p={[0.3, 0.95, dz + facing * 0.05]} s={[0.03, 0.18, 0.03]} m={m.metal} ol />
      {/* едва заметное мутное стекло */}
      <mesh position={[0, 1.425, dz]} material={m.glassPane}>
        <planeGeometry args={[0.6, 0.85]} />
      </mesh>
    </group>
  );
};

/** Один вагон: z0 — задний торец, вагон уходит в −z на CAR_L. */
const Car = ({ z0, m, lights, lampK, pointCount }: { z0: number; m: Mats; lights: boolean; lampK: number; pointCount: number }) => {
  const rows = Math.floor(CAR_L / 1.8);
  const lampsZ = Array.from({ length: 8 }, (_, i) => z0 - 1.25 - i * 2.5);
  const emit = useMemo(() => new THREE.MeshStandardMaterial({ color: "#e8d6a8", emissive: new THREE.Color(LAMP_EMIT), emissiveIntensity: 1 }), []);
  const deadMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#1b1f1b", roughness: 0.3, metalness: 0.2 }), []);
  emit.emissiveIntensity = lights ? 1.05 * lampK : 0.02;
  const dead = (i: number) => z0 === 0 && DEAD.includes(i);
  const glowMat = useMemo(() => m.glow.clone(), [m]);
  glowMat.opacity = 0.32 * lampK;
  emit.color.set(lights ? "#fff2cf" : "#2a2a26");
  const zc = z0 - CAR_L / 2;
  return (
    <group>
      {/* пол, стены, скос, потолок */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, zc]} receiveShadow material={m.floor}>
        <planeGeometry args={[HW * 2, CAR_L]} />
      </mesh>
      {[-1, 1].map((sd) => (
        <group key={sd}>
          <Box p={[sd * (HW + 0.03), 0.47, zc]} s={[0.06, 0.94, CAR_L]} m={m.wallLow} cast={false} />
          <Box p={[sd * (HW + 0.03), 2.0, zc]} s={[0.06, 0.5, CAR_L]} m={m.wallUp} cast={false} />
          {/* простенки между окнами */}
          {Array.from({ length: rows + 1 }, (_, i) => (
            <Box key={i} p={[sd * (HW + 0.02), 1.35, z0 - i * 1.8]} s={[0.07, 0.8, 0.5]} m={m.wallUp} cast={false} ol />
          ))}
          {/* тёмные окна (ночь) */}
          <mesh position={[sd * (HW + 0.05), 1.35, zc]} rotation={[0, -sd * Math.PI / 2, 0]} material={m.glass}>
            <planeGeometry args={[CAR_L, 0.8]} />
          </mesh>
          {/* скос к потолку */}
          <mesh position={[sd * 1.2, 2.42, zc]} rotation={[0, 0, sd * 0.62]} receiveShadow material={m.ceil}>
            <boxGeometry args={[0.04, 0.62, CAR_L]} />
          </mesh>
          {/* багажная полка */}
          <Box p={[sd * 1.22, 1.93, zc]} s={[0.42, 0.025, CAR_L - 0.2]} m={m.metal} ol />
          <Box p={[sd * 1.01, 1.96, zc]} s={[0.02, 0.06, CAR_L - 0.2]} m={m.metal} cast={false} />
          {/* сиденья: скамьи лицом друг к другу */}
          {Array.from({ length: rows }, (_, i) => {
            const z = z0 - 0.9 - i * 1.8;
            return (
              <group key={i}>
                {[-1, 1].map((f) => (
                  <group key={f}>
                    <Box p={[sd * 0.93, 0.46, z + f * 0.6]} s={[1.0, 0.1, 0.46]} m={m.seat} ol />
                    <Box p={[sd * 0.93, 0.22, z + f * 0.62]} s={[0.96, 0.42, 0.3]} m={m.seatDark} />
                    <mesh position={[sd * 0.93, 0.82, z + f * 0.85]} rotation={[f * 0.12, 0, 0]} castShadow receiveShadow material={m.seat}>
                      <boxGeometry args={[1.0, 0.68, 0.08]} />
                      <Outlines thickness={OL} color={INK} />
                    </mesh>
                    {/* поручень на спинке у прохода */}
                    <Box p={[sd * 0.47, 1.2, z + f * 0.87]} s={[0.035, 0.12, 0.035]} m={m.metal} ol />
                  </group>
                ))}
                {/* вертикальные поручни через ряд */}
                {i % 2 === 0 && (
                  <mesh position={[sd * 0.43, 0.97, z + 0.9]} castShadow material={m.metal}>
                    <cylinderGeometry args={[0.018, 0.018, 1.94, 10]} />
                    <Outlines thickness={OL * 0.6} color={INK} />
                  </mesh>
                )}
              </group>
            );
          })}
        </group>
      ))}
      <mesh position={[0, 2.6, zc]} rotation={[Math.PI / 2, 0, 0]} receiveShadow material={m.ceil}>
        <planeGeometry args={[1.85, CAR_L]} />
      </mesh>
      {/* плафоны */}
      {lampsZ.map((z, i) => (
        <group key={i}>
          <mesh position={[0, 2.575, z]} material={dead(i) ? deadMat : emit}>
            <boxGeometry args={[0.2, 0.04, 1.3]} />
          </mesh>
          <Box p={[0, 2.59, z]} s={[0.26, 0.02, 1.36]} m={m.frame} cast={false} ol />
          {lights && !dead(i) && (
            <>
              <sprite position={[0, 2.5, z]} scale={[1.5, 1.5, 1]} material={glowMat} />
              <sprite position={[0, 2.52, z - 0.45]} scale={[0.9, 0.9, 1]} material={glowMat} />
              <sprite position={[0, 2.52, z + 0.45]} scale={[0.9, 0.9, 1]} material={glowMat} />
            </>
          )}
        </group>
      ))}
      {lampsZ.slice(0, pointCount).map((z, i) => (
        <pointLight key={i} position={[0, 2.3, z]} color={LAMP} intensity={lights && !dead(i) ? 2.4 * lampK : 0} distance={4.5} decay={2} />
      ))}
      <EndWall z={z0} m={m} facing={-1} />
      <EndWall z={z0 - CAR_L} m={m} facing={1} />
    </group>
  );
};

/** Объёмный конус лампы с тенями (drei SpotLight). */
const Cone = ({ z, k }: { z: number; k: number }) => {
  const tgt = useMemo(() => new THREE.Object3D(), []);
  tgt.position.set(0, 0, z);
  tgt.updateMatrixWorld();
  return (
    <>
      <primitive object={tgt} />
      <SpotLight
        position={[0, 2.5, z]}
        target={tgt}
        color={LAMP}
        intensity={9 * k}
        angle={0.78}
        penumbra={0.85}
        distance={5}
        decay={2}
        attenuation={2.6}
        anglePower={4}
        radiusTop={0.25}
        radiusBottom={1.6}
        opacity={0.12 * k}
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
        shadow-bias={-0.0004}
      />
    </>
  );
};

/** Пылинки: детерминированно от кадра, ярче рядом с лампами. */
const Dust = ({ u, cz }: { u: number; cz: number }) => {
  const N = 360;
  const geo = useMemo(() => new THREE.BufferGeometry(), []);
  const pos = useMemo(() => new Float32Array(N * 3), []);
  const base = useMemo(() => Array.from({ length: N }, (_, i) => [Math.sin(i * 12.9898) * 43758.5453 % 1, Math.sin(i * 78.233) * 12543.123 % 1, Math.sin(i * 39.425) * 24634.6345 % 1].map((v) => Math.abs(v))), []);
  for (let i = 0; i < N; i++) {
    const [a, b, c] = base[i];
    pos[i * 3] = (a - 0.5) * 2.4 + Math.sin(u * 0.3 + i) * 0.05;
    pos[i * 3 + 1] = 0.3 + ((b * 2.2 + u * 0.03 * (0.5 + c)) % 2.2);
    pos[i * 3 + 2] = cz - 0.5 - c * 5 + Math.cos(u * 0.25 + i * 0.7) * 0.06;
  }
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.attributes.position.needsUpdate = true;
  return (
    <points geometry={geo}>
      <pointsMaterial color="#ffe2a6" size={0.005} sizeAttenuation transparent opacity={0.4} depthWrite={false} />
    </points>
  );
};

/**
 * Тамбур за нашей дверью: высокий сгорбленный монстр стоит вплотную (в окне — плечи, шея, голова, одна рука на краю проёма),
 * перед ним — грязное стекло. Виден только на вспышках: свет от отдельной лампы в тамбуре + контровой свет из соседнего вагона.
 * «Вспышка. Пусто.» — на первой вспышке его ещё нет; дальше он с каждой вспышкой ближе.
 */
const MON_FROM = 2.4; // с начала вспышек (≈58.4)
const Tambour = ({ u, monster, m }: { u: number; monster: THREE.Texture | null; m: Mats }) => {
  const glassTex = useMemo(() => makeDirtyGlass(), []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ transparent: true, alphaTest: 0.01, roughness: 0.85, color: "#8f8574" }), []);
  if (monster && mat.map !== monster) {
    mat.map = monster;
    mat.needsUpdate = true;
  }
  const w = u - T_WATCH;
  const watchF = Math.round(w * FPS);
  const flash = u >= T_WATCH && flickerOn(watchF);
  const seen = u >= T_WATCH + MON_FROM;
  // приближение толчками: каждая следующая вспышка — ближе
  const k = clamp((w - MON_FROM) / 6);
  const step = Math.floor(k * 3) / 3;
  const mz = DOOR_Z - 0.95 + step * 0.62;
  const jerk = flash && watchF % 6 < 2 ? 0.015 : 0;
  // свет вспышки: 3D-источник в тамбуре сверху, и контровой из соседнего вагона
  const fl = flash ? 1 : 0;
  mat.color.set(flash ? "#a89c84" : "#0b0a08"); // без вспышки — тонет в черноте тамбура
  // контур-«контровой свет»: чуть увеличенная копия силуэта позади, светится только на вспышке
  const rim = useMemo(() => new THREE.MeshBasicMaterial({ transparent: true, alphaTest: 0.2, color: "#f0d08e", depthWrite: false }), []);
  if (monster && rim.map !== monster) {
    rim.map = monster;
    rim.needsUpdate = true;
  }
  rim.opacity = flash ? 0.85 : 0;
  return (
    <group>
      {/* грязное стекло нашей двери */}
      <mesh position={[0, 1.425, DOOR_Z - 0.05]}>
        <planeGeometry args={[0.6, 0.85]} />
        <meshStandardMaterial map={glassTex} transparent roughness={0.35} metalness={0.15} depthWrite={false} color="#e8dcc0" />
      </mesh>
      {/* блик на стекле */}
      <mesh position={[0.08, 1.5, DOOR_Z - 0.045]} rotation={[0, 0, -0.55]}>
        <planeGeometry args={[0.025, 0.9]} />
        <meshBasicMaterial color="#f3d58e" transparent opacity={0.035} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {seen && monster && (
        <group position={[-0.15 + jerk, 1.1, mz]} rotation={[0, 0, -0.05]}>
          <mesh material={mat}>
            <planeGeometry args={[1.65, 2.93]} />
          </mesh>
          <mesh position={[0.005, 0.02, -0.03]} scale={[1.022, 1.014, 1]} material={rim}>
            <planeGeometry args={[1.65, 2.93]} />
          </mesh>
        </group>
      )}
      <pointLight position={[0.1, 2.3, mz - 0.45]} color={LAMP} intensity={fl * 3.2} distance={2.6} decay={2} />
      <pointLight position={[0.2, 2.35, mz + 0.3]} color={LAMP} intensity={fl * 0.9} distance={1.6} decay={2} />
      <pointLight position={[0, 1.8, NEXT_Z - 0.6]} color={LAMP} intensity={fl * 1.6} distance={3} decay={2} />
      {/* лёгкий свет нашего вагона на стекле, чтобы оно читалось */}
      <pointLight position={[0, 1.9, DOOR_Z + 0.6]} color={LAMP} intensity={0.25} distance={1.2} decay={2} />
    </group>
  );
};

const Scene = ({ u, pose, post, monster }: { u: number; pose: Pose; post: boolean; monster: THREE.Texture | null }) => {
  const m = useMats();
  const frame = Math.round((u - T_WATCH) * FPS);
  const watch = u >= T_WATCH;
  const flash = watch && flickerOn(frame);
  // наш вагон: мигание неисправной лампы; во время вспышек в соседнем — наш свет проседает
  const ourK = (u < T_LIGHTS_OFF ? 1 : watch ? (flash ? 0.75 : 0.42) : 0.7) * lamp(u + 6) * blink(u, BLINK_WALK);
  const nextOn = u < T_LIGHTS_OFF ? true : watch ? flash : false;
  const nextK = 0.9 * lamp(u + 20);
  return (
    <>
      <CamRig pose={pose} />
      <color attach="background" args={["#000"]} />
      <fog attach="fog" args={["#050403", 3, 15]} />
      <ambientLight color="#8a7a55" intensity={0.04} />
      <hemisphereLight args={["#d9c08a", "#0a0806", 0.05 * ourK]} />
      <Car z0={0} m={m} lights lampK={ourK} pointCount={8} />
      <Car z0={NEXT_Z} m={m} lights={nextOn} lampK={nextK} pointCount={3} />
      {/* переход между вагонами: тёмный тоннель-гармошка (стенки, пол, потолок) */}
      {(() => {
        const zc = (DOOR_Z + NEXT_Z) / 2;
        const L = Math.abs(NEXT_Z - DOOR_Z);
        return (
          <group>
            <Box p={[-0.62, 1.05, zc]} s={[0.04, 2.2, L]} m={m.dark} cast={false} />
            <Box p={[0.62, 1.05, zc]} s={[0.04, 2.2, L]} m={m.dark} cast={false} />
            <Box p={[0, 2.15, zc]} s={[1.28, 0.04, L]} m={m.dark} cast={false} />
            <Box p={[0, -0.01, zc]} s={[1.28, 0.02, L]} m={m.floor} cast={false} />
          </group>
        );
      })()}
      {[-6.25, -11.25, -16.25].map((z) => (
        <Cone key={z} z={z} k={ourK} />
      ))}
      <Dust u={u} cz={pose.z} />
      <Tambour u={u} monster={monster} m={m} />
    </>
  );
};

// окно задней двери соседнего вагона: существо рисуется в его проекции (за обоими стёклами)
const GLASS = [
  new THREE.Vector3(-0.3, 1.0, NEXT_Z),
  new THREE.Vector3(0.3, 1.0, NEXT_Z),
  new THREE.Vector3(-0.3, 1.85, NEXT_Z),
  new THREE.Vector3(0.3, 1.85, NEXT_Z),
];
const projCam = new THREE.PerspectiveCamera(FOV, W / H, 0.03, 60);
const glassRect = (p: Pose) => {
  applyPose(projCam, p);
  const pts = GLASS.map((v) => v.clone().project(projCam)).map((v) => [((v.x + 1) / 2) * W, ((1 - v.y) / 2) * H]);
  const xs = pts.map((q) => q[0]);
  const ys = pts.map((q) => q[1]);
  return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
};

export const Pov3D = ({ post = true }: { post?: boolean }) => {
  const monster = useMonsterTexture();
  const frame = useCurrentFrame();
  const u = frame / FPS;
  const pose = poseAt(u);
  const blur = clamp(Math.abs(pose.yawVel) / 4) * 22; // направленный смаз на развороте
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <filter id="povmb" x="-10%" y="0" width="120%" height="100%">
          <feGaussianBlur stdDeviation={`${blur.toFixed(2)} 0`} />
        </filter>
      </svg>
      <AbsoluteFill style={{ filter: blur > 0.5 ? "url(#povmb)" : undefined }}>
        <ThreeCanvas width={W} height={H} shadows dpr={1} gl={{ antialias: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05, preserveDrawingBuffer: true }}>
          <Scene u={u} pose={pose} post={post} monster={monster} />
        </ThreeCanvas>
      </AbsoluteFill>
      {/* виньетка (EffectComposer в headless Remotion даёт чёрный кадр; свечение ламп — аддитивными спрайтами в 3D) */}
      <AbsoluteFill style={{ background: "radial-gradient(80% 62% at 50% 46%, rgba(0,0,0,0) 50%, rgba(8,6,2,.78) 100%)" }} />
    </AbsoluteFill>
  );
};

// ═════════════════════════════════════════════════════════════════════
// 00:21–00:29 — станция в 3D: Дима сидит у окна (на том же месте, откуда потом встанет),
// за стеклом проносится пустая платформа без названия; свет фонарей бежит по вагону;
// в тёмном стекле — его отражение, и на «Почти» за плечом на миг проступает высокий силуэт.
// ═════════════════════════════════════════════════════════════════════
const V_OUT = 17; // м/с — скорость, с которой мимо летит станция
const PLAT_L = 84;
const ST_IN = 0.6; // когда передний край платформы входит в кадр
const SIL_A = 4.6; // силуэт в отражении (00:25.6–00:26.1, «В стекле… только ты. Почти»)
const SIL_B = 5.1;

// сидит у окна, смотрит вперёд-влево вдоль стекла: станция «налетает» спереди
const ST_YAW = Math.PI / 2 - 0.5;
const ST_X = -0.75;
const GX = -(HW + 0.05) + 0.012;
const ST_FACE_Z = -9.9; // центр окна между простенками
const ST_Z = ST_FACE_Z + ((ST_X - GX) / Math.cos(0.5)) * Math.sin(0.5);
const stationPose = (u: number): Pose => {
  const z0 = ST_Z;
  const push = ease(u, 4.6, 8, 0, 1);
  const roll = Math.sin((u / 1.4) * Math.PI * 2) * 0.45 + (u % 0.9 < 0.09 ? Math.sin(((u % 0.9) / 0.09) * Math.PI) * 0.25 : 0);
  return {
    x: ST_X - push * 0.08,
    y: 1.2 + Math.sin(u * 1.7) * 0.004,
    z: z0,
    yaw: ST_YAW + Math.sin(u * 0.6) * 0.015 + push * 0.12,
    pitch: -0.08,
    roll: (roll * Math.PI) / 180,
    yawVel: 0,
  };
};

/** Силуэт для отражения: высокая бледная фигура (рисуется в canvas). */
const makeSilhouette = () => {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 640;
  const g = c.getContext("2d")!;
  const body = (col: string, grow: number) => {
    g.fillStyle = col;
    g.beginPath();
    g.ellipse(128, 80, 40 + grow, 52 + grow, 0, 0, Math.PI * 2);
    g.fill();
    g.beginPath();
    g.moveTo(96 - grow, 130);
    g.bezierCurveTo(78 - grow, 260, 84 - grow, 460, 96 - grow, 640);
    g.lineTo(160 + grow, 640);
    g.bezierCurveTo(172 + grow, 460, 178 + grow, 260, 160 + grow, 130);
    g.closePath();
    g.fill();
    g.fillRect(68 - grow, 150, 16 + grow * 2, 380);
    g.fillRect(172 - grow, 150, 16 + grow * 2, 380);
  };
  body("rgba(214,196,150,.55)", 4); // бледная кромка — отсвет станции
  body("#070605", 0); // сам силуэт тёмный
  g.fillStyle = "#e9dcb6";
  g.beginPath();
  g.arc(114, 78, 6, 0, Math.PI * 2);
  g.arc(142, 78, 6, 0, Math.PI * 2);
  g.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

/** Снаружи (слева от вагона, x < −1.5): платформа, фонари, пустая табличка, опоры, лес, звёзды. Всё едет в +z. */
const Outside = ({ u, camZ, m }: { u: number; camZ: number; m: Mats }) => {
  const mats = useMemo(
    () => ({
      plat: new THREE.MeshStandardMaterial({ color: "#7d7c74", roughness: 0.9, map: makeTex("grime", 6, 1) }),
      platSide: new THREE.MeshStandardMaterial({ color: "#3a3b37", roughness: 0.95 }),
      edge: new THREE.MeshStandardMaterial({ color: "#c9a640", roughness: 0.7 }),
      pole: new THREE.MeshStandardMaterial({ color: "#2c2f2e", roughness: 0.6, metalness: 0.4 }),
      head: new THREE.MeshStandardMaterial({ color: "#ffe6b0", emissive: new THREE.Color("#ffcf7a"), emissiveIntensity: 2.2 }),
      sign: new THREE.MeshStandardMaterial({ color: "#2c5aa0", roughness: 0.5, emissive: new THREE.Color("#2c5aa0"), emissiveIntensity: 0.55 }),
      signFrame: new THREE.MeshStandardMaterial({ color: "#e9eef3", roughness: 0.5 }),
      wall: new THREE.MeshStandardMaterial({ color: "#6a675c", roughness: 0.95, map: makeTex("grime", 8, 1) }),
      ground: new THREE.MeshStandardMaterial({ color: "#0c0d0b", roughness: 1 }),
      tree: new THREE.MeshStandardMaterial({ color: "#070907", roughness: 1 }),
      glow: new THREE.SpriteMaterial({ map: makeTex("glow"), color: "#ffcf7a", blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.8 }),
    }),
    [],
  );
  const stars = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(300 * 3);
    for (let i = 0; i < 300; i++) {
      pos[i * 3] = -60 - rnd(i + 900) * 20;
      pos[i * 3 + 1] = 6 + rnd(i + 901) * 40;
      pos[i * 3 + 2] = -60 + rnd(i + 902) * 120;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return geo;
  }, []);
  const lead = camZ - 7 + V_OUT * (u - ST_IN); // передний (+z) край платформы
  const pc = lead - PLAT_L / 2;
  const lamps = Array.from({ length: 10 }, (_, i) => lead - 4 - i * 8.5);
  const wrap = (base: number, span: number) => {
    const v = (((base + V_OUT * u) % span) + span) % span;
    return camZ - span / 2 + v;
  };
  return (
    <group>
      <points geometry={stars}>
        <pointsMaterial color="#cfd6dc" size={0.18} sizeAttenuation transparent opacity={0.6} depthWrite={false} fog={false} />
      </points>
      {/* земля и насыпь */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-40, -1.25, camZ]} material={mats.ground}>
        <planeGeometry args={[80, 400]} />
      </mesh>
      {/* платформа */}
      <Box p={[-4.2, -0.4, pc]} s={[4.9, 1.4, PLAT_L]} m={mats.platSide} cast={false} />
      <Box p={[-4.2, 0.31, pc]} s={[4.9, 0.02, PLAT_L]} m={mats.plat} cast={false} />
      <Box p={[-1.9, 0.325, pc]} s={[0.12, 0.02, PLAT_L]} m={mats.edge} cast={false} />
      {/* стена вокзала с тёмными окнами */}
      <Box p={[-6.9, 1.2, pc]} s={[0.3, 2.8, PLAT_L - 6]} m={mats.wall} cast={false} ol />
      {Array.from({ length: 12 }, (_, i) => (
        <Box key={i} p={[-6.74, 1.4, pc - 33 + i * 6]} s={[0.02, 1.0, 1.4]} m={m.dark} cast={false} ol />
      ))}
      {/* фонари */}
      {lamps.map((z, i) => (
        <group key={i}>
          <mesh position={[-3.0, 1.6, z]} material={mats.pole}>
            <cylinderGeometry args={[0.06, 0.08, 3.5, 8]} />
            <Outlines thickness={OL} color={INK} />
          </mesh>
          <Box p={[-2.7, 3.35, z]} s={[0.7, 0.06, 0.14]} m={mats.pole} cast={false} ol />
          <Box p={[-2.4, 3.28, z]} s={[0.28, 0.08, 0.22]} m={mats.head} cast={false} />
          <sprite position={[-2.4, 3.2, z]} scale={[3.8, 3.8, 1]} material={mats.glow} />
          <pointLight position={[-2.4, 3.1, z]} color="#ffcf7a" intensity={Math.abs(z - camZ) < 18 ? 26 : 0} distance={18} decay={2} />
        </group>
      ))}
      {/* табличка без названия */}
      <group position={[-2.8, 0, pc + 6]}>
        <mesh position={[0, 0.9, -1.0]} material={mats.pole}>
          <cylinderGeometry args={[0.04, 0.04, 2.1, 8]} />
        </mesh>
        <mesh position={[0, 0.9, 1.0]} material={mats.pole}>
          <cylinderGeometry args={[0.04, 0.04, 2.1, 8]} />
        </mesh>
        <Box p={[0.02, 1.85, 0]} s={[0.06, 0.62, 2.5]} m={mats.signFrame} cast={false} ol />
        <Box p={[0.06, 1.85, 0]} s={[0.04, 0.5, 2.36]} m={mats.sign} cast={false} />
        {/* своя лампочка над табличкой — чтобы читалась с телефона */}
        <pointLight position={[0.6, 2.5, 0]} color="#ffcf7a" intensity={6} distance={4} decay={2} />
      </group>
      {/* опоры контактной сети: мелькают у самого окна */}
      {Array.from({ length: 4 }, (_, i) => (
        <mesh key={i} position={[-2.1, 2.2, wrap(i * 55, 220)]} material={mats.pole}>
          <boxGeometry args={[0.18, 6.5, 0.18]} />
        </mesh>
      ))}
      {/* лес */}
      {Array.from({ length: 70 }, (_, i) => (
        <mesh key={i} position={[-13 - rnd(i + 700) * 22, 1.2 + rnd(i + 701) * 2, wrap(rnd(i + 702) * 260, 260)]} material={mats.tree}>
          <coneGeometry args={[1.4 + rnd(i + 703), 6 + rnd(i + 704) * 5, 6]} />
        </mesh>
      ))}
      {/* свет ближайшего фонаря через окно — с тенями от простенков, бежит по вагону */}
      {(() => {
        const near = lamps.reduce((a, b) => (Math.abs(b - camZ) < Math.abs(a - camZ) ? b : a), lamps[0]);
        const k = clamp(1 - Math.abs(near - camZ) / 8);
        return <StationBeam z={near} k={k} camZ={camZ} />;
      })()}
    </group>
  );
};

const StationBeam = ({ z, k, camZ }: { z: number; k: number; camZ: number }) => {
  const tgt = useMemo(() => new THREE.Object3D(), []);
  tgt.position.set(0.8, 0.6, camZ + (z - camZ) * 0.3);
  tgt.updateMatrixWorld();
  return (
    <>
      <primitive object={tgt} />
      <spotLight position={[-2.4, 3.1, z]} target={tgt} color="#ffcf7a" intensity={40 * k} angle={0.9} penumbra={0.5} distance={9} decay={2} castShadow shadow-mapSize-width={512} shadow-mapSize-height={512} shadow-bias={-0.0005} />
    </>
  );
};

const StationScene = ({ u, pose, dima, sil }: { u: number; pose: Pose; dima: THREE.Texture | null; sil: THREE.Texture }) => {
  const m = useMats();
  const ourK = lamp(u + 14) * blink(u, BLINK_STATION);
  const dark = 1 - clamp((u - 4.2) / 0.8) * 0 - (u > ST_IN && u < 4.6 ? 0.45 : 0); // на фоне освещённой платформы отражение слабее
  const gx = GX;
  return (
    <>
      <CamRig pose={pose} />
      <color attach="background" args={["#03050a"]} />
      <fog attach="fog" args={["#03050a", 8, 60]} />
      <ambientLight color="#8a7a55" intensity={0.04} />
      <hemisphereLight args={["#d9c08a", "#0a0806", 0.05 * ourK]} />
      <Car z0={0} m={m} lights lampK={ourK} pointCount={8} />
      {[-6.25, -11.25, -16.25].map((z) => (
        <Cone key={z} z={z} k={ourK} />
      ))}
      <Outside u={u} camZ={pose.z} m={m} />
      {/* отражение в стекле: лицо Димы + на миг высокий силуэт за плечом */}
      {dima && (
        <mesh position={[gx, 1.22, ST_FACE_Z]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[0.5, 0.89]} />
          <meshBasicMaterial map={dima} transparent opacity={0.075 * dark} blending={THREE.AdditiveBlending} depthWrite={false} fog={false} />
        </mesh>
      )}
      <Dust u={u} cz={pose.z} />
    </>
  );
};

export const Station3D = () => {
  const frame = useCurrentFrame();
  const u = frame / FPS;
  const pose = stationPose(u);
  const dima = useSvgTexture("dima reflection", <DimaFace t={1} fear={0.45} eyes={1} look={[-0.3, 0]} mouth="closed" />, true);
  const sil = useMemo(() => makeSilhouette(), []);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <ThreeCanvas width={W} height={H} shadows dpr={1} gl={{ antialias: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.4, preserveDrawingBuffer: true }}>
        <StationScene u={u} pose={pose} dima={dima} sil={sil} />
      </ThreeCanvas>
      <AbsoluteFill style={{ background: "radial-gradient(80% 62% at 50% 46%, rgba(0,0,0,0) 50%, rgba(8,6,2,.78) 100%)" }} />
    </AbsoluteFill>
  );
};

// ═════════════════════════════════════════════════════════════════════
// 01:22.5–01:30 — финальный выбор: объёмная панель связи на стене у торцевой двери (3D).
// Текст рисуется в canvas шрифтом-трафаретом и подгоняется по ширине — всегда целиком в рамке.
// ═════════════════════════════════════════════════════════════════════
const PW = 0.92; // ширина панели, м
const PH = 0.88;
const CW = 1024; // разрешение текстуры лицевой стороны (по ширине)
const CH = Math.round((CW * PH) / PW);

type ChoiceTex = { face: THREE.Texture; header: THREE.Texture; row1: THREE.Texture; row2: THREE.Texture; footer: THREE.Texture };

const fitText = (g: CanvasRenderingContext2D, text: string, font: string, size: number, maxW: number) => {
  let s = size;
  g.font = `${s}px ${font}`;
  while (g.measureText(text).width > maxW && s > 10) {
    s -= 1;
    g.font = `${s}px ${font}`;
  }
  return s;
};

const textTex = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
};

const useChoiceTextures = (font: string) => {
  const [tex, setTex] = useState<ChoiceTex | null>(null);
  const [handle] = useState(() => delayRender("choice textures"));
  useEffect(() => {
    const F = `"${font.replace(/"/g, "")}"`;
    document.fonts
      .load(`40px ${F}`)
      .catch(() => null)
      .then(() => {
        // лицевая сторона: металл, царапины, швы, запёкшаяся кровь
        const face = textTex(CW, CH, (g) => {
          const gr = g.createLinearGradient(0, 0, CW, CH);
          gr.addColorStop(0, "#5a5f5e");
          gr.addColorStop(0.5, "#45494a");
          gr.addColorStop(1, "#2f3233");
          g.fillStyle = gr;
          g.fillRect(0, 0, CW, CH);
          for (let i = 0; i < 6000; i++) {
            g.fillStyle = `rgba(0,0,0,${rnd(i + 1200) * 0.12})`;
            g.fillRect(rnd(i + 1201) * CW, rnd(i + 1202) * CH, 2, 2);
          }
          g.strokeStyle = "rgba(190,195,190,.22)";
          for (let i = 0; i < 60; i++) {
            g.lineWidth = 0.8 + rnd(i + 1300) * 1.4;
            const x = rnd(i + 1301) * CW;
            const y = rnd(i + 1302) * CH;
            g.beginPath();
            g.moveTo(x, y);
            g.lineTo(x + 30 + rnd(i + 1303) * 120, y + (rnd(i + 1304) - 0.5) * 30);
            g.stroke();
          }
          for (let i = 0; i < 30; i++) {
            g.fillStyle = `rgba(70,50,20,${0.05 + rnd(i + 1400) * 0.1})`;
            g.beginPath();
            g.ellipse(rnd(i + 1401) * CW, rnd(i + 1402) * CH, 20 + rnd(i + 1403) * 80, 10 + rnd(i + 1404) * 40, 0, 0, Math.PI * 2);
            g.fill();
          }
          g.strokeStyle = "#141617";
          g.lineWidth = 6;
          g.strokeRect(22, 22, CW - 44, CH - 44);
          // кровь: потёк справа и мазок у красного индикатора
          g.strokeStyle = "rgba(70,12,14,.8)";
          g.lineCap = "round";
          g.lineWidth = 11;
          g.beginPath();
          g.moveTo(CW - 70, 60);
          g.bezierCurveTo(CW - 60, 140, CW - 74, 220, CW - 64, 300);
          g.stroke();
          g.lineWidth = 6;
          g.beginPath();
          g.moveTo(100, CH * 0.43);
          g.bezierCurveTo(94, CH * 0.47, 102, CH * 0.5, 96, CH * 0.54);
          g.stroke();
          g.fillStyle = "rgba(70,12,14,.7)";
          g.beginPath();
          g.ellipse(108, CH * 0.42, 22, 9, 0.2, 0, Math.PI * 2);
          g.fill();
        });
        const header = textTex(1024, 180, (g) => {
          const s = fitText(g, "ЧТО ДЕЛАТЬ ДИМЕ?", F, 92, 860);
          g.font = `${s}px ${F}`;
          g.fillStyle = "#f2c94c";
          g.textAlign = "center";
          g.textBaseline = "middle";
          g.fillText("ЧТО ДЕЛАТЬ ДИМЕ?", 512, 80);
          g.fillStyle = "#6b7276";
          g.fillRect(70, 160, 884, 5);
        });
        const row = (text: string) =>
          textTex(1024, 170, (g) => {
            g.fillStyle = "#1c2022";
            g.strokeStyle = "#6b7276";
            g.lineWidth = 5;
            g.beginPath();
            g.roundRect(14, 14, 996, 142, 14);
            g.fill();
            g.stroke();
            // поле текста: от 150 до 960 px (безопасные поля слева от индикатора и справа от рамки)
            const s = fitText(g, text, F, 60, 790);
            g.font = `${s}px ${F}`;
            g.fillStyle = "#ece6d4";
            g.textBaseline = "middle";
            g.fillText(text, 160, 88);
          });
        const footer = textTex(1024, 120, (g) => {
          const s = fitText(g, "ПИШИ 1 ИЛИ 2 В КОММЕНТАРИЯХ", F, 54, 860);
          g.font = `${s}px ${F}`;
          g.fillStyle = "#b9b4a6";
          g.textAlign = "center";
          g.textBaseline = "middle";
          g.fillText("ПИШИ 1 ИЛИ 2 В КОММЕНТАРИЯХ", 512, 60);
        });
        setTex({ face, header, row1: row("1 — НАЖАТЬ КНОПКУ СВЯЗИ"), row2: row("2 — БЕЖАТЬ ОБРАТНО В ВАГОН"), footer });
        continueRender(handle);
      });
  }, [font, handle]);
  return tex;
};

const Wire = ({ pts, r, color }: { pts: [number, number, number][]; r: number; color: string }) => {
  const geo = useMemo(() => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))), 40, r, 8, false), [pts, r]);
  return (
    <mesh geometry={geo} castShadow receiveShadow>
      <meshStandardMaterial color={color} roughness={0.6} />
      <Outlines thickness={OL * 0.5} color={INK} />
    </mesh>
  );
};

const WIRES: [number, number, number][][] = [
  [[-0.44, 1.0, 0.04], [-0.3, 0.72, 0.07], [0.0, 0.66, 0.08], [0.2, 0.8, 0.05], [0.42, 1.0, 0.03]],
  [[-0.2, 1.0, 0.04], [-0.05, 0.58, 0.1], [0.3, 0.55, 0.09], [0.55, 0.7, 0.05], [0.62, 0.9, 0.02]],
];

const ChoiceScene = ({ u, tex }: { u: number; tex: ChoiceTex | null }) => {
  const m = useMats();
  const L = 0.78 + 0.22 * lamp(u + 40);
  const breathe = Math.sin(u * 2 * Math.PI * 0.45);
  const pose: Pose = {
    x: Math.sin(u * 0.7) * 0.01,
    y: 1.43 + breathe * 0.008,
    z: 1.42 - breathe * 0.006,
    yaw: Math.sin(u * 0.5) * 0.006,
    pitch: -0.02 + breathe * 0.004,
    roll: (Math.sin(u * 0.9) * 0.4 * Math.PI) / 180,
    yawVel: 0,
  };
  const tgt = useMemo(() => new THREE.Object3D(), []);
  tgt.position.set(0, 1.35, 0);
  tgt.updateMatrixWorld();
  const on = (d: number) => u > d;
  const ledRed = Math.floor(u * 4) % 2 ? 1 : 0.3;
  const ledAmb = 0.6 + 0.15 * Math.sin(u * 3);
  const PY = 1.4; // центр панели
  const fz = 0.072; // лицевая плоскость
  const rowY = (k: number) => PY + PH / 2 - PH * k;
  const panelMat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.55, metalness: 0.45 }), []);
  if (tex && panelMat.map !== tex.face) {
    panelMat.map = tex.face;
    panelMat.needsUpdate = true;
  }
  const plane = (t: THREE.Texture | undefined, w: number, h: number, y: number, vis: boolean, emissive = 0) =>
    t && vis ? (
      <mesh position={[0, y, fz + 0.002]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial map={t} transparent roughness={0.6} emissive={new THREE.Color("#ffffff")} emissiveMap={t} emissiveIntensity={emissive} />
      </mesh>
    ) : null;
  return (
    <>
      <CamRig pose={pose} />
      <color attach="background" args={["#000"]} />
      <fog attach="fog" args={["#050403", 2, 7]} />
      <ambientLight color="#8a7a55" intensity={0.04} />
      {/* стена тамбура и край торцевой двери справа */}
      <Box p={[0, 1.3, -0.04]} s={[3, 2.8, 0.08]} m={m.wallUp} cast={false} />
      <Box p={[0, 0.25, 0.0]} s={[3, 0.5, 0.02]} m={m.wallLow} cast={false} />
      <Box p={[0.88, 1.1, 0.02]} s={[0.06, 2.2, 0.05]} m={m.dark} ol />
      <Box p={[1.2, 1.1, 0.0]} s={[0.6, 2.2, 0.04]} m={m.door} ol />
      {/* кабель-канал слева */}
      <Box p={[-0.72, 1.4, 0.03]} s={[0.07, 2.8, 0.05]} m={m.frame} ol />
      {/* корпус панели с толщиной */}
      <mesh position={[0, PY, 0.035]} castShadow receiveShadow material={panelMat}>
        <boxGeometry args={[PW, PH, 0.07]} />
        <Outlines thickness={OL} color={INK} />
      </mesh>
      {/* заклёпки */}
      {[[-1, 1], [1, 1], [-1, -1], [1, -1]].map(([sx, sy], i) => (
        <mesh key={i} position={[sx * (PW / 2 - 0.04), PY + sy * (PH / 2 - 0.04), fz + 0.006]} rotation={[Math.PI / 2, 0, 0]} castShadow material={m.metal}>
          <cylinderGeometry args={[0.016, 0.018, 0.012, 16]} />
          <Outlines thickness={OL * 0.5} color={INK} />
        </mesh>
      ))}
      {plane(tex?.header, 0.8, 0.8 * (180 / 1024), rowY(0.17), on(0.15), 0.15)}
      {plane(tex?.row1, 0.8, 0.8 * (170 / 1024), rowY(0.43), on(0.6), 0.08)}
      {plane(tex?.row2, 0.8, 0.8 * (170 / 1024), rowY(0.65), on(1.1), 0.08)}
      {plane(tex?.footer, 0.8, 0.8 * (120 / 1024), rowY(0.86), on(1.6), 0.05)}
      {/* индикаторы: красный мигает, янтарный тлеет */}
      {[
        { y: rowY(0.43), d: 0.6, c: "#ff2a22", k: ledRed },
        { y: rowY(0.65), d: 1.1, c: "#ffb54a", k: ledAmb },
      ].map((l, i) =>
        on(l.d) ? (
          <group key={i} position={[-0.4 + 0.07, l.y, fz + 0.012]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.024, 0.024, 0.014, 20]} />
              <meshStandardMaterial color="#111" emissive={new THREE.Color(l.c)} emissiveIntensity={2.5 * l.k} />
              <Outlines thickness={OL * 0.4} color={INK} />
            </mesh>
            <sprite scale={[0.16, 0.16, 1]} position={[0, 0, 0.01]}>
              <spriteMaterial map={m.glow.map} color={l.c} blending={THREE.AdditiveBlending} transparent opacity={0.55 * l.k} depthWrite={false} />
            </sprite>
            <pointLight color={l.c} intensity={0.25 * l.k} distance={0.5} decay={2} position={[0, 0, 0.05]} />
          </group>
        ) : null,
      )}
      {/* провисшие провода под панелью */}
      {WIRES.map((w, i) => (
        <Wire key={i} pts={w} r={0.012} color={i ? "#2a1212" : "#141414"} />
      ))}
      {/* лампа сверху и тёплый конус на панель (с тенями) */}
      <mesh position={[0, 2.55, 0.5]}>
        <boxGeometry args={[0.5, 0.04, 0.16]} />
        <meshStandardMaterial color="#e8d6a8" emissive={new THREE.Color(LAMP_EMIT)} emissiveIntensity={1.1 * L} />
      </mesh>
      <primitive object={tgt} />
      <SpotLight
        position={[0, 2.5, 0.55]}
        target={tgt}
        color={LAMP}
        intensity={9 * L}
        angle={0.6}
        penumbra={0.85}
        distance={4}
        decay={2}
        attenuation={2.2}
        anglePower={4}
        radiusTop={0.1}
        radiusBottom={1.0}
        opacity={0.14 * L}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0004}
      />
      <Dust u={u} cz={1.1} />
    </>
  );
};

export const Choice3D = ({ font }: { font: string }) => {
  const frame = useCurrentFrame();
  const u = frame / FPS;
  const tex = useChoiceTextures(font);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <ThreeCanvas width={W} height={H} shadows dpr={1} gl={{ antialias: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.15, preserveDrawingBuffer: true }}>
        <ChoiceScene u={u} tex={tex} />
      </ThreeCanvas>
      <AbsoluteFill style={{ background: "radial-gradient(80% 62% at 50% 46%, rgba(0,0,0,0) 50%, rgba(8,6,2,.8) 100%)" }} />
    </AbsoluteFill>
  );
};
