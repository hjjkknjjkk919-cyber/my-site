#!/usr/bin/env python3
"""Серия 2 «Диван и первая работа»: реплики (ElevenLabs v3) + SFX → public/audio/nuans2/, длительности → src/compositions/NuansEp2/durs.json."""
import json
import subprocess
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public/audio/nuans2"
OUT.mkdir(parents=True, exist_ok=True)
API = "https://api.elevenlabs.io/v1"
HDR = {"xi-api-key": "proxy-injected", "Content-Type": "application/json"}
V = {"dima": "kwajW3Xh5svCeKU5ky2S", "nuance": "PRfCKe8kdrG3nuXOAnoH", "mom": "Fy6bUBXCIVErEtK9FN5d", "kid": "ws3YyKFd5whKb21yaXES", "admin": "ZleKRMCJL4E5Uc5viWNH"}

LINES = [
    ("l01", "dima", "[tired, sarcastic] Купил, блядь, у Валеры диван с сюрпризом. Сюрприз — мама моего демона. И через пять минут у меня в хате начался полный пиздец."),
    ("l02", "mom", "[shouting, commanding] Триста лет балбесу, а он всё по шкафам шкерится! Полка кривая, свет жжёшь, за хату не платишь — пиздуй работать!"),
    ("l03", "nuance", "[embarrassed, panicking] Мам, блядь, ну не при Диме! Я древнее зло, какой нахер работать?"),
    ("l04", "dima", "[calm, deadpan] Не-не, продолжайте. Коммуналку теперь на троих пилим."),
    ("l05", "dima", "[dry, sarcastic] Короче, собрали князя тьмы как в первый класс: бутерброд в фольгу и вакансию в хоррор-квест."),
    ("l05b", "dima", "[dry, sarcastic] Правда, туториал «как пугать людей» у него не грузился — заблокировано. Ну я включил ВПН — и князь тьмы снова в теме."),
    ("l06", "dima", "[deadpan] Слышь, инфернальный, только хату не позорь."),
    ("l07", "nuance", "[confident, smug] Дима, расслабься. У меня три века стажа, они там обосрутся."),
    ("l08", "kid", "[bored, yawning] Чё за хуйня, пацаны? Смотри, какой-то дед в колготках сутулится. Ставлю одну звезду."),
    ("l09", "nuance", "[trembling, sad] Они назвали меня сутулой шваброй, Дима... Я разучился пугать людей, блядь."),
    ("l10", "admin", "[stuttering, ecstatic] Б-боже... Вот это психология! Вы приняты, аванс сразу!"),
    ("l11", "dima", "[deadpan, tired] Да я вообще-то за этим долбоёбом зашёл."),
    ("l12", "dima", "[dry, satisfied] Короче, за свет закрыл я. Валере ставлю пять звёзд. Шесть — если заберёт маму."),
]
SFX = [
    ("springs", "old velour sofa springs creaking and cracking as a heavy man flops onto it, cushions squeak", 2.0),
    ("thud", "dull heavy thump with crunchy cushion rustle, something climbs out of a sofa", 1.2),
    ("slap", "paper bill slapped hard onto a wooden table", 0.8),
    ("slurp", "single loud slurp sip from a mug", 1.0),
    ("foil", "crinkling aluminum foil wrapping a sandwich", 1.5),
    ("lock", "apartment door lock click and door closing", 1.0),
    ("roar", "infernal demon roar with light bulbs popping and glass shattering sparks", 2.5),
    ("shutter", "several smartphone camera shutter clicks in a row", 2.5),
    ("irondoor", "long creaking heavy iron door slowly opening in a basement", 2.5),
    ("subboom", "deep cinematic sub bass boom hit", 1.5),
    ("teens", "teenagers screaming in panic and running away, footsteps, emergency door slammed", 3.0),
    ("money", "rustling stack of paper banknotes being handed over", 1.2),
    ("dishes", "clattering dishes and running water in a kitchen sink", 3.0),
    ("sent", "short soft app whoosh sound of a message sent", 0.8),
    ("push", "bright smartphone push notification chime", 1.0),
    ("room", "quiet apartment room tone, distant city traffic, fridge hum, loop", 10.0),
    ("quest", "dark basement ambience, low electrical hum, dripping water, flickering lamp buzz, loop", 10.0),
]


def post(url: str, body: dict, dest: Path) -> None:
    import time
    import urllib.error

    for i in range(6):
        try:
            req = urllib.request.Request(url, json.dumps(body).encode(), HDR)
            dest.write_bytes(urllib.request.urlopen(req, timeout=180).read())
            return
        except urllib.error.HTTPError as e:
            if e.code != 429 or i == 5:
                raise
            time.sleep(4 * (i + 1))


def tts(item):
    name, who, text = item
    raw = OUT / f"{name}_raw.mp3"
    post(f"{API}/text-to-speech/{V[who]}?output_format=mp3_44100_128", {"text": text, "model_id": "eleven_v3", "voice_settings": {"stability": 0.5}}, raw)
    # обрезаем тишину в начале и конце, громкость выравниваем
    af = "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,loudnorm=I=-16:TP=-1.5"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(raw), "-af", af, "-ar", "44100", "-b:a", "160k", str(OUT / f"{name}.mp3")], check=True)
    raw.unlink()
    return name


def sfx(item):
    name, prompt, dur = item
    post(f"{API}/sound-generation", {"text": prompt, "duration_seconds": dur, "prompt_influence": 0.5}, OUT / f"sfx_{name}.mp3")
    return name


def dur(p: Path) -> float:
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)], capture_output=True, text=True).stdout
    return round(float(out.strip()), 3)


def stt(name: str) -> str:
    import uuid

    b = "----" + uuid.uuid4().hex
    data = (OUT / f"{name}.mp3").read_bytes()
    body = (f"--{b}\r\nContent-Disposition: form-data; name=\"model_id\"\r\n\r\nscribe_v1\r\n--{b}\r\nContent-Disposition: form-data; name=\"language_code\"\r\n\r\nru\r\n"
            f"--{b}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"a.mp3\"\r\nContent-Type: audio/mpeg\r\n\r\n").encode() + data + f"\r\n--{b}--\r\n".encode()
    req = urllib.request.Request(f"{API}/speech-to-text", body, {"xi-api-key": "proxy-injected", "Content-Type": f"multipart/form-data; boundary={b}"})
    return json.loads(urllib.request.urlopen(req, timeout=120).read()).get("text", "")


if __name__ == "__main__":
    only = set(sys.argv[1:])
    lines = [l for l in LINES if ((l[0] in only) if only else not (OUT / f"{l[0]}.mp3").exists())]
    fx = [s for s in SFX if ((s[0] in only) if only else not (OUT / f"sfx_{s[0]}.mp3").exists())]
    with ThreadPoolExecutor(2) as ex:
        list(ex.map(tts, lines))
        list(ex.map(sfx, fx))
    durs = {n: dur(OUT / f"{n}.mp3") for n, _, _ in LINES}
    (ROOT / "src/compositions/NuansEp2").mkdir(parents=True, exist_ok=True)
    (ROOT / "src/compositions/NuansEp2/durs.json").write_text(json.dumps(durs, indent=1))
    print("speech total", round(sum(durs.values()), 2))
    for n, _, _ in LINES:
        print(n, durs[n], "|", stt(n))
