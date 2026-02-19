import fs from 'node:fs';
import path from 'node:path';
import type { FastifyInstance } from 'fastify';
import { resolveSafePath } from '../tools/security.ts';
import { getThumbnail } from '../thumbnails.ts';
import { setCacheHeaders } from '../tools/cache.ts';
import type { ServerOptions } from '../options.ts';
import type { MediaType } from '../scanner.ts';

export async function registerThumbnailRoutes(fastify: FastifyInstance, options: ServerOptions): Promise<void> {
  const cacheDirectory = path.join(options.root, '.gallery-cache', 'thumbnails');

  fastify.get('/_thumbnails/*', async (request, reply) => {
    const requestPath = (request.params as { '*': string })['*'];
    const absolutePath = resolveSafePath(options.root, requestPath);

    if (!absolutePath) {
      return reply.status(403).send({ error: 'Forbidden' });
    }

    const extension = path.extname(requestPath).toLowerCase();
    const mediaType: MediaType = options.videoExtensions.has(extension) ? 'video' : 'image';

    try {
      const thumbnailPath = await getThumbnail(absolutePath, requestPath, {
        width: options.thumbnailWidth,
        quality: options.thumbnailQuality,
        cacheDirectory,
      }, mediaType);

      setCacheHeaders(reply, options.cache);
      reply.header('Content-Type', 'image/jpeg');
      return reply.send(fs.createReadStream(thumbnailPath));
    } catch {
      return reply.status(404).send({ error: 'Not found' });
    }
  });
}
