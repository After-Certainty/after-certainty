#!/usr/bin/env python3
"""Export one book as EPUB."""

from __future__ import annotations

import sys

from after_certainty.export.epub import main

if __name__ == "__main__":
    main(sys.argv[1:])
