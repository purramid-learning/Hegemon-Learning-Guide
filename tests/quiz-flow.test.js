/*
 * Tests for the Lesson 1 Quiz state machine — run with: node quiz-flow.test.js
 * No dependencies. Exits nonzero if any case fails.
 *
 * Loads the REAL inline script out of src/plotting-grid.html (extracted at run
 * time, so the test never drifts from the shipped page) against a minimal DOM
 * stub, with the real misconception-detection module, a fixed TargetGenerator,
 * and a scripted HegemonBot. Then drives the flows the quiz must guarantee:
 *
 *   - two like misconceptions trigger the intervention; one does not
 *   - two unclassified errors trigger with a null code
 *   - unclassified errors do not count toward misconception groups
 *   - chat resolution ([NEXT_QUESTION]) displays and saves the correct answer,
 *     and it survives Back/Next navigation
 *   - Next restores an answered destination's display instead of wiping it
 *   - chat-resolved questions count as completed (no recycle; 10 of 10)
 *
 * Determinism: Math.random is pinned to 0 and TargetGenerator is stubbed, so
 * the question order is fixed:
 *   Q1 (1,2)  Q2 (-1,2)  Q3 (1,-2)  Q4 (0,1)  Q5 (1,0)  Q6 (-1,-2)
 *   Q7 TL name (correct II)   Q8 BL name (III)
 *   Q9 BR coord (IV)          Q10 TR coord (I)
 */
'use strict';

var fs = require('fs');
var path = require('path');

/* ---- extract the inline quiz script from the shipped page ---- */
var html = fs.readFileSync(path.join(__dirname, '..', 'src', 'plotting-grid.html'), 'utf8');
var match = html.match(/<script>\s*([\s\S]*?)<\/script>/);
if (!match) { console.log('FAIL  could not extract inline <script> from plotting-grid.html'); process.exit(1); }
var inlineScript = match[1];

/* ---- minimal DOM stub ---- */
function makeEl(tag) {
  var el = {
    tagName: tag, children: [], attrs: {}, style: {}, dataset: {},
    listeners: {}, disabled: false, _text: '', _html: '',
    classList: {
      _s: {},
      add: function () { for (var i = 0; i < arguments.length; i++) this._s[arguments[i]] = 1; },
      remove: function () { for (var i = 0; i < arguments.length; i++) delete this._s[arguments[i]]; },
      contains: function (c) { return !!this._s[c]; }
    },
    setAttribute: function (k, v) { el.attrs[k] = String(v); },
    getAttribute: function (k) { return el.attrs[k]; },
    appendChild: function (c) { el.children.push(c); return c; },
    addEventListener: function (t, fn) { (el.listeners[t] = el.listeners[t] || []).push(fn); },
    click: function () {
      (el.listeners.click || []).forEach(function (fn) {
        fn({ currentTarget: el, preventDefault: function () {} });
      });
    },
    focus: function () {}, remove: function () {},
    querySelector: function () { return null; }
  };
  Object.defineProperty(el, 'textContent', {
    get: function () { return el._text; }, set: function (v) { el._text = v; }
  });
  Object.defineProperty(el, 'innerHTML', {
    get: function () { return el._html; },
    set: function (v) { el._html = v; el.children = []; }
  });
  return el;
}

var byId = {};
['grid', 'prompt', 'hint', 'progress', 'status', 'submit', 'nav-back', 'nav-next',
 'task', 'done', 'done-count', 'restart', 'download-chat'].forEach(function (id) {
  byId[id] = makeEl('el#' + id);
});

var docListeners = {};
global.document = {
  getElementById: function (id) { return byId[id]; },
  createElement: function (t) { return makeEl(t); },
  createElementNS: function (ns, t) { return makeEl(t); },
  createTextNode: function (s) { return { text: s }; },
  addEventListener: function (t, fn) { (docListeners[t] = docListeners[t] || []).push(fn); },
  dispatchEvent: function (ev) { (docListeners[ev.type] || []).slice().forEach(function (fn) { fn(ev); }); },
  head: makeEl('head'), body: makeEl('body')
};
global.CustomEvent = function (type, opts) { this.type = type; this.detail = opts && opts.detail; };
global.window = global;
global.sessionStorage = { getItem: function () { return null; }, setItem: function () {} };

