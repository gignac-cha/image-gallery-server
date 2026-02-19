import fs from 'node:fs/promises';
import path from 'node:path';
import type { ServerOptions } from './options.ts';
import { probeVideo } from './probe.ts';

export type MediaType = 'image' | 'video';

interface BaseFile {
  type: MediaType;
  relativePath: string;
  name: string;
  extension: string;
  mimeType: string;
  size: number;
  modifiedAt: string;
  width?: number;
  height?: number;
}

export interface ImageFile extends BaseFile {
  type: 'image';
}

export interface VideoFile extends BaseFile {
  type: 'video';
  duration?: number;
  codec?: string;
  audioCodec?: string;
  framerate?: number;
}

export type MediaFile = ImageFile | VideoFile;

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
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.ogv': 'video/ogg',
    '.mov': 'video/quicktime',
    '.mkv': 'video/x-matroska',
    '.avi': 'video/x-msvideo',
    '.wmv': 'video/x-ms-wmv',
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

function isVideoExtension(extension: string, options: ServerOptions): boolean {
  return options.videoExtensions.has(extension);
}

export async function scanMedia(rootDirectory: string, options: ServerOptions): Promise<MediaFile[]> {
  const media: MediaFile[] = [];

  for await (const filePath of walkDirectory(rootDirectory)) {
    const extension = path.extname(filePath).toLowerCase();
    if (!options.mediaExtensions.has(extension)) continue;

    const stat = await fs.stat(filePath);
    const relativePath = path.relative(rootDirectory, filePath);
    const name = path.basename(filePath);
    const isVideo = isVideoExtension(extension, options);

    if (isVideo) {
      const probe = await probeVideo(filePath);
      const videoFile: VideoFile = {
        type: 'video',
        relativePath,
        name,
        extension,
        mimeType: getMimeType(extension),
        size: stat.size,
        modifiedAt: stat.mtime.toISOString(),
        width: probe?.width,
        height: probe?.height,
        duration: probe?.duration,
        codec: probe?.codec,
        audioCodec: probe?.audioCodec,
        framerate: probe?.framerate,
      };
      media.push(videoFile);
    } else {
      const dimensions = extractDimensions(name);
      const imageFile: ImageFile = {
        type: 'image',
        relativePath,
        name,
        extension,
        mimeType: getMimeType(extension),
        size: stat.size,
        modifiedAt: stat.mtime.toISOString(),
        width: dimensions?.width,
        height: dimensions?.height,
      };
      media.push(imageFile);
    }
  }

  media.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
  return media;
}
