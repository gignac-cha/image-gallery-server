import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from '../../components/Header.tsx';

describe('Header', () => {
  it('renders title text', () => {
    render(<Header title="My Gallery" totalImages={10} />);
    expect(screen.getByText('My Gallery')).toBeInTheDocument();
  });

  it('renders image count', () => {
    render(<Header title="Gallery" totalImages={15} />);
    expect(screen.getByText('15 images')).toBeInTheDocument();
  });

  it('renders zero images case', () => {
    render(<Header title="Gallery" totalImages={0} />);
    expect(screen.getByText('0 images')).toBeInTheDocument();
  });

  it('uses <h1> for title', () => {
    render(<Header title="Gallery" totalImages={5} />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Gallery');
  });

  it('uses <header> element', () => {
    render(<Header title="Gallery" totalImages={5} />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });
});
