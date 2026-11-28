#!/usr/bin/env bash
# Рендер тизера и 14 сцен лонга на GitHub Actions пачками по 3 → out/scenes/scene_NN.mp4
set -u
cd "$(dirname "$0")/.."
REPO=hjjkknjjkk919-cyber/my-site
mkdir -p out/scenes
DL=${TMPDIR:-/tmp}/hyper_dl; mkdir -p "$DL"
frames() { python3 -c "import json;print([s['frames'] for s in json.load(open('src/compositions/Hyper/timeline.json')) if s['n']==$1][0])"; }
run_batch() {
  ids=()
  for n in "$@"; do
    f=$(frames $n); id=$(printf "Hyper%02d" $n); name=$(printf "scene_%02d" $n)
    gh workflow run render-split.yml -R $REPO --ref main -f composition=$id -f frames=$f -f name=$name
    sleep 6
    ids+=("$(gh run list -R $REPO --workflow render-split.yml -L 1 --json databaseId -q '.[0].databaseId'):$name")
  done
  for x in "${ids[@]}"; do
    r=${x%%:*}; name=${x##*:}
    gh run watch "$r" -R $REPO --exit-status >/dev/null 2>&1; echo "$name run=$r exit=$?"
    rm -rf "$DL/$name"; gh run download "$r" -R $REPO -n "$name" -D "$DL/$name" && cp "$DL/$name/$name.mp4" "out/scenes/$name.mp4"
  done
}
todo=("$@"); [ ${#todo[@]} -eq 0 ] && todo=($(seq 0 14))
for ((i=0; i<${#todo[@]}; i+=3)); do run_batch "${todo[@]:i:3}"; done
ls -la out/scenes
