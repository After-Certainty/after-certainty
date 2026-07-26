#import "template.typ": book, render-markdown
#import "poetry.typ": part-bridge

// IngramSpark print interior: typographic title page only (no jacket art).
#show: book.with(
  title: "Observer Patterns",
  author: "Kevin Steffensen",
  cover-image: none,
)

#include "manifest-parts.typ"
