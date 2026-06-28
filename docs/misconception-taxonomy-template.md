# Coordinate Plane Misconception Taxonomy

Reference for misconception detection logic and scaffolding targeting. Each code includes the diagnostic rule (comparing the student's response to the target — a plotted point for most codes, a named quadrant for MC-04) and the scaffolding goal (what the Socratic prompt should help the student discover).

This is the **master** taxonomy (the superset). A lesson taxonomy such as `misconception-taxonomy.md` filters this set to one lesson and may reserve codes it can't yet detect (MC-05 is reserved there). Scaffolding goals are realized under `scaffolding-contract.md` — surfaced as rungs that end in a question, delivered one per turn, never stating the assessed item; compound goals sequence one component at a time. Codes are **global identifiers**: extend a topic family by sub-lettering (MC-04a/b/c), never renumber, and reserve a number rather than reuse it.

## MC-01 — Axis Transposition
**Misconception:** Student swaps the x and y values.
**Diagnostic:** `plotted == (target_y, target_x)`
**Scaffolding goal:** Surface which number in the ordered pair controls horizontal movement and which controls vertical movement.

## MC-02 — Sign/Directionality Error
**Misconception:** Student ignores or misapplies the sign of one or both coordinates.
**Diagnostic:** `plotted_x == -target_x` and/or `plotted_y == -target_y`, with correct magnitude.
**Scaffolding goal:** Surface what a negative sign means for direction along that axis.

## MC-03 — Origin/Offset Error
**Misconception:** Student applies a consistent offset, often from starting a count at 1 instead of 0.
**Diagnostic:** `plotted - target` is a constant nonzero offset on one or both axes.
**Scaffolding goal:** Surface where counting begins on each axis.

## MC-04 — Quadrant Numbering Error  *(topic family — the canonical sub-lettering example)*

> **How to write a topic family.** When one misconception space splits into several distinct errors that occur independently, give the space a **parent code** (`MC-04`) that defines the shared diagnostic surface and the axes of variation, then a **sub-letter per error** (`MC-04a`, `MC-04b`, …). Sub-letter; never renumber — the codes are referenced by markers, the detector, and the scaffolding prompts, so renumbering desyncs every reference. Reserve a parent if a member is out of scope rather than reusing its letters.

**Shared misconception:** Naming a quadrant is a separate skill from plotting a point — it applies the I–IV numbering scheme to a location, independent of whether any point was plotted correctly. The input is a **named quadrant** (a Roman numeral), not a plotted coordinate. The correct scheme starts at the top-right (+x, +y = I) and counts counterclockwise. Two independent things can go wrong — the **starting corner** and the **direction** — which is exactly what the sub-codes separate.

| Corner (signs) | Correct | MC-04a | MC-04b | MC-04c | MC-04d |
|----------------|:------:|:------:|:------:|:------:|:------:|
| top-right (+, +) | I | IV | I | II | II |
| top-left (−, +) | II | I | IV | I | I |
| bottom-left (−, −) | III | II | III | IV | III |
| bottom-right (+, −) | IV | III | II | III | IV |

### MC-04a — Incorrect Starting Point
**Misconception:** Counts counterclockwise (correct direction) but begins in the wrong corner — numbering the top-left as Quadrant I, the way an English reader starts at the top-left of a page.
**Diagnostic:** Named quadrants match the MC-04a column (e.g. a top-right location named IV).
**Scaffolding goal:** Surface where the numbering begins — Quadrant I is the all-positive corner (top-right), not the top-left.

### MC-04b — Clockwise Numbering
**Misconception:** Begins in the correct corner (top-right) but counts clockwise. Quadrants I and III keep their numbers; II and IV swap.
**Diagnostic:** Named quadrants match the MC-04b column (tell-tale: a top-left location named IV, or a bottom-right location named II).
**Scaffolding goal:** Surface the direction of the count — quadrants are numbered counterclockwise, not clockwise.

### MC-04c — Incorrect Start and Clockwise
**Misconception:** Both errors at once — begins top-left **and** counts clockwise. The top corners swap numbers (I↔II) and the bottom corners swap (III↔IV).
**Diagnostic:** Named quadrants match the MC-04c column (tell-tale: a top-right location named II, or a bottom-left location named IV). A bottom-corner response distinguishes MC-04c (BL=IV, BR=III) from MC-04d (BL=III, BR=IV) — they share the same top-row assignments.
**Scaffolding goal:** A compound error — scaffold one knob at a time (contract rule 5), never both in one prompt. First surface the starting corner (Quadrant I is the all-positive corner); confirm; *then* surface the direction. The assessment-mode worked example in `scaffolding-contract.md` is the template sequence.

### MC-04d — Row-by-Row (Raster) Numbering
**Misconception:** Student numbers quadrants in reading order — top-left to top-right, then bottom-left to bottom-right (TL=I, TR=II, BL=III, BR=IV) — rather than starting at the all-positive corner and counting counterclockwise. This is a schema mismatch, not a rotation error: the two-knob (start corner + direction) model that produces MC-04a/b/c cannot generate the raster pattern, so it sits outside that family.
**Diagnostic:** Named quadrants match the MC-04d column. Tell-tale: top-right location named II (shared with MC-04c — a bottom-corner response separates them, since MC-04c assigns BL=IV/BR=III while MC-04d assigns BL=III/BR=IV). MC-04d matches the correct scheme on both bottom corners, so bottom-corner probes alone cannot detect it.
**Scaffolding goal:** A schema-mismatch error — scaffold start corner and direction, one at a time (contract rule 5), as for MC-04c. First surface where Quadrant I is (the all-positive corner, top-right); confirm; then surface the direction of counting.

**Detection probe design (applies to all MC-04 sub-codes).** A single naming is often ambiguous. With five possible schemes (correct + MC-04a/b/c/d), probe choice matters: the left column (TL+BL) or right column (TR+BR) each uniquely identify all five schemes; the top row (TR+TL) cannot separate MC-04c from MC-04d; the bottom row (BL+BR) cannot separate the correct scheme from MC-04d; diagonal pairs leave at least one pair of schemes indistinguishable. Alternatively, ≥3 distinct-quadrant probes always resolve the scheme (the fourth corner is forced).

## MC-05 — Reflection Axis Confusion
**Misconception:** When reflecting a point across a specified axis, student reflects across the other axis instead.
**Diagnostic:** Plotted point matches reflection across the *other* axis from the one specified.
**Scaffolding goal:** Surface which coordinate changes sign when reflecting across a given axis.

## MC-06 — Magnitude/Sign Conflation
**Misconception:** Student gets the distance from the origin right but ignores direction.
**Diagnostic:** `abs(plotted_x) == abs(target_x)` and `abs(plotted_y) == abs(target_y)`, but one or both signs are wrong. Check before MC-02.
**Scaffolding goal:** Same as MC-02, but affirm the correct distance before addressing sign — this distinguishes it from a pure MC-02 case where distance may also be wrong.

## MC-07 — Axis-as-Boundary
**Misconception:** Student treats a point with one coordinate equal to 0 as belonging to an adjacent quadrant, or struggles to plot points that fall on an axis.
**Diagnostic:** `target_x == 0` or `target_y == 0`; plotted point is offset into a quadrant rather than on the axis.
**Scaffolding goal:** Surface that a coordinate of 0 means the point sits *on* that axis, not inside any quadrant.

## MC-08 — Incomplete Plot / Axis Collapse
**Misconception:** Student makes only one of the two moves — travels across but not up, or up but not across — and stops on an axis.
**Diagnostic:** `target_x != 0` and `target_y != 0` (target is inside a quadrant), but `plotted_x == 0` or `plotted_y == 0`. Common form: `plotted == (target_x, 0)` or `plotted == (0, target_y)`.
**Scaffolding goal:** Surface that a point inside a quadrant needs both an across move and an up/down move from the origin — did they make both?
