"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { explorePaths } from "@/lib/graph/explorePaths";

const links = [
  { href: explorePaths.home, label: "Overview", match: "exact" as const },
  { href: explorePaths.concepts, label: "Concepts", match: "prefix" as const },
  { href: explorePaths.patterns, label: "Patterns", match: "prefix" as const },
  { href: explorePaths.situations, label: "Situations", match: "prefix" as const },
  { href: explorePaths.books, label: "Books", match: "prefix" as const },
  { href: explorePaths.thinkers, label: "Thinkers", match: "prefix" as const },
  { href: explorePaths.sources, label: "Sources", match: "prefix" as const },
  { href: "/trails", label: "Reading Trails", match: "prefix" as const },
  { href: "/search", label: "Search", match: "prefix" as const },
] as const;

function isActive(pathname: string, href: string, match: "exact" | "prefix"): boolean {
  if (match === "exact") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Light wayfinding — compact on mobile so Books/catalog keep first-viewport room. */
export function ExploreSidebar() {
  const pathname = usePathname() ?? "";

  return (
    <nav
      aria-label="Explore sections"
      className="flex min-h-10 flex-wrap items-center gap-x-4 gap-y-1.5 border-b border-border/25 py-2 text-[10px] uppercase tracking-[0.2em] text-muted md:min-h-[3.25rem] md:gap-x-6 md:gap-y-2 md:py-3.5 md:text-[11px] md:tracking-[0.22em]"
    >
      {links.map((item) => {
        const active = isActive(pathname, item.href, item.match);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={
              active
                ? "text-accent transition-colors"
                : "text-muted transition-colors hover:text-accent"
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
