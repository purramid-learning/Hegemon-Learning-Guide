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

## ✅ 6. Firebase Cloud Function
The proxy layer that accepts the misconception code, marker context, and conversation history, then calls the Claude API and returns the scaffolding response. The API key never leaves this layer.

**Artifacts:** `functions/index.js`, `functions/package.json`, `functions/.gitignore`, `firebase.json`, `.firebaserc`

**Setup before first deploy:**
1. Create a Firebase project and update `.firebaserc` with the project ID.
2. `firebase functions:secrets:set ANTHROPIC_API_KEY` — paste the key when prompted.
3. `npm install` inside `functions/`.
4. `firebase deploy --only functions` (or use the emulator for local dev).

**Note:** The system prompt in `functions/index.js` is a placeholder. Step 7 replaces it with the full behavioral prompt.

---

## 7. Claude System Prompt
Write the Claude system prompt that drives scaffolding response generation. The behavioral rules and output contract are already defined in `docs/scaffolding-contract.md`; this step translates those rules into a prompt and tests it against each MC code (including compound codes) to verify Socratic quality and correct one-at-a-time sequencing before the demo.

**Artifacts:** `functions/index.js` (`SCAFFOLDING_RULES` constant — replaces step 6 placeholder), `docs/scaffolding-prompt-tests.md` (15 structured test cases)

**Testing:** Run the 15 cases in `docs/scaffolding-prompt-tests.md` against the prompt via claude.ai (custom system prompt) or the Firebase emulator. Record pass/fail per case before proceeding to step 8. Minimum bar: all 15 pass, with particular attention to Tests 06–07 (MC-04c compound sequencing) and Test 14 (charitable interpretation).

---

## ✅ 8. Target Generator
A JS module that generates a randomized target sequence each session, replacing the hard-coded array in plotting-grid.html. Prevents coordinate memorization across sessions and ensures each MC code remains reachable on multiple targets.

**Artifact:** `src/js/target-generator.js`, `src/js/tests/test-target-generator.js`

**Category structure (fixed; values randomized):**
- Slot 1 — Q1: x ∈ [1,5], y ∈ [1,5], x ≠ y
- Slot 2 — Q2: x ∈ [−5,−1], y ∈ [1,5]
- Slot 3 — Q4: x ∈ [1,5], y ∈ [−5,−1]
- Slot 4 — Y-axis: x = 0, y ∈ [−5,−1] ∪ [1,5]
- Slot 5 — X-axis: y = 0, x ∈ [−5,−1] ∪ [1,5]
- Slot 6 — Q3: x ∈ [−5,−1], y ∈ [−5,−1]

---

## ✅ 9. Bot UI
The chat interface surfaced to the student, wired to the Firebase proxy, displaying disambiguation lists and scaffolding responses. Includes adaptive trigger logic: same MC code on two different targets in a session opens Hegemon on the second occurrence (Approach 1). Student advances immediately after a wrong answer unless Hegemon triggers.

**Approach 2 (deferred — comparison testing):** On wrong answer, show both "Try again" (retry same target) and "Next question" (advance) buttons. Deferred pending user research on which approach produces better learning outcomes.

---

## 10. Adaptive Response *(backlog)*
Three-miss intervention, correct-advances/incorrect-repeats drill loop, and question generator integration with session state. Open questions around intervention timing and drill sequencing are documented but unresolved.
