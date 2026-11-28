import React, { useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { rnd } from "../../train/Pov3D";

export type Spot = "out" | "sill" | "feet" | "door" | "none";
export type BedState = { t: number; spot: Spot; open: number; tilt: number; pupil: number; cam: { y: number; pitch: number; yaw: number; shake: number }; beam: number; bpm?: number };

/* ── процедурные текстуры (кэшируются через useMemo) ── */
const canvasTex = (W: number, H: number, draw: (g: CanvasRenderingContext2D) => void, rx = 1, ry = 1) => {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};
/** Облезлые советские обои: полосы, ромбики, потёртости, пятна. */
const wallpaper = () =>
  canvasTex(512, 512, (g) => {
    g.fillStyle = "#6f6a55";
    g.fillRect(0, 0, 512, 512);
    for (let x = 0; x < 512; x += 64) {
      g.fillStyle = "#7b765f";
      g.fillRect(x, 0, 30, 512);
      for (let y = 0; y < 512; y += 48) {
        g.fillStyle = "#5e5a48";
        g.beginPath();
        g.moveTo(x + 47, y + 6);
        g.lineTo(x + 56, y + 24);
        g.lineTo(x + 47, y + 42);
        g.lineTo(x + 38, y + 24);
        g.fill();
      }
    }
    for (let i = 0; i < 26; i++) {
      g.fillStyle = `rgba(${rnd(i) > 0.5 ? "190,180,150" : "40,36,28"},${0.08 + rnd(i + 3) * 0.14})`;
      g.beginPath();
      g.ellipse(rnd(i + 1) * 512, rnd(i + 2) * 512, 10 + rnd(i + 4) * 50, 6 + rnd(i + 5) * 30, rnd(i) * 3, 0, 7);
      g.fill();
    }
    for (let i = 0; i < 3000; i++) {
      g.fillStyle = `rgba(0,0,0,${rnd(i + 9) * 0.08})`;
      g.fillRect(rnd(i + 10) * 512, rnd(i + 11) * 512, 1.5, 1.5);
    }
  }, 3, 1.4);
const fabric = (base: string) =>
  canvasTex(256, 256, (g) => {
    g.fillStyle = base;
    g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 256; i += 4) {
      g.fillStyle = "rgba(255,255,255,0.03)";
      g.fillRect(0, i, 256, 1);
      g.fillStyle = "rgba(0,0,0,0.05)";
      g.fillRect(i, 0, 1, 256);
    }
  }, 4, 4);
/** Ночной город: панельки с редкими тёплыми окнами. */
const city = () =>
  canvasTex(2048, 512, (g) => {
    const sky = g.createLinearGradient(0, 0, 0, 512);
    sky.addColorStop(0, "#0b1226");
    sky.addColorStop(1, "#1d2a4a");
    g.fillStyle = sky;
    g.fillRect(0, 0, 2048, 512);
    let x = 0;
    let i = 0;
    while (x < 2048) {
      const w = 140 + rnd(i) * 160;
      const h = 220 + rnd(i + 1) * 240;
      g.fillStyle = i % 2 ? "#0d111c" : "#121725";
      g.fillRect(x, 512 - h, w, h);
      for (let wy = 512 - h + 16; wy < 500; wy += 26) {
        for (let wx = x + 12; wx < x + w - 14; wx += 22) {
          const on = rnd(wx * 0.13 + wy * 0.7) > 0.86;
          g.fillStyle = on ? (rnd(wx + wy) > 0.5 ? "#f5c56b" : "#e8a447") : "#1a2032";
          g.fillRect(wx, wy, 12, 14);
        }
      }
      x += w + 10;
      i += 2;
    }
  });
const tulleTex = () =>
  canvasTex(128, 512, (g) => {
    g.clearRect(0, 0, 128, 512);
    g.fillStyle = "rgba(235,235,225,0.35)";
    g.fillRect(0, 0, 128, 512);
    g.strokeStyle = "rgba(255,255,255,0.45)";
    for (let y = 0; y < 512; y += 32) {
      g.beginPath();
      g.arc(64, y, 14, 0, 7);
      g.stroke();
    }
  });
