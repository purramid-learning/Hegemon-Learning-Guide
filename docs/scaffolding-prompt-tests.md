# Hegemon Scaffolding Prompt — Test Specification

Structured test cases for dev-order step 7. Each case specifies the session context, a trigger message, and a checklist of required and disqualifying behaviors.

**How to run:** Open claude.ai, enable custom system prompt, paste the full `SCAFFOLDING_RULES` constant from `functions/index.js` as the system prompt, then append the session context block below it. Send the trigger message and evaluate the response against the checklist. Alternatively, run via the Firebase emulator once step 6 is deployed.

**Passing bar:** Every checked item must be satisfied. Any item in "Fail if" disqualifies the response.

---

## Test 01 — MC-01 Axis Transposition (first turn)

**Session context to append:**
```
---

[SESSION CONTEXT]
Task: student was asked to plot (-3, 2)
Student plotted: (2, -3)
Detected misconception code: MC-01
Address this specific misconception. Do not name the code to the student.
Topics the student has encountered: number-line, coordinate-plane, x-axis, y-axis, origin, ordered-pair, plotting-across-then-up
[/SESSION CONTEXT]
```

**Trigger message:**
> I plotted my point but it's wrong. I don't know what happened.

**Pass if the response:**
- [ ] Acknowledges that the student made an attempt
- [ ] References the ordered pair (−3, 2) specifically
- [ ] Asks a question about which number in an ordered pair controls the left-or-right move
- [ ] Does NOT state which number controls the left-or-right move (student must supply it)
- [ ] Ends with a question mark
- [ ] Is 4 sentences or fewer
- [ ] Does not mention axis transposition, swapping, or the code
- [ ] Uses "left or right" not "across"

**Fail if the response:**
- Names the x-coordinate as the left-right value before the student does
- Asks about sign or direction (that is MC-02, not MC-01)
- Uses a made-up ordered pair instead of (−3, 2)
- Ends without a question
- Offers multiple hints at once

---

## Test 02 — MC-02 Sign/Directionality Error (first turn)

**Session context:**
```
---

[SESSION CONTEXT]
Task: student was asked to plot (-4, 3)
Student plotted: (4, 3)
Detected misconception code: MC-02
Address this specific misconception. Do not name the code to the student.
Topics the student has encountered: number-line, coordinate-plane, x-axis, y-axis, origin, ordered-pair, plotting-across-then-up, negative-x, negative-y
[/SESSION CONTEXT]
```

**Trigger:**
> I went the right number of spaces but I'm still in the wrong place.

**Pass if:**
- [ ] Acknowledges that the student counted the right distance
- [ ] References the ordered pair (−4, 3)
- [ ] Asks about BOTH axes in one response — x first, then y — matching (x, y) order
- [ ] Uses the signs from the target pair: negative for x, positive for y
- [ ] Does NOT state which direction is correct for either coordinate
- [ ] Ends with a question mark

**Fail if:**
- Asks about only one axis (telegraphs the error)
- Asks about y before x (implies y is the problem)
- States "you should have gone left" or names the correct direction for a specific coordinate
- Asks about which number controls which axis (that is MC-01)
- Ends without a question

---

## Test 03 — MC-03 Origin/Offset Error (first turn)

**Session context:**
```
---

[SESSION CONTEXT]
Task: student was asked to plot (3, 2)
Student plotted: (4, 3)
Detected misconception code: MC-03
Address this specific misconception. Do not name the code to the student.
Topics the student has encountered: number-line, coordinate-plane, x-axis, y-axis, origin, ordered-pair, plotting-across-then-up
[/SESSION CONTEXT]
```

**Trigger:**
> I counted the spaces carefully but it still says I'm wrong.

**Pass if:**
- [ ] Acknowledges the student's counting effort
- [ ] Asks where counting begins — what point do you start from?
- [ ] Does NOT say the student is off by 1 or name the offset
- [ ] Ends with a question mark

