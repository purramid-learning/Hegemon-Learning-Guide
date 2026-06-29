/*
 * hegemon-bot.js — Hegemon Learning Guide
 *
 * Slide-in scaffolding panel. Calls the Firebase Cloud Function proxy,
 * renders the conversation, and handles retry and teacher-escalation flows.
 *
 * Usage:
 *   HegemonBot.init({ functionUrl, onRetry })
 *   HegemonBot.open({ misconceptionCode, coords, markerContext })
 *   HegemonBot.isOpen()  → boolean
 *   HegemonBot.notifyCorrect()
 *   HegemonBot.notifyWrong(code)
 *
 * Fires a 'hegemon:retry' CustomEvent on document when the student clicks
 * "Try again" — the grid listens for this to re-enable submission.
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.HegemonBot = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ---- state ---- */
  var functionUrl = '';
  var panelEl, transcriptEl, inputEl, sendBtn, actionsEl, triggerBtn, overlayEl;
  var conversationHistory = [];
  var currentCode = null;
  var currentCoords = null;
  var currentMarkerContext = null;
  var escalated = false;
  var retryUsed = false;
  var open = false;

  /* ---- CSS ---- */
  var STYLES = [
    '.hg-overlay{position:fixed;inset:0;background:rgba(22,38,61,.25);opacity:0;',
    'transition:opacity .2s;pointer-events:none;z-index:100}',
    '.hg-overlay.hg-overlay--on{opacity:1;pointer-events:auto}',

    '.hg-panel{position:fixed;top:0;right:0;bottom:0;width:380px;max-width:100vw;',
    'background:var(--surface,#fff);border-left:1px solid var(--line,#e6edf4);',
    'box-shadow:-8px 0 32px -8px rgba(22,38,61,.18);display:flex;flex-direction:column;',
    'transform:translateX(100%);transition:transform .22s ease;z-index:101}',
    '.hg-panel.hg-panel--open{transform:translateX(0)}',

    '.hg-panel__header{display:flex;align-items:center;justify-content:space-between;',
    'padding:16px 20px;border-bottom:1px solid var(--line,#e6edf4);',
    'background:var(--ink,#16263d);color:#fff;flex-shrink:0}',
    '.hg-panel__title{font-family:var(--font-display,"Space Grotesk",system-ui,sans-serif);',
    'font-weight:700;font-size:1rem;letter-spacing:.01em}',
    '.hg-panel__badge{font-family:var(--font-mono,"Space Mono",monospace);font-size:.68rem;',
    'letter-spacing:.1em;text-transform:uppercase;color:#9fb2c9;margin-left:10px}',
    '.hg-close{background:none;border:none;color:#9fb2c9;cursor:pointer;font-size:1.1rem;',
    'padding:4px 8px;border-radius:6px;line-height:1}',
    '.hg-close:hover{color:#fff;background:rgba(255,255,255,.1)}',
    '.hg-close:focus-visible{outline:2px solid var(--focus,#2f6df0);outline-offset:2px}',

    '.hg-panel__transcript{flex:1;overflow-y:auto;padding:20px;',
    'display:flex;flex-direction:column;gap:14px}',

    '.hg-msg{max-width:90%;padding:10px 14px;border-radius:12px;',
    'font-size:.95rem;line-height:1.6;white-space:pre-wrap;word-break:break-word}',
    '.hg-msg--bot{background:var(--paper,#f6f9fc);border:1px solid var(--line,#e6edf4);',
    'align-self:flex-start;border-radius:4px 12px 12px 12px}',
    '.hg-msg--user{background:var(--ink,#16263d);color:#fff;',
    'align-self:flex-end;border-radius:12px 4px 12px 12px}',
    '.hg-msg--escalate{background:#fff8e6;border:1px solid #f5d87a;',
    'align-self:flex-start;border-radius:4px 12px 12px 12px}',
    '.hg-msg--success{background:var(--y-tint,#e3f3f1);border:1px solid var(--y,#0e9488);',
    'align-self:flex-start;border-radius:4px 12px 12px 12px}',
    '.hg-msg--loading{color:var(--ink-soft,#54647a);font-style:italic;align-self:flex-start}',

    '.hg-panel__footer{border-top:1px solid var(--line,#e6edf4);padding:14px 16px;',
    'flex-shrink:0;display:flex;flex-direction:column;gap:10px}',
    '.hg-actions{display:flex;gap:8px;flex-wrap:wrap}',
    '.hg-btn-retry{font-family:var(--font-display,"Space Grotesk",sans-serif);font-weight:700;',
    'font-size:.9rem;padding:9px 18px;border:none;border-radius:9px;',
    'background:var(--y,#0e9488);color:#fff;cursor:pointer;',
    'transition:background .15s,transform .12s}',
    '.hg-btn-retry:hover{background:#0b7d73;transform:translateY(-1px)}',
    '.hg-btn-retry:disabled{opacity:.4;cursor:default;transform:none}',
    '.hg-input-row{display:flex;gap:8px;align-items:flex-end}',
    '.hg-input{flex:1;font-family:var(--font-body,"Inter",sans-serif);font-size:.95rem;',
    'padding:9px 13px;border:1px solid var(--line,#e6edf4);border-radius:10px;resize:none;',
    'line-height:1.45;background:var(--paper,#f6f9fc);color:var(--ink,#16263d)}',
    '.hg-input:focus{outline:none;border-color:var(--focus,#2f6df0);background:#fff}',
    '.hg-input:disabled{opacity:.5;cursor:default}',
    '.hg-btn-send{font-family:var(--font-display,"Space Grotesk",sans-serif);font-weight:700;',
    'font-size:.9rem;padding:9px 16px;border:none;border-radius:9px;',
    'background:var(--x,#e2603a);color:#fff;cursor:pointer;white-space:nowrap;',
    'transition:background .15s,transform .12s}',
    '.hg-btn-send:hover:not(:disabled){background:#cf5230;transform:translateY(-1px)}',
    '.hg-btn-send:disabled{opacity:.4;cursor:default}',
    '.hg-btn-send:focus-visible,.hg-btn-retry:focus-visible,.hg-close:focus-visible{',
    'outline:2px solid var(--focus,#2f6df0);outline-offset:2px}',

    '.hg-trigger{position:fixed;bottom:28px;right:28px;width:52px;height:52px;',
    'border-radius:50%;background:var(--ink,#16263d);color:#fff;border:none;',
    'cursor:pointer;font-size:1.4rem;box-shadow:0 4px 16px -4px rgba(22,38,61,.4);',
    'transition:background .15s,transform .12s;z-index:99;',
    'display:flex;align-items:center;justify-content:center}',
    '.hg-trigger:hover{background:#22384f;transform:scale(1.06)}',
    '.hg-trigger:focus-visible{outline:3px solid var(--focus,#2f6df0);outline-offset:3px}',

    '@media(max-width:480px){.hg-panel{width:100vw;border-left:none}',
    '.hg-trigger{bottom:18px;right:18px}}'
  ].join('');

  /* ---- DOM build ---- */
  function injectStyles() {
    var s = document.createElement('style');
    s.textContent = STYLES;
    document.head.appendChild(s);
  }

  function buildDOM() {
    injectStyles();

    overlayEl = document.createElement('div');
    overlayEl.className = 'hg-overlay';
    overlayEl.addEventListener('click', close);
    document.body.appendChild(overlayEl);

    panelEl = document.createElement('div');
    panelEl.className = 'hg-panel';
    panelEl.setAttribute('role', 'complementary');
    panelEl.setAttribute('aria-label', 'Hegemon tutoring panel');

    var header = document.createElement('div');
    header.className = 'hg-panel__header';
    header.innerHTML =
      '<span class="hg-panel__title">Hegemon<span class="hg-panel__badge">Help</span></span>';
    var closeBtn = document.createElement('button');
    closeBtn.className = 'hg-close';
    closeBtn.setAttribute('aria-label', 'Close help panel');
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', close);
    header.appendChild(closeBtn);
    panelEl.appendChild(header);

    transcriptEl = document.createElement('div');
    transcriptEl.className = 'hg-panel__transcript';
    transcriptEl.setAttribute('aria-live', 'polite');
    panelEl.appendChild(transcriptEl);

    var footer = document.createElement('div');
    footer.className = 'hg-panel__footer';

    actionsEl = document.createElement('div');
    actionsEl.className = 'hg-actions';
    footer.appendChild(actionsEl);

    var inputRow = document.createElement('div');
    inputRow.className = 'hg-input-row';
    inputEl = document.createElement('textarea');
    inputEl.className = 'hg-input';
    inputEl.rows = 2;
    inputEl.placeholder = 'Type your response...';
    inputEl.setAttribute('aria-label', 'Response to Hegemon');
    inputEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });
    sendBtn = document.createElement('button');
    sendBtn.className = 'hg-btn-send';
    sendBtn.textContent = 'Send';
    sendBtn.addEventListener('click', handleSend);
    inputRow.appendChild(inputEl);
    inputRow.appendChild(sendBtn);
    footer.appendChild(inputRow);
    panelEl.appendChild(footer);
    document.body.appendChild(panelEl);

    triggerBtn = document.createElement('button');
    triggerBtn.className = 'hg-trigger';
    triggerBtn.setAttribute('aria-label', 'Ask Hegemon for help');
    triggerBtn.innerHTML = '&#x3F;';
    triggerBtn.addEventListener('click', function () {
      if (open) { close(); } else { openManual(); }
    });
    document.body.appendChild(triggerBtn);
  }

  /* ---- panel open / close ---- */
  function showPanel() {
    open = true;
    panelEl.classList.add('hg-panel--open');
    overlayEl.classList.add('hg-overlay--on');
    inputEl.focus();
  }

  function close() {
    open = false;
    panelEl.classList.remove('hg-panel--open');
    overlayEl.classList.remove('hg-overlay--on');
    transcriptEl.innerHTML = '';
    actionsEl.innerHTML = '';
    conversationHistory = [];
    currentCode = null;
    currentCoords = null;
    escalated = false;
    retryUsed = false;
  }

  /* ---- messages ---- */
  function appendMessage(text, type) {
    var el = document.createElement('div');
    el.className = 'hg-msg hg-msg--' + type;
    el.textContent = text;
    transcriptEl.appendChild(el);
    transcriptEl.scrollTop = transcriptEl.scrollHeight;
    return el;
  }

  function setInputEnabled(enabled) {
    inputEl.disabled = !enabled;
    sendBtn.disabled = !enabled;
    if (enabled) inputEl.focus();
  }

  function showRetryButton() {
    if (retryUsed || escalated || actionsEl.querySelector('.hg-btn-retry')) return;
    var btn = document.createElement('button');
    btn.className = 'hg-btn-retry';
    btn.textContent = 'Try again';
    btn.addEventListener('click', function () {
      retryUsed = true;
      btn.disabled = true;
      document.dispatchEvent(new CustomEvent('hegemon:retry'));
    });
    actionsEl.appendChild(btn);
  }

  function hideRetryButton() {
    var btn = actionsEl.querySelector('.hg-btn-retry');
    if (btn) btn.remove();
  }

  /* ---- Cloud Function call ---- */
  function fetchResponse(userText) {
    if (userText) {
      conversationHistory.push({ role: 'user', content: userText });
      appendMessage(userText, 'user');
    }

    setInputEnabled(false);
    var loadingEl = appendMessage('...', 'loading');

    var body = {
      misconceptionCode: currentCode,
      markerContext: currentMarkerContext || { topicsSeen: [], likelyMisconceptions: [], focusTopic: null },
      conversationHistory: conversationHistory
    };
    if (currentCoords) {
      body.targetX  = currentCoords.targetX;
      body.targetY  = currentCoords.targetY;
      body.plottedX = currentCoords.plottedX;
      body.plottedY = currentCoords.plottedY;
    }

    fetch(functionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        loadingEl.remove();
        var type = data.escalate ? 'escalate' : 'bot';
        conversationHistory.push({ role: 'assistant', content: data.response });
        appendMessage(data.response, type);

        if (data.escalate) {
          escalated = true;
          hideRetryButton();
          setInputEnabled(false);
        } else {
          setInputEnabled(true);
          showRetryButton();
        }
      })
      .catch(function () {
        loadingEl.remove();
        appendMessage('Something went wrong. Please try again.', 'bot');
        setInputEnabled(true);
      });
  }

  function handleSend() {
    var text = inputEl.value.trim();
    if (!text || inputEl.disabled) return;
    inputEl.value = '';
    fetchResponse(text);
  }

  /* ---- public API ---- */
  function init(config) {
    functionUrl = config.functionUrl || '';
    buildDOM();
  }

  function openWithParams(params) {
    if (open) close();
    currentCode = params.misconceptionCode || null;
    currentCoords = params.coords || null;
    currentMarkerContext = params.markerContext || null;
    conversationHistory = [];
    escalated = false;
    retryUsed = false;
    transcriptEl.innerHTML = '';
    actionsEl.innerHTML = '';
    showPanel();
    fetchResponse(null); // bot opens with first message
  }

  function openManual() {
    // Manual trigger — use last known context if available, otherwise unclassified
    openWithParams({
      misconceptionCode: currentCode,
      coords: currentCoords,
      markerContext: currentMarkerContext
    });
  }

  function notifyCorrect() {
    if (!open) return;
    appendMessage('Nice work. Give the next one a try.', 'success');
    hideRetryButton();
    setInputEnabled(false);
    setTimeout(close, 2200);
  }

  function notifyWrong(code) {
    if (!open) return;
    var noteText = '[Student plotted the point again' +
      (currentCoords ? ' — target was (' + currentCoords.targetX + ', ' + currentCoords.targetY + ').' : '.') +
      ']';
    conversationHistory.push({ role: 'user', content: noteText });
    currentCode = code || currentCode;
    fetchResponse(null);
  }

  return {
    init: init,
    open: openWithParams,
    close: close,
    isOpen: function () { return open; },
    notifyCorrect: notifyCorrect,
    notifyWrong: notifyWrong
  };
}));
