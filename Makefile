.PHONY: help sync-semantic check check-pandoc test lint lint-fix validate-book-specs validate-editorial-preservation build-book generate-typst-manifest generate-books-manifest validate-books-manifest verify-books-manifest verify-semantic-yaml validate-semantic-entities validate-discovery-content report-semantic-completeness lint-semantic-graph generate-book-cover-assets validate-book-cover-assets generate-semantic-manifest validate-semantic-manifest verify-semantic-manifest verify-semantic-ontology compare-site-discovery compare-manifest-parity install-local-manifest-for-site propose-semantic-enrichment promote-semantic-enrichment render-semantic-glossary extract-semantic-glossary-drafts scan-book-glossary-usage discover-book-glossary-candidates extract-semantic-pattern-drafts extract-semantic-source-drafts promote-semantic-source-drafts dedupe-semantic-sources backfill-source-metadata derive-thinker-drafts promote-thinker-drafts infer-semantic-source-links audit-semantic-metadata-quality audit-semantic-graph audit-bibliography-semantic-drift reconcile-bibliography-semantic-drift normalize-semantic-metadata docx-to-md md-to-docx import-docx import-docx-dir import-gdoc-html import-observer-patterns-html split-observer-patterns install-typst export-typst-pdf export-docx export-docx-by-part export-kindle-epub export-pdf export-all-docx export-ingramspark-epub export-ingramspark-print build-ingramspark-pdfx-proof validate-ingramspark-print-cover package-ingramspark preflight-ingramspark install-epubcheck clean-import-md spellcheck typography-check-how-meaning-moves

PANDOC ?= pandoc
CODESPELL ?= codespell
BOOK_STEM_PY ?= python3 tools/book_output_stem.py
# make build-book DIR=… OUT_DIR=build/… FORMATS="docx epub pdf"
FORMATS ?= docx epub
# Default book tree for spellcheck; override for another volume, e.g. SPELLCHECK_DIR=books/other-book/v1
SPELLCHECK_DIR ?= books/when-others-look-to-you/v1
MANIFEST_OUT ?= build/books-manifest.json
SEMANTIC_MANIFEST_OUT ?= build/semantic-manifest.json
BOOK_COVER_ASSETS_OUT ?= build/site-assets/book-covers
MANIFEST_REF ?= main
MANIFEST_RELEASE_TAG ?= latest
# Optional space-separated book ids for promote-semantic-source-drafts (default: all draft folders).
SOURCE_PROMOTE_BOOK_IDS ?=
# Set to 1 to skip --prune when promoting from all draft folders (keep extra semantic/sources/*.yml).
SOURCE_PROMOTE_NO_PRUNE ?=

