# Hegemon Learning Guide — Patent Drawing Specification

**Purpose:** source material for generating the drawing sheets of a patent application covering the Hegemon Learning Guide. Every figure below is described in enough detail to be produced by an AI image generator and then finished to filing standard.

**Status of the descriptions:** every element described here reflects behavior that is actually implemented in this repository. Nothing depicts a deferred or aspirational capability. See [Accuracy boundaries](#accuracy-boundaries) before adding figures.

---

## 1. How to use this document

1. Read [§2 Drawing standards](#2-drawing-standards) and [§3 Global prompt blocks](#3-global-prompt-blocks).
2. For each figure, paste the **Global Style Block** followed by that figure's **Prompt** into the image generator.
3. Generate at high resolution (minimum 2048 px on the long edge; target a 2:3 or 3:4 portrait aspect so the result drops onto a portrait sheet).
4. **Expect to redraw the text.** Image generators mangle reference numerals, lead lines, and small labels. Treat generated output as a *composition reference*, then rebuild it as clean vector line art (Inkscape, Illustrator, or draftsman) with the numerals placed by hand from the register in [§4](#4-reference-numeral-register).
5. Verify against [§17 Pre-filing checklist](#17-pre-filing-checklist).

The ASCII layout sketch under each figure is the authority on composition. If the generated image disagrees with the sketch, the sketch wins.

---

## 2. Drawing standards

Constraints drawn from 37 CFR 1.84. These are non-negotiable for a US utility filing.

| Requirement | Value |
|---|---|
| Color | Black lines on a white background only. No color, no grayscale, no gradients, no shading, no drop shadows. |
| Line quality | Uniform, durable, solid black lines of even weight. Broken lines only where they carry meaning (see below). |
| Sheet | Portrait orientation, white, no borders drawn, no frame around the drawing. |
| Figure label | `FIG. 1`, `FIG. 2` … centered beneath the drawing, plain sans-serif capitals. Sub-views are `FIG. 4A`, `FIG. 4B`. |
| Reference numerals | Arabic numerals, minimum 3.2 mm high, never touching a line, each connected to its element by a straight lead line ending in an arrowhead (or with no arrowhead when it points to a surface). |
| Text in drawing | Permitted only for flowchart box legends and unavoidable labels (axis names, quadrant numerals). Prose descriptions belong in the specification, not the drawing. |
| Broken lines | Reserved for environment, hidden structure, or a movement path. Do not use them decoratively. |
| Prohibited | Photographs, screenshots, logos, trademarks, watermarks, signatures, color, shading, cross-hatching used decoratively, perspective rendering of software elements. |

**Convention adopted throughout:** software modules and stored data are drawn as plain rectangles; decision points in flowcharts as diamonds; process steps as rectangles; start and end terminals as rounded rectangles; data flow as solid arrows; stored-state persistence as a rectangle with a doubled left edge; boundaries that are logical rather than physical (the client/server split) as long-dash broken lines.

---

## 3. Global prompt blocks

### Global Style Block — prepend to every figure prompt

```
A United States patent application drawing. Pure black line art on a plain white
background. No color, no gray, no shading, no gradients, no drop shadows, no
texture, no photorealism, no 3D perspective. Uniform thin black line weight
throughout. Flat two-dimensional technical schematic in the style of a USPTO
utility patent figure. Plain sans-serif labels in capital letters. Reference
numerals as small plain Arabic numbers, each connected to its element by a short
straight lead line with a small arrowhead. Generous white space between elements.
Clean orthogonal connector lines meeting boxes at right angles, with arrowheads
showing direction of flow. Centered figure label beneath the drawing.
Portrait orientation.
```

### Global Negative Block — append to every figure prompt

```
Do not include: color, colored accents, gray fill, shading, gradients, shadows,
glow, textures, wood or paper grain, photorealistic rendering, isometric or
perspective view, rounded decorative styling, UI chrome such as window buttons or
scrollbars, application logos, brand marks, watermarks, signatures, handwriting,
stock-illustration people, cartoon characters, robots, brains, lightbulbs, or any
decorative iconography. No dense paragraphs of text. No frame or border around the
sheet. No title block.
```

### Anti-drift reminders

- If a generator keeps producing rounded "infographic" boxes, add: `strict rectangular boxes with square corners, engineering drawing style, not an infographic`.
- If it adds people or mascots, add: `no human figures, no avatars, no characters of any kind`.
- If it renders the coordinate grid in perspective, add: `flat top-down orthographic view of the grid, drawn exactly square`.

---

## 4. Reference numeral register

Numerals are assigned in 100-series blocks by figure. **An element that recurs across figures keeps its original numeral** — this is the single most common defect in AI-generated patent art, so check it explicitly during cleanup.

### 100 series — system (FIG. 1)

| No. | Element |
|---|---|
| 100 | Misconception-targeted scaffolding system (whole) |
| 102 | Client computing device |
| 104 | Display |
| 106 | Browser runtime executing static content |
| 108 | Instructional lesson document |
| 110 | Embedded non-rendering learner-state markers |
| 112 | Assessment interface (coordinate plotting grid) |
| 114 | Marker reader module |
| 116 | Client-side session store |
| 118 | Deterministic misconception detection module |
| 120 | Misconception code |
| 122 | Learner context package |
| 124 | Scaffolding dialogue client |
| 126 | Network |
| 128 | Proxy server |
| 130 | Request rate limiter |
| 132 | Request validator |
| 134 | Prompt assembly module |
| 136 | Invariant scaffolding rule store |
| 138 | Generative language model service |
| 140 | Response parser and control-token extractor |
| 142 | Structured response payload |
| 144 | Human-instructor escalation output |
| 146 | Model credential store, resident on the proxy server only |
| 148 | Transcript archive (opt-in) |

### 200 series — instrumented lesson document (FIG. 2)

| No. | Element |
|---|---|
| 200 | Lesson document body |
| 202 | Rendered content block |
| 204 | Non-rendering marker element associated with a content block |
| 206 | Topic identifier field |
| 208 | Prerequisite topic list field |
| 210 | Likely-misconception code list field |
| 212 | Activatable glossary term within rendered content |
| 214 | Persistent help control |
| 216 | Viewport boundary |
| 218 | Scroll direction |
| 220 | Encountered-content boundary |

### 300 series — marker reader (FIG. 3)

| No. | Element |
|---|---|
| 300 | Marker reader process |
| 302 | Anchor resolution (marker bound to nearest rendered sibling) |
| 304 | Viewport threshold test |
| 306 | Monotonic encountered set |
| 308 | Persisted session record |
| 310 | Focus input (term the learner activated) |
| 312 | Encountered-set cutoff derived from focus |
| 314 | Cross-page retrieval path |
| 316 | Topics-encountered list |
| 318 | Union of likely-misconception codes |
| 320 | Prerequisite edge list |

### 400 series — coordinate plane and error signatures (FIG. 4A–4E)

| No. | Element |
|---|---|
| 400 | Coordinate plane, extent −5 to +5 on each axis |
| 402 | First axis (horizontal) |
| 404 | Second axis (vertical) |
| 406 | Origin |
| 408 | Unit gridlines |
| 410 | Target point (open circle) |
| 412 | Learner-plotted point (solid dot) |
| 414 | Displacement path (broken line with arrowhead) |
| 416 | First quadrant |
| 418 | Second quadrant |
| 420 | Third quadrant |
| 422 | Fourth quadrant |

### 500 series — detection sequence (FIG. 5)

| No. | Element |
|---|---|
| 500 | Receive task record (target pair, plotted pair) |
| 502 | Integer validation |
| 504 | Match test — plotted equals target |
| 506 | Exit, no code emitted |
| 508 | Axis-transposition test |
| 510 | Axis-as-boundary test |
| 512 | Axis-collapse test |
| 514 | Magnitude-exact sign-inversion test |
| 516 | Single-axis sign-inversion test |
| 518 | Unit-offset test |
| 520 | Emit matched code |
| 522 | Unclassified fallback route |

### 600 series — quadrant labeling schemes (FIG. 6)

| No. | Element |
|---|---|
| 600 | Reference labeling scheme (correct) |
| 602 | Rotated-origin scheme |
| 604 | Reversed-direction scheme |
| 606 | Compound rotated-and-reversed scheme |
| 608 | Row-major (reading-order) scheme |
| 610 | Learner-named label |
| 612 | Scheme comparator |

### 700 series — prompt assembly (FIG. 7)

| No. | Element |
|---|---|
| 700 | Invariant rule block |
| 702 | Code-specific scaffolding directive set |
| 704 | Session context block |
| 706 | Task record field |
| 708 | Detected code field |
| 710 | Marker context field |
| 712 | Mode selector |
| 714 | Composite system prompt |
| 716 | Conversation history array |
| 718 | Bounded generation request |

### 800 series — end-to-end method (FIG. 8)

| No. | Element |
|---|---|
| 800 | Start |
| 802 | Present instructional content and record encountered markers |
| 804 | Receive learner response at assessment interface |
| 806 | Correctness test |
| 808 | Advance |
| 810 | Increment incorrect-response counter |
| 812 | Threshold test |
| 814 | Deterministic classification of the error |
| 816 | Assemble context package |
| 818 | Transmit to proxy |
| 820 | Assemble constrained prompt |
| 822 | Generate single scaffolding turn |
| 824 | Extract control tokens |
| 826 | Render turn to learner |
| 828 | Receive learner reply or grid selection |
| 830 | Resolution test |
| 832 | Escalate to human instructor |
| 834 | End |

### 900 series — interface arrangement (FIG. 9)

| No. | Element |
|---|---|
| 900 | Display area |
| 902 | Assessment region (remains interactive) |
| 904 | Docked scaffolding panel |
| 906 | Dialogue transcript region |
| 908 | Free-text input field |
| 910 | Submit control |
| 912 | Retry control |
| 914 | Advance control |
| 916 | Interpretation-selection controls |
| 918 | Grid-selection active indicator |
| 920 | Floating reopen control |

### 1000 series — dialogue state machine (FIG. 10)

| No. | Element |
|---|---|
| 1000 | Idle |
| 1002 | Comprehension support state |
| 1004 | Misconception correction state |
| 1006 | Unclassified probing state |
| 1008 | Ambiguity resolution state |
| 1010 | Physical demonstration state |
| 1012 | Resolved state |
| 1014 | Escalated state |
| 1016 | Dismissed state |
| 1018 | Stall detection |

### 1100 series — activation routes (FIG. 11)

| No. | Element |
|---|---|
| 1100 | Term-activation route |
| 1102 | Persistent-control route |
| 1104 | Error-threshold route |
| 1106 | Incorrect-response counter |
| 1108 | Comprehension support entry |
| 1110 | Misconception correction entry |
| 1112 | Manual topic disambiguation list |

### 1200 series — turn sequence (FIG. 12)

| No. | Element |
|---|---|
| 1200 | Learner lane |
| 1202 | Client lane |
| 1204 | Proxy lane |
| 1206 | Model lane |
| 1208 | Single bounded turn |
| 1210 | Grid demonstration exchange |

---

## 5. FIG. 1 — System architecture

**Shows:** the whole system, and specifically that error classification happens deterministically on the client *before* any model call, and that the model credential exists only on the proxy.

**Layout sketch**

```
                    FIG. 1
  +--------------------- 102 CLIENT DEVICE ----------------------+
  |  104 DISPLAY                                                 |
  |  +--------------------- 106 RUNTIME ---------------------+   |
  |  |  108 LESSON DOC ---> 110 MARKERS                      |   |
  |  |         |                  |                          |   |
  |  |         v                  v                          |   |
  |  |  112 ASSESSMENT      114 MARKER READER <--> 116 STORE |   |
  |  |         |                  |                          |   |
  |  |         v                  |                          |   |
  |  |  118 DETECTION ---> 120 CODE                          |   |
  |  |                            \                          |   |
  |  |                             +--> 122 CONTEXT PACKAGE  |   |
  |  |                                       |               |   |
  |  |                              124 DIALOGUE CLIENT      |   |
  |  +---------------------------------------|---------------+   |
  +------------------------------------------|-------------------+
                                              | 126 NETWORK
    - - - - - - - - - - - - - - - - - - - - - | - - - - - - - - -
  +------------------------ 128 PROXY SERVER -|-------------------+
  |   130 RATE LIMITER -> 132 VALIDATOR -> 134 PROMPT ASSEMBLY    |
  |                                   ^            |             |
  |                          136 RULE STORE        |   146 KEY   |
  |                                                v             |
  |                                     140 RESPONSE PARSER      |
  |                                       |            |         |
  |                              142 PAYLOAD    148 ARCHIVE      |
  +-----------------|--------------------------------------------+
                    v
            138 MODEL SERVICE            144 INSTRUCTOR ESCALATION
```

**Prompt**

```
[Global Style Block]

Draw FIG. 1, a patent block diagram of a computer system, arranged vertically in
three tiers separated by long-dashed horizontal boundary lines.

Top tier: a large rectangle labeled CLIENT DEVICE containing a rectangle labeled
DISPLAY and an inner rectangle labeled BROWSER RUNTIME. Inside the runtime, six
plain rectangles connected by arrows: LESSON DOCUMENT feeding EMBEDDED MARKERS;
EMBEDDED MARKERS feeding MARKER READER; MARKER READER connected by a
double-headed arrow to a rectangle with a doubled left edge labeled SESSION
STORE; ASSESSMENT INTERFACE feeding MISCONCEPTION DETECTION; MISCONCEPTION
DETECTION and MARKER READER both feeding a rectangle labeled CONTEXT PACKAGE,
which feeds a rectangle labeled DIALOGUE CLIENT.

Middle band: a single labeled arrow crossing the dashed boundary, labeled NETWORK.

Bottom tier: a large rectangle labeled PROXY SERVER containing a left-to-right
chain of rectangles: RATE LIMITER, then REQUEST VALIDATOR, then PROMPT ASSEMBLY.
A rectangle labeled RULE STORE feeds upward into PROMPT ASSEMBLY. A small
rectangle labeled CREDENTIAL STORE sits inside the proxy rectangle and connects
only to elements inside it. PROMPT ASSEMBLY has an arrow leaving the proxy
rectangle downward to a separate rectangle labeled LANGUAGE MODEL SERVICE, and a
return arrow from that service into a rectangle labeled RESPONSE PARSER, which
feeds a rectangle labeled RESPONSE PAYLOAD and a rectangle labeled TRANSCRIPT
ARCHIVE. A separate arrow leaves RESPONSE PAYLOAD to a rectangle outside the
proxy labeled INSTRUCTOR ESCALATION.

Place small reference numerals with lead lines beside each rectangle. Label the
figure FIG. 1 centered beneath the drawing.

[Global Negative Block]
```

**Cleanup notes:** the dashed client/server boundary and the containment of 146 strictly inside 128 are the substantive points of this figure — verify both survive.

---

## 6. FIG. 2 — Instrumented lesson document

**Shows:** learner-state markers co-located with rendered content but not themselves rendered, each carrying three metadata fields; and the viewport boundary that determines which markers have been encountered.

**Layout sketch**

```
                       FIG. 2
   +---------------- 200 LESSON DOCUMENT ------------------+
   |  202 [ CONTENT BLOCK ]                                |
   |  204 [ MARKER ]--> 206 TOPIC                          |
   |                    208 PREREQUISITES                  |
   |                    210 LIKELY MISCONCEPTIONS          |
   |                                                       |
   |  202 [ CONTENT BLOCK with 212 TERM ]     [214 HELP]   |
   |  204 [ MARKER ]                                       |
   |= = = = = = = = 216 VIEWPORT BOUNDARY = = = = = = = = =|
   |  202 [ CONTENT BLOCK ]        ^                       |
   |  204 [ MARKER ]               | 218 SCROLL            |
   +-------------------------------------------------------+
        220 ENCOUNTERED-CONTENT BOUNDARY (broken line)
```

**Prompt**

```
[Global Style Block]

Draw FIG. 2, a patent schematic of a document structure, portrait orientation.

A tall outer rectangle labeled LESSON DOCUMENT. Inside it, stacked vertically,
four wide plain rectangles labeled CONTENT BLOCK. Beneath each content block, a
narrow rectangle drawn with a broken outline labeled MARKER, indicating a
non-rendering element. From the topmost MARKER, three short lead lines fan out to
the right to three small stacked rectangles labeled TOPIC, PREREQUISITES, and
LIKELY MISCONCEPTIONS.

Within the second CONTENT BLOCK, show a short underlined word labeled as an
activatable term with its own reference numeral. At the right edge of the
document rectangle, a small rectangle labeled HELP CONTROL.

Across the document, between the second and third content blocks, draw a
horizontal long-dashed line labeled VIEWPORT BOUNDARY, with a vertical arrow
beside it pointing upward labeled SCROLL. Draw a second broken horizontal line
below it labeled ENCOUNTERED-CONTENT BOUNDARY.

Reference numerals with lead lines beside every labeled element. Figure label
FIG. 2 centered beneath.

[Global Negative Block]
```

---

## 7. FIG. 3 — Marker reader and cross-page state persistence

**Shows:** how a non-rendering element with no geometry of its own is resolved to a measurable anchor, how the encountered set is accumulated monotonically, and how that set survives navigation from the lesson page to the assessment page.

**Layout sketch**

```
                        FIG. 3
   310 FOCUS INPUT ------+
                         v
   204 MARKER --> 302 ANCHOR RESOLUTION --> 304 THRESHOLD TEST
                                                 |  yes
                                                 v
                              306 MONOTONIC ENCOUNTERED SET
                                    |            ^
                          312 CUTOFF|            | 314 RETRIEVE
                                    v            |
                              308 [| SESSION RECORD ]
                                    |
                                    v
                        122 CONTEXT PACKAGE
                          316 TOPICS SEEN
                          318 MISCONCEPTION UNION
                          320 PREREQUISITE EDGES
```

**Prompt**

```
[Global Style Block]

Draw FIG. 3, a patent process schematic, top to bottom.

A rectangle labeled MARKER feeds a rectangle labeled ANCHOR RESOLUTION, which
feeds a diamond labeled ANCHOR ABOVE THRESHOLD. The YES branch of the diamond
feeds a rectangle labeled MONOTONIC ENCOUNTERED SET. The NO branch returns by a
looping arrow to ANCHOR RESOLUTION.

A rectangle at the upper left labeled FOCUS INPUT feeds a rectangle labeled
CUTOFF, which also feeds MONOTONIC ENCOUNTERED SET by a separate arrow.

MONOTONIC ENCOUNTERED SET connects by a double-headed vertical arrow to a
rectangle drawn with a doubled left edge labeled SESSION RECORD, denoting
persistent storage. A long curved arrow labeled RETRIEVE ON SECOND PAGE runs from
SESSION RECORD back up into the encountered set.

MONOTONIC ENCOUNTERED SET feeds downward into a rectangle labeled CONTEXT
PACKAGE, which contains three stacked sub-rectangles labeled TOPICS ENCOUNTERED,
MISCONCEPTION CODE UNION, and PREREQUISITE EDGES.

Reference numerals with lead lines. Figure label FIG. 3 centered beneath.

[Global Negative Block]
```

---

## 8. FIG. 4A–4E — Error signatures on the coordinate plane

**Shows:** five distinct geometric relationships between the target point and the plotted point. These are the observable signatures the detector keys on; each sub-view is one signature. Sub-views should be drawn identically except for point placement so the differences read at a glance.

Recommended arrangement: five small square grids on one sheet, in a row of three above a row of two, each with its own sub-figure label.

| Sub-view | Target (open circle, 410) | Plotted (solid dot, 412) | Signature depicted |
|---|---|---|---|
| FIG. 4A | (−3, 2) | (2, −3) | Ordered-pair components exchanged |
| FIG. 4B | (3, 2) | (−3, −2) | Both distances exact, both directions inverted |
| FIG. 4C | (0, 3) | (2, 3) | Point belonging on an axis displaced into a quadrant |
| FIG. 4D | (3, 2) | (3, 0) | Only one of two moves completed; point collapses onto an axis |
| FIG. 4E | (3, 2) | (4, 3) | Uniform single-unit offset on both axes |

**Layout sketch (one sub-view)**

```
        FIG. 4A
        404
         |  418  |  416
    -----+-------+-----  402
      420 |  406 | 422
         |
   410 (open circle)   412 (solid dot)
   414 broken arrow from 410 to 412
```

**Prompt**

```
[Global Style Block]

Draw FIG. 4, a sheet of five small square coordinate-plane diagrams arranged as a
row of three above a row of two, labeled FIG. 4A through FIG. 4E beneath each
grid.

Every grid is identical in construction: a perfect square of thin uniform
gridlines eleven lines by eleven lines, with a heavier horizontal axis and a
heavier vertical axis crossing at the center. Small tick labels of small plain
numerals along each axis. Draw the grids exactly square, flat, seen straight on.

On each grid place one small open circle and one small solid filled dot at
different lattice intersections, joined by a broken line with an arrowhead
pointing from the open circle to the solid dot.

Position the pairs as follows. FIG. 4A: open circle three units left and two units
up from center, solid dot two units right and three units down. FIG. 4B: open
circle three right and two up, solid dot three left and two down. FIG. 4C: open
circle on the vertical axis three up, solid dot two right and three up. FIG. 4D:
open circle three right and two up, solid dot three right on the horizontal axis.
FIG. 4E: open circle three right and two up, solid dot four right and three up.

Reference numerals with lead lines on the first grid only for the axes, origin,
gridlines, open circle, solid dot, and broken line; the remaining grids carry only
the point numerals.

[Global Negative Block]
```

**Cleanup notes:** generators routinely miscount grid squares. Rebuild the grids as vector geometry rather than trusting the raster; only the composition is worth keeping.

---

## 9. FIG. 5 — Ordered deterministic classification

**Shows:** the classification chain is fixed-order and first-match-wins, with the more specific signature evaluated before the looser one that would otherwise absorb it, and an explicit unclassified route rather than a forced label. Do **not** put a language model anywhere in this figure — its absence is the point.

**Layout sketch**

```
                     FIG. 5
              (800-style terminal) 500 RECEIVE RECORD
                          |
                     502 VALIDATE
                          |
                 504 <PLOTTED = TARGET?> --yes--> 506 NO CODE
                          | no
                 508 <TRANSPOSED?> --yes--+
                          | no             |
                 510 <TARGET ON AXIS?> -y--+
                          | no             |
                 512 <PLOTTED ON AXIS?> -y-+
                          | no             |
                 514 <MAGNITUDES EXACT?> y-+
                          | no             |
                 516 <SIGN INVERTED?> --y--+
                          | no             |
                 518 <UNIT OFFSET?> ----y--+--> 520 EMIT CODE
                          | no
                 522 UNCLASSIFIED ROUTE
```

**Prompt**

```
[Global Style Block]

Draw FIG. 5, a patent flowchart, single column, portrait orientation.

A rounded rectangle at the top labeled RECEIVE TASK RECORD. Below it a rectangle
labeled VALIDATE INTEGER INPUTS. Below that, a vertical stack of seven diamonds,
each connected to the next by a downward arrow on its NO branch. The diamonds are
labeled in this order: PLOTTED EQUALS TARGET, COMPONENTS EXCHANGED, TARGET ON
AXIS AND PLOTTED OFF AXIS, TARGET OFF AXIS AND PLOTTED ON AXIS, BOTH MAGNITUDES
EXACT AND SIGN INVERTED, SINGLE AXIS SIGN INVERTED, UNIT OFFSET ON EACH AXIS.

The YES branch of the first diamond exits right to a rounded rectangle labeled NO
CODE EMITTED. The YES branches of the remaining six diamonds all exit right and
merge into a single vertical line on the right side of the sheet feeding a
rounded rectangle labeled EMIT MATCHED CODE.

The NO branch of the last diamond continues down to a rounded rectangle labeled
UNCLASSIFIED ROUTE.

Every branch line labeled YES or NO in small capitals. Reference numerals with
lead lines beside each shape. Figure label FIG. 5 centered beneath.

[Global Negative Block]
```

---

## 10. FIG. 6 — Quadrant labeling schemes and scheme matching

**Shows:** the classifier for named-quadrant responses works by matching the learner's answer against a set of *complete alternative labeling schemes*, rather than scoring a single answer right or wrong — which is what lets one response identify a systematic labeling error.

**Layout sketch**

```
                          FIG. 6
   600 REFERENCE      602 ROTATED       604 REVERSED
    +----+----+        +----+----+       +----+----+
    | II | I  |        | I  | IV |       | IV | I  |
    +----+----+        +----+----+       +----+----+
    |III | IV |        | II |III |       |III | II |
    +----+----+        +----+----+       +----+----+

   606 COMPOUND       608 ROW-MAJOR
    +----+----+        +----+----+           610 LEARNER LABEL
    | I  | II |        | I  | II |                  |
    +----+----+        +----+----+                  v
    |IV  |III |        |III | IV |           612 SCHEME COMPARATOR
    +----+----+        +----+----+                  |
                                                    v
                                              120 CODE / 522 UNCLASSIFIED
```

**Prompt**

```
[Global Style Block]

Draw FIG. 6, a patent comparison diagram.

Five identical two-by-two square grids arranged as a row of three above a row of
two. Each grid is a plain square divided into four equal cells by one horizontal
and one vertical line. In each cell place a Roman numeral in plain capitals.

Grid one, upper cells left to right: II, I. Lower cells left to right: III, IV.
Grid two, upper: I, IV. Lower: II, III.
Grid three, upper: IV, I. Lower: III, II.
Grid four, upper: I, II. Lower: IV, III.
Grid five, upper: I, II. Lower: III, IV.

Beneath and to the right of the grids, a rectangle labeled LEARNER LABEL feeding
a rectangle labeled SCHEME COMPARATOR. Arrows run from each of the five grids
into the SCHEME COMPARATOR. The comparator has two output arrows, one to a
rectangle labeled EMIT CODE and one to a rectangle labeled UNCLASSIFIED.

Reference numerals with lead lines beside each grid and each rectangle. Figure
label FIG. 6 centered beneath.

[Global Negative Block]
```

---

## 11. FIG. 7 — Constrained prompt assembly

**Shows:** the composite prompt is assembled server-side from an invariant rule block plus a runtime session-context block, with the mode selected by which context fields are populated. The learner-visible dialogue never carries the code.

**Layout sketch**

```
                        FIG. 7
   700 INVARIANT RULE BLOCK ------+
   702 CODE-SPECIFIC DIRECTIVES --+
                                  v
   706 TASK RECORD ---+     134 PROMPT ASSEMBLY --> 714 COMPOSITE PROMPT
   708 DETECTED CODE -+---> 704 SESSION CONTEXT           |
   710 MARKER CONTEXT-+           |                       |
                                  v                       v
                            712 MODE SELECTOR      718 BOUNDED REQUEST --> 138
                                                          ^
                                            716 CONVERSATION HISTORY
```

**Prompt**

```
[Global Style Block]

Draw FIG. 7, a patent data-assembly diagram, left to right.

On the left, a vertical stack of five rectangles labeled INVARIANT RULE BLOCK,
CODE-SPECIFIC DIRECTIVES, TASK RECORD, DETECTED CODE, and MARKER CONTEXT. The
lower three feed by arrows into a single rectangle labeled SESSION CONTEXT BLOCK.
A small rectangle labeled MODE SELECTOR sits beneath SESSION CONTEXT BLOCK and is
connected to it by a short arrow.

The upper two rectangles and the SESSION CONTEXT BLOCK all feed by arrows into a
central rectangle labeled PROMPT ASSEMBLY. PROMPT ASSEMBLY feeds a rectangle to
its right labeled COMPOSITE SYSTEM PROMPT.

Below and to the right, a rectangle labeled CONVERSATION HISTORY. COMPOSITE
SYSTEM PROMPT and CONVERSATION HISTORY both feed a rectangle labeled BOUNDED
GENERATION REQUEST, which has a single output arrow at the far right to a
rectangle labeled LANGUAGE MODEL SERVICE.

Reference numerals with lead lines. Figure label FIG. 7 centered beneath.

[Global Negative Block]
```

---

## 12. FIG. 8 — End-to-end method

**Shows:** the claimed method as a whole — instrumented presentation, response capture, threshold gating, deterministic classification *preceding* generation, single-turn bounded generation, and a terminating escalation path that does not disclose the assessed answer.

**Layout sketch**

```
                    FIG. 8
        800 START
          v
   802 PRESENT CONTENT / RECORD ENCOUNTERED MARKERS
          v
   804 RECEIVE RESPONSE
          v
   806 <CORRECT?> --yes--> 808 ADVANCE --> 834 END
          | no
   810 INCREMENT COUNTER
          v
   812 <THRESHOLD MET?> --no--> 804
          | yes
   814 CLASSIFY DETERMINISTICALLY
          v
   816 ASSEMBLE CONTEXT --> 818 TRANSMIT --> 820 ASSEMBLE PROMPT
                                                    v
                                            822 GENERATE ONE TURN
                                                    v
                                            824 EXTRACT TOKENS
                                                    v
                                            826 RENDER TURN
                                                    v
                                            828 RECEIVE REPLY
                                                    v
                              830 <RESOLVED?> --yes--> 808
                                        | no, stalled
                              832 ESCALATE TO INSTRUCTOR --> 834 END
```

**Prompt**

```
[Global Style Block]

Draw FIG. 8, a tall single-column patent flowchart, portrait orientation.

From top: a rounded rectangle START; a rectangle PRESENT CONTENT AND RECORD
ENCOUNTERED MARKERS; a rectangle RECEIVE LEARNER RESPONSE; a diamond RESPONSE
CORRECT with its YES branch exiting right to a rectangle ADVANCE TO NEXT TASK; a
rectangle INCREMENT INCORRECT COUNTER; a diamond THRESHOLD MET with its NO branch
looping by a long arrow back up to RECEIVE LEARNER RESPONSE; a rectangle CLASSIFY
ERROR DETERMINISTICALLY; a rectangle ASSEMBLE CONTEXT PACKAGE; a rectangle
TRANSMIT TO PROXY; a rectangle ASSEMBLE CONSTRAINED PROMPT; a rectangle GENERATE
ONE SCAFFOLDING TURN; a rectangle EXTRACT CONTROL TOKENS; a rectangle RENDER TURN
TO LEARNER; a rectangle RECEIVE LEARNER REPLY; a diamond UNDERSTANDING
DEMONSTRATED whose YES branch exits right and joins the arrow into ADVANCE TO
NEXT TASK, and whose NO branch continues down to a rectangle ESCALATE TO HUMAN
INSTRUCTOR; finally a rounded rectangle END.

A second loop arrow runs from RECEIVE LEARNER REPLY back up to ASSEMBLE
CONSTRAINED PROMPT, labeled NEXT TURN.

Every branch labeled YES or NO. Reference numerals with lead lines beside each
shape. Figure label FIG. 8 centered beneath.

[Global Negative Block]
```

**Cleanup notes:** this figure is the one an examiner reads first. If it will not fit legibly on one sheet, split it at step 818 into FIG. 8A (client side) and FIG. 8B (server side) rather than shrinking the type.

---

## 13. FIG. 9 — Interface arrangement

**Shows:** the scaffolding panel is docked rather than modal — the assessment region remains live, which is what permits the guide to direct a demonstration on the same grid the learner is being assessed on. This is a utility-figure schematic of screen regions, not an ornamental design drawing and not a screenshot.

**Layout sketch**

```
                       FIG. 9
   +------------------ 900 DISPLAY ------------------------+
   |  +-- 902 ASSESSMENT REGION --+ +-- 904 PANEL -------+ |
   |  |                           | | 906 TRANSCRIPT     | |
   |  |    (grid, 918 indicator)  | |   [ turn ]         | |
   |  |                           | |   [ turn ]         | |
   |  |                           | | 916 [ ][ ][ ]      | |
   |  |                           | | 908 [ input ] 910  | |
   |  +---------------------------+ | 912 [ ]  914 [ ]   | |
   |                        920 (o) +--------------------+ |
   +-------------------------------------------------------+
```

**Prompt**

```
[Global Style Block]

Draw FIG. 9, a patent schematic of a screen layout, landscape proportion inside a
portrait sheet.

A large outer rectangle labeled DISPLAY. Inside it, two adjacent rectangles: a
wider one on the left labeled ASSESSMENT REGION and a narrower full-height one on
the right labeled SCAFFOLDING PANEL.

Inside the assessment region, a small square coordinate grid with a heavier
horizontal and vertical axis crossing at its center, and a small bracket-shaped
marker at its corner labeled SELECTION ACTIVE INDICATOR.

Inside the scaffolding panel, from top: a tall rectangle labeled TRANSCRIPT
REGION containing three stacked plain empty rectangles representing dialogue
turns; beneath it a row of three small empty rectangles labeled INTERPRETATION
CONTROLS; beneath that a wide empty rectangle labeled INPUT FIELD with a small
square to its right labeled SUBMIT; at the bottom two small rectangles side by
side labeled RETRY and ADVANCE.

At the lower right of the assessment region, a small circle labeled REOPEN
CONTROL.

All regions are empty outlines with no text inside them other than their labels.
Reference numerals with lead lines. Figure label FIG. 9 centered beneath.

[Global Negative Block]
```

---

## 14. FIG. 10 — Dialogue state machine

**Shows:** the bounded set of dialogue states and, critically, that every terminal path leads to resolution, learner dismissal, or human escalation — there is no state in which the system supplies the assessed answer.

**Layout sketch**

```
                       FIG. 10
                      1000 IDLE
                    /     |      \
        1002 COMPREHENSION | 1006 UNCLASSIFIED
                  \        |       /
                 1004 MISCONCEPTION CORRECTION
                  /        |        \
     1008 AMBIGUITY   1010 DEMONSTRATION   1018 STALL DETECTION
                  \        |                    |
                   1012 RESOLVED          1014 ESCALATED
                        |                       |
                   1016 DISMISSED  <------------+
```

**Prompt**

```
[Global Style Block]

Draw FIG. 10, a patent state-transition diagram. Use plain rectangles for states
and single-headed arrows for transitions, arranged top to bottom with generous
spacing.

Top: a rectangle labeled IDLE. Three arrows descend from it to three rectangles
in a row labeled COMPREHENSION SUPPORT, MISCONCEPTION CORRECTION, and
UNCLASSIFIED PROBING. The outer two each have an arrow into MISCONCEPTION
CORRECTION.

Below MISCONCEPTION CORRECTION, three rectangles in a row labeled AMBIGUITY
RESOLUTION, DEMONSTRATION, and STALL DETECTION, each connected to it by a
double-headed arrow except STALL DETECTION which has a single arrow from it.

Below those, two rectangles side by side labeled RESOLVED and ESCALATED TO
INSTRUCTOR. AMBIGUITY RESOLUTION and DEMONSTRATION feed RESOLVED. STALL DETECTION
feeds ESCALATED TO INSTRUCTOR.

At the bottom, a single rectangle labeled DISMISSED, fed by arrows from both
RESOLVED and ESCALATED TO INSTRUCTOR, with a long return arrow up the left side
back to IDLE.

Reference numerals with lead lines. Figure label FIG. 10 centered beneath.

[Global Negative Block]
```

---

## 15. FIG. 11 — Activation routes

**Shows:** three distinct entry conditions and the mode each selects. The error-threshold route is gated by a counter; the other two open directly.

**Layout sketch**

```
                        FIG. 11
   1100 TERM ACTIVATION -----------------+
                                          \
   1102 PERSISTENT CONTROL --> 1112 TOPIC  +--> 1108 COMPREHENSION ENTRY
                               LIST       /
                                         /
   1104 INCORRECT RESPONSE --> 1106 COUNTER --> <THRESHOLD> --> 1110 CORRECTION ENTRY
```

**Prompt**

```
[Global Style Block]

Draw FIG. 11, a patent diagram of three parallel input routes, arranged left to
right in three horizontal rows.

Top row: a rectangle labeled TERM ACTIVATION with an arrow running right.
Middle row: a rectangle labeled PERSISTENT HELP CONTROL feeding a rectangle
labeled TOPIC SELECTION LIST, which continues right.
Both the top and middle rows converge with arrows into a single rectangle on the
right labeled COMPREHENSION SUPPORT ENTRY.

Bottom row: a rectangle labeled INCORRECT RESPONSE feeding a rectangle labeled
INCORRECT RESPONSE COUNTER, feeding a diamond labeled THRESHOLD MET. The YES
branch of the diamond feeds a rectangle at the right labeled MISCONCEPTION
CORRECTION ENTRY. The NO branch loops back to INCORRECT RESPONSE.

Reference numerals with lead lines. Figure label FIG. 11 centered beneath.

[Global Negative Block]
```

---

## 16. FIG. 12 — Single-turn sequence

**Shows:** one complete request-response cycle across four actors, including the demonstration exchange in which the guide's output enables a selection on the assessment grid and the resulting selection re-enters the dialogue as an input.

**Layout sketch**

```
                             FIG. 12
   1200 LEARNER   1202 CLIENT    1204 PROXY     1206 MODEL
       |              |              |              |
       |--response--->|              |              |
       |              |--classify--> |              |
       |              |--context---->|              |
       |              |              |--prompt----->|
       |              |              |<--turn-------|
       |              |<--payload----|              |
       |<--render-----|              |              |     } 1208
       |--reply------>|              |              |
       |              |--history---->|              |
       |              |              |--prompt----->|
       |              |<--payload----|              |
       |<--demo req---|              |              |     } 1210
       |--selection-->|              |              |
```

**Prompt**

```
[Global Style Block]

Draw FIG. 12, a patent sequence diagram with four vertical lifelines.

Four rectangles across the top labeled LEARNER, CLIENT, PROXY SERVER, and
LANGUAGE MODEL SERVICE. A long thin vertical line descends from each.

Horizontal arrows between the lifelines in this order from top to bottom, each
with a short label above it: LEARNER to CLIENT labeled RESPONSE; a short arrow
looping on the CLIENT lifeline labeled CLASSIFY; CLIENT to PROXY labeled CONTEXT
PACKAGE; PROXY to MODEL labeled CONSTRAINED PROMPT; MODEL to PROXY labeled
GENERATED TURN; PROXY to CLIENT labeled RESPONSE PAYLOAD; CLIENT to LEARNER
labeled RENDERED TURN; LEARNER to CLIENT labeled REPLY; CLIENT to PROXY labeled
HISTORY; PROXY to MODEL labeled CONSTRAINED PROMPT; MODEL to PROXY labeled
GENERATED TURN; PROXY to CLIENT labeled RESPONSE PAYLOAD; CLIENT to LEARNER
labeled DEMONSTRATION REQUEST; LEARNER to CLIENT labeled GRID SELECTION.

At the right margin, two vertical square brackets spanning groups of arrows,
labeled BOUNDED TURN and DEMONSTRATION EXCHANGE.

Reference numerals with lead lines beside each lifeline header and each bracket.
Figure label FIG. 12 centered beneath.

[Global Negative Block]
```

---

## Accuracy boundaries

Read before adding or altering figures.

**Depicted because implemented:**

- Deterministic, rule-based classification executed on the client before any model call, with fixed evaluation order and an explicit unclassified route.
- Non-rendering metadata markers bound to instructional content, accumulated monotonically and persisted across a page navigation.
- Server-side prompt assembly from an invariant rule block plus a runtime session-context block, with the credential held only server-side.
- Control tokens extracted from model output to drive client behavior (demonstration prompt, advance, dismissal) and a pattern-matched escalation signal.
- Three activation routes, a two-error threshold gate, a docked non-modal panel, and terminal escalation to a human instructor.

**Not depicted, and must not be added without a corresponding implementation:**

- Any machine-learned or transformer-based classifier. Classification here is rule-based. A figure showing an encoder classifier would describe a different system than the one built.
- Adaptive drill sequencing, mastery modeling, or learner profiles persisted across sessions.
- Reflection-task handling, non-unit grid intervals, or subject domains other than the coordinate plane.
- Any multi-tenant, roster, or teacher-dashboard architecture.

If claim drafting requires an alternative embodiment covering any of the above, draw it as a clearly separate figure and label it as an alternative embodiment in the specification — do not fold it into the figures above.

**A note on the filename.** In patent practice "prior art" means references predating the application, not the application's own drawings. This file is a drawing specification. If it will be circulated to counsel, consider renaming it `hegemon-patent-drawings.md` to avoid the collision.

---

## 17. Pre-filing checklist

Run this against the finished sheets, not the generated rasters.

- [ ] Every element mentioned in the specification appears in at least one figure.
- [ ] Every reference numeral in the specification appears in a figure, and every numeral in a figure appears in the specification.
- [ ] Recurring elements carry the same numeral in every figure they appear in (check 118, 122, 128, 134, 138 especially).
- [ ] No numeral is used for two different elements.
- [ ] Numerals do not touch or cross any drawing line; every lead line terminates cleanly on its element.
- [ ] All lines are solid black and uniform weight; broken lines appear only where they carry meaning (marker non-rendering, boundaries, displacement paths).
- [ ] No color, gray fill, shading, or gradient anywhere on any sheet.
- [ ] Figure labels are `FIG. n` form, centered beneath, consistent typeface across all sheets.
- [ ] Sub-figures are lettered `FIG. 4A` … not `FIG. 4.1` or `FIG. 4(a)`.
- [ ] Flowchart branches are labeled YES/NO consistently; no unlabeled branch.
- [ ] Arrowheads present on every directed connector; no ambiguous undirected lines except where a double-headed arrow is intended.
- [ ] Every sheet legible when reduced to two-thirds size (examiner reproduction test).
- [ ] No logos, brand marks, product names, watermarks, or copyright notices anywhere on the sheets.
- [ ] FIG. 5 contains no language-model element.
- [ ] FIG. 1 shows the credential store strictly inside the proxy boundary.
```