const clockTex = () =>
  canvasTex(256, 128, (g) => {
    g.fillStyle = "#050505";
    g.fillRect(0, 0, 256, 128);
    g.fillStyle = "#ff2020";
    g.shadowColor = "#ff0000";
    g.shadowBlur = 18;
    g.font = "bold 86px monospace";
    g.textAlign = "center";
    g.fillText("03:17", 128, 96);
  });
const glowTex = () =>
  canvasTex(128, 128, (g) => {
    const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, "rgba(255,255,255,1)");
    r.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = r;
    g.fillRect(0, 0, 128, 128);
  });


/* ── монстр и картина: рисуем прямо в canvas (Path2D из SVG-путей) — синхронно, без загрузки ── */
const drawTex = (draw: (g: CanvasRenderingContext2D) => void) => {
  const c = document.createElement("canvas");
  c.width = 1080;
  c.height = 1920;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
};
const portraitTex = () =>
  drawTex((g) => {
    g.fillStyle = "#d9cfb8";
    g.fillRect(0, 0, 1080, 1920);
    g.fillStyle = "#9fb3c8";
    g.fillRect(60, 60, 960, 1800);
    const f = (d: string, c: string) => {
      g.fillStyle = c;
      g.fill(new Path2D(d));
    };
    f("M160 1100 C200 940 560 940 600 1100 L620 1860 L140 1860 Z", "#b5446b");
    g.fillStyle = "#e8c4a4";
    g.beginPath();
    g.ellipse(380, 760, 170, 200, 0, 0, Math.PI * 2);
    g.fill();
    f("M200 700 C200 460 560 460 560 700 C560 600 420 560 380 560 C320 560 220 600 200 700 Z", "#7a4a2c");
    f("M560 1360 C600 1240 800 1240 840 1360 L860 1860 L540 1860 Z", "#4a6fa5");
    g.fillStyle = "#e8c4a4";
    g.beginPath();
    g.ellipse(700, 1060, 130, 150, 0, 0, Math.PI * 2);
    g.fill();
    f("M570 1010 C580 880 830 880 830 1010 L790 990 L760 1030 L730 985 L700 1030 L670 985 L640 1030 L610 990 Z", "#3a2a22");
    g.fillStyle = "#222";
    for (const [x, y] of [[330, 740], [430, 740], [655, 1050], [745, 1050]]) {
      g.beginPath();
      g.arc(x, y, 14, 0, Math.PI * 2);
      g.fill();
    }
  });

/* ── объём света из окна: трапеция от проёма к кровати и полу ── */
const beamGeo = () => {
  const g = new THREE.BufferGeometry();
  const a = [[-0.72, 0.76, -3.15], [0.72, 0.76, -3.15], [0.72, 2.05, -3.15], [-0.72, 2.05, -3.15]];
  const b = [[-1.05, 0.0, -0.9], [0.95, 0.0, -0.9], [0.85, 0.62, -0.2], [-0.95, 0.62, -0.2]];
  const v = [...a, ...b].flat();
  const idx = [0, 1, 5, 0, 5, 4, 1, 2, 6, 1, 6, 5, 2, 3, 7, 2, 7, 6, 3, 0, 4, 3, 4, 7];
  g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
  g.setIndex(idx);
  return g;
};
/** Одеяло со складками в ногах. */
const blanketGeo = () => {
  const g = new THREE.PlaneGeometry(1.02, 2.4, 40, 60);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i); // вдоль кровати: −1.2 (ноги) … +1.2 (голова)
    const feet = Math.max(0, -y - 0.4);
    const h = 0.06 + Math.sin(x * 9 + y * 3) * 0.02 * (1 + feet * 2) + Math.cos(y * 14) * 0.015 * feet + (y < -0.9 ? 0.12 * Math.exp(-((y + 1.1) ** 2) * 30) : 0) - Math.abs(x) ** 3 * 0.25;
    p.setZ(i, h);
  }
  g.computeVertexNormals();
  return g;
};

