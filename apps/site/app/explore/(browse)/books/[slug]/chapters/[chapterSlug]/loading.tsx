/** Lightweight chapter reader placeholder while manuscript/chrome resolve. */
export default function ChapterLoading() {
  return (
    <div
      className="mx-auto max-w-3xl animate-pulse px-4 py-10 motion-reduce:animate-none md:py-14"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading chapter</span>
      <div className="h-3 w-40 rounded bg-border/35" />
      <div className="mt-6 h-8 max-w-lg rounded bg-border/40" />
      <div className="mt-4 h-4 max-w-xs rounded bg-border/30" />
      <div className="mt-10 space-y-4 border-t border-border/25 pt-8">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-4 max-w-full rounded bg-border/25"
            style={{ maxWidth: `${92 - i * 6}%` }}
          />
        ))}
      </div>
    </div>
  );
}
