import { Container } from "@/components/ui/container";

export default function ListenLoading() {
  return (
    <div className="animate-pulse motion-reduce:animate-none">
      <div className="min-h-[min(28vh,240px)] border-b border-border/45 bg-bg-elevated/20 md:min-h-[min(42vh,480px)]" />
      <Container className="max-w-6xl py-8 md:py-16">
        <div className="h-11 max-w-md rounded-sm bg-border/35" />
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,24rem)] lg:items-start">
          <div className="order-2 space-y-6 lg:order-1">
            <div className="h-6 max-w-[6rem] rounded bg-border/30" />
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="space-y-3 border-b border-border/20 pb-6">
                <div className="h-7 max-w-xs rounded bg-border/35" />
                <div className="h-12 max-w-lg rounded bg-border/25" />
                <div className="h-11 max-w-[8rem] rounded-sm bg-border/30" />
              </div>
            ))}
          </div>
          <div className="order-1 space-y-3 rounded-sm border border-border/30 p-4 lg:order-2">
            <div className="h-3 max-w-[5rem] rounded bg-border/30" />
            <div className="h-7 max-w-sm rounded bg-border/35" />
            <div className="h-[140px] rounded-lg bg-border/30" />
            <div className="flex gap-2">
              <div className="h-11 w-24 rounded-sm bg-border/30" />
              <div className="h-11 w-24 rounded-sm bg-border/30" />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
