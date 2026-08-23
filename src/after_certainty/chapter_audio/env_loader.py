"""Load gitignored root `.env.local` for laptop generate (never print secrets)."""

from __future__ import annotations

import os
from pathlib import Path


def load_env_local(repo: Path, *, filename: str = ".env.local") -> dict[str, str]:
    """Parse KEY=VALUE lines from repo-root env file into a dict (does not mutate os.environ)."""
    path = repo.resolve() / filename
    if not path.is_file():
        return {}
    out: dict[str, str] = {}
    try:
        text = path.read_text(encoding="utf-8")
    except OSError:
        return {}
    for raw in text.splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith("export "):
            line = line[len("export ") :].strip()
        if "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in {"'", '"'}:
            value = value[1:-1]
        if key:
            out[key] = value
    return out


def resolve_secret(
    name: str,
    *,
    repo: Path,
    environ: dict[str, str] | None = None,
) -> str | None:
    """Return a secret from process env first, then root `.env.local`. Never log the value."""
    env = environ if environ is not None else dict(os.environ)
    direct = str(env.get(name) or "").strip()
    if direct:
        return direct
    file_vals = load_env_local(repo)
    file_val = str(file_vals.get(name) or "").strip()
    return file_val or None
