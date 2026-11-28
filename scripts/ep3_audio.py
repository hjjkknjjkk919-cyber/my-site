#!/usr/bin/env python3
"""Серия 3 «Холодильник от Валеры Перекупа»: голоса → public/audio/ep3/vN.mp3, 3-слойные SFX (саб + фоли + высокий слой), сведённые ffmpeg → sfx_<event>.mp3,
тайминг и огибающие → src/compositions/NuansEp3/vo.json"""
import json, subprocess, sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from hyper_audio import post, clean, dur, envelope, API  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public/audio/ep3"
LAY = OUT / "layers"
LAY.mkdir(parents=True, exist_ok=True)
VOICE = {"dima": "kwajW3Xh5svCeKU5ky2S", "valera": "3EuKHIEZbSzrHGNmdYsx", "otm": "j9qIyycr9PcZ7d4yj21f", "nuance": "PRfCKe8kdrG3nuXOAnoH", "mama": "Fy6bUBXCIVErEtK9FN5d"}
LINES = [
    ("dima", "[tired, deadpan] Старый холодильник сдох, пельмени тают. Пришлось брать тот самый — от Валеры Перекупа."),
    ("valera", "[sly, fast, cheerful salesman] Брат, зверь-машина! Морозит до минус шестисот. Только после полуночи в морозилку не лезь и с ней не спорь."),
    ("otm", "[gruff, raspy, angry bass] Дверь закрой, блядь, сквозит! Вы чё, в лифте родились?!"),
    ("dima", "[deadpan, calm] Слышь, Снегурочка. Ты в моей хате живёшь. Либо скидываешься на свет, либо я тебя феном разморожу."),
    ("otm", "[gruff, shouting] Я тут по акции заселился, иди нахуй!"),
    ("nuance", "[scared, soft] Дим, он нам щас всю хрущёвку в Антарктиду превратит!"),
    ("mama", "[furious, commanding, loud] Вы у меня щас за каждый киловатт кровью харкать будете! Пошли отрабатывать!"),
    ("dima", "[deadpan, to camera] Короче, чтобы оплатить свет за этот холодильник, мама устроила нас в ночную смену в гипермаркет. А через десять минут двери завалило снегом на месяц. Подписывайся — завтра покажу, как мы делили пельмени."),
    ("nuance", "[muffled, teeth chattering, frozen] Д-д-дима... з-закрой..."),
    ("nuance", "[shivering, then brave] Бррр... Ладно. Щас я с ним по-хорошему поговорю."),
    ("otm", "[gruff] Чё надо?!"),
    ("dima", "[deadpan] Ну. Поговорил по-хорошему."),
    ("otm", "[gruff, laughing] Следующий! Кто ещё по-хорошему хочет?!"),
    ("dima", "[deadpan] Курица гриль. Только наоборот."),
    ("otm", "[terrified, whispering] Ёп... Мама пришла..."),
    ("otm", "[terrified, fast, polite] Понял, тётенька! Уже отрабатываю!"),
    ("dima", "[deadpan] Вот и скинулся на свет."),
    ("nuance", "[embarrassed, sad] Мам, ну не при всех..."),
]
# слой: (имя, промпт ElevenLabs | "sine:Гц:сек", длительность)
LAYERS = {
    "scrape": ("heavy metal refrigerator legs scraping across linoleum floor", 2.5),
    "thud": ("deep heavy thud of a refrigerator body dropped on the floor, low sub impact", 1.2),
    "pots": ("metal pots and a pan rattling on a gas stove", 1.5),
    "hum55": ("sine:55:9", 9),
    "pop": ("sticky rubber fridge door seal suction pop", 0.7),
    "air": ("sudden pressurized cold air release burst whoosh", 1.2),
    "crackle": ("high pitched glass freezing crackle, ice crystallizing", 2.2),
    "wind": ("howling arctic blizzard wind gusts whistling indoors", 9.0),
    "clicks": ("series of ice crystallization clicks and crackles of different pitch", 4.0),
    "icicle": ("glass-like knock and snap of an icicle broken off", 0.8),
    "slam": ("heavy metal fridge door slammed shut with short small kitchen echo", 1.5),
    "magnet": ("fridge magnet and door rattling after a slam", 1.0),
    "sub": ("sine:48:0.5", 0.5),
    "swish": ("fast air swish whoosh", 0.7),
    "flick": ("sharp loud finger flick snap", 0.5),
    "dishes": ("cascade of plates, pots and cups crashing into a metal kitchen sink", 2.5),
    "plop": ("single water drop plop from a faucet", 0.5),
    "whistle": ("object whistling fast through the air", 1.4),
    "umbrella": ("umbrella spring mechanism opening click and fabric snap", 0.7),
    "meat": ("dull heavy thud of frozen meat hitting stretched umbrella fabric", 0.8),
    "arc": ("electric arc crackling with sparks", 5.0),
    "transformer": ("rising electrical transformer hum buzz", 6.0),
    "steps": ("heavy slipper footsteps on linoleum floor", 3.0),
    "pin": ("wooden rolling pin swinging swoosh through the air", 0.8),
    "storm": ("muffled blizzard howling outside behind thick glass doors", 12.0),
    "fridges": ("steady hum of supermarket refrigerators at night", 12.0),
    "mop": ("squeaky rubber mop squeegee on a tile floor", 3.0),
}
# событие: [(слой, задержка с, фильтр, громкость)]
EVENTS = {
    "fridge": [("scrape", 0.0, "highpass=f=200", 1.0), ("thud", 1.9, "lowpass=f=300", 1.4), ("pots", 2.0, "highpass=f=1500", 0.8), ("hum55", 2.4, "volume=0.25,tremolo=f=3:d=0.3", 1.0)],
    "freezer": [("pop", 0.0, "lowpass=f=1200", 1.2), ("air", 0.08, "highpass=f=400", 1.0), ("crackle", 0.3, "highpass=f=2500", 0.9)],
    "frost": [("wind", 0.0, "highpass=f=250", 0.9), ("clicks", 0.6, "highpass=f=1800", 0.8), ("icicle", 7.9, "highpass=f=900", 1.1)],
    "slam": [("sub", 0.0, "lowpass=f=120", 1.5), ("slam", 0.0, "anull", 1.0), ("magnet", 0.15, "highpass=f=2000", 0.8)],
    "flick": [("swish", 0.0, "highpass=f=600", 0.9), ("flick", 0.35, "highpass=f=1200", 1.2), ("dishes", 1.5, "anull", 1.0), ("plop", 3.6, "highpass=f=700", 0.8)],
    "chicken": [("whistle", 0.0, "highpass=f=800", 0.9), ("umbrella", 0.5, "highpass=f=1500", 1.0), ("meat", 2.05, "lowpass=f=500", 1.4)],
    "meter": [("arc", 0.0, "highpass=f=2000", 0.8), ("transformer", 0.4, "lowpass=f=600", 0.9), ("steps", 0.2, "anull", 1.0), ("pin", 3.1, "highpass=f=600", 1.0)],
    "hyper": [("storm", 0.0, "lowpass=f=900", 1.0), ("fridges", 0.0, "lowpass=f=400", 0.6), ("mop", 2.0, "highpass=f=1500", 0.7)],
}


