/**
 * Light Pandoc → GFM-friendly preprocess for on-site reading.
 * Does not attempt full Pandoc fidelity (READ-003).
 */
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
 * - `.md` links become plain text (cross-chapter routing is READ-006/007).
 * - Relative images become raw.githubusercontent.com URLs when bookDir is known.
 */
export function rewriteManuscriptAssetUrls(
  markdown: string,
  input: { bookDir: string; githubRepoUrl?: string },
): string {
  const repoUrl = (input.githubRepoUrl ?? "https://github.com/ksteffe/after-certainty").replace(
    /\/$/,
    "",
  );
  const rawBase = `${repoUrl.replace("github.com", "raw.githubusercontent.com")}/main/${input.bookDir.replace(/^\/+|\/+$/g, "")}`;

  let text = markdown;

  // Images: ![alt](relative/path.png)
  text = text.replace(/!\[([^\]]*)]\(([^)]+)\)/g, (full, alt: string, src: string) => {
    const trimmed = src.trim();
    if (/^(https?:|data:|\/\/)/i.test(trimmed)) return full;
    if (trimmed.startsWith("/")) return full;
    const cleaned = trimmed.replace(/^\.\//, "");
    return `![${alt}](${rawBase}/${cleaned})`;
  });

  // Markdown links to other .md files → keep link text only (no broken relative hrefs).
  text = text.replace(/\[([^\]]+)]\(([^)]+\.md)(#[^)]*)?\)/gi, "$1");

  return text;
}
