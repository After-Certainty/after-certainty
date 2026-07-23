import Link from "next/link";
import { explorePaths } from "@/lib/graph/explorePaths";

const links = [
  { href: explorePaths.home, label: "Overview" },
  { href: explorePaths.concepts, label: "Concepts" },
  { href: explorePaths.patterns, label: "Patterns" },
  { href: explorePaths.situations, label: "Situations" },
  { href: explorePaths.books, label: "Books" },
  { href: explorePaths.thinkers, label: "Thinkers" },
  { href: explorePaths.sources, label: "Sources" },
  { href: "/trails", label: "Reading Trails" },
  { href: "/search", label: "Search" },
] as const;

/** Light wayfinding — not a heavy wiki sidebar. */
export function ExploreSidebar() {
  return (
    <nav
      aria-label="Explore sections"
      className="flex min-h-[3rem] flex-wrap items-center gap-x-6 gap-y-2 border-b border-border/25 py-3 text-[11px] uppercase tracking-[0.22em] text-muted md:min-h-[3.25rem] md:py-3.5"
    >
      {links.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="text-muted transition-colors hover:text-accent"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
