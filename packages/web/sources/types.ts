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

export interface GalleryData {
  images: ImageFile[];
  totalImages: number;
  options: {
    title: string;
    thumbnailWidth: number;
  };
}
