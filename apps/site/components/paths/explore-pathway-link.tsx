import Link from "next/link";

import { TrackedLink } from "@/components/analytics/tracked-link";
import { AnalyticsEvents } from "@/lib/analytics/events";
import { exploreObservatoryPathwayHref, type ExplorePathwayKind } from "@/lib/graph/explorePaths";

type ExplorePathwayLinkProps = {
  kind: ExplorePathwayKind;
  slug: string;
  label?: string;
  analyticsEvent:
    | typeof AnalyticsEvents.questionObservatoryPathway
    | typeof AnalyticsEvents.trailObservatoryPathway;
  analyticsId: string;
  className?: string;
};

export function ExplorePathwayLink({
  kind,
  slug,
  label = "Walk this path in the Observatory",
  analyticsEvent,
  analyticsId,
  className = "text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
}: ExplorePathwayLinkProps) {
  const href = exploreObservatoryPathwayHref({ kind, slug });

  return (
    <TrackedLink
      href={href}
      className={className}
      analytics={{
        event: analyticsEvent,
        params: kind === "question" ? { question_id: analyticsId } : { trail_id: analyticsId },
      }}
    >
      {label}
    </TrackedLink>
  );
}

type ExplorePathwayReturnLinkProps = {
  href: string;
  title: string;
};

export function ExplorePathwayReturnLink({ href, title }: ExplorePathwayReturnLinkProps) {
  return (
    <Link href={href} className="text-accent underline-offset-4 hover:underline">
      Return to {title}
    </Link>
  );
}
