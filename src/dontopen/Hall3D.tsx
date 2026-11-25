import React, { useEffect, useMemo, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { Outlines, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { clamp } from "../components/fx";
import { lamp } from "../train/lamp";
import { Box, CamRig, Dust, INK, makeTex, OL, rnd, useMonsterTexture, type Pose } from "../train/Pov3D";

/**
 * «Не открывай», серия 1 — обжитая 3D-квартира: спальня → кухня → прихожая → подъезд.
 * Всё анимируется от глобального времени серии g, поэтому флеш-форвард показывает настоящий кадр кульминации.
 */
const FPS = 30;
const W = 1080;
const H = 1920;
const PHONE = "#b8dcff";
const WARM = "#d9a043";

// геометрия (метры): коридор вдоль −z, спальня у z=0, входная дверь на z=DOOR, кухня слева у z≈−1.2
const HW = 0.72;
const DOOR = -4.2;
const KZ = -1.2; // центр кухонного проёма
const WR = { x: 0.43, z: -2.85, w: 0.56, len: 0.9, h: 2.1 };
const WR_FRONT = WR.x - WR.w / 2;
const HINGE_Z = WR.z - WR.len / 2;
const GAP_Z = WR.z; // щель между створками

export const T = {
  hallIn: 7.0,
  kitchenLook: 7.5,
  atDoor: 10.4,
  wardrobe: 20.0,
  eyes: 20.6,
  chain: 36.0,
  fingers: 38.0,
  silence: 43.6,
  burst: 44.0,
  end: 49.75,
  finale: 50.25,
};

// ── процедурные текстуры ─────────────────────────────────────────────
const canvasTex = (S: number, draw: (g: CanvasRenderingContext2D) => void, rx = 1, ry = 1) => {
  const c = document.createElement("canvas");
  c.width = S;
  c.height = S;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};
const grain = (g: CanvasRenderingContext2D, S: number, seed: number, a = 0.1, n = 4000) => {
  for (let i = 0; i < n; i++) {
    g.fillStyle = `rgba(0,0,0,${rnd(i + seed) * a})`;
    g.fillRect(rnd(i + seed + 1) * S, rnd(i + seed + 2) * S, 1.5, 1.5);
  }
};
export const makeWallpaper = () =>
  canvasTex(
    512,
    (g) => {
      g.fillStyle = "#7d7458";
      g.fillRect(0, 0, 512, 512);
      for (let x = 0; x < 512; x += 64) {
        g.fillStyle = "rgba(60,52,36,.35)";
        g.fillRect(x, 0, 10, 512);
        g.fillStyle = "rgba(160,150,110,.18)";
        g.fillRect(x + 26, 0, 4, 512);
      }
      for (let i = 0; i < 90; i++) {
        const x = (i % 8) * 64 + 44;
        const y = Math.floor(i / 8) * 46 + (i % 2) * 23;
        g.fillStyle = "rgba(90,70,45,.35)";
        g.beginPath();
        g.ellipse(x, y, 7, 10, 0.4, 0, Math.PI * 2);
        g.ellipse(x + 8, y - 6, 5, 7, -0.5, 0, Math.PI * 2);
        g.fill();
      }
      for (let i = 0; i < 40; i++) {
        g.fillStyle = `rgba(40,30,15,${0.04 + rnd(i + 3000) * 0.08})`;
        g.beginPath();
        g.ellipse(rnd(i + 3001) * 512, rnd(i + 3002) * 512, 20 + rnd(i + 3003) * 70, 30 + rnd(i + 3004) * 90, 0, 0, Math.PI * 2);
        g.fill();
      }
      grain(g, 512, 3100);
    },
    2.5,
    1.5,
  );
const makeParquet = () =>
  canvasTex(
    512,
    (g) => {
      g.fillStyle = "#5a3a22";
      g.fillRect(0, 0, 512, 512);
      for (let y = 0; y < 512; y += 32)
        for (let x = 0; x < 512; x += 128) {
          const o = (y / 32) % 2 ? 64 : 0;
          g.fillStyle = `rgb(${90 + rnd(x + y) * 40},${55 + rnd(x * 3 + y) * 25},${30 + rnd(x + y * 7) * 15})`;
          g.fillRect(x + o, y, 126, 30);
          g.strokeStyle = "rgba(20,10,5,.6)";
          g.strokeRect(x + o, y, 126, 30);
        }
      grain(g, 512, 3200, 0.15, 3000);
    },
    1.5,
    4,
  );
const makeLeather = () =>
  canvasTex(
    256,
    (g) => {
      g.fillStyle = "#4a2a1c";
      g.fillRect(0, 0, 256, 256);
      g.strokeStyle = "rgba(15,6,3,.7)";
      g.lineWidth = 3;
      for (let k = -256; k < 512; k += 64) {
        g.beginPath();
        g.moveTo(k, 0);
        g.lineTo(k + 256, 256);
        g.moveTo(k, 256);
        g.lineTo(k + 256, 0);
        g.stroke();
      }
    },
    1.4,
    3,
  );
const makeConcrete = () =>
  canvasTex(
    512,
    (g) => {
      g.fillStyle = "#7a7a72";
      g.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 160; i++) {
        g.fillStyle = `rgba(${rnd(i + 5000) > 0.5 ? "30,30,28" : "190,190,180"},${0.03 + rnd(i + 5001) * 0.07})`;
        g.beginPath();
        g.ellipse(rnd(i + 5002) * 512, rnd(i + 5003) * 512, 10 + rnd(i + 5004) * 60, 8 + rnd(i + 5005) * 40, 0, 0, Math.PI * 2);
        g.fill();
      }
      g.fillStyle = "rgba(50,70,50,.35)";
      g.fillRect(0, 300, 512, 212); // зелёная краска снизу, как в подъездах
      g.fillStyle = "rgba(20,25,20,.5)";
      g.fillRect(0, 296, 512, 6);
      grain(g, 512, 5100, 0.18, 6000);
    },
    2,
    1,
  );
const makeRug = () =>
  canvasTex(256, (g) => {
    g.fillStyle = "#5a1e1e";
    g.fillRect(0, 0, 256, 256);
    g.strokeStyle = "#a07a3a";
    g.lineWidth = 6;
    g.strokeRect(16, 16, 224, 224);
    g.strokeStyle = "#2a1010";
    g.lineWidth = 3;
    for (let k = 0; k < 6; k++) g.strokeRect(40 + k * 14, 40 + k * 14, 176 - k * 28, 176 - k * 28);
    grain(g, 256, 5200, 0.25, 3000);
  });
/** Надписи кровью на бетоне: стекающие буквы. */
const makeBloodText = (font: string) =>
  canvasTex(1024, (g) => {
    g.clearRect(0, 0, 1024, 1024);
    const F = `"${font.replace(/"/g, "")}"`;
    const line = (txt: string, y: number, size: number, maxW: number) => {
      let s = size;
      g.font = `${s}px ${F}`;
      while (g.measureText(txt).width > maxW && s > 10) g.font = `${--s}px ${F}`;
      const w = g.measureText(txt).width;
      const x0 = 512 - w / 2;
      g.fillStyle = "rgba(18,2,3,.97)";
      g.fillText(txt, x0, y);
      g.fillStyle = "rgba(60,6,8,.7)";
      g.fillText(txt, x0 + 2, y - 2);
      // потёки вниз из букв
      for (let i = 0; i < Math.floor(w / 26); i++) {
        const x = x0 + rnd(i + y) * w;
        const len = 20 + rnd(i + y + 7) * size * 1.4;
        g.strokeStyle = "rgba(22,2,3,.9)";
        g.lineWidth = 2 + rnd(i + y + 3) * 5;
        g.beginPath();
        g.moveTo(x, y - 4);
        g.bezierCurveTo(x + 2, y + len * 0.4, x - 2, y + len * 0.7, x + 1, y + len);
        g.stroke();
        g.fillStyle = "rgba(22,2,3,.95)";
        g.beginPath();
        g.arc(x + 1, y + len, g.lineWidth * 0.9, 0, Math.PI * 2);
        g.fill();
      }
    };
    g.textBaseline = "alphabetic";
    line("1 — ШАГНУТЬ В ПОДЪЕЗД", 280, 96, 900);
    line("2 — ЗАПЕРЕТЬСЯ В ВАННОЙ", 470, 96, 900);
    line("ПИШИ 1 ИЛИ 2 В КОММЕНТАРИЯХ", 690, 52, 840);
    line("ПРОДОЛЖЕНИЕ ПО ВЫБОРУ БОЛЬШИНСТВА", 800, 40, 820);
  });

/** Ткань со складками: цилиндр-колокол с волнами по низу (пальто, куртки). */
const coatGeo = (len: number, r0: number, r1: number) => {
  const g = new THREE.CylinderGeometry(r0, r1, len, 24, 10, true);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    const z = p.getZ(i);
    const a = Math.atan2(z, x);
    const k = (len / 2 - y) / len; // 0 сверху → 1 снизу
    const fold = 1 + Math.sin(a * 7 + k * 2) * 0.09 * k + Math.sin(a * 13) * 0.03 * k;
    p.setX(i, x * fold);
    p.setZ(i, z * fold * 0.55); // приплюснуто к стене
  }
  g.computeVertexNormals();
  return g;
};

