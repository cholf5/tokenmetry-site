#!/bin/bash
# Mux captured frames + CC0 music into the final PV mp4.
# Usage: mux.sh [en|zh]
# Audio: cut [start_s, start_s+frameDur] from the track, loudness-normalize
# to -14 LUFS (X standard), 30 ms fade-in, 1.2 s fade-out matching the video.
set -euo pipefail

PROMO="$(cd "$(dirname "$0")/.." && pwd)"
FPS=30
LANGV="${1:-en}"
TRACK_RESOLVED=""
FRAMES="$PROMO/frames/$LANGV"
OUT="$PROMO/out/tokenmetry-launch-pv-$LANGV.mp4"

read -r SS DUR < <(python3 -c "
import json
tl = json.load(open('$PROMO/assets/timeline.json'))
n = round(tl['duration_s'] * $FPS)
print(f\"{tl['start_s']:.4f} {n / $FPS:.4f}\")")
TRACK="$PROMO/$(python3 -c "import json; print(json.load(open('$PROMO/assets/timeline.json'))['track_file'])")"
N=$(ls "$FRAMES"/f*.png 2>/dev/null | wc -l | tr -d ' ')
AUD_DUR=$(python3 -c "print(f'{$N / $FPS:.4f}')")
FADE_ST=$(python3 -c "print(f'{$AUD_DUR - 1.2:.4f}')")
echo "frames=$N  audio: ss=$SS dur=$AUD_DUR fade@$FADE_ST"

ffmpeg -y -framerate $FPS -i "$FRAMES/f%05d.png" -i "$TRACK" -filter_complex \
  "[1:a]atrim=start=$SS:end=$(python3 -c "print(f'{$SS + $AUD_DUR:.4f}')"),asetpts=PTS-STARTPTS,afade=t=in:st=0:d=0.03,loudnorm=I=-14:TP=-1.5:LRA=11,afade=t=out:st=$FADE_ST:d=1.2[a]" \
  -map 0:v -map "[a]" \
  -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p \
  -c:a aac -b:a 192k -ar 48000 -movflags +faststart -shortest "$OUT"

echo "--- result ---"
ffprobe -v error -show_entries format=duration,size,bit_rate -show_entries stream=codec_name,width,height,r_frame_rate -of default=noprint_wrappers=1 "$OUT"