help:
	@echo "Pandoc conversion helpers"
	@echo ""
	@echo "Targets:"
	@echo "  make sync-semantic  (uv sync --frozen --only-group semantic; Vercel/site lightweight)"
	@echo "  make docx-to-md IN=path/to/input.docx [OUT=path/to/output.md]"
	@echo "  make md-to-docx IN=path/to/input.md [OUT=path/to/output.docx]"
	@echo "  make import-docx"
	@echo "  make import-docx-dir DIR=path/to/folder [OVERWRITE=1]"
	@echo "  make export-docx DIR=path/to/book-folder [OUT_STEM=basename]"
	@echo "  make export-docx-by-part DIR=path/to/book-folder [OUT_STEM=basename] [PARTS=act-1-the-choice,act-2-the-gift]"
	@echo "  make export-kindle-epub DIR=path/to/book-folder [OUT_STEM=basename]"
	@echo "  make export-pdf DIR=path/to/book-folder [OUT_STEM=basename]"
	@echo "  make export-ingramspark-epub DIR=path/to/book-folder"
	@echo "  make export-ingramspark-print DIR=path/to/book-folder"
	@echo "  make build-ingramspark-pdfx-proof"
	@echo "  make validate-ingramspark-print-cover DIR=path/to/book-folder"
	@echo "  make preflight-ingramspark DIR=path/to/book-folder [EBOOK_ONLY=1|PRINT_ONLY=1]"
	@echo "  make package-ingramspark DIR=path/to/book-folder [EBOOK_ONLY=1|PRINT_ONLY=1]"
	@echo "  make install-epubcheck [EPUBCHECK_VERSION=5.3.0]"
	@echo "  make export-all-docx"
	@echo "  make build-book DIR=path/from/repo/root [OUT_DIR=build/...] [FORMATS=\"docx epub pdf\"]"
	@echo "  make generate-typst-manifest DIR=path/to/poetry-book-folder"
	@echo "  make test  (pytest: manifest + semantic YAML pipeline smoke tests)"
	@echo "  make lint  (ruff check + format --check on tools/, scripts/, tests/)"
	@echo "  make lint-fix  (ruff check --fix + ruff format; writes files)"
	@echo "  make check  (lint + pytest; run before commit/push when Python changed)"
	@echo "  make validate-book-specs"
	@echo "  make validate-editorial-preservation BOOK_DIR=books/when-others-look-to-you/v1"
	@echo "  make generate-books-manifest [MANIFEST_OUT=build/books-manifest.json] [MANIFEST_REF=main] [MANIFEST_RELEASE_TAG=latest] [GITHUB_REPOSITORY=owner/repo]"
	@echo "  make validate-books-manifest [MANIFEST=build/books-manifest.json]"
	@echo "  make verify-books-manifest [MANIFEST_OUT=build/books-manifest.json]"
	@echo "  make generate-book-cover-assets  (WebP detail/card/thumbnail → build/site-assets/book-covers)"
	@echo "  make validate-book-cover-assets  (parity of generated covers + optional site install)"
	@echo "  make generate-semantic-manifest [SEMANTIC_MANIFEST_OUT=build/semantic-manifest.json] [MANIFEST_REF=main] [MANIFEST_RELEASE_TAG=latest] [GITHUB_REPOSITORY=owner/repo]"
	@echo "  make compare-manifest-parity  (local build/ vs GitHub latest release; Stage B)"
	@echo "  make install-local-manifest-for-site  (Stage C: copy build/ → apps/site/data/local-*.json + manuscripts + public/generated/book-covers)"
	@echo "  make verify-semantic-yaml  (parse + slug checks + prose audit; use before manifest)"
	@echo "  make validate-semantic-entities  (JSON Schema + reference checks on semantic/**/*.yml)"
	@echo "  make lint-semantic-graph  (graph quality warnings; LINT_STRICT=1 to fail)"
	@echo "  make validate-semantic-manifest [SEMANTIC_MANIFEST=build/semantic-manifest.json]"
	@echo "  make verify-semantic-manifest [SEMANTIC_MANIFEST_OUT=build/semantic-manifest.json]"
	@echo "  make verify-semantic-ontology  (entities + yaml + manifest pipeline)"
	@echo "  make report-semantic-completeness  (public work enrichment coverage → reports/semantic-completeness.{md,json})"
	@echo "  make audit-semantic-graph  (unified graph data-quality audit → reports/semantic-graph-audit.{json,md})"
	@echo "  make audit-semantic-metadata-quality  (source/thinker display metadata → reports/)"
	@echo "  make audit-thinker-concepts  (thinker↔concept coverage → reports/)"
	@echo "  make audit-bibliography-semantic-drift  (biblio ↔ sources/thinkers → reports/bibliography-semantic-drift.{md,json})"
	@echo "  make reconcile-bibliography-semantic-drift  (apply relatedBooks patches + sync thinker works from audit JSON)"
	@echo "  make render-semantic-glossary MANIFEST=build/semantic-manifest.json OUT=path/to/glossary.md"
	@echo "  make extract-semantic-glossary-drafts GLOSSARY_IN=books/.../glossary.md BOOK_ID=book-slug-from-book-yml"
	@echo "  make scan-book-glossary-usage BOOK_DIR=books/... [GLOSSARY_SCOPE=book|all]"
	@echo "  make discover-book-glossary-candidates BOOK_DIR=books/... [GLOSSARY_WRITE_DRAFTS=1]"
	@echo "  make extract-semantic-pattern-drafts PATTERN_IN=books/.../appendix-....md BOOK_ID=book-slug-from-book-yml"
	@echo "  make extract-semantic-source-drafts BIBLIO_IN=books/.../bibliography.md BOOK_ID=book-slug-from-book-yml"
	@echo "  make promote-semantic-source-drafts [SOURCE_PROMOTE_BOOK_IDS='id1 id2'] [SOURCE_PROMOTE_NO_PRUNE=1]"
	@echo "  make backfill-source-metadata [SOURCE_BACKFILL_DRY_RUN=1] [SOURCE_BACKFILL_OVERWRITE=1] [SOURCE_BACKFILL_LIMIT=N]"
	@echo "  make derive-thinker-drafts [THINKER_DRAFTS_DRY_RUN=1]"
	@echo "  make promote-thinker-drafts [THINKER_PROMOTE_PILOT_ONLY=1] [THINKER_PROMOTE_OVERRIDES=semantic/thinkers-batch-2-overrides.yml] [THINKER_PROMOTE_DRY_RUN=1]"
	@echo "  make propose-semantic-enrichment BOOK_DIR=books/... AGENT_TYPE=recognition-signals|all [ENRICH_OVERWRITE=1]"
	@echo "  make promote-semantic-enrichment [ENRICH_BOOK_ID=coupling] [ENRICH_FIELD=recognitionSignals]"
	@echo "  make infer-semantic-source-links"
	@echo "  make clean-import-md"
	@echo "  make spellcheck [SPELLCHECK_DIR=books/when-others-look-to-you/v1] [CODESPELL=codespell]"
	@echo "  make typography-check-how-meaning-moves"
	@echo ""
	@echo "Notes:"
	@echo "  - If OUT is omitted, output is created next to IN."
	@echo "  - import-docx converts every ./**/import.docx to ./**/import.md."
	@echo "  - import-docx-dir converts every .docx under DIR to side-by-side .md."
	@echo "  - import-docx-dir skips existing .md files unless OVERWRITE=1."
	@echo "  - export-docx combines DIR/index.md plus linked .md files into DIR/<stem>.docx."
	@echo "  - export-docx-by-part writes one DOCX per ## Part … / ## Act … section (e.g. the-relay-act-1-the-absence.docx)."
	@echo "  - export-kindle-epub creates DIR/<stem>.epub (flattened custom blocks, shallow nav TOC)."
	@echo "  - export-ingramspark-epub / export-ingramspark-print / package-ingramspark write build/ingramspark/<book-id>/ (opt-in target; not a public format)."
	@echo "  - build-ingramspark-pdfx-proof writes build/ingramspark/_pdfx-proof/ (isolated PDF/X construction gate)."
	@echo "  - validate-ingramspark-print-cover checks wrap + template-meta.yml and stages {isbn}_cvr.pdf."
	@echo "  - export-pdf creates DIR/<stem>.pdf using scripts/export_pdf.py and book.yml PDF settings."
	@echo "  - <stem> defaults to DIR relative to repo root with path segments joined by '-' (override with OUT_STEM)."
	@echo "  - SVG under DIR/docs/diagrams/ rasterize to DIR/export-assets/diagrams/ (rsvg-convert or magick)."
	@echo "  - export-all-docx runs export-docx for every publish-enabled book.yml that includes docx."
	@echo "  - build-book runs scripts/build.py for DIR (default FORMATS: docx epub); default OUT_DIR is build/<DIR-with-slashes-as-dashes>. Poetry/Typst PDF builds do not require pandoc."
	@echo "  - generate-books-manifest aggregates /books and metadata-backed /upcoming entries into MANIFEST_OUT."
	@echo "  - validate-books-manifest validates MANIFEST JSON against schema/books-manifest.schema.json."
	@echo "  - verify-books-manifest runs both generation and validation for local CI parity."
	@echo "  - generate-semantic-manifest builds semantic-manifest.json (books + glossary + patterns + sources + relationships)."
	@echo "  - validate-semantic-manifest validates against schema/semantic-manifest.schema.json."
	@echo "  - verify-semantic-yaml checks all semantic/**/*.yml (excludes _drafts); --strict-prose in target below."
	@echo "  - verify-semantic-manifest runs verify-semantic-yaml, semantic generation, and validation."
	@echo "  - render-semantic-glossary renders templates/glossary.md.j2 from a semantic manifest JSON."
	@echo "  - extract-semantic-glossary-drafts / extract-semantic-pattern-drafts / extract-semantic-source-drafts emit reviewable YAML under semantic/_drafts/generated/ (gitignored)."
	@echo "  - extract-semantic-source-drafts supports list, Pandoc Bibliography divs, and plain Chicago paragraphs (see tools/bibliography_parse.py)."
	@echo "  - audit-bibliography-semantic-drift compares bibliographies to semantic/sources + thinkers (read-only report)."
	@echo "  - promote-semantic-source-drafts merges semantic/_drafts/generated/sources/<book-id>/ into semantic/sources/ (Author — Title names + v1.5 metadata). Full promote (no SOURCE_PROMOTE_BOOK_IDS) passes --prune unless SOURCE_PROMOTE_NO_PRUNE=1."
	@echo "  - backfill-source-metadata adds creatorSlugs, title, citation, sourceKind to existing semantic/sources/*.yml (see .cursor/skills/semantic-sources/)."
	@echo "  - derive-thinker-drafts aggregates enriched sources into semantic/_drafts/generated/thinkers/ (see .cursor/skills/semantic-thinkers/)."
	@echo "  - promote-thinker-drafts copies reviewed drafts into semantic/thinkers/ (use THINKER_PROMOTE_PILOT_ONLY=1 with default overrides, or THINKER_PROMOTE_OVERRIDES=path for batch files)."
	@echo "  - propose-semantic-enrichment scaffolds gitignored drafts under semantic/_drafts/enrichment/<book-id>/<agent-type>/ (see docs/agents/semantic/)."
	@echo "  - promote-semantic-enrichment merges approved enrichment drafts into semantic/glossary|patterns|situations/."
	@echo "  - infer-semantic-source-links scans manuscript markdown for co-mentions (sources: concepts/patterns; patterns: relatedSources). Preview with: python3 tools/infer_semantic_source_links.py --repo . --dry-run"
	@echo "  - spellcheck runs codespell on SPELLCHECK_DIR using that dir's .codespellrc."
	@echo "  - Requires pandoc installed and available in PATH."
	@echo "  - spellcheck requires codespell (pip install codespell). If it is not on PATH, set CODESPELL to the full path."
	@echo "  - book.yml validation and front-matter generation require Python packages: see requirements.txt (jinja2, pyyaml, jsonschema, pytest, ruff)."

