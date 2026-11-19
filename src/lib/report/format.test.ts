import { describe, it, expect } from 'vitest';
import { formatBytes } from './format';

describe('formatBytes', () => {
  it('< 1 KB -> B', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(512)).toBe('512 B');
  });
  it('< 1 MB -> KB 1 desimal koma', () => {
    expect(formatBytes(1024)).toBe('1,0 KB');
    expect(formatBytes(5120)).toBe('5,0 KB');
  });
  it('>= 1 MB -> MB', () => {
    expect(formatBytes(1024 * 1024)).toBe('1,0 MB');
    expect(formatBytes(2 * 1024 * 1024 + 512 * 1024)).toBe('2,5 MB');
  });
  it('negatif/NaN -> em-dash', () => {
    expect(formatBytes(-1)).toBe('—');
    expect(formatBytes(Number.NaN)).toBe('—');
  });
});
