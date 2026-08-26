/* ===== ArtinTech — interactive hero widget + starfield bg + content ===== */
document.body.classList.add('js-ready');
const DATA_BASE='data/';
const _cache={};
async function loadJSON(f){if(_cache[f])return _cache[f];try{const r=await fetch(DATA_BASE+f);if(!r.ok){showDataError();return null;}const j=await r.json();_cache[f]=j;return j;}catch(e){showDataError();return null;}}
function showDataError(){document.querySelectorAll('#servicesGrid,#workStrip,#storeGrid,#trainingGrid,#stepsGrid').forEach(g=>{if(g&&g.children.length===0)g.innerHTML='<p style="color:var(--muted);grid-column:1/-1">سایت باید روی سرور باز شود.</p>';});}

/* ---- canvas: starfield + mouse connect ---- */
const canvas=document.getElementById('bg'),ctx=canvas.getContext('2d');
let W,H,nodes,mx=-999,my=-999;
function resize(){W=canvas.width=innerWidth;H=canvas.height=innerHeight;const n=Math.min(130,Math.floor(W*H/14000));nodes=Array.from({length:n},()=>({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.4,vy:(Math.random()-.5)*.4,r:Math.random()*1.8+0.6}));}
resize();addEventListener('resize',resize);
addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;const g=document.querySelector('.cursor-glow');if(g){g.style.left=mx+'px';g.style.top=my+'px';}});
function loop(){
  if(!ctx)return;
  ctx.clearRect(0,0,W,H);
  for(const p of nodes){p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>W)p.vx*=-1;if(p.y<0||p.y>H)p.vy*=-1;
    const dx=p.x-mx,dy=p.y-my,d=Math.hypot(dx,dy);
    let glow=0;
    if(d<200){p.x+=dx/d*1.4;p.y+=dy/d*1.4;glow=(200-d)/200;}
    ctx.beginPath();ctx.arc(p.x,p.y,p.r+(glow*1.6),0,7);
    ctx.fillStyle='rgba('+(170+glow*60)+','+(185+glow*40)+',255,'+(.55+glow*.4)+')';ctx.fill();
    if(d<200){ctx.strokeStyle='rgba(124,92,255,'+(glow*.5)+')';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(mx,my);ctx.stroke();}
  }
  for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){const a=nodes[i],b=nodes[j],d=Math.hypot(a.x-b.x,a.y-b.y);if(d<100){ctx.strokeStyle='rgba(124,92,255,'+(1-d/100)*.22+')';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}}
  requestAnimationFrame(loop);
}
loop();

/* ---- interactive hero widget ---- */
/* ---- hero portfolio carousel ---- */
let hcIndex=0, hcItems=[];
async function buildHeroCarousel(){
  const s=await loadJSON('settings.json'); if(!s||!s.work)return;
  const track=document.getElementById('hcTrack'),dots=document.getElementById('hcDots');
  hcItems=s.work.map(w=>({t:w.t,cat:w.cat,kind:w.kind}));
  hcItems.forEach((it,i)=>{
    const slide=document.createElement('div');slide.className='hc-slide';
    slide.innerHTML=`<div class="mock">${mockSVG(it.kind)}</div><span class="cat">${it.cat}</span><h3>${it.t}</h3><p>نمونه‌ای واقعی از پروژه‌های تحویل‌شده آرتین‌تک در این حوزه.</p>`;
    track.appendChild(slide);
    const d=document.createElement('span');if(i===0)d.className='active';d.onclick=()=>goSlide(i);dots.appendChild(d);
  });
  document.getElementById('hcPrev').onclick=()=>goSlide(hcIndex-1);
  document.getElementById('hcNext').onclick=()=>goSlide(hcIndex+1);
  updateHero();
  setInterval(()=>{if(hcItems.length)goSlide(hcIndex+1);},5000);
}
function goSlide(i){hcIndex=(i+hcItems.length)%hcItems.length;updateHero();}
function updateHero(){
  const track=document.getElementById('hcTrack'); if(!track)return;
  track.style.transform='translateX('+(-hcIndex*100)+'%)';
  document.querySelectorAll('#hcDots span').forEach((d,i)=>d.classList.toggle('active',i===hcIndex));
}
if(document.getElementById('hcTrack'))buildHeroCarousel();


