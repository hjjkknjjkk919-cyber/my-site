#!/usr/bin/env python3
"""«Сонный паралич»: диктор (глубокий бас + ffmpeg-цепочка из ТЗ) и SFX → public/audio/sleep/, тайминг → src/compositions/Sleep/vo.json"""
import json
import subprocess
import sys
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public/audio/sleep"
OUT.mkdir(parents=True, exist_ok=True)
API = "https://api.elevenlabs.io/v1"
HDR = {"xi-api-key": "proxy-injected", "Content-Type": "application/json"}
VOICE = "txnCCHHGKmYIwrn7HfHQ"  # Alexandr Vlasov — самый глубокий мужской голос в аккаунте
BASS = "asetrate=44100*0.93,aresample=44100,atempo=1.075,equalizer=f=95:t=q:w=1.2:g=6,equalizer=f=180:t=q:w=1.5:g=3,acompressor=threshold=-18dB:ratio=3:attack=10:release=120,aecho=0.8:0.85:26:0.15"

LINES = [
    "Если проснулся в три семнадцать ночи... и увидел это за окном — не моргай. Моргнёшь — оно окажется в комнате.",
    "Веки сами срываются вниз — и ты слышишь, как открывается окно.",
    "Тело как свинцовое. Дима убеждает себя, что это просто сонный паралич и игра мозга.",
    "Новое моргание — и оно выглядывает прямо из-за изножья кровати, не сводя с него глаз.",
    "Ещё моргание — а его уже нет. Только мерзкий склизкий звук уползает по коридору к спальне родителей.",
    "Диму накрывает дикий ужас: он понимает, куда оно ползёт, скрипит зубами, пытается закричать — но тело мёртвое.",
    "Моргание. За дверью родителей — мерзкий склизкий топот, потом тишина. Паралич резко отпускает, но ноги ватные — он всё равно не может встать.",
    "Ещё один взмах век. Из спальни родителей доносится хруст костей и крик мамы, который резко переходит в хрип. По лицу Димы текут слёзы и сопли — он опоздал.",
    "Пойдёшь в комнату родителей или вызовешь полицию? Пиши в комменты!",
]
# Дима — Омин (eleven_v3, теги эмоций); мата немного (один раз), без цензуры
DIMA_VOICE = "ZleKRMCJL4E5Uc5viWNH"
DIMA = [
    "[whispers] [scared] Это просто сон... просто сон.",
    "[terrified] [through clenched teeth] Блядь... только не туда!",
    "[crying] Мама... мамочка...",
]
SFX = [
    ("inhale", "sharp panicked gasping inhale of a man waking up", 1.2),
    ("neck", "creepy slow neck bone crack", 1.0),
    ("drone", "low dark sleep paralysis drone hum with distant whispers, loop", 10),
    ("heart_slow", "slow heavy heartbeat thumps", 6),
    ("heart_fast", "fast panicked heartbeat", 6),
    ("lid", "dull muffled low thud, eyelids closing", 0.6),
    ("window", "old wooden window frame creaking open slowly with cold night wind gust", 2.5),
    ("sub", "deep cinematic sub bass hit", 1.5),
    ("slither", "disgusting wet slimy body dragging across wooden floor", 4.5),
    ("teeth", "tense teeth grinding, clenched jaw creaking", 2.5),
    ("steps", "wet slimy footsteps slowly walking away down a corridor", 3.5),
    ("gasp", "loud desperate gasp for air", 1.0),
    ("bones", "muffled bones crunching behind a wall", 2.0),
    ("scream", "woman screaming in the next room that suddenly turns into a choking wheeze", 3.5),
    ("sob", "quiet suppressed sobbing and sniffling of a young man", 5),
    ("tick", "fast stopwatch ticking", 7),
]


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


def line(i):
    fin = OUT / f"v{i}.mp3"
    if fin.exists() and str(i) not in ONLY:
        return
    raw = OUT / f"v{i}_raw.mp3"
    post(f"{API}/text-to-speech/{VOICE}?output_format=mp3_44100_128", {"text": LINES[i], "model_id": "eleven_multilingual_v2", "voice_settings": {"stability": 0.75, "similarity_boost": 0.8, "style": 0.2, "speed": 0.88}}, raw)
    af = ("silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,"
          f"silenceremove=stop_periods=-1:stop_duration=0.35:stop_threshold=-42dB,{BASS},atempo=1.08,loudnorm=I=-15:TP=-1.5")  # atempo 1.08: итог ровно на 5% медленнее прежней версии
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(raw), "-af", af, "-ar", "44100", "-b:a", "192k", str(fin)], check=True)
    raw.unlink()


def dima(i):
    fin = OUT / f"d{i}.mp3"
    if fin.exists() and f"d{i}" not in ONLY:
        return
    raw = OUT / f"d{i}_raw.mp3"
    post(f"{API}/text-to-speech/{DIMA_VOICE}?output_format=mp3_44100_128", {"text": DIMA[i], "model_id": "eleven_v3", "voice_settings": {"stability": 0.5, "similarity_boost": 0.8}}, raw)
    af = "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,loudnorm=I=-16:TP=-1.5"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(raw), "-af", af, "-ar", "44100", "-b:a", "192k", str(fin)], check=True)
    raw.unlink()


def sfx(item):
    n, prompt, d = item
    if not (OUT / f"sfx_{n}.mp3").exists():
        post(f"{API}/sound-generation", {"text": prompt, "duration_seconds": d, "prompt_influence": 0.55}, OUT / f"sfx_{n}.mp3")


def dur(p):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)], capture_output=True, text=True).stdout)


if __name__ == "__main__":
    ONLY = set(sys.argv[1:])
    with ThreadPoolExecutor(3) as ex:
        list(ex.map(line, range(len(LINES))))
        list(ex.map(sfx, SFX))
        list(ex.map(dima, range(len(DIMA))))
    d = [round(dur(OUT / f"v{i}.mp3"), 3) for i in range(len(LINES))]
    (ROOT / "src/compositions/Sleep").mkdir(parents=True, exist_ok=True)
    (ROOT / "src/compositions/Sleep/vo.json").write_text(json.dumps({"durs": d, "text": LINES, "dima": [round(dur(OUT / f"d{i}.mp3"), 3) for i in range(len(DIMA))]}, ensure_ascii=False))
    print("durs", d, "total", round(sum(d), 2))
