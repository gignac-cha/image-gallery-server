interface HeaderProps {
  title: string;
  totalImages: number;
}

export function Header({ title, totalImages }: HeaderProps) {
  return (
    <header className="header">
      <h1 className="header__title">{title}</h1>
      <span className="header__count">{totalImages} images</span>
    </header>
  );
}
