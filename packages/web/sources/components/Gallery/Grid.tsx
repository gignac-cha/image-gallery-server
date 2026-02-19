import { MediaFile } from '../../types.ts';
import { Tile } from './Tile.tsx';

interface GridProps {
  media: MediaFile[];
  onMediaClick: (index: number) => void;
}

export function Grid({ media, onMediaClick }: GridProps) {
  return (
    <main className="grid">
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
