import { useState, useRef, useLayoutEffect, useMemo } from 'react';
import type { MediaFile } from '../../types.ts';
import type { LayoutTheme } from '../Header.tsx';
import { Tile } from './Tile.tsx';
import { computeCollageLayout } from './collage.ts';

interface GridProps {
  media: MediaFile[];
  layout: LayoutTheme;
  gridUnit: number;
  onMediaClick: (index: number) => void;
}

export function Grid({ media, layout, gridUnit, onMediaClick }: GridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useLayoutEffect(() => {
    if (layout !== 'collage' || !containerRef.current) return;

    setContainerWidth(containerRef.current.clientWidth);

    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [layout]);

  const collageLayout = useMemo(() => {
    if (layout !== 'collage' || containerWidth <= 0) return null;
    return computeCollageLayout(media, containerWidth, gridUnit);
  }, [layout, containerWidth, media, gridUnit]);

  return (
    <main
      ref={containerRef}
      className={`grid${layout === 'collage' ? ' grid--collage' : ''}`}
      style={collageLayout ? { height: collageLayout.totalHeight } : undefined}
    >
      {media.map((item, index) => (
        <Tile
          key={item.relativePath}
          media={item}
          onClick={() => onMediaClick(index)}
          style={
            collageLayout
              ? {
                  position: 'absolute' as const,
                  left: collageLayout.tiles[index].x,
                  top: collageLayout.tiles[index].y,
                  width: collageLayout.tiles[index].width,
                  height: collageLayout.tiles[index].height,
                  zIndex: collageLayout.tiles[index].zIndex,
                }
              : undefined
          }
        />
      ))}
    </main>
  );
}
