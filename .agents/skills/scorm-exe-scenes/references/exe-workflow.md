# eXeLearning authoring and actual SCORM export

The baseline was verified using eXeLearning Online 4.0.6 at https://online.exelearning.net/. Treat menu names as a known baseline, not a guarantee for all future versions. Inspect the current UI before acting. Use the agent's supported browser tools; never depend on another agent's tab IDs, local browser profile or cached selectors.

## Local preparation

From the unpacked project root:

```text
python scripts/build_exelearning_pilots.py
python -m pip install -r requirements-authoring.txt
python scripts/prepare_pilot_dev_preview.py
npm ci --prefix scripts/qa
node scripts/qa/simple-experience-check.cjs --dev
```

Build uses only Python standard library; preview preparation needs BeautifulSoup. QA needs Node.js, Playwright and an installed Chrome (`channel: 'chrome'`). Use a supported alternate Playwright browser only after updating the launch configuration intentionally. Do not copy another computer's `node_modules`.

The builder writes only the two `.elpx` sources. Preview prep copies a known native exported shell and merges Text content/theme for fast iteration; that directory is named `dev-preview` for a reason. It prepares `exelearning/pilot/LCM_Scenes_Theme.zip` too. Do not submit `dev-preview` as the deliverable.

## UI import/export

1. Open eXeLearning Online. Styles → Imported → upload theme ZIP. Select its matching unique title. Baseline title: **LCM Scenes Unified baseline**. Do not overwrite a user's unrelated project; preserve its source before switching if needed.
2. File → Open → choose the newly generated `.elpx`. If asked whether to save the current project, evaluate whether it is a recoverable template or unrelated unsaved user work; do not discard unknown changes.
3. Wait for import to finish and check course title, one page “Misi”, native Form and selected theme. Open Preview and verify the rendered course, not just XML.
4. File → Export as → SCORM 1.2. Wait for export success, then locate the actual downloaded ZIP. Do not take a stale similarly named download. Check title/theme/source content inside the ZIP before copying it to `dist_scorm`.
5. Copy the unmodified downloaded archive into `exelearning/pilot/dist_scorm/`. Extract it into that course's `preview/` directory. If replacing an existing output, use the correct course path and keep unrelated files intact. Byte-match every preview file to the new archive.
6. Repeat only for the requested course IDs. Run actual-export QA below. If a browser file upload permission is required, let the user change the security setting; do not automate expanded file-access permissions.

Authoring source resource paths use `{{context_path}}/…`. Actual exports resolve these to `content/resources/…`. An unresolved token in exported HTML is a failure. Preserve native eXe resource/runtime files and include fonts/licenses/images in manifest dependencies.

## Actual-export verification

```text
python scripts/validate_exelearning_pilots.py
node scripts/qa/simple-experience-check.cjs
python -m http.server 8874 --bind 127.0.0.1 --directory exelearning/pilot/preview
```

Then open `http://127.0.0.1:8874/C01/index.html` or C12. The server is local and can be stopped after review. Preview does not send learner data to GOJAGS. Test real LMS separately when authorized and available.

If UI export is unavailable, deliver the ready source/theme and label the actual export pending. A native export included in the baseline bundle is a reference artifact, not a newly exported new-topic course.

Repository release workflow uses scripts/export_exelearning_ui.cjs and scripts/verify_projects.py. Official eXeLearning 4.0.6 may replace iDevice runtime files on export. form-compat.js carries the retained Form text-decoding fix in the authored theme, and scene.css hides internal Form data. Check both on the actual export. Native seed theme files must contain zero scene initializers.

Updating native questions also requires refreshing the Form host, its JSON data and its HTML in any development preview. Merging only Text blocks retains stale answer keys. The repository IT Enterprise preview helper performs this synchronization; final evidence must still come from the actual eXe export.
