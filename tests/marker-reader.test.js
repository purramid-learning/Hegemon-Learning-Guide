/*
  marker-reader.test.js — dependency-free Node harness for the PURE helpers.
  Run: node marker-reader.test.js

  Scope: splitList / parseMarker / buildContext only. The scroll-tracking,
  anchoring, and sessionStorage behavior are DOM-bound and are verified with
  Playwright, not here.
*/
var M = require("./marker-reader.js");

var pass = 0, fail = 0;
function eq(actual, expected, name) {
  var a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a === e) { pass++; }
  else { fail++; console.log("FAIL " + name + "\n  expected " + e + "\n  got      " + a); }
}

/* ---- splitList ---- */
eq(M.splitList(""), [], "splitList empty string");
eq(M.splitList(null), [], "splitList null");
eq(M.splitList(undefined), [], "splitList undefined");
eq(M.splitList("number-line"), ["number-line"], "splitList single");
eq(M.splitList("x-axis, y-axis"), ["x-axis", "y-axis"], "splitList lesson spacing");
eq(M.splitList(" a ,b ,, c "), ["a", "b", "c"], "splitList trims + drops empties");
eq(M.splitList("MC-04a, MC-04b, MC-04c"), ["MC-04a", "MC-04b", "MC-04c"], "splitList compound codes");

/* ---- parseMarker (raw plain-object form, as in the lesson DOM) ---- */
eq(M.parseMarker({ topic: "number-line", prereqs: "", likelyMisconceptions: "MC-03" }),
   { topic: "number-line", prereqs: [], likelyMisconceptions: ["MC-03"] },
   "parseMarker no prereqs");
eq(M.parseMarker({ topic: "origin", prereqs: "x-axis, y-axis", likelyMisconceptions: "MC-03" }),
   { topic: "origin", prereqs: ["x-axis", "y-axis"], likelyMisconceptions: ["MC-03"] },
   "parseMarker origin");
eq(M.parseMarker({ topic: "coordinate-plane", prereqs: "number-line", likelyMisconceptions: "" }),
   { topic: "coordinate-plane", prereqs: ["number-line"], likelyMisconceptions: [] },
   "parseMarker no misconceptions");
eq(M.parseMarker({ topic: "quadrants", prereqs: "x-axis, y-axis, origin", likelyMisconceptions: "MC-04a, MC-04b, MC-04c" }),
   { topic: "quadrants", prereqs: ["x-axis", "y-axis", "origin"], likelyMisconceptions: ["MC-04a", "MC-04b", "MC-04c"] },
   "parseMarker compound misconceptions");
eq(M.parseMarker({}), { topic: "", prereqs: [], likelyMisconceptions: [] }, "parseMarker empty object");

/* ---- buildContext ---- */
var recs = [
  { topic: "number-line", prereqs: [], likelyMisconceptions: ["MC-03"] },
  { topic: "origin", prereqs: ["x-axis", "y-axis"], likelyMisconceptions: ["MC-03"] },
  { topic: "ordered-pair", prereqs: ["x-axis", "y-axis", "origin"], likelyMisconceptions: ["MC-01"] },
  { topic: "negative-x", prereqs: ["number-line"], likelyMisconceptions: ["MC-02", "MC-06"] }
];
var ctx = M.buildContext(recs, { source: "live", page: "/lesson.html", capturedAt: "T" });

eq(ctx.source, "live", "buildContext source passthrough");
eq(ctx.page, "/lesson.html", "buildContext page passthrough");
eq(ctx.markers.length, 4, "buildContext keeps all markers");
eq(ctx.markers.map(function (m) { return m.topic; }),
   ["number-line", "origin", "ordered-pair", "negative-x"], "buildContext preserves order");
eq(ctx.topicsSeen, ["number-line", "origin", "ordered-pair", "negative-x"], "buildContext topicsSeen");
eq(ctx.likelyMisconceptionUnion, ["MC-01", "MC-02", "MC-03", "MC-06"], "buildContext union sorted + deduped (MC-03 x2)");
eq(ctx.prereqEdges, [
  { topic: "number-line", requires: [] },
  { topic: "origin", requires: ["x-axis", "y-axis"] },
  { topic: "ordered-pair", requires: ["x-axis", "y-axis", "origin"] },
  { topic: "negative-x", requires: ["number-line"] }
], "buildContext prereqEdges");

/* empty + guard cases */
var empty = M.buildContext([], {});
eq(empty.source, "empty", "buildContext empty -> source empty");
eq(empty.markers, [], "buildContext empty markers");
eq(empty.topicsSeen, [], "buildContext empty topicsSeen");
eq(empty.likelyMisconceptionUnion, [], "buildContext empty union");
eq(M.buildContext(null, {}).markers, [], "buildContext null records safe");
eq(M.buildContext([{ topic: "", likelyMisconceptions: ["X"] }], {}).markers, [], "buildContext drops topicless record");

/* ---- resolveFocus (focus target for bolded-term launch) ---- */
eq(M.resolveFocus(null), null, "resolveFocus null");
eq(M.resolveFocus(""), null, "resolveFocus empty");
eq(M.resolveFocus("number-line"), "number-line", "resolveFocus passes topic through");
eq(M.resolveFocus("number line"), "number-line", "resolveFocus display term -> topic");
eq(M.resolveFocus("Ordered Pair"), "ordered-pair", "resolveFocus case-insensitive term");
eq(M.resolveFocus("coordinates"), "ordered-pair", "resolveFocus alias coordinates -> ordered-pair");
eq(M.resolveFocus("axes"), "coordinate-plane", "resolveFocus alias axes -> coordinate-plane");
eq(M.resolveFocus("x-axis"), "x-axis", "resolveFocus x-axis");
eq(M.resolveFocus("Some New Concept"), "some-new-concept", "resolveFocus coerces unknown to topic form");
eq(M.resolveFocus({ nodeType: 1, getAttribute: function (k) { return k === "data-focus-topic" ? "origin" : null; }, textContent: "the origin" }),
   "origin", "resolveFocus DOM element prefers data-focus-topic");
eq(M.resolveFocus({ nodeType: 1, getAttribute: function () { return null; }, textContent: "number line" }),
   "number-line", "resolveFocus DOM element falls back to text");

console.log("\n" + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
