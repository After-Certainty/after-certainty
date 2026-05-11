type PatternTagProps = {
  children: React.ReactNode;
};

export function PatternTag({ children }: PatternTagProps) {
  return (
    <span className="inline-flex items-center rounded-full border border-border/45 bg-bg-elevated/15 px-2.5 py-0.5 text-[11px] uppercase tracking-[0.14em] text-muted">
      {children}
    </span>
  );
}
