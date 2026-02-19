import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import sharp from 'sharp';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import type { MediaType } from './scanner.ts';

const execFileAsync = promisify(execFile);

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

async function generateImageThumbnail(
  absolutePath: string,
  cachePath: string,
  options: ThumbnailOptions,
): Promise<void> {
  await sharp(absolutePath)
    .resize(options.width)
    .jpeg({ quality: options.quality })
    .toFile(cachePath);
}

async function generateVideoThumbnail(
  absolutePath: string,
  cachePath: string,
  options: ThumbnailOptions,
): Promise<void> {
  await execFileAsync(ffmpegPath.path, [
    '-ss', '2',
    '-i', absolutePath,
    '-frames:v', '1',
    '-vf', `scale=${options.width}:-1`,
    '-q:v', '3',
    '-y',
    cachePath,
  ]);
}

export async function getThumbnail(
  absolutePath: string,
  relativePath: string,
  options: ThumbnailOptions,
  mediaType: MediaType = 'image',
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

  if (mediaType === 'video') {
    await generateVideoThumbnail(absolutePath, cachePath, options);
  } else {
    await generateImageThumbnail(absolutePath, cachePath, options);
  }

  return cachePath;
}
