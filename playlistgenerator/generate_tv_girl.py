#!/usr/bin/env python3
"""
Erstellt TV Girl.m3u8 mit exakten Dateinamen (1:1 wie die MP3/FLAC).
Ausführen: python3 playlistgenerator/generate_tv_girl.py
"""
import os
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent.parent / "TV Girl"  # Downloads/TV Girl
DIRS = [
    "French_exit-19115",
    "Jordana and TV Girl - Summer's Over",
    "TV Girl - Death of a Party Girl",
    "tv_girl_the-night-in-question-french-exit-outtakes",
    "Who Really Cares",
]

EXT = {'.mp3', '.flac', '.m4a', '.wav'}
OUT = Path(__file__).parent / "TV Girl.m3u8"

all_files = []
for dir_name in DIRS:
    dir_path = BASE / dir_name
    if dir_path.exists():
        for root, dirs_list, files in os.walk(dir_path):
            for f in files:
                file_path = Path(root) / f
                if file_path.suffix.lower() in EXT:
                    all_files.append(str(file_path))

all_files.sort()

if not all_files:
    error_msg = f"Keine Dateien gefunden in: {BASE}\nVerzeichnisse gesucht: {', '.join(DIRS)}"
    print(error_msg)
    with open('/tmp/tv_girl_error.txt', 'w') as f:
        f.write(error_msg)
    exit(1)

lines = [f"/storage/sdcard0/Playlists/{os.path.basename(f)}" for f in all_files]
OUT.write_text('\n'.join(lines) + '\n', encoding='utf-8')
print(f"TV Girl.m3u8 erstellt: {len(lines)} Songs")
print(f"Pfad: {OUT}")
