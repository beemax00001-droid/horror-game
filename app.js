window.App = {
  route:'home',
  async start(){
    document.documentElement.dataset.theme=K.readLocal('theme','dark');
    if(!SB.init()){K.qs('#boot').innerHTML='<div class="boot-error"><b>تنظیمات اتصال کامل نشده است.</b><span>فایل config.js را باز کنید و URL و Publishable Key پروژه Supabase را وارد کنید.</span></div>';return}
    try{
      await Auth.init(); await Auth.restore();
      K.qs('#boot').classList.add('hidden');
      if(Auth.khatm){await Khatm.load();this.route=location.hash.slice(1)||'dashboard';Khatm.subscribe()}
      else if(new URLSearchParams(location.search).get('join')){this.route='join'}
      else this.route='home';
      await this.render();
      window.addEventListener('online',()=>K.toast('اتصال اینترنت برقرار شد.'));
      window.addEventListener('offline',()=>K.toast('اتصال اینترنت قطع شد.','warn'));
    }catch(e){console.error(e);K.qs('#boot').innerHTML=`<div class="boot-error"><b>شروع برنامه انجام نشد.</b><span>${K.esc(e.message||'خطای ناشناخته')}</span></div>`}
  },
  async render(){
    const view=K.qs('#view'), top=K.qs('#topbar'), nav=K.qs('#bottom-nav');
    try{
      if(this.route==='home'){top.classList.add('hidden');nav.classList.add('hidden');view.innerHTML=UI.home()}
      else if(this.route==='join'){top.classList.add('hidden');nav.classList.add('hidden');view.innerHTML=UI.join()}
      else if(this.route==='create'){top.classList.add('hidden');nav.classList.add('hidden');view.innerHTML=UI.create()}
      else if(this.route==='adminLogin'){top.classList.add('hidden');nav.classList.add('hidden');view.innerHTML=UI.admin()}
      else {
        if(!Auth.khatm){this.route='home';return this.render()}
        top.classList.remove('hidden');nav.classList.remove('hidden');K.qs('#top-khatm-name').textContent=Auth.khatm.name;K.qs('#top-title').textContent=this.route==='admin'?'پنل مدیریت':this.route==='reader'?'مطالعه قرآن':'ختم قرآن';
        if(this.route==='dashboard'){await Khatm.load();view.innerHTML=UI.dashboard()}
        else if(this.route==='reader'){await Reader.render()}
        else if(this.route==='activity'){view.innerHTML=await Notifs.render()}
        else if(this.route==='settings'){view.innerHTML=UI.settings()}
        else if(this.route==='admin'){await Admin.render()}
        else {this.route='dashboard';return this.render()}
      }
      this.bind();
      if(this.route==='admin')Admin.bind();
    }catch(e){console.error(e);view.innerHTML=`<section class="error-page"><h2>مشکلی پیش آمد</h2><p>${K.esc(e.message||'لطفاً دوباره تلاش کنید.')}</p><button class="btn" data-retry>تلاش دوباره</button></section>`}
  },
  async go(route){this.route=route;history.replaceState(null,'','#'+route);await this.render()},
  async renderCurrent(){await this.render()},
  bind(){
    K.qsa('[data-go]').forEach(b=>b.onclick=()=>this.go(b.dataset.go));
    K.qsa('[data-route]').forEach(b=>b.onclick=()=>this.go(b.dataset.route));
    const back=K.qs('[data-action="back"]');if(back)back.onclick=()=>this.go(this.route==='reader'?'dashboard':'home');
    const settings=K.qs('[data-action="settings"]');if(settings)settings.onclick=()=>this.go('settings');
    const join=K.qs('[data-join]');if(join)join.onclick=async()=>{const c=K.qs('#join-code').value.trim(),n=K.qs('#join-name').value.trim();if(c.length!==6||!n)return K.toast('کد ختم و نام را کامل وارد کنید.','warn');try{K.loading(true,'در حال ورود…');await Auth.join(c,n);await Khatm.load();Khatm.subscribe();K.loading(false);K.toast('خوش آمدید 🌿');this.go('dashboard')}catch(e){K.loading(false);K.toast(e.message,'err')}};
    const create=K.qs('[data-create]');if(create)create.onclick=async()=>{const n=K.qs('#new-name').value.trim(),an=K.qs('#admin-name').value.trim(),pw=K.qs('#admin-pass').value;if(n.length<2||an.length<2||pw.length<6)return K.toast('همه موارد را کامل کنید؛ رمز حداقل ۶ کاراکتر.','warn');try{K.loading(true,'در حال ساخت ختم…');const k=await Auth.createAdmin(an,pw,n);await Khatm.load(k.id);Khatm.subscribe();K.loading(false);K.toast(`ختم ساخته شد؛ کد ${k.code}`);await this.go('dashboard')}catch(e){K.loading(false);K.toast(e.message,'err')}};
    const al=K.qs('[data-admin-login]');if(al)al.onclick=async()=>{const c=K.qs('#admin-code').value.trim(),pw=K.qs('#admin-login-pass').value;if(!c||!pw)return K.toast('کد و رمز را وارد کنید.','warn');try{K.loading(true,'در حال ورود مدیر…');await Auth.loginAdmin(c,pw);await Khatm.load();Khatm.subscribe();K.loading(false);this.go('admin')}catch(e){K.loading(false);K.toast(e.message,'err')}};
    K.qsa('[data-juz]').forEach(b=>b.onclick=async()=>{const a=Khatm.getJuz(+b.dataset.juz);if(!a)return;if(a.status==='free'){if(await K.confirm('انتخاب جزء',`آیا می‌خواهید جزء ${a.juz_number} را برای خود انتخاب کنید؟`,'انتخاب جزء'))try{K.loading(true,'در حال رزرو…');await Khatm.claim(a.juz_number);K.loading(false);K.toast(`جزء ${a.juz_number} برای شما ثبت شد.`);await Reader.open(a.juz_number)}catch(e){K.loading(false);K.toast(e.message,'warn')}else if(a.participant_id===Auth.participant?.id&&a.status==='reading')Reader.open(a.juz_number);else K.toast(`این جزء ${a.status==='completed'?'تکمیل شده':'در حال مطالعه است.'}`,'warn')});
    const my=K.qs('[data-my-reader]');if(my){my.onclick=()=>{const a=Khatm.myAssignment();if(a)Reader.open(a.juz_number)}}
    const ap=K.qs('[data-admin-panel]');if(ap)ap.onclick=()=>this.go('admin');
    K.qsa('[data-copy-code]').forEach(b=>b.onclick=()=>K.copy(Auth.khatm.code));
    K.qsa('[data-invite]').forEach(b=>b.onclick=()=>K.share(`برای شرکت در ختم قرآن «${Auth.khatm.name}» وارد شوید.\nکد ختم: ${Auth.khatm.code}`));
    K.qsa('[data-share]').forEach(b=>b.onclick=()=>K.share(`برای شرکت در ختم قرآن «${Auth.khatm.name}» وارد شوید.\nکد ختم: ${Auth.khatm.code}`));
    K.qsa('[data-logout]').forEach(b=>b.onclick=()=>Auth.logout());
    const dt=K.qs('#dark-toggle');if(dt){dt.checked=document.documentElement.dataset.theme==='dark';dt.onchange=()=>{document.documentElement.dataset.theme=dt.checked?'dark':'light';K.saveLocal('theme',document.documentElement.dataset.theme)}}
    K.qsa('[data-setfont]').forEach(b=>b.onclick=()=>{let x=Number(K.readLocal('quran_font_size',26));x=b.dataset.setfont==='+'?Math.min(44,x+2):b.dataset.setfont==='-'?Math.max(20,x-2):26;K.saveLocal('quran_font_size',x);K.toast('اندازه متن تغییر کرد')});
    K.qsa('[data-qr]').forEach(b=>b.onclick=async()=>{
      const root=K.qs('#modal-root'); root.innerHTML='<div class="modal-backdrop"><section class="modal-card qr-modal"><h3>ورود به ختم</h3><p>این QR را اسکن کنید تا فرم ورود ختم باز شود.</p><canvas id="qr-canvas"></canvas><div class="code-large">'+K.esc(Auth.khatm.code)+'</div><div class="modal-actions"><button class="btn" data-close-qr>بستن</button></div></section></div>';
      const url=new URL(location.href);url.search='?join='+encodeURIComponent(Auth.khatm.code);url.hash='';
      if(window.QRCode) await QRCode.toCanvas(K.qs('#qr-canvas'),url.toString(),{width:220,margin:2});
      K.qs('[data-close-qr]').onclick=()=>root.innerHTML='';
    });
    const joinParam=new URLSearchParams(location.search).get('join'); const joinCode=K.qs('#join-code'); if(joinParam&&joinCode)joinCode.value=joinParam.toUpperCase();
    const retry=K.qs('[data-retry]');if(retry)retry.onclick=()=>this.render();
  }
};
window.addEventListener('hashchange',()=>{if(location.hash)App.go(location.hash.slice(1))});
window.addEventListener('DOMContentLoaded',()=>App.start());
