/* ============================================================
   app.js —— 主应用逻辑：会话守卫、导航、首页仪表盘、四大模块
   依赖：common.js、data.js、engine.js
   ============================================================ */
(function(){
  /* ---------- 会话守卫：未登录跳转登录页 ---------- */
  if(!Auth.current()){
    window.location.replace('index.html');
    return;
  }
  const me = Auth.current();

  /* ---------- 每用户数据状态 ---------- */
  let progress = UserData.get('progress', {completed:{}});
  let records = UserData.get('records', []);
  let leaderboard = UserData.get('leaderboard', {});
  let achievements = UserData.get('achievements', {});
  let totalCorrectKeys = UserData.get('totalKeys', 0);

  /* ============================================================
     导航栏
     ============================================================ */
  $('#navUsername').textContent = me.username;
  $('#navAvatar').textContent = Auth.avatarChar(me.username);
  $('#btnTheme').addEventListener('click', cycleTheme);
  $('#btnSound').addEventListener('click', toggleSound);
  $('#btnLogout').addEventListener('click', ()=>{
    if(confirm('确定要退出登录吗？')){ Auth.logout(); window.location.replace('index.html'); }
  });

  $$('.nav-tab').forEach(btn=>{
    btn.addEventListener('click', ()=>switchPage(btn.dataset.page));
  });

  function switchPage(name){
    $$('.nav-tab').forEach(b=>b.classList.toggle('active', b.dataset.page===name));
    $$('.page').forEach(p=>p.classList.toggle('active', p.id==='page-'+name));
    if(name === 'home') renderHome();
    if(name === 'challenge') renderLevels();
    if(name === 'stats') renderStats();
    if(name === 'learn') setTimeout(fitKeyboard, 60);
  }

  /* 键盘随容器宽度等比缩放 */
  function fitKeyboard(){
    const kb = $('#keyboard');
    if(!kb || !kb.offsetParent) return;
    const card = kb.closest('.keyboard-card');
    if(!card) return;
    kb.style.transform = 'none'; kb.style.width = 'auto'; kb.style.height = 'auto';
    const natural = kb.scrollWidth;
    const naturalH = kb.scrollHeight;
    const avail = Math.max(card.clientWidth - 44, 260);
    const scale = Math.min(1, avail / natural);
    if(scale < 0.999){
      kb.style.transform = 'scale(' + scale + ')';
      kb.style.transformOrigin = 'top left';
      kb.style.width = Math.round(natural * scale) + 'px';
      kb.style.height = Math.round(naturalH * scale) + 'px';
    }else{
      kb.style.transform = ''; kb.style.width = ''; kb.style.height = '';
    }
  }
  let fitTimer = null;
  window.addEventListener('resize', ()=>{
    clearTimeout(fitTimer);
    fitTimer = setTimeout(fitKeyboard, 120);
  });

  /* 庆祝彩带 */
  function launchConfetti(){
    const c = document.createElement('div');
    c.className = 'confetti-container';
    document.body.appendChild(c);
    const colors = ['#4f6ef7','#22c1a3','#f0a24b','#e05b8a','#ffd34d','#7b5cf0','#43c59e'];
    for(let i=0;i<90;i++){
      const p = document.createElement('i');
      const size = 6 + Math.random()*8;
      p.style.left = Math.random()*100 + 'vw';
      p.style.width = size + 'px';
      p.style.height = size * (Math.random()<.5 ? 1 : 0.5) + 'px';
      p.style.background = colors[Math.floor(Math.random()*colors.length)];
      p.style.animationDuration = (2 + Math.random()*2) + 's';
      p.style.animationDelay = Math.random()*0.6 + 's';
      p.style.transform = 'rotate(' + Math.random()*360 + 'deg)';
      c.appendChild(p);
    }
    setTimeout(()=>c.remove(), 4800);
  }

  /* ============================================================
     首页仪表盘
     ============================================================ */
  const MODULES = [
    {icon:'🎓', name:'学习模块', desc:'标准 QWERTY 虚拟键盘，悬停查看指法，敲击观察手部动画，打牢指法基础。', tag:'指法入门', goto:'learn', cls:'c1'},
    {icon:'🏆', name:'闯关模块', desc:'24 关三大分类，英语/单词/拼音循序渐进，获得星级评价并逐步解锁。', tag:'24 关', goto:'challenge', cls:'c2'},
    {icon:'✍️', name:'练习模块', desc:'数字、字母、单词、句子、自定义 10 类练习，实时查看速度与正确率。', tag:'10 类', goto:'practice', cls:'c3'},
    {icon:'📊', name:'统计中心', desc:'历史记录、进步曲线、成就徽章、排行榜，见证你的每一点进步。', tag:'数据', goto:'stats', cls:'c4'}
  ];

  function renderHome(){
    const hi = $('#heroHi');
    const hour = new Date().getHours();
    let greet = '你好';
    if(hour < 6) greet = '夜深了'; else if(hour < 12) greet = '早上好'; else if(hour < 18) greet = '下午好'; else greet = '晚上好';
    hi.textContent = greet + '，' + me.username + '！';

    // 模块卡片
    const grid = $('#moduleGrid');
    grid.innerHTML = '';
    MODULES.forEach(m=>{
      const el = document.createElement('div');
      el.className = 'module-card ' + m.cls;
      el.innerHTML = '<div class="mc-icon">'+m.icon+'</div><div class="mc-name">'+m.name+'</div><div class="mc-desc">'+m.desc+'</div><div class="mc-tag">'+m.tag+'</div>';
      el.addEventListener('click', ()=>switchPage(m.goto));
      grid.appendChild(el);
    });

    // 快捷统计
    const total = records.length;
    const bestWpm = records.reduce((mx,r)=>Math.max(mx,r.wpm), 0);
    const avgAcc = total ? Math.round(records.reduce((s,r)=>s+r.accuracy,0)/total) : 0;
    const totalTime = records.reduce((s,r)=>s+r.time,0);
    $('#quickStats').innerHTML =
      '<div class="quick-stat"><div class="qs-v">'+total+'</div><div class="qs-l">练习次数</div></div>' +
      '<div class="quick-stat"><div class="qs-v">'+bestWpm+'</div><div class="qs-l">最佳 WPM</div></div>' +
      '<div class="quick-stat"><div class="qs-v">'+avgAcc+'%</div><div class="qs-l">平均正确率</div></div>' +
      '<div class="quick-stat"><div class="qs-v">'+fmtTime(totalTime)+'</div><div class="qs-l">累计时长</div></div>';

    renderDaily('#dailyBoxHome');
    renderAchievementPreview();
  }

  function renderAchievementPreview(){
    const box = $('#achPreview');
    const unlocked = ACHIEVEMENTS.filter(a=>achievements[a.id]);
    if(!unlocked.length){
      box.innerHTML = '<div style="color:var(--text-sub);font-size:13px">还没有解锁成就，去练习吧！🌱</div>';
      return;
    }
    box.innerHTML = '<div style="display:flex;flex-wrap:wrap;gap:10px">' +
      unlocked.slice(0,6).map(a=>'<div style="background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:10px 12px;font-size:13px;text-align:center"><div style="font-size:22px">'+a.icon+'</div><div style="font-weight:700;margin-top:2px">'+a.name+'</div></div>').join('') +
      '</div>';
  }

  /* ============================================================
     学习模块：物理键盘 → 手部动画
     ============================================================ */
  document.addEventListener('keydown', e=>{
    const modal = $('#typingModal');
    if(modal && modal.classList.contains('open')) return;
    if(e.isComposing || e.keyCode === 229) return;
    const learnPage = $('#page-learn');
    if(!learnPage || !learnPage.classList.contains('active')) return;
    if(FINGER_MAP[e.code]){
      const ae = document.activeElement;
      if(ae && /INPUT|TEXTAREA/.test(ae.tagName)) return;
      e.preventDefault();
      pressKey(e.code);
    }
  });

  /* ============================================================
     闯关模块
     ============================================================ */
  const challengeCat = { value:'全部' };
  function isUnlocked(idx){ return idx === 0 || !!progress.completed[idx-1]; }
  function starStr(n){ let s=''; for(let i=0;i<3;i++) s += i<n ? '⭐' : '☆'; return s; }

  function renderLevels(){
    const catBox = $('#challengeCats');
    const cats = ['全部', ...new Set(LEVELS.map(l=>l.cat))];
    catBox.innerHTML = '';
    cats.forEach(c=>{
      const b = document.createElement('button');
      b.className = 'cat-tab' + (challengeCat.value===c ? ' active' : '');
      b.textContent = c;
      b.addEventListener('click', ()=>{ challengeCat.value = c; renderLevels(); });
      catBox.appendChild(b);
    });

    const grid = $('#levelGrid');
    grid.innerHTML = '';
    LEVELS.forEach((lv, i)=>{
      if(challengeCat.value !== '全部' && lv.cat !== challengeCat.value) return;
      const done = progress.completed[i] || 0;
      const locked = !isUnlocked(i);
      const el = document.createElement('div');
      el.className = 'level-item' + (locked ? ' locked' : '');
      let targetDesc = '正确率 ≥ ' + Math.round(lv.acc*100) + '%';
      if(lv.time) targetDesc += ' · 限时 ' + lv.time + ' 秒';
      if(lv.streak) targetDesc += ' · 连续 ' + lv.streak + ' 次';
      el.innerHTML =
        '<div class="lv-num">第 ' + (i+1) + ' 关</div>' +
        '<div class="lv-name">'+lv.name+'</div>' +
        '<div class="lv-cat">'+lv.cat+'</div>' +
        '<div class="lv-target">🎯 '+targetDesc+'</div>' +
        (locked ? '<div class="lv-lock">🔒</div>' : '<div class="lv-stars">'+starStr(done)+'</div>');
      if(!locked) el.addEventListener('click', ()=>startLevel(i));
      else el.addEventListener('click', ()=>toast('请先完成上一关以解锁', '🔒'));
      grid.appendChild(el);
    });
  }

  function startLevel(idx){
    const lv = LEVELS[idx];
    beginTyping({
      mode:'level', levelIndex: idx, level: lv,
      title:'第 ' + (idx+1) + ' 关 · ' + lv.name,
      words: lv.words, sub: lv.cat + ' · ' + lv.tip
    });
  }

  function finishLevel(stats, opts){
    const lv = opts.level, idx = opts.levelIndex;
    const accOk = stats.accuracy >= lv.acc;
    const timeOk = !lv.time || stats.time <= lv.time;
    const streakOk = !lv.streak || stats.maxStreak >= lv.streak;
    const passed = accOk && timeOk && streakOk;
    let stars = 0;
    if(passed) stars = stats.accuracy >= .98 ? 3 : (stats.accuracy >= .95 ? 2 : 1);

    const prev = progress.completed[idx] || 0;
    if(stars > prev){ progress.completed[idx] = stars; UserData.set('progress', progress); }
    if(passed) checkAchievements({levelPass:true, allLevels:Object.keys(progress.completed).length >= LEVELS.length, keys:stats.correct, streak:stats.maxStreak});

    const rp = $('#typingResult');

    if(passed){
      // —— 闯关成功：庆祝界面 + 彩带 ——
      launchConfetti();
      rp.innerHTML =
        '<div class="result-head success">' +
          '<div class="rh-emoji pop">🎉</div>' +
          '<div class="rh-stars big pop" style="animation-delay:.08s">'+starStr(stars)+'</div>' +
          '<div class="rh-title celebrate-title pop" style="animation-delay:.16s">闯关成功！</div>' +
          '<div class="rh-sub">获得 '+stars+' 星评价'+(stars===3?'，完美通关！':'，继续加油！')+'</div>' +
        '</div>' +
        '<div class="result-grid">'+resultCards(stats)+'</div>' +
        '<div class="result-actions">' +
          '<button class="btn" id="btnRetryLevel">🔄 再来一次</button>' +
          '<button class="btn secondary" id="btnNextLevel">'+(LEVELS[idx+1] ? '下一关 →' : '🎉 全部通关！返回')+'</button>' +
        '</div>';
      $('#btnRetryLevel').addEventListener('click', ()=>{ rp.classList.remove('show'); startLevel(idx); });
      $('#btnNextLevel').addEventListener('click', ()=>{
        if(LEVELS[idx+1]) startLevel(idx+1);
        else { closeTyping(); }
      });
    }else{
      // —— 闯关失败：失败界面 ——
      const reasons = [];
      if(!accOk) reasons.push('正确率 '+Math.round(stats.accuracy*100)+'%，未达到 '+Math.round(lv.acc*100)+'%');
      if(!timeOk) reasons.push('用时 '+Math.round(stats.time)+' 秒，超过限时 '+lv.time+' 秒');
      if(!streakOk) reasons.push('最高连续 '+stats.maxStreak+' 次，未达到 '+lv.streak+' 次');
      rp.innerHTML =
        '<div class="result-head fail">' +
          '<div class="rh-emoji">😢</div>' +
          '<div class="rh-stars">☆☆☆</div>' +
          '<div class="rh-title">挑战失败</div>' +
          '<div class="fail-reasons"><div class="fr-title">未达成目标：</div><ul>' +
            reasons.map(r=>'<li>'+r+'</li>').join('') +
          '</ul></div>' +
          '<div class="rh-sub">别灰心，多加练习一定能过！💪</div>' +
        '</div>' +
        '<div class="result-grid">'+resultCards(stats)+'</div>' +
        '<div class="result-actions">' +
          '<button class="btn" id="btnRetryLevel">🔄 再试一次</button>' +
          '<button class="btn ghost" id="btnBackLevels">返回关卡列表</button>' +
        '</div>';
      $('#btnRetryLevel').addEventListener('click', ()=>{ rp.classList.remove('show'); startLevel(idx); });
      $('#btnBackLevels').addEventListener('click', closeTyping);
    }
    rp.classList.add('show');
  }

  /* ============================================================
     练习模块
     ============================================================ */
  function renderPractice(){
    const grid = $('#practiceGrid');
    grid.innerHTML = '';
    PRACTICE_TYPES.forEach(pt=>{
      const el = document.createElement('div');
      el.className = 'practice-item';
      el.innerHTML = '<div class="pi-icon">'+pt.icon+'</div><div class="pi-name">'+pt.name+'</div><div class="pi-desc">'+pt.desc+'</div>';
      el.addEventListener('click', ()=>{
        if(pt.custom){ $('#customCard').style.display = 'block'; $('#customText').focus(); }
        else startPractice(pt);
      });
      grid.appendChild(el);
    });
  }
  function startPractice(pt){
    const text = pt.text || pt.gen();
    beginTyping({
      mode:'practice', practiceType: pt.name, practiceId: pt.id,
      title: pt.icon + ' ' + pt.name, sub:'自由练习',
      words: text.split(' ').filter(Boolean).map(w=>({show:'', type:w}))
    });
  }

  function finishPractice(stats, opts){
    const rec = {
      id: Date.now(), type: opts.practiceType, practiceId: opts.practiceId,
      wpm: stats.wpm, cpm: stats.cpm, accuracy: Math.round(stats.accuracy*100),
      time: Math.round(stats.time), correct: stats.correct, wrong: stats.wrong,
      maxStreak: stats.maxStreak, date: Date.now()
    };
    records.unshift(rec);
    if(records.length > 500) records = records.slice(0,500);
    UserData.set('records', records);

    if(!leaderboard[opts.practiceId] || stats.wpm > leaderboard[opts.practiceId].wpm){
      leaderboard[opts.practiceId] = {type: opts.practiceType, wpm: stats.wpm, acc: Math.round(stats.accuracy*100), date: Date.now()};
      UserData.set('leaderboard', leaderboard);
    }

    checkAchievements({practice:true, keys:stats.correct, streak:stats.maxStreak, wpm:stats.wpm});

    const errKeys = Object.entries(stats.errorByKey).sort((a,b)=>b[1]-a[1]);
    const maxErr = errKeys.length ? errKeys[0][1] : 1;
    const errDistHtml = errKeys.length
      ? errKeys.slice(0,8).map(([k,n])=>'<div class="err-row"><span class="k">'+escapeHtml(k===' '?'空格':k)+'</span><span class="bar"><i style="width:'+Math.round(n/maxErr*100)+'%"></i></span><span class="n">'+n+'</span></div>').join('')
      : '<div style="color:var(--text-sub);font-size:13px">没有错误，太棒了！👏</div>';
    const errListHtml = stats.errors.length
      ? stats.errors.slice(0,30).map(er=>'<span style="color:var(--bad)">'+escapeHtml(er.expected===' '?'␣':er.expected)+'</span>→<span style="color:var(--text)">'+escapeHtml(er.typed===' '?'␣':er.typed)+'</span>').join('　')
      : '无错误字符';
    const fingerErrHtml = Object.keys(stats.errorByFinger).length
      ? '<div style="font-size:13px;color:var(--text-sub);margin-top:8px">🖐️ 手指错误分布：' +
        Object.entries(stats.errorByFinger).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([f,n])=>'<b style="color:var(--text)">'+f+'</b> '+n+' 次').join('　') + '</div>'
      : '<div style="font-size:13px;color:var(--text-sub);margin-top:8px">🖐️ 指法良好，无明显手指错误</div>';

    const rp = $('#typingResult');
    rp.innerHTML =
      '<div class="result-head"><div class="rh-title">✅ 练习完成</div><div class="rh-sub">'+opts.practiceType+' · '+fmtDate(Date.now())+'</div></div>' +
      '<div class="result-grid">'+resultCards(stats)+'</div>' +
      '<div class="card" style="margin:0 0 12px;padding:14px"><h3 style="font-size:14px">🔑 错误键分布</h3><div class="err-dist">'+errDistHtml+'</div>'+fingerErrHtml+'</div>' +
      '<div class="card" style="margin:0 0 12px;padding:14px"><h3 style="font-size:14px">❌ 错误字符列表</h3><div class="err-list">'+errListHtml+'</div></div>' +
      '<div class="result-actions"><button class="btn" id="btnRetryPractice">🔄 再来一次</button><button class="btn secondary" id="btnClosePractice">完成</button></div>';
    rp.classList.add('show');

    $('#btnRetryPractice').addEventListener('click', ()=>{
      rp.classList.remove('show');
      if(opts.practiceId === 'custom') startPractice({id:'custom',icon:'📝',name:'自定义练习',desc:'',text: $('#customText').value.trim()});
      else { const pt = PRACTICE_TYPES.find(p=>p.id===opts.practiceId); if(pt) startPractice(pt); }
    });
    $('#btnClosePractice').addEventListener('click', closeTyping);
  }

  function resultCards(stats){
    return '<div class="result-card"><div class="rv">'+stats.wpm+'</div><div class="rl">速度 WPM</div></div>' +
      '<div class="result-card"><div class="rv">'+stats.cpm+'</div><div class="rl">字符/分 CPM</div></div>' +
      '<div class="result-card"><div class="rv">'+Math.round(stats.accuracy*100)+'%</div><div class="rl">正确率</div></div>' +
      '<div class="result-card"><div class="rv">'+fmtTime(stats.time)+'</div><div class="rl">用时</div></div>' +
      '<div class="result-card"><div class="rv">'+stats.maxStreak+'</div><div class="rl">最大连续</div></div>' +
      '<div class="result-card"><div class="rv">'+stats.wrong+'</div><div class="rl">错误数</div></div>';
  }

  /* ============================================================
     成就系统
     ============================================================ */
  function unlockAchievement(id){
    if(!achievements[id]){
      achievements[id] = Date.now();
      UserData.set('achievements', achievements);
      const a = ACHIEVEMENTS.find(x=>x.id===id);
      if(a) toast('解锁成就：'+a.icon+' '+a.name, '🏅');
    }
  }
  function checkAchievements(ctx){
    if(ctx.practice) unlockAchievement('first');
    if(ctx.streak >= 100) unlockAchievement('streak100');
    if(ctx.wpm >= 60) unlockAchievement('wpm60');
    if(ctx.wpm >= 100) unlockAchievement('wpm100');
    if(ctx.allLevels) unlockAchievement('alllevels');
    if(ctx.daily) unlockAchievement('daily');
    if(ctx.keys){
      totalCorrectKeys += ctx.keys;
      UserData.set('totalKeys', totalCorrectKeys);
      if(totalCorrectKeys >= 1000) unlockAchievement('keys1000');
    }
    const days = new Set(records.map(r=>new Date(r.date).toDateString()));
    if(days.size >= 7) unlockAchievement('days7');
  }

  /* ============================================================
     统计中心
     ============================================================ */
  function renderStats(){
    const total = records.length;
    const bestWpm = records.reduce((mx,r)=>Math.max(mx,r.wpm), 0);
    const avgAcc = total ? Math.round(records.reduce((s,r)=>s+r.accuracy,0)/total) : 0;
    const totalTime = records.reduce((s,r)=>s+r.time,0);
    $('#summaryGrid').innerHTML =
      '<div class="stat-summary"><div class="sv">'+total+'</div><div class="sl">练习总次数</div></div>' +
      '<div class="stat-summary"><div class="sv">'+bestWpm+'</div><div class="sl">最佳 WPM</div></div>' +
      '<div class="stat-summary"><div class="sv">'+avgAcc+'%</div><div class="sl">平均正确率</div></div>' +
      '<div class="stat-summary"><div class="sv">'+fmtTime(totalTime)+'</div><div class="sl">累计练习时长</div></div>' +
      '<div class="stat-summary"><div class="sv">'+totalCorrectKeys+'</div><div class="sl">累计正确键数</div></div>';
    drawChart(); renderAchievements(); renderLeaderboard(); renderHistory();
  }

  function drawChart(){
    const cv = $('#progressChart');
    if(!cv) return;
    const ctx = cv.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = cv.clientWidth || 800, h = 260;
    cv.width = w * dpr; cv.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0,0,w,h);

    const data = records.slice(0,20).reverse();
    const cssVar = n => (getComputedStyle(document.body).getPropertyValue(n) || '').trim();
    if(data.length < 2){
      ctx.fillStyle = cssVar('--text-sub') || '#888';
      ctx.font = '14px "Microsoft YaHei"'; ctx.textAlign = 'center';
      ctx.fillText('完成更多练习后，这里会显示你的进步曲线', w/2, h/2);
      return;
    }
    const pad = 40, plotW = w - pad*2, plotH = h - pad*2;
    const maxWpm = Math.max(...data.map(d=>d.wpm), 10) * 1.15;
    ctx.strokeStyle = 'rgba(128,140,160,.2)';
    ctx.fillStyle = cssVar('--text-sub') || '#888';
    ctx.font = '11px "Microsoft YaHei"'; ctx.textAlign = 'right';
    for(let i=0;i<=4;i++){
      const y = pad + plotH - plotH*i/4;
      ctx.beginPath(); ctx.moveTo(pad,y); ctx.lineTo(w-pad,y); ctx.stroke();
      ctx.fillText(Math.round(maxWpm*i/4), pad-6, y+4);
    }
    ctx.textAlign = 'center';
    data.forEach((d,i)=>{ const x = pad + plotW*i/(data.length-1); if(i===0||i===data.length-1||data.length<=8) ctx.fillText(d.accuracy+'%', x, h-8); });

    ctx.strokeStyle = cssVar('--accent') || '#4f6ef7';
    ctx.lineWidth = 2.5; ctx.beginPath();
    data.forEach((d,i)=>{ const x = pad + plotW*i/(data.length-1); const y = pad + plotH - (d.wpm/maxWpm)*plotH; i===0?ctx.moveTo(x,y):ctx.lineTo(x,y); });
    ctx.stroke();
    data.forEach((d,i)=>{ const x = pad + plotW*i/(data.length-1); const y = pad + plotH - (d.wpm/maxWpm)*plotH; ctx.beginPath(); ctx.arc(x,y,3.5,0,Math.PI*2); ctx.fillStyle = cssVar('--accent')||'#4f6ef7'; ctx.fill(); });

    ctx.strokeStyle = cssVar('--accent2') || '#22c1a3';
    ctx.setLineDash([5,4]); ctx.lineWidth = 2; ctx.beginPath();
    data.forEach((d,i)=>{ const x = pad + plotW*i/(data.length-1); const y = pad + plotH - (d.accuracy/100)*plotH; i===0?ctx.moveTo(x,y):ctx.lineTo(x,y); });
    ctx.stroke(); ctx.setLineDash([]);
  }

  function renderAchievements(){
    const grid = $('#achGrid');
    if(!grid) return;
    grid.innerHTML = '';
    ACHIEVEMENTS.forEach(a=>{
      const unlocked = !!achievements[a.id];
      const el = document.createElement('div');
      el.className = 'ach-item' + (unlocked ? ' unlocked' : '');
      el.innerHTML = '<div class="ai-icon">'+a.icon+'</div><div class="ai-name">'+a.name+'</div><div class="ai-desc">'+a.desc+(unlocked?'<br><small>'+fmtDate(achievements[a.id])+'</small>':'')+'</div>';
      grid.appendChild(el);
    });
  }

  function renderLeaderboard(){
    const box = $('#leaderboard');
    if(!box) return;
    const entries = Object.values(leaderboard).sort((a,b)=>b.wpm-a.wpm);
    if(!entries.length){ box.innerHTML = '<div style="color:var(--text-sub);font-size:14px">暂无记录，去练习吧！</div>'; return; }
    const medal = ['🥇','🥈','🥉'];
    box.innerHTML = '<table class="lb-table"><thead><tr><th>排名</th><th>练习类型</th><th>最佳 WPM</th><th>正确率</th><th>时间</th></tr></thead><tbody>' +
      entries.map((e,i)=>'<tr><td class="rank">'+(medal[i]||(i+1))+'</td><td>'+escapeHtml(e.type)+'</td><td><b>'+e.wpm+'</b></td><td>'+e.acc+'%</td><td>'+fmtDate(e.date)+'</td></tr>').join('') +
      '</tbody></table>';
  }

  function renderHistory(){
    const tb = $('#historyTable');
    if(!tb) return;
    if(!records.length){ tb.innerHTML = '<tr><td style="color:var(--text-sub)">暂无记录</td></tr>'; return; }
    tb.innerHTML = '<thead><tr><th>时间</th><th>类型</th><th>WPM</th><th>CPM</th><th>正确率</th><th>用时</th><th>连续</th></tr></thead><tbody>' +
      records.slice(0,50).map(r=>'<tr><td>'+fmtDate(r.date)+'</td><td>'+escapeHtml(r.type)+'</td><td>'+r.wpm+'</td><td>'+r.cpm+'</td><td>'+r.accuracy+'%</td><td>'+fmtTime(r.time)+'</td><td>'+r.maxStreak+'</td></tr>').join('') +
      '</tbody>';
  }

  /* ============================================================
     每日挑战
     ============================================================ */
  function dailySeed(){ const d=new Date(); return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate(); }
  function seededRandom(seed){ let s=seed; return function(){ s=(s*9301+49297)%233280; return s/233280; }; }
  function generateDaily(){
    const rng = seededRandom(dailySeed());
    const pool = [
      {name:'随机字母', gen:()=>randStr('abcdefghijklmnopqrstuvwxyz', 40)},
      {name:'随机数字', gen:()=>randStr('0123456789', 40)},
      {name:'英语单词', gen:()=>randomWords(12).join(' ')},
      {name:'英文句子', gen:()=>pick(EN_SENTENCES)},
      {name:'拼音句子', gen:()=>pick(PY_SENTENCES)}
    ];
    const task = pool[Math.floor(rng()*pool.length)];
    return { task, text: task.gen() };
  }
  function renderDaily(targetSel){
    const box = $(targetSel);
    if(!box) return;
    const done = UserData.get('daily', {});
    const daily = generateDaily();
    if(done.date === dailySeed()){
      box.innerHTML = '<div class="dt-title">✅ 今日挑战已完成</div><div class="dt-desc">任务：'+daily.task.name+' · 已解锁「今日挑战完成」成就</div><div class="dt-desc">明天再来挑战新任务吧！</div>';
      return;
    }
    box.innerHTML =
      '<div class="dt-title">🎯 今日挑战</div>' +
      '<div class="dt-desc">任务类型：<b>'+daily.task.name+'</b> · 完成即解锁专属成就</div>' +
      '<div class="dt-desc" style="font-family:monospace;color:var(--accent)">'+escapeHtml(daily.text.slice(0,60))+(daily.text.length>60?'…':'')+'</div>' +
      '<button class="btn" id="btnDailyStart">开始今日挑战</button>';
    $('#btnDailyStart').addEventListener('click', ()=>{
      beginTyping({ mode:'daily', dailyName: daily.task.name, title:'🎯 每日挑战', sub:'今日任务：'+daily.task.name, words: daily.text.split(' ').filter(Boolean).map(w=>({show:'',type:w})) });
    });
  }

  function finishDaily(stats, opts){
    UserData.set('daily', {date: dailySeed()});
    unlockAchievement('daily');
    const rec = { id:Date.now(), type:'每日挑战', practiceId:'daily', wpm:stats.wpm, cpm:stats.cpm,
      accuracy:Math.round(stats.accuracy*100), time:Math.round(stats.time), correct:stats.correct,
      wrong:stats.wrong, maxStreak:stats.maxStreak, date:Date.now() };
    records.unshift(rec);
    if(records.length>500) records = records.slice(0,500);
    UserData.set('records', records);
    checkAchievements({practice:true, keys:stats.correct, streak:stats.maxStreak, wpm:stats.wpm, daily:true});

    const rp = $('#typingResult');
    rp.innerHTML =
      '<div class="result-head"><div class="rh-title">✅ 每日挑战完成</div><div class="rh-sub">今日任务：'+opts.dailyName+' · 已解锁「今日挑战完成」成就</div></div>' +
      '<div class="result-grid">'+resultCards(stats)+'</div>' +
      '<div class="result-actions"><button class="btn secondary" id="btnCloseDaily">完成</button></div>';
    rp.classList.add('show');
    $('#btnCloseDaily').addEventListener('click', closeTyping);
  }

  /* ============================================================
     打字结束 / 关闭 回调（供 engine.js 调用）
     ============================================================ */
  window.onFinish = function(stats, opts){
    if(!opts) return;
    if(opts.mode === 'level') finishLevel(stats, opts);
    else if(opts.mode === 'daily') finishDaily(stats, opts);
    else finishPractice(stats, opts);
  };
  window.onTypingClose = function(opts){
    if(opts && opts.mode === 'level') renderLevels();
  };

  /* ============================================================
     初始化
     ============================================================ */
  $('#typingExit').addEventListener('click', closeTyping);
  $('#typingModal').addEventListener('click', e=>{ if(e.target === $('#typingModal')) closeTyping(); });
  $('#typingText').addEventListener('click', ()=>{ const inp=$('#hiddenInput'); if(inp) inp.focus(); });
  $('#btnCustomStart').addEventListener('click', ()=>{
    const t = $('#customText').value.trim();
    if(t.length < 5){ toast('请至少输入 5 个字符', '⚠️'); return; }
    startPractice({id:'custom', icon:'📝', name:'自定义练习', desc:'', text:t});
  });

  buildKeyboard();
  renderPractice();
  renderLevels();
  renderHome();
})();
