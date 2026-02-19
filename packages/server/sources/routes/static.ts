import fs from 'node:fs';
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import mime from 'mime-types';
import { resolveSafePath } from '../tools/security.ts';
import { setCacheHeaders } from '../tools/cache.ts';
import type { ServerOptions } from '../options.ts';

async function serveFile(
  request: FastifyRequest,
  reply: FastifyReply,
  absolutePath: string,
  options: ServerOptions,
): Promise<unknown> {
  const stat = await fs.promises.stat(absolutePath);
  const contentType = mime.lookup(absolutePath) || 'application/octet-stream';
  const isVideo = typeof contentType === 'string' && contentType.startsWith('video/');

  setCacheHeaders(reply, options.cache);
  reply.header('Accept-Ranges', 'bytes');

  const rangeHeader = request.headers['range'];

  if (isVideo && rangeHeader) {
    const fileSize = stat.size;
    const match = rangeHeader.match(/bytes=(\d+)-(\d*)/);

    if (match) {
      const start = parseInt(match[1], 10);
      const end = match[2] ? parseInt(match[2], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      reply.status(206);
      reply.header('Content-Range', `bytes ${start}-${end}/${fileSize}`);
      reply.header('Content-Length', String(chunkSize));
      reply.header('Content-Type', contentType);
      return reply.send(fs.createReadStream(absolutePath, { start, end }));
    }
  }

  reply.header('Content-Type', contentType);
  reply.header('Content-Length', String(stat.size));
  return reply.send(fs.createReadStream(absolutePath));
}

export async function registerStaticRoutes(fastify: FastifyInstance, options: ServerOptions): Promise<void> {
  async function handleStaticRequest(request: FastifyRequest, reply: FastifyReply) {
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

    return serveFile(request, reply, absolutePath, options);
  }

  fastify.get('/images/*', async (request, reply) => handleStaticRequest(request, reply));
  fastify.get('/media/*', async (request, reply) => handleStaticRequest(request, reply));
}
