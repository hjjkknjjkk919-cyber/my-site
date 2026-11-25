#!/usr/bin/env bash
# Перерисовать только некоторые кадры-сцены слоя «мир», вклеить их в готовый world.mp4,
# заново прогнать свои «шейдеры» и собрать ролик с надписями и звуком.
# Пример: tools/patch_render.sh s30 s05
set -e
cd "$(dirname "$0")/.."
S=/tmp/claude-0/-home-user-my-site/f69e00f4-7870-557d-b808-608a42bbd1a6/scratchpad
O=$S/layers
B="--concurrency=1 --browser-executable=/opt/pw-browsers/chromium --log=error"
cp "$O/world.mp4" "$O/world_prev.mp4"
for id in "$@"; do
  read A Z < <(python3 - "$id" <<'EOF'
import json, sys
v = json.load(open("src/survival/voice.json"))
ids = list(v)
cut = [0 if i == 0 else round((0.3 + v[k]["start"] - 0.08) * 30) for i, k in enumerate(ids)]
end = round((0.3 + v[ids[-1]]["end"] + 1.5) * 30)
i = ids.index(sys.argv[1])
print(cut[i], (cut[i + 1] if i + 1 < len(ids) else end) - 1)
EOF
)
  echo "сцена $id: кадры $A-$Z"
  npx remotion render src/index.ts SurvivalWorld "$O/patch.mp4" --frames=$A-$Z --codec h264 --crf 15 --muted $B
  ffmpeg -v error -y -i "$O/world.mp4" -i "$O/patch.mp4" -filter_complex \
    "[0:v]trim=end_frame=$A,setpts=PTS-STARTPTS[a];[0:v]trim=start_frame=$((Z+1)),setpts=PTS-STARTPTS[c];[1:v]setpts=PTS-STARTPTS[b];[a][b][c]concat=n=3:v=1:a=0[v]" \
    -map "[v]" -c:v libx264 -crf 15 -preset fast "$O/world_new.mp4"
  mv "$O/world_new.mp4" "$O/world.mp4"
done
python3 tools/shaders.py "$O/world.mp4" - "$O/world_fx.mp4"
ffmpeg -v error -y -i "$O/world_fx.mp4" -i "$O/ui.mov" -i "$O/audio.wav" -filter_complex \
  "[0:v][1:v]overlay=format=auto,format=yuv420p[v];[2:a]loudnorm=I=-14:TP=-1.5:LRA=11[a]" \
  -map "[v]" -map "[a]" -c:v libx264 -crf 23 -preset slow -maxrate 9M -bufsize 18M -c:a aac -b:a 192k -movflags +faststart "$S/odin_6000m_final.mp4"
echo FINISHED
