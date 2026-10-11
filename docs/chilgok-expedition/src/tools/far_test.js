const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; page.on('pageerror', e => errs.push(String(e.stack||e).slice(0,300)));
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/test_new/index.html'); await page.waitForTimeout(500);
  await page.click('#btnStart'); await page.click('#btnToWorld'); await page.click('#worldNodes .node-btn >> nth=0'); await page.waitForTimeout(3000);
  for (const [name, x, z, yawDeg] of JSON.parse(process.argv[3])) {
    await page.evaluate(([x, z, yawDeg]) => { const D = window.__dbg, s = D.state, p = s.player, y = yawDeg*Math.PI/180;
      p.x = x; p.z = z; p.y = 0; s.cam.yaw = y; s.cam.target = y; s.cam.turn = null; s.cam.fx = null;
      D.three.camera.position.set(x - Math.sin(y)*32, 16 + D.groundHeightAt(x, z), z - Math.cos(y)*32);
      for (let i = 0; i < 60; i++) D.render(1/60); }, [x, z, yawDeg]);
    await page.waitForTimeout(250); await page.screenshot({ path: SP + '/far_' + name + '.png' }); console.log('shot', name);
  }
  console.log(errs.length ? 'ERR ' + errs.join('|') : 'no page errors');
  await browser.close();
})();
