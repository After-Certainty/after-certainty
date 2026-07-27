import { LinkifiedText } from "@/components/ui/linkified-text";
import type { Pattern } from "@/types/semanticGraph";

/**
 * Visible pattern narrative already present in YAML / JSON-LD hasPart —
 * keep summary first; render additional fields only when authored.
 */
export function ExplorePatternNarrative({ pattern }: { pattern: Pattern }) {
  const forces = pattern.forces?.filter(Boolean) ?? [];
  const hasBody =
    Boolean(pattern.setup?.trim()) ||
    Boolean(pattern.problem?.trim()) ||
    forces.length > 0 ||
    Boolean(pattern.observation?.trim()) ||
    Boolean(pattern.example?.trim());

  if (!hasBody) return null;

  return (
    <div className="mt-10 max-w-2xl space-y-8 text-base leading-[1.85] text-muted md:text-[17px]">
      {pattern.setup?.trim() ? (
        <section>
          <h2 className="font-display text-2xl font-medium tracking-tight text-fg md:text-3xl">
            Setup
          </h2>
          <p className="mt-4 whitespace-pre-wrap">
            <LinkifiedText text={pattern.setup} />
          </p>
        </section>
      ) : null}
      {pattern.problem?.trim() ? (
        <section>
          <h2 className="font-display text-2xl font-medium tracking-tight text-fg md:text-3xl">
            Problem
          </h2>
          <p className="mt-4 whitespace-pre-wrap">
            <LinkifiedText text={pattern.problem} />
          </p>
        </section>
      ) : null}
      {forces.length > 0 ? (
        <section>
          <h2 className="font-display text-2xl font-medium tracking-tight text-fg md:text-3xl">
            Forces
          </h2>
          <ul className="mt-4 space-y-3">
            {forces.map((force) => (
              <li key={force} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent/70" aria-hidden />
                <span>
                  <LinkifiedText text={force} />
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {pattern.observation?.trim() ? (
        <section>
          <h2 className="font-display text-2xl font-medium tracking-tight text-fg md:text-3xl">
            Observation
          </h2>
          <p className="mt-4 whitespace-pre-wrap">
            <LinkifiedText text={pattern.observation} />
          </p>
        </section>
      ) : null}
      {pattern.example?.trim() ? (
        <section>
          <h2 className="font-display text-2xl font-medium tracking-tight text-fg md:text-3xl">
            Example
          </h2>
          <p className="mt-4 whitespace-pre-wrap">
            <LinkifiedText text={pattern.example} />
          </p>
        </section>
      ) : null}
    </div>
  );
}
