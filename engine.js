/* ============================================================
   engine.js —— 虚拟键盘 + 手部动画 + 通用打字引擎
   依赖：common.js、data.js
   打字结束时回调全局函数 onFinish(stats, typingOpts)（由 app.js 定义）
   ============================================================ */

/* ============================================================
   一、虚拟键盘与手部动画（学习模块）
   ============================================================ */
function buildKeyboard(){
  const kb = $('#keyboard');
  if(!kb) return;
  kb.innerHTML = '';
  KEYBOARD_ROWS.forEach(row=>{
    const rowEl = document.createElement('div');
    rowEl.className = 'kb-row';
    row.forEach(code=>{
      const info = getFingerInfo(code);
      const el = document.createElement('div');
      el.className = 'key';
      el.dataset.code = code;
      if(info){
        if(info.hand==='left') el.classList.add('hand-left');
        else if(info.hand==='right') el.classList.add('hand-right');
        else el.classList.add('hand-thumb');
      }
      const labels = KEY_LABEL[code] || [FINGER_MAP[code] ? FINGER_MAP[code].char : code];
      if(labels.length === 1){ el.textContent = labels[0]; el.classList.add('fn'); }
      else el.innerHTML = '<span>'+labels[0]+'</span><small>'+(labels[1]||'')+'</small>';
      if(KEY_WIDTH[code]) el.classList.add(KEY_WIDTH[code]);
      el.addEventListener('mouseenter', e=>showTooltip(e, code));
      el.addEventListener('mouseleave', hideTooltip);
      el.addEventListener('mousemove', e=>moveTooltip(e));
      el.addEventListener('mousedown', ()=>pressKey(code));
      rowEl.appendChild(el);
    });
    kb.appendChild(rowEl);
  });
}

function showTooltip(e, code){
  const info = getFingerInfo(code);
  if(!info) return;
  const t = $('#keyTooltip');
  if(!t) return;
  t.innerHTML = '<div class="tt-char">'+escapeHtml(info.char)+'</div>' +
    '<div class="tt-line">对应手指：<b>'+info.fullName+'</b></div>' +
    '<div class="tt-line">键位行：<b>'+info.row+'</b></div>' +
    '<div class="tt-tip">💡 '+info.tip+'</div>';
  t.classList.add('show');
  moveTooltip(e);
}
function moveTooltip(e){
  const t = $('#keyTooltip');
  if(!t) return;
  const w = 230, h = t.offsetHeight || 160;
  let x = e.clientX + 16, y = e.clientY + 16;
  if(x + w > window.innerWidth - 8) x = e.clientX - w - 16;
  if(y + h > window.innerHeight - 8) y = e.clientY - h - 16;
  t.style.left = x + 'px'; t.style.top = y + 'px';
}
function hideTooltip(){ const t=$('#keyTooltip'); if(t) t.classList.remove('show'); }

function getKeyEl(code){ return $('#keyboard .key[data-code="'+code+'"]'); }
function pressKey(code){
  const info = getFingerInfo(code);
  const el = getKeyEl(code);
  if(el){ el.classList.add('active'); setTimeout(()=>el.classList.remove('active'), 200); }
  if(info) animateFinger(info.hand, info.finger);
}
function animateFinger(hand, finger){
  let els;
  if(finger === 'thumb'){
    els = [document.getElementById('LH-thumb'), document.getElementById('RH-thumb')];
  }else{
    const id = (hand==='left'?'LH':'RH') + '-' + finger;
    els = [document.getElementById(id)];
  }
  els.forEach(g=>{
    if(!g) return;
    g.classList.add('pressed');
    setTimeout(()=>g.classList.remove('pressed'), 200);
  });
}

/* ============================================================
   二、通用打字引擎
   ============================================================ */
let typingState = null;
let typingOpts = null;
let typingTimer = null;

function beginTyping(opts){
  typingOpts = opts;
  const words = opts.words;
  const fullText = words.map(w=>w.type).join(' ');
  const wordBounds = [];
  let pos = 0;
  words.forEach(w=>{ wordBounds.push(pos); pos += w.type.length + 1; });

  typingState = {
    text: fullText,
    charIndex: 0,
    correct: 0, wrong: 0, totalKeystrokes: 0,
    streak: 0, maxStreak: 0,
    startTime: null, endTime: null,
    errors: [], errorByKey: {}, errorByFinger: {},
    wordBounds, words, finished: false
  };

  const tTitle = $('#typingTitle');
  if(tTitle){ tTitle.textContent = opts.title; }
  const tSub = $('#typingSub');
  if(tSub){ tSub.textContent = opts.sub || ''; }
  const prompt = $('#typingPrompt'); if(prompt) prompt.textContent = '';
  const result = $('#typingResult'); if(result){ result.innerHTML=''; result.classList.remove('show'); }
  const hint = $('#fingerHint'); if(hint) hint.textContent = '';

  renderTypingText();
  updateTypingStats();

  const modal = $('#typingModal');
  if(modal) modal.classList.add('open');
  // 聚焦隐藏输入框（若浏览器阻止，则提示用户点击正文）
  setTimeout(()=>{
    const inp = $('#hiddenInput');
    if(inp){ inp.focus({preventScroll:true}); }
    if(document.activeElement !== inp){
      const tip = $('#focusTip'); if(tip) tip.style.display = 'block';
    }
  }, 30);
}

