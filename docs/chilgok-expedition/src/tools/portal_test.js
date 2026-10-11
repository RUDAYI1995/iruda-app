const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium',
    args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 800, height: 500 } });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message || e).slice(0, 300)));
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/test_new/index.html');
  await page.waitForTimeout(400);
  await page.click('#btnStart'); await page.click('#btnToWorld');
  await page.click('#worldNodes .node-btn >> nth=0');
  await page.waitForTimeout(2500);
  const put = (x, z, yaw) => page.evaluate(([x, z, yaw]) => {
    const D = window.__dbg, s = D.state, p = s.player;
    D.setRef(90); p.x = x; p.z = z; p.y = 0; s.cam.fx = null; s.cam.yaw = yaw || 0; s.cam.target = yaw || 0; s.cam.turn = null;
    for (let i = 0; i < 150; i++) D.render(1/60);
    return [p.x, p.z, D.groundHeightAt(p.x, p.z)];
  }, [x, z, yaw]);
  const info = () => page.evaluate(() => { const p = window.__dbg.state.player; return [Math.round(p.x), Math.round(p.z), window.__dbg.groundHeightAt(p.x, p.z)]; });
  // 1) arch seen from the approach
  await put(1000, 1380, 0); await page.screenshot({ path: SP + '/portal_1_front.png' });
  await put(1000, 1425, 0); await page.screenshot({ path: SP + '/portal_2_close.png' });
  // 2) walk into the portal using the real update loop
  await put(1000, 1405, 0);
  await page.evaluate(() => { const D = window.__dbg; D.state.keys.up = true; for (let i = 0; i < 90; i++) { D.update(1/60); D.render(1/60); } D.state.keys.up = false; });
  console.log('after walk-in', JSON.stringify(await info()));
  await page.waitForTimeout(1200); await page.screenshot({ path: SP + '/portal_3_top_arrive.png' });
  // walk forward on the top island, towards the return arch
  await page.evaluate(() => { const D = window.__dbg; D.state.keys.up = true; for (let i = 0; i < 120; i++) { D.update(1/60); D.render(1/60); } D.state.keys.up = false; });
  console.log('top walked', JSON.stringify(await info()));
  await page.screenshot({ path: SP + '/portal_4_top_walk.png' });
  await page.evaluate(() => { const D = window.__dbg; D.state.keys.up = true; for (let i = 0; i < 200; i++) { D.update(1/60); D.render(1/60); } D.state.keys.up = false; });
  console.log('after return walk', JSON.stringify(await info()));
  await page.screenshot({ path: SP + '/portal_5_back.png' });
  console.log(errs.length ? 'ERRORS ' + errs.join('|') : 'no page errors');
  await browser.close();
})();