/** Поза камеры у изголовья (fov 60) — общая для 3D-сцены и 2D-слоя монстра. */
export const camPose = (s: BedState) => {
  const breath = Math.sin(s.t * 4.2); // breathCycle из ТЗ
  const beat = ((s.t * (s.bpm ?? 118)) / 60) % 1;
  const pulse = beat < 0.1 ? 1 - beat / 0.1 : 0;
  const br = breath * 0.012;
  const sh = s.cam.shake ? (Math.sin(s.t * 47) * 0.004 + Math.cos(s.t * 61) * 0.003) * s.cam.shake : 0;
  return { pos: [0.1 + sh, 1.02 + br + s.cam.y, 1.35] as [number, number, number], rot: [-0.13 + s.cam.pitch + sh, s.cam.yaw, 0] as [number, number, number], fov: 59.25 + 1.25 * breath - 0.6 * pulse };
};
const projCam = new THREE.PerspectiveCamera(60, 1080 / 1920, 0.03, 60);
/** Мировая точка → пиксели кадра 1080×1920 и масштаб «пикселей на метр» на этой глубине. */
export const project = (s: BedState, p: [number, number, number]) => {
  const c = camPose(s);
  projCam.position.set(...c.pos);
  projCam.rotation.set(c.rot[0], c.rot[1], c.rot[2], "YXZ");
  projCam.updateMatrixWorld(true);
  const v = new THREE.Vector3(...p);
  const depth = v.clone().applyMatrix4(projCam.matrixWorldInverse).z * -1;
  v.project(projCam);
  return { x: (v.x * 0.5 + 0.5) * 1080, y: (-v.y * 0.5 + 0.5) * 1920, ppm: 1920 / (2 * Math.tan((c.fov * Math.PI) / 360) * Math.max(0.1, depth)) };
};
const Rig = ({ s }: { s: BedState }) => {
  const camera = useThree((st) => st.camera) as THREE.PerspectiveCamera;
  const c = camPose(s);
  camera.fov = c.fov;
  camera.near = 0.03;
  camera.far = 60;
  camera.updateProjectionMatrix();
  camera.position.set(...c.pos);
  camera.rotation.set(c.rot[0], c.rot[1], c.rot[2], "YXZ");
  camera.updateMatrixWorld(true);
  return null;
};