const useHallMats = () =>
  useMemo(() => {
    const std = (color: string, o: Partial<THREE.MeshStandardMaterialParameters> = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...o });
    return {
      wall: std("#b8ad8c", { roughness: 0.9, map: makeWallpaper() }),
      floor: std("#9a7a5a", { roughness: 0.75, map: makeParquet() }),
      ceil: std("#8f8a7a", { roughness: 1, map: makeTex("grime", 2, 4) }),
      wood: std("#6b4528", { roughness: 0.65, map: makeTex("grime", 1, 2) }),
      woodDark: std("#3b2414", { roughness: 0.7, map: makeTex("grime", 1, 2) }),
      leather: std("#7a4a33", { roughness: 0.55, map: makeLeather() }),
      metal: std("#b9b2a0", { roughness: 0.3, metalness: 0.8 }),
      brass: std("#c9a25a", { roughness: 0.35, metalness: 0.85 }),
      chrome: std("#d8d8d0", { roughness: 0.18, metalness: 0.95 }),
      coatGreen: std("#2f3a33", { roughness: 0.95, map: makeTex("fabric", 1, 2), side: THREE.DoubleSide }),
      coatBrown: std("#5a4632", { roughness: 0.95, map: makeTex("fabric", 1, 2), side: THREE.DoubleSide }),
      coatMom: std("#6e1f24", { roughness: 0.9, map: makeTex("fabric", 1, 2), side: THREE.DoubleSide }),
      black: std("#050403", { roughness: 1 }),
      white: std("#d9d4c4", { roughness: 0.45, map: makeTex("grime", 1, 1) }),
      tile: std("#9aa59a", { roughness: 0.4, map: makeTex("grime", 3, 3) }),
      mirror: std("#141a1c", { roughness: 0.05, metalness: 0.9 }),
      paper: std("#cfc7b0", { roughness: 1 }),
      mug: std("#c0392b", { roughness: 0.4 }),
      skin: std("#8f8674", { roughness: 0.85, map: makeTex("grime", 2, 2) }),
      skinDark: std("#4f473c", { roughness: 0.9 }),
      claw: std("#1a1410", { roughness: 0.4 }),
      concrete: std("#8a8a82", { roughness: 0.95, map: makeConcrete() }),
      rug: std("#7a3030", { roughness: 1, map: makeRug() }),
      slipper: std("#3d4d63", { roughness: 0.9 }),
      plastic: std("#d8d2c0", { roughness: 0.5 }),
      magnet: ["#e74c3c", "#f1c40f", "#3498db", "#2ecc71"].map((c) => std(c, { roughness: 0.4 })),
    };
  }, []);
type HM = ReturnType<typeof useHallMats>;

