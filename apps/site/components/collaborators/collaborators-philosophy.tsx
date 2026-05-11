import { SectionWrapper } from "@/components/collaborators/section-wrapper";

export function CollaboratorsPhilosophy() {
  return (
    <SectionWrapper as="section" prose className="py-20 md:py-28">
      <h2 className="font-display text-3xl tracking-tight text-fg md:text-4xl">Why Collaboration?</h2>
      <div className="mt-10 space-y-6 text-[17px] leading-[1.75] text-muted md:text-lg">
        <p>Complex human systems cannot be understood from a single perspective.</p>
        <p>
          The project exists to support conversations across disciplines, experiences, institutions, professions, and ways of
          thinking.
        </p>
        <p>
          Collaboration is not about producing agreement.
          <br />
          It is about creating better shared understanding.
        </p>
      </div>
    </SectionWrapper>
  );
}