/* ---- magnetic + tilt ---- */
document.querySelectorAll('.mag').forEach(function(b){b.addEventListener('mousemove',function(e){var r=b.getBoundingClientRect();var x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;b.style.transform='translate('+(x*0.25)+'px,'+(y*0.35)+'px)';});b.addEventListener('mouseleave',function(){b.style.transform='';});});
function bindTilt(el){el.addEventListener('mousemove',function(e){var r=el.getBoundingClientRect();var px=(e.clientX-r.left)/r.width,py=(e.clientY-r.top)/r.height;el.style.transform='perspective(900px) rotateY('+((px-0.5)*10)+'deg) rotateX('+((0.5-py)*10)+'deg) translateY(-6px)';el.style.setProperty('--mx',(px*100)+'%');el.style.setProperty('--my',(py*100)+'%');});el.addEventListener('mouseleave',function(){el.style.transform='';});}

/* ---- modal ---- */
const modal=document.getElementById('modal');
function openModal(s){document.getElementById('modalKicker').textContent=s.cat;document.getElementById('modalTitle').textContent=s.t;document.getElementById('modalDesc').textContent=s.d;document.getElementById('modalStack').innerHTML=(s.stack||[]).map(x=>`<span>${x}</span>`).join('');sample(s.id);modal.classList.add('open');modal.setAttribute('aria-hidden','false');}
function closeModal(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');}
document.getElementById('modalClose').addEventListener('click',closeModal);
document.getElementById('modalBackdrop').addEventListener('click',closeModal);
document.getElementById('modalCta').addEventListener('click',closeModal);

/* ---- mobile menu ---- */
const menuBtn=document.getElementById('menuBtn'),navLinks=document.getElementById('navLinks'),navClose=document.getElementById('navClose'),navBackdrop=document.getElementById('navBackdrop');
function closeMenu(){navLinks.classList.remove('open');menuBtn.setAttribute('aria-expanded','false');}
menuBtn.addEventListener('click',()=>{const o=navLinks.classList.toggle('open');menuBtn.setAttribute('aria-expanded',o?'true':'false');});
navClose.addEventListener('click',closeMenu);navBackdrop.addEventListener('click',closeMenu);
navLinks.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));

/* ---- scroll + reveal + counters ---- */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{threshold:.12});
addEventListener('scroll',()=>{const h=document.documentElement;const bar=document.getElementById('scrollProgress')||document.querySelector('.scroll-progress');if(bar)bar.style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+'%';});

