# Implementation map and adaptation boundaries

The bootstrap project is a self-contained copy of the approved implementation, not a generic no-code course generator. The baseline builds C01 and C12. A new topic requires coordinated data and code changes. Do not add a new ID and let an `else` branch silently turn it into the cybersecurity course.

## Source map (relative to unpacked project)

| File | Responsibility |
|---|---|
| `data/courses_catalog.json` | ID, title, objective, organizational domain and baseline quiz metadata |
| `data/course_experiences.json` | Legacy fields still consumed by the source builder; keep coherent rather than deleting |
| `data/course_experiences.humanized.humanized.json` | Active intro, asset paths, reflection, takeaway and two native quiz questions/keys |
| `data/pilot_lessons.sourced.json` | Three theory pages/course; examples, formative question and paragraph-source mapping |
| `data/pilot_word_search.json` | Five targets, answer-free clues, grid and coordinates |
| `data/pilot_drag_words.json` | Four choices, three gaps and declared answers |
| `data/pilot_sort_paragraphs.json` | Four paragraph texts and initial/correct permutations |
| `exelearning/pilot/{word-search,drag-words,sort-paragraphs}.{js,css}` | Three optional engines and presentation |
| `data/pilot_references.json` | Verified publisher metadata; update alongside lesson-level resolved references |
| `scripts/build_exelearning_pilots.py` | Explicit ID allowlist and output directory; only builds editable sources |
| `scripts/build_exelearning_sources.py` | Native seed import, Text/Form payload construction, single-SCO merge, theme and resource inclusion |
| `scripts/load_humanized.py` | Loads active `.humanized.py` variants; names are historical but functional |
| `scripts/pilot_experiences.humanized.py` | Cover title, lesson shell, situation shell |
| `scripts/pilot_scene_content.humanized.py` | Five Text blocks, phase markers, explicit asset references, review/result |
| `scripts/pilot_challenges.humanized.py` | Sort/sequence/budget/revision configuration and topic image references |
| `exelearning/pilot/experience.humanized.js` | Theory renderer/citations, two situation cases and their action/consequence copy |
| `exelearning/pilot/challenge.humanized.js` | Drag engine, keyboard/touch fallbacks, checks, undo/reset, topic feedback and budgeting arithmetic |
| `exelearning/pilot/scene.humanized.js` | Five-phase navigation, gates, optional timer and native score presentation |
| `exelearning/pilot/{scene,challenge}.css` + `experience.humanized.css` | Approved visuals and responsive rules |
| `exelearning/seed/*.elpx` | Native eXe 4.0.6 seeds, already UI-authored; keep intact |
| `scripts/prepare_pilot_dev_preview.py` | Development HTML merge and theme ZIP preparation; requires BeautifulSoup |
| `scripts/qa/simple-experience-check.cjs` | Baseline end-to-end flow and known solutions; adapt assertions for a new course |
| `scripts/validate_exelearning_pilots.py` | Baseline ZIP/manifest/font/source/preview checks; contains baseline-specific expectations |

Do not edit generated `.elpx`, preview HTML and source files independently and expect changes to persist. Data/Python/JS/CSS are authoring sources; regenerate `.elpx`, import it, export in eXe, and replace preview with the extracted actual export.

## New-topic procedure

