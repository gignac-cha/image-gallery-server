import { ImageFile } from '../../types.ts';

interface TileProps {
  image: ImageFile;
  onClick: () => void;
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function Tile({ image, onClick }: TileProps) {
  const dimensions = image.width && image.height
    ? `${image.width}×${image.height}`
    : null;

  return (
    <div className="tile" onClick={onClick}>
      <img
        className="tile__image"
        src={`/_thumbnails/${image.relativePath}`}
        alt={image.name}
        loading="lazy"
      />
      <div className="tile__overlay">
        <span className="tile__name">{image.name}</span>
        <span className="tile__meta">
          {formatSize(image.size)}
          {dimensions ? ` · ${dimensions}` : ''}
        </span>
      </div>
    </div>
  );
}
