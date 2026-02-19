export type LayoutTheme = 'grid' | 'collage' | 'masonry' | 'justified';

interface HeaderProps {
  title: string;
  totalImages: number;
  totalVideos: number;
  layout: LayoutTheme;
  onLayoutChange: (layout: LayoutTheme) => void;
  onSettingsClick: () => void;
}

export function Header({ title, totalImages, totalVideos, layout, onLayoutChange, onSettingsClick }: HeaderProps) {
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
      <div className="header__right">
        <div className="header__theme-selector">
          <button
            className={`header__theme-button${layout === 'grid' ? ' header__theme-button--active' : ''}`}
            onClick={() => onLayoutChange('grid')}
            title="Grid"
          >
            {'\u2588\u2588\u2588'}
          </button>
          <button
            className={`header__theme-button${layout === 'masonry' ? ' header__theme-button--active' : ''}`}
            onClick={() => onLayoutChange('masonry')}
            title="Masonry"
          >
            {'\u2587\u2583\u2585'}
          </button>
          <button
            className={`header__theme-button${layout === 'justified' ? ' header__theme-button--active' : ''}`}
            onClick={() => onLayoutChange('justified')}
            title="Justified"
          >
            {'\u2580\u2580\u2580'}
          </button>
          <button
            className={`header__theme-button${layout === 'collage' ? ' header__theme-button--active' : ''}`}
            onClick={() => onLayoutChange('collage')}
            title="Collage"
          >
            {'\u2587\u2585\u2586'}
          </button>
        </div>
        <button
          className="header__settings-button"
          onClick={onSettingsClick}
          title="Settings"
        >
          {'\u2699'}
        </button>
      </div>
    </header>
  );
}
