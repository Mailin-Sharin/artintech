const fs = require('fs');
const { JSDOM } = require('jsdom');

const root = 'C:/Users/milad/artintech';
const html = fs.readFileSync(root + '/index.html', 'utf8');
const js = fs.readFileSync(root + '/main.js', 'utf8');
const settings = JSON.parse(fs.readFileSync(root + '/data/settings.json', 'utf8'));

const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://mailin-sharin.github.io/artintech/' });
const { window } = dom;
const { document } = window;

// polyfills
window.requestAnimationFrame = () => 0;
window.IntersectionObserver = class { observe(){} unobserve(){} disconnect(){} };
HTMLCanvasElement = window.HTMLCanvasElement;
window.HTMLCanvasElement.prototype.getContext = () => ({ clearRect(){}, beginPath(){}, arc(){}, fill(){}, moveTo(){}, lineTo(){}, stroke(){}, fillStyle:'', strokeStyle:'', lineWidth:1 });
window.fetch = (f) => Promise.resolve({ ok: true, json: () => Promise.resolve(settings) });

let pass=0, fail=0;
const check=(n,c)=>{ if(c){pass++;console.log('  PASS '+n);} else {fail++;console.log('  FAIL '+n);} };

// run main.js in window context
const scriptEl = document.createElement('script');
try {
  window.eval(js);
} catch(e){ console.log('JS ERROR:', e.message); }

// wait a tick for fetch promises
setTimeout(() => {
  check('services rendered (12)', document.querySelectorAll('#servicesGrid .service').length === 12);
  check('work rendered (4)', document.querySelectorAll('#workStrip .work').length === 4);
  check('store rendered (4)', document.querySelectorAll('#storeGrid .product').length === 4);
  check('training rendered (3)', document.querySelectorAll('#trainingGrid .course').length === 3);
  check('steps rendered (4)', document.querySelectorAll('#stepsGrid .step').length === 4);
  check('hero widget tabs (6)', document.querySelectorAll('#hwTabs .hw-tab').length === 6);
  check('hero widget panes (6)', document.querySelectorAll('#hwStage .hw-pane').length === 6);
  check('service icon no emoji (text badge)', [...document.querySelectorAll('#servicesGrid .ic')].every(e=>!/[🌐🐍🎬🌍⚙️📈🎨✍️🤖📊🧭🎓]/.test(e.textContent)));

  // interaction: click a service card -> modal opens
  const card = document.querySelector('#servicesGrid .service');
  card && card.dispatchEvent(new window.Event('click'));
  const modalOpen = document.getElementById('modal').classList.contains('open');
  check('service click opens modal', modalOpen);
  check('modal has SVG', document.querySelector('#modalMedia svg') !== null);

  // interaction: click hero tab -> pane active
  const tab = document.querySelector('#hwTabs .hw-tab:nth-child(2)');
  tab && tab.dispatchEvent(new window.Event('click'));
  const activePane = document.querySelector('#hwStage .hw-pane.active');
  check('hero tab click switches pane', activePane && activePane.id === 'pane-' + tab.dataset.id);

  // mobile menu toggle
  const menuBtn = document.getElementById('menuBtn');
  menuBtn && menuBtn.dispatchEvent(new window.Event('click'));
  check('mobile menu opens', document.getElementById('navLinks').classList.contains('open'));

  console.log('\n=== RENDER RESULT ===');
  console.log(`PASS: ${pass}  FAIL: ${fail}`);
  process.exit(fail>0?1:0);
}, 500);
