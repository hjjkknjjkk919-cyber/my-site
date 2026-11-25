import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { SpotLight } from "@react-three/drei";
import * as THREE from "three";
import { clamp, ease } from "../components/fx";
import { lamp } from "./lamp";
import { Beyond, flickerOn } from "./Ep1Test";

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

// ── материалы ─────────────────────────────────────────────────────────
const useMats = () =>
  useMemo(
    () => ({
      floor: new THREE.MeshStandardMaterial({ color: "#3a2f26", roughness: 0.85 }),
      wallLow: new THREE.MeshStandardMaterial({ color: "#4a524a", roughness: 0.8 }),
      wallUp: new THREE.MeshStandardMaterial({ color: "#6d7365", roughness: 0.75 }),
      ceil: new THREE.MeshStandardMaterial({ color: "#a9a48d", roughness: 0.9, side: THREE.DoubleSide }),
      seat: new THREE.MeshStandardMaterial({ color: "#7a4a33", roughness: 0.55 }),
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

const Box = ({ p, s, m, cast = true, recv = true }: { p: [number, number, number]; s: [number, number, number]; m: THREE.Material; cast?: boolean; recv?: boolean }) => (
  <mesh position={p} castShadow={cast} receiveShadow={recv} material={m}>
    <boxGeometry args={s} />
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
      <Box p={[0, 0.5, dz]} s={[0.9, 1.0, 0.05]} m={m.door} />
      <Box p={[0, 1.975, dz]} s={[0.9, 0.25, 0.05]} m={m.door} />
      <Box p={[-0.375, 1.425, dz]} s={[0.15, 0.85, 0.05]} m={m.door} />
      <Box p={[0.375, 1.425, dz]} s={[0.15, 0.85, 0.05]} m={m.door} />
      {/* рама окна и дверная коробка */}
      <Box p={[0, 1.0, dz + facing * 0.03]} s={[0.64, 0.04, 0.03]} m={m.frame} />
      <Box p={[0, 1.85, dz + facing * 0.03]} s={[0.64, 0.04, 0.03]} m={m.frame} />
      <Box p={[-0.31, 1.425, dz + facing * 0.03]} s={[0.04, 0.89, 0.03]} m={m.frame} />
      <Box p={[0.31, 1.425, dz + facing * 0.03]} s={[0.04, 0.89, 0.03]} m={m.frame} />
      <Box p={[-0.47, 1.05, dz + facing * 0.02]} s={[0.04, 2.1, 0.06]} m={m.dark} />
      <Box p={[0.47, 1.05, dz + facing * 0.02]} s={[0.04, 2.1, 0.06]} m={m.dark} />
      {/* ручка */}
      <Box p={[0.3, 0.95, dz + facing * 0.05]} s={[0.03, 0.18, 0.03]} m={m.metal} />
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
            <Box key={i} p={[sd * (HW + 0.02), 1.35, z0 - i * 1.8]} s={[0.07, 0.8, 0.5]} m={m.wallUp} cast={false} />
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
          <Box p={[sd * 1.22, 1.93, zc]} s={[0.42, 0.025, CAR_L - 0.2]} m={m.metal} />
          <Box p={[sd * 1.01, 1.96, zc]} s={[0.02, 0.06, CAR_L - 0.2]} m={m.metal} cast={false} />
          {/* сиденья: скамьи лицом друг к другу */}
          {Array.from({ length: rows }, (_, i) => {
            const z = z0 - 0.9 - i * 1.8;
            return (
              <group key={i}>
                {[-1, 1].map((f) => (
                  <group key={f}>
                    <Box p={[sd * 0.93, 0.46, z + f * 0.6]} s={[1.0, 0.1, 0.46]} m={m.seat} />
                    <Box p={[sd * 0.93, 0.22, z + f * 0.62]} s={[0.96, 0.42, 0.3]} m={m.seatDark} />
                    <mesh position={[sd * 0.93, 0.82, z + f * 0.85]} rotation={[f * 0.12, 0, 0]} castShadow receiveShadow material={m.seat}>
                      <boxGeometry args={[1.0, 0.68, 0.08]} />
                    </mesh>
                    {/* поручень на спинке у прохода */}
                    <Box p={[sd * 0.47, 1.2, z + f * 0.87]} s={[0.035, 0.12, 0.035]} m={m.metal} />
                  </group>
                ))}
                {/* вертикальные поручни через ряд */}
                {i % 2 === 0 && (
                  <mesh position={[sd * 0.43, 0.97, z + 0.9]} castShadow material={m.metal}>
                    <cylinderGeometry args={[0.018, 0.018, 1.94, 10]} />
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
          <Box p={[0, 2.59, z]} s={[0.26, 0.02, 1.36]} m={m.frame} cast={false} />
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
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
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

const Scene = ({ u, pose, post }: { u: number; pose: Pose; post: boolean }) => {
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
  const frame = useCurrentFrame();
  const u = frame / FPS;
  const pose = poseAt(u);
  const blur = clamp(Math.abs(pose.yawVel) / 4) * 22; // направленный смаз на развороте
  const watchF = Math.round((u - T_WATCH) * FPS);
  const g = u >= T_WATCH ? glassRect(pose) : null;
  const glowK = (u < T_LIGHTS_OFF ? 1 : 0.5) * lamp(u + 6) * clamp(Math.cos(pose.yaw));
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <filter id="povmb" x="-10%" y="0" width="120%" height="100%">
          <feGaussianBlur stdDeviation={`${blur.toFixed(2)} 0`} />
        </filter>
      </svg>
      <AbsoluteFill style={{ filter: blur > 0.5 ? "url(#povmb)" : undefined }}>
        <ThreeCanvas width={W} height={H} shadows gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05, preserveDrawingBuffer: true }}>
          <Scene u={u} pose={pose} post={post} />
        </ThreeCanvas>
      </AbsoluteFill>
      {/* мягкое свечение потолочных ламп, виньетка (EffectComposer в Remotion даёт чёрный кадр — делаем поверх) */}
      <AbsoluteFill style={{ background: `radial-gradient(40% 22% at 50% 8%, rgba(243,213,142,${0.18 * glowK}) 0%, rgba(0,0,0,0) 100%)`, mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ background: "radial-gradient(80% 62% at 50% 46%, rgba(0,0,0,0) 50%, rgba(8,6,2,.78) 100%)" }} />
      {/* существо на потолке соседнего вагона — в проекции стекла двери */}
      {g && (
        <svg style={{ position: "absolute", left: g.x, top: g.y, width: g.w, height: g.h, overflow: "hidden" }} viewBox="0 0 400 600" preserveAspectRatio="none">
          <g style={{ filter: "sepia(0.85) saturate(1.3) brightness(0.42) contrast(1.2)" }}>
            <Beyond t={u - T_WATCH} frame={watchF} on={flickerOn(watchF)} bg={false} />
          </g>
        </svg>
      )}
    </AbsoluteFill>
  );
};
