import { sunoEmbedUrl } from "@/lib/songs/recordings";

const EMBED_HEIGHT_PX = 140;

type SunoEmbedProps = {
  externalId: string;
  /** Accessible iframe title — include the composition title. */
  title: string;
};

/**
 * Always-mounted Suno iframe for the persistent `/listen` player.
 *
 * Built locally via {@link sunoEmbedUrl} — no Suno API/oEmbed at runtime.
 * Changing `externalId` replaces the iframe (one live embed). Never autoplays.
 */
export function SunoEmbed({ externalId, title }: SunoEmbedProps) {
  const embedSrc = sunoEmbedUrl(externalId);

  if (!embedSrc) {
    return (
      <p className="text-sm text-muted" role="status">
        Player unavailable for this recording.
      </p>
    );
  }

  const iframeTitle = `${title} — Suno player`;

  return (
    <div
      className="relative w-full overflow-hidden rounded-lg border border-border/40 bg-bg-elevated/50"
      style={{ minHeight: EMBED_HEIGHT_PX }}
      data-suno-embed="mounted"
    >
      <iframe
        key={embedSrc}
        title={iframeTitle}
        src={embedSrc}
        className="block w-full border-0"
        height={EMBED_HEIGHT_PX}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}
