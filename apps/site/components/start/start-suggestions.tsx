import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { getBooks, getPodcastEpisodes } from "@/lib/content-data";

const fallbackThumb = "/images/hero/hero-backdrop.png";

export async function StartSuggestions() {
  const books = await getBooks();
  const episodes = await getPodcastEpisodes();
  const episode = episodes[0];
  const essay = books.find((b) => b.slug === "patterns-of-attention") ?? books[0];

  type SuggestionCard = {
    title: string;
    description: string;
    href: string;
    thumb: string | null;
    external?: boolean;
  };

  const cards: SuggestionCard[] = [
    {
      title: "When Others Look to You",
      description:
        "A forthcoming orientation for moments when others seek direction — and meaning becomes shared responsibility.",
      href: "/books",
      thumb: null,
    },
    {
      title: "How Meaning Moves",
      description:
        episode?.description ??
        "Signal, compression, restraint — and connection as the thread through forces that move meaning.",
      href: episode?.episodeUrl ?? "/podcast",
      thumb: episode?.image ?? fallbackThumb,
      external: Boolean(episode?.episodeUrl),
    },
    {
      title: "Featured podcast episode",
      description: episode
        ? `${episode.title} — ${episode.duration ? `${episode.duration} · ` : ""}${episode.publishedAt}.`
        : "Subscribe via RSS and listen on your preferred app.",
      href: "/podcast",
      thumb: episode?.image ?? fallbackThumb,
    },
    {
      title: "Featured Essay",
      description: essay?.description ?? "Patterns of attention in institutions and everyday life.",
      href: essay ? `/books/${essay.slug}` : "/patterns",
      thumb: null,
    },
  ];

  return (
    <Section atmosphere="none" className="border-b border-border/35 bg-bg-elevated/[0.06] py-24 md:py-32">
      <Container>
        <h2 className="max-w-xl font-display text-3xl font-medium tracking-tight text-fg md:text-4xl">
          Suggested starting points
        </h2>
        <p className="mt-5 max-w-2xl text-muted">
          No single path is required — follow what draws your curiosity.
        </p>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {cards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              target={card.external ? "_blank" : undefined}
              rel={card.external ? "noopener noreferrer" : undefined}
              className="group flex h-full flex-col overflow-hidden border border-border/50 bg-bg-elevated/20 transition-colors duration-300 hover:border-accent/30 hover:bg-bg-elevated/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-border/40 bg-bg-elevated">
                {card.thumb ? (
                  <Image
                    src={card.thumb}
                    alt=""
                    fill
                    className="object-cover object-center opacity-90 transition-opacity duration-300 group-hover:opacity-100"
                    sizes="(max-width:1024px) 50vw, 25vw"
                  />
                ) : (
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-accent/12 via-bg-elevated to-bg"
                    aria-hidden
                  />
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-display text-lg font-medium leading-snug text-fg">{card.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{card.description}</p>
                <span className="mt-6 text-[11px] uppercase tracking-[0.2em] text-accent transition-colors group-hover:text-fg">
                  Open →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  );
}
