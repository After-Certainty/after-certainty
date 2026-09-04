"""
Discovery metadata for semantic-manifest: works/editions projection and
questions, trails, shelves, change events, search aliases.
"""

from __future__ import annotations

import re
import subprocess
from collections import defaultdict
from pathlib import Path

try:
    import yaml
except ModuleNotFoundError as exc:  # pragma: no cover
    raise SystemExit("PyYAML is required. Install with: python3 -m pip install pyyaml") from exc

from after_certainty.specs.book_specs import (
    discover_book_spec_paths,
    discover_upcoming_spec_paths,
    load_book_spec,
    load_upcoming_spec,
    spec_formats,
)

SEMANTIC = Path("semantic")
SCHEMA_VERSION = "2.6"
CONTENT_TYPES = frozenset({"nonfiction", "fiction", "handbook", "essay_collection", "poetry"})
LITERARY_FORMS = frozenset(
    {
        "novel",
        "poetry_collection",
        "monograph",
        "handbook",
        "essay_collection",
        "field_notes",
        "other",
    }
)
WORK_RELATIONSHIP_TYPES = frozenset(
    {
        "prepares_for",
        "deepens",
        "applies",
        "historicizes",
        "fictionalizes",
        "contrasts_with",
        "companion_to",
        "continues",
        "reframes",
    }
)
EDITION_RELATIONSHIPS = frozenset({"sole", "primary", "companion", "superseded"})

_VERSION_SUFFIX = re.compile(r"-v\d+$")


def load_yaml(path: Path) -> object:
    return yaml.safe_load(path.read_text(encoding="utf-8"))


def resolve_source_commit(repo: Path) -> str | None:
    result = subprocess.run(
        ["git", "-C", str(repo), "rev-parse", "HEAD"],
        capture_output=True,
        text=True,
        check=False,
    )
    if result.returncode != 0:
        return None
    sha = result.stdout.strip()
    return sha or None


def default_work_slug(book_slug: str) -> str:
    return _VERSION_SUFFIX.sub("", book_slug)


def work_id_for_slug(work_slug: str) -> str:
    return f"work-{work_slug}"


def book_id_for_slug(slug: str) -> str:
    return f"book-{slug}"


def _optional_str_list(raw: object) -> list[str]:
    if not isinstance(raw, list):
        return []
    return [str(x).strip() for x in raw if str(x).strip()]


def derive_availability(spec: dict, book_entry: dict) -> list[str]:
    formats = set(spec_formats(spec))
    out: list[str] = []
    for fmt, flag in (
        ("docx", "download_docx"),
        ("epub", "download_epub"),
        ("pdf", "download_pdf"),
    ):
        entry = book_entry.get(fmt)
        enabled = fmt in formats
        if isinstance(entry, dict):
            enabled = bool(entry.get("enabled"))
        if enabled:
            out.append(flag)
    book = spec.get("book", {})
    if isinstance(book.get("purchase_links"), list) and book.get("purchase_links"):
        out.append("available_in_print")
    return out


def _normalize_work_id(raw: str) -> str:
    s = str(raw).strip()
    if not s:
        return ""
    if s.startswith("work-"):
        return s
    return work_id_for_slug(s)


def build_related_works(overview: dict) -> list[dict]:
    rows: list[dict] = []
    for item in overview.get("relatedWorks") or []:
        if not isinstance(item, dict):
            continue
        work_id = _normalize_work_id(str(item.get("workId") or ""))
        relationship = str(item.get("relationship") or "").strip()
        reason = str(item.get("reason") or "").strip()
        if not work_id or relationship not in WORK_RELATIONSHIP_TYPES or not reason:
            continue
        rows.append(
            {
                "workId": work_id,
                "relationship": relationship,
                "reason": reason,
            }
        )
    return rows


def build_selected_roles(overview: dict, *, key: str, id_field: str, prefix: str) -> list[dict]:
    rows: list[dict] = []
    seen: set[str] = set()
    for item in overview.get(key) or []:
        if not isinstance(item, dict):
            continue
        raw_id = str(item.get(id_field) or "").strip().removeprefix(prefix)
        role = str(item.get("roleInWork") or "").strip()
        if not raw_id or not role or raw_id in seen:
            continue
        seen.add(raw_id)
        rows.append({id_field: f"{prefix}{raw_id}", "roleInWork": role})
    return rows


