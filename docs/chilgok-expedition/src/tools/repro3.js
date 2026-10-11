const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 936, height: 335 } });
  page.on('pageerror', e => console.log('[PAGEERROR]', String(e.message || e).slice(0, 200)));
  await page.goto('file://' + SP + '/missing/칠곡원정대/index.html');
  await page.waitForTimeout(500);
  await page.click('#btnStart');
  await page.waitForTimeout(300);
  console.log('char cards:', await page.$$eval('#charGrid .char-card', e => e.length));
  await page.click('#btnToWorld'); await page.waitForTimeout(300);
  console.log('world screen shown after click:', !(await page.$eval('#screen-world', e => e.hidden)));
  await page.screenshot({ path: SP + '/repro-missing.png' });
  await browser.close();
})();
