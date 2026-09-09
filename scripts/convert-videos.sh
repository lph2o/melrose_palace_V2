#!/usr/bin/env bash
#
# Convertit les vidéos public/videos/*.mov en MP4 (H.264/AAC) optimisé mobile.
#
# Usage :
#   npm run convert:videos             # remux rapide sans perte + faststart
#   npm run convert:videos -- --encode # ré-encodage complet H.264 (CRF 23)
#
set -euo pipefail

VIDEO_DIR="public/videos"
MODE="${1:-remux}"

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "Erreur : ffmpeg introuvable. Installez-le : brew install ffmpeg" >&2
  exit 1
fi

shopt -s nullglob
converted=0
skipped=0
for src in "$VIDEO_DIR"/*.mov; do
  out="${src%.mov}.mp4"

  if [ -f "$out" ] && [ "$out" -nt "$src" ]; then
    echo "Deja a jour : $out"
    skipped=$((skipped + 1))
    continue
  fi

  echo "Conversion : $src -> $out"

  if [ "$MODE" = "encode" ]; then
    ffmpeg -hide_banner -loglevel warning -y -i "$src" \
      -c:v libx264 -preset medium -crf 23 -pix_fmt yuv420p -profile:v high -level 4.0 \
      -c:a aac -b:a 128k -movflags +faststart \
      "$out"
  else
    # Sources deja H.264/yuv420p : remux sans perte + faststart (streaming mobile)
    ffmpeg -hide_banner -loglevel warning -y -i "$src" -c copy -movflags +faststart "$out"
  fi

  converted=$((converted + 1))
done

echo "Termine : $converted convertie(s), $skipped ignoree(s)."