check-pandoc:
	@command -v "$(PANDOC)" >/dev/null 2>&1 || { \
		echo "Error: pandoc not found. Install pandoc first."; \
		exit 1; \
	}

test:
	python3 -m pytest tests/ -q

check: lint test

lint:
	python3 -m ruff check tools scripts tests
	python3 -m ruff format --check tools scripts tests

lint-fix:
	python3 -m ruff check --fix tools scripts tests
	python3 -m ruff format tools scripts tests

validate-book-specs:
	@python3 tools/validate_book_specs.py --repo .

validate-publication-manuscript:
	@test -n "$(DIR)" || { echo "Usage: make validate-publication-manuscript DIR=path/from/repo/root [BOUNDARY=1]"; exit 1; }
	@if [ "$(BOUNDARY)" = "1" ]; then \
		python3 tools/validate_publication_manuscript.py --book-dir "$(DIR)" --boundary; \
	else \
		python3 tools/validate_publication_manuscript.py --book-dir "$(DIR)"; \
	fi

validate-editorial-preservation:
	@test -n "$(BOOK_DIR)" || { echo "Usage: make validate-editorial-preservation BOOK_DIR=books/when-others-look-to-you/v1"; exit 1; }
	@python3 tools/validate_editorial_preservation.py --repo . --book-dir "$(BOOK_DIR)"

