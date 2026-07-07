#!/usr/bin/env python3
"""Apply editorial summary/whyThisMatters to known stub thinker entries."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

try:
    import yaml
except ModuleNotFoundError as exc:  # pragma: no cover
    raise SystemExit("PyYAML is required. Install with: python3 -m pip install pyyaml") from exc

_TOOLS_DIR = Path(__file__).resolve().parent
if str(_TOOLS_DIR) not in sys.path:
    sys.path.insert(0, str(_TOOLS_DIR))

SEMANTIC = Path("semantic")
THINKERS_DIR = SEMANTIC / "thinkers"

# slug -> (summary, whyThisMatters or None to skip field)
ENRICHMENTS: dict[str, tuple[str, str | None]] = {
    # Evolutionary architecture
    "neal-ford": (
        "Software architect and author on evolutionary architectures, polyglot systems, "
        "and designing for constant change in large codebases.",
        "Ford treats architecture as something that must evolve—fitness functions "
        "instead of one-shot blueprints when reality keeps moving.",
    ),
    "patrick-kua": (
        "Engineering leader and author on technical management, platform thinking, "
        "and evolutionary architecture in software organizations.",
        "Kua links team judgment to structural change—how leaders keep systems "
        "adaptable without losing operational coherence.",
    ),
    "rebecca-parsons": (
        "Computer scientist and technology strategist on evolutionary architecture, "
        "distributed systems, and engineering leadership.",
        "Parsons argues for architectures that expect change—when coupling is "
        "inevitable, design for reversible decisions.",
    ),
    # Airbnb / rent gap
    "david-wachsmuth": (
        "Urban geographer studying Airbnb, short-term rentals, and how platform "
        "economies reshape housing markets and neighborhood rent structures.",
        "Wachsmuth shows platforms rewriting local trust—housing treated as liquid "
        "inventory while communities absorb the sediment.",
    ),
    "alexander-weisler": (
        "Urban researcher on platform-mediated housing and gentrification through "
        "the sharing economy.",
        "Weisler documents how digital intermediaries export rent pressure—local "
        "costs rise while accountability stays diffuse.",
    ),
    # AI safety evals (HELM)
    "dan-hendrycks": (
        "AI safety researcher and director of the Center for AI Safety, known for "
        "benchmarking and holistic evaluation of language models.",
        "Hendrycks pushes measurement before myth—when models scale faster than "
        "understanding, evaluation becomes the correction loop.",
    ),
    "collin-burns": (
        "AI researcher on language-model evaluation, alignment, and empirical "
        "assessment of model capabilities.",
        "Burns treats benchmarks as stress tests—capabilities that look fluent "
        "until a systematic probe finds the fracture.",
    ),
    "anya-chen": (
        "AI researcher contributing to holistic language-model evaluation and "
        "empirical safety assessment.",
        "Chen helps make model limits legible—evaluation that travels beyond "
        "headline benchmark scores.",
    ),
    "spencer-ball": (
        "AI researcher on holistic evaluation frameworks for large language models.",
        "Ball extends correction into model release—what gets measured before "
        "systems enter ordinary use.",
    ),
    # LLM security
    "neil-perry": (
        "Computer science researcher studying security risks when developers use "
        "AI coding assistants.",
        "Perry asks whether speed tools quietly lower the security bar—assistance "
        "that ships vulnerabilities faster than review can catch.",
    ),
    "megha-srivastava": (
        "Computer science researcher on secure coding practices and risks introduced "
        "by AI-assisted software development.",
        "Srivastava tests whether convenience reshapes caution—developers trusting "
        "generated code they would not have written themselves.",
    ),
    "deepak-kumar": (
        "Security researcher studying vulnerabilities in code produced with AI "
        "development assistants.",
        "Kumar surfaces how automation shifts blame—insecurities that feel "
        "authored by the machine but ship under human accountability.",
    ),
    "dan-boneh": (
        "Cryptography and computer security professor studying practical security "
        "failures in modern software workflows.",
        "Boneh grounds AI assistance in security discipline—new tools, old "
        "requirement that harm be anticipated before deployment.",
    ),
    # Model cards
    "margaret-mitchell": (
        "Machine learning researcher known for model cards, documentation "
        "transparency, and fairness in NLP systems.",
        "Mitchell argues models need accountable packaging—documentation as the "
        "interface where hidden harms become discussable.",
    ),
    "inioluwa-deborah-raji": (
        "AI accountability researcher on auditing, model documentation, and "
        "algorithmic harms in deployed systems.",
        "Raji treats documentation as civic infrastructure—without it, "
        "interpretation of model behavior stays proprietary.",
    ),
    "ben-hutchinson": (
        "Researcher on responsible machine learning and model documentation "
        "practices including model cards.",
        "Hutchinson helps teams externalize model limits—transparency that "
        "survives handoff between builders and users.",
    ),
    "elena-spitzer": (
        "Researcher contributing to model cards and transparent reporting for "
        "machine learning systems.",
        "Spitzer makes model behavior legible to non-authors—when metadata "
        "travels with the artifact, trust can be negotiated.",
    ),
    "lucy-vasserman": (
        "Software engineer and researcher on model documentation and responsible "
        "machine learning reporting.",
        "Vasserman bridges engineering practice and accountability—reporting "
        "formats that teams can actually maintain.",
    ),
    "parker-barnes": (
        "Researcher on model cards and standardized reporting for machine learning systems.",
        "Barnes helps standardize what models disclose—shared vocabulary before shared deployment.",
    ),
    "simone-wu": (
        "Researcher contributing to model cards and transparency practices in machine learning.",
        "Wu extends documentation into product reality—models judged by what "
        "they declare, not only what they output.",
    ),
    "andrew-zaldivar": (
        "Researcher on model cards and responsible AI documentation at Google.",
        "Zaldivar frames reporting as a design choice—what gets written down "
        "shapes what organizations can later contest.",
    ),
    # Human-AI interaction
    "saleema-amershi": (
        "HCI researcher and co-author of guidelines for human-AI interaction in "
        "product design and responsible machine learning.",
        "Amershi translates model capability into interaction design—when AI "
        "enters workflows, correction needs interface-level seriousness.",
    ),
    # Misinformation / judgment
    "james-n-druckman": (
        "Political scientist studying persuasion, misinformation, and how public "
        "opinion forms under contested information environments.",
        "Druckman maps how falsehoods travel—when shared reality frays, "
        "institutional trust becomes the contested terrain.",
    ),
    "karen-m-douglas": (
        "Social psychologist studying conspiracy theories, rumor, and motivated "
        "belief in online and offline communities.",
        "Douglas explains why bad explanations stick—interpretive shortcuts that "
        "feel like clarity when uncertainty is unbearable.",
    ),
    "barbara-mellers": (
        "Psychologist studying judgment, forecasting accuracy, and the cultivation "
        "of superforecasters.",
        "Mellers shows expertise can be trained—calibrated judgment as craft, "
        "not innate certainty.",
    ),
    "kenneth-f-schulz": (
        "Epidemiologist and methodologist studying publication bias and dimensions "
        "of methodological quality in research literature.",
        "Schulz documents how evidence gets skewed—when methods drift toward "
        "publishable results, correction starts with what never appeared.",
    ),
    # Journalism / institutional failure
    "maggie-haberman": (
        "Pulitzer-winning political correspondent and author chronicling Donald "
        "Trump and the transformation of American political media.",
        "Haberman tracks how public narrative hardens around a central figure—when "
        "interpretation becomes the primary political battlefield.",
    ),
    "ashley-parker": (
        "Washington Post journalist and co-author on Donald Trump and the erosion "
        "of shared factual reference in American politics.",
        "Parker documents assaults on common reference points—reporting when "
        "truth itself becomes a partisan performance.",
    ),
    "michael-scherer": (
        "Washington Post journalist covering national politics and co-author on "
        "Donald Trump and attacks on truth in public life.",
        "Scherer shows institutions strained by serial misrepresentation—press "
        "cadence struggling to keep pace with narrative warfare.",
    ),
    "john-carreyrou": (
        "Investigative journalist who exposed the Theranos fraud in Bad Blood.",
        "Carreyrou names how charismatic certainty outruns verification—when "
        "story wins over instrument, harm scales quietly.",
    ),
    "kati-marton": (
        "Journalist and biographer of Angela Merkel and chronicler of political "
        "leadership under pressure.",
        "Marton narrates authority earned through restraint—leadership judged by "
        "what it refuses to dramatize.",
    ),
    "peter-grady": (
        "Journalist and author on the Boeing 737 MAX disasters and institutional "
        "failure in aviation safety culture.",
        "Grady traces how metrics and incentives displaced engineering judgment—"
        "correction loops silenced until catastrophe forced attention.",
    ),
    "reeves-wiedeman": (
        "Journalist and author on WeWork, Adam Neumann, and the mythology of "
        "venture-scale startup culture.",
        "Wiedeman shows narrative outrunning operations—when story becomes the "
        "product, trust decouples from reality.",
    ),
    "susan-raine": (
        "Scholar studying NXIVM and how high-control groups promise reinvention "
        "while extracting loyalty and secrecy.",
        "Raine documents seductive certainty—communities that sell transformation "
        "while closing off contestability.",
    ),
    "richard-gott": (
        "Journalist and historian of Hugo Chávez and the Bolivarian revolution in "
        "Venezuelan politics.",
        "Gott narrates populist authority built on symbolic renewal—when "
        "legitimacy rides charisma more than institutions.",
    ),
    # Lesson study
    "catherine-c-lewis": (
        "Education researcher on Japanese lesson study and how research can "
        "contribute to instructional improvement in schools.",
        "Lewis treats classrooms as sites of collective learning—improvement "
        "through shared observation, not only top-down reform.",
    ),
    "akihiko-murata": (
        "Education researcher on lesson study and research-practice partnerships in "
        "instructional improvement.",
        "Murata links scholarship to classroom rhythm—correction that happens "
        "where teaching actually occurs.",
    ),
    "rebecca-r-perry": (
        "Education researcher on lesson study and how research supports "
        "instructional improvement in schools.",
        "Perry shows improvement as practiced inquiry—teachers and researchers "
        "learning together from live instruction.",
    ),
    # Physician moral injury
    "s-g-talbot": (
        "Physician and writer reframing clinician burnout as moral injury from "
        "systems that block ethical care.",
        "Talbot names harm done to healers—when institutions demand impossible "
        "loyalty, exhaustion is not weakness but evidence.",
    ),
    "w-dean": (
        "Physician and writer on moral injury in medicine and the systemic causes "
        "of clinician depletion.",
        "Dean reframes burnout as betrayal—workers punished for seeing what their "
        "organizations refuse to fix.",
    ),
    # Climate / productivity / institution
    "reto-knutti": (
        "Climate scientist studying uncertainty, model ensembles, and challenges "
        "combining projections from multiple climate models.",
        "Knutti models humility at scale—when many models disagree, honesty about "
        "uncertainty is part of the science.",
    ),
    "sida-peng": (
        "Researcher studying how AI coding tools such as GitHub Copilot affect "
        "developer productivity and software work.",
        "Peng measures whether assistance compounds throughput—productivity claims "
        "that need grounding in how work actually changes.",
    ),
    "freeh-sporkin-sullivan-llc": (
        "Law firm that produced investigative reports for universities and "
        "institutions, including the Penn State special counsel report.",
        None,
    ),
    "wright-stuart-a-ed": (
        "Sociologist and editor of scholarship on the Branch Davidian conflict and "
        "religious violence.",
        "Wright gathers competing interpretations of catastrophe—when authority, "
        "media, and apocalyptic belief collide under siege.",
    ),
}


def _load_yaml(path: Path) -> dict:
    raw = yaml.safe_load(path.read_text(encoding="utf-8"))
    return raw if isinstance(raw, dict) else {}


def _dump_yaml(path: Path, data: dict) -> None:
    path.write_text(
        yaml.safe_dump(data, sort_keys=False, allow_unicode=True, default_flow_style=False).rstrip()
        + "\n",
        encoding="utf-8",
    )


def apply_enrichments(repo: Path, *, dry_run: bool) -> int:
    updated = 0
    thinkers_dir = repo / THINKERS_DIR
    for slug, (summary, why) in sorted(ENRICHMENTS.items()):
        path = thinkers_dir / f"{slug}.yml"
        if not path.is_file():
            print(f"skip missing: {slug}")
            continue
        doc = _load_yaml(path)
        doc["summary"] = summary
        if why:
            doc["whyThisMatters"] = why
        elif "whyThisMatters" in doc:
            del doc["whyThisMatters"]
        if dry_run:
            print(f"would update {slug}")
        else:
            _dump_yaml(path, doc)
        updated += 1
    return updated


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    if not args.dry_run and not args.apply:
        parser.error("Specify --dry-run or --apply")
    count = apply_enrichments(Path(args.repo).resolve(), dry_run=args.dry_run)
    verb = "Would update" if args.dry_run else "Updated"
    print(f"{verb} {count} thinker(s).")


if __name__ == "__main__":
    main()
