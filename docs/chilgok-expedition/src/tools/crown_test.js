const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1300, height: 760 } });
  const errs = []; page.on('pageerror', e => errs.push(String(e.stack||e).slice(0,300)));
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/test_new/index.html'); await page.waitForTimeout(500);
  await page.click('#btnStart'); await page.click('#btnToWorld'); await page.click('#worldNodes .node-btn >> nth=-2'); await page.waitForTimeout(3000);
  console.log(JSON.stringify(await page.evaluate(() => {
    const D = window.__dbg, s = D.state, p = s.player, cs = s.cam; const e = D.skySpiralAt(598), e2 = D.skySpiralAt(590);
    D.setRef(598); p.x = e.x; p.z = e.z; cs.fx = null; cs.fy = null; cs.yaw = cs.target = Math.atan2(e.x - e2.x, e.z - e2.z); cs.yawVel = 0; cs.prevV = 999;
    // walk radially outward onto the island using the side key logic: head directly away from the trunk
    const h = Math.atan2(e.x - 1175, e.z - 2000); cs.yaw = cs.target = h; s.keys.up = true; cs.prevV = 999;
    const log = [];
    for (let f = 0; f < 150; f++) { D.update(1/60); if (f % 30 === 0) log.push([Math.round(p.x), Math.round(p.z), Math.round(D.getRef())]); }
    s.keys.up = false;
    return { log, tr: Math.round(Math.hypot(p.x - 1175, p.z - 2000)) }; })));
  await page.evaluate(() => { for (let i = 0; i < 60; i++) window.__dbg.render(1/60); });
  await page.waitForTimeout(300); await page.screenshot({ path: SP + '/crown.png' });
  console.log(errs.length ? 'ERR ' + errs.join('|') : 'ok'); await browser.close();
})();