build-book:
	@test -n "$(DIR)" || { echo "Usage: make build-book DIR=path/from/repo/root [OUT_DIR=build/...] [FORMATS=\"docx epub pdf\"]"; exit 1; }
	@out="$(OUT_DIR)"; \
	test -n "$$out" || out="build/$$(echo "$(DIR)" | tr '/' '-')"; \
	python3 scripts/build.py --repo . --book-dir "$(DIR)" --out-dir "$$out" $(foreach f,$(FORMATS),--format $(f))

generate-typst-manifest:
	@test -n "$(DIR)" || { echo "Usage: make generate-typst-manifest DIR=path/to/poetry-book-folder"; exit 1; }
	@python3 tools/generate_typst_manifest.py --book-dir "$(DIR)"

generate-reference-docx:
	@test -n "$(OUT)" || { echo "Usage: make generate-reference-docx OUT=path/to/reference.docx [TEMPLATE=path/to/template.docx]"; exit 1; }
	@python3 tools/generate_reference_docx.py --out "$(OUT)" $(if $(TEMPLATE),--template "$(TEMPLATE)",)

generate-books-manifest: validate-book-specs
	@repo="$${GITHUB_REPOSITORY:-$$(git remote get-url origin 2>/dev/null | sed -e 's#^git@github.com:##' -e 's#^https://github.com/##' -e 's#\.git$$##')}"; \
	python3 tools/generate_books_manifest.py \
		--repo . \
		--out "$(MANIFEST_OUT)" \
		--github-repository "$$repo" \
		--github-ref "$(MANIFEST_REF)" \
		--release-tag "$(MANIFEST_RELEASE_TAG)"

validate-books-manifest:
	@manifest="$${MANIFEST:-$(MANIFEST_OUT)}"; \
	python3 tools/validate_books_manifest.py --repo . --manifest "$$manifest"

verify-books-manifest: generate-books-manifest validate-books-manifest

verify-semantic-yaml:
	python3 tools/verify_semantic_yaml.py --repo . --strict-prose

validate-semantic-entities:
	python3 tools/validate_semantic_entities.py --repo . --strict-refs

validate-discovery-content:
	python3 tools/validate_discovery_content.py --repo .

report-semantic-completeness:
	python3 tools/report_semantic_completeness.py --repo . \
		--md-out reports/semantic-completeness.md \
		--json-out reports/semantic-completeness.json \
		--manifest $(if $(MANIFEST),$(MANIFEST),$(SEMANTIC_MANIFEST_OUT)) \
		--print-warnings


compare-site-discovery:
	python3 tools/compare_site_discovery_data.py --repo . \
		--fixtures docs/migrations/fixtures/site-discovery \
		--out docs/migrations/parity-report.md

