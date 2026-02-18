import fs from 'node:fs';
import type { FastifyInstance } from 'fastify';
import mime from 'mime-types';
import { resolveSafePath } from '../tools/security.ts';
import { setCacheHeaders } from '../tools/cache.ts';
import type { ServerOptions } from '../options.ts';

export async function registerStaticRoutes(fastify: FastifyInstance, options: ServerOptions): Promise<void> {
  fastify.get('/images/*', async (request, reply) => {
    const requestPath = (request.params as { '*': string })['*'];
    const absolutePath = resolveSafePath(options.root, requestPath);

    if (!absolutePath) {
      return reply.status(403).send({ error: 'Forbidden' });
    }

    try {
      await fs.promises.access(absolutePath);
    } catch {
      return reply.status(404).send({ error: 'Not found' });
    }

    const contentType = mime.lookup(absolutePath) ?? 'application/octet-stream';
    setCacheHeaders(reply, options.cache);
    reply.header('Content-Type', contentType);
    return reply.send(fs.createReadStream(absolutePath));
  });
}
