import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

export default function NotFound() {
  return (
    <Section className="pt-32 pb-40">
      <Container className="max-w-xl text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-muted">404</p>
        <h1 className="mt-6 font-display text-4xl text-fg">This page is not in the manuscript.</h1>
        <p className="mt-4 text-muted">The route may have moved or not yet been published.</p>
        <Link
          className="mt-10 inline-flex border border-border/80 px-6 py-3 text-sm uppercase tracking-[0.2em] text-fg transition-colors hover:border-accent/50"
          href="/"
        >
          Return home
        </Link>
      </Container>
    </Section>
  );
}
