#!/usr/bin/env python3
import argparse
import re
from pathlib import Path
from xml.etree import ElementTree as ET
from zipfile import ZIP_DEFLATED, ZipFile


def remove_cover_from_spine(epub_path: Path) -> None:
    with ZipFile(epub_path, "r") as zin:
        files = {name: zin.read(name) for name in zin.namelist()}

    opf_name = next((n for n in files if n.endswith(".opf")), None)
    if not opf_name:
        return

    ns = {"opf": "http://www.idpf.org/2007/opf"}
    ET.register_namespace("", ns["opf"])
    root = ET.fromstring(files[opf_name])

    spine = root.find(".//opf:spine", ns)
    if spine is None:
        return

    manifest = root.find(".//opf:manifest", ns)
    manifest_by_id = {}
    if manifest is not None:
        for item in manifest.findall("opf:item", ns):
            item_id = item.attrib.get("id")
            href = item.attrib.get("href")
            if item_id and href:
                manifest_by_id[item_id] = href

    nav_item = None
    anchor_item = None
    changed = False
    for itemref in list(spine.findall("opf:itemref", ns)):
        idref = itemref.attrib.get("idref")
        if idref == "cover_xhtml":
            spine.remove(itemref)
            changed = True
            continue

        if idref == "nav":
            nav_item = itemref
            continue

        href = manifest_by_id.get(idref or "")
        if not href:
            continue

        text_path = f"EPUB/{href}"
        raw = files.get(text_path, b"").decode("utf-8", errors="ignore")
        h1_match = re.search(r"<h1[^>]*>(.*?)</h1>", raw, re.S | re.I)
        if not h1_match:
            continue

        heading = re.sub(r"<[^>]+>", "", h1_match.group(1)).strip().lower()
        if heading in {"author's note", "author’s note"}:
            anchor_item = itemref

    # Keep the navigation/ToC page in the reading spine, but place it
    # after Author's Note so front matter order is: title, copyright,
    # typographical conventions, author's note, toc, preface, introduction.
    if nav_item is not None and anchor_item is not None:
        spine.remove(nav_item)
        itemrefs = list(spine.findall("opf:itemref", ns))
        try:
            anchor_index = itemrefs.index(anchor_item)
            spine.insert(anchor_index + 1, nav_item)
            changed = True
        except ValueError:
            pass

    if not changed:
        return

    files[opf_name] = ET.tostring(root, encoding="utf-8", xml_declaration=True)
    with ZipFile(epub_path, "w", compression=ZIP_DEFLATED) as zout:
        for name, data in files.items():
            zout.writestr(name, data)


def main() -> None:
    parser = argparse.ArgumentParser(description="Post-process EPUB for reader behavior.")
    parser.add_argument("--epub", required=True)
    args = parser.parse_args()

    epub_path = Path(args.epub)
    remove_cover_from_spine(epub_path)
    print(f"postprocessed={epub_path}")


if __name__ == "__main__":
    main()
