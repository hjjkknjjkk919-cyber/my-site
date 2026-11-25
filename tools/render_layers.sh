set -e
cd /home/user/my-site
S=/tmp/claude-0/-home-user-my-site/f69e00f4-7870-557d-b808-608a42bbd1a6/scratchpad
O=$S/layers; rm -rf $O; mkdir -p $O
N=$(npx remotion compositions src/index.ts --browser-executable=/opt/pw-browsers/chromium 2>&1 | grep "^SurvivalWorld" | awk '{print $4}')
A=$((N/3)); B=$((2*N/3))
R="npx remotion render src/index.ts"
C="--concurrency=1 --browser-executable=/opt/pw-browsers/chromium --log=error"
$R SurvivalWorld $O/w1.mp4 --frames=0-$((A-1)) --codec h264 --crf 15 --muted $C &
$R SurvivalWorld $O/w2.mp4 --frames=$A-$((B-1)) --codec h264 --crf 15 --muted $C &
$R SurvivalWorld $O/w3.mp4 --frames=$B-$((N-1)) --codec h264 --crf 15 --muted $C &
$R SurvivalUI $O/ui.mov --codec prores --prores-profile 4444 --pixel-format yuva444p10le --image-format png --muted $C &
$R Survival $O/audio.wav --codec wav $C &
wait
printf "file 'w1.mp4'\nfile 'w2.mp4'\nfile 'w3.mp4'\n" > $O/list.txt
ffmpeg -v error -y -f concat -safe 0 -i $O/list.txt -c copy $O/world.mp4
python3 tools/shaders.py $O/world.mp4 - $O/world_fx.mp4
ffmpeg -v error -y -i $O/world_fx.mp4 -i $O/ui.mov -i $O/audio.wav -filter_complex "[0:v][1:v]overlay=format=auto,format=yuv420p[v];[2:a]loudnorm=I=-14:TP=-1.5:LRA=11[a]" -map "[v]" -map "[a]" -c:v libx264 -crf 23 -preset slow -maxrate 9M -bufsize 18M -c:a aac -b:a 192k -movflags +faststart $S/odin_6000m_final.mp4
ffmpeg -v error -y -i $S/odin_6000m_final.mp4 -vf "fps=3,scale=48:85,tile=40x9" -frames:v 1 $S/finalall.png
echo FINISHED
