"""Smoke tests for the importable after_certainty package."""

from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

_REPO_ROOT = Path(__file__).resolve().parents[1]
_SRC = _REPO_ROOT / "src"

# Modules that previously depended on legacy tools/ shims (book_specs, etc.).
_ISOLATED_IMPORT_TARGETS = (
    "after_certainty.ingramspark.paths",
    "after_certainty.ingramspark.ebook_export",
    "after_certainty.ingramspark.ebook_cover",
    "after_certainty.ingramspark.print_export",
    "after_certainty.ingramspark.preflight",
    "after_certainty.chapter_audio.resolve",
)


def test_import_after_certainty_package() -> None:
    import after_certainty

    assert after_certainty.__version__ == "0.0.0"


def test_import_core_path_safety() -> None:
    from after_certainty.core.path_safety import PathSafetyError, ensure_under

    assert PathSafetyError.__name__ == "PathSafetyError"
    assert callable(ensure_under)


def test_import_specs_book_specs() -> None:
    from after_certainty.specs.book_specs import discover_book_spec_paths

    assert callable(discover_book_spec_paths)


def test_import_export_docx() -> None:
    from after_certainty.export.docx import export_docx, stage_docx_units

    assert callable(export_docx)
    assert callable(stage_docx_units)


def test_package_imports_without_tools_on_pythonpath() -> None:
    """Installed package modules must not require legacy tools/ shims on PYTHONPATH."""
    env = os.environ.copy()
    env["PYTHONPATH"] = _SRC.as_posix()
    env.pop("PYTHONDONTWRITEBYTECODE", None)

    for module in _ISOLATED_IMPORT_TARGETS:
        proc = subprocess.run(
            [
                sys.executable,
                "-c",
                f"import {module}; print('ok')",
            ],
            cwd=_REPO_ROOT,
            env=env,
            capture_output=True,
            text=True,
            check=False,
        )
        assert proc.returncode == 0, (
            f"import {module} failed without tools/ on PYTHONPATH:\n"
            f"stdout: {proc.stdout}\nstderr: {proc.stderr}"
        )

    proc = subprocess.run(
        [
            sys.executable,
            "-c",
            (
                "from pathlib import Path\n"
                "from after_certainty.specs.book_specs import upcoming_export_stems\n"
                "upcoming_export_stems(Path('.'))\n"
                "print('ok')"
            ),
        ],
        cwd=_REPO_ROOT,
        env=env,
        capture_output=True,
        text=True,
        check=False,
    )
    assert proc.returncode == 0, (
        "upcoming_export_stems failed without tools/ on PYTHONPATH:\n"
        f"stdout: {proc.stdout}\nstderr: {proc.stderr}"
    )
