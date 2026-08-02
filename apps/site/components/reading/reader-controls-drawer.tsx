"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useId, useState } from "react";

import { ChapterTocList } from "@/components/reading/chapter-toc";
import { InBookSearch } from "@/components/reading/in-book-search";
import { ReaderDrawer } from "@/components/reading/reader-drawer";
import type { ChapterReadingNavigation } from "@/lib/reading/chapter-navigation";
import { navigateToChapter } from "@/lib/reading/navigate-chapter";
import { clearReadingProgress } from "@/lib/reading/readingProgress";
import {
  clearReadingPreferences,
  DEFAULT_READING_PREFERENCES,
  getReadingPreferences,
  READING_LINE_HEIGHT_LABELS,
  READING_LINE_HEIGHTS,
  READING_TEXT_SIZE_LABELS,
  READING_TEXT_SIZES,
  READING_WIDTH_LABELS,
  READING_WIDTHS,
  setReadingLineHeight,
  setReadingTextSize,
  setReadingWidth,
  subscribeReadingPreferences,
  type ReadingLineHeight,
  type ReadingPreferences,
  type ReadingTextSize,
  type ReadingWidth,
} from "@/lib/reading/readingPreferences";

export type ReaderControlsTab = "text" | "contents" | "theme" | "settings";

export type ReaderControlsDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: ReaderControlsTab;
  bookTitle: string;
  bookHref: string;
  editionId: string;
  navigation?: ChapterReadingNavigation | null;
  chapterIndex?: number;
  chapterCount?: number;
  scrollPercent?: number;
};

const TABS: { id: ReaderControlsTab; label: string }[] = [
  { id: "text", label: "Text" },
  { id: "contents", label: "Contents" },
  { id: "theme", label: "Theme" },
  { id: "settings", label: "Settings" },
];

const SERVER_SNAPSHOT: ReadingPreferences = {
  ...DEFAULT_READING_PREFERENCES,
  updatedAt: new Date(0).toISOString(),
};

function useReadingPreferences(): ReadingPreferences {
  const [prefs, setPrefs] = useState<ReadingPreferences>(SERVER_SNAPSHOT);

  useEffect(() => {
    const sync = () => setPrefs(getReadingPreferences());
    sync();
    return subscribeReadingPreferences(sync);
  }, []);

  return prefs;
}

