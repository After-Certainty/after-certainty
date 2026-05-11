import Link from "next/link";
import type { BookDownloadLinkItem } from "@/lib/books/book-download-links";

type Props = {
  links: BookDownloadLinkItem[];
};

/** Release-file downloads on generic `/books/[slug]` catalog pages */
export function BookCatalogDownloadLinks({ links }: Props) {
  if (links.length === 0) return null;

  return (
    <section className="mt-10" aria-label="Downloads">
      <h2 className="text-xs uppercase tracking-[0.25em] text-muted">Downloads</h2>
      <ul className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {links.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex text-sm font-medium text-accent underline-offset-4 hover:underline"
            >
              Download {item.label}
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted">Files open from GitHub releases in a new tab.</p>
    </section>
  );
}
