# Optional enhanced interaction profile

This profile preserves the video, image hotspot and question-set additions introduced with Pengelolaan Data. The baseline continues to use native Form assessment. Select one assessment renderer per scored course.

The three files are in assets/enhanced-interactions in this skill. Bootstrap also supplies them under exelearning/pilot and includes the JS/CSS in the baseline theme. Load the JS outside an already-running DOMContentLoaded callback so its initialization listener can run.

Use assets/enhanced-interactions/enhanced-interactions.example.json for configuration shapes. Validate it with scripts/validate_enhanced.py. Replace example media paths with real bundled files, add explicit resource references to native Text content, and verify media inclusion in the exported manifest.

## Markup and events

Each host is a native Text section with one JSON script and one application element.

| Profile | Host class | Config class | Application class | Completion |
| --- | --- | --- | --- | --- |
| Video | iv-root | iv-config | iv-app | lcm-video-finish |
| Image hotspot | hotspot-root | hotspot-config | hotspot-app | lcm-hotspot-complete |
| Question set | quiz-set-root with data-renderer="lcm-question-set" | quiz-set-config | quiz-set-app | lcm-quiz-complete |

Config scripts use type="application/json". Escape < as \u003c when embedding JSON. Keep visible content HTML-escaped. The host selectors are scoped to each activity.

Video uses source, mime, poster, interactions, nextSelector, hideNextUntilComplete and optional completeEvent. Each interaction has at (seconds or "middle"), timeLabel, question, options, zero-based correct and feedback. Verify every numeric timestamp falls inside the real video's duration. Marker, playback, volume, keyboard seek, question feedback and continuation must be tested. Preserve any required transcript/caption assets available in the source course.

Hotspot uses background, alt, title, instruction, required and regions. Geometry is percent-based x/y/width/height. Every region has a unique id, correct boolean, label and feedback. required must be achievable. Pointer areas and alternative numbered buttons have the same behavior.

Question set uses renderer, activityId, title, intro and questions. Each question has a unique id, question, options, zero-based correct and feedback. It registers one scored activity through exeScorm12.activities and writes via the runtime policy/client. It guards unanswered questions and computes percentage across the configured question count. A two-question set produces 0/50/100. Test inactive LMS, blank submission, all scores, retry and completed/answered registry state.

## Integration and tests

Choose placement and navigation explicitly for the new course. Configure nextSelector and completion event handlers to preserve its declared prerequisites. The baseline Text/Form flow is documented in course-contract.md. Pengelolaan Data is the existing extended-course implementation with its own specialized navigation and player.

Run the profile validator and scripts/qa/enhanced-check.cjs in the repository. Test the actual course and its exported package. Record media hash, poster, duration, timestamps, keyboard/touch, feedback, completion and LMS evidence. A working example config does not establish a completed new course.

Keep all media offline, preserve original provenance, and document which renderer owns the final score. A plain existing exported course remains a supported input when its editable authoring project has not been supplied.

Additional media and illustrated answer cards may extend the four primary brief assets. Keep scene, object-1, object-2 and reward exactly once; give each additional asset a unique role and actual provenance. Validate that every case-card image is registered, bundled and loaded on both desktop and mobile.

The repository IT Enterprise example adapts these families while retaining native Form scoring. Its course-local enhanced-interactions.js supports an ungraded question set (scored:false), which skips activity registration and LMS writes. The generic scored renderer in this kit does not implement that switch: deliberately port and test the ungraded fork when combining a practice question set with native Form. Never assume that a JSON flag alone disables grading in another renderer.

Fullscreen video must explicitly override inline max-width/max-height limits. Size the fullscreen frame to the viewport and its video to 100% width/height with object-fit:contain. Restore inline sizing on exit. Question overlays must use the fullscreen frame bounds rather than page-header offsets. Verify actual enter/exit, video bounds, controls and question interaction on desktop and narrow viewports.

## Visible hotspot labels

Every selectable region displays a compact live-text label before selection, alongside its number. Optional `displayLabel` names the concept represented by the object in terms directly relevant to the question and taught theory (for example “Aturan akses”, not “Perisai & kunci”); it falls back to `label`. Labels must help learners reason about the task. Do not substitute literal prop names for the intended concept. Do not mark a choice as correct/incorrect or expose its feedback before selection. Repeat the same number and object label on alternative buttons; keep the accessible full label and synchronized pressed state.

Place the small ivory caption at the edge of the region, away from identifying details. Avoid large opaque cards or full-image shading. Keep text at least 16px on desktop and 14px on narrow screens, wrap instead of truncating, and check every label fits its region at 390px. Preserve pointer/keyboard selection, retry, feedback and completion gating. Compare desktop and mobile screenshots.
