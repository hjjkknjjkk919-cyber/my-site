#!/usr/bin/env python3
"""
«Глаза и уши» для Shorts: учимся на залетевших роликах и проверяем свои рендеры.

  python3 scripts/viral_learner.py learn [--lang en] [--top 6] ["запрос" ...]
  python3 scripts/viral_learner.py selfcheck out/video.mp4 [--lang ru] [--model small]

learn     — свежие Shorts из поиска YouTube → скачивание с обходом блокировок
            (cookies.txt → yt-dlp с другими player_client → зеркала Piped) →
            faster-whisper (речь по таймингу) + ffmpeg (склейки, паузы, громкость) +
            раскадровка 5×2 из 10 кадров → research_output/study_batch.json и
            research_output/storyboard_NN_<id>.jpg. Видео удаляется сразу после разбора.
selfcheck — тот же разбор для своего рендера → research_output/selfcheck_<имя>.json/.jpg
            (+ список проблем: заикания, нечёткая речь, дыры в звуке, клиппинг).

cookies.txt в корне репо — необязателен и только от ПУСТОГО Google-аккаунта, никогда от основного.
Зависимости: pip install -U "yt-dlp[default]" faster-whisper (yt-dlp-ejs решает JS-задачи YouTube через node).
"""

import argparse
import json
import re
import subprocess
import sys
import tempfile
import urllib.parse
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from engagement_finder import SHORT_VIDEO_FILTER, UA, YT, engagement, get, json_after, num, walk  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "research_output"
OUT.mkdir(exist_ok=True)
COOKIES = ROOT / "cookies.txt"
FONT = Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf")
PLAYER_CLIENTS = ["tv_embedded,web_embedded", "ios,mweb", "android_vr,tv"]
PIPED_MIRRORS = ["pipedapi.kavin.rocks", "pipedapi.adminforge.de", "api.piped.private.coffee"]
QUERIES = {
    "ru": ["выжить 3 дня с бабайкой", "выжить 3 ночи анимация", "страшная 3d анимация",
           "правила выживания анимация", "почему нельзя анимация", "а что если я анимация"],
    "en": ["animation storytime shorts", "rules horror animation", "pov animation funny",
           "what if animation shorts"],
}
AGE_UNITS = [("сек", 0), ("мин", 0), ("час", 0), ("hour", 0), ("дн", 1), ("день", 1), ("day", 1),
             ("нед", 7), ("week", 7), ("мес", 30), ("month", 30), ("год", 365), ("лет", 365), ("year", 365)]


# ---------- утилиты ----------

def run(cmd: list[str], timeout: int = 180) -> tuple[int, str, str]:
    try:
        p = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
        return p.returncode, p.stdout, p.stderr
    except subprocess.TimeoutExpired:
        return -1, "", "timeout"


def short(err) -> str:
    lines = [ln.strip() for ln in str(err).splitlines() if ln.strip()]
    return (lines[-1] if lines else "unknown")[:160]


def fetch(url: str, dest: Path, limit: int = 150_000_000) -> bool:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r, open(dest, "wb") as f:
        size = 0
        while chunk := r.read(1 << 16):
            size += len(chunk)
            if size > limit:
                return False
            f.write(chunk)
    return dest.stat().st_size > 50_000


def age_days(published: str) -> int | None:
    s = published.lower()
    n = re.search(r"\d+", s)
    for unit, days in AGE_UNITS:
        if unit in s:
            return int(n.group()) * days if n else days
    return None


# ---------- поиск и метаданные ----------

def walk_lockups(node, out: list[dict]) -> None:
    """Настоящие Shorts из обычной выдачи (shortsLockupViewModel): id, название, просмотры."""
    if isinstance(node, dict):
        vm = node.get("shortsLockupViewModel")
        if isinstance(vm, dict):
            vid = vm.get("onTap", {}).get("innertubeCommand", {}).get("reelWatchEndpoint", {}).get("videoId")
            ov = vm.get("overlayMetadata", {})
            if vid:
                out.append({"id": vid, "title": ov.get("primaryText", {}).get("content", ""), "sec": 0,
                            "views": num(ov.get("secondaryText", {}).get("content", "")), "channel": "", "published": ""})
        for v in node.values():
            walk_lockups(v, out)
    elif isinstance(node, list):
        for v in node:
            walk_lockups(v, out)


