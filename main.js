/* ---------- Mobile menu ---------- */
const menuBtn=document.getElementById('menuBtn');
const navLinks=document.getElementById('navLinks');
const navClose=document.getElementById('navClose');
const navBackdrop=document.getElementById('navBackdrop');
function closeMenu(){navLinks.classList.remove('open')}
menuBtn.addEventListener('click',()=>navLinks.classList.toggle('open'));
navClose.addEventListener('click',closeMenu);
navBackdrop.addEventListener('click',closeMenu);
navLinks.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));

/* ---------- Reveal on scroll ---------- */
const io=new IntersectionObserver(entries=>{
  entries.forEach(en=>{if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target)}});
},{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

/* ---------- Blog (auto-generated sample posts) ---------- */
const POSTS=[
  {tag:'خودسازی',title:'۵ عادت دیجیتال که بهره‌وری تو را ۲ برابر می‌کند',date:'۱۴۰۴/۰۶/۰۲',excerpt:'از اتوماسیون کارهای تکراری تا مدیریت زمان — قدم‌های کوچکی که تفاوت بزرگی می‌سازند.'},
  {tag:'سئو',title:'سئو برای مبتدیان: چگونه در گوگل دیده شوید',date:'۱۴۰۴/۰۶/۰۱',excerpt:'کلمات کلیدی، متا‌تگ و سرعت — سه ستون دیدپذیری که هر سایتی به آن نیاز دارد.'},
  {tag:'هوش مصنوعی',title:'تبدیل متن به گفتار فارسی؛ چرا محتوای صوتی مهم است',date:'۱۴۰۴/۰۵/۳۱',excerpt:'با TTS فارسی، ویدیوها و کتاب‌های صوتی‌ات را در کمترین زمان آماده کن.'},
  {tag:'مهارت',title:'یادگیری پایتون در ۳۰ روز — نقشه راه عملی',date:'۱۴۰۴/۰۵/۳۰',excerpt:'از متغیر تا اتوماسیون؛ مسیری گام‌به‌گام برای تبدیل شدن به یک سازنده ابزار.'},
  {tag:'تولید محتوا',title:'تصویرسازی با هوش مصنوعی چطور کار می‌کند',date:'۱۴۰۴/۰۵/۲۹',excerpt:'چگونه از متن به تصویری حرفه‌ای می‌رسی — بدون نیاز به مهارت گرافیک.'},
  {tag:'خودسازی',title:'چرا داشتن وب‌سایت شخصی برای رشد فردی ضروری است',date:'۱۴۰۴/۰۵/۲۸',excerpt:'حضور آنلاین، اعتبار می‌سازد. از کجا شروع کنی و چه بگذاری.'}
];
const blogGrid=document.getElementById('blogGrid');
POSTS.forEach(p=>{
  const el=document.createElement('article');
  el.className='post reveal';
  el.innerHTML=`<span class="tag">${p.tag}</span><h3>${p.title}</h3><p>${p.excerpt}</p><span class="date">${p.date}</span>`;
  blogGrid.appendChild(el);
  io.observe(el);
});

/* ---------- Contact form (mailto fallback) ---------- */
document.getElementById('contactForm').addEventListener('submit',e=>{
  e.preventDefault();
  const name=document.getElementById('cName').value.trim();
  const phone=document.getElementById('cPhone').value.trim();
  const service=document.getElementById('cService').value;
  const msg=document.getElementById('cMsg').value.trim();
  const subject='درخواست مشاوره از آرتین‌تک - '+name;
  const body='نام: '+name+'\nتلفن: '+phone+'\nخدمت: '+service+'\nپیام: '+msg;
  // Try mailto; also surface the text so the lead is never lost on mail-less devices.
  window.location.href='mailto:info@artintech.ir?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
  const note=document.getElementById('formNote');
  note.textContent='درخواست شما آماده ارسال شد ✅ لطفاً ایمیل بازشده را ارسال کنید. (نسخه نمایشی — پس از تحویل، فرم مستقیماً و بدون نیاز به ایمیل برای ما ارسال می‌شود.)';
  // Copy to clipboard as a safety net
  if(navigator.clipboard){navigator.clipboard.writeText('موضوع: '+subject+'\n'+body).catch(()=>{});}
  e.target.reset();
});
