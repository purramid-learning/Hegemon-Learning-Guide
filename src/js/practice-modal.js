/*
 * Hegemon Learning Guide — Practice Modal
 * -----------------------------------------
 * Pop-up practice session launched after a Quick Check incorrect answer.
 *
 * Question types:
 *   'quadrant' — click a quadrant region to identify where a shown point lives.
 *   'chat'     — type the ordered pair of a shown point in a text field.
 *   'plot'     — click the grid to plot a point with one zero coordinate.
 *
 * Hegemon threshold: 2 wrong answers (same group, same as main quiz).
 * Consecutive-correct threshold: 2 right in a row closes the modal.
 * Wrong answer resets the consecutive-correct streak; correct answer does NOT
 * reset the wrong count (matches main quiz semantics).
 * [NEXT_QUESTION] from Hegemon closes the modal (via 'hegemon:next-question').
 * Close button always available.
 */
(function (root, factory) {
  'use strict';
  if (typeof module !== 'undefined' && module.exports) { module.exports = factory(); }
  else { root.PracticeModal = factory(); }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ---- SVG geometry ---- */
  var NS   = 'http://www.w3.org/2000/svg';
  var RANGE = 4, U = 32, PAD = 28;
  var SIZE  = RANGE * 2 * U + PAD * 2;   // 312
  function gx(x) { return PAD + (RANGE + x) * U; }
  function gy(y) { return PAD + (RANGE - y) * U; }
  function fmtN(n) { return String(n).replace('-', '−'); }
  function mkSvg(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    return e;
  }

  /* ---- MC-04 detection (inline mirror of misconception-detection.js) ---- */
  var MC04 = {
    correct:  { TR:'I',  TL:'II', BL:'III', BR:'IV'  },
    'MC-04a': { TR:'IV', TL:'I',  BL:'II',  BR:'III' },
    'MC-04b': { TR:'I',  TL:'IV', BL:'III', BR:'II'  },
    'MC-04c': { TR:'II', TL:'I',  BL:'IV',  BR:'III' },
    'MC-04d': { TR:'II', TL:'I',  BL:'III', BR:'IV'  }
  };
  var MC04_CODES = ['MC-04a','MC-04b','MC-04c','MC-04d'];
  function detectQ4(corner, named) {
    if (named === MC04.correct[corner]) return null;
    for (var i = 0; i < MC04_CODES.length; i++) {
      if (named === MC04[MC04_CODES[i]][corner]) return MC04_CODES[i];
    }
    return null;
  }
  function detectCoord(tx, ty, px, py) {
    if (typeof HegemonDetect !== 'undefined') {
      return HegemonDetect.detectMisconception({ targetX:tx, targetY:ty, plottedX:px, plottedY:py });
    }
    return null;
  }

  /* ---- random helpers ---- */
  function rand(lo, hi) { return Math.floor(Math.random() * (hi - lo + 1)) + lo; }
  var CORNERS = ['TR','TL','BL','BR'];
  function cornerXY(corner) {
    var sx = (corner === 'TL' || corner === 'BL') ? -1 : 1;
    var sy = (corner === 'BL' || corner === 'BR') ? -1 : 1;
    return { x: sx * rand(1, 3), y: sy * rand(1, 3) };
  }

  /* ---- question generators ---- */
  function genQ() {
    var corner = CORNERS[rand(0, 3)];
    var p = cornerXY(corner);
    var format = Math.random() < 0.5 ? 'coord' : 'name';
    return { type:'quadrant', corner:corner, x:p.x, y:p.y, correct:MC04.correct[corner], format:format };
  }
  function genC() {
    var corner = CORNERS[rand(0, 3)];
    var p = cornerXY(corner);
    return { type:'chat', x:p.x, y:p.y };
  }
  function genP() {
    return Math.random() < 0.5
      ? { type:'plot', x:0, y:(Math.random()<0.5?1:-1)*rand(1,3) }
      : { type:'plot', x:(Math.random()<0.5?1:-1)*rand(1,3), y:0 };
  }

  /* ---- SVG grid builder ---- */
  var qSelRects = {};   // { 'I': rectEl, ... } for selection fill
  function buildGrid(svg, opts) {
    qSelRects = {};
    svg.setAttribute('viewBox', '0 0 ' + SIZE + ' ' + SIZE);
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', 'auto');
    svg.style.display = 'block';

    for (var i = -RANGE; i <= RANGE; i++) {
      if (i !== 0) {
        svg.appendChild(mkSvg('line', { x1:gx(i), y1:gy(-RANGE), x2:gx(i), y2:gy(RANGE),
          stroke:'#dbe6f1', 'stroke-width':1 }));
        svg.appendChild(mkSvg('line', { x1:gx(-RANGE), y1:gy(i), x2:gx(RANGE), y2:gy(i),
          stroke:'#dbe6f1', 'stroke-width':1 }));
      }
    }

    /* Quadrant hit areas — only for quadrant type */
    if (opts && opts.quadrantHits) {
      var HALF = RANGE * U;
      var qdefs = [
        { key:'I',   rx:gx(0),      ry:gy(RANGE), rw:HALF, rh:HALF },
        { key:'II',  rx:gx(-RANGE), ry:gy(RANGE), rw:HALF, rh:HALF },
        { key:'III', rx:gx(-RANGE), ry:gy(0),     rw:HALF, rh:HALF },
        { key:'IV',  rx:gx(0),      ry:gy(0),     rw:HALF, rh:HALF }
      ];
      qdefs.forEach(function (q) {
        var sel = mkSvg('rect', { x:q.rx, y:q.ry, width:q.rw, height:q.rh,
          fill:'rgba(47,109,240,0)', 'pointer-events':'none' });
        svg.appendChild(sel);
        qSelRects[q.key] = sel;

        var hit = mkSvg('rect', { x:q.rx, y:q.ry, width:q.rw, height:q.rh,
          fill:'transparent', cursor:'pointer', tabindex:'0',
          role:'button', 'aria-label':'Quadrant ' + q.key });
        (function (key) {
          hit.addEventListener('click', function () { pickQ(key); });
          hit.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pickQ(key); }
          });
        }(q.key));
        svg.appendChild(hit);
      });
    }

    /* Axes */
    svg.appendChild(mkSvg('line', { x1:gx(-RANGE), y1:gy(0), x2:gx(RANGE), y2:gy(0),
      stroke:'#16263d', 'stroke-width':2 }));
    svg.appendChild(mkSvg('line', { x1:gx(0), y1:gy(RANGE), x2:gx(0), y2:gy(-RANGE),
      stroke:'#16263d', 'stroke-width':2 }));

    /* Tick labels */
    for (var j = -RANGE; j <= RANGE; j++) {
      if (j === 0) continue;
      var tx = mkSvg('text', { x:gx(j), y:gy(0)+14, 'text-anchor':'middle',
        fill:'#54647a', 'font-size':10, 'font-family':'Space Mono,monospace', 'pointer-events':'none' });
      tx.textContent = fmtN(j);
      svg.appendChild(tx);
      var ty = mkSvg('text', { x:gx(0)-8, y:gy(j)+4, 'text-anchor':'end',
        fill:'#54647a', 'font-size':10, 'font-family':'Space Mono,monospace', 'pointer-events':'none' });
      ty.textContent = fmtN(j);
      svg.appendChild(ty);
    }

    /* Roman numeral quadrant labels — omitted when opts.hideLabels is true */
    if (opts && opts.quadrantHits && !opts.hideLabels) {
      [['I',gx(2.2),gy(2.2)],['II',gx(-2.2),gy(2.2)],['III',gx(-2.2),gy(-2.2)],['IV',gx(2.2),gy(-2.2)]].forEach(function (ql) {
        var t = mkSvg('text', { x:ql[1], y:ql[2], 'text-anchor':'middle', 'dominant-baseline':'middle',
          fill:'rgba(169,186,203,0.65)', 'font-size':22, 'font-weight':700,
          'font-family':'Space Grotesk,system-ui,sans-serif', 'pointer-events':'none' });
        t.textContent = ql[0];
        svg.appendChild(t);
      });
    }
  }

  function addDot(svg, x, y, color) {
    var c = mkSvg('circle', { cx:gx(x), cy:gy(y), r:6, fill:color||'#e2603a', 'pointer-events':'none' });
    svg.appendChild(c);
    return c;
  }
  function addLabel(svg, x, y, text) {
    var t = mkSvg('text', { x:gx(x)+10, y:gy(y)-6, fill:'#16263d', 'font-size':13,
      'font-family':'Space Grotesk,system-ui,sans-serif', 'font-weight':700, 'pointer-events':'none' });
    t.textContent = text;
    svg.appendChild(t);
  }

  /* ---- quadrant selection ---- */
  var selectedQ = null;
  function pickQ(key) {
    Object.keys(qSelRects).forEach(function (k) {
      qSelRects[k].setAttribute('fill', 'rgba(47,109,240,0)');
    });
    if (selectedQ === key) {
      selectedQ = null;
      submitBtn.disabled = true;
    } else {
      qSelRects[key].setAttribute('fill', 'rgba(47,109,240,0.6)');
      selectedQ = key;
      submitBtn.disabled = false;
    }
  }

  /* ---- plot interaction ---- */
  var placedPt = null;
  var plotDot  = null;
  function handlePlotClick(e, svgEl, q) {
    var rect = svgEl.getBoundingClientRect();
    var svgX = (e.clientX - rect.left) / rect.width  * SIZE;
    var svgY = (e.clientY - rect.top)  / rect.height * SIZE;
    var gX = Math.round((svgX - PAD) / U - RANGE);
    var gY = Math.round(RANGE - (svgY - PAD) / U);
    if (gX < -RANGE || gX > RANGE || gY < -RANGE || gY > RANGE) return;
    if (plotDot) plotDot.parentNode && plotDot.parentNode.removeChild(plotDot);
    plotDot = addDot(svgEl, gX, gY, '#2f6df0');
    placedPt = { x:gX, y:gY };
    submitBtn.disabled = false;
  }

  /* ---- DOM refs ---- */
  var overlayEl, bodyEl, feedbackEl, submitBtn;
  var inited = false, isOpen = false, qType = null, curQ = null;

  /* ---- state ---- */
  var correctStreak = 0;
  var mcErrorCount  = {};
  var mcTriggered   = {};
  var mcCounted     = {};   // {questionIdx: true} — one contribution per question
  var qIdx          = 0;

  /* ---- question rendering ---- */
  function clearBody() {
    bodyEl.innerHTML = '';
    selectedQ = null; placedPt = null; plotDot = null;
    feedbackEl.textContent = '';
    feedbackEl.className = 'pm-feedback';
    submitBtn.disabled = true;
  }

  function renderQuadrant(q) {
    var p = document.createElement('p');
    p.className = 'pm-prompt';
    if (q.format === 'name') {
      p.textContent = 'Click Quadrant ' + q.correct + '.';
    } else {
      p.textContent = 'In which quadrant does (' + fmtN(q.x) + ', ' + fmtN(q.y) + ') appear?';
    }
    bodyEl.appendChild(p);
    var s = document.createElementNS(NS, 'svg');
    s.className = 'pm-grid';
    buildGrid(s, { quadrantHits:true, hideLabels: q.format === 'name' });
    bodyEl.appendChild(s);
  }

  function renderChat(q) {
    var p = document.createElement('p');
    p.className = 'pm-prompt';
    p.textContent = 'What are the coordinates of point A? Type your answer below.';
    bodyEl.appendChild(p);
    var s = document.createElementNS(NS, 'svg');
    s.className = 'pm-grid';
    buildGrid(s, {});
    addDot(s, q.x, q.y);
    addLabel(s, q.x, q.y, 'A');
    bodyEl.appendChild(s);
    var wrap = document.createElement('div');
    wrap.className = 'pm-input-wrap';
    var inp = document.createElement('input');
    inp.type = 'text';
    inp.className = 'pm-chat-input';
    inp.placeholder = '(x, y)';
    inp.setAttribute('aria-label', 'Enter ordered pair');
    inp.addEventListener('input', function () {
      submitBtn.disabled = inp.value.trim().length === 0;
    });
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !submitBtn.disabled) submitBtn.click();
    });
    wrap.appendChild(inp);
    bodyEl.appendChild(wrap);
    bodyEl._chatInput = inp;
    setTimeout(function () { inp.focus(); }, 60);
  }

  function renderPlot(q) {
    var label = 'Plot the point (' + fmtN(q.x) + ', ' + fmtN(q.y) + ')';
    var p = document.createElement('p');
    p.className = 'pm-prompt';
    p.textContent = label;
    bodyEl.appendChild(p);
    var s = document.createElementNS(NS, 'svg');
    s.className = 'pm-grid pm-grid--clickable';
    buildGrid(s, {});
    s.addEventListener('click', function (e) { handlePlotClick(e, s, q); });
    bodyEl.appendChild(s);
  }

  function nextQ() {
    qIdx++;
    clearBody();
    curQ = qType === 'quadrant' ? genQ() : qType === 'chat' ? genC() : genP();
    if (curQ.type === 'quadrant') renderQuadrant(curQ);
    else if (curQ.type === 'chat') renderChat(curQ);
    else renderPlot(curQ);
  }

  /* ---- submission ---- */
  function parseTyped(text) {
    var clean = text.replace(/[()]/g,'').replace(/−/g,'-').trim();
    var parts = clean.split(/[,\s]+/);
    if (parts.length !== 2) return null;
    var x = parseInt(parts[0], 10), y = parseInt(parts[1], 10);
    return (isNaN(x) || isNaN(y)) ? null : { x:x, y:y };
  }

  function handleSubmit() {
    if (!curQ) return;
    if (curQ.type === 'quadrant') {
      if (!selectedQ) return;
      var ok  = (selectedQ === curQ.correct);
      var cod = ok ? null : detectQ4(curQ.corner, selectedQ);
      process(ok, cod, { targetX:curQ.x, targetY:curQ.y }, 'quadrant');
    } else if (curQ.type === 'chat') {
      var parsed = parseTyped(bodyEl._chatInput ? bodyEl._chatInput.value : '');
      if (!parsed) { showFb('Please type the ordered pair like (x, y).', 'no'); return; }
      var chatOk = (parsed.x === curQ.x && parsed.y === curQ.y);
      var chatCod = chatOk ? null : detectCoord(curQ.x, curQ.y, parsed.x, parsed.y);
      process(chatOk, chatCod,
        { targetX:curQ.x, targetY:curQ.y, plottedX:parsed.x, plottedY:parsed.y }, 'plot');
    } else {
      if (!placedPt) return;
      var plotOk = (placedPt.x === curQ.x && placedPt.y === curQ.y);
      var plotCod = plotOk ? null : detectCoord(curQ.x, curQ.y, placedPt.x, placedPt.y);
      process(plotOk, plotCod,
        { targetX:curQ.x, targetY:curQ.y, plottedX:placedPt.x, plottedY:placedPt.y }, 'plot');
    }
  }

  function process(isCorrect, code, coords, taskType) {
    submitBtn.disabled = true;
    if (isCorrect) {
      showFb('Correct!', 'ok');
      correctStreak++;
      if (correctStreak >= 2) { setTimeout(closePractice, 1400); return; }
      setTimeout(nextQ, 1400);
      return;
    }

    /* Wrong — reset streak, count toward Hegemon threshold */
    correctStreak = 0;
    showFb('Not quite. Try another.', 'no');

    if (!mcCounted[qIdx]) {
      mcCounted[qIdx] = true;
      var grp = code || 'unclassified';
      mcErrorCount[grp] = (mcErrorCount[grp] || 0) + 1;
      if (!mcTriggered[grp] && mcErrorCount[grp] >= 2) {
        mcTriggered[grp] = true;
        setTimeout(function () { triggerHegemon(code, coords, taskType); }, 800);
        return;
      }
    }
    setTimeout(nextQ, 1400);
  }

  function triggerHegemon(code, coords, taskType) {
    var ctx = (typeof HegemonMarkers !== 'undefined') ? HegemonMarkers.snapshot() : null;
    HegemonBot.open({ misconceptionCode:code, coords:coords, markerContext:ctx, taskType:taskType });
  }

  function showFb(text, type) {
    feedbackEl.textContent = text;
    feedbackEl.className = 'pm-feedback pm-feedback--' + type;
  }

  /* ---- open / close ---- */
  function openPractice(type) {
    qType = type;
    correctStreak = 0;
    mcErrorCount = {}; mcTriggered = {}; mcCounted = {};
    qIdx = 0; isOpen = true;
    overlayEl.style.display = 'flex';
    requestAnimationFrame(function () { overlayEl.classList.add('pm--open'); });
    nextQ();
  }

  function closePractice(keepHegemon) {
    if (!isOpen) return;
    isOpen = false;
    overlayEl.classList.remove('pm--open');
    setTimeout(function () { overlayEl.style.display = 'none'; }, 280);
    // When closing via [NEXT_QUESTION], Hegemon's panel stays open so the student
    // can read the final affirmation. When closing via button or backdrop, reset fully.
    if (!keepHegemon && typeof HegemonBot !== 'undefined') HegemonBot.reset();
  }

  /* ---- CSS ---- */
  function injectCSS() {
    if (document.getElementById('pm-styles')) return;
    var s = document.createElement('style');
    s.id = 'pm-styles';
    s.textContent =
      '.pm-overlay{display:none;position:fixed;inset:0;background:rgba(22,38,61,.55);' +
        'z-index:1000;align-items:center;justify-content:center;padding:16px;' +
        'opacity:0;transition:opacity .25s}' +
      '.pm--open{opacity:1}' +
      '.pm-panel{background:#fff;border-radius:14px;box-shadow:0 12px 40px rgba(22,38,61,.18);' +
        'width:100%;max-width:448px;display:flex;flex-direction:column;' +
        'max-height:calc(100vh - 32px);overflow-y:auto}' +
      '.pm-header{display:flex;align-items:center;justify-content:space-between;' +
        'padding:16px 20px;border-bottom:1px solid #e6edf4;flex-shrink:0}' +
      '.pm-header h2{margin:0;font-size:18px;font-family:Space Grotesk,system-ui,sans-serif;' +
        'font-weight:700;color:#16263d}' +
      '.pm-close{background:none;border:none;cursor:pointer;font-size:22px;line-height:1;' +
        'color:#54647a;padding:2px 8px;border-radius:6px}' +
      '.pm-close:hover{background:#f6f9fc;color:#16263d}' +
      '.pm-body{padding:16px 20px 0;flex:1}' +
      '.pm-prompt{margin:0 0 12px;font-size:16px;font-weight:600;color:#16263d;' +
        'font-family:Space Grotesk,system-ui,sans-serif}' +
      '.pm-grid{border-radius:8px;border:1px solid #e6edf4;width:100%;height:auto}' +
      '.pm-grid--clickable{cursor:crosshair}' +
      '.pm-input-wrap{margin-top:12px}' +
      '.pm-chat-input{width:100%;padding:10px 14px;border:2px solid #dbe6f1;border-radius:8px;' +
        'font-size:16px;font-family:Space Mono,monospace;outline:none;box-sizing:border-box;color:#16263d}' +
      '.pm-chat-input:focus{border-color:#2f6df0}' +
      '.pm-feedback{min-height:24px;margin:10px 20px 0;font-size:15px;font-weight:600;' +
        'font-family:Space Grotesk,system-ui,sans-serif}' +
      '.pm-feedback--ok{color:#0e9488}' +
      '.pm-feedback--no{color:#e2603a}' +
      '.pm-controls{padding:14px 20px 20px;display:flex;justify-content:flex-end;flex-shrink:0}' +
      '.pm-submit{padding:10px 28px;background:#2f6df0;color:#fff;border:none;border-radius:8px;' +
        'font-size:15px;font-weight:600;cursor:pointer;font-family:Space Grotesk,system-ui,sans-serif}' +
      '.pm-submit:disabled{opacity:.4;cursor:not-allowed}' +
      '.pm-submit:not(:disabled):hover{background:#1d5ce0}' +
      '.pm-submit:focus-visible{outline:3px solid #16263d;outline-offset:3px}';
    document.head.appendChild(s);
  }

  /* ---- DOM build ---- */
  function buildDOM() {
    overlayEl = document.createElement('div');
    overlayEl.className = 'pm-overlay';
    overlayEl.setAttribute('role', 'dialog');
    overlayEl.setAttribute('aria-modal', 'true');
    overlayEl.setAttribute('aria-labelledby', 'pm-title');
    overlayEl.style.display = 'none';
    overlayEl.addEventListener('click', function (e) {
      if (e.target === overlayEl) closePractice();
    });

    var panel = document.createElement('div');
    panel.className = 'pm-panel';
    overlayEl.appendChild(panel);

    var hdr = document.createElement('div');
    hdr.className = 'pm-header';
    var ttl = document.createElement('h2');
    ttl.id = 'pm-title';
    ttl.textContent = 'Practice';
    var xBtn = document.createElement('button');
    xBtn.className = 'pm-close';
    xBtn.innerHTML = '&times;';
    xBtn.setAttribute('aria-label', 'Close practice');
    xBtn.addEventListener('click', closePractice);
    hdr.appendChild(ttl);
    hdr.appendChild(xBtn);
    panel.appendChild(hdr);

    bodyEl = document.createElement('div');
    bodyEl.className = 'pm-body';
    panel.appendChild(bodyEl);

    feedbackEl = document.createElement('div');
    feedbackEl.className = 'pm-feedback';
    panel.appendChild(feedbackEl);

    var ctrl = document.createElement('div');
    ctrl.className = 'pm-controls';
    submitBtn = document.createElement('button');
    submitBtn.className = 'pm-submit';
    submitBtn.textContent = 'Submit';
    submitBtn.disabled = true;
    submitBtn.addEventListener('click', handleSubmit);
    ctrl.appendChild(submitBtn);
    panel.appendChild(ctrl);

    document.body.appendChild(overlayEl);
  }

  /* ---- init ---- */
  function init() {
    if (inited) return;
    inited = true;
    injectCSS();
    buildDOM();
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen) closePractice();
    });
    document.addEventListener('hegemon:next-question', function () {
      if (isOpen) setTimeout(function () { closePractice(true); }, 1200);
    });

    // If student manually closes Hegemon without reaching [NEXT_QUESTION],
    // resume practice — advance to the next question rather than leaving them stuck.
    document.addEventListener('hegemon:closed', function () {
      if (isOpen && submitBtn.disabled) {
        setTimeout(nextQ, 600);
      }
    });
  }

  return { init:init, open:openPractice, close:closePractice };
}));
