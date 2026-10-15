const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium',
    args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  // a right-side panel is narrower than a full browser window
  const page = await browser.newPage({ viewport: { width: 720, height: 760 } });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message || e).slice(0, 300)));
  page.on('requestfailed', r => errs.push('request failed: ' + r.url().slice(-60)));
  await page.route('https://cdnjs.cloudflare.com/**', r => r.abort());
  await page.goto('file://' + SP + '/artifact/site/index.html');
  await page.waitForTimeout(600);
  await page.screenshot({ path: SP + '/panel_title.png' });
  await page.click('#btnStart'); await page.click('#btnToWorld'); await page.waitForTimeout(300);
  await page.click('#worldNodes .node-btn >> nth=6'); await page.waitForTimeout(7000);
  console.log('HUD:', await page.$eval('#hudPlace', e => e.textContent), '| canvases:', await page.$$eval('#canvasHolder canvas', c => c.length));
  console.log('horizontal overflow:', await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1));
  await page.screenshot({ path: SP + '/panel_sky.png' });
  console.log(errs.length ? 'ERRORS: ' + errs.join(' || ') : 'no errors');
  await browser.close();
})();
