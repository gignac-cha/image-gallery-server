import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { resolveSafePath } from './security.ts';

const ROOT = '/srv/images';

describe('resolveSafePath', () => {
  it('resolves a simple relative path correctly', () => {
    const result = resolveSafePath(ROOT, 'photo.jpg');
    expect(result).toBe(path.join(ROOT, 'photo.jpg'));
  });

  it('resolves a nested path correctly', () => {
    const result = resolveSafePath(ROOT, 'sub/dir/photo.jpg');
    expect(result).toBe(path.join(ROOT, 'sub', 'dir', 'photo.jpg'));
  });

  it('returns null for ../ traversal', () => {
    expect(resolveSafePath(ROOT, '../etc/passwd')).toBeNull();
  });

  it('returns null for deeply nested traversal', () => {
    expect(resolveSafePath(ROOT, 'a/../../etc/passwd')).toBeNull();
  });

  it('returns null for absolute path injection', () => {
    expect(resolveSafePath(ROOT, '/etc/passwd')).toBeNull();
  });

  it('handles . segments', () => {
    const result = resolveSafePath(ROOT, './photo.jpg');
    expect(result).toBe(path.join(ROOT, 'photo.jpg'));
  });

  it('handles // segments', () => {
    const result = resolveSafePath(ROOT, 'sub//photo.jpg');
    expect(result).toBe(path.join(ROOT, 'sub', 'photo.jpg'));
  });

  it('returns the root directory for empty requestPath', () => {
    const result = resolveSafePath(ROOT, '');
    expect(result).toBe(ROOT);
  });
});
