import { Container } from "@/components/ui/container";

/** Lightweight books-index placeholder while the catalog stream resolves. */
export default function BooksLoading() {
  return (
    <div className="animate-pulse motion-reduce:animate-none" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading books</span>
      <Container className="py-10 md:py-14">
        <div className="h-3 w-28 rounded bg-border/35" />
        <div className="mt-4 h-9 max-w-md rounded bg-border/40" />
        <div className="mt-3 h-16 max-w-2xl rounded bg-border/25" />
        <div className="mt-10 space-y-4 border-t border-border/25 pt-8">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 border-b border-border/20 pb-4">
              <div className="h-20 w-14 shrink-0 rounded bg-border/30" />
              <div className="min-w-0 flex-1 space-y-2 py-1">
                <div className="h-4 max-w-xs rounded bg-border/35" />
                <div className="h-3 max-w-sm rounded bg-border/25" />
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
