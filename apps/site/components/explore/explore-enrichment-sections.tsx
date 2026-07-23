import type { SemanticEnrichment } from "@/types/semanticGraph";

type ExploreEnrichmentSectionsProps = {
  enrichment: SemanticEnrichment;
};

function SignalList({ heading, items }: { heading: string; items: string[] | undefined }) {
  if (!items?.length) return null;
  return (
    <section>
      <h2 className="font-display text-2xl font-medium tracking-tight text-fg md:text-3xl">
        {heading}
      </h2>
      <ul className="mt-6 space-y-3 text-sm leading-relaxed text-muted md:text-base">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent/70" aria-hidden />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Shared enrichment blocks for situations (and reusable for other entities). */
export function ExploreEnrichmentSections({ enrichment }: ExploreEnrichmentSectionsProps) {
  const trajectory = enrichment.trajectory;
  const manifestationEntries = enrichment.manifestations
    ? Object.entries(enrichment.manifestations).filter(([, items]) => items.length > 0)
    : [];

  const hasBody =
    (enrichment.recognitionSignals?.length ?? 0) > 0 ||
    (enrichment.questions?.length ?? 0) > 0 ||
    (enrichment.counterbalances?.length ?? 0) > 0 ||
    Boolean(trajectory) ||
    manifestationEntries.length > 0;

  if (!hasBody) return null;

  return (
    <div className="flex flex-col gap-14">
      <SignalList heading="Recognition signals" items={enrichment.recognitionSignals} />
      <SignalList heading="Questions to ask" items={enrichment.questions} />
      <SignalList heading="Counterbalances" items={enrichment.counterbalances} />

      {trajectory ? (
        <section>
          <h2 className="font-display text-2xl font-medium tracking-tight text-fg md:text-3xl">
            Trajectory
          </h2>
          <div className="mt-8 grid gap-10 md:grid-cols-2">
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
        </section>
      ) : null}

      {manifestationEntries.length > 0 ? (
        <section>
          <h2 className="font-display text-2xl font-medium tracking-tight text-fg md:text-3xl">
            Manifestations
          </h2>
          <div className="mt-8 space-y-8">
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
        </section>
      ) : null}
    </div>
  );
}
