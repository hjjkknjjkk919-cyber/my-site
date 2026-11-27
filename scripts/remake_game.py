#!/usr/bin/env python3
"""Залипалка «битва шаров в круге»: детерминированная физика → src/compositions/Remake90s/game.json, ноты ударов → public/remake/game.wav"""
import json
import math
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
FPS, DUR = 30, 55.0
CX, CY, R = 540.0, 1405.0, 455.0
BR = 36.0
G = 1500.0
DT = 1 / 240

balls = [
    {"p": np.array([430.0, 1180.0]), "v": np.array([420.0, -260.0])},
    {"p": np.array([660.0, 1240.0]), "v": np.array([-340.0, -380.0])},
]
frames, hits, clashes = [], [], []
t, step = 0.0, 0
last_hit = [-1.0, -1.0]
last_clash = -1.0
while t < DUR + 1e-9:
    if step % (240 // FPS) == 0:
        frames.append([round(float(c), 1) for b in balls for c in b["p"]])
    for i, b in enumerate(balls):
        b["v"][1] += G * DT
        b["p"] += b["v"] * DT
        d = b["p"] - np.array([CX, CY])
        dist = float(np.linalg.norm(d))
        if dist + BR > R:
            n = d / dist
            b["p"] = np.array([CX, CY]) + n * (R - BR)
            vn = float(np.dot(b["v"], n))
            if vn > 0:
                b["v"] -= 2 * vn * n
                sp = float(np.linalg.norm(b["v"]))
                target = min(1650.0, max(sp, 900.0) * 1.012)  # разгоняется с каждым ударом
                b["v"] *= target / sp
                if t - last_hit[i] > 0.05:
                    hits.append({"t": round(t, 3), "b": i, "x": round(CX + n[0] * R, 1), "y": round(CY + n[1] * R, 1)})
                    last_hit[i] = t
    a, c = balls
    d = c["p"] - a["p"]
    dist = float(np.linalg.norm(d))
    if dist < 2 * BR:
        n = d / dist
        rel = float(np.dot(a["v"] - c["v"], n))
        if rel > 0:
            a["v"] -= rel * n
            c["v"] += rel * n
            if t - last_clash > 0.1:
                clashes.append({"t": round(t, 3), "x": round(float((a["p"][0] + c["p"][0]) / 2), 1), "y": round(float((a["p"][1] + c["p"][1]) / 2), 1)})
                last_clash = t
        over = 2 * BR - dist
        a["p"] -= n * over / 2
        c["p"] += n * over / 2
    t += DT
    step += 1

out = ROOT / "src/compositions/Remake90s"
(out / "game.json").write_text(json.dumps({"cx": CX, "cy": CY, "r": R, "br": BR, "frames": frames, "hits": hits, "clashes": clashes}))

# ── синтез: маримба-ноты по пентатонике, у каждого шара своя октава, удары шаров — звонкий «клинк» ──
SR = 44100
audio = np.zeros(int(SR * (DUR + 1)))
penta = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21]
base = [261.63, 392.0]
count = [0, 0]


def put(sig, at):
    s = int(at * SR)
    e = min(len(audio), s + len(sig))
    audio[s:e] += sig[: e - s]


for h in hits:
    i = h["b"]
    f = base[i] * 2 ** (penta[count[i] % len(penta)] / 12)
    count[i] += 1
    n = np.arange(int(SR * 0.45)) / SR
    sig = (np.sin(2 * math.pi * f * n) + 0.35 * np.sin(2 * math.pi * 2 * f * n) + 0.12 * np.sin(2 * math.pi * 3.9 * f * n)) * np.exp(-n * 9)
    put(sig * 0.22 * np.minimum(1, n * 400), h["t"])
for c in clashes:
    n = np.arange(int(SR * 0.35)) / SR
    sig = (np.sin(2 * math.pi * 2093 * n) * 0.5 + np.sin(2 * math.pi * 3136 * n) * 0.3) * np.exp(-n * 14) + np.random.default_rng(1).normal(0, 0.3, len(n)) * np.exp(-n * 60)
    put(sig * 0.3, c["t"])
audio /= max(1e-9, np.abs(audio).max()) / 0.7
with wave.open(str(ROOT / "public/remake/game.wav"), "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((audio * 32767).astype(np.int16).tobytes())
print("frames", len(frames), "hits", len(hits), "clashes", len(clashes), "hits/ball", count)