/* Silence the quiz page's own "[hegemon] ..." submission logging. */
var realLog = console.log;
console.log = function () {
  if (typeof arguments[0] === 'string' && arguments[0].indexOf('[hegemon]') === 0) return;
  realLog.apply(console, arguments);
};

/* ---- real detection module, deterministic targets, scripted bot ---- */
global.HegemonDetect = require(path.join(__dirname, '..', 'src', 'js', 'misconception-detection.js'));

var FIXED = [{x:1,y:2},{x:-1,y:2},{x:1,y:-2},{x:0,y:1},{x:1,y:0},{x:-1,y:-2}];
global.TargetGenerator = {
  generateTargets: function () { return FIXED.map(function (t) { return { x: t.x, y: t.y }; }); }
};
Math.random = function () { return 0; };

var botOpen = false, openCalls = [];
global.HegemonBot = {
  init: function () {}, reset: function () { botOpen = false; },
  isOpen: function () { return botOpen; },
  open: function (p) { openCalls.push(p); botOpen = true; },
  notifyCorrect: function () {}, notifyWrong: function () {},
  hasHistory: function () { return false; }, clearHistory: function () {},
  downloadChat: function () {}
};
global.HegemonMarkers = { snapshot: function () { return {}; } };

/* ---- load the real inline script (runs buildGrid + loadTarget) ---- */
new Function(inlineScript)();

/* ---- drivers ---- */
var svg = byId.grid;
function findMarker() {
  return svg.children.filter(function (c) { return c.attrs['class'] === 'marker'; })[0];
}
function findQuadLayer() {
  return svg.children.filter(function (c) { return c.attrs['class'] === 'quad-layer'; })[0];
}
function plotPoint(x, y) {
  var hit = svg.children.filter(function (c) {
    return c.attrs['class'] === 'hit' && c.dataset.x === x && c.dataset.y === y;
  })[0];
  if (!hit) throw new Error('no hit element at (' + x + ',' + y + ')');
  hit.click();
}
function clickQuadrant(key) {
  var qhit = findQuadLayer().children.filter(function (c) {
    return c.attrs['class'] === 'quad-hit' && c.attrs['aria-label'] === 'Quadrant ' + key;
  })[0];
  qhit.click();
}
/* quadrantLayer children repeat [selection rect, hit rect, label] per quadrant, in I II III IV order */
function selRect(key) {
  return findQuadLayer().children[{ I: 0, II: 3, III: 6, IV: 9 }[key]];
}
var FILL_ON  = 'rgba(47,109,240,0.6)';
var FILL_OFF = 'rgba(47,109,240,0)';
function submit() { byId.submit.click(); }
function back()   { byId['nav-back'].click(); }
function next()   { byId['nav-next'].click(); }
function chatResolve() { global.document.dispatchEvent(new CustomEvent('hegemon:next-question')); }
function restart()     { openCalls.length = 0; botOpen = false; byId.restart.click(); }
/* geometry mirror of the page: U=34, PAD=32, RANGE=5 → center C=202 */
function GX(x) { return String(202 + x * 34); }
function GY(y) { return String(202 - y * 34); }
function markerAt(x, y) {
  var m = findMarker();
  return m.style.opacity === 1 && m.attrs.cx === GX(x) && m.attrs.cy === GY(y);
}

var passed = 0, failed = 0;
function assert(desc, cond) {
  if (cond) { passed++; realLog('  PASS  ' + desc); }
  else      { failed++; realLog('  FAIL  ' + desc); }
}

/* ---- two like misconceptions trigger intervention ---- */
plotPoint(2, 1); submit();                    // Q1 (1,2) plotted swapped → MC-01, advances
assert('first MC-01 error does not trigger', openCalls.length === 0);
plotPoint(2, -1); submit();                   // Q2 (-1,2) plotted swapped → MC-01
assert('second MC-01 error triggers intervention', openCalls.length === 1);
assert('intervention opened with code MC-01', openCalls[0] && openCalls[0].misconceptionCode === 'MC-01');