// ── камера ───────────────────────────────────────────────────────────
type K = { t: number; x: number; y: number; z: number; yaw: number; pitch: number; fov: number };
const D = DOOR;
const KEYS: K[] = [
  { t: 7.0, x: 0.05, y: 1.6, z: 0.6, yaw: 0.1, pitch: -0.05, fov: 70 },
  { t: 7.5, x: 0.0, y: 1.6, z: -0.5, yaw: 0.3, pitch: -0.05, fov: 70 },
  // взгляд налево в тёплую кухню
  { t: 8.1, x: -0.05, y: 1.6, z: -1.0, yaw: 1.25, pitch: -0.08, fov: 66 },
  { t: 8.6, x: -0.05, y: 1.6, z: -1.3, yaw: 1.15, pitch: -0.08, fov: 66 },
  // мимо вешалки с бордовым пальто
  { t: 9.2, x: 0.15, y: 1.6, z: -1.45, yaw: 0.55, pitch: -0.15, fov: 66 },
  // взгляд вниз на щель под дверью: свет есть, тени ног нет
  { t: 10.0, x: 0.05, y: 1.45, z: -2.75, yaw: 0.0, pitch: -0.78, fov: 62 },
  { t: 10.6, x: 0.04, y: 1.56, z: -3.58, yaw: 0.0, pitch: 0.02, fov: 64 },
  // рука к замку (13.8–16.0)
  { t: 13.8, x: 0.1, y: 1.58, z: -3.3, yaw: 0.05, pitch: 0.02, fov: 66 },
  { t: 16.0, x: 0.1, y: 1.58, z: -3.36, yaw: 0.04, pitch: 0.0, fov: 66 },
  // оглядка на шкаф: два глаза на разной высоте
  { t: 20.0, x: 0.08, y: 1.58, z: -3.4, yaw: 0.0, pitch: 0.0, fov: 64 },
  { t: 20.6, x: -0.35, y: 1.58, z: -3.75, yaw: -2.63, pitch: 0.06, fov: 58 },
  { t: 24.3, x: -0.33, y: 1.56, z: -3.7, yaw: -2.66, pitch: 0.08, fov: 52 },
  // мечется: дверь ↔ шкаф
  { t: 24.7, x: 0.0, y: 1.58, z: -3.5, yaw: 0.0, pitch: 0.02, fov: 64 },
  { t: 26.4, x: 0.0, y: 1.58, z: -3.5, yaw: 0.0, pitch: 0.02, fov: 64 },
  { t: 26.7, x: -0.33, y: 1.56, z: -3.72, yaw: -2.6, pitch: 0.05, fov: 58 },
  { t: 28.6, x: -0.33, y: 1.56, z: -3.7, yaw: -2.64, pitch: 0.05, fov: 56 },
  { t: 30.9, x: 0.0, y: 1.58, z: -3.5, yaw: -0.05, pitch: 0.02, fov: 64 },
  { t: 32.9, x: 0.0, y: 1.58, z: -3.45, yaw: 0.02, pitch: 0.02, fov: 62 },
  { t: 33.4, x: -0.33, y: 1.56, z: -3.72, yaw: -2.6, pitch: 0.05, fov: 58 },
  { t: 35.6, x: -0.33, y: 1.56, z: -3.68, yaw: -2.64, pitch: 0.05, fov: 54 },
  // крупно цепочка
  { t: 36.0, x: 0.22, y: 1.44, z: D + 0.36, yaw: -0.62, pitch: -0.04, fov: 36 },
  { t: 37.9, x: 0.25, y: 1.43, z: D + 0.31, yaw: -0.64, pitch: -0.04, fov: 34 },
  // отступ к стене и Dolly Zoom: дверь и шкаф в одном кадре
  // крупно щель шкафа: суставчатые пальцы ложатся на створку
  { t: 38.0, x: -0.3, y: 1.48, z: -2.3, yaw: -0.69, pitch: -0.02, fov: 46 },
  { t: 39.6, x: -0.28, y: 1.47, z: -2.36, yaw: -0.7, pitch: -0.02, fov: 42 },
  { t: 39.61, x: -0.38, y: 1.56, z: -0.9, yaw: -0.13, pitch: -0.03, fov: 55 },
  { t: 43.6, x: -0.4, y: 1.55, z: 0.45, yaw: -0.15, pitch: -0.03, fov: 42 },
  { t: 44.0, x: -0.4, y: 1.55, z: 0.45, yaw: -0.15, pitch: -0.03, fov: 42 },
  // финал: с порога, дверь распахнута в подъезд
  { t: 50.25, x: 0.0, y: 1.6, z: -3.05, yaw: 0.0, pitch: 0.06, fov: 62 },
  { t: 60.0, x: 0.0, y: 1.6, z: -3.35, yaw: 0.0, pitch: 0.06, fov: 58 },
];
const sm = (x: number) => x * x * (3 - 2 * x);
/** Резкие перебросы (≤0.35 с) — без сглаживания конца, как рывок головы. */
const keyAt = (g: number): K => {
  if (g <= KEYS[0].t) return KEYS[0];
  for (let i = 0; i < KEYS.length - 1; i++) {
    const a = KEYS[i];
    const b = KEYS[i + 1];
    if (g <= b.t) {
      if (b.t - a.t < 0.05) return b;
      const k = sm((g - a.t) / (b.t - a.t));
      const L = (p: keyof K) => (a[p] as number) + ((b[p] as number) - (a[p] as number)) * k;
      return { t: g, x: L("x"), y: L("y"), z: L("z"), yaw: L("yaw"), pitch: L("pitch"), fov: L("fov") };
    }
  }
  return KEYS[KEYS.length - 1];
};
// склейки внутри 3D: между ключами нет плавного перехода
const CUT_AT = [36.0, 38.0, 39.61, 50.25];
const keyAtCut = (g: number) => {
  for (const c of CUT_AT) if (g >= c && g < c + 0.0001) return keyAt(c + 0.0001);
  return keyAt(g);
};

/** Рывки ручки и цепочки снаружи (0..1). */
export const rattleK = (g: number) => {
  const seg = (a: number, b: number) => (g > a && g < b ? Math.min(1, (g - a) / 0.08, (b - g) / 0.15) : 0);
  return Math.max(seg(36.1, 37.0), seg(37.2, 37.95), seg(38.3, 39.4), seg(42.1, 43.5));
};

export const hallPose = (g: number): Pose => {
  const k = keyAtCut(g);
  let { x, y, z, yaw, pitch } = k;
  const walk = g > T.hallIn && g < T.atDoor ? 1 : 0;
  const ph = (g - T.hallIn) * Math.PI * 2 * 1.9;
  y += walk * Math.abs(Math.sin(ph)) * 0.025;
  let roll = walk * Math.sin(ph / 2) * 0.012;
  x += Math.sin(g * 1.3) * 0.006;
  y += Math.sin(g * 1.9) * 0.004;
  yaw += Math.sin(g * 0.7) * 0.006;
  // всхлипы: мелкая дрожь камеры
  if (g > 24.3 && g < 33) y += Math.sin(g * 9) * 0.004;
  // голландский угол во время допроса и дальше
  if (g < T.finale) roll += ((3.6 * Math.PI) / 180) * clamp((g - 24.3) / 0.6) * (1 - clamp((g - T.burst) / 0.3) * 0.4);
  const rat = rattleK(g);
  x += Math.sin(g * 73) * 0.004 * rat;
  roll += Math.sin(g * 51) * 0.008 * rat;
  if (g >= T.burst && g < T.finale) {
    const b = g - T.burst;
    const sh = Math.exp(-b * 2.2) * (b < 4.5 ? 1 : 0.3);
    x += Math.sin(b * 67) * 0.03 * sh;
    y += Math.sin(b * 89) * 0.025 * sh - 0.05 * clamp(b / 0.3);
    z += 0.08 * clamp(b / 0.3);
    roll += Math.sin(b * 41) * 0.05 * sh;
    pitch += 0.06 * clamp(b / 0.3);
  }
  if (g >= T.finale) {
    // дыхание на пороге
    y += Math.sin(g * 2.4) * 0.006;
    roll += Math.sin(g * 0.8) * 0.01;
  }
  return { x, y, z, yaw, pitch, roll, yawVel: 0, fov: k.fov };
};

// ── мебель и квартира ────────────────────────────────────────────────
const Coat = ({ z, m, len = 1.0, sw }: { z: number; m: THREE.Material; len?: number; sw: number }) => {
  const geo = useMemo(() => coatGeo(len, 0.1, 0.2), [len]);
  return (
    <group position={[-HW + 0.14, 1.8, z]} rotation={[sw, 0, 0]}>
      <mesh position={[0, -len / 2 - 0.04, 0]} geometry={geo} material={m} castShadow receiveShadow>
        <Outlines thickness={OL} color={INK} />
      </mesh>
      {/* плечики-воротник */}
      <mesh position={[0, -0.06, 0]} scale={[1, 0.5, 0.6]} material={m} castShadow>
        <sphereGeometry args={[0.13, 14, 10]} />
      </mesh>
    </group>
  );
};

