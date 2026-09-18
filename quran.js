window.Quran = {
  cache:new Map(),
  async juz(juz){
    if(this.cache.has(juz)) return this.cache.get(juz);
    const url=`${KHATM_CONFIG.QURAN_API}/juz/${juz}/quran-uthmani`;
    const res=await fetch(url); if(!res.ok) throw new Error('دریافت متن قرآن انجام نشد.');
    const json=await res.json(); if(json.code!==200) throw new Error('پاسخ قرآن نامعتبر است.');
    const ayahs=json.data.ayahs||[], pages={};
    for(const a of ayahs){(pages[a.page]??=[]).push(a)}
    const out={juz,ayahs,pages,pageNumbers:Object.keys(pages).map(Number).sort((a,b)=>a-b)};
    this.cache.set(juz,out); return out;
  },
  async page(juz,page){
    const d=await this.juz(juz); return d.pages[page]||[];
  },
  audioUrl(globalAyah){return `${KHATM_CONFIG.AUDIO_CDN}/${globalAyah}.mp3`},
  async surahs(){
    const r=await fetch(`${KHATM_CONFIG.QURAN_API}/surah`); if(!r.ok)throw new Error('فهرست سوره‌ها دریافت نشد'); const j=await r.json(); return j.data||[];
  }
};