function SegmentedControl<T extends string>({
  label,
  value,
  options,
  labels,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  labels: Record<T, string>;
  onChange: (next: T) => void;
}) {
  const groupId = useId();
  return (
    <div role="group" aria-labelledby={groupId} className="space-y-2">
      <p id={groupId} className="text-[11px] uppercase tracking-[0.18em] text-muted">
        {label}
      </p>
      <div className="grid grid-cols-3 gap-1 rounded-sm border border-border/50 bg-bg/40 p-1">
        {options.map((option) => {
          const selected = option === value;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={selected}
              className={`min-h-11 rounded-sm px-2 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                selected
                  ? "bg-accent/20 text-accent"
                  : "text-muted hover:bg-bg-elevated hover:text-fg"
              }`}
              onClick={() => onChange(option)}
            >
              {labels[option]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TextPanel() {
  const prefs = useReadingPreferences();
  const sizeIndex = Math.max(0, READING_TEXT_SIZES.indexOf(prefs.textSize));

  return (
    <div className="space-y-6 pb-4" data-testid="reader-controls-text">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted">Text size</p>
          <p className="text-xs text-fg/80" aria-live="polite">
            {READING_TEXT_SIZE_LABELS[prefs.textSize]}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span aria-hidden className="text-xs text-muted">
            A
          </span>
          <input
            type="range"
            min={0}
            max={READING_TEXT_SIZES.length - 1}
            step={1}
            value={sizeIndex}
            aria-label="Text size"
            className="reader-range h-11 w-full"
            onChange={(event) => {
              const next = READING_TEXT_SIZES[Number(event.target.value)] as ReadingTextSize;
              setReadingTextSize(next);
            }}
          />
          <span aria-hidden className="text-lg text-muted">
            A
          </span>
        </div>
      </div>

      <SegmentedControl<ReadingLineHeight>
        label="Line height"
        value={prefs.lineHeight}
        options={READING_LINE_HEIGHTS}
        labels={READING_LINE_HEIGHT_LABELS}
        onChange={setReadingLineHeight}
      />

      <SegmentedControl<ReadingWidth>
        label="Reading width"
        value={prefs.readingWidth}
        options={READING_WIDTHS}
        labels={READING_WIDTH_LABELS}
        onChange={setReadingWidth}
      />
    </div>
  );
}

function ThemePanel() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Client-only: avoid SSR/client theme mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional post-hydration gate
    setMounted(true);
  }, []);

  const current = mounted ? (theme ?? "system") : "system";

  const options: { id: "system" | "light" | "dark"; label: string }[] = [
    { id: "system", label: "System" },
    { id: "light", label: "Light" },
    { id: "dark", label: "Dark" },
  ];

  return (
    <div className="space-y-4 pb-4" data-testid="reader-controls-theme">
      <p className="text-sm text-muted">
        Appearance follows the site theme so contrast tokens stay consistent.
      </p>
      <div
        role="group"
        aria-label="Theme"
        className="grid grid-cols-3 gap-1 rounded-sm border border-border/50 bg-bg/40 p-1"
      >
        {options.map((option) => {
          const selected = current === option.id;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={selected}
              disabled={!mounted}
              className={`min-h-11 rounded-sm px-2 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 ${
                selected
                  ? "bg-accent/20 text-accent"
                  : "text-muted hover:bg-bg-elevated hover:text-fg"
              }`}
              onClick={() => setTheme(option.id)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SettingsPanel({
  bookHref,
  editionId,
  bookTitle,
}: {
  bookHref: string;
  editionId: string;
  bookTitle: string;
}) {
  const [resetNote, setResetNote] = useState<string | null>(null);

  return (
    <div className="space-y-5 pb-4" data-testid="reader-controls-settings">
      <InBookSearch editionId={editionId} bookTitle={bookTitle} variant="readerCompact" />

      <div className="space-y-2">
        <button
          type="button"
          className="flex min-h-11 w-full items-center justify-between rounded-sm border border-border/50 px-3 text-left text-sm text-fg transition-colors hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          onClick={() => {
            clearReadingPreferences();
            setResetNote("Appearance reset on this device.");
          }}
        >
          Reset appearance
        </button>
        <button
          type="button"
          className="flex min-h-11 w-full items-center justify-between rounded-sm border border-border/50 px-3 text-left text-sm text-fg transition-colors hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          onClick={() => {
            clearReadingProgress(editionId);
            setResetNote("Saved position cleared for this book on this device.");
          }}
        >
          Reset saved position
        </button>
        {resetNote ? (
          <p className="text-xs text-muted" aria-live="polite">
            {resetNote}
          </p>
        ) : (
          <p className="text-xs text-muted">Preferences and position stay on this device only.</p>
        )}
      </div>

      <Link
        href={bookHref}
        className="flex min-h-11 w-full items-center justify-center rounded-sm border border-accent/40 bg-accent/10 px-3 text-sm text-accent transition-colors hover:bg-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        data-testid="reader-exit-settings"
      >
        Exit reader
      </Link>
    </div>
  );
}

function ChapterScrubber({
  navigation,
  chapterIndex,
  chapterCount,
  scrollPercent,
}: {
  navigation: ChapterReadingNavigation;
  chapterIndex?: number;
  chapterCount?: number;
  scrollPercent?: number;
}) {
  const count = chapterCount ?? navigation.chapters.length;
  const index =
    typeof chapterIndex === "number" && chapterIndex > 0
      ? chapterIndex
      : Math.max(
          1,
          navigation.chapters.findIndex((entry) => entry.id === navigation.current.id) + 1,
        );
  // Remount via key={current chapter} in parent when the chapter changes.
  const [draft, setDraft] = useState(index);

  if (count <= 1) return null;

  const percentLabel =
    typeof scrollPercent === "number" ? ` · ${scrollPercent}% through chapter` : "";

  const jumpToDraft = () => {
    const target = navigation.chapters[draft - 1];
    if (target && target.id !== navigation.current.id) {
      navigateToChapter(target.href);
    }
  };

  return (
    <div className="space-y-2 border-t border-border/30 pt-4" data-testid="reader-chapter-scrubber">
      <p className="text-xs text-muted">
        <span className="tabular-nums text-fg/85">
          {draft} / {count} chapters
        </span>
        {percentLabel}
      </p>
      <input
        type="range"
        min={1}
        max={count}
        step={1}
        value={draft}
        aria-label="Jump to chapter"
        className="reader-range h-11 w-full"
        onChange={(event) => setDraft(Number(event.target.value))}
        onMouseUp={jumpToDraft}
        onTouchEnd={jumpToDraft}
        onKeyUp={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            jumpToDraft();
          }
        }}
      />
    </div>
  );
}

/**
 * Unified reader bottom drawer: Text / Contents / Theme / Settings.
 */
export function ReaderControlsDrawer({
  open,
  onOpenChange,
  initialTab = "text",
  bookTitle,
  bookHref,
  editionId,
  navigation,
  chapterIndex,
  chapterCount,
  scrollPercent,
}: ReaderControlsDrawerProps) {
  // Parent remounts with key when opening so initialTab is applied fresh.
  const [tab, setTab] = useState<ReaderControlsTab>(initialTab);

  const title =
    tab === "contents"
      ? "Contents"
      : tab === "theme"
        ? "Theme"
        : tab === "settings"
          ? "Settings"
          : "Reading controls";

  return (
    <ReaderDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description="Adjust reading preferences, browse contents, or change theme."
      overlay={tab === "contents" ? "strong" : "subtle"}
      contentTestId="reader-controls-drawer"
      maxHeight={tab === "contents" ? "min(90dvh, 44rem)" : "min(85dvh, 40rem)"}
    >
      <div
        role="tablist"
        aria-label="Reader panels"
        className="mb-4 grid grid-cols-4 gap-1 rounded-sm border border-border/40 bg-bg/50 p-1"
      >
        {TABS.map((entry) => {
          const selected = tab === entry.id;
          return (
            <button
              key={entry.id}
              type="button"
              role="tab"
              aria-selected={selected}
              data-testid={`reader-tab-${entry.id}`}
              className={`min-h-11 rounded-sm px-1 text-[11px] uppercase tracking-[0.14em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                selected ? "bg-accent/20 text-accent" : "text-muted hover:text-fg"
              }`}
              onClick={() => setTab(entry.id)}
            >
              {entry.label}
            </button>
          );
        })}
      </div>

      <div role="tabpanel">
        {tab === "text" ? (
          <>
            <TextPanel />
            {navigation ? (
              <ChapterScrubber
                key={navigation.current.id}
                navigation={navigation}
                chapterIndex={chapterIndex}
                chapterCount={chapterCount}
                scrollPercent={scrollPercent}
              />
            ) : null}
          </>
        ) : null}
        {tab === "contents" ? (
          navigation && navigation.chapters.length > 1 ? (
            <nav aria-label="Table of contents" className="pb-4" data-testid="chapter-toc-drawer">
              <ChapterTocList
                navigation={navigation}
                compact
                showNumbers
                onNavigate={() => onOpenChange(false)}
              />
            </nav>
          ) : (
            <p className="pb-4 text-sm text-muted">This book has a single reading section.</p>
          )
        ) : null}
        {tab === "theme" ? <ThemePanel /> : null}
        {tab === "settings" ? (
          <SettingsPanel bookHref={bookHref} editionId={editionId} bookTitle={bookTitle} />
        ) : null}
      </div>
    </ReaderDrawer>
  );
}
