window.K = {
  esc(v){ const d=document.createElement('div'); d.textContent=v??''; return d.innerHTML; },
  id(){ return crypto.randomUUID ? crypto.randomUUID() : Date.now()+'-'+Math.random().toString(36).slice(2); },
  code(n=6){ const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s=''; for(let i=0;i<n;i++) s+=chars[Math.floor(Math.random()*chars.length)]; return s; },
  fmtDate(v){ if(!v) return '—'; return new Intl.DateTimeFormat('fa-IR',{dateStyle:'short',timeStyle:'short'}).format(new Date(v)); },
  ago(v){ if(!v) return '—'; const sec=Math.max(1,(Date.now()-new Date(v))/1000); if(sec<60)return 'همین الان'; if(sec<3600)return `${Math.floor(sec/60)} دقیقه پیش`; if(sec<86400)return `${Math.floor(sec/3600)} ساعت پیش`; return `${Math.floor(sec/86400)} روز پیش`; },
  pct(done,total){ return total ? Math.round(done*100/total) : 0; },
  sleep(ms){ return new Promise(r=>setTimeout(r,ms)); },
  isConfigured(){ return !/YOUR-PROJECT|YOUR_SUPABASE/.test(window.KHATM_CONFIG.SUPABASE_URL+window.KHATM_CONFIG.SUPABASE_KEY); },
  hash(v){ let h=2166136261; for(let i=0;i<v.length;i++){h^=v.charCodeAt(i);h=Math.imul(h,16777619)} return (h>>>0).toString(16); },
  readLocal(k,d=null){ try{return JSON.parse(localStorage.getItem(k))??d}catch{return d} },
  saveLocal(k,v){ localStorage.setItem(k,JSON.stringify(v)); },
  async copy(t){ try{await navigator.clipboard.writeText(t); K.toast('کپی شد');}catch{K.toast('کپی خودکار انجام نشد؛ متن را دستی کپی کنید.','warn')} },
  share(text,url=location.href){ if(navigator.share) return navigator.share({title:'ختم قرآن',text,url}).catch(()=>{}); return K.copy(text+' '+url); },
  qs(s){return document.querySelector(s)}, qsa(s){return [...document.querySelectorAll(s)]}
};
K.toast=(msg,type='ok')=>{
 const root=K.qs('#toast-root'), el=document.createElement('div'); el.className=`toast ${type}`; el.textContent=msg; root.appendChild(el);
 setTimeout(()=>el.classList.add('show'),10); setTimeout(()=>{el.classList.remove('show');setTimeout(()=>el.remove(),250)},3000);
};
K.confirm=(title,body,ok='تأیید')=>new Promise(resolve=>{
 const root=K.qs('#modal-root'); root.innerHTML=`<div class="modal-backdrop"><section class="modal-card"><h3>${K.esc(title)}</h3><p>${K.esc(body)}</p><div class="modal-actions"><button class="btn ghost" data-cancel>انصراف</button><button class="btn gold" data-ok>${K.esc(ok)}</button></div></section></div>`;
 root.querySelector('[data-cancel]').onclick=()=>{root.innerHTML='';resolve(false)}; root.querySelector('[data-ok]').onclick=()=>{root.innerHTML='';resolve(true)};
});
K.loading=(show,text='در حال پردازش…')=>{
 const root=K.qs('#modal-root'); if(show) root.innerHTML=`<div class="modal-backdrop"><div class="loader-card"><div class="spinner"></div><b>${K.esc(text)}</b></div></div>`; else root.innerHTML='';
};
