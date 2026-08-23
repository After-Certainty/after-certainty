#!/usr/bin/env python3
"""
Build selected formats for one book and emit build artifacts.
"""

from __future__ import annotations

import sys

from after_certainty.export.build import main

if __name__ == "__main__":
    main(sys.argv[1:])
