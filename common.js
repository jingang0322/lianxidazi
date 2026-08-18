/* ============================================================
   common.js —— 通用工具、本地存储、密码哈希、账号会话、主题与音效
   纯静态托管方案：账号与数据均保存在浏览器 localStorage 中。
   说明：此方案无需后端即可运行，但 localStorage 属于本地数据，
   无法跨设备/跨浏览器同步，且安全性有限（仅供学习演示）。
   ============================================================ */

/* ---------- DOM 快捷方式 ---------- */
function $(s, r){ return (r || document).querySelector(s); }
function $$(s, r){ return Array.from((r || document).querySelectorAll(s)); }
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

/* ---------- 本地存储 ---------- */
const Store = {
  get(k, d){ try{ const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); }catch(e){ return d; } },
  set(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} },
  remove(k){ try{ localStorage.removeItem(k); }catch(e){} }
};

/* ---------- 时间格式化 ---------- */
function fmtTime(s){
  if(s < 60) return Math.round(s) + ' 秒';
  const m = Math.floor(s/60), r = Math.round(s%60);
  return m + ' 分 ' + r + ' 秒';
}
function fmtDate(ts){
  const d = new Date(ts); const p = n => (n<10?'0':'')+n;
  return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())+' '+p(d.getHours())+':'+p(d.getMinutes());
}

/* ---------- Toast ---------- */
let toastTimer = null;
function toast(msg, icon){
  let t = $('#toast');
  if(!t) return;
  t.innerHTML = '<span class="t-icon">'+(icon||'🎉')+'</span>'+msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>t.classList.remove('show'), 2600);
}

/* ============================================================
   SHA-256（纯 JS 实现，兼容非 HTTPS / file:// 环境）
   ============================================================ */
function sha256(ascii){
  function rightRotate(value, amount){ return (value >>> amount) | (value << (32 - amount)); }
  var mathPow = Math.pow, maxWord = mathPow(2,32), lengthProperty = 'length';
  var i, j, result = '';
  var words = [], asciiBitLength = ascii[lengthProperty] * 8;
  var hash = sha256.h = sha256.h || [];
  var k = sha256.k = sha256.k || [];
  var primeCounter = k[lengthProperty], isComposite = {};
  for(var candidate = 2; primeCounter < 64; candidate++){
    if(!isComposite[candidate]){
      for(i = 0; i < 313; i += candidate) isComposite[i] = candidate;
      hash[primeCounter] = (mathPow(candidate, .5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1/3) * maxWord) | 0;
    }
  }
  ascii += '\x80';
  while(ascii[lengthProperty] % 64 - 56) ascii += '\x00';
  for(i = 0; i < ascii[lengthProperty]; i++){
    j = ascii.charCodeAt(i);
    if(j >> 8) return;
    words[i >> 2] |= j << ((3 - i) % 4) * 8;
  }
  words[words[lengthProperty]] = ((asciiBitLength / maxWord) | 0);
  words[words[lengthProperty]] = asciiBitLength;
  for(j = 0; j < words[lengthProperty];){
    var w = words.slice(j, j += 16), oldHash = hash;
    hash = hash.slice(0, 8);
    for(i = 0; i < 64; i++){
      var w15 = w[i-15], w2 = w[i-2], a = hash[0], e = hash[4];
      var temp1 = hash[7]
        + (rightRotate(e,6) ^ rightRotate(e,11) ^ rightRotate(e,25))
        + ((e & hash[5]) ^ ((~e) & hash[6]))
        + k[i]
        + (w[i] = (i < 16) ? w[i] : (
            w[i-16]
            + (rightRotate(w15,7) ^ rightRotate(w15,18) ^ (w15 >>> 3))
            + w[i-7]
            + (rightRotate(w2,17) ^ rightRotate(w2,19) ^ (w2 >>> 10))
          ) | 0);
      var temp2 = (rightRotate(a,2) ^ rightRotate(a,13) ^ rightRotate(a,22))
        + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
    }
    for(i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
  }
  for(i = 0; i < 8; i++){
    for(j = 3; j + 1; j--){
      var b = (hash[i] >> (j*8)) & 255;
      result += ((b < 16) ? 0 : '') + b.toString(16);
    }
  }
  return result;
}
function utf8ToBinary(str){
  const bytes = (typeof TextEncoder !== 'undefined') ? new TextEncoder().encode(str) : (function(){
    const s = unescape(encodeURIComponent(str)); const a = []; for(let i=0;i<s.length;i++) a.push(s.charCodeAt(i)); return a;
  })();
  let bin = ''; for(let i=0;i<bytes.length;i++) bin += String.fromCharCode(bytes[i]);
  return bin;
}
function hashPassword(password, salt){ return sha256(utf8ToBinary(password + '::' + salt)); }
function hashAnswer(answer, salt){ return sha256(utf8ToBinary(String(answer).trim().toLowerCase() + '::ans::' + salt)); }
function randomSalt(){ return Math.random().toString(36).slice(2) + Date.now().toString(36); }
function randomId(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,8); }

/* 安全问题（用于离线找回密码） */
const SECURITY_QUESTIONS = [
  '你母亲的名字是？',
  '你父亲的名字是？',
  '你第一所学校的名称是？',
  '你出生的城市是？',
  '你最喜欢的食物是？',
  '你的宠物名字是？'
];

/* ============================================================
   账号会话（注册 / 登录 / 退出）
   ============================================================ */
