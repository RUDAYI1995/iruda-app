const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium',
    args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 800, height: 520 } });
  page.on('pageerror', e => console.log('ERR', String(e.message||e).slice(0,200)));
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/test_new/index.html');
  await page.waitForTimeout(400);
  await page.click('#btnStart'); await page.click('#btnToWorld');
  await page.click('#worldNodes .node-btn >> nth=0');
  await page.waitForTimeout(1800);
  const shot = async (name, hideBg) => {
    await page.evaluate(([hideBg]) => {
      const D = window.__dbg, s = D.state, p = s.player, y = Math.PI/2;
      p.x = -60; p.z = 2230; p.y = 0; p.dir = 'back';
      s.cam.yaw = y; s.cam.target = y; s.cam.turn = null; s.cam.fx = null;
      D.three.camera.position.set(-60, 16, 2198);
      for (let i = 0; i < 60; i++) D.render(1/60);
      if (hideBg) { D.three.bg.forEach(c => c.g.visible = false); D.render(1/60); }
    }, [hideBg]);
    await page.waitForTimeout(150);
    await page.screenshot({ path: SP + '/bisect_' + name + '.png' });
  };
  await shot('with_cards', false);
  await shot('no_cards', true);
  await browser.close();
})();
