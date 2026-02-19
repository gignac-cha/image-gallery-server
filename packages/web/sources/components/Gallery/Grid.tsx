import { MediaFile } from '../../types.ts';
import type { LayoutTheme } from '../Header.tsx';
import { Tile } from './Tile.tsx';

interface GridProps {
  media: MediaFile[];
  layout: LayoutTheme;
  onMediaClick: (index: number) => void;
}

export function Grid({ media, layout, onMediaClick }: GridProps) {
  return (
    <main className={`grid${layout === 'collage' ? ' grid--collage' : ''}`}>
      {media.map((item, index) => (
        <Tile
          key={item.relativePath}
          media={item}
          onClick={() => onMediaClick(index)}
        />
      ))}
    </main>
  );
}
