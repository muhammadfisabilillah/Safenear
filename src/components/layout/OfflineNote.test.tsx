import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { OfflineNote } from './OfflineNote';

describe('OfflineNote', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', { ...navigator, onLine: true });
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    cleanup();
  });

  it('tidak tampil saat online', () => {
    render(<OfflineNote />);
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('tampil catatan saat offline', () => {
    Object.defineProperty(window.navigator, 'onLine', { value: false, configurable: true });
    render(<OfflineNote />);
    expect(screen.getByRole('status').textContent).toBe('place.offlineNote');
  });
});
