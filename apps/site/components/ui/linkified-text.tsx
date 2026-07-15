import { Fragment } from "react";

import { splitTextWithUrls } from "@/lib/text/linkifyUrls";

const LINK_CLASS = "text-accent underline-offset-4 transition-colors hover:text-fg hover:underline";

type LinkifiedTextProps = {
  text: string;
};

/**
 * Renders plain text with http(s) URLs as external links.
 * Safe for Server Components; no client hooks.
 */
export function LinkifiedText({ text }: LinkifiedTextProps) {
  const segments = splitTextWithUrls(text);

  if (segments.length === 1 && segments[0]?.type === "text") {
    return segments[0].value;
  }

  return (
    <>
      {segments.map((segment, index) => {
        if (segment.type === "text") {
          return <Fragment key={`t-${index}`}>{segment.value}</Fragment>;
        }
        return (
          <a
            key={`u-${index}`}
            href={segment.href}
            target="_blank"
            rel="noopener noreferrer"
            className={LINK_CLASS}
          >
            {segment.value}
          </a>
        );
      })}
    </>
  );
}
