import { describe, it, expect, vi } from 'vitest';
import { generateETag, setCacheHeaders } from './cache.ts';

describe('generateETag', () => {
  it('returns consistent hash for same content', () => {
    const etag1 = generateETag('hello');
    const etag2 = generateETag('hello');
    expect(etag1).toBe(etag2);
  });

  it('returns different hash for different content', () => {
    const etag1 = generateETag('hello');
    const etag2 = generateETag('world');
    expect(etag1).not.toBe(etag2);
  });

  it('returns value in quoted format', () => {
    const etag = generateETag('test');
    expect(etag).toMatch(/^"[a-f0-9]+"$/);
  });

  it('works with empty Buffer', () => {
    const etag = generateETag(Buffer.alloc(0));
    expect(etag).toMatch(/^"[a-f0-9]+"$/);
  });
});

describe('setCacheHeaders', () => {
  it('sets public max-age for positive maxAge', () => {
    const reply = { header: vi.fn() };
    setCacheHeaders(reply as any, 3600);
    expect(reply.header).toHaveBeenCalledWith('Cache-Control', 'public, max-age=3600');
  });

  it('sets no-cache headers for negative maxAge', () => {
    const reply = { header: vi.fn() };
    setCacheHeaders(reply as any, -1);
    expect(reply.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
  });

  it('sets max-age=0 for zero', () => {
    const reply = { header: vi.fn() };
    setCacheHeaders(reply as any, 0);
    expect(reply.header).toHaveBeenCalledWith('Cache-Control', 'public, max-age=0');
  });
});
