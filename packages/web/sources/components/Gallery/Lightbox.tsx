import { useState, useEffect, useCallback } from 'react';
import { MediaFile } from '../../types.ts';

interface LightboxProps {
  media: MediaFile[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function Lightbox({ media, currentIndex, onClose, onNavigate }: LightboxProps) {
  const item = media[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < media.length - 1;
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    setVideoError(false);
  }, [currentIndex]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (hasPrev) onNavigate(currentIndex - 1);
          break;
        case 'ArrowRight':
          if (hasNext) onNavigate(currentIndex + 1);
          break;
      }
    },
    [onClose, onNavigate, currentIndex, hasPrev, hasNext],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="lightbox" onClick={onClose}>
      <div className="lightbox__content" onClick={(e) => e.stopPropagation()}>
        <button className="lightbox__close" onClick={onClose}>{'\u00d7'}</button>

        {hasPrev && (
          <button
            className="lightbox__nav lightbox__nav--prev"
            onClick={() => onNavigate(currentIndex - 1)}
          >
            {'\u2039'}
          </button>
        )}

        {item.type === 'video' ? (
          videoError ? (
            <div className="lightbox__unsupported">
              This format cannot be played in the browser.
            </div>
          ) : (
            <video
              key={item.relativePath}
              className="lightbox__video"
              src={`/media/${item.relativePath}`}
              controls
              autoPlay
              loop
              onError={() => setVideoError(true)}
            />
          )
        ) : (
          <img
            key={item.relativePath}
            className="lightbox__image"
            src={`/images/${item.relativePath}`}
            alt={item.name}
          />
        )}

        {hasNext && (
          <button
            className="lightbox__nav lightbox__nav--next"
            onClick={() => onNavigate(currentIndex + 1)}
          >
            {'\u203a'}
          </button>
        )}

        <div className="lightbox__info">
          <span className="lightbox__name">{item.name}</span>
          <span className="lightbox__counter">
            {currentIndex + 1} / {media.length}
          </span>
        </div>
      </div>
    </div>
  );
}
