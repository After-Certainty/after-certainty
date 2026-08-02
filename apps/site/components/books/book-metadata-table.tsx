import { buildBookMetadataRows, type BookMetadataInput } from "@/lib/books/book-metadata-rows";

type BookMetadataTableProps = BookMetadataInput & {
  className?: string;
};

/** Definition list of real book metadata — renders nothing when no rows exist. */
export function BookMetadataTable({ className = "", ...input }: BookMetadataTableProps) {
  const rows = buildBookMetadataRows(input);
  if (rows.length === 0) return null;

  return (
    <dl
      className={`divide-y divide-border/30 border-y border-border/30 text-sm ${className}`.trim()}
      aria-label="Book details"
    >
      {rows.map((row) => (
        <div
          key={row.label}
          className="grid grid-cols-[minmax(6rem,8rem)_1fr] gap-x-4 gap-y-1 py-2.5 md:grid-cols-[minmax(7rem,9rem)_1fr]"
        >
          <dt className="text-[11px] uppercase tracking-[0.2em] text-muted">{row.label}</dt>
          <dd className="min-w-0 text-fg">
            {row.href ? (
              <a href={row.href} className="text-accent underline-offset-4 hover:underline">
                {row.value}
              </a>
            ) : (
              row.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
