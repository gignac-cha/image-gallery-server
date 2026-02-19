import { useState, useRef, useLayoutEffect, useMemo } from 'react';
import type { MediaFile } from '../../types.ts';
import type { LayoutTheme } from '../Header.tsx';
import { Tile } from './Tile.tsx';
import { computeCollageLayout } from './collage.ts';
import { computeMasonryLayout } from './masonry.ts';
import { computeJustifiedLayout } from './justified.ts';

interface GridProps {
  media: MediaFile[];
  layout: LayoutTheme;
  gridUnit: number;
  onMediaClick: (index: number) => void;
}

const POSITIONED_LAYOUTS = new Set<LayoutTheme>(['collage', 'masonry', 'justified']);

export function Grid({ media, layout, gridUnit, onMediaClick }: GridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const isPositioned = POSITIONED_LAYOUTS.has(layout);

  useLayoutEffect(() => {
    if (!isPositioned || !containerRef.current) return;

    setContainerWidth(containerRef.current.clientWidth);

    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [isPositioned]);

  const computedLayout = useMemo(() => {
    if (!isPositioned || containerWidth <= 0) return null;
    switch (layout) {
      case 'collage':
        return computeCollageLayout(media, containerWidth, gridUnit);
      case 'masonry':
        return computeMasonryLayout(media, containerWidth);
      case 'justified':
        return computeJustifiedLayout(media, containerWidth);
      default:
        return null;
    }
  }, [layout, isPositioned, containerWidth, media, gridUnit]);

  const layoutClass =
    layout === 'grid' ? '' :
    layout === 'collage' ? ' grid--collage' :
    ' grid--positioned';

  return (
    <main
      ref={containerRef}
      className={`grid${layoutClass}`}
      style={computedLayout ? { height: computedLayout.totalHeight } : undefined}
    >
      {media.map((item, index) => (
        <Tile
          key={item.relativePath}
          media={item}
          onClick={() => onMediaClick(index)}
          style={
            computedLayout
              ? {
                  position: 'absolute' as const,
                  left: computedLayout.tiles[index].x,
                  top: computedLayout.tiles[index].y,
                  width: computedLayout.tiles[index].width,
                  height: computedLayout.tiles[index].height,
                  zIndex: computedLayout.tiles[index].zIndex,
                }
              : undefined
          }
        />
      ))}
    </main>
  );
}
