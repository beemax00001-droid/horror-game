window.Reader = {
  juz:null,pages:[],pageIndex:0,audio:null,audioIndex:0,
  async open(juz,page=null){
    this.juz=juz; const d=await Quran.juz(juz); this.pages=d.pageNumbers;
    const saved=K.readLocal(`reader_${Auth.khatm.id}_${Auth.participant?.id}`,{page:null});
    const target=page||saved.page||this.pages[0]; this.pageIndex=Math.max(0,this.pages.indexOf(Number(target)));
    App.route='reader'; await this.render();
  },
  currentPage(){return this.pages[this.pageIndex]},
  async render(){
    if(!this.juz){
      const mine=Khatm.myAssignment();
      if(!mine || mine.status!=='reading') { App.route='dashboard'; return App.render(); }
      const saved=K.readLocal(`reader_${Auth.khatm.id}_${Auth.participant?.id}`,{page:null});
      await this.open(mine.juz_number,saved.page||null); return;
    }
    const view=K.qs('#view'), d=await Quran.juz(this.juz), p=this.currentPage(), ayahs=d.pages[p]||[];
    const my=Khatm.myAssignment(); const total=this.pages.length, prog=this.pageIndex+1;
    const lastS=ayahs[0]?.surah?.name||'', lastN=ayahs.at(-1)?.surah?.name||lastS;
    view.innerHTML=`<section class="reader-page">
      <div class="reader-head"><button class="round" data-reader-prev ${this.pageIndex===0?'disabled':''}>‹</button>
        <div><span>جزء ${this.juz}</span><b>${prog} از ${total}</b></div>
        <button class="round" data-reader-next ${this.pageIndex===total-1?'disabled':''}>›</button></div>
      <div class="reader-progress"><i style="width:${K.pct(prog,total)}%"></i></div>
      <div class="quran-paper">
        <div class="paper-meta"><span>${K.esc(lastS)}${lastN!==lastS?' — '+K.esc(lastN):''}</span><span>صفحه ${p}</span></div>
        ${ayahs.map(a=>`<div class="ayah"><span class="ayah-text">${K.esc(a.text)}</span><span class="ayah-num">${a.numberInSurah}</span></div>`).join('')}
      </div>
      <div class="reader-tools">
        <button class="btn" data-font="down">A−</button><button class="btn" data-font="reset">A</button><button class="btn" data-font="up">A+</button>
        <button class="btn gold" data-play>▶ پخش صوت</button>
      </div>
      ${my?.status==='reading'&&my.juz_number===this.juz?`<button class="complete-btn" data-complete>✓ این جزء را کامل کردم</button>`:''}
    </section>`;
    const fs=K.readLocal('quran_font_size',26); document.documentElement.style.setProperty('--quran-size',fs+'px');
    this.bind(ayahs);
    K.saveLocal(`reader_${Auth.khatm.id}_${Auth.participant?.id}`,{page:p,juz:this.juz,updatedAt:Date.now()});
    if(Auth.participant) try{await SB.client.from('reading_progress').upsert({khatm_id:Auth.khatm.id,participant_id:Auth.participant.id,juz_number:this.juz,page:p,updated_at:new Date().toISOString()},{onConflict:'khatm_id,participant_id,juz_number'})}catch{}
  },
  bind(ayahs){
    K.qsa('[data-reader-prev]').forEach(b=>b.onclick=()=>{if(this.pageIndex){this.pageIndex--;this.render()}});
    K.qsa('[data-reader-next]').forEach(b=>b.onclick=()=>{if(this.pageIndex<this.pages.length-1){this.pageIndex++;this.render()}});
    K.qsa('[data-font]').forEach(b=>b.onclick=()=>{let x=Number(K.readLocal('quran_font_size',26)); const a=b.dataset.font;x=a==='up'?Math.min(44,x+2):a==='down'?Math.max(20,x-2):26;K.saveLocal('quran_font_size',x);document.documentElement.style.setProperty('--quran-size',x+'px')});
    const play=K.qs('[data-play]'); if(play) play.onclick=()=>this.playPage(ayahs,play);
    const c=K.qs('[data-complete]'); if(c)c.onclick=async()=>{if(await K.confirm('تکمیل جزء','آیا مطمئن هستید که این جزء را کامل خوانده‌اید؟','بله، تکمیل کردم')){try{K.loading(true,'در حال ثبت تکمیل…');await Khatm.complete(this.juz);K.loading(false);K.toast('جزء با موفقیت تکمیل شد 🎉');App.route='dashboard';await App.render()}catch(e){K.loading(false);K.toast(e.message,'err')}}};
  },
  playPage(ayahs,button){
    if(this.audio){this.audio.pause();this.audio=null;button.textContent='▶ پخش صوت';return}
    this.audioIndex=0; button.textContent='⏸ توقف';
    const next=()=>{if(this.audioIndex>=ayahs.length){this.audio=null;button.textContent='▶ پخش صوت';return} const a=ayahs[this.audioIndex++];this.audio=new Audio(Quran.audioUrl(a.number));this.audio.onended=next;this.audio.onerror=()=>{this.audio=null;button.textContent='▶ پخش صوت';K.toast('پخش صوت در این لحظه در دسترس نیست.','warn')};this.audio.play().catch(()=>{})};next();
  }
};