1. Bootstrap into a new directory. Choose the closest interaction profile: `budgeting` (sort → allocate → revised allocate) or `evidence-sequence` (sort → order). Keep the original baseline directory as reference.
2. Create a brief with the exact topic, audience, learning objective, three theory titles, verified source claims, two situations, all three optional activities, DnD IDs/solutions, two quiz keys and four asset roles. The example brief is editable planning data, not a build API.
3. Adapt the selected baseline consistently across the source map. Replace course/title/domain-specific copy and asset paths. Keep HTML classes/data hooks, event names, five phase numbers, native Form behavior and CSS system intact.
4. Search ALL active authoring files for `C01`, `C12`, topic-specific labels and `cid===` / `cfg.course===` branches. Update the selected-course mapping or refactor it explicitly into a profile map. Python files also contain `if cid=='C01' else ...`. Review every branch; a global ID replacement is insufficient.
5. The budget engine hardcodes target IDs `server`, `backup`, choice `stage` and 10-unit tokens. Either preserve those internal IDs while relabeling the scenario coherently, or update **every** lookup, check, feedback and QA solution together. A different allocation model needs an explicit implementation change and arithmetic tests.
6. The sequence profile declares unused distractors as `bank`. Preserve that validation. For sort, declared solution keys must cover every item, targets must exist, and no valid card should be unreachable by keyboard/touch.
7. Replace hardcoded source-verification date in the renderer and baseline validator when research changes; ideally read the actual metadata. Do not re-date unverified references. Refresh source audit documentation.
8. Give each changed theme a unique registered name/title, consistently in source properties, `theme/config.xml` and theme ZIP. eXe may retain an imported theme with an older name. Never import a changed file under a stale registered name and assume the new JS is active.
9. Adapt the ID allowlist and QA cases before building. Baseline scripts intentionally assert the original values, dates, counts and quiz keys. Do not remove assertions merely to get a green result: replace them with corresponding checks for the new course.
10. Build sources, test development preview, import/export through eXe, then test the actual resulting ZIP. Compare screenshots with the original reference at the same viewport.

For unchanged baseline reproduction, run the original scripts without modifying content; exact ZIP bytes may differ because native IDs/timestamps and platform export metadata change. Design/behavior identity means the same assets, layout and states, not identical archive hashes across independent exports.

Branding: the source builder bundles `assets/branding/bps-corpu-transparent.png`; the scene content adds an explicit hidden `data-brand-logo` image reference so eXe registers it; scene JS displays that resolved asset in `.scene-identity` / `.scene-brand-logo`. Preserve this handoff. Source provenance is `assets/branding/bps-corpu-source.json`.

## Stable DOM and event contract

Keep `.lesson-config`, `.lesson-root`, `.lesson-content`, `.sim-root`, `.sim-content`, `.word-config`, `.word-root`, `.dt-config`, `.dt-root`, `.sp-config`, `.sp-root`, `.dnd-config`, `.dnd-challenge`, `data-drag`, `data-drop`, `data-drop-target`, `data-mobile-target`, native `.exe-form-container` and the `data-lcm-phase` markers. `lcm-lesson-finish`, `lcm-simulation-finish` and `lcm-practice-complete` coordinate gates. Do not run the theme against editor-only DOM; its initialization deliberately requires `body.exe-export`.

JSON embedded inside HTML must escape `<` as `\u003c`; visible data must be HTML-escaped. No `eval`, remote scripts, remote fonts or new runtime framework. Suspicious URLs shown in fictional emails are inert text, not clickable links. Source bibliography URLs are the intended external links.

Find the words: `data/pilot_word_search.json`, `exelearning/pilot/word-search.js` and `.css`; see [word-search.md](word-search.md). The generator bundles them into the theme; situation completion reveals `.word-root`, then `.dt-root`, then `.sp-root`, then the required case DnD. Content-only H5P reference inspection is recorded in `docs/word_search_reference.json`.

Drag the Words: `data/pilot_drag_words.json`, `exelearning/pilot/drag-words.js` and `.css`, embedded by `pilot_experiences.humanized.py`. See [drag-words.md](drag-words.md). Word search now continues to `.dt-root`; Drag the Words continues to Sort the Paragraphs; that activity continues to the case DnD. Keep a single visible activity and all native quiz gates.

Sort the Paragraphs: `data/pilot_sort_paragraphs.json`, `exelearning/pilot/sort-paragraphs.js` and `.css`, plus native Text shell in pilot_experiences. See [sort-paragraphs.md](sort-paragraphs.md). Drag the Words now reveals `.sp-root`; the paragraph activity continues to the existing case DnD.

Repository source baseline is authoring/baseline. Update its authoring JS/CSS and keep scene engines out of native seed theme files. scripts/release_scorm_kit.py creates the starter and repository mirror. Optional extensions are documented in [enhanced-interactions.md](enhanced-interactions.md).
