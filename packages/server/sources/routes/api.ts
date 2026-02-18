import type { FastifyInstance } from 'fastify';
import { scanImages } from '../scanner.ts';
import type { ServerOptions } from '../options.ts';

export async function registerApiRoutes(fastify: FastifyInstance, options: ServerOptions): Promise<void> {
  fastify.get('/api/images', async (_request, reply) => {
    const images = await scanImages(options.root, options);

    const data = {
      images,
      totalImages: images.length,
      options: {
        title: options.title,
        thumbnailWidth: options.thumbnailWidth,
      },
    };

    reply.header('Content-Type', 'application/json');
    return data;
  });
}
