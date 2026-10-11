const { chromium } = require('playwright-core');
const SP = process.argv[2];
const spots = JSON.parse(process.argv[3]);   // [[name,x,z,yawDeg]]
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium',
    args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1000, height: 640 } });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message || e).slice(0, 300)));
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/test_new/index.html');
  await page.waitForTimeout(400);
  await page.click('#btnStart'); await page.click('#btnToWorld');
  await page.click('#worldNodes .node-btn >> nth=0');
  await page.waitForTimeout(1800);
  for (const [name, x, z, yawDeg] of spots) {
    const info = await page.evaluate(([x, z, yawDeg]) => {
      const D = window.__dbg, s = D.state, p = s.player, y = yawDeg*Math.PI/180;
      p.x = x; p.z = z; p.y = 0; p.dir = 'back'; p.walking = false;
      s.cam.yaw = y; s.cam.target = y; s.cam.turn = null; s.cam.fx = null;
      D.three.camera.position.set(x, 16, z - 32);
      for (let i = 0; i < 100; i++) D.render(1/60);
      // report every mountain card that is currently visible: direction relative to the camera + distance
      const bg = D.three.bg, out = [];
      const sy = Math.sin(y), cy = Math.cos(y), cam = D.three.camera.position;
      bg.forEach((c, i) => {
        if (c.g.visible === false) return;
        const wx = c.g.position.x - cam.x, wz = c.g.position.z - cam.z;
        const ahead = wx*sy + wz*cy, right = -wx*cy + wz*sy;
        out.push(`#${i}${c.ew ? 'ew' : ''} ahead=${ahead.toFixed(0)} right=${right.toFixed(0)}`);
      });
      return out;
    }, [x, z, yawDeg]);
    console.log(name, 'visible cards:', info.join(' | '));
    await page.waitForTimeout(120);
    await page.screenshot({ path: SP + '/glitch_' + name + '.png' });
  }
  console.log(errs.length ? 'ERRORS ' + errs.join('|') : 'no page errors');
  await browser.close();
})();
