"use client";

import * as Dialog from "@radix-ui/react-dialog";
import type { ReactNode } from "react";

export type ReaderDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  children: ReactNode;
  /** Stronger overlay for contents; subtler for live text preview. */
  overlay?: "subtle" | "strong";
  /** Optional test id on the dialog content. */
  contentTestId?: string;
  /** Max height of the sheet (CSS length). */
  maxHeight?: string;
};

/**
 * Accessible bottom drawer for reader controls / contents (Radix Dialog).
 * Focus trap, Escape, and restore-focus are handled by Radix.
 */
export function ReaderDrawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  overlay = "subtle",
  contentTestId,
  maxHeight = "min(85dvh, 40rem)",
}: ReaderDrawerProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={
            overlay === "strong"
              ? "reader-drawer-overlay reader-drawer-overlay--strong"
              : "reader-drawer-overlay reader-drawer-overlay--subtle"
          }
        />
        <Dialog.Content
          data-testid={contentTestId}
          className="reader-drawer-content"
          style={{
            maxHeight,
            paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))",
          }}
        >
          <div className="flex shrink-0 flex-col items-center pt-2.5 pb-1" aria-hidden>
            <div className="h-1 w-10 rounded-full bg-muted/50" />
          </div>

          <div className="flex shrink-0 items-start justify-between gap-3 px-4 pb-2 pt-1">
            <div className="min-w-0">
              <Dialog.Title className="font-display text-lg leading-tight text-fg">
                {title}
              </Dialog.Title>
              <Dialog.Description className="sr-only">{description}</Dialog.Description>
            </div>
            <Dialog.Close
              type="button"
              className="inline-flex h-11 min-w-11 shrink-0 items-center justify-center rounded-sm text-sm text-muted transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Close"
            >
              <span aria-hidden className="text-xl leading-none">
                ×
              </span>
            </Dialog.Close>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-2">
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
