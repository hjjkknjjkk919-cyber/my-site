"""
Свои «шейдеры» поверх готового ролика: покадровая обработка (как фрагментный шейдер, только на CPU).

  1. Объёмные лучи (god rays) от самого яркого источника в кадре — луна, солнце, фонарик.
  2. Анаморфные голубые полосы от ярких точек.
  3. Свечение (bloom) в два радиуса + тёплый ореол плёнки (halation).
  4. Иней и пыль на объективе — видны только там, где на стекло падает свет.
  5. Радиальное расслоение цвета: к краям сильнее, в центре нет.
  6. Плёночная кривая тонов, холодные тени / тёплые света, виньетка, зерно.

Запуск: python3 tools/shaders.py вход.mp4 звук.(wav|mp4) выход.mp4 [первый_кадр количество]
"""
import subprocess
import sys

import cv2
import numpy as np

W, H, FPS = 1080, 1920, 30
SW, SH = W // 4, H // 4  # тяжёлые эффекты считаем в четверть разрешения

src, audio, dst = sys.argv[1], sys.argv[2], sys.argv[3]
start = int(sys.argv[4]) if len(sys.argv) > 4 else 0
count = int(sys.argv[5]) if len(sys.argv) > 5 else 0

rng = np.random.default_rng(7)

# ── заготовки ──────────────────────────────────────────────────────────
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
r = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
vignette = np.clip(1.0 - 0.32 * np.clip(r - 0.35, 0, None) ** 1.6, 0, 1)[..., None]

# грязь и иней на стекле: мягкие пятна + звёздочки-кристаллы
dirt = np.zeros((SH, SW), np.float32)
for _ in range(70):
    cx, cy = rng.integers(0, SW), rng.integers(0, SH)
    cv2.circle(dirt, (int(cx), int(cy)), int(rng.integers(2, 14)), float(rng.uniform(0.15, 0.6)), -1)
for _ in range(40):
    cx, cy, s = int(rng.integers(0, SW)), int(rng.integers(0, SH)), int(rng.integers(3, 9))
    for a in range(3):
        ang = a * np.pi / 3 + rng.uniform(0, 0.5)
        dx, dy = int(np.cos(ang) * s), int(np.sin(ang) * s)
        cv2.line(dirt, (cx - dx, cy - dy), (cx + dx, cy + dy), 0.9, 1)
dirt = cv2.GaussianBlur(dirt, (0, 0), 1.6)[..., None]


def scale_about(img, cx, cy, k):
    m = np.float32([[k, 0, cx * (1 - k)], [0, k, cy * (1 - k)]])
    return cv2.warpAffine(img, m, (img.shape[1], img.shape[0]), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT)


def shade(frame_u8, i):
    img = frame_u8.astype(np.float32) / 255.0
    small = cv2.resize(img, (SW, SH), interpolation=cv2.INTER_AREA)
    lum = small @ np.float32([0.2126, 0.7152, 0.0722])
    # светится только настоящий свет: порог сам поднимается на ярком снегу
    thr = max(0.7, float(np.percentile(lum, 98.5)))
    bright = (np.clip((lum - thr) / max(1e-3, 1 - thr), 0, 1) ** 1.3)[..., None] * small

    # 1. лучи от самого яркого места
    heat = cv2.GaussianBlur(np.clip((lum - max(0.82, thr)) / 0.18, 0, 1), (0, 0), 9)
    _, mx, _, (lx, ly) = cv2.minMaxLoc(heat)
    rays = np.zeros_like(bright)
    if mx > 0.05:
        acc, w = np.zeros_like(bright), 0.0
        for k in range(14):
            d = 0.93 ** k
            acc += scale_about(bright, lx, ly, 1.0 + k * 0.045) * d
            w += d
        rays = acc / w * min(1.0, mx * 3) * 1.4

    # 2. анаморфные полосы
    streak = cv2.blur(cv2.blur(bright, (91, 1)), (91, 1)) * np.float32([0.45, 0.75, 1.25]) * 1.3

    # 3. свечение и плёночный ореол
    bloom = cv2.GaussianBlur(bright, (0, 0), 5) * 0.7 + cv2.GaussianBlur(bright, (0, 0), 18) * 0.6
    halo = cv2.GaussianBlur(bright, (0, 0), 11) * np.float32([1.0, 0.35, 0.18]) * 0.5

    # 4. иней на стекле подсвечивается рассеянным светом
    scatter = cv2.GaussianBlur(bright.mean(axis=2), (0, 0), 35)[..., None]
    lens = dirt * scatter * np.float32([1.0, 0.95, 0.9]) * 5.0

    glow = cv2.resize(rays + streak + bloom + halo + lens, (W, H), interpolation=cv2.INTER_LINEAR)
    img = 1.0 - (1.0 - img) * (1.0 - np.clip(glow, 0, 1))  # смешивание «экран»

    # 5. радиальное расслоение цвета
    img[..., 0] = scale_about(img[..., 0], W / 2, H / 2, 1.006)
    img[..., 2] = scale_about(img[..., 2], W / 2, H / 2, 0.994)

    # 6. плёночная кривая, цвет, виньетка, зерно
    k = 1.35
    img = (1 - np.exp(-k * img * 1.08)) / (1 - np.exp(-k))
    img = 0.5 + (img - 0.5) * 1.1  # вернуть плотность после мягкой кривой
    l = img @ np.float32([0.2126, 0.7152, 0.0722])
    sh = np.clip(1 - l * 1.6, 0, 1)[..., None]
    hi = np.clip((l - 0.55) * 2, 0, 1)[..., None]
    img = img + sh * np.float32([-0.015, 0.005, 0.03]) + hi * np.float32([0.03, 0.012, -0.02])
    img *= vignette
    g = cv2.resize(rng.normal(0, 0.028, (H // 2, W // 2)).astype(np.float32), (W, H), interpolation=cv2.INTER_LINEAR)
    img += g[..., None] * (0.6 + 0.4 * (1 - l[..., None]))
    return (np.clip(img, 0, 1) * 255).astype(np.uint8)


# ── поток кадров: ffmpeg → numpy → ffmpeg ──────────────────────────────
sel = ["-vf", f"select=between(n\\,{start}\\,{start + count - 1})", "-vsync", "0"] if count else []
reader = subprocess.Popen(["ffmpeg", "-v", "error", "-i", src, *sel, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
audio_in = [] if count or audio == "-" else ["-i", audio]
amap = [] if count or audio == "-" else ["-map", "1:a", "-c:a", "aac", "-b:a", "192k"]
writer = subprocess.Popen(
    ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", *audio_in,
     "-map", "0:v", *amap, "-c:v", "libx264", "-crf", "19", "-preset", "medium", "-pix_fmt", "yuv420p", "-movflags", "+faststart", dst],
    stdin=subprocess.PIPE,
)
n = 0
size = W * H * 3
while True:
    buf = reader.stdout.read(size)
    if len(buf) < size:
        break
    frame = np.frombuffer(buf, np.uint8).reshape(H, W, 3)
    writer.stdin.write(shade(frame, n).tobytes())
    n += 1
    if n % 300 == 0:
        print(f"{n} кадров", flush=True)
writer.stdin.close()
writer.wait()
print("готово, кадров:", n)
