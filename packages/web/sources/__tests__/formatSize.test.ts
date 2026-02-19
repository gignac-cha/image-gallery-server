import { describe, it, expect } from 'vitest';
import { formatSize } from '../components/Gallery/Tile.tsx';

describe('formatSize', () => {
  it('formats bytes (< 1024) as B', () => {
    expect(formatSize(512)).toBe('512 B');
  });

  it('formats 0 bytes', () => {
    expect(formatSize(0)).toBe('0 B');
  });

  it('formats KB (1024–1048575)', () => {
    expect(formatSize(1536)).toBe('1.5 KB');
  });

  it('formats MB (>= 1048576)', () => {
    expect(formatSize(2516582)).toBe('2.4 MB');
  });

  it('boundary: exactly 1024 is KB', () => {
    expect(formatSize(1024)).toBe('1.0 KB');
  });

  it('boundary: exactly 1024*1024 is MB', () => {
    expect(formatSize(1024 * 1024)).toBe('1.0 MB');
  });
});
