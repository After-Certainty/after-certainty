#!/usr/bin/env python3
"""Apply curated Phase 18 source-to-footnote links from an editorial decision ledger.

Opt-in script; never runs during normal CI. Does not invent manuscript citations.
The tracked candidate report supplies existing public paths and citation anchors,
and the Phase 18 ledger supplies human-reviewed source-specific interpretations.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from dataclasses import asdict
from datetime import UTC, datetime
from pathlib import Path

import yaml

from reader_passage_links import build_candidates, run_audit


def selected_note(slug: str, decisions: dict[str, str]) -> str | None:
    matches = sorted(
        ((prefix, value) for prefix, value in decisions.items() if slug.startswith(prefix)),
        key=lambda entry: len(entry[0]),
        reverse=True,
    )
    if len(matches) > 1 and len(matches[0][0]) == len(matches[1][0]):
        raise ValueError(f"Overlapping editorial decisions for {slug}")
    return matches[0][1] if matches else None


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", type=Path, default=Path("."))
    args = parser.parse_args()
    repo = args.repo.resolve()
    report_dir = repo / "reports" / "reader-passage-links"
    candidates = json.loads((report_dir / "candidates.json").read_text())["candidates"]
    decisions = json.loads((report_dir / "phase18-editorial-decisions.json").read_text())
    ledger_path = report_dir / "review-log.json"
    ledger = json.loads(ledger_path.read_text())
    notes = decisions["rationales"]
    exclusions = decisions["exclusions"]
    applied: list[tuple[str, str, str]] = []
    deferred: list[tuple[str, str]] = []
    previously_linked: list[str] = []

    preflight = run_audit(repo, check_fragments=False, thinker_slugs=set())
    source_audits = {source.slug: source for source in preflight.sources}
    newly_separated: list[str] = []
    eligible = {
        src.slug
        for src in preflight.sources
        if src.evidence_level == "B"
        and src.status == "strong_candidate"
        and not src.reader_passage_path
    }
    source_candidates = [
        c for c in candidates if c["entity_kind"] == "source" and c["slug"] in eligible
    ]
    unseen = eligible - {c["slug"] for c in source_candidates}
    if unseen:
        discovered = build_candidates(
            preflight,
            kind="sources",
            only_missing=True,
            slugs=unseen,
            batch_size=len(unseen),
            max_per_source=1,
            repo=repo,
            check_anchors=True,
        )
        source_candidates.extend(asdict(c) for c in discovered)
    unlinked = []
    for candidate in source_candidates:
        slug = candidate["slug"]
        profile_path = repo / candidate["yaml_path"]
        profile = yaml.safe_load(profile_path.read_text())
        if profile.get("readerPassagePath"):
            previously_linked.append(slug)
            continue
        unlinked.append(candidate)

    if len(eligible) != 87 or len(unlinked) != 87:
        raise RuntimeError(
            f"Expected the Phase 17 baseline of 87 cited but unlinked sources, got "
            f"eligible={len(eligible)}, candidates={len(unlinked)}. "
            "Reconcile against the latest audit before applying this editorial batch."
        )

    for candidate in unlinked:
        slug = candidate["slug"]
        reason = selected_note(slug, exclusions)
        path = candidate.get("candidate_reader_passage_path")
        record_key = f"source:{slug}:{path}"
        if reason:
            deferred.append((slug, reason))
            ledger["entries"][record_key] = {
                "candidatePath": path,
                "entityKind": "source",
                "evidenceLevel": "B",
                "routeKey": candidate["route_key"],
                "slug": slug,
                "status": "deferred",
                "note": f"Phase 18: {reason}",
                "updatedAt": datetime.now(UTC).isoformat(),
            }
            continue

        explanation = selected_note(slug, notes)
        if not explanation:
            raise RuntimeError(f"No source-specific editorial rationale for {slug}")
        if len(explanation) < 90:
            raise RuntimeError(f"Insufficient editorial detail for {slug}")
        if candidate["evidence_level"] != "B" or candidate.get("anchor_exists") is not True:
            raise RuntimeError(f"No verified candidate citation anchor for {slug}")
        if not path or "#user-content-fnref-" not in path:
            raise RuntimeError(f"Missing exact reader footnote invocation for {slug}")
        if candidate.get("needs_editorial_review") is not True:
            raise RuntimeError(f"Unexpected candidate review state for {slug}")
        if "matches this source" not in candidate.get("explanation", ""):
            raise RuntimeError(f"Candidate match lacks source attribution for {slug}")

        manuscript = (repo / candidate["manuscript_path"]).read_text()
        footnote = path.rsplit("#user-content-fnref-", 1)[1]
        marker = f"[^{footnote}]"
        if marker not in manuscript or not re.search(
            r"^\[\^" + re.escape(footnote) + r"\]:", manuscript, re.MULTILINE
        ):
            raise RuntimeError(f"Missing manuscript invocation or definition for {slug} ({marker})")

        source_path = repo / candidate["yaml_path"]
        source_yaml = source_path.read_text()
        profile = yaml.safe_load(source_yaml)
        if candidate["book_id"] not in profile.get("relatedBooks", []):
            raise RuntimeError(f"Candidate points outside related book for {slug}")
        if "readerPassagePath:" in source_yaml or "whyThisMatters:" in source_yaml:
            raise RuntimeError(f"Already annotated field for {slug}")

        # An omnibus footnote proves a shared citation exists, but does not supply a
        # unique source-to-invocation link. Add an independently attributed citation
        # to the same sentence without changing its claim or erasing the original
        # note's historical discussion. Original context remains readable.
        hit = next(
            (
                h
                for h in source_audits[slug].footnote_hits
                if h.footnote_id == footnote and h.route_key == candidate["route_key"]
            ),
            None,
        )
        if hit is None:
            raise RuntimeError(f"Cannot locate the original source hit for {slug}")
        if hit.shared_with or hit.ambiguous:
            new_id = (
                "p18-"
                + re.sub(r"[^a-z0-9]+", "-", str(profile.get("title", slug)).lower())
                .strip("-")[:27]
                .rstrip("-")
                + "-"
                + hashlib.sha1(slug.encode()).hexdigest()[:7]
            )
            new_marker = f"[^{new_id}]"
            manuscript_path = repo / candidate["manuscript_path"]
            if new_marker in manuscript:
                raise RuntimeError(f"Duplicate new citation marker for {slug}")
            # Search only footnote references, not their definitions.
            use_match = re.search(r"\[\^" + re.escape(footnote) + r"\](?!:)", manuscript)
            if use_match is None:
                raise RuntimeError(f"No body citation to distinguish for {slug}")
            bibliographic_text = decisions.get("citationNotes", {}).get(slug) or profile.get("citation")
            citation = re.sub(r"\s+", " ", str(bibliographic_text or "").strip())
            if len(citation) < 18:
                raise RuntimeError(f"No standalone bibliographic citation for {slug}")
            manuscript = (
                manuscript[: use_match.end()]
                + new_marker
                + manuscript[use_match.end() :]
                + f"\n\n[^{new_id}]: {citation}\n"
            )
            manuscript_path.write_text(manuscript)
            original_path = path
            path = path.split("#", 1)[0] + "#user-content-fnref-" + new_id
            newly_separated.append(slug)
            ledger["entries"][record_key] = {
                "candidatePath": original_path,
                "entityKind": "source",
                "evidenceLevel": "B",
                "routeKey": candidate["route_key"],
                "slug": slug,
                "status": "skipped",
                "note": "Phase 18: superseded by a source-specific citation on the same sentence",
                "supersededBy": path,
                "updatedAt": datetime.now(UTC).isoformat(),
            }
            record_key = f"source:{slug}:{path}"

        # JSON string quoting is valid YAML and preserves every existing field and line.
        appended = (
            source_yaml.rstrip("\n")
            + "\nreaderPassagePath: "
            + path
            + "\nwhyThisMatters: "
            + json.dumps(explanation, ensure_ascii=False)
            + "\n"
        )
        source_path.write_text(appended)
        applied.append((slug, path, explanation))
        ledger["entries"][record_key] = {
            "candidatePath": path,
            "entityKind": "source",
            "evidenceLevel": "B",
            "routeKey": candidate["route_key"],
            "slug": slug,
            "status": "applied",
            "note": f"Phase 18: {explanation}",
            "updatedAt": datetime.now(UTC).isoformat(),
        }

    if len(applied) + len(deferred) != 87:
        raise RuntimeError("Phase 18 did not account for all 87 candidates")
    if len(applied) < 80:
        raise RuntimeError(f"Too few safe editorial connections: {len(applied)}")

    ledger_path.write_text(json.dumps(ledger, ensure_ascii=False, indent=2) + "\n")
    report = [
        "# Reader passage editorial coverage — Phase 18",
        "",
        "Starting baseline: **548 of 714** verified source passages; **87** footnote-cited sources without links.",
        f"Applied **{len(applied)}** reviewed source-to-note decisions. Deferred **{len(deferred)}** unsupported attributions.",
        "A reader-passage link confirms an actual citation invocation, not that every philosophical",
        "interpretation of the source is proven. Shared references remain shared only when the",
        "footnote genuinely names the work. Source-specific notes added to an existing sentence preserve its claim.",
        "",
        "## Approved source-specific links",
        "",
        "| Source | Cited reader passage | Editorial scope |",
        "|---|---|---|",
    ]
    for slug, path, why in sorted(applied):
        report.append(f"| `{slug}` | `{path}` | {why.replace('|', '/')} |")
    report.extend(
        [
            "",
            f"**Source-specific footnote anchors added:** {len(newly_separated)}.",
            "",
            "## Intentionally deferred (unsupported linkage)",
            "",
        ]
    )
    for slug, why in sorted(deferred):
        report.append(f"- **`{slug}`** — {why}")
    report.extend(
        [
            "",
            "## Validation",
            "",
            "See the committed rendered-HTML citation audit for final verified totals.",
            "Run `python tools/audit_reader_passage_links.py --repo .` with Node",
            "and installed site dependencies before relying on the reported count.",
            "",
        ]
    )
    (report_dir / "editorial-batch-phase-18.md").write_text("\n".join(report))
    print(
        f"Phase 18: applied={len(applied)}, deferred={len(deferred)}, "
        f"separated_anchors={len(newly_separated)}, previously-linked candidates={len(previously_linked)}"
    )


if __name__ == "__main__":
    main()
