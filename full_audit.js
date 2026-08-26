const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const report = { pass: [], fail: [], warnings: [] };
  const log = (type, msg) => report[type].push(msg);

  // ===== 1. LOCAL FILE SYNTAX =====
  try { require('child_process').execSync('node --check main.js'); log('pass', 'main.js syntax OK'); }
  catch(e){ log('fail', 'main.js syntax error: '+e.message); }

  // ===== 2. LOAD LIVE SITE =====
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const consoleErrors = [];
  page.on('console', m => { if (m.type()==='error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => consoleErrors.push('PAGEERR: '+e.message));
  await page.goto('https://mailin-sharin.github.io/artintech/?v=38', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  // ===== 3. RENDER CHECK (all sections populated) =====
  const render = await page.evaluate(() => {
    const c = id => document.getElementById(id)?.children.length || 0;
    return {
      services: c('servicesGrid'),
      work: c('workStrip'),
      store: c('storeGrid'),
      training: c('trainingGrid'),
      steps: c('stepsGrid'),
      carousel: document.querySelectorAll('#hcTrack .hc-slide').length,
      heroH1: document.querySelector('.hero-pitch h1')?.innerText,
      footer: document.querySelector('.footer-bottom')?.textContent,
      studio: document.body.innerText.includes('استودیو خدمات دیجیتال'),
      emoji: /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/u.test(document.body.innerText.replace(/★/g,''))
    };
  });
  log(render.services===12?'pass':'fail', `services rendered: ${render.services}/12`);
  log(render.work===4?'pass':'fail', `work rendered: ${render.work}/4`);
  log(render.store===4?'pass':'fail', `store rendered: ${render.store}/4`);
  log(render.training===3?'pass':'fail', `training rendered: ${render.training}/3`);
  log(render.steps===4?'pass':'fail', `steps rendered: ${render.steps}/4`);
  log(render.carousel===4?'pass':'fail', `carousel slides: ${render.carousel}/4`);
  log(render.studio?'fail':'pass', `studio text removed: ${!render.studio}`);
  log(render.emoji?'fail':'pass', `no emoji in content: ${!render.emoji}`);

  // ===== 4. INTERACTIONS =====
  // 4a. service card click -> modal
  await page.click('#servicesGrid .service');
  await page.waitForTimeout(400);
  const modalOpen = await page.evaluate(() => document.getElementById('modal')?.classList.contains('open'));
  log(modalOpen?'pass':'fail', `service card opens modal: ${modalOpen}`);
  await page.click('#modalClose'); await page.waitForTimeout(300);

  // 4b. mobile menu
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);
  await page.click('#menuBtn'); await page.waitForTimeout(500);
  const menuOpen = await page.evaluate(() => document.getElementById('navLinks')?.classList.contains('open'));
  log(menuOpen?'pass':'fail', `mobile menu opens: ${menuOpen}`);
  await page.evaluate(() => document.getElementById('navLinks').classList.remove('open'));
  await page.waitForTimeout(300);

  // 4c. carousel next
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(300);
  const beforeIdx = await page.evaluate(() => [...document.querySelectorAll('#hcDots span')].findIndex(s=>s.classList.contains('active')));
  await page.click('#hcNext'); await page.waitForTimeout(700);
  const afterIdx = await page.evaluate(() => [...document.querySelectorAll('#hcDots span')].findIndex(s=>s.classList.contains('active')));
  log(beforeIdx!==afterIdx && afterIdx>=0?'pass':'fail', `carousel navigates: ${beforeIdx} -> ${afterIdx}`);

  // ===== 5. RESPONSIVE OVERFLOW (multiple sizes) =====
  const sizes = [{n:'iPhone12',w:390},{n:'360',w:360},{n:'320',w:320},{n:'768',w:768},{n:'1024',w:1024}];
  for (const s of sizes) {
    await page.setViewportSize({ width: s.w, height: 800 });
    await page.waitForTimeout(400);
    const bad = await page.evaluate((cw) => {
      const out=[]; document.querySelectorAll('*').forEach(el=>{
        const r=el.getBoundingClientRect(); const cs=getComputedStyle(el);
        if(cs.position==='fixed') return;
        let p=el; while(p){ if(p.id==='navLinks'&&!p.classList.contains('open')) return; p=p.parentElement; }
        if(r.right>cw+1 && r.width>0) out.push((el.className||el.tagName).toString().slice(0,30));
      }); return out;
    }, s.w);
    log(bad.length===0?'pass':'fail', `${s.n} (${s.w}px) overflow: ${bad.length? bad.slice(0,3).join(', ') : 'CLEAN'}`);
  }

  // ===== 6. ACCESSIBILITY / CONTRAST =====
  const a11y = await page.evaluate(() => {
    const links = document.querySelectorAll('a, button');
    let noAria = 0;
    links.forEach(l => { if(!l.getAttribute('aria-label') && !l.textContent.trim()) noAria++; });
    const imgs = document.querySelectorAll('img');
    return { interactiveCount: links.length, emptyInteractive: noAria, imgCount: imgs.length };
  });
  log(a11y.emptyInteractive===0?'pass':'warn', `empty interactive elements: ${a11y.emptyInteractive}`);

  // ===== 7. CONSOLE ERRORS =====
  log(consoleErrors.length===0?'pass':'fail', `console errors: ${consoleErrors.length? consoleErrors.slice(0,3).join(' | ') : 'none'}`);

  // ===== SUMMARY =====
  console.log('\n========== ARTINTECH AUDIT REPORT ==========');
  console.log(`\nPASS (${report.pass.length}):`);
  report.pass.forEach(p => console.log('  ✓ '+p));
  if (report.warnings.length) { console.log(`\nWARNINGS (${report.warnings.length}):`); report.warnings.forEach(w => console.log('  ⚠ '+w)); }
  if (report.fail.length) { console.log(`\nFAIL (${report.fail.length}):`); report.fail.forEach(f => console.log('  ✗ '+f)); }
  console.log(`\nSCORE: ${report.pass.length}/${report.pass.length+report.fail.length} checks passed`);
  console.log('=============================================');

  await browser.close();
  fs.writeFileSync('audit_report.txt', JSON.stringify(report,null,2));
})();
