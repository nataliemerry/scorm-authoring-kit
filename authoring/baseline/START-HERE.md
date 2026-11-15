# Standalone LCM SCORM baseline

This is the approved C01/C12 baseline, copied from the portable scorm-exe-scenes skill.
Read that skill's SKILL.md and linked references before adapting. See
exelearning/pilot/README.md for the current courses. Paths are project-relative.

Build editable sources: python scripts/build_exelearning_pilots.py
Prepare dev preview/theme: install requirements-authoring.txt, then run
python scripts/prepare_pilot_dev_preview.py
QA: npm ci --prefix scripts/qa, then node scripts/qa/simple-experience-check.cjs
Structure: python scripts/validate_exelearning_pilots.py
Serve: python -m http.server 8874 --bind 127.0.0.1 --directory exelearning/pilot/preview

Build is not export. SCORM ZIPs under exelearning/pilot/dist_scorm are actual
historical eXeLearning Online exports. Re-export after any content change.
New topics require adapting the explicitly documented topic-specific branches.
Do not claim these old exports are a new course. Do not rebuild ten other drafts.

Unified release 2026-11-15. Native seed theme files contain no scene engine. Form compatibility, review, optional extensions and all approved activities are authoring sources under exelearning/pilot. Baseline QA tests C01/C12 only. New topics require explicit adaptation of the documented branches.
