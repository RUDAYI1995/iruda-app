const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
  const logs = []; page.on('pageerror', e => logs.push('ERR ' + String(e.stack||e).slice(0, 500)));
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/w/test/index.html'); await page.waitForTimeout(500);
  await page.click('#btnStart'); await page.click('#btnToWorld'); await page.click('#worldNodes .node-btn >> nth=0'); await page.waitForTimeout(2000);
  await page.evaluate(() => { for (let i = 0; i < 3; i++) window.__dbg.render(0.05); }); await page.waitForTimeout(1200);
  const views = JSON.parse(process.argv[3]);
  for (let k = 0; k < views.length; k++) {
    const v = views[k];
    await page.evaluate((v) => { const D = window.__dbg, p = D.state.player; p.x = 40; p.z = 100; p.y = 0; D.state.cam.fx = null; for (let i = 0; i < 6; i++) D.render(0.05);
      const m = D.three.scene.children.find(c => c.name === 'hamgoki3d'); if (v.yaw !== undefined) { m.rotation.y = v.yaw; }
      if (v.pose) { p.gait = v.pose.gait; p.phase = v.pose.phase; }
      const c = D.three.camera, R = v.r || 20; c.position.set(p.x + R*Math.sin(v.az), p.y + 5.3 + (v.h||0), p.z + R*Math.cos(v.az)); c.lookAt(p.x, 5.3, p.z); c.fov = 28; c.updateProjectionMatrix(); D.three.renderer.render(D.three.scene, c); }, v);
    await page.screenshot({ path: SP + '/w/h_' + k + '.png', clip: { x: 150, y: 50, width: 600, height: 600 } });
  }
  console.log(logs.join('\n') || 'no errors'); await browser.close(); })();
