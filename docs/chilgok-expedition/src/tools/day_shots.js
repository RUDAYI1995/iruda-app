const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1300, height: 760 } });
  const errs = []; page.on('pageerror', e => errs.push(String(e.stack||e).slice(0,400)));
  page.on('console', m => { if (m.type() === 'warning' && /failed/.test(m.text())) errs.push(m.text().slice(0,300)); });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/test_new/index.html'); await page.waitForTimeout(500);
  await page.click('#btnStart'); await page.click('#btnToWorld'); await page.click('#worldNodes .node-btn >> nth=' + (process.argv[4] || '0')); await page.waitForTimeout(3500);
  for (const [name, u, x, z, yawDeg] of JSON.parse(process.argv[3])) {
    await page.evaluate(([u, x, z, yawDeg]) => { const D = window.__dbg, s = D.state, p = s.player, y = yawDeg*Math.PI/180; window.__dayT = u; D.setRef(0);
      p.x = x; p.z = z; p.y = 0; s.cam.yaw = y; s.cam.target = y; s.cam.turn = null; s.cam.fx = null; s.cam.fy = null;
      for (let i = 0; i < 100; i++) D.render(1/60); }, [u, x, z, yawDeg]);
    await page.waitForTimeout(300); await page.screenshot({ path: SP + '/day_' + name + '.png' }); console.log('shot', name);
  }
  console.log(errs.length ? 'ERR ' + errs.join('|') : 'no page errors'); await browser.close();
})();
