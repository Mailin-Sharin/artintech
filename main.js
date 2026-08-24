/* ===== ArtinTech dynamic loader (content from data/*.json) ===== */
const DATA_BASE='data/';
const _cache={};
async function loadJSON(f){
  if(_cache[f])return _cache[f];
  try{
    const r=await fetch(DATA_BASE+f);
    if(!r.ok){showDataError();return null;}
    const j=await r.json();_cache[f]=j;return j;
  }catch(e){showDataError();return null;}
}
function showDataError(){
  document.querySelectorAll('#servicesGrid,#storeGrid,#blogGrid').forEach(g=>{
    if(g && g.children.length===0){g.innerHTML='<p style="color:var(--muted);grid-column:1/-1">⚠️ برای نمایش کامل، سایت باید روی سرور باز شود (مثلاً با دستور <code>python -m http.server</code>) — باز کردن مستقیم فایل باعث عدم بارگذاری می‌شود.</p>';}
  });
}

/* ---------- Mobile menu ---------- */
const menuBtn=document.getElementById('menuBtn');
const navLinks=document.getElementById('navLinks');
const navClose=document.getElementById('navClose');
const navBackdrop=document.getElementById('navBackdrop');
function closeMenu(){navLinks.classList.remove('open');menuBtn.setAttribute('aria-expanded','false')}
menuBtn.addEventListener('click',()=>{const open=navLinks.classList.toggle('open');menuBtn.setAttribute('aria-expanded',open?'true':'false')});
navClose.addEventListener('click',closeMenu);
navBackdrop.addEventListener('click',closeMenu);
navLinks.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));

/* ---------- Reveal on scroll ---------- */
const io=new IntersectionObserver(entries=>{
  entries.forEach(en=>{if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target)}});
},{threshold:.12});
function observeReveal(el){io.observe(el)}

/* ---------- Services (from settings.json) ---------- */
async function renderServices(){
  const s=await loadJSON('settings.json');
  if(!s)return;
  const wrap=document.getElementById('servicesGrid');
  (s.services||[]).forEach(sv=>{
    const el=document.createElement('article');
    el.className='service reveal';
    el.innerHTML=`<div class="ic">${sv.ic}</div><h3>${sv.t}</h3><p>${sv.d}</p>`;
    wrap.appendChild(el);observeReveal(el);
  });
}

/* ---------- Store (from settings.json) ---------- */
async function renderStore(){
  const s=await loadJSON('settings.json');
  if(!s||!s.store||!s.store.enabled)return;
  const wrap=document.getElementById('storeGrid');
  (s.store.items||[]).forEach(it=>{
    const el=document.createElement('article');
    el.className='product reveal';
    el.innerHTML=`<span class="cat">${it.cat}</span><h3>${it.name}</h3><p>${it.desc}</p><div class="price">${it.price}</div><a href="#contact" class="btn btn-primary buy">درخواست / خرید</a>`;
    wrap.appendChild(el);observeReveal(el);
  });
}

/* ---------- Blog (from blog.json) ---------- */
async function renderBlog(){
  const b=await loadJSON('blog.json');
  if(!b)return;
  const wrap=document.getElementById('blogGrid');
  (b.posts||[]).forEach(p=>{
    const el=document.createElement('article');
    el.className='post reveal';
    el.innerHTML=`<span class="tag">${p.tag}</span><h3>${p.title}</h3><p>${p.excerpt||''}</p><span class="date">${p.date||''}</span>`;
    wrap.appendChild(el);observeReveal(el);
  });
}

/* ---------- Contact form (mailto + clipboard safety) ---------- */
const form=document.getElementById('contactForm');
if(form){
  form.addEventListener('submit',e=>{
    e.preventDefault();
    const name=document.getElementById('cName').value.trim();
    const phone=document.getElementById('cPhone').value.trim();
    const service=document.getElementById('cService').value;
    const msg=document.getElementById('cMsg').value.trim();
    const subject='درخواست از آرتین‌تک - '+name;
    const body='نام: '+name+'\nتلفن: '+phone+'\nخدمت: '+service+'\nپیام: '+msg;
    window.location.href='mailto:info@artintech.ir?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
    document.getElementById('formNote').textContent='درخواست آماده ارسال شد ✅ (نسخه نمایشی — پس از تحویل مستقیم ارسال می‌شود).';
    if(navigator.clipboard){navigator.clipboard.writeText('موضوع: '+subject+'\n'+body).catch(()=>{});}
    e.target.reset();
  });
}

/* ---------- init ---------- */
renderServices();renderStore();renderBlog();
