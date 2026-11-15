# Content and interaction contract

Baseline version: LCM pilot, 13 November 2026. Audience: adult public-sector professionals. This is a focused learning experience, not a corporate website. Keep the user’s topic and organizational context; BPS branding belongs to this baseline and may change when requested.

| Screen | Content | Interaction and exit condition |
|---|---|---|
| Cover | Topic, useful learning objective, short context, flow hint, fictional-case notice | “Mulai belajar →”; untimed is default |
| Theory 1 | Definition and distinctions the participant needs | Paragraph citations, visible sources, “Lihat contoh”; previous/next |
| Theory 2 | Relationship, criterion or common misconception | Same controls and source format; no new UI metaphor |
| Theory 3 | Application criteria, boundaries or risks | Same theory and sources; three-option radio check with explicit “Periksa jawaban”; correct unlocks practice |
| Situation 1 | One concrete workplace event, relevant facts, one decision | Exactly two action buttons; inline consequence after selection; can compare alternatives |
| Situation 2 | A related complication or misconception | Same component; previous retains selection; forward requires a choice |
| Find the words | Five terms already taught, answer-free clues and letter counts, 10×10 grid | Drag/endpoints/keyboard; help and retry; optional continue; ungraded |
| Drag the Words | Three sentence gaps, four word/phrase choices including one distractor | Drag/tap/keyboard; explicit check, undo, retry, solution; optional and ungraded |
| Sort the Paragraphs | Four short paragraphs with a coherent narrative order | Drag, Up/Down and keyboard; check, undo, retry, solution; optional and ungraded |
| Practice | One case in two or three stages | Approved drag-and-drop family; explicit check, actionable feedback; finish all stages before quiz |
| Native quiz | Two single-choice questions, three options each | Equal weight, 0/50/100; guard missing answers; native Form handles reporting |
| Explanation | Correct reasoning for both questions and case takeaway | No unsupported universal moral; next to result |
| Result | Actual native score and completion wording | Restart clearly labeled; no fabricated rewards |

Theory should explain concepts in connected paragraphs, usually two short paragraphs per page. Two paragraphs is the established baseline layout, not a reason to pad or omit a necessary qualification. Long source titles and examples must wrap and scroll. A formative check is not one of the two graded questions.

## Approved interaction families

1. **Example reveal:** one ordinary labeled button and one clearly separated example. No hidden hotspot puzzle or investigative tool panel in theory.
2. **Choose and see:** one event → two actions → immediate “Yang terjadi” feedback. Keep prior choice visible when revisiting. Feedback explains an observable consequence, not a synthetic score meter.
3. **Categorize:** four or five meaningful cards into two labeled groups. Every card has a stable ID, plain-language label, explanation, and declared correct target. Categories use the same conceptual dimension.
4. **Sequence:** three useful steps placed in numbered targets; two plausible but risky distractors can remain in the bank. One card per target; displaced cards return safely. Check includes all cards, including distractors that should stay in the bank.
5. **Resource allocation and revision (budgeting profile):** ten tokens × ten units = 100. First allocation 70/30; changed requirement 90/10 plus a staged-decision card. These values are fictional case assumptions, not budgeting rules. Preserve arithmetic and feedback consistency if adapting.

Required case drag tasks support real mouse/touch drag AND select-card/select-target AND keyboard Enter/Tab, with undo and reset. Wrong placement does not erase work; it explains what to reconsider. A task is complete only after its declared solution is checked. Motion and color are supplementary, never the only instruction or feedback.

Do not restore the rejected interface: evidence-pinning tools, investigation consoles, unexplained metrics, sliders as the only input, branching dashboards or several competing navigation systems. Complexity should come from the decision and changed facts, while controls stay familiar.

## State model

Phase 0 = cover + theory. Phase 1 = situations → Find the words → Drag the Words → Sort the Paragraphs → required case DnD. Phase 2 = native quiz. Phase 3 = explanation. Phase 4 = result. Do not map individual theory pages to separate SCOs.

`lesson-root`, `sim-root`, and `dnd-challenge` each have `data-complete`. All three must be true before phase 2. Browser navigation buttons cannot bypass these gates. The formative check must be correct. Situations require a selection, rather than only allowing an ideal answer. DnD requires the checked solution. Timer expiration does not change phase or set completion. Restart resets the current attempt explicitly.

The three added activities have their own local completion/assistance state, but their continue actions are always available. Incomplete/assisted optional work does not satisfy or replace required case completion. See their dedicated references for input and reset contracts.
\nCase-answer assistance fills the declared solution and still requires the participant to press the case check button. The current case gate accepts that checked solution. It does not change the native quiz score. Optional vocabulary/paragraph activities keep their separate independent/assisted accounting. Review reads one top-level native slide per question and shows the participant selection, key and explanation.\n