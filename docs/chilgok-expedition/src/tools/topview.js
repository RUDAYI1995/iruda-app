const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1300, height: 760 } });
  const errs = []; page.on('pageerror', e => errs.push(String(e.stack||e).slice(0,300)));
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/test_new/index.html'); await page.waitForTimeout(500);
  await page.click('#btnStart'); await page.click('#btnToWorld'); await page.click('#worldNodes .node-btn >> nth=-2'); await page.waitForTimeout(3000);
  for (const y of [560, 596]) {
    await page.evaluate((y) => { const D = window.__dbg, s = D.state, p = s.player, cs = s.cam; const c = D.skySpiralAt(y - 6), c2 = D.skySpiralAt(y + 6);
      D.setRef(y); p.x = c.x; p.z = c.z; p.y = 0; cs.fx = null; cs.fy = null; const h = Math.atan2(c2.x - c.x, c2.z - c.z); cs.yaw = cs.target = h; cs.yawVel = 0;
      for (let i = 0; i < 60; i++) D.render(1/60); }, y);
    await page.waitForTimeout(300); await page.screenshot({ path: SP + '/top_' + y + '.png' });
  }
  console.log(errs.length ? 'ERR ' + errs.join('|') : 'ok'); await browser.close();
})();
