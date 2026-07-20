"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Suspense,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";

import { SearchPagination } from "@/components/search/search-pagination";
import { SearchResultItem } from "@/components/search/search-result-item";
import { SearchTypeFilters } from "@/components/search/search-type-filters";
import { useSearchIndex } from "@/components/search/use-search-index";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import {
  trackSearchNoResults,
  trackSearchQuery,
  trackSearchRefine,
  trackSearchSelect,
} from "@/lib/analytics/track";
import { SearchCuratedQuestions } from "@/components/search/search-curated-questions";
import type { EnrichedQuestion, QuestionSearchBridge } from "@/types/questions";
import { paginateExploreIndexItems } from "@/lib/explore/explore-index-browse";
import { searchWithIndex, type SearchHit } from "@/lib/search/query";
import type { SearchEntityType } from "@/lib/search/types";
import {
  parseSearchUrlState,
  queryLengthBucket,
  rankBucket,
  resultCountBucket,
  SEARCH_PAGE_SIZE,
  searchBrowseQueryString,
} from "@/lib/search/urlState";

const QUERY_DEBOUNCE_MS = 250;

type GlobalSearchPageProps = {
  initialQuery?: string;
  initialType?: string;
  initialPage?: string;
  curatedQuestions?: EnrichedQuestion[];
  questionSearchBridges?: QuestionSearchBridge[];
};

