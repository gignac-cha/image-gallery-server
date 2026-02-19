import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import sharp from 'sharp';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import ffprobePath from '@ffprobe-installer/ffprobe';
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

// --- Video Preview ---

const SEGMENT_DURATION = 1;
const MIN_SEGMENTS = 3;
const MAX_SEGMENTS = 6;
const SKIP_RATIO = 0.1;
const MIN_DURATION_FOR_PREVIEW = 5;
const PREVIEW_WIDTH = 400;

export interface PreviewOptions {
  cacheDirectory: string;
}

async function getVideoDuration(absolutePath: string): Promise<number> {
  const { stdout } = await execFileAsync(ffprobePath.path, [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'csv=p=0',
    absolutePath,
  ]);
  return parseFloat(stdout.trim());
}

function computeSegments(duration: number): number[] | null {
  if (duration < MIN_DURATION_FOR_PREVIEW) {
    return null;
  }

  const usable = duration * (1 - SKIP_RATIO * 2);
  const offset = duration * SKIP_RATIO;
  const segments = Math.min(MAX_SEGMENTS, Math.max(MIN_SEGMENTS, Math.floor(duration / 10)));
  const gap = usable / segments;

  const startPoints: number[] = [];
  for (let i = 0; i < segments; i++) {
    startPoints.push(offset + gap * i);
  }
  return startPoints;
}

function getPreviewCachePath(cacheDirectory: string, relativePath: string): string {
  const safeName = relativePath.replace(/[/\\]/g, '__');
  return path.join(cacheDirectory, `${safeName}.mp4`);
}

export async function getVideoPreview(
  absolutePath: string,
  relativePath: string,
  options: PreviewOptions,
): Promise<string | null> {
  const cachePath = getPreviewCachePath(options.cacheDirectory, relativePath);

  try {
    const [cacheStat, sourceStat] = await Promise.all([
      fs.stat(cachePath),
      fs.stat(absolutePath),
    ]);

    if (cacheStat.mtime >= sourceStat.mtime) {
      return cachePath;
    }
  } catch {
    // Cache miss
  }

  const duration = await getVideoDuration(absolutePath);
  const startPoints = computeSegments(duration);

  if (!startPoints) {
    return null;
  }

  await ensureDirectory(path.dirname(cachePath));

  const filterParts: string[] = [];
  const concatInputs: string[] = [];

  for (let i = 0; i < startPoints.length; i++) {
    const start = startPoints[i];
    const end = Math.min(start + SEGMENT_DURATION, duration);
    filterParts.push(`[0:v]trim=start=${start}:end=${end},setpts=PTS-STARTPTS,scale=${PREVIEW_WIDTH}:-2[v${i}]`);
    concatInputs.push(`[v${i}]`);
  }

  const filterComplex =
    filterParts.join(';') +
    ';' +
    concatInputs.join('') +
    `concat=n=${startPoints.length}:v=1:a=0[out]`;

  await execFileAsync(ffmpegPath.path, [
    '-i', absolutePath,
    '-filter_complex', filterComplex,
    '-map', '[out]',
    '-an',
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '28',
    '-movflags', '+faststart',
    '-y',
    cachePath,
  ], { timeout: 60000 });

  return cachePath;
}