const Kitchen = ({ g, hm }: { g: number; hm: HM }) => {
  const k = 0.85 + 0.15 * lamp(g + 11);
  return (
    <group>
      {/* проём в левой стене и сама кухня (x < −HW) */}
      <Box p={[-1.9, 0, KZ]} s={[2.4, 0.02, 2.2]} m={hm.tile} cast={false} />
      <Box p={[-1.9, 2.6, KZ]} s={[2.4, 0.02, 2.2]} m={hm.ceil} cast={false} />
      <Box p={[-3.1, 1.3, KZ]} s={[0.06, 2.6, 2.2]} m={hm.wall} cast={false} />
      <Box p={[-1.9, 1.3, KZ - 1.1]} s={[2.4, 2.6, 0.06]} m={hm.wall} cast={false} />
      <Box p={[-1.9, 1.3, KZ + 1.1]} s={[2.4, 2.6, 0.06]} m={hm.wall} cast={false} />
      {/* холодильник с магнитами */}
      <RoundedBox args={[0.62, 1.8, 0.6]} radius={0.05} position={[-2.7, 0.9, KZ - 0.72]} material={hm.white} castShadow receiveShadow>
        <Outlines thickness={OL} color={INK} />
      </RoundedBox>
      <Box p={[-2.38, 1.25, KZ - 0.72]} s={[0.02, 0.4, 0.03]} m={hm.chrome} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Box key={i} p={[-2.385, 1.1 + (i % 3) * 0.12, KZ - 0.9 + (i > 2 ? 0.25 : 0.05) + (i % 2) * 0.06]} s={[0.01, 0.05, 0.06]} m={hm.magnet[i % 4]} cast={false} />
      ))}
      {/* столешница, шкафы, микроволновка с часами */}
      <Box p={[-2.85, 0.45, KZ + 0.3]} s={[0.5, 0.9, 1.2]} m={hm.wood} ol />
      <Box p={[-2.85, 0.92, KZ + 0.3]} s={[0.54, 0.04, 1.24]} m={hm.plastic} ol />
      <Box p={[-2.9, 1.95, KZ + 0.3]} s={[0.36, 0.6, 1.2]} m={hm.wood} ol />
      {[0, 1, 2].map((i) => (
        <Box key={i} p={[-2.71, 1.75, KZ - 0.2 + i * 0.4]} s={[0.02, 0.1, 0.02]} m={hm.brass} />
      ))}
      <Box p={[-2.85, 1.08, KZ + 0.5]} s={[0.36, 0.28, 0.48]} m={hm.black} ol />
      <mesh position={[-2.66, 1.12, KZ + 0.62]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.1, 0.04]} />
        <meshStandardMaterial color="#2bff7a" emissive={new THREE.Color("#2bff7a")} emissiveIntensity={2.2} />
      </mesh>
      {/* стол с недопитой кружкой */}
      <Box p={[-1.8, 0.74, KZ]} s={[0.8, 0.04, 0.7]} m={hm.wood} ol />
      {[[-2.15, -0.3], [-1.45, -0.3], [-2.15, 0.3], [-1.45, 0.3]].map(([x, z], i) => (
        <Box key={i} p={[x, 0.36, KZ + z]} s={[0.04, 0.72, 0.04]} m={hm.woodDark} />
      ))}
      <mesh position={[-1.7, 0.81, KZ + 0.1]} material={hm.mug} castShadow>
        <cylinderGeometry args={[0.04, 0.035, 0.1, 16]} />
        <Outlines thickness={OL * 0.4} color={INK} />
      </mesh>
      {/* тёплая лампа над столом */}
      <mesh position={[-1.8, 1.95, KZ]}>
        <coneGeometry args={[0.2, 0.18, 16, 1, true]} />
        <meshStandardMaterial color="#c97a2a" emissive={new THREE.Color(WARM)} emissiveIntensity={0.6 * k} side={THREE.DoubleSide} />
      </mesh>
      <pointLight position={[-1.8, 1.8, KZ]} color={WARM} intensity={6 * k} distance={3.2} decay={1.6} castShadow shadow-mapSize-width={512} shadow-mapSize-height={512} />
    </group>
  );
};

const FrontDoor = ({ g, hm }: { g: number; hm: HM }) => {
  const rat = rattleK(g);
  const pull = rat * (0.012 + 0.014 * Math.abs(Math.sin(g * 23)));
  const open = g >= T.finale ? sm(clamp((g - T.finale - 0.15) / 0.9)) * 1.55 : 0;
  const handle = -rat * (0.35 + 0.25 * Math.sin(g * 31));
  const studs = useMemo(() => {
    const out: [number, number][] = [];
    for (let i = 0; i < 6; i++) for (let j = 0; j < 12; j++) out.push([-0.38 + i * 0.152, 0.12 + j * 0.165]);
    return out;
  }, []);
  // цепочка: натянута рывками; в финале сорвана
  const links = 9;
  return (
    <group>
      <Box p={[-0.5, 1.05, DOOR + 0.02]} s={[0.08, 2.15, 0.12]} m={hm.woodDark} ol />
      <Box p={[0.5, 1.05, DOOR + 0.02]} s={[0.08, 2.15, 0.12]} m={hm.woodDark} ol />
      <Box p={[0, 2.13, DOOR + 0.02]} s={[1.08, 0.08, 0.12]} m={hm.woodDark} ol />
      {/* дверь открывается наружу */}
      <group position={[-0.45, 0, DOOR]} rotation={[0, -pull * 3 - open, 0]}>
        <group position={[0.45, 0, 0]}>
          <Box p={[0, 1.03, 0]} s={[0.9, 2.06, 0.06]} m={hm.leather} ol />
          {studs.map(([x, y], i) => (
            <mesh key={i} position={[x, y, 0.035]} material={hm.brass}>
              <sphereGeometry args={[0.008, 6, 5]} />
            </mesh>
          ))}
          <mesh position={[0, 1.55, 0.035]} rotation={[Math.PI / 2, 0, 0]} material={hm.brass}>
            <cylinderGeometry args={[0.018, 0.02, 0.02, 16]} />
            <Outlines thickness={OL * 0.4} color={INK} />
          </mesh>
          {[1.32, 0.92].map((y) => (
            <Box key={y} p={[0.33, y, 0.04]} s={[0.07, 0.14, 0.02]} m={hm.metal} ol />
          ))}
          <group position={[0.33, 1.08, 0.06]} rotation={[0, 0, handle]}>
            <Box p={[-0.06, 0, 0.02]} s={[0.13, 0.025, 0.03]} m={hm.chrome} ol />
          </group>
          <Box p={[0.28, 1.42, 0.05]} s={[0.05, 0.03, 0.02]} m={hm.chrome} />
        </group>
      </group>
      {/* планка цепочки на коробке */}
      <Box p={[0.5, 1.42, DOOR + 0.09]} s={[0.035, 0.14, 0.02]} m={hm.chrome} ol />
      {g < T.finale &&
        Array.from({ length: links }, (_, i) => {
          const k = i / (links - 1);
          const sag = (1 - rat) * Math.sin(k * Math.PI) * 0.06;
          const jit = rat * Math.sin(g * 47 + i) * 0.005;
          return (
            <mesh key={i} position={[0.49 - k * 0.2, 1.42 - sag + jit, DOOR + 0.1 - k * 0.04 * (1 + rat)]} rotation={[Math.PI / 2, i % 2 ? Math.PI / 2 : 0, 0.15 * (1 - rat)]} material={hm.chrome} castShadow>
              <torusGeometry args={[0.02, 0.0055, 10, 16]} />
            </mesh>
          );
        })}
    </group>
  );
};

