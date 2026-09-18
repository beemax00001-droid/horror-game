window.UI = {
  home(){
    return `<section class="home"><div class="ornament">﷽</div><div class="home-mark">۞</div><h1>ختم قرآن</h1><p>با هم می‌خوانیم،<br>با هم به پایان می‌رسانیم.</p><div class="home-actions"><button class="big-action primary" data-go="join">📖 <span>ورود به ختم</span></button><button class="big-action" data-go="create">✨ <span>ایجاد ختم جدید</span></button><button class="text-action" data-go="admin">🔐 پنل مدیریت</button></div><div class="home-foot">سیستم چندنفره · همگام‌سازی زنده</div></section>`;
  },
  join(){
    return `<section class="auth-page"><button class="back-link" data-go="home">‹ بازگشت</button><div class="form-card"><span class="eyebrow">شرکت در ختم</span><h2>به جمع ختم بپیوندید</h2><label>کد ختم<input id="join-code" maxlength="6" autocomplete="off" placeholder="مثلاً ABC123"></label><label>نام شما<input id="join-name" maxlength="40" placeholder="مثلاً علی"></label><button class="btn gold wide" data-join>ورود به ختم</button><p class="hint">کد را از مدیر ختم دریافت کنید.</p></div></section>`;
  },
  create(){
    return `<section class="auth-page"><button class="back-link" data-go="home">‹ بازگشت</button><div class="form-card"><span class="eyebrow">ختم تازه</span><h2>ایجاد ختم جدید</h2><label>نام ختم<input id="new-name" maxlength="80" placeholder="ختم قرآن خانوادگی"></label><label>نام مدیر<input id="admin-name" maxlength="40" placeholder="محمد"></label><label>رمز مدیر<input id="admin-pass" type="password" minlength="6" placeholder="حداقل ۶ کاراکتر"></label><button class="btn gold wide" data-create>ساخت ختم</button><p class="hint">رمز مدیر را در اختیار دیگران قرار ندهید.</p></div></section>`;
  },
  admin(){
    return `<section class="auth-page"><button class="back-link" data-go="home">‹ بازگشت</button><div class="form-card"><span class="eyebrow">مدیریت امن</span><h2>ورود مدیر</h2><label>کد ختم<input id="admin-code" maxlength="6" placeholder="ABC123"></label><label>رمز مدیر<input id="admin-login-pass" type="password" placeholder="رمز مدیر"></label><button class="btn gold wide" data-admin-login>ورود به پنل</button></div></section>`;
  },
  dashboard(){
    const k=Khatm.data, done=Khatm.done(), mine=Khatm.myAssignment(), p=Khatm.participants.length;
    return `<section class="dashboard"><div class="dash-hero"><div><small>ختم جاری</small><h2>${K.esc(k.name)}</h2><span class="code-pill">کد ${k.code} <button data-copy-code>⧉</button></span></div><div class="hero-actions"><button class="share-btn" data-invite>📤</button><button class="share-btn" data-qr>▦</button></div></div>
    <div class="progress-card"><div class="progress-top"><div><small>پیشرفت ختم</small><strong>${K.pct(done,30)}٪</strong></div><span>${done} / 30 جزء</span></div><div class="progress"><i style="width:${K.pct(done,30)}%"></i></div><p>${p} شرکت‌کننده · ${Khatm.free()} جزء آزاد</p></div>
    ${mine?`<div class="my-card"><span>جزء شما</span><b>جزء ${mine.juz_number}</b><small>${mine.status==='reading'?'در حال مطالعه':'تکمیل شده'}</small><button class="btn" data-my-reader>ادامه مطالعه</button></div>`:''}
    <div class="section-title"><h3>۳۰ جزء قرآن</h3><span>زنده</span></div><div class="juz-grid">${Khatm.assignments.map(a=>this.juzCard(a)).join('')}</div>
    ${Auth.role==='admin'?'<button class="admin-link" data-admin-panel>⚙ پنل مدیریت</button>':''}
    ${done===30?'<div class="finish-banner">🎉<b>ختم قرآن به پایان رسید</b><span>هر ۳۰ جزء تکمیل شده است.</span></div>':''}</section>`;
  },
  juzCard(a){
    const p=a.participants?.name;
    return `<button class="juz-card ${a.status}" data-juz="${a.juz_number}"><b>جزء ${a.juz_number}</b><span>${a.status==='free'?'🟢 آزاد':a.status==='reading'?`🟡 ${K.esc(p||'در حال مطالعه')}`:`✅ ${K.esc(p||'تکمیل شده')}`}</span></button>`;
  },
  settings(){
    return `<section class="settings-page"><div class="page-heading"><span>شخصی‌سازی</span><h2>تنظیمات</h2></div><div class="settings-card"><label class="switch-row"><span>حالت شب</span><input id="dark-toggle" type="checkbox"></label><label class="switch-row"><span>صدای قرآن</span><input id="sound-toggle" type="checkbox" checked></label><div class="setting-row"><span>اندازه متن قرآن</span><div><button data-setfont="-">A−</button><button data-setfont="0">A</button><button data-setfont="+">A+</button></div></div></div><div class="settings-card"><button class="row-btn" data-share>📤 دعوت به ختم</button><button class="row-btn" data-qr>▦ نمایش QR Code</button><button class="row-btn" data-copy-code>⧉ کپی کد ختم</button><button class="row-btn danger-text" data-logout>خروج از ختم</button></div></section>`;
  }
};