const ICONS={web:"وب",python:"PY",video:"وی",translate:"تر",automation:"ات",seo:"سئو",ai:"گر",content:"مت",chatbot:"بات",data:"داده",selfdev:"خود",training:"آم"};
async function renderServices(){const s=await loadJSON('settings.json');if(!s)return;const w=document.getElementById('servicesGrid');s.services.forEach(sv=>{const el=document.createElement('article');el.className='service reveal';const ic=sv.ic||'★';el.innerHTML=`<div class="ic">${ic}</div><h3>${sv.t}</h3><p>${sv.d}</p><div class="more">مشاهده نمونه‌کار ←</div>`;bindTilt(el);el.addEventListener('click',()=>openModal(sv));w.appendChild(el);io.observe(el);});}
async function renderWork(){const s=await loadJSON('settings.json');if(!s)return;const w=document.getElementById('workStrip');(s.work||[]).forEach(it=>{const el=document.createElement('article');el.className='work reveal';el.innerHTML=`<div class="mock">${mockSVG(it.kind)}</div><div class="cap"><h4>${it.t}</h4><span>${it.cat}</span></div>`;w.appendChild(el);io.observe(el);});}
async function renderStore(){const s=await loadJSON('settings.json');if(!s||!s.store||!s.store.enabled)return;const w=document.getElementById('storeGrid');(s.store.items||[]).forEach(it=>{const el=document.createElement('article');el.className='product reveal';el.innerHTML=`<span class="cat">${it.cat}</span><h3>${it.name}</h3><p>${it.desc}</p><div class="price">${it.price}</div><a href="#contact" class="btn btn-primary mag">درخواست / خرید</a>`;w.appendChild(el);io.observe(el);});}
async function renderTraining(){const s=await loadJSON('settings.json');if(!s)return;const w=document.getElementById('trainingGrid');(s.training||[]).forEach(c=>{const el=document.createElement('article');el.className='course reveal';const priceHtml=c.free?'<span class="price free">رایگان</span>':`<span class="price">${c.price}</span>`;const link=c.shopId?`<a href="#store" class="shop-link mag">مشاهده در فروشگاه ←</a>`:'';el.innerHTML=`<div class="lv">${c.level}</div><h3>${c.t}</h3><p>${c.d}</p>${priceHtml}${link}`;if(c.shopId)el.querySelector('.shop-link').addEventListener('click',()=>document.getElementById('store').scrollIntoView({behavior:'smooth'}));w.appendChild(el);io.observe(el);});}
async function renderSteps(){const s=await loadJSON('settings.json');if(!s)return;const w=document.getElementById('stepsGrid');(s.process||[]).forEach(p=>{const el=document.createElement('article');el.className='step reveal';el.innerHTML=`<span class="n">${p.n}</span><h3>${p.t}</h3><p>${p.d}</p>`;w.appendChild(el);io.observe(el);});}
function runCounters(){document.querySelectorAll('[data-count]').forEach(el=>{const to=+el.dataset.count;let cur=0;const step=Math.max(1,to/40);const t=setInterval(()=>{cur+=step;if(cur>=to){cur=to;clearInterval(t);}el.textContent=Math.floor(cur).toLocaleString('fa-IR');},25);});}
const cio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){runCounters();cio.disconnect();}}),{threshold:.4});
const heroM=document.querySelector('.hero-metrics');if(heroM)cio.observe(heroM);

