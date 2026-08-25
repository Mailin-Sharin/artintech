const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('console', m => { if (m.type()==='error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGEERR: '+e.message));
  await page.goto('https://mailin-sharin.github.io/artintech/?v=20', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: 'C:/Users/milad/artintech_shot_desktop.png', fullPage: false });

  // mobile
  const mob = await browser.newPage({ viewport: { width: 375, height: 812 } });
  await mob.goto('https://mailin-sharin.github.io/artintech/?v=20', { waitUntil: 'networkidle' });
  await mob.waitForTimeout(2000);
  await mob.screenshot({ path: 'C:/Users/milad/artintech_shot_mobile.png', fullPage: false });

  // check key things rendered on desktop
  const stats = await page.evaluate(() => ({
    services: document.querySelectorAll('#servicesGrid .service').length,
    work: document.querySelectorAll('#workStrip .work').length,
    tabs: document.querySelectorAll('#hwTabs .hw-tab').length,
    heroH1: document.querySelector('.hero-pitch h1') ? document.querySelector('.hero-pitch h1').innerText.trim() : null,
    studioText: document.body.innerText.includes('استودیو خدمات دیجیتال'),
    widgetVisible: (()=>{const w=document.getElementById('heroWidget');if(!w)return false;const r=w.getBoundingClientRect();return r.width>0&&r.height>0;})()
  }));

  console.log('RENDER STATS:', JSON.stringify(stats));
  console.log('CONSOLE ERRORS:', errors.length ? errors.join(' | ') : 'none');
  await browser.close();
})();
