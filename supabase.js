window.SB = {
  client:null,
  init(){
    if(!K.isConfigured()) return false;
    this.client=supabase.createClient(KHATM_CONFIG.SUPABASE_URL,KHATM_CONFIG.SUPABASE_KEY,{
      auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
    });
    return true;
  },
  async rpc(name,args={}){ const {data,error}=await this.client.rpc(name,args); if(error) throw error; return data; },
  async from(table){return this.client.from(table)}
};
