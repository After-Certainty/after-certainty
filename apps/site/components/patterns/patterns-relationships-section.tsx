import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

export function PatternsRelationshipsSection() {
  return (
    <Section atmosphere="transition" className="border-b border-border/35 py-20 md:py-28">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl font-medium tracking-tight text-fg md:text-3xl">Patterns across books</h2>
          <p className="mt-6 text-base leading-[1.85] text-muted md:text-[17px]">
            The same structures often reappear across different domains, scales, and conversations. Patterns travel
            through leadership, communication, institutions, relationships, systems, and meaning-making in different
            forms.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-3xl gap-8 md:grid-cols-3 md:gap-6">
          {["Leadership", "Institutions", "Meaning"].map((label) => (
            <div
              key={label}
              className="relative border border-border/35 bg-bg-elevated/[0.06] px-6 py-8 text-center before:pointer-events-none before:absolute before:inset-0 before:opacity-[0.04] before:bg-texture-topology before:bg-cover before:bg-center"
            >
              <p className="relative text-sm font-medium uppercase tracking-[0.2em] text-muted">{label}</p>
              <div className="relative mx-auto mt-6 h-px w-12 bg-gradient-to-r from-transparent via-accent/35 to-transparent" aria-hidden />
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