/* ---- chat resolution displays the correct point; survives Back/Next ---- */
chatResolve();                                // resolved on Q2, target (-1,2)
assert('chat resolution places marker on target', markerAt(-1, 2));
next();                                       // → Q3 (fresh)
assert('next question starts with no marker', findMarker().style.opacity === 0);
assert('Next advanced to Q3', byId.progress.textContent === '3 of 10');
back();                                       // → Q2
assert('Back to chat-resolved question restores correct point', markerAt(-1, 2));

/* ---- Next restores an answered destination instead of wiping it ---- */
next();                                       // Q2 → Q3
plotPoint(1, -2); submit();                   // Q3 correct → auto-advance to Q4
assert('correct submit auto-advanced to Q4', byId.progress.textContent === '4 of 10');
back();                                       // Q4 → Q3
assert('Back to answered Q3 shows its point', markerAt(1, -2));
back();                                       // Q3 → Q2
next();                                       // Q2 → Q3 — the previously destructive path
assert('Next into answered Q3 still shows its point', markerAt(1, -2));
assert('Submit re-enabled with restored point', byId.submit.disabled === false);

/* ---- two unclassified errors trigger with null code ---- */
restart();
plotPoint(4, 5); submit();                    // Q1 (1,2): matches no rule
assert('first unclassified error does not trigger', openCalls.length === 0);
plotPoint(3, 5); submit();                    // Q2 (-1,2): matches no rule
assert('second unclassified error triggers intervention', openCalls.length === 1);
assert('unclassified intervention opened with null code', openCalls[0] && openCalls[0].misconceptionCode === null);

/* ---- unclassified errors do not count toward misconception groups ---- */
restart();
plotPoint(2, 1); submit();                    // Q1 → MC-01
plotPoint(3, 5); submit();                    // Q2 → unclassified
plotPoint(-1, 2); submit();                   // Q3 (1,-2) → MC-06
assert('three unlike errors do not trigger', openCalls.length === 0);

/* ---- quadrant chat resolution fills correct quadrant; survives Back/Next ---- */
restart();
FIXED.forEach(function (t) { plotPoint(t.x, t.y); submit(); });   // Q1–Q6 correct
assert('six correct plots reach Q7', byId.progress.textContent === '7 of 10');
clickQuadrant('I'); submit();                 // Q7 TL: wrong (correct II)
assert('first quadrant error does not trigger', openCalls.length === 0);
clickQuadrant('I'); submit();                 // Q8 BL: wrong (correct III)
assert('second quadrant error triggers intervention', openCalls.length === 1);
chatResolve();                                // resolved on Q8, correct III
assert('chat resolution fills the correct quadrant', selRect('III').attrs.fill === FILL_ON);
assert('stale wrong selection cleared', selRect('I').attrs.fill === FILL_OFF);
back();                                       // → Q7
assert('Back to Q7 restores its own selection', selRect('I').attrs.fill === FILL_ON);
next();                                       // → Q8
assert('Next into resolved Q8 restores its quadrant', selRect('III').attrs.fill === FILL_ON);

/* ---- chat-resolved questions count as completed: no recycle, 10 of 10 ---- */
next();                                       // Q8 → Q9 (BR, correct IV)
clickQuadrant('IV'); submit();                // correct → auto-advance to Q10 (TR, correct I)
clickQuadrant('I'); submit();                 // correct → all 10 submitted → finish()
assert('quiz finishes with no recycle of chat-resolved questions', byId.done.style.display === 'block');
assert('exactly 10 of 10 recorded', byId['done-count'].textContent === '10 of 10 questions recorded.');

console.log = realLog;
console.log('\n' + (failed === 0
  ? 'All ' + passed + ' tests passed.'
  : passed + ' passed, ' + failed + ' FAILED.'));

process.exit(failed > 0 ? 1 : 0);
