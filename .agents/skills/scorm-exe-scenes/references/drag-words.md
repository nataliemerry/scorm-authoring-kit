# Drag the Words

Added 14 November 2026, using the interaction pattern in the supplied H5P.DragText 1.10 example: three sentence gaps, a bank of words including one distractor, explicit checking, retry, solution and feedback. This is independently implemented offline in native eXe Text/theme; it is not the H5P runtime. Original berry exercise text and H5P library code are not bundled.

## Flow and learning purpose

After optional Find the words, show Drag the Words, then optional Sort the Paragraphs before the existing required case-based DnD. It applies terms already taught to meaningful sentences. It remains optional and ungraded: the participant may advance to Sort the Paragraphs without solving the gaps. Only the two native Form questions affect LMS score/completion.

C01 covers input, output and outcome through the server-repair example; serapan is the unused choice. C12 applies safe handling of suspicious links, verification through known official contacts and protecting verification codes; logo pengirim is the unused choice. These statements apply the existing sourced lessons. Research new statements before using this activity on another topic.

## Data and source map

`data/pilot_drag_words.json` contains each course's `words` and `gaps`. Use four distinct words/short phrases with stable `id` and `label`. Each of three gaps has `id`, `before`, `after`, `answer` (word ID), and `feedback`. Three different words fill three gaps; one remains unused. Keep the word-bank order distinct from the answer order. Do not assemble ambiguous grammar where the distractor is also substantively defensible.

`scripts/pilot_experiences.humanized.py` embeds escaped `.dt-config` plus hidden `.dt-root` in phase 1. Scene-content Python adds this alongside the existing situations, word search and case DnD. `word-search.js` reveals Drag the Words when continuing. `drag-words.js` handles interaction and reveals `.sp-root` on continue; Sort the Paragraphs then reveals the case DnD. `drag-words.css` preserves the ivory reading surface, local fonts, teal controls and large readable sentences.

## Behavior

- Show an explicit word bank. The clue-only restriction belongs to Find the words; Drag the Words needs selectable word choices as requested.
- Accept real mouse/touch dragging and select-word/select-gap. Native button keyboard Enter/Space selects and places; Tab moves between controls, Escape cancels selection.
- One word per gap and one location per word. Filling an occupied gap returns its prior word to the bank. A placed word can be moved or returned with its clear button. Undo restores the previous placement.
- Preserve work after wrong answers. Only Periksa jawaban evaluates: mark empty, wrong and correct gaps, with text feedback in addition to color. Correct placement alone must not silently submit a grade.
- Tampilkan jawaban fills the correct words and marks the attempt as assisted. Checking or editing after revealing must not convert that attempt into independently complete. Ulangi clears placements, feedback and assistance. Keep assisted completion separate from native LMS completion.
- Continue remains available throughout. It advances to Sort the Paragraphs; it must not bypass that practice or native quiz gates.
- No native score calls originate from this activity. A local correct-count is practice feedback only.

## Layout and verification

Use three short numbered sentence rows with inline blank buttons, plus a sticky word bank inside the activity scroller. Keep footer Periksa jawaban and Urutkan paragraf actions reachable. Place undo/retry/solution in the scroll area to avoid crowding the footer on phones. Text ≥18–20px, supporting text ≥16px; ordinary controls ≥44–46px. Retain source header logo and fullscreen-only opposite side.

Test blank check, wrong distractor, correct answers, replacement without lost/duplicated tokens, return/remove, undo, retry, assisted solutions, optional continue and no LMS-score changes. Test actual mouse/touch dragging, taps and keyboard. Verify short/mobile viewports, sticky-bank reachability, pointer cancellation and edge scrolling. Re-run existing word-search, case DnD, native grading and timer tests. Update actual platform exports, starter, installed skill and portable ZIP.
