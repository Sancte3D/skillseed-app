#!/bin/bash
# Generates TV Girl playlist with exact filenames. Run from project root or pass BASE path.
BASE="${1:-/Users/arthourosmichalissaridis/Downloads/TV Girl}"
OUT="${2:-playlistgenerator/TV Girl.m3u8}"

DIRS=(
  "French_exit-19115"
  "Jordana and TV Girl - Summer's Over"
  "TV Girl - Death of a Party Girl"
  "tv_girl_the-night-in-question-french-exit-outtakes"
  "Who Really Cares"
)

mkdir -p "$(dirname "$OUT")"
: > "$OUT"

for dir in "${DIRS[@]}"; do
  full="$BASE/$dir"
  [ -d "$full" ] || continue
  find "$full" -type f \( -iname "*.mp3" -o -iname "*.flac" -o -iname "*.m4a" -o -iname "*.wav" \) 2>/dev/null | sort | while read -r path; do
    echo "/storage/sdcard0/Playlists/$(basename "$path")" >> "$OUT"
  done
done

echo "Written $(wc -l < "$OUT") entries to $OUT"
