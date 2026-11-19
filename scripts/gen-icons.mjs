// Generator ikon PNG SAFE NEAR (tanpa dependensi).
// Menghasilkan public/icons/icon-192.png, icon-512.png, favicon-32.png, favicon-16.png.
//
// Desain: latar primary (#0ea5e9) + pin lokasi putih (lingkaran + ekor) + lingkaran dalam biru.
// Algoritma: rasterisasi piksel per piksel -> PNG (IHDR + IDAT zlib + IEND) dengan CRC32.

import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, '../public/icons');

// ---------- CRC32 ----------
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePng(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  // Scanlines dengan filter byte 0 per baris.
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---------- Desain ----------
const BG = [14, 165, 233, 255]; // #0ea5e9
const FG = [255, 255, 255, 255];
const INNER = [2, 132, 199, 255]; // #0284c7

function mix(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
    Math.round(a[3] + (b[3] - a[3]) * t),
  ];
}

function drawIcon(size) {
  const buf = Buffer.alloc(size * size * 4);
  const cx = size / 2;
  const cy = size * 0.44; // pusat lingkaran pin
  const rOuter = size * 0.30;
  const rInner = size * 0.155;
  const tipY = size * 0.80;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      let color = BG;

      const dx = x + 0.5 - cx;
      const dy = y + 0.5 - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Lingkaran luar pin.
      if (dist <= rOuter) {
        color = FG;
      }
      // Ekor pin (segitiga dari lingkaran ke tipY).
      if (y + 0.5 >= cy && y + 0.5 <= tipY) {
        const t = (y + 0.5 - cy) / (tipY - cy); // 0..1
        const halfWidth = rOuter * (1 - t) * 0.92;
        if (Math.abs(dx) <= halfWidth) {
          color = FG;
        }
      }
      // Lubang dalam (warna primary lebih gelap).
      if (dist <= rInner) {
        color = INNER;
      }

      buf[i] = color[0];
      buf[i + 1] = color[1];
      buf[i + 2] = color[2];
      buf[i + 3] = color[3];
    }
  }
  return buf;
}

mkdirSync(OUT_DIR, { recursive: true });
const targets = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'icon-maskable-512.png', size: 512 },
  { name: 'favicon-32.png', size: 32 },
  { name: 'favicon-16.png', size: 16 },
];

for (const { name, size } of targets) {
  const png = encodePng(size, size, drawIcon(size));
  writeFileSync(resolve(OUT_DIR, name), png);
  console.log(`OK ${name} (${size}x${size}, ${png.length} bytes)`);
}