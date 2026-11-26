#!/usr/bin/env python3
"""
Единый сканер ниш и A/B-анализатор вертикальных роликов (YouTube Shorts / TikTok).
Использование:
  python3 scripts/shorts_radar.py niches                  # Поиск свежих ниш (RU)
  python3 scripts/shorts_radar.py niches --lang en        # Поиск свежих ниш (EN)
  python3 scripts/shorts_radar.py niches "запрос 1" ...   # Поиск ниш по своим сеялкам
  python3 scripts/shorts_radar.py ab "запрос 1" ...       # A/B отбор: 10+ viral vs 10+ flop одного качества
"""

import argparse
import json
import re
import shutil
import subprocess
import urllib.parse
import urllib.request
from datetime import datetime, timedelta
from pathlib import Path

OUT_DIR = Path("research_output")
TMP_DIR = Path("/tmp/shorts_radar")
OUT_DIR.mkdir(exist_ok=True)

SEEDS_RU = [
    "анимация история shorts",
    "страшная переписка shorts",
    "правила выживания shorts",
    "почему нельзя shorts",
    "pov история shorts",
    "озвучка комикса shorts",
    "необъяснимое видео shorts",
]

SEEDS_EN = [
    "2d animation storytime shorts",
    "scary text story shorts",
    "rules horror shorts",
    "creepy pov shorts",
    "animated comedy skit shorts",
]

SUGGEST_URL = "https://suggestqueries.google.com/complete/search?client=youtube&ds=yt&hl={lang}&q={q}"


def run_ytdlp_json(target: str, extra_args: list[str] | None = None) -> list[dict]:
    cmd = ["yt-dlp", target, "--dump-json", "--no-warnings", "--ignore-errors", "--skip-download"]
    if extra_args:
        cmd.extend(extra_args)
    res = subprocess.run(cmd, capture_output=True, text=True)
    items = []
    for line in res.stdout.splitlines():
        if line.strip():
            try:
                items.append(json.loads(line))
            except json.JSONDecodeError:
                pass
    return items


def parse_date(date_str: str | None) -> datetime | None:
    if not date_str or len(date_str) != 8:
        return None
    try:
        return datetime.strptime(date_str, "%Y%m%d")
    except ValueError:
        return None


def is_vertical_short(item: dict) -> bool:
    dur = item.get("duration") or 0
    w = item.get("width") or 0
    h = item.get("height") or 0
    url = item.get("webpage_url") or ""
    return 18 <= dur <= 95 and (h > w or "/shorts/" in url or "tiktok.com" in url)


def expand_queries_youtube(seeds: list[str], lang: str = "ru", per_seed: int = 5) -> list[str]:
    expanded = list(seeds)
    for seed in seeds:
        url = SUGGEST_URL.format(lang=lang, q=urllib.parse.quote(seed))
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            raw = urllib.request.urlopen(req, timeout=5).read().decode("utf-8", errors="ignore")
            match = re.search(r"\[.*\]", raw)
            if match:
                data = json.loads(match.group(0))
                suggestions = [s[0] for s in data[1][:per_seed] if isinstance(s, list) and s]
                for s in suggestions:
                    if "shorts" not in s.lower():
                        s = f"{s} shorts"
                    if s not in expanded:
                        expanded.append(s)
        except Exception:
            pass
    return expanded[:25]


def analyze_video(video_url: str, vid: str, dur: float, prefix: str, with_pacing: bool = True) -> dict:
    TMP_DIR.mkdir(parents=True, exist_ok=True)
    vid_path = TMP_DIR / f"{prefix}_{vid}.mp4"
    subprocess.run(
        ["yt-dlp", video_url, "-f", "best[height<=720][ext=mp4]/best[height<=720]", "-o", str(vid_path), "--quiet"],
        capture_output=True,
    )
    if not vid_path.exists():
        return {"scene_cuts_per_min": 0, "intro_silence_sec": 0, "mid_frame": None}

    cuts_per_min = 0.0
    intro_silence = 0.0

    if with_pacing:
        scene_res = subprocess.run(
            ["ffmpeg", "-i", str(vid_path), "-vf", "select='gt(scene,0.28)',showinfo", "-f", "null", "-"],
            capture_output=True,
            text=True,
        )
        cuts = len(re.findall(r"pts_time:", scene_res.stderr))
        cuts_per_min = round(cuts / max(dur / 60.0, 0.1), 1)

        sil_res = subprocess.run(
            ["ffmpeg", "-t", "5", "-i", str(vid_path), "-af", "silencedetect=noise=-35dB:d=0.35", "-f", "null", "-"],
            capture_output=True,
            text=True,
        )
        silences = [float(x) for x in re.findall(r"silence_duration:\s*([0-9.]+)", sil_res.stderr)]
        intro_silence = round(sum(silences), 2)

    mid_ts = max(0.3, round(dur * 0.5, 2))
    frame_path = TMP_DIR / f"{prefix}_frame_{vid}.jpg"
    subprocess.run(
        ["ffmpeg", "-ss", str(mid_ts), "-i", str(vid_path), "-frames:v", "1", "-q:v", "4", "-y", str(frame_path)],
        capture_output=True,
    )
    vid_path.unlink(missing_ok=True)

    return {
        "scene_cuts_per_min": cuts_per_min,
        "intro_silence_sec": intro_silence,
        "mid_frame": str(frame_path) if frame_path.exists() else None,
    }


