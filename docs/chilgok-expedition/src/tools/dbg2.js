const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 600, height: 400 } });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/test_new/index.html'); await page.waitForTimeout(500);
  await page.click('#btnStart'); await page.click('#btnToWorld'); await page.click('#worldNodes .node-btn >> nth=-1'); await page.waitForTimeout(2000);
  console.log(JSON.stringify(await page.evaluate(() => {
    const D = window.__dbg, s = D.state, p = s.player, cs = s.cam, b = D.SKY_BR[0], log = [];
    p.x = b.ax - 3; p.z = b.az; D.setRef(200); cs.fx = null;
    const h = Math.atan2(b.bx - p.x, b.bz - p.z); cs.yaw = cs.target = h; cs.yawVel = 0; cs.prevV = 999; s.keys.up = true;
    for (let f = 0; f < 120; f++) { D.update(1/60); if (f % 10 === 0) log.push([f, Math.round(p.x), Math.round(p.z), Math.round(D.getRef()), +cs.mvx.toFixed(2), +cs.mvz.toFixed(2)]); }
    return log; })));
  await browser.close();
})();
