import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";

import {
  preprocessManuscriptMarkdown,
  rewriteManuscriptAssetUrls,
} from "@/lib/reading/preprocess-manuscript";
import {
  rehypeAudioSegments,
  type AudioSegmentMarker,
} from "@/lib/reading/rehype-audio-segments";
import {
  rewriteManuscriptChapterLinks,
  type ManuscriptChapterLinkTarget,
} from "@/lib/reading/rewrite-manuscript-chapter-links";

/**
 * Allow heading ids from rehype-slug and common image attrs after sanitize.
 *
 * GFM footnotes already mint `user-content-*` ids and matching hrefs. The
 * sanitize default `clobberPrefix: "user-content-"` would re-prefix only the
 * `id` attributes, breaking ref ↔ note pairing. Empty prefix keeps pairs intact
 * for trusted corpus markdown (still XSS-filtered by the schema).
 */
const manuscriptSanitizeSchema = {
  ...defaultSchema,
  clobberPrefix: "",
  attributes: {
    ...defaultSchema.attributes,
    img: [
      ...(defaultSchema.attributes?.img ?? []),
      "alt",
      "title",
      "width",
      "height",
      "loading",
      "decoding",
    ],
    a: [...(defaultSchema.attributes?.a ?? []), "title"],
    span: [...(defaultSchema.attributes?.span ?? []), "dataAudioSegment"],
  },
};

export type RenderManuscriptHtmlInput = {
  markdown: string;
  bookDir: string;
  githubRepoUrl?: string;
  /** When true (default), strip the leading H1 that duplicates the reader chrome title. */
  stripLeadingH1?: boolean;
  /** Current chapter sourcePath — required to resolve relative `.md` links. */
  sourcePath?: string;
  /** Public chapters in this edition for Contents / cross-chapter link rewrite. */
  chapterLinkTargets?: readonly ManuscriptChapterLinkTarget[];
  /** Optional spoken segments to wrap for chapter-TTS highlighting. */
  audioSegments?: readonly AudioSegmentMarker[];
};

/**
 * Convert chapter markdown to XSS-sanitized HTML for SSR reading.
 */
export async function renderManuscriptHtml(input: RenderManuscriptHtmlInput): Promise<string> {
  let markdown = preprocessManuscriptMarkdown(input.markdown, {
    stripLeadingH1: input.stripLeadingH1,
  });

  if (input.sourcePath && input.chapterLinkTargets?.length) {
    markdown = rewriteManuscriptChapterLinks(markdown, {
      sourcePath: input.sourcePath,
      chapters: input.chapterLinkTargets,
    });
  }

  markdown = rewriteManuscriptAssetUrls(markdown, {
    bookDir: input.bookDir,
    githubRepoUrl: input.githubRepoUrl,
  });

  const segments = input.audioSegments ?? [];
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeSlug);

  if (segments.length) {
    processor.use(rehypeAudioSegments, { segments });
  }

  const file = await processor
    .use(rehypeSanitize, manuscriptSanitizeSchema)
    .use(rehypeStringify)
    .process(markdown);

  return String(file);
}
