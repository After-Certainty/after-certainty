"""
Parse and compose pattern narrative fields (setup, problem, forces, observation, example).

Legacy ``summary`` text used section markers ``**Problem:**``, ``**Forces:**``,
``**Observation:**``, and blockquotes starting with ``>``.

``forces`` is a list of strings (each bullet). Legacy single-string bullets separated
by `` - `` are split when migrating or when reading old YAML.
"""

from __future__ import annotations

import re
from typing import Any

MARK_PROBLEM = re.compile(r"\*\*Problem:\*\*\s*", re.IGNORECASE)
MARK_FORCES = re.compile(r"\*\*Forces:\*\*\s*", re.IGNORECASE)
MARK_OBSERVATION = re.compile(r"\*\*Observation:\*\*\s*", re.IGNORECASE)


def collapse_whitespace(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "").strip()).strip()


def normalize_block(text: str, *, preserve_lines: bool = False) -> str:
    text = (text or "").strip()
    if not text:
        return ""
    if not preserve_lines:
        return collapse_whitespace(text)
    lines = [ln.rstrip() for ln in text.splitlines()]
    while lines and not lines[0].strip():
        lines.pop(0)
    while lines and not lines[-1].strip():
        lines.pop()
    return "\n".join(lines)


def forces_str_to_list(raw: str) -> list[str]:
    """
    Turn a legacy ``- a - b - c`` forces paragraph into separate strings.

    Splits on `` \\s+-\\s+ `` (space-hyphen-space) so internal hyphens in words stay intact.
    """
    s = (raw or "").strip()
    if not s:
        return []
    if (s.startswith("'") and s.endswith("'")) or (s.startswith('"') and s.endswith('"')):
        s = s[1:-1]
    s = s.replace("''", "'")
    s = collapse_whitespace(s)
    chunks = re.split(r"\s+-\s+", s)
    out: list[str] = []
    for ch in chunks:
        t = ch.strip()
        if t.startswith("-"):
            t = t[1:].strip()
        if t:
            out.append(t)
    return out


def normalize_forces_value(val: Any) -> list[str]:
    if isinstance(val, list):
        return [str(x).strip() for x in val if str(x).strip()]
    if isinstance(val, str) and val.strip():
        return forces_str_to_list(val)
    return []


def _split_observation_and_example(tail: str) -> tuple[str, str]:
    """Split post-observation-marker body into observation prose vs example/callout."""
    tail = (tail or "").strip()
    if not tail:
        return "", ""

    m = re.search(r"\n\s*>\s*", tail)
    if m:
        return tail[: m.start()].strip(), tail[m.end() :].strip()

    # Inline callout: ". > Meaning" — not soft wraps like "was > actually".
    m2 = re.search(r"([.!?])\s+>\s*([\"'A-Z])", tail)
    if m2:
        return tail[: m2.end(1)].strip(), tail[m2.start(2) :].strip()

    return tail, ""


def _parse_example_block(example_raw: str) -> str:
    parts: list[str] = []
    for line in example_raw.splitlines():
        ls = line.strip()
        if not ls:
            continue
        if ls.startswith(">"):
            parts.append(ls[1:].strip())
        elif parts:
            parts[-1] = (parts[-1] + " " + ls).strip()
        else:
            parts.append(ls)
    return collapse_whitespace(" ".join(parts))


def parse_legacy_summary(text: str) -> dict[str, Any]:
    """Split a legacy monolithic summary into structured fields."""
    text = (text or "").strip()
    if not text:
        return {}

    m0 = MARK_PROBLEM.search(text)
    if not m0:
        return {"setup": collapse_whitespace(text)}

    setup = collapse_whitespace(text[: m0.start()].strip())
    after_problem = text[m0.end() :]

    m1 = MARK_FORCES.search(after_problem)
    if not m1:
        problem = collapse_whitespace(after_problem.strip())
        out: dict[str, Any] = {}
        if setup:
            out["setup"] = setup
        if problem:
            out["problem"] = problem
        return out

    problem = normalize_block(after_problem[: m1.start()])
    after_forces = after_problem[m1.end() :]

    m2 = MARK_OBSERVATION.search(after_forces)
    if not m2:
        forces_block = normalize_block(after_forces.strip(), preserve_lines=True)
        forces_list = forces_str_to_list(collapse_whitespace(forces_block))
        out = {}
        if setup:
            out["setup"] = setup
        if problem:
            out["problem"] = problem
        if forces_list:
            out["forces"] = forces_list
        return out

    forces_block = normalize_block(after_forces[: m2.start()], preserve_lines=True)
    forces_list = forces_str_to_list(collapse_whitespace(forces_block))
    tail = after_forces[m2.end() :].strip()

    obs_raw, ex_raw = _split_observation_and_example(tail)
    observation = collapse_whitespace(obs_raw)
    example = _parse_example_block(ex_raw)

    out = {}
    if setup:
        out["setup"] = setup
    if problem:
        out["problem"] = problem
    if forces_list:
        out["forces"] = forces_list
    if observation:
        out["observation"] = observation
    if example:
        out["example"] = example
    return out


def structured_fields_from_row(data: dict[str, Any]) -> dict[str, Any]:
    """Collect narrative fields from structured YAML or legacy ``summary``."""
    out: dict[str, Any] = {}
    for k in ("setup", "problem", "observation", "example"):
        v = data.get(k)
        if isinstance(v, str) and v.strip():
            out[k] = v.strip()
    forces_list = normalize_forces_value(data.get("forces"))
    if forces_list:
        out["forces"] = forces_list
    if out:
        return out
    legacy = data.get("summary")
    if isinstance(legacy, str) and legacy.strip():
        return parse_legacy_summary(legacy)
    return {}


def compose_summary_from_parts(parts: dict[str, Any]) -> str:
    """Single manifest ``summary`` string for backward compatibility."""
    blocks: list[str] = []
    for k in ("setup", "problem", "forces", "observation", "example"):
        v = parts.get(k)
        if k == "forces":
            if isinstance(v, list) and v:
                blocks.append("\n".join(f"- {item}" for item in v))
            elif isinstance(v, str) and v.strip():
                blocks.append(v.strip())
        elif isinstance(v, str) and v.strip():
            blocks.append(v.strip())
    return "\n\n".join(blocks)
