#!/usr/bin/env python3
"""
Извлекает сценарии (тайминг-расшифровки), хуки 0-3с, длительность и метрики
залетевших YouTube Shorts для обучения Claude и генерации идей.
Работает через обычные веб-страницы YouTube (без поискового API, который отдаёт 403 в облаке).
"""

import argparse
import html
import json
import re
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

OUT_DIR = Path("research_output")
OUT_DIR.mkdir(exist_ok=True)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
}

DEFAULT_QUERIES_RU = [
    "анимация история shorts",
    "страшная переписка озвучка shorts",
    "правила выживания анимация shorts",
    "почему нельзя анимация shorts",
    "pov история озвучка shorts",
    "смешная анимация озвучка shorts",
]

DEFAULT_QUERIES_EN = [
    "2d animation storytime shorts",
    "rules horror animation shorts",
    "scary text story shorts",
    "animated comedy skit shorts",
]

YT = "https://www.youtube.com"
BLOCKED: list[str] = []  # статусы playabilityStatus, если YouTube требует вход («подтвердите, что вы не бот»)


def http_get(url: str, timeout: int = 10) -> str:
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        return urllib.request.urlopen(req, timeout=timeout).read().decode("utf-8", errors="ignore")
    except Exception:
        return ""


def parse_human_number(text: str) -> int:
    if not text:
        return 0
    s = text.lower().replace("\xa0", " ").replace(",", ".").strip()
    m = re.search(r"([0-9]+(?:\.[0-9]+)?)\s*(тыс|млн|k|m|b)?", s)
    if not m:
        digits = re.sub(r"\D", "", s)
        return int(digits) if digits else 0
    val = float(m.group(1))
    unit = m.group(2) or ""
    if unit in ("тыс", "k"):
        val *= 1_000
    elif unit in ("млн", "m"):
        val *= 1_000_000
    elif unit == "b":
        val *= 1_000_000_000
    return int(val)


def extract_json_var(page_html: str, var_name: str) -> dict:
    """Достаёт JSON-объект после `var_name = ` (устойчиво к тому, что следует за ним в <script>)."""
    m = re.search(rf"{re.escape(var_name)}\s*=\s*\{{", page_html)
    if not m:
        return {}
    try:
        obj, _ = json.JSONDecoder().raw_decode(page_html[m.end() - 1 :])
        return obj if isinstance(obj, dict) else {}
    except json.JSONDecodeError:
        return {}


def walk_search_shorts(node, out: list[dict]):
    if isinstance(node, dict):
        if "shortsLockupViewModel" in node:
            vm = node["shortsLockupViewModel"]
            vid = vm.get("onTap", {}).get("innertubeCommand", {}).get("reelWatchEndpoint", {}).get("videoId")
            overlay = vm.get("overlayMetadata", {})
            title = overlay.get("primaryText", {}).get("content", "")
            views = parse_human_number(overlay.get("secondaryText", {}).get("content", ""))
            if vid:
                out.append({"id": vid, "title": title, "views": views})
        elif "videoRenderer" in node:
            vr = node["videoRenderer"]
            vid = vr.get("videoId")
            title = "".join(r.get("text", "") for r in vr.get("title", {}).get("runs", []))
            views = parse_human_number(vr.get("viewCountText", {}).get("simpleText", ""))
            nav = vr.get("navigationEndpoint", {})
            if vid and ("reelWatchEndpoint" in nav or "shorts" in title.lower()):
                out.append({"id": vid, "title": title, "views": views})
        for v in node.values():
            walk_search_shorts(v, out)
    elif isinstance(node, list):
        for item in node:
            walk_search_shorts(item, out)


def parse_transcript_xml(xml_text: str) -> list[dict]:
    if not xml_text.strip():
        return []
    lines = []
    try:
        root = ET.fromstring(xml_text)
        for elem in root.findall(".//text"):
            start = round(float(elem.attrib.get("start", 0)), 1)
            text = html.unescape("".join(elem.itertext())).replace("\n", " ").strip()
            if text:
                lines.append({"t": start, "text": text})
    except ET.ParseError:
        pass
    return lines


def http_post_json(url: str, payload: dict, timeout: int = 10) -> dict:
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "Content-Type": "application/json",
            "User-Agent": "com.google.android.youtube/19.09.37 (Linux; U; Android 11) gzip",
        },
    )
    try:
        raw = urllib.request.urlopen(req, timeout=timeout).read().decode("utf-8", errors="ignore")
        return json.loads(raw)
    except Exception:
        return {}


