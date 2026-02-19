import { useState, useEffect, useCallback } from 'react';
import { GalleryData } from './types.ts';
import { Header } from './components/Header.tsx';
import type { LayoutTheme } from './components/Header.tsx';
import { Grid } from './components/Gallery/Grid.tsx';
import { Lightbox } from './components/Gallery/Lightbox.tsx';

const VIEW_PREFIX = '#/view/';

function getHashPath(): string | null {
  const hash = location.hash;
  if (hash.startsWith(VIEW_PREFIX)) {
    return decodeURIComponent(hash.slice(VIEW_PREFIX.length));
  }
  return null;
}

export function Application() {
  const [data, setData] = useState<GalleryData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [layout, setLayout] = useState<LayoutTheme>('grid');

  useEffect(() => {
    fetch('/api/media')
      .then((response) => response.json())
      .then((json: GalleryData) => setData(json))
      .catch((err) => setError(err.message));
  }, []);

  // On data load, restore lightbox from URL hash
  useEffect(() => {
    if (!data) return;
    const path = getHashPath();
    if (path) {
      const index = data.media.findIndex((m) => m.relativePath === path);
      if (index >= 0) {
        setLightboxIndex(index);
        // Ensure a base entry exists so back button works
        const currentHash = location.hash;
        history.replaceState(null, '', location.pathname);
        history.pushState({ lightbox: true }, '', currentHash);
      }
    }
  }, [data]);

  const openLightbox = useCallback((index: number) => {
    if (!data) return;
    setLightboxIndex(index);
    history.pushState({ lightbox: true }, '', VIEW_PREFIX + encodeURIComponent(data.media[index].relativePath));
  }, [data]);

  const closeLightbox = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex(null);
    if (history.state?.lightbox) {
      history.back();
    }
  }, [lightboxIndex]);

  const navigateLightbox = useCallback((index: number) => {
    if (!data) return;
    setLightboxIndex(index);
    history.replaceState({ lightbox: true }, '', VIEW_PREFIX + encodeURIComponent(data.media[index].relativePath));
  }, [data]);

  useEffect(() => {
    const handlePopState = () => {
      const path = getHashPath();
      if (path && data) {
        const index = data.media.findIndex((m) => m.relativePath === path);
        setLightboxIndex(index >= 0 ? index : null);
      } else {
        setLightboxIndex(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [data]);

  if (error) {
    return <div className="error">Failed to load gallery: {error}</div>;
  }

  if (!data) {
    return <div className="loading">Loading gallery...</div>;
  }

  return (
    <div className="app">
      <Header
        title={data.options.title}
        totalImages={data.totalImages}
        totalVideos={data.totalVideos}
        layout={layout}
        onLayoutChange={setLayout}
      />
      <Grid
        media={data.media}
        layout={layout}
        onMediaClick={openLightbox}
      />
      {lightboxIndex !== null && (
        <Lightbox
          media={data.media}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onNavigate={navigateLightbox}
        />
      )}
    </div>
  );
}
