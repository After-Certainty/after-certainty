import type { MDXComponents } from "mdx/types";
import type { ImgHTMLAttributes } from "react";

import { isSafeHref } from "@/lib/security/urls";

const components = {
  h1: ({ children }) => (
    <h1 className="font-display text-4xl font-medium tracking-tight text-fg md:text-5xl">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="font-display mt-12 text-3xl font-medium tracking-tight text-fg first:mt-0 md:text-4xl">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-10 font-display text-2xl font-medium text-fg">{children}</h3>
  ),
  p: ({ children }) => <p className="mt-6 text-lg leading-relaxed text-muted">{children}</p>,
  a: ({ children, href }) => {
    if (!isSafeHref(href)) {
      return <span className="text-accent">{children}</span>;
    }
    return (
      <a
        className="text-accent underline decoration-accent/40 underline-offset-4 transition-colors hover:decoration-accent"
        href={href}
      >
        {children}
      </a>
    );
  },
  ul: ({ children }) => (
    <ul className="mt-6 list-disc space-y-2 pl-6 text-lg text-muted">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-6 list-decimal space-y-2 pl-6 text-lg text-muted">{children}</ol>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-8 border-l-2 border-accent/60 pl-6 font-display text-xl italic text-fg/90">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-12 border-border/80" />,
  table: ({ children }) => (
    <div className="my-8 overflow-x-auto rounded-sm border border-border/60">
      <table className="w-full border-collapse text-left text-sm text-muted">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-bg-elevated/80 text-xs uppercase tracking-[0.15em] text-fg">
      {children}
    </thead>
  ),
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr className="border-t border-border/50">{children}</tr>,
  th: ({ children }) => <th className="px-4 py-3 font-medium">{children}</th>,
  td: ({ children }) => <td className="px-4 py-3">{children}</td>,
  img: (props: ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element -- MDX content may omit dimensions required by next/image
    <img
      className="my-8 h-auto max-w-full rounded-sm border border-border/60"
      {...props}
      alt={props.alt ?? ""}
    />
  ),
} satisfies MDXComponents;

export function useMDXComponents(): MDXComponents {
  return components;
}
