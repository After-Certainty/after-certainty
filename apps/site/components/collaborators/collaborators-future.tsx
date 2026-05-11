import { AtmosphericSection } from "@/components/collaborators/atmospheric-section";
import { Container } from "@/components/ui/container";

export function CollaboratorsFuture() {
  return (
    <AtmosphericSection id="future-conversations" variant="subtle" as="section" className="border-t border-border/25">
      <Container className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-display text-3xl tracking-tight text-fg md:text-4xl">Future Conversations</h2>
          <p className="mt-8 text-[17px] leading-[1.75] text-muted md:text-lg">
            The project may eventually expand into more active collaborative spaces, including Discord-based conversations,
            reading groups, podcast discussions, and shared exploration across disciplines.
          </p>
          <p className="mt-6 text-[15px] leading-relaxed text-muted/90">
            Nothing here is promised on a timeline—the aim is to let formats emerge when they genuinely serve inquiry,
            not to optimize for visibility or growth.
          </p>
        </div>
      </Container>
    </AtmosphericSection>
  );
}
