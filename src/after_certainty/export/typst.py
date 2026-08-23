"""Export one poetry book as PDF via Typst."""

from __future__ import annotations

import argparse
import re
import subprocess
import sys
from pathlib import Path

from after_certainty.core.book_output_stem import stem_for_book_dir
from after_certainty.export.typst_manifest import write_typst_manifest
from after_certainty.specs.book_specs import load_spec_for_book_dir, spec_typst_config


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


def export_typst_pdf(
    *,
    repo: Path,
    book_dir: Path,
    book_stem: str,
    typst: str = "typst",
) -> Path:
    """Export Typst PDF for one book directory. Returns output path."""
    spec = load_spec_for_book_dir(book_dir)
    typst_cfg = spec_typst_config(spec)

    entry = str(typst_cfg.get("entry", "typst/main.typ")).strip() or "typst/main.typ"
    minimum = str(typst_cfg.get("min_version", "0.14.0")).strip() or "0.14.0"
    typst_bin = typst_binary(typst)

    ensure_typst_version(typst_bin, minimum)
    write_typst_manifest(book_dir)

    entry_path = book_dir / entry
    if not entry_path.is_file():
        raise SystemExit(f"Typst entry not found: {entry_path}")

    out = book_dir / f"{book_stem}.pdf"

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
    return out


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".")
    parser.add_argument("--book-dir", required=True)
    parser.add_argument("--out-stem", default="")
    parser.add_argument("--typst", default="typst")
    args = parser.parse_args(argv)

    repo = Path(args.repo).resolve()
    book_dir = (repo / args.book_dir).resolve()
    stem = args.out_stem.strip() or stem_for_book_dir(book_dir.as_posix(), root=repo)

    export_typst_pdf(repo=repo, book_dir=book_dir, book_stem=stem, typst=args.typst)


if __name__ == "__main__":
    main(sys.argv[1:])
