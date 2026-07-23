import Link from "next/link";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbTrailProps = {
  items: BreadcrumbItem[];
};

export function BreadcrumbTrail({ items }: BreadcrumbTrailProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-8 text-[11px] uppercase tracking-[0.2em] text-muted">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-2">
            {i > 0 ? <span className="text-border" aria-hidden>/</span> : null}
            {item.href ? (
              <Link href={item.href} className="transition-colors hover:text-accent">
                {item.label}
              </Link>
            ) : (
              <span className="text-fg">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
