window.Khatm = {
  data:null, assignments:[], participants:[],
  async load(id=Auth.khatm?.id){
    if(!id) return;
    const [{data:k,error:ke},{data:a,error:ae},{data:p,error:pe}]=await Promise.all([
      SB.client.from('khatms').select('*').eq('id',id).single(),
      SB.client.from('juz_assignments').select('*,participants(name)').eq('khatm_id',id).order('juz_number'),
      SB.client.from('participants').select('*').eq('khatm_id',id).order('joined_at')
    ]);
    if(ke) throw ke; if(ae) throw ae; if(pe) throw pe;
    this.data=k; this.assignments=a||[]; this.participants=p||[]; Auth.khatm=k; return this.data;
  },
  async claim(juz){
    const r=await SB.rpc('claim_juz',{p_khatm_id:Auth.khatm.id,p_juz_number:juz});
    if(!r?.success) throw new Error(r?.message||'این جزء دیگر آزاد نیست.');
    await this.load(); return r;
  },
  async complete(juz){
    const r=await SB.rpc('complete_juz',{p_khatm_id:Auth.khatm.id,p_juz_number:juz});
    if(!r?.success) throw new Error(r?.message||'تکمیل جزء انجام نشد.');
    await this.load(); return r;
  },
  async release(juz){
    const r=await SB.rpc('release_juz',{p_khatm_id:Auth.khatm.id,p_juz_number:juz});
    if(!r?.success) throw new Error(r?.message||'آزادسازی انجام نشد.');
    await this.load();
  },
  async releaseAll(){const r=await SB.rpc('release_all_juz',{p_khatm_id:Auth.khatm.id});if(!r?.success)throw new Error(r?.message);await this.load()},
  getJuz(n){return this.assignments.find(x=>x.juz_number===n)},
  done(){return this.assignments.filter(x=>x.status==='completed').length},
  inProgress(){return this.assignments.filter(x=>x.status==='reading').length},
  free(){return 30-this.done()-this.inProgress()},
  myAssignment(){return this.assignments.find(x=>x.participant_id===Auth.participant?.id)},
  subscribe(){
    if(!SB.client||!Auth.khatm) return;
    if(this.channel) SB.client.removeChannel(this.channel);
    this.channel=SB.client.channel(`khatm-${Auth.khatm.id}`)
      .on('postgres_changes',{event:'*',schema:'public',table:'juz_assignments',filter:`khatm_id=eq.${Auth.khatm.id}`},()=>this.load().then(()=>App.renderCurrent()))
      .on('postgres_changes',{event:'*',schema:'public',table:'participants',filter:`khatm_id=eq.${Auth.khatm.id}`},()=>this.load().then(()=>App.renderCurrent()))
      .on('postgres_changes',{event:'*',schema:'public',table:'khatms',filter:`id=eq.${Auth.khatm.id}`},()=>this.load().then(()=>App.renderCurrent()))
      .subscribe();
  },
  async log(action,meta={}){try{await SB.rpc('log_activity',{p_khatm_id:Auth.khatm.id,p_action:action,p_meta:meta})}catch(e){console.warn(e)}}
};
