import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Grid } from '../../../components/Gallery/Grid.tsx';
import { createImageFile } from '../../helpers/fixtures.ts';

describe('Grid', () => {
  it('renders one tile per image', () => {
    const images = [
      createImageFile({ name: 'a.jpg', relativePath: 'a.jpg' }),
      createImageFile({ name: 'b.jpg', relativePath: 'b.jpg' }),
      createImageFile({ name: 'c.jpg', relativePath: 'c.jpg' }),
    ];

    render(<Grid images={images} onImageClick={vi.fn()} />);

    const tiles = screen.getAllByRole('img');
    expect(tiles).toHaveLength(3);
  });

  it('renders no tiles for empty array', () => {
    render(<Grid images={[]} onImageClick={vi.fn()} />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('calls onImageClick with correct index on click', async () => {
    const user = userEvent.setup();
    const onImageClick = vi.fn();
    const images = [
      createImageFile({ name: 'a.jpg', relativePath: 'a.jpg' }),
      createImageFile({ name: 'b.jpg', relativePath: 'b.jpg' }),
    ];

    render(<Grid images={images} onImageClick={onImageClick} />);

    const tiles = screen.getAllByRole('img');
    await user.click(tiles[1]);

    expect(onImageClick).toHaveBeenCalledWith(1);
  });
});
