"""Compatibility shim — use after_certainty.export.epub_postprocess."""

from after_certainty.export.epub_postprocess import *  # noqa: F403

if __name__ == "__main__":
    from after_certainty.export.epub_postprocess import main

    main()
