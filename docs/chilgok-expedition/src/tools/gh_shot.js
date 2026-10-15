const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1300, height: 760 } });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/test_new/index.html'); await page.waitForTimeout(500);
  await page.click('#btnStart'); await page.click('#btnToWorld'); await page.click('#worldNodes .node-btn >> nth=-2'); await page.waitForTimeout(3000);
  await page.evaluate(() => { const D = window.__dbg, p = D.state.player; window.__dayT = 0.1; p.x = -820; p.z = 455; D.villageInteract(p); for (let i = 0; i < 80; i++) D.render(1/60); });
  await page.evaluate(() => { document.querySelectorAll('div').forEach(d => { if (d.style.zIndex === '9999') d.style.display = 'none'; }); }); await page.waitForTimeout(300); await page.screenshot({ path: SP + '/gh_inside.png' }); await browser.close();
})();
