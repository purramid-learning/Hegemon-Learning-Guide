# Hegemon — Development Order

Sequenced so each step is independently testable before the next begins. Steps 1–5 are complete.

---

## ✅ 1. Sample Lesson
Create a sample lesson on coordinate plane instruction.

**Artifact:** `src/coordinate-plane-lesson.html`

---

## ✅ 2. Misconception Taxonomy
Identify and document common misconceptions in coordinate plane instruction, with diagnostic rules and scaffolding goals for each code.

**Artifacts:** `docs/misconception-taxonomy.md`, `docs/misconception-taxonomy-template.md`, `docs/concept-scaffold.md`

---

## ✅ 3. Interactive Plotting Grid
A standalone HTML page with a clickable coordinate grid (−5..5), a target point display, and a submit mechanism. This is the student-facing entry point and the source of all detection inputs. Nothing else can be tested without it.

**Artifact:** `src/plotting-grid.html`

---

## ✅ 4. Misconception Detection Logic
A JavaScript module that takes `(target_x, target_y, plotted_x, plotted_y)` and returns a misconception code following the detection order in the taxonomy. Pure deterministic logic, fully testable without Firebase or Claude.

**Artifact:** `src/js/misconception-detection.js` — 45/45 tests passing

---

## ✅ 5. Marker Reader
A JS module that reads all `hg-marker` elements the student has scrolled past at bot activation time, extracts topic, prereqs, and likely misconception codes, and packages them as context for the Claude call. This is what makes the bot entry point intelligent.

**Artifact:** `src/js/marker-reader.js` — 36/36 tests passing

---

## 6. Firebase Cloud Function
The proxy layer that accepts the misconception code, marker context, and conversation history, then calls the Claude API and returns the scaffolding response. The API key never leaves this layer.

**Artifacts:** `functions/index.js`, `functions/package.json`

---

## 7. Claude System Prompt
Write the Claude system prompt that drives scaffolding response generation. The behavioral rules and output contract are already defined in `docs/scaffolding-contract.md`; this step translates those rules into a prompt and tests it against each MC code (including compound codes) to verify Socratic quality and correct one-at-a-time sequencing before the demo.

**Artifact:** system prompt (to be created and tested in this step); `docs/scaffolding-contract.md` (input reference, already complete)

---

## 8. Bot UI
The chat interface surfaced to the student, wired to the Firebase proxy, displaying disambiguation lists and scaffolding responses.

---

## 9. Adaptive Response *(backlog)*
Update the plotting grid and misconception detection to handle repeated incorrect answers — correct answers advance, incorrect answers repeat, three consecutive misses trigger bot intervention. Open questions around "type" definition and build-order sequencing are documented but unresolved.
