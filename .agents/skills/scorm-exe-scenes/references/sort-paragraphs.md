# Sort the Paragraphs

Added 14 November 2026, following the supplied H5P.SortParagraphs 0.11 interaction: reorder paragraphs, movement buttons, keyboard grab/move/drop/cancel, check, retry and solution. This is an independently implemented offline activity in native eXe Text/theme. The H5P library and original morning-routine text are not copied.

## Content and flow

After optional Drag the Words, show Sort the Paragraphs, then continue to the existing required case DnD. It is optional and ungraded. Keep all previous interactions and native quiz gates.

Use four short paragraphs forming one coherent passage. The correct sequence must follow actual references, cause/effect or procedural dependencies. Avoid independent points with several equally valid orders. Initially shuffle them; visible position labels describe their current position, not the solution. Do not show source IDs or an answer list.

C01 connects a fictional monthly budget report, comparison with outputs, investigation of stalled work and follow-up planning. C12 follows a fictional suspicious email, independent verification, confirmation from a known contact and evidence handoff. Mark these as simulations; preserve the theory's existing sources and verify any new factual/procedural claims for new topics.

## Data and implementation

`data/pilot_sort_paragraphs.json`: per course, `title`, `explanation`, four `paragraphs` (`id`, `text`), `initial_order` and `correct_order`. Each order must be a full permutation of the four unique safe IDs; the initial order must differ from the solution. Use distinct meaningful text, not duplicates that make strict position checks arbitrary.

`scripts/pilot_experiences.humanized.py` embeds escaped `.sp-config` and hidden `.sp-root` in the phase-1 Text block. Scene-content includes it alongside the earlier activities. `drag-words.js` reveals it on continue; `sort-paragraphs.js` handles order state and reveals case DnD on continue. `sort-paragraphs.css` preserves the ivory/teal layout, local fonts and large controls.

## Interaction contract

- Drag only from a clearly labeled Geser handle so ordinary paragraph scrolling remains usable. Show a before/after insertion indicator. Pointer cancellation or dropping outside valid cards leaves the order unchanged. Support edge scrolling and real touch.
- Naik/Turun buttons move one position. Disable movement beyond the list boundaries. Stable IDs prevent lost/duplicated cards.
- Keyboard Enter/Space grabs the handle, Up/Down reorders, Enter/Space drops. Escape restores the whole order before that keyboard grab and removes its temporary undo history. Keep visible focus on the moved paragraph.
- Urungkan restores the prior order. Ulangi restores the initial shuffled order, clears checked state and assistance. Keep state when revisiting during the current attempt.
- Check explicitly evaluates current positions and adjacent narrative connections, with text feedback plus color. Practice counts are explanatory feedback, not a new LMS grade or a copy of H5P penalty scoring.
- Tampilkan urutan reveals the solution and marks assistance. Checking/editing/undo afterward must not turn the assisted attempt into independently complete. Only Ulangi clears assistance.
- Continue remains available without solving and advances to case practice. It must not bypass the required case or native quizzes. No SCORM scoring calls originate here.

## Design and QA

One scrollable list of four readable paragraph cards, current-position labels and clear handles/buttons. Keep body text 21px desktop / 19px mobile, support ≥16px and actions ≥44–46px high. Persistent footer contains Periksa urutan and Praktik kasus. Secondary actions live within the reading scroller. Preserve top-left official logo and fullscreen-only opposite header.

Test real mouse/touch reordering, before/after insertion, movement buttons, boundaries, keyboard Space/Enter/arrows/Escape, undo, wrong/correct order, position/transition counts, retry, assisted solution and optional continue. Ensure IDs/text are not lost or duplicated. Verify screenshots, mobile scrolling, retained native scores, all previous interactions, timer and manifest. Update actual eXe exports, portable starter, installed skill and kit.
