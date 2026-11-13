/* Prep-week schedule view: days, 3-day screens, editing. */
(function(){

const PW_KEY='penguin-pw', NM={B:"בן",Y:"יותם",D:"דורון",K:"קרן",A:"כולם"};
const E=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const cat=t=>/סרטון|סבב עיירה|ספקים נוספים|אפליקציית|שאטלים|אטרקציות|סזונייר|עיירות/.test(t)?'fld'
 :/Sport 2000|Intersport|Skiset|ציוד לצוות|Eskiador/.test(t)?'eq'
 :/סקיפס|מעליות|גלישת|סימין/.test(t)?'ski'
 :/ESF|Skicool|ספא|מאפייה|הדרכות|אוטובוסים|פטריק|מסעדות/.test(t)?'sup'
 :/מלון|ריקו פרונטלי|ריקו למלונות/.test(t)?'hot':'ops';
const T0=8*60,T1=22*60,SL=15,NR=(T1-T0)/SL;
const mins=s=>{const[a,b]=s.split(':').map(Number);return a*60+b;};
const hhmm=m=>String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
const rowOf=m=>2+Math.round((Math.min(Math.max(m,T0),T1)-T0)/SL);
const can=()=>typeof PG_EDIT!=='undefined'&&PG_EDIT;
const store=()=>tstore(PW_KEY);
/* day and time come from the team calendar (events tagged pw=sNN); a move made on the site still wins */
function calOver(){ const m={}; CalSource.events().forEach(e=>{const g=(e.d||'').match(/(?:^|\n)pw=(s\d+)/),t=CalSource.frTime(e.tm),em=CalSource.frTime(e.em); if(g&&t) m[g[1]]={id:e.id,d:dayOf(e.s),t:t,m:em&&mins(em)>mins(t)?mins(em)-mins(t):0};}); return m; }
const dayOf=k=>{const x=PW_DAYS.find(d=>d.d===k.slice(8,10)+'.'+k.slice(5,7)); return x?x.id:'';};
function items(){ const st=store(), co=calOver(); return PW_SEED.map(s=>{const o=st[s.id]||{}, c=co[s.id]&&co[s.id].d?co[s.id]:s; return Object.assign({},s,{d:o.d!==undefined?o.d:c.d,t:o.t!==undefined?o.t:c.t,m:c.m||s.m,done:!!o.done});}); }
function brks(d){ const st=store(); return (PW_BRK[d]||[]).map(([t,m,n],i)=>{const o=st['b:'+d+':'+i]||{};return {k:d+':'+i,t:o.t||t,m:o.m||m,n};}); }
function patch(id,p){ const st=store(); st[id]=Object.assign({},st[id],p,{at:Date.now()}); tsave(PW_KEY,st); render(); if(p.d&&p.t) toCal(id,p); }
/* a move also goes to the team calendar (same length, note kept); if that fails the move stays on the site only */
const pend={};
function toCal(id,p){ const c=calOver()[id], day=PW_DAYS.find(x=>x.id===p.d); if(!c||!c.id||!day||!window.PENGUIN_API) return;
  let tk='',key=''; try{tk=localStorage.getItem('penguin-team-key')||''; key=localStorage.getItem('penguin-owner-key')||'';}catch(e){}
  const dt='2026-'+day.d.slice(3,5)+'-'+day.d.slice(0,2);
  fetch(window.PENGUIN_API,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({a:'moveEvent',id:c.id,s:dt,tm:p.t,tk,key})})
   .then(r=>r.json()).then(j=>{ if(j&&j.ok){ pend[id]=true; CalSource.reload(); } }).catch(()=>{}); }
/* once the calendar shows the new time, the site-side copy of the move is dropped */
function settle(){ const st=store(), co=calOver(); let ch=false; Object.keys(pend).forEach(id=>{const o=st[id],c=co[id]; if(c&&o&&c.d===o.d&&c.t===o.t){delete o.d; delete o.t; delete pend[id]; ch=true;}}); if(ch) tsave(PW_KEY,st); }
const root=document.createElement('div'); root.id='pwSched'; root.className='fx';
function card(it,showTime,det){
  const k=it.k==='f'?' fix':it.k==='s'?' set':'';
  const tag=it.k==='f'?'<span class="tag f">קבוע</span>':it.k==='s'?'<span class="tag s">ממתין</span>':'';
  const ppl=(it.w||'').split(' ').filter(Boolean).map(p=>`<i class="p ${p==='A'?'':p}">${NM[p]}</i>`).join('');
  return `<div class="pwi ${cat(it.n)}${k}${it.done?' done':''}" data-pwid="${it.id}" draggable="${can()}" title="${E(it.n+(it.x?' · '+it.x:''))}">`+
   `<input type="checkbox" class="pw-ck" data-pwdone="${it.id}" aria-label="בוצע: ${E(it.n)}"${it.done?' checked':''}${can()?'':' disabled'}>`+
   `<span class="pw-tx">${showTime?`<span class="tm2">${it.t}</span>`:''}${E(it.n)}${tag}${det&&it.x?`<small>${E(it.x)}</small>`:''}</span>${ppl?`<div class="who">${ppl}</div>`:''}`+
   `<button type="button" class="pw-mv" data-pwmove="${it.id}" aria-label="הזזה: ${E(it.n)}" title="הזזה">⋯</button></div>`;
}
let VW={n:3,i:0}; try{const v=JSON.parse(localStorage.getItem('pw-view')||'null'); if(v&&v.n) VW=v;}catch(e){}
const pwN=()=>{const w=root.getBoundingClientRect().width||innerWidth; return w&&w<640?1:VW.n;};
function render(){
  const all=items(), sch=all.filter(i=>i.d), un=all.filter(i=>!i.d), done=all.filter(i=>i.done).length;
  const n=pwN(); VW.i=Math.max(0,Math.min(VW.i,PW_DAYS.length-n)); const VD=PW_DAYS.slice(VW.i,VW.i+n);
  try{localStorage.setItem('pw-view',JSON.stringify(VW));}catch(e){}
  let g=`<div class="gh" style="grid-column:1;grid-row:1;border-inline-start:0"></div>`;
  VD.forEach((x,i)=>{g+=`<div class="gh${x.cl?' cl':''}" style="grid-column:${i+2};grid-row:1"><em>${x.w} · ${x.d}</em><b>${E(x.h)}</b></div>`;});
  for(let r=0;r<NR;r++){const m=T0+r*SL,mm=m%60;
    g+=`<div class="gt" style="grid-row:${r+2}">${mm?'':hhmm(m)}</div>`;
    VD.forEach((x,c)=>{g+=`<div class="gl${mm?'':' hr'}" data-d="${x.id}" data-t="${hhmm(m)}" style="grid-column:${c+2};grid-row:${r+2}"></div>`;});}
  VD.forEach((x,c)=>{
    brks(x.id).forEach(({k,t,m,n})=>{const s=mins(t);g+=`<div class="gb brk" data-pwbrk="${k}" title="${E(n)} · ${t}"${can()?' role="button" tabindex="0"':''} style="grid-column:${c+2};grid-row:${rowOf(s)}/${Math.max(rowOf(s+m),rowOf(s)+1)}">${E(n)}<span class="bt">${t}</span></div>`;});
    const day=sch.filter(i=>i.d===x.id).sort((a,b)=>mins(a.t)-mins(b.t)||a.id.localeCompare(b.id));
    const grp=[]; day.forEach(i=>{const l=grp[grp.length-1]; if(l&&l.t===i.t) l.it.push(i); else grp.push({t:i.t,it:[i]});});
    grp.forEach((G,j)=>{const s=mins(G.t); let e=Math.max(...G.it.map(i=>Math.max(s,T0)+i.m)); if(j+1<grp.length) e=Math.min(e,mins(grp[j+1].t));
      const rs=rowOf(s),re=Math.max(rowOf(e),rs+1);
      g+=`<div class="gb" data-d="${x.id}" data-t="${G.t}" style="grid-column:${c+2};grid-row:${rs}/${re}">${G.it.map((i,q)=>card(i,!q,n<=3)).join('')}</div>`;});
  });
  const sx=root.querySelector('.pw-scroll'), keepX=sx?sx.scrollLeft:null;
  root.innerHTML=`<div class="pw-top"><h3>לו״ז שבוע הכנה</h3><span class="pw-sub">26.11 – 04.12 · שעון צרפת · לקוחות ראשונים 05.12</span><span class="pw-cnt"><b>${done}</b> מתוך ${all.length} בוצעו</span>
   <div class="pw-key"><span><i class="sw fx"></i>קבוע</span><span><i class="sw pd"></i>ממתין לתשובה</span><i class="sep"></i>
   <span><i class="sw" style="--c:var(--pw-hot)"></i>מלונות</span><span><i class="sw" style="--c:var(--pw-eq)"></i>ציוד</span><span><i class="sw" style="--c:var(--pw-ski)"></i>סקיפסים וגלישה</span><span><i class="sw" style="--c:var(--pw-sup)"></i>הדרכות וספקים</span><span><i class="sw" style="--c:var(--pw-fld)"></i>שטח ועיירה</span><span><i class="sw" style="--c:var(--pw-ops)"></i>תפעול</span><i class="sep"></i>
   <span><i class="p B">בן</i><i class="p Y">יותם</i><i class="p D">דורון</i><i class="p K">קרן</i><i class="p">כולם</i></span></div>
   <div class="pw-nav"><div class="pw-seg" role="group" aria-label="תצוגה"><button type="button" data-pwn="3" aria-pressed="${VW.n===3}">3 ימים</button><button type="button" data-pwn="9" aria-pressed="${VW.n===9}">כל השבוע</button></div>
   <button type="button" class="pw-arw" data-pwstep="-1" aria-label="ימים קודמים"${VW.i<=0?' disabled':''}>→</button>
   <div class="pw-pills" role="group" aria-label="ימים">${PW_DAYS.map((x,k)=>`<button type="button" data-pwday="${k}" class="${k>=VW.i&&k<VW.i+n?'on':''}${x.cl?' cl':''}"><b>${x.d}</b><span>${x.w}</span></button>`).join('')}</div>
   <button type="button" class="pw-arw" data-pwstep="1" aria-label="ימים הבאים"${VW.i+n>=PW_DAYS.length?' disabled':''}>←</button></div>
   <p class="pw-ro">כדי להזיז ולסמן בוצע, פתחו מהקישור של הצוות.</p></div>
   <div class="pw-lay"><div class="pw-scroll" tabindex="0" aria-label="לו״ז שבוע הכנה"><div class="pw-grid${n>3?' wk':''}" style="grid-template-columns:50px repeat(${n},minmax(${n>3?150:0}px,1fr))">${g}</div></div>
   <aside class="pw-side" data-d="" aria-label="לא שובצו"><h4>לא שובצו <span>${un.length}</span></h4><div class="pw-list">${un.map(i=>card(i,false)).join('')||'<p class="pw-empty">הכל שובץ</p>'}</div></aside></div>`;
  root.classList.toggle('can',can());
  const nx=root.querySelector('.pw-scroll'); if(nx&&keepX!==null) nx.scrollLeft=keepX;
}
window.pwRender=render;
root.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-pwn],[data-pwstep],[data-pwday]'); if(!t||!root.contains(t)) return; const n=pwN();
  if(t.dataset.pwn){VW.n=+t.dataset.pwn; if(VW.n>3) VW.i=0;}
  else if(t.dataset.pwstep){VW.i+=(+t.dataset.pwstep)*n;}
  else {const k=+t.dataset.pwday; if(k<VW.i||k>=VW.i+n) VW.i=n===1?k:Math.min(k,PW_DAYS.length-n);}
  render();});