def build_collage(frame_paths: list[str], out_image: Path, cols: int = 5):
    valid = [p for p in frame_paths if p and Path(p).exists()]
    if not valid:
        return
    rows = max(1, (len(valid) + cols - 1) // cols)
    seq_dir = TMP_DIR / f"seq_{out_image.stem}"
    if seq_dir.exists():
        shutil.rmtree(seq_dir)
    seq_dir.mkdir(parents=True)

    for idx, src in enumerate(valid):
        shutil.copy(src, seq_dir / f"img_{idx:03d}.jpg")

    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-framerate",
            "1",
            "-i",
            str(seq_dir / "img_%03d.jpg"),
            "-vf",
            f"scale=200:-2,tile={cols}x{rows}",
            "-frames:v",
            "1",
            "-q:v",
            "5",
            str(out_image),
        ],
        capture_output=True,
    )


def fetch_top_comments(video_url: str, max_comments: int = 8) -> list[str]:
    items = run_ytdlp_json(
        video_url,
        ["--write-comments", "--extractor-args", f"youtube:max_comments={max_comments + 5},all,{max_comments + 5}"],
    )
    if not items:
        return []
    comments = items[0].get("comments") or []
    comments.sort(key=lambda c: c.get("like_count") or 0, reverse=True)
    return [f"[{c.get('like_count', 0)} likes] {c.get('text', '').strip()}" for c in comments[:max_comments]]


def cmd_niches(args):
    if TMP_DIR.exists():
        shutil.rmtree(TMP_DIR)
    seeds = args.queries or (SEEDS_EN if args.lang == "en" else SEEDS_RU)
    queries = expand_queries_youtube(seeds, lang=args.lang)
    cutoff_date = datetime.now() - timedelta(days=args.days)
    seen = set()
    outliers = []

    for q in queries:
        for item in run_ytdlp_json(f"ytsearch30:{q}"):
            vid = item.get("id")
            if not vid or vid in seen or not is_vertical_short(item):
                continue
            seen.add(vid)

            up_date = parse_date(item.get("upload_date"))
            if not up_date or up_date < cutoff_date:
                continue

            views = item.get("view_count") or 0
            subs = item.get("channel_follower_count") or 0
            if views < 40000 or subs > 30000:
                continue

            ratio = round(views / max(subs, 150), 1)
            if ratio < 8.0:
                continue

            outliers.append({
                "id": vid,
                "url": item.get("webpage_url"),
                "channel_url": item.get("channel_url"),
                "query": q,
                "title": item.get("title"),
                "channel": item.get("channel"),
                "subs": subs,
                "views": views,
                "viral_ratio": ratio,
                "duration": item.get("duration") or 30,
                "upload_date": item.get("upload_date"),
                "tags": (item.get("tags") or [])[:8],
                "desc_snippet": (item.get("description") or "")[:140].replace("\n", " "),
            })

    outliers.sort(key=lambda x: (x["viral_ratio"], x["views"]), reverse=True)
    top = outliers[:45]

    frames = []
    for idx, item in enumerate(top[:15]):
        info = analyze_video(item["url"], item["id"], item["duration"], f"niche_{idx:02d}", with_pacing=False)
        item["tile_index"] = idx
        frames.append(info["mid_frame"])

    collage_path = OUT_DIR / "niches_grid.jpg"
    build_collage(frames, collage_path, cols=5)

    out_file = OUT_DIR / "niches_outliers.json"
    out_file.write_text(json.dumps(top, ensure_ascii=False, indent=2), encoding="utf-8")
    shutil.rmtree(TMP_DIR, ignore_errors=True)
    print(f"Queries: {len(queries)} | Fresh outliers: {len(outliers)} | JSON: {out_file} | Collage: {collage_path}")


