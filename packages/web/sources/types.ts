export type MediaType = 'image' | 'video';

interface BaseFile {
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

export interface GalleryData {
  media: MediaFile[];
  totalMedia: number;
  totalImages: number;
  totalVideos: number;
  options: {
    title: string;
    thumbnailWidth: number;
  };
}