def build_overview_manifest(overview: dict) -> dict:
    out: dict = {
        "centralQuestion": str(overview["centralQuestion"]).strip(),
        "whyItExists": str(overview["whyItExists"]).strip(),
        "audience": str(overview["audience"]).strip(),
        "nonGoals": _optional_str_list(overview.get("nonGoals")),
    }
    concepts = _optional_str_list(overview.get("selectedConcepts"))
    if concepts:
        out["selectedConceptIds"] = [f"concept-{s}" for s in concepts]
    patterns = _optional_str_list(overview.get("selectedPatterns"))
    if patterns:
        out["selectedPatternIds"] = [f"pattern-{s}" for s in patterns]
    concept_roles = build_selected_roles(
        overview, key="selectedConceptRoles", id_field="conceptId", prefix="concept-"
    )
    if concept_roles:
        out["selectedConceptRoles"] = concept_roles
    pattern_roles = build_selected_roles(
        overview, key="selectedPatternRoles", id_field="patternId", prefix="pattern-"
    )
    if pattern_roles:
        out["selectedPatternRoles"] = pattern_roles
    before = _optional_str_list(overview.get("readBefore"))
    if before:
        out["readBefore"] = before
    nxt = _optional_str_list(overview.get("readNext"))
    if nxt:
        out["readNext"] = nxt
    related = build_related_works(overview)
    if related:
        out["relatedWorks"] = related
    revised = str(overview.get("revisedAt") or "").strip()
    if revised:
        out["revisedAt"] = revised
    summary = str(overview.get("changeSummary") or "").strip()
    if summary:
        out["changeSummary"] = summary
    return out


def enrich_book_discovery_fields(spec: dict, book_entry: dict) -> None:
    """Mutate a semantic book entry with additive discovery fields."""
    book = spec.get("book", {}) if isinstance(spec.get("book"), dict) else {}
    slug = str(book_entry.get("slug") or book.get("id") or "").strip()
    work_slug = str(book.get("work_id") or "").strip() or default_work_slug(slug)
    relationship = str(book.get("edition_relationship") or "sole").strip()
    if relationship not in EDITION_RELATIONSHIPS:
        relationship = "sole"
    is_canonical = book.get("is_canonical")
    if is_canonical is None:
        is_canonical = relationship in {"sole", "primary"}
    content_type = str(book.get("content_type") or "nonfiction").strip()
    if content_type not in CONTENT_TYPES:
        content_type = "nonfiction"
    # Poetry kind implies poetry content type when omitted
    kind = str(book.get("kind") or "prose").strip()
    if kind == "poetry" and not book.get("content_type"):
        content_type = "poetry"

    source = str(book_entry.get("source") or "books")
    legacy_status = str(book_entry.get("status") or "published")
    if source == "upcoming":
        public_status = legacy_status if legacy_status else "forthcoming"
    else:
        public_status = "published"
        if relationship == "superseded":
            public_status = "superseded"

    book_entry["workId"] = work_id_for_slug(work_slug)
    book_entry["editionId"] = book_id_for_slug(slug)
    book_entry["isCanonical"] = bool(is_canonical)
    book_entry["editionRelationship"] = relationship
    label = str(book.get("edition_label") or "").strip()
    book_entry["editionLabel"] = label or None
    book_entry["contentType"] = content_type
    literary_form = str(book.get("literary_form") or "").strip()
    if literary_form in LITERARY_FORMS:
        book_entry["literaryForm"] = literary_form
    book_entry["publicStatus"] = public_status
    book_entry["availability"] = derive_availability(spec, book_entry)

    aliases = _optional_str_list(book.get("search_aliases"))
    if aliases:
        book_entry["searchAliases"] = aliases

    overview = book.get("overview")
    if isinstance(overview, dict) and overview.get("centralQuestion"):
        book_entry["overview"] = build_overview_manifest(overview)


