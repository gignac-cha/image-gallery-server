import { useState, useEffect } from 'react';
import { GalleryData } from './types.ts';
import { Header } from './components/Header.tsx';
import { Grid } from './components/Gallery/Grid.tsx';
import { Lightbox } from './components/Gallery/Lightbox.tsx';

export function Application() {
  const [data, setData] = useState<GalleryData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/images')
      .then((response) => response.json())
      .then((json: GalleryData) => setData(json))
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return <div className="error">Failed to load gallery: {error}</div>;
  }

  if (!data) {
    return <div className="loading">Loading gallery...</div>;
  }

  return (
    <div className="app">
      <Header title={data.options.title} totalImages={data.totalImages} />
      <Grid
        images={data.images}
        onImageClick={(index) => setLightboxIndex(index)}
      />
      {lightboxIndex !== null && (
        <Lightbox
          images={data.images}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(index) => setLightboxIndex(index)}
        />
      )}
    </div>
  );
}
