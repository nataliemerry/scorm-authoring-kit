# Visual contract

Use the bundled CSS and components. They are the reference for exact values and responsive behavior. Do not reconstruct them with a new framework, CDN theme or a landing-page template.

## Composition

- An immersive full-viewport illustrated workplace scene, dark petrol overlay and quiet text area. Scene remains contextual rather than overpowering the text.
- Official BPS CorpU identity: use `assets/branding/bps-corpu-transparent.png`, extracted with its original alpha mask from Peraturan BPS No. 4 Tahun 2026, Lampiran II, PDF page 14. Render uncropped with `object-fit:contain`, approximately 50×52px desktop / 40×42px mobile; keep original proportions, colors and lettering. Add no background plate, filter or artificial shadow. Keep logo left of the institution/course text in every phase. Do not generate a replacement logo. For another organization, change identity only when requested.
- Thin top chrome: institution/course at left, only the fullscreen button at right; optional active countdown in the bottom controls. Bottom chrome shows current phase and a relevant next action.
- A single ivory reading/activity panel with generous padding and restrained rounded corners. Theory: topic object on the left, readable copy on the right; stack on narrow screens.
- One focal task at a time. No website hero/navigation bar, feature grid, pricing cards, testimonial sections, dashboard sidebars or gratuitous decorative badges.
- Source notes are a pale sage block with a teal left rule, numbered links and section/page locators. Examples are visibly separated and labeled simulations.

## Typography and palette

| Role | Baseline |
|---|---|
| Display/headings | Local Bricolage Grotesque variable WOFF2 |
| Body, controls, references | Local Source Sans 3 variable WOFF2 |
| Theory body | 22px desktop; 20px mobile |
| General body/action minimum | 16px |
| Supporting/reference note minimum | 14px; primary source links 16px |
| Main ink | `#123a37` |
| Teal | `#277668` |
| Mint | `#dceee1` |
| Restrained amber/focus | `#e8b276` |
| Dark scene ground | `#102926` |

Values here describe the system; the shipped CSS includes contextual colors and overrides. Preserve font binaries and SIL OFL license files. Do not replace the fonts with system sans, Inter or Roboto without an explicit user request.

Controls target 44–48px minimum height. Distinct button labels explain actions. Visible focus must survive the native theme. Inputs use visible labels. Feedback is inline and announced through status semantics. Respect reduced-motion preferences. Course text must remain live HTML, not baked into images.

## Responsive behavior

Use the existing 900px/640px breakpoints. At 390×844, the reading panel scrolls internally and fixed navigation remains usable. Illustrations get smaller; text does not. No horizontal page overflow. A dragged card can reach a visible destination using the mobile target controls and edge autoscroll.

Check 1600×1100, a shorter desktop viewport such as 1366×768, and 390×844. At short heights, source details can be below the fold; the scrollbar and navigation must remain visible and the source list must be reachable. Test long Indonesian labels and full publication titles.

## Identity and visual regression

The asset bundle and baseline code make the reference design reproducible. A prompt alone cannot guarantee identical pixels from another model. Keep the bundled images for the identical baseline. For new-topic images, preserve lighting, palette, perspective, negative space and scale, then compare screenshots against the baseline. Do not claim visual identity based only on matching colors or a prose checklist.

Header cleanup: keep institutional identity at left, fullscreen alone at right. No permanent learning-mode label and no idle timer placeholder. If the learner explicitly enables the two-minute timer, show the active countdown in the bottom control area, outside the header. Preserve work at expiration.
