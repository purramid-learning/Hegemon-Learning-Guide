# Hegemon Learning Guide — Claude Code Context

Hegemon is a proof-of-concept demonstrating misconception-targeted AI scaffolding as a pedagogically superior alternative to generic Socratic tutoring in 4th-grade coordinate-plane math instruction. It is investor- and market-facing; the demo must be clean, complete, and architecturally honest.

---

## Architecture (locked — do not deviate without explicit discussion)

**Frontend:** Static HTML/CSS/vanilla JS, hosted on GitHub Pages. No build step, no framework.

**Backend proxy:** Firebase Cloud Functions. All Claude API calls go through this layer. The API key never reaches the client under any circumstances.

**Misconception detection:** Deterministic JavaScript (`misconception-detection.js`). Rules compare target coordinates to plotted coordinates and return a misconception code. Claude does not classify — detection runs before Claude is called. No ML classifier in this demo layer.

**Claude's role:** Generate Socratic scaffolding responses given a misconception code, marker context, and conversation history. Input and output contracts are defined in `scaffolding-contract.md`.

**JS modules:** UMD format. No bundler. Tests are dependency-free Node harnesses — run with `node <test-file>`.

---

## Security rules

- The Anthropic API key lives only in Firebase Cloud Functions environment config. It must never appear in frontend code, committed files, or logs.
- The Firebase proxy must enforce per-IP rate limiting before forwarding to the Claude API.
- The Anthropic Console spending cap must be set before the demo is shared publicly.

---

## Naming conventions (locked)

- **`MC-01` through `MC-08`** — misconception codes (coordinate-plane errors detectable from plotted input or quadrant-naming input)
- **`CG-01` through `CG-05`** — comprehension gap codes (definitional, procedural, rationale, prerequisite, discrimination)
- **`hg-marker`** — CSS class for invisible learner-state marker spans in lesson HTML
- Internal JS predicate identifiers follow the same scheme: `mc01`, `cg01`, etc.

Do not introduce new prefixes or rename existing codes without updating all files that reference them. The canonical code lists are in `misconception-taxonomy.md` and `concept-scaffold.md`.

---

## Key source files and their roles

| File | Role |
|------|------|
| `coordinate-plane-lesson.html` | Student-facing lesson; source of `hg-marker` learner-state data |
| `plotting-grid.html` | Student-facing practice grid; source of all detection inputs |
| `misconception-detection.js` | Deterministic detector; `detectMisconception(record)` → code or null |
| `marker-reader.js` | Reads `hg-marker` elements; packages bot context; persists to `sessionStorage` |
| `scaffolding-contract.md` | Single source of truth for bot input/output rules |
| `misconception-taxonomy.md` | Full MC taxonomy with diagnostic rules and scaffolding goals |
| `concept-scaffold.md` | CG taxonomy |
| `misconception-taxonomy-template.md` | Master template; kept in sync with the lesson-scoped taxonomy |

---

## Scaffolding output rules

These apply to every Claude response in the tutoring flow. They are the pedagogical contract — do not relax them:

1. **Never state the correct answer.** Output is a question or prompt only. The never-answer rule applies to the assessed item specifically (which quadrant, which coordinate) — not to definitions, labels, or conventions. Definitions and conventions are scaffolding rungs and may be surfaced freely.
2. **Target the detected code.** Each response must address the specific misconception or comprehension gap identified, not a generic "try again."
3. **One component at a time.** When a code captures more than one error (e.g., MC-04c: wrong start corner and clockwise direction), scaffold one component, work it to resolution and confirm, then move to the next. Never stack two corrections in a single prompt.
4. **Acknowledge before redirecting.** Never a cold correction. Acknowledge what the student did before redirecting.
5. **Charitable interpretation.** When student intent is ambiguous, offer 3–4 plausible interpretations as a numbered list, always ending with an "in your own words" option. Confirm the selection before continuing.
6. **One rung per turn.** Do not front-load multiple hints.

The full rules, including system prompt structure, are in `scaffolding-contract.md`. That file is the authority; this section is a summary.

---

## Detection rules summary

Detection order (first match wins): MC-01 → MC-07 → MC-08 → MC-06 → MC-02 → MC-03

- MC-06 (both magnitudes exact, signs wrong) is checked before MC-02 (looser sign error) so scaffolding can affirm correct distance first.
- MC-01 (axis transposition) is checked first so a swapped point isn't misread as a direction error.
- MC-04a/b/c (quadrant naming errors) are a **separate detector** keyed to named-quadrant input, not part of the coordinate chain. They cannot fire from the plotting grid alone.
- If no rule matches, route to an unclassified handler — Claude still responds Socratically rather than asserting an unsubstantiated misconception.

Full diagnostic rules are in `misconception-taxonomy.md`.

---

## What is and is not in scope for this demo

**In scope:**
- Coordinate plane, four quadrants, integer coordinates, grid extent −5..5
- MC-01 through MC-08 (MC-04a/b/c require a quadrant-naming interaction)
- CG-01 through CG-05

**Out of scope (deferred to production):**
- DeBERTa or any ML classifier
- Adaptive drill (correct advances, incorrect repeats, three-miss intervention) — documented in backlog
- Reflection tasks (MC-05 reserved, not reused)
- Scale/interval errors (gridlines are unit-valued in this demo)

Do not implement deferred features without explicit discussion. Flag scope creep rather than silently absorbing it.

---

## Working style

- **Flag before fixing.** If a requirement is over-scoped, under-specified, or architecturally inconsistent, say so before drafting code.
- **Ask before assuming** on ambiguous design decisions. State the interpretive call and alternatives explicitly.
- **Favor simpler architecture.** When complexity creeps in, push back and name the simpler option.
- **Lock before building.** Decisions should be confirmed before implementation begins; clean stage gates over incremental approximations.
- **Self-documenting code.** The repo ships with a minimal README. Comments in code should explain decisions, not restate what the code does.
- **No fabricated capabilities or polish.** This is a demo, not a shipped product — represent it accurately.
