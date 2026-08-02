"use client";

import { useState } from "react";

import {
  ReaderControlsDrawer,
  type ReaderControlsTab,
} from "@/components/reading/reader-controls-drawer";
import { ReaderToolbar } from "@/components/reading/reader-toolbar";
import type { ChapterReadingNavigation } from "@/lib/reading/chapter-navigation";

export type ReaderChromeProps = {
  bookTitle: string;
  bookHref: string;
  chapterTitle: string;
  editionId: string;
  chapterId: string;
  chapterIndex?: number;
  chapterCount?: number;
  navigation?: ChapterReadingNavigation | null;
};

/**
 * Client chrome for the native reader: sticky toolbar + Radix controls drawer.
 */
export function ReaderChrome({
  bookTitle,
  bookHref,
  chapterTitle,
  editionId,
  chapterId,
  chapterIndex,
  chapterCount,
  navigation,
}: ReaderChromeProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<ReaderControlsTab>("text");

  const openControls = (nextTab: ReaderControlsTab = "text") => {
    setTab(nextTab);
    setOpen(true);
  };

  return (
    <>
      <ReaderToolbar
        bookTitle={bookTitle}
        bookHref={bookHref}
        chapterTitle={chapterTitle}
        editionId={editionId}
        chapterId={chapterId}
        chapterIndex={chapterIndex}
        chapterCount={chapterCount}
        onOpenControls={openControls}
      />
      <ReaderControlsDrawer
        key={open ? `open-${tab}` : "closed"}
        open={open}
        onOpenChange={setOpen}
        initialTab={tab}
        bookTitle={bookTitle}
        bookHref={bookHref}
        editionId={editionId}
        navigation={navigation}
        chapterIndex={chapterIndex}
        chapterCount={chapterCount}
      />
    </>
  );
}
