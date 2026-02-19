import { describe, it, expect, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import { scanImages } from './scanner.ts';
import { DEFAULT_OPTIONS } from './options.ts';
import { createTestFixture, createTestImage, type TestFixture } from './testing/fixtures.ts';

let fixture: TestFixture;

afterEach(async () => {
  if (fixture) await fixture.cleanup();
});

const options = { ...DEFAULT_OPTIONS };

describe('scanImages', () => {
  it('finds images in root directory', async () => {
    fixture = await createTestFixture();
    await createTestImage(fixture.root, 'a.jpg');
    await createTestImage(fixture.root, 'b.png');

    const images = await scanImages(fixture.root, options);
    expect(images).toHaveLength(2);
    expect(images.map((i) => i.name)).toEqual(['a.jpg', 'b.png']);
  });

  it('returns empty array for empty directory', async () => {
    fixture = await createTestFixture();
    const images = await scanImages(fixture.root, options);
    expect(images).toEqual([]);
  });

  it('returns empty array for directory with no image files', async () => {
    fixture = await createTestFixture();
    await createTestImage(fixture.root, 'readme.txt');
    await createTestImage(fixture.root, 'data.json');

    const images = await scanImages(fixture.root, options);
    expect(images).toEqual([]);
  });

  it('scans recursively into nested subdirectories', async () => {
    fixture = await createTestFixture();
    await createTestImage(fixture.root, 'top.jpg');
    await createTestImage(fixture.root, 'sub/nested.png');
    await createTestImage(fixture.root, 'sub/deep/photo.gif');

    const images = await scanImages(fixture.root, options);
    expect(images).toHaveLength(3);
    expect(images.map((i) => i.relativePath)).toEqual([
      'sub/deep/photo.gif',
      'sub/nested.png',
      'top.jpg',
    ]);
  });

  it('skips hidden directories', async () => {
    fixture = await createTestFixture();
    await createTestImage(fixture.root, 'visible.jpg');
    await createTestImage(fixture.root, '.hidden/secret.jpg');

    const images = await scanImages(fixture.root, options);
    expect(images).toHaveLength(1);
    expect(images[0].name).toBe('visible.jpg');
  });

  it('matches all 9 supported extensions', async () => {
    fixture = await createTestFixture();
    const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.avif', '.tiff', '.svg'];
    for (const ext of extensions) {
      await createTestImage(fixture.root, `image${ext}`);
    }

    const images = await scanImages(fixture.root, options);
    expect(images).toHaveLength(9);
  });

  it('handles case-insensitive extensions', async () => {
    fixture = await createTestFixture();
    await createTestImage(fixture.root, 'photo.JPG');
    await createTestImage(fixture.root, 'art.PNG');

    const images = await scanImages(fixture.root, options);
    expect(images).toHaveLength(2);
  });

  it('returns correct ImageFile properties', async () => {
    fixture = await createTestFixture();
    const content = 'fake-image-content-1234567890';
    await createTestImage(fixture.root, 'sub/photo.jpg', content);

    const images = await scanImages(fixture.root, options);
    expect(images).toHaveLength(1);

    const image = images[0];
    expect(image.relativePath).toBe('sub/photo.jpg');
    expect(image.name).toBe('photo.jpg');
    expect(image.extension).toBe('.jpg');
    expect(image.mimeType).toBe('image/jpeg');
    expect(image.size).toBe(content.length);
    expect(image.modifiedAt).toBeDefined();
    expect(new Date(image.modifiedAt).getTime()).not.toBeNaN();
  });

  it('extracts dimensions from _WxH. filename pattern', async () => {
    fixture = await createTestFixture();
    await createTestImage(fixture.root, 'photo_1920x1080.jpg');

    const images = await scanImages(fixture.root, options);
    expect(images[0].width).toBe(1920);
    expect(images[0].height).toBe(1080);
  });

  it('has no dimensions when pattern is absent', async () => {
    fixture = await createTestFixture();
    await createTestImage(fixture.root, 'photo.jpg');

    const images = await scanImages(fixture.root, options);
    expect(images[0].width).toBeUndefined();
    expect(images[0].height).toBeUndefined();
  });

  it('sorts results by relativePath', async () => {
    fixture = await createTestFixture();
    await createTestImage(fixture.root, 'z.jpg');
    await createTestImage(fixture.root, 'a.jpg');
    await createTestImage(fixture.root, 'm/b.jpg');

    const images = await scanImages(fixture.root, options);
    const paths = images.map((i) => i.relativePath);
    expect(paths).toEqual([...paths].sort());
  });
});