**Fail if:**
- States "you should start at 0, not 1"
- Asks about direction or sign (wrong code)
- Ends without a question

**TODO: Revisit this test for further learning design review.** The current response asks for the coordinates of the starting point. It is unclear whether that is the optimal first rung for MC-03, or whether asking the student to name the starting point (or describe where they began counting) would be more effective. Revisit before finalizing the prompt.

---

## Test 04 — MC-04a Incorrect Starting Point (first turn)

**Session context:**
```
---

[SESSION CONTEXT]
Detected misconception code: MC-04a
Address this specific misconception. Do not name the code to the student.
Topics the student has encountered: coordinate-plane, x-axis, y-axis, origin, ordered-pair, quadrants
[/SESSION CONTEXT]
```

**Trigger:**
> I labeled the quadrants but I keep getting them wrong.

**Pass if:**
- [ ] Acknowledges the student's attempt
- [ ] Surfaces the convention that Quadrant I is the all-positive corner
- [ ] Asks which corner that is — lets the student identify the corner, does NOT identify it
- [ ] Ends with a question mark

**Fail if:**
- States "Quadrant I is in the top-right corner" (that is the answer the student must supply)
- Asks about direction of counting (that is MC-04b, not MC-04a — starting corner is the only issue here)
- Ends without a question

---

## Test 05 — MC-04b Clockwise Numbering (first turn)

**Session context:**
```
---

[SESSION CONTEXT]
Detected misconception code: MC-04b
Address this specific misconception. Do not name the code to the student.
Topics the student has encountered: coordinate-plane, x-axis, y-axis, origin, ordered-pair, quadrants
[/SESSION CONTEXT]
```

**Trigger:**
> I started at the right corner but my quadrant numbers are still off.

**Pass if:**
- [ ] Acknowledges that the student has the starting corner right
- [ ] Asks which axis changes — x or y — to move from Quadrant I to Quadrant II (one unknown only)
- [ ] Does NOT pre-answer the sub-question (e.g., does not say "x becomes negative, y stays positive")
- [ ] Does NOT say "counterclockwise" or "clockwise"
- [ ] Does NOT name which corner is Quadrant II
- [ ] Ends with a question mark

**Fail if:**
- Frames the question with context that resolves its own sub-questions before the student can answer
- Says "counterclockwise" or "clockwise"
- Names the top-left corner as Quadrant II before the student does
- Ends without a question

---

## Test 06 — MC-04c Compound Error (full three-turn sequence)

MC-04c requires three turns. In the clockwise scheme, Quadrant III lands at the bottom-right corner (wrong). After correcting the starting corner (Turn 1) and direction (Turn 2), the student's placement of III does not self-correct — clockwise counting had already anchored III at the wrong corner, and counterclockwise from the newly learned Quadrant II must be explicitly scaffolded (Turn 3).

Note: The trigger is generic. Students express confusion, not self-diagnosis. The code comes from detection, not from what the student says.

**Session context:**
```
---

[SESSION CONTEXT]
Detected misconception code: MC-04c
Address this specific misconception. Do not name the code to the student.
Topics the student has encountered: coordinate-plane, x-axis, y-axis, origin, ordered-pair, quadrants
[/SESSION CONTEXT]
```

**Trigger:**
> I labeled the quadrants but got them all wrong. I'm not sure what I did.

**Turn 1 — pass if:**
- [ ] Acknowledges the attempt
- [ ] Surfaces the all-positive corner convention
- [ ] Asks which corner is Quadrant I — one unknown, student supplies it
- [ ] Does NOT mention direction of counting
- [ ] Does NOT name the top-right corner
- [ ] Ends with a question mark

**Turn 1 — fail if:**
- Mentions direction of counting in the same response as the starting corner
- Names the top-right corner before the student does
- Ends without a question

---

**Simulated student reply (turn 1 → turn 2):**
> Quadrant I is the top-right corner, where both x and y are positive.

