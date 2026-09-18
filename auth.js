window.Auth = {
  user:null, participant:null, khatm:null, role:null, adminLogin:null,
  async init(){
    if(!SB.client) return;
    const {data}=await SB.client.auth.getSession(); this.user=data.session?.user||null;
    SB.client.auth.onAuthStateChange((_e,s)=>{this.user=s?.user||null});
  },
  async ensureAnonymous(){
    if(this.user) return this.user;
    const {data,error}=await SB.client.auth.signInAnonymously(); if(error) throw error;
    this.user=data.user; return this.user;
  },
  async createAdmin(name,password,khatmName){
    const code=await this.uniqueCode();
    const email=`admin_${code.toLowerCase()}@khatm.app`;
    const {data,error}=await SB.client.auth.signUp({email,password});
    if(error) throw error;
    if(!data.session) throw new Error('در تنظیمات Auth، ثبت‌نام بدون تأیید ایمیل را فعال کنید.');
    this.user=data.user;
    const {data:k,error:e}=await SB.client.from('khatms').insert({
      name:khatmName,code,admin_id:this.user.id,admin_name:name,admin_login_email:email,status:'active'
    }).select().single();
    if(e) throw e;
    await SB.rpc('seed_khatm',{p_khatm_id:k.id});
    this.khatm=k; this.role='admin'; this.adminLogin={email,password,code};
    K.saveLocal('khatm_admin_login',this.adminLogin); return k;
  },
  async loginAdmin(code,password){
    const c=code.toUpperCase().trim();
    const {data:email,error:le}=await SB.client.rpc('get_admin_login',{p_code:c});
    if(le||!email) throw new Error('کد ختم پیدا نشد.');
    const {data,error}=await SB.client.auth.signInWithPassword({email,password});
    if(error) throw new Error('رمز مدیر نادرست است.');
    this.user=data.user;
    const {data:k,error:ke}=await SB.client.from('khatms').select('*').eq('code',c).single();
    if(ke||!k||k.admin_id!==this.user.id) throw new Error('این حساب مدیر برای این ختم معتبر نیست.');
    this.khatm=k; this.role='admin'; return k;
  },
  async join(code,name){
    await this.ensureAnonymous();
    const result=await SB.rpc('join_khatm',{p_code:code.toUpperCase(),p_name:name.trim()});
    if(!result?.success) throw new Error(result?.message||'ورود به ختم انجام نشد.');
    this.khatm=result.khatm; this.participant=result.participant; this.role='participant';
    K.saveLocal('khatm_session',{khatmId:this.khatm.id,participantId:this.participant.id});
    return this.khatm;
  },
  async restore(){
    if(!this.user) return false;
    const s=K.readLocal('khatm_session'); if(!s) return false;
    const {data:p}=await SB.client.from('participants').select('*').eq('id',s.participantId).eq('khatm_id',s.khatmId).maybeSingle();
    const {data:k}=await SB.client.from('khatms').select('*').eq('id',s.khatmId).maybeSingle();
    if(p&&k){this.participant=p;this.khatm=k;this.role=p.role;return true} return false;
  },
  async uniqueCode(){
    for(let i=0;i<10;i++){const c=K.code(); const {data}=await SB.client.from('khatms').select('id').eq('code',c).maybeSingle();if(!data)return c}
    throw new Error('تولید کد یکتا ناموفق بود.');
  },
  async logout(){await SB.client.auth.signOut();this.user=null;this.khatm=null;this.participant=null;this.role=null;localStorage.removeItem('khatm_session');location.hash='';location.reload()}
};
