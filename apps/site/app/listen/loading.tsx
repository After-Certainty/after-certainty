import { Container } from "@/components/ui/container";

export default function ListenLoading() {
  return (
    <div className="animate-pulse motion-reduce:animate-none">
      <div className="min-h-[min(28vh,240px)] border-b border-border/45 bg-bg-elevated/20 md:min-h-[min(28vh,320px)]" />
      <Container className="max-w-6xl py-4 md:py-8">
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(22rem,25rem)] lg:items-start lg:gap-6">
          <div className="order-2 space-y-4 lg:order-1 lg:space-y-5">
            <div className="h-11 max-w-md rounded-sm bg-border/35" />
            <div className="h-6 max-w-[6rem] rounded bg-border/30" />
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col gap-3 border-b border-border/20 pb-5 lg:flex-row lg:items-start lg:gap-4 lg:pb-5">
                <div className="order-1 min-w-0 flex-1 space-y-2 lg:order-2">
                  <div className="h-7 max-w-xs rounded bg-border/35" />
                  <div className="h-10 max-w-lg rounded bg-border/25" />
                </div>
                <div className="order-2 flex gap-3 lg:contents">
                  <div className="h-11 w-20 shrink-0 rounded-sm bg-border/30 lg:order-1" />
                  <div className="h-5 w-16 shrink-0 rounded bg-border/25 lg:order-3 lg:mt-2" />
                </div>
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
