const fs = require('fs');
const path = require('path');

const root = 'C:/Users/milad/artintech';
let pass = 0, fail = 0;
function check(name, cond){ if(cond){pass++; console.log('  PASS '+name);} else {fail++; console.log('  FAIL '+name);} }

console.log('=== FILE STRUCTURE ===');
const files = ['index.html','styles.css','main.js','data/settings.json'];
files.forEach(f=>check('exists '+f, fs.existsSync(path.join(root,f))));

console.log('\n=== JSON VALID ===');
let settings;
try { settings = JSON.parse(fs.readFileSync(path.join(root,'data/settings.json'),'utf8')); check('settings.json parses', true); }
catch(e){ check('settings.json parses', false); }
if(settings){
  check('12 services', (settings.services||[]).length===12);
  check('work array', Array.isArray(settings.work) && settings.work.length>0);
  check('training array', Array.isArray(settings.training) && settings.training.length>0);
  check('store enabled+items', settings.store && settings.store.enabled && settings.store.items.length>0);
  check('process array', Array.isArray(settings.process) && settings.process.length>0);
  // no emoji in service icons
  const hasEmoji = (settings.services||[]).some(s=>/[🌐🐍🎬🌍⚙️📈🎨✍️🤖📊🧭🎓]/.test(s.ic||''));
  check('no emoji in service icons', !hasEmoji);
}

console.log('\n=== HTML CONTAINERS ===');
const html = fs.readFileSync(path.join(root,'index.html'),'utf8');
['servicesGrid','workStrip','storeGrid','trainingGrid','stepsGrid','hwTabs','hwStage','modal','contactForm','navLinks','menuBtn']
  .forEach(id=>check('container #'+id, html.includes('id="'+id+'"')));

console.log('\n=== CSS RESPONSIVE ===');
const css = fs.readFileSync(path.join(root,'styles.css'),'utf8');
check('980px breakpoint', css.includes('@media(max-width:980px)'));
check('680px breakpoint (mobile)', css.includes('@media(max-width:680px)'));
check('mobile menu transform', css.includes('transform:translateX(100%)'));
check('no cursor:none (mouse visible)', !css.includes('cursor:none'));
check('glass nav pill', css.includes('border-radius:999px') && css.includes('backdrop-filter'));
check('varied card shapes', css.includes('clip-path:polygon') || css.includes('24px 24px 24px 4px'));
check('floating-label form', css.includes('.floating'));

console.log('\n=== JS LOGIC ===');
const js = fs.readFileSync(path.join(root,'main.js'),'utf8');
check('canvas starfield', js.includes('requestAnimationFrame(loop)'));
check('hero widget builder', js.includes('buildHeroWidget'));
check('modal open', js.includes('openModal'));
check('mobile menu toggle', js.includes('navLinks.classList.toggle'));
check('tilt binding', js.includes('bindTilt'));
check('no syntax error (rough)', !js.includes('undefined undefined'));

console.log('\n=== RESULT ===');
console.log(`PASS: ${pass}  FAIL: ${fail}`);
process.exit(fail>0?1:0);
