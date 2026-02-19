import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import Fastify from 'fastify';
import fs from 'node:fs/promises';
import path from 'node:path';
import { registerThumbnailRoutes } from './thumbnail.ts';
import { DEFAULT_OPTIONS } from '../options.ts';
import { createTestFixture, createTestImage, type TestFixture } from '../testing/fixtures.ts';

vi.mock('../thumbnails.ts', () => ({
  getThumbnail: vi.fn(),
}));

import { getThumbnail } from '../thumbnails.ts';

const mockedGetThumbnail = vi.mocked(getThumbnail);

let fixture: TestFixture;

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(async () => {
  if (fixture) await fixture.cleanup();
});

async function buildApp(root: string, overrides = {}) {
  const options = { ...DEFAULT_OPTIONS, root, silent: true, ...overrides };
  const fastify = Fastify({ logger: false });
  await registerThumbnailRoutes(fastify, options);
  return fastify;
}

describe('GET /_thumbnails/*', () => {
  it('rejects directory traversal attempts', async () => {
    fixture = await createTestFixture();
    const app = await buildApp(fixture.root);

    // Fastify normalizes URL paths, so ../  is resolved at routing level
    // The route handler's resolveSafePath is defense-in-depth
    const response = await app.inject({ method: 'GET', url: '/_thumbnails/../../../etc/passwd' });
    expect(response.statusCode).not.toBe(200);
  });

  it('returns 404 when source image does not exist', async () => {
    fixture = await createTestFixture();
    mockedGetThumbnail.mockRejectedValueOnce(new Error('ENOENT'));
    const app = await buildApp(fixture.root);

    const response = await app.inject({ method: 'GET', url: '/_thumbnails/missing.jpg' });

    expect(response.statusCode).toBe(404);
  });

  it('returns 200 with image/jpeg content type', async () => {
    fixture = await createTestFixture();
    // Create a thumbnail file that the mock will return
    const thumbPath = path.join(fixture.root, 'thumb.jpg');
    await fs.writeFile(thumbPath, 'fake-thumbnail-data');
    mockedGetThumbnail.mockResolvedValueOnce(thumbPath);

    // Also create source image so resolveSafePath passes
    await createTestImage(fixture.root, 'photo.jpg');
    const app = await buildApp(fixture.root);

    const response = await app.inject({ method: 'GET', url: '/_thumbnails/photo.jpg' });

    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toBe('image/jpeg');
  });

  it('sets Cache-Control header', async () => {
    fixture = await createTestFixture();
    const thumbPath = path.join(fixture.root, 'thumb.jpg');
    await fs.writeFile(thumbPath, 'fake-thumbnail-data');
    mockedGetThumbnail.mockResolvedValueOnce(thumbPath);

    await createTestImage(fixture.root, 'photo.jpg');
    const app = await buildApp(fixture.root, { cache: 1800 });

    const response = await app.inject({ method: 'GET', url: '/_thumbnails/photo.jpg' });

    expect(response.headers['cache-control']).toBe('public, max-age=1800');
  });
});
