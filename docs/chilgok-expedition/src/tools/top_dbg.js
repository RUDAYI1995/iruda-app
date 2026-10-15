const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 800, height: 500 } });
  const errs = []; page.on('pageerror', e => errs.push(String(e.message||e).slice(0,300)));
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/test_new/index.html'); await page.waitForTimeout(400);
  await page.click('#btnStart'); await page.click('#btnToWorld'); await page.click('#worldNodes .node-btn >> nth=0'); await page.waitForTimeout(2500);
  const shot = async (x, z, yaw, name) => {
    const r = await page.evaluate(([x, z, yaw]) => { const D = window.__dbg, s = D.state, p = s.player;
      p.x = x; p.z = z; p.y = 0; s.cam.fx = null; s.cam.yaw = yaw; s.cam.target = yaw; s.cam.turn = null;
      for (let i = 0; i < 200; i++) D.render(1/60);
      const c = D.three.camera.position; return { cam:[c.x|0,c.y|0,c.z|0], gy: D.groundHeightAt(p.x,p.z) }; }, [x, z, yaw]);
    console.log(name, JSON.stringify(r)); await page.waitForTimeout(1200); await page.screenshot({ path: SP + '/' + name + '.png' });
  };
  await shot(1000, 2046, 0, 'top_a');
  await shot(1000, 2056, 0, 'top_b');
  await shot(1000, 2046, Math.PI/2, 'top_c');
  await shot(1000, 1400, 0, 'gate_a');
  console.log(errs.length ? 'ERR ' + errs.join('|') : 'ok');
  await browser.close();
})();