function currentWordInfo(){
  const st = typingState;
  if(!st) return '';
  let wi = st.wordBounds.length - 1;
  for(let i=0;i<st.wordBounds.length;i++){ if(st.charIndex <= st.wordBounds[i]){ wi = i; break; } }
  const w = st.words[wi];
  return (w && w.show) ? w.show : '';
}

function renderTypingText(){
  const st = typingState;
  const box = $('#typingText');
  if(!box || !st) return;
  let html = '';
  for(let i=0;i<st.text.length;i++){
    let cls = 'ch';
    if(i < st.charIndex) cls += ' ok';
    else if(i === st.charIndex) cls += ' current';
    html += '<span class="'+cls+'">'+escapeHtml(st.text[i]===' '?'\u00A0':st.text[i])+'</span>';
  }
  box.innerHTML = html || '&nbsp;';
  const prompt = $('#typingPrompt'); if(prompt) prompt.textContent = currentWordInfo();
}

function updateTypingStats(){
  const st = typingState;
  if(!st) return;
  const elapsed = st.startTime ? ((st.endTime||Date.now()) - st.startTime)/1000 : 0;
  const minutes = elapsed/60 || 0;
  const wpm = minutes>0 ? Math.round((st.correct/5)/minutes) : 0;
  const cpm = minutes>0 ? Math.round(st.correct/minutes) : 0;
  const acc = st.totalKeystrokes>0 ? Math.round(st.correct/st.totalKeystrokes*100) : 100;
  const set = (id,v)=>{ const el=$('#'+id); if(el) el.textContent = v; };
  set('stWpm', wpm); set('stCpm', cpm); set('stAcc', acc+'%');
  set('stTime', Math.round(elapsed)+'s'); set('stStreak', st.streak);
}

function noteFingerHint(expectedChar){
  const code = charToCode(expectedChar);
  const info = code ? getFingerInfo(code) : null;
  if(info) return '💡 正确指法：「'+escapeHtml(expectedChar)+'」请用 '+info.fullName+'（'+info.row+'）击打';
  return '';
}

function finishTyping(){
  const st = typingState;
  if(!st || st.finished) return;
  st.finished = true;
  st.endTime = Date.now();
  const elapsed = (st.endTime - st.startTime)/1000;
  const acc = st.totalKeystrokes>0 ? st.correct/st.totalKeystrokes : 1;
  const wpm = elapsed>0 ? Math.round((st.correct/5)/(elapsed/60)) : 0;
  const cpm = elapsed>0 ? Math.round(st.correct/(elapsed/60)) : 0;
  const stats = {
    correct: st.correct, wrong: st.wrong, total: st.totalKeystrokes,
    accuracy: acc, wpm, cpm, time: elapsed,
    maxStreak: st.maxStreak, errors: st.errors,
    errorByKey: st.errorByKey, errorByFinger: st.errorByFinger
  };
  updateTypingStats();
  soundDone();
  if(typeof onFinish === 'function') onFinish(stats, typingOpts);
}

function onTypingKeydown(e){
  const st = typingState;
  if(!st || st.finished) return;
  if(e.isComposing || e.keyCode === 229) return;

  if(e.key === ' ' || e.key === 'Backspace' || (e.key && e.key.length===1)) e.preventDefault();

  if(st.startTime === null){
    st.startTime = Date.now();
    if(typingTimer) clearInterval(typingTimer);
    typingTimer = setInterval(()=>{ if(typingState && !typingState.finished) updateTypingStats(); }, 500);
    const tip = $('#focusTip'); if(tip) tip.style.display = 'none';
  }

  if(e.key === 'Backspace') return;
  if(['Enter','Tab','Shift','Control','Alt','CapsLock','Escape','Meta'].includes(e.key) || e.key.startsWith('Arrow')) return;

  const expected = st.text[st.charIndex];
  if(expected === undefined){ finishTyping(); return; }

  const typed = e.key;
  st.totalKeystrokes++;

  if(typed === expected){
    st.correct++; st.streak++;
    if(st.streak > st.maxStreak) st.maxStreak = st.streak;
    soundKey();
  }else{
    st.wrong++; st.streak = 0;
    st.errors.push({expected, typed});
    st.errorByKey[expected] = (st.errorByKey[expected]||0)+1;
    const code = charToCode(expected);
    if(code){ const info = getFingerInfo(code); if(info){ const fk = info.fullName; st.errorByFinger[fk] = (st.errorByFinger[fk]||0)+1; } }
    soundError();
    const hint = noteFingerHint(expected);
    if(hint){
      const fh = $('#fingerHint');
      if(fh){ fh.textContent = hint; setTimeout(()=>{ if(fh.textContent === hint) fh.textContent=''; }, 1800); }
    }
  }

  st.charIndex++;
  renderTypingText();
  updateTypingStats();

  if(st.charIndex >= st.text.length){
    finishTyping();
  }else if(typingOpts.mode==='level' && typingOpts.level && typingOpts.level.time){
    if((Date.now()-st.startTime)/1000 > typingOpts.level.time){
      toast('⏰ 时间到！未在限定时间内完成', '⏰');
      finishTyping();
    }
  }
}

function closeTyping(){
  if(typingTimer) clearInterval(typingTimer);
  typingState = null;
  const modal = $('#typingModal'); if(modal) modal.classList.remove('open');
  if(typeof onTypingClose === 'function') onTypingClose(typingOpts);
}

/* 全局键盘监听：打字弹窗打开时，由引擎接管按键 */
document.addEventListener('keydown', e=>{
  const modal = $('#typingModal');
  if(!modal || !modal.classList.contains('open')) return;
  onTypingKeydown(e);
});
