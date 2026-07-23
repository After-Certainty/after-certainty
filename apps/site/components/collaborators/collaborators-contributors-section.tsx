import type { Contributor } from "@/types/content";
import { ContributorCard } from "@/components/collaborators/contributor-card";
import { SectionWrapper } from "@/components/collaborators/section-wrapper";

const reservedSlots = [
  {
    name: "Further voices",
    role: "Essays, recordings, editorial",
    bio: "Room for essayists, podcast guests, editors, and others as their work surfaces in the commons.",
    placeholder: true as const,
  },
  {
    name: "Technical collaborators",
    role: "Infrastructure & tooling",
    bio: "Space for people extending metadata, site mechanics, and publishing workflows in public.",
    placeholder: true as const,
  },
] as const;

export function CollaboratorsContributorsSection({ contributors }: { contributors: Contributor[] }) {
  return (
    <SectionWrapper className="border-t border-border/25 py-20 md:py-28">
      <div className="mx-auto max-w-2xl text-center md:text-left">
        <h2 className="font-display text-3xl tracking-tight text-fg md:text-4xl">Current &amp; future contributors</h2>
        <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-muted md:mx-0">
          A thin roster today—enough to anchor the project—with room to grow as publications and collaborations mature.
        </p>
      </div>
      <div className="mt-14 grid gap-6 md:grid-cols-2">
        {contributors.map((person) => (
          <ContributorCard
            key={person.slug}
            name={person.name}
            role={person.role}
            bio={person.bio}
            links={person.links}
          />
        ))}
        {reservedSlots.map((slot) => (
          <ContributorCard
            key={slot.name}
            name={slot.name}
            role={slot.role}
            bio={slot.bio}
            placeholder={slot.placeholder}
          />
        ))}
      </div>
    </SectionWrapper>
  );
}
