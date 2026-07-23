import type { HTMLAttributes, ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/cn";

export type SectionWrapperProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  /** Narrow inner column for editorial prose */
  prose?: boolean;
  as?: "section" | "div";
};

export function SectionWrapper({
  children,
  className,
  prose = false,
  as: Tag = "section",
  ...rest
}: SectionWrapperProps) {
  return (
    <Tag className={cn(className)} {...rest}>
      <Container>{prose ? <div className="mx-auto max-w-2xl">{children}</div> : children}</Container>
    </Tag>
  );
}
