#!/usr/bin/env python3
"""Export one poetry book as PDF via Typst."""

from __future__ import annotations

import argparse
import re
import subprocess
import sys
from pathlib import Path

_ROOT = Path(__file__).resolve().parents[1]
_TOOLS = _ROOT / "tools"
if str(_TOOLS) not in sys.path:
    sys.path.insert(0, str(_TOOLS))

from book_output_stem import stem_for_book_dir  # noqa: E402
from book_specs import load_spec_for_book_dir, spec_typst_config  # noqa: E402
from generate_typst_manifest import write_typst_manifest  # noqa: E402


def run(cmd: list[str]) -> None:
    try:
        subprocess.run(cmd, check=True)
    except subprocess.CalledProcessError as exc:
        raise SystemExit(
            f"Typst PDF export failed (exit {exc.returncode}): {' '.join(cmd)}"
        ) from exc


def parse_version(raw: str) -> tuple[int, ...]:
    match = re.search(r"(\d+(?:\.\d+)*)", raw)
    if not match:
        return (0,)
    return tuple(int(part) for part in match.group(1).split("."))


def version_at_least(current: str, minimum: str) -> bool:
    cur = parse_version(current)
    need = parse_version(minimum)
    length = max(len(cur), len(need))
    cur_padded = cur + (0,) * (length - len(cur))
    need_padded = need + (0,) * (length - len(need))
    return cur_padded >= need_padded


def typst_binary(explicit: str) -> str:
    return explicit.strip() or "typst"


def ensure_typst_version(typst_bin: str, minimum: str) -> None:
    result = subprocess.run(
        [typst_bin, "--version"],
        capture_output=True,
        text=True,
        check=False,
    )
    if result.returncode != 0:
        raise SystemExit(f"Typst not found ({typst_bin}). Install with: make install-typst")
    current = result.stdout.strip() or result.stderr.strip()
    if not version_at_least(current, minimum):
        raise SystemExit(f"Typst {current} is too old; need >= {minimum} (run: make install-typst)")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".")
    parser.add_argument("--book-dir", required=True)
    parser.add_argument("--out-stem", default="")
    parser.add_argument("--typst", default="typst")
    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    book_dir = (repo / args.book_dir).resolve()
    spec = load_spec_for_book_dir(book_dir)
    typst_cfg = spec_typst_config(spec)

    entry = str(typst_cfg.get("entry", "typst/main.typ")).strip() or "typst/main.typ"
    minimum = str(typst_cfg.get("min_version", "0.14.0")).strip() or "0.14.0"
    typst_bin = typst_binary(args.typst)

    ensure_typst_version(typst_bin, minimum)
    write_typst_manifest(book_dir)

    entry_path = book_dir / entry
    if not entry_path.is_file():
        raise SystemExit(f"Typst entry not found: {entry_path}")

    stem = args.out_stem.strip() or stem_for_book_dir(book_dir.as_posix(), root=repo)
    out = book_dir / f"{stem}.pdf"

    run(
        [
            typst_bin,
            "compile",
            "--root",
            book_dir.as_posix(),
            entry_path.as_posix(),
            out.as_posix(),
        ]
    )
    print(out.as_posix())


if __name__ == "__main__":
    main()