def study_video(candidate: dict, sub_cache: dict[str, int]) -> dict | None:
    """Метаданные и расшифровка через youtubei/v1/player (клиент ANDROID); фолбэк — данные поиска и oEmbed."""
    vid = candidate["id"]
    player = http_post_json(
        f"{YT}/youtubei/v1/player?prettyPrint=false",
        {"videoId": vid, "context": {"client": {"clientName": "ANDROID", "clientVersion": "19.09.37", "androidSdkVersion": 30, "hl": "ru", "gl": "RU"}}},
    )
    status = player.get("playabilityStatus", {}).get("status")
    if status and status != "OK":
        BLOCKED.append(status)

    details = player.get("videoDetails", {})
    dur = int(details.get("lengthSeconds") or candidate.get("duration") or 35)
    views = int(details.get("viewCount") or candidate.get("views") or 0)
    title = details.get("title") or candidate.get("title") or ""
    author = details.get("author") or ""
    channel_id = details.get("channelId") or ""

    if not (15 <= dur <= 95) or views < 45_000:
        return None

    # Фолбэк через лёгкий oEmbed, если player не вернул автора
    author_url = f"{YT}/channel/{channel_id}" if channel_id else ""
    if not author:
        oe_raw = http_get(f"{YT}/oembed?url={YT}/watch?v={vid}&format=json", timeout=6)
        if oe_raw:
            try:
                oe = json.loads(oe_raw)
                author = oe.get("author_name", "")
                author_url = oe.get("author_url", "")
                title = title or oe.get("title", "")
            except Exception:
                pass

    subs = 0
    if author_url:
        if author_url in sub_cache:
            subs = sub_cache[author_url]
        else:
            ch_html = http_get(author_url, timeout=8)
            m = re.search(r'"subscriberCountText"\s*:\s*\{\s*"simpleText"\s*:\s*"([^"]+)"', ch_html)
            if not m:
                m = re.search(r'"content"\s*:\s*"([0-9.,]+\s*(?:тыс\.|млн|K|M)?\s*(?:подписчик|subscriber)[^"]*)"', ch_html)
            if m:
                subs = parse_human_number(m.group(1))
            sub_cache[author_url] = subs

    if subs > 150_000:
        return None

    tracks = player.get("captions", {}).get("playerCaptionsTracklistRenderer", {}).get("captionTracks", [])
    transcript = []
    if tracks:
        chosen = next((t for t in tracks if t.get("languageCode", "").startswith(("ru", "en"))), tracks[0])
        base_url = chosen.get("baseUrl", "")
        if base_url:
            transcript = parse_transcript_xml(http_get(base_url, timeout=8))

    hook_0_4s = " ".join(x["text"] for x in transcript if x["t"] <= 4.0)
    full_script = " ".join(f"[{x['t']}s] {x['text']}" for x in transcript)

    return {
        "id": vid,
        "url": f"{YT}/shorts/{vid}",
        "title": title,
        "author": author,
        "subs": subs,
        "subs_known": bool(subs),
        "duration_known": bool(details.get("lengthSeconds")),
        "views": views,
        "viral_ratio": round(views / max(subs, 200), 1),
        "duration_sec": dur,
        "keywords": (details.get("keywords") or [])[:10],
        "description": (details.get("shortDescription") or "")[:200].replace("\n", " "),
        "hook_0_4s": hook_0_4s,
        "script_timed": full_script[:2200],
    }


def main():
    parser = argparse.ArgumentParser(description="Viral Shorts Script & Hook Learner")
    parser.add_argument("--lang", default="ru", choices=["ru", "en"])
    parser.add_argument("--limit", type=int, default=18, help="Сколько роликов глубоко изучить")
    parser.add_argument("queries", nargs="*")
    args = parser.parse_args()

    queries = args.queries or (DEFAULT_QUERIES_EN if args.lang == "en" else DEFAULT_QUERIES_RU)
    seen = set()
    candidates = []

    for q in queries:
        html_page = http_get(f"{YT}/results?search_query={urllib.parse.quote(q)}")
        data = extract_json_var(html_page, "ytInitialData")
        found = []
        walk_search_shorts(data, found)
        for item in found:
            if item["id"] not in seen and item["views"] >= 45_000:
                seen.add(item["id"])
                candidates.append(item)

    candidates.sort(key=lambda x: x["views"], reverse=True)
    sub_cache: dict[str, int] = {}
    studied = []

    for c in candidates[: args.limit * 2]:
        res = study_video(c, sub_cache)
        if res:
            studied.append(res)
        if len(studied) >= args.limit:
            break

    studied.sort(key=lambda x: (bool(x["script_timed"]), x["viral_ratio"], x["views"]), reverse=True)
    out_path = OUT_DIR / "study_batch.json"
    out_path.write_text(json.dumps(studied, ensure_ascii=False, indent=2), encoding="utf-8")
    with_text = sum(1 for s in studied if s["script_timed"])
    if BLOCKED:
        print(f"Player API: {len(BLOCKED)}x {BLOCKED[0]} (bot check) — used search+oEmbed fallback, no durations/transcripts.")
    print(f"Candidates: {len(candidates)} | Studied: {len(studied)} viral Shorts ({with_text} with full timed scripts) -> {out_path}")


if __name__ == "__main__":
    main()
