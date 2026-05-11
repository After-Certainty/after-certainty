import { AuthorProfile } from "@/components/about/author-profile";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/lib/site-config";

const AUTHOR_LINKS = [
  { label: "Podcast", href: "/podcast" },
  { label: "GitHub", href: siteConfig.githubUrl },
  { label: "Medium", href: "https://medium.com/@steffensen.kevin" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/ksteffe/" },
] as const;

export function AboutAuthor() {
  return (
    <section className="border-t border-border/25 py-20 md:py-28">
      <Container>
        <div className="mx-auto max-w-4xl">
          <h2 className="font-display text-3xl tracking-tight text-fg md:text-4xl">About the Author</h2>
          <div className="mt-12">
            <AuthorProfile name="Kevin Steffensen" links={[...AUTHOR_LINKS]}>
              <p>Kevin Steffensen writes about leadership, meaning, communication, trust, authority, systems, and interpretation.</p>
              <p>
                His work focuses on recurring structures that emerge across organizations, institutions, relationships,
                technology, and collective human coordination.
              </p>
              <p>
                The project grew from an interest in how people continue building shared understanding under conditions of
                complexity, disagreement, uncertainty, and scale.
              </p>
            </AuthorProfile>
          </div>
        </div>
      </Container>
    </section>
  );
}
