/*
 * Tests for misconception-detection.js — run with: node misconception-detection.test.js
 * No dependencies. Exits nonzero if any case fails.
 *
 * Cases are built on the six locked targets:
 *   (3,2) (-4,3) (2,-5) (0,4) (-3,0) (-2,-3)
 */
var D = require('./misconception-detection.js');
var detect = D.detectMisconception;

var pass = 0, fail = 0;

function eq(desc, input, expected) {
  var got;
  try { got = detect.apply(null, input); }
  catch (e) { got = 'THREW:' + e.name; }
  if (got === expected) { pass++; }
  else { fail++; console.log('FAIL  ' + desc + '  | input ' + JSON.stringify(input) +
                             '  expected ' + expected + '  got ' + got); }
}

function throws(desc, input) {
  var threw = false;
  try { detect.apply(null, input); } catch (e) { threw = true; }
  if (threw) { pass++; }
  else { fail++; console.log('FAIL  ' + desc + '  | expected a throw, none thrown'); }
}

/* ---- correct plots -> null ---- */
eq('correct (3,2)',   [3, 2, 3, 2],   null);
eq('correct (0,4)',   [0, 4, 0, 4],   null);
eq('correct (-3,0)',  [-3, 0, -3, 0], null);
eq('correct (-2,-3)', [-2, -3, -2, -3], null);

/* ---- MC-01 Axis Transposition ---- */
eq('MC-01 (3,2)->(2,3)',      [3, 2, 2, 3],      'MC-01');
eq('MC-01 (-4,3)->(3,-4)',    [-4, 3, 3, -4],    'MC-01');
eq('MC-01 (2,-5)->(-5,2)',    [2, -5, -5, 2],    'MC-01');
eq('MC-01 (-2,-3)->(-3,-2)',  [-2, -3, -3, -2],  'MC-01');
eq('MC-01 over MC-07 (0,4)->(4,0)',  [0, 4, 4, 0],   'MC-01');
eq('MC-01 over MC-07 (-3,0)->(0,-3)', [-3, 0, 0, -3], 'MC-01');

/* ---- MC-07 Axis-as-Boundary ---- */
eq('MC-07 (0,4)->(1,4)',   [0, 4, 1, 4],    'MC-07');
eq('MC-07 (0,4)->(-2,4)',  [0, 4, -2, 4],   'MC-07');
eq('MC-07 (-3,0)->(-3,2)', [-3, 0, -3, 2],  'MC-07');
eq('MC-07 (-3,0)->(-3,-1)',[-3, 0, -3, -1], 'MC-07');

/* ---- MC-08 Incomplete Plot / Axis Collapse ---- */
eq('MC-08 (3,2)->(3,0)',    [3, 2, 3, 0],     'MC-08');
eq('MC-08 (3,2)->(0,2)',    [3, 2, 0, 2],     'MC-08');
eq('MC-08 (-4,3)->(-4,0)',  [-4, 3, -4, 0],   'MC-08');
eq('MC-08 (2,-5)->(0,-5)',  [2, -5, 0, -5],   'MC-08');
eq('MC-08 (-2,-3)->(-2,0)', [-2, -3, -2, 0],  'MC-08');
eq('MC-08 (3,2)->(0,0)',    [3, 2, 0, 0],     'MC-08');

/* ---- MC-06 Magnitude/Sign Conflation (both magnitudes exact, sign wrong) ---- */
eq('MC-06 (-4,3)->(4,3)',   [-4, 3, 4, 3],    'MC-06');
eq('MC-06 (2,-5)->(2,5)',   [2, -5, 2, 5],    'MC-06');
eq('MC-06 (-2,-3)->(2,3)',  [-2, -3, 2, 3],   'MC-06');  // also MC-02 signature -> MC-06 wins
eq('MC-06 (0,4)->(0,-4)',   [0, 4, 0, -4],    'MC-06');
eq('MC-06 (-3,0)->(3,0)',   [-3, 0, 3, 0],    'MC-06');

/* ---- MC-02 Sign/Directionality (one clean flip, other axis off-magnitude) ---- */
eq('MC-02 (3,2)->(-3,4)',   [3, 2, -3, 4],    'MC-02');
eq('MC-02 (-4,3)->(4,5)',   [-4, 3, 4, 5],    'MC-02');
eq('MC-02 (2,-5)->(4,5)',   [2, -5, 4, 5],    'MC-02');
eq('MC-02 (-2,-3)->(2,-5)', [-2, -3, 2, -5],  'MC-02');

/* ---- MC-03 Origin/Offset (+/-1, signs preserved) ---- */
eq('MC-03 (3,2)->(4,3)',    [3, 2, 4, 3],     'MC-03');
eq('MC-03 (3,2)->(4,2)',    [3, 2, 4, 2],     'MC-03');
eq('MC-03 (-4,3)->(-3,3)',  [-4, 3, -3, 3],   'MC-03');
eq('MC-03 (2,-5)->(2,-4)',  [2, -5, 2, -4],   'MC-03');
eq('MC-03 (0,4)->(0,5)',    [0, 4, 0, 5],     'MC-03');
eq('MC-03 (-3,0)->(-2,0)',  [-3, 0, -2, 0],   'MC-03');
eq('MC-03 (-2,-3)->(-1,-2)',[-2, -3, -1, -2], 'MC-03');

/* ---- fallback -> null (no rule substantiated) ---- */
eq('null (3,2)->(5,5)',     [3, 2, 5, 5],     null);
eq('null (3,2)->(-1,-1)',   [3, 2, -1, -1],   null);
eq('null (0,4)->(0,0)',     [0, 4, 0, 0],     null);  // not +/-1, not a mirror
eq('null (2,-5)->(-3,-1)',  [2, -5, -3, -1],  null);

/* ---- record-object form matches positional form ---- */
eq('record form -> MC-01', [{ targetX: 3, targetY: 2, plottedX: 2, plottedY: 3 }], 'MC-01');
eq('record form -> null',  [{ targetX: 3, targetY: 2, plottedX: 3, plottedY: 2 }], null);

/* ---- input validation ---- */
throws('missing arg throws',     [3, 2, 3]);
throws('non-integer throws',     [{ targetX: 3.5, targetY: 2, plottedX: 3, plottedY: 2 }]);
throws('non-number throws',      ['3', 2, 3, 2]);

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
