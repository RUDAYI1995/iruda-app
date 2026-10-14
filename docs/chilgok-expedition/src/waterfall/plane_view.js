const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1000, height: 600 } });
  await page.addInitScript(() => { window.__now = 5000; performance.now = () => window.__now; Date.now = () => 1700000000000 + window.__now; window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/w/test/index.html'); await page.waitForTimeout(500);
  await page.click('#btnStart'); await page.click('#btnToWorld'); await page.click('#worldNodes .node-btn >> nth=0'); await page.waitForTimeout(2500);
  const cfgs = JSON.parse(process.argv[3]);
  for (let k = 0; k < cfgs.length; k++) {
    await page.evaluate((c) => { const D = window.__dbg, p = D.state.player; p.x = 0; p.z = 500; D.state.cam.fx = null; window.__now = 5000; D.render(0.05); window.__now = 20500; D.render(0.05); window.__now = c.now; D.render(0.05);
      const q = D.three.scene.children.find(x => x.name === 'catPlane'); if (c.y != null) q.position.y = c.y; if (c.lane != null) q.position.z = c.lane; D.three.renderer.render(D.three.scene, D.three.camera); }, cfgs[k]);
    await page.screenshot({ path: SP + '/w/v_' + k + '.png' });
  }
  await browser.close(); })();
