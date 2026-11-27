#!/usr/bin/env python3
"""Ремейк «Чайник»: новая озвучка по таймингу исходника + звуки для залипалки → public/remake/, тайминги → src/compositions/Remake90s/vo.json"""
import json
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public/remake"
OUT.mkdir(parents=True, exist_ok=True)
API = "https://api.elevenlabs.io/v1"
HDR = {"xi-api-key": "proxy-injected", "Content-Type": "application/json"}
V = {"hero": "ws3YyKFd5whKb21yaXES", "boss": "0BcDz9UPwL3MpsnTeUlO", "kid": "MWyJiWDobXN8FX3CJTdE"}

# (старт в исходнике, кто, текст для TTS, текст субтитров)
LINES = [
    (0.0, "hero", "[tense, whispering] Меня вытащили за шиворот и прижали к стене.", "Меня вытащили за шиворот и прижали к стене."),
    (2.4, "boss", "[menacing] Откуда?", "Откуда?"),
    (3.4, "hero", "[nervous] Лысый, на щеке шрам, старший у всех.", "Лысый, на щеке шрам, старший у всех."),
    (5.7, "hero", "[thinking fast] Скажу — с этой улицы, бьют как чужого.", "Скажу — с этой улицы, бьют как чужого."),
    (8.2, "hero", "[thinking fast] Скажу — ниоткуда, бьют как чушпана.", "Скажу — ниоткуда, бьют как чушпана."),
    (10.7, "hero", "[shaky, brave] Я с вами.", "Я с вами."),
    (12.3, "hero", "Старший засмеялся. Сунул мне в руки мятый чайник.", "Старший засмеялся. Сунул мне в руки мятый чайник."),
    (15.2, "hero", "[quiet] Внутри гремели гайки.", "Внутри гремели гайки."),
    (16.6, "boss", "[mocking, threatening] С нами? Тогда беги и бей, как все. Не будешь бить — бьём тебя.", "С нами? Тогда беги и бей, как все. Не будешь бить — бьём тебя."),
    (20.4, "hero", "[fast, breathless] Толпа рванула дальше. Меня тащили в середину.", "Толпа рванула дальше. Меня тащили в середину."),
    (23.1, "hero", "[breathless] Я бежал и звенел, как они.", "Я бежал и звенел, как они."),
    (25.0, "hero", "[anxious] Чайник бил меня по коленям, а я думал только об одном: лишь бы не к нам.", "Чайник бил меня по коленям, а я думал только об одном: лишь бы не к нам."),
    (29.4, "hero", "[dread] Мы свернули на мою улицу. Потом в мой двор.", "Мы свернули на мою улицу. Потом в мой двор."),
    (32.2, "hero", "[dread, slow] Моя пятиэтажка. Мой подъезд. Наше окно на втором.", "Моя пятиэтажка. Мой подъезд. Наше окно на втором."),
    (35.2, "hero", "[sad, soft] Там горит свет. Там ждут хлеб.", "Там горит свет. Там ждут хлеб."),
    (37.2, "boss", "[shouting] Здесь чужие живут! Ломай всё!", "Здесь чужие живут! Ломай всё!"),
    (39.4, "hero", "[tense] И тут открылась дверь подъезда.", "И тут открылась дверь подъезда."),
    (41.1, "hero", "[tense] На крыльцо вышел мой младший брат с мусорным ведром.", "На крыльцо вышел мой младший брат с мусорным ведром."),
    (44.0, "hero", "[heartbroken] Ему восемь. Он увидел толпу. И увидел в ней меня — с чайником.", "Ему восемь. Он увидел толпу. И увидел в ней меня — с чайником."),
    (47.8, "kid", "[confused, quiet] Братан?", "Братан?"),
    (48.8, "hero", "[slow, dread] Старший медленно повернулся ко мне. Потом к нему. И поднял чайник над головой.", "Старший медленно повернулся ко мне. Потом к нему. И поднял чайник над головой."),
]
END = 53.0
SFX = [
    ("pluck", "single soft marimba pluck note, short, clean, satisfying", 0.6),
    ("clash", "two glass marbles clinking hard together with sparkle, short", 0.7),
    ("pop", "satisfying bubble pop with tiny sparkle, short", 0.5),
]


def post(url, body, dest):
    for i in range(6):
        try:
            req = urllib.request.Request(url, json.dumps(body).encode(), HDR)
            dest.write_bytes(urllib.request.urlopen(req, timeout=180).read())
            return
        except urllib.error.HTTPError as e:
            if e.code != 429 or i == 5:
                raise
            time.sleep(4 * (i + 1))


def dur(p):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)], capture_output=True, text=True).stdout)


if __name__ == "__main__":
    only = set(sys.argv[1:])
    vo = []
    for i, (t, who, text, sub) in enumerate(LINES):
        name = f"v{i:02d}"
        raw, fin = OUT / f"{name}_raw.mp3", OUT / f"{name}.mp3"
        if not fin.exists() or name in only:
            post(f"{API}/text-to-speech/{V[who]}?output_format=mp3_44100_128", {"text": text, "model_id": "eleven_v3", "voice_settings": {"stability": 0.0}}, raw)
            slot = (LINES[i + 1][0] if i + 1 < len(LINES) else END) - t - 0.06
            af = "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=stop_periods=-1:stop_duration=0.15:stop_threshold=-42dB"
            subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(raw), "-af", af, str(fin)], check=True)
            d = dur(fin)
            tempo = min(1.35, max(1.0, d / slot))
            subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(fin), "-af", f"atempo={tempo:.3f},loudnorm=I=-15:TP=-1.5", "-ar", "44100", str(raw)], check=True)
            raw.replace(fin)
        vo.append({"file": name, "at": t, "dur": round(dur(fin), 3), "text": sub, "who": who})
    for n, prompt, d in SFX:
        if not (OUT / f"sfx_{n}.mp3").exists():
            post(f"{API}/sound-generation", {"text": prompt, "duration_seconds": d, "prompt_influence": 0.6}, OUT / f"sfx_{n}.mp3")
    out = ROOT / "src/compositions/Remake90s"
    out.mkdir(parents=True, exist_ok=True)
    (out / "vo.json").write_text(json.dumps({"end": END, "lines": vo}, ensure_ascii=False, indent=1))
    over = [(v["file"], round(v["at"] + v["dur"] - (LINES[i + 1][0] if i + 1 < len(LINES) else END), 2)) for i, v in enumerate(vo)]
    print("overflow:", [o for o in over if o[1] > 0])
