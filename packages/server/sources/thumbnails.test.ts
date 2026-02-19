import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createTestFixture, createTestImage, type TestFixture } from './testing/fixtures.ts';

vi.mock('sharp', () => {
  const mockSharp = vi.fn(() => ({
    resize: vi.fn().mockReturnThis(),
    jpeg: vi.fn().mockReturnThis(),
    toFile: vi.fn().mockResolvedValue(undefined),
  }));
  return { default: mockSharp };
});

import { getThumbnail } from './thumbnails.ts';
import sharp from 'sharp';

let fixture: TestFixture;

beforeEach(async () => {
  fixture = await createTestFixture();
  vi.clearAllMocks();
});

afterEach(async () => {
  await fixture.cleanup();
});

describe('getThumbnail', () => {
  const thumbnailOptions = (cacheDir: string) => ({
    width: 400,
    quality: 80,
    cacheDirectory: cacheDir,
  });

  it('generates thumbnail on cache miss', async () => {
    const sourceFile = await createTestImage(fixture.root, 'photo.jpg');
    const cacheDir = path.join(fixture.root, 'cache');

    const result = await getThumbnail(sourceFile, 'photo.jpg', thumbnailOptions(cacheDir));

    expect(sharp).toHaveBeenCalledWith(sourceFile);
    expect(result).toBe(path.join(cacheDir, 'photo.jpg.jpg'));
  });

  it('returns cached path when cache is fresh', async () => {
    const sourceFile = await createTestImage(fixture.root, 'photo.jpg');
    const cacheDir = path.join(fixture.root, 'cache');

    // Create a cache file that is newer than the source
    const cachePath = path.join(cacheDir, 'photo.jpg.jpg');
    await fs.mkdir(cacheDir, { recursive: true });
    await fs.writeFile(cachePath, 'cached-thumbnail');

    // Ensure cache file mtime is >= source mtime
    const futureTime = new Date(Date.now() + 10000);
    await fs.utimes(cachePath, futureTime, futureTime);

    const result = await getThumbnail(sourceFile, 'photo.jpg', thumbnailOptions(cacheDir));

    expect(result).toBe(cachePath);
    expect(sharp).not.toHaveBeenCalled();
  });

  it('regenerates when source is newer than cache', async () => {
    const cacheDir = path.join(fixture.root, 'cache');

    // Create cache file first
    const cachePath = path.join(cacheDir, 'photo.jpg.jpg');
    await fs.mkdir(cacheDir, { recursive: true });
    await fs.writeFile(cachePath, 'old-thumbnail');

    // Make cache file old
    const pastTime = new Date(Date.now() - 10000);
    await fs.utimes(cachePath, pastTime, pastTime);

    // Create source file (will be newer)
    const sourceFile = await createTestImage(fixture.root, 'photo.jpg');

    const result = await getThumbnail(sourceFile, 'photo.jpg', thumbnailOptions(cacheDir));

    expect(sharp).toHaveBeenCalledWith(sourceFile);
    expect(result).toBe(cachePath);
  });

  it('replaces path separators with __ in cache filename', async () => {
    const sourceFile = await createTestImage(fixture.root, 'sub/dir/photo.jpg');
    const cacheDir = path.join(fixture.root, 'cache');

    const result = await getThumbnail(sourceFile, 'sub/dir/photo.jpg', thumbnailOptions(cacheDir));

    expect(result).toBe(path.join(cacheDir, 'sub__dir__photo.jpg.jpg'));
  });
});
