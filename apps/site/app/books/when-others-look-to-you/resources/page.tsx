import type { Metadata } from "next";
import { SimpleMarketingPage } from "@/components/books/when-others-look-to-you/pages/SimpleMarketingPage";
import { Button } from "@/components/books/when-others-look-to-you/ui/Button";
import { bookGithubDownloads, getAllPatterns, woltyBasePath } from "@/lib/books/when-others-look-to-you/content";
import { buildPageMetadata } from "@/lib/books/when-others-look-to-you/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Resources",
    description:
      "Download the book in EPUB or Word (DOCX) from GitHub, plus other tools and reading related to When Others Look to You.",
    path: `${woltyBasePath}/resources`,
  });
}

export default function ResourcesPage() {
  const mediumArticles = getAllPatterns().flatMap((pattern) =>
    pattern.detail.mediumArticleHref
      ? [
          {
            title: pattern.title,
            href: pattern.detail.mediumArticleHref,
          },
        ]
      : [],
  );
  const youtubeVideos = getAllPatterns().flatMap((pattern) =>
    pattern.detail.youtubeVideoId
      ? [
          {
            title: pattern.title,
            href: `https://www.youtube.com/watch?v=${pattern.detail.youtubeVideoId}`,
          },
        ]
      : [],
  );

  return (
    <SimpleMarketingPage
      eyebrow="RESOURCES"
      title="Tools and reading"
      lead={
        <>
          <p>
            Download the open distribution of the book (EPUB and Word) from GitHub. More
            materials—discussion guides, updates, and recommended reading—will live here over time.
          </p>
        </>
      }
    >
      <div className="space-y-10">
        <div className="space-y-4">
          <h2 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-zinc-200">
            Downloads
          </h2>
          <p className="body-lg text-pretty text-zinc-300/95">
            Get the current release files hosted on GitHub. These links open the files in a new tab.
          </p>
          <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:flex-wrap">
            <Button
              href={bookGithubDownloads.epub}
              variant="secondary"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full justify-center sm:w-auto"
            >
              Download EPUB
            </Button>
            <Button
              href={bookGithubDownloads.docx}
              variant="secondary"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full justify-center sm:w-auto"
            >
              Download DOCX
            </Button>
          </div>
        </div>

        {mediumArticles.length > 0 ? (
          <section className="space-y-4 border-t border-white/10 pt-8">
            <h2 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-zinc-200">
              Medium articles
            </h2>
            <ul className="space-y-3 body-lg text-zinc-300/95">
              {mediumArticles.map((article) => (
                <li key={article.href}>
                  <a
                    href={article.href}
                    className="font-medium text-brand-gold/95 underline-offset-[3px] transition-colors hover:text-brand-gold hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {article.title}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {youtubeVideos.length > 0 ? (
          <section className="space-y-4 border-t border-white/10 pt-8">
            <h2 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-zinc-200">
              YouTube videos
            </h2>
            <ul className="space-y-3 body-lg text-zinc-300/95">
              {youtubeVideos.map((video) => (
                <li key={video.href}>
                  <a
                    href={video.href}
                    className="font-medium text-brand-gold/95 underline-offset-[3px] transition-colors hover:text-brand-gold hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {video.title}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </SimpleMarketingPage>
  );
}
