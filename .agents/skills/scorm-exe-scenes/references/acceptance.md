# Acceptance and handoff

Run checks against **actual platform exports** after exporting. A green development preview is useful but insufficient. The two baseline scripts already cover most of this list; supplement new-course assertions rather than weakening them.

## Content and source evidence

- Three theory pages teach definitions, distinctions and application criteria before practice. Every paragraph maps to a source that was actually read. Source links resolve to the declared publisher/section; document the verification, not just a URL availability check.
- Visible source block on all three pages: full title, publisher/year, location, checked date. Citation index references the correct per-page item. No copied historical verification dates for new research.
- Fictional example and invented case numbers labeled. Theory does not imply that a publisher endorsed the invented case.
- Two clear situations with two actions each; feedback matches each selection and selection survives back/next. Quiz keys/feedback agree with the taught concept.
- Read aloud once for unnatural repetition, generic openings, ambiguous pronouns, unexplained terms and excessively long instructions. Preserve factual qualifications.

## Interaction and state

- Theory example open/close; previous/next; formative check blank/wrong/correct. Correct unlocks practice, other answers do not.
- Both situations complete before the optional activity chain and required case DnD. Practice completion gate resists phase navigation bypass.
- Real mouse drag and real touch drag, select-and-place fallback and keyboard placement; undo/reset; wrong solution retains work and explains it; all stages finish correctly.
- Sorting solution covers every card. Sequence distractors stay in bank. Budget allocations obey totals and changed-case requirements.
- Native quiz both correct → raw 100; one correct → 50; both wrong → 0. All answered follows configured native completion policy. Missing either answer stays incomplete and cannot be submitted by navigation or timeout.
- Optional timer starts after theory, expires without destroying work or switching stages. Untimed remains default. Do not claim cross-session resume unless it has been implemented and tested; the baseline's in-page back navigation is not LMS suspend/resume.

## Visual and access

- Inspect screenshots at 1600×1100, 1366×768 and 390×844. Check cover, every theory page, expanded example/source block, situation feedback, each DnD family, native quiz and result.
- No horizontal overflow, clipped actions, inaccessible scroll area, overlapping fixed footer, tiny source links or hidden selected state. Body/actions ≥16px; supporting ≥14px; theory 22/20px. Test both visible and scrolled text.
- The original transparent logo loads in the top-left header on cover, theory, situations, drag practice, quiz, review and result. No distortion, white rectangle, cropping or overlap with fullscreen control at desktop/mobile widths. Verify its exported PNG matches the master.
- Real local fonts loaded; font licenses bundled. At least three meaningful topic images plus shared reward per course, with correctly displayed cutouts. Missing images are failures, not acceptable placeholders.
- Keyboard focus and labels visible; status feedback announced; no instruction relies only on color, drag or animation. Automatic checks complement manual inspection and do not establish universal accessibility compliance.

## Package and reporting

- SCORM 1.2 manifest; exactly one SCO; all declared files exist. Native runtime remains present. No unresolved resource token, absolute cache path, credential, CDN font/script or broken relative asset reference.
- Actual exported ZIP is unmodified. Extracted preview matches its files byte-for-byte. Record export source, date, platform version where exposed, course ID and theme identity.
- Local mocked LMS validates Initialize/SetValue/Commit/Finish calls and values; live LMS launch/score/completion is a separate check. Report it pending when not run. Never claim XP or Trophy issuance from an illustration or local test.
- Deliver ZIP, `.elpx`, theme ZIP, matching preview, authoring source, references/claim map, image prompts/provenance, and QA report/screenshots. Explain which version to upload and how to open the preview.

Baseline test command: `node scripts/qa/simple-experience-check.cjs`. Structural command: `python scripts/validate_exelearning_pilots.py`. Both are intentionally C01/C12-specific; adapt cases and expectations for another topic. A brief validator checks editorial structure only; it cannot verify source truth, visual quality, or LMS behavior.

Header regression: `.scene-chrome-right` must contain exactly one fullscreen button and no clock/mode text. Untimed view has no visible clock. Optional active countdown and expiration message remain in the footer, without changing header contents.

Find the words: follow [word-search.md](word-search.md). Check filler spacing and at least one perpendicular crossing on a matching interior letter. Verify left-to-right and top-to-bottom solutions, rejection of reversed and diagonal selections, and a separate first-letter hint for every item, actual mouse/touch drag, endpoint taps, keyboard arrows/Enter/Escape, no duplicate credit, help accounting, retry and optional continue. At short desktop heights, the board must fit inside its scroller and keyboard focus must not scroll the outer page.

Drag the Words: follow [drag-words.md](drag-words.md); verify four choices/three gaps, actual mouse/touch plus endpoint/keyboard, empty/wrong/correct checks, replacement, remove, undo, retry, assisted-state persistence and optional continue to Sort the Paragraphs.

Sort the Paragraphs: follow [sort-paragraphs.md](sort-paragraphs.md); verify four paragraphs, mouse/touch before/after moves, Up/Down boundaries, Space/Enter/arrows/Escape restoring pre-grab order, undo, shuffled reset, correct position/transition counts, assisted state and optional continue to required case.

Distinguish required checks from existing evidence: consult the current QA JSON and VALIDATION.md. Do not claim exhaustive accessibility, all browsers, every viewport, every orientation, source truth or live LMS behavior from a structural validator.
\nUnified rebuild checks: native seed contains zero scene engines; a clean bootstrap build and a second build each contain exactly one engine/header/footer. Theme JS/CSS match the native export. Review correct-badge count matches score/50 for two equal-weight questions. Test the native Form decoder on the exported package and verify internal data remains hidden. Optional profile checks are in enhanced-interactions.md.\n