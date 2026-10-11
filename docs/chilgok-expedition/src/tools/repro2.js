const { chromium } = require('playwright-core');
const SP = process.argv[2], MODE = process.argv[3];
const ROOT = SP + '/' + (process.argv[4]||'upload1') + '/칠곡원정대/';
(async () => {
  const args = MODE === 'nowebgl' ? ['--disable-gpu','--disable-3d-apis','--disable-webgl'] : [];
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.on('pageerror', e => console.log('[PAGEERROR]', String(e.message || e).slice(0, 300)));
  if (MODE === 'nocdn') await page.route('https://cdnjs.cloudflare.com/**', r => r.abort());
  if (MODE === 'nowebgl') { const fs=require('fs'); const T=fs.readFileSync(SP+'/three-pkg/package/build/three.min.js'); await page.route('https://cdnjs.cloudflare.com/**', r => r.fulfill({contentType:'application/javascript', body:T})); }
  await page.goto('file://' + ROOT + 'index.html');
  await page.waitForTimeout(500);
  await page.click('#btnStart'); await page.click('#btnToWorld');
  await page.click('#worldNodes .node-btn >> nth=0');
  await page.waitForTimeout(1500);
  console.log(MODE, '| game screen shown:', !(await page.$eval('#screen-game', e => e.hidden)),
    '| loadingNote:', await page.$eval('#loadingNote', e => e.hidden ? '(hidden)' : e.textContent),
    '| canvas count:', await page.$$eval('#canvasHolder canvas', c => c.length));
  await page.screenshot({ path: SP + '/repro-' + MODE + '.png' });
  await browser.close();
})();
