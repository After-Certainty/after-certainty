import { TrackedLink } from "@/components/analytics/tracked-link";
import { TargetIcon } from "@/components/icons/approved";
import { SiteIcon } from "@/components/icons/site-icon";
import { gamePaths } from "@/lib/games/paths";

/**
 * Compact callout on the Patterns index linking to the Pattern Recognition Challenge.
 * Matches the playlist callout row treatment so the index stays one composition language.
 */
export function ExplorePatternsGameCallout() {
  const href = gamePaths.patternRecognition;
  const linkText = "Pattern Recognition Challenge";

  return (
    <div className="mb-6 md:mb-8">
      <TrackedLink
        href={href}
        className="group flex min-h-11 items-center gap-3 rounded-md border border-border/40 bg-bg-elevated/30 px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        data-testid="patterns-game-callout"
        analytics={{
          event: "click",
          params: {
            link_url: href,
            link_text: linkText,
            location: "explore_patterns_index",
          },
        }}
      >
        <span className="min-w-0 flex-1 leading-tight">
          <span className="text-[10px] uppercase tracking-[0.28em] text-accent">Practice</span>
          <span className="mt-0.5 block font-display text-base font-medium tracking-tight text-fg transition-colors group-hover:text-accent">
            {linkText}
          </span>
        </span>
        <span
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-accent/35 text-accent transition-colors group-hover:border-accent/60"
          aria-hidden
        >
          <SiteIcon icon={TargetIcon} size="sm" weight="regular" />
        </span>
      </TrackedLink>
    </div>
  );
}
