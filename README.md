# After Certainty

This repository holds **several independent books** as parallel projects: each manuscript folder includes an `index.md` that anchors its **table of contents** (Markdown sources, parts, and supporting assets). They share **one publishing pipeline**—local Make targets and a GitHub Actions workflow—that assembles each book into **DOCX** and **EPUB** for distribution.

## Publishing pipeline

- **Locally:** from the repo root, [`Makefile`](Makefile) targets such as `make export-docx DIR=…` and `make export-kindle-epub DIR=…` combine each book’s `index.md` with its linked chapters (same assembly rules everywhere). Output filenames use the book folder path relative to the root (for example `when-others-look-to-you-v1.docx` under `when-others-look-to-you/v1/`).
- **CI:** [`.github/workflows/book-export-release.yml`](.github/workflows/book-export-release.yml) installs Pandoc and diagram tooling, rebuilds only manuscripts touched by the change set (with **longest-path** matching and multi-edition fan-out where one folder holds several pipelines, e.g. `when-others-look-to-you/v1` and `v2`), runs on **pull requests** and **pushes** to `main`, and builds **all** books on manual workflow runs. Successful **`main`** pushes attach artifacts to the rolling [**latest** GitHub release](https://github.com/ksteffe/after-certainty/releases/tag/latest).

Helper scripts live under [`tools/`](tools/) (for example Kindle-oriented Markdown prep and EPUB post-processing).

## License

Unless otherwise noted, original content in this repository is licensed under [**Creative Commons Attribution 4.0 International** (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/) — you may share and adapt the material provided you give appropriate credit. See [`LICENSE`](LICENSE) for the full legal terms.

## Books

| Book | Index | What it’s about |
| --- | --- | --- |
| **Coupling** — *Cohesion, Consequence, and the Architecture of Responsibility* | [`coupling/index.md`](coupling/index.md) | Coupling and cohesion as a grammar for responsibility—from software and delivery practices to AI and structural entropy. |
| **Curiosity Before Certainty** — *How Curiosity Helps Us Understand a Complex World* | [`curiosity-before-certainty/index.md`](curiosity-before-certainty/index.md) | Staying curious when certainty fails: patterns, systems, and human dynamics without pretending the world is simple. |
| **How Meaning Moves** — *Signal, Compression, and Restraint* | [`how-meaning-moves/index.md`](how-meaning-moves/index.md) | Why communication fails before anyone is “wrong”: signal, compression, and restraint between speakers and listeners. |
| **How Serious Systems Learn** — *Disciplines for Acting Without Certainty* | [`how-serious-systems-learn/index.md`](how-serious-systems-learn/index.md) | Operating disciplines for domains where knowing no longer governs outcomes—constraints, probes, and preserving correction. |
| **When Authority Is Misread** | [`when-authority-is-misread/index.md`](when-authority-is-misread/index.md) | How communication, constraint, and moral legitimacy drift from human scale into history—read through named leaders and episodes. |
| **When Authority Outlives Accountability** — *A Lens for Moral Leadership* | [`when-authority-outlives-accountability/index.md`](when-authority-outlives-accountability/index.md) | A structured lens for leadership evaluation: harm, effectiveness, legitimacy transfer, and use at human scale. |
| **When Moral Seriousness Scales** — *Judgment Under Distance and Pressure* | [`when-moral-seriousness-scales/index.md`](when-moral-seriousness-scales/index.md) | What happens to moral judgment when distance, asymmetry, and pressure replace face-to-face accountability. |
| **When Others Look to You** (edition 1) — *Renewal and Erosion in Leadership* | [`when-others-look-to-you/v1/index.md`](when-others-look-to-you/v1/index.md) | Influence, renewal and erosion, harm, effectiveness, legitimacy, and why we misjudge leaders who carry others’ attention. |
| **When Others Look to You** (edition 2) — *Forming, Renewing, Eroding, Repeating* | [`when-others-look-to-you/v2/index.md`](when-others-look-to-you/v2/index.md) | A parallel manuscript structure: forming leadership, renewal, erosion, and how leadership reproduces itself. |

Together these manuscripts are part of the broader **After Certainty** thread: thinking clearly when simple answers stop working.
