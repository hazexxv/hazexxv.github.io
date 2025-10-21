const ROOT=document, WIN=window
function $(s){return ROOT.querySelectorAll(s)}
function id(s){return ROOT.getElementById(s)}
function showSection(idName){$("main section").forEach(s=>s.style.display="none");const el=id(idName);if(el)el.style.display="block"}
$(" .tab".trim()).forEach(t=>t.addEventListener("click",()=>{const idName=t.dataset.tab;location.hash="#"+idName;showSection(idName)}))
WIN.addEventListener("hashchange",()=>showSection((location.hash||"#home").substring(1)))
showSection((location.hash||"#home").substring(1)||"home")
const PHRASES=["winning","you","gaming","watching","creating","exploring"]
let pIndex=0
const TAG=id("tagline")
setInterval(()=>{if(!TAG)return;TAG.style.opacity=0;setTimeout(()=>{TAG.textContent="is for "+PHRASES[pIndex%PHRASES.length];TAG.style.opacity=1;pIndex++},420)},2400)
const THEMES=[
  {id:"default",vars:{bg:"#011a05",fg:"#fff",accent:"#003300",accentdark:"#002200",accentlight:"#99ff99",r1:"#99ff99",r2:"#66cc66"}},
  {id:"light",vars:{bg:"#f5f5f5",fg:"#222",accent:"#88cc88",accentdark:"#669966",accentlight:"#ccffcc",r1:"#88cc88",r2:"#66aa66"}},
  {id:"black",vars:{bg:"#000",fg:"#fff",accent:"#222222",accentdark:"#000000",accentlight:"#444444",r1:"#444444",r2:"#666666"}},
  {id:"midnight",vars:{bg:"#001a33",fg:"#e0e6f1",accent:"#335577",accentdark:"#223344",accentlight:"#4477aa",r1:"#335577",r2:"#4477aa"}},
  {id:"ember",vars:{bg:"#2b0f0c",fg:"#f2e3d5",accent:"#b33a1e",accentdark:"#8b2f17",accentlight:"#e0573c",r1:"#b33a1e",r2:"#e0573c"}},
  {id:"lunar",vars:{bg:"#2e2e3a",fg:"#dcdce4",accent:"#7f7fa3",accentdark:"#5e5e6c",accentlight:"#a0a0b3",r1:"#7f7fa3",r2:"#a0a0b3"}},
  {id:"sunset",vars:{bg:"#3b1e16",fg:"#ffe5d0",accent:"#d9764e",accentdark:"#b3593b",accentlight:"#f09e7a",r1:"#d9764e",r2:"#f09e7a"}},
  {id:"crimson",vars:{bg:"#220706",fg:"#f5d7d0",accent:"#8a0707",accentdark:"#660505",accentlight:"#bb1616",r1:"#8a0707",r2:"#bb1616"}},
  {id:"royalty",vars:{bg:"#1e0f2c",fg:"#f0e6f8",accent:"#5e2a7e",accentdark:"#4a1f65",accentlight:"#7a39a8",r1:"#5e2a7e",r2:"#7a39a8"}},
  {id:"ocean",vars:{bg:"#002b3a",fg:"#d0eaf1",accent:"#0e7490",accentdark:"#0b586e",accentlight:"#339fbf",r1:"#0e7490",r2:"#339fbf"}}
]
function applyTheme(idName){
  const t=THEMES.find(x=>x.id===idName)||THEMES[2]
  const r=document.documentElement
  r.style.setProperty("--bg",t.vars.bg)
  r.style.setProperty("--fg",t.vars.fg)
  r.style.setProperty("--accent",t.vars.accent)
  r.style.setProperty("--accent-dark",t.vars.accentdark)
  r.style.setProperty("--accent-light",t.vars.accentlight)
  r.style.setProperty("--subtle-rain-1",t.vars.r1)
  r.style.setProperty("--subtle-rain-2",t.vars.r2)
  localStorage.setItem("astraTheme",idName)
  document.querySelectorAll(".tab img").forEach(img=>{
    img.style.filter = t.vars.fg === "#fff" ? "invert(1) grayscale(1) contrast(0.9)" : "invert(0) grayscale(0)"
  })
  if(particleSystem) particleSystem.setColor(t.vars.accentlight)
}
applyTheme(localStorage.getItem("astraTheme")||"black")
class ParticleSystem{
  constructor(canvas){
    this.canvas=canvas
    this.ctx=canvas.getContext("2d",{alpha:true})
    this.dpr=Math.max(1,window.devicePixelRatio||1)
    this.particles=[]
    this.max=90
    this.color=getComputedStyle(document.documentElement).getPropertyValue('--accent-light').trim()||'#444'
    this.lineColor=this.color
    this.mouse={x:-9999,y:-9999}
    this.resize()
    this.initParticles()
    this.frame=this.frame.bind(this)
    window.addEventListener('resize',()=>{this.resize();this.initParticles()})
    window.addEventListener('mousemove',e=>{this.mouse.x=e.clientX;this.mouse.y=e.clientY})
    window.addEventListener('mouseleave',()=>{this.mouse.x=-9999;this.mouse.y=-9999})
    requestAnimationFrame(this.frame)
  }
  setColor(c){this.color=c;this.lineColor=c}
  resize(){const w=window.innerWidth,h=window.innerHeight;this.canvas.width=Math.round(w*this.dpr);this.canvas.height=Math.round(h*this.dpr);this.canvas.style.width=w+'px';this.canvas.style.height=h+'px';this.ctx.setTransform(this.dpr,0,0,this.dpr,0,0)}
  initParticles(){this.particles=[];const count=Math.round(Math.min(this.max,Math.max(30,window.innerWidth*0.04)));for(let i=0;i<count;i++)this.particles.push(this.createParticle())}
  createParticle(){const w=window.innerWidth,h=window.innerHeight;return{x:Math.random()*w,y:Math.random()*h,r:(Math.random()*1.8)+0.6,vx:(Math.random()-0.5)*0.4,vy:(Math.random()-0.5)*0.4}}
  step(){const w=this.canvas.width/this.dpr,h=this.canvas.height/this.dpr;for(const p of this.particles){p.x+=p.vx;p.y+=p.vy;if(p.x<-10)p.x=w+10;if(p.x>w+10)p.x=-10;if(p.y<-10)p.y=h+10;if(p.y>h+10)p.y=-10}}
  draw(){const ctx=this.ctx;const w=this.canvas.width/this.dpr,h=this.canvas.height/this.dpr;ctx.clearRect(0,0,w,h);for(let i=0;i<this.particles.length;i++){const a=this.particles[i];for(let j=i+1;j<this.particles.length;j++){const b=this.particles[j];const dx=a.x-b.x,dy=a.y-b.y,dist=Math.sqrt(dx*dx+dy*dy);if(dist<140){const alpha=Math.max(0,0.45*(1-(dist/140)));ctx.strokeStyle=this.hexToRgba(this.lineColor,alpha);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}}}for(const p of this.particles){ctx.fillStyle=this.hexToRgba(this.color,1);ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill()}if(this.mouse.x>-9998){for(const p of this.particles){const dx=p.x-this.mouse.x,dy=p.y-this.mouse.y,dist=Math.sqrt(dx*dx+dy*dy);if(dist<120){const alpha=Math.max(0,0.6*(1-(dist/120)));ctx.strokeStyle=this.hexToRgba(this.lineColor,alpha);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(this.mouse.x,this.mouse.y);ctx.stroke()}}}}
  frame(){this.step();this.draw();requestAnimationFrame(this.frame)}
  hexToRgba(hex,a){const c=hex.replace('#','').trim();const full=c.length===3?c.split('').map(x=>x+x).join(''):c;const bigint=parseInt(full,16);const r=(bigint>>16)&255,g=(bigint>>8)&255,b=bigint&255;return`rgba(${r},${g},${b},${a})`}
}
let particleSystem=null
WIN.addEventListener('load',()=>{const canvas=id('bg-canvas');if(canvas)particleSystem=new ParticleSystem(canvas)})
const GITLAB_BASE="https://gitlab.com", GROUP="hazexxv-group", GAMES_REPO="game-stuff-new", APPS_REPO="apps"
function safeFetch(url,opts={},timeout=9000){return new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error("timeout")),timeout);fetch(url,opts).then(r=>{clearTimeout(timer);resolve(r)}).catch(err=>{clearTimeout(timer);reject(err)})})}
function gitlabProjectPath(group,repo){return encodeURIComponent(`${group}/${repo}`)}
async function loadGitlabRepoFiles(group,repo){const project=gitlabProjectPath(group,repo);const apiUrl=`https://gitlab.com/api/v4/projects/${project}/repository/tree?per_page=200&ref=main`;try{const res=await safeFetch(apiUrl,{},8000);if(res.ok){const items=await res.json();const xmlFiles=(Array.isArray(items)?items.filter(i=>i.type==="blob"&&i.path&&i.path.endsWith(".xml")):[]);return xmlFiles.map(f=>({name:f.path.split('/').pop(),url:`${GITLAB_BASE}/${group}/${repo}/-/raw/main/${encodeURIComponent(f.path)}`}))}}catch(e){}try{const listUrl=`${GITLAB_BASE}/${group}/${repo}/-/raw/main/list.json`;const rlist=await safeFetch(listUrl,{},6000);if(rlist.ok){const list=await rlist.json();if(Array.isArray(list))return list.map(f=>({name:f.name||f,url:f.url||`${GITLAB_BASE}/${group}/${repo}/-/raw/main/${encodeURIComponent(f)}`}))}}catch(e){}try{const readUrl=`${GITLAB_BASE}/${group}/${repo}/-/raw/main/README.md`;const rmd=await safeFetch(readUrl,{},6000);if(rmd.ok){const md=await rmd.text();const matches=[...md.matchAll(/https?:\/\/gitlab\.com\/[^)"]+?\/-\/raw\/[^)"]+\.xml/gi)].map(m=>m[0]);if(matches.length)return matches.map(u=>{const parts=u.split('/');const name=parts[parts.length-1].split('?')[0];return{name,url:u}})}catch(e){}return[]}
async function loadRepoFiles(repoKey){const mapping={games:{group:GROUP,repo:GAMES_REPO},apps:{group:GROUP,repo:APPS_REPO}};const cfg=mapping[repoKey]||mapping.games;try{const files=await loadGitlabRepoFiles(cfg.group,cfg.repo);if(files&&files.length)return files}catch(e){}try{const ghApi=`https://api.github.com/repos/hazexxv/${repoKey}/contents`;const res=await safeFetch(ghApi,{},7000);if(res.ok){const files=await res.json();const xmlFiles=(Array.isArray(files)?files.filter(f=>f.name&&f.name.endsWith(".xml")):[]);return xmlFiles.map(f=>({name:f.name,url:f.download_url}))}}catch(e){}return[]}
function renderList(items,listEl){if(!listEl)return;listEl.innerHTML="";if(!items||!items.length){const placeholders=12;for(let i=0;i<placeholders;i++){const li=document.createElement("li");li.className="item";li.setAttribute("aria-hidden","true");const lbl=document.createElement("div");lbl.className="label";lbl.textContent="—";li.appendChild(lbl);listEl.appendChild(li)}return}items.forEach(it=>{const li=document.createElement("li");li.className="item";li.tabIndex=0;const label=document.createElement("div");label.className="label";label.textContent=it.name.replace(".xml","");li.appendChild(label);li.dataset.url=it.url;const badge=document.createElement("div");badge.className="badge";badge.textContent="LOAD";li.appendChild(badge);li.addEventListener("click",async ()=>{badge.textContent="…";try{await fetchAndOpenApp(it.url,it.name,badge);badge.textContent="OPEN"}catch(e){badge.textContent="ERR"}});li.addEventListener("keydown",e=>{if(e.key==="Enter")li.click()});listEl.appendChild(li)})}
function filterList(items,listEl,query,countId){const q=query.trim().toLowerCase();const filtered=(items||[]).filter(i=>i.name.toLowerCase().includes(q));renderList(filtered,listEl);if(countId){const el=id(countId);if(el)el.textContent=filtered.length}}
function escapeForHtml(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}
function escapeForAttr(s){return String(s).replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
function createAppBlobUrl(name,xmlText){const safeXml=String(xmlText).replace(/<\/script>/gi,"<\\/script>");const wrapper=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeForAttr(name)}</title><style>html,body{height:100%;margin:0;background:transparent;color:#fff}#container{height:100%;width:100%;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box}pre{white-space:pre-wrap;word-break:break-word;padding:18px;background:rgba(0,0,0,0.85);border-radius:8px;color:#eaeaea;max-height:100%;overflow:auto}</style></head><body><div id="container"><pre id="xmlOutput">${escapeForHtml(safeXml)}</pre></div><script>(function(){})();</script></body></html>`;const blob=new Blob([wrapper],{type:'text/html'});return URL.createObjectURL(blob)}
async function openAppFullUI(name,xmlText){const blobUrl=createAppBlobUrl(name,xmlText);const contentEl=id('content');const sidebarEl=id('sidebar');if(contentEl)contentEl.setAttribute('aria-hidden','true');if(sidebarEl)sidebarEl.setAttribute('aria-hidden','true');const appUi=id('app-ui');const frame=id('app-ui-frame');if(!appUi||!frame){const embed=id('embed-container');const embedFrame=id('embed-frame');if(embed&&embedFrame){embedFrame.src=blobUrl;embed.classList.remove('hidden')}return}if(frame.dataset.blobUrl){try{URL.revokeObjectURL(frame.dataset.blobUrl)}catch(e){}frame.dataset.blobUrl=''}frame.src=blobUrl;frame.dataset.blobUrl=blobUrl;appUi.classList.remove('hidden');appUi.setAttribute('aria-hidden','false');frame.style.overflow='auto'}
function closeAppFullUI(){const appUi=id('app-ui');const frame=id('app-ui-frame');if(frame){if(frame.dataset.blobUrl){try{URL.revokeObjectURL(frame.dataset.blobUrl)}catch(e){}frame.dataset.blobUrl=''}frame.src=''}if(appUi)appUi.classList.add('hidden');const contentEl=id('content');const sidebarEl=id('sidebar');if(contentEl)contentEl.removeAttribute('aria-hidden');if(sidebarEl)sidebarEl.removeAttribute('aria-hidden')}
id('app-ui-close')?.addEventListener('click',closeAppFullUI)
id('app-ui-back')?.addEventListener('click',closeAppFullUI)
async function fetchAndOpenApp(url,name,badgeEl){const ATTEMPTS=3;let lastErr=null;for(let i=0;i<ATTEMPTS;i++){try{const res=await safeFetch(url,{},10000);if(!res.ok)throw new Error('bad response '+res.status);const text=await res.text();await openAppFullUI(name,text);if(badgeEl)badgeEl.textContent='OPEN';return}catch(err){lastErr=err;await new Promise(r=>setTimeout(r,400+(i*300)))}}throw lastErr}
function embedXMLWithContent(xmlText,name){const container=id('embed-container');const frame=id('embed-frame');if(frame&&frame.dataset.blob){try{URL.revokeObjectURL(frame.dataset.blob)}catch(e){}frame.dataset.blob=''}const blob=new Blob([xmlText],{type:"text/xml"});const blobUrl=URL.createObjectURL(blob);if(frame){frame.src=blobUrl;frame.dataset.blob=blobUrl}if(container)container.classList.remove('hidden');updateEmbedActions(name)}
function updateEmbedActions(name){const actions=id('embed-actions');if(!actions)return;actions.innerHTML='';const title=document.createElement('div');title.className='embed-action-btn';title.textContent=name.replace('.xml','');title.style.fontWeight='800';const closeBtn=document.createElement('button');closeBtn.className='embed-action-btn';closeBtn.textContent='Close';closeBtn.addEventListener('click',closeEmbed);const cloakBtn=document.createElement('button');cloakBtn.className='embed-action-btn';cloakBtn.textContent='Cloak';cloakBtn.addEventListener('click',cloakCurrent);const fsBtn=document.createElement('button');fsBtn.className='embed-action-btn';fsBtn.textContent='Fullscreen';fsBtn.addEventListener('click',fullscreenEmbed);actions.appendChild(title);actions.appendChild(closeBtn);actions.appendChild(cloakBtn);actions.appendChild(fsBtn)}
function closeEmbed(){const container=id('embed-container');const frame=id('embed-frame');if(container)container.classList.add('hidden');if(frame&&frame.dataset.blob){try{URL.revokeObjectURL(frame.dataset.blob)}catch(e){}frame.dataset.blob=''}if(frame)frame.src=''}
function cloakCurrent(){const frame=id('embed-frame');if(!frame)return;const url=frame.src;const cover=window.open('about:blank');cover.document.write('<iframe src="'+url+'" style="border:none;width:100%;height:100vh"></iframe>');closeEmbed()}
function fullscreenEmbed(){const frame=id('embed-frame');if(!frame)return;if(frame.requestFullscreen)frame.requestFullscreen();else if(frame.webkitRequestFullscreen)frame.webkitRequestFullscreen();else if(frame.msRequestFullscreen)frame.msRequestFullscreen()}
id('embed-close')?.addEventListener('click',closeEmbed)
id('embed-cloak')?.addEventListener('click',cloakCurrent)
id('embed-full')?.addEventListener('click',fullscreenEmbed)
id('close-log')?.addEventListener('click',()=>{const el=id('updateLog');if(el)el.style.display='none'})
id('cloak-btn')?.addEventListener('click',()=>{const cover=window.open('about:blank');cover.document.write('<iframe src="'+window.location.href+'" style="border:none;width:100%;height:100vh"></iframe>');window.location.href='https://ixl.com'})
const preventEl=id('prevent-close')
if(preventEl){const saved=localStorage.getItem('preventClose');preventEl.checked=saved==='true';preventEl.addEventListener('change',e=>localStorage.setItem('preventClose',e.target.checked?'true':'false'))}
window.addEventListener('beforeunload',e=>{if(localStorage.getItem('preventClose')==='true'){e.preventDefault();e.returnValue=''}})
document.querySelectorAll('.settings-nav').forEach(btn=>{btn.addEventListener('click',()=>{document.querySelectorAll('.settings-nav').forEach(b=>b.classList.remove('active'));btn.classList.add('active');const target=btn.dataset.s;document.querySelectorAll('.settings-panel').forEach(p=>p.classList.add('hidden'));const panel=document.querySelector('.settings-panel[data-panel=\"'+target+'\"]');if(panel)panel.classList.remove('hidden')})})
function buildThemeGrid(){const grid=id('theme-grid');if(!grid)return;grid.innerHTML='';THEMES.forEach(t=>{const tile=document.createElement('div');tile.className='theme-tile';const name=document.createElement('div');name.className='theme-name';name.textContent=t.id;const swatch=document.createElement('div');swatch.className='theme-swatch';swatch.style.background=`linear-gradient(90deg, ${t.vars.r1}, ${t.vars.r2})`;tile.appendChild(name);tile.appendChild(swatch);tile.addEventListener('click',()=>{applyTheme(t.id);closeThemeModal()});grid.appendChild(tile)})}
function openThemeModal(){id('theme-modal')?.classList.remove('hidden')}
function closeThemeModal(){id('theme-modal')?.classList.add('hidden')}
id('open-theme-modal')?.addEventListener('click',()=>{buildThemeGrid();openThemeModal()})
id('close-theme-modal')?.addEventListener('click',closeThemeModal)
async function init(){applyTheme(localStorage.getItem('astraTheme')||'black');const games=await loadRepoFiles('games');const apps=await loadRepoFiles('apps');const gameListEl=id('game-list');const toolListEl=id('tool-list');renderList(games,gameListEl);renderList(apps,toolListEl);if(id('games-count'))id('games-count').textContent=games.length||0;if(id('tools-count'))id('tools-count').textContent=apps.length||0;const gSearch=id('games-search');if(gSearch)gSearch.addEventListener('input',()=>filterList(games,gameListEl,gSearch.value,'games-count'));const tSearch=id('tools-search');if(tSearch)tSearch.addEventListener('input',()=>filterList(apps,toolListEl,tSearch.value,'tools-count'));document.querySelectorAll('.tab').forEach(t=>t.addEventListener('keydown',e=>{if(e.key==='Enter')t.click()}))}
init()
