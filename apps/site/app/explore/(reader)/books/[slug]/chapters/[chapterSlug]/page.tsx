import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { ChapterManuscriptBody } from "@/components/reading/chapter-manuscript-body";
import { ChapterReaderShell } from "@/components/reading/chapter-reader-shell";
import { resolveBookCanonicalSlug } from "@/lib/books/book-slugs";
import { getExploreSemanticGraph } from "@/lib/explore/exploreSemanticGraph";
import { buildChapterRouteKey } from "@/lib/graph/chapters";
import { createPageMetadata } from "@/lib/metadata";
import { bookOpenGraphImageFields } from "@/lib/books/book-open-graph-metadata";
import { getChapterAudioForChapter } from "@/lib/reading/chapter-audio";
import { canHighlightAlignment } from "@/lib/reading/chapter-audio-alignment";
import { loadChapterAudioAlignment } from "@/lib/reading/load-chapter-audio-alignment";
import { buildChapterReadingNavigation } from "@/lib/reading/chapter-navigation";
import { loadChapterManuscript } from "@/lib/reading/load-chapter-manuscript";
import { resolvePublicChapter } from "@/lib/reading/resolve-public-chapter";

type PageProps = {
  params: Promise<{ slug: string; chapterSlug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, chapterSlug } = await params;
  const { graph } = await getExploreSemanticGraph();
  const canonicalSlug = resolveBookCanonicalSlug(slug, graph.books) ?? slug;
  const resolved = resolvePublicChapter({
    graph,
    editionSlug: canonicalSlug,
    chapterSlug,
  });
  if (!resolved) return {};

  const description =
    resolved.chapter.summary?.trim() ||
    resolved.chapter.centralQuestion?.trim() ||
    `${resolved.chapter.title} · ${resolved.book.title}`;

  return createPageMetadata({
    title: `${resolved.chapter.title} · ${resolved.book.title}`,
    description,
    alternates: {
      canonical: resolved.pathname,
    },
    ...bookOpenGraphImageFields(resolved.book),
  });
}

/**
 * Public chapter reading destination (READ-002–006).
 */
export default async function ExploreBookChapterPage({ params }: PageProps) {
  const { slug, chapterSlug } = await params;
  const { graph } = await getExploreSemanticGraph();

  const canonicalSlug = resolveBookCanonicalSlug(slug, graph.books);
  if (canonicalSlug && canonicalSlug !== slug) {
    permanentRedirect(buildChapterRouteKey(canonicalSlug, chapterSlug));
  }

  const editionSlug = canonicalSlug ?? slug;
  const resolved = resolvePublicChapter({
    graph,
    editionSlug,
    chapterSlug,
  });
  if (!resolved) notFound();

  if (resolved.editionSlug !== editionSlug) {
    notFound();
  }

  const chapterAudio = getChapterAudioForChapter({
    editionSlug: resolved.editionSlug,
    chapterSlug,
    chapterId: resolved.chapter.id,
  });
  const alignment =
    chapterAudio && canHighlightAlignment(chapterAudio.alignmentGranularity)
      ? loadChapterAudioAlignment(chapterAudio)
      : null;
  const audioSegments = alignment?.segments.map((s) => ({ id: s.id, text: s.text }));

  const manuscript = await loadChapterManuscript({
    book: resolved.book,
    chapter: resolved.chapter,
    graph,
    audioSegments,
  });
  const navigation = buildChapterReadingNavigation({
    graph,
    book: resolved.book,
    chapterId: resolved.chapter.id,
  });

  return (
    <ChapterReaderShell
      book={resolved.book}
      chapter={resolved.chapter}
      navigation={navigation}
      chapterAudio={chapterAudio}
    >
      <ChapterManuscriptBody result={manuscript} />
    </ChapterReaderShell>
  );
}
