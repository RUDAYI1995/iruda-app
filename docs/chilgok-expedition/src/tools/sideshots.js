const { chromium } = require('playwright-core');
const SP = process.argv[2];
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
  const shot = async (name, x, z, yawDeg, dir) => {
    await page.evaluate(([x, z, yawDeg, dir]) => {
      const D = window.__dbg, s = D.state, p = s.player, y = yawDeg*Math.PI/180;
      p.x = x; p.z = z; p.y = 0; p.dir = dir; p.walking = false;
      s.cam.yaw = y; s.cam.target = y; s.cam.turn = null; s.cam.fx = null;
      D.three.camera.position.set(x, 16, z - 32);
      for (let i = 0; i < 120; i++) D.render(1/60);
    }, [x, z, yawDeg, dir]);
    await page.waitForTimeout(150);
    await page.screenshot({ path: SP + '/side_' + name + '.png' });
  };
  await shot('east_town', 0, 220, 90, 'back');       // camera looks along +x
  await shot('west_town', 0, 220, -90, 'back');
  await shot('diag_town', 0, 220, 45, 'back');       // mid-turn view
  console.log(errs.length ? 'ERRORS: ' + errs.join(' | ') : 'no page errors');
  await browser.close();
})();
