import fs from 'node:fs/promises';
import path from 'node:path';
import type { ServerOptions } from './options.ts';

export interface ImageFile {
  relativePath: string;
  name: string;
  extension: string;
  mimeType: string;
  size: number;
  modifiedAt: string;
  width?: number;
  height?: number;
}

const DIMENSION_PATTERN = /_(\d+)x(\d+)\./;

function extractDimensions(filename: string): { width: number; height: number } | null {
  const match = filename.match(DIMENSION_PATTERN);
  if (!match) return null;
  return { width: Number(match[1]), height: Number(match[2]) };
}

function getMimeType(extension: string): string {
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.bmp': 'image/bmp',
    '.avif': 'image/avif',
    '.tiff': 'image/tiff',
    '.svg': 'image/svg+xml',
  };
  return mimeTypes[extension] ?? 'application/octet-stream';
}

async function* walkDirectory(directory: string): AsyncGenerator<string> {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name.startsWith('.')) continue;
      yield* walkDirectory(fullPath);
    } else {
      yield fullPath;
    }
  }
}

export async function scanImages(rootDirectory: string, options: ServerOptions): Promise<ImageFile[]> {
  const images: ImageFile[] = [];

  for await (const filePath of walkDirectory(rootDirectory)) {
    const extension = path.extname(filePath).toLowerCase();
    if (!options.imageExtensions.has(extension)) continue;

    const stat = await fs.stat(filePath);
    const relativePath = path.relative(rootDirectory, filePath);
    const name = path.basename(filePath);
    const dimensions = extractDimensions(name);

    images.push({
      relativePath,
      name,
      extension,
      mimeType: getMimeType(extension),
      size: stat.size,
      modifiedAt: stat.mtime.toISOString(),
      width: dimensions?.width,
      height: dimensions?.height,
    });
  }

  images.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
  return images;
}
