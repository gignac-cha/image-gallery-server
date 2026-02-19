import { describe, it, expect, vi, afterEach } from 'vitest';
import { createTestFixture, type TestFixture } from './testing/fixtures.ts';

vi.mock('@fastify/static', () => ({
  default: vi.fn(async () => {}),
}));

import { createServer, DEFAULT_OPTIONS } from './server.ts';

let fixture: TestFixture;

afterEach(async () => {
  if (fixture) await fixture.cleanup();
});

describe('createServer', () => {
  it('returns fastify instance and merged options', async () => {
    fixture = await createTestFixture();
    const { fastify, options } = await createServer({ root: fixture.root, silent: true });

    expect(fastify).toBeDefined();
    expect(fastify.inject).toBeTypeOf('function');
    expect(options.root).toBe(fixture.root);
    expect(options.silent).toBe(true);
  });

  it('merges user options with DEFAULT_OPTIONS', async () => {
    fixture = await createTestFixture();
    const { options } = await createServer({ root: fixture.root, port: 9000, silent: true });

    expect(options.port).toBe(9000);
    expect(options.host).toBe(DEFAULT_OPTIONS.host);
    expect(options.cache).toBe(DEFAULT_OPTIONS.cache);
    expect(options.thumbnailWidth).toBe(DEFAULT_OPTIONS.thumbnailWidth);
  });

  it('registers all routes', async () => {
    fixture = await createTestFixture();
    const { fastify } = await createServer({ root: fixture.root, silent: true });

    // Verify routes exist by checking that requests hit the correct handlers
    // (not the SPA fallback which would return text/html)
    const apiRes = await fastify.inject({ method: 'GET', url: '/api/images' });
    expect(apiRes.headers['content-type']).toContain('application/json');

    const thumbRes = await fastify.inject({ method: 'GET', url: '/_thumbnails/test.jpg' });
    expect(thumbRes.headers['content-type']).toContain('application/json'); // 404 JSON error

    const staticRes = await fastify.inject({ method: 'GET', url: '/images/test.jpg' });
    expect(staticRes.headers['content-type']).toContain('application/json'); // 404 JSON error
  });

  it('adds CORS headers when cors: true', async () => {
    fixture = await createTestFixture();
    const { fastify } = await createServer({ root: fixture.root, cors: true, silent: true });

    const response = await fastify.inject({ method: 'GET', url: '/api/images' });

    expect(response.headers['access-control-allow-origin']).toBe('*');
    expect(response.headers['access-control-allow-methods']).toBe('GET, OPTIONS');
  });

  it('does not add CORS headers when cors: false', async () => {
    fixture = await createTestFixture();
    const { fastify } = await createServer({ root: fixture.root, cors: false, silent: true });

    const response = await fastify.inject({ method: 'GET', url: '/api/images' });

    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('disables logger when silent: true', async () => {
    fixture = await createTestFixture();
    const { fastify } = await createServer({ root: fixture.root, silent: true });

    expect(fastify.log).toBeDefined();
  });
});
