const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 900, height: 600 } });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/test_new/index.html'); await page.waitForTimeout(500);
  await page.click('#btnStart'); await page.click('#btnToWorld'); await page.click('#worldNodes .node-btn >> nth=-1'); await page.waitForTimeout(3000);
  for (const [x, z] of [[-900, 40], [-900, 600], [-1000, 1250], [-860, 2030], [-1100, -1100]]) {
    const r = await page.evaluate(([x, z]) => { const D = window.__dbg, s = D.state, p = s.player; D.setRef(0); p.x = x; p.z = z; p.y = 0; s.cam.yaw = s.cam.target = 0; s.cam.fx = null; s.cam.fy = null; for (let i = 0; i < 40; i++) D.render(1/60); D.three.renderer.info.reset(); D.render(1/60); const i = D.three.renderer.info; return i.render.calls + ' calls ' + i.render.triangles + ' tris'; }, [x, z]);
    console.log(x, z, r);
  }
  await browser.close();
})();
