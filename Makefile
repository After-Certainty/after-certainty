.PHONY: help check-pandoc docx-to-md md-to-docx import-docx import-docx-dir export-docx export-all-docx clean-import-md

PANDOC ?= pandoc

help:
	@echo "Pandoc conversion helpers"
	@echo ""
	@echo "Targets:"
	@echo "  make docx-to-md IN=path/to/input.docx [OUT=path/to/output.md]"
	@echo "  make md-to-docx IN=path/to/input.md [OUT=path/to/output.docx]"
	@echo "  make import-docx"
	@echo "  make import-docx-dir DIR=path/to/folder [OVERWRITE=1]"
	@echo "  make export-docx DIR=path/to/book-folder"
	@echo "  make export-all-docx"
	@echo "  make clean-import-md"
	@echo ""
	@echo "Notes:"
	@echo "  - If OUT is omitted, output is created next to IN."
	@echo "  - import-docx converts every ./**/import.docx to ./**/import.md."
	@echo "  - import-docx-dir converts every .docx under DIR to side-by-side .md."
	@echo "  - import-docx-dir skips existing .md files unless OVERWRITE=1."
	@echo "  - export-docx combines DIR/index.md plus linked .md files into DIR/export.docx."
	@echo "  - export-all-docx runs export-docx for every ./**/index.md."
	@echo "  - clean-import-md deletes every ./**/import.md file."
	@echo "  - Requires pandoc installed and available in PATH."

check-pandoc:
	@command -v "$(PANDOC)" >/dev/null 2>&1 || { \
		echo "Error: pandoc not found. Install pandoc first."; \
		exit 1; \
	}

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
	@test -n "$(DIR)" || { echo "Usage: make export-docx DIR=path/to/book-folder"; exit 1; }
	@index="$$DIR/index.md"; \
	test -f "$$index" || { echo "Error: $$index not found."; exit 1; }; \
	out="$$DIR/export.docx"; \
	set -- "$$index"; \
	links="$$(sed -n 's/.*](\([^)]*\.md\)).*/\1/p' "$$index")"; \
	for rel in $$links; do \
		file="$$DIR/$$rel"; \
		if [ -f "$$file" ]; then \
			set -- "$$@" "$$file"; \
		else \
			echo "Warning: linked file not found: $$file"; \
		fi; \
	done; \
	"$(PANDOC)" "$$@" -o "$$out"; \
	echo "Created $$out"

export-all-docx: check-pandoc
	@indexes="$$(find . -type f -name 'index.md')"; \
	if [ -z "$$indexes" ]; then \
		echo "No index.md files found."; \
		exit 0; \
	fi; \
	echo "$$indexes" | while IFS= read -r index; do \
		dir="$$(dirname "$$index")"; \
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
