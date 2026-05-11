import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button-link";
import { siteConfig } from "@/lib/site-config";

export function BooksOpenPublishing() {
  return (
    <Section atmosphere="transition" className="border-b border-border/35 bg-bg/[0.07] py-20 md:py-28">
      <Container className="max-w-3xl">
        <h2 className="font-display text-3xl font-medium tracking-tight text-fg md:text-4xl">Open publishing</h2>
        <div className="mt-8 space-y-6 text-base leading-relaxed text-muted md:text-lg">
          <p>
            The books are published openly using a GitHub-first workflow and Creative Commons licensing. The goal is not
            only to publish finished work, but to support evolving conversations, collaboration, critique, extension,
            and shared exploration.
          </p>
          <p className="text-fg/85">
            You are invited to read closely, fork thoughtfully, and respond where your judgment diverges — dissent is
            part of the commons.
          </p>
        </div>
        <p className="mt-8 text-sm text-muted">
          Licensed{" "}
          <a className="text-accent underline-offset-4 hover:underline" href={siteConfig.license.url}>
            {siteConfig.license.name}
          </a>
          — attribute remixes; extend with care.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
          <ButtonLink href={siteConfig.githubUrl} variant="primary" target="_blank" rel="noopener noreferrer">
            Explore on GitHub
          </ButtonLink>
          <Link
            href="/collaborators"
            className="text-xs uppercase tracking-[0.22em] text-accent underline-offset-4 transition-colors hover:text-fg hover:underline"
          >
            Collaboration →
          </Link>
        </div>
      </Container>
    </Section>
  );
}
