"""Unit tests for Stage C install of local semantic-manifest into apps/site."""

from __future__ import annotations

import json
import sys
from pathlib import Path

SCRIPTS = Path(__file__).resolve().parent.parent / "scripts"
if str(SCRIPTS) not in sys.path:
    sys.path.insert(0, str(SCRIPTS))

import install_local_manifest_for_site as install  # noqa: E402


def _minimal_manifest(*, schema: str = "2.3") -> dict:
    return {
        "schemaVersion": schema,
        "generatedAt": "2026-07-24T00:00:00+00:00",
        "sourceCommit": "deadbeef",
        "contentVersion": "cv-1",
        "books": [{"slug": "after-certainty"}],
    }


def test_install_writes_gitignored_local_artifacts(tmp_path: Path) -> None:
    source = tmp_path / "semantic-manifest.json"
    site_data = tmp_path / "site-data"
    source.write_text(json.dumps(_minimal_manifest()), encoding="utf-8")

    code = install.main(
        [
            "--repo",
            str(tmp_path),
            "--source",
            str(source),
            "--site-data",
            str(site_data),
        ]
    )
    assert code == 0

    dest = site_data / "local-semantic-manifest.json"
    intended = site_data / "local-intended-manifest-release.json"
    assert dest.is_file()
    assert intended.is_file()

    loaded = json.loads(dest.read_text(encoding="utf-8"))
    assert loaded["schemaVersion"] == "2.3"
    assert loaded["sourceCommit"] == "deadbeef"
    assert len(loaded["books"]) == 1

    pin = json.loads(intended.read_text(encoding="utf-8"))
    assert pin["schemaVersion"] == "2.3"
    assert pin["sourceCommit"] == "deadbeef"
    assert pin["generatedAt"] == "2026-07-24T00:00:00+00:00"
    assert pin["contentVersion"] == "cv-1"
    assert pin["manifestUrl"] == "local:build/semantic-manifest.json"
    assert pin["source"] == "local-checkout"
    assert "syncedAt" in pin

    # Must not create or overwrite a committed-style fallback name.
    assert not (site_data / "semantic-manifest.json").exists()


def test_install_rejects_missing_source(tmp_path: Path) -> None:
    code = install.main(
        [
            "--repo",
            str(tmp_path),
            "--source",
            str(tmp_path / "missing.json"),
            "--site-data",
            str(tmp_path / "site-data"),
        ]
    )
    assert code == 1


def test_install_rejects_wrong_schema(tmp_path: Path) -> None:
    source = tmp_path / "semantic-manifest.json"
    source.write_text(json.dumps(_minimal_manifest(schema="2.2")), encoding="utf-8")
    code = install.main(
        [
            "--repo",
            str(tmp_path),
            "--source",
            str(source),
            "--site-data",
            str(tmp_path / "site-data"),
        ]
    )
    assert code == 1


def test_require_deploy_sha_accepts_match(tmp_path: Path) -> None:
    source = tmp_path / "semantic-manifest.json"
    source.write_text(json.dumps(_minimal_manifest()), encoding="utf-8")
    code = install.main(
        [
            "--repo",
            str(tmp_path),
            "--source",
            str(source),
            "--site-data",
            str(tmp_path / "site-data"),
            "--require-deploy-sha",
            "deadbeef",
        ]
    )
    assert code == 0
    assert (tmp_path / "site-data" / "local-semantic-manifest.json").is_file()


def test_require_deploy_sha_rejects_mismatch(tmp_path: Path) -> None:
    source = tmp_path / "semantic-manifest.json"
    source.write_text(json.dumps(_minimal_manifest()), encoding="utf-8")
    code = install.main(
        [
            "--repo",
            str(tmp_path),
            "--source",
            str(source),
            "--site-data",
            str(tmp_path / "site-data"),
            "--require-deploy-sha",
            "other",
            "--check-only",
        ]
    )
    assert code == 1
    assert not (tmp_path / "site-data" / "local-semantic-manifest.json").exists()
