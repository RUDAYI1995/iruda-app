const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1000, height: 1000 } });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/test_new/index.html'); await page.waitForTimeout(500);
  await page.click('#btnStart'); await page.click('#btnToWorld'); await page.click('#worldNodes .node-btn >> nth=-2'); await page.waitForTimeout(3500);
  await page.evaluate(() => { const D = window.__dbg, p = D.state.player; p.x = -900; p.z = 1000; for (let i = 0; i < 40; i++) D.render(1/60);
    D.three.scene.fog = null; const c = D.three.camera; c.far = 30000; c.aspect = 1; c.fov = 40; c.updateProjectionMatrix();
    c.position.set(-1000, 7600, 1000); c.up.set(0, 0, 1); c.lookAt(-1000, 0, 1000); D.three.renderer.render(D.three.scene, c); });
  await page.waitForTimeout(500); await page.screenshot({ path: SP + '/topdown.png' }); await browser.close();
})();
