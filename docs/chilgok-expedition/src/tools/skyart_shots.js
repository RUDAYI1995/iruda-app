const { chromium } = require('playwright-core');
const SP = process.argv[2];
const shots = JSON.parse(process.argv[3]);   // [[name,x,z,yawDeg]]
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium',
    args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: +(process.env.VW||1280), height: +(process.env.VH||720) } });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.stack || e).slice(0, 400)));
  page.on('requestfailed', r => errs.push('request failed ' + r.url().slice(-50)));
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/test_new/index.html');
  await page.waitForTimeout(500);
  await page.click('#btnStart'); await page.click('#btnToWorld');
  await page.click('#worldNodes .node-btn >> nth=0');
  await page.waitForTimeout(3000);            // let every picture decode
  for (const [name, x, z, yawDeg, refH] of shots) {
    await page.evaluate(([x, z, yawDeg, refH]) => {
      if (window.__dbg.setRef) window.__dbg.setRef(refH || 0);
      const D = window.__dbg, s = D.state, p = s.player, y = yawDeg*Math.PI/180;
      p.x = x; p.z = z; p.y = 0; p.dir = 'back'; p.walking = false;
      s.cam.yaw = y; s.cam.target = y; s.cam.turn = null; s.cam.fx = null;
      const gy = D.groundHeightAt(x, z);
      D.three.camera.position.set(x - Math.sin(y)*32, 16 + gy, z - Math.cos(y)*32);
      for (let i = 0; i < 60; i++) D.render(1/60);
    }, [x, z, yawDeg, refH]);
    await page.waitForTimeout(250);
    await page.screenshot({ path: SP + '/art_' + name + '.png' });
    console.log('shot', name);
  }
  console.log(errs.length ? 'ERRORS\n' + errs.join('\n') : 'no page errors');
  await browser.close();
})();
