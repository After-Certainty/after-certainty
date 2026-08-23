"""Compatibility shim — use after_certainty.export.kindle_flatten."""

from after_certainty.export.kindle_flatten import *  # noqa: F403

if __name__ == "__main__":
    from after_certainty.export.kindle_flatten import main

    main()