def build_works_and_editions(books: list[dict]) -> tuple[list[dict], list[dict]]:
    by_work: dict[str, list[dict]] = defaultdict(list)
    editions: list[dict] = []
    for book in books:
        work_id = str(book.get("workId") or "").strip()
        if not work_id:
            continue
        edition = {
            "id": str(book["id"]),
            "bookId": str(book["id"]),
            "workId": work_id,
            "slug": str(book["slug"]),
            "isCanonical": bool(book.get("isCanonical", True)),
            "relationship": str(book.get("editionRelationship") or "sole"),
            "editionLabel": book.get("editionLabel"),
            "title": str(book.get("title") or ""),
        }
        companions = book.get("companionBooks")
        if isinstance(companions, list) and companions:
            edition["companionEditionIds"] = [book_id_for_slug(str(c)) for c in companions]
        companion_of = book.get("companionOf")
        if companion_of:
            edition["companionOfEditionId"] = book_id_for_slug(str(companion_of))
        editions.append(edition)
        by_work[work_id].append(book)

    works: list[dict] = []
    for work_id, members in sorted(by_work.items()):
        canonical = [b for b in members if b.get("isCanonical")]
        current = canonical[0] if canonical else members[0]
        work_slug = work_id.removeprefix("work-")
        works.append(
            {
                "id": work_id,
                "slug": work_slug,
                "title": str(current.get("title") or ""),
                "currentEditionId": str(current["id"]),
                "contentType": str(current.get("contentType") or "nonfiction"),
                "canonicalRoute": f"/explore/books/{current['slug']}",
                "editionIds": [str(b["id"]) for b in sorted(members, key=lambda x: str(x["slug"]))],
            }
        )
    editions.sort(key=lambda e: str(e["id"]))
    return works, editions


def _iter_dir_yml(repo: Path, subdir: str) -> list[Path]:
    root = repo / SEMANTIC / subdir
    if not root.is_dir():
        return []
    return sorted(p for p in root.glob("*.yml") if p.is_file())


def _entity_title_index(
    books: list[dict],
    glossary: list[dict],
    patterns: list[dict],
    situations: list[dict],
    sources: list[dict],
    thinkers: list[dict],
) -> dict[str, tuple[str | None, str | None]]:
    """Map entity id -> (title, slug)."""
    index: dict[str, tuple[str | None, str | None]] = {}
    for b in books:
        index[str(b["id"])] = (str(b.get("title") or ""), str(b.get("slug") or ""))
    for g in glossary:
        index[str(g["id"])] = (str(g.get("title") or ""), str(g.get("slug") or ""))
    for p in patterns:
        index[str(p["id"])] = (str(p.get("title") or ""), str(p.get("slug") or ""))
    for s in situations:
        index[str(s["id"])] = (str(s.get("title") or ""), str(s.get("slug") or ""))
    for s in sources:
        index[str(s["id"])] = (str(s.get("name") or s.get("title") or ""), str(s.get("slug") or ""))
    for t in thinkers:
        index[str(t["id"])] = (str(t.get("name") or ""), str(t.get("slug") or ""))
    return index


def _enrich_path_stops(
    stops: list,
    title_index: dict[str, tuple[str | None, str | None]],
) -> list[dict]:
    out: list[dict] = []
    for raw in stops:
        if not isinstance(raw, dict):
            continue
        stop = {
            "position": int(raw["position"]),
            "entityType": str(raw["entityType"]),
            "description": str(raw.get("description") or ""),
        }
        entity_id = str(raw.get("entityId") or "").strip() or None
        book_slug = str(raw.get("bookSlug") or "").strip() or None
        if entity_id:
            stop["entityId"] = entity_id
        if book_slug:
            stop["bookSlug"] = book_slug
        external = str(raw.get("externalUrl") or "").strip() or None
        if external:
            stop["externalUrl"] = external
        why = str(raw.get("whyThisFollows") or "").strip() or None
        if why:
            stop["whyThisFollows"] = why
        if raw.get("estimatedMinutes") is not None:
            stop["estimatedMinutes"] = int(raw["estimatedMinutes"])
        if "optional" in raw:
            stop["optional"] = bool(raw["optional"])
        if "fictionDoorway" in raw:
            stop["fictionDoorway"] = bool(raw["fictionDoorway"])
        lookup = entity_id
        if not lookup and book_slug:
            lookup = book_id_for_slug(book_slug)
        if lookup and lookup in title_index:
            title, slug = title_index[lookup]
            if title:
                stop["title"] = title
            if slug:
                stop["resolvedSlug"] = slug
        out.append(stop)
    out.sort(key=lambda s: int(s["position"]))
    return out


