/*
 * Hegemon Learning Guide — misconception detection
 * -------------------------------------------------
 * Pure, deterministic logic. No Firebase, no Claude, no DOM.
 *
 * Given a target point and where the student actually plotted, return the
 * misconception code (MC-0x) or null. Returning null means "no rule matched"
 * — route to the unclassified fallback so Claude probes generically rather
 * than asserting a misconception it can't substantiate.
 *
 * Diagnostics and evaluation order are transcribed from misconception-taxonomy.md.
 * Evaluation order (FIRST MATCH WINS):
 *     MC-01 -> MC-07 -> MC-08 -> MC-06 -> MC-02 -> MC-03 -> MC-04
 * More specific signatures run first so a looser rule can't claim them.
 *
 * MC-04 (Quadrant Misidentification) and MC-05 (Reflection) are NOT here:
 *   - MC-04 needs a separate quadrant-NAMING response; it is undetectable from
 *     (target, plotted) alone, so it can never fire on this signature.
 *   - MC-05 is out of scope for Lesson 1 (no reflection task exists).
 *
 * Usage at the plotting-grid seam:
 *     const code = detectMisconception(record);   // record = {targetX,targetY,plottedX,plottedY}
 * Or positionally:
 *     const code = detectMisconception(tx, ty, px, py);
 */
(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;                          // Node / CommonJS (tests)
  } else {
    root.HegemonDetect = api;                      // browser namespace
    root.detectMisconception = api.detectMisconception; // convenience for the seam
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function isInt(n) { return typeof n === 'number' && Number.isInteger(n); }

  /* Accept either a record object or four positional integers. */
  function normalize(a, b, c, d) {
    var r;
    if (a && typeof a === 'object') {
      r = {
        targetX:  a.targetX  != null ? a.targetX  : a.target_x,
        targetY:  a.targetY  != null ? a.targetY  : a.target_y,
        plottedX: a.plottedX != null ? a.plottedX : a.plotted_x,
        plottedY: a.plottedY != null ? a.plottedY : a.plotted_y
      };
    } else {
      r = { targetX: a, targetY: b, plottedX: c, plottedY: d };
    }
    if (!isInt(r.targetX) || !isInt(r.targetY) || !isInt(r.plottedX) || !isInt(r.plottedY)) {
      throw new TypeError(
        'detectMisconception: targetX, targetY, plottedX, plottedY must all be integers'
      );
    }
    return r;
  }

  function isCorrect(r) {
    return r.plottedX === r.targetX && r.plottedY === r.targetY;
  }

  /* ---- diagnostics, one predicate per MC code ----
     Each predicate is written to be true on its own signature in isolation.
     Precedence between overlapping signatures is handled by ORDER, not here. */

  // MC-01 Axis Transposition: plotted the swapped pair; excluded when the pair is symmetric.
  //   plotted == (target_y, target_x)  and  target_x != target_y
  function mc01(r) {
    return r.targetX !== r.targetY &&
           r.plottedX === r.targetY &&
           r.plottedY === r.targetX;
  }

  // MC-07 Axis-as-Boundary: target has a 0 coordinate (sits on an axis), but the
  //   plotted point was pushed off that axis into a quadrant.
  function mc07(r) {
    return (r.targetX === 0 && r.plottedX !== 0) ||
           (r.targetY === 0 && r.plottedY !== 0);
  }

  // MC-08 Incomplete Plot / Axis Collapse: target is inside a quadrant, but only one
  //   of the two moves was made, so the plotted point landed on an axis.
  function mc08(r) {
    return r.targetX !== 0 && r.targetY !== 0 &&
           (r.plottedX === 0 || r.plottedY === 0);
  }

  // MC-06 Magnitude/Sign Conflation: both distances from the origin are exact, but at
  //   least one sign is wrong (a mirror of the target). Checked BEFORE MC-02.
  function mc06(r) {
    return Math.abs(r.plottedX) === Math.abs(r.targetX) &&
           Math.abs(r.plottedY) === Math.abs(r.targetY) &&
           !(r.plottedX === r.targetX && r.plottedY === r.targetY);
  }

  // MC-02 Sign/Directionality Error: at least one axis is a clean sign flip (right
  //   magnitude, wrong direction). targetN != 0 guards against -0 false positives.
  //   Reached only after MC-06, so the both-magnitudes-exact mirror is already gone;
  //   here the OTHER axis is off by magnitude too.
  function mc02(r) {
    return (r.targetX !== 0 && r.plottedX === -r.targetX) ||
           (r.targetY !== 0 && r.plottedY === -r.targetY);
  }

  // MC-03 Origin/Offset Error: signs preserved, a small (+/-1) offset on one or both axes.
  //   This is the SINGLE-POINT proxy for the taxonomy's "consistent off-by-one shift."
  //   The taxonomy's "constant offset across several plotted points" cannot be verified
  //   from one plot, so this rule is deliberately conservative: only exact +/-1 offsets
  //   qualify; anything looser falls through to the unclassified fallback (return null).
  function mc03(r) {
    var dx = r.plottedX - r.targetX;
    var dy = r.plottedY - r.targetY;
    if (dx === 0 && dy === 0) return false;           // (correct — handled earlier anyway)
    return Math.abs(dx) <= 1 && Math.abs(dy) <= 1;
  }

  /* ---- evaluation order: first match wins ---- */
  var ORDER = [
    { code: 'MC-01', test: mc01 },
    { code: 'MC-07', test: mc07 },
    { code: 'MC-08', test: mc08 },
    { code: 'MC-06', test: mc06 },
    { code: 'MC-02', test: mc02 },
    { code: 'MC-03', test: mc03 }
    // MC-04 intentionally absent — needs a quadrant-naming input (see header).
  ];

  function detectMisconception(a, b, c, d) {
    var r = normalize(a, b, c, d);
    if (isCorrect(r)) return null;                    // correct plot — no misconception
    for (var i = 0; i < ORDER.length; i++) {
      if (ORDER[i].test(r)) return ORDER[i].code;
    }
    return null;                                       // unmatched — route to fallback handler
  }

  return {
    detectMisconception: detectMisconception,
    predicates: { mc01: mc01, mc02: mc02, mc03: mc03, mc06: mc06, mc07: mc07, mc08: mc08 },
    EVALUATION_ORDER: ORDER.map(function (o) { return o.code; })
  };
}));
