import { Container } from "@/components/ui/container";

export default function PodcastLoading() {
  return (
    <div className="animate-pulse">
      <div className="min-h-[min(52vh,560px)] border-b border-border/40 bg-bg-elevated/20" />
      <Container className="max-w-4xl py-16 md:py-24">
        <div className="h-4 w-24 rounded bg-border/40" />
        <div className="mt-8 h-10 max-w-lg rounded bg-border/35" />
        <div className="mt-6 h-24 max-w-2xl rounded bg-border/25" />
        <div className="mt-12 h-10 max-w-xl rounded bg-border/30" />
      </Container>
      <Container className="max-w-3xl py-12 md:py-16">
        <div className="h-4 w-32 rounded bg-border/35" />
        <div className="mt-6 space-y-8 border-t border-border/25 pt-10">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-4 border-b border-border/20 pb-10">
              <div className="h-3 w-40 rounded bg-border/30" />
              <div className="h-7 max-w-md rounded bg-border/35" />
              <div className="h-16 max-w-2xl rounded bg-border/25" />
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
