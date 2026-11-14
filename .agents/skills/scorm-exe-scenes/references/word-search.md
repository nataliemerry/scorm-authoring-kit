# Find the words

Added 14 November 2026, following the interaction pattern in the supplied H5P FindTheWords 1.4 example. This implementation is an offline native-Text/theme activity; it is not an embedded H5P runtime and does not send H5P grades. Course vocabulary is independently authored from the lessons.

## Placement and purpose

After both decision situations, show Find the words, then continue to optional Drag the Words followed by optional Sort the Paragraphs and then the required case DnD. It reinforces recognition of already taught terms; it is not a substitute for theory, decision practice or assessment. It is optional: “Lanjut ke Drag the Words” remains available without finding every word. Only the two native Form questions affect SCORM score/completion.

Use five familiar terms per course. Initially show numbered clues, letter counts and a first-letter hint button for each item. Reveal each term only after it is found or the learner explicitly requests the solution. Retry must hide the terms again. Current C01 terms: INPUT, OUTPUT, OUTCOME, EFISIENSI, RISIKO. C12: PHISHING, MFA, IDENTITAS, TAUTAN, KODE. Keep descriptions grounded in the sourced material; avoid unsupported new theory inside a puzzle.

## Implementation and data

- `data/pilot_word_search.json` holds a fixed 10×10 uppercase letter grid and `words` entries: `term`, `clue`, `meaning`, and `cells` as zero-based `[row,column]` pairs in reading order.
- Each term must match its listed grid cells exactly. Coordinates are zero-based, unique and contiguous in bounds. Use left to right or top to bottom. Validate every word and cross-cell conflict when creating grids.
- Separate unrelated paths with filler cells. Two words may cross at one matching letter only if they are perpendicular and the shared letter is inside both words. Avoid end-to-end contact, parallel paths in adjacent rows/columns and endpoint crossings. Include at least one true crossing per puzzle.
- Select the first letter before the last letter. Preserve a stable board during the attempt so retry and back navigation are understandable.
- Avoid accidental duplicate occurrences of a target elsewhere in filler; check both supported reading directions when authoring. A found word's highlight must correspond to the accepted path.
- `scripts/pilot_experiences.humanized.py` embeds escaped `.word-config` JSON and a hidden `.word-root` in the phase-1 native Text block. `experience.humanized.js` reveals it after situations. `word-search.js` handles the puzzle; `word-search.css` inherits the ivory/teal visual system and local fonts.
- Continue hides the puzzle and reveals Drag the Words. Drag the Words then reveals Sort the Paragraphs, whose continue action opens the case DnD. Keep its completion state separate from the SCORM grade and from required case-practice completion.

## Interaction and feedback

Support real pointer/touch dragging and two-endpoint selection. Keyboard: arrow keys move between letters, Enter/Space choose endpoints, Escape cancels. Keep a single keyboard entry point into the board (roving tabindex), visible focus, row/column/letter labels, and status feedback. Prevent page scrolling only while interacting with the board, not the entire reading panel.

Wrong or non-straight selections do not erase previous finds. Previously found terms cannot inflate the counter. “Tampilkan jawaban” marks remaining words as assisted; it does not mark them as independently found or complete. “Ulangi” resets found and assisted state on the same board. Show progress with text and differentiate found versus assisted using labels, not color alone.

## Design and QA

One visible board, a clue list and two secondary tools; one persistent continue action. Desktop uses board plus vocabulary columns; mobile stacks them in a scrollable panel. Keep letters ≥18px on mobile and cells ≥24px at supported widths. The dense letter board is a deliberate exception to the ordinary 44–48px action-button target: letter buttons must still be usable, with endpoint selection and keyboard alternatives. Other controls remain large.

Test correct paths to the right and down, rejection of reversed and diagonal paths, each clue’s first-letter button, duplicate selection, mouse drag, actual touch drag, touch endpoints, keyboard arrows/Enter/Escape, all found, retry, assisted answer accounting and optional continue. Preserve phase gates, timer expiration, native score and header identity. Include desktop/mobile screenshots and structural checks in the exported packages. Update the starter, installed skill and portable kit after changing this feature.

Clue-only default: `clue` is the initial visible hint; it must not contain any target term from the course. `meaning` may name terms because it is used after a successful find. Do not leak answers through visible headings, hidden-but-screen-reader-readable labels or initial term elements. The configuration still contains local solutions; this is a learning UI requirement, not a secrecy/security mechanism.

Each item has a **Tunjukkan huruf awal** button. It focuses and highlights only the initial cell. The term stays hidden until found or explicitly revealed. A correct find after using its hint is labeled as assisted. Retry clears hints and all progress.
