import { useState, useRef, useCallback } from 'react';
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

  const isVideo = media.type === 'video' && (duration ?? 0) >= 5;
  const [thumbLoaded, setThumbLoaded] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [previewReady, setPreviewReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = useCallback(() => {
    if (!isVideo) return;
    setHovering(true);
    setPreviewReady(false);
  }, [isVideo]);

  const handleMouseLeave = useCallback(() => {
    if (!isVideo) return;
    setHovering(false);
    setPreviewReady(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.removeAttribute('src');
      videoRef.current.load();
    }
  }, [isVideo]);

  const handleCanPlay = useCallback(() => {
    setPreviewReady(true);
  }, []);

  return (
    <div
      className="tile"
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {!thumbLoaded && <div className="tile__loader" />}
      <img
        className={`tile__image${hovering && previewReady ? ' tile__image--hidden' : ''}`}
        src={`/_thumbnails/${media.relativePath}`}
        alt={media.name}
        loading="lazy"
        onLoad={() => setThumbLoaded(true)}
      />
      {hovering && isVideo && (
        <video
          ref={videoRef}
          className={`tile__preview${previewReady ? ' tile__preview--visible' : ''}`}
          src={`/_previews/${media.relativePath}`}
          autoPlay
          muted
          loop
          playsInline
          onCanPlay={handleCanPlay}
        />
      )}
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
