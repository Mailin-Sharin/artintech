const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const sizes = [
    { name: 'iPhone12', w: 390, h: 844 },
    { name: 'small', w: 360, h: 780 },
    { name: 'tiny', w: 320, h: 700 },
  ];
  for (const s of sizes) {
    const page = await browser.newPage({ viewport: { width: s.w, height: s.h }, isMobile: true, hasTouch: true });
    await page.goto('https://mailin-sharin.github.io/artintech/?v=34', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    const bad = await page.evaluate((cw) => {
      const de = document.documentElement;
      const out = [];
      document.querySelectorAll('*').forEach(el => {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        // ignore fixed elements (nav drawer, cursor glow) that are intentionally off-screen
        if (cs.position === 'fixed') return;
        if (r.right > cw + 1 && r.width > 0) {
          out.push({
            cls: el.className && el.className.toString().slice(0, 40),
            tag: el.tagName,
            w: Math.round(r.width),
            right: Math.round(r.right),
            parent: el.parentElement ? (el.parentElement.className || el.parentElement.tagName).toString().slice(0, 30) : '-'
          });
        }
      });
      return out.slice(0, 20);
    }, s.w);
    console.log(`\n=== ${s.name} (${s.w}px) ===`);
    if (bad.length === 0) console.log('  CLEAN - no horizontal overflow');
    else bad.forEach(b => console.log(`  ${b.cls} <${b.tag}> w=${b.w} right=${b.right} parent=${b.parent}`));
    await page.screenshot({ path: `mobilecheck/${s.name}.png` });
    await page.close();
  }
  await browser.close();
})();
