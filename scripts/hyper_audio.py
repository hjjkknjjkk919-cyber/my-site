#!/usr/bin/env python3
"""Озвучка лонга по сценам → public/audio/hyper/sNN_kk.mp3; тайминг сцен, метки действий, огибающие для lip-sync → src/compositions/Hyper/timeline.json"""
import json
import subprocess
import sys
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from hyper_script import SCENES  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public/audio/hyper"
OUT.mkdir(parents=True, exist_ok=True)
API = "https://api.elevenlabs.io/v1"
HDR = {"xi-api-key": "proxy-injected", "Content-Type": "application/json"}
VOICE = {"maks": "kwajW3Xh5svCeKU5ky2S", "galya": "Fy6bUBXCIVErEtK9FN5d", "tolyan": "0BcDz9UPwL3MpsnTeUlO", "zina": "N8lIVPsFkvOoqev5Csxo",
         "monster": "PRfCKe8kdrG3nuXOAnoH", "mchs": "3EuKHIEZbSzrHGNmdYsx", "petrovich": "y0RLnxlYEbYtNjhcMVmG",
         "lyokha": "ws3YyKFd5whKb21yaXES", "roma": "DS6EUI0539yrd2EB0eig", "sveta": "obFhmRTxMCcBnoAHlct8", "mikhalych": "ouyTiWqmHA5WI5bbX7zj"}
CHORUS = ["maks", "galya", "tolyan", "zina", "petrovich"]
GAP = 0.12


def post(url, body, dest):
    for i in range(8):
        try:
            req = urllib.request.Request(url, json.dumps(body).encode(), HDR)
            dest.write_bytes(urllib.request.urlopen(req, timeout=180).read())
            return
        except urllib.error.HTTPError as e:
            if e.code not in (429, 500, 502, 503) or i == 7:
                raise
            time.sleep(5 * (i + 1))


def clean(src: Path, dst: Path, tempo: float = 1.0):
    af = ("silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,"
          f"silenceremove=stop_periods=-1:stop_duration=0.22:stop_threshold=-42dB,atempo={tempo},loudnorm=I=-16:TP=-1.5")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(src), "-af", af, "-ar", "44100", "-b:a", "160k", str(dst)], check=True)


def tts(job):
    name, who, text = job
    fin = OUT / f"{name}.mp3"
    if fin.exists() and name not in ONLY:
        return
    if who == "all":  # хор: несколько голосов одной фразой, сведённые вместе
        parts = []
        for w in CHORUS:
            p = OUT / f"{name}_{w}.mp3"
            post(f"{API}/text-to-speech/{VOICE[w]}?output_format=mp3_44100_128", {"text": text, "model_id": "eleven_v3", "voice_settings": {"stability": 0.5}}, p)
            parts.append(p)
        mix = OUT / f"{name}_raw.mp3"
        ins = sum([["-i", str(p)] for p in parts], [])
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *ins, "-filter_complex", f"amix=inputs={len(parts)}:normalize=0", str(mix)], check=True)
        for p in parts:
            p.unlink()
    else:
        mix = OUT / f"{name}_raw.mp3"
        st = 0.5 if who == "maks" else 0.0
        post(f"{API}/text-to-speech/{VOICE[who]}?output_format=mp3_44100_128", {"text": text, "model_id": "eleven_v3", "voice_settings": {"stability": st}}, mix)
    clean(mix, fin, 1.08 if who == "monster" else 1.0)
    mix.unlink()


def dur(p):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)], capture_output=True, text=True).stdout)


def envelope(p: Path):
    pcm = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", str(p), "-ac", "1", "-ar", "12000", "-f", "s16le", "-"], capture_output=True).stdout
    a = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768
    n = max(1, len(a) // 400)
    rms = np.sqrt(np.mean(a[: n * 400].reshape(n, 400) ** 2, axis=1))
    return [round(float(x), 2) for x in np.clip(rms / max(1e-6, np.percentile(rms, 95)), 0, 1)]


if __name__ == "__main__":
    ONLY = set(sys.argv[1:])
    jobs = []
    for sc in SCENES:
        k = 0
        for it in sc["items"]:
            if isinstance(it, list):
                jobs.append((f"s{sc['n']:02d}_{k:02d}", it[0], it[1]))
                k += 1
    with ThreadPoolExecutor(3) as ex:
        list(ex.map(tts, jobs))
    scenes = []
    total = 0.0
    for sc in SCENES:
        t, k = 0.0, 0
        lines, marks, sfx = [], {}, []
        for it in sc["items"]:
            if isinstance(it, list):
                name = f"s{sc['n']:02d}_{k:02d}"
                d = round(dur(OUT / f"{name}.mp3"), 3)
                text = it[1].split("] ", 1)[-1] if it[1].startswith("[") else it[1]
                lines.append({"id": name, "who": it[0], "at": round(t, 3), "dur": d, "text": text, "env": envelope(OUT / f"{name}.mp3")})
                t += d + GAP
                k += 1
            else:
                marks[it["act"]] = round(t, 3)
                if it.get("sfx"):
                    sfx.append({"name": it["sfx"], "at": round(t, 3)})
                t += it["sec"]
        t = round(t - GAP if isinstance(sc["items"][-1], list) else t, 3)
        frames = int(round(t * 30))
        scenes.append({"n": sc["n"], "loc": sc["loc"], "day": sc["day"], "frames": frames, "lines": lines, "marks": marks, "sfx": sfx})
        total += frames / 30
    (ROOT / "src/compositions/Hyper").mkdir(parents=True, exist_ok=True)
    (ROOT / "src/compositions/Hyper/timeline.json").write_text(json.dumps(scenes, ensure_ascii=False))
    for s in scenes:
        print(f"scene {s['n']:02d}: {s['frames']} кадров ({s['frames'] / 30:.1f} с), реплик {len(s['lines'])}")
    print("ИТОГО", round(total, 1), "с =", f"{int(total // 60)}:{int(total % 60):02d}")
