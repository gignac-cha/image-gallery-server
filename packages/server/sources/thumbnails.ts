import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

export interface ThumbnailOptions {
  width: number;
  quality: number;
  cacheDirectory: string;
}

async function ensureDirectory(directory: string): Promise<void> {
  await fs.mkdir(directory, { recursive: true });
}

function getCachePath(cacheDirectory: string, relativePath: string): string {
  const safeName = relativePath.replace(/[/\\]/g, '__');
  return path.join(cacheDirectory, `${safeName}.jpg`);
}

export async function getThumbnail(
  absolutePath: string,
  relativePath: string,
  options: ThumbnailOptions,
): Promise<string> {
  const cachePath = getCachePath(options.cacheDirectory, relativePath);

  try {
    const [cacheStat, sourceStat] = await Promise.all([
      fs.stat(cachePath),
      fs.stat(absolutePath),
    ]);

    if (cacheStat.mtime >= sourceStat.mtime) {
      return cachePath;
    }
  } catch {
    // Cache miss — generate thumbnail
  }

  await ensureDirectory(path.dirname(cachePath));

  await sharp(absolutePath)
    .resize(options.width)
    .jpeg({ quality: options.quality })
    .toFile(cachePath);

  return cachePath;
}
