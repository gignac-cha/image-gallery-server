import path from 'node:path';

export function resolveSafePath(root: string, requestPath: string): string | null {
  const resolved = path.resolve(root, requestPath);
  const relative = path.relative(root, resolved);

  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    return null;
  }

  return resolved;
}
