"""Smoke tests for the importable after_certainty package."""


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
