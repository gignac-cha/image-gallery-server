import type { FastifyInstance } from 'fastify';
import { scanMedia } from '../scanner.ts';
import type { ServerOptions } from '../options.ts';

export async function registerApiRoutes(fastify: FastifyInstance, options: ServerOptions): Promise<void> {
  fastify.get('/api/media', async (_request, reply) => {
    const media = await scanMedia(options.root, options);

    const totalImages = media.filter((m) => m.type === 'image').length;
    const totalVideos = media.filter((m) => m.type === 'video').length;

    const data = {
      media,
      totalMedia: media.length,
      totalImages,
      totalVideos,
      options: {
        title: options.title,
        thumbnailWidth: options.thumbnailWidth,
      },
    };

    reply.header('Content-Type', 'application/json');
    return data;
  });

  fastify.get('/api/images', async (_request, reply) => {
    return reply.redirect('/api/media');
  });
}
