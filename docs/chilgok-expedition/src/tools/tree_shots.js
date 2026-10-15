const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; page.on('pageerror', e => errs.push(String(e.stack||e).slice(0,400)));
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/test_new/index.html'); await page.waitForTimeout(500);
  await page.click('#btnStart'); await page.click('#btnToWorld'); await page.click('#worldNodes .node-btn >> nth=0'); await page.waitForTimeout(3500);
  for (const [name, y, dist, camY, look] of [['base', 0, 180, 40, 80], ['mid', 0, 330, 150, 250], ['top', 0, 420, 420, 560]]) {
    await page.evaluate(([dist, camY, look]) => { const D = window.__dbg, s = D.state, p = s.player; D.setRef(0); p.x = 1175 - dist; p.z = 2000; p.y = 0;
      for (let i = 0; i < 30; i++) D.render(1/60);
      const c = D.three.camera; c.position.set(1175 - dist, camY, 2000); c.lookAt(1175, look, 2000); D.three.renderer.render(D.three.scene, c); }, [dist, camY, look]);
    await page.waitForTimeout(300); await page.screenshot({ path: SP + '/tx_' + name + '.png' }); console.log('shot', name);
  }
  console.log(errs.length ? 'ERR ' + errs.join('|') : 'no page errors');
  await browser.close();
})();
