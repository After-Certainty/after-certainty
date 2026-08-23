#!/usr/bin/env python3
"""
Export one book as DOCX (full manuscript or per Part/Act section from index.md).
"""

from __future__ import annotations

import sys

from after_certainty.export.docx import main

if __name__ == "__main__":
    main(sys.argv[1:])