/** Кисть с суставчатыми пальцами и когтями (локально: пальцы вдоль −x). */
const Hand = ({ hm, curl = 0.5, spread = 1, s = 1 }: { hm: HM; curl?: number; spread?: number; s?: number }) => (
  <group scale={s}>
    <mesh scale={[1.3, 0.45, 1]} material={hm.skin} castShadow>
      <sphereGeometry args={[0.05, 12, 10]} />
      <Outlines thickness={OL * 0.4} color={INK} />
    </mesh>
    {[-0.035, -0.012, 0.012, 0.035].map((zz, i) => (
      <group key={i} position={[-0.05, 0, zz * spread]} rotation={[0, (i - 1.5) * 0.12 * spread, 0]}>
        {/* три фаланги, каждая следующая загнута сильнее */}
        <mesh position={[-0.045, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={hm.skin} castShadow>
          <capsuleGeometry args={[0.009, 0.07, 4, 8]} />
          <Outlines thickness={OL * 0.3} color={INK} />
        </mesh>
        <mesh position={[-0.09, 0, 0]} material={hm.skinDark}>
          <sphereGeometry args={[0.011, 8, 6]} />
        </mesh>
        <group position={[-0.09, 0, 0]} rotation={[0, 0, -curl * 0.9]}>
          <mesh position={[-0.04, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={hm.skin} castShadow>
            <capsuleGeometry args={[0.008, 0.06, 4, 8]} />
            <Outlines thickness={OL * 0.3} color={INK} />
          </mesh>
          <group position={[-0.08, 0, 0]} rotation={[0, 0, -curl * 1.1]}>
            <mesh position={[-0.025, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={hm.skin}>
              <capsuleGeometry args={[0.007, 0.035, 4, 8]} />
            </mesh>
            <mesh position={[-0.055, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={hm.claw}>
              <coneGeometry args={[0.006, 0.035, 6]} />
            </mesh>
          </group>
        </group>
      </group>
    ))}
  </group>
);

const Wardrobe = ({ g, hm }: { g: number; hm: HM }) => {
  const ajar = g < T.wardrobe ? 0 : g < T.burst ? 0.07 * clamp((g - T.wardrobe) / 0.6) + (g > T.fingers ? 0.06 * clamp((g - T.fingers) / 1.4) : 0) : g < T.finale ? 0.12 + 1.75 * sm(clamp((g - T.burst) / 0.15)) : 0.05;
  const panel = (z: number, y: number, h: number) => <Box p={[-0.016, y, z]} s={[0.012, h, WR.len / 2 - 0.12]} m={hm.woodDark} cast={false} ol />;
  return (
    <group>
      {/* ножки, корпус, карниз */}
      {[[-0.22, -0.4], [0.22, -0.4], [-0.22, 0.4], [0.22, 0.4]].map(([x, z], i) => (
        <mesh key={i} position={[WR.x + x, 0.06, WR.z + z]} material={hm.woodDark}>
          <cylinderGeometry args={[0.025, 0.018, 0.12, 8]} />
        </mesh>
      ))}
      <Box p={[WR.x + 0.02, WR.h / 2 + 0.06, WR.z]} s={[WR.w - 0.04, WR.h - 0.05, WR.len]} m={hm.wood} ol />
      <Box p={[WR.x, WR.h + 0.06, WR.z]} s={[WR.w + 0.06, 0.07, WR.len + 0.08]} m={hm.woodDark} ol />
      <Box p={[WR.x, WR.h + 0.12, WR.z]} s={[WR.w + 0.02, 0.05, WR.len + 0.02]} m={hm.wood} ol />
      <Box p={[WR_FRONT + 0.03, WR.h / 2 + 0.06, WR.z]} s={[0.01, WR.h - 0.12, WR.len - 0.06]} m={hm.black} cast={false} />
      {/* левая (неподвижная) створка с филёнками */}
      <group position={[WR_FRONT - 0.012, 0.06, 0]}>
        <Box p={[0, WR.h / 2, WR.z + WR.len / 4]} s={[0.022, WR.h - 0.1, WR.len / 2 - 0.01]} m={hm.wood} ol />
        {panel(WR.z + WR.len / 4, 1.45, 0.7)}
        {panel(WR.z + WR.len / 4, 0.55, 0.7)}
      </group>
      <Box p={[WR_FRONT - 0.035, 1.12, GAP_Z + 0.04]} s={[0.02, 0.12, 0.02]} m={hm.brass} />
      {/* правая створка на петле у двери */}
      <group position={[WR_FRONT - 0.012, 0.06, HINGE_Z]} rotation={[0, -ajar, 0]}>
        <Box p={[0, WR.h / 2, WR.len / 4]} s={[0.022, WR.h - 0.1, WR.len / 2 - 0.01]} m={hm.wood} ol />
        {panel(WR.len / 4, 1.45, 0.7)}
        {panel(WR.len / 4, 0.55, 0.7)}
        <Box p={[-0.018, 1.06, WR.len / 2 - 0.05]} s={[0.02, 0.12, 0.02]} m={hm.brass} />
      </group>
      {/* пальцы из щели: кисть ложится на край створки */}
      {g > T.fingers && g < T.burst && (
        <group position={[WR_FRONT, 1.38, GAP_Z - 0.01]}>
          {/* ладонь в темноте щели, пальцы выходят наружу и загибаются на фасад */}
          <group position={[0.09 - 0.07 * clamp((g - T.fingers) / 1.4), 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <Hand hm={hm} curl={0.3 + 0.6 * clamp((g - T.fingers) / 1.4) + Math.sin(g * 5) * 0.05} s={1.2} />
          </group>
          <group position={[0.09 - 0.06 * clamp((g - T.fingers - 0.6) / 1.4), 0.3, 0]} rotation={[Math.PI / 2, 0, 0.1]}>
            <Hand hm={hm} curl={0.4 + 0.5 * clamp((g - T.fingers - 0.6) / 1.4)} s={1.1} />
          </group>
        </group>
      )}
    </group>
  );
};

const Hallway = ({ g, hm }: { g: number; hm: HM }) => {
  const sw = Math.sin(g * 0.9) * 0.015 + rattleK(g) * Math.sin(g * 19) * 0.02;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -2]} receiveShadow material={hm.floor}>
        <planeGeometry args={[HW * 2, 6.5]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 2.6, -2]} material={hm.ceil}>
        <planeGeometry args={[HW * 2, 6.5]} />
      </mesh>
      {/* левая стена с проёмом на кухню */}
      <Box p={[-HW - 0.03, 1.3, 0.2]} s={[0.06, 2.6, 2.0]} m={hm.wall} cast={false} />
      <Box p={[-HW - 0.03, 1.3, -3.1]} s={[0.06, 2.6, 3.0]} m={hm.wall} cast={false} />
      <Box p={[-HW - 0.03, 2.35, KZ]} s={[0.06, 0.5, 0.9]} m={hm.wall} cast={false} />
      <Box p={[-HW - 0.02, 1.05, KZ - 0.46]} s={[0.1, 2.1, 0.05]} m={hm.woodDark} ol />
      <Box p={[-HW - 0.02, 1.05, KZ + 0.46]} s={[0.1, 2.1, 0.05]} m={hm.woodDark} ol />
      <Box p={[HW + 0.03, 1.3, -2]} s={[0.06, 2.6, 6.5]} m={hm.wall} cast={false} />
      <Box p={[-0.62, 1.3, DOOR - 0.06]} s={[0.2, 2.6, 0.06]} m={hm.wall} cast={false} />
      <Box p={[0.62, 1.3, DOOR - 0.06]} s={[0.2, 2.6, 0.06]} m={hm.wall} cast={false} />
      <Box p={[0, 2.38, DOOR - 0.06]} s={[1.44, 0.44, 0.06]} m={hm.wall} cast={false} />
      {[-1, 1].map((sd) => (
        <Box key={sd} p={[sd * (HW - 0.01), 0.04, -2]} s={[0.02, 0.08, 6.5]} m={hm.woodDark} cast={false} ol />
      ))}
      {/* проём спальни */}
      <Box p={[-0.62, 1.3, 0]} s={[0.2, 2.6, 0.12]} m={hm.wall} ol />
      <Box p={[0.62, 1.3, 0]} s={[0.2, 2.6, 0.12]} m={hm.wall} ol />
      <Box p={[0, 2.35, 0]} s={[1.4, 0.5, 0.12]} m={hm.wall} ol />
      <Box p={[-0.5, 1.05, 0]} s={[0.05, 2.1, 0.14]} m={hm.woodDark} ol />
      <Box p={[0.5, 1.05, 0]} s={[0.05, 2.1, 0.14]} m={hm.woodDark} ol />
      <Box p={[0, 1.3, 2.6]} s={[3, 2.6, 0.06]} m={hm.wall} cast={false} />
      {/* вешалка: бордовое пальто мамы среди курток */}
      <Box p={[-HW + 0.05, 1.82, -2.35]} s={[0.05, 0.05, 1.1]} m={hm.woodDark} ol />
      {[0, 1, 2, 3].map((i) => (
        <Box key={i} p={[-HW + 0.09, 1.86, -1.95 - i * 0.27]} s={[0.04, 0.04, 0.02]} m={hm.brass} cast={false} />
      ))}
      <Coat z={-1.98} m={hm.coatGreen} len={0.95} sw={sw} />
      <Coat z={-2.26} m={hm.coatMom} len={1.1} sw={-sw} />
      <Coat z={-2.55} m={hm.coatBrown} len={0.9} sw={sw * 0.7} />
      {/* зеркало и тумбочка с ключами и газетами */}
      <Box p={[-HW + 0.02, 1.55, -3.35]} s={[0.03, 0.75, 0.5]} m={hm.woodDark} ol />
      <mesh position={[-HW + 0.04, 1.55, -3.35]} rotation={[0, Math.PI / 2, 0]} material={hm.mirror}>
        <planeGeometry args={[0.42, 0.66]} />
      </mesh>
      <Box p={[-HW + 0.18, 0.4, -3.35]} s={[0.32, 0.8, 0.55]} m={hm.wood} ol />
      <Box p={[-HW + 0.18, 0.81, -3.35]} s={[0.34, 0.03, 0.57]} m={hm.woodDark} ol />
      {[0, 1, 2].map((i) => (
        <Box key={i} p={[-HW + 0.2, 0.83 + i * 0.008, -3.25 + i * 0.03]} s={[0.22, 0.006, 0.3]} m={hm.paper} cast={false} />
      ))}
      <mesh position={[-HW + 0.2, 0.86, -3.52]} rotation={[Math.PI / 2, 0, 0.4]} material={hm.brass}>
        <torusGeometry args={[0.02, 0.004, 6, 14]} />
      </mesh>
      <Box p={[-HW + 0.22, 0.85, -3.5]} s={[0.05, 0.005, 0.012]} m={hm.brass} cast={false} />
      {/* коврик и тапки у порога */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, DOOR + 0.5]} material={hm.rug} receiveShadow>
        <planeGeometry args={[0.9, 0.6]} />
      </mesh>
      {[-0.12, 0.12].map((x, i) => (
        <RoundedBox key={i} args={[0.1, 0.05, 0.26]} radius={0.025} position={[x, 0.03, DOOR + 0.62]} rotation={[0, i ? -0.2 : 0.15, 0]} material={hm.slipper} castShadow>
          <Outlines thickness={OL * 0.5} color={INK} />
        </RoundedBox>
      ))}
      {/* выключатель и тусклая лампочка */}
      <Box p={[-HW + 0.01, 1.3, -3.98]} s={[0.02, 0.1, 0.07]} m={hm.plastic} ol />
      <mesh position={[0, 2.35, -2.3]} material={hm.black}>
        <cylinderGeometry args={[0.005, 0.005, 0.5, 6]} />
      </mesh>
      <mesh position={[0, 2.08, -2.3]}>
        <sphereGeometry args={[0.045, 12, 10]} />
        <meshStandardMaterial color="#5a4a2a" emissive={new THREE.Color(WARM)} emissiveIntensity={0.35 * lamp(g + 2)} />
      </mesh>
      <FrontDoor g={g} hm={hm} />
      <Wardrobe g={g} hm={hm} />
    </group>
  );
};

/** Лестничная клетка за дверью (видна в финале): бетон, красная аварийная лампа, надписи кровью. */
const Stairwell = ({ g, hm, blood }: { g: number; hm: HM; blood: THREE.Texture | null }) => {
  if (g < T.finale) return null;
  const pulse = 0.55 + 0.45 * Math.max(0, Math.sin((g - T.finale) * Math.PI * 1.6));
  const reveal = (i: number) => clamp((g - T.finale - 1.0 - i * 0.5) / 0.4);
  return (
    <group>
      <Box p={[0, -0.01, DOOR - 1.3]} s={[2.6, 0.02, 2.4]} m={hm.concrete} cast={false} />
      <Box p={[0, 2.7, DOOR - 1.3]} s={[2.6, 0.02, 2.4]} m={hm.concrete} cast={false} />
      <Box p={[-1.3, 1.35, DOOR - 1.3]} s={[0.06, 2.7, 2.4]} m={hm.concrete} cast={false} />
      <Box p={[1.3, 1.35, DOOR - 1.3]} s={[0.06, 2.7, 2.4]} m={hm.concrete} cast={false} />
      <Box p={[0, 1.35, DOOR - 2.5]} s={[2.6, 2.7, 0.06]} m={hm.concrete} cast={false} />
      {/* перила и ступени вниз справа */}
      {Array.from({ length: 5 }, (_, i) => (
        <Box key={i} p={[0.9, -0.08 - i * 0.16, DOOR - 1.0 - i * 0.28]} s={[0.7, 0.16, 0.28]} m={hm.concrete} cast={false} ol />
      ))}
      <Box p={[0.55, 0.95, DOOR - 1.6]} s={[0.04, 0.04, 1.6]} m={hm.woodDark} ol />
      {blood && (
        <mesh position={[0, 1.35, DOOR - 2.46]}>
          <planeGeometry args={[2.2, 2.2]} />
          <meshStandardMaterial map={blood} transparent opacity={Math.max(reveal(0), 0.001)} roughness={0.35} depthWrite={false} />
        </mesh>
      )}
      <mesh position={[0, 2.55, DOOR - 1.6]}>
        <boxGeometry args={[0.2, 0.08, 0.1]} />
        <meshStandardMaterial color="#ff2a1a" emissive={new THREE.Color("#ff2a1a")} emissiveIntensity={3 * pulse} />
      </mesh>
      <pointLight position={[0, 2.35, DOOR - 1.5]} color="#ff2a1a" intensity={9 * pulse} distance={5} decay={1.4} />
    </group>
  );
};

// ── существо: объёмная сгорбленная фигура ────────────────────────────
const useFaceTex = (monster: THREE.Texture | null) =>
  useMemo(() => {
    if (!monster) return null;
    const t = monster.clone();
    // лицо из текстуры CreatureGlass: голова x 330–770, y 280–1200 из 1080×1920
    t.offset.set(0.3, 0.37);
    t.repeat.set(0.42, 0.49);
    t.needsUpdate = true;
    return t;
  }, [monster]);

/** Рука существа с вывернутым назад локтем; lag — инерция (затухающее раскачивание). */
const CreatureArm = ({ hm, side, reach, lag }: { hm: HM; side: 1 | -1; reach: number; lag: number }) => (
  <group position={[side * 0.24, 1.48, 0.05]} rotation={[-0.9 - reach * 0.7 + lag, 0, side * (0.35 - reach * 0.15)]}>
    <mesh position={[0, -0.27, 0]} material={hm.skin} castShadow>
      <capsuleGeometry args={[0.045, 0.48, 6, 10]} />
      <Outlines thickness={OL * 0.6} color={INK} />
    </mesh>
    {/* локоть выгнут в обратную сторону */}
    <group position={[0, -0.54, 0]} rotation={[-1.1 + reach * 0.6 - lag * 1.5, 0, 0]}>
      <mesh material={hm.skinDark}>
        <sphereGeometry args={[0.05, 10, 8]} />
      </mesh>
      <mesh position={[0, -0.3, 0]} material={hm.skin} castShadow>
        <capsuleGeometry args={[0.036, 0.55, 6, 10]} />
        <Outlines thickness={OL * 0.6} color={INK} />
      </mesh>
      <group position={[0, -0.62, 0]} rotation={[0, 0, Math.PI / 2]}>
        <Hand hm={hm} curl={0.55 + reach * 0.3} s={1.6} />
      </group>
    </group>
  </group>
);

const Creature3D = ({ g, pose, monster, hm }: { g: number; pose: Pose; monster: THREE.Texture | null; hm: HM }) => {
  const face = useFaceTex(monster);
  const glint = useMemo(() => new THREE.SpriteMaterial({ map: makeTex("glow"), color: "#ffe9b8", blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }), []);
  const faceMat = useMemo(() => new THREE.MeshStandardMaterial({ transparent: true, alphaTest: 0.05, roughness: 0.85, emissive: new THREE.Color("#ffffff"), emissiveIntensity: 0.02 }), []);
  if (face && faceMat.map !== face) {
    faceMat.map = face;
    faceMat.emissiveMap = face;
    faceMat.needsUpdate = true;
  }
  // до броска: два глаза в щели шкафа на разной высоте
  if (g < T.burst) {
    if (g < T.eyes) return null;
    const k = clamp((g - T.eyes) / 0.5);
    glint.opacity = (0.7 + 0.3 * Math.sin(g * 5)) * k;
    return (
      <group>
        <sprite position={[WR_FRONT - 0.006, 1.6, GAP_Z - 0.018]} scale={[0.09, 0.09, 1]} material={glint} />
        <sprite position={[WR_FRONT - 0.006, 2.0, GAP_Z - 0.02]} scale={[0.08, 0.08, 1]} material={glint} />
      </group>
    );
  }
  if (g >= T.finale) return null;
  const b = clamp((g - T.burst) / 0.32);
  const e = 1 - Math.pow(1 - b, 3);
  const dir = new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(0, pose.yaw, 0, "YXZ"));
  const near = new THREE.Vector3(pose.x, 0, pose.z).add(dir.clone().multiplyScalar(1.3));
  const from = new THREE.Vector3(WR.x - 0.05, 0, WR.z);
  const p = from.clone().lerp(near, e);
  // инерция: перелёт и затухающее раскачивание после броска
  const t2 = Math.max(0, g - T.burst - 0.32);
  const wob = Math.sin(t2 * 9) * Math.exp(-t2 * 3) * 0.25;
  p.add(dir.clone().multiplyScalar(wob * 0.15));
  const yaw = pose.yaw + (1 - e) * 1.3; // лицом к камере
  const lean = 0.25 + wob * 0.2; // сгорблен к камере
  glint.opacity = 0.9;
  return (
    <group position={[p.x, -0.5 + Math.sin(g * 37) * 0.008, p.z]} rotation={[0, yaw, 0]}>
      <group rotation={[lean, 0, Math.sin(g * 7) * 0.05]} position={[0, 0.2, 0]}>
        {/* туловище и рёбра */}
        <mesh position={[0, 1.05, 0]} material={hm.skin} castShadow>
          <capsuleGeometry args={[0.16, 0.6, 8, 14]} />
          <Outlines thickness={OL} color={INK} />
        </mesh>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[0, 1.1 + i * 0.08, 0.14]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.4]} material={hm.skinDark}>
            <torusGeometry args={[0.12, 0.008, 6, 20, Math.PI]} />
          </mesh>
        ))}
        {/* сутулые плечи и вытянутая шея */}
        <mesh position={[0, 1.45, 0]} scale={[1.7, 0.55, 0.8]} material={hm.skin} castShadow>
          <sphereGeometry args={[0.16, 14, 10]} />
          <Outlines thickness={OL} color={INK} />
        </mesh>
        <mesh position={[0, 1.58, 0.1]} rotation={[0.7, 0, 0]} material={hm.skin}>
          <capsuleGeometry args={[0.05, 0.22, 6, 10]} />
        </mesh>
        {/* голова с лицом из текстуры: глубокие глазницы без зрачков, пасть */}
        <group position={[0, 1.78, 0.2]} rotation={[-0.45 + wob * 0.2, 0, Math.sin(g * 3) * 0.1]}>
          <mesh scale={[0.85, 1.3, 0.9]} material={hm.skin} castShadow>
            <sphereGeometry args={[0.13, 16, 12]} />
            <Outlines thickness={OL} color={INK} />
          </mesh>
          {face && (
            <mesh position={[0, -0.01, 0.105]} material={faceMat}>
              <planeGeometry args={[0.24, 0.38]} />
            </mesh>
          )}
          {[
            [-0.042, 0.05],
            [0.04, 0.052],
          ].map(([x, y], i) => (
            <sprite key={i} position={[x, y, 0.12]} scale={[0.012, 0.012, 1]} material={glint} />
          ))}
        </group>
        <CreatureArm hm={hm} side={1} reach={e} lag={wob} />
        <CreatureArm hm={hm} side={-1} reach={e} lag={-wob * 0.8} />
      </group>
    </group>
  );
};

