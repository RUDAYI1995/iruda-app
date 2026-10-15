const { chromium } = require('playwright-core');
const SP = process.argv[2], kinds = process.argv[3].split(','), tag = process.argv[4] || 'hg7';
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/test_new/index.html'); await page.waitForTimeout(500);
  await page.click('#btnStart'); await page.click('#btnToWorld'); await page.click('#worldNodes .node-btn >> nth=-1'); await page.waitForTimeout(3000);
  const GX = -1300, GZ = 700;
  await page.evaluate(([kinds, GX, GZ]) => { kinds.forEach((k, i) => { if (k.startsWith('F:')) window.__houseFull(k.slice(2), GX - i*80, GZ, Math.PI); else window.__houseArt(k, GX - i*80, GZ, Math.PI, 1); }); }, [kinds, GX, GZ]);
  for (let i = 0; i < kinds.length; i++) for (const [nm, ox, oz, hh] of [['t', 0, -42, 34], ['l', 40, -26, 30], ['b', 0, 46, 32]]) {
    await page.evaluate(([x, z, ox, oz, hh]) => { const D = window.__dbg, s = D.state, p = s.player; D.setRef(0); p.x = x + 200; p.z = z - 100; p.y = 0; s.cam.yaw = s.cam.target = 0; s.cam.turn = null; s.cam.fx = null; s.cam.fy = null; for (let q = 0; q < 10; q++) D.render(1/60);
      const T = D.three, cam = T.camera; cam.position.set(x + ox, hh, z + oz); cam.lookAt(x, 6, z); cam.updateMatrixWorld(true); T.renderer.render(T.scene, cam); }, [GX - i*80, GZ, ox, oz, hh]);
    await page.screenshot({ path: SP + '/' + tag + '_' + kinds[i].replace(':', '') + '_' + nm + '.png', clip: { x: 220, y: 98, width: 860, height: 480 } });
  }
  console.log('done'); await browser.close();
})();
