# Coordinate Plane Misconception Taxonomy

Reference for misconception detection logic and scaffolding targeting. Each code includes the diagnostic rule (comparing the student's response to the target — a plotted point for most codes, a named quadrant for MC-04) and the scaffolding goal (what the Socratic prompt should help the student discover).

This is the **assessment-mode** scaffold (misconception correction). Its comprehension-mode sibling is `concept-scaffold.md` (the `CG` family), for students who signal confusion before any assessment. Both operate under the shared rules in `scaffolding-contract.md` — every scaffolding goal below is realized as rungs that end in a question, delivered one per turn, never stating the assessed item, and stopping the moment the student can carry it. Consult the contract for the technique; compound goals are sequenced one component at a time (contract rule 5).

Scope: this set is filtered to **Lesson 1 — Finding Points on the Coordinate Plane** (four quadrants, integer coordinates, grid extent −5..5). Notation: `target` = the point the task asked for, `plotted` = where the student clicked, `named quadrant` = the Roman numeral the student assigns (MC-04 only). MC-05 from the master template is intentionally omitted (see end). Evaluation order matters — see *Detection notes*.

## Lesson alignment

| Code | Surfaces from lesson step |
|------|---------------------------|
| MC-01 | Step 4 — ordered pair `(x, y)`, "order matters" |
| MC-02 | Step 5 — negatives go left / down |
| MC-03 | Steps 4–5 — start at the origin, count the spaces |
| MC-04a–c | Step 3 — the I–IV quadrant numbering scheme (separate naming task) |
| MC-06 | Step 5 — distance vs. direction with negatives |
| MC-07 | Step 5 — a 0 coordinate sits *on* an axis |
| MC-08 | Step 4 — "across, then up" as two separate moves |

## MC-01 — Axis Transposition
**Misconception:** Student swaps the two coordinates — moving the y-value across and the x-value up — often by traveling up the y-axis before going across the x-axis.
**Diagnostic:** `plotted == (target_y, target_x)` and `target_x != target_y`
**Scaffolding goal:** Surface that the first number is the across (x) move and the second is the up/down (y) move — which number did they travel across with?

## MC-02 — Sign/Directionality Error
**Misconception:** Student travels the right distance but the wrong direction on one or both axes — e.g., right instead of left for a negative x.
**Diagnostic:** `plotted_x == -target_x` and/or `plotted_y == -target_y`, with correct magnitude on the affected axis. (MC-06 is the stricter case where *both* magnitudes are exact — check it first.)
**Scaffolding goal:** Surface what a negative sign means for direction along that axis — left vs. right on x, down vs. up on y.

## MC-03 — Origin/Offset Error
**Misconception:** Student starts counting at 1 instead of 0, or counts gridlines instead of the spaces between them, producing a consistent off-by-one shift.
**Diagnostic:** signs correct on both axes, and `plotted - target` is a constant nonzero offset (commonly ±1) on one or both axes. Most reliable across several plotted points.
**Scaffolding goal:** Surface where counting begins — the origin is 0, not 1 — and that each step counts a space between gridlines.

## MC-04 — Quadrant Numbering Error

Naming a quadrant is a separate skill from plotting a point: it asks the student to apply the I–IV numbering scheme to a location. Whether any point was plotted correctly is irrelevant. The input is a **named quadrant** (a Roman numeral) for a location whose corner is already known from the signs of its coordinates — not a plotted coordinate.

The correct scheme starts at the **top-right** corner (+x, +y = Quadrant I) and counts **counterclockwise**. Two independent things can go wrong — the starting corner and the direction — producing the three errors below. The map from a location's corner to the number the student assigns:

| Corner (signs) | Correct | MC-04a | MC-04b | MC-04c | MC-04d |
|----------------|:------:|:------:|:------:|:------:|:------:|
| top-right (+, +) | I | IV | I | II | II |
| top-left (−, +) | II | I | IV | I | I |
| bottom-left (−, −) | III | II | III | IV | III |
| bottom-right (+, −) | IV | III | II | III | IV |

### MC-04a — Incorrect Starting Point
**Misconception:** Student counts counterclockwise (correct direction) but begins in the wrong corner — numbering the **top-left** as Quadrant I, the way an English reader starts at the top-left of a page. Every quadrant's number shifts one position around the plane.
**Diagnostic:** Named quadrants match the MC-04a column above — e.g., a top-right location named IV, or a bottom-left location named II. Independent of whether the point itself was plotted correctly.
**Scaffolding goal:** Surface where the numbering begins — Quadrant I is the top-right corner, where both coordinates are positive, not the top-left.

### MC-04b — Clockwise Numbering
**Misconception:** Student begins in the correct corner (top-right) but counts **clockwise** instead of counterclockwise. Quadrants I and III — the start and its diagonal opposite — keep their correct numbers; II and IV swap.
**Diagnostic:** Named quadrants match the MC-04b column — tell-tale single responses: a top-left location named IV, or a bottom-right location named II.
**Scaffolding goal:** Surface the direction of the count — quadrants are numbered counterclockwise, not clockwise.

### MC-04c — Incorrect Start and Clockwise
**Misconception:** Both errors at once — student begins at the top-left **and** counts clockwise. Relative to the correct scheme, the top corners swap numbers (I↔II) and the bottom corners swap (III↔IV).
**Diagnostic:** Named quadrants match the MC-04c column — tell-tale single responses: a top-right location named II, or a bottom-left location named IV.
**Scaffolding goal:** A compound error — scaffold one knob at a time (contract rule 5), never both in one prompt. First surface the starting corner (Quadrant I is the all-positive corner); confirm; *then* surface the direction (the next number sits where x flips sign but y holds). The assessment-mode worked example in `scaffolding-contract.md` is the template sequence.

### MC-04d — Row-by-Row (Raster) Numbering
**Misconception:** Student numbers quadrants in reading order — top-left to top-right, then bottom-left to bottom-right (TL=I, TR=II, BL=III, BR=IV) — rather than starting at the all-positive corner and counting counterclockwise. This is a schema mismatch, not a rotation error: the two-knob (start corner + direction) model that produces MC-04a/b/c cannot generate the raster pattern, so it sits outside that family.
**Diagnostic:** Named quadrants match the MC-04d column. Tell-tale single response: a top-right location named II (shared with MC-04c — a bottom-corner response is needed to separate them, since MC-04c assigns BL=IV/BR=III while MC-04d assigns BL=III/BR=IV). Note that MC-04d matches the correct scheme on both bottom corners; a student with this error looks correct on any bottom-corner or axis probe and can only be identified from a top-corner response.
**Scaffolding goal:** A schema-mismatch error — scaffold start corner and direction, one at a time (contract rule 5), as for MC-04c. First surface where Quadrant I is (the all-positive corner, top-right — not top-left); confirm; then surface the direction of counting. The assessment-mode worked example in `scaffolding-contract.md` is the template sequence.

## MC-05 — Reflection Axis Confusion *(reserved)*

Out of scope for this lesson — it introduces signs and quadrants but never asks students to reflect a point, so there is no task for this code to fire on. The number is reserved (not reused) to keep codes aligned with `misconception-taxonomy-template.md`; restore the full entry when a reflection activity enters scope.

## MC-06 — Magnitude/Sign Conflation
**Misconception:** Student gets both distances from the origin right but mirrors the point — right place, wrong direction.
**Diagnostic:** `abs(plotted_x) == abs(target_x)` and `abs(plotted_y) == abs(target_y)`, but one or both signs are wrong. Check before MC-02.
**Scaffolding goal:** Affirm that both distances from the origin are correct, then surface which direction each sign points — this distinguishes it from a MC-02 case where a distance may also be wrong.

## MC-07 — Axis-as-Boundary
**Misconception:** Student pushes a point with a 0 coordinate off the axis into a neighboring quadrant, instead of placing it on the axis.
**Diagnostic:** `target_x == 0` or `target_y == 0`, and the plotted point does not lie on that same axis (e.g., `target_x == 0` but `plotted_x != 0`).
**Scaffolding goal:** Surface that a coordinate of 0 means no movement along that axis, so the point sits *on* the axis, not inside any quadrant.

## MC-08 — Incomplete Plot / Axis Collapse
**Misconception:** Student makes only one of the two moves — travels across but not up, or up but not across — and stops on an axis. Maps directly to the lesson's "across, then up" two-step.
**Diagnostic:** `target_x != 0` and `target_y != 0` (target is inside a quadrant), but `plotted_x == 0` or `plotted_y == 0`. Common form: `plotted == (target_x, 0)` or `plotted == (0, target_y)`.
**Scaffolding goal:** Surface that a point inside a quadrant needs both an across move and an up/down move from the origin — did they make both?

---

## Detection notes

**Evaluation order (first match wins).** The plotting codes run on the plotted coordinate, most specific first: MC-01 → MC-07 → MC-08 → MC-06 → MC-02 → MC-03. MC-01 precedes the sign rules so a swapped point isn't misread as a direction error; MC-06 (both magnitudes exact) precedes MC-02 (looser sign error) so the scaffolding can affirm distance first. The quadrant-numbering codes (MC-04a/b/c) are a **separate detector** keyed to a named quadrant — not part of this chain.

**MC-04 needs a naming task, and usually more than one response.** The click-to-plot grid yields only a coordinate, so MC-04a–d cannot fire unless the activity asks the student to *name* a quadrant. A single naming is often ambiguous: a top-right location named "I" fits both the correct scheme and MC-04b. With five possible schemes (correct + MC-04a/b/c/d), probe choice matters:
- **Left or right column** (TL+BL or TR+BR): either pair uniquely identifies all five schemes. These are the recommended probe pairs.
- **Top row** (TR+TL): cannot separate MC-04c from MC-04d — both assign TL=I, TR=II.
- **Bottom row** (BL+BR): cannot separate the correct scheme from MC-04d — both assign BL=III, BR=IV.
- **Diagonal pairs** (TR+BL or TL+BR): insufficient — TR+BL cannot separate the correct scheme from MC-04b.
- **≥3 distinct-quadrant** probes always resolve the scheme (the fourth corner is forced). Keep MC-04 out of the live set until a quadrant-naming interaction exists.

**Fallback.** If no rule matches, route to an unclassified handler so Claude still responds Socratically (e.g., "walk me through how you placed that point") rather than asserting a misconception it can't substantiate. Deterministic detection will not cover every stray plot.

**Out of scope for this lesson.** Reflection across an axis is reserved as MC-05 above. Scale/interval errors are also out of scope while gridlines stay unit-valued.
