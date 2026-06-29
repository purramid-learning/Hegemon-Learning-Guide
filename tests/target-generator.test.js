'use strict';

const { generateTargets } = require('../src/js/target-generator');

let passed = 0;
let failed = 0;

function assert(label, condition) {
  if (condition) {
    console.log('  PASS  ' + label);
    passed++;
  } else {
    console.error('  FAIL  ' + label);
    failed++;
  }
}

function isInt(v) {
  return typeof v === 'number' && Number.isInteger(v);
}

function inRange(v, min, max) {
  return v >= min && v <= max;
}

// Run structural checks over N iterations to cover random variation.
const ITERATIONS = 500;

console.log('target-generator — structural invariants (' + ITERATIONS + ' iterations each)\n');

// --- Single-call checks ---
const sample = generateTargets();

assert('returns an array of length 6', Array.isArray(sample) && sample.length === 6);
assert('every element has x and y keys',
  sample.every(function (t) { return 'x' in t && 'y' in t; }));
assert('every coordinate is an integer',
  sample.every(function (t) { return isInt(t.x) && isInt(t.y); }));
assert('every coordinate is within [-5, 5]',
  sample.every(function (t) { return inRange(t.x, -5, 5) && inRange(t.y, -5, 5); }));

// --- Per-slot constraints across many iterations ---

var slot0_xNotY   = true;  // Q1: x ≠ y
var slot0_bothPos = true;  // Q1: x>0, y>0
var slot1_xNeg    = true;  // Q2: x<0
var slot1_yPos    = true;  // Q2: y>0
var slot2_xPos    = true;  // Q4: x>0
var slot2_yNeg    = true;  // Q4: y<0
var slot3_xZero   = true;  // Y-axis: x=0
var slot3_yNonZ   = true;  // Y-axis: y≠0
var slot4_yZero   = true;  // X-axis: y=0
var slot4_xNonZ   = true;  // X-axis: x≠0
var slot5_bothNeg = true;  // Q3: x<0, y<0

// Randomness checks: values should vary across iterations
var slot0_xValues = new Set();
var slot0_yValues = new Set();
var slot1_xValues = new Set();
var slot5_yValues = new Set();

for (var i = 0; i < ITERATIONS; i++) {
  var t = generateTargets();

  if (t[0].x === t[0].y)          slot0_xNotY   = false;
  if (t[0].x <= 0 || t[0].y <= 0) slot0_bothPos = false;
  if (t[1].x >= 0)                 slot1_xNeg    = false;
  if (t[1].y <= 0)                 slot1_yPos    = false;
  if (t[2].x <= 0)                 slot2_xPos    = false;
  if (t[2].y >= 0)                 slot2_yNeg    = false;
  if (t[3].x !== 0)                slot3_xZero   = false;
  if (t[3].y === 0)                slot3_yNonZ   = false;
  if (t[4].y !== 0)                slot4_yZero   = false;
  if (t[4].x === 0)                slot4_xNonZ   = false;
  if (t[5].x >= 0 || t[5].y >= 0) slot5_bothNeg = false;

  slot0_xValues.add(t[0].x);
  slot0_yValues.add(t[0].y);
  slot1_xValues.add(t[1].x);
  slot5_yValues.add(t[5].y);
}

console.log('\nSlot 0 — Q1 (both positive, x ≠ y)');
assert('x > 0 and y > 0 in every iteration',  slot0_bothPos);
assert('x ≠ y in every iteration',            slot0_xNotY);
assert('x varies across iterations',          slot0_xValues.size > 1);
assert('y varies across iterations',          slot0_yValues.size > 1);

console.log('\nSlot 1 — Q2 (negative x, positive y)');
assert('x < 0 in every iteration',   slot1_xNeg);
assert('y > 0 in every iteration',   slot1_yPos);
assert('x varies across iterations', slot1_xValues.size > 1);

console.log('\nSlot 2 — Q4 (positive x, negative y)');
assert('x > 0 in every iteration',   slot2_xPos);
assert('y < 0 in every iteration',   slot2_yNeg);

console.log('\nSlot 3 — Y-axis (x = 0, y ≠ 0)');
assert('x = 0 in every iteration',   slot3_xZero);
assert('y ≠ 0 in every iteration',   slot3_yNonZ);

console.log('\nSlot 4 — X-axis (y = 0, x ≠ 0)');
assert('y = 0 in every iteration',   slot4_yZero);
assert('x ≠ 0 in every iteration',   slot4_xNonZ);

console.log('\nSlot 5 — Q3 (both negative)');
assert('x < 0 and y < 0 in every iteration', slot5_bothNeg);
assert('y varies across iterations',         slot5_yValues.size > 1);

console.log('\n' + (failed === 0
  ? 'All ' + passed + ' tests passed.'
  : passed + ' passed, ' + failed + ' FAILED.'));

process.exit(failed > 0 ? 1 : 0);
