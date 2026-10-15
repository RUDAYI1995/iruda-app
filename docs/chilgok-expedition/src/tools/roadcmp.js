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
      const D = window.__dbg, s = D.state, p = s.player; const out = [];
      D.three.scene.traverse(o => { if (o.geometry && o.geometry.parameters && o.geometry.parameters.width === 16 && o.geometry.type === 'PlaneGeometry') out.push([o.visible, o.position.y, o.material.map ? (o.material.map.image ? o.material.map.image.complete : 'noimg') : 'nomap', o.material.transparent, o.renderOrder]); });
      return out; })));
    await page.close();
  }
  await browser.close();
})();