def search(queries: list[str], min_views: int, max_age: int) -> list[dict]:
    seen, out = set(), []
    for q in queries:
        found: list[dict] = []
        walk(json_after(get(f"{YT}/results?search_query={urllib.parse.quote(q)}&sp={SHORT_VIDEO_FILTER}"), "ytInitialData"), found)
        walk_lockups(json_after(get(f"{YT}/results?search_query={urllib.parse.quote(q)}"), "ytInitialData"), found)
        for f in found:
            age = age_days(f.get("published", ""))
            if f["id"] in seen or (f["sec"] and not 15 <= f["sec"] <= 95) or f["views"] < min_views or (age is not None and age > max_age):
                continue
            seen.add(f["id"])
            f.update(query=q, age_days=age, views_per_day=round(f["views"] / (age or 30)))
            out.append(f)
    return sorted(out, key=lambda x: x["views_per_day"], reverse=True)


def is_vertical(path: Path) -> bool:
    _, out, _ = run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", str(path)], 30)
    w, _, h = out.strip().partition(",")
    return w.isdigit() and h.isdigit() and int(h) > int(w)


def channel_meta(vid: str, cache: dict) -> dict:
    try:
        oe = json.loads(get(f"{YT}/oembed?url={urllib.parse.quote(f'{YT}/watch?v={vid}')}&format=json") or "{}")
    except ValueError:
        oe = {}
    url = oe.get("author_url", "")
    if url and url not in cache:
        page = get(url)
        m = (re.search(r'"content":"([0-9][0-9.,\s\xa0]*(?:тыс\.|млн|K|M)?\s*(?:подписчик|subscriber)[^"]*)"', page)
             or re.search(r'"subscriberCountText":\{"simpleText":"([^"]+)"', page))
        cache[url] = num(m.group(1)) if m else 0
    return {"author": oe.get("author_name", ""), "author_url": url, "subs": cache.get(url, 0)}


# ---------- скачивание с обходом блокировок ----------

def via_ytdlp(url: str, work: Path, extra: list[str]) -> tuple[Path | None, str]:
    code, _, err = run(["yt-dlp", "--quiet", "--no-warnings", "--no-playlist", "--js-runtimes", "node",
                        "--socket-timeout", "15", "--retries", "1",
                        "-f", "b[height<=720][ext=mp4]/bv*[height<=720]+ba/b", "--merge-output-format", "mp4",
                        "-o", str(work / "v.%(ext)s"), *extra, url], 150)
    files = [p for p in work.glob("v.*") if p.suffix in (".mp4", ".webm", ".mkv") and p.stat().st_size > 50_000]
    return (files[0], "") if files else (None, short(err) if code else "no file")


def via_piped(vid: str, host: str, work: Path) -> tuple[Path | None, str]:
    try:
        req = urllib.request.Request(f"https://{host}/streams/{vid}", headers=UA)
        data = json.loads(urllib.request.urlopen(req, timeout=15).read())
    except Exception as e:  # noqa: BLE001 — любая сетевая ошибка = зеркало не сработало
        return None, short(e)

    def height(s: dict) -> int:
        return int(re.sub(r"\D", "", s.get("quality") or "0") or 0)

    mp4 = [s for s in data.get("videoStreams", []) if "mp4" in (s.get("mimeType") or s.get("format") or "").lower() and 0 < height(s) <= 720]
    muxed = sorted((s for s in mp4 if not s.get("videoOnly")), key=height)
    try:
        dest = work / "v.mp4"
        if muxed and fetch(muxed[-1]["url"], dest):
            return dest, ""
        video = sorted((s for s in mp4 if s.get("videoOnly")), key=height)
        audio = sorted(data.get("audioStreams", []), key=lambda s: s.get("bitrate", 0))
        if not (video and audio):
            return None, "no streams"
        vpart, apart = work / "v_only.mp4", work / "a_only.m4a"
        if fetch(video[-1]["url"], vpart) and fetch(audio[-1]["url"], apart, limit=30_000_000):
            run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(vpart), "-i", str(apart), "-c", "copy", "-shortest", str(dest)], 120)
            vpart.unlink(missing_ok=True)
            apart.unlink(missing_ok=True)
            if dest.exists():
                return dest, ""
        return None, "stream download failed"
    except Exception as e:  # noqa: BLE001
        return None, short(e)


