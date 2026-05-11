#!/usr/bin/env python3
"""
Validate an aggregate books manifest JSON against schema/books-manifest.schema.json.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

try:
    import jsonschema
except ModuleNotFoundError as exc:  # pragma: no cover
    raise SystemExit(
        "jsonschema is required for manifest validation. Install with: python3 -m pip install jsonschema"
    ) from exc


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".", help="Repository root")
    parser.add_argument("--manifest", required=True, help="Manifest JSON path")
    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    manifest_path = Path(args.manifest).resolve()
    schema_path = repo / "schema" / "books-manifest.schema.json"

    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    schema = json.loads(schema_path.read_text(encoding="utf-8"))

    jsonschema.validate(instance=manifest, schema=schema)
    print(f"Validated books manifest: {manifest_path}")


if __name__ == "__main__":
    main()
