# Authoring data and index conventions

Read this when filling a course brief or adapting a topic. The complete valid example is `assets/course-brief.example.json` relative to the skill. It is an editorial contract, not a build API. `scripts/validate_brief.py` checks structure and invariants; it does not verify factual truth, natural writing or design quality.

## Brief root and active data

| Brief field | Meaning | Active authoring location after bootstrap |
|---|---|---|
| `id`, `title`, `audience`, `objective`, `language`, `tone` | Exact scope, participant and useful learning outcome | Catalog, lesson objective and relevant topic-specific Python/JS |
| `interaction_profile` | `budgeting` or `evidence-sequence` case profile | Pilot challenge Python and theme challenge JS |
| `branding` | Original transparent logo path, `placement: top-left`, `preserve_original: true` | Brand PNG, scene content and scene JS/CSS |
| `lessons` | Three sourced theory pages | `data/pilot_lessons.sourced.json[course-id].lessons` |
| `situations` | Two events, each with two actions and consequences | Currently `cases` in `experience.humanized.js`; not consumed automatically from brief |
| `word_search` | Five clue-only targets and fixed grid | `data/pilot_word_search.json[course-id]` |
| `drag_words` | Three sentence gaps, four choices | `data/pilot_drag_words.json[course-id]` |
| `sort_paragraphs` | Four coherent shuffled paragraphs | `data/pilot_sort_paragraphs.json[course-id]` |
| `practice` | Required multi-stage case and solutions | `scripts/pilot_challenges.humanized.py` plus challenge JS |
| `quizzes` | Two native graded questions | `data/course_experiences.humanized.humanized.json[course-id].quizzes` |
| `assets` | Scene, two topic objects and shared reward | Local `assets/` paths plus explicit importer references |
| `scoring` | Two questions; raw 0/50/100; passScore=0; answered passed / unanswered incomplete | Native Form seed configuration and scene submission guard |

The official logo is additional to the four illustrated course assets. Copying a brief into a project does not populate all these files. Follow the implementation map to synchronize them, especially the hardcoded C01/C12 branches, situations, headings and case-specific feedback. Keep course IDs, labels, amounts, asset paths and answer keys consistent across files and tests.

## Theory and references

Each lesson has `title`, `body`, `mode`, `example`, `example_note`, `references` and `paragraph_sources`. Body paragraphs are separated by two newline characters (`\n\n`). The mapping has one nonempty array per paragraph.

- `paragraph_sources` uses **1-based** indexes into that lesson's `references`, e.g. `[[1],[2]]`.
- Each resolved reference contains publisher, full title, year, HTTPS URL, section/page locator, actual `verified_on` date and a short `verification` note. Use DOI/update date when available. Keep registry `data/pilot_references.json` coherent with the resolved lesson-level records.
- Last lesson: `mode: check`, `prompt`, three `options`, **0-based** `correct` index and `feedback`. First two pages use `mode: example`.
- `example_note` labels invented cases/data. Do not attribute them to the source publisher. Do not copy the example's historical checked date onto new research.

## Situations and quiz

Each situation has `title`, `body`, `prompt` and exactly two `options`. An option contains `label`, Boolean `good`, consequence `title` and `body`. Declare one preferred action; the participant may compare both. Completing a situation requires a choice, rather than only the preferred choice.

Native quiz: `question`, three `options` labeled `A. …`, `B. …`, `C. …`, uppercase `answer_key` (`A`, `B` or `C`) and explanatory `feedback`. Quiz keys are **letters**, not the formative check's numeric indexes. Equal weights produce 0/50/100. Avoid changing keys when merely improving prose.

## Find the words

Use a 10×10 uppercase A–Z `grid` and five `words`. A word has `term`, `clue`, `meaning`, `cells`. Cells are **0-based** `[row,column]` pairs in the term's reading order, contiguous left to right or top to bottom. Each target must occur exactly once in those two directions. The first coordinate is used automatically by the per-item hint button. Keep a filler cell between paths except where perpendicular words share one matching interior letter. Include at least one such crossing.

`clue` is initially visible and must not contain any target answer. `meaning` is feedback after discovery and may name the term. Target labels remain empty until found or explicitly revealed. Retry clears reveals. See [word-search.md](word-search.md) for full behavior.

## Drag the Words

Four `words` with unique safe lowercase IDs and distinct labels. Three `gaps` with unique IDs, `before`, `after`, `answer`, `feedback`. `answer` references a word **ID**, not its label. Each answer is used once; one word is unused. `after` can be an empty string. `bank` is reserved and cannot be a gap ID. Choice order must not hand out solution order. See [drag-words.md](drag-words.md).

## Sort the Paragraphs

`title`, `explanation`, four `paragraphs` (`id`, `text`), `initial_order`, `correct_order`. Both orders are arrays containing every ID exactly once. Initial order differs from correct order; paragraph text must be distinct and the narrative order defensible. Visible position labels are current slots, not original answer indexes. See [sort-paragraphs.md](sort-paragraphs.md).

## Required case profiles

- `sort`: every item ID maps to a known zone ID in `solution`.
- `sequence`: every item has a solution; unused distractors explicitly map to `bank`. Each numbered target has exactly one correct item.
- `budget` / `revision`: the baseline engine uses internal IDs `server`, `backup`, `stage`; ten tokens × 10 units = 100. Required amounts total 100 and use 10-unit increments. Adapt all code/checks together for a different model.

Do not confuse a required case `sort` stage with optional Sort the Paragraphs. The latter never unlocks the native quiz by itself. Only lesson, situations and checked required case completion satisfy the phase gate.

## Asset and persistence notes

Asset file paths are project-relative, never absolute cache paths or CDN URLs. Generated scene/cutouts must have their actual prompt/tool/model provenance. The official logo is an extracted source asset, not generated art. Fonts and licenses are bundled.

State survives in-page movement as implemented. A page reload restarts the local activity; the kit does not promise cross-session LMS suspend/resume or cross-agent tool availability. A native `.elpx` build is editable source; actual export still requires eXeLearning.

Historical narrative keys such as start/practice_note may remain for compatibility; inspect actual renderer callers before treating them as visible UI. The implementation map identifies active fields.
