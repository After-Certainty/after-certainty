import Link from "next/link";
import type { HeaderNavItem } from "@/components/books/when-others-look-to-you/layout/Header";
import { GitHubSymbol } from "@/components/books/when-others-look-to-you/icons/GitHubSymbol";
import { LinkedInSymbol } from "@/components/books/when-others-look-to-you/icons/LinkedInSymbol";
import { MediumSymbol } from "@/components/books/when-others-look-to-you/icons/MediumSymbol";
import { YouTubeSymbol } from "@/components/books/when-others-look-to-you/icons/YouTubeSymbol";
import { site } from "@/lib/books/when-others-look-to-you/content";

type FooterProps = {
  homeHref?: string;
  bookTitle: string;
  bookSubtitle: string;
  nav: readonly HeaderNavItem[];
  copyrightLine: string;
};

export function Footer({
  homeHref = "/",
  bookTitle,
  bookSubtitle,
  nav,
  copyrightLine,
}: FooterProps) {
  return (
    <footer
      id="resources"
      className="border-t border-white/10 bg-[#050d18] text-zinc-400"
    >
      <div className="mx-auto max-w-6xl px-[var(--padding-inline-section)] py-12">
        <div className="grid min-w-0 grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-start lg:gap-x-8">
          {/* Book */}
          <div className="max-w-sm lg:justify-self-start">
            <Link
              href={homeHref}
              className="inline-block font-[family-name:var(--font-heading)] text-sm font-semibold leading-snug tracking-wide text-zinc-200 transition-colors hover:text-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/40"
            >
              {bookTitle}
            </Link>
            <p className="mt-2 text-xs leading-relaxed text-zinc-500">
              {bookSubtitle}
            </p>
          </div>

          {/* Nav */}
          <nav
            className="flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-self-center lg:gap-x-8 lg:gap-y-2"
            aria-label="Footer"
          >
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-xs font-medium text-zinc-500 transition-colors duration-200 ease-out hover:text-zinc-300"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Social */}
          <div className="flex items-center justify-center gap-1 lg:justify-self-end">
            <Link
              href={site.githubRepoHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="When Others Look to You on GitHub"
              className="rounded-md p-2 text-zinc-500 transition-colors duration-200 ease-out hover:bg-white/5 hover:text-zinc-300"
            >
              <GitHubSymbol className="h-5 w-5" />
            </Link>
            <Link
              href={site.mediumProfileHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Kevin Steffensen on Medium"
              className="rounded-md p-2 text-zinc-500 transition-colors duration-200 ease-out hover:bg-white/5 hover:text-zinc-300"
            >
              <MediumSymbol className="h-5 w-auto" />
            </Link>
            <Link
              href={site.linkedInProfileHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Kevin Steffensen on LinkedIn"
              className="rounded-md p-2 text-zinc-500 transition-colors duration-200 ease-out hover:bg-white/5 hover:text-zinc-300"
            >
              <LinkedInSymbol className="h-5 w-5" />
            </Link>
            <Link
              href={site.youtubeChannelHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="@kstefftube on YouTube"
              className="rounded-md p-2 text-zinc-500 transition-colors duration-200 ease-out hover:bg-white/5 hover:text-zinc-300"
            >
              <YouTubeSymbol className="h-5 w-5" />
            </Link>
          </div>
        </div>

        <p className="mt-10 border-t border-white/10 pt-6 text-center text-[11px] leading-relaxed text-zinc-600">
          {copyrightLine}
        </p>
      </div>
    </footer>
  );
}
