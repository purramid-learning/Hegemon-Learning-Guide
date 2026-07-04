/*
 * hegemon-bot.js — Hegemon Learning Guide
 *
 * Slide-in scaffolding panel. Calls the Firebase Cloud Function proxy,
 * renders the conversation, and handles retry and teacher-escalation flows.
 *
 * Usage:
 *   HegemonBot.init({ functionUrl })
 *   HegemonBot.open({ misconceptionCode, coords, markerContext })  — starts a NEW conversation
 *   HegemonBot.isOpen()  → boolean
 *   HegemonBot.notifyCorrect()
 *   HegemonBot.notifyWrong(code)
 *   HegemonBot.reset()   — ends the current conversation (call when advancing to a new target)
 *
 * No modal overlay: this is a docked side panel, not a dialog. The host page
 * (the assessment grid) stays interactive while the panel is open. The header
 * close button hides the panel without losing the transcript — the floating
 * trigger button reopens an in-progress conversation exactly as left.
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
  var panelEl, transcriptEl, inputEl, sendBtn, actionsEl, triggerBtn;
  var conversationHistory = [];
  var currentCode = null;
  var currentCoords = null;
  var currentMarkerContext = null;
  var escalated = false;
  var retryUsed = false;
  var open = false;
  var hasConversation = false;
  var gridPromptActive = false;
  var pendingGridCoords = null;
  var gridSubmitBtn = null;
  var introShown = false;
  var currentTaskType = null;

  /* ---- CSS ---- */
  var STYLES = [
    '.hg-panel{position:fixed;top:0;right:0;bottom:0;width:380px;max-width:100vw;',
    'background:var(--surface,#fff);border-left:1px solid var(--line,#e6edf4);',
    'box-shadow:-8px 0 32px -8px rgba(22,38,61,.18);display:flex;flex-direction:column;',
    'transform:translateX(100%);transition:transform .22s ease;z-index:101}',
    '.hg-panel.hg-panel--open{transform:translateX(0)}',

    '.hg-panel__header{display:flex;align-items:center;justify-content:space-between;',
    'padding:16px 20px;border-bottom:1px solid var(--line,#e6edf4);',
    'background:var(--ink,#16263d);color:#fff;flex-shrink:0}',
    '.hg-panel__title{font-family:var(--font-display,"Space Grotesk",system-ui,sans-serif);',
    'font-weight:700;font-size:1rem;letter-spacing:.01em;',
    'display:flex;align-items:center}',
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
    '.hg-msg--action{color:var(--ink-soft,#54647a);font-style:italic;',
    'align-self:flex-end;font-size:.9rem;padding:6px 14px}',
    '.hg-msg--loading{color:var(--ink-soft,#54647a);align-self:flex-start;',
    'display:flex;align-items:center;gap:3px;padding:14px}',
    '.hg-sep{text-align:center;font-size:.75rem;color:var(--ink-soft,#54647a);',
    'margin:4px 0;display:flex;align-items:center;gap:8px;font-weight:600;align-self:stretch}',
    '.hg-sep::before,.hg-sep::after{content:"";flex:1;border-top:1px solid var(--line,#e6edf4)}',
    '.hg-loading-label{margin-right:3px}',
    '.hg-dot{width:6px;height:6px;border-radius:50%;background:var(--ink-soft,#9fb2c9);',
    'animation:hg-blink 1.4s infinite both}',
    '.hg-dot:nth-child(2){animation-delay:.2s}',
    '.hg-dot:nth-child(3){animation-delay:.4s}',
    '@keyframes hg-blink{0%,80%,100%{opacity:.25;transform:scale(.85)}',
    '40%{opacity:1;transform:scale(1)}}',

    '.hg-panel__footer{border-top:1px solid var(--line,#e6edf4);padding:14px 16px;',
    'flex-shrink:0;display:flex;flex-direction:column;gap:10px}',
    '.hg-actions{display:flex;gap:8px;flex-wrap:wrap}',
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
    '.hg-btn-grid-submit{font-family:var(--font-display,"Space Grotesk",sans-serif);font-weight:700;',
    'font-size:.9rem;padding:9px 18px;border:none;border-radius:9px;',
    'background:var(--focus,#2f6df0);color:#fff;cursor:pointer;',
    'transition:background .15s,transform .12s}',
    '.hg-btn-grid-submit:hover:not(:disabled){background:#2258c8;transform:translateY(-1px)}',
    '.hg-btn-grid-submit:disabled{opacity:.4;cursor:default;transform:none}',
    '.hg-btn-grid-submit:focus-visible{outline:2px solid #1a3f8f;outline-offset:2px}',

    '.hg-trigger{position:fixed;bottom:28px;right:28px;width:52px;height:52px;',
    'border:none;padding:0;background:none;cursor:pointer;',
    'transition:transform .12s;z-index:99}',
    '.hg-trigger:hover{transform:scale(1.06)}',
    '.hg-trigger:focus-visible{outline:3px solid var(--focus,#2f6df0);outline-offset:3px;border-radius:50%}',

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

    panelEl = document.createElement('div');
    panelEl.className = 'hg-panel';
    panelEl.setAttribute('role', 'complementary');
    panelEl.setAttribute('aria-label', 'Hegemon tutoring panel');

    var header = document.createElement('div');
    header.className = 'hg-panel__header';
    var titleEl = document.createElement('span');
    titleEl.className = 'hg-panel__title';
    var logoImg = document.createElement('img');
    logoImg.src = 'images/hegemon-logo.png';
    logoImg.alt = '';
    logoImg.width = 28;
    logoImg.height = 28;
    logoImg.style.cssText = 'display:block;margin-right:10px;flex-shrink:0';
    titleEl.appendChild(logoImg);
    titleEl.appendChild(document.createTextNode('Hegemon'));
    header.appendChild(titleEl);
    var closeBtn = document.createElement('button');
    closeBtn.className = 'hg-close';
    closeBtn.setAttribute('aria-label', 'Close help panel');
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', hidePanel);
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
    var triggerImg = document.createElement('img');
    triggerImg.src = 'images/hegemon-trigger.png';
    triggerImg.alt = '';
    triggerImg.width = 52;
    triggerImg.height = 52;
    triggerBtn.appendChild(triggerImg);
    triggerBtn.addEventListener('click', function () {
      if (open) {
        hidePanel();
      } else if (hasConversation) {
        showPanel(); // reopen with transcript intact, no re-fetch
      } else {
        openManual();
      }
    });
    document.body.appendChild(triggerBtn);
  }

  /* ---- panel open / hide / reset ----
     hidePanel:   visually collapses the panel, transcript and history untouched.
     resetConversation: fully clears state — used when a NEW misconception
       conversation starts, after a resolved (correct) answer, or when the
       student advances to a new target via the public reset() call. */
  function showPanel() {
    open = true;
    panelEl.classList.add('hg-panel--open');
    if (!inputEl.disabled) inputEl.focus();
  }

  function hidePanel() {
    open = false;
    panelEl.classList.remove('hg-panel--open');
    document.dispatchEvent(new CustomEvent('hegemon:closed'));
  }

  function resetConversation() {
    open = false;
    panelEl.classList.remove('hg-panel--open');
    // Transcript is preserved intentionally — student can reopen the panel to review
    // what happened. openWithParams() clears it when a new misconception session starts.
    actionsEl.innerHTML = '';
    conversationHistory = [];
    currentCode = null;
    currentCoords = null;
    escalated = false;
    retryUsed = false;
    hasConversation = false;
    gridPromptActive = false;
    pendingGridCoords = null;
    currentTaskType = null;
    hideGridSubmitButton();
    document.dispatchEvent(new CustomEvent('hegemon:grid-done'));
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

  function hideRetryButton() {
    var btn = actionsEl.querySelector('.hg-btn-retry');
    if (btn) btn.remove();
  }

  function appendGridSubAnswer(text) {
    var el = document.createElement('div');
    el.className = 'hg-msg hg-msg--action';
    var em = document.createElement('em');
    em.textContent = text;
    el.appendChild(em);
    transcriptEl.appendChild(el);
    transcriptEl.scrollTop = transcriptEl.scrollHeight;
  }

  function appendLoadingMessage(label) {
    var el = document.createElement('div');
    el.className = 'hg-msg hg-msg--loading';
    if (label) {
      var textSpan = document.createElement('span');
      textSpan.className = 'hg-loading-label';
      textSpan.textContent = label;
      el.appendChild(textSpan);
    }
    for (var i = 0; i < 3; i++) {
      var dot = document.createElement('span');
      dot.className = 'hg-dot';
      el.appendChild(dot);
    }
    transcriptEl.appendChild(el);
    transcriptEl.scrollTop = transcriptEl.scrollHeight;
    return el;
  }

  /* ---- Cloud Function call ---- */
  function fetchResponse(userText, loadingLabel) {
    if (userText) {
      conversationHistory.push({ role: 'user', content: userText });
      appendMessage(userText, 'user');
    }

    setInputEnabled(false);
    var loadingEl = appendLoadingMessage(loadingLabel || null);

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
    if (currentTaskType) body.taskType = currentTaskType;

    fetch(functionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        loadingEl.remove();
        if (!data.response) {
          appendMessage('Something went wrong. Please try again.', 'bot');
          setInputEnabled(true);
          return;
        }
        var type = data.escalate ? 'escalate' : 'bot';
        conversationHistory.push({ role: 'assistant', content: data.response });
        appendMessage(data.response, type);

        if (data.escalate) {
          escalated = true;
          hideRetryButton();
          setInputEnabled(false);
        } else if (data.nextQuestion) {
          setInputEnabled(false);
          document.dispatchEvent(new CustomEvent('hegemon:next-question'));
        } else if (data.gridPrompt) {
          gridPromptActive = true;
          pendingGridCoords = null;
          setInputEnabled(false);
          document.dispatchEvent(new CustomEvent('hegemon:grid-prompt'));
          showGridSubmitButton();
        } else {
          setInputEnabled(true);
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

  /* ---- grid sub-answer buttons ---- */
  function showGridSubmitButton() {
    if (gridSubmitBtn) return;
    gridSubmitBtn = document.createElement('button');
    gridSubmitBtn.className = 'hg-btn-grid-submit';
    gridSubmitBtn.textContent = 'Submit';
    gridSubmitBtn.disabled = true;
    gridSubmitBtn.addEventListener('click', handleGridSubmit);
    actionsEl.appendChild(gridSubmitBtn);
  }

  function hideGridSubmitButton() {
    if (gridSubmitBtn) { gridSubmitBtn.remove(); gridSubmitBtn = null; }
  }

  function handleGridSubmit() {
    if (!pendingGridCoords) return;
    var coords = pendingGridCoords;
    var displayText = 'selected (' + coords.x + ', ' + coords.y + ') on the grid';
    var apiText = displayText;
    pendingGridCoords = null;
    gridPromptActive = false;
    hideGridSubmitButton();
    document.dispatchEvent(new CustomEvent('hegemon:grid-done'));
    // Add to history as plain text for Claude; display as italic action without "I".
    conversationHistory.push({ role: 'user', content: apiText });
    appendGridSubAnswer(displayText);
    fetchResponse(null);
  }

  /* ---- public API ---- */
  function init(config) {
    functionUrl = config.functionUrl || '';
    buildDOM();
    document.addEventListener('hegemon:grid-placed', function(e) {
      if (!gridPromptActive) return;
      pendingGridCoords = e.detail;
      if (gridSubmitBtn) gridSubmitBtn.disabled = false;
    });
  }

  function openWithParams(params) {
    if (hasConversation) resetConversation();
    currentCode = params.misconceptionCode || null;
    currentCoords = params.coords || null;
    currentMarkerContext = params.markerContext || null;
    currentTaskType = params.taskType || null;
    escalated = false;
    retryUsed = false;
    actionsEl.innerHTML = '';
    if (params.questionLabel && transcriptEl.children.length > 0) {
      var sep = document.createElement('div');
      sep.className = 'hg-sep';
      sep.textContent = params.questionLabel;
      transcriptEl.appendChild(sep);
    }
    // Seed an opening user message so the Cloud Function receives a non-empty history.
    // Not displayed — Claude's first response is the student's first visible message.
    conversationHistory = [{ role: 'user', content: 'I need help with this one. I got it wrong but I\'m not sure why.' }];
    hasConversation = true;
    introShown = true; // auto-trigger counts as Athena having been "present"
    showPanel();
    fetchResponse(null, "Let's look at your work");
  }

  function openManual() {
    if (!introShown) {
      // First time the student opens the panel this session, unprompted.
      introShown = true;
      hasConversation = true;
      conversationHistory = [];
      escalated = false;
      retryUsed = false;
      transcriptEl.innerHTML = '';
      actionsEl.innerHTML = '';
      showPanel();
      appendMessage('Hi, I\'m Athena!', 'bot');
      setInputEnabled(true);
    } else if (!hasConversation) {
      // Session ended (auto-advanced or reset) but transcript is preserved.
      // Just show the panel so the student can review what happened.
      showPanel();
    } else {
      openWithParams({
        misconceptionCode: currentCode,
        coords: currentCoords,
        markerContext: currentMarkerContext
      });
    }
  }

  function notifyCorrect() {
    if (!open) return;
    appendMessage('Nice work! Give the next one a try.', 'success');
    hideGridSubmitButton();
    setInputEnabled(false);
    setTimeout(function() {
      resetConversation();
      document.dispatchEvent(new CustomEvent('hegemon:advance'));
    }, 2200);
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

  function clearHistory() {
    resetConversation();
    transcriptEl.innerHTML = '';
    introShown = false;
  }

  function hasHistory() {
    return transcriptEl.children.length > 0;
  }

  function downloadChat() {
    if (!transcriptEl.children.length) return;
    var win = window.open('', '_blank');
    if (!win) return;
    var html = '<!DOCTYPE html><html><head>' +
      '<meta charset="utf-8">' +
      '<title>Hegemon Chat History</title>' +
      '<style>' +
      'body{font-family:"Space Grotesk",system-ui,sans-serif;max-width:600px;margin:40px auto;color:#16263d;padding:0 20px}' +
      'h1{font-size:1rem;color:#54647a;margin-bottom:24px;font-weight:600}' +
      '.wrap{display:flex;flex-direction:column;gap:12px}' +
      '.hg-msg{max-width:85%;padding:10px 14px;border-radius:12px;font-size:.9rem;line-height:1.6;white-space:pre-wrap;word-break:break-word}' +
      '.hg-msg--bot,.hg-msg--success{background:#f6f9fc;border:1px solid #e6edf4}' +
      '.hg-msg--user{background:#16263d;color:#fff;margin-left:auto;text-align:right}' +
      '.hg-msg--escalate{background:#fff8e6;border:1px solid #f5d87a}' +
      '.hg-msg--loading,.hg-msg--action{display:none}' +
      '.hg-sep{text-align:center;font-size:.75rem;color:#54647a;margin:12px 0 4px;display:flex;align-items:center;gap:8px;font-weight:600}' +
      '.hg-sep::before,.hg-sep::after{content:"";flex:1;border-top:1px solid #e6edf4}' +
      '@media print{body{margin:20px;padding:0 10px}}' +
      '</style>' +
      '</head><body>' +
      '<h1>Hegemon Chat — Lesson 1 Quiz</h1>' +
      '<div class="wrap">' + transcriptEl.innerHTML + '</div>' +
      '</body></html>';
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(function() { win.print(); }, 400);
  }

  return {
    init: init,
    open: openWithParams,
    close: hidePanel,
    reset: resetConversation,
    clearHistory: clearHistory,
    hasHistory: hasHistory,
    downloadChat: downloadChat,
    isOpen: function () { return open; },
    notifyCorrect: notifyCorrect,
    notifyWrong: notifyWrong
  };
}));
