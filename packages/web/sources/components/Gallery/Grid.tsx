import { ImageFile } from '../../types.ts';
import { Tile } from './Tile.tsx';

interface GridProps {
  images: ImageFile[];
  onImageClick: (index: number) => void;
}

export function Grid({ images, onImageClick }: GridProps) {
  return (
    <main className="grid">
      {images.map((image, index) => (
        <Tile
          key={image.relativePath}
          image={image}
          onClick={() => onImageClick(index)}
        />
      ))}
    </main>
  );
}
