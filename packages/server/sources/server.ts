import fs from 'node:fs';
import path from 'node:path';
import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import type { ServerOptions } from './options.ts';
import { DEFAULT_OPTIONS } from './options.ts';
import { registerApiRoutes } from './routes/api.ts';
import { registerThumbnailRoutes } from './routes/thumbnail.ts';
import { registerStaticRoutes } from './routes/static.ts';

export type { ServerOptions } from './options.ts';
export { DEFAULT_OPTIONS } from './options.ts';

export async function createServer(userOptions: Partial<ServerOptions> = {}) {
  const options: ServerOptions = { ...DEFAULT_OPTIONS, ...userOptions };

  const fastify = Fastify({
    logger: !options.silent,
  });

  if (options.cors) {
    fastify.addHook('onRequest', async (_request, reply) => {
      reply.header('Access-Control-Allow-Origin', '*');
      reply.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
      reply.header('Access-Control-Allow-Headers', 'Content-Type');
    });
  }

  // API routes
  await registerApiRoutes(fastify, options);

  // Thumbnail routes
  await registerThumbnailRoutes(fastify, options);

  // Static media file routes (images + videos with Range support)
  await registerStaticRoutes(fastify, options);

  // Serve web build output (SPA)
  await fastify.register(fastifyStatic, {
    root: options.webOutputPath,
    prefix: '/',
  });

  // SPA fallback: serve index.html for unmatched routes
  const indexPath = path.join(options.webOutputPath, 'index.html');
  fastify.setNotFoundHandler(async (_request, reply) => {
    reply.header('Content-Type', 'text/html');
    return reply.send(fs.createReadStream(indexPath));
  });

  return { fastify, options };
}