**Turn 2 — pass if:**
- [ ] Confirms the student's correct identification of the starting corner
- [ ] Asks which axis changes, x or y, to move from Quadrant I to Quadrant II — one unknown, student supplies it
- [ ] Does NOT pre-answer the sub-question (does not say "x becomes negative" or "y stays positive")
- [ ] Does NOT say "counterclockwise" or "clockwise"
- [ ] Does NOT name which corner is Quadrant II
- [ ] Ends with a question mark

**Turn 2 — fail if:**
- Re-introduces the starting corner (already confirmed)
- Pre-answers which axis changes or what happens to it
- Says "counterclockwise" or "clockwise"
- Names the top-left corner as Quadrant II before the student does
- Ends without a question

---

**Simulated student reply (turn 2 → turn 3):**
> The x-axis changes. So Quadrant II is the top-left corner.

**Turn 3 — pass if:**
- [ ] Confirms Quadrant II correctly placed
- [ ] Asks "which axis changes, x or y, to move from Quadrant II to Quadrant III?" — same question frame as Turn 2, applied to the next transition
- [ ] Does NOT say "keep going" or "continue in the same direction" — those ask the student to infer both direction and corner simultaneously
- [ ] Does NOT say "counterclockwise" or "clockwise"
- [ ] Does NOT name the bottom-left corner
- [ ] Ends with a question mark

**Turn 3 — fail if:**
- Says "keep going" or "continue in that direction" instead of applying the axis-change question
- Re-teaches starting corner or direction (both already confirmed)
- Says "counterclockwise" or "clockwise"
- Names the bottom-left corner before the student does
- Ends without a question

---

## Test 08 — MC-04d Raster Error (two-turn sequence)

MC-04d requires two turns. In the raster scheme, Quadrant III falls at the bottom-left corner, which happens to be correct. Once the student corrects the starting corner (Turn 1) and direction (Turn 2), III and IV fall into place without additional scaffolding.

Note: The trigger is generic. The student would not know their schema name or method; the code is determined by detection.

**Session context:**
```
---

[SESSION CONTEXT]
Detected misconception code: MC-04d
Address this specific misconception. Do not name the code to the student.
Topics the student has encountered: coordinate-plane, x-axis, y-axis, origin, ordered-pair, quadrants
[/SESSION CONTEXT]
```

**Trigger:**
> I labeled the quadrants but they're wrong and I'm not sure why.

**Turn 1 — pass if:**
- [ ] Acknowledges the attempt
- [ ] Surfaces the all-positive corner convention
- [ ] Asks which corner is Quadrant I — one unknown, student supplies it
- [ ] Does NOT mention direction in this turn
- [ ] Does NOT name the top-right corner
- [ ] Ends with a question mark

**Turn 1 — fail if:**
- Addresses direction in the same response as the starting corner
- Confirms top-left = I before redirecting
- Names the top-right corner before the student does
- Ends without a question

---

**Simulated student reply (turn 1 → turn 2):**
> Oh — Quadrant I is the top-right corner, where both coordinates are positive.

**Turn 2 — pass if:**
- [ ] Confirms the student's correct identification of the starting corner
- [ ] Asks which axis changes, x or y, to move from Quadrant I to Quadrant II — one unknown
- [ ] Does NOT pre-answer the sub-question
- [ ] Does NOT say "counterclockwise" or "clockwise"
- [ ] Does NOT name which corner is Quadrant II
- [ ] Ends with a question mark

**Turn 2 — fail if:**
- Re-introduces the starting corner (already confirmed)
- Pre-answers which axis changes or what happens to it
- Says "counterclockwise" or "clockwise"
- Names the top-left corner as Quadrant II before the student does
- Ends without a question

---

## Test 09 — MC-06 Magnitude/Sign Conflation (first turn)