def build_challenges(repo: Path) -> list[dict]:
    """Published pattern-recognition challenges (schemaVersion 2.5+)."""
    rows: list[dict] = []
    for path in _iter_dir_yml(repo, "challenges"):
        doc = load_yaml(path)
        if not isinstance(doc, dict):
            continue
        status = str(doc.get("status") or "").strip()
        if status != "published":
            continue
        slug = str(doc.get("slug") or path.stem).strip()
        entry: dict = {
            "id": f"challenge-{slug}",
            "slug": slug,
            "title": str(doc.get("title") or slug).strip(),
            "mode": str(doc.get("mode") or "recognition").strip(),
            "status": status,
            "difficulty": str(doc.get("difficulty") or "introductory").strip(),
            "context": str(doc.get("context") or "everyday").strip(),
            "scenario": str(doc.get("scenario") or "").strip(),
            "dominantPattern": str(doc.get("dominantPattern") or "").strip(),
            "secondaryPatterns": _optional_str_list(doc.get("secondaryPatterns")),
            "distractorPatterns": _optional_str_list(doc.get("distractorPatterns")),
            "explanation": str(doc.get("explanation") or "").strip(),
        }
        feedback = doc.get("choiceFeedback")
        if isinstance(feedback, dict) and feedback:
            entry["choiceFeedback"] = {
                str(k).strip(): str(v).strip()
                for k, v in feedback.items()
                if str(k).strip() and str(v).strip()
            }
        xp = doc.get("insightXp")
        if isinstance(xp, dict):
            cleaned: dict[str, int] = {}
            for key in ("dominant", "secondary", "distractor"):
                if key in xp and xp[key] is not None:
                    cleaned[key] = int(xp[key])
            if cleaned:
                entry["insightXp"] = cleaned
        books = _optional_str_list(doc.get("relatedBooks"))
        if books:
            entry["relatedBooks"] = books
        chapters = _optional_str_list(doc.get("relatedChapterIds"))
        if chapters:
            entry["relatedChapterIds"] = chapters
        podcast = doc.get("relatedPodcastEpisodeId")
        if podcast is not None and str(podcast).strip():
            entry["relatedPodcastEpisodeId"] = str(podcast).strip()
        situation = str(doc.get("relatedSituation") or "").strip()
        if situation:
            entry["relatedSituation"] = situation
        tags = _optional_str_list(doc.get("tags"))
        if tags:
            entry["tags"] = tags
        provenance = doc.get("provenance")
        if provenance is not None and str(provenance).strip():
            entry["provenance"] = str(provenance).strip()
        rows.append(entry)
    rows.sort(key=lambda r: str(r["id"]))
    return rows


def _project_song_recording(raw: object) -> dict | None:
    if not isinstance(raw, dict):
        return None
    platform = str(raw.get("platform") or "").strip()
    external_id = str(raw.get("externalId") or "").strip()
    recording_title = str(raw.get("recordingTitle") or "").strip()
    if not platform or not external_id or not recording_title:
        return None
    out: dict = {
        "platform": platform,
        "externalId": external_id,
        "primary": bool(raw.get("primary")),
        "recordingTitle": recording_title,
    }
    for key in (
        "versionTitle",
        "createdAt",
        "modelName",
        "modelVersion",
        "task",
        "coverClipId",
        "editedClipId",
        "styleTags",
        "remixInstruction",
        "lineageNote",
        "supersededBy",
    ):
        val = raw.get(key)
        if val is None:
            continue
        text = str(val).strip()
        if text:
            out[key] = text
    if "isRemix" in raw:
        out["isRemix"] = bool(raw.get("isRemix"))
    duration = raw.get("durationSeconds")
    if isinstance(duration, (int, float)):
        out["durationSeconds"] = float(duration)
    return out


def _project_song_media(raw: object) -> dict | None:
    if not isinstance(raw, dict):
        return None
    kind = str(raw.get("kind") or "").strip()
    external_id = str(raw.get("externalId") or "").strip()
    if not kind or not external_id:
        return None
    out: dict = {"kind": kind, "externalId": external_id}
    for key in ("title", "role"):
        val = str(raw.get(key) or "").strip()
        if val:
            out[key] = val
    return out


def _project_song_generation(raw: object) -> dict | None:
    if not isinstance(raw, dict):
        return None
    prompt = str(raw.get("authoredPrompt") or "").strip()
    if not prompt:
        return None
    out: dict = {"authoredPrompt": prompt}
    for key in ("authoredPromptSource", "authoredPromptRetrievedAt"):
        val = str(raw.get(key) or "").strip()
        if val:
            out[key] = val
    return out


