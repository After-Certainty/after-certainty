import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import type { OngoingWork } from "@/types/content";

function kindLabel(kind?: OngoingWork["kind"]): string {
  switch (kind) {
    case "manuscript":
      return "Manuscript";
    case "collaborative":
      return "Collaborative";
    case "conversation":
      return "Conversation";
    case "essay_cycle":
      return "Essays";
    default:
      return "Project";
  }
}

function statusLabel(status: OngoingWork["status"]): string {
  switch (status) {
    case "in_progress":
      return "In progress";
    case "collaborative":
      return "Collaborative";
    case "series":
      return "Series";
    case "forthcoming":
      return "Forthcoming";
    case "draft":
      return "Draft";
    default:
      return status;
  }
}

export function BooksOngoing({ works }: { works: OngoingWork[] }) {
  if (works.length === 0) return null;

  return (
    <Section atmosphere="none" className="border-b border-border/35 bg-bg py-20 md:py-28">
      <Container>
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-medium tracking-tight text-fg md:text-4xl">Ongoing work</h2>
          <p className="mt-5 text-muted">
            Lines of inquiry that move alongside the catalog — lighter shells, exploratory framing.
          </p>
        </div>
        <ul className="mt-14 grid gap-5 md:grid-cols-2">
          {works.map((w) => (
            <li
              key={w.id}
              className="border border-border/40 bg-bg-elevated/12 px-6 py-7 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)]"
            >
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-[10px] uppercase tracking-[0.26em] text-accent/85">{kindLabel(w.kind)}</span>
                <span className="text-[10px] uppercase tracking-[0.22em] text-muted">{statusLabel(w.status)}</span>
              </div>
              <h3 className="mt-4 font-display text-xl font-medium text-fg">{w.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{w.description}</p>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
