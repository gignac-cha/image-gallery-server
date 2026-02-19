import { MediaFile } from '../../types.ts';

interface TileProps {
  media: MediaFile;
  onClick: () => void;
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function Tile({ media, onClick }: TileProps) {
  const dimensions = media.width && media.height
    ? `${media.width}\u00d7${media.height}`
    : null;

  const duration = media.type === 'video' && media.duration
    ? media.duration
    : null;

  return (
    <div className="tile" onClick={onClick}>
      <img
        className="tile__image"
        src={`/_thumbnails/${media.relativePath}`}
        alt={media.name}
        loading="lazy"
      />
      {media.type === 'video' && (
        <div className="tile__play-badge">
          <span className="tile__play-icon">{'\u25B6'}</span>
          {duration !== null && (
            <span className="tile__duration">{formatDuration(duration)}</span>
          )}
        </div>
      )}
      <div className="tile__overlay">
        <span className="tile__name">{media.name}</span>
        <span className="tile__meta">
          {formatSize(media.size)}
          {dimensions ? ` \u00b7 ${dimensions}` : ''}
        </span>
      </div>
    </div>
  );
}
