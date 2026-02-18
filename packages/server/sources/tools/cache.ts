import { createHash } from 'node:crypto';
import type { FastifyReply } from 'fastify';

export function generateETag(content: string | Buffer): string {
  const hash = createHash('md5').update(content).digest('hex');
  return `"${hash}"`;
}

export function setCacheHeaders(reply: FastifyReply, maxAge: number): void {
  if (maxAge < 0) {
    reply.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    return;
  }
  reply.header('Cache-Control', `public, max-age=${maxAge}`);
}
