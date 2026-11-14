// SAFE NEAR — demo "pihak berwajib terdekat" dengan data bundle asli.
// Jalankan: node scripts/nearest-demo.mjs
// Memuat data OSM Houston asli (sudah di-normalisasi), bukan mock.

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const bundle = JSON.parse(
  readFileSync(resolve(root, 'data/bundles/US-houston.json'), 'utf8'),
);

function haversineMeters(a, b) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

function nearest(category, from, limit = 5) {
  return bundle.pois
    .filter((p) => p.category === category)
    .map((p) => ({ ...p, dist: haversineMeters(from, p) }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, limit);
}

// Titik uji: downtown Houston (dekat HPD Central, 1200 Travis St)
const user = { lat: 29.7604, lon: -95.3698 };

console.log(`Bundle: ${bundle.id}  |  POI: ${bundle.pois.length}`);
console.log(`Titik user: ${user.lat}, ${user.lon}\n`);

for (const cat of ['police', 'hospital', 'fire', 'embassy']) {
  const list = nearest(cat, user);
  console.log(`== ${cat.toUpperCase()} terdekat (${list.length}) ==`);
  if (!list.length) {
    console.log('  (tidak ada di bundle)\n');
    continue;
  }
  for (const p of list) {
    const km = (p.dist / 1000).toFixed(2);
    console.log(`  ${km.padStart(6)} km  ${p.name}`);
    if (p.address) console.log(`           ${p.address}`);
    if (p.phone) console.log(`           tel: ${p.phone}`);
  }
  console.log('');
}

// Contoh jarak ke kedutaan Indonesia
const embassy = nearest('embassy', user, 1)[0];
if (embassy) {
  console.log(
    `Kedutaan Indonesia terdekat: ${embassy.name} — ${(embassy.dist / 1000).toFixed(1)} km`,
  );
  console.log(`  ${embassy.address}`);
}
