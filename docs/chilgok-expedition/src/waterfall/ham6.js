const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 900, height: 640 } });
  const logs = []; page.on('pageerror', e => logs.push('ERR ' + String(e.stack||e).slice(0, 500)));
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/w/test/index.html'); await page.waitForTimeout(500);
  await page.click('#btnStart'); await page.click('#btnToWorld'); await page.click('#worldNodes .node-btn >> nth=0'); await page.waitForTimeout(2000);
  await page.evaluate(() => { for (let i = 0; i < 4; i++) window.__dbg.render(0.05); }); await page.waitForTimeout(1200);
  const poses = [{ n:'walkA', gait:1, phase:1.2, run:0 }, { n:'walkB', gait:1, phase:4.3, run:0 }, { n:'runA', gait:1, phase:1.3, run:1 }, { n:'jumpUp', gait:0, phase:0, run:0, air:1 }];
  const out = [];
  for (const q of poses) {
    await page.evaluate((q) => { const D = window.__dbg, p = D.state.player; p.x = 40; p.z = 100; p.y = 0; p.onGround = true; p.vy = 0; D.state.cam.fx = null; for (let i = 0; i < 4; i++) D.render(0.05);
      const m = D.three.scene.children.find(c => c.name === 'hamgoki3d'); p.gait = q.gait; p.phase = q.phase; if (q.air) { p.y = 2; p.onGround = false; p.vy = 20; }
      window.hamgokiUpdate(p, 0.0001, 0, 0, q.run, 0, 0, 0); m.rotation.y = Math.PI/2; m.position.set(p.x, p.y, p.z);
      const c = D.three.camera; c.position.set(p.x, 6, p.z + 24); c.lookAt(p.x, 5.2, p.z); c.fov = 30; c.updateProjectionMatrix(); D.three.renderer.render(D.three.scene, c); }, q);
    await page.screenshot({ path: SP + '/w/hp_' + q.n + '.png', clip: { x: 150, y: 90, width: 600, height: 440 } });
  }
  console.log(logs.join('\n') || 'no errors'); await browser.close(); })();
