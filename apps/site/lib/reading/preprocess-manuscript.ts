/**
 * Light Pandoc → GFM-friendly preprocess for on-site reading.
 * Does not attempt full Pandoc fidelity (READ-003).
 */

/** Public URL prefix for assets installed by `install_local_manifest_for_site`. */
export const MANUSCRIPT_ASSET_PUBLIC_PREFIX = "/manuscript-assets";

/**
 * Map a book-relative media path to the site-served manuscript-assets URL.
 *
 * Export-time diagram PNGs (`export-assets/diagrams/*.png`) are generated from
 * committed SVGs under `docs/diagrams/` and are usually absent from the checkout.
 * The reader therefore serves the SVG source for those references.
 */
export function manuscriptAssetPublicUrl(bookDir: string, relativeSrc: string): string {
  const dir = bookDir.replace(/^\/+|\/+$/g, "");
  let rel = relativeSrc.trim().replace(/^\.\//, "").replace(/^\/+/, "");

  const diagramPng = /^export-assets\/diagrams\/(.+)\.png$/i.exec(rel);
  if (diagramPng) {
    rel = `docs/diagrams/${diagramPng[1]}.svg`;
  }

  return `${MANUSCRIPT_ASSET_PUBLIC_PREFIX}/${dir}/${rel}`;
}

export function preprocessManuscriptMarkdown(markdown: string, options?: { stripLeadingH1?: boolean }): string {
  let text = markdown.replace(/\r\n/g, "\n");

  // Image/link Pandoc attributes: ![alt](src){ width=100% } → ![alt](src)
  text = text.replace(/(!?\[[^\]]*]\([^)]+\))\{[^}]*\}/g, "$1");

  // Fenced div open/close markers used for DOCX custom styles
  text = text.replace(/^:::\s*\{[^}]*\}\s*$/gm, "");
  text = text.replace(/^:::\s*$/gm, "");

  // Soft page breaks
  text = text.replace(/^\\newpage\s*$/gm, "");

  if (options?.stripLeadingH1 !== false) {
    // Shell already renders chapter.title — drop the first ATX H1 to avoid duplicate titles.
    text = text.replace(/^\s*#\s+[^\n]+\n+/, "");
  }

  // Ensure a blank line before the first footnote definition block (Pandoc/GFM).
  text = text.replace(/([^\n])\n(\[\^[^\]]+]:)/g, "$1\n\n$2");

  return text.trimStart();
}

/**
 * Rewrite relative manuscript links/images for public reading.
 * - Unresolved `.md` links become plain text (chapter routes are rewritten earlier).
 * - Relative images become site `/manuscript-assets/{bookDir}/…` URLs.
 */
export function rewriteManuscriptAssetUrls(
  markdown: string,
  input: { bookDir: string; githubRepoUrl?: string },
): string {
  void input.githubRepoUrl; // retained for call-site compatibility; unused after site-local assets
  const bookDir = input.bookDir.replace(/^\/+|\/+$/g, "");

  let text = markdown;

  // Images: ![alt](relative/path.png)
  text = text.replace(/!\[([^\]]*)]\(([^)]+)\)/g, (full, alt: string, src: string) => {
    const trimmed = src.trim();
    if (/^(https?:|data:|\/\/)/i.test(trimmed)) return full;
    if (trimmed.startsWith("/")) return full;
    return `![${alt}](${manuscriptAssetPublicUrl(bookDir, trimmed)})`;
  });

  // Remaining markdown links to other .md files → keep link text only.
  text = text.replace(/\[([^\]]+)]\(([^)]+\.md)(#[^)]*)?\)/gi, "$1");

  return text;
}
