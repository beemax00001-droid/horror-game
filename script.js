const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const days=["شنبه","یکشنبه","دوشنبه","سه‌شنبه","چهارشنبه","پنجشنبه","جمعه"];
const schedule={
"شنبه":[["08:00","ریاضی • 45د"],["10:30","تاریخ • 45د"],["16:00","مرور • 25د"]],
"یکشنبه":[["08:00","ادبیات • 45د"],["11:00","فلسفه • 45د"]],
"دوشنبه":[["09:00","ریاضی • 45د"],["15:30","عربی • 25د"]],
"سه‌شنبه":[["08:30","تاریخ • 45د"],["12:00","ادبیات • 45د"]],
"چهارشنبه":[["09:00","فلسفه • 45د"],["16:00","مرور • 25د"]],
"پنجشنبه":[["10:00","آزمونک • 45د"],["17:00","جمع‌بندی • 45د"]],
"جمعه":[["11:00","مرور سبک • 25د"]]
};
const apps=[["Instagram","IG","6h 18m"],["YouTube","YT","2h 06m"],["Telegram","TG","48m"],["TikTok","TT","0m"],["Chrome","CH","1h 10m"],["Games","GM","36m"]];
let blocked=JSON.parse(localStorage.getItem("fg_blocked")||"[]");
function showToast(t){const x=$("#toast");x.textContent=t;x.classList.add("show");setTimeout(()=>x.classList.remove("show"),2200)}
function renderSchedule(){
 $("#week").innerHTML=days.map(d=>`<div class="day"><h4>${d}</h4>${schedule[d].map(x=>`<div class="block"><b>${x[0]}</b><small>${x[1]}</small></div>`).join("")}<button class="link-btn add-day" data-day="${d}">+ افزودن</button></div>`).join("");
 $("#todaySchedule").innerHTML=schedule["شنبه"].map(x=>`<div class="row"><div><b>${x[1].split(" • ")[0]}</b><small>پارت مطالعه</small></div><span class="time">${x[0]}</span></div>`).join("");
 $$(".add-day").forEach(b=>b.onclick=()=>showToast(`پارت جدید برای ${b.dataset.day} — در نسخه بعدی فرم کامل باز می‌شود.`));
}
function renderApps(){
 $("#appGrid").innerHTML=apps.map((a,i)=>`<article class="card app"><div style="display:flex;align-items:center;gap:10px"><div class="app-icon">${a[1]}</div><div><b>${a[0]}</b><small>${a[2]} این هفته</small></div></div><button class="toggle ${blocked.includes(i)?"on":""}" data-i="${i}" aria-label="toggle"><i></i></button></article>`).join("");
 $$(".toggle").forEach(b=>b.onclick=()=>{const i=+b.dataset.i;blocked=blocked.includes(i)?blocked.filter(x=>x!==i):[...blocked,i];localStorage.setItem("fg_blocked",JSON.stringify(blocked));renderApps();showToast(blocked.includes(i)?"محدودسازی برای Study Mode فعال شد":"محدودسازی خاموش شد")});
}
function renderBars(){const vals=[2.4,1.7,3.2,1.9,2.8,1.5,0.9];$("#bars").innerHTML=vals.map((v,i)=>`<div class="bar" style="height:${v/3.2*100}%"><span>${days[i].slice(0,3)}</span></div>`).join("")}
function nav(view){$$(".view").forEach(x=>x.classList.remove("active"));$("#"+view).classList.add("active");$$(".nav").forEach(x=>x.classList.toggle("active",x.dataset.view===view));$("#pageTitle").textContent={dashboard:"داشبورد",schedule:"برنامه هفتگی",apps:"اپ‌های مزاحم",analytics:"آمار و تحلیل",missions:"مأموریت‌ها",settings:"تنظیمات"}[view];history.replaceState(null,"","#"+view)}
$$(".nav").forEach(b=>b.onclick=()=>nav(b.dataset.view));$$("[data-view-jump]").forEach(b=>b.onclick=()=>nav(b.dataset.viewJump));
let sec=1500,timerRunning=false,interval;
function tick(){sec=Math.max(0,sec-1);$("#timer").textContent=`${String(Math.floor(sec/60)).padStart(2,"0")}:${String(sec%60).padStart(2,"0")}`;if(!sec){clearInterval(interval);timerRunning=false;$("#startBtn").textContent="شروع پارت";showToast("پارت کامل شد 🎯");}}
$("#startBtn").onclick=()=>{timerRunning=!timerRunning;if(timerRunning){interval=setInterval(tick,1000);$("#startBtn").textContent="توقف";showToast("Focus Mode شروع شد")}else{clearInterval(interval);$("#startBtn").textContent="ادامه"}};
$("#resetBtn").onclick=()=>{clearInterval(interval);timerRunning=false;sec=1500;$("#timer").textContent="25:00";$("#startBtn").textContent="شروع پارت"};
$("#modeBtn").onclick=()=>{const modes=["Study","Exam","Free Time"];const cur=$("#modeLabel").textContent;const n=modes[(modes.indexOf(cur)+1)%modes.length];$("#modeLabel").textContent=n;$("#timerSub").textContent=`آماده شروع • ${n}`;showToast(`حالت ${n} فعال شد`)};
$("#quickStudy").onclick=()=>{$("#modeLabel").textContent="Study";showToast("Study Mode در داشبورد فعال شد؛ برای مسدودسازی واقعی به Companion نیاز است.")};
$("#addBlock").onclick=()=>showToast("برای افزودن پارت، روز و ساعت دلخواه را در نسخه بعدی وارد می‌کنیم.");
$("#saveSettings").onclick=()=>{localStorage.setItem("fg_name",$("#userName").value);localStorage.setItem("fg_goal",$("#weeklyGoal").value);showToast("تنظیمات ذخیره شد")};
$("#todayText").textContent=new Intl.DateTimeFormat("fa-IR",{weekday:"long",day:"numeric",month:"long"}).format(new Date());
renderSchedule();renderApps();renderBars();
if(location.hash&&$("#"+location.hash.slice(1)))nav(location.hash.slice(1));