**Session context:**
```
---

[SESSION CONTEXT]
Task: student was asked to plot (-3, -2)
Student plotted: (3, 2)
Detected misconception code: MC-06
Address this specific misconception. Do not name the code to the student.
Topics the student has encountered: coordinate-plane, x-axis, y-axis, origin, ordered-pair, plotting-across-then-up, negative-x, negative-y
[/SESSION CONTEXT]
```

**Trigger:**
> I moved the right number of spaces on both sides but it says I'm wrong.

**Pass if:**
- [ ] **Affirms** that the student moved the correct distance on each axis before redirecting
- [ ] Then asks about the direction meaning of the sign (which way a negative points)
- [ ] Does NOT state which direction is correct for this specific coordinate
- [ ] Ends with a question mark

**Fail if:**
- Jumps straight to asking about direction without first affirming the distances (that is the MC-02 approach, not MC-06)
- States "you went right but should go left" or similar
- Ends without a question

---

## Test 10 — MC-07 Axis-as-Boundary (first turn)

**Session context:**
```
---

[SESSION CONTEXT]
Task: student was asked to plot (0, 3)
Student plotted: (1, 3)
Detected misconception code: MC-07
Address this specific misconception. Do not name the code to the student.
Topics the student has encountered: coordinate-plane, x-axis, y-axis, origin, ordered-pair, plotting-across-then-up
[/SESSION CONTEXT]
```

**Trigger:**
> I put the point in the quadrant next to the y-axis.

**Pass if:**
- [ ] Acknowledges where the student placed the point
- [ ] Asks what a coordinate of 0 means for movement along that axis
- [ ] Does NOT state "a 0 coordinate means you stay on the axis"
- [ ] Ends with a question mark

**Fail if:**
- States "your point should be on the y-axis, not inside a quadrant"
- Asks about direction or sign (wrong code)
- Ends without a question

---

## Test 11 — MC-08 Incomplete Plot (first turn)

**Session context:**
```
---

[SESSION CONTEXT]
Task: student was asked to plot (4, -2)
Student plotted: (4, 0)
Detected misconception code: MC-08
Address this specific misconception. Do not name the code to the student.
Topics the student has encountered: coordinate-plane, x-axis, y-axis, origin, ordered-pair, plotting-across-then-up
[/SESSION CONTEXT]
```

**Trigger:**
> I moved across and stopped there.

**Pass if:**
- [ ] Opens with a neutral frame ("Let's check each step" or similar) — not an affirmation of either move
- [ ] Asks how many spaces the student counted along the x-axis and along the y-axis — both in one response, x first
- [ ] Does NOT affirm either move before asking — affirming the x-move telegraphs that y is the problem
- [ ] Does NOT name the missing move or say "you also need to move up/down"
- [ ] Ends with a question mark

**Fail if:**
- Opens cold with no framing sentence
- Affirms the first move as correct before asking (telegraphs the error)
- States "you forgot the second move" or names the missing move
- Asks about sign or direction (wrong code)
- Asks only about one axis
- Ends without a question

---

## Test 12 — Unclassified fallback (null code, no focus)

**Session context:**
```
---

[SESSION CONTEXT]
No misconception classified. Probe generically: ask the student to walk you through how they placed the point, one step at a time.
[/SESSION CONTEXT]
```

**Trigger:**
> I don't know why my answer is wrong.

**Pass if:**
- [ ] Acknowledges that the student is unsure
- [ ] Asks the student to walk through their process step by step (starting from the origin)
- [ ] Does NOT assert any specific misconception
- [ ] Ends with a question mark

**Fail if:**
- Asserts a specific error ("it looks like you might have swapped x and y")
- Gives a general coordinate-plane tutorial instead of asking about the student's specific process
- Ends without a question

---

## Test 13 — Comprehension support, CG-01 definitional ("What is the origin?")

**Session context:**
```
---

[SESSION CONTEXT]
No misconception classified. Probe generically: ask the student to walk you through how they placed the point, one step at a time.
Topics the student has encountered: number-line, coordinate-plane, x-axis, y-axis, origin
Student focus (tapped concept): origin
[/SESSION CONTEXT]
```

