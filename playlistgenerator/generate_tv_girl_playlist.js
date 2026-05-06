#!/usr/bin/env node
/**
 * Erstellt TV Girl.m3u8 aus deinen Ordnern.
 * Ausführen: node playlistgenerator/generate_tv_girl_playlist.js
 * (Von Projektroot: skillseed_app-main)
 */

const fs = require('fs');
const path = require('path');

// TV Girl liegt in Downloads neben skillseed_app-main
const BASE = path.join(__dirname, '..', '..', 'TV Girl');
const DIRS = [
  'French_exit-19115',
  "Jordana and TV Girl - Summer's Over",
  'TV Girl - Death of a Party Girl',
  'tv_girl_the-night-in-question-french-exit-outtakes',
  'Who Really Cares',
];

const EXT = ['.mp3', '.flac', '.m4a', '.wav'];
const OUT = path.join(__dirname, 'TV Girl.m3u8');

function findAudio(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) findAudio(full, files);
    else if (EXT.includes(path.extname(e.name).toLowerCase())) files.push(full);
  }
  return files;
}

const all = [];
for (const d of DIRS) {
  const full = path.join(BASE, d);
  const list = findAudio(full).sort();
  all.push(...list);
}

if (all.length === 0) {
  console.error('Keine Audio-Dateien in:', BASE);
  console.error('Prüfe, ob der Ordner existiert und die Namen stimmen:', DIRS.join(', '));
  process.exit(1);
}

const lines = all.map((f) => '/storage/sdcard0/Playlists/' + path.basename(f));
fs.writeFileSync(OUT, lines.join('\n') + '\n', 'utf8');
console.log('TV Girl.m3u8 erstellt:', lines.length, 'Songs');
console.log('Pfad:', OUT);