function GlobalSearchPageInner({
  initialQuery = "",
  initialType = "",
  initialPage = "",
  curatedQuestions = [],
  questionSearchBridges = [],
}: GlobalSearchPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputId = useId();
  const listId = useId();
  const statusId = useId();
  const indexState = useSearchIndex();

  const urlState = parseSearchUrlState({
    q: searchParams.get("q") ?? initialQuery,
    type: searchParams.get("type") ?? initialType,
    page: searchParams.get("page") ?? initialPage,
  });

  const [query, setQuery] = useState(urlState.q);
  const [syncedUrlQ, setSyncedUrlQ] = useState(urlState.q);
  const [activeIndex, setActiveIndex] = useState(-1);
  const lastTrackedQuery = useRef<string>("");
  const lastTrackedTypes = useRef<string>("");

  if (urlState.q !== syncedUrlQ) {
    setSyncedUrlQ(urlState.q);
    if (query.trim() === urlState.q || query.trim() === syncedUrlQ) {
      setQuery(urlState.q);
    }
  }

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const nextQ = query.trim();
      if (nextQ === urlState.q) return;
      const qs = searchBrowseQueryString({
        q: nextQ,
        types: urlState.types,
        page: 1,
      });
      router.replace(`/search${qs}`, { scroll: false });
    }, QUERY_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [query, router, urlState.q, urlState.types]);

  const hits: SearchHit[] = useMemo(() => {
    if (indexState.status !== "ready" || !urlState.q) return [];
    return searchWithIndex(indexState.engine, urlState.q, {
      limit: 200,
      entityTypes: urlState.types.length > 0 ? urlState.types : undefined,
      aliasConfig: indexState.payload.aliasConfig,
    });
  }, [indexState, urlState.q, urlState.types]);

  const pageSlice = useMemo(
    () => paginateExploreIndexItems(hits, urlState.page, SEARCH_PAGE_SIZE),
    [hits, urlState.page],
  );

  useEffect(() => {
    if (indexState.status !== "ready") return;
    const q = urlState.q;
    if (!q) return;
    const key = `${q}::${urlState.types.join(",")}`;
    if (lastTrackedQuery.current === key) return;
    lastTrackedQuery.current = key;

    trackSearchQuery({
      surface: "full",
      has_results: hits.length > 0,
      result_count_bucket: resultCountBucket(hits.length),
      query_length_bucket: queryLengthBucket(q),
    });
    if (hits.length === 0) {
      trackSearchNoResults({
        surface: "full",
        query_length_bucket: queryLengthBucket(q),
      });
    }
  }, [indexState.status, urlState.q, urlState.types, hits.length]);

  useEffect(() => {
    const key = urlState.types.join(",");
    if (lastTrackedTypes.current === "") {
      lastTrackedTypes.current = key;
      return;
    }
    if (lastTrackedTypes.current === key) return;
    lastTrackedTypes.current = key;
    trackSearchRefine({ surface: "full" });
  }, [urlState.types]);

  function replaceState(next: { q?: string; types?: SearchEntityType[]; page?: number }) {
    const qs = searchBrowseQueryString({
      q: next.q ?? urlState.q,
      types: next.types ?? urlState.types,
      page: next.page ?? 1,
    });
    router.replace(`/search${qs}`, { scroll: false });
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    replaceState({ q: query.trim(), page: 1 });
  }

  function onTypesChange(types: SearchEntityType[]) {
    replaceState({ types, page: 1 });
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (pageSlice.items.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % pageSlice.items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? pageSlice.items.length - 1 : i - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      const hit = pageSlice.items[activeIndex];
      if (!hit) return;
      e.preventDefault();
      trackSearchSelect({
        content_type: hit.document.entityType,
        item_id: hit.document.id,
        surface: "full",
        rank_bucket: rankBucket(pageSlice.startIndex + activeIndex + 1),
      });
      if (hit.document.external) {
        window.open(hit.document.canonicalUrl, "_blank", "noopener,noreferrer");
      } else {
        router.push(hit.document.canonicalUrl);
      }
    } else if (e.key === "Escape") {
      setActiveIndex(-1);
    }
  }

  const statusMessage =
    indexState.status === "loading"
      ? "Loading search index…"
      : indexState.status === "error"
        ? indexState.message
        : !urlState.q
          ? "Enter a query to search the commons."
          : hits.length === 0
            ? "No results."
            : `${hits.length} result${hits.length === 1 ? "" : "s"}`;

  return (
    <Section className="pb-24 pt-16">
      <Container className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.25em] text-muted">Discover</p>
        <h1 className="mt-4 font-display text-4xl text-fg md:text-5xl">Search</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
          Find books, concepts, patterns, thinkers, sources, and podcast episodes across After
          Certainty — without already knowing which section holds the answer.
        </p>

        <form className="mt-10" role="search" onSubmit={onSubmit}>
          <label htmlFor={inputId} className="text-[10px] uppercase tracking-[0.28em] text-muted">
            Search the commons
          </label>
          <input
            id={inputId}
            type="search"
            value={query}
            placeholder="Try accountability, Rebecca Solnit, temporary rules…"
            autoComplete="off"
            autoFocus
            aria-controls={listId}
            aria-describedby={statusId}
            className="mt-2 w-full rounded-sm border border-border/80 bg-bg-elevated px-4 py-3 text-sm text-fg placeholder:text-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(-1);
            }}
            onKeyDown={onKeyDown}
          />
        </form>

        <div className="mt-8">
          <SearchTypeFilters selected={urlState.types} onChange={onTypesChange} />
        </div>

        <p id={statusId} className="mt-8 text-sm text-muted" aria-live="polite">
          {statusMessage}
        </p>

        {indexState.status === "error" ? (
          <div className="mt-8 rounded-sm border border-border/80 px-4 py-5">
            <p className="text-sm text-fg">Search could not load right now.</p>
            <p className="mt-2 text-sm text-muted">
              You can browse{" "}
              <Link href="/explore" className="text-accent underline-offset-4 hover:underline">
                Explore
              </Link>{" "}
              or{" "}
              <Link href="/start" className="text-accent underline-offset-4 hover:underline">
                Start Here
              </Link>{" "}
              meanwhile.
            </p>
            <button
              type="button"
              className="mt-4 min-h-11 rounded-sm border border-border/80 px-4 py-2 text-xs uppercase tracking-[0.2em] text-fg hover:border-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        ) : null}

        {indexState.status === "ready" && !urlState.q ? (
          <div className="mt-10 space-y-3 text-sm text-muted">
            <p>Suggestions to begin:</p>
            <ul className="flex flex-wrap gap-2">
              {["certainty", "accountability", "Trust Beyond Similarity", "temporary rules"].map(
                (sample) => (
                  <li key={sample}>
                    <Link
                      href={`/search${searchBrowseQueryString({ q: sample })}`}
                      className="inline-flex min-h-11 items-center rounded-sm border border-border/70 px-3 py-2 text-xs uppercase tracking-[0.16em] text-fg transition-colors hover:border-accent/50 hover:text-accent"
                    >
                      {sample}
                    </Link>
                  </li>
                ),
              )}
            </ul>
            <p className="pt-4">
              Prefer a guided path?{" "}
              <Link href="/questions" className="text-accent underline-offset-4 hover:underline">
                Start with a Question
              </Link>{" "}
              or{" "}
              <Link href="/start" className="text-accent underline-offset-4 hover:underline">
                Start Here
              </Link>
              .
            </p>
          </div>
        ) : null}

        {indexState.status === "ready" && urlState.q && hits.length === 0 ? (
          <div className="mt-10 space-y-3 text-sm text-muted">
            <p>No matching material for that phrasing.</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Try fewer or different words</li>
              <li>Clear type filters if any are active</li>
              <li>
                Browse{" "}
                <Link
                  href="/explore/concepts"
                  className="text-accent underline-offset-4 hover:underline"
                >
                  concepts
                </Link>{" "}
                or{" "}
                <Link
                  href="/explore/patterns"
                  className="text-accent underline-offset-4 hover:underline"
                >
                  patterns
                </Link>
              </li>
            </ul>
          </div>
        ) : null}

        {indexState.status === "ready" && urlState.q ? (
          <SearchCuratedQuestions
            query={urlState.q}
            enrichedQuestions={curatedQuestions}
            searchBridges={questionSearchBridges}
          />
        ) : null}

        {pageSlice.items.length > 0 ? (
          <>
            <ol id={listId} className="mt-4 divide-y divide-border/40" aria-label="Search results">
              {pageSlice.items.map((hit, index) => (
                <li
                  key={hit.document.id}
                  className={
                    index === activeIndex
                      ? "rounded-sm bg-accent-soft/40 ring-1 ring-accent/40"
                      : undefined
                  }
                >
                  <SearchResultItem
                    hit={hit}
                    rank={pageSlice.startIndex + index + 1}
                    onSelect={(selected, rank) => {
                      trackSearchSelect({
                        content_type: selected.document.entityType,
                        item_id: selected.document.id,
                        surface: "full",
                        rank_bucket: rankBucket(rank),
                      });
                    }}
                  />
                </li>
              ))}
            </ol>
            <SearchPagination
              q={urlState.q}
              types={urlState.types}
              page={pageSlice.page}
              totalPages={pageSlice.totalPages}
              totalItems={pageSlice.totalItems}
              startIndex={pageSlice.startIndex}
              endIndex={pageSlice.endIndex}
            />
          </>
        ) : null}
      </Container>
    </Section>
  );
}

function GlobalSearchPageFallback({ initialQuery = "" }: { initialQuery?: string }) {
  return (
    <Section className="pb-24 pt-16">
      <Container className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.25em] text-muted">Discover</p>
        <h1 className="mt-4 font-display text-4xl text-fg">Search</h1>
        <p className="mt-8 text-sm text-muted">
          Loading search…{initialQuery ? ` (${initialQuery})` : ""}
        </p>
      </Container>
    </Section>
  );
}

export function GlobalSearchPage(props: GlobalSearchPageProps) {
  return (
    <Suspense fallback={<GlobalSearchPageFallback initialQuery={props.initialQuery} />}>
      <GlobalSearchPageInner {...props} />
    </Suspense>
  );
}
