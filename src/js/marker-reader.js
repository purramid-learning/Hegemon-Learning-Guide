/*
  Hegemon Learning Guide · marker-reader.js   (dev-order step 5)

  Reads the invisible hg-marker spans the student has scrolled past and packages
  topic / prereq / likely-misconception metadata as context for the bot entry.

  Works on either entry page — the bot can open on the lesson page OR the
  plotting page, at the user's discretion:
    · Lesson page   — markers are in the DOM. track() records each one as the
      student scrolls past it, persisting to sessionStorage. read() returns the
      live state.
    · Plotting page — no markers in the DOM. read() falls back to the snapshot
      that track() persisted during the lesson (same-origin, same tab).
  Activation focus: read({ focus }) accepts the concept the student pointed at
  — e.g. a tapped bolded term — and surfaces it as ctx.focus so the bot can
  lead its narrowing there. focus also sets the "encountered" cutoff (tapping a
  term implies reaching it); pass options.upTo to set that cutoff separately.
  With no focus/upTo, the encountered set is the live scroll depth as before.

  Boundaries (per locked architecture):
    · Context only — no detection, no scoring, no Claude call. Detection lives
      in misconception-detection.js; this module never classifies.
    · The pure helpers (splitList, parseMarker, buildContext) are DOM-free and
      exported for unit tests. The scroll + persistence glue is thin and is
      verified with Playwright, not the Node harness.

  "Scrolled past": hg-marker is display:none, so it has no geometry to measure.
  Each marker is anchored to its nearest visible sibling (the <p>/<figure> it
  sits beside), falling back to its containing section. A marker counts as seen
  once that anchor's top has risen above `threshold` * viewport-height
  (default 1.0 = the anchor has appeared from the bottom edge). "Seen" is
  monotonic — scrolling back up never un-sees a marker.
*/
(function (root, factory) {
  "use strict";
  var api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.HegemonMarkers = api;
})(typeof window !== "undefined" ? window : this, function () {
  "use strict";

  var STORAGE_KEY = "hegemon:markers:v1";
  var SEEN_VIEWPORT_FRACTION = 1.0;

  /* ---------- pure helpers (DOM-free, unit-tested) ---------- */

  // "a, b ,, c" -> ["a","b","c"]; "" / null -> []
  function splitList(s) {
    if (!s) return [];
    return String(s).split(",").map(function (t) { return t.trim(); }).filter(Boolean);
  }

  // Parse a RAW source into a final record. `src` is either a DOM element
  // (reads data-* attributes) or a plain object of raw strings
  // ({ topic, prereqs, likelyMisconceptions }) for tests. Do NOT pass an
  // already-parsed record here — its array fields would be re-stringified.
  function parseMarker(src) {
    function raw(dataName, plainName) {
      if (src && typeof src.getAttribute === "function") return src.getAttribute(dataName);
      if (src && plainName in src) return src[plainName];
      return null;
    }
    return {
      topic: (raw("data-topic", "topic") || "").trim(),
      prereqs: splitList(raw("data-prereqs", "prereqs")),
      likelyMisconceptions: splitList(raw("data-likely-misconceptions", "likelyMisconceptions"))
    };
  }

  // Build the context package from already-parsed records, in display order.
  function buildContext(records, meta) {
    meta = meta || {};
    var markers = [], topics = [], union = {};
    (records || []).forEach(function (r) {
      if (!r || !r.topic) return;
      markers.push(r);
      if (topics.indexOf(r.topic) === -1) topics.push(r.topic);
      (r.likelyMisconceptions || []).forEach(function (c) { union[c] = true; });
    });
    return {
      source: markers.length === 0 ? "empty" : (meta.source || "unknown"),
      capturedAt: meta.capturedAt || new Date().toISOString(),
      page: meta.page || null,
      markers: markers,
      topicsSeen: topics,
      likelyMisconceptionUnion: Object.keys(union).sort(),
      prereqEdges: markers.map(function (r) { return { topic: r.topic, requires: r.prereqs || [] }; })
    };
  }

  /* ---------- DOM + scroll glue ---------- */

  function hasDom() { return typeof document !== "undefined" && !!document.querySelectorAll; }

  function allMarkerEls() {
    if (!hasDom()) return [];
    return Array.prototype.slice.call(document.querySelectorAll(".hg-marker"));
  }

  function isVisible(el) {
    if (!el || el.nodeType !== 1) return false;
    if (el.offsetParent !== null) return true;            // cheap path
    var r = el.getBoundingClientRect();
    return r.width > 0 || r.height > 0;
  }

  // hg-marker is display:none -> anchor on the nearest visible sibling, else
  // the containing section.
  function anchorFor(el) {
    var n = el.nextElementSibling;
    while (n) { if (isVisible(n)) return n; n = n.nextElementSibling; }
    var p = el.previousElementSibling;
    while (p) { if (isVisible(p)) return p; p = p.previousElementSibling; }
    return (el.closest && el.closest("section, .lesson, main, body")) || document.body;
  }

  function viewportH() {
    return window.innerHeight || (document.documentElement && document.documentElement.clientHeight) || 0;
  }

  function isScrolledPast(el, fraction) {
    var a = anchorFor(el);
    if (!a) return false;
    return a.getBoundingClientRect().top < viewportH() * fraction;
  }

  /* ---------- persistence ---------- */

  function loadSnapshot() {
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return { version: 1, seen: {} };
      var obj = JSON.parse(raw);
      return (obj && obj.seen) ? obj : { version: 1, seen: {} };
    } catch (e) { return { version: 1, seen: {} }; }
  }

  function saveSnapshot(snap) {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(snap)); } catch (e) {}
  }

  /* ---------- public: track() ---------- */
  // Call once on the lesson page. Records markers as the student scrolls past,
  // persisting a monotonic snapshot. Returns a stop() function. No-op where
  // there are no markers (e.g. the plotting page).
  function track(options) {
    options = options || {};
    var fraction = options.threshold == null ? SEEN_VIEWPORT_FRACTION : options.threshold;
    var els = allMarkerEls();
    if (!els.length) return function () {};

    var order = {};
    els.forEach(function (el, i) { order[el.getAttribute("data-topic")] = i; });

    var snap = loadSnapshot();
    var scheduled = false;

    function sweep() {
      scheduled = false;
      var changed = false;
      els.forEach(function (el) {
        var topic = el.getAttribute("data-topic");
        if (!topic || snap.seen[topic]) return;     // monotonic
        if (isScrolledPast(el, fraction)) {
          var rec = parseMarker(el);
          rec.order = order[topic];
          snap.seen[topic] = rec;
          changed = true;
        }
      });
      if (changed) { snap.updatedAt = new Date().toISOString(); saveSnapshot(snap); }
    }
    function onScroll() {
      if (scheduled) return;
      scheduled = true;
      (window.requestAnimationFrame || function (f) { setTimeout(f, 16); })(sweep);
    }

    sweep(); // capture whatever is already in view
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return function stop() {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }

  /* ---------- focus resolution (for bolded-term launch buttons) ---------- */
  // The robust path is to annotate each launchable term at authoring time with
  // data-focus-topic, so activation passes a topic straight through. This text
  // table is only a fallback for terms launched by their display string. Some
  // bolded terms have no 1:1 topic (e.g. "axes", "coordinates") — map those to
  // the closest concept marker. Extend as launch points are added.
  var TERM_TO_TOPIC = {
    "number line": "number-line",
    "coordinate plane": "coordinate-plane",
    "x-axis": "x-axis",
    "y-axis": "y-axis",
    "axes": "coordinate-plane",
    "origin": "origin",
    "quadrant": "quadrants",
    "quadrants": "quadrants",
    "ordered pair": "ordered-pair",
    "coordinates": "ordered-pair"
  };

  function normalizeTerm(s) { return String(s).toLowerCase().trim().replace(/\s+/g, " "); }

  // Resolve a focus input to a topic string (or null). Accepts: a topic
  // ("number-line"), a display term ("number line"), or a DOM element (prefers
  // its data-focus-topic, falls back to its text). Returns a best-effort topic;
  // read() validates it against the actual markers and ignores no-match.
  function resolveFocus(input) {
    if (!input) return null;
    if (typeof input === "object" && input.nodeType === 1) {
      return resolveFocus(input.getAttribute("data-focus-topic") || input.textContent);
    }
    var s = normalizeTerm(input);
    if (!s) return null;
    if (TERM_TO_TOPIC[s]) return TERM_TO_TOPIC[s];   // display term
    return s.replace(/\s+/g, "-");                   // assume/coerce to a topic
  }

  /* ---------- public: read() ---------- */
  // Call at bot activation, on either page.
  //   options.focus  — topic | display term | DOM element. The concept the
  //                     student pointed at (e.g. a tapped bolded term). Surfaced
  //                     as ctx.focus and, unless options.upTo is set, also used
  //                     as the cutoff (tapping a term implies reaching it).
  //   options.upTo   — topic | term. Bounds "encountered" to every marker at or
  //                     before this one in lesson order, independent of scroll.
  //   options.threshold — viewport fraction for live scroll detection (no cutoff).
  // Live markers win when present (lesson page); otherwise the persisted
  // snapshot is used (plotting page).
  function read(options) {
    options = options || {};
    var fraction = options.threshold == null ? SEEN_VIEWPORT_FRACTION : options.threshold;
    var focusTopic = resolveFocus(options.focus);
    var upToTopic = resolveFocus(options.upTo) || focusTopic;  // focus implies its own cutoff

    var snap = loadSnapshot();
    var els = allMarkerEls();
    var domPresent = els.length > 0;

    // candidate set, in lesson order, from live DOM if present else snapshot
    var candidates;
    if (domPresent) {
      candidates = els.map(function (el, i) {
        var rec = parseMarker(el); rec.order = i; rec.el = el; return rec;
      });
    } else {
      candidates = Object.keys(snap.seen).map(function (t) {
        var r = snap.seen[t];
        return { topic: r.topic, prereqs: r.prereqs || [], likelyMisconceptions: r.likelyMisconceptions || [],
                 order: (r.order == null ? 9999 : r.order) };
      }).sort(function (a, b) { return a.order - b.order; });
    }

    // locate the cutoff, if any
    var cutoffIdx = -1;
    if (upToTopic) {
      for (var k = 0; k < candidates.length; k++) {
        if (candidates[k].topic === upToTopic) { cutoffIdx = k; break; }
      }
    }

    var encountered, source;
    if (cutoffIdx >= 0) {
      // explicit cutoff: everything up to & including upTo, regardless of scroll
      encountered = candidates.slice(0, cutoffIdx + 1);
      source = "focus";
      if (domPresent) {                       // persist so a later plotting read() agrees
        var changed = false;
        encountered.forEach(function (r) {
          if (!snap.seen[r.topic]) {
            snap.seen[r.topic] = { topic: r.topic, prereqs: r.prereqs, likelyMisconceptions: r.likelyMisconceptions, order: r.order };
            changed = true;
          }
        });
        if (changed) { snap.updatedAt = new Date().toISOString(); saveSnapshot(snap); }
      }
    } else if (domPresent) {
      // no cutoff, lesson page: live scroll merged with persisted
      var bag = {};
      Object.keys(snap.seen).forEach(function (t) {
        var r = snap.seen[t];
        bag[t] = { topic: r.topic, prereqs: r.prereqs || [], likelyMisconceptions: r.likelyMisconceptions || [], order: (r.order == null ? 9999 : r.order) };
      });
      var liveChanged = false;
      candidates.forEach(function (r) {
        if (!isScrolledPast(r.el, fraction)) return;
        bag[r.topic] = { topic: r.topic, prereqs: r.prereqs, likelyMisconceptions: r.likelyMisconceptions, order: r.order };
        if (!snap.seen[r.topic]) { snap.seen[r.topic] = bag[r.topic]; liveChanged = true; }
      });
      if (liveChanged) { snap.updatedAt = new Date().toISOString(); saveSnapshot(snap); }
      encountered = Object.keys(bag).map(function (t) { return bag[t]; })
        .sort(function (a, b) { return a.order - b.order; });
      source = "live";
    } else {
      // no cutoff, plotting page: persisted set as-is
      encountered = candidates;
      source = "persisted";
    }

    // strip internal el refs to final records
    encountered = encountered.map(function (r) {
      return { topic: r.topic, prereqs: r.prereqs, likelyMisconceptions: r.likelyMisconceptions };
    });

    var focusRec = null;
    if (focusTopic) {
      for (var m = 0; m < encountered.length; m++) {
        if (encountered[m].topic === focusTopic) { focusRec = encountered[m]; break; }
      }
    }

    var ctx = buildContext(encountered, {
      source: encountered.length === 0 ? "empty" : source,
      page: (typeof location !== "undefined") ? location.pathname : null
    });
    ctx.focus = focusRec;     // the concept the student pointed at, or null
    return ctx;
  }

  /* ---------- public: snapshot() / reset() ---------- */
  function snapshot() { return loadSnapshot(); }
  function reset() { try { sessionStorage.removeItem(STORAGE_KEY); } catch (e) {} }

  return {
    track: track,
    read: read,
    snapshot: snapshot,
    reset: reset,
    // exposed for tests / wiring
    parseMarker: parseMarker,
    buildContext: buildContext,
    splitList: splitList,
    resolveFocus: resolveFocus,
    TERM_TO_TOPIC: TERM_TO_TOPIC,
    STORAGE_KEY: STORAGE_KEY
  };
});
