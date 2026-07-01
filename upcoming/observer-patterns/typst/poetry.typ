#let poem-line-leading = 0.55em
#let poem-block-spacing = 1.4em

#let poem-block(content) = {
  set block(spacing: poem-block-spacing)
  set par(leading: poem-line-leading, spacing: 0.85em)
  set table(
    stroke: none,
    inset: (x: 0.4em, y: 0.15em),
    columns: (1fr, 1fr),
  )
  set heading(numbering: none)
  content
}

#let part-bridge(content) = {
  v(1fr)
  align(center)[
    #text(style: "italic", size: 12pt)[#content]
  ]
  v(1fr)
  pagebreak()
}

#let horizontal-rule() = {
  v(0.5em)
  line(length: 30%, stroke: 0.5pt + gray)
  v(0.5em)
}
