"""Compatibility shim — use after_certainty.manuscript.publication_validation."""

from after_certainty.manuscript.publication_validation import *  # noqa: F403

if __name__ == "__main__":
    from after_certainty.manuscript.publication_validation import main

    main()
