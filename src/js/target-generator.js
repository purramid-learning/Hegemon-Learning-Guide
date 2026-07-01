/*
 * target-generator.js — Hegemon Learning Guide
 *
 * Generates a randomized target sequence for each practice session.
 * Six slots, one per category, values randomized within each category's
 * constraints. Category structure is fixed so every MC code remains
 * reachable on multiple targets within a session.
 *
 * Exports: { generateTargets }
 *   generateTargets() → Array<{x: number, y: number}>  (length 6)
 *
 * Category map (slot → MC codes reachable):
 *   0  Q1  (x>0, y>0, x≠y)          MC-01, MC-03, MC-08
 *   1  Q2  (x<0, y>0)                MC-01, MC-02, MC-03, MC-06, MC-08
 *   2  Q4  (x>0, y<0)                MC-01, MC-02, MC-03, MC-06, MC-08
 *   3  Y-axis (x=0, y≠0)             MC-07
 *   4  X-axis (y=0, x≠0)             MC-07
 *   5  Q3  (x<0, y<0)                MC-01, MC-02, MC-03, MC-06, MC-08
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.TargetGenerator = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function randIntExcluding(min, max, excluded) {
    var v;
    do { v = randInt(min, max); } while (excluded.indexOf(v) !== -1);
    return v;
  }

  // Random non-zero integer in [-5,-1] or [1,5]
  function randNonZero() {
    return Math.random() < 0.5 ? randInt(1, 5) : randInt(-5, -1);
  }

  function generateTargetForSlot(slot, exclude) {
    var x, y, attempts = 0;
    do {
      switch (slot) {
        case 0: x = randInt(1,5); y = randIntExcluding(1,5,[x]); break;
        case 1: x = randInt(-5,-1); y = randInt(1,5); break;
        case 2: x = randInt(1,5); y = randInt(-5,-1); break;
        case 3: x = 0; y = randNonZero(); break;
        case 4: x = randNonZero(); y = 0; break;
        case 5: x = randInt(-5,-1); y = randInt(-5,-1); break;
        default: x = randInt(1,5); y = randInt(1,5);
      }
      attempts++;
    } while (exclude && x === exclude.x && y === exclude.y && attempts < 20);
    return { x: x, y: y };
  }

  function generateTargets() {
    // Slot 0 — Q1: both positive, x ≠ y (so a swapped point is detectable)
    var x0 = randInt(1, 5);
    var y0 = randIntExcluding(1, 5, [x0]);

    // Slot 1 — Q2: negative x, positive y
    var x1 = randInt(-5, -1);
    var y1 = randInt(1, 5);

    // Slot 2 — Q4: positive x, negative y
    var x2 = randInt(1, 5);
    var y2 = randInt(-5, -1);

    // Slot 3 — Y-axis: x fixed at 0, y non-zero
    var x3 = 0;
    var y3 = randNonZero();

    // Slot 4 — X-axis: y fixed at 0, x non-zero
    var x4 = randNonZero();
    var y4 = 0;

    // Slot 5 — Q3: both negative
    var x5 = randInt(-5, -1);
    var y5 = randInt(-5, -1);

    return [
      { x: x0, y: y0 },
      { x: x1, y: y1 },
      { x: x2, y: y2 },
      { x: x3, y: y3 },
      { x: x4, y: y4 },
      { x: x5, y: y5 }
    ];
  }

  return { generateTargets: generateTargets, generateTargetForSlot: generateTargetForSlot };
}));