**Trigger:**
> What's the origin?

**Pass if:**
- [ ] Defines the origin in concrete terms (where the two axes cross, the (0,0) point)
- [ ] Ends with a CHECK question — asks the student to apply the definition (e.g., "which point on the grid in front of you sits at (0, 0)?")
- [ ] Does NOT end with a statement
- [ ] Tone is explanatory, not Socratic-decompose — this is comprehension mode

**Fail if:**
- Asks "what do YOU think the origin is?" (comprehension mode may rephrase definitions — no need to withhold the definition, only the assessed item)
- Ends without a question
- Produces a multi-paragraph lecture

---

## Test 14 — Charitable interpretation (ambiguous student input)

**Session context:**
```
---

[SESSION CONTEXT]
Detected misconception code: MC-01
Address this specific misconception. Do not name the code to the student.
Topics the student has encountered: ordered-pair, x-axis, y-axis, origin, plotting-across-then-up
[/SESSION CONTEXT]
```

**Conversation so far:**
> User: I plotted it wrong.
> Assistant: [first-turn response]
> User: I think I got the numbers mixed up.

**Pass if the response:**
- [ ] Does not guess a single interpretation and proceed
- [ ] Offers 3–4 numbered interpretations of "I went up first"
- [ ] The last interpretation is an open "In your own words — something else?"
- [ ] Ends by asking the student to pick one

**Fail if:**
- Assumes one interpretation and responds to it
- Offers only 1–2 interpretations
- Omits the "in your own words" option
- Ends without asking for a selection

---

## Test 15 — Multi-turn: no re-introduction of confirmed concepts

**Session context:**
```
---

[SESSION CONTEXT]
Detected misconception code: MC-01
Address this specific misconception. Do not name the code to the student.
Topics the student has encountered: ordered-pair, x-axis, y-axis, origin, plotting-across-then-up
[/SESSION CONTEXT]
```

**Conversation so far:**
> User: I plotted my point but it's wrong.
> Assistant: When you look at an ordered pair like (3, 2), one of those numbers tells you how far to move left or right, and the other tells you how far to go up or down. Which number do you think controls the left-or-right move?
> User: The first number, the 3.
> Assistant: Right. The first number always controls the left-or-right move, so in (3, 2) you'd move 3 spaces from the origin. What does the second number, the 2, tell you to do?
> User: Up or down.

**Pass if the next response:**
- [ ] Confirms the student's correct answer about the second number
- [ ] Does NOT re-explain which number is x and which is y (already confirmed)
- [ ] Moves to the next rung: asks about direction (up or down in this case), or hands off if the student can now self-correct
- [ ] Ends with a question (or hands off cleanly if the student clearly has it)

**Fail if:**
- Re-introduces "the first number controls across" (already confirmed)
- Provides a lecture when the student has demonstrated understanding
- Ends without either a question or a clear hand-off

---

## Test summary

| Test | Code | Component | First turn | Multi-turn |
|------|------|-----------|------------|------------|
| 01 | MC-01 | axis order | ✓ | |
| 02 | MC-02 | direction | ✓ | |
| 03 | MC-03 | origin count | ✓ | |
| 04 | MC-04a | start corner | ✓ | |
| 05 | MC-04b | direction | ✓ | |
| 06 | MC-04c | compound turn 1 | ✓ | |
| 07 | MC-04c | compound turn 2 | | ✓ |
| 08 | MC-04d | raster turn 1 | ✓ | |
| 09 | MC-06 | affirm + direction | ✓ | |
| 10 | MC-07 | axis boundary | ✓ | |
| 11 | MC-08 | two-move rule | ✓ | |
| 12 | null | fallback | ✓ | |
| 13 | CG-01 | comprehension | ✓ | |
| 14 | MC-01 | charitable interp | | ✓ |
| 15 | MC-01 | no re-intro | | ✓ |
