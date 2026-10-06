"use client";

import type { HTMLAttributes } from "react";
import {
  corpusDestination,
  trackVercelIntent,
  type CorpusType,
  type CorpusRelation,
} from "@/lib/analytics/vercel-intent";

type Props = HTMLAttributes<HTMLElement> & {
  as?: "div" | "ul" | "section";
  fromType?: CorpusType;
  relation?: CorpusRelation;
};

/** Replaces an existing container only around curated transitions; children stay server-rendered. */
export function CorpusNavigationRegion({
  as: Tag = "div",
  fromType,
  relation = "related",
  onClickCapture,
  ...props
}: Props) {
  return (
    <Tag
      {...props}
      onClickCapture={(event) => {
        onClickCapture?.(event);
        if (!fromType || event.defaultPrevented || !(event.target instanceof Element)) return;
        const link = event.target.closest("a[href]");
        if (!link || !event.currentTarget.contains(link) || link.hasAttribute("download")) return;
        const toType = corpusDestination(link.getAttribute("href") ?? "");
        if (!toType || (relation === "read" && toType !== "chapter")) return;
        trackVercelIntent({
          name: "corpus_navigation",
          properties: { from_type: fromType, to_type: toType, relation },
        });
      }}
    />
  );
}