# Stage B: local generated manifest vs public release (production still remote).
compare-manifest-parity:
	python3 tools/compare_manifest_parity.py \
		--local "$(SEMANTIC_MANIFEST_OUT)" \
		--json-out reports/manifest-parity.json \
		--md-out reports/manifest-parity.md

# Stage C: install same-checkout manifest for site preview builds (gitignored local-*.json).
install-local-manifest-for-site:
	python3 scripts/install_local_manifest_for_site.py --repo .

generate-book-cover-assets:
	node packages/corpus-tasks/scripts/generate-book-cover-assets.mjs --repo . --out "$(BOOK_COVER_ASSETS_OUT)" $(if $(ALLOW_MISSING_WEB_COVERS),--allow-missing-sharp,)

validate-book-cover-assets:
	node packages/corpus-tasks/scripts/validate-book-cover-assets.mjs --repo . --out "$(BOOK_COVER_ASSETS_OUT)" \
		$(if $(REQUIRE_INSTALLED),--require-installed,) \
		$(if $(REQUIRE_SEMANTIC),--require-semantic --semantic-manifest "$(SEMANTIC_MANIFEST_OUT)",)

# Lightweight Python deps for manifest generate (Vercel / site-oriented builds).
sync-semantic:
	uv sync --frozen --only-group semantic

lint-semantic-graph:
	python3 tools/lint_semantic_graph.py --repo . $(if $(LINT_STRICT),--strict,)

audit-thinker-concepts:
	python3 tools/audit_thinker_concepts.py --repo . --out reports/thinker-concept-audit.md

audit-semantic-metadata-quality:
	python3 tools/audit_semantic_metadata_quality.py --repo . --out reports/semantic-metadata-quality-audit.md

audit-semantic-graph:
	python3 tools/audit_semantic_graph.py --repo . \
		--json-out reports/semantic-graph-audit.json \
		--md-out reports/semantic-graph-audit.md

audit-bibliography-semantic-drift:
	python3 tools/audit_bibliography_semantic_drift.py --repo . \
		--md-out reports/bibliography-semantic-drift.md \
		--json-out reports/bibliography-semantic-drift.json

reconcile-bibliography-semantic-drift:
	python3 tools/reconcile_bibliography_semantic_drift.py --repo . \
		--apply-related-books --sync-thinkers \
		--audit reports/bibliography-semantic-drift.json

normalize-semantic-metadata:
	@python3 tools/normalize_semantic_metadata.py --repo . $(if $(DRY_RUN),--dry-run,) $(if $(ALL),--all,)

align-creator-slugs:
	python3 tools/align_creator_slugs.py --repo . --apply

generate-semantic-manifest: validate-book-specs verify-semantic-yaml generate-book-cover-assets
	@repo="$${GITHUB_REPOSITORY:-$$(git remote get-url origin 2>/dev/null | sed -e 's#^git@github.com:##' -e 's#^https://github.com/##' -e 's#\.git$$##')}"; \
	python3 tools/generate_semantic_manifest.py \
		--repo . \
		--out "$(SEMANTIC_MANIFEST_OUT)" \
		--github-repository "$$repo" \
		--github-ref "$(MANIFEST_REF)" \
		--release-tag "$(MANIFEST_RELEASE_TAG)"

validate-semantic-manifest:
	@manifest="$${SEMANTIC_MANIFEST:-$(SEMANTIC_MANIFEST_OUT)}"; \
	python3 tools/validate_semantic_manifest.py --repo . --manifest "$$manifest"

verify-semantic-manifest: generate-semantic-manifest validate-semantic-manifest

verify-semantic-ontology: validate-semantic-entities verify-semantic-yaml verify-semantic-manifest validate-discovery-content lint-semantic-graph

render-semantic-glossary:
	@test -n "$(MANIFEST)" || { echo "Usage: make render-semantic-glossary MANIFEST=build/semantic-manifest.json OUT=books/.../glossary.md"; exit 1; }
	@test -n "$(OUT)" || { echo "Usage: make render-semantic-glossary MANIFEST=... OUT=..."; exit 1; }
	@python3 tools/render_semantic_glossary.py --repo . --manifest "$(MANIFEST)" --out "$(OUT)"

extract-semantic-glossary-drafts:
	@test -n "$(GLOSSARY_IN)" && test -n "$(BOOK_ID)" || { echo "Usage: make extract-semantic-glossary-drafts GLOSSARY_IN=books/.../glossary.md BOOK_ID=when-others-look-to-you-v1"; exit 1; }
	@python3 tools/extract_semantic_glossary_drafts.py --repo . --input "$(GLOSSARY_IN)" --book-id "$(BOOK_ID)"

