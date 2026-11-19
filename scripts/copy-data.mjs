// Salin aset data (bundle POI, profil hak) dari data/ ke out/ agar ikut static export.
// Dijalankan setelah `next build`, sebelum Workbox generateSW.
//   node scripts/copy-data.mjs

import { cpSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(root, 'out');

let copied = 0;

function copyDir(src, dest) {
  if (!existsSync(src)) {
    console.warn(`LEWAT (tidak ada): ${src}`);
    return;
  }
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src, { withFileTypes: true })) {
    if (entry.isFile()) {
      cpSync(resolve(src, entry.name), resolve(dest, entry.name));
      copied++;
    }
  }
  console.log(`OK ${src} -> ${dest}`);
}

copyDir(resolve(root, 'data/bundles'), resolve(out, 'bundles'));
copyDir(resolve(root, 'data/profiles'), resolve(out, 'profiles'));

console.log(`Total file disalin: ${copied}`);