def gen_layer(name):
    prompt, d = LAYERS[name]
    p = LAY / f"{name}.mp3"
    if p.exists():
        return
    if prompt.startswith("sine:"):
        _, hz, sec = prompt.split(":")
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi", "-i", f"sine=frequency={hz}:duration={sec}", "-af", "afade=t=in:d=0.05,afade=t=out:st=" + str(float(sec) - 0.3) + ":d=0.3", str(p)], check=True)
    else:
        post(f"{API}/sound-generation", {"text": prompt, "duration_seconds": d, "prompt_influence": 0.6}, p)


def mix_event(ev):
    layers = EVENTS[ev]
    ins, fl = [], []
    for i, (name, delay, flt, vol) in enumerate(layers):
        ins += ["-i", str(LAY / f"{name}.mp3")]
        ms = int(delay * 1000)
        fl.append(f"[{i}:a]aresample=44100,aformat=channel_layouts=stereo,{flt},volume={vol},adelay={ms}|{ms}[a{i}]")
    fl.append("".join(f"[a{i}]" for i in range(len(layers))) + f"amix=inputs={len(layers)}:normalize=0,loudnorm=I=-18:TP=-2[o]")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *ins, "-filter_complex", ";".join(fl), "-map", "[o]", "-ar", "44100", "-b:a", "160k", str(OUT / f"sfx_{ev}.mp3")], check=True)


def tts(i):
    who, text = LINES[i]
    fin = OUT / f"v{i}.mp3"
    if fin.exists() and str(i) not in ONLY:
        return
    raw = OUT / f"v{i}_raw.mp3"
    post(f"{API}/text-to-speech/{VOICE[who]}?output_format=mp3_44100_128", {"text": text, "model_id": "eleven_v3", "voice_settings": {"stability": 0.5}}, raw)
    clean(raw, fin, {12: 1.15}.get(i, 1.08 if who == "nuance" else 1.0))
    raw.unlink()


if __name__ == "__main__":
    ONLY = set(sys.argv[1:])
    with ThreadPoolExecutor(3) as ex:
        list(ex.map(tts, range(len(LINES))))
        list(ex.map(gen_layer, LAYERS))
    for ev in EVENTS:
        mix_event(ev)
    out = [{"id": f"v{i}", "who": w, "dur": round(dur(OUT / f"v{i}.mp3"), 3), "text": t.split("] ", 1)[-1], "env": envelope(OUT / f"v{i}.mp3")} for i, (w, t) in enumerate(LINES)]
    (ROOT / "src/compositions/NuansEp3/vo.json").write_text(json.dumps(out, ensure_ascii=False))
    print("durs", [x["dur"] for x in out], "total", round(sum(x["dur"] for x in out), 1))
