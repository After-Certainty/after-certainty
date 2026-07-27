import type { ChapterManuscriptResult } from "@/lib/reading/load-chapter-manuscript";

type ChapterManuscriptBodyProps = {
  result: ChapterManuscriptResult;
};

/**
 * Sanitized manuscript HTML (or a clear missing/error state).
 * HTML is produced by rehype-sanitize before reaching this component.
 */
export function ChapterManuscriptBody({ result }: ChapterManuscriptBodyProps) {
  if (result.status === "ok") {
    return (
      <div
        className="chapter-manuscript prose max-w-none prose-headings:font-display prose-headings:scroll-mt-24 prose-a:text-accent prose-img:rounded-sm"
        // Sanitized via rehype-sanitize in renderManuscriptHtml (READ-003).
        dangerouslySetInnerHTML={{ __html: result.html }}
      />
    );
  }

  const title =
    result.status === "missing"
      ? "Manuscript unavailable"
      : result.status === "unsafe"
        ? "Manuscript path rejected"
        : "Could not render chapter";

  return (
    <div
      role="alert"
      className="rounded-sm border border-border/50 bg-bg-elevated/40 px-5 py-8 text-sm leading-relaxed text-muted"
    >
      <p className="mb-2 font-medium text-fg/90">{title}</p>
      <p>{result.message}</p>
      {result.sourcePath ? (
        <p className="mt-3 text-xs text-muted/80">Source: {result.sourcePath}</p>
      ) : null}
      <p className="mt-4">
        Downloads remain available from the book page while this chapter text cannot be shown.
      </p>
    </div>
  );
}
