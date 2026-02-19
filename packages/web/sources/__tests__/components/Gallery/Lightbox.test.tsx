import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Lightbox } from '../../../components/Gallery/Lightbox.tsx';
import { createImageFile } from '../../helpers/fixtures.ts';

afterEach(cleanup);

const threeImages = [
  createImageFile({ relativePath: 'a.jpg', name: 'a.jpg' }),
  createImageFile({ relativePath: 'b.jpg', name: 'b.jpg' }),
  createImageFile({ relativePath: 'c.jpg', name: 'c.jpg' }),
];

describe('Lightbox', () => {
  it('renders full-size image src', () => {
    render(
      <Lightbox images={threeImages} currentIndex={1} onClose={vi.fn()} onNavigate={vi.fn()} />,
    );

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/images/b.jpg');
  });

  it('displays counter as "2 / 3"', () => {
    render(
      <Lightbox images={threeImages} currentIndex={1} onClose={vi.fn()} onNavigate={vi.fn()} />,
    );

    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });

  it('shows both nav buttons when in the middle', () => {
    render(
      <Lightbox images={threeImages} currentIndex={1} onClose={vi.fn()} onNavigate={vi.fn()} />,
    );

    expect(screen.getByText('‹')).toBeInTheDocument();
    expect(screen.getByText('›')).toBeInTheDocument();
  });

  it('hides prev button on first image', () => {
    render(
      <Lightbox images={threeImages} currentIndex={0} onClose={vi.fn()} onNavigate={vi.fn()} />,
    );

    expect(screen.queryByText('‹')).not.toBeInTheDocument();
    expect(screen.getByText('›')).toBeInTheDocument();
  });

  it('hides next button on last image', () => {
    render(
      <Lightbox images={threeImages} currentIndex={2} onClose={vi.fn()} onNavigate={vi.fn()} />,
    );

    expect(screen.getByText('‹')).toBeInTheDocument();
    expect(screen.queryByText('›')).not.toBeInTheDocument();
  });

  it('shows only close button for a single image', () => {
    const single = [createImageFile()];
    render(
      <Lightbox images={single} currentIndex={0} onClose={vi.fn()} onNavigate={vi.fn()} />,
    );

    expect(screen.queryByText('‹')).not.toBeInTheDocument();
    expect(screen.queryByText('›')).not.toBeInTheDocument();
    expect(screen.getByText('×')).toBeInTheDocument();
  });

  it('calls onNavigate with previous index on prev click', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(
      <Lightbox images={threeImages} currentIndex={1} onClose={vi.fn()} onNavigate={onNavigate} />,
    );

    await user.click(screen.getByText('‹'));
    expect(onNavigate).toHaveBeenCalledWith(0);
  });

  it('calls onNavigate with next index on next click', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(
      <Lightbox images={threeImages} currentIndex={1} onClose={vi.fn()} onNavigate={onNavigate} />,
    );

    await user.click(screen.getByText('›'));
    expect(onNavigate).toHaveBeenCalledWith(2);
  });

  it('calls onClose on close button click', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Lightbox images={threeImages} currentIndex={0} onClose={onClose} onNavigate={vi.fn()} />,
    );

    await user.click(screen.getByText('×'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose on overlay click but not on content click', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { container } = render(
      <Lightbox images={threeImages} currentIndex={0} onClose={onClose} onNavigate={vi.fn()} />,
    );

    // Click on content area (image) — should NOT close
    await user.click(screen.getByRole('img'));
    expect(onClose).not.toHaveBeenCalled();

    // Click on overlay (the outermost div)
    const overlay = container.querySelector('.lightbox')!;
    await user.click(overlay);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('handles Escape key to close', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Lightbox images={threeImages} currentIndex={0} onClose={onClose} onNavigate={vi.fn()} />,
    );

    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('handles ArrowLeft key to navigate prev', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(
      <Lightbox images={threeImages} currentIndex={1} onClose={vi.fn()} onNavigate={onNavigate} />,
    );

    await user.keyboard('{ArrowLeft}');
    expect(onNavigate).toHaveBeenCalledWith(0);
  });

  it('handles ArrowRight key to navigate next', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(
      <Lightbox images={threeImages} currentIndex={1} onClose={vi.fn()} onNavigate={onNavigate} />,
    );

    await user.keyboard('{ArrowRight}');
    expect(onNavigate).toHaveBeenCalledWith(2);
  });

  it('does not navigate past first image with ArrowLeft', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(
      <Lightbox images={threeImages} currentIndex={0} onClose={vi.fn()} onNavigate={onNavigate} />,
    );

    await user.keyboard('{ArrowLeft}');
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('does not navigate past last image with ArrowRight', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(
      <Lightbox images={threeImages} currentIndex={2} onClose={vi.fn()} onNavigate={onNavigate} />,
    );

    await user.keyboard('{ArrowRight}');
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('removes keydown listener on unmount', () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener');
    const { unmount } = render(
      <Lightbox images={threeImages} currentIndex={0} onClose={vi.fn()} onNavigate={vi.fn()} />,
    );

    unmount();

    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    removeSpy.mockRestore();
  });
});
