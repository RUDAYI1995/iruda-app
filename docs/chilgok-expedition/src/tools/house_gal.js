const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/test_new/index.html'); await page.waitForTimeout(500);
  await page.click('#btnStart'); await page.click('#btnToWorld'); await page.click('#worldNodes .node-btn >> nth=-1'); await page.waitForTimeout(3000);
  const list = await page.evaluate(() => { const seen = {}, out = []; (window.__vilHouses || []).forEach(h => { if (!seen[h.kind]) { seen[h.kind] = 1; out.push(h); } }); return out; });
  console.log(JSON.stringify(list));
  for (const h of list) for (const [ang, nm] of [[0, 'f'], [0.9, 'q']]) {
    await page.evaluate(([h, ang]) => { const D = window.__dbg, s = D.state, p = s.player; D.setRef(0);
      // camera looks along yaw; place player so the house is ahead at ~48 units: player stands in front of the house (house front faces rot)
      const fx = Math.sin(h.rot), fz = Math.cos(h.rot); const a = ang, dx = fx*Math.cos(a) - fz*Math.sin(a), dz = fx*Math.sin(a) + fz*Math.cos(a);
      p.x = h.x + dx*58; p.z = h.z + dz*58; p.y = 0; const yaw = Math.atan2(-dx, -dz); s.cam.yaw = s.cam.target = yaw; s.cam.turn = null; s.cam.fx = null; s.cam.fy = null;
      D.three.camera.position.set(p.x - Math.sin(yaw)*30, 20, p.z - Math.cos(yaw)*30);
      for (let i = 0; i < 40; i++) D.render(1/60); }, [h, ang]);
    await page.waitForTimeout(200); await page.screenshot({ path: SP + '/hg_' + h.kind + '_' + nm + '.png' });
  }
  await browser.close();
})();
