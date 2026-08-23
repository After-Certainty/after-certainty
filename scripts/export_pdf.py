#!/usr/bin/env python3
"""Export one book as PDF via pandoc + LaTeX engine."""

from __future__ import annotations

import sys

from after_certainty.export.pdf import main

if __name__ == "__main__":
    main(sys.argv[1:])
