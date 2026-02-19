import { describe, it, expect, afterEach } from 'vitest';
import Fastify from 'fastify';
import { registerStaticRoutes } from './static.ts';
import { DEFAULT_OPTIONS } from '../options.ts';
import { createTestFixture, createTestImage, type TestFixture } from '../testing/fixtures.ts';

let fixture: TestFixture;

afterEach(async () => {
  if (fixture) await fixture.cleanup();
});

async function buildApp(root: string, overrides = {}) {
  const options = { ...DEFAULT_OPTIONS, root, silent: true, ...overrides };
  const fastify = Fastify({ logger: false });
  await registerStaticRoutes(fastify, options);
  return fastify;
}

describe('GET /images/*', () => {
  it('returns 200 with correct file content', async () => {
    fixture = await createTestFixture();
    const content = 'fake-jpeg-binary-data';
    await createTestImage(fixture.root, 'photo.jpg', content);
    const app = await buildApp(fixture.root);

    const response = await app.inject({ method: 'GET', url: '/images/photo.jpg' });

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe(content);
  });

  it('returns correct Content-Type per extension', async () => {
    fixture = await createTestFixture();
    await createTestImage(fixture.root, 'photo.png', 'png-data');
    const app = await buildApp(fixture.root);

    const response = await app.inject({ method: 'GET', url: '/images/photo.png' });

    expect(response.headers['content-type']).toBe('image/png');
  });

  it('sets Cache-Control header per options.cache', async () => {
    fixture = await createTestFixture();
    await createTestImage(fixture.root, 'photo.jpg', 'data');
    const app = await buildApp(fixture.root, { cache: 7200 });

    const response = await app.inject({ method: 'GET', url: '/images/photo.jpg' });

    expect(response.headers['cache-control']).toBe('public, max-age=7200');
  });

  it('rejects directory traversal attempts', async () => {
    fixture = await createTestFixture();
    await createTestImage(fixture.root, 'photo.jpg', 'legit');
    const app = await buildApp(fixture.root);

    // Fastify normalizes URL paths, so ../  is resolved at routing level
    // The route handler's resolveSafePath is defense-in-depth
    const response = await app.inject({ method: 'GET', url: '/images/../../../etc/passwd' });
    expect(response.statusCode).not.toBe(200);
  });

  it('returns 404 for non-existent file', async () => {
    fixture = await createTestFixture();
    const app = await buildApp(fixture.root);

    const response = await app.inject({ method: 'GET', url: '/images/nonexistent.jpg' });

    expect(response.statusCode).toBe(404);
  });
});
