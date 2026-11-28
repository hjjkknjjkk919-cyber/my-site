#!/usr/bin/env bash
# Рекламный баннер «как во 2-й серии»: хромакей зелёного, 1080×530, x=0 y=695, 6 с с момента START; громкость -14 LUFS.
# usage: scripts/banner_overlay.sh in.mp4 out.mp4 START [banner.mp4]
set -euo pipefail
IN="$1"; OUT="$2"; ST="$3"; B="${4:-$(ls /root/.claude/uploads/*/917cdb08-sout_Banner_v2.mp4 | head -1)}"
END=$(python3 -c "print(round($ST+6,3))")
ffmpeg -loglevel error -y -i "$IN" -i "$B" -filter_complex "[1:v]colorkey=0x00ff00:0.32:0.08,despill=type=green,scale=1080:530,format=yuva420p,setpts=PTS+$ST/TB[b];[0:v][b]overlay=0:695:eof_action=pass:enable='between(t,$ST,$END)'[v]" \
  -map "[v]" -map 0:a -c:v libx264 -crf 18 -preset medium -pix_fmt yuv420p -af "loudnorm=I=-14:TP=-2:LRA=11,alimiter=limit=0.79:level=false" -c:a aac -b:a 192k -ar 48000 "$OUT"