def _project_song_grounding(raw: object) -> dict | None:
    if not isinstance(raw, dict):
        return None
    gtype = str(raw.get("type") or "").strip()
    if not gtype:
        return None
    out: dict = {"type": gtype}
    note = str(raw.get("note") or "").strip()
    if note:
        out["note"] = note
    developed = raw.get("developedFrom")
    if isinstance(developed, list) and developed:
        items: list[dict] = []
        for row in developed:
            if not isinstance(row, dict):
                continue
            item = {
                k: str(row[k]).strip()
                for k in ("work", "source", "concept", "pattern")
                if str(row.get(k) or "").strip()
            }
            if item:
                items.append(item)
        if items:
            out["developedFrom"] = items
    return out


def build_songs(repo: Path) -> list[dict]:
    """Song compositions with recording provenance (schemaVersion 2.6+)."""
    rows: list[dict] = []
    for path in _iter_dir_yml(repo, "songs"):
        doc = load_yaml(path)
        if not isinstance(doc, dict):
            continue
        slug = str(doc.get("slug") or path.stem).strip()
        recordings_raw = doc.get("recordings")
        recordings: list[dict] = []
        if isinstance(recordings_raw, list):
            for item in recordings_raw:
                projected = _project_song_recording(item)
                if projected:
                    recordings.append(projected)
        if not recordings:
            continue
        entry: dict = {
            "id": f"song-{slug}",
            "slug": slug,
            "title": str(doc.get("title") or slug).strip(),
            "shortDescription": str(doc.get("shortDescription") or "").strip(),
            "longDescription": str(doc.get("longDescription") or "").strip(),
            "creatorNames": _optional_str_list(doc.get("creatorNames")),
            "lyricsPath": str(doc.get("lyricsPath") or "").strip(),
            "lyricLanguages": _optional_str_list(doc.get("lyricLanguages")),
            "relatedConcepts": _optional_str_list(doc.get("relatedConcepts")),
            "relatedPatterns": _optional_str_list(doc.get("relatedPatterns")),
            "relatedBooks": _optional_str_list(doc.get("relatedBooks")),
            "recordings": recordings,
        }
        sources = _optional_str_list(doc.get("relatedSources"))
        if sources:
            entry["relatedSources"] = sources
        media_raw = doc.get("relatedMedia")
        if isinstance(media_raw, list):
            media = [m for m in (_project_song_media(x) for x in media_raw) if m]
            if media:
                entry["relatedMedia"] = media
        generation = _project_song_generation(doc.get("generation"))
        if generation:
            entry["generation"] = generation
        grounding = _project_song_grounding(doc.get("grounding"))
        if grounding:
            entry["grounding"] = grounding
        editorial = str(doc.get("editorialStatus") or "").strip()
        if editorial:
            entry["editorialStatus"] = editorial
        aliases = _optional_str_list(doc.get("searchAliases"))
        if aliases:
            entry["searchAliases"] = aliases
        rows.append(entry)
    rows.sort(key=lambda r: str(r["id"]))
    return rows


def build_playlists(repo: Path) -> list[dict]:
    """Curated playlists of song recordings (schemaVersion 2.6+)."""
    rows: list[dict] = []
    for path in _iter_dir_yml(repo, "playlists"):
        doc = load_yaml(path)
        if not isinstance(doc, dict):
            continue
        slug = str(doc.get("slug") or path.stem).strip()
        tracks_raw = doc.get("tracks")
        tracks: list[dict] = []
        if isinstance(tracks_raw, list):
            for item in tracks_raw:
                if not isinstance(item, dict):
                    continue
                song_slug = str(item.get("songSlug") or "").strip()
                recording_id = str(item.get("recordingExternalId") or "").strip()
                position = item.get("position")
                if not song_slug or not recording_id or not isinstance(position, int):
                    continue
                track: dict = {
                    "position": position,
                    "songSlug": song_slug,
                    "songId": f"song-{song_slug}",
                    "recordingExternalId": recording_id,
                }
                tracks.append(track)
        if not tracks:
            continue
        tracks.sort(key=lambda t: int(t["position"]))
        entry: dict = {
            "id": f"playlist-{slug}",
            "slug": slug,
            "title": str(doc.get("title") or slug).strip(),
            "platform": str(doc.get("platform") or "").strip(),
            "externalId": str(doc.get("externalId") or "").strip(),
            "tracks": tracks,
        }
        description = str(doc.get("description") or "").strip()
        if description:
            entry["description"] = description
        share_id = str(doc.get("shareId") or "").strip()
        if share_id:
            entry["shareId"] = share_id
        snapshot = str(doc.get("snapshotDate") or "").strip()
        if snapshot:
            entry["snapshotDate"] = snapshot
        rows.append(entry)
    rows.sort(key=lambda r: str(r["id"]))
    return rows