scan-book-glossary-usage:
	@test -n "$(BOOK_DIR)" || { echo "Usage: make scan-book-glossary-usage BOOK_DIR=books/coupling"; exit 1; }
	@python3 tools/scan_book_glossary_usage.py --repo . --book-dir "$(BOOK_DIR)" \
	  --scope "$${GLOSSARY_SCOPE:-book}" \
	  --out "$(BOOK_DIR)/semantic-reports/glossary-usage.md"

discover-book-glossary-candidates:
	@test -n "$(BOOK_DIR)" || { echo "Usage: make discover-book-glossary-candidates BOOK_DIR=books/coupling"; exit 1; }
	@python3 tools/discover_book_glossary_candidates.py --repo . --book-dir "$(BOOK_DIR)" \
	  $(if $(GLOSSARY_WRITE_DRAFTS),--write-drafts,) \
	  --out "$(BOOK_DIR)/semantic-reports/glossary-candidates.md"

extract-semantic-pattern-drafts:
	@test -n "$(PATTERN_IN)" && test -n "$(BOOK_ID)" || { echo "Usage: make extract-semantic-pattern-drafts PATTERN_IN=books/.../appendix.md BOOK_ID=how-meaning-moves"; exit 1; }
	@python3 tools/extract_semantic_pattern_drafts.py --repo . --input "$(PATTERN_IN)" --book-id "$(BOOK_ID)"

extract-semantic-source-drafts:
	@test -n "$(BIBLIO_IN)" && test -n "$(BOOK_ID)" || { echo "Usage: make extract-semantic-source-drafts BIBLIO_IN=books/.../bibliography.md BOOK_ID=how-meaning-moves"; exit 1; }
	@python3 tools/extract_semantic_source_drafts.py --repo . --input "$(BIBLIO_IN)" --book-id "$(BOOK_ID)"

promote-semantic-source-drafts:
	@prune=; \
	if [ -z "$(SOURCE_PROMOTE_BOOK_IDS)" ] && [ -z "$(SOURCE_PROMOTE_NO_PRUNE)" ]; then \
	  prune=--prune; \
	fi; \
	if [ -n "$(SOURCE_PROMOTE_BOOK_IDS)" ]; then \
	  python3 tools/promote_semantic_source_drafts.py --repo . $(foreach id,$(SOURCE_PROMOTE_BOOK_IDS),--book-id $(id)); \
	else \
	  python3 tools/promote_semantic_source_drafts.py --repo . $$prune; \
	fi

dedupe-semantic-sources:
	@python3 tools/dedupe_semantic_sources.py --repo .

backfill-source-metadata:
	@python3 tools/backfill_source_metadata.py --repo . $(if $(SOURCE_BACKFILL_DRY_RUN),--dry-run,) $(if $(SOURCE_BACKFILL_OVERWRITE),--overwrite,) $(if $(SOURCE_BACKFILL_LIMIT),--limit $(SOURCE_BACKFILL_LIMIT),)

derive-thinker-drafts:
	@python3 tools/derive_thinker_drafts.py --repo . $(if $(THINKER_DRAFTS_DRY_RUN),--dry-run,)

promote-thinker-drafts:
	@python3 tools/promote_thinker_drafts.py --repo . \
	  $(if $(THINKER_PROMOTE_OVERRIDES),--overrides $(THINKER_PROMOTE_OVERRIDES),) \
	  $(if $(THINKER_PROMOTE_PILOT_ONLY),--pilot-only,) \
	  $(if $(THINKER_PROMOTE_DRY_RUN),--dry-run,)

propose-semantic-enrichment:
	@test -n "$(BOOK_DIR)" && test -n "$(AGENT_TYPE)" || { echo "Usage: make propose-semantic-enrichment BOOK_DIR=books/coupling AGENT_TYPE=recognition-signals"; exit 1; }
	@python3 tools/propose_semantic_enrichment.py --repo . --book-dir "$(BOOK_DIR)" --agent-type "$(AGENT_TYPE)" \
	  $(if $(ENRICH_OVERWRITE),--overwrite,) $(if $(ENRICH_ALL_ENTITIES),--all-entities,)

promote-semantic-enrichment:
	@python3 tools/promote_semantic_enrichment.py --repo . \
	  $(foreach id,$(ENRICH_BOOK_ID),--book-id $(id)) \
	  $(foreach f,$(ENRICH_FIELD),--field $(f))

infer-semantic-source-links:
	@python3 tools/infer_semantic_source_links.py --repo .

docx-to-md: check-pandoc
	@test -n "$(IN)" || { echo "Usage: make docx-to-md IN=file.docx [OUT=file.md]"; exit 1; }
	@out="$${OUT:-$${IN%.docx}.md}"; \
	"$(PANDOC)" "$(IN)" -t gfm -o "$$out"; \
	echo "Created $$out"

