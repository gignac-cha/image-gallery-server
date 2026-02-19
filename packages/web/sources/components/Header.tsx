interface HeaderProps {
  title: string;
  totalImages: number;
  totalVideos: number;
}

export function Header({ title, totalImages, totalVideos }: HeaderProps) {
  const parts: string[] = [];
  if (totalImages > 0) parts.push(`${totalImages} images`);
  if (totalVideos > 0) parts.push(`${totalVideos} videos`);
  const countText = parts.join(', ') || '0 items';

  return (
    <header className="header">
      <h1 className="header__title">{title}</h1>
      <span className="header__count">{countText}</span>
    </header>
  );
}
