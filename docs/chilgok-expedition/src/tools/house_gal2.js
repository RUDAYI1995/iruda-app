const { chromium } = require('playwright-core');
const SP = process.argv[2], kinds = (process.argv[3] || 'gaw,thatch,slate,yangok,th_small,gaw_small,hanok_red,gaw_big,gaw_l,th_barn').split(','), tag = process.argv[4] || 'hg2';
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/test_new/index.html'); await page.waitForTimeout(500);
  await page.click('#btnStart'); await page.click('#btnToWorld'); await page.click('#worldNodes .node-btn >> nth=-1'); await page.waitForTimeout(3000);
  const GX = -1500, GZ = 900;
  await page.evaluate(([kinds, GX, GZ]) => { kinds.forEach((k, i) => { window.__houseArt(k, GX - i*80, GZ, Math.PI, 1); }); }, [kinds, GX, GZ]);
  for (let i = 0; i < kinds.length; i++) for (const [nm, ox, oz] of [['f', 0, -40], ['l', 36, -22], ['b', 0, 40], ['r', -36, -22]]) {
    await page.evaluate(([x, z, ox, oz]) => { const D = window.__dbg, s = D.state, p = s.player; D.setRef(0);
      p.x = x + ox; p.z = z + oz; p.y = 0; const yaw = Math.atan2(-ox, -oz); s.cam.yaw = s.cam.target = yaw; s.cam.turn = null; s.cam.fx = null; s.cam.fy = null;
      D.three.camera.position.set(p.x - Math.sin(yaw)*20, 13, p.z - Math.cos(yaw)*20);
      for (let q = 0; q < 30; q++) D.render(1/60); }, [GX - i*80, GZ, ox, oz]);
    await page.waitForTimeout(120); await page.screenshot({ path: SP + '/' + tag + '_' + kinds[i] + '_' + nm + '.png', clip: { x: 220, y: 98, width: 860, height: 480 } });
  }
  console.log('done'); await browser.close();
})();