def build_questions(
    repo: Path,
    title_index: dict[str, tuple[str | None, str | None]],
) -> list[dict]:
    rows: list[dict] = []
    for path in _iter_dir_yml(repo, "questions"):
        doc = load_yaml(path)
        if not isinstance(doc, dict):
            continue
        status = str(doc.get("status") or "").strip()
        if status != "published":
            continue
        entry = {
            "id": str(doc["id"]).strip(),
            "slug": str(doc["slug"]).strip(),
            "question": str(doc["question"]).strip(),
            "summary": str(doc["summary"]).strip(),
            "orientation": str(doc["orientation"]).strip(),
            "whatThisIsNot": _optional_str_list(doc.get("whatThisIsNot")),
            "status": status,
            "families": _optional_str_list(doc.get("families")),
            "primaryBookId": str(doc["primaryBookId"]).strip(),
            "pathStops": _enrich_path_stops(doc.get("pathStops") or [], title_index),
            "closingReflection": str(doc["closingReflection"]).strip(),
        }
        if "featured" in doc:
            entry["featured"] = bool(doc["featured"])
        if doc.get("featuredRank") is not None:
            entry["featuredRank"] = int(doc["featuredRank"])
        related = _optional_str_list(doc.get("relatedQuestionIds"))
        if related:
            entry["relatedQuestionIds"] = related
        hints = _optional_str_list(doc.get("searchHints"))
        if hints:
            entry["searchHints"] = hints
        carry = str(doc.get("carryForwardQuestion") or "").strip()
        if carry:
            entry["carryForwardQuestion"] = carry
        rows.append(entry)
    rows.sort(key=lambda r: str(r["id"]))
    return rows


def build_trails(
    repo: Path,
    title_index: dict[str, tuple[str | None, str | None]],
) -> list[dict]:
    rows: list[dict] = []
    for path in _iter_dir_yml(repo, "trails"):
        doc = load_yaml(path)
        if not isinstance(doc, dict):
            continue
        status = str(doc.get("status") or "").strip()
        if status not in {"published", "upcoming"}:
            continue
        entry = {
            "id": str(doc["id"]).strip(),
            "slug": str(doc["slug"]).strip(),
            "title": str(doc["title"]).strip(),
            "summary": str(doc["summary"]).strip(),
            "orientation": str(doc["orientation"]).strip(),
            "status": status,
            "themes": _optional_str_list(doc.get("themes")),
            "pathStops": _enrich_path_stops(doc.get("pathStops") or [], title_index),
            "closingReflection": str(doc["closingReflection"]).strip(),
        }
        if "featured" in doc:
            entry["featured"] = bool(doc["featured"])
        if doc.get("featuredRank") is not None:
            entry["featuredRank"] = int(doc["featuredRank"])
        for key in ("audience", "depth", "suggestedContinuation", "estimatedCommitment"):
            val = str(doc.get(key) or "").strip()
            if val:
                entry[key] = val
        primary = str(doc.get("primaryBookId") or "").strip()
        if primary:
            entry["primaryBookId"] = primary
        related = _optional_str_list(doc.get("relatedTrailIds"))
        if related:
            entry["relatedTrailIds"] = related
        rows.append(entry)
    rows.sort(key=lambda r: str(r["id"]))
    return rows


