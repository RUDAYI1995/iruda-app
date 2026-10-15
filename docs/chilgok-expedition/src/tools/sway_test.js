const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1300, height: 760 } });
  const errs = []; page.on('pageerror', e => errs.push(String(e.stack||e).slice(0,300)));
  await page.addInitScript(() => { window.__t = 5000; performance.now = () => window.__t; window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/test_new/index.html'); await page.waitForTimeout(400);
  await page.click('#btnStart'); await page.click('#btnToWorld'); await page.click('#worldNodes .node-btn >> nth=0'); await page.waitForTimeout(3500);
  const shot = async (name, tms, cx, cy, cz, lx, ly, lz, px, pz) => {
    await page.evaluate(([tms,cx,cy,cz,lx,ly,lz,px,pz]) => { const D = window.__dbg, p = D.state.player; window.__t = tms;
      p.x = px; p.z = pz; p.y = 0; D.state.cam.yaw = 0; D.state.cam.target = 0; D.state.cam.turn = null;
      for (let i = 0; i < 3; i++) D.render(1/60);
      const c = D.three.camera; c.position.set(cx, cy, cz); c.lookAt(lx, ly, lz); D.three.renderer.render(D.three.scene, c); }, [tms,cx,cy,cz,lx,ly,lz,px,pz]);
    await page.screenshot({ path: SP + '/' + name + '.png' });
  };
  // standing on the top island, camera just in front of the first high island (1380,420,1800)
  await shot('sway_1', 5000, 1380, 430, 1560, 1380, 440, 1800, 1000, 2046);
  await shot('sway_2', 6800, 1380, 430, 1560, 1380, 440, 1800, 1000, 2046);
  await shot('var_view', 6800, 1150, 330, 1950, 1180, 300, 2160, 1000, 2046);
  console.log(errs.length ? 'ERR ' + errs.join('|') : 'ok');
  await browser.close();
})();