md-to-docx: check-pandoc
	@test -n "$(IN)" || { echo "Usage: make md-to-docx IN=file.md [OUT=file.docx]"; exit 1; }
	@out="$${OUT:-$${IN%.md}.docx}"; \
	"$(PANDOC)" "$(IN)" -o "$$out"; \
	echo "Created $$out"

import-docx: check-pandoc
	@files="$$(find . -type f -name 'import.docx')"; \
	if [ -z "$$files" ]; then \
		echo "No import.docx files found."; \
		exit 0; \
	fi; \
	echo "$$files" | while IFS= read -r file; do \
		out="$${file%.docx}.md"; \
		index="$$(dirname "$$file")/index.md"; \
		if [ -f "$$out" ]; then \
			echo "Skipped $$file (already imported: $$out)"; \
			continue; \
		fi; \
		if [ -f "$$index" ]; then \
			echo "Skipped $$file (index exists: $$index)"; \
			continue; \
		fi; \
		"$(PANDOC)" "$$file" -t gfm -o "$$out"; \
		echo "Created $$out"; \
	done

import-docx-dir: check-pandoc
	@test -n "$(DIR)" || { echo "Usage: make import-docx-dir DIR=path/to/folder [OVERWRITE=1]"; exit 1; }
	@test -d "$(DIR)" || { echo "Error: directory not found: $(DIR)"; exit 1; }
	@files="$$(find "$(DIR)" -type f -name '*.docx')"; \
	if [ -z "$$files" ]; then \
		echo "No .docx files found under $(DIR)."; \
		exit 0; \
	fi; \
	echo "$$files" | while IFS= read -r file; do \
		out="$${file%.docx}.md"; \
		if [ -f "$$out" ] && [ "$(OVERWRITE)" != "1" ]; then \
			echo "Skipped $$file (already exists: $$out)"; \
			continue; \
		fi; \
		"$(PANDOC)" "$$file" -t gfm -o "$$out"; \
		echo "Created $$out"; \
	done

export-docx: check-pandoc
	@test -n "$(DIR)" || { echo "Usage: make export-docx DIR=path/to/book-folder [OUT_STEM=basename]"; exit 1; }
	@python3 scripts/export_docx.py --repo . --book-dir "$(DIR)" --out-stem "$(OUT_STEM)"

export-docx-by-part: check-pandoc
	@test -n "$(DIR)" || { echo "Usage: make export-docx-by-part DIR=path/to/book-folder [OUT_STEM=basename] [PARTS=slug1,slug2]"; exit 1; }
	@python3 scripts/export_docx.py --repo . --book-dir "$(DIR)" --out-stem "$(OUT_STEM)" --by-part $(if $(PARTS),--parts "$(PARTS)",)

# Kindle EPUB: toc-depth=1 keeps nav TOC to # headings only; kindle-flatten injects Part # lines from index.md.
export-kindle-epub: check-pandoc
	@test -n "$(DIR)" || { echo "Usage: make export-kindle-epub DIR=path/to/book-folder [OUT_STEM=basename]"; exit 1; }
	@python3 scripts/export_epub.py --repo . --book-dir "$(DIR)" --out-stem "$(OUT_STEM)"

# IngramSpark production EPUB + RGB JPG (publishing.targets.ingramspark; not a site format).
export-ingramspark-epub: check-pandoc
	@test -n "$(DIR)" || { echo "Usage: make export-ingramspark-epub DIR=path/to/book-folder"; exit 1; }
	@python3 scripts/export_ingramspark_epub.py --repo . --book-dir "$(DIR)"

# IngramSpark print interior PDF ({isbn}_txt.pdf) at print.trim; B&W → DeviceGray.
export-ingramspark-print: check-pandoc
	@test -n "$(DIR)" || { echo "Usage: make export-ingramspark-print DIR=path/to/book-folder"; exit 1; }
	@python3 scripts/export_ingramspark_print.py --repo . --book-dir "$(DIR)" $(if $(APPLY_PDFX),--apply-pdfx-proof-construction,)

# Isolated grayscale PDF/X-3 proof (INGRAM-004 first gate; not a book export).
build-ingramspark-pdfx-proof:
	@python3 scripts/build_ingramspark_pdfx_proof.py --repo .

# Validate supplied wrap + template-meta.yml; stage {isbn}_cvr.pdf when checks pass.
validate-ingramspark-print-cover:
	@test -n "$(DIR)" || { echo "Usage: make validate-ingramspark-print-cover DIR=path/to/book-folder [INTERIOR_PAGE_COUNT=N]"; exit 1; }
	@python3 scripts/validate_ingramspark_print_cover.py --repo . --book-dir "$(DIR)" $(if $(INTERIOR_PAGE_COUNT),--interior-page-count $(INTERIOR_PAGE_COUNT),)

