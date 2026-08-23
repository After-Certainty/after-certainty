"""Compatibility shim — use after_certainty.export.typst_manifest."""

from after_certainty.export.typst_manifest import *  # noqa: F403

if __name__ == "__main__":
    from after_certainty.export.typst_manifest import main

    raise SystemExit(main())