def build_shelves(repo: Path, books: list[dict]) -> list[dict]:
    by_slug = {str(b["slug"]): b for b in books}
    rows: list[dict] = []
    for path in _iter_dir_yml(repo, "shelves"):
        doc = load_yaml(path)
        if not isinstance(doc, dict):
            continue
        selection = doc.get("selection")
        if not isinstance(selection, dict):
            continue
        entry = {
            "id": str(doc["id"]).strip(),
            "slug": str(doc["slug"]).strip(),
            "title": str(doc["title"]).strip(),
            "description": str(doc["description"]).strip(),
            "displayOrder": int(doc["displayOrder"]),
            "featured": bool(doc.get("featured")),
            "status": str(doc.get("status") or "active"),
            "selection": selection,
        }
        resolved: list[str] = []
        if selection.get("mode") == "curated":
            for slug in _optional_str_list(selection.get("bookSlugs")):
                book = by_slug.get(slug)
                if book and book.get("isCanonical", True) and book.get("source") == "books":
                    resolved.append(str(book["id"]))
        elif selection.get("mode") == "rule":
            rule = selection.get("rule") or {}
            rtype = str(rule.get("type") or "")
            for book in books:
                if not book.get("isCanonical", True):
                    continue
                if rtype == "allPublic" and book.get("source") == "books":
                    resolved.append(str(book["id"]))
                elif rtype == "contentType":
                    values = set(_optional_str_list(rule.get("values")))
                    if book.get("contentType") in values and book.get("source") == "books":
                        resolved.append(str(book["id"]))
                elif rtype == "status":
                    values = set(_optional_str_list(rule.get("values")))
                    status = str(book.get("publicStatus") or book.get("status") or "")
                    if status in values:
                        resolved.append(str(book["id"]))
            resolved = sorted(set(resolved))
        entry["resolvedBookIds"] = resolved
        rows.append(entry)
    rows.sort(key=lambda r: (int(r["displayOrder"]), str(r["id"])))
    return rows


def build_change_events(repo: Path, books: list[dict]) -> list[dict]:
    by_id = {str(b["id"]): b for b in books}
    rows: list[dict] = []
    for path in _iter_dir_yml(repo, "change-events"):
        doc = load_yaml(path)
        if not isinstance(doc, dict):
            continue
        if str(doc.get("visibility") or "") != "public":
            continue
        entity_id = str(doc.get("entityId") or "").strip() or None
        entry = {
            "id": str(doc["id"]).strip(),
            "type": str(doc["type"]).strip(),
            "title": str(doc["title"]).strip(),
            "summary": str(doc["summary"]).strip(),
            "date": str(doc["date"]).strip(),
            "entityType": str(doc["entityType"]).strip(),
            "visibility": "public",
            "source": "authored",
        }
        if entity_id:
            entry["entityId"] = entity_id
        why = str(doc.get("whyItMatters") or "").strip()
        if why:
            entry["whyItMatters"] = why
        if "featured" in doc:
            entry["featured"] = bool(doc["featured"])
        sig = str(doc.get("significance") or "").strip()
        if sig:
            entry["significance"] = sig
        related = str(doc.get("relatedEditionId") or "").strip()
        if related:
            entry["relatedEditionId"] = related
        route = str(doc.get("canonicalRoute") or "").strip()
        if not route and entity_id and entity_id in by_id:
            route = f"/explore/books/{by_id[entity_id]['slug']}"
        if route:
            entry["canonicalRoute"] = route
        if entity_id and entity_id in by_id:
            cover = by_id[entity_id].get("coverImage")
            if cover:
                entry["coverImage"] = cover
        rows.append(entry)
    rows.sort(key=lambda r: (str(r["date"]), str(r["id"])))
    return rows


def build_search_aliases(repo: Path) -> list[dict]:
    path = repo / SEMANTIC / "search-aliases.yml"
    if not path.is_file():
        return []
    doc = load_yaml(path)
    if not isinstance(doc, dict):
        return []
    rows: list[dict] = []
    for raw in doc.get("entries") or []:
        if not isinstance(raw, dict):
            continue
        entry = {
            "terms": _optional_str_list(raw.get("terms")),
            "kind": str(raw.get("kind") or "related").strip(),
            "targetIds": _optional_str_list(raw.get("targetIds")),
        }
        note = str(raw.get("note") or "").strip()
        if note:
            entry["note"] = note
        alias_class = str(raw.get("aliasClass") or "").strip()
        if alias_class:
            entry["aliasClass"] = alias_class
        if entry["terms"] and entry["targetIds"]:
            rows.append(entry)
    rows.sort(key=lambda r: (r["kind"], ",".join(r["terms"])))
    return rows


