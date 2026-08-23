"""Compatibility shim — re-export after_certainty.semantic.manifest.generate as this module."""

import importlib
import sys

_mod = importlib.import_module("after_certainty.semantic.manifest.generate")
sys.modules[__name__] = _mod

if __name__ == "__main__":
    _mod.main()
