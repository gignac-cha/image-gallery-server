import type { ImageFile, GalleryData } from '../../types.ts';

export function createImageFile(overrides: Partial<ImageFile> = {}): ImageFile {
  return {
    relativePath: 'photo.jpg',
    name: 'photo.jpg',
    extension: '.jpg',
    mimeType: 'image/jpeg',
    size: 1048576,
    modifiedAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

export function createGalleryData(overrides: Partial<GalleryData> = {}): GalleryData {
  return {
    images: [
      createImageFile({ relativePath: 'a.jpg', name: 'a.jpg', size: 2048000 }),
      createImageFile({ relativePath: 'b.png', name: 'b.png', extension: '.png', mimeType: 'image/png', size: 512 }),
      createImageFile({ relativePath: 'sub/c.webp', name: 'c.webp', extension: '.webp', mimeType: 'image/webp', size: 3145728, width: 1920, height: 1080 }),
    ],
    totalImages: 3,
    options: {
      title: 'Test Gallery',
      thumbnailWidth: 400,
    },
    ...overrides,
  };
}
