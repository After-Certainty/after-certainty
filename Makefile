.PHONY: help check-pandoc validate-book-specs build-book docx-to-md md-to-docx import-docx import-docx-dir export-docx export-kindle-epub export-pdf export-all-docx clean-import-md spellcheck typography-check-how-meaning-moves

PANDOC ?= pandoc
CODESPELL ?= codespell
BOOK_STEM_PY ?= python3 tools/book_output_stem.py
# make build-book DIR=… OUT_DIR=build/… FORMATS="docx epub pdf"
FORMATS ?= docx epub
# Default book tree for spellcheck; override for another volume, e.g. SPELLCHECK_DIR=books/other-book/v1
SPELLCHECK_DIR ?= books/when-others-look-to-you/v1

help:
	@echo "Pandoc conversion helpers"
	@echo ""
	@echo "Targets:"
	@echo "  make docx-to-md IN=path/to/input.docx [OUT=path/to/output.md]"
	@echo "  make md-to-docx IN=path/to/input.md [OUT=path/to/output.docx]"
	@echo "  make import-docx"
	@echo "  make import-docx-dir DIR=path/to/folder [OVERWRITE=1]"
	@echo "  make export-docx DIR=path/to/book-folder [OUT_STEM=basename]"
	@echo "  make export-kindle-epub DIR=path/to/book-folder [OUT_STEM=basename]"
	@echo "  make export-pdf DIR=path/to/book-folder [OUT_STEM=basename]"
	@echo "  make export-all-docx"
	@echo "  make build-book DIR=path/from/repo/root [OUT_DIR=build/...] [FORMATS=\"docx epub pdf\"]"
	@echo "  make validate-book-specs"
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
	@echo "  - export-kindle-epub creates DIR/<stem>.epub (flattened custom blocks, shallow nav TOC)."
	@echo "  - export-pdf creates DIR/<stem>.pdf using scripts/export_pdf.py and book.yml PDF settings."
	@echo "  - <stem> defaults to DIR relative to repo root with path segments joined by '-' (override with OUT_STEM)."
	@echo "  - SVG under DIR/docs/diagrams/ rasterize to DIR/export-assets/diagrams/ (rsvg-convert or magick)."
	@echo "  - export-all-docx runs export-docx for every publish-enabled book.yml that includes docx."
	@echo "  - build-book runs scripts/build.py for DIR (default FORMATS: docx epub); default OUT_DIR is build/<DIR-with-slashes-as-dashes>."
	@echo "  - clean-import-md deletes every ./**/import.md file."
	@echo "  - spellcheck runs codespell on SPELLCHECK_DIR using that dir's .codespellrc."
	@echo "  - Requires pandoc installed and available in PATH."
	@echo "  - spellcheck requires codespell (pip install codespell). If it is not on PATH, set CODESPELL to the full path."
	@echo "  - book.yml validation and front-matter generation require Python packages: see requirements.txt (jinja2, pyyaml, jsonschema)."

check-pandoc:
	@command -v "$(PANDOC)" >/dev/null 2>&1 || { \
		echo "Error: pandoc not found. Install pandoc first."; \
		exit 1; \
	}

validate-book-specs:
	@python3 tools/validate_book_specs.py --repo .

build-book: check-pandoc
	@test -n "$(DIR)" || { echo "Usage: make build-book DIR=path/from/repo/root [OUT_DIR=build/...] [FORMATS=\"docx epub pdf\"]"; exit 1; }
	@out="$(OUT_DIR)"; \
	test -n "$$out" || out="build/$$(echo "$(DIR)" | tr '/' '-')"; \
	python3 scripts/build.py --repo . --book-dir "$(DIR)" --out-dir "$$out" $(foreach f,$(FORMATS),--format $(f))

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

# Kindle EPUB: toc-depth=1 keeps nav TOC to # headings only; kindle-flatten injects Part # lines from index.md.
export-kindle-epub: check-pandoc
	@test -n "$(DIR)" || { echo "Usage: make export-kindle-epub DIR=path/to/book-folder [OUT_STEM=basename]"; exit 1; }
	@python3 scripts/export_epub.py --repo . --book-dir "$(DIR)" --out-stem "$(OUT_STEM)"

export-pdf: check-pandoc
	@test -n "$(DIR)" || { echo "Usage: make export-pdf DIR=path/to/book-folder [OUT_STEM=basename]"; exit 1; }
	@python3 scripts/export_pdf.py --repo . --book-dir "$(DIR)" --out-stem "$(OUT_STEM)"

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
