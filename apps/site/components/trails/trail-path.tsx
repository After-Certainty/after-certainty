import { TrailPathStop } from "@/components/trails/trail-path-stop";
import type { EnrichedPathStop } from "@/types/paths";

type TrailPathProps = {
  stops: EnrichedPathStop[];
  trailId: string;
};

export function TrailPath({ stops, trailId }: TrailPathProps) {
  const totalStops = stops.length;

  return (
    <ol className="mt-10 list-none space-y-5 p-0">
      {stops.map((stop, index) => (
        <TrailPathStop
          key={`${stop.position}-${stop.resolvedEntityId}`}
          stop={stop}
          trailId={trailId}
          stopIndex={index + 1}
          totalStops={totalStops}
        />
      ))}
    </ol>
  );
}
