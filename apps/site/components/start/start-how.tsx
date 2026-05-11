import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button-link";
import { siteConfig } from "@/lib/site-config";

const principles = [
  "Books and essays are openly published and revised in public where possible.",
  "Workflow is GitHub-first: traceability, forks, and contribution paths stay visible.",
  "Licensing defaults to CC BY-SA so ideas can travel and improve responsibly.",
  "Collaboration is welcomed through discussions, patterns, and careful critique.",
  "What you read here is part of ongoing conversations — not a sealed canon.",
];

export function StartHow() {
  return (
    <Section atmosphere="none" className="border-b border-border/35 bg-bg py-24 md:py-32">
      <Container>
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl font-medium tracking-tight text-fg md:text-4xl">How the project works</h2>
            <div className="mt-8 space-y-6 text-base leading-relaxed text-muted md:text-lg">
              <p>
                The project is intentionally designed to remain open, extensible, and collaborative. The goal is not to
                create final answers, but better conversations.
              </p>
              <p className="text-fg/90">
                Ideas here are treated as living — offered with humility, open to revision, and meant to be engaged
                thoughtfully rather than consumed quickly.
              </p>
            </div>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <ButtonLink href={siteConfig.githubUrl} variant="primary" target="_blank" rel="noopener noreferrer">
                View on GitHub
              </ButtonLink>
              <Link
                href="/collaborators"
                className="text-xs uppercase tracking-[0.22em] text-accent underline-offset-4 transition-colors hover:text-fg hover:underline"
              >
                Learn about collaboration →
              </Link>
            </div>
          </div>
          <div>
            <ul className="space-y-0 rounded-sm border border-border/50 bg-bg-elevated/20 p-2 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]">
              {principles.map((line) => (
                <li
                  key={line}
                  className="flex gap-3 border-b border-border/35 px-5 py-4 text-sm leading-relaxed text-muted last:border-b-0 md:text-base"
                >
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent/70" aria-hidden />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </Section>
  );
}
