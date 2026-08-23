"""Compatibility shim — use after_certainty.export.manifest."""

from after_certainty.export.manifest import *  # noqa: F403

if __name__ == "__main__":
    from after_certainty.export.manifest import main

    main()
