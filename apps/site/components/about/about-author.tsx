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
              <p>
                Kevin Steffensen writes about leadership, meaning, communication, trust, and the
                everyday structures that shape how people decide together.
              </p>
              <p>
                His work pays attention to patterns that keep showing up across organizations,
                institutions, relationships, and technology—especially when confident answers start
                to feel thinner than the situations they are meant to cover.
              </p>
              <p>
                After Certainty grew from a practical question: how do we keep thinking carefully
                with one another when complexity, disagreement, and speed make certainty hard to
                trust—and inaction still isn’t an option?
              </p>
            </AuthorProfile>
          </div>
        </div>
      </Container>
    </section>
  );
}
