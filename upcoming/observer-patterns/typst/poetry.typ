#let poem-line-leading = 0.48em
#let poem-block-spacing = 1.1em
#let poem-par-spacing = 0.68em

#let poem-block(content) = {
  v(1fr)
  align(center)[
    #{
      set align(center)
      show heading: it => {
        set align(center)
        set block(above: 0.85em, below: 0.5em)
        it
      }
      set block(spacing: poem-block-spacing)
      set par(leading: poem-line-leading, spacing: poem-par-spacing, justify: false)
      set table(
        stroke: none,
        inset: (x: 0.35em, y: 0.08em),
        columns: (1fr, 1fr),
      )
      set heading(numbering: none)
      content
    }
  ]
  v(1fr)
}

#let prose-block(content) = {
  set par(leading: 0.65em, spacing: 1.2em, justify: false)
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
