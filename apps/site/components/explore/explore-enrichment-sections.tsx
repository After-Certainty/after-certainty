import type { ReactNode } from "react";

import type { SemanticEnrichment } from "@/types/semanticGraph";

import { MobileDisclosure } from "@/components/ui/mobile-disclosure";

type ExploreEnrichmentSectionsProps = {
  enrichment: SemanticEnrichment;
};

function itemCountLabel(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

function EnrichmentDisclosure({
  id,
  heading,
  countLabel,
  children,
}: {
  id: string;
  heading: string;
  countLabel: string;
  children: ReactNode;
}) {
  return (
    <MobileDisclosure
      id={id}
      regionLabel={heading}
      alwaysOpenFromMd
      defaultOpen={false}
      summaryClassName="flex min-h-11 w-full items-center gap-3 border-b border-border/35 py-[var(--explore-row-py)] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:hidden"
      summary={
        <span className="block min-w-0 leading-tight">
          <span className="block font-display text-lg font-medium tracking-tight text-fg">
            {heading}
          </span>
          <span className="mt-0.5 block text-[11px] leading-none text-muted">{countLabel}</span>
        </span>
      }
      panelClassName="pt-4 md:pt-0"
    >
      <h2 className="mb-6 hidden font-display text-2xl font-medium tracking-tight text-fg md:block md:text-3xl">
        {heading}
      </h2>
      {children}
    </MobileDisclosure>
  );
}

function SignalList({
  id,
  heading,
  items,
}: {
  id: string;
  heading: string;
  items: string[] | undefined;
}) {
  if (!items?.length) return null;
  return (
    <EnrichmentDisclosure
      id={id}
      heading={heading}
      countLabel={itemCountLabel(items.length, "item")}
    >
      <ul className="space-y-3 text-sm leading-relaxed text-muted md:text-base">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent/70" aria-hidden />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </EnrichmentDisclosure>
  );
}

/** True when enrichment has at least one authored visible block. */
export function hasSemanticEnrichment(enrichment: SemanticEnrichment): boolean {
  const trajectory = enrichment.trajectory;
  const manifestationEntries = enrichment.manifestations
    ? Object.entries(enrichment.manifestations).filter(([, items]) => items.length > 0)
    : [];
  return (
    (enrichment.recognitionSignals?.length ?? 0) > 0 ||
    (enrichment.questions?.length ?? 0) > 0 ||
    (enrichment.counterbalances?.length ?? 0) > 0 ||
    Boolean(trajectory) ||
    manifestationEntries.length > 0
  );
}

function trajectoryItemCount(
  trajectory: NonNullable<SemanticEnrichment["trajectory"]>,
): number {
  return (
    (trajectory.earlySignals?.length ?? 0) +
    (trajectory.intensificationSignals?.length ?? 0) +
    (trajectory.failureModes?.length ?? 0) +
    (trajectory.restorationPaths?.length ?? 0)
  );
}

/** Shared enrichment blocks for situations (and reusable for other entities). */
export function ExploreEnrichmentSections({ enrichment }: ExploreEnrichmentSectionsProps) {
  if (!hasSemanticEnrichment(enrichment)) return null;

  const trajectory = enrichment.trajectory;
  const manifestationEntries = enrichment.manifestations
    ? Object.entries(enrichment.manifestations).filter(([, items]) => items.length > 0)
    : [];
  const manifestationItemCount = manifestationEntries.reduce(
    (sum, [, items]) => sum + items.length,
    0,
  );

  return (
    <div className="flex flex-col gap-8 md:gap-14">
      <SignalList
        id="enrichment-recognition"
        heading="Recognition signals"
        items={enrichment.recognitionSignals}
      />
      <SignalList
        id="enrichment-questions"
        heading="Questions to ask"
        items={enrichment.questions}
      />
      <SignalList
        id="enrichment-counterbalances"
        heading="Counterbalances"
        items={enrichment.counterbalances}
      />

      {trajectory && trajectoryItemCount(trajectory) > 0 ? (
        <EnrichmentDisclosure
          id="enrichment-trajectory"
          heading="Trajectory"
          countLabel={itemCountLabel(trajectoryItemCount(trajectory), "item")}
        >
          <div className="grid gap-10 md:grid-cols-2">
            {(
              [
                ["Early signals", trajectory.earlySignals],
                ["Intensification", trajectory.intensificationSignals],
                ["Failure modes", trajectory.failureModes],
                ["Restoration paths", trajectory.restorationPaths],
              ] as const
            ).map(([label, items]) =>
              items?.length ? (
                <div key={label}>
                  <p className="text-[11px] uppercase tracking-[0.28em] text-accent">{label}</p>
                  <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted md:text-base">
                    {items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null,
            )}
          </div>
        </EnrichmentDisclosure>
      ) : null}

      {manifestationEntries.length > 0 ? (
        <EnrichmentDisclosure
          id="enrichment-manifestations"
          heading="Manifestations"
          countLabel={itemCountLabel(manifestationItemCount, "item")}
        >
          <div className="space-y-8">
            {manifestationEntries.map(([domain, items]) => (
              <div key={domain}>
                <p className="text-[11px] uppercase tracking-[0.28em] text-accent">{domain}</p>
                <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted md:text-base">
                  {items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </EnrichmentDisclosure>
      ) : null}
    </div>
  );
}
