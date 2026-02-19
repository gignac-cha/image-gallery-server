import { describe, it, expect, afterEach } from 'vitest';
import Fastify from 'fastify';
import { registerApiRoutes } from './api.ts';
import { DEFAULT_OPTIONS } from '../options.ts';
import { createTestFixture, createTestImage, type TestFixture } from '../testing/fixtures.ts';

let fixture: TestFixture;

afterEach(async () => {
  if (fixture) await fixture.cleanup();
});

async function buildApp(root: string, overrides = {}) {
  const options = { ...DEFAULT_OPTIONS, root, silent: true, ...overrides };
  const fastify = Fastify({ logger: false });
  await registerApiRoutes(fastify, options);
  return fastify;
}

describe('GET /api/images', () => {
  it('returns 200 with JSON content type', async () => {
    fixture = await createTestFixture();
    const app = await buildApp(fixture.root);

    const response = await app.inject({ method: 'GET', url: '/api/images' });

    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toContain('application/json');
  });

  it('returns images array with correct structure', async () => {
    fixture = await createTestFixture();
    await createTestImage(fixture.root, 'photo.jpg');
    const app = await buildApp(fixture.root);

    const response = await app.inject({ method: 'GET', url: '/api/images' });
    const body = response.json();

    expect(body.images).toHaveLength(1);
    expect(body.images[0]).toMatchObject({
      relativePath: 'photo.jpg',
      name: 'photo.jpg',
      extension: '.jpg',
      mimeType: 'image/jpeg',
    });
  });

  it('totalImages matches array length', async () => {
    fixture = await createTestFixture();
    await createTestImage(fixture.root, 'a.jpg');
    await createTestImage(fixture.root, 'b.png');
    const app = await buildApp(fixture.root);

    const response = await app.inject({ method: 'GET', url: '/api/images' });
    const body = response.json();

    expect(body.totalImages).toBe(body.images.length);
    expect(body.totalImages).toBe(2);
  });

  it('includes options.title and options.thumbnailWidth', async () => {
    fixture = await createTestFixture();
    const app = await buildApp(fixture.root, { title: 'My Gallery', thumbnailWidth: 300 });

    const response = await app.inject({ method: 'GET', url: '/api/images' });
    const body = response.json();

    expect(body.options.title).toBe('My Gallery');
    expect(body.options.thumbnailWidth).toBe(300);
  });

  it('returns empty array for empty directory', async () => {
    fixture = await createTestFixture();
    const app = await buildApp(fixture.root);

    const response = await app.inject({ method: 'GET', url: '/api/images' });
    const body = response.json();

    expect(body.images).toEqual([]);
    expect(body.totalImages).toBe(0);
  });
});
