---
name: scorm-exe-scenes
description: Create or adapt SCORM courses using the approved LCM eXeLearning scene template, with sourced theory, simple decision situations, word search, sentence-gap Drag the Words, Sort the Paragraphs, accessible drag-and-drop, generated illustration assets and native assessment. Use when asked for this course style or a course based on this template.
---

# SCORM eXe Scenes

Produce a course in the approved LCM scene style. Treat the bundled implementation as the template; do not redesign it from a verbal description. This skill is portable: follow these files even when your agent has no skill discovery system. Resolve paths relative to this SKILL.md, never to the original author's computer.

## Start

1. Read the user's brief and existing project instructions. Keep their course count and authorization boundaries. The bundled two pilots are examples, not a request to create twelve courses.
2. Read [course contract](references/course-contract.md) and [design contract](references/design-contract.md). For writing, read [narrative and sources](references/narrative-and-sources.md). For illustration work, read [asset production](references/asset-production.md).
3. Run `python <skill-dir>/scripts/bootstrap.py --output <new-project-directory>` to unpack a self-contained working template. The destination must be absent or empty. This copies the approved C01/C12 implementation, fonts, images, native sources, actual exports and QA. No API or network access is needed to unpack.
4. Inspect `exelearning/pilot/qa/` screenshots and open the actual baseline preview before editing. Preserve the scene shell, spacing, typography and controls.
5. For a new topic, fill `course-brief.json` using the shape in `assets/course-brief.example.json`; validate it with `python <skill-dir>/scripts/validate_brief.py <project>/course-brief.json`. Read [data schema and index conventions](references/content-schema.md), then follow [implementation map](references/implementation-map.md). The brief is an editorial contract, NOT a generic build input: the baseline contains topic-specific Python/JS branches that must be deliberately adapted.

## Non-negotiable defaults for this template

- Flow: cover → three sourced theory pages → formative check → two simple decision situations → optional Find the words → optional Drag the Words → optional Sort the Paragraphs → multi-step drag-and-drop → two native quiz questions → explanation → result. Learning precedes practice.
- Use a topic-specific cover title, a short description and the start button. Keep simulation labels with the examples in the lessons.
- One eXe page/SCO, five phase markers (0–4), five native Text blocks plus one native Form. Custom practice lives in Text/theme; assessment and SCORM runtime remain native eXe.
- For the BPS template, keep the original transparent BPS CorpU logo in the top-left header on every phase, beside the institution/course title. The opposite header side contains only fullscreen; do not display “Mandiri / Tanpa batas waktu”. An enabled optional countdown belongs in the bottom controls. Bundle it offline; never redraw, recolor or replace it with generated art.
- Preserve the established visual system and actual assets for an identical baseline. For a new topic, change subject matter and topic illustrations while retaining composition and interaction grammar.
- Body/actions at least 16px; supporting text at least 14px; theory is 22px desktop/20px mobile. Scroll content instead of shrinking it. Preserve large usable controls and visible focus.
- Indonesian semi-formal, natural, professional; address the participant as “Anda”. Explain a specific concept, then show an explicitly labeled fictional example. Use verifiable primary sources on every theory page, with paragraph citations and visible source details.
- Non-drag situations use two plainly labeled actions, an immediate consequence and persistent previous/next. Preserve the approved drag-and-drop capabilities: pointer/touch, select-and-place, keyboard, undo/reset and clear feedback.
- Untimed by default. Optional 120 seconds starts after theory. Expiration preserves work and never submits an unanswered quiz.
- Only the two native quiz questions contribute to raw score 0/50/100. Preserve the current native policy: both answered → passed (passScore=0); unanswered → incomplete. A different mastery policy requires an explicit brief and corresponding runtime/LMS tests.
- Offline runtime: bundle fonts, images and licenses. Source links can require internet. Never claim XP/Trophy or live LMS integration without platform evidence.

For the vocabulary reinforcement between situations and case practice, read [Find the words](references/word-search.md). Show numbered meaning clues and letter counts. Use left-to-right or top-to-bottom paths and provide a first-letter hint for each item. Separate word paths with filler cells and include at least one perpendicular crossing at a matching interior letter. Terms appear only after finding them or explicitly revealing the solution; retry hides them again. Preserve its optional, ungraded nature and distinguish independent finds from assisted answers.

For sentence completion after the word search, read [Drag the Words](references/drag-words.md). Keep the word bank, explicit checking and reversible placements, and keep assisted answers separate from independent completion.

For paragraph ordering after Drag the Words, read [Sort the Paragraphs](references/sort-paragraphs.md). Preserve drag, movement buttons, keyboard cancellation, assistance accounting and optional continuation.

## Build and handoff

Follow [eXe authoring/export](references/exe-workflow.md), then [acceptance checks](references/acceptance.md). Preparing `.elpx` or merging a development preview is not a platform SCORM export. Do not label a hand-zipped development directory an eXe export.

Deliver actual SCORM 1.2 ZIP, editable `.elpx`, matching extracted preview, theme ZIP, source mapping, image prompt/provenance log, and QA results with screenshots. State which checks ran and which LMS checks remain. If browser or image-generation capability is unavailable, finish independent preparation and report the precise remaining step; do not invent an export or generated asset.

User instructions may explicitly revise these defaults. Record the deviation in the brief and validate its consequences. Do not silently substitute a new design, scoring policy, platform, model or interaction framework.