let pwW=0; new ResizeObserver(()=>{const w=root.getBoundingClientRect().width; if(!w) return; if((w<640)!==(pwW<640)||!pwW){pwW=w; render();} pwW=w;}).observe(root);
/* keep the block on top of the p2 view (the board re-renders that view) */
function mount(){ const h=document.getElementById('view-p2'); if(!h||h.contains(root)) return; const vh=h.querySelector('.vhead'); if(vh) vh.after(root); else h.prepend(root); }
const h2=document.getElementById('view-p2'); if(h2) new MutationObserver(mount).observe(h2,{childList:true});
new MutationObserver(()=>{ if(root.classList.contains('can')!==can()) render(); }).observe(document.body,{attributes:true,attributeFilter:['class']});
render(); mount();
CalSource.onChange(()=>{settle(); render();},false);
/* done */
root.addEventListener('change',e=>{const id=e.target.dataset&&e.target.dataset.pwdone; if(!id) return; if(!can()){render();return;} patch(id,{done:e.target.checked});});
/* drag and drop */
let dragId=null;
root.addEventListener('dragstart',e=>{const c=e.target.closest&&e.target.closest('.pwi'); if(!c||!can()){e.preventDefault();return;} dragId=c.dataset.pwid; c.classList.add('drag'); try{e.dataTransfer.setData('text/plain',dragId);e.dataTransfer.effectAllowed='move';}catch(x){}});
root.addEventListener('dragend',()=>{dragId=null; root.querySelectorAll('.drag,.ov').forEach(x=>x.classList.remove('drag','ov'));});
const target=e=>{const sd=e.target.closest&&e.target.closest('.pw-side'); if(sd) return sd; return document.elementsFromPoint(e.clientX,e.clientY).find(x=>x.classList&&x.classList.contains('gl')&&root.contains(x))||null;};
root.addEventListener('dragover',e=>{if(!dragId) return; const t=target(e); if(!t) return; e.preventDefault(); root.querySelectorAll('.ov').forEach(x=>x!==t&&x.classList.remove('ov')); t.classList.add('ov');});
root.addEventListener('drop',e=>{if(!dragId) return; const t=target(e); if(!t) return; e.preventDefault(); const id=dragId; dragId=null; patch(id,{d:t.dataset.d||'',t:t.dataset.d?t.dataset.t:''});});
/* move dialog (works on phones too) */
const dlg=document.createElement('div'); dlg.className='pw-dlg'; dlg.hidden=true;
const times=[]; for(let m=5*60;m<=21*60;m+=15) times.push(hhmm(m));
dlg.innerHTML=`<form><b id="pwDlgT"></b><label>יום<select id="pwDlgD"><option value="">לא שובץ</option>${PW_DAYS.map(x=>`<option value="${x.id}">${x.w} ${x.d}</option>`).join('')}</select></label><label>שעה<select id="pwDlgH">${times.map(t=>`<option>${t}</option>`).join('')}</select></label><div class="row"><button type="submit" class="ok">שמירה</button><button type="button" id="pwDlgX">ביטול</button></div></form>`;
document.body.appendChild(dlg);
let dlgId=null; const dD=dlg.querySelector('#pwDlgD'), dH=dlg.querySelector('#pwDlgH');
const syncH=()=>{dH.disabled=!dD.value;}; dD.addEventListener('change',syncH);
root.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-pwmove]'); if(!b||!can()) return; const it=items().find(i=>i.id===b.dataset.pwmove); if(!it) return;
  dlgId=it.id; dlg.querySelector('#pwDlgT').textContent=it.n; dD.value=it.d||''; dH.value=it.t||'09:00'; syncH(); dlg.hidden=false; dD.focus();});
