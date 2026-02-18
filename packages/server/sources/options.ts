import path from 'node:path';

const IMAGE_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.avif', '.tiff', '.svg',
]);

export interface ServerOptions {
  root: string;
  port: number;
  host: string;
  cache: number;
  cors: boolean;
  thumbnailWidth: number;
  thumbnailQuality: number;
  imageExtensions: Set<string>;
  title: string;
  silent: boolean;
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
  title: 'Image Gallery',
  silent: false,
};
