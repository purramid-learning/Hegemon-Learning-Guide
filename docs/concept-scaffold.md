# Coordinate Plane Concept Scaffold

Companion to `misconception-taxonomy.md`. The misconception taxonomy handles **assessment** errors — a wrong plot or naming, detected deterministically from coordinates. This document handles **comprehension** gaps — a student who signals they don't understand instructional content *before*, or independent of, any assessment. Misconception correction does nothing for a student who hasn't reached (or has bounced off) the material yet; this is the scaffold that catches them.

Both scaffolds are keyed to the same lesson markers (`data-topic` / `data-prereqs` in `coordinate-plane-lesson.html`), so they share one concept graph. A comprehension gap is **self-identified** — the student points at a concept (a tapped term, an "I don't get this"), and the marker reader supplies it as `ctx.focus`. There is no detector and no evaluation order here; that machinery belongs to the assessment side, where the error has to be inferred.

**Rules of engagement live in `scaffolding-contract.md`** (rules 1–8, shared with the misconception taxonomy). This document adds only the comprehension-mode *typing* — which rephrase move fits which gap. Every move below operates under that contract: surfaced as rungs that end in a question, one per turn, never stating the assessed item, stopping the moment the student can carry it.

Scope: Lesson 1 — Finding Points on the Coordinate Plane (four quadrants, integer coordinates, grid extent −5..5), same as the taxonomy.

---

## Lesson alignment

| Code | Gap | Example topics (markers) |
|------|-----|--------------------------|
| CG-01 | Definitional — "what *is* this?" | `number-line`, `coordinate-plane`, `origin`, `ordered-pair` |
| CG-02 | Procedural — "how do I do this?" | `plotting-across-then-up`, `reading-coordinates` |
| CG-03 | Rationale — "why is it like this?" | `order-matters`, `sign-to-quadrant`, `negative-x`, `negative-y` |
| CG-04 | Prerequisite — gap is upstream | any topic with non-empty `data-prereqs` |
| CG-05 | Discrimination — conflating two terms | `x-axis`/`y-axis`, `coordinate-plane`/`ordered-pair`, `quadrants` |

---

## CG-01 — Definitional

**Gap:** The student doesn't know what a term or object *is* — its meaning, or in the lexical case, the word itself (e.g. "axes" as the plural of "axis").
**Signal:** Taps a term, or asks "what's a coordinate / the origin / a coordinate plane?"
**Move:** Rephrase the lesson's framing in more concrete words, anchored to a worked instance, then end on a **check** the student answers. A definition or label may be conveyed here — there is no assessed item to protect — but the turn never *ends* on the statement; it ends on the student applying it.
**Example:**
> **Student:** What's the origin?
> **Bot:** It's the one spot where the two number lines cross — where both of them read zero, written (0, 0). Every point's address is measured *from* there. On the grid in front of you, which point is sitting at (0, 0)?

**Topics:** `number-line`, `coordinate-plane`, `x-axis`, `y-axis`, `origin`, `ordered-pair`.

## CG-02 — Procedural

**Gap:** The student doesn't know *how* to carry out a process — before attempting it.
**Signal:** "How do I plot a point?" / "How do I start?"
**Move — two faces:**
- **General process** ("how does plotting work?"): rephrase the procedure conceptually — two moves from the origin, one along each axis — and check ("if you're plotting (3, 2), which move comes first?").
- **A specific assessed task** ("how do I plot (3, 2)?"): this *is* the assessment question asked in advance. Hand it to the **decompose** technique — do not narrate the procedure to the answer. ("Start at the origin. Which of the two numbers tells you how far to go *across*?")

Distinguishing the two is the charitable-interpretation call (contract rule 8): a request about the *method* gets a rephrase; a request to do *this point* gets decomposition.
**Example (general):**
> **Student:** I don't get how plotting works.
> **Bot:** It's always two moves, both starting at the origin: one *across* (the x direction), then one *up or down* (the y direction). Take (3, 2) — which of those two moves do you make first?

**Topics:** `plotting-across-then-up`, `reading-coordinates`.

## CG-03 — Rationale

**Gap:** The student can state the rule but doesn't see *why* it holds — so it won't stick.
**Signal:** "Why does the order matter?" / "Why does a negative go left?"
**Move:** Connect the rule to what the student already knows, then ask them to **predict a consequence** — the prediction is the rung. Don't lecture the reason; have them generate it.
**Example:**
> **Student:** Why does the order matter in (x, y)?
> **Bot:** Because the first number and the second number trigger different moves — across versus up. So picture two points: (2, 3) and (3, 2). Plot both in your head — do they land in the same place, or different places?

**Topics:** `order-matters`, `sign-to-quadrant`, `negative-x`, `negative-y`.

## CG-04 — Prerequisite

**Gap:** The confusion the student names isn't where the gap actually is — it's in a prerequisite. The marker graph makes this checkable: `ctx.focus` carries the topic, and its `prereqs` (from `marker-reader`'s `prereqEdges`) name what it depends on.
**Signal:** A CG-01/02/03 request that doesn't resolve, or a topic whose prerequisites are visibly shaky.
**Move:** Before re-explaining the named concept, **route up the graph** — probe the prerequisite with a quick check. If it's shaky, rephrase *that* first, confirm it, then return to the original concept. One level at a time (contract rule 5).
**Example:**
> **Student:** I don't get the coordinate plane.
> **Bot:** *(its prereq is `number-line`)* Let's back up one step first. On a single number line, if I'm at 0 and move 3 to the right, where do I land? *(confirm)* Good — a coordinate plane is just two of those crossed together. So how many number lines are we working with now?

**Topics:** any topic with non-empty `data-prereqs` (e.g. `coordinate-plane`→`number-line`; `quadrants`→`x-axis, y-axis, origin`; `ordered-pair`→`x-axis, y-axis, origin`).

## CG-05 — Discrimination

**Gap:** The student is conflating two near-terms and can't keep them apart.
**Signal:** "Which one is the x-axis again?" / "Is that a coordinate or a coordinate plane?"
**Move:** Don't state the distinction — give a concrete case and ask the student to **sort it** into one or the other. The contrast is drawn by their answer.
**Example:**
> **Student:** I keep mixing up the x-axis and the y-axis.
> **Bot:** Both are number lines through the origin — one runs side to side, one runs up and down. The x-axis is the *across* one. So a point that's moved only side to side, like (4, 0) — which axis is it sitting on?

**Topics:** `x-axis`/`y-axis`, `coordinate-plane`/`ordered-pair`, `quadrants` (axis vs. region).

---

## Notes

**Code family.** `CG-xx` (Comprehension Gap) is the comprehension-side identifier family, sibling to `MC-xx` (Misconception) on the assessment side. Both name their category, so a code's prefix tells you which scaffold it belongs to. These are referenced across markers, scaffolding prompts, and the system prompt: extend a family by sub-lettering (`CG-01a`), never renumber.

**No detection, no order.** Comprehension gaps are self-identified through `ctx.focus`, so there is no diagnostic rule and no first-match precedence. The five types are a routing aid for *which rephrase move* fits, not a detector.

**Bridge to the assessment side.** Each marker also carries `data-likely-misconceptions`, so a comprehension turn already knows the procedural traps a concept tends to produce. A student helped through `ordered-pair` (CG-01) is one the bot knows is prone to MC-01 (transposition) once they start plotting.
