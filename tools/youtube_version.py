"""Версия для YouTube: на месте матов «пи-ип» (иначе YouTube урежет рекламу). Картинка не меняется.
Запуск: python3 tools/youtube_version.py вход.mp4 выход.mp4 beeps.json"""
import json, subprocess, sys
src, dst, beeps = sys.argv[1], sys.argv[2], json.load(open(sys.argv[3]))
cond = "+".join(f"between(t,{a},{b})" for a, b in beeps)
dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", src], capture_output=True, text=True).stdout)
fc = (f"[0:a]volume=volume=0:enable='{cond}'[m];"
      f"aevalsrc='0.22*sin(2*PI*1000*t)*gt({cond},0)':s=48000:d={dur:.3f},aformat=channel_layouts=stereo[bp];"
      f"[m][bp]amix=inputs=2:duration=first:normalize=0[a]")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-filter_complex", fc, "-map", "0:v", "-map", "[a]",
                "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", dst], check=True)
print("готово:", dst)
