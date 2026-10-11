const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1300, height: 760 } });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/test_new/index.html'); await page.waitForTimeout(500);
  await page.click('#btnStart'); await page.click('#btnToWorld'); await page.click('#worldNodes .node-btn >> nth=-1'); await page.waitForTimeout(3000);
  for (const [nm, x, z] of [['bike', -708, 32], ['tiller', -860, 60]]) {
    await page.evaluate(([x, z]) => { const D = window.__dbg, s = D.state, p = s.player; D.setRef(0); p.x = x; p.z = z; p.y = 0; s.cam.yaw = 0; s.cam.target = 0; s.cam.fx = null; s.cam.fy = null; for (let i = 0; i < 10; i++) D.render(1/60);
      D.villageInteract(p); p.dir = 'left'; D.three.camera.position.set(x, 16, z - 32); for (let i = 0; i < 20; i++) D.render(1/60); D.villageInteract(p); D.villageInteract(p); p.dir='left'; for (let i = 0; i < 20; i++) D.render(1/60); }, [x, z]);
    await page.waitForTimeout(300); await page.screenshot({ path: SP + '/ride_' + nm + '.png' });
  }
  await browser.close();
})();
