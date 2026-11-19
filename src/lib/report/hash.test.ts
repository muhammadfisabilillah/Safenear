import { describe, it, expect } from 'vitest';
import { canonicalize, hashMatches, hashReport, sha256Hex } from './hash';

describe('canonicalize', () => {
  it('key terurut stabil', () => {
    expect(canonicalize({ b: 1, a: 2 })).toBe(canonicalize({ a: 2, b: 1 }));
  });
  it('nested & array', () => {
    expect(canonicalize({ z: [3, { y: 1, x: 2 }] })).toBe(canonicalize({ z: [3, { x: 2, y: 1 }] }));
  });
  it('primitif', () => {
    expect(canonicalize(null)).toBe('null');
    expect(canonicalize(1)).toBe('1');
    expect(canonicalize('a')).toBe('"a"');
  });
});

describe('sha256Hex', () => {
  it('hash string kosong (nilai diketahui)', async () => {
    const h = await sha256Hex('');
    expect(h).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  });
  it('hash "abc" (nilai diketahui)', async () => {
    const h = await sha256Hex('abc');
    expect(h).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  });
  it('64 karakter hex', async () => {
    const h = await sha256Hex('safe near');
    expect(h).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe('hashReport', () => {
  it('deterministik & konsisten dengan isi', async () => {
    const report = { a: 1, b: { c: 2, d: [1, 2] } };
    const h1 = await hashReport(report);
    const h2 = await hashReport({ b: { d: [1, 2], c: 2 }, a: 1 });
    expect(h1).toBe(h2);
  });
  it('berubah bila isi berubah', async () => {
    const h1 = await hashReport({ a: 1 });
    const h2 = await hashReport({ a: 2 });
    expect(h1).not.toBe(h2);
  });
});

describe('hashMatches', () => {
  it('case-insensitive & trim', () => {
    expect(hashMatches('ABC', 'abc')).toBe(true);
    expect(hashMatches(' abc ', 'abc')).toBe(true);
  });
  it('undefined -> false', () => {
    expect(hashMatches(undefined, 'abc')).toBe(false);
    expect(hashMatches('abc', '')).toBe(false);
  });
});
