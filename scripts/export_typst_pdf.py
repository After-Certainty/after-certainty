#!/usr/bin/env python3
"""Export one poetry book as PDF via Typst."""

from __future__ import annotations

import sys

from after_certainty.export.typst import main

if __name__ == "__main__":
    main(sys.argv[1:])
