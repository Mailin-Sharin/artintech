const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errs=[];
  page.on('pageerror', e => errs.push(e.stack || (e.error && e.error.stack) || e.message));
  await page.goto('https://mailin-sharin.github.io/artintech/?v=41', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  // replicate audit steps exactly
  await page.click('#servicesGrid .service'); await page.waitForTimeout(400);
  await page.click('#modalClose'); await page.waitForTimeout(300);
  await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(300);
  await page.click('#menuBtn'); await page.waitForTimeout(500);
  await page.evaluate(() => document.getElementById('navLinks').classList.remove('open')); await page.waitForTimeout(300);
  await page.setViewportSize({ width: 1440, height: 900 }); await page.waitForTimeout(300);
  const hasNext = await page.evaluate(() => !!document.getElementById('hcNext'));
  if (hasNext) { await page.click('#hcNext'); await page.waitForTimeout(700); }
  const sizes = [{w:390},{w:360},{w:320},{w:768},{w:1024}];
  for (const s of sizes) { await page.setViewportSize({ width: s.w, height: 800 }); await page.waitForTimeout(400); }
  await page.waitForTimeout(1000);
  console.log('ERRORS:', errs.length);
  errs.slice(0,2).forEach((e,i)=>console.log('=== '+i+' ===\n'+String(e).split('\n').slice(0,10).join('\n')));
  await browser.close();
})();
