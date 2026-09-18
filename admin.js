window.Admin = {
  tab:'dashboard',
  async render(){
    await Khatm.load(); const k=Khatm.data, done=Khatm.done(), reading=Khatm.inProgress(), free=Khatm.free();
    const v=K.qs('#view');
    v.innerHTML=`<section class="admin-page">
      <div class="admin-hero"><span>پنل مدیریت</span><h2>${K.esc(k.name)}</h2><small>کد ${k.code} · ${Khatm.participants.length}/32 نفر</small></div>
      <div class="stat-grid"><div><b>${K.pct(done,30)}٪</b><span>پیشرفت</span></div><div><b>${Khatm.participants.length}</b><span>شرکت‌کنندگان</span></div><div><b>${done}</b><span>تکمیل</span></div><div><b>${reading}</b><span>در حال مطالعه</span></div><div><b>${free}</b><span>آزاد</span></div></div>
      <div class="admin-tabs"><button class="${this.tab==='dashboard'?'active':''}" data-at="dashboard">اجزا</button><button class="${this.tab==='people'?'active':''}" data-at="people">افراد</button><button class="${this.tab==='activity'?'active':''}" data-at="activity">فعالیت‌ها</button><button class="${this.tab==='archive'?'active':''}" data-at="archive">گزارش</button></div>
      <div id="admin-content">${await this.content()}</div>
    </section>`;
    K.qsa('[data-at]').forEach(b=>b.onclick=async()=>{this.tab=b.dataset.at;await this.render()});
  },
  async content(){
    if(this.tab==='people')return this.people();
    if(this.tab==='activity')return this.activity();
    if(this.tab==='archive')return this.archive();
    return `<div class="section-title"><h3>وضعیت ۳۰ جزء</h3><button class="btn danger-outline" data-release-all>♻ آزادسازی همه غیرتکمیل‌ها</button></div>
    <div class="juz-grid">${Khatm.assignments.map(a=>this.card(a)).join('')}</div>
    <div class="admin-danger"><button class="btn danger" data-logout>خروج از حساب مدیر</button></div>`;
  },
  card(a){
    const p=a.participants?.name||'';
    return `<article class="juz-card ${a.status}"><div><b>جزء ${a.juz_number}</b><span>${a.status==='free'?'آزاد':a.status==='reading'?'در حال مطالعه':'✓ تکمیل شده'}</span></div><small>${p?`توسط ${K.esc(p)}`:'آماده انتخاب'}</small>${a.status!=='completed'?`<button class="mini-btn" data-release="${a.juz_number}">آزاد کردن</button>`:''}</article>`;
  },
  async people(){
    return `<div class="section-title"><h3>شرکت‌کنندگان</h3></div><div class="people-list">${Khatm.participants.map(p=>{const a=Khatm.assignments.find(x=>x.participant_id===p.id);return `<div class="person-row"><div class="avatar">${K.esc((p.name||'?')[0])}</div><div><b>${K.esc(p.name)}</b><small>${p.role==='admin'?'مدیر':'شرکت‌کننده'} · ورود ${K.ago(p.joined_at)}</small></div><strong>${a?`جزء ${a.juz_number} · ${a.status==='completed'?'تکمیل شده':'در حال مطالعه'}`:'بدون جزء'}</strong></div>`}).join('')}</div>`;
  },
  async activity(){
    const {data}=await SB.client.from('activity_logs').select('*,participants(name)').eq('khatm_id',Auth.khatm.id).order('created_at',{ascending:false}).limit(80);
    return `<div class="section-title"><h3>فعالیت‌های اخیر</h3></div><div class="activity-list">${(data||[]).map(x=>`<div class="activity-row"><span>🔔</span><div><b>${K.esc(x.action)}</b><small>${K.esc(x.participants?.name||'سیستم')} · ${K.ago(x.created_at)}</small></div></div>`).join('')||'<p class="muted">هنوز فعالیتی ثبت نشده است.</p>'}</div>`;
  },
  async archive(){
    const {data,error}=await SB.client.from('khatms').select('id,name,code,status,created_at,completed_at').eq('admin_id',Auth.user.id).order('created_at',{ascending:false});
    if(error) return '<p class="muted">آرشیو در دسترس نیست.</p>';
    return `<div class="section-title"><h3>آرشیو ختم‌ها</h3></div><div class="people-list">${(data||[]).map(k=>`<div class="person-row"><div class="avatar">📖</div><div><b>${K.esc(k.name)}</b><small>${k.code} · ${k.status==='completed'?'پایان‌یافته':'فعال'} · ${K.fmtDate(k.created_at)}</small></div><strong>${k.status==='completed'?K.fmtDate(k.completed_at):'جاری'}</strong></div>`).join('')||'<p class="muted">ختم قبلی وجود ندارد.</p>'}</div><button class="btn gold wide" data-new-khatm>✨ ایجاد ختم جدید</button>`;
  },
  async report(){
    const k=Khatm.data; return `<div class="report-card"><h3>گزارش ختم</h3><p><b>نام:</b> ${K.esc(k.name)}</p><p><b>کد:</b> ${k.code}</p><p><b>شروع:</b> ${K.fmtDate(k.created_at)}</p><p><b>پایان:</b> ${K.fmtDate(k.completed_at)}</p><p><b>اجزای کامل:</b> ${Khatm.done()} / 30</p><p><b>شرکت‌کنندگان:</b> ${Khatm.participants.length}</p><button class="btn gold" data-share-report>📤 اشتراک گزارش</button></div>`;
  },
  bind(){
    K.qsa('[data-release]').forEach(b=>b.onclick=async()=>{if(await K.confirm('آزادسازی جزء',`جزء ${b.dataset.release} آزاد شود؟`,'آزاد کن')){try{await Khatm.release(+b.dataset.release);K.toast('جزء آزاد شد');this.render()}catch(e){K.toast(e.message,'err')}}});
    const all=K.qs('[data-release-all]');if(all)all.onclick=async()=>{if(await K.confirm('آزادسازی همه',`همه اجزای غیرتکمیل‌شده آزاد شوند؟`,'بله')){try{await Khatm.releaseAll();K.toast('اجزا آزاد شدند');this.render()}catch(e){K.toast(e.message,'err')}}};
    const out=K.qs('[data-logout]');if(out)out.onclick=()=>Auth.logout();
    const sh=K.qs('[data-share-report]');if(sh)sh.onclick=()=>K.share(`گزارش ${Auth.khatm.name} — ${Khatm.done()}/30 جزء تکمیل شده`);
    const nk=K.qs('[data-new-khatm]');if(nk)nk.onclick=()=>App.go('create');
  }
};
