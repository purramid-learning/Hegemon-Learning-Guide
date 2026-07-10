/*
 * Copyright 2026 Joseph L. Selby, Purramid Learning®, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
  var source = '';
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
  var quadrantPromptActive = false;
  var pendingQuadrantSelection = null;
  var introShown = false;
  var currentTaskType = null;
  var transcriptArchived = false;

  /* ---- focus diagnostic options (per topic) ---- */
  var FOCUS_OPTIONS = {
    'number-line': [
      "I’m not sure what a number line is",
      "I know what it is but don’t see how it connects to the grid",
      "Something else",
      "In my own words…"
    ],
    'coordinate-plane': [
      "I don’t understand what a coordinate plane is",
      "I know what it is but I’m not sure how to use it",
      "I keep confusing it with just a number line",
      "Something else",
      "In my own words…"
    ],
    'axes': [
      "I’m not sure what axes means",
      "I keep mixing up the x-axis and y-axis",
      "I understand them separately but not how they work together",
      "Something else",
      "In my own words…"
    ],
    'origin': [
      "I’m not sure what the origin is",
      "I understand it but keep losing track of it on the grid",
      "I’m mixing it up with just the number zero",
      "Something else",
      "In my own words…"
    ],
    'quadrants': [
      "I don’t know what quadrants are",
      "I understand the concept but can’t keep track of which is which",
      "I’m confused about why they’re numbered the way they are",
      "Something else",
      "In my own words…"
    ],
    'ordered-pair': [
      "I don’t know what an ordered pair is",
      "I keep mixing up which number goes first",
      "I understand it but have trouble plotting the point",
      "Something else",
      "In my own words…"
    ],
    'coordinates': [
      "I’m not sure what coordinates means",
      "I know the word but don’t know how to find them on the grid",
      "I keep mixing up the x-coordinate and y-coordinate",
      "Something else",
      "In my own words…"
    ],
    'reading-coordinates': [
      "I don’t know how to read a point’s coordinates from the grid",
      "I can plot points but can’t read them in reverse",
      "I keep getting x and y switched when reading",
      "Something else",
      "In my own words…"
    ],
    'zero-coordinate': [
      "I’m not sure what it means when a coordinate is zero",
      "I know it’s on an axis but can’t tell which one",
      "Something else",
      "In my own words…"
    ],
    'order-matters': [
      "I don’t understand why the order of the numbers matters",
      "I keep forgetting which number to write first",
      "Something else",
      "In my own words…"
    ]
  };

  /* ---- topic display names (manual diagnostic list) ---- */
  var TOPIC_DISPLAY = {
    'number-line':            'Number line',
    'coordinate-plane':       'Coordinate plane',
    'x-axis':                 'The x-axis',
    'y-axis':                 'The y-axis',
    'axes':                   'Axes (x-axis and y-axis)',
    'origin':                 'The origin',
    'quadrants':              'Quadrants',
    'sign-to-quadrant':       'Which signs belong in each quadrant',
    'quadrant-numbering':     'How quadrants are numbered',
    'ordered-pair':           'Ordered pair',
    'coordinates':            'Coordinates',
    'plotting-across-then-up':'Plotting: move across, then up or down',
    'negative-x':             'Negative x-coordinates',
    'negative-y':             'Negative y-coordinates',
    'reading-coordinates':    'Reading coordinates from the grid',
    'zero-coordinate':        'Zero coordinates',
    'order-matters':          'Why order matters'
  };

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
    '.hg-closed-note{text-align:center;font-size:.75rem;color:var(--ink-soft,#54647a);',
    'font-style:italic;margin:8px 0;padding:6px 0;align-self:stretch;',
    'border-top:1px solid var(--line,#e6edf4);border-bottom:1px solid var(--line,#e6edf4)}',
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
    '.hg-btn-retry{font-family:var(--font-display,"Space Grotesk",sans-serif);font-weight:700;',
    'font-size:.9rem;padding:9px 18px;border:none;border-radius:9px;align-self:flex-start;',
    'background:var(--focus,#2f6df0);color:#fff;cursor:pointer;',
    'transition:background .15s,transform .12s;margin-top:6px}',
    '.hg-btn-retry:hover{background:#2258c8;transform:translateY(-1px)}',

    '.hg-trigger{position:fixed;bottom:28px;right:28px;width:52px;height:52px;',
    'border:none;padding:0;background:none;cursor:pointer;',
    'transition:transform .12s;z-index:99}',
    '.hg-trigger:hover{transform:scale(1.06)}',
    '.hg-trigger:focus-visible{outline:3px solid var(--focus,#2f6df0);outline-offset:3px;border-radius:50%}',

    '.hg-choices{display:flex;flex-direction:column;gap:6px;align-self:stretch;margin:4px 0}',
    '.hg-choice{font-family:var(--font-body,system-ui,sans-serif);font-size:.85rem;text-align:left;',
    'padding:9px 13px;border:1.5px solid #c8d4e0;border-radius:10px;',
    'background:#dde6ef;color:var(--ink,#16263d);cursor:pointer;',
    'transition:border-color .12s,background .12s}',
    '.hg-choice:hover{border-color:var(--focus,#2f6df0);background:#ccd8e4}',
    '.hg-choice:focus-visible{outline:2px solid var(--focus,#2f6df0);outline-offset:2px}',
    '.hg-choice--alt{border-style:dashed}',

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
    panelEl.inert = true;

    triggerBtn = document.createElement('button');
    triggerBtn.className = 'hg-trigger';
    triggerBtn.setAttribute('aria-label', 'Ask Hegemon for help (Alt+H)');
    triggerBtn.setAttribute('aria-keyshortcuts', 'Alt+h');
    var triggerImg = document.createElement('img');
    triggerImg.src = 'images/hegemon-trigger.png';
    triggerImg.alt = '';
    triggerImg.width = 52;
    triggerImg.height = 52;
    triggerBtn.appendChild(triggerImg);
    triggerBtn.addEventListener('click', function () {
      togglePanel(false);
    });
    document.body.appendChild(triggerBtn);

    document.addEventListener('keydown', function (e) {
      if (e.altKey && (e.key === 'h' || e.key === 'H')) {
        e.preventDefault();
        togglePanel(true);
      }
    });
  }

  function appendClosedNote() {
    var note = document.createElement('div');
    note.className = 'hg-closed-note';
    note.textContent = 'Session closed by student.';
    transcriptEl.appendChild(note);
    transcriptEl.scrollTop = transcriptEl.scrollHeight;
  }

  function togglePanel(viaKeyboard) {
    if (open) {
      if (hasConversation) {
        appendClosedNote();
        if (currentTaskType) document.dispatchEvent(new CustomEvent('hegemon:retry'));
        resetConversation();
      } else {
        hidePanel();
      }
      triggerBtn.focus();
    } else if (hasConversation) {
      showPanel();
    } else {
      openManual(viaKeyboard);
    }
  }

  /* ---- panel open / hide / reset ----
     hidePanel:   visually collapses the panel, transcript and history untouched.
     resetConversation: fully clears state — used when a NEW misconception
       conversation starts, after a resolved (correct) answer, or when the
       student advances to a new target via the public reset() call. */
  function showPanel() {
    open = true;
    panelEl.inert = false;
    panelEl.classList.add('hg-panel--open');
    if (!inputEl.disabled) {
      inputEl.focus();
    } else {
      var firstChoice = panelEl.querySelector('.hg-choice');
      if (firstChoice) firstChoice.focus();
    }
  }

  function hidePanel() {
    open = false;
    panelEl.classList.remove('hg-panel--open');
    panelEl.inert = true;
    document.dispatchEvent(new CustomEvent('hegemon:closed'));
  }

  /* Append the completed conversation to the session-level transcript logs in
     sessionStorage so the quiz finish() can submit the full cross-page log and
     downloadChat() can include lesson conversations. */
  function archiveConversationToSession() {
    if (transcriptArchived || conversationHistory.length < 2) return;
    try {
      // Always save rendered HTML for download — independent of opt-in.
      var htmlLog = [];
      try { htmlLog = JSON.parse(sessionStorage.getItem('hg_transcript_html_log') || '[]'); } catch (e) { htmlLog = []; }
      htmlLog.push({ source: source, html: transcriptEl.innerHTML });
      sessionStorage.setItem('hg_transcript_html_log', JSON.stringify(htmlLog));

      // Save raw conversation for Firebase only when the user opted in.
      if (sessionStorage.getItem('hg_demo_opt_in') === 'true') {
        var log = [];
        try { log = JSON.parse(sessionStorage.getItem('hg_transcript_log') || '[]'); } catch (e) { log = []; }
        log.push({
          source: source,
          misconceptionCode: currentCode || null,
          coords: currentCoords || null,
          conversationHistory: conversationHistory,
          ts: new Date().toISOString()
        });
        sessionStorage.setItem('hg_transcript_log', JSON.stringify(log));
      }

      transcriptArchived = true;
    } catch (e) {}
  }

  function resetConversation() {
    archiveConversationToSession();
    open = false;
    panelEl.classList.remove('hg-panel--open');
    panelEl.inert = true;
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
    quadrantPromptActive = false;
    pendingQuadrantSelection = null;
    currentTaskType = null;
    transcriptArchived = false;
    hideGridSubmitButton();
    document.dispatchEvent(new CustomEvent('hegemon:grid-done'));
    document.dispatchEvent(new CustomEvent('hegemon:quadrant-done'));
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

  function showRetryButton() {
    hideRetryButton();
    var btn = document.createElement('button');
    btn.className = 'hg-btn-retry';
    btn.textContent = 'Try it again';
    btn.addEventListener('click', function() {
      document.dispatchEvent(new CustomEvent('hegemon:retry'));
      resetConversation();
    });
    actionsEl.appendChild(btn);
  }

  function showAskAnotherButton() {
    var btn = document.createElement('button');
    btn.className = 'hg-btn-retry';
    btn.textContent = 'Ask about something else';
    btn.addEventListener('click', function() {
      resetConversation();
      openManual(false);
    });
    actionsEl.appendChild(btn);
  }

  function showChoiceButtons(choices) {
    var wrap = document.createElement('div');
    wrap.className = 'hg-choices hg-dynamic-choices';
    choices.forEach(function(label) {
      var btn = document.createElement('button');
      btn.className = 'hg-choice';
      btn.textContent = label;
      btn.addEventListener('click', function() {
        wrap.remove();
        var isOwnWords = /in my own words/i.test(label);
        if (isOwnWords) {
          setInputEnabled(true);
        } else {
          conversationHistory.push({ role: 'user', content: label });
          appendMessage(label, 'user');
          fetchResponse(null);
        }
      });
      wrap.appendChild(btn);
    });
    actionsEl.appendChild(wrap);
    setInputEnabled(false);
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
      if (currentCoords.namedQuadrant != null) body.namedQuadrant = currentCoords.namedQuadrant;
      if (currentCoords.correctQuadrant != null) body.correctQuadrant = currentCoords.correctQuadrant;
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
        var prevChoices = actionsEl.querySelector('.hg-dynamic-choices');
        if (prevChoices) prevChoices.remove();
        if (!data.response) {
          console.error('Hegemon: no response field. Server returned:', data);
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
        } else if (data.dismissed) {
          setInputEnabled(false);
          if (currentTaskType) {
            showRetryButton();
          } else {
            showAskAnotherButton();
          }
        } else if (data.choices && data.choices.length) {
          showChoiceButtons(data.choices);
        } else if (data.quadrantPrompt) {
          quadrantPromptActive = true;
          pendingQuadrantSelection = null;
          setInputEnabled(false);
          document.dispatchEvent(new CustomEvent('hegemon:quadrant-prompt'));
          showGridSubmitButton();
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
    if (pendingQuadrantSelection) {
      var q = pendingQuadrantSelection;
      var displayText = 'selected Quadrant ' + q + ' on the grid';
      pendingQuadrantSelection = null;
      quadrantPromptActive = false;
      retryUsed = true;
      hideGridSubmitButton();
      document.dispatchEvent(new CustomEvent('hegemon:quadrant-done'));
      conversationHistory.push({ role: 'user', content: displayText });
      appendGridSubAnswer(displayText);
      fetchResponse(null);
    } else if (pendingGridCoords) {
      var coords = pendingGridCoords;
      var displayText = 'selected (' + coords.x + ', ' + coords.y + ') on the grid';
      pendingGridCoords = null;
      gridPromptActive = false;
      retryUsed = true;
      hideGridSubmitButton();
      document.dispatchEvent(new CustomEvent('hegemon:grid-done'));
      conversationHistory.push({ role: 'user', content: displayText });
      appendGridSubAnswer(displayText);
      fetchResponse(null);
    }
  }

  /* ---- public API ---- */
  function init(config) {
    functionUrl = config.functionUrl || '';
    source      = config.source      || '';
    buildDOM();
    document.addEventListener('hegemon:grid-placed', function(e) {
      if (!gridPromptActive) return;
      pendingGridCoords = e.detail;
      if (gridSubmitBtn) gridSubmitBtn.disabled = false;
    });
    document.addEventListener('hegemon:quadrant-selected', function(e) {
      if (!quadrantPromptActive) return;
      pendingQuadrantSelection = e.detail;
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
    var isFirstTrigger = !introShown;
    introShown = true;
    showPanel();
    if (isFirstTrigger) {
      appendMessage("Hi, I'm Athena! I'm here to help!", 'bot');
    }
    fetchResponse(null, "Let's look at your work");
  }

  function openManual(viaKeyboard) {
    if (!introShown) {
      introShown = true;
      hasConversation = true;
      conversationHistory = [];
      escalated = false;
      retryUsed = false;
      transcriptEl.innerHTML = '';
      actionsEl.innerHTML = '';
      showPanel();
      if (viaKeyboard) {
        appendMessage("Hi, I'm Athena! In the future, you can open this window at any time by pressing Alt+H. What can I help you with today?", 'bot');
      } else {
        appendMessage("Hi, I'm Athena! I'm here to help!", 'bot');
        appendMessage('What can I help you with today?', 'bot');
      }
      var md = HegemonMarkers.readForManual();
      var combined = md.visible.concat(md.above);
      var displayCount = Math.min(4, Math.max(md.visible.length, Math.min(3, combined.length)));
      var list = combined.slice(0, displayCount);
      var pool = combined.slice(displayCount);
      if (list.length > 0) {
        setInputEnabled(false);
        showManualChoices(list, pool);
      } else {
        setInputEnabled(true);
      }
    } else if (!hasConversation) {
      // Previous session was closed — start fresh without repeating the greeting.
      hasConversation = true;
      conversationHistory = [];
      escalated = false;
      retryUsed = false;
      actionsEl.innerHTML = '';
      transcriptEl.innerHTML = '';
      showPanel();
      appendMessage('What can I help you with today?', 'bot');
      var md2 = HegemonMarkers.readForManual();
      var combined2 = md2.visible.concat(md2.above);
      var displayCount2 = Math.min(4, Math.max(md2.visible.length, Math.min(3, combined2.length)));
      var list2 = combined2.slice(0, displayCount2);
      var pool2 = combined2.slice(displayCount2);
      if (list2.length > 0) {
        setInputEnabled(false);
        showManualChoices(list2, pool2);
      } else {
        setInputEnabled(true);
      }
    } else {
      openWithParams({
        misconceptionCode: currentCode,
        coords: currentCoords,
        markerContext: currentMarkerContext
      });
    }
  }

  function openWithFocus(displayTerm, focusTopic, markerCtx) {
    if (hasConversation) resetConversation();
    currentCode = null;
    currentCoords = null;
    currentMarkerContext = markerCtx || null;
    currentTaskType = null;
    escalated = false;
    retryUsed = false;
    actionsEl.innerHTML = '';
    if (transcriptEl.children.length > 0) {
      var sep = document.createElement('div');
      sep.className = 'hg-sep';
      sep.textContent = displayTerm;
      transcriptEl.appendChild(sep);
    }
    conversationHistory = [];
    hasConversation = true;
    var isFirst = !introShown;
    introShown = true;
    showPanel();
    if (isFirst) appendMessage("Hi, I'm Athena! I'm here to help!", 'bot');
    appendMessage('It sounds like you need some help with ' + displayTerm + '. Where are you struggling?', 'bot');
    showFocusChoices(displayTerm, focusTopic);
    setInputEnabled(false);
  }

  // Roving tabindex for a .hg-choices card: only the first button is in the tab
  // order; Up/Down arrows move focus within the group; Tab exits it entirely.
  function applyRovingTabindex(card) {
    var btns = Array.prototype.slice.call(card.querySelectorAll('.hg-choice'));
    btns.forEach(function (btn, i) { btn.tabIndex = i === 0 ? 0 : -1; });
    card.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      e.preventDefault();
      var idx = btns.indexOf(document.activeElement);
      if (idx === -1) return;
      var next = e.key === 'ArrowDown'
        ? (idx + 1) % btns.length
        : (idx - 1 + btns.length) % btns.length;
      btns.forEach(function (b) { b.tabIndex = -1; });
      btns[next].tabIndex = 0;
      btns[next].focus();
    });
  }

  function showFocusChoices(displayTerm, focusTopic) {
    var opts = FOCUS_OPTIONS[focusTopic] || [
      "I'm not sure I understand it",
      "I understand the idea but can't apply it",
      "Something else",
      "In my own words…"
    ];
    var card = document.createElement('div');
    card.className = 'hg-choices';
    opts.forEach(function (text) {
      var isFallback = text === 'Something else';
      var isManual = text.indexOf('In my own words') === 0;
      var btn = document.createElement('button');
      btn.className = 'hg-choice' + (isFallback || isManual ? ' hg-choice--alt' : '');
      btn.textContent = text;
      btn.addEventListener('click', function () {
        card.remove();
        if (isFallback) {
          appendMessage(text, 'user');
          appendMessage("That's okay — tell me what comes to mind and we'll work through it.", 'bot');
          conversationHistory = [];
          setInputEnabled(true);
        } else if (isManual) {
          appendMessage(text, 'user');
          appendMessage('Go ahead — describe what\'s confusing you in your own words.', 'bot');
          conversationHistory = [];
          setInputEnabled(true);
        } else {
          appendMessage(text, 'user');
          conversationHistory = [{ role: 'user', content: 'I need help with ' + displayTerm + '. ' + text }];
          fetchResponse(null);
        }
      });
      card.appendChild(btn);
    });
    applyRovingTabindex(card);
    transcriptEl.appendChild(card);
    transcriptEl.scrollTop = transcriptEl.scrollHeight;
  }

  // list: marker records to show as buttons (up to 4).
  // pool: remaining records for "Something else" paging (3 at a time).
  function showManualChoices(list, pool) {
    var card = document.createElement('div');
    card.className = 'hg-choices';

    list.forEach(function (rec) {
      var displayName = TOPIC_DISPLAY[rec.topic] || rec.topic;
      var btn = document.createElement('button');
      btn.className = 'hg-choice';
      btn.textContent = displayName;
      btn.addEventListener('click', function () {
        card.remove();
        currentMarkerContext = HegemonMarkers.read({ focus: rec.topic });
        appendMessage(displayName, 'user');
        appendMessage('It sounds like you need some help with ' + displayName + '. Where are you struggling?', 'bot');
        showFocusChoices(displayName, rec.topic);
      });
      card.appendChild(btn);
    });

    if (pool.length > 0) {
      var elseBtn = document.createElement('button');
      elseBtn.className = 'hg-choice hg-choice--alt';
      elseBtn.textContent = 'Something else';
      elseBtn.addEventListener('click', function () {
        card.remove();
        appendMessage('Something else', 'user');
        var nextList = pool.slice(0, 3);
        var nextPool = pool.slice(3);
        showManualChoices(nextList, nextPool);
      });
      card.appendChild(elseBtn);
    }

    var manualBtn = document.createElement('button');
    manualBtn.className = 'hg-choice hg-choice--alt';
    manualBtn.textContent = 'In my own words…';
    manualBtn.addEventListener('click', function () {
      card.remove();
      appendMessage('In my own words…', 'user');
      appendMessage('Tell me what’s on your mind.', 'bot');
      conversationHistory = [];
      setInputEnabled(true);
    });
    card.appendChild(manualBtn);

    applyRovingTabindex(card);
    transcriptEl.appendChild(card);
    transcriptEl.scrollTop = transcriptEl.scrollHeight;
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
    if (retryUsed) {
      // Student already failed a grid demonstration — escalate without another Claude call.
      appendMessage('You\'ve worked really hard on this one. This is a good time to ask your teacher for help.', 'escalate');
      escalated = true;
      setInputEnabled(false);
      return;
    }
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
    if (transcriptEl.children.length > 0) return true;
    try { return JSON.parse(sessionStorage.getItem('hg_transcript_html_log') || '[]').length > 0; } catch (e) { return false; }
  }

  function downloadChat() {
    // Gather archived conversations from sessionStorage (lesson + earlier quiz sessions).
    var archivedHtml = '';
    try {
      var htmlLog = JSON.parse(sessionStorage.getItem('hg_transcript_html_log') || '[]');
      htmlLog.forEach(function(entry) {
        var label = entry.source === 'lesson' ? 'Lesson' : 'Quiz';
        archivedHtml += '<div class="page-sep">' + label + '</div><div class="wrap">' + entry.html + '</div>';
      });
    } catch (e) {}

    // Current page's live transcript (last quiz conversation, not yet archived).
    var currentHtml = transcriptEl.innerHTML
      ? '<div class="page-sep">Quiz</div><div class="wrap">' + transcriptEl.innerHTML + '</div>'
      : '';

    var body = archivedHtml + currentHtml;
    if (!body) return;

    var win = window.open('', '_blank');
    if (!win) return;
    var html = '<!DOCTYPE html><html><head>' +
      '<meta charset="utf-8">' +
      '<title>Hegemon Chat History</title>' +
      '<style>' +
      'body{font-family:"Space Grotesk",system-ui,sans-serif;max-width:600px;margin:40px auto;color:#16263d;padding:0 20px}' +
      'h1{font-size:1.1rem;color:#54647a;margin:0 0 24px;font-weight:600}' +
      '.page-sep{font-size:.75rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#54647a;border-bottom:2px solid #e6edf4;padding-bottom:6px;margin:28px 0 14px}' +
      '.wrap{display:flex;flex-direction:column;gap:12px;margin-bottom:8px}' +
      '.hg-msg{max-width:85%;padding:10px 14px;border-radius:12px;font-size:.9rem;line-height:1.6;white-space:pre-wrap;word-break:break-word}' +
      '.hg-msg--bot,.hg-msg--success{background:#f6f9fc;border:1px solid #e6edf4}' +
      '.hg-msg--user{background:#16263d;color:#fff;margin-left:auto;text-align:right}' +
      '.hg-msg--escalate{background:#fff8e6;border:1px solid #f5d87a}' +
      '.hg-msg--loading,.hg-msg--action,.hg-closed-note{display:none}' +
      '.hg-sep{text-align:center;font-size:.75rem;color:#54647a;margin:12px 0 4px;display:flex;align-items:center;gap:8px;font-weight:600}' +
      '.hg-sep::before,.hg-sep::after{content:"";flex:1;border-top:1px solid #e6edf4}' +
      '@media print{body{margin:20px;padding:0 10px}}' +
      '</style>' +
      '</head><body>' +
      '<h1>Hegemon Chat — Lesson 1</h1>' +
      body +
      '<p style="margin-top:32px;font-size:.75rem;color:#54647a">Use your browser\'s File &gt; Print &gt; Save as PDF to save a copy.</p>' +
      '</body></html>';
    win.document.write(html);
    win.document.close();
    win.focus();
  }

  return {
    init: init,
    open: openWithParams,
    close: hidePanel,
    reset: resetConversation,
    clearHistory: clearHistory,
    hasHistory: hasHistory,
    downloadChat: downloadChat,
    openFocus: openWithFocus,
    isOpen: function () { return open; },
    notifyCorrect: notifyCorrect,
    notifyWrong: notifyWrong
  };
}));
