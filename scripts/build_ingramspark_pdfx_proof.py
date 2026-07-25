#!/usr/bin/env python3
"""Build the isolated grayscale PDF/X proof (INGRAM-004 first gate)."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

_ROOT = Path(__file__).resolve().parents[1]
_TOOLS = _ROOT / "tools"
if str(_TOOLS) not in sys.path:
    sys.path.insert(0, str(_TOOLS))

from ingramspark.pdfx_proof import PdfxProofError, build_grayscale_pdfx_proof  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".")
    parser.add_argument(
        "--out-dir",
        default="",
        help="Output directory (default: build/ingramspark/_pdfx-proof)",
    )
    parser.add_argument("--gs", default="gs")
    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    out_dir = (
        Path(args.out_dir).resolve()
        if args.out_dir.strip()
        else repo / "build" / "ingramspark" / "_pdfx-proof"
    )

    try:
        result = build_grayscale_pdfx_proof(out_dir=out_dir, gs=args.gs)
    except PdfxProofError as exc:
        raise SystemExit(str(exc)) from exc

    print(result.pdf_path.as_posix())
    print(result.inspection_path.as_posix())
    print(json.dumps(result.construction, indent=2))


if __name__ == "__main__":
    main()
