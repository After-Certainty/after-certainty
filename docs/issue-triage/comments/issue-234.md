## Issue audit (Jul 2026)

**Status:** Not done — straightforward for agent

**Evidence:**
- Manifest root has `generatedAt` only; no per-entity `dateModified`
- Not in [`schema/semantic-manifest.schema.json`](https://github.com/ksteffe/after-certainty/blob/main/schema/semantic-manifest.schema.json) or [`tools/generate_semantic_manifest.py`](https://github.com/ksteffe/after-certainty/blob/main/tools/generate_semantic_manifest.py)

**Recommended action:** Labeled `agent-ready`. Implement in generator (YAML mtime or git log); coordinate site Zod if needed.
