const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  for (const v of ['test_old', 'test_new']) {
    const page = await browser.newPage({ viewport: { width: 500, height: 300 } });
    await page.addInitScript(() => { const T0 = 1700000000000; Date.now = () => T0; performance.now = () => 5000; window.requestAnimationFrame = () => 0; });
    await page.goto('file://' + SP + '/' + v + '/index.html'); await page.waitForTimeout(500);
    await page.click('#btnStart'); await page.click('#btnToWorld'); await page.click('#worldNodes .node-btn >> nth=0'); await page.waitForTimeout(1500);
    console.log(v, JSON.stringify(await page.evaluate(() => {
      const D = window.__dbg, s = D.state, p = s.player;
      p.x = 0; p.z = 900; p.y = 0; s.cam.fx = null; s.cam.fy = null; s.cam.target = 0; s.cam.yaw = 0; s.cam.turn = null;
      D.three.camera.position.set(0, 0, 868);
      for (let i = 0; i < 150; i++) D.render(1/60);
      const c = D.three.camera.position; return { cam: [c.x, c.y, c.z].map(v => +v.toFixed(2)), gy: D.groundHeightAt(0, 900) }; })));
    await page.close();
  }
  await browser.close();
})();
