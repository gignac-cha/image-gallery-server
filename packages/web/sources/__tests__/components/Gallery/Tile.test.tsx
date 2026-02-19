import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tile } from '../../../components/Gallery/Tile.tsx';
import { createImageFile } from '../../helpers/fixtures.ts';

describe('Tile', () => {
  it('sets thumbnail src to /_thumbnails/{relativePath}', () => {
    const image = createImageFile({ relativePath: 'sub/photo.jpg' });
    render(<Tile image={image} onClick={vi.fn()} />);

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/_thumbnails/sub/photo.jpg');
  });

  it('sets alt text to image name', () => {
    const image = createImageFile({ name: 'sunset.jpg' });
    render(<Tile image={image} onClick={vi.fn()} />);

    expect(screen.getByAltText('sunset.jpg')).toBeInTheDocument();
  });

  it('sets loading="lazy" attribute', () => {
    const image = createImageFile();
    render(<Tile image={image} onClick={vi.fn()} />);

    expect(screen.getByRole('img')).toHaveAttribute('loading', 'lazy');
  });

  it('displays image name in overlay', () => {
    const image = createImageFile({ name: 'photo.jpg' });
    render(<Tile image={image} onClick={vi.fn()} />);

    expect(screen.getByText('photo.jpg')).toBeInTheDocument();
  });

  it('displays formatted size in MB', () => {
    const image = createImageFile({ size: 2516582 });
    render(<Tile image={image} onClick={vi.fn()} />);

    expect(screen.getByText(/2\.4 MB/)).toBeInTheDocument();
  });

  it('displays formatted size in KB', () => {
    const image = createImageFile({ size: 1536 });
    render(<Tile image={image} onClick={vi.fn()} />);

    expect(screen.getByText(/1\.5 KB/)).toBeInTheDocument();
  });

  it('displays formatted size in B', () => {
    const image = createImageFile({ size: 512 });
    render(<Tile image={image} onClick={vi.fn()} />);

    expect(screen.getByText(/512 B/)).toBeInTheDocument();
  });

  it('displays dimensions when present', () => {
    const image = createImageFile({ width: 1920, height: 1080 });
    render(<Tile image={image} onClick={vi.fn()} />);

    expect(screen.getByText(/1920×1080/)).toBeInTheDocument();
  });

  it('does not display dimensions when absent', () => {
    const image = createImageFile({ width: undefined, height: undefined });
    render(<Tile image={image} onClick={vi.fn()} />);

    expect(screen.queryByText(/×/)).not.toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const image = createImageFile();
    render(<Tile image={image} onClick={onClick} />);

    await user.click(screen.getByRole('img'));

    expect(onClick).toHaveBeenCalledOnce();
  });
});
