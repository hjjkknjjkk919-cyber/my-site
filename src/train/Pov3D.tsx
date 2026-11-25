import React, { useEffect, useMemo, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from "remotion";
import { CreatureGlass } from "./Creature2";
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
const LAMP = "#e6c27a";
const LAMP_EMIT = "#f3d58e";

// геометрия вагона (метры)
const CAR_L = 20;
const HW = 1.45; // полуширина
const DOOR_Z = -20; // передняя торцевая дверь нашего вагона
const NEXT_Z = -21.1; // задний торец соседнего вагона

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

/** Монстр (CreatureGlass) как текстура: SVG → картинка → CanvasTexture, рендер ждёт загрузки. */
export const useMonsterTexture = () => {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  const [handle] = useState(() => delayRender("monster texture"));
  useEffect(() => {
    const svg = renderToStaticMarkup(
      <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
        <CreatureGlass t={0.3} open={0.55} tilt={-8} bare />
      </svg>,
    );
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = 1080;
      c.height = 1920;
      c.getContext("2d")!.drawImage(img, 0, 0);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
      setTex(t);
      continueRender(handle);
    };
    img.onerror = () => continueRender(handle);
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }, [handle]);
  return tex;
};

// ── материалы ─────────────────────────────────────────────────────────
const useMats = () =>
  useMemo(
    () => ({
      floor: new THREE.MeshStandardMaterial({ color: "#3a2f26", roughness: 0.85, map: makeTex("grime", 2, 12) }),
      wallLow: new THREE.MeshStandardMaterial({ color: "#4a524a", roughness: 0.8, map: makeTex("grime", 10, 1) }),
      wallUp: new THREE.MeshStandardMaterial({ color: "#6d7365", roughness: 0.75, map: makeTex("grime", 3, 1) }),
      ceil: new THREE.MeshStandardMaterial({ color: "#a9a48d", roughness: 0.9, side: THREE.DoubleSide, map: makeTex("grime", 1, 10) }),
      seat: new THREE.MeshStandardMaterial({ color: "#7a4a33", roughness: 0.6, map: makeTex("fabric", 2, 1) }),
      glow: new THREE.SpriteMaterial({ map: makeTex("glow"), color: "#f3cf86", blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }),
      seatDark: new THREE.MeshStandardMaterial({ color: "#3a2a22", roughness: 0.8 }),
      metal: new THREE.MeshStandardMaterial({ color: "#c9c3b3", metalness: 0.75, roughness: 0.28 }),
      glass: new THREE.MeshStandardMaterial({ color: "#05080b", roughness: 0.08, metalness: 0.5 }),
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
  const emit = useMemo(() => new THREE.MeshStandardMaterial({ color: "#fff2cf", emissive: new THREE.Color(LAMP_EMIT), emissiveIntensity: 1 }), []);
  emit.emissiveIntensity = lights ? 2.4 * lampK : 0.02;
  const glowMat = useMemo(() => m.glow.clone(), [m]);
  glowMat.opacity = 0.55 * lampK;
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
          <mesh position={[0, 2.575, z]} material={emit}>
            <boxGeometry args={[0.2, 0.04, 1.3]} />
          </mesh>
          <Box p={[0, 2.59, z]} s={[0.26, 0.02, 1.36]} m={m.frame} cast={false} ol />
          {lights && (
            <>
              <sprite position={[0, 2.5, z]} scale={[1.5, 1.5, 1]} material={glowMat} />
              <sprite position={[0, 2.52, z - 0.45]} scale={[0.9, 0.9, 1]} material={glowMat} />
              <sprite position={[0, 2.52, z + 0.45]} scale={[0.9, 0.9, 1]} material={glowMat} />
            </>
          )}
        </group>
      ))}
      {lampsZ.slice(0, pointCount).map((z, i) => (
        <pointLight key={i} position={[0, 2.3, z]} color={LAMP} intensity={lights ? 2.2 * lampK : 0} distance={7} decay={1.6} />
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
        intensity={7 * k}
        angle={1.05}
        penumbra={0.9}
        distance={6}
        decay={1.4}
        attenuation={2.6}
        anglePower={4}
        radiusTop={0.25}
        radiusBottom={2.2}
        opacity={0.16 * k}
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
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ transparent: true, alphaTest: 0.04, roughness: 0.85, color: "#8f8574" }), []);
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
  mat.color.set(flash ? "#8f8574" : "#2e2a23"); // без вспышки — тонет в темноте тамбура
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
        <mesh position={[-0.15 + jerk, 1.1, mz]} rotation={[0, 0, -0.05]} material={mat}>
          <planeGeometry args={[1.65, 2.93]} />
        </mesh>
      )}
      <pointLight position={[0.15, 2.05, mz + 0.35]} color={LAMP} intensity={fl * 2.6} distance={2.2} decay={1.5} />
      <pointLight position={[0, 1.8, NEXT_Z - 0.6]} color={LAMP} intensity={fl * 1.6} distance={3} decay={1.5} />
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
  const ourK = (u < T_LIGHTS_OFF ? 1 : watch ? (flash ? 0.75 : 0.42) : 0.7) * lamp(u + 6);
  const nextOn = u < T_LIGHTS_OFF ? true : watch ? flash : false;
  const nextK = 0.9 * lamp(u + 20);
  return (
    <>
      <CamRig pose={pose} />
      <color attach="background" args={["#000"]} />
      <fog attach="fog" args={["#0d0b07", 6, 26]} />
      <ambientLight color="#8a7a55" intensity={0.22 * (0.6 + 0.4 * ourK)} />
      <hemisphereLight args={["#d9c08a", "#2a2218", 0.25 * ourK]} />
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
      {[-5.5, -11.5, -17.25].map((z) => (
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