// ── свет ─────────────────────────────────────────────────────────────
const Lights = ({ g, pose }: { g: number; pose: Pose }) => {
  const tgt = useMemo(() => new THREE.Object3D(), []);
  tgt.position.set(0.3, 0.0, -2.6);
  tgt.updateMatrixWorld();
  const warmK = 0.85 + 0.15 * lamp(g + 11);
  const phoneOn = g > T.hallIn && g < T.atDoor ? 1 : g < T.burst + 0.2 ? 0.75 : 0.3;
  const dir = new THREE.Vector3(0, -0.35, -0.12).applyEuler(new THREE.Euler(0, pose.yaw, 0));
  const flash = g >= T.burst && g < T.burst + 0.25 ? 1 - (g - T.burst) / 0.25 : 0;
  const fin = g >= T.finale ? 0.25 : 1;
  return (
    <>
      <ambientLight color="#8a7a55" intensity={0.03} />
      <hemisphereLight args={["#3a3428", "#000000", 0.05]} />
      {/* узкий тёплый клин из кухни на пол прихожей: длинные тени от вешалки, шкаф не заливает */}
      <primitive object={tgt} />
      <spotLight position={[-1.4, 1.75, KZ]} target={tgt} color={WARM} intensity={26 * warmK * fin} angle={0.32} penumbra={0.3} distance={6} decay={1.5} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-bias={-0.0004} />
      {/* свет подъезда в щели под дверью — без тени ног */}
      <pointLight position={[0, 0.03, DOOR - 0.15]} color="#ffcf7a" intensity={2.2 * lamp(g + 3) * (g < T.finale ? 1 : 0)} distance={1.2} decay={2} />
      <pointLight position={[0.3, 1.5, DOOR + 0.55]} color={WARM} intensity={g > 35.9 && g < 38 ? 2.4 : 0.8} distance={1.6} decay={2} />
      {/* бледный боковой свет на кисти из шкафа */}
      <pointLight position={[WR_FRONT - 0.45, 1.7, GAP_Z + 0.35]} color="#d8cdb0" intensity={g > T.fingers && g < T.burst ? 1.1 * clamp((g - T.fingers) / 1.2) : 0} distance={1.3} decay={2} />
      {/* экран телефона: холодный, снизу-спереди */}
      <pointLight position={[pose.x + dir.x, pose.y + dir.y, pose.z + dir.z]} color={PHONE} intensity={7 * phoneOn} distance={4.5} decay={1.5} />
      {flash > 0 && <pointLight position={[pose.x, pose.y + 0.3, pose.z - 0.5]} color="#fff1d0" intensity={6 * flash} distance={4} decay={1.5} />}
      {/* холодный верхний свет на существо (телефон в трясущейся руке) */}
      {g >= T.burst && g < T.finale && <pointLight position={[pose.x + 0.15, pose.y + 0.55, pose.z + 0.15]} color={PHONE} intensity={2.4} distance={3} decay={1.6} />}
      {g >= T.finale && <pointLight position={[0, 1.7, DOOR + 0.3]} color="#d8cfb8" intensity={1.6} distance={3.5} decay={1.6} />}
    </>
  );
};

