import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type AuthorLink = {
  label: string;
  href: string;
};

export type AuthorProfileProps = {
  name: string;
  portraitSrc?: string;
  portraitAlt?: string;
  links?: AuthorLink[];
  children: ReactNode;
  className?: string;
};

export function AuthorProfile({ name, portraitSrc, portraitAlt = "", links, children, className }: AuthorProfileProps) {
  const showImage = Boolean(portraitSrc);

  return (
    <div className={cn("relative", className)}>
      <div className="flex flex-col gap-10 md:flex-row md:items-start md:gap-12">
        <div className="mx-auto shrink-0 md:mx-0">
          <div
            className={cn(
              "relative h-36 w-36 overflow-hidden rounded-sm border md:h-40 md:w-40",
              showImage ? "border-border/40" : "border-dashed border-border/45 bg-bg/[0.25]",
            )}
          >
            {showImage ? (
              <Image src={portraitSrc!} alt={portraitAlt || name} fill className="object-cover" sizes="160px" />
            ) : (
              <>
                <span className="flex h-full w-full items-center justify-center text-muted/35">—</span>
                <span className="sr-only">Portrait not shown.</span>
              </>
            )}
          </div>
          {!showImage ? (
            <p className="mt-3 text-center text-[11px] uppercase tracking-[0.22em] text-muted/75 md:text-left">Portrait</p>
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-[0.28em] text-muted">Author</p>
          <p className="mt-2 font-display text-2xl tracking-tight text-fg">{name}</p>
          <div className="mt-8 space-y-6 text-[17px] leading-[1.75] text-muted md:text-lg">{children}</div>

          {links && links.length > 0 ? (
            <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-border/25 pt-8">
              {links.map((link) => (
                <li key={`${link.href}-${link.label}`}>
                  <a
                    href={link.href}
                    className="text-sm text-accent underline-offset-4 transition-colors duration-200 hover:text-fg hover:underline"
                    {...(link.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}