const AUTH_KEY_USERS = 'tt_users';
const AUTH_KEY_SESSION = 'tt_session';

const Auth = {
  users(){ return Store.get(AUTH_KEY_USERS, []); },
  current(){ return Store.get(AUTH_KEY_SESSION, null); },

  // type: 'email' | 'phone'，secQ/secA 为安全问题（找回密码用）
  register(username, account, password, type, secQ, secA){
    const users = this.users();
    const field = type === 'phone' ? 'phone' : 'email';
    if(users.some(u => u[field] === account)){
      return { ok:false, msg: type === 'phone' ? '该手机号已注册，请直接登录' : '该邮箱已注册，请直接登录' };
    }
    const salt = randomSalt();
    const user = {
      id: randomId(), username: username.trim(),
      email: type === 'email' ? account.trim() : '',
      phone: type === 'phone' ? account.trim() : '',
      salt: salt, hash: hashPassword(password, salt),
      secQ: secQ || '', secA: hashAnswer(secA || '', salt),
      createdAt: Date.now()
    };
    users.push(user);
    Store.set(AUTH_KEY_USERS, users);
    this.setSession(user);
    return { ok:true, user: user };
  },

  // account 可为邮箱或手机号，自动识别
  login(account, password){
    const users = this.users();
    const a = account.trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a);
    const user = users.find(u => isEmail ? (u.email === a) : (u.phone === a));
    if(!user) return { ok:false, msg: isEmail ? '该邮箱尚未注册' : '该手机号尚未注册' };
    if(user.hash !== hashPassword(password, user.salt)) return { ok:false, msg:'密码错误，请重试' };
    this.setSession(user);
    return { ok:true, user: user };
  },

  // 找回密码第一步：根据账号查询安全问题
  findQuestion(account){
    const a = account.trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a);
    const user = this.users().find(u => isEmail ? (u.email === a) : (u.phone === a));
    if(!user) return { ok:false, msg: isEmail ? '该邮箱尚未注册' : '该手机号尚未注册' };
    if(!user.secQ) return { ok:false, msg:'该账号未设置安全问题，无法找回密码' };
    return { ok:true, question: user.secQ };
  },

  // 找回密码第二步：校验安全答案并重置密码
  resetPassword(account, answer, newPassword){
    const a = account.trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a);
    const users = this.users();
    const user = users.find(u => isEmail ? (u.email === a) : (u.phone === a));
    if(!user) return { ok:false, msg:'该账号不存在' };
    if(hashAnswer(answer, user.salt) !== user.secA) return { ok:false, msg:'安全答案错误' };
    user.hash = hashPassword(newPassword, user.salt);
    Store.set(AUTH_KEY_USERS, users);
    return { ok:true };
  },

  setSession(user){
    Store.set(AUTH_KEY_SESSION, {
      userId:user.id, username:user.username,
      email:user.email || '', phone:user.phone || '',
      loginAt:Date.now()
    });
  },
  logout(){
    Store.remove(AUTH_KEY_SESSION);
  },
  avatarChar(username){
    return (username || 'U').trim().charAt(0).toUpperCase();
  }
};

/* ============================================================
   每用户独立数据（进度/记录/设置/成就等按账号隔离）
   ============================================================ */
function userKey(k){
  const u = Auth.current();
  return 'tt_' + (u ? u.userId : 'guest') + '_' + k;
}
const UserData = {
  get(k, d){ return Store.get(userKey(k), d); },
  set(k, v){ Store.set(userKey(k), v); }
};

/* ============================================================
   主题与音效（按用户保存）
   ============================================================ */
const THEMES = ['light','dark','forest','ocean','sakura'];
const THEME_NAMES = {light:'默认', dark:'夜间', forest:'森林绿', ocean:'海洋蓝', sakura:'樱花粉'};
let settings = UserData.get('settings', { theme:'light', sound:true });

function applySettings(){
  document.body.setAttribute('data-theme', settings.theme);
  const bs = $('#btnSound'); if(bs) bs.textContent = settings.sound ? '🔊 音效' : '🔇 音效';
}
function cycleTheme(){
  const i = THEMES.indexOf(settings.theme);
  settings.theme = THEMES[(i+1) % THEMES.length];
  UserData.set('settings', settings);
  applySettings();
  toast('已切换主题：' + THEME_NAMES[settings.theme], '🎨');
}
function toggleSound(){
  settings.sound = !settings.sound;
  UserData.set('settings', settings);
  applySettings();
  initAudio();
  if(settings.sound) soundKey();
  toast(settings.sound ? '音效已开启' : '音效已关闭', settings.sound ? '🔊' : '🔇');
}

/* WebAudio 按键音效 */
let audioCtx = null;
function initAudio(){
  if(!audioCtx){ try{ audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }catch(e){} }
}
function beep(freq, dur, type, vol){
  if(!settings.sound) return;
  if(!audioCtx) initAudio();
  if(!audioCtx) return;
  try{
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = type || 'sine'; o.frequency.value = freq;
    g.gain.setValueAtTime(vol || 0.12, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
    o.connect(g); g.connect(audioCtx.destination);
    o.start(); o.stop(audioCtx.currentTime + dur);
  }catch(e){}
}
function soundKey(){ beep(640, .04, 'sine', .12); }
function soundError(){ beep(180, .12, 'sawtooth', .1); }
function soundDone(){ beep(880,.1,'sine',.12); setTimeout(()=>beep(1100,.14,'sine',.12), 110); }

/* 页面加载时应用主题 */
applySettings();
