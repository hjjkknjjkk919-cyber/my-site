#!/usr/bin/env python3
"""Шортс «30 дней в гипермаркете», серия 1: Дима (покерфейс) и Нюанс (стеснительный, грустный). 10 проблем, переходы вспышкой.
Озвучка → public/audio/short30/lNN.mp3, тайминг и огибающие → src/compositions/Short30/vo.json"""
import json, subprocess, sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from hyper_audio import post, clean, dur, envelope, API  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public/audio/short30"
OUT.mkdir(parents=True, exist_ok=True)
VOICE = {"dima": "kwajW3Xh5svCeKU5ky2S", "nuance": "PRfCKe8kdrG3nuXOAnoH"}
# (бит, кто, текст)
LINES = [
    (0, "dima", "[deadpan, tired] День первый. Я заперт в гипермаркете на тридцать дней. С монстром, который боится меня больше, чем я его."),
    (0, "nuance", "[shy, very quiet] Здра... здрасьте."),
    (1, "dima", "[deadpan] Проблема номер один: еда. Просрочку не жрём. Пельмени по акции — жрём."),
    (1, "nuance", "[shy, sad] А можно мне один?.. Я со сметанкой."),
    (2, "dima", "[deadpan] Два: посадят за кражу. Пробиваю всё на кассе самообслуживания. Себя тоже."),
    (3, "dima", "[deadpan] Три: душ. Шесть бутылок «Святого источника» — и ты святой."),
    (3, "nuance", "[embarrassed, quiet] Я... отвернусь."),
    (4, "dima", "[deadpan, sleepy] Четыре: свет не выключают. Сплю в маске для сна за девятьсот рублей. Ценник не снимаю."),
    (5, "dima", "[deadpan] Пять: телефон сел. Зарядку взял в отделе электроники. Возвращать не буду."),
    (6, "dima", "[deadpan] Шесть: камеры. Охранник спит с восемнадцатого года."),
    (6, "nuance", "[sad, quiet] Это... это я с восемнадцатого сплю. В морозилке."),
    (7, "dima", "[deadpan] Семь: скука. Научил его играть в дурака. Он проигрывает — и извиняется."),
    (7, "nuance", "[sad, apologetic] Простите..."),
    (8, "dima", "[deadpan, satisfied] Восемь: другие люди. Их тут нет. Лучшая новость за год."),
    (9, "dima", "[deadpan, whispering] Девять: ночью из морозилки кто-то плачет."),
    (9, "nuance", "[crying softly] Меня уценили... на пятьдесят процентов."),
    (9, "dima", "[deadpan, warm] Меня тоже, брат. Всю жизнь."),
    (10, "dima", "[deadpan] Десять: как выйти. На тридцатый день двери открылись."),
    (10, "nuance", "[shy, hopeful, quiet] А можно... я с тобой?"),
    (10, "dima", "[deadpan] Можно. Только сметану сам покупаешь."),
    (11, "dima", "[deadpan] Какую проблему ты бы не пережил? Пиши номер в комменты."),
]


def tts(i):
    beat, who, text = LINES[i]
    fin = OUT / f"l{i:02d}.mp3"
    if fin.exists() and str(i) not in ONLY:
        return
    raw = OUT / f"l{i:02d}_raw.mp3"
    post(f"{API}/text-to-speech/{VOICE[who]}?output_format=mp3_44100_128", {"text": text, "model_id": "eleven_v3", "voice_settings": {"stability": 0.5}}, raw)
    clean(raw, fin, 1.08 if who == "nuance" else 1.0)
    raw.unlink()


if __name__ == "__main__":
    ONLY = set(sys.argv[1:])
    with ThreadPoolExecutor(3) as ex:
        list(ex.map(tts, range(len(LINES))))
    out = []
    for i, (beat, who, text) in enumerate(LINES):
        p = OUT / f"l{i:02d}.mp3"
        out.append({"id": f"l{i:02d}", "beat": beat, "who": who, "dur": round(dur(p), 3), "text": text.split("] ", 1)[-1], "env": envelope(p)})
    (ROOT / "src/compositions/Short30/vo.json").write_text(json.dumps(out, ensure_ascii=False))
    print("ИТОГО реплик", round(sum(x["dur"] for x in out), 1), "с")