const close=()=>{dlg.hidden=true; dlgId=null;};
dlg.querySelector('#pwDlgX').onclick=close;
dlg.addEventListener('click',e=>{if(e.target===dlg) close();});
dlg.addEventListener('keydown',e=>{if(e.key==='Escape') close();});
dlg.querySelector('form').addEventListener('submit',e=>{e.preventDefault(); if(dlgId) patch(dlgId,{d:dD.value,t:dD.value?dH.value:''}); close();});
/* 10.11.26 (Ben): edit meal / day-summary times */
const bd=document.createElement('div'); bd.className='pw-dlg'; bd.hidden=true;
const durs=[15,30,45,60,90,120];
bd.innerHTML=`<form><b id="pwBrkT"></b><span id="pwBrkD" style="font-size:12.5px;opacity:.75"></span><label>שעה<select id="pwBrkH">${times.map(t=>`<option>${t}</option>`).join('')}</select></label><label>משך<select id="pwBrkM">${durs.map(m=>`<option value="${m}">${m<60?m+' דק׳':m===60?'שעה':m===90?'שעה וחצי':'שעתיים'}</option>`).join('')}</select></label><label style="flex-direction:row;align-items:center;gap:8px"><input type="checkbox" id="pwBrkAll">לכל הימים</label><div class="row"><button type="submit" class="ok">שמירה</button><button type="button" id="pwBrkR">שעה מקורית</button><button type="button" id="pwBrkX">ביטול</button></div></form>`;
document.body.appendChild(bd);
let bk=null; const bH=bd.querySelector('#pwBrkH'), bM=bd.querySelector('#pwBrkM'), bA=bd.querySelector('#pwBrkAll');
const sameAll=(n)=>Object.keys(PW_BRK).flatMap(d=>PW_BRK[d].map((b,i)=>b[2]===n?'b:'+d+':'+i:null)).filter(Boolean);
function openBrk(k){ if(!can()) return; const [d,i]=k.split(':'); const b=brks(d)[+i]; if(!b) return; bk=k;
  const day=PW_DAYS.find(x=>x.id===d)||{};
  bd.querySelector('#pwBrkT').textContent=b.n; bd.querySelector('#pwBrkD').textContent=(day.w||'')+' '+(day.d||'');
  if(![...bH.options].some(o=>o.value===b.t)) bH.add(new Option(b.t,b.t)); bH.value=b.t;
  if(!durs.includes(b.m)) bM.add(new Option(b.m+' דק׳',b.m)); bM.value=String(b.m); bA.checked=false; bd.hidden=false; bH.focus(); }
function saveBrk(v){ const [d,i]=bk.split(':'); const n=PW_BRK[d][+i][2]; const keys=bA.checked?sameAll(n):['b:'+bk];
  const st=store(); keys.forEach(x=>{ st[x]=v?{t:v.t,m:v.m,at:Date.now()}:{at:Date.now()}; }); tsave(PW_KEY,st); render(); }
const bClose=()=>{bd.hidden=true; bk=null;};
root.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-pwbrk]'); if(b) openBrk(b.dataset.pwbrk);});
root.addEventListener('keydown',e=>{const b=e.target.closest&&e.target.closest('[data-pwbrk]'); if(b&&(e.key==='Enter'||e.key===' ')){e.preventDefault(); openBrk(b.dataset.pwbrk);}});
bd.querySelector('#pwBrkX').onclick=bClose;
bd.querySelector('#pwBrkR').onclick=()=>{ if(bk) saveBrk(null); bClose(); };
bd.addEventListener('click',e=>{if(e.target===bd) bClose();});
bd.addEventListener('keydown',e=>{if(e.key==='Escape') bClose();});
bd.querySelector('form').addEventListener('submit',e=>{e.preventDefault(); if(bk) saveBrk({t:bH.value,m:+bM.value}); bClose();});
})();
