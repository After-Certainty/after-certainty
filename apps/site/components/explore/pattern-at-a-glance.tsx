import { SiteIcon } from "@/components/icons/site-icon";
import { patternGlanceIcons } from "@/components/icons/semantic";
import type { PatternGlanceItem } from "@/lib/explore/pattern-at-a-glance";

type PatternAtAGlanceProps = {
  items: readonly PatternGlanceItem[];
  className?: string;
};

/**
 * Two-column At-a-glance grid. Caller must pass only non-empty items
 * from `patternAtAGlance()` — never render empty shells.
 */
export function PatternAtAGlance({ items, className = "" }: PatternAtAGlanceProps) {
  if (items.length === 0) return null;

  return (
    <section
      className={`mt-6 max-w-3xl md:mt-10 ${className}`.trim()}
      aria-labelledby="pattern-at-a-glance-heading"
    >
      <h2
        id="pattern-at-a-glance-heading"
        className="text-[11px] uppercase tracking-[0.28em] text-accent"
      >
        At a glance
      </h2>
      <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        {items.map((item) => {
          const icon = patternGlanceIcons[item.slot];
          return (
            <li
              key={item.slot}
              className="min-w-0 border-t border-border/40 pt-3"
            >
              <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-accent">
                <SiteIcon icon={icon} size="sm" className="text-accent" />
                {item.label}
              </p>
              <p className="mt-2 text-sm leading-snug text-muted">{item.text}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
