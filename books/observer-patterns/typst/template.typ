#import "@preview/cmarker:0.1.8": render
#import "poetry.typ": poem-block, part-bridge, prose-block

#let render-markdown(path) = {
  poem-block(render(read(path)))
}

#let render-prose-markdown(path) = {
  prose-block(render(read(path)))
}

#let render-bridge(path) = {
  render(read(path))
}

#let book(
  title: "",
  author: "",
  cover-image: none,
  body,
) = {
  set page(
    paper: "us-trade",
    margin: (x: 0.85in, y: 0.88in),
  )
  set text(font: "Libertinus Serif", size: 11pt)
  set par(leading: 0.65em, spacing: 1.2em, justify: false)

  if cover-image != none {
    align(center)[
      #image(cover-image, width: 80%)
      #v(2em)
      #text(size: 22pt, weight: "bold")[#title]
      #v(0.75em)
      #text(size: 13pt)[#author]
    ]
    pagebreak()
  }

  body
}
