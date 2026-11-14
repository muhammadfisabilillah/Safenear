// SAFE NEAR — validasi bundle POI (tanpa dependency).
// Jalankan: node scripts/validate-bundle.mjs [path-bundle]
// Keluar dengan kode 1 bila ada pelanggaran.

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const file = process.argv[2]
  ? resolve(process.cwd(), process.argv[2])
  : resolve(root, 'data/bundles/US-houston.json');

const CATEGORIES = new Set(['police', 'hospital', 'embassy', 'fire', 'courthouse', 'shelter']);

function fail(msg) {
  console.error('  ✗ ' + msg);
  process.exitCode = 1;
}
function ok(msg) {
  console.log('  ✓ ' + msg);
}

let raw;
try {
  raw = JSON.parse(readFileSync(file, 'utf8'));
} catch (e) {
  console.error(`GAGAL membaca/parse ${file}: ${e.message}`);
  process.exit(1);
}

console.log(`Bundle: ${file}`);

if (raw.schemaVersion !== 1) fail(`schemaVersion harus 1, dapat ${raw.schemaVersion}`);
else ok('schemaVersion = 1');

if (!raw.id) fail('id kosong');
if (!raw.country) fail('country kosong');
if (!raw.city) fail('city kosong');
if (!Array.isArray(raw.bbox) || raw.bbox.length !== 4) fail('bbox harus [minLon,minLat,maxLon,maxLat]');
if (!raw.attribution || !raw.attribution.osm) fail('atribusi OSM wajib ada');

if (!Array.isArray(raw.pois)) {
  fail('pois bukan array');
  console.error('Berhenti.');
  process.exit(1);
}

const ids = new Set();
const counts = {};
let checked = 0;

for (const [i, p] of raw.pois.entries()) {
  const where = `pois[${i}] (${p.id ?? '?'})`;
  if (!p.id) fail(`${where}: id kosong`);
  if (ids.has(p.id)) fail(`${where}: id duplikat`);
  ids.add(p.id);
  if (!CATEGORIES.has(p.category)) fail(`${where}: category tidak valid (${p.category})`);
  if (typeof p.name !== 'string' || !p.name) fail(`${where}: name kosong`);
  if (typeof p.lat !== 'number' || p.lat < -90 || p.lat > 90) fail(`${where}: lat tidak valid (${p.lat})`);
  if (typeof p.lon !== 'number' || p.lon < -180 || p.lon > 180) fail(`${where}: lon tidak valid (${p.lon})`);
  if (p.phone !== undefined && !/^\+?[\d\s()\-]+$/.test(p.phone)) fail(`${where}: phone aneh (${p.phone})`);
  if (p.verifiedAt !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(p.verifiedAt)) fail(`${where}: verifiedAt bukan yyyy-mm-dd`);
  if (p.category === 'embassy' && !p.nationality) fail(`${where}: embassy harus punya nationality`);
  counts[p.category] = (counts[p.category] ?? 0) + 1;
  checked++;
}

console.log('');
console.log(`Total POI : ${checked}`);
for (const c of [...CATEGORIES].sort()) {
  if (counts[c]) console.log(`  ${c.padEnd(11)} ${counts[c]}`);
}
console.log('');

if (process.exitCode) {
  console.error('HASIL: GAGAL (ada pelanggaran)');
} else {
  console.log('HASIL: VALID');
}
