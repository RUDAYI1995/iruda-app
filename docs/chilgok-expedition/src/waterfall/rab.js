const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1000, height: 600 } });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/w/test/index.html'); await page.waitForTimeout(500);
  await page.click('#btnStart'); await page.click('#btnToWorld'); await page.click('#worldNodes .node-btn >> nth=0'); await page.waitForTimeout(2500);
  for (const [k, yaw] of [[0, -Math.PI/2], [1, Math.PI/2]]) {
    await page.evaluate((yaw) => { const D = window.__dbg, s = D.state, p = s.player; p.x = 0; p.z = 690; p.y = 0; s.cam.fx = null; s.cam.yaw = s.cam.target = yaw; s.cam.turn = null; for (let i = 0; i < 40; i++) D.render(0.1); }, yaw);
    await page.screenshot({ path: SP + '/w/rab_' + k + '.png' });
  }
  await browser.close(); })();
