window.Notifs = {
  async list(limit=40){
    if(!Auth.participant)return [];
    const {data}=await SB.client.from('notifications').select('*').eq('khatm_id',Auth.khatm.id).or(`participant_id.is.null,participant_id.eq.${Auth.participant.id}`).order('created_at',{ascending:false}).limit(limit);return data||[];
  },
  async render(){
    const data=await this.list(); return `<section class="activity-page"><div class="page-heading"><span>اعلان‌ها و فعالیت‌ها</span><h2>خبرهای ختم</h2></div>${data.map(n=>`<article class="notice ${n.read?'':'unread'}"><span>🔔</span><div><b>${K.esc(n.title)}</b><p>${K.esc(n.body)}</p><small>${K.ago(n.created_at)}</small></div></article>`).join('')||'<div class="empty">اعلانی ندارید.</div>'}</section>`;
  }
};