function mockSVG(kind){const f='#0a0a16',c='#7c5cff',c2='#22d3ee',m='#9aa3c0';
  if(kind==='shop')return `<svg viewBox="0 0 360 220"><rect width="360" height="220" fill="${f}"/><rect x="16" y="16" width="328" height="40" rx="8" fill="#161d31"/><circle cx="40" cy="36" r="10" fill="${c}"/><text x="58" y="42" fill="#fff" font-size="12" font-family="Vazirmatn,Tahoma">فروشگاه</text><rect x="16" y="72" width="100" height="120" rx="10" fill="#1b2238"/><rect x="130" y="72" width="100" height="120" rx="10" fill="#1b2238"/><rect x="244" y="72" width="100" height="120" rx="10" fill="#1b2238"/><rect x="28" y="84" width="76" height="50" rx="6" fill="${c2}"/><rect x="142" y="84" width="76" height="50" rx="6" fill="${c}"/><rect x="256" y="84" width="76" height="50" rx="6" fill="${c2}"/><rect x="28" y="146" width="76" height="14" rx="7" fill="#2a3350"/><rect x="142" y="146" width="76" height="14" rx="7" fill="#2a3350"/><rect x="256" y="146" width="76" height="14" rx="7" fill="#2a3350"/><circle cx="300" cy="36" r="8" fill="${c2}"/></svg>`;
  if(kind==='dash')return `<svg viewBox="0 0 360 220"><rect width="360" height="220" fill="${f}"/><rect x="16" y="16" width="80" height="188" rx="8" fill="#161d31"/><circle cx="56" cy="44" r="14" fill="${c}"/><rect x="40" y="80" width="32" height="8" rx="4" fill="${m}"/><rect x="40" y="100" width="32" height="8" rx="4" fill="${m}"/><rect x="112" y="28" width="232" height="60" rx="8" fill="#1b2238"/><polyline points="120,70 160,50 200,60 240,38 280,52 340,30" fill="none" stroke="${c2}" stroke-width="3"/><rect x="112" y="100" width="110" height="100" rx="8" fill="#1b2238"/><rect x="234" y="100" width="110" height="100" rx="8" fill="#1b2238"/><circle cx="167" cy="150" r="26" fill="${c}"/><rect x="250" y="130" width="78" height="10" rx="5" fill="${m}"/><rect x="250" y="150" width="60" height="10" rx="5" fill="${m}"/></svg>`;
  if(kind==='land')return `<svg viewBox="0 0 360 220"><rect width="360" height="220" fill="${f}"/><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7c5cff"/><stop offset="1" stop-color="#22d3ee"/></linearGradient></defs><rect x="0" y="0" width="360" height="100" fill="url(#g)"/><text x="24" y="50" fill="#fff" font-size="20" font-weight="900" font-family="Vazirmatn",Tahoma>لندینگ‌پیج</text><rect x="24" y="120" width="160" height="14" rx="7" fill="#1b2238"/><rect x="24" y="146" width="220" height="14" rx="7" fill="#1b2238"/><rect x="24" y="180" width="120" height="30" rx="10" fill="${c}"/></svg>`;
  if(kind==='app')return `<svg viewBox="0 0 360 220"><rect width="360" height="220" fill="${f}"/><rect x="130" y="20" width="100" height="180" rx="16" fill="#161d31" stroke="${c}"/><rect x="142" y="40" width="76" height="50" rx="8" fill="${c2}"/><rect x="142" y="100" width="76" height="10" rx="5" fill="${m}"/><rect x="142" y="120" width="76" height="10" rx="5" fill="${m}"/><rect x="142" y="170" width="76" height="20" rx="10" fill="${c}"/></svg>`;
  return `<svg viewBox="0 0 360 220"><rect width="360" height="220" fill="${f}"/><rect x="20" y="20" width="320" height="180" rx="12" fill="#161d31"/><text x="40" y="120" fill="${c2}" font-size="18" font-family="Vazirmatn",Tahoma>نمونه‌کار</text></svg>`;
}
function sample(id){const map={web:mockSVG('land'),python:mockSVG('dash'),video:mockSVG('app'),translate:mockSVG('land'),automation:mockSVG('dash'),seo:mockSVG('dash'),ai:mockSVG('shop'),content:mockSVG('land'),chatbot:mockSVG('app'),data:mockSVG('dash'),selfdev:mockSVG('land'),training:mockSVG('shop')};document.getElementById('modalMedia').innerHTML=map[id]||mockSVG('land');}

const form=document.getElementById('contactForm');
if(form)form.addEventListener('submit',e=>{e.preventDefault();const name=document.getElementById('cName').value.trim(),phone=document.getElementById('cPhone').value.trim(),service=document.getElementById('cService').value,msg=document.getElementById('cMsg').value.trim();window.location.href='mailto:info@artintech.ir?subject='+encodeURIComponent('درخواست از آرتین‌تک - '+name)+'&body='+encodeURIComponent(`نام: ${name}\nتلفن: ${phone}\nخدمت: ${service}\nپیام: ${msg}`);document.getElementById('formNote').textContent='درخواست آماده ارسال شد';if(navigator.clipboard)navigator.clipboard.writeText(`نام: ${name} | ${service}`).catch(()=>{});e.target.reset();});

renderServices();renderWork();renderStore();renderTraining();renderSteps();
setTimeout(()=>document.querySelectorAll('.reveal:not(.in)').forEach(el=>el.classList.add('in')),1300);
