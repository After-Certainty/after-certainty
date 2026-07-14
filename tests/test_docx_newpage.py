"""DOCX staging translates LaTeX newpage markers into OpenXML page breaks."""

from book_export_assets import replace_newpage_for_docx


def test_replace_newpage_for_docx_inserts_openxml_pagebreak():
    src = "\\newpage\n\n# Chapter\n"
    out = replace_newpage_for_docx(src)
    assert "w:br" in out and 'w:type="page"' in out
    assert "\\newpage" not in out
    assert out.endswith("# Chapter\n") or "# Chapter" in out


def test_replace_newpage_preserves_other_text():
    src = "Hello\n\\newpage\nWorld\n"
    out = replace_newpage_for_docx(src)
    assert "Hello" in out and "World" in out
