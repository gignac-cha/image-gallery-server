import path from 'node:path';

const IMAGE_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.avif', '.tiff', '.svg',
]);

const VIDEO_EXTENSIONS = new Set([
  '.mp4', '.webm', '.ogv', '.mov', '.mkv', '.avi', '.wmv',
]);

const MEDIA_EXTENSIONS = new Set([...IMAGE_EXTENSIONS, ...VIDEO_EXTENSIONS]);

export interface ServerOptions {
  root: string;
  port: number;
  host: string;
  cache: number;
  cors: boolean;
  thumbnailWidth: number;
  thumbnailQuality: number;
  imageExtensions: Set<string>;
  videoExtensions: Set<string>;
  mediaExtensions: Set<string>;
  title: string;
  silent: boolean;
  webOutputPath: string;
}

export const DEFAULT_OPTIONS: ServerOptions = {
  root: process.cwd(),
  port: 8080,
  host: '::',
  cache: 3600,
  cors: false,
  thumbnailWidth: 400,
  thumbnailQuality: 80,
  imageExtensions: IMAGE_EXTENSIONS,
  videoExtensions: VIDEO_EXTENSIONS,
  mediaExtensions: MEDIA_EXTENSIONS,
  title: 'Image Gallery Server',
  silent: false,
  webOutputPath: path.resolve(import.meta.dirname, '..', '..', 'web', 'outputs'),
};