def download(vid: str, work: Path) -> tuple[Path | None, str, dict]:
    url = f"{YT}/shorts/{vid}"
    tries: list[tuple[str, list[str]]] = []
    if COOKIES.exists():
        tries.append(("cookies", ["--cookies", str(COOKIES)]))
    tries.append(("yt-dlp", []))
    tries += [(f"yt-dlp:{c}", ["--extractor-args", f"youtube:player_client={c}"]) for c in PLAYER_CLIENTS]
    errors: dict[str, str] = {}
    for name, extra in tries:
        path, err = via_ytdlp(url, work, extra)
        if path:
            return path, name, errors
        errors[name] = err
    for host in PIPED_MIRRORS:
        path, err = via_piped(vid, host, work)
        if path:
            return path, f"piped:{host}", errors
        errors[f"piped:{host}"] = err
    return None, "", errors


# ---------- глаза и уши ----------

def duration(path: Path) -> float:
    _, out, _ = run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)], 30)
    try:
        return float(out.strip())
    except ValueError:
        return 0.0


def scene_cuts(path: Path) -> list[float]:
    _, _, err = run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(path), "-an",
                     "-vf", "scale=360:-2,select='gt(scene,0.28)',showinfo", "-f", "null", "-"], 300)
    return [round(float(t), 2) for t in re.findall(r"pts_time:([0-9.]+)", err)]


def audio_telemetry(path: Path, dur: float) -> dict:
    _, _, err = run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(path), "-vn",
                     "-af", "silencedetect=noise=-35dB:d=0.35,volumedetect", "-f", "null", "-"], 300)
    if "Audio:" not in err:
        return {"has_audio": False}
    starts = [max(float(x), 0.0) for x in re.findall(r"silence_start: (-?[0-9.]+)", err)]
    ends = [float(x) for x in re.findall(r"silence_end: ([0-9.]+)", err)]
    pauses = [[round(s, 2), round(ends[i] if i < len(ends) else dur, 2)] for i, s in enumerate(starts)]
    mean = re.search(r"mean_volume: (-?[0-9.]+) dB", err)
    peak = re.search(r"max_volume: (-?[0-9.]+) dB", err)
    return {
        "has_audio": True,
        "mean_db": float(mean.group(1)) if mean else None,
        "peak_db": float(peak.group(1)) if peak else None,
        "silence_total_sec": round(sum(e - s for s, e in pauses), 2),
        "longest_pause_sec": round(max((e - s for s, e in pauses), default=0.0), 2),
        "pauses": pauses[:30],
    }


_MODELS: dict = {}


def transcribe(path: Path, work: Path, lang: str | None, model_name: str) -> list[dict]:
    wav = work / "a.wav"
    code, _, _ = run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(path), "-vn", "-ac", "1", "-ar", "16000", str(wav)], 120)
    if code or not wav.exists():
        return []
    from faster_whisper import WhisperModel

    if model_name not in _MODELS:
        _MODELS[model_name] = WhisperModel(model_name, device="cpu", compute_type="int8")
    segments, _ = _MODELS[model_name].transcribe(str(wav), language=lang, vad_filter=True, beam_size=5)
    out = [{"t": round(s.start, 1), "end": round(s.end, 1), "text": s.text.strip(), "logprob": round(s.avg_logprob, 2)}
           for s in segments if s.text.strip()]
    wav.unlink(missing_ok=True)
    return out


