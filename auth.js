/* ============================================================
   auth.js —— 登录 / 注册(三步滑动) / 忘记密码页逻辑（支持邮箱 + 手机号）
   ============================================================ */
(function(){
  // 已登录则直接进入应用
  if(Auth.current()){ window.location.replace('app.html'); return; }

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PHONE_RE = /^1[3-9]\d{9}$/;

  const tabLogin = $('#tabLogin'), tabRegister = $('#tabRegister');
  const formLogin = $('#formLogin'), formRegister = $('#formRegister'), formForgot = $('#formForgot');
  const loginError = $('#loginError'), regError = $('#regError'), forgotError = $('#forgotError');

  /* ---------- 填充安全问题下拉框 ---------- */
  const secQSelect = $('#regSecQ');
  SECURITY_QUESTIONS.forEach(q=>{
    const o = document.createElement('option');
    o.value = q; o.textContent = q;
    secQSelect.appendChild(o);
  });

  /* ---------- 视图切换 ---------- */
  function showView(mode){
    // mode: 'login' | 'register' | 'forgot'
    tabLogin.classList.toggle('active', mode === 'login');
    tabRegister.classList.toggle('active', mode === 'register');
    formLogin.style.display = mode === 'login' ? 'block' : 'none';
    formRegister.style.display = mode === 'register' ? 'block' : 'none';
    formForgot.style.display = mode === 'forgot' ? 'block' : 'none';
    loginError.textContent = ''; regError.textContent = ''; forgotError.textContent = '';
    loginError.style.color = ''; forgotError.style.color = '';
    if(mode === 'register') goRegStep(0);
    if(mode !== 'forgot') resetForgotForm();
  }
  tabLogin.addEventListener('click', ()=>showView('login'));
  tabRegister.addEventListener('click', ()=>showView('register'));
  $('#btnForgot').addEventListener('click', ()=>showView('forgot'));
  $('#btnBackLogin').addEventListener('click', ()=>showView('login'));

  /* ============================================================
     注册：三步滑动向导
     ============================================================ */
  let regType = 'email';
  let regStep = 0;
  const regAccountLabel = $('#regAccountLabel');
  const regAccountInput = $('#regAccount');
  const regTrack = $('#regTrack');
  const regPrev = $('#regPrev'), regNext = $('#regNext'), regSubmit = $('#regSubmit');
  const regDots = $$('#regProgress .dot');

  // 注册方式切换（邮箱 / 手机号）
  $$('.reg-type-tab').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      regType = btn.dataset.type;
      $$('.reg-type-tab').forEach(b=>b.classList.toggle('active', b === btn));
      if(regType === 'phone'){
        regAccountLabel.textContent = '手机号';
        regAccountInput.placeholder = '11 位手机号';
        regAccountInput.autocomplete = 'tel';
        regAccountInput.type = 'tel';
      }else{
        regAccountLabel.textContent = '邮箱';
        regAccountInput.placeholder = '用于登录的邮箱';
        regAccountInput.autocomplete = 'email';
        regAccountInput.type = 'text';
      }
      regAccountInput.value = '';
      regError.textContent = '';
    });
  });

  function goRegStep(n){
    regStep = n;
    regTrack.style.transform = 'translateX(-' + (n * 100) + '%)';
    regDots.forEach((d, i)=>d.classList.toggle('active', i === n));
    regPrev.style.display = (n === 0) ? 'none' : '';
    regNext.style.display = (n === 2) ? 'none' : '';
    regSubmit.style.display = (n === 2) ? '' : 'none';
    regError.textContent = '';
  }
  regPrev.addEventListener('click', ()=>goRegStep(regStep - 1));

  function validateStep1(){
    const username = $('#regUsername').value.trim();
    const account = regAccountInput.value.trim();
    if(!username){ regError.textContent = '请输入昵称'; return false; }
    if(username.length > 16){ regError.textContent = '昵称请控制在 16 个字符以内'; return false; }
    if(regType === 'phone'){
      if(!PHONE_RE.test(account)){ regError.textContent = '请输入正确的 11 位手机号'; return false; }
    }else{
      if(!EMAIL_RE.test(account)){ regError.textContent = '请输入正确的邮箱地址'; return false; }
    }
    return true;
  }
  function validateStep2(){
    const pw = $('#regPassword').value, pw2 = $('#regPassword2').value;
    if(pw.length < 6){ regError.textContent = '密码至少 6 位'; return false; }
    if(!/[A-Za-z]/.test(pw)){ regError.textContent = '密码需包含字母（A-Z 或 a-z）'; return false; }
    if(!/\d/.test(pw)){ regError.textContent = '密码需包含数字（0-9）'; return false; }
    if(pw !== pw2){ regError.textContent = '两次输入的密码不一致'; return false; }
    return true;
  }

  regNext.addEventListener('click', ()=>{
    if(regStep === 0){ if(!validateStep1()) return; }
    else if(regStep === 1){ if(!validateStep2()) return; }
    goRegStep(regStep + 1);
  });

  // 最终提交（第 3 步）
  formRegister.addEventListener('submit', function(e){
    e.preventDefault();
    const secA = $('#regSecA').value.trim();
    if(!secA){ regError.textContent = '请填写安全问题答案（用于找回密码）'; return; }

    const username = $('#regUsername').value.trim();
    const account = regAccountInput.value.trim();
    const password = $('#regPassword').value;
    const secQ = secQSelect.value;
    regError.textContent = '';

    const r = Auth.register(username, account, password, regType, secQ, secA);
    if(!r.ok){ regError.textContent = r.msg; return; }
    window.location.replace('app.html');
  });

  /* ============================================================
     登录（自动识别邮箱 / 手机号）
     ============================================================ */
  formLogin.addEventListener('submit', function(e){
    e.preventDefault();
    const account = $('#loginAccount').value.trim();
    const password = $('#loginPassword').value;
    if(!account){ loginError.textContent = '请输入邮箱或手机号'; return; }
    if(!EMAIL_RE.test(account) && !PHONE_RE.test(account)){ loginError.textContent = '请输入正确的邮箱或 11 位手机号'; return; }
    if(!password){ loginError.textContent = '请输入密码'; return; }
    loginError.textContent = '';
    const r = Auth.login(account, password);
    if(!r.ok){ loginError.textContent = r.msg; return; }
    window.location.replace('app.html');
  });

  /* ============================================================
     忘记密码（两步）
     ============================================================ */
  let forgotStep = 0;   // 0=查账号，1=验证答案并重置
  let forgotAccount = '';
  function resetForgotForm(){
    forgotStep = 0; forgotAccount = '';
    $('#forgotAccount').value = ''; $('#forgotAccount').disabled = false;
    $('#forgotAnswer').value = ''; $('#forgotPassword').value = ''; $('#forgotPassword2').value = '';
    $('#forgotQuestion').textContent = '';
    $('#forgotQField').style.display = 'none';
    $('#forgotPw1').style.display = 'none';
    $('#forgotPw2').style.display = 'none';
    $('#forgotSubmit').textContent = '下一步';
  }

  formForgot.addEventListener('submit', function(e){
    e.preventDefault();
    forgotError.style.color = '';

    if(forgotStep === 0){
      const account = $('#forgotAccount').value.trim();
      if(!account){ forgotError.textContent = '请输入账号'; return; }
      if(!EMAIL_RE.test(account) && !PHONE_RE.test(account)){ forgotError.textContent = '请输入正确的邮箱或 11 位手机号'; return; }
      const r = Auth.findQuestion(account);
      if(!r.ok){ forgotError.textContent = r.msg; return; }
      forgotAccount = account;
      $('#forgotQuestion').textContent = r.question;
      $('#forgotQField').style.display = 'block';
      $('#forgotPw1').style.display = 'block';
      $('#forgotPw2').style.display = 'block';
      $('#forgotSubmit').textContent = '重置密码';
      $('#forgotAccount').disabled = true;
      forgotStep = 1;
      return;
    }

    // 第二步：校验答案 + 重置密码
    const answer = $('#forgotAnswer').value.trim();
    const pw = $('#forgotPassword').value;
    const pw2 = $('#forgotPassword2').value;
    if(!answer){ forgotError.textContent = '请输入安全答案'; return; }
    if(pw.length < 6){ forgotError.textContent = '新密码至少 6 位'; return; }
    if(!/[A-Za-z]/.test(pw)){ forgotError.textContent = '新密码需包含字母（A-Z 或 a-z）'; return; }
    if(!/\d/.test(pw)){ forgotError.textContent = '新密码需包含数字（0-9）'; return; }
    if(pw !== pw2){ forgotError.textContent = '两次输入的新密码不一致'; return; }

    const r = Auth.resetPassword(forgotAccount, answer, pw);
    if(!r.ok){ forgotError.textContent = r.msg; return; }

    // 成功：预填账号并返回登录
    $('#loginAccount').value = forgotAccount;
    $('#loginPassword').value = '';
    resetForgotForm();
    showView('login');
    loginError.style.color = '#22a06b';
    loginError.textContent = '✅ 密码重置成功，请用新密码登录';
  });

  // 初始化注册向导到第 1 步
  goRegStep(0);
})();
