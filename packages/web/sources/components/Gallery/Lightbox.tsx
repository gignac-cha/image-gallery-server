import { useEffect, useCallback } from 'react';
import { ImageFile } from '../../types.ts';

interface LightboxProps {
  images: ImageFile[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function Lightbox({ images, currentIndex, onClose, onNavigate }: LightboxProps) {
  const image = images[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;

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
        <button className="lightbox__close" onClick={onClose}>×</button>

        {hasPrev && (
          <button
            className="lightbox__nav lightbox__nav--prev"
            onClick={() => onNavigate(currentIndex - 1)}
          >
            ‹
          </button>
        )}

        <img
          className="lightbox__image"
          src={`/images/${image.relativePath}`}
          alt={image.name}
        />

        {hasNext && (
          <button
            className="lightbox__nav lightbox__nav--next"
            onClick={() => onNavigate(currentIndex + 1)}
          >
            ›
          </button>
        )}

        <div className="lightbox__info">
          <span className="lightbox__name">{image.name}</span>
          <span className="lightbox__counter">
            {currentIndex + 1} / {images.length}
          </span>
        </div>
      </div>
    </div>
  );
}