# Unified profile-driven preflight (JSON + text). Does not build a ZIP.
preflight-ingramspark: check-pandoc install-epubcheck
	@test -n "$(DIR)" || { echo "Usage: make preflight-ingramspark DIR=path/to/book-folder [EBOOK_ONLY=1|PRINT_ONLY=1] [SKIP_BUILD=1]"; exit 1; }
	@python3 scripts/preflight_ingramspark.py --repo . --book-dir "$(DIR)" \
		$(if $(EBOOK_ONLY),--ebook-only,) \
		$(if $(PRINT_ONLY),--print-only,) \
		$(if $(SKIP_BUILD),--skip-build,)

# Submission-kit ZIP for enabled modes (ebook and/or print). Optional EBOOK_ONLY=1 / PRINT_ONLY=1.
package-ingramspark: check-pandoc install-epubcheck
	@test -n "$(DIR)" || { echo "Usage: make package-ingramspark DIR=path/to/book-folder [EBOOK_ONLY=1|PRINT_ONLY=1] [SKIP_BUILD=1]"; exit 1; }
	@python3 scripts/package_ingramspark.py --repo . --book-dir "$(DIR)" \
		$(if $(EBOOK_ONLY),--ebook-only,) \
		$(if $(PRINT_ONLY),--print-only,) \
		$(if $(SKIP_BUILD),--skip-build,)

EPUBCHECK_VERSION ?= 5.3.0
install-epubcheck:
	@EPUBCHECK_VERSION="$(EPUBCHECK_VERSION)" bash scripts/install_epubcheck.sh >/dev/null

export-pdf: check-pandoc
	@test -n "$(DIR)" || { echo "Usage: make export-pdf DIR=path/to/book-folder [OUT_STEM=basename]"; exit 1; }
	@python3 scripts/export_pdf.py --repo . --book-dir "$(DIR)" --out-stem "$(OUT_STEM)"

import-gdoc-html:
	@test -n "$(DOC)" && test -n "$(DIR)" || { echo "Usage: make import-gdoc-html DOC=url-or-id DIR=path/to/book-folder"; exit 1; }
	@python3 tools/import_google_doc_html.py "$(DOC)" --book-dir "$(DIR)"

import-observer-patterns-html:
	@$(MAKE) --no-print-directory import-gdoc-html DOC="https://docs.google.com/document/d/1TtYERQNZ-bWmiex6kRAyyAqvSXzssYfeuHM2tGmZKoU/edit" DIR=books/observer-patterns

split-observer-patterns:
	@python3 tools/html_to_observer_patterns.py --book-dir books/observer-patterns --extract-cover

install-typst:
	@bash scripts/install_typst.sh

export-typst-pdf:
	@test -n "$(DIR)" || { echo "Usage: make export-typst-pdf DIR=path/to/book-folder [OUT_STEM=basename] [TYPST=typst]"; exit 1; }
	@stem="$${OUT_STEM:-$$($(BOOK_STEM_PY) "$(DIR)")}"; \
	python3 scripts/export_typst_pdf.py --repo . --book-dir "$(DIR)" --out-stem "$$stem" --typst "$${TYPST:-typst}"

export-all-docx: check-pandoc
	@dirs="$$(python3 tools/ci_affected_books.py --repo . --all --dirs --format docx)"; \
	if [ -z "$$dirs" ]; then \
		echo "No publish-enabled DOCX books found."; \
		exit 0; \
	fi; \
	echo "$$dirs" | while IFS= read -r dir; do \
		$(MAKE) --no-print-directory export-docx DIR="$$dir"; \
	done

clean-import-md:
	@files="$$(find . -type f -name 'import.md')"; \
	if [ -z "$$files" ]; then \
		echo "No import.md files found."; \
		exit 0; \
	fi; \
	echo "$$files" | while IFS= read -r file; do \
		rm "$$file"; \
		echo "Removed $$file"; \
	done

spellcheck:
	@command -v "$(CODESPELL)" >/dev/null 2>&1 || { \
		echo "Error: codespell not found. Install with: pip install codespell"; \
		exit 1; \
	}
	@test -f "$(SPELLCHECK_DIR)/.codespellrc" || { echo "Error: $(SPELLCHECK_DIR)/.codespellrc not found."; exit 1; }
	@$(CODESPELL) --config "$(SPELLCHECK_DIR)/.codespellrc" "$(SPELLCHECK_DIR)"

typography-check-how-meaning-moves:
	@python3 tools/how_meaning_moves_typography_check.py
