# open-graph.config.yml reference

Place beside `book-cover.png` in the book folder. All keys optional.

## Image

| Key | Default | Description |
|-----|---------|-------------|
| `bg_crop` | auto band | `[left, top, right, bottom]` pixels on source cover |
| `tint` | `[18, 28, 52, 135]` | RGBA overlay on blurred background |

## Typography

| Key | Default | Description |
|-----|---------|-------------|
| `title` | from `book.yml` | Override title text |
| `subtitle` | from `book.yml` | Override subtitle text |
| `title_lines` | auto-split title words | List of `{text, color}` |
| `subtitle_lines` | auto-wrap subtitle | List of strings |
| `font_title` | `46` | Title line font size |
| `font_sub` | `17` | Subtitle font size |
| `title_start_y` | `78` | First title line Y position |
| `title_line_gap` | `54` | Pixels between title lines |
| `rule_width` | `360` | Accent horizontal rule width |

## Colors

`color` values in `title_lines` and `subtitle_color`:

- Named: `white`, `slate`, `gold`, `accent`
- RGB list: `[r, g, b]` or `[r, g, b, a]`

`accent_color` sets the `accent` token (default gold `[218, 178, 72]`).

## Example — short title

```yaml
accent_color: [232, 122, 58]   # orange, How Trust Forms
bg_crop: [80, 320, 1000, 1280]
title_lines:
  - { text: How, color: slate }
  - { text: Trust, color: white }
  - { text: Forms, color: slate }
subtitle_lines:
  - WHY PARTICIPATION BECOMES POSSIBLE
subtitle_color: gold
```

## Example — long title (Trust Beyond Similarity)

```yaml
bg_crop: [40, 420, 984, 1320]
tint: [18, 28, 52, 135]
accent_color: [218, 178, 72]
title_lines:
  - { text: Trust, color: white }
  - { text: Beyond, color: accent }
  - { text: Similarity, color: white }
subtitle_lines:
  - HOW TRUST REMAINS POSSIBLE
  - ACROSS DIFFERENCE
subtitle_color: accent
```

## Output

- Fixed size: **1200×630** PNG → `open-graph.png` (or `--output`)
- Input cover: **book-cover.png** (or `--cover`)
