"""Compatibility shim — use after_certainty.export.diagrams."""

from after_certainty.export.diagrams import *  # noqa: F403

if __name__ == "__main__":
    from after_certainty.export.diagrams import main

    raise SystemExit(main())