def _apply_song_reverse_links(payload: dict) -> None:
    """Attach reverse song refs onto books, glossary, and patterns (schemaVersion 2.6)."""
    songs = payload.get("songs") or []
    if not isinstance(songs, list) or not songs:
        return

    book_songs: dict[str, set[str]] = defaultdict(set)
    concept_songs: dict[str, set[str]] = defaultdict(set)
    pattern_songs: dict[str, set[str]] = defaultdict(set)

    for song in songs:
        if not isinstance(song, dict):
            continue
        song_id = str(song.get("id") or "").strip()
        song_slug = str(song.get("slug") or "").strip()
        if not song_id or not song_slug:
            continue
        for bid in song.get("relatedBooks") or []:
            book_slug = str(bid).removeprefix("book-").strip()
            if book_slug:
                book_songs[book_slug].add(song_id)
        for cid in song.get("relatedConcepts") or []:
            concept_slug = str(cid).removeprefix("concept-").strip()
            if concept_slug:
                concept_songs[concept_slug].add(song_slug)
        for pid in song.get("relatedPatterns") or []:
            pattern_slug = str(pid).removeprefix("pattern-").strip()
            if pattern_slug:
                pattern_songs[pattern_slug].add(song_slug)

    for book in payload.get("books") or []:
        if not isinstance(book, dict):
            continue
        slug = str(book.get("slug") or "").strip()
        linked = book_songs.get(slug)
        if linked:
            book["songs"] = sorted(linked)

    for concept in payload.get("glossary") or []:
        if not isinstance(concept, dict):
            continue
        slug = str(concept.get("slug") or "").strip()
        linked = concept_songs.get(slug)
        if linked:
            concept["relatedSongs"] = sorted(linked)

    for pattern in payload.get("patterns") or []:
        if not isinstance(pattern, dict):
            continue
        slug = str(pattern.get("slug") or "").strip()
        linked = pattern_songs.get(slug)
        if linked:
            pattern["relatedSongs"] = sorted(linked)


def attach_discovery_collections(
    payload: dict,
    *,
    repo: Path,
    books: list[dict],
    glossary: list[dict],
    patterns: list[dict],
    situations: list[dict],
    sources: list[dict],
    thinkers: list[dict],
    specs_by_slug: dict[str, dict] | None = None,
) -> None:
    """Add schemaVersion, sourceCommit, works/editions, and discovery arrays."""
    from after_certainty.manuscript.structure import build_all_structures

    payload["schemaVersion"] = SCHEMA_VERSION
    payload["sourceCommit"] = resolve_source_commit(repo)
    works, editions = build_works_and_editions(books)
    payload["works"] = works
    payload["editions"] = editions
    title_index = _entity_title_index(books, glossary, patterns, situations, sources, thinkers)
    payload["questions"] = build_questions(repo, title_index)
    payload["trails"] = build_trails(repo, title_index)
    payload["challenges"] = build_challenges(repo)
    payload["songs"] = build_songs(repo)
    payload["playlists"] = build_playlists(repo)
    _apply_song_reverse_links(payload)
    payload["shelves"] = build_shelves(repo, books)
    payload["changeEvents"] = build_change_events(repo, books)
    payload["searchAliases"] = build_search_aliases(repo)
    parts, chapters = build_all_structures(repo, books, specs_by_slug or {})
    payload["parts"] = parts
    payload["chapters"] = chapters


def collect_book_specs(repo: Path) -> list[tuple[Path, dict, str, str]]:
    """Return (spec_path, spec, source, status) for all books and upcoming."""
    rows: list[tuple[Path, dict, str, str]] = []
    published: set[str] = set()
    for spec_path in discover_book_spec_paths(repo):
        spec = load_book_spec(spec_path)
        book = spec.get("book", {})
        slug = str(book.get("id", "")).strip()
        if slug:
            published.add(slug)
        rows.append((spec_path, spec, "books", "published"))
    for spec_path in discover_upcoming_spec_paths(repo):
        spec = load_upcoming_spec(spec_path)
        book = spec.get("book", {})
        slug = str(book.get("id", "")).strip()
        if slug and slug in published:
            continue
        upcoming = spec.get("upcoming", {})
        status = str(upcoming.get("status", "in_progress")).strip() or "in_progress"
        rows.append((spec_path, spec, "upcoming", status))
    return rows