def storyboard(path: Path, dur: float, dest: Path) -> list[float]:
    step = max(dur / 10, 0.05)
    font = f"fontfile={FONT}:" if FONT.exists() else ""
    vf = (f"select='isnan(prev_selected_t)+gte(t-prev_selected_t,{step:.3f})',scale=216:-2,"
          f"drawtext={font}text='%{{pts\\:hms}}':x=6:y=6:fontsize=20:fontcolor=white:box=1:boxcolor=black@0.65:boxborderw=4,"
          "tile=5x2:padding=4:color=black")
    run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(path), "-vf", vf, "-frames:v", "1", "-q:v", "4", str(dest)], 300)
    return [round(i * step, 1) for i in range(10)]


def analyze(path: Path, work: Path, board: Path, lang: str | None, model: str) -> dict:
    dur = duration(path)
    cuts = scene_cuts(path)
    audio = audio_telemetry(path, dur)
    segs = transcribe(path, work, lang, model) if audio.get("has_audio") else []
    times = storyboard(path, dur, board)
    speech_sec = sum(s["end"] - s["t"] for s in segs)
    words = sum(len(re.findall(r"\w+", s["text"])) for s in segs)
    return {
        "duration_sec": round(dur, 1),
        "cuts": {
            "count": len(cuts),
            "first_cut_sec": cuts[0] if cuts else None,
            "avg_shot_sec": round(dur / (len(cuts) + 1), 2) if dur else None,
            "per_10s": round(len(cuts) / max(dur, 1) * 10, 1),
            "times": cuts[:40],
        },
        "audio": audio,
        "speech_ratio": round(speech_sec / max(dur, 1), 2),
        "words_per_sec": round(words / max(speech_sec, 1), 2),
        "hook_0_4s": " ".join(s["text"] for s in segs if s["t"] < 4.0),
        "script_timed": " ".join(f"[{s['t']}s] {s['text']}" for s in segs)[:2500],
        "segments": segs,
        "storyboard": str(board.relative_to(ROOT)) if board.exists() else None,
        "frames": [{"t": t, "speech": next((s["text"] for s in segs if s["t"] <= t <= s["end"]), "")} for t in times],
    }


def speech_issues(rep: dict) -> list[str]:
    issues = []
    audio = rep["audio"]
    if not audio.get("has_audio"):
        return ["нет звуковой дорожки"]
    if (audio.get("peak_db") or -99) > -0.3:
        issues.append(f"клиппинг: пик {audio['peak_db']} dB")
    if (audio.get("mean_db") or 0) < -30:
        issues.append(f"тихо: средняя громкость {audio['mean_db']} dB")
    for s, e in audio.get("pauses", []):
        if e - s > 1.5 and 1.0 < s < rep["duration_sec"] - 1.5:
            issues.append(f"{s}s дыра в звуке {round(e - s, 1)} с")
    for seg in rep["segments"]:
        low = seg["text"].lower()
        words = re.findall(r"\w+", low)
        if any(a == b and len(a) > 1 for a, b in zip(words, words[1:])) or re.search(r"\b(\w{1,2})-\1", low):
            issues.append(f"{seg['t']}s повтор/заикание: {seg['text']}")
        if seg["logprob"] < -1.0:
            issues.append(f"{seg['t']}s нечётко (logprob {seg['logprob']}): {seg['text']}")
    return issues


# ---------- режимы ----------

