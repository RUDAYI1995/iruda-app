const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium',
    args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message || e).slice(0, 300)));
  await page.route('https://cdnjs.cloudflare.com/**', r => r.abort());   // prove it works with the CDN blocked
  await page.goto('file://' + SP + '/zipcheck/칠곡원정대/index.html');
  await page.waitForTimeout(600);
  console.log('red missing-file banner shown:', await page.evaluate(() => [...document.body.children].some(e => e.style && e.style.zIndex === '99999')));
  await page.click('#btnStart'); await page.click('#btnToWorld');
  await page.waitForTimeout(300);
  console.log('world nodes:', await page.$$eval('#worldNodes .node-btn', e => e.map(x => x.textContent.replace(/\s+/g,' ').trim()).join(' | ')));
  await page.click('#worldNodes .node-btn >> nth=6');            // the new 하늘섬 stop
  await page.waitForTimeout(6000);
  console.log('HUD place:', await page.$eval('#hudPlace', e => e.textContent), '/', await page.$eval('#hudSub', e => e.textContent));
  console.log('loadingNote hidden:', await page.$eval('#loadingNote', e => e.hidden), '| canvases:', await page.$$eval('#canvasHolder canvas', c => c.length));
  await page.screenshot({ path: SP + '/zipcheck_sky.png' });
  // go back to the map and enter an old stop to make sure the old flow still works
  await page.click('#btnMap'); await page.waitForTimeout(400);
  await page.click('#worldNodes .node-btn >> nth=0'); await page.waitForTimeout(3500);
  console.log('old stop HUD:', await page.$eval('#hudPlace', e => e.textContent));
  console.log(errs.length ? 'ERRORS: ' + errs.join(' || ') : 'no page errors');
  await browser.close();
})();