const Room = ({ s }: { s: BedState }) => {
  const m = useMemo(() => {
    const wp = wallpaper();
    return {
      wall: new THREE.MeshStandardMaterial({ map: wp, roughness: 0.95 }),
      floor: new THREE.MeshStandardMaterial({ color: "#3a2a1e", roughness: 0.8 }),
      wood: new THREE.MeshStandardMaterial({ color: "#5a3c26", roughness: 0.7 }),
      frame: new THREE.MeshStandardMaterial({ color: "#d8d2c4", roughness: 0.6 }),
      glass: new THREE.MeshStandardMaterial({ color: "#9fb7e0", transparent: true, opacity: 0.12, roughness: 0.1 }),
      blanket: new THREE.MeshStandardMaterial({ map: fabric("#3b4766"), roughness: 0.95 }),
      sheet: new THREE.MeshStandardMaterial({ color: "#c9cdd6", roughness: 0.9 }),
      dark: new THREE.MeshBasicMaterial({ color: "#020203" }),
      city: new THREE.MeshBasicMaterial({ map: city() }),
      tulle: new THREE.MeshStandardMaterial({ map: tulleTex(), transparent: true, side: THREE.DoubleSide, depthWrite: false }),
      clock: new THREE.MeshBasicMaterial({ map: clockTex() }),
      beam: new THREE.MeshBasicMaterial({ color: "#6b8cce", transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }),
      clay: new THREE.MeshStandardMaterial({ color: "#a0522d", roughness: 0.8 }),
      cactus: new THREE.MeshStandardMaterial({ color: "#2f5a35", roughness: 0.7 }),
      leaf: new THREE.MeshStandardMaterial({ color: "#2e6b3a", roughness: 0.6 }),
      spike: new THREE.MeshBasicMaterial({ color: "#dfe6d8" }),
      lamp: new THREE.SpriteMaterial({ map: glowTex(), color: "#f5a642", blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }),
      redGlow: new THREE.SpriteMaterial({ map: glowTex(), color: "#ff2020", blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.5 }),
      carW: new THREE.SpriteMaterial({ map: glowTex(), color: "#fff2c0", blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }),
      carR: new THREE.SpriteMaterial({ map: glowTex(), color: "#ff3030", blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }),
      dust: new THREE.PointsMaterial({ color: "#c8d6ff", size: 0.012, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false }),
      beamGeo: beamGeo(),
      blanketGeo: blanketGeo(),
      dustGeo: (() => {
        const g = new THREE.BufferGeometry();
        const v: number[] = [];
        for (let i = 0; i < 400; i++) {
          const k = rnd(i);
          v.push(-0.8 + rnd(i + 1) * 1.6, 0.2 + rnd(i + 2) * 1.7 * (1 - k * 0.6), -3.1 + k * 2.8);
        }
        g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
        return g;
      })(),
    };
  }, []);
  const portrait = useMemo(() => portraitTex(), []);
  const B = (p: [number, number, number], sz: [number, number, number], mat: THREE.Material, cast = true) => (
    <mesh position={p} castShadow={cast} receiveShadow>
      <boxGeometry args={sz} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
  const sway = s.open > 0 ? Math.sin(s.t * 2.3) * 0.25 * s.open : 0;
  const wf = 0.05;
  return (
    <group>
      {/* стены с проёмом окна и двери */}
      {B([-1.4, 1.4, -3.25], [1.2, 2.8, 0.1], m.wall)}
      {B([1.4, 1.4, -3.25], [1.2, 2.8, 0.1], m.wall)}
      {B([0, 2.45, -3.25], [1.6, 0.7, 0.1], m.wall)}
      {B([0, 0.35, -3.25], [1.6, 0.7, 0.1], m.wall)}
      {B([-2.05, 1.4, -0.6], [0.1, 2.8, 5.4], m.wall)}
      {B([2.05, 1.4, -0.275], [0.1, 2.8, 4.15], m.wall)}
      {B([2.05, 2.45, -2.75], [0.1, 0.7, 0.8], m.wall)}
      {B([2.6, 1.0, -2.75], [1.0, 2.1, 0.8], m.dark, false)}
      {/* отошедший край обоев у окна */}
      <mesh position={[0.93, 2.05, -3.17]} rotation={[0.25, -0.35, 0.1]}>
        <planeGeometry args={[0.16, 0.42]} />
        <primitive object={m.wall} attach="material" />
      </mesh>
      {B([0, 2.85, -0.6], [4.2, 0.1, 5.4], m.wall, false)}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -0.6]} receiveShadow>
        <planeGeometry args={[4.2, 5.4]} />
        <primitive object={m.floor} attach="material" />
      </mesh>
      {/* город и улица */}
      <mesh position={[0, 3.5, -16]}>
        <planeGeometry args={[44, 11]} />
        <primitive object={m.city} attach="material" />
      </mesh>
      {[-6, -2, 2, 6].map((x) => <sprite key={x} material={m.lamp} position={[x, 0.2, -9]} scale={[1.6, 1.6, 1]} />)}
      {[0, 1].map((i) => {
        const cx = ((s.t * (i ? -2.2 : 1.8) + i * 9) % 22) - 11;
        return <sprite key={i} material={i ? m.carR : m.carW} position={[cx, -0.6, -10 - i]} scale={[0.6, 0.35, 1]} />;
      })}
      {/* окно: рама с крестом, правая створка открывается внутрь */}
      {B([0, 0.73, -3.18], [1.62, wf, 0.12], m.frame)}
      {B([0, 2.08, -3.18], [1.62, wf, 0.12], m.frame)}
      {B([-0.8, 1.4, -3.18], [wf, 1.4, 0.12], m.frame)}
      {B([0.8, 1.4, -3.18], [wf, 1.4, 0.12], m.frame)}
      <group position={[-0.4, 1.4, -3.18]}>
        {B([0, 0, 0], [wf * 0.8, 1.32, 0.06], m.frame)}
        {B([0, 0.05, 0], [0.76, wf * 0.8, 0.06], m.frame)}
        {B([0.39, 0, 0], [wf * 0.6, 1.32, 0.06], m.frame)}
        <mesh><planeGeometry args={[0.78, 1.32]} /><primitive object={m.glass} attach="material" /></mesh>
      </group>
      <group position={[0.8, 1.4, -3.18]} rotation={[0, ((32 * Math.PI) / 180) * s.open, 0]}>
        <group position={[-0.4, 0, 0]}>
          {B([0, 0, 0], [wf * 0.8, 1.32, 0.06], m.frame)}
          {B([0, 0.05, 0], [0.76, wf * 0.8, 0.06], m.frame)}
          {B([-0.39, 0, 0], [wf * 0.6, 1.32, 0.06], m.frame)}
          <mesh><planeGeometry args={[0.78, 1.32]} /><primitive object={m.glass} attach="material" /></mesh>
        </group>
      </group>
      {/* подоконник: кактус слева, мамины цветы справа */}
      {B([0, 0.7, -3.05], [1.8, 0.04, 0.3], m.frame)}
      <group position={[-0.55, 0.72, -3.05]}>
        <mesh position={[0, 0.06, 0]} castShadow><cylinderGeometry args={[0.07, 0.055, 0.12, 16]} /><primitive object={m.clay} attach="material" /></mesh>
        <mesh position={[0, 0.24, 0]} castShadow><capsuleGeometry args={[0.045, 0.2, 6, 12]} /><primitive object={m.cactus} attach="material" /></mesh>
        <mesh position={[0.06, 0.26, 0]} rotation={[0, 0, -0.9]} castShadow><capsuleGeometry args={[0.025, 0.06, 4, 8]} /><primitive object={m.cactus} attach="material" /></mesh>
        {Array.from({ length: 14 }, (_, i) => <mesh key={i} position={[Math.cos(i * 1.7) * 0.05, 0.14 + (i % 7) * 0.035, Math.sin(i * 1.7) * 0.05]} rotation={[0, 0, Math.cos(i * 1.7) * 1.4]}><coneGeometry args={[0.004, 0.03, 4]} /><primitive object={m.spike} attach="material" /></mesh>)}
      </group>
      {[0.42, 0.62].map((x, j) => (
        <group key={x} position={[x, 0.72, -3.05]}>
          <mesh position={[0, 0.06, 0]} castShadow><cylinderGeometry args={[0.065, 0.05, 0.12, 16]} /><primitive object={m.clay} attach="material" /></mesh>
          {Array.from({ length: 7 }, (_, i) => <mesh key={i} position={[Math.cos(i * 0.9 + j) * 0.06, 0.2 + (i % 3) * 0.05, Math.sin(i * 0.9) * 0.04]} rotation={[0.4, i, Math.cos(i) * 0.8]} scale={[0.05, 0.11, 0.015]} castShadow><sphereGeometry args={[1, 10, 8]} /><primitive object={m.leaf} attach="material" /></mesh>)}
        </group>
      ))}
      {/* тюль: по 7% ширины окна слева и справа */}
      <mesh position={[-0.69, 1.4, -3.08]} rotation={[0, sway, 0]}><planeGeometry args={[0.112, 1.42]} /><primitive object={m.tulle} attach="material" /></mesh>
      <mesh position={[0.69, 1.4, -3.08]} rotation={[0, -sway * 1.4, Math.sin(s.t * 1.7) * 0.03 * s.open]}><planeGeometry args={[0.112, 1.42]} /><primitive object={m.tulle} attach="material" /></mesh>
      {/* картина мамы и сына справа от окна */}
      {B([1.45, 1.55, -3.17], [0.46, 0.62, 0.03], m.wood)}
      {portrait && (
        <mesh position={[1.45, 1.55, -3.15]}>
          <planeGeometry args={[0.38, 0.54]} />
          <meshStandardMaterial map={portrait} roughness={0.8} />
        </mesh>
      )}
      {/* тумбочка с часами 03:17 */}
      {B([-0.8, 0.27, -2.1], [0.42, 0.54, 0.42], m.wood)}
      {B([-0.76, 0.6, -2.1], [0.24, 0.11, 0.08], m.dark)}
      <mesh position={[-0.76, 0.6, -2.055]}><planeGeometry args={[0.22, 0.1]} /><primitive object={m.clock} attach="material" /></mesh>
      <sprite material={m.redGlow} position={[-0.76, 0.6, -2.02]} scale={[0.4, 0.3, 1]} />
      <pointLight position={[-0.76, 0.65, -1.95]} color="#ff2020" intensity={0.25} distance={1.2} />
      {/* кровать: изножье, простыня, одеяло со складками */}
      {B([0, 0.25, -0.35], [1.1, 0.3, 2.6], m.wood)}
      {B([0, 0.31, -1.7], [1.15, 0.62, 0.06], m.wood)}
      {B([0, 0.42, -0.35], [1.04, 0.08, 2.5], m.sheet)}
      {B([0, 0.52, 0.72], [0.8, 0.14, 0.42], m.sheet)}
      {B([0, 0.36, 1.05], [1.15, 0.72, 0.06], m.wood)}
      <mesh geometry={m.blanketGeo} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.47, -0.25]} castShadow receiveShadow>
        <primitive object={m.blanket} attach="material" />
      </mesh>
      {/* объёмный луч и пылинки */}
      <mesh geometry={m.beamGeo} material={m.beam} scale={[1 + s.beam * 0.15, 1, 1]} />
      <points geometry={m.dustGeo} material={m.dust} position={[Math.sin(s.t * 0.3) * 0.05, Math.sin(s.t * 0.2) * 0.03, 0]} />
    </group>
  );
};

export const Bedroom3D = ({ s }: { s: BedState }) => (
  <ThreeCanvas width={1080} height={1920} shadows="soft" dpr={1} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.78, preserveDrawingBuffer: true }}>
    <color attach="background" args={["#05070d"]} />
    <fogExp2 attach="fog" args={["#0b1214", 0.11]} />
    <Rig s={s} />
    <ambientLight color="#2c3a4a" intensity={0.55} />
    <hemisphereLight args={["#3a4a66", "#0e0c08", 0.35]} />
    <pointLight position={[0, 1.9, -2.3]} color="#6f89c4" intensity={2.6} distance={6} decay={1.8} />
    <pointLight position={[0.2, 1.7, 0.3]} color="#1e2a40" intensity={0.8} distance={4} />
    <directionalLight position={[0.3, 3.6, -7.5]} color="#8fa8e0" intensity={1.3 + s.beam * 0.35} castShadow shadow-mapSize={[1024, 1024]} shadow-radius={8} shadow-camera-left={-3} shadow-camera-right={3} shadow-camera-top={3} shadow-camera-bottom={-3} shadow-camera-near={1} shadow-camera-far={14} shadow-bias={-0.0008} />
    <Room s={s} />
  </ThreeCanvas>
);