def cmd_learn(a) -> None:
    for old in OUT.glob("storyboard_*.jpg"):
        old.unlink()
    cands = search(a.queries or QUERIES[a.lang], a.min_views, a.max_age)
    batch, wins, fails, sub_cache = [], {}, 0, {}
    blocked, studied = False, 0
    for c in cands[: a.top * 3]:
        if studied >= a.top or (blocked and len(batch) >= a.top):
            break
        item = {**c, "url": f"{YT}/shorts/{c['id']}"}
        if blocked:
            item["download"] = "skipped (все методы заблокированы на предыдущих роликах)"
        else:
            with tempfile.TemporaryDirectory(dir=OUT) as tmp:  # mp4 удаляется сразу после разбора
                work = Path(tmp)
                path, method, errors = download(c["id"], work)
                item["download"] = method or "failed"
                if errors and not path:
                    item["download_errors"] = errors
                if path and not is_vertical(path):
                    print(f"    горизонтальное, пропуск | {c['title'][:55]}")
                    continue
                if path:
                    studied += 1
                    item.update(analyze(path, work, OUT / f"storyboard_{studied:02d}_{c['id']}.jpg", None, a.model))
                    item["sec"] = item["sec"] or round(item["duration_sec"])
                    wins[method] = wins.get(method, 0) + 1
                else:
                    fails += 1
            blocked = not wins and fails >= 2
        item.update(channel_meta(c["id"], sub_cache), **engagement(c["id"], 5))
        item["viral_ratio"] = round(item["views"] / max(item["subs"], 200), 1)
        batch.append(item)
        print(f"{len(batch):>2}. {item['download'][:22]:<22} {item['sec']:>3}с {item['views']:>9} | {item['title'][:55]}")

    (OUT / "study_batch.json").write_text(json.dumps(batch, ensure_ascii=False, indent=2), encoding="utf-8")
    ok = sum(wins.values())
    print(f"Кандидатов: {len(cands)} | изучено: {len(batch)} | скачано и разобрано: {ok} {wins or ''} -> research_output/study_batch.json")
    if batch and not ok:
        errs = next((b["download_errors"] for b in batch if b.get("download_errors")), {})
        for k, v in errs.items():
            print(f"   {k}: {v}")
        print("Все методы заблокированы: положи cookies.txt от ПУСТОГО Google-аккаунта в корень репо "
              "или разреши хост pipedapi.kavin.rocks (и его прокси видеопотоков) в окружении.")


def cmd_selfcheck(a) -> None:
    video = Path(a.video).resolve()
    if not video.exists():
        sys.exit(f"нет файла: {video}")
    with tempfile.TemporaryDirectory(dir=OUT) as tmp:
        rep = analyze(video, Path(tmp), OUT / f"selfcheck_{video.stem}.jpg", a.lang, a.model)
    rep["issues"] = speech_issues(rep)
    out = OUT / f"selfcheck_{video.stem}.json"
    out.write_text(json.dumps(rep, ensure_ascii=False, indent=2), encoding="utf-8")
    au = rep["audio"]
    print(f"{video.name}: {rep['duration_sec']}с | склеек {rep['cuts']['count']} (≈{rep['cuts']['avg_shot_sec']}с/план) | "
          f"речь {rep['speech_ratio']:.0%}, {rep['words_per_sec']} сл/с | {au.get('mean_db')}/{au.get('peak_db')} dB")
    print(f"Хук 0–4с: {rep['hook_0_4s'] or '—'}")
    print(f"Проблем: {len(rep['issues'])}" + "".join(f"\n  - {x}" for x in rep["issues"][:10]))
    print(f"-> {out.relative_to(ROOT)}, {rep['storyboard']}")


def main() -> None:
    ap = argparse.ArgumentParser(description="Глаза и уши для Shorts: learn / selfcheck")
    sub = ap.add_subparsers(dest="mode", required=True)
    lr = sub.add_parser("learn", help="изучить свежие залетевшие Shorts")
    lr.add_argument("queries", nargs="*")
    lr.add_argument("--lang", default="ru", choices=["ru", "en"])
    lr.add_argument("--top", type=int, default=6)
    lr.add_argument("--min-views", type=int, default=45_000)
    lr.add_argument("--max-age", type=int, default=400, help="макс. возраст ролика, дней")
    lr.add_argument("--model", default="base", help="модель faster-whisper (base/small/medium)")
    sc = sub.add_parser("selfcheck", help="проверить свой рендер")
    sc.add_argument("video")
    sc.add_argument("--lang", default="ru")
    sc.add_argument("--model", default="base")
    a = ap.parse_args()
    cmd_learn(a) if a.mode == "learn" else cmd_selfcheck(a)


if __name__ == "__main__":
    main()
