#!/usr/bin/env python3
"""
Ищет короткие ролики (до 1:30), которые активно комментируют и лайкают.
Работает из облака: страница поиска + youtubei/v1/next (лайки, комменты, дата, топ-комментарии).
Использование:
  python3 scripts/engagement_finder.py                 # запросы по умолчанию (RU)
  python3 scripts/engagement_finder.py "запрос" ...    # свои запросы
  python3 scripts/engagement_finder.py --max-sec 90 --min-views 20000
Результат: research_output/engagement.json + таблица в консоли.
"""

import argparse
import json
import re
import urllib.parse
import urllib.request
from pathlib import Path

OUT = Path("research_output")
OUT.mkdir(exist_ok=True)
YT = "https://www.youtube.com"
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0 Safari/537.36", "Accept-Language": "ru-RU,ru;q=0.9"}
CTX = {"client": {"clientName": "WEB", "clientVersion": "2.20251120.01.00", "hl": "ru", "gl": "RU"}}
SHORT_VIDEO_FILTER = "EgQQARgB"  # тип «видео» + длительность < 4 мин — в выдаче есть lengthText

DEFAULT_QUERIES = [
    "правила выживания анимация",
    "pov анимация история",
    "почему нельзя анимация",
    "страшилки анимация озвучка",
    "смешная анимация озвучка",
    "выживи если анимация",
    "что будет если анимация",
]


def get(url: str) -> str:
    try:
        return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=12).read().decode("utf-8", "ignore")
    except Exception:
        return ""


def post_next(payload: dict) -> str:
    try:
        req = urllib.request.Request(f"{YT}/youtubei/v1/next?prettyPrint=false", json.dumps(payload).encode(), {"Content-Type": "application/json", **UA})
        return urllib.request.urlopen(req, timeout=12).read().decode("utf-8", "ignore")
    except Exception:
        return ""


def num(text: str) -> int:
    s = (text or "").lower().replace("\xa0", " ").replace(" ", "").replace(",", ".")
    m = re.search(r"([0-9]+(?:\.[0-9]+)?)(тыс|млн|k|m)?", s)
    if not m:
        return 0
    v = float(m.group(1))
    v *= {"тыс": 1e3, "k": 1e3, "млн": 1e6, "m": 1e6}.get(m.group(2) or "", 1)
    return int(v)


def secs(length: str) -> int:
    parts = [int(p) for p in length.split(":") if p.isdigit()]
    total = 0
    for p in parts:
        total = total * 60 + p
    return total


def json_after(html: str, var: str) -> dict:
    m = re.search(rf"{re.escape(var)}\s*=\s*\{{", html)
    if not m:
        return {}
    try:
        return json.JSONDecoder().raw_decode(html[m.end() - 1 :])[0]
    except json.JSONDecodeError:
        return {}


def walk(node, out: list):
    if isinstance(node, dict):
        vr = node.get("videoRenderer")
        if isinstance(vr, dict) and vr.get("videoId"):
            out.append({
                "id": vr["videoId"],
                "title": "".join(r.get("text", "") for r in vr.get("title", {}).get("runs", [])),
                "sec": secs(vr.get("lengthText", {}).get("simpleText", "")),
                "views": num(vr.get("viewCountText", {}).get("simpleText", "")),
                "channel": "".join(r.get("text", "") for r in vr.get("ownerText", {}).get("runs", [])),
                "published": vr.get("publishedTimeText", {}).get("simpleText", ""),
            })
        for v in node.values():
            walk(v, out)
    elif isinstance(node, list):
        for v in node:
            walk(v, out)


def engagement(vid: str, top_n: int = 5) -> dict:
    s = post_next({"context": CTX, "videoId": vid})
    if not s:
        return {}
    facts = dict((label.split()[0].strip("\\"), val) for val, label in re.findall(r'"factoidRenderer":\{"value":\{"simpleText":"([^"]+)"\},"label":\{"simpleText":"([^"]+)"', s))
    likes = num(facts.get("Отметки", "") or facts.get("Likes", ""))
    m = re.search(r'"contextualInfo":\{"runs":\[\{"text":"([^"]+)"', s)
    comments = num(m.group(1)) if m else 0
    top = []
    tok = re.search(r'"continuationCommand":\{"token":"([^"]+)","request":"CONTINUATION_REQUEST_TYPE_WATCH_NEXT"', s)
    if tok:
        c = post_next({"context": CTX, "continuation": tok.group(1)})
        texts = re.findall(r'"commentEntityPayload".{0,400}?"content":\{"content":"((?:[^"\\]|\\.){0,200})', c)
        lk = re.findall(r'"likeCountNotliked":"([^"]*)"', c)
        for i, t in enumerate(texts[:top_n]):
            text = json.loads(f'"{t}"') if t else ""
            top.append(f"[{lk[i] if i < len(lk) else '0'}♥] {text}")
    return {"likes": likes, "comments": comments, "top_comments": top}


def main():
    ap = argparse.ArgumentParser(description="Короткие ролики с высокой вовлечённостью")
    ap.add_argument("queries", nargs="*")
    ap.add_argument("--max-sec", type=int, default=90)
    ap.add_argument("--min-views", type=int, default=20_000)
    ap.add_argument("--limit", type=int, default=25)
    a = ap.parse_args()

    seen, cands = set(), []
    for q in a.queries or DEFAULT_QUERIES:
        found = []
        walk(json_after(get(f"{YT}/results?search_query={urllib.parse.quote(q)}&sp={SHORT_VIDEO_FILTER}"), "ytInitialData"), found)
        for f in found:
            if f["id"] not in seen and 10 <= f["sec"] <= a.max_sec and f["views"] >= a.min_views:
                seen.add(f["id"])
                f["query"] = q
                cands.append(f)

    rows = []
    for c in sorted(cands, key=lambda x: x["views"], reverse=True)[: a.limit * 2]:
        e = engagement(c["id"])
        if not e:
            continue
        c.update(e)
        c["url"] = f"{YT}/shorts/{c['id']}"
        c["comments_per_1k"] = round(c["comments"] / max(c["views"], 1) * 1000, 2)
        c["likes_per_1k"] = round(c["likes"] / max(c["views"], 1) * 1000, 1)
        rows.append(c)
    rows.sort(key=lambda x: (x["comments_per_1k"], x["likes_per_1k"]), reverse=True)
    rows = rows[: a.limit]
    (OUT / "engagement.json").write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Кандидатов: {len(cands)} | с метриками: {len(rows)} -> research_output/engagement.json")
    for r in rows[:15]:
        print(f"{r['comments_per_1k']:>6} ком/1k | {r['likes_per_1k']:>5} лайк/1k | {r['views']:>9} | {r['sec']:>3}с | {r['title'][:60]}")


if __name__ == "__main__":
    main()