const HallScene = ({ g, pose, monster, blood }: { g: number; pose: Pose; monster: THREE.Texture | null; blood: THREE.Texture | null }) => {
  const hm = useHallMats();
  return (
    <>
      <CamRig pose={pose} />
      <color attach="background" args={["#000"]} />
      <fog attach="fog" args={["#030302", 2.5, 9]} />
      <Lights g={g} pose={pose} />
      <Kitchen g={g} hm={hm} />
      <Hallway g={g} hm={hm} />
      <Stairwell g={g} hm={hm} blood={blood} />
      <Creature3D g={g} pose={pose} monster={monster} hm={hm} />
      <Dust u={g} cz={pose.z} />
    </>
  );
};

/** Тёмные преломляющие трещины по краям кадра и размазанные брызги. */
const LensHit = ({ g }: { g: number }) => {
  const k = clamp((g - T.burst - 0.28) / 0.1);
  if (k <= 0 || g >= T.finale) return null;
  const crack = (x0: number, y0: number, a0: number, seed: number) => {
    let x = x0;
    let y = y0;
    let d = `M${x} ${y}`;
    for (let s = 0; s < 7; s++) {
      const an = a0 + (rnd(seed + s) - 0.5) * 0.9;
      const len = 50 + rnd(seed + s + 50) * 110;
      x += Math.cos(an) * len;
      y += Math.sin(an) * len;
      d += ` L${x.toFixed(0)} ${y.toFixed(0)}`;
    }
    return d;
  };
  const origins: [number, number, number][] = [
    [0, 260, 0.4],
    [1080, 420, Math.PI - 0.3],
    [0, 1500, -0.5],
    [1080, 1700, Math.PI + 0.4],
    [200, 1920, -1.2],
    [900, 0, 1.9],
  ];
  return (
    <AbsoluteFill style={{ opacity: k, pointerEvents: "none" }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <filter id="smear">
            <feGaussianBlur stdDeviation="9 26" />
          </filter>
        </defs>
        {origins.map(([x, y, a], i) =>
          [0, 1, 2].map((j) => {
            const d = crack(x, y, a + (j - 1) * 0.35, i * 31 + j * 7 + 4000);
            return (
              <g key={`${i}${j}`}>
                <path d={d} stroke="rgba(5,4,3,.85)" strokeWidth="7" fill="none" strokeLinejoin="round" />
                <path d={d} stroke="rgba(220,215,200,.35)" strokeWidth="1.5" fill="none" transform="translate(3 -2)" />
              </g>
            );
          }),
        )}
        <g filter="url(#smear)">
          {Array.from({ length: 9 }, (_, i) => (
            <ellipse key={i} cx={rnd(i + 4300) > 0.5 ? 60 + rnd(i + 4301) * 260 : 760 + rnd(i + 4302) * 280} cy={200 + rnd(i + 4303) * 1500} rx={18 + rnd(i + 4304) * 30} ry={60 + rnd(i + 4305) * 120} fill="rgba(40,4,6,.85)" />
          ))}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

const useBloodTexture = (font: string) => {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  const [handle] = useState(() => delayRender("blood text"));
  useEffect(() => {
    const F = `"${font.replace(/"/g, "")}"`;
    document.fonts
      .load(`40px ${F}`)
      .catch(() => null)
      .then(() => {
        setTex(makeBloodText(font));
        continueRender(handle);
      });
  }, [font, handle]);
  return tex;
};

/** 3D-квартира. timeAt переводит кадр сцены во «время серии» (для флеш-форварда — замедленный кусок скримера). */
export const Hall3D = ({ timeAt, font }: { timeAt: (localSec: number) => number; font: string }) => {
  const frame = useCurrentFrame();
  const g = timeAt(frame / FPS);
  const pose = hallPose(g);
  const monster = useMonsterTexture();
  const blood = useBloodTexture(font);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <ThreeCanvas width={W} height={H} shadows="soft" dpr={1.5} gl={{ antialias: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.35, preserveDrawingBuffer: true }}>
        <HallScene g={g} pose={pose} monster={monster} blood={blood} />
      </ThreeCanvas>
      <LensHit g={g} />
    </AbsoluteFill>
  );
};