def cmd_ab(args):
    if TMP_DIR.exists():
        shutil.rmtree(TMP_DIR)
    queries = args.queries or [
        "страшная переписка анимация shorts",
        "хоррор история 2д анимация shorts",
        "правила выживания анимация shorts",
    ]
    seen = set()
    viral = []
    flops = []
    week_ago = datetime.now() - timedelta(days=7)

    for q in queries:
        target = q if q.startswith("http") else f"ytsearch50:{q}"
        for item in run_ytdlp_json(target):
            vid = item.get("id")
            if not vid or vid in seen or not is_vertical_short(item):
                continue
            seen.add(vid)

            views = item.get("view_count") or 0
            subs = item.get("channel_follower_count") or 0
            up_date = parse_date(item.get("upload_date"))
            ratio = round(views / max(subs, 100), 1)

            rec = {
                "id": vid,
                "url": item.get("webpage_url"),
                "channel_url": item.get("channel_url"),
                "title": item.get("title"),
                "channel": item.get("channel"),
                "subs": subs,
                "views": views,
                "ratio": ratio,
                "duration": item.get("duration") or 30,
                "upload_date": item.get("upload_date"),
                "same_channel": False,
            }

            if 0 < subs <= 20000 and views >= 50000 and ratio >= 8.0:
                viral.append(rec)
            elif up_date and up_date < week_ago and 30 <= views <= 2500 and (item.get("height") or 0) >= 1280:
                flops.append(rec)

    viral.sort(key=lambda x: x["ratio"], reverse=True)
    top_viral = viral[:15]

    # Внутриканальный A/B: ищем провальные ролики у тех же авторов
    checked_channels = set()
    for v in top_viral[:8]:
        ch_url = v.get("channel_url")
        if not ch_url or ch_url in checked_channels:
            continue
        checked_channels.add(ch_url)
        for ch_item in run_ytdlp_json(f"{ch_url}/shorts", ["--playlist-end", "20"]):
            cvid = ch_item.get("id")
            if not cvid or cvid in seen or not is_vertical_short(ch_item):
                continue
            seen.add(cvid)
            cviews = ch_item.get("view_count") or 0
            cdate = parse_date(ch_item.get("upload_date"))
            if cdate and cdate < week_ago and 30 <= cviews <= 2500:
                flops.insert(0, {
                    "id": cvid,
                    "url": ch_item.get("webpage_url"),
                    "channel_url": ch_url,
                    "title": ch_item.get("title"),
                    "channel": v["channel"],
                    "subs": v["subs"],
                    "views": cviews,
                    "ratio": round(cviews / max(v["subs"], 100), 2),
                    "duration": ch_item.get("duration") or 30,
                    "upload_date": ch_item.get("upload_date"),
                    "same_channel": True,
                })

    top_flops = flops[:15]
    viral_frames = []
    flop_frames = []

    for idx, v in enumerate(top_viral):
        tel = analyze_video(v["url"], v["id"], v["duration"], f"v_{idx:02d}", with_pacing=True)
        v["tile_index"] = idx
        v["scene_cuts_per_min"] = tel["scene_cuts_per_min"]
        v["intro_silence_sec"] = tel["intro_silence_sec"]
        viral_frames.append(tel["mid_frame"])

    for idx, f in enumerate(top_flops):
        tel = analyze_video(f["url"], f["id"], f["duration"], f"f_{idx:02d}", with_pacing=True)
        f["tile_index"] = idx
        f["scene_cuts_per_min"] = tel["scene_cuts_per_min"]
        f["intro_silence_sec"] = tel["intro_silence_sec"]
        flop_frames.append(tel["mid_frame"])

    for v in top_viral[:10]:
        v["top_comments"] = fetch_top_comments(v["url"], max_comments=8)

    viral_grid = OUT_DIR / "viral_grid.jpg"
    flop_grid = OUT_DIR / "flop_grid.jpg"
    build_collage(viral_frames, viral_grid, cols=5)
    build_collage(flop_frames, flop_grid, cols=5)

    out_file = OUT_DIR / "ab_candidates.json"
    out_file.write_text(
        json.dumps({"viral": top_viral, "flops": top_flops}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    shutil.rmtree(TMP_DIR, ignore_errors=True)
    print(f"Viral: {len(top_viral)} ({viral_grid}) | Flops: {len(top_flops)} ({flop_grid}) | JSON: {out_file}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Shorts Niche & A/B Research Radar")
    sub = parser.add_subparsers(dest="command", required=True)

    p_niches = sub.add_parser("niches", help="Поиск свежих взрывных ниш")
    p_niches.add_argument("--lang", default="ru", choices=["ru", "en"], help="Язык поиска (ru/en)")
    p_niches.add_argument("--days", type=int, default=45, help="Макс. возраст ролика в днях")
    p_niches.add_argument("queries", nargs="*", help="Свои базовые запросы (опционально)")
    p_niches.set_defaults(func=cmd_niches)

    p_ab = sub.add_parser("ab", help="A/B отбор: 10+ залетевших vs 10+ не залетевших одного качества")
    p_ab.add_argument("queries", nargs="*", help="Запросы или прямые URL тегов TikTok / каналов")
    p_ab.set_defaults(func=cmd_ab)

    parsed = parser.parse_args()
    parsed.func(parsed)
