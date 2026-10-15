const { chromium } = require('playwright-core');
const SP = process.argv[2];
const ITEMS = [['y_jars',6],['y_firewood',4],['y_pumpkin',3.2],['q_pole',31],['f_fsign',11],['f_straw',5],['f_pump',8],['f_scarecrow',11],['q_table',7],['q_tunnel',10],['q_line',12],['f_gazebo',22],['p_pyeongsang',6.5],['f_shop',15],['p_stone',4],['p_mailbox',5],['p_bush0',4.4],['p_cosmos',7],['persimmon',24],['apple',24],['y_bicycle',6],['q_furrow',5],['q_cabbage',4.2],['y_veg',4.2]];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/test_new/index.html'); await page.waitForTimeout(500);
  await page.click('#btnStart'); await page.click('#btnToWorld'); await page.click('#worldNodes .node-btn >> nth=-1'); await page.waitForTimeout(3000);
  const GX = -1400, GZ = 900;
  await page.evaluate(([items, GX, GZ]) => { items.forEach((it, i) => window.__card(it[0], GX - i*60, GZ, it[1])); }, [ITEMS, GX, GZ]);
  for (let i = 0; i < ITEMS.length; i++) for (const [nm, ang] of [['f', 0], ['s', 1.0]]) {
    await page.evaluate(([x, z, ang, hgt]) => { const D = window.__dbg, s = D.state, p = s.player; D.setRef(0);
      p.x = x + 60; p.z = z - 30; p.y = 0; s.cam.yaw = s.cam.target = 0; s.cam.turn = null; s.cam.fx = null; s.cam.fy = null;
      for (let q = 0; q < 20; q++) D.render(1/60);
      const T = D.three, cam = T.camera, d = Math.max(14, hgt*2.2); cam.position.set(x + Math.sin(ang)*d, Math.max(5, hgt*0.7), z - Math.cos(ang)*d); cam.lookAt(x, Math.max(2, hgt*0.4), z); cam.updateMatrixWorld(true); T.renderer.render(T.scene, cam); }, [GX - i*60, GZ, ang, ITEMS[i][1]]);
    await page.screenshot({ path: SP + '/sg_' + ITEMS[i][0] + '_' + nm + '.png', clip: { x: 220, y: 98, width: 860, height: 480 } });
  }
  console.log('done'); await browser.close();
})();
