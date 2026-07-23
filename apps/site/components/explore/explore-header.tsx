type ExploreHeaderProps = {
  eyebrow?: string;
  title: string;
  lede?: string;
  className?: string;
};

export function ExploreHeader({ eyebrow, title, lede, className = "" }: ExploreHeaderProps) {
  return (
    <header className={`max-w-3xl space-y-5 ${className}`}>
      {eyebrow ? (
        <p className="text-[11px] uppercase tracking-[0.32em] text-accent">{eyebrow}</p>
      ) : null}
      <h1 className="font-display text-4xl font-medium leading-[1.08] tracking-tight text-fg md:text-5xl">{title}</h1>
      {lede ? <p className="max-w-2xl text-base leading-relaxed text-muted md:text-[17px]">{lede}</p> : null}
    </header>
  );
}
