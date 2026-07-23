import type { BookStructureViewModel } from "@/lib/books/book-chapter-view-model";

function formatMinutes(minutes: number): string {
  if (minutes < 1) return "Under 1 min";
  if (minutes === 1) return "1 min";
  return `${minutes} min`;
}

type BookInsideThisBookProps = {
  structure: BookStructureViewModel;
};

/**
 * Orientation map of parts and chapters. No fabricated chapter links.
 * Uses native details/summary for accessible progressive disclosure.
 */
export function BookInsideThisBook({ structure }: BookInsideThisBookProps) {
  const longBook = structure.chapters.length > 24 || structure.parts.length > 4;

  return (
    <div className="space-y-8">
      {structure.totalEstimatedMinutes ? (
        <p className="text-sm text-muted">
          About {formatMinutes(structure.totalEstimatedMinutes)} of reading across{" "}
          {structure.chapters.length} sections
          {structure.parts.length > 1 ? ` in ${structure.parts.length} parts` : ""}.
        </p>
      ) : null}

      <div className="space-y-4">
        {structure.parts.map((part, partIndex) => {
          const heading =
            part.title?.trim() ||
            (structure.parts.length === 1 ? "Chapters" : `Part ${part.position}`);
          const defaultOpen = partIndex === 0 || !longBook;

          return (
            <details
              key={part.id}
              className="group border-t border-border/30 open:pb-2"
              open={defaultOpen}
            >
              <summary className="cursor-pointer list-none py-4 marker:content-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent [&::-webkit-details-marker]:hidden">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-xl font-medium tracking-tight text-fg md:text-2xl">
                    {heading}
                  </h3>
                  <span className="shrink-0 text-xs uppercase tracking-[0.2em] text-muted">
                    {part.chapters.length} {part.chapters.length === 1 ? "section" : "sections"}
                    <span className="ml-2 text-accent group-open:hidden" aria-hidden>
                      Show
                    </span>
                    <span className="ml-2 hidden text-accent group-open:inline" aria-hidden>
                      Hide
                    </span>
                  </span>
                </div>
              </summary>

              <ol className="space-y-1 pb-4">
                {part.chapters.map((chapter) => {
                  const hasDetail = Boolean(chapter.summary || chapter.centralQuestion);
                  const row = (
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="font-medium text-fg">{chapter.title}</span>
                      {chapter.kindLabel ? (
                        <span className="text-[10px] uppercase tracking-[0.22em] text-muted">
                          {chapter.kindLabel}
                        </span>
                      ) : null}
                      {chapter.estimatedMinutes ? (
                        <span className="text-sm text-muted">
                          {formatMinutes(chapter.estimatedMinutes)}
                        </span>
                      ) : null}
                    </div>
                  );

                  if (!hasDetail) {
                    return (
                      <li key={chapter.id} className="border-t border-border/20 py-3">
                        {row}
                      </li>
                    );
                  }

                  return (
                    <li key={chapter.id} className="border-t border-border/20">
                      <details className="group/chapter py-3">
                        <summary className="cursor-pointer list-none marker:content-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent [&::-webkit-details-marker]:hidden">
                          {row}
                          <span className="mt-1 block text-xs text-accent group-open/chapter:hidden">
                            Show summary
                          </span>
                          <span className="mt-1 hidden text-xs text-accent group-open/chapter:block">
                            Hide summary
                          </span>
                        </summary>
                        <div className="mt-3 max-w-2xl space-y-2 text-sm leading-relaxed text-muted">
                          {chapter.summary ? <p>{chapter.summary}</p> : null}
                          {chapter.centralQuestion ? (
                            <p>
                              <span className="text-[10px] uppercase tracking-[0.22em] text-accent">
                                Central question
                              </span>
                              <span className="mt-1 block text-fg/90">
                                {chapter.centralQuestion}
                              </span>
                            </p>
                          ) : null}
                        </div>
                      </details>
                    </li>
                  );
                })}
              </ol>
            </details>
          );
        })}
      </div>
    </div>
  );
}
