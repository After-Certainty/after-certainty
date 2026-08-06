# Bibliography and Citation Pass

Use this pass after substantive edits to any chapter, and during part-level
cleanup before approval.

House standard: [books/how-meaning-moves/docs/bibliography-pass.md](../../how-meaning-moves/docs/bibliography-pass.md)

Upcoming conventions: [upcoming/docs/bibliography-pass.md](../../../upcoming/docs/bibliography-pass.md)

Working research map: [anticipated-bibliography.md](anticipated-bibliography.md)

## Citation format in chapters

Use Pandoc-style footnotes:

- Marker in body: `[^id]` (renders as superscript in output).
- Definition in file: `[^id]: Full note text...`
- **Blank line before each `[^id]:` definition block.**

Place footnote markers after punctuation where possible.

## Stable ID convention

- Preferred: `[^c1-doris-lack-of-character]`
- Prefix with unit scope (`c1`…`c16`, `intro`, `epi`)
- Author + short-work slug; lowercase hyphenated
- Avoid: `[^1]`, `[^2]`

## Bibliography style

`back-matter/bibliography.md`:

- Heading: `# **Bibliography**`
- Dash bullets, one source per bullet
- Wrapped continuation lines indented by two spaces
- Alphabetical; only works actually cited in notes
