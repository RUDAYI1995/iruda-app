const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 500, height: 300 } });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/test_new/index.html'); await page.waitForTimeout(500);
  await page.click('#btnStart'); await page.click('#btnToWorld'); await page.click('#worldNodes .node-btn >> nth=-2'); await page.waitForTimeout(3500);
  console.log(JSON.stringify(await page.evaluate(() => { const D = window.__dbg, p = D.state.player, r = D.three.renderer, out = {};
    for (const [n, x, z] of [['zone1', -900, 250], ['zone4', -900, 1300], ['zone8', -900, -800], ['paddy', -1000, 2300], ['oldmap', 0, 600]]) { p.x = x; p.z = z; D.state.cam.fx = null; for (let i = 0; i < 3; i++) D.render(1/60); r.info.reset(); D.render(1/60); out[n] = [r.info.render.calls, r.info.render.triangles, r.info.memory.textures]; }
    return out; })));
  await browser.close();
})();
