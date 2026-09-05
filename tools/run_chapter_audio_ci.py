#!/usr/bin/env python3
"""
GitHub Actions helper for chapter-audio generation: commit LFS audio + open a review PR.

Does not call the TTS API itself — the workflow runs generate first. This script only
packages present books/*/audio changes into a reviewable branch/PR.
"""

from __future__ import annotations

import argparse
import os
import subprocess
import sys
from pathlib import Path


def _run(
    cmd: list[str], *, cwd: Path, env: dict[str, str] | None = None
) -> subprocess.CompletedProcess[str]:
    return subprocess.run(cmd, cwd=cwd, env=env, text=True, capture_output=True, check=False)


def _manual_pr_url(*, base_branch: str, branch: str) -> str | None:
    repo = os.environ.get("GITHUB_REPOSITORY", "").strip()
    server = os.environ.get("GITHUB_SERVER_URL", "https://github.com").rstrip("/")
    if not repo:
        return None
    return f"{server}/{repo}/compare/{base_branch}...{branch}?expand=1"


def _pr_create_blocked(err: str) -> bool:
    """True when Actions is denied createPullRequest (expected under default security)."""
    return (
        "createPullRequest" in err
        or "not permitted to create or approve pull requests" in err
    )


def _changed_audio_paths(repo: Path) -> list[str]:
    # Use -uall so newly created books/<edition>/audio/ dirs list their files.
    # Pathspecs like books/*/audio are not expanded by git when passed literally
    # (no shell glob), so scope to books/ and filter for /audio/ paths.
    proc = _run(
        ["git", "status", "--porcelain", "-uall", "--", "books"],
        cwd=repo,
    )
    if proc.returncode != 0:
        raise RuntimeError(proc.stderr or "git status failed")
    paths: list[str] = []
    for line in proc.stdout.splitlines():
        if len(line) < 4:
            continue
        path = line[3:].strip()
        if " -> " in path:
            path = path.split(" -> ", 1)[1].strip()
        normalized = path.rstrip("/")
        if "/audio/" in path or normalized.endswith("/audio"):
            paths.append(path)
    return sorted(set(paths))


def publish(
    *,
    repo: Path,
    base_branch: str,
    unit_ids: list[str],
    dry_run: bool,
) -> int:
    repo = repo.resolve()
    run_id = os.environ.get("GITHUB_RUN_ID", "local")
    branch = f"chapter-audio/generate-{run_id}"
    title = f"chapter-audio: generate {len(unit_ids)} unit(s)"
    units_list = "\n".join(f"- `{u}`" for u in unit_ids)
    body = (
        "## Summary\n"
        f"Generated chapter audio for {len(unit_ids)} unit(s) via "
        "`chapter-audio-generate` workflow.\n\n"
        f"{units_list}\n\n"
        "## Notes\n"
        "- MP3s are Git LFS objects under `books/*/audio/`.\n"
        "- Merging installs Listen for **available** units on the live site "
        "(no separate env flag).\n"
        "- Review receipts/alignment before merge.\n"
    )

    paths = _changed_audio_paths(repo)
    if not paths:
        print("No books/*/audio changes to publish.", file=sys.stderr)
        return 0

    if dry_run:
        print(f"dry-run: branch={branch} files={len(paths)}")
        for p in paths:
            print(f"  {p}")
        print(body)
        return 0

    token = os.environ.get("GH_TOKEN") or os.environ.get("GITHUB_TOKEN")
    if not token:
        print("Error: GH_TOKEN or GITHUB_TOKEN required to open PR", file=sys.stderr)
        return 2

    env = os.environ.copy()
    env["GH_TOKEN"] = token
    git_user = os.environ.get("GIT_AUTHOR_NAME", "github-actions[bot]")
    git_email = os.environ.get(
        "GIT_AUTHOR_EMAIL", "41898282+github-actions[bot]@users.noreply.github.com"
    )

    for cmd in (
        ["git", "config", "user.name", git_user],
        ["git", "config", "user.email", git_email],
        ["git", "checkout", "-b", branch],
        ["git", "add", "--", *paths],
        [
            "git",
            "commit",
            "-m",
            f"chapter-audio: generate {len(unit_ids)} unit(s)\n\nWorkflow run {run_id}.",
        ],
    ):
        proc = _run(cmd, cwd=repo, env=env)
        if proc.returncode != 0:
            print(proc.stdout, file=sys.stderr)
            print(proc.stderr, file=sys.stderr)
            return proc.returncode or 1

    push = _run(["git", "push", "origin", branch], cwd=repo, env=env)
    if push.returncode != 0:
        print(push.stderr, file=sys.stderr)
        return push.returncode

    body_path = repo / "build" / "chapter-audio-pr-body.md"
    body_path.parent.mkdir(parents=True, exist_ok=True)
    body_path.write_text(body, encoding="utf-8")

    pr = _run(
        [
            "gh",
            "pr",
            "create",
            "--base",
            base_branch,
            "--head",
            branch,
            "--title",
            title,
            "--body-file",
            str(body_path),
        ],
        cwd=repo,
        env=env,
    )
    if pr.returncode != 0:
        err = ((pr.stdout or "") + (pr.stderr or "")).strip()
        print(err, file=sys.stderr)
        manual = _manual_pr_url(base_branch=base_branch, branch=branch)
        if _pr_create_blocked(err):
            print(
                "Note: automatic PR creation may be disabled (repo setting "
                '"Allow GitHub Actions to create and approve pull requests"). '
                "Audio was pushed; open a review PR manually from the compare "
                "URL. Prefer keeping that setting off unless Actions must open "
                "PRs (approval/merge stay human-only).",
                file=sys.stderr,
            )
        if manual:
            print(f"Branch pushed. Open a PR manually: {manual}")
            print(f"::notice title=Open PR manually::{manual}")
            # Push succeeded; treat PR-create denial/failure as non-fatal so
            # generated LFS audio is not marked as a failed run.
            return 0
        return pr.returncode
    print(pr.stdout.strip())
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", type=Path, default=Path("."))
    parser.add_argument("--base-branch", default="main")
    parser.add_argument(
        "--unit",
        action="append",
        dest="units",
        default=[],
        help="Unit id (repeatable); used in PR title/body only",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print planned branch/files without committing",
    )
    args = parser.parse_args(argv)
    units = [u.strip() for u in args.units if u and u.strip()]
    try:
        return publish(
            repo=args.repo.resolve(),
            base_branch=args.base_branch.strip() or "main",
            unit_ids=units or ["(unspecified)"],
            dry_run=bool(args.dry_run),
        )
    except RuntimeError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
