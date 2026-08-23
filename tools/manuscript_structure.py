"""Compatibility shim — re-export after_certainty.manuscript.structure as this module."""

import importlib
import sys

_mod = importlib.import_module("after_certainty.manuscript.structure")
sys.modules[__name__] = _mod
