import { Container } from "@/components/ui/container";

export default function ListenLoading() {
  return (
    <div className="animate-pulse motion-reduce:animate-none">
      <div className="min-h-[min(28vh,240px)] border-b border-border/45 bg-bg-elevated/20 md:min-h-[min(42vh,480px)]" />
      <Container className="max-w-6xl py-8 md:py-16">
        <div className="h-11 max-w-md rounded-sm bg-border/35" />
        <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-4 border-b border-border/20 pb-10">
              <div className="h-8 max-w-xs rounded bg-border/35" />
              <div className="h-16 max-w-lg rounded bg-border/25" />
              <div className="h-[140px] rounded-lg bg-border/30" />
              <div className="h-11 max-w-[12rem] rounded-sm bg-border/30" />
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
