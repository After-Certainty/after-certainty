import type { Icon } from "@/components/icons/approved";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowSquareOutIcon,
  BinocularsIcon,
  BookOpenIcon,
  CompassIcon,
  DownloadSimpleIcon,
  ScalesIcon,
  StorefrontIcon,
  TargetIcon,
  WarningCircleIcon,
} from "@/components/icons/approved";

/** Pattern At-a-glance slots — wire when PatternAtAGlance lands (Patterns mobile Phase 3). */
export const patternGlanceIcons = {
  whatItDoes: CompassIcon,
  whyItMatters: TargetIcon,
  keyRisk: WarningCircleIcon,
  counterbalance: ScalesIcon,
} as const satisfies Record<string, Icon>;

export type PatternGlanceSlot = keyof typeof patternGlanceIcons;

/** Book overview action kinds that may show a leading icon. */
export const bookActionIcons = {
  read: BookOpenIcon,
  download: DownloadSimpleIcon,
  purchase: StorefrontIcon,
} as const satisfies Record<"read" | "download" | "purchase", Icon>;

export type BookActionIconKind = keyof typeof bookActionIcons;

export function bookActionIconForKind(kind: string): Icon | null {
  if (kind === "read" || kind === "download" || kind === "purchase") {
    return bookActionIcons[kind];
  }
  return null;
}

/** Incoming / outgoing dynamics direction. */
export const dynamicsDirectionIcons = {
  incoming: ArrowLeftIcon,
  outgoing: ArrowRightIcon,
} as const;

/** In-app Observatory CTA (not an external new-tab affordance). */
export const observatoryIcon = BinocularsIcon;

/** External / new-tab navigation only. */
export const externalLinkIcon = ArrowSquareOutIcon;
