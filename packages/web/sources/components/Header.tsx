export type LayoutTheme = 'grid' | 'collage';

interface HeaderProps {
  title: string;
  totalImages: number;
  totalVideos: number;
  layout: LayoutTheme;
  onLayoutChange: (layout: LayoutTheme) => void;
}

export function Header({ title, totalImages, totalVideos, layout, onLayoutChange }: HeaderProps) {
  const parts: string[] = [];
  if (totalImages > 0) parts.push(`${totalImages} images`);
  if (totalVideos > 0) parts.push(`${totalVideos} videos`);
  const countText = parts.join(', ') || '0 items';

  return (
    <header className="header">
      <div className="header__left">
        <h1 className="header__title">{title}</h1>
        <span className="header__count">{countText}</span>
      </div>
      <div className="header__theme-selector">
        <button
          className={`header__theme-button${layout === 'grid' ? ' header__theme-button--active' : ''}`}
          onClick={() => onLayoutChange('grid')}
          title="Grid"
        >
          {'\u2588\u2588\u2588'}
        </button>
        <button
          className={`header__theme-button${layout === 'collage' ? ' header__theme-button--active' : ''}`}
          onClick={() => onLayoutChange('collage')}
          title="Collage"
        >
          {'\u2587\u2585\u2586'}
        </button>
      </div>
    </header>
  );
}
