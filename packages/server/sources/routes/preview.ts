import fs from 'node:fs';
import path from 'node:path';
import type { FastifyInstance } from 'fastify';
import { resolveSafePath } from '../tools/security.ts';
import { getVideoPreview } from '../thumbnails.ts';
import { setCacheHeaders } from '../tools/cache.ts';
import type { ServerOptions } from '../options.ts';

export async function registerPreviewRoutes(fastify: FastifyInstance, options: ServerOptions): Promise<void> {
  const cacheDirectory = path.join(options.root, '.gallery-cache', 'previews');

  fastify.get('/_previews/*', async (request, reply) => {
    const requestPath = (request.params as { '*': string })['*'];
    const absolutePath = resolveSafePath(options.root, requestPath);

    if (!absolutePath) {
      return reply.status(403).send({ error: 'Forbidden' });
    }

    const extension = path.extname(requestPath).toLowerCase();
    if (!options.videoExtensions.has(extension)) {
      return reply.status(404).send({ error: 'Not a video file' });
    }

    try {
      const previewPath = await getVideoPreview(absolutePath, requestPath, {
        cacheDirectory,
      });

      if (!previewPath) {
        return reply.status(404).send({ error: 'Video too short for preview' });
      }

      setCacheHeaders(reply, options.cache);
      reply.header('Content-Type', 'video/mp4');
      return reply.send(fs.createReadStream(previewPath));
    } catch {
      return reply.status(500).send({ error: 'Preview generation failed' });
    }
  });
}
