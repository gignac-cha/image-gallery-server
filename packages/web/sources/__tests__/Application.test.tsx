import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Application } from '../Application.tsx';
import { createGalleryData } from './helpers/fixtures.ts';

afterEach(cleanup);

beforeEach(() => {
  vi.restoreAllMocks();
});

function mockFetchSuccess(data = createGalleryData()) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      json: () => Promise.resolve(data),
    }),
  );
}

function mockFetchFailure(message = 'Network error') {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockRejectedValue(new Error(message)),
  );
}

describe('Application', () => {
  it('shows "Loading gallery..." before data arrives', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockReturnValue(new Promise(() => {})), // never resolves
    );

    render(<Application />);

    expect(screen.getByText('Loading gallery...')).toBeInTheDocument();
  });

  it('calls fetch("/api/images") on mount', () => {
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})));

    render(<Application />);

    expect(fetch).toHaveBeenCalledWith('/api/images');
  });

  it('renders Header with title and count after loading', async () => {
    const data = createGalleryData();
    mockFetchSuccess(data);

    render(<Application />);

    await waitFor(() => {
      expect(screen.getByText(data.options.title)).toBeInTheDocument();
    });
    expect(screen.getByText(`${data.totalImages} images`)).toBeInTheDocument();
  });

  it('renders image grid after loading', async () => {
    const data = createGalleryData();
    mockFetchSuccess(data);

    render(<Application />);

    await waitFor(() => {
      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(data.images.length);
    });
  });

  it('shows error message when fetch rejects', async () => {
    mockFetchFailure('Server is down');

    render(<Application />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load gallery/)).toBeInTheDocument();
      expect(screen.getByText(/Server is down/)).toBeInTheDocument();
    });
  });

  it('opens lightbox on tile click', async () => {
    const user = userEvent.setup();
    mockFetchSuccess();

    render(<Application />);

    await waitFor(() => {
      expect(screen.getAllByRole('img')).toHaveLength(3);
    });

    // Click first thumbnail
    await user.click(screen.getAllByRole('img')[0]);

    // Lightbox should show full-size image
    await waitFor(() => {
      expect(screen.getByText('1 / 3')).toBeInTheDocument();
    });
  });

  it('closes lightbox on Escape', async () => {
    const user = userEvent.setup();
    mockFetchSuccess();

    render(<Application />);

    await waitFor(() => {
      expect(screen.getAllByRole('img')).toHaveLength(3);
    });

    // Open lightbox
    await user.click(screen.getAllByRole('img')[0]);
    await waitFor(() => {
      expect(screen.getByText('1 / 3')).toBeInTheDocument();
    });

    // Press Escape
    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByText('1 / 3')).not.toBeInTheDocument();
    });
  });
});
